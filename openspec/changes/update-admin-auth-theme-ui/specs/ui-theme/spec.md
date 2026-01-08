## ADDED Requirements

### Requirement: Theme preference
The system SHALL support light, dark, and system themes and persist the preference per browser.

#### Scenario: User selects a theme
- **WHEN** a user selects light or dark mode
- **THEN** the preference is saved and applied on subsequent visits

#### Scenario: System theme
- **WHEN** the user selects the system theme option
- **THEN** the UI follows the operating system light/dark setting

### Requirement: Global theme toggle
The system SHALL provide a theme toggle accessible from the public site and admin portal.

#### Scenario: Toggle from navigation
- **WHEN** a user toggles the theme from the global navigation
- **THEN** the theme updates across the current page without a full reload
