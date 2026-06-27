const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, branch_id } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          name,
          role: 'staff',
          branch_id: branch_id || null
        }
      ])
      .select();
    
    if (error) {
      if (error.message.includes('duplicate')) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
      throw error;
    }
    
    const user = data[0];
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branch_id: user.branch_id
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    
    const { email, password } = req.body;
    
    // if (!email || !password) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Email and password are required'
    //   });
    // }
    
    // Find user by email
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email'
      });
    }
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
    
    // Generate JWT token
    const token = generateToken(data);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        branch_id: data.branch_id
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /auth/user (protected route)
router.get('/user', authMiddleware, async (req, res, next) => {
  try {
    // req.user was attached by authMiddleware
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, branch_id, created_at')
      .eq('id', req.user.user_id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: data
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout (stateless, just client-side token deletion)
router.post('/logout', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please delete token from client.'
  });
});

// PUT /auth/password - Change user password
router.put('/password', authMiddleware, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user_id = req.user.user_id;
 
    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
 
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
 
    // Get current user with password hash
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user_id)
      .single();
 
    if (fetchError || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
 
    // Verify current password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
 
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
 
    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
 
    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);
 
    if (updateError) throw updateError;
 
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
