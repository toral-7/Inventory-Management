const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Check if user is admin
const isAdmin = (req) => req.user.role === 'admin';

// Helper: Check bill ownership (staff can only access own bills)
const canAccessBill = (req, bill) => {
  if (isAdmin(req)) return true; // Admin can access any
  return bill.user_id === req.user.user_id; // Staff can only access own
};

// Helper: Generate next bill number
const generateBillNumber = async (branch_id) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('bill_number')
      .eq('branch_id', branch_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return `BILL-001`;
    }

    const lastNumber = parseInt(data[0].bill_number.split('-')[1]);
    return `BILL-${String(lastNumber + 1).padStart(3, '0')}`;
  } catch (err) {
    console.error('Bill number generation error:', err);
    return `BILL-${Date.now()}`;
  }
};

// Helper: Calculate bill totals
const calculateTotals = (items, taxRate = 18) => {
  let subtotal = 0;
  let totalDiscount = 0;

  items.forEach((item) => {
    const lineSubtotal = item.price_at_sale * item.quantity;
    const lineDiscount = (lineSubtotal * (item.item_discount || 0)) / 100;
    subtotal += lineSubtotal - lineDiscount;
    totalDiscount += lineDiscount;
  });

  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount_amount: parseFloat(totalDiscount.toFixed(2)),
    tax_amount: parseFloat(taxAmount.toFixed(2)),
    total_amount: parseFloat(totalAmount.toFixed(2))
  };
};

// Helper: Adjust inventory for bill
const adjustInventory = async (items, branch_id, operation = 'deduct') => {
  try {
    for (const item of items) {
      const adjustment = operation === 'deduct' ? -item.quantity : item.quantity;

      const { data: invData, error: fetchError } = await supabase
        .from('inventory')
        .select('id, quantity_in_stock')
        .eq('product_id', item.product_id)
        .eq('branch_id', branch_id)
        .single();

      if (!fetchError && invData) {
        const newQuantity = Math.max(0, invData.quantity_in_stock + adjustment);

        await supabase
          .from('inventory')
          .update({
            quantity_in_stock: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', invData.id);
      }
    }
  } catch (err) {
    console.error('Inventory adjustment error:', err);
    throw new Error('Failed to adjust inventory');
  }
};

// Helper: Create sales logs for finalized bill
const createSalesLogs = async (bill_id, branch_id, items) => {
  try {
    const salesLogEntries = items.map((item) => ({
      date: new Date().toISOString().split('T')[0],
      branch_id,
      product_id: item.product_id,
      quantity_sold: item.quantity,
      revenue: parseFloat((item.price_at_sale * item.quantity).toFixed(2)),
      bill_id
    }));

    const { error } = await supabase.from('sales_logs').insert(salesLogEntries);

    if (error) throw error;
  } catch (err) {
    console.error('Sales log creation error:', err);
    // Don't fail if sales logs fail
  }
};

// GET /bills
// Staff: own branch, Admin: all branches
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const branchFilter = isAdmin(req) ? null : req.user.branch_id;

    let query = supabase
      .from('bills')
      .select(`
        id,
        bill_number,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        created_at,
        finalized_at,
        branch:branches(id, name, location),
        user:users(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (branchFilter) {
      query = query.eq('branch_id', branchFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      bills: data
    });
  } catch (err) {
    next(err);
  }
});

// GET /bills/:id
// Get bill with line items
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('bills')
      .select(`
        id,
        bill_number,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        created_at,
        finalized_at,
        user_id,
        branch_id,
        branch:branches(id, name, location),
        user:users(id, name, email),
        bill_items(
          id,
          product_id,
          quantity,
          price_at_sale,
          item_discount,
          item_tax,
          product:products(id, name, base_price, category)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }

    // Check access
    if (!canAccessBill(req, data)) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own bills'
      });
    }

    // Calculate line totals
    const items = data.bill_items.map((item) => ({
      ...item,
      line_total: parseFloat(
        (item.price_at_sale * item.quantity - (item.price_at_sale * item.quantity * item.item_discount) / 100 + item.item_tax).toFixed(2)
      )
    }));

    res.status(200).json({
      success: true,
      bill: {
        ...data,
        bill_items: items
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /bills (create)
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { items, tax_rate = 18 } = req.body;
    const branch_id = req.user.branch_id;
    const user_id = req.user.user_id;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bill must have at least one item'
      });
    }

    if (tax_rate < 0 || tax_rate > 100) {
      return res.status(400).json({
        success: false,
        error: 'Tax rate must be between 0 and 100'
      });
    }

    if (!branch_id) {
      return res.status(400).json({
        success: false,
        error: 'User must be assigned to a branch'
      });
    }

    // Fetch products and validate stock
    const productIds = items.map((item) => item.product_id);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, base_price')
      .in('id', productIds);

    if (prodError || !products) throw prodError;

    // Build bill items with prices
    const billItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const lineSubtotal = product.base_price * item.quantity;
      const lineDiscount = (lineSubtotal * (item.item_discount || 0)) / 100;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTax = (lineAfterDiscount * tax_rate) / 100;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: parseFloat(product.base_price.toFixed(2)),
        item_discount: item.item_discount || 0,
        item_tax: parseFloat(lineTax.toFixed(2))
      };
    });

    // Calculate totals
    const totals = calculateTotals(
      billItems.map((item) => ({
        ...item,
        price_at_sale: parseFloat(item.price_at_sale)
      })),
      tax_rate
    );

    // Generate bill number
    const bill_number = await generateBillNumber(branch_id);

    // Create bill
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .insert([
        {
          bill_number,
          branch_id,
          user_id,
          status: 'draft',
          subtotal: totals.subtotal,
          discount_amount: totals.discount_amount,
          tax_amount: totals.tax_amount,
          total_amount: totals.total_amount
        }
      ])
      .select();

    if (billError) throw billError;

    const bill_id = billData[0].id;

    // Insert bill items
    const billItemsWithBillId = billItems.map((item) => ({
      ...item,
      bill_id
    }));

    const { error: itemError } = await supabase.from('bill_items').insert(billItemsWithBillId);

    if (itemError) throw itemError;

    // Deduct inventory
    await adjustInventory(billItems, branch_id, 'deduct');

    // Fetch complete bill with items
    const { data: completeBill, error: fetchError } = await supabase
      .from('bills')
      .select(`
        id,
        bill_number,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        created_at,
        finalized_at,
        branch:branches(id, name, location),
        user:users(id, name, email),
        bill_items(
          id,
          product_id,
          quantity,
          price_at_sale,
          item_discount,
          item_tax,
          product:products(id, name)
        )
      `)
      .eq('id', bill_id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill: completeBill
    });
  } catch (err) {
    next(err);
  }
});

