## 1. Тип `Settings` и `applySettings`

- [x] 1.1 Добавить в `Settings` поле `accent` (union пресетов) и `engineDefaults.accent: 'default'`
- [x] 1.2 `mergeDefaults`, `loadSettings` и путь импорта/экспорта: подставлять `accent: 'default'`, если в JSON ключа нет
- [x] 1.3 В `applySettings` реализовать таблицу пресетов: для не-`default` — `setProperty` для `--ifk-color-accent` (и при необходимости `--ifk-color-accent-fg`); для `default` — `removeProperty` этих инлайнов (см. `design.md`, дельты `user-settings` / `ui-theming`)
- [x] 1.4 Сброс настроек и `authorDefaults`: поле `accent` восстанавливается вместе с остальным

## 2. i18n: режим `language: ''`

- [x] 2.1 Сохранять `locales` внутри i18n после `initI18n`, чтобы снова разрешать `''` без рестарта `defineGame`
- [x] 2.2 Публичная функция вроде `setLanguageOrAuto(preference)`: пустой `preference` — тот же алгоритм, что `initI18n(locales, '');` непустой — `setLanguage`. Не оставлять `setLanguage('')` в одиночку, если `locales` не пусты
- [x] 2.3 `settings-modal`: смена языка / сброс / по необходимости импорт — вызывают 2.2, затем `saveSettings` и `rerender`
- [x] 2.4 `engine` при старте: по-прежнему `initI18n(fullLocales, currentSettings.language)`

## 3. Модалка: проценты, акцент, язык, вёрстка

- [x] 3.1 Мини-лейблы у шрифта, музыки, звука: только целые проценты; `syncToDOM` и `input` обновляют подписи; числовая модель `Settings` не меняется
- [x] 3.2 Ряд пресетов акцентного цвета: разметка в духе «Тема», активный класс, `commit({ accent })`; вынести из `#ifk-settings-theme-font` с `aria-hidden` или согласовать ARIA/скрытие с `openspec`
- [x] 3.3 `buildLangRow`: кнопка «Авто» первой, `data-lang-value` пустой; `syncToDOM` — активен при `settings.language === ''`
- [x] 3.4 `style.css`: `ifk-lang-group` — `flex-wrap: nowrap` или `overflow-x: auto` на узкой ширине; выравнивание `fieldset` языка с соседними `.ifk-settings-row`

## 4. Спеки (архив после реализации)

- [x] 4.1 Прогнать `openspec validate` / проектный контракт, при необходимости перенести дельты в `openspec/specs/` (шаг `openspec:archive` по правилам репозитория)
