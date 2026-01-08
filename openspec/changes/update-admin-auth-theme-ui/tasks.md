# Implementation Tasks

## 1. Data & Auth
- [x] 1.1 Add `AdminUser` model and migration
- [x] 1.2 Implement password hashing + session signing helpers
- [x] 1.3 Add admin login/logout/session endpoints
- [x] 1.4 Update middleware and admin API guards to require session auth

## 2. Admin Settings & Insights
- [x] 2.1 Add admin credential update endpoint with session rotation
- [x] 2.2 Add admin system summary endpoint (counts and latest activity)
- [x] 2.3 Add admin settings and overview UI pages

## 3. Theme System
- [x] 3.1 Add theme preference storage (light/dark/system)
- [x] 3.2 Add theme toggle UI in header and login/public pages

## 4. UI Refresh
- [x] 4.1 Redesign home page
- [x] 4.2 Redesign public leaderboard page
- [x] 4.3 Refresh admin portal pages (maps, players, archives, leaderboard, settings)
- [x] 4.4 Update navigation and mobile layout to match new visual system
- [x] 4.5 Update docs for new auth and theme behavior

## Validation
- [x] Admin login uses username/password and sets a secure session cookie
- [x] Admin credential update works and invalidates prior sessions
- [x] Theme toggle persists across reloads and follows system mode
- [x] Public and admin pages render correctly on desktop and mobile
- [x] Admin summary endpoint returns expected counts
