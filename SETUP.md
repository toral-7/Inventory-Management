# 🔧 Setup & Installation Guide

Complete step-by-step guide to set up the Inventory & Billing Management System locally.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v16 or higher ([Download](https://nodejs.org))
  ```bash
  node --version  # Check version
  ```

- **npm** or **yarn** (comes with Node.js)
  ```bash
  npm --version
  ```

- **Git** ([Download](https://git-scm.com))
  ```bash
  git --version
  ```

- **Code Editor** (VS Code recommended)

- **Supabase Account** ([Sign up free](https://supabase.com))

- **PostgreSQL Knowledge** (optional, basic queries)

---

## 🚀 Installation Steps

### **Step 1: Clone Repository**

```bash
# Clone the project
git clone <your-github-repo-url>

# Navigate to project directory
cd inventory-management-system

# View structure
ls -la
# You should see: inventory-backend, inventory-frontend, README.md
```

---

### **Step 2: Supabase Setup**

#### **2.1 Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "New project"
3. Fill in:
   - Project name: `inventory-system`
   - Database password: (strong password, save it!)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for setup

#### **2.2 Get Credentials**

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (Project ID)
   - **anon public key** (Anon Key)
   - **JWT Secret** (in JWT section, or use default)
3. Save these somewhere safe!

#### **2.3 Initialize Database**

1. Go to **SQL Editor** in Supabase
2. Click **"New Query"**
3. Copy entire content from `inventory-backend/migrations/init.sql`
4. Paste into SQL Editor
5. Click **"Run"** or Ctrl+Enter
6. Wait for all tables to be created (green checkmark)

---

### **Step 3: Backend Setup**

#### **3.1 Install Dependencies**

```bash
# Navigate to backend folder
cd inventory-backend

# Install npm packages
npm install
```

Expected packages:
- express
- cors
- dotenv
- @supabase/supabase-js
- jsonwebtoken

#### **3.2 Create Environment File**

Create file: `inventory-backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key

# JWT
JWT_SECRET=your-jwt-secret-key-here

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Replace with your actual values from Supabase!**

#### **3.3 Verify Connection**

```bash
# Start backend
npm run dev

# You should see:
# 🚀 Server running on http://localhost:5000
# 📝 API Documentation:
#    - Health Check: GET http://localhost:5000/health
```

#### **3.4 Test Backend**

Open new terminal and test:

```bash
# Test health endpoint (no auth needed)
curl http://localhost:5000/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"2024-06-23T..."}
```

✅ Backend is running!

---

### **Step 4: Frontend Setup**

#### **4.1 Install Dependencies**

**Open NEW terminal** (keep backend running in first terminal)

```bash
# Navigate to frontend folder (from project root)
cd inventory-frontend

# Install npm packages
npm install
```

Expected packages:
- react
- react-dom
- react-router-dom
- axios
- recharts
- tailwindcss

#### **4.2 Create Environment File**

Create file: `inventory-frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

#### **4.3 Start Frontend**

```bash
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

#### **4.4 Open in Browser**

Navigate to: **http://localhost:5173**

You should see the login page! 🎉

---

## 🧪 Test the Setup

### **Test 1: Login**

```
Email: admin@inventory.com
Password: password123
```

**What to expect:**
- ✅ Login successful
- ✅ Redirected to Dashboard
- ✅ See 4 summary cards
- ✅ See navigation sidebar

### **Test 2: Create Product**

1. Click **Products** in sidebar
2. Click **+ Add Product**
3. Fill in:
   - Name: `Test Laptop`
   - Price: `50000`
   - Category: `Electronics`
   - Reorder Level: `5`
4. Click **Create**

**What to expect:**
- ✅ Product appears in table
- ✅ No console errors

### **Test 3: View Inventory**

1. Click **Inventory** in sidebar
2. Should see products with stock levels
3. Click **Update** on any item
4. Change quantity
5. Click **Update**

**What to expect:**
- ✅ Stock updates in table
- ✅ Status updates (OK/Low Stock)

### **Test 4: Logout**

1. Click user avatar in navbar
2. Click **Logout**
3. Try accessing `/inventory` URL manually

**What to expect:**
- ✅ Redirected to login
- ✅ Cannot access protected pages without token

---

## 🛠 Common Issues & Fixes

### **Issue: "Cannot connect to Supabase"**

**Error:** `Error: getaddrinfo ENOTFOUND supabase...`

**Fixes:**
1. Check `.env` file has correct `SUPABASE_URL` and `SUPABASE_KEY`
2. Verify credentials from Supabase dashboard
3. Check internet connection
4. Restart backend: Ctrl+C, then `npm run dev`

---

### **Issue: "Port 5000 already in use"**

**Error:** `Error: listen EADDRINUSE :::5000`

**Fixes:**
```bash
# Option 1: Kill process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :5000
kill -9 <PID>

# Option 2: Change PORT in .env
PORT=5001  # Change to different port
```

---

### **Issue: "Cannot find module 'express'"**

**Error:** `Error: Cannot find module 'express'`

**Fixes:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### **Issue: "npm: command not found"**

**Error:** `npm: command not found`

**Fixes:**
- Node.js not installed properly
- Reinstall Node.js from [nodejs.org](https://nodejs.org)
- Restart terminal after installation

---

### **Issue: "VITE_API_URL is undefined" (Frontend)**

**Error:** Frontend can't reach backend, blank page

**Fixes:**
1. Check `.env` file exists in `inventory-frontend/`
2. Verify `VITE_API_URL=http://localhost:5000`
3. Restart frontend: Ctrl+C, then `npm run dev`
4. Clear browser cache: Ctrl+Shift+Delete
5. Check backend is running on port 5000

---

### **Issue: "Login fails, wrong credentials"**

**Error:** `Invalid email or password`

**Fixes:**
1. Verify test account exists in Supabase
2. Check email is exactly: `admin@inventory.com`
3. Check password is exactly: `password123`
4. Go to Supabase → Auth → Users, verify user exists
5. If not, create manually via SQL:

```sql
-- Add test user manually (if needed)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@inventory.com',
  crypt('password123', gen_salt('bf')),
  NOW()
);
```

---

## 📁 Project Structure

```
inventory-management-system/
├── inventory-backend/
│   ├── config/
│   │   └── supabase.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── inventory.js
│   │   ├── bills.js
│   │   ├── analytics.js
│   │   ├── branches.js
│   │   └── suppliers.js
│   ├── migrations/
│   │   └── init.sql
│   ├── .env                  # Create this
│   ├── server.js
│   └── package.json
│
├── inventory-frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Bills.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Suppliers.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                  # Create this
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── README.md
├── API_DOCS.md
├── SETUP.md                  # This file
└── .gitignore
```

---

## 🔑 Environment Variables Checklist

### **Backend `.env`**
- [ ] `PORT=5000`
- [ ] `NODE_ENV=development`
- [ ] `SUPABASE_URL=https://xxxxx.supabase.co`
- [ ] `SUPABASE_KEY=eyJhbGc...` (anon key)
- [ ] `JWT_SECRET=your-secret-key`
- [ ] `CORS_ORIGIN=http://localhost:5173`

### **Frontend `.env`**
- [ ] `VITE_API_URL=http://localhost:5000`

---

## 🎯 Running the Application

### **Terminal 1: Backend**
```bash
cd inventory-backend
npm run dev
# Running on http://localhost:5000
```

### **Terminal 2: Frontend**
```bash
cd inventory-frontend
npm run dev
# Running on http://localhost:5173
```

### **Open in Browser**
```
http://localhost:5173
```

---

## 🧑‍💼 Test Users

### **Admin Account**
```
Email: admin@inventory.com
Password: password123
Access: Full system access
```

### **Staff Account** (if available)
```
Email: staff@inventory.com
Password: password123
Access: View-only, limited editing
```

---

## 🚀 Database Management

### **View Database in Supabase**

1. Go to Supabase dashboard
2. Click **"Table Editor"** (left sidebar)
3. Browse tables:
   - `users` - User accounts
   - `branches` - Store locations
   - `products` - Product catalog
   - `inventory` - Stock levels
   - `bills` - Sales bills
   - `suppliers` - Supplier info

### **Run SQL Queries**

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Write query and click **"Run"**

**Useful queries:**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public';

-- Count products
SELECT COUNT(*) FROM products;

-- View all users
SELECT id, email, role FROM users;

-- Check inventory
SELECT p.name, i.quantity_in_stock 
FROM inventory i 
JOIN products p ON i.product_id = p.id;
```

---

## 📊 Database Backup

### **Export Database**

1. Go to Supabase dashboard
2. Click **Settings** → **Database**
3. Click **"Backups"**
4. Download latest backup

### **Import Data**

```sql
-- Via SQL Editor, paste backup SQL and run
```

---

## 🔐 Security Notes

⚠️ **Before Production:**

1. **Change JWT_SECRET:**
   ```bash
   # Generate strong secret
   openssl rand -base64 32
   ```
   Use this in `.env`

2. **Set NODE_ENV=production**

3. **Use HTTPS URLs** (not localhost)

4. **Never commit `.env`** to Git
   - Check `.gitignore` includes `.env`

5. **Use strong passwords** for test accounts

6. **Enable Row-Level Security (RLS)** in Supabase

---

## 📞 Troubleshooting

**Still having issues?**

1. **Check console errors:**
   - Backend: Look for red text in terminal
   - Frontend: Open DevTools (F12) → Console tab

2. **Verify all steps completed:**
   - [ ] Supabase account created
   - [ ] Database initialized with init.sql
   - [ ] Backend `.env` created correctly
   - [ ] Frontend `.env` created correctly
   - [ ] `npm install` completed in both folders
   - [ ] Both servers running (npm run dev)

3. **Check network:**
   - Backend running: `curl http://localhost:5000/health`
   - Frontend: `http://localhost:5173` loads

4. **View logs:**
   - Backend: Terminal where `npm run dev` is running
   - Frontend: DevTools Console (F12)
   - Supabase: Dashboard → Logs

---

## ✅ Verification Checklist

- [ ] Node.js installed
- [ ] Supabase account created
- [ ] Database initialized
- [ ] Backend `.env` created
- [ ] Frontend `.env` created
- [ ] Backend running on :5000
- [ ] Frontend running on :5173
- [ ] Can login with admin account
- [ ] Can create product
- [ ] Can update inventory
- [ ] Dashboard loads without errors

---

## 🎓 Next Steps

Once setup is complete:

1. **Read README.md** for feature overview
2. **Check API_DOCS.md** for endpoint details
3. **Start Day 13 testing** with test checklist
4. **Deploy to Vercel** on Day 17

---

**Last Updated:** Day 13
**Questions?** Check README.md or API_DOCS.md

Good luck! 🚀
