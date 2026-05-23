# CLAUDE.md — Node.js Backend

## Project Overview

Express.js REST API backend for a shoe e-commerce platform (`project-shoesb` frontend). Provides authentication, product catalog, shopping cart, payment processing, and user profile with image upload.

- **Runtime:** Node.js
- **Framework:** Express.js 4.18
- **Language:** JavaScript (CommonJS `require`/`module.exports` — no ESM)
- **Database:** PostgreSQL via `pg` (node-postgres) — no ORM, raw SQL
- **Auth:** JWT (`jsonwebtoken`) + bcrypt (`bcrypt`)
- **File uploads:** Multer → `uploads/` directory (served as static)
- **Logging:** Winston + `winston-daily-rotate-file`
- **Infrastructure:** Docker Compose (`docker-compose.db.yml`) — PostgreSQL on port 5433, Redis on port 6379
- **Default port:** 3000
- **Branch:** `master`

## Repository Structure

```
-node.js-backend/
├── src/
│   ├── server.js                   # Entry point — connects to DB, starts HTTP server
│   ├── app.js                      # Express app — middleware, route mounting
│   ├── modules/                    # Feature modules (routes → controller → service)
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── product/
│   │   │   ├── product.routes.js
│   │   │   ├── product.controller.js
│   │   │   └── product.service.js
│   │   └── user/
│   │       ├── user.routes.js
│   │       ├── user.controller.js
│   │       ├── user.model.js
│   │       └── user.service.js
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT Bearer token verification
│   │   ├── errorHandler.middleware.js  # Global error handler (catches AppError)
│   │   └── upload.middleware.js     # Multer single-file config
│   ├── database/
│   │   └── connection.js           # pg.Pool singleton
│   ├── config/
│   │   └── database.js             # DB connection config (reads from env)
│   ├── helpers/
│   │   ├── bcrypt.helper.js        # hashPassword / comparePassword
│   │   ├── jwt.helper.js           # signToken / verifyToken
│   │   └── response.helper.js      # success(res, data) / created(res, data)
│   ├── utils/
│   │   ├── date.util.js
│   │   └── pagination.util.js
│   ├── common/
│   │   ├── constants.js            # HTTP_STATUS object
│   │   └── errors.js               # AppError class
│   └── shared/
│       └── logger/
│           └── logger.js           # Winston logger instance
├── uploads/                        # Static file storage for profile images
├── docker-compose.db.yml
├── package.json
└── .gitignore
```

## Development Commands

```bash
npm start              # node src/server.js
```

No test runner is configured (`npm test` exits with an error). No linter configured.

## Local Setup

1. Start the database services:
   ```bash
   docker compose -f docker-compose.db.yml up -d
   ```
   This starts:
   - PostgreSQL at `localhost:5433` (user: `postgres`, password: `example`, db: `postgres`)
   - Redis at `localhost:6379` (password: `eYVX7EwVmmxxkKPCDmwMtyKVge8oLd2t81`)

2. Create a `.env` file with at least:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=example
   DB_NAME=postgres
   JWT_SECRET=<your-secret>
   ```

3. Run the server:
   ```bash
   npm start
   ```

## API Routes

### Public (no auth)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | Login — returns JWT token |
| POST | `/api/register` | Register new account |

### Protected (Bearer JWT required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/productbasketball` | All active basketball products |
| GET | `/api/productdetail/:productid` | Product + brand detail by ID |
| GET | `/api/productbrand/:brandid` | All products for a brand |
| GET | `/api/productstore/:productid` | Stock/sizes for a product |
| POST | `/api/productstore/bucket` | Get cart items by size IDs |
| POST | `/api/productstore/paybucket` | Process payment (deduct stock) |
| POST | `/api/search` | Search products by name (ILIKE) |
| POST | `/api/userprofile` | Get user profile |
| POST | `/api/uploads` | Upload profile image (multipart/form-data, field: `image`) |

Static files: `GET /uploads/<filename>` — served from the `uploads/` directory.

## Architecture Conventions

### Module Pattern
Every feature follows the same three-layer structure:
```
routes.js  →  controller.js  →  service.js  →  database/connection.js
```
- **Routes:** register Express Router endpoints and delegate to controller.
- **Controller:** extracts request params/body, calls service, sends response via `response.helper`.
- **Service:** contains all business logic and SQL queries using the `pg` pool.

### Error Handling
- Services throw `AppError` (from `src/common/errors.js`) for expected errors.
- The global `errorHandler.middleware.js` in `app.js` catches all errors and sends a JSON response.
- Never send raw error objects or stack traces to clients.

### Database
- All queries use parameterized placeholders (`$1, $2, ...`) — never string-interpolate user input.
- The `pg.Pool` singleton in `src/database/connection.js` is imported directly in services.
- No ORM — write plain SQL. Table names are lowercase (`account`, `productdetail`, `productstore`, etc.).

### Known Database Tables
| Table | Key Columns |
|-------|-------------|
| `account` | `account_id`, `user_id`, `username_hash`, `password_hash`, `email` |
| `productbasketball` | `record_status` (active rows have `record_status ILIKE '%A%'`) |
| `productbrand` | `brand_id` |
| `productdetail` | `product_id`, `brand_id`, `nameproduct`, `img`, `price`, `record_status` |
| `productstore` | `productsize_id`, `product_id`, `size`, `stock_size` |

### Auth
- JWT is signed with `JWT_SECRET` env var.
- Payload: `{ userId, username }`.
- Token format expected by `auth.middleware.js`: `Authorization: Bearer <token>`.
- Middleware sets `req.user` on success.

### Response Helpers
Always use `response.helper.js` in controllers:
```js
const { success, created } = require('../../helpers/response.helper');
success(res, data);        // 200 JSON
created(res, data);        // 201 JSON
```

### Logging
Import the Winston logger and use it instead of `console.log`:
```js
const logger = require('./shared/logger/logger');
logger.info('...');
logger.error('...');
```

## Adding a New Feature Module

1. Create `src/modules/<name>/` with `<name>.routes.js`, `<name>.controller.js`, `<name>.service.js`.
2. Register the router in `src/app.js` under the appropriate middleware chain.
3. Use `AppError` for domain errors, `response.helper` in the controller.

## Important Notes

- **No test suite.** When adding tests, a test runner (e.g. Jest) must be added as a dev dependency.
- **Redis** is in the Docker Compose file but not yet used in application code — it is reserved for future caching.
- **Uploads** are stored locally in `uploads/`. In production these should be moved to object storage.
- The `start:legacy` npm script points to `enviroment/app.js` (note the typo) which is not in the repository — ignore it.
- The `.gitignore` excludes `node_modules` and `.env`. Never commit the `.env` file.
