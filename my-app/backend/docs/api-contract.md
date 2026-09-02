# Inventory API Contract

Base URL: `http://localhost:4000`
Content-Type: `application/json`

Interactive docs (Swagger): `http://localhost:4000/docs`

## Conventions

- All IDs are UUID strings.
- `price` is an integer (smallest currency unit, e.g. rupiah without decimals).
- Timestamps are ISO 8601 strings.
- Validation is strict: unknown properties are rejected (`forbidNonWhitelisted`).

### Common error shapes

| Status | When |
| ------ | ---- |
| `400 Bad Request` | DTO validation failed, unknown field sent, referenced category/supplier does not exist, or stock OUT quantity exceeds available stock. |
| `404 Not Found` | Resource with the given `id` does not exist. |
| `409 Conflict` | Unique constraint violation (duplicate category name / product SKU) or deleting a category/supplier that still has products attached. |

Validation error example:

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "price must not be less than 0"],
  "error": "Bad Request"
}
```

---

## Categories

### POST /categories
Create a category.

Request:
```json
{ "name": "Electronics", "description": "Phones, laptops, accessories" }
```

Response `201`:
```json
{
  "id": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
  "name": "Electronics",
  "description": "Phones, laptops, accessories",
  "createdAt": "2026-07-05T08:40:00.000Z",
  "updatedAt": "2026-07-05T08:40:00.000Z"
}
```

Errors: `400` (invalid body), `409` (name already exists).

### GET /categories
List all categories (sorted by name).

Response `200`:
```json
[
  {
    "id": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
    "name": "Electronics",
    "description": "Phones, laptops, accessories",
    "createdAt": "2026-07-05T08:40:00.000Z",
    "updatedAt": "2026-07-05T08:40:00.000Z"
  }
]
```

### GET /categories/:id
Get a single category.

Response `200`: same object as above.
Errors: `404`.

### PATCH /categories/:id
Update a category. Body is a partial of the create body.

Request:
```json
{ "description": "Consumer electronics" }
```

Response `200`: updated category object.
Errors: `400`, `404`, `409` (new name already exists).

### DELETE /categories/:id
Delete a category.

Response `200`:
```json
{ "id": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a", "deleted": true }
```

Errors: `404`, `409` (category still has products attached).

---

## Suppliers

### POST /suppliers
Create a supplier.

Request:
```json
{
  "name": "PT Sumber Makmur",
  "email": "sales@sumbermakmur.co.id",
  "phone": "+62211234567",
  "address": "Jl. Industri No. 10, Jakarta"
}
```
Only `name` is required; `email`, `phone`, `address` are optional.

Response `201`:
```json
{
  "id": "a1b2c3d4-0000-4000-8000-000000000001",
  "name": "PT Sumber Makmur",
  "email": "sales@sumbermakmur.co.id",
  "phone": "+62211234567",
  "address": "Jl. Industri No. 10, Jakarta",
  "createdAt": "2026-07-05T08:40:00.000Z",
  "updatedAt": "2026-07-05T08:40:00.000Z"
}
```

Errors: `400` (invalid body, e.g. malformed email).

### GET /suppliers
List all suppliers (sorted by name).

Response `200`: array of supplier objects.

### GET /suppliers/:id
Get a single supplier.

Response `200`: supplier object.
Errors: `404`.

### PATCH /suppliers/:id
Update a supplier. Body is a partial of the create body.

Response `200`: updated supplier object.
Errors: `400`, `404`.

### DELETE /suppliers/:id
Delete a supplier.

Response `200`:
```json
{ "id": "a1b2c3d4-0000-4000-8000-000000000001", "deleted": true }
```

Errors: `404`, `409` (supplier still has products attached).

---

## Products

A product must reference an existing `categoryId`. `supplierId` is optional.

### POST /products
Create a product.

Request:
```json
{
  "name": "iPhone 15",
  "sku": "IPH-15-128",
  "price": 15000000,
  "stock": 5,
  "minStock": 2,
  "categoryId": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
  "supplierId": "a1b2c3d4-0000-4000-8000-000000000001"
}
```
`stock` and `minStock` default to `0` if omitted. `supplierId` may be omitted or null.

Response `201`:
```json
{
  "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
  "name": "iPhone 15",
  "sku": "IPH-15-128",
  "price": 15000000,
  "stock": 5,
  "minStock": 2,
  "categoryId": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
  "supplierId": "a1b2c3d4-0000-4000-8000-000000000001",
  "createdAt": "2026-07-05T08:40:00.000Z",
  "updatedAt": "2026-07-05T08:40:00.000Z",
  "category": { "id": "ce6eb301-...", "name": "Electronics", "description": null, "createdAt": "...", "updatedAt": "..." },
  "supplier": { "id": "a1b2c3d4-...", "name": "PT Sumber Makmur", "email": null, "phone": null, "address": null, "createdAt": "...", "updatedAt": "..." }
}
```

Errors:
- `400` invalid body, or `categoryId` / `supplierId` does not exist.
- `409` SKU already in use.

### GET /products
List products with optional filters and pagination. Each item includes its `category` and `supplier`.

Query params (all optional):

| Param | Type | Description |
| ----- | ---- | ----------- |
| `search` | string | Case-insensitive match on product `name` or `sku`. |
| `categoryId` | UUID | Only products in this category. |
| `supplierId` | UUID | Only products from this supplier. |
| `lowStock` | boolean (`true`) | Only products where `stock <= minStock`. |
| `page` | integer (default `1`, min `1`) | Page number. |
| `limit` | integer (default `10`, min `1`, max `100`) | Items per page. |

Example: `GET /products?search=iphone&lowStock=true&page=1&limit=10`

Response `200` (paginated):
```json
{
  "data": [
    {
      "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
      "name": "iPhone 15",
      "sku": "IPH-15-128",
      "price": 15000000,
      "stock": 5,
      "minStock": 2,
      "categoryId": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
      "supplierId": "a1b2c3d4-0000-4000-8000-000000000001",
      "createdAt": "2026-07-05T08:40:00.000Z",
      "updatedAt": "2026-07-05T08:40:00.000Z",
      "category": { "id": "ce6eb301-...", "name": "Electronics" },
      "supplier": { "id": "a1b2c3d4-...", "name": "PT Sumber Makmur" }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Errors: `400` (invalid query param, e.g. malformed UUID).

### GET /products/:id
Get a single product with `category` and `supplier`.

Response `200`: product object.
Errors: `404`.

### PATCH /products/:id
Update a product. Body is a partial of the create body.

Request:
```json
{ "price": 14500000, "minStock": 3 }
```

Response `200`: updated product object (with relations).
Errors:
- `400` invalid body, or new `categoryId` / `supplierId` does not exist.
- `404` product not found.
- `409` new SKU already in use.

> Note: `stock` is managed through stock movements. Updating `stock` directly here is possible but not the intended flow.

### DELETE /products/:id
Delete a product.

Response `200`:
```json
{ "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d", "deleted": true }
```

Errors: `404`.

---

## Stock Movements

Stock changes are transactional: the movement record and the product's `stock` are updated together.

### POST /stock-movements/in
Increase a product's stock.

Request:
```json
{ "productId": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d", "quantity": 10, "note": "Restock from supplier" }
```
`quantity` must be an integer `>= 1`. `note` is optional.

Response `201`:
```json
{
  "movement": {
    "id": "727cfd9f-a630-4d92-9355-78f1e693dd87",
    "productId": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
    "type": "IN",
    "quantity": 10,
    "note": "Restock from supplier",
    "createdAt": "2026-07-05T08:40:01.567Z"
  },
  "product": {
    "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
    "name": "iPhone 15",
    "sku": "IPH-15-128",
    "price": 15000000,
    "stock": 15,
    "minStock": 2,
    "categoryId": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
    "supplierId": "a1b2c3d4-0000-4000-8000-000000000001",
    "createdAt": "2026-07-05T08:40:00.000Z",
    "updatedAt": "2026-07-05T08:40:01.567Z"
  }
}
```

Errors: `400` (invalid body), `404` (product not found).

### POST /stock-movements/out
Decrease a product's stock.

Request:
```json
{ "productId": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d", "quantity": 3, "note": "Sold" }
```

Response `201`: same shape as `/in`, with `movement.type = "OUT"` and the product's decreased `stock`.

Errors:
- `400` invalid body, or requested `quantity` is greater than current stock:
  ```json
  { "statusCode": 400, "message": "Insufficient stock: requested 9999, available 12", "error": "Bad Request" }
  ```
- `404` product not found.

### GET /stock-movements
List stock movements (newest first) with pagination. Each item includes its `product`.

Query params (all optional):

| Param | Type | Description |
| ----- | ---- | ----------- |
| `productId` | UUID | Only movements for this product. |
| `page` | integer (default `1`) | Page number. |
| `limit` | integer (default `10`, max `100`) | Items per page. |

Example: `GET /stock-movements?productId=b9e8e5e7-8eac-4c90-a59c-eebc6f17680d&page=1&limit=10`

Response `200` (paginated):
```json
{
  "data": [
    {
      "id": "bbbeb4c4-75d1-41d4-9191-0b1da1f20c60",
      "productId": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
      "type": "OUT",
      "quantity": 3,
      "note": "Sold",
      "createdAt": "2026-07-05T08:40:01.973Z",
      "product": {
        "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
        "name": "iPhone 15",
        "sku": "IPH-15-128",
        "price": 15000000,
        "stock": 12,
        "minStock": 2,
        "categoryId": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
        "supplierId": "a1b2c3d4-0000-4000-8000-000000000001",
        "createdAt": "2026-07-05T08:40:00.000Z",
        "updatedAt": "2026-07-05T08:40:01.973Z"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Errors: `400` (invalid `productId` format).

---

## Dashboard

### GET /dashboard/summary
Aggregated overview for the dashboard.

Response `200`:
```json
{
  "totalProducts": 1,
  "totalCategories": 1,
  "totalSuppliers": 0,
  "lowStockCount": 0,
  "totalStockValue": 12000,
  "recentMovements": [
    {
      "id": "bbbeb4c4-75d1-41d4-9191-0b1da1f20c60",
      "productId": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
      "type": "OUT",
      "quantity": 3,
      "note": null,
      "createdAt": "2026-07-05T08:40:01.973Z",
      "product": { "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d", "name": "iPhone 15", "sku": "IPH-15-128" }
    }
  ]
}
```

Field meanings:
- `totalProducts` / `totalCategories` / `totalSuppliers` — row counts.
- `lowStockCount` — number of products where `stock <= minStock`.
- `totalStockValue` — sum of `price * stock` across all products.
- `recentMovements` — the 5 most recent stock movements (newest first).

### GET /dashboard/low-stock-products
Products at or below their minimum stock (`stock <= minStock`), lowest stock first, each with `category` and `supplier`.

Query params:
- `limit` (optional, integer, default `5`, max `100`).

Response `200`:
```json
[
  {
    "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
    "name": "iPhone 15",
    "sku": "IPH-15-128",
    "price": 15000000,
    "stock": 1,
    "minStock": 5,
    "categoryId": "ce6eb301-24ff-4d53-a3d0-757902b2cf8a",
    "supplierId": null,
    "createdAt": "2026-07-05T08:40:00.000Z",
    "updatedAt": "2026-07-05T08:40:00.000Z",
    "category": { "id": "ce6eb301-...", "name": "Electronics" },
    "supplier": null
  }
]
```

### GET /dashboard/stock-trend
Daily stock-in vs stock-out totals over the last N days (UTC), oldest first. Every day in the range is present, even with zero activity.

Query params:
- `days` (optional, integer, default `14`, min `1`, max `90`).

Response `200`:
```json
[
  { "date": "2026-06-29", "in": 0, "out": 0 },
  { "date": "2026-06-30", "in": 0, "out": 0 },
  { "date": "2026-07-05", "in": 15, "out": 3 }
]
```

- `date` — UTC calendar day (`YYYY-MM-DD`).
- `in` — total quantity of `IN` movements that day.
- `out` — total quantity of `OUT` movements that day.

### GET /dashboard/top-stock-value
Products ranked by inventory value (`price * stock`), highest first.

Query params:
- `limit` (optional, integer, default `5`, max `100`).

Response `200`:
```json
[
  {
    "id": "b9e8e5e7-8eac-4c90-a59c-eebc6f17680d",
    "name": "iPhone 15",
    "sku": "IPH-15-128",
    "price": 3000,
    "stock": 12,
    "stockValue": 36000
  }
]
```

- `stockValue` — computed `price * stock`.
