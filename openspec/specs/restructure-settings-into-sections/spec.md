## Purpose
Reorganize the settings modal UI from a flat list into four semantic sections for better discoverability and reduced cognitive load, without changing the underlying settings data model or persistence.

## Requirements
### Requirement: Section Structure
The settings modal MUST render four `<section>` elements in this order:
1. **Screen** (Экран) — Theme, Font Size, Accent
2. **Volume** (Громкость) — Master, Music, Sound (each with on/off + slider)
3. **Language** (Язык) — Language selector (conditional)
4. **Text Highlight** (Подсветка текста) — Unseen highlight toggle, Reset history

#### Scenario: Screen Section Rendered
- **WHEN** the settings modal opens
- **THEN** a `<section aria-labelledby="ifk-section-screen-label">` exists containing:
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

### Requirement: Visual Separation
The settings modal SHALL render an `<hr>` element between each adjacent section and SHALL NOT render a trailing `<hr>` after the last section.

#### Scenario: Visual Separation Between Sections
- **WHEN** multiple sections are rendered
- **THEN** an `<hr>` element separates each adjacent section
- **THEN** no trailing `<hr>` after the last section

### Requirement: Accessibility
The settings modal SHALL ensure that any rendered section has `aria-labelledby` pointing to its `<h3>` id. When the modal title is `<h2>`, section headings SHALL use `<h3>` for correct heading hierarchy. When navigating with keyboard, all controls SHALL remain reachable (no collapsible sections to manage).

#### Scenario: Section Accessibility
- **WHEN** any section renders
- **THEN** the `<section>` has `aria-labelledby` pointing to its `<h3>` id

#### Scenario: Modal Title Heading Level
- **WHEN** the settings modal opens
- **THEN** the modal title is an `<h2>` and section headings are `<h3>`

#### Scenario: Keyboard Navigation Reachability
- **WHEN** navigating the settings modal with keyboard
- **THEN** all controls remain reachable

### Requirement: i18n Support
When `refreshSettingsModalI18n()` is called, section headings (`<h3>`) SHALL update to current language and `aria-labelledby` references SHALL remain valid.

#### Scenario: i18n Update Section Headings
- **WHEN** `refreshSettingsModalI18n()` is called
- **THEN** section headings (`<h3>`) update to current language

#### Scenario: i18n Update Aria-Labelledby
- **WHEN** `refreshSettingsModalI18n()` is called
- **THEN** `aria-labelledby` references remain valid

### Requirement: Existing Behavior Preserved
When any setting control changes, `commit()` SHALL be called with updated partial settings, settings SHALL apply immediately (no save button). When the Reset button is clicked, all settings SHALL revert to author defaults. When Export/Import is clicked, functionality SHALL work identically to before.

#### Scenario: Commit on Setting Change
- **WHEN** any setting control changes
- **THEN** `commit()` is called with updated partial settings

#### Scenario: Immediate Apply
- **WHEN** `commit()` is called with updated partial settings
- **THEN** settings apply immediately (no save button)

#### Scenario: Reset to Author Defaults
- **WHEN** Reset button clicked
- **THEN** all settings revert to author defaults

#### Scenario: Export/Import Functionality
- **WHEN** Export/Import clicked
- **THEN** functionality works identically to before