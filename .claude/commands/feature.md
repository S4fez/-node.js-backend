# feature — Full-Stack Feature Scaffold

Scaffold a complete feature end-to-end: Express backend endpoint(s) + Angular frontend component(s) together.

## Usage
```
/feature <feature description>
```

## Examples
```
/feature product reviews — users can leave star ratings and text reviews on product pages
/feature order history — users can view their past orders with status and items
/feature coupon code — apply a discount code at checkout
```

---

## Instructions

The user wants to build a new feature. The description is: **$ARGUMENTS**

### Step 1 — Analyze and plan

Break the feature into:
- **Backend**: what API endpoints are needed (method, path, auth required?)
- **Frontend**: what components/changes are needed (new page, widget, service update?)
- **Data**: what DB tables/columns are needed (if any)

Print a short plan (5–10 bullet points) and ask the user to confirm before writing any code.

### Step 2 — Backend (this repo: `-node.js-backend`)

For each endpoint, follow the route→controller→service→DB pattern:

**`src/services/{feature}.service.js`**
```js
const { pool } = require('../config/database');

async function getX(param) {
  const { rows } = await pool.query('SELECT ... WHERE id = $1', [param]);
  return rows;
}

module.exports = { getX };
```

**`src/controllers/{feature}.controller.js`**
```js
const service = require('../services/{feature}.service');
const { success, created } = require('../helpers/response.helper');
const AppError = require('../errors/AppError');

async function getX(req, res, next) {
  try {
    const data = await service.getX(req.params.id);
    if (!data) throw new AppError('Not found', 404);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getX };
```

**`src/routes/{feature}.route.js`**
```js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/{feature}.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, ctrl.getX);

module.exports = router;
```

Register in `app.js`: `app.use('/api/{feature}', require('./src/routes/{feature}.route'));`

### Step 3 — Frontend (repo: `project-shoesb`)

Create Angular component(s) following COURT design system:
- CSS variables: `--court-bg`, `--court-orange`, `--court-ink`, etc.
- Fonts: Anton for headings (`var(--font-display)`), Space Grotesk for body (`var(--font-body)`)
- HTTP calls via `HttpClient` with the `/api/` proxy path
- `AuthInterceptor` handles `Authorization` header automatically
- Declare new components in `src/app/app.module.ts`
- Add routes to `src/app/app-routing.module.ts` with `AuthGuard` if page requires login

### Step 4 — Report

List every file created/modified in both repos with a one-line description.
