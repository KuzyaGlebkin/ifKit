## MODIFIED Requirements

### Requirement: Section Structure
The settings modal MUST render four `<section>` elements in this order:
1. **Screen** (Экран) — Theme, Font Size, Accent
2. **Volume** (Громкость) — Master, Music, Sound (each with on/off + slider)
3. **Language** (Язык) — Language selector (conditional)
4. **Text Highlight** (Подсветка текста) — Unseen highlight toggle, Reset history

The Screen section SHALL have the attribute `aria-hidden="true"` to hide it from assistive technologies and SHALL NOT have `aria-labelledby`.

#### Scenario: Screen Section Rendered
- **WHEN** the settings modal opens
- **THEN** a `<section>` exists with the attribute `aria-hidden="true"` and does NOT have `aria-labelledby="ifk-section-screen-label"`; and it contains:
  - `<h3 id="ifk-section-screen-label">Экран</h3>`
  - Theme segment buttons (light/dark/system)
  - Font size slider (0.8–1.4)
  - Accent segment buttons (default/blue/orange/emerald)

#### Scenario: Volume Section Rendered
- **WHEN** the settings modal opens
- **THEN** a `<section aria-labelledby="ifk-section-volume-label">` exists containing:
  - `<h3 id="ifk-section-volume-label">Громкость</h3>`
  - Master volume row: checkbox + slider (0–1)
  - Music volume row: checkbox + slider (0–1)
  - Sound volume row: checkbox + slider (0–1)

#### Scenario: Language Section Conditional
- **WHEN** the settings modal opens AND available languages ≥ 2
- **THEN** a `<section aria-labelledby="ifk-section-lang-label">` exists containing:
  - `<h3 id="ifk-section-lang-label">Язык</h3>`
  - Language selector buttons (auto + each language)
- **WHEN** available languages < 2
- **THEN** no Language section is rendered in the DOM

#### Scenario: Text Highlight Section Rendered
- **WHEN** the settings modal opens
- **THEN** a `<section aria-labelledby="ifk-section-highlight-label">` exists containing:
  - `<h3 id="ifk-section-highlight-label">Подсветка текста</h3>`
  - Unseen highlight checkbox
  - Reset seen history button

### Requirement: Accessibility
When any section renders, the `<section>` SHALL have `aria-labelledby` pointing to its `<h3>` id, except the Screen section which SHALL have `aria-hidden="true"` and SHALL NOT have `aria-labelledby`. When the modal title is `<h2>`, section headings SHALL use `<h3>` for correct heading hierarchy. When navigating with keyboard, all controls SHALL remain reachable (no collapsible sections to manage).

#### Scenario: Screen Section Accessibility (Screenreader Not Detected)
- **WHEN** the settings modal opens
- **THEN** the Screen section has `aria-hidden="true"` and does not have `aria-labelledby="ifk-section-screen-label"`

#### Scenario: Volume Section Accessibility
- **WHEN** the settings modal opens
- **THEN** the Volume section has `aria-labelledby="ifk-section-volume-label"`

#### Scenario: Language Section Accessibility (when present)
- **WHEN** the settings modal opens and available languages ≥ 2
- **THEN** the Language section has `aria-labelledby="ifk-section-lang-label"`

#### Scenario: Text Highlight Section Accessibility
- **WHEN** the settings modal opens
- **THEN** the Text Highlight section has `aria-labelledby="ifk-section-highlight-label"`

#### Scenario: Modal Title Heading Level
- **WHEN** the settings modal opens
- **THEN** the modal title is an `<h2>` and section headings are `<h3>`

#### Scenario: Keyboard Navigation Reachability
- **WHEN** navigating the settings modal with keyboard
- **THEN** all controls remain reachable

## ADDED Requirements
None

## REMOVED Requirements
None