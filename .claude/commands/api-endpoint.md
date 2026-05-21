# api-endpoint — Express API Endpoint Scaffold

Scaffold a new Express REST endpoint following this project's **route → controller → service → DB** pattern.

## Usage
```
/api-endpoint <HTTP method> <path> <description>
```

## Examples
```
/api-endpoint GET /api/orders get all orders for the authenticated user
/api-endpoint POST /api/reviews create a product review
/api-endpoint DELETE /api/cart/:itemId remove an item from the user's cart
```

---

## Instructions

The user wants to create a new API endpoint. The argument is: **$ARGUMENTS**

Parse the argument to determine:
- **method** — HTTP verb (GET, POST, PUT, DELETE, PATCH)
- **path** — URL path including any `:params`
- **description** — what the endpoint does
- **auth required** — assume `true` unless the description says "public" or "no auth"

### Step 1 — Read existing files for context
Read these files before generating anything:
- `app.js` — to see registered routes
- One existing service (e.g. `src/services/product.service.js`) — to match SQL style
- One existing controller (e.g. `src/controllers/product.controller.js`) — to match error handling style
- `src/helpers/response.helper.js` — to confirm available response helpers
- `src/errors/AppError.js` — to confirm AppError signature

### Step 2 — Create service file

**`src/services/{resource}.service.js`** (or add to existing if resource service exists)
```js
const { pool } = require('../config/database');

// Use raw parameterized queries — no ORM
// $1, $2, $3 ... for parameters
async function exampleFn(userId, param) {
  const { rows } = await pool.query(
    'SELECT ... FROM table WHERE user_id = $1 AND col = $2',
    [userId, param]
  );
  return rows;
}

module.exports = { exampleFn };
```

Rules:
- Always use parameterized queries (`$1`, `$2`) — never string interpolation
- Return `rows` directly from SELECT; return `rows[0]` for single-row results
- Throw plain errors from service — let controller/middleware handle HTTP responses

### Step 3 — Create controller function

**`src/controllers/{resource}.controller.js`** (or add function to existing)
```js
const service = require('../services/{resource}.service');
const { success, created } = require('../helpers/response.helper');
const AppError = require('../errors/AppError');

async function handler(req, res, next) {
  try {
    // Extract from req.body, req.params, req.query, or req.user
    const data = await service.exampleFn(req.user.id, req.params.id);
    if (!data || data.length === 0) throw new AppError('Not found', 404);
    success(res, data);         // 200 with { success: true, data }
    // created(res, data);      // 201 for POST that creates a resource
  } catch (err) {
    next(err); // passed to global errorHandler.middleware.js
  }
}

module.exports = { handler };
```

### Step 4 — Create or update route file

**`src/routes/{resource}.route.js`** (or add route to existing)
```js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/{resource}.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply verifyToken to protected routes
router.get('/', verifyToken, ctrl.handler);

module.exports = router;
```

### Step 5 — Register route in app.js

Edit `app.js` to add:
```js
app.use('/api/{resource}', require('./src/routes/{resource}.route'));
```
Insert after the existing route registrations. Do not remove or reorder existing routes.

### Step 6 — Report

List every file created/modified with a one-line description of each change. Include the full endpoint path as it will appear in HTTP requests (e.g. `POST /api/reviews`).
