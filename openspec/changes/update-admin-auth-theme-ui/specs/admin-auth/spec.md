## ADDED Requirements

### Requirement: Admin login with username and password
The system SHALL authenticate administrators using a username and password and issue a server-managed session.

#### Scenario: Successful login
- **WHEN** a valid username and password are submitted
- **THEN** the system sets a secure admin session cookie and returns admin profile details

#### Scenario: Invalid credentials
- **WHEN** an invalid username or password is submitted
- **THEN** the system returns 401 and does not set a session

### Requirement: Admin session enforcement
The system SHALL protect admin routes and admin-only APIs using the admin session.

#### Scenario: Browser route protection
- **WHEN** an unauthenticated user requests an admin page
- **THEN** the system redirects to the admin login page

#### Scenario: API protection
- **WHEN** a request to an admin-only API lacks a valid admin session
- **THEN** the system returns 401

### Requirement: Admin credential management
The system SHALL allow an authenticated admin to update the username and password.

#### Scenario: Credential update
- **WHEN** the admin submits a valid update with the current password
- **THEN** the system stores a new password hash and rotates active sessions

### Requirement: Admin bootstrap account
The system SHALL provision an initial admin account from environment settings when no admin exists.

#### Scenario: First boot
- **WHEN** no admin record exists and required env vars are present
- **THEN** the system creates an admin account using the configured values
