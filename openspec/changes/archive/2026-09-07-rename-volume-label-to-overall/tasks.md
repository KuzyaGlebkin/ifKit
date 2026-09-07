## 1. Update Russian UI localization

- [x] 1.1 Update `src/locales/ru.ui.ts`: change `ui.settingsMasterVolume` value from `"Громкость"` to `"Общая"`.
- [x] 1.2 Update `src/locales/ru.ui.json`: change `ui.settingsMasterVolume` value from `"Громкость"` to `"Общая"`.

## 2. Update English UI localization

- [x] 2.1 Update `src/locales/en.ui.json`: change `ui.settingsMasterVolume` value from `"Volume"` to `"Master"`.

## 3. Verify consistency

- [x] 3.1 Search the codebase for hardcoded `"Громкость"` / `"Volume"` labels in Settings UI and replace with the localization key if found.
- [x] 3.2 Confirm that `ui.settingsSectionVolume` still reads `"Громкость"` (Russian section title) and `"Volume"` (English section title) — only the master volume control label changes.
