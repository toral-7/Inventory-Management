const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Check if user is admin
const isAdmin = (req) => req.user.role === 'admin';

// GET /analytics/dashboard
// Dashboard summary: revenue, top products, inventory health
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const branchFilter = isAdmin(req) ? null : req.user.branch_id;

    // Get total revenue from sales_logs (last 30 days)
    let revenueQuery = supabase
      .from('sales_logs')
      .select('revenue')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (branchFilter) {
      revenueQuery = revenueQuery.eq('branch_id', branchFilter);
    }

    const { data: salesData, error: salesError } = await revenueQuery;
    const totalRevenue = salesData?.reduce((sum, sale) => sum + parseFloat(sale.revenue || 0), 0) || 0;

    // Get total bills (last 30 days)
    let billsQuery = supabase
      .from('bills')
      .select('id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
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

    // Get top 5 products by revenue (last 30 days)
    let topProductsQuery = supabase
      .from('sales_logs')
      .select(`
        product_id,
        product:products(id, name),
        revenue,
        quantity_sold
      `)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

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
        revenue: {
          total: totalRevenue.toFixed(2),
          period: '30 days',
          currency: '₹'
        },
        bills: {
          total: totalBills,
          period: '30 days'
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
    const branchFilter = isAdmin(req) ? null : req.user.branch_id;

    // Get average daily sales per product (last 30 days)
    let salesQuery = supabase
      .from('sales_logs')
      .select(`
        product_id,
        product:products(id, name, reorder_level),
        quantity_sold,
        date
      `)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

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
        period: '30 days',
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
// Monthly revenue report
router.get('/monthly-report', authMiddleware, async (req, res, next) => {
  try {
    const branchFilter = isAdmin(req) ? null : req.user.branch_id;

    // Get monthly revenue
    let revenueQuery = supabase
      .from('sales_logs')
      .select('revenue, date');

    if (branchFilter) {
      revenueQuery = revenueQuery.eq('branch_id', branchFilter);
    }

    const { data: salesData } = await revenueQuery;

    // Group by month
    const monthlyRevenue = {};
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyRevenue[monthKey] = {
        month: monthKey,
        revenue: 0,
        bills: 0
      };
    }

    salesData?.forEach((sale) => {
      const saleDate = new Date(sale.date);
      if (saleDate.getFullYear() === currentYear) {
        const monthKey = saleDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey].revenue += parseFloat(sale.revenue || 0);
        }
      }
    });

    // Get monthly bills
    let billsQuery = supabase
      .from('bills')
      .select('created_at')
      .eq('status', 'finalized');

    if (branchFilter) {
      billsQuery = billsQuery.eq('branch_id', branchFilter);
    }

    const { data: billsData } = await billsQuery;

    billsData?.forEach((bill) => {
      const billDate = new Date(bill.created_at);
      if (billDate.getFullYear() === currentYear) {
        const monthKey = billDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey].bills += 1;
        }
      }
    });

    const monthlyData = Object.values(monthlyRevenue);
    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);

    res.status(200).json({
      success: true,
      monthly_report: {
        year: currentYear,
        total_revenue: totalRevenue.toFixed(2),
        total_bills: billsData?.length || 0,
        monthly_data: monthlyData,
        average_monthly_revenue: (totalRevenue / 12).toFixed(2)
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;