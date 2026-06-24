# 📡 API Documentation

Complete reference for all backend endpoints. All requests require `Authorization: Bearer <token>` header (except login).

---

## **Base URL**
```
http://localhost:5000
```

## **Response Format**

All responses are JSON:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## **Error Format**
```json
{
  "success": false,
  "error": "Error description"
}
```

---

# 🔐 Authentication Endpoints

## **POST /auth/register**

Register a new user account.

**Request:**
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@inventory.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "staff"  // "admin" or "staff"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@inventory.com",
    "name": "John Doe",
    "role": "staff"
  }
}
```

**Errors (400):**
- Email already exists
- Invalid email format
- Weak password
- Missing required fields

---

## **POST /auth/login**

Login and get JWT token.

**Request:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@inventory.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@inventory.com",
    "name": "Admin User",
    "role": "admin",
    "branch_id": "uuid"
  }
}
```

**Errors (401):**
- Invalid email
- Incorrect password
- User not found

---

## **GET /auth/user**

Get current authenticated user's data.

**Request:**
```bash
GET /auth/user
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@inventory.com",
    "name": "Admin User",
    "role": "admin",
    "branch_id": "uuid"
  }
}
```

**Errors (401):**
- No token provided
- Invalid token
- Token expired

---

# 📦 Products Endpoints

## **GET /products**

Get all products (paginated, filterable).

**Request:**
```bash
GET /products
GET /products?supplier_id=uuid
Authorization: Bearer <token>
```

**Query Parameters:**
- `supplier_id` (optional) - Filter by supplier

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "products": [
    {
      "id": "uuid",
      "name": "Laptop",
      "base_price": "50000.00",
      "category": "Electronics",
      "reorder_level": 5,
      "created_at": "2024-06-01T10:00:00Z",
      "supplier": {
        "id": "uuid",
        "name": "Tech Suppliers Inc",
        "email": "contact@techsuppliers.com",
        "phone": "9876543210",
        "lead_time_days": 5
      }
    }
  ]
}
```

---

## **GET /products/:id**

Get single product details.

**Request:**
```bash
GET /products/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "Laptop",
    "base_price": "50000.00",
    "category": "Electronics",
    "reorder_level": 5,
    "created_at": "2024-06-01T10:00:00Z",
    "supplier": {
      "id": "uuid",
      "name": "Tech Suppliers Inc"
    }
  }
}
```

**Errors (404):**
- Product not found

---

## **POST /products**

Create new product. **Admin only.**

**Request:**
```bash
POST /products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Laptop",
  "base_price": 50000,
  "category": "Electronics",
  "reorder_level": 5,
  "supplier_id": "uuid"  // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "new-uuid",
    "name": "Laptop",
    "base_price": "50000.00",
    "category": "Electronics",
    "reorder_level": 5,
    "supplier": null
  }
}
```

**Validation Errors (400):**
- Missing name
- base_price must be positive number
- reorder_level must be non-negative integer

**Permission Errors (403):**
- Only admins can create products

---

## **PUT /products/:id**

Update product. **Admin only.**

**Request:**
```bash
PUT /products/uuid
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Gaming Laptop",
  "base_price": 75000,
  "category": "Gaming",
  "reorder_level": 3,
  "supplier_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": "uuid",
    "name": "Gaming Laptop",
    "base_price": "75000.00",
    "category": "Gaming",
    "reorder_level": 3
  }
}
```

**Errors:**
- 404: Product not found
- 403: Only admins can update
- 400: Invalid data

---

## **DELETE /products/:id**

Delete product. **Admin only.**

**Request:**
```bash
DELETE /products/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product 'Laptop' deleted successfully"
}
```

**Errors:**
- 404: Product not found
- 403: Only admins can delete
- 400: Cannot delete if has related inventory

---

# 📋 Inventory Endpoints

## **GET /inventory**

Get inventory items with branch filtering.

**Request:**
```bash
GET /inventory
GET /inventory?branch_id=uuid
Authorization: Bearer <token>
```

**Query Parameters:**
- `branch_id` (optional) - Admin can filter by branch, staff sees only their branch

**Response (200):**
```json
{
  "success": true,
  "count": 20,
  "branch_filter": "uuid or all",
  "inventory": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Laptop",
        "reorder_level": 5,
        "base_price": "50000.00"
      },
      "branch": {
        "id": "uuid",
        "name": "Main Store",
        "location": "Mumbai"
      },
      "quantity_in_stock": 8,
      "status": "ok",
      "last_restocked_at": "2024-06-20T10:00:00Z"
    }
  ]
}
```

**Status Values:**
- `ok` - Quantity ≥ reorder_level
- `low_stock` - Quantity < reorder_level

---

## **GET /inventory/:id**

Get single inventory entry.

**Request:**
```bash
GET /inventory/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "inventory": {
    "id": "uuid",
    "product": { ... },
    "branch": { ... },
    "quantity_in_stock": 8,
    "status": "ok"
  }
}
```

---

## **PUT /inventory/:id**

Update stock quantity.

**Request:**
```bash
PUT /inventory/uuid
Content-Type: application/json
Authorization: Bearer <token>

