# 📦 Inventory & Billing Management System

A full-stack capstone project for NMIMS B.Tech Semester 2. A comprehensive inventory management and billing system with real-time analytics, multi-branch support, and role-based access control.

---

## 🎯 Project Overview

**Inventory & Billing Management System** is a modern web application designed for retail businesses to:
- Manage product inventory across multiple branches
- Track stock levels and receive low-stock alerts
- Create and finalize sales bills with tax calculations
- View real-time analytics and sales forecasting
- Manage suppliers and their details
- Control access with role-based permissions (Admin/Staff)

**Duration:** 17-day sprint (Days 1-17)
**Status:** ✅ Complete (Days 1-12 tested, Days 13-17 in progress)

---

## 🛠 Tech Stack

### **Frontend**
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router v6** - Routing
- **Context API** - State management

### **Backend**
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database & auth
- **JWT** - Token-based authentication

### **Database**
- **PostgreSQL** (via Supabase)
- **9 tables** with full CRUD APIs
- **Row-level security** policies
- **Auto-alerts** on inventory changes

---

## ✨ Features

### **Core Features**
✅ **Authentication**
- Email/password login
- JWT token management
- Persistent sessions (localStorage)
- Protected routes with role-based access

✅ **Inventory Management**
- Track stock by product and branch
- Update quantities in real-time
- Low-stock alerts and notifications
- Reorder level configuration

✅ **Bills & Sales**
- Create multi-item bills
- Per-item discounts
- Tax rate calculation
- Finalize/lock bills
- View bill details
- Delete draft bills

✅ **Products & Suppliers**
- Full CRUD for products
- Supplier management
- Link suppliers to products
- Search and filter

✅ **Analytics & Reporting**
- Dashboard with 4 summary cards
- Monthly revenue trends (line chart)
- Top 10 products by revenue (bar chart)
- 30-day stock forecast (table)
- Multi-branch filtering
- Real-time data refresh

✅ **Multi-Branch Support**
- Branch-specific inventory
- Staff restricted to their branch
- Admin views all branches
- Branch filtering on reports

✅ **Role-Based Access Control**
- **Admin:** Full system access, all features
- **Staff:** View-only for most features, can create bills in their branch

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16+)
- npm or yarn
- Git
- Supabase account (or local PostgreSQL)

### **Installation**

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd inventory-management-system
```

**2. Backend Setup**
```bash
cd inventory-backend
npm install
```

Create `.env` file:
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Start backend:
```bash
npm run dev
# Server running on http://localhost:5000
```

**3. Frontend Setup**
```bash
cd inventory-frontend
npm install
```

Create `.env` file:
```
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
# App running on http://localhost:5173
```

**4. Open Browser**
Navigate to `http://localhost:5173`

---

## 👤 Test Credentials

**Admin Account**
- Email: `admin@inventory.com`
- Password: `password123`
- Permissions: Full system access

**Staff Account** (if available in database)
- Email: `staff@inventory.com`
- Password: `password123`
- Permissions: View-only + bill creation in assigned branch

---

## 📁 Project Structure

### **Backend** (`inventory-backend/`)
```
inventory-backend/
├── config/
│   └── supabase.js          # Supabase client setup
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Error handling
├── routes/
│   ├── auth.js              # Login, user data
│   ├── products.js          # Product CRUD
│   ├── inventory.js         # Stock management
│   ├── bills.js             # Bill creation & finalization
│   ├── analytics.js         # Reports & forecasts
│   ├── branches.js          # Branch management
│   └── suppliers.js         # Supplier CRUD
├── migrations/
│   └── init.sql             # Database schema
├── server.js                # Express app entry
└── package.json
```

### **Frontend** (`inventory-frontend/`)
```
inventory-frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx        # Auth page
│   │   ├── Dashboard.jsx    # Summary cards + charts
│   │   ├── Products.jsx     # Product list & CRUD
│   │   ├── Inventory.jsx    # Stock management
│   │   ├── Bills.jsx        # Bill creation & list
│   │   ├── Analytics.jsx    # Detailed reports
│   │   └── Suppliers.jsx    # Supplier management
│   ├── components/
│   │   ├── Navbar.jsx       # Top navigation
│   │   ├── Sidebar.jsx      # Left sidebar menu
│   │   ├── Modal.jsx        # Reusable modal
│   │   └── ProtectedRoute.jsx # Auth guard
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state
│   ├── api/
│   │   └── client.js        # Axios with auth
│   ├── App.jsx              # Main app + routing
│   └── main.jsx
├── tailwind.config.js       # Tailwind config
├── vite.config.js           # Vite config
└── package.json
```

---

## 🗄 Database Schema

**9 Tables:**

1. **users** - Users with roles (admin/staff)
2. **branches** - Store/branch locations
3. **products** - Product catalog
4. **suppliers** - Supplier information
5. **inventory** - Stock by product & branch
6. **bills** - Sales bills/invoices
7. **bill_items** - Individual items in bills
8. **sales_logs** - Historical sales for analytics
9. **alerts** - Low-stock notifications

**Key Features:**
- Foreign key relationships
- Cascade delete policies
- Auto-timestamps (created_at, updated_at)
- Unique constraints (email, bill_number)
- Indexes for performance

---

## 📊 API Endpoints

### **Authentication**
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/user` - Get current user

### **Products**
- `GET /products` - List all
- `GET /products/:id` - Get single
- `POST /products` - Create (admin only)
- `PUT /products/:id` - Update (admin only)
- `DELETE /products/:id` - Delete (admin only)

### **Inventory**
- `GET /inventory` - List with branch filtering
- `GET /inventory/:id` - Get single
- `PUT /inventory/:id` - Update stock
- `GET /inventory/alerts/low-stock` - Low stock items

### **Bills**
- `GET /bills` - List bills
- `GET /bills/:id` - Get details
- `POST /bills` - Create bill
- `PUT /bills/:id/finalize` - Lock bill
- `DELETE /bills/:id` - Delete draft bill

### **Analytics**
- `GET /analytics/dashboard` - Summary cards + top products
- `GET /analytics/forecast` - 30-day stock forecast
- `GET /analytics/monthly-report` - Revenue by month

### **Branches**
- `GET /branches` - List all
- `POST /branches` - Create (admin only)
- `PUT /branches/:id` - Update (admin only)
- `DELETE /branches/:id` - Delete (admin only)

### **Suppliers**
- `GET /suppliers` - List all
- `GET /suppliers/:id` - Get single
- `POST /suppliers` - Create (admin only)
- `PUT /suppliers/:id` - Update (admin only)
- `DELETE /suppliers/:id` - Delete (admin only)

---

## 🔐 Authentication

**How It Works:**
1. User logs in with email/password
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. Backend validates token on protected routes
6. Token validated on app load (AuthContext)

**Protected Routes:**
- `/dashboard` - Requires login
- `/products` - Requires login
- `/inventory` - Requires login
- `/bills` - Requires login
- `/analytics` - Requires login
- `/suppliers` - Requires login
- `/login` - Public

---

## 📈 Analytics & Forecasting

**Dashboard:**
- 4 summary cards (Revenue, Bills, Low Stock, Products)
- Bar chart: Top 5 products by revenue
- Pie chart: Inventory health (OK vs Low Stock)

**Analytics Page:**
- Line chart: Monthly revenue trend (12 months)
- Bar chart: Top 10 products by revenue
- Table: 30-day stock forecast per product

**Forecast Calculation:**
- Average daily sales = Total sold / Days with sales
- Days until stockout = Current stock / Avg daily sales
- Status: Critical (≤10 days), Warning (≤20 days), OK (>20 days)

**Note:** Forecast requires sales_logs data. Without sales history, all items show as "OK".

---

## ⚠️ Known Issues

### **Day 12 Testing Results**
1. ✅ Authentication - Working
2. ✅ Products CRUD - Working
3. ✅ Inventory Management - Working (bug fixed)
4. ✅ Suppliers CRUD - Working
5. ✅ Bills Creation - Working
6. ✅ Analytics - Working (no sales data by default)
7. ⚠️ Mobile Responsiveness - Tables not optimal on iPhone (fix in Days 14-15)
8. ℹ️ React Router v7 warnings - Non-critical (informational only)

### **Limitations**
- No sales data by default (populate sales_logs for forecast)
- Mobile tables need responsive redesign
- No PDF export (future feature)
- No email notifications (future feature)

---

## 🚀 Deployment

### **Frontend to Vercel**

1. **Push to GitHub**
```bash
git add .
git commit -m "Final version Day 13"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Set environment variable: `VITE_API_URL=http://localhost:5000` (or backend URL)
   - Click "Deploy"

3. **Verify Live URL**
   - Test login
   - Create product
   - View analytics

---

## 📝 Usage Examples

### **Create a Product**
```bash
curl -X POST http://localhost:5000/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "base_price": 50000,
    "category": "Electronics",
    "reorder_level": 5,
    "supplier_id": "uuid-here"
  }'
```

### **Create a Bill**
```bash
curl -X POST http://localhost:5000/bills \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": "uuid",
        "quantity": 2,
        "item_discount": 10
      }
    ],
    "tax_rate": 18
  }'
```

### **Get Analytics**
```bash
curl -X GET http://localhost:5000/analytics/dashboard \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 Development Workflow

**Running Both Services:**

**Terminal 1 (Backend):**
```bash
cd inventory-backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd inventory-frontend
npm run dev
```

**Both running:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Open http://localhost:5173 in browser

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Express.js Guide](https://expressjs.com)
- [Supabase Docs](https://supabase.com/docs)
- [React Router v6](https://reactrouter.com/v6)

---

## 🎯 Future Enhancements

- [ ] PDF bill export
- [ ] Email notifications for low stock
- [ ] Advanced forecasting with ML
- [ ] Bulk product import/export (CSV)
- [ ] User profile management
- [ ] Audit logs for all changes
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## 📋 Development Timeline

| Day | Task | Status |
|-----|------|--------|
| 1-8 | Backend APIs | ✅ Complete |
| 9-11 | Frontend CRUD Pages | ✅ Complete |
| 12 | Testing & Bug Fixes | ✅ Complete |
| 13 | Documentation | 🔄 In Progress |
| 14-15 | Polish & Features | ⏳ Pending |
| 16 | Integration Testing | ⏳ Pending |
| 17 | Deployment | ⏳ Pending |

---

## 👨‍💻 Author

**Maze** - B.Tech Semester 2, NMIMS
- Co-Secretary, Technical Affairs (Junior Council)
- Project: Capstone - Inventory & Billing Management System

---

## 📞 Support

For issues or questions:
1. Check the API_DOCS.md for endpoint details
2. Check SETUP.md for installation help
3. Review code comments in backend routes
4. Check browser console for errors

---

## 📄 License

This is an academic capstone project. Use for educational purposes only.

---

**Last Updated:** Day 13 of 17-day sprint
**Next:** Days 14-15 (UI Polish & Features)
