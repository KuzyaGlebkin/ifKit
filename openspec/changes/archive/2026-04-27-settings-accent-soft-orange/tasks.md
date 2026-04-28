## 1. Тип и таблица пресетов

- [x] 1.1 В `src/ifKit/settings.ts`: заменить `'violet'` на `'orange'` в `AccentPreset`, в `ACCENT_PRESETS` (мягкий оранжевый hex + согласованный `fg`), в `isAccentPreset`
- [x] 1.2 В той же точке слияния/нормализации: если из хранилища приходит `accent: 'violet'`, установить `accent: 'orange'`

## 2. Модалка и ключи UI

- [x] 2.1 В `src/ifKit/settings-modal.ts`: `data-accent-value="orange"`, `data-ifk-ui` и подписи через новый ключ
- [x] 2.2 В `src/ifKit/ui-keys.ts`: `settingsAccentViolet` → `settingsAccentOrange` (и значение ключа `ui.settingsAccentOrange`)
- [x] 2.3 В `src/ifKit/builtin-ui.ts` и `src/locales/*.ui.json` (включая `template.ui.json`): обновить ключи и тексты; для BY — оранжевый/мягко-оранжевый, не «фіялетавы»

## 3. Проверка

- [x] 3.1 `npm test` / `npm run build` (или существующий скрипт в проекте) без ошибок; вручную: ряд «Акцент», сейв со старым `violet` мигрирует в `orange`

## 4. Синхронизация спеков (при архивировании / по процессу репо)

- [x] 4.1 После внедрения — `openspec archive` (или согласованный шаг) для дельт в `openspec/specs/`, если в проекте так принято
