# Store Rating Platform

A full-stack, production-ready web application built with Node.js, Express, Prisma ORM, PostgreSQL (Neon), and React (Vite) styled with Tailwind CSS.

---

## 🚀 Features

### 🔐 Unified Authentication & Authorization
- **Single Login Portal**: Unified `/login` route that automatically redirects users based on role:
  - **Administrator (`ADMIN`)** $\rightarrow$ `/admin`
  - **Normal User (`USER`)** $\rightarrow$ `/stores`
  - **Store Owner (`STORE_OWNER`)** $\rightarrow$ `/owner`
- **Role-based Access Control**: Server-enforced middleware verifying JWT and authorized roles for every protected endpoint.
- **Password Security**: Passwords hashed with bcryptjs (salt rounds 10+), never returned in responses.
- **Strict Validation**: Enforced on both frontend and backend using `express-validator`:
  - **Name**: 20 to 60 characters
  - **Address**: Maximum 400 characters
  - **Password**: 8 to 16 characters, at least one uppercase letter and at least one special character (`/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/`)
  - **Rating**: Integer between 1 and 5

---

### 👨‍💼 System Administrator
- **Dashboard**: High-level statistical cards displaying total registered users, total registered stores, and total submitted ratings.
- **User Management**:
  - Search and filter users by Name, Email, Address, and Role.
  - Sort table columns ascending/descending.
  - Create new users under any role (`ADMIN`, `USER`, `STORE_OWNER`).
  - View individual user profiles. For store owners, view their assigned store and store average rating.
- **Store Management**:
  - Filter and sort stores by Name, Email, Address, and Average Rating.
  - Create new stores and assign them to an unassigned store owner via a dynamic dropdown.

---

### 🛍️ Normal User
- **Self-Registration**: Sign up with personal details (role strictly set to `USER` on the server).
- **Store Directory**:
  - Browse all stores with average ratings, total review counts, and addresses.
  - Search stores by Name and Address.
  - Sort by Name or Average Rating.
- **Rating Submissions**:
  - Submit ratings (1 to 5 stars) using an interactive star component.
  - Modify existing ratings at any time (upsert logic guarantees one rating per user-store pair).
  - Instant UI feedback with average rating recalculation.
- **Account Security**: Update account password (requires verifying current password).

---

### 🏪 Store Owner
- **Store Dashboard**:
  - View overall store rating and total reviews received.
  - Customer review history table listing customer name, email, rating score, and date submitted.
  - In-table filtering and sorting.
- **Account Security**: Update account password at any time.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (CommonJS)
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech))
- **ORM**: Prisma 6.x (`@prisma/client`) with raw SQL check constraints
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **Validation**: `express-validator`
- **Security & Utilities**: `helmet`, `cors`, `morgan`, `dotenv`, `express-rate-limit`
- **Frontend**: React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide Icons

---

## 📦 Monorepo Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema & relationships
│   │   └── seed.js               # Idempotent database seeder
│   ├── src/
│   │   ├── config/               # Prisma client & environment validation
│   │   ├── controllers/          # Business logic (auth, admin, store, owner)
│   │   ├── middleware/           # auth, roleCheck, validate, errorHandler
│   │   ├── routes/               # API endpoint definitions
│   │   ├── utils/                # apiResponse, asyncHandler
│   │   ├── validators/           # express-validator rules
│   │   └── app.js                # Express app setup
│   ├── server.js                 # Server entry point
│   ├── .env.example              # Backend environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios instance with JWT interceptors
│   │   ├── components/           # Navbar, DataTable, StarRating, FormInput, Modal, etc.
│   │   ├── context/              # AuthContext (state, login, signup, logout)
│   │   ├── pages/                # Pages for all roles and workflows
│   │   ├── App.jsx               # Router & protected route definitions
│   │   └── main.jsx
│   ├── .env.example              # Frontend environment template
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)

Create a `.env` file in `/backend` based on `.env.example`:

