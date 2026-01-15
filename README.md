<<<<<<< HEAD
# BloomTech ERP — How to Run

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL (local instance)

## 1) Backend Setup
- Create a `.env` file in `backend/` with:
  - `PGHOST=localhost`
  - `PGUSER=postgres`
  - `PGPASSWORD=postgres`
  - `PGDATABASE=Bloomtech`
  - `PGPORT=5432`
- Install dependencies:
  - `cd backend`
  - `npm install`
- Create database tables:
  - Import `backend/src/databasse.sql` into the `Bloomtech` database (pgAdmin or `psql`)
- Seed the admin user:
  - `npm run seed:admin`
  - Username/Email: `admin` or `admin@example.com`
  - Password: `admin123`

## 2) Frontend Setup
- Install dependencies:
  - `cd client`
  - `npm install`

## 3) Run in Development
- Start the API:
  - `cd backend`
  - `npm run dev`
  - API: `http://localhost:3000`
- Start the frontend:
  - `cd client`
  - `npm run dev`
  - App: `http://localhost:5173`

## 4) Login
- At the login screen, use:
  - `admin` or `admin@example.com`
  - `admin123`

## Useful Commands
- Lint (client): `cd client && npm run lint`
- Build (client): `cd client && npm run build`
- Typecheck (backend): `cd backend && npm run typecheck`

## Troubleshooting
- Port conflicts: ensure only one backend on `3000` and one frontend on `5173`.
- Database connection errors: verify PostgreSQL is running and `.env` values.
- CORS: API has `cors()` enabled; frontend calls `http://localhost:3000`.
=======
# Bloomtech_ERP
# Bloomtech_ERP
>>>>>>> 0b666bf2f3f890bf407b36bc12617e0e4867e359
