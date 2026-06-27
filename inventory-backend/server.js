require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const billRoutes = require('./routes/bills');
const analyticsRoutes = require('./routes/analytics');
const branchRoutes = require('./routes/branches');
const supplierRoutes = require('./routes/suppliers');
const staffRoutes = require('./routes/staff')
const settingsRoutes = require('./routes/settings')

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://inventory-management-beta-eight.vercel.app/']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/bills', billRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/branches', branchRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/staff', staffRoutes);
app.use('/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - Health Check: GET http://localhost:${PORT}/health`);
  console.log(`   - Register: POST http://localhost:${PORT}/auth/register`);
  console.log(`   - Login: POST http://localhost:${PORT}/auth/login`);
  console.log(`   - Get User: GET http://localhost:${PORT}/auth/user`);
  console.log(`\n💡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});