```env
# Neon Connection Strings
DATABASE_URL="postgresql://<user>:<password>@<pooler-host>/neondb?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<direct-host>/neondb?sslmode=require"

# JWT Secret
JWT_SECRET="generate_a_secure_random_jwt_secret_key_minimum_32_characters"
JWT_EXPIRES_IN="1d"

# Server Configuration
PORT=5000
CLIENT_URL="http://localhost:5173"

# Default Administrator Seed
ADMIN_NAME="System Administrator Account"
ADMIN_EMAIL="admin@storerating.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_ADDRESS="100 Headquarters Boulevard, Suite 400, New York, NY 10001"
```

> **Required Manual Setup**:
> 1. Sign in to your [Neon Console](https://console.neon.tech).
> 2. Copy the **Pooled connection string** (with `sslmode=require`) into `DATABASE_URL`.
> 3. Copy the **Direct connection string** into `DIRECT_URL`.

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:5000/api"
VITE_SHOW_DEMO_LOGINS="true"
```

---

## 🚦 Quickstart Installation & Run

### 1. Install Dependencies
```bash
# In the backend directory:
cd backend
npm install

# In the frontend directory:
cd ../frontend
npm install
```

### 2. Run Database Migration & Seeding
```bash
cd backend
npx prisma migrate dev --name init

# Idempotent seeding (safe to run multiple times, updates without wiping)
npm run seed

# Full reset & re-seed (wipes all existing ratings, stores, and users then re-seeds)
npm run seed:reset
```

### 3. Start Backend API Server
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### 4. Start Frontend Client
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

---

## 🔑 Test Accounts

The platform comes pre-seeded with rich, realistic data conforming to all validation rules. You can log in manually or use the one-click **"Try a demo account"** buttons on the login page (`VITE_SHOW_DEMO_LOGINS=true`).

| Account Type | Role | Email | Password |
|---|---|---|---|
| **Main System Administrator** | `ADMIN` | `subrata24012005@gmail.com` | *(see backend/.env)* |
| **Demo Administrator** | `ADMIN` | `demo.admin@storerating.com` | `Demo@12345` |
| **Demo Store Owner** | `STORE_OWNER` | `demo.owner@storerating.com` | `Demo@12345` |
| **Demo Normal User** | `USER` | `demo.user@storerating.com` | `Demo@12345` |
| **Sample Store Owner** | `STORE_OWNER` | `owner1@storerating.com` | `Test@12345` |
| **Sample Normal User** | `USER` | `user1@storerating.com` | `Test@12345` |

> **Notes on Test Accounts**:
> - All other sample accounts (`ops.admin@storerating.com`, `support.admin@storerating.com`, `owner2@storerating.com` through `owner10@storerating.com`, and `user2@storerating.com` through `user20@storerating.com`) use the shared password **`Test@12345`**.
> - The three **Demo Accounts** (`demo.*@storerating.com` with password **`Demo@12345`**) are dedicated accounts configured for review and one-click demonstration purposes. Demo Store Owner manages a flagship store with 16 customer ratings; Demo Normal User has submitted ratings for 5 stores and left 6 stores unrated.
> - Seeding commands:
>   - `npm run seed`: Runs the idempotent seeder (`node prisma/seed.js`). Can also be invoked via `npx prisma db seed`.
>   - `npm run seed:reset`: Drops all ratings, stores, and users before running the seeder from scratch (`node prisma/seed.js --reset`). A clear console warning is printed before wiping.

---

## 📡 API Reference Summary

All endpoints are prefixed with `/api`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register normal user |
| `POST` | `/auth/login` | Public | Login for any role |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/auth/password` | Authenticated | Update user password |
| `GET` | `/admin/dashboard` | ADMIN | Stats (users, stores, ratings) |
| `GET` | `/admin/users` | ADMIN | Filter & sort all users |
| `POST` | `/admin/users` | ADMIN | Add user (ADMIN, USER, STORE_OWNER) |
| `GET` | `/admin/users/:id` | ADMIN | User details (+ store data if owner) |
| `GET` | `/admin/available-owners`| ADMIN | List store owners without a store |
| `GET` | `/admin/stores` | ADMIN | Filter & sort stores with avg ratings |
| `POST` | `/admin/stores` | ADMIN | Add store & assign to store owner |
| `GET` | `/stores` | Authenticated | Browse stores with rating info |
| `POST` | `/stores/:id/rating` | USER | Upsert 1-5 star store rating |
| `GET` | `/owner/dashboard` | STORE_OWNER | Store rating stats and rater table |
