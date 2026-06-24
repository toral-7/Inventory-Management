const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Check if user is admin
const isAdmin = (req) => req.user.role === 'admin';

// GET /suppliers
// List all suppliers
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_person, email, phone, lead_time_days, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      suppliers: data
    });
  } catch (err) {
    next(err);
  }
});

// GET /suppliers/:id
// Get single supplier details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_person, email, phone, lead_time_days, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      supplier: data
    });
  } catch (err) {
    next(err);
  }
});

// POST /suppliers (create)
// Admin only
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can create suppliers'
      });
    }

    const { name, contact_person, email, phone, lead_time_days } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Supplier name is required'
      });
    }

    // Create supplier
    const { data, error } = await supabase
      .from('suppliers')
      .insert([
        {
          name,
          contact_person: contact_person || null,
          email: email || null,
          phone: phone || null,
          lead_time_days: lead_time_days || 3
        }
      ])
      .select('id, name, contact_person, email, phone, lead_time_days, created_at, updated_at');

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier: data[0]
    });
  } catch (err) {
    next(err);
  }
});

// PUT /suppliers/:id (update)
// Admin only
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update suppliers'
      });
    }

    const { id } = req.params;
    const { name, contact_person, email, phone, lead_time_days } = req.body;

    // Check if supplier exists
    const { data: existingSupplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSupplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    // Build update object (only include provided fields)
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (contact_person !== undefined) updates.contact_person = contact_person;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (lead_time_days !== undefined) {
      if (typeof lead_time_days !== 'number' || lead_time_days < 0) {
        return res.status(400).json({
          success: false,
          error: 'lead_time_days must be a non-negative number'
        });
      }
      updates.lead_time_days = lead_time_days;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update supplier
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select('id, name, contact_person, email, phone, lead_time_days, created_at, updated_at');

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      supplier: data[0]
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /suppliers/:id
// Admin only
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete suppliers'
      });
    }

    const { id } = req.params;

    // Check if supplier exists
    const { data: supplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    // Check if supplier is linked to products (prevent deletion if in use)
    const { data: productsWithSupplier } = await supabase
      .from('products')
      .select('id')
      .eq('supplier_id', id);

    if (productsWithSupplier && productsWithSupplier.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete supplier with linked products. Remove supplier from products first.'
      });
    }

    // Delete supplier
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Supplier '${supplier.name}' deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;