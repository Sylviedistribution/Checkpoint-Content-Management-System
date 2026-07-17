# 🎓 EduCMS --- Educational Content Management System (PostgreSQL Edition)

> **Master's Degree Software Engineering Project**

A complete **Content Management System (CMS)** designed for educational
institutions.

This edition is powered by:

-   ⚙️ **Backend:** Node.js + Express + PostgreSQL
-   🎨 **Frontend:** React (Vite)

> A MySQL edition of the same project also exists. Both versions share
> the same REST API and frontend.

------------------------------------------------------------------------

# 🌐 Live Demo

  -----------------------------------------------------------------------------------------------------------------------
  Service                                       URL
  --------------------------------------------- -------------------------------------------------------------------------
  **Admin Panel**                               https://checkpoint-content-management-syste-hazel.vercel.app

  **REST API**                                  https://checkpoint-content-management-system-ml8d.onrender.com

  **Swagger Documentation**                     https://checkpoint-content-management-system-ml8d.onrender.com/api-docs

  **Health Check**                              https://checkpoint-content-management-system-ml8d.onrender.com/health
  -----------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 🔑 Test Accounts

**Password for all accounts**

``` text
Admin123!
```

  ------------------------------------------------------------------------
  Email               Role             Permissions
  ------------------- ---------------- -----------------------------------
  admin@educms.com    Admin            Full access (users, roles,
                                       settings, content)

  editor@educms.com   Editor           Publish posts, moderate comments,
                                       manage categories

  author@educms.com   Author           Create and edit drafts (cannot
                                       publish)
  ------------------------------------------------------------------------

> ⚠️ **Render Free Tier Notice**
>
> The backend is hosted on Render's free plan. If the API has been
> inactive for more than **15 minutes**, the first request may take
> **30--50 seconds** while the server wakes up.

------------------------------------------------------------------------

# ✨ Features

## 🔐 Authentication & Security

-   JWT Authentication (Access + Refresh Tokens)
-   Automatic token renewal
-   Role-Based Access Control (RBAC)
-   4 user roles:
    -   Admin
    -   Editor
    -   Author
    -   Subscriber

### Security

-   Helmet
-   CORS
-   Global Rate Limiting
-   Brute Force Protection
-   bcrypt Password Hashing
-   express-validator
-   Fully Parameterized SQL Queries (SQL Injection Safe)

------------------------------------------------------------------------

## 📝 Content Management

-   Complete CRUD for Posts
-   Hierarchical Categories
-   Tags
-   Comments
-   Media Library
-   Users Management

### Editorial Workflow

-   Authors create drafts
-   Editors/Admins publish content

### Comments

-   Pending
-   Approved
-   Spam
-   Trash

------------------------------------------------------------------------

## 📂 Media Library

-   Multer Uploads
-   File Type Validation
-   File Size Restrictions

------------------------------------------------------------------------

## 🚀 SEO Features

-   Meta Title
-   Meta Description
-   Keywords
-   Unique Slugs
-   Automatic Reading Time Calculation

------------------------------------------------------------------------

## 📊 Monitoring

-   Activity Log (Audit Trail)
-   Statistics Dashboard
-   Optional Redis Cache
-   Automatic Cache Invalidation

------------------------------------------------------------------------

## 📖 API Documentation

OpenAPI / Swagger documentation available at:

``` text
/api-docs
```

------------------------------------------------------------------------

## 🧪 Testing

-   Jest Unit Tests
-   Authentication Middleware Tests
-   Helper Function Tests

------------------------------------------------------------------------

# 🚀 Local Installation

## 1️⃣ PostgreSQL Database

``` bash
createdb educms_db
```

------------------------------------------------------------------------

## 2️⃣ Backend

``` bash
cd backend

cp .env.example .env

npm install

npm run migrate

npm run seed

npm run dev
```

Backend runs on:

``` text
http://localhost:5000
```

------------------------------------------------------------------------

## 3️⃣ Frontend

``` bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## 4️⃣ Run Tests

``` bash
cd backend

npm test
```

------------------------------------------------------------------------

# 🏗️ Project Structure

``` text
backend/
│
├── Express REST API
├── MVC Architecture
├── Routes
├── Controllers
├── Models
└── PostgreSQL

frontend/
│
├── React SPA
├── Dashboard
├── Posts
├── Categories
├── Tags
├── Media
├── Users
└── Moderation

docs/
└── OpenAPI Specification
```

------------------------------------------------------------------------

# 📦 Standard API Response

``` json
{
  "success": true,
  "message": "...",
  "data": {},
  "pagination": {}
}
```

------------------------------------------------------------------------

# ☁️ Deployment

## Infrastructure

  Layer      Platform             Description
  ---------- -------------------- -----------------------------
  Database   Render PostgreSQL    Managed PostgreSQL Instance
  Backend    Render Web Service   Express REST API
  Frontend   Vercel               React + Vite

------------------------------------------------------------------------

## Backend Deployment (Render)

### Step 1

Create a PostgreSQL instance on Render.

------------------------------------------------------------------------

### Step 2

Run database migration locally:

``` powershell
$env:NODE_ENV="production"

$env:DATABASE_URL="<External Database URL>"

npm run migrate

npm run seed
```

------------------------------------------------------------------------

### Step 3

Create a Render Web Service.

Configuration:

  Setting          Value
  ---------------- -------------
  Root Directory   backend
  Build Command    npm install
  Start Command    npm start

### Environment Variables

  Variable             Description
  -------------------- ------------------------------
  NODE_ENV             production
  DATABASE_URL         Internal Render Database URL
  JWT_SECRET           Random Secret
  JWT_REFRESH_SECRET   Random Secret
  FRONTEND_URL         Vercel URL

The backend automatically enables SSL when `DATABASE_URL` is detected in
production.

------------------------------------------------------------------------

# ▲ Frontend Deployment (Vercel)

The frontend already includes a **vercel.json** configuration that:

-   Rewrites `/api/*`
-   Rewrites `/uploads/*`
-   Enables React Router SPA fallback

Deployment Steps:

1.  Import the repository into Vercel.
2.  Select:

``` text
Root Directory = frontend
Preset = Vite
```

3.  Deploy.

4.  Copy the generated Vercel URL.

5.  Set that URL as:

``` text
FRONTEND_URL
```

inside your Render backend environment variables.


# 📄 License

**MIT License**
