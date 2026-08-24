# Lifely AI

Accessible care management for members, caregivers, and administrators.

## Structure

- `apps/api` - Express REST API, TypeORM persistence, authorization
- `apps/web` - React/Vite client and role-aware navigation
- `packages/contracts` - shared API-safe types and role constants
- `docs` - architecture decisions and implementation guides

## Quick start

1. Install Node 22+ and pnpm 9+.
2. Copy `.env.example` to `.env` and set a real `JWT_SECRET`.
3. Run `docker compose up -d`.
4. Run `pnpm install`, then `pnpm dev`.

The API is served at `http://localhost:3000/api/v1`; the web app runs at `http://localhost:5173`.

## Architectural rules

- Add domain features under `apps/api/src/modules/<feature>`; do not put business logic in routes.
- All endpoints live under `/api/v1` and validate input at the boundary.
- Enforce access using roles *and* ownership/assignment checks in services.
- Keep browser-safe shared types in `packages/contracts`; never import database entities into the web app.
- Use migrations in production; `synchronize` stays disabled.
