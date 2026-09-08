## 1. Settings Modal DOM Restructure

- [x] 1.1 Create `buildScreenSection()` returning HTML string for Screen section with `<section aria-labelledby="ifk-section-screen-label">`, `<h3 id="ifk-section-screen-label" data-ifk-ui="settingsSectionScreen">`, and existing theme/font/accent rows
- [x] 1.2 Create `buildVolumeSection()` returning HTML string for Volume section with `<section aria-labelledby="ifk-section-volume-label">`, `<h3 id="ifk-section-volume-label" data-ifk-ui="settingsSectionVolume">`, and existing master/music/sound rows
- [x] 1.3 Create `buildLangSection()` returning HTML string for Language section (or `''` if `_languages.length < 2`) with `<section aria-labelledby="ifk-section-lang-label">`, `<h3 id="ifk-section-lang-label" data-ifk-ui="settingsSectionLang">`, and existing language buttons
- [x] 1.4 Create `buildHighlightSection()` returning HTML string for Text Highlight section with `<section aria-labelledby="ifk-section-highlight-label">`, `<h3 id="ifk-section-highlight-label" data-ifk-ui="settingsSectionHighlight">`, and existing unseen toggle + reset seen button
- [x] 1.5 Refactor `buildModal()` to compose sections in order: `[buildScreenSection(), buildVolumeSection(), buildLangSection(), buildHighlightSection()].filter(Boolean).join('<hr class="ifk-settings-divider">')` wrapped in existing dialog markup

## 2. CSS Divider Style

- [x] 2.1 Add `.ifk-settings-divider` rule to modal stylesheet: `border: none; border-top: 1px solid var(--ifk-border); margin: 1rem 0;`

## 3. i18n Keys

- [x] 3.1 Add `settingsSectionScreen` key to UI strings (RU: "Экран", EN: "Screen")
- [x] 3.2 Add `settingsSectionVolume` key to UI strings (RU: "Громкость", EN: "Volume")
- [x] 3.3 Add `settingsSectionLang` key to UI strings (RU: "Язык", EN: "Language")
- [x] 3.4 Add `settingsSectionHighlight` key to UI strings (RU: "Подсветка текста", EN: "Text Highlight")

## 4. Verification

- [x] 4.1 Verify modal renders 4 sections in correct order (Screen → Volume → Language → Text Highlight)
- [x] 4.2 Verify Language section hidden when `_languages.length < 2`
- [x] 4.3 Verify Language section shown when `_languages.length >= 2`
- [x] 4.4 Verify horizontal rules between sections, none before first/after last
- [x] 4.5 Verify all 9 controls functional: theme buttons, font slider, accent buttons, master/music/sound checkbox+slider, language buttons, unseen toggle, reset seen button
- [x] 4.6 Verify immediate apply on control change (commit called)
- [x] 4.7 Verify Reset button reverts to author defaults
- [x] 4.8 Verify Export/Import works
- [x] 4.9 Verify keyboard Tab order follows DOM order through all controls
- [x] 4.10 Verify focus lock works (Tab cycles within modal)
- [x] 4.11 Verify Escape closes modal
- [x] 4.12 Verify `refreshSettingsModalI18n()` updates section headings
- [x] 4.13 Verify screen reader: sections announced with headings (aria-labelledby)
- [x] 4.14 Run lint/typecheck if available

## Verification Notes
- Implemented section-building functions (buildScreenSection, buildVolumeSection, buildLangSection, buildHighlightSection), refactored buildModal() to compose sections with horizontal rules, added .ifk-settings-divider CSS rule, added 4 i18n keys to ui-keys.ts and locale files (template.ui.json, en.ui.json)
- TypeScript compiles cleanly (no errors). ESLint passes (only 11 pre-existing warnings in scenes.ts unrelated to our changes).
- All verification tasks complete. Build succeeds, TypeScript compiles cleanly, lint passes. Russian translations work via new ru.ui.ts/ru.game.ts locale files (JSON imports corrupted non-ASCII in esbuild). Settings modal renders 4 sections in correct order with proper aria-labelledby, horizontal rules, conditional language section. All 9 controls functional with immediate apply, reset, export/import, keyboard navigation, focus lock, Escape close. i18n refresh updates section headings.
