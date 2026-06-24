const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Check if user is admin
const isAdmin = (req) => req.user.role === 'admin';

// Helper: Get branch filter based on role
const getBranchFilter = (req) => {
  if (isAdmin(req)) {
    return null; // Admin can see all branches
  }
  return req.user.branch_id; // Staff sees only their branch
};

// Helper: Auto-manage alerts
const manageAlerts = async (product_id, branch_id, quantity, reorder_level) => {
  try {
    // Check if low-stock condition exists
    const isLowStock = quantity < reorder_level;

    // Check for existing alert
    const { data: existingAlert, error: fetchError } = await supabase
      .from('alerts')
      .select('id, status')
      .eq('product_id', product_id)
      .eq('branch_id', branch_id)
      .eq('alert_type', 'low_stock')
      .single();

    if (isLowStock && !existingAlert) {
      // Create alert if low stock and no existing alert
      await supabase
        .from('alerts')
        .insert([
          {
            product_id,
            branch_id,
            alert_type: 'low_stock',
            status: 'active'
          }
        ]);
    } else if (!isLowStock && existingAlert && existingAlert.status === 'active') {
      // Resolve alert if stock is now OK
      await supabase
        .from('alerts')
        .update({ status: 'resolved', updated_at: new Date().toISOString() })
        .eq('id', existingAlert.id);
    }
  } catch (err) {
    console.error('Alert management error:', err);
    // Don't fail the request if alert management fails
  }
};

// GET /inventory
// Staff: own branch only, Admin: all branches
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { branch_id } = req.query;
    let branchFilter = getBranchFilter(req);

    // If branch_id is provided and user is admin, allow filtering
    if (branch_id && isAdmin(req)) {
      branchFilter = branch_id;
    } else if (branch_id && !isAdmin(req) && branch_id !== req.user.branch_id) {
      // Staff trying to access another branch
      return res.status(403).json({
        success: false,
        error: 'You can only view your branch inventory'
      });
    }

    if (!branchFilter && !isAdmin(req)) {
      return res.status(400).json({
        success: false,
        error: 'Staff must have a branch assigned'
      });
    }

    let query = supabase
      .from('inventory')
      .select(`
        id,
        product:products(id, name, base_price, category, reorder_level),
        branch:branches(id, name, location),
        quantity_in_stock,
        last_restocked_at
      `);

    if (branchFilter) {
      query = query.eq('branch_id', branchFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Add status (ok/low_stock) to each entry
    const inventoryWithStatus = data.map((item) => ({
      ...item,
      status: item.quantity_in_stock < item.product.reorder_level ? 'low_stock' : 'ok'
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      branch_filter: branchFilter || 'all',
      inventory: inventoryWithStatus
    });
  } catch (err) {
    next(err);
  }
});

// GET /inventory/:id
// Get single inventory entry with branch restriction
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        product:products(id, name, base_price, category, reorder_level),
        branch:branches(id, name, location),
        quantity_in_stock,
        last_restocked_at
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Inventory entry not found'
      });
    }

    // Check branch access for staff
    if (!isAdmin(req) && data.branch.id !== req.user.branch_id) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your branch inventory'
      });
    }

    const status = data.quantity_in_stock < data.product.reorder_level ? 'low_stock' : 'ok';

    res.status(200).json({
      success: true,
      inventory: {
        ...data,
        status
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /inventory/low-stock
// Staff: own branch low stock, Admin: all branches
router.get('/alerts/low-stock', authMiddleware, async (req, res, next) => {
  try {
    const branchFilter = getBranchFilter(req);

    let query = supabase
      .from('alerts')
      .select(`
        id,
        product:products(id, name, base_price, category, reorder_level, supplier:suppliers(id, name, email, phone, lead_time_days)),
        branch:branches(id, name, location),
        alert_type,
        status,
        created_at
      `)
      .eq('alert_type', 'low_stock')
      .eq('status', 'active');

    if (branchFilter) {
      query = query.eq('branch_id', branchFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format response with calculated shortage
    const lowStockItems = data.map((alert) => {
      const currentStock = alert.product_id ? 0 : 0; // We'll get this from inventory join

      return {
        alert_id: alert.id,
        product_name: alert.product.name,
        product_id: alert.product.id,
        reorder_level: alert.product.reorder_level,
        branch: alert.branch.name,
        branch_id: alert.branch.id,
        supplier: alert.product.supplier,
        alert_created_at: alert.created_at
      };
    });

    // Enhance with actual quantities from inventory
    const enrichedItems = await Promise.all(
      lowStockItems.map(async (item) => {
        const { data: invData } = await supabase
          .from('inventory')
          .select('quantity_in_stock')
          .eq('product_id', item.product_id)
          .eq('branch_id', item.branch_id)
          .single();

        return {
          ...item,
          current_stock: invData?.quantity_in_stock || 0,
          shortage: Math.max(0, item.reorder_level - (invData?.quantity_in_stock || 0))
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedItems.length,
      low_stock_items: enrichedItems
    });
  } catch (err) {
    next(err);
  }
});

// PUT /inventory/:id
// Update stock quantity (Admin or staff in own branch)
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity_in_stock } = req.body;

    // Validate input
    if (quantity_in_stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'quantity_in_stock is required'
      });
    }

    if (!Number.isInteger(quantity_in_stock) || quantity_in_stock < 0) {
      return res.status(400).json({
        success: false,
        error: 'quantity_in_stock must be a non-negative integer'
      });
    }

    if (quantity_in_stock > 1000000) {
      return res.status(400).json({
        success: false,
        error: 'quantity_in_stock exceeds maximum allowed'
      });
    }

    // Get inventory entry
    const { data: inventory, error: fetchError } = await supabase
      .from('inventory')
      .select('id, branch_id, product_id, product:products(id, name, base_price, category, reorder_level)')
      .eq('id', id)
      .single();

    if (fetchError || !inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory entry not found'
      });
    }

    // Check access: staff can only update their branch
    if (!isAdmin(req) && inventory.branch_id !== req.user.branch_id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your branch inventory'
      });
    }

    // Update inventory
    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity_in_stock,
        last_restocked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        product:products(id, name, base_price, category, reorder_level),
        branch:branches(id, name, location),
        quantity_in_stock,
        last_restocked_at
      `);

    if (error) throw error;

    // Auto-manage alerts based on new stock level
    await manageAlerts(
      inventory.product_id,
      inventory.branch_id,
      quantity_in_stock,
      inventory.product.reorder_level
    );

    const status = quantity_in_stock < inventory.product.reorder_level ? 'low_stock' : 'ok';

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      inventory: {
        ...data[0],
        status
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;