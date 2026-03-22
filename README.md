# Amateur Kho-Kho Federation Gujarat

Full-stack app for player registration, events, news, and admin management.

## Features
- User auth (register/login with JWT)
- News & Events API (Supabase)
- Registration form with docs
- Admin dashboard (events, registrations, stats)
- React frontend + Tailwind + Vite
- Hono API backend (mounted via Express/Vite)
- **Supabase PostgreSQL database**

## Quick Setup

**Prerequisites:** Node.js 20+

1. **Install:**
   ```
   npm install
   ```

2. **Environment:**
   ```
   cp .env.example .env
   ```
   `.env.example` includes Supabase URL/Key and optional default admin credentials.

3. **Supabase Tables:** Run `supabase-schema.sql` in dashboard SQL editor.

4. **Development:**
   ```
   npm run dev
   ```
   ↗️ Open http://localhost:3000

5. **Production:**
   ```
   npm run build
   npm start
   ```

## API Endpoints (`http://localhost:3000/api`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ping` | Health check | - |
| GET | `/news` | List news | Public |
| GET | `/events` | List events | Public |
| POST | `/auth/register` | Create Player/Coach (Admin reserved) | - |
| POST | `/auth/login` | JWT token | - |
| POST | `/register` | Submit registration form | Public |
| GET `/admin/*` | Admin dashboard APIs | Stats, registrations, news/events CRUD | Admin JWT |

**Admin Login:** `admin@akkfg.com` / `admin123`
- Run updated `supabase-schema.sql` to seed.
- If the seed was skipped, the backend still accepts the default admin credentials from `.env`.
- Features: Approve registrations, manage tournaments/news, view stats.

## Database
**Primary:** Supabase Postgres (URL/Key in `.env`).
- Tables: `users`, `news`, `events`, `registrations`
- RLS policies enabled (public read, auth write)

**Legacy:** Local `database.sqlite` (unused, safe to delete).

## Scripts
- `npm run dev` - Dev server + HMR
- `npm run build` - Vite production build
- `npm run start` - Production server
- `npm run lint` - TypeScript check

## Deployment
**Render:** this repo includes [render.yaml](/Users/mihuldhakad/Downloads/amateur-kho-kho-federation-gujarat/render.yaml) for a single Node web service.

Build command:
```bash
npm install && npm run build
```

Start command:
```bash
npm start
```

Set these environment variables in Render:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

Enjoy managing Amateur Kho-Kho Federation Gujarat! 🥅🇮🇳