{
  "quantity_in_stock": 15
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "inventory": {
    "id": "uuid",
    "quantity_in_stock": 15,
    "status": "ok",
    "last_restocked_at": "2024-06-23T10:00:00Z"
  }
}
```

**Validation Errors (400):**
- quantity_in_stock must be non-negative integer
- Exceeds maximum allowed (1,000,000)

**Permission Errors (403):**
- Staff can only update their branch inventory

---

## **GET /inventory/alerts/low-stock**

Get low-stock items and alerts.

**Request:**
```bash
GET /inventory/alerts/low-stock
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "low_stock_items": [
    {
      "alert_id": "uuid",
      "product_name": "Laptop",
      "product_id": "uuid",
      "current_stock": 2,
      "reorder_level": 5,
      "shortage": 3,
      "branch": "Main Store",
      "supplier": {
        "id": "uuid",
        "name": "Tech Suppliers",
        "email": "contact@techsuppliers.com",
        "lead_time_days": 5
      }
    }
  ]
}
```

---

# 🧾 Bills Endpoints

## **GET /bills**

Get all bills.

**Request:**
```bash
GET /bills
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "bills": [
    {
      "id": "uuid",
      "bill_number": "BILL-001",
      "total_amount": "1180.00",
      "status": "draft",
      "created_at": "2024-06-23T10:00:00Z",
      "created_by": "Admin User"
    }
  ]
}
```

**Status Values:**
- `draft` - Bill being created
- `finalized` - Bill locked, cannot be modified

---

## **GET /bills/:id**

Get bill details with items.

**Request:**
```bash
GET /bills/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "bill": {
    "id": "uuid",
    "bill_number": "BILL-001",
    "branch_id": "uuid",
    "user_id": "uuid",
    "subtotal": "1000.00",
    "tax_amount": "180.00",
    "discount_amount": "0.00",
    "total_amount": "1180.00",
    "status": "draft",
    "created_at": "2024-06-23T10:00:00Z",
    "bill_items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Laptop"
        },
        "quantity": 2,
        "price_at_sale": "50000.00",
        "item_discount": 0,
        "item_tax": "180.00"
      }
    ]
  }
}
```

---

## **POST /bills**

Create new bill.

**Request:**
```bash
POST /bills
Content-Type: application/json
Authorization: Bearer <token>

{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "item_discount": 10
    },
    {
      "product_id": "uuid2",
      "quantity": 1,
      "item_discount": 0
    }
  ],
  "tax_rate": 18
}
```

**Item Fields:**
- `product_id` (required) - Product UUID
- `quantity` (required) - Positive integer
- `item_discount` (optional) - Discount percentage (0-100)

**Response (201):**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "bill": {
    "id": "uuid",
    "bill_number": "BILL-002",
    "total_amount": "1180.00",
    "status": "draft",
    "bill_items": [...]
  }
}
```

**Validation Errors (400):**
- At least one product required
- Invalid product_id
- Insufficient stock
- Invalid tax_rate

---

## **PUT /bills/:id/finalize**

Lock/finalize bill (cannot be edited after).

**Request:**
```bash
PUT /bills/uuid/finalize
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bill finalized successfully",
  "bill": {
    "id": "uuid",
    "bill_number": "BILL-001",
    "status": "finalized",
    "finalized_at": "2024-06-23T10:30:00Z"
  }
}
```

**Errors (400):**
- Bill already finalized
- Bill not found

---

## **DELETE /bills/:id**

Delete draft bill only.

**Request:**
```bash
DELETE /bills/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bill 'BILL-001' deleted successfully"
}
```

