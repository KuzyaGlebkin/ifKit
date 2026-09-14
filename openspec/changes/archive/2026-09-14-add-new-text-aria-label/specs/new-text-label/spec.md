## ADDED Requirements

### Requirement: Screen reader announcement of new text
The system SHALL provide an accessible label for newly highlighted text so that screen readers can announce when text is new.

#### Scenario: Newly highlighted text is announced by screen reader
- **WHEN** the system highlights a previously unseen text element (by adding the 'paragraph--unseen' class)
- **THEN** an img element with aria-label set to the localized string for "New" is inserted immediately before the highlighted element
- **AND** the img element is visually hidden but accessible to screen readers