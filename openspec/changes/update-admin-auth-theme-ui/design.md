## Context
The admin portal currently authenticates via a shared token stored in a non-httpOnly cookie. There is no username/password login, no credential rotation, and no admin settings page. The UI is minimal and has no light/dark theme toggle. The backend lacks admin-focused summary data for a richer dashboard.

## Goals / Non-Goals
- Goals: secure username/password admin login; session-based auth; admin credential updates; light/dark/system theme support; refreshed public/admin UI; admin summary data.
- Non-Goals: multi-tenant RBAC, external OAuth, full audit logging, or real-time analytics.

## Decisions
- Data model: add an `AdminUser` table with unique username, password hash, session version, and timestamps.
- Password hashing: use Node `crypto.scrypt` with a per-user random salt and constant-time comparison.
- Sessions: issue a signed, httpOnly `admin_session` cookie containing admin id, session version, and expiry; sign with `ADMIN_SESSION_SECRET`.
- Bootstrap: if no admin exists, create one using `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars.
- Admin auth guard: add a server-side `requireAdminSession` helper and update middleware to enforce sessions on `/admin/*` routes and admin APIs.
- Theme: store preference in a cookie (and localStorage for client hydration); apply to `<html>` with an early inline script to avoid flashes.
- UI refresh: introduce a new visual system (fonts, spacing, color tokens, layout) across home, login, public leaderboard, and admin pages.

## Risks / Trade-offs
- Session rotation requires invalidating existing cookies after credential updates (sessionVersion strategy).
- Theme preference must avoid FOUC; incorrect initialization can cause flicker.
- Removing `ADMIN_TOKEN` is a breaking change for existing admin tooling.

## Migration Plan
1. Add new Prisma migration for `AdminUser`.
2. Add new env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
3. Implement login, logout, and session validation; update middleware and admin APIs.
4. Build admin settings UI for credential updates and rotate sessions.
5. Refresh UI and add theme toggle across pages.
6. Update docs to describe new auth and theme behavior.

## Open Questions
- Should we allow multiple admin accounts or keep a single admin?
- Should we keep `ADMIN_TOKEN` as a temporary fallback during migration?
- What password complexity rules are acceptable for this deployment?