// PUT /bills/:id (edit)
// Can change: quantities, item discounts, tax rate
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, tax_rate } = req.body;

    // Fetch bill
    const { data: bill, error: fetchError } = await supabase
      .from('bills')
      .select('id, status, user_id, branch_id, bill_items(id, product_id, quantity)')
      .eq('id', id)
      .single();

    if (fetchError || !bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }

    // Check access
    if (!canAccessBill(req, bill)) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own bills'
      });
    }

    // Check status
    if (bill.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Can only edit draft bills'
      });
    }

    // Restore old inventory
    await adjustInventory(bill.bill_items, bill.branch_id, 'restore');

    // Build new bill items
    const productIds = items.map((item) => item.product_id);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, base_price')
      .in('id', productIds);

    if (prodError) throw prodError;

    const newBillItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      const lineSubtotal = product.base_price * item.quantity;
      const lineDiscount = (lineSubtotal * (item.item_discount || 0)) / 100;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTax = (lineAfterDiscount * tax_rate) / 100;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: parseFloat(product.base_price.toFixed(2)),
        item_discount: item.item_discount || 0,
        item_tax: parseFloat(lineTax.toFixed(2))
      };
    });

    // Calculate new totals
    const totals = calculateTotals(newBillItems, tax_rate);

    // Update bill
    const { error: updateError } = await supabase
      .from('bills')
      .update({
        subtotal: totals.subtotal,
        discount_amount: totals.discount_amount,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Delete old bill items
    const { error: deleteError } = await supabase.from('bill_items').delete().eq('bill_id', id);

    if (deleteError) throw deleteError;

    // Insert new bill items
    const billItemsWithBillId = newBillItems.map((item) => ({
      ...item,
      bill_id: id
    }));

    const { error: insertError } = await supabase.from('bill_items').insert(billItemsWithBillId);

    if (insertError) throw insertError;

    // Deduct new inventory
    await adjustInventory(newBillItems, bill.branch_id, 'deduct');

    // Fetch updated bill
    const { data: updatedBill, error: finalError } = await supabase
      .from('bills')
      .select(`
        id,
        bill_number,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        created_at,
        finalized_at,
        bill_items(
          id,
          product_id,
          quantity,
          price_at_sale,
          item_discount,
          item_tax,
          product:products(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (finalError) throw finalError;

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      bill: updatedBill
    });
  } catch (err) {
    next(err);
  }
});

// PUT /bills/:id/finalize
router.put('/:id/finalize', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch bill
    const { data: bill, error: fetchError } = await supabase
      .from('bills')
      .select(
        `
        id,
        status,
        user_id,
        branch_id,
        bill_items(product_id, quantity, price_at_sale)
      `
      )
      .eq('id', id)
      .single();

    if (fetchError || !bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }

    // Check access
    if (!canAccessBill(req, bill)) {
      return res.status(403).json({
        success: false,
        error: 'You can only finalize your own bills'
      });
    }

    // Check status
    if (bill.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Bill is already finalized'
      });
    }

    // Create sales logs
    await createSalesLogs(id, bill.branch_id, bill.bill_items);

    // Update bill status
    const { error: updateError } = await supabase
      .from('bills')
      .update({
        status: 'finalized',
        finalized_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Fetch finalized bill
    const { data: finalizedBill, error: finalError } = await supabase
      .from('bills')
      .select(`
        id,
        bill_number,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        created_at,
        finalized_at,
        bill_items(
          id,
          product_id,
          quantity,
          price_at_sale,
          item_discount,
          item_tax,
          product:products(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (finalError) throw finalError;

    res.status(200).json({
      success: true,
      message: 'Bill finalized successfully',
      bill: finalizedBill
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /bills/:id
// Admin can delete any, staff can delete own
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch bill
    const { data: bill, error: fetchError } = await supabase
      .from('bills')
      .select('id, status, user_id, bill_number, branch_id, bill_items(product_id, quantity)')
      .eq('id', id)
      .single();

    if (fetchError || !bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }

    // Check access (admin any, staff own)
    if (!isAdmin(req) && bill.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own bills'
      });
    }

    // Check status
    if (bill.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Can only delete draft bills'
      });
    }

    // Restore inventory
    await adjustInventory(bill.bill_items, bill.branch_id, 'restore');

    // Delete bill items
    const { error: deleteItemsError } = await supabase.from('bill_items').delete().eq('bill_id', id);

    if (deleteItemsError) throw deleteItemsError;

    // Delete bill
    const { error: deleteBillError } = await supabase.from('bills').delete().eq('id', id);

    if (deleteBillError) throw deleteBillError;

    res.status(200).json({
      success: true,
      message: `Bill '${bill.bill_number}' deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;