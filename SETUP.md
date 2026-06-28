# Setup Guide

Complete instructions for installing and running the Inventory & Billing Management System locally.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v20+) - Download from https://nodejs.org
- **npm** (v10+) - Comes with Node.js
- **Git** - Download from https://git-scm.com
- **Supabase Account** - https://supabase.com (for database)

**Verify installation:**
```bash
node --version    # Should be v20+
npm --version     # Should be v10+
git --version     # Should be latest
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/toral-7/Inventory-Management.git
cd Inventory-Management
```

### 2. Get Supabase Credentials

1. Log in to **Supabase Dashboard**
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL** - You'll need this for `SUPABASE_URL`
   - **anon public key** - You'll need this for `SUPABASE_KEY`

---

## Backend Setup

### Step 1: Navigate to Backend

```bash
cd inventory-backend
```

### Step 2: Create `.env` File

Create a new file named `.env` in the `inventory-backend` folder:

```bash
# Windows (PowerShell)
New-Item -Name ".env" -ItemType File

# macOS/Linux
touch .env
```

### Step 3: Fill `.env` with Credentials

Edit `.env` and add:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-jwt-key-here
CORS_ORIGIN=http://localhost:5173
```

**Where:**
- `SUPABASE_URL` - From Supabase dashboard
- `SUPABASE_KEY` - From Supabase dashboard (anon public key)
- `JWT_SECRET` - Any random string (e.g., `my-super-secret-key-12345`)
- `CORS_ORIGIN` - Frontend local URL (for development)

### Step 4: Install Dependencies

```bash
npm install --legacy-peer-deps
```

This installs all required packages for the backend.

### Step 5: Verify Database Connection

```bash
npm run dev
```

**Expected output:**
```
✓ Server running on port 5000
✓ Connected to Supabase
```

If you see errors:
- Check Supabase credentials in `.env`
- Verify internet connection
- Ensure Supabase project is active

**Keep this terminal open!** The backend needs to run.

---

## Frontend Setup

### Step 1: Open New Terminal

Open a **new terminal/PowerShell window** and navigate to:

```bash
cd Inventory-Management/inventory-frontend
```

### Step 2: Create `.env` File

```bash
# Windows (PowerShell)
New-Item -Name ".env" -ItemType File

# macOS/Linux
touch .env
```

### Step 3: Fill `.env`

Edit `.env` and add:

```
VITE_API_URL=http://localhost:5000
```

This points frontend to your local backend.

### Step 4: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v8.1.0  ready in 886 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Access the Application

### In Your Browser

1. Open: **http://localhost:5173**
2. Login with:
   ```
   Email: admin@inventory.com
   Password: password123
   ```

**If login fails:**
- Check backend console for errors
- Verify `.env` files are correct
- Ensure both servers are running

---

## Project Structure

```
Inventory-Management/
├── inventory-backend/
│   ├── routes/              # API endpoints
│   ├── config/
│   │   └── supabase.js      # Database config
│   ├── server.js            # Express setup
│   ├── package.json
│   └── .env                 # Your credentials
│
├── inventory-frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env                 # API URL
│
├── README.md
├── API_DOCS.md
└── SETUP.md
```

---

## Database Setup

The database tables are **automatically created** when the backend connects to Supabase for the first time. 

**You don't need to run any SQL manually.**

### Create Test User (Required)

Run this ONE query in Supabase SQL Editor to create the login user:

```sql
INSERT INTO users (email, password_hash, name, role, status) 
VALUES (
  'admin@inventory.com',
  '$2a$10$TW5QyAHhcocnYbhWRHomIeiFIVuYe5bK5yYpmu.YC0M46a0bOJhuK', 
  'Admin User',
  'admin',
  'active'
);
```

**Login credentials:**
- Email: `admin@inventory.com`
- Password: `password123`
- If tables don't auto-create (rare), check that `SUPABASE_URL` and `SUPABASE_KEY` in `.env` are correct, then restart the backend.
---

## Running Both Servers

You need **two terminal windows/tabs:**

**Terminal 1 (Backend):**
```bash
cd inventory-backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd inventory-frontend
npm run dev
# Runs on http://localhost:5173
```

**Both must run simultaneously!**

---

## Troubleshooting

### Backend Won't Start

**Error:** `Missing Supabase credentials`
- Solution: Check `.env` file in `inventory-backend/`
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct

**Error:** `Cannot find module 'express'`
- Solution: Run `npm install --legacy-peer-deps` in `inventory-backend/`

### Frontend Won't Start

**Error:** `Cannot find module 'react'`
- Solution: Run `npm install --legacy-peer-deps` in `inventory-frontend/`

**Error:** `Failed to fetch from localhost:5000`
- Solution: Ensure backend is running
- Check `VITE_API_URL` in frontend `.env`

### Login Fails (401 Error)

**Error:** "Invalid credentials"
- Solution: Verify test user exists in database
- Re-create user with SQL query above
- Check password hash is correct

### Database Connection Error

**Error:** `Connection refused` or `Cannot reach Supabase`
- Verify internet connection
- Check Supabase project is active
- Verify credentials are correct
- Ensure RLS policies allow access (see [README.md](/README.md))

---

## Production Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to **vercel.com**
3. Import repository
4. Set `VITE_API_URL` environment variable
5. Deploy

### Backend (Render)

1. Go to **render.com**
2. Create new Web Service
3. Connect GitHub repo
4. Set environment variables (SUPABASE_URL, SUPABASE_KEY, PORT=10000)
5. Deploy

See [README.md](/README.md) for live URLs.

---

## Development Commands

**Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Backend:**
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start without nodemon
npm run build    # Build if applicable
```

---

## Next Steps

1. ✅ Local setup complete
2. 📖 Read API_DOCS.md for endpoint details
3. 🎨 Explore the UI at http://localhost:5173
4. 🔧 Modify and test features
5. 🚀 Deploy when ready (see [README.md](/README.md))

---

## Support

- **Frontend Issues:** Check browser console (F12)
- **Backend Issues:** Check terminal output
- **Database Issues:** Check Supabase dashboard
- **Deployment Issues:** See [README.md](/README.md) Troubleshooting

---

**Setup Complete!** 🎉

Your local development environment is ready. Start building!

---

**Last Updated:** June 28, 2026