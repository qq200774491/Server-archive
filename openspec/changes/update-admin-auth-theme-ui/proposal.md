# Change: Update admin auth, theme, and UI refresh

## Why
The admin portal currently relies on a shared token stored in a non-httpOnly cookie and does not support username/password login or credential rotation. The UI is visually minimal and has no light/dark theme support. The backend also lacks admin-focused capabilities beyond basic CRUD.

## What Changes
- Replace token-only admin auth with username/password login backed by password hashes and server-issued sessions.
- Add an admin settings flow to update username/password and rotate active sessions.
- Add admin-only system summary data to support a richer admin dashboard.
- Add light/dark/system theme support with persisted preference and a global toggle.
- Refresh public and admin UI (home, login, leaderboard, admin pages) with improved typography, layout, and responsive design.

## Impact
- Affected specs: admin-auth, admin-insights, ui-theme, ui-refresh
- Affected code: prisma schema, src/lib/auth, src/middleware.ts, src/app/admin, src/app/(dashboard), src/app/leaderboard, src/components
- Behavior: admin routes require session-based login; admin credentials can be updated; theme preference applies across all pages.
