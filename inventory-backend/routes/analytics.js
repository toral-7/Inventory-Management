const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Check if user is admin
const isAdmin = (req) => req.user.role === 'admin';

// Helper: Get date range based on period
const getDateRange = (period = 'monthly') => {
  const today = new Date();
  let startDate, endDate, groupFormat;

  switch (period) {
    case 'daily':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // Last 7 days
      endDate = today;
      groupFormat = 'date'; // YYYY-MM-DD
      break;
    case 'yearly':
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 5); // Last 5 years
      endDate = today;
      groupFormat = 'year'; // YYYY
      break;
    case 'monthly':
    default:
      startDate = new Date(today.getFullYear(), 0, 1); // Jan 1 of current year
      endDate = today;
      groupFormat = 'month'; // MMM-YY
      break;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    groupFormat
  };
};

// GET /analytics/dashboard
// Dashboard summary: revenue, top products, inventory health
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    const branchFilter = isAdmin(req) ? null : req.user.branch_id;

    // Get total revenue from sales_logs
    let revenueQuery = supabase
      .from('sales_logs')
      .select('revenue')
      .gte('date', startDate)
      .lte('date', endDate);

    if (branchFilter) {
      revenueQuery = revenueQuery.eq('branch_id', branchFilter);
    }

    const { data: salesData, error: salesError } = await revenueQuery;
    const totalRevenue = salesData?.reduce((sum, sale) => sum + parseFloat(sale.revenue || 0), 0) || 0;

    // Get total bills
    let billsQuery = supabase
      .from('bills')
      .select('id')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'finalized');

    if (branchFilter) {
      billsQuery = billsQuery.eq('branch_id', branchFilter);
    }

    const { data: billsData } = await billsQuery;
    const totalBills = billsData?.length || 0;

    // Get low stock items
    let lowStockQuery = supabase
      .from('alerts')
      .select(`
        id,
        product:products(id, name, reorder_level),
        branch:branches(id, name)
      `)
      .eq('alert_type', 'low_stock')
      .eq('status', 'active');

    if (branchFilter) {
      lowStockQuery = lowStockQuery.eq('branch_id', branchFilter);
    }

    const { data: lowStockItems } = await lowStockQuery;
    const totalLowStock = lowStockItems?.length || 0;

    // Get total products
    const { data: productsData } = await supabase
      .from('products')
      .select('id');
    const totalProducts = productsData?.length || 0;

    // Get top 5 products by revenue
    let topProductsQuery = supabase
      .from('sales_logs')
      .select(`
        product_id,
        product:products(id, name),
        revenue,
        quantity_sold
      `)
      .gte('date', startDate)
      .lte('date', endDate);

    if (branchFilter) {
      topProductsQuery = topProductsQuery.eq('branch_id', branchFilter);
    }

    const { data: topProductsData } = await topProductsQuery;

    // Aggregate top products
    const productMap = {};
    topProductsData?.forEach((sale) => {
      if (!productMap[sale.product_id]) {
        productMap[sale.product_id] = {
          product_id: sale.product_id,
          product_name: sale.product?.name || 'Unknown',
          total_revenue: 0,
          total_quantity: 0
        };
      }
      productMap[sale.product_id].total_revenue += parseFloat(sale.revenue || 0);
      productMap[sale.product_id].total_quantity += sale.quantity_sold || 0;
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 5);

    // Get inventory health
    let inventoryQuery = supabase
      .from('inventory')
      .select(`
        id,
        product:products(id, name, reorder_level),
        quantity_in_stock
      `);

    if (branchFilter) {
      inventoryQuery = inventoryQuery.eq('branch_id', branchFilter);
    }

    const { data: inventoryData } = await inventoryQuery;

    const inventoryHealth = {
      total_items: inventoryData?.length || 0,
      ok: inventoryData?.filter((inv) => inv.quantity_in_stock >= inv.product.reorder_level).length || 0,
      low_stock: inventoryData?.filter((inv) => inv.quantity_in_stock < inv.product.reorder_level).length || 0
    };

    res.status(200).json({
      success: true,
      dashboard: {
        period,
        revenue: {
          total: totalRevenue.toFixed(2),
          period: period,
          currency: '₹'
        },
        bills: {
          total: totalBills,
          period: period
        },
        inventory: {
          low_stock_count: totalLowStock,
          health: inventoryHealth
        },
        products: {
          total: totalProducts
        },
        top_products: topProducts,
        summary: {
          total_revenue: totalRevenue.toFixed(2),
          total_bills: totalBills,
          low_stock_items: totalLowStock,
          total_products: totalProducts
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/forecast
// 30-day stock forecast per product
router.get('/forecast', authMiddleware, async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    const branchFilter = isAdmin(req) ? null : req.user.branch_id;

    // Get average daily sales per product
    let salesQuery = supabase
      .from('sales_logs')
      .select(`
        product_id,
        product:products(id, name, reorder_level),
        quantity_sold,
        date
      `)
      .gte('date', startDate)
      .lte('date', endDate);

    if (branchFilter) {
      salesQuery = salesQuery.eq('branch_id', branchFilter);
    }

    const { data: salesData } = await salesQuery;

    // Get current inventory
    let inventoryQuery = supabase
      .from('inventory')
      .select(`
        product_id,
        product:products(id, name, reorder_level),
        quantity_in_stock
      `);

    if (branchFilter) {
      inventoryQuery = inventoryQuery.eq('branch_id', branchFilter);
    }

    const { data: inventoryData } = await inventoryQuery;

    // Calculate forecast
    const productSales = {};
    salesData?.forEach((sale) => {
      if (!productSales[sale.product_id]) {
        productSales[sale.product_id] = {
          product_id: sale.product_id,
          product_name: sale.product?.name || 'Unknown',
          total_sold: 0,
          days: new Set()
        };
      }
      productSales[sale.product_id].total_sold += sale.quantity_sold || 0;
      productSales[sale.product_id].days.add(sale.date);
    });

    const forecast = inventoryData?.map((inv) => {
      const sales = productSales[inv.product_id];
      const avgDaily = sales ? sales.total_sold / Math.max(1, sales.days.size) : 0;
      const daysUntilStockOut = avgDaily > 0 ? Math.floor(inv.quantity_in_stock / avgDaily) : 999;
      const willStockOut = daysUntilStockOut <= 30;

      return {
        product_id: inv.product_id,
        product_name: inv.product?.name || 'Unknown',
        current_stock: inv.quantity_in_stock,
        reorder_level: inv.product?.reorder_level || 0,
        avg_daily_sales: avgDaily.toFixed(2),
        days_until_stockout: daysUntilStockOut,
        will_stockout_30days: willStockOut,
        status: daysUntilStockOut <= 10 ? 'critical' : daysUntilStockOut <= 20 ? 'warning' : 'ok'
      };
    }) || [];

    const sortedForecast = forecast.sort((a, b) => a.days_until_stockout - b.days_until_stockout);

    res.status(200).json({
      success: true,
      forecast: {
        period: period,
        total_products: forecast.length,
        critical_products: forecast.filter((p) => p.status === 'critical').length,
        warning_products: forecast.filter((p) => p.status === 'warning').length,
        products: sortedForecast
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/monthly-report
// Revenue report grouped by period (daily, monthly, yearly)
router.get('/monthly-report', authMiddleware, async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const { startDate, endDate, groupFormat } = getDateRange(period);
    const branchFilter = isAdmin(req) ? null : req.user.branch_id;

    // Get sales logs
    let revenueQuery = supabase
      .from('sales_logs')
      .select('revenue, date')
      .gte('date', startDate)
      .lte('date', endDate);

    if (branchFilter) {
      revenueQuery = revenueQuery.eq('branch_id', branchFilter);
    }

    const { data: salesData } = await revenueQuery;

    // Group by period format
    const groupedData = {};

    if (groupFormat === 'date') {
      // Daily: each date
      for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        groupedData[dateKey] = {
          period: dateKey,
          revenue: 0,
          bills: 0
        };
      }
    } else if (groupFormat === 'month') {
      // Monthly: Jan-Dec
      const startYear = new Date(startDate).getFullYear();
      const endYear = new Date(endDate).getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
          const date = new Date(year, month, 1);
          const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          if (!(key in groupedData)) {
            groupedData[key] = {
              period: key,
              revenue: 0,
              bills: 0
            };
          }
        }
      }
    } else if (groupFormat === 'year') {
      // Yearly: last 5 years
      const currentYear = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        groupedData[year.toString()] = {
          period: year.toString(),
          revenue: 0,
          bills: 0
        };
      }
    }

    // Aggregate sales data
    salesData?.forEach((sale) => {
      const saleDate = new Date(sale.date);
      let key;

      if (groupFormat === 'date') {
        key = sale.date;
      } else if (groupFormat === 'month') {
        key = saleDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      } else if (groupFormat === 'year') {
        key = saleDate.getFullYear().toString();
      }

      if (groupedData[key]) {
        groupedData[key].revenue += parseFloat(sale.revenue || 0);
      }
    });

    // Get bills data
    let billsQuery = supabase
      .from('bills')
      .select('created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'finalized');

    if (branchFilter) {
      billsQuery = billsQuery.eq('branch_id', branchFilter);
    }

    const { data: billsData } = await billsQuery;

    billsData?.forEach((bill) => {
      const billDate = new Date(bill.created_at);
      let key;

      if (groupFormat === 'date') {
        key = bill.created_at.split('T')[0];
      } else if (groupFormat === 'month') {
        key = billDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      } else if (groupFormat === 'year') {
        key = billDate.getFullYear().toString();
      }

      if (groupedData[key]) {
        groupedData[key].bills += 1;
      }
    });

    const reportData = Object.values(groupedData);
    const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0);

    res.status(200).json({
      success: true,
      monthly_report: {
        period: period,
        total_revenue: totalRevenue.toFixed(2),
        total_bills: billsData?.length || 0,
        monthly_data: reportData,
        average_revenue: (totalRevenue / reportData.length).toFixed(2)
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;