**Errors:**
- 404: Bill not found
- 400: Cannot delete finalized bill

---

# 📊 Analytics Endpoints

## **GET /analytics/dashboard**

Get dashboard summary and top products.

**Request:**
```bash
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "revenue": {
      "total": "150000.00",
      "period": "30 days",
      "currency": "₹"
    },
    "bills": {
      "total": 45,
      "period": "30 days"
    },
    "inventory": {
      "low_stock_count": 3,
      "health": {
        "total_items": 50,
        "ok": 47,
        "low_stock": 3
      }
    },
    "products": {
      "total": 25
    },
    "top_products": [
      {
        "product_id": "uuid",
        "product_name": "Laptop",
        "total_revenue": "100000.00",
        "total_quantity": 2
      }
    ]
  }
}
```

---

## **GET /analytics/forecast**

Get 30-day stock forecast.

**Request:**
```bash
GET /analytics/forecast
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "forecast": {
    "period": "30 days",
    "total_products": 50,
    "critical_products": 2,
    "warning_products": 5,
    "products": [
      {
        "product_id": "uuid",
        "product_name": "Laptop",
        "current_stock": 2,
        "reorder_level": 5,
        "avg_daily_sales": "0.50",
        "days_until_stockout": 4,
        "will_stockout_30days": true,
        "status": "critical"
      }
    ]
  }
}
```

**Status Values:**
- `critical` - ≤ 10 days until stockout
- `warning` - ≤ 20 days until stockout
- `ok` - > 20 days until stockout

**Note:** Requires sales_logs data. Without sales history, all show as "ok".

---

## **GET /analytics/monthly-report**

Get monthly revenue report.

**Request:**
```bash
GET /analytics/monthly-report
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "monthly_report": {
    "year": 2024,
    "total_revenue": "1500000.00",
    "total_bills": 120,
    "average_monthly_revenue": "125000.00",
    "monthly_data": [
      {
        "month": "Jan",
        "revenue": "120000.00",
        "bills": 15
      },
      {
        "month": "Feb",
        "revenue": "130000.00",
        "bills": 18
      }
    ]
  }
}
```

---

# 🏢 Branches Endpoints

## **GET /branches**

Get all branches.

**Request:**
```bash
GET /branches
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "branches": [
    {
      "id": "uuid",
      "name": "Main Store",
      "location": "Mumbai",
      "created_at": "2024-06-01T10:00:00Z"
    }
  ]
}
```

---

## **POST /branches**

Create branch. **Admin only.**

**Request:**
```bash
POST /branches
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "South Branch",
  "location": "Bangalore"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Branch created successfully",
  "branch": {
    "id": "uuid",
    "name": "South Branch",
    "location": "Bangalore"
  }
}
```

---

## **PUT /branches/:id**

Update branch. **Admin only.**

---

## **DELETE /branches/:id**

Delete branch. **Admin only.**

---

# 🚚 Suppliers Endpoints

## **GET /suppliers**

Get all suppliers.

**Request:**
```bash
GET /suppliers
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "suppliers": [
    {
      "id": "uuid",
      "name": "Tech Suppliers Inc",
      "contact_person": "Rajesh Kumar",
      "email": "rajesh@techsuppliers.com",
      "phone": "9876543210",
      "lead_time_days": 5,
      "created_at": "2024-06-01T10:00:00Z"
    }
  ]
}
```

---

## **POST /suppliers**

Create supplier. **Admin only.**

**Request:**
```bash
POST /suppliers
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Tech Suppliers Inc",
  "contact_person": "Rajesh Kumar",
  "email": "rajesh@techsuppliers.com",
  "phone": "9876543210",
  "lead_time_days": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "supplier": {
    "id": "uuid",
    "name": "Tech Suppliers Inc",
    "contact_person": "Rajesh Kumar",
    "email": "rajesh@techsuppliers.com",
    "phone": "9876543210",
    "lead_time_days": 5
  }
}
```

---

## **PUT /suppliers/:id**

Update supplier. **Admin only.**

---

## **DELETE /suppliers/:id**

Delete supplier. **Admin only.**

**Error (400):** Cannot delete if supplier has linked products.

---

# ⚠️ Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

# 🔑 Headers

**Required for all endpoints (except /auth/login and /auth/register):**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

**Last Updated:** Day 13
**Version:** 1.0
