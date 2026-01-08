## ADDED Requirements

### Requirement: Admin system summary endpoint
The system SHALL provide an admin-only summary endpoint that returns counts of maps, players, archives, and leaderboard entries plus latest activity timestamps.

#### Scenario: Request summary
- **WHEN** an authenticated admin requests the summary
- **THEN** the system returns the current counts and timestamps
