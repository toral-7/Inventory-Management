const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware: Admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can access this resource'
    });
  }
  next();
};

// GET /staff - List all staff members
router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { data: staff, error } = await supabase
      .from('users')
      .select('id, name, email, role, branch_id, status, created_at')
      .eq('role', 'staff')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      staff: staff || []
    });
  } catch (err) {
    next(err);
  }
});

// GET /staff/:id - Get single staff member
router.get('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: staff, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'staff')
      .single();

    if (error || !staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      staff
    });
  } catch (err) {
    next(err);
  }
});

// PUT /staff/:id - Update staff member (branch assignment, status)
router.put('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { branch_id, status } = req.body;

    // Validate status
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be active or inactive'
      });
    }

    // Validate branch exists (if assigning)
    if (branch_id) {
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('id', branch_id)
        .single();

      if (branchError || !branch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid branch ID'
        });
      }
    }

    // Update staff
    const updateData = {};
    if (branch_id !== undefined) updateData.branch_id = branch_id || null;
    if (status) updateData.status = status;

    const { data: updatedStaff, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'staff')
      .select()
      .single();

    if (error || !updatedStaff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      staff: updatedStaff
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /staff/:id - Remove staff member
router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Don't allow deleting own account
    if (id === req.user.user_id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Delete staff
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'staff');

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Staff member removed successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;