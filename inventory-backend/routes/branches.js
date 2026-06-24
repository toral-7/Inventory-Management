const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Check if user is admin
const isAdmin = (req) => req.user.role === 'admin';

// GET /branches
// List all branches (all authenticated users can view)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('id, name, location, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      branches: data
    });
  } catch (err) {
    next(err);
  }
});

// GET /branches/:id
// Get single branch details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('branches')
      .select('id, name, location, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    res.status(200).json({
      success: true,
      branch: data
    });
  } catch (err) {
    next(err);
  }
});

// POST /branches (create)
// Admin only
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can create branches'
      });
    }

    const { name, location } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Branch name is required'
      });
    }

    // Create branch
    const { data, error } = await supabase
      .from('branches')
      .insert([
        {
          name,
          location: location || null
        }
      ])
      .select('id, name, location, created_at, updated_at');

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      branch: data[0]
    });
  } catch (err) {
    next(err);
  }
});

// PUT /branches/:id (update)
// Admin only
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update branches'
      });
    }

    const { id } = req.params;
    const { name, location } = req.body;

    // Check if branch exists
    const { data: existingBranch, error: fetchError } = await supabase
      .from('branches')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingBranch) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    // Build update object (only include provided fields)
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update branch
    const { data, error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', id)
      .select('id, name, location, created_at, updated_at');

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      branch: data[0]
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /branches/:id
// Admin only
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check if admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete branches'
      });
    }

    const { id } = req.params;

    // Check if branch exists
    const { data: branch, error: fetchError } = await supabase
      .from('branches')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !branch) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    // Check if branch has users or inventory (prevent deletion if in use)
    const { data: usersInBranch } = await supabase
      .from('users')
      .select('id')
      .eq('branch_id', id);

    if (usersInBranch && usersInBranch.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete branch with active users'
      });
    }

    // Delete branch
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Branch '${branch.name}' deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;