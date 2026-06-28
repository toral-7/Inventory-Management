# Inventory & Billing Management System

A full-stack web application for managing product inventory, billing, and analytics with role-based access control.

---

## Problem Statement

Businesses struggle with manual inventory tracking and billing processes, leading to:
- Inaccurate stock levels
- Slow billing workflows
- Difficulty tracking sales trends
- No real-time visibility across branches

---

## Solution

A comprehensive **Inventory & Billing Management System** that automates:
- Product and inventory management
- Digital bill generation and tracking
- Real-time analytics and reporting
- Multi-branch operations with role-based access
- Low stock alerts and reorder management

---

## Live Application

| Component | URL |
|-----------|-----|
| **Frontend** | https://inventory-management-beta-eight.vercel.app |
| **Backend API** | https://inventory-management-teo6.onrender.com |

**Test Credentials:**
```
Email: admin@inventory.com
Password: password123
Email: staff1@inventory.com
Password: password123
```

---

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** (dark theme with ClickHouse design system)
- **Recharts** (analytics & charts)
- **Axios** (HTTP client)
- **React Router** (navigation)

### Backend
- **Node.js** with Express
- **Supabase** (PostgreSQL database)
- **JWT** (authentication)
- **CORS** (cross-origin requests)

### Database
- **PostgreSQL** (11 tables)
- **Row Level Security (RLS)** policies
- **Automated constraints** and validations

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase

---

## Features

### 1. Authentication & Authorization
- Secure login with JWT
- Role-based access (Admin & Staff)
- Profile management and password changes

### 2. Product Management
- Create, read, update, delete products
- Track product details (name, SKU, price, category)
- Supplier association

### 3. Inventory Management
- Real-time stock tracking per branch
- Low stock alerts and thresholds
- Reorder level management
- Stock movement history

### 4. Billing System
- Digital bill creation
- Multiple line items per bill
- Tax and discount calculations
- Bill status tracking (Draft, Finalized, Paid)
- Bill search and filtering

### 5. Analytics Dashboard
- Sales trends visualization
- Revenue analytics
- Product performance charts
- Period-based analysis (Daily, Monthly, Yearly)
- Export-ready data

### 6. Settings & Administration
- System configuration (tax rates, thresholds)
- User preferences (timezone, date format)
- Staff management (view, edit, delete users)
- Branch management

### 7. Supplier Management
- Supplier database
- Contact information
- Associated products

---

## Database Schema

### Core Tables
- **users** - Staff accounts with roles and branches
- **products** - Product catalog
- **inventory** - Stock levels per branch
- **bills** - Invoice records
- **bill_items** - Line items in bills
- **branches** - Multi-location support

### Supporting Tables
- **suppliers** - Supplier information
- **sales_logs** - Sales transaction history
- **alerts** - Low stock notifications
- **settings** - System configuration (JSON)
- **user_preferences** - Individual user settings

---

## Key Features Demonstrated

✅ **Multi-branch operations** - Manage inventory across locations
✅ **Real-time analytics** - Dashboard with dynamic charts
✅ **Role-based control** - Admin vs Staff permissions
✅ **Complete audit trail** - Sales logs and history
✅ **Professional UI** - Dark theme with ClickHouse design system
✅ **API-first architecture** - RESTful backend
✅ **Production-ready** - Error handling, validation, CORS

---

## Project Structure

```
inventory-management/
├── inventory-frontend/          # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── styles/             # Global styling
│   │   └── api/                # API client setup
│   └── package.json
│
├── inventory-backend/           # Node.js API server
│   ├── routes/                 # API endpoints
│   ├── config/                 # Database configuration
│   ├── server.js               # Express setup
│   └── package.json
│
├── README.md                    # This file
├── API_DOCS.md                  # API documentation
├── SETUP.md                     # Installation guide
└── vercel.json                  # Vercel deployment config
```

---

## Quick Start

### Option 1: Use Live Application (No Setup Required)
1. Visit: https://inventory-management-beta-eight.vercel.app
2. Login with credentials above
3. Explore features

### Option 2: Run Locally
See **[SETUP.md](/SETUP.md)** for detailed instructions.

Quick commands:
```bash
# Terminal 1: Backend
cd inventory-backend
npm install
npm run dev

# Terminal 2: Frontend
cd inventory-frontend
npm install
npm run dev
```

---

## API Overview

**Base URL:** `https://inventory-management-teo6.onrender.com`

### Main Endpoints
- `POST /auth/login` - User authentication
- `GET/POST /products` - Product management
- `GET/POST /inventory` - Stock management
- `GET/POST /bills` - Billing operations
- `GET /analytics` - Dashboard data
- `GET/POST /suppliers` - Supplier management
- `GET/PUT /settings` - Configuration
- `GET/PUT /staff` - User management

See **[API_DOCS.md](/API_DOCS.md)** for complete reference.

---

## Deployment Architecture

### Frontend (Vercel)
- Build: `npm --prefix inventory-frontend run build`
- Output: `inventory-frontend/dist`
- Env: `VITE_API_URL` points to backend
- Auto-deployed on git push

### Backend (Render)
- Runtime: Node.js
- Start: `npm start`
- Port: 10000
- Auto-deployed from GitHub

### Database (Supabase)
- PostgreSQL 15
- RLS policies for security
- Connection pooling enabled
- Real-time capabilities

---

## Security Implementation

✅ **Authentication** - JWT tokens with expiration  
✅ **CORS** - Restricted to production domains <br>
✅ **RLS Policies** - Row-level security in database
✅ **Input Validation** - Server-side validation
✅ **Password Hashing** - bcrypt encryption
✅ **Environment Variables** - No secrets in code

---

## Performance Metrics

- Frontend Build: ~1.6s
- API Response Time: <200ms average
- Database Queries: Optimized with indexes
- Bundle Size: ~700KB (gzipped: ~192KB)

---

## Future Enhancements

- [ ] Mobile-responsive design
- [ ] Email notifications
- [ ] SMS alerts for low stock
- [ ] Barcode scanning
- [ ] PDF invoice generation
- [ ] Advanced reporting
- [ ] Multi-currency support
- [ ] Import/export features

---

## Troubleshooting

**Login fails (401 error)**
- Verify test user exists in database
- Check Supabase connection
- See [SETUP.md](/SETUP.md) for debugging

**API errors (CORS)**
- Ensure backend URL is correct in frontend
- Check CORS settings in Render
- Verify environment variables

**Database errors**
- Verify Supabase credentials
- Check RLS policies are enabled
- Ensure tables exist (see [SETUP.md](/SETUP.md))

---

## Support

For issues or questions:
1. Check [SETUP.md](/SETUP.md) for installation help
2. Review [API_DOCS.md](/API_DOCS.md) for endpoint details
3. Check browser console for error messages
4. Verify environment variables are set correctly

---

## Contact

**Built by:** Toral (NMIMS Mumbai - B.Tech Semester 2)
**Internship:** LaunchED Full Stack Development
**GitHub:** https://github.com/toral-7/Inventory-Management

---

## License

This project is part of an academic capstone submission. All rights reserved.

---

**Last Updated:** June 28, 2026
**Status:** Production Ready ✅