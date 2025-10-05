
Wings Cafe - Fullstack Starter (React + Bootstrap frontend, Node + Express backend (Postgres))
=============================================================================================

What this archive contains
- frontend/  -> React app scaffold (src files, package.json). Uses Bootstrap CSS and axios.
- backend/   -> Node/Express API scaffold. Uses 'pg' to connect to Postgres via DATABASE_URL env var.
- db/        -> SQL schema to create required tables.
- .env.example -> example environment variables for Neon Postgres.
- README.md  -> this file.

Important:
- This is a starter scaffold. You need to run `npm install` in both frontend/ and backend/ folders.
- Configure your Neon / Postgres connection string in backend/.env or set DATABASE_URL environment variable.
- The frontend expects the backend API at the base URL defined in frontend/src/api.js (default: http://localhost:4000).
- To deploy to Neon, set DATABASE_URL to the provided Neon connection string and ensure the DB schema is applied (run SQL in db/create_tables.sql).

Quick local run
1. Backend:
   cd backend
   copy .env.example to .env and fill DATABASE_URL
   npm install
   npm run migrate   # runs the create_tables.sql via a small script (or run manually)
   npm start

2. Frontend:
   cd frontend
   npm install
   npm start

Deploy notes
- For production, you can host backend on Render/Railway/Heroku and set DATABASE_URL to Neon connection string.
- Frontend can be built (npm run build) and deployed to GitHub Pages, Vercel, Netlify, etc.

