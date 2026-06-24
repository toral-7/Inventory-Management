const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Check if user is admin
const isAdmin = (req) => req.user.role === 'admin';

// GET /products
// Optional query params: supplier_id
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { supplier_id } = req.query;

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        base_price,
        category,
        reorder_level,
        created_at,
        supplier:suppliers(id, name, contact_person, email, phone, lead_time_days)
      `);

    // Filter by supplier if provided
    if (supplier_id) {
      query = query.eq('supplier_id', supplier_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      products: data
    });
  } catch (err) {
    next(err);
  }
});

// GET /products/:id
// Get single product with full details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        base_price,
        category,
        reorder_level,
        created_at,
        updated_at,
        supplier:suppliers(id, name, contact_person, email, phone, lead_time_days)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product: data
    });
  } catch (err) {
    next(err);
  }
});

// POST /products (create)
// Admin only
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can create products'
      });
    }

    const { name, base_price, category, supplier_id, reorder_level } = req.body;

    // Validation
    if (!name || base_price === undefined || reorder_level === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, base_price, and reorder_level are required'
      });
    }

    if (typeof base_price !== 'number' || base_price < 0) {
      return res.status(400).json({
        success: false,
        error: 'base_price must be a positive number'
      });
    }

    if (typeof reorder_level !== 'number' || reorder_level < 0) {
      return res.status(400).json({
        success: false,
        error: 'reorder_level must be a positive number'
      });
    }

    // Create product
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          base_price,
          category: category || null,
          supplier_id: supplier_id || null,
          reorder_level
        }
      ])
      .select(`
        id,
        name,
        base_price,
        category,
        reorder_level,
        created_at,
        supplier:suppliers(id, name, contact_person, email, phone, lead_time_days)
      `);

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: data[0]
    });
  } catch (err) {
    next(err);
  }
});

// PUT /products/:id (update)
// Admin + Staff can update
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, base_price, category, supplier_id, reorder_level } = req.body;

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Build update object (only include provided fields)
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (base_price !== undefined) {
      if (typeof base_price !== 'number' || base_price < 0) {
        return res.status(400).json({
          success: false,
          error: 'base_price must be a positive number'
        });
      }
      updates.base_price = base_price;
    }
    if (category !== undefined) updates.category = category;
    if (supplier_id !== undefined) updates.supplier_id = supplier_id;
    if (reorder_level !== undefined) {
      if (typeof reorder_level !== 'number' || reorder_level < 0) {
        return res.status(400).json({
          success: false,
          error: 'reorder_level must be a positive number'
        });
      }
      updates.reorder_level = reorder_level;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update product
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        id,
        name,
        base_price,
        category,
        reorder_level,
        created_at,
        updated_at,
        supplier:suppliers(id, name, contact_person, email, phone, lead_time_days)
      `);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: data[0]
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /products/:id
// Admin only
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete products'
      });
    }

    const { id } = req.params;

    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Delete product (cascade delete to inventory via FK)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;