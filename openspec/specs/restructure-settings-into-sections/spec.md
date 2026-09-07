## Purpose
Reorganize the settings modal UI from a flat list into four semantic sections for better discoverability and reduced cognitive load, without changing the underlying settings data model or persistence.

## ADDED Requirements

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
- **WHEN** multiple sections are rendered
- **THEN** an `<hr>` element separates each adjacent section
- **THEN** no trailing `<hr>` after the last section

### Requirement: Accessibility
- **WHEN** any section renders
- **THEN** the `<section>` has `aria-labelledby` pointing to its `<h3>` id
- **WHEN** the modal title is `<h2>`
- **THEN** section headings use `<h3>` for correct heading hierarchy
- **WHEN** navigating with keyboard
- **THEN** all controls remain reachable (no collapsible sections to manage)

### Requirement: i18n Support
- **WHEN** `refreshSettingsModalI18n()` is called
- **THEN** section headings (`<h3>`) update to current language
- **THEN** `aria-labelledby` references remain valid

### Requirement: Existing Behavior Preserved
- **WHEN** any setting control changes
- **THEN** `commit()` is called with updated partial settings
- **THEN** settings apply immediately (no save button)
- **WHEN** Reset button clicked
- **THEN** all settings revert to author defaults
- **WHEN** Export/Import clicked
- **THEN** functionality works identically to before

## UNCHANGED Requirements
- Settings data model (`Settings` interface in `settings.ts`)
- Storage schema and persistence (`loadSettings`, `saveSettings`)
- Default values (`engineDefaults`, author overrides)
- `applySettings()` DOM mutations (theme, font-size, accent CSS vars)
- Audio sync (`setMusicVolume`, `setSoundVolume`, etc.)
- Focus lock and modal open/close behavior
- Language conditional display logic (≥2 languages)
