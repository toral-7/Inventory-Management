# API Documentation

**Base URL:** `https://inventory-management-teo6.onrender.com`

All endpoints require authentication except `/auth/login`.

---

## Authentication

### Login

**POST** `/auth/login`

Create a JWT token for authentication.

**Request:**
```json
{
  "email": "admin@inventory.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "admin@inventory.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Headers (all other requests):**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Products

### Get All Products

**GET** `/products`

Retrieve all products.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-1",
      "name": "Laptop",
      "category": "Electronics",
      "unit_price": 999.99,
      "supplier_id": "supp-1",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Product

**POST** `/products`

Add a new product. (Admin only)

**Request:**
```json
{
  "name": "Laptop",
  "category": "Electronics",
  "unit_price": 999.99,
  "supplier_id": "supp-1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "prod-1",
    "name": "Laptop",
    "category": "Electronics",
    "unit_price": 999.99,
    "supplier_id": "supp-1",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Update Product

**PUT** `/products/:id`

Update product details. (Admin only)

**Request:**
```json
{
  "name": "Laptop Pro",
  "unit_price": 1299.99
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod-1",
    "name": "Laptop Pro",
    "unit_price": 1299.99
  }
}
```

### Delete Product

**DELETE** `/products/:id`

Remove a product. (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Inventory

### Get Inventory

**GET** `/inventory`

Get inventory levels for all branches.

**Query Parameters:**
- `branch_id` (optional) - Filter by branch

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv-1",
      "branch_id": "branch-1",
      "product_id": "prod-1",
      "quantity_in_stock": 50,
      "last_restocked_at": "2024-01-20T08:00:00Z"
    }
  ]
}
```

### Update Inventory

**PUT** `/inventory/:id`

Update stock quantity.

**Request:**
```json
{
  "quantity_in_stock": 75
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "inv-1",
    "quantity_in_stock": 75,
    "last_restocked_at": "2024-01-21T10:00:00Z"
  }
}
```

---

## Bills

### Get All Bills

**GET** `/bills`

Retrieve bills with optional filters.

**Query Parameters:**
- `status` (optional) - Filter by status (draft, finalized, paid)
- `branch_id` (optional) - Filter by branch
- `start_date` (optional) - Start date (ISO 8601)
- `end_date` (optional) - End date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "bill-1",
      "bill_number": "BILL-2024-001",
      "branch_id": "branch-1",
      "user_id": "user-1",
      "status": "finalized",
      "subtotal": 1000.00,
      "discount_amount": 50.00,
      "tax_amount": 95.00,
      "total_amount": 1045.00,
      "created_at": "2024-01-15T10:30:00Z",
      "finalized_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

### Create Bill

**POST** `/bills`

Create a new bill draft.

**Request:**
```json
{
  "branch_id": "branch-1",
  "items": [
    {
      "product_id": "prod-1",
      "quantity": 2,
      "price_at_sale": 999.99,
      "item_discount": 50.00,
      "item_tax": 159.90
    }
  ],
  "discount_amount": 50.00,
  "tax_amount": 159.90
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "bill-1",
    "bill_number": "BILL-2024-001",
    "status": "draft",
    "total_amount": 2109.79,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Finalize Bill

**PUT** `/bills/:id/finalize`

Mark bill as finalized (ready for payment).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "bill-1",
    "status": "finalized",
    "finalized_at": "2024-01-15T10:35:00Z"
  }
}
```

### Delete Bill

**DELETE** `/bills/:id`

Remove a bill (draft only).

**Response (200):**
```json
{
  "success": true,
  "message": "Bill deleted successfully"
}
```

---

## Analytics

### Get Analytics Data

**GET** `/analytics`

Retrieve dashboard analytics with period filtering.

**Query Parameters:**
- `period` (required) - daily, monthly, yearly
- `start_date` (optional) - ISO 8601 format
- `end_date` (optional) - ISO 8601 format
- `branch_id` (optional) - Filter by branch

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_revenue": 50000.00,
    "total_bills": 150,
    "total_items_sold": 500,
    "average_bill_value": 333.33,
    "period": "monthly",
    "sales_by_date": [
      {
        "date": "2024-01-01",
        "revenue": 1500.00,
        "bills_count": 5
      }
    ],
    "top_products": [
      {
        "product_id": "prod-1",
        "product_name": "Laptop",
        "quantity_sold": 25,
        "revenue": 24999.75
      }
    ]
  }
}
```

---

## Suppliers

### Get All Suppliers

**GET** `/suppliers`

List all suppliers.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "supp-1",
      "name": "Tech Supplies Inc",
      "email": "contact@techsupplies.com",
      "phone": "+1-800-TECH"
    }
  ]
}
```

### Create Supplier

**POST** `/suppliers`

Add a new supplier. (Admin only)

**Request:**
```json
{
  "name": "Tech Supplies Inc",
  "email": "contact@techsupplies.com",
  "phone": "+1-800-TECH"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "supp-1",
    "name": "Tech Supplies Inc"
  }
}
```

---

## Settings

### Get System Settings

**GET** `/settings`

Retrieve system configuration.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "default_tax_rate": 18,
    "low_stock_threshold": 20,
    "reorder_level_default": 50,
    "currency": "Indian Rupee (₹)"
  }
}
```

### Update System Settings

**PUT** `/settings`

Update configuration. (Admin only)

**Request:**
```json
{
  "default_tax_rate": 10,
  "low_stock_threshold": 25,
  "currency": "Indian Rupee (₹)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "default_tax_rate": 10,
    "low_stock_threshold": 25
  }
}
```

### Get User Preferences

**GET** `/settings/preferences`

Get personal preferences for logged-in user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "timezone": "Asia/Kolkata",
    "date_format": "DD-MM-YYYY",
    "time_format": "24-hour"
  }
}
```

### Update User Preferences

**PUT** `/settings/preferences`

Update personal settings.

**Request:**
```json
{
  "timezone": "America/New_York",
  "date_format": "MM-DD-YYYY",
  "time_format": "12-hour"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "timezone": "America/New_York",
    "date_format": "MM-DD-YYYY"
  }
}
```

---

## Staff Management

### Get All Staff

**GET** `/staff`

List all users. (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "email": "staff@company.com",
      "name": "John Staff",
      "role": "staff",
      "branch_id": "branch-1",
      "status": "active"
    }
  ]
}
```

### Update Staff

**PUT** `/staff/:id`

Modify staff details. (Admin only)

**Request:**
```json
{
  "branch_id": "branch-2",
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-1",
    "branch_id": "branch-2",
    "status": "active"
  }
}
```

### Delete Staff

**DELETE** `/staff/:id`

Remove staff member. (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Staff deleted successfully"
}
```

---

## Error Responses

All errors follow this format:

**400 - Bad Request:**
```json
{
  "success": false,
  "error": "Invalid input: Missing required field 'name'"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**403 - Forbidden:**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

- API calls: Unlimited (no rate limiting implemented)
- Database connections: 10 concurrent connections

---

## Testing with cURL

**Login:**
```bash
curl -X POST https://inventory-management-teo6.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"password123"}'
```

**Get Products:**
```bash
curl -X GET https://inventory-management-teo6.onrender.com/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**API Version:** 1.0
**Last Updated:** June 28, 2026