## ADDED Requirements

### Requirement: Scene-based highlight control
The system SHALL suppress text highlight for scenes that have not been shown before, preserving the existing highlight behavior for known scenes.

#### Scenario: First-time scene load
- **WHEN** a scene is loaded and its `hasBeenShown` flag is false
- **THEN** the system skips applying the highlight overlay to all text rendered in that scene

#### Scenario: Known scene (shown previously)
- **WHEN** a scene is loaded and its `hasBeenShown` flag is true
- **THEN** the system applies the existing highlight logic to text as if no change were made

#### Scenario: Scene revisited after being hidden
- **WHEN** a scene that was previously shown is hidden and later shown again
- **THEN** the system treats it as a known scene and applies the existing highlight logic (flag remains true)

#### Scenario: Explicit reset of scene flag
- **WHEN** the `hasBeenShown` flag for a scene is intentionally reset (e.g., via configuration or timeout)
- **THEN** the next load of that scene is treated as a first-time scene and highlight is suppressed