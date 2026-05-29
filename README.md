# Masjid Locator 

A full-stack web app to discover masjids around the world. Built with **Next.js 15 (App Router) + TypeScript + Prisma + SQLite + Tailwind + Leaflet/OpenStreetMap**.

## Features

- 🕌 Browse masjids on an interactive map (Leaflet + OpenStreetMap)
- 🔎 Search by name, city, country
- 🕒 Live prayer times for each masjid (Aladhan API — no key needed)
- ⭐ Community reviews (1–5 stars + comment)
- ❤️ Favorites — bookmark masjids you love
- 🧭 One-tap directions
- 👤 Sign up / log in (JWT + bcrypt + httpOnly cookies)
- ➕ Authenticated users can add new masjids

## Security hardening

- Passwords hashed with **bcrypt**.
- Auth uses **JWT in httpOnly, SameSite=Lax cookies** (no localStorage).
- All API input validated with **Zod**.
- **Rate limiting** on login/signup.
- **CSP + X-Frame-Options + nosniff + Referrer-Policy + Permissions-Policy** in [next.config.js](next.config.js).
- Constant-time-ish password verification (always runs bcrypt) on login.
- Prisma ORM = no SQL injection.
- `poweredByHeader` disabled.

## Quick start

```bash
npm install
cp .env.example .env          # then set a real JWT_SECRET
npm run setup                  # generates Prisma client, creates DB, seeds data
npm run dev
```

Open http://localhost:3000.

Demo admin (from seed): `admin@masjidlocator.dev` / `admin1234` — change in production.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run db:seed` — re-seed the database
- `npm run db:studio` — open Prisma Studio
