## 1. Тип Settings — поле language

- [x] 1.1 Добавить поле `language: string` в тип `Settings` в `settings.ts`
- [x] 1.2 Добавить `language: ''` в `engineDefaults`

## 2. Модуль i18n

- [x] 2.1 Объявить тип `Locales = Record<string, Record<string, string>>` в `i18n.ts`
- [x] 2.2 Реализовать `initI18n(locales, language)` — сохранение словаря и определение активного языка (с автоопределением из `navigator.language`)
- [x] 2.3 Реализовать tagged template literal `t` — построение ключа, поиск в локали, интерполяция значений, fallback на оригинал
- [x] 2.4 Реализовать `setLanguage(lang)` — обновление активного языка
- [x] 2.5 Реализовать `getAvailableLanguages()` — возврат ключей текущего словаря

## 3. Интеграция в движок

- [x] 3.1 Добавить поле `locales?: Locales` в `GameConfig` в `engine.ts`
- [x] 3.2 Вызывать `initI18n(config.locales ?? {}, currentSettings.language)` в `defineGame()` при инициализации
- [x] 3.3 Экспортировать `t`, `Locales`, `setLanguage`, `getAvailableLanguages` из `index.ts`

## 4. Переключатель языка в настройках

- [x] 4.1 Передавать список языков в `initSettingsModal()` (или дать ей доступ к `getAvailableLanguages()`)
- [x] 4.2 Рендерить секцию «Язык» в модалке только если языков больше одного
- [x] 4.3 По нажатию кнопки языка: вызвать `setLanguage()`, сохранить настройки, вызвать `rerender()`
- [x] 4.4 Выделять активную кнопку языка при открытии модалки
- [x] 4.5 При нажатии «Сбросить настройки» обновлять переключатель языка до `authorDefaults.language`

## 5. Шаблон автора

- [x] 5.1 Добавить пример `locales` с двумя языками в шаблон `src/game.ts`
- [x] 5.2 Обновить `src/scenes.ts` шаблона: использовать `` t`...` `` в нескольких строках для демонстрации
