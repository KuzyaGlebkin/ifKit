## 1. Скрипт `extract-ui` и npm

- [x] 1.1 Реализовать `scripts/extract-ui-i18n.mjs` (или аналог): обход/импорт канона `UiKey`, обновление каждого `src/locales/<code>.ui.json` для `<code>`, у которого уже есть `*.game.json` (или согласованный список из `game.ts` / glob `*.game.json`); новые ключи с `""`, существующие значения сохранять.
- [x] 1.2 Подключить в `package.json` (`i18n:extract-ui` и/или слияние в `i18n:extract`) и в цепочку `build` / `build:tauri-web` **рядом** с существующим `i18n:extract`, без нарушения контракта `extract-game-i18n.mjs` для `*.game.json`.

## 2. Файлы локалей и `game.ts`

- [x] 2.1 Для каждого существующего `src/locales/<code>.game.json` добавить `<code>.ui.json` (наполнение через скрипт из п.1).
- [x] 2.2 Перевести `defineGame` в шаблоне на `LocaleBundle`: импорты `*Ui` и `locales: { <code>: { game, ui } }` для всех объявленных языков.

## 3. Документация

- [x] 3.1 В `docs` описать: пара `game`/`ui` JSON; что fallback на `en` в chrome для языка **без** `BUILTIN_UI[code]` исчезает по мере заполнения `*.ui.json`; отличие от `i18n:extract` для `t`.
- [x] 3.2 Упомянуть, что **любой** новый `<code>.game.json` **должен** сопровождаться `<code>.ui.json` (или создаваться extract’ом).

## 4. Проверка

- [x] 4.1 Ручной прогон: смена языка на код **без** встроенного `BUILTIN_UI[code]`, с заполненным `*.ui.json` — chrome на целевом языке; пустой `*.ui.json` — ожидаемо английский fallback для пропущенных ключей.
- [x] 4.2 `lint` / `build` после правок; сверка с delta-спеками `openspec/changes/add-locales-ui-json-pairing/specs/`.
