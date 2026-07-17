# EduCMS — Educational Content Management System (PostgreSQL edition)

Master's degree software engineering project: a full-featured CMS for educational institutions.
**Node.js / Express / PostgreSQL** backend + **React (Vite)** admin panel.
A MySQL edition of the same project also exists; both share an identical API and frontend.

## Implemented Features

- JWT authentication (access + refresh tokens, automatic renewal on the client)
- Role-based access control with 4 roles: `admin`, `editor`, `author`, `subscriber`
- Editorial workflow: an *author* writes drafts, only an *editor/admin* can publish
- Full CRUD: posts, hierarchical categories, tags, comments, media, users
- Comment moderation queue (pending / approved / spam / trash)
- Media library (Multer upload with type and size restrictions)
- Per-post SEO (meta title / description / keywords), unique slugs, computed reading time
- Activity log (audit trail) + statistics dashboard
- Optional Redis caching (automatically invalidated on writes)
- Security: Helmet, CORS, global rate limiting + brute-force protection on /auth,
  100% parameterized SQL queries (injection-safe), bcrypt password hashing,
  express-validator input validation
- OpenAPI/Swagger documentation served at `/api-docs`
- Jest unit tests (helpers + authentication middleware)

## Quick Start (local)

### 1. Database (PostgreSQL 13+)
```bash
createdb educms_db
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # then set DB_PASSWORD and the JWT secrets
npm install
npm run migrate             # creates the schema (tables, indexes, triggers, views)
npm run seed                # test accounts + sample data
npm run dev                 # http://localhost:5000
```
Test accounts: `admin@educms.com`, `editor@educms.com`, `author@educms.com` — password `Admin123!`

### 3. Frontend (admin panel)
```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000 (API proxied automatically)
```

### 4. Tests
```bash
cd backend && npm test
```

## Architecture

```
backend/    Express REST API (MVC: routes → controllers → models → PostgreSQL)
frontend/   React SPA (Vite): dashboard, posts, categories, tags,
            moderation, media, users
docs/       OpenAPI 3 specification
```

Normalized API response shape: `{ success, message, data, pagination? }`.

## Deployment (Heroku)

```bash
cd backend
heroku create educms-api
heroku addons:create heroku-postgresql:essential-0
heroku config:set NODE_ENV=production \
  JWT_SECRET=$(openssl rand -hex 32) \
  JWT_REFRESH_SECRET=$(openssl rand -hex 32) \
  FRONTEND_URL=https://your-frontend.vercel.app
git init && git add . && git commit -m "EduCMS backend"
git push heroku main
heroku run npm run migrate
heroku run npm run seed
```
The backend reads Heroku's `DATABASE_URL` automatically (SSL enabled in production).
Render and Railway also provide PostgreSQL with a `DATABASE_URL` and work the same way.

### Frontend
`npm run build`, then deploy `dist/` to Vercel/Netlify, adding a rewrite of
`/api/*` to the backend URL (or set `baseURL` in `src/api/client.js`).

> Note: platform disks are ephemeral — for persistent media storage in
> production, plug in S3-compatible object storage.

## License
MIT
