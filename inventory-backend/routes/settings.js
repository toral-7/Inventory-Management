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

// GET /settings - Get system settings (Admin only)
router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'system_settings')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Return defaults if not found
    const defaults = {
      default_tax_rate: 18,
      low_stock_threshold: 10,
      reorder_level_default: 5,
      currency: '₹'
    };

    res.status(200).json({
      success: true,
      settings: settings?.value || defaults
    });
  } catch (err) {
    next(err);
  }
});

// PUT /settings - Update system settings (Admin only)
router.put('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { default_tax_rate, low_stock_threshold, reorder_level_default, currency } = req.body;

    // Validate inputs
    if (default_tax_rate !== undefined && (default_tax_rate < 0 || default_tax_rate > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Tax rate must be between 0 and 100'
      });
    }

    if (low_stock_threshold !== undefined && low_stock_threshold < 1) {
      return res.status(400).json({
        success: false,
        error: 'Low stock threshold must be at least 1'
      });
    }

    if (reorder_level_default !== undefined && reorder_level_default < 1) {
      return res.status(400).json({
        success: false,
        error: 'Reorder level must be at least 1'
      });
    }

    const settingsValue = {
      default_tax_rate: default_tax_rate ?? 18,
      low_stock_threshold: low_stock_threshold ?? 10,
      reorder_level_default: reorder_level_default ?? 5,
      currency: currency ?? '₹',
      updated_at: new Date().toISOString()
    };

    // Upsert settings
    const { data: settings, error } = await supabase
      .from('settings')
      .upsert(
        {
          key: 'system_settings',
          value: settingsValue,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: settings.value
    });
  } catch (err) {
    next(err);
  }
});

// GET /preferences - Get user preferences
router.get('/preferences', authMiddleware, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;

    const { data: prefs, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Return defaults if not found
    const defaults = {
      timezone: 'Asia/Kolkata',
      date_format: 'DD-MM-YYYY',
      time_format: '24-hour'
    };

    res.status(200).json({
      success: true,
      preferences: prefs || defaults
    });
  } catch (err) {
    next(err);
  }
});

// PUT /preferences - Update user preferences
router.put('/preferences', authMiddleware, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { timezone, date_format, time_format } = req.body;

    // Validate inputs
    const validTimezones = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'];
    const validDateFormats = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'];
    const validTimeFormats = ['24-hour', '12-hour'];

    if (timezone && !validTimezones.includes(timezone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timezone'
      });
    }

    if (date_format && !validDateFormats.includes(date_format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }

    if (time_format && !validTimeFormats.includes(time_format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time format'
      });
    }

    const prefsValue = {
      timezone: timezone ?? 'Asia/Kolkata',
      date_format: date_format ?? 'DD-MM-YYYY',
      time_format: time_format ?? '24-hour',
      updated_at: new Date().toISOString()
    };

    // Upsert preferences
    const { data: prefs, error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id,
          ...prefsValue
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Preferences saved',
      preferences: prefs
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;