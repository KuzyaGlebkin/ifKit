## ADDED Requirements

### Requirement: Decorative elements are hidden from assistive technologies
The system SHALL ensure that decorative or non-informative elements are not perceivable by assistive technologies such as screen readers.

#### Scenario: Screen reader ignores aria-hidden element
- **WHEN** a screen reader encounters an element with aria-hidden="true"
- **THEN** the screen reader does not announce the element or its children

#### Scenario: Visual presentation unchanged
- **WHEN** an element is marked with aria-hidden="true"
- **THEN** the element remains visible and retains its visual styling for sighted users