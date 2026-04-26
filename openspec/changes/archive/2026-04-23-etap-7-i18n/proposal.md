## Why

Игры на ifKit рассчитаны на одну аудиторию и один язык: автор жёстко вписывает строки прямо в сцены. Добавление поддержки нескольких языков позволит авторам выпускать билингвальные и мультиязычные игры без изменения архитектуры сцен — строки остаются на родном языке, переводы подключаются рядом.

## What Changes

- Новый тип `Locales` — словарь переводов `Record<langCode, Record<originalString, translatedString>>` в `GameConfig`
- Tagged template literal `` t`Строка` `` — возвращает перевод строки на активный язык; при отсутствии перевода возвращает оригинал как fallback
- Переменные в шаблоне: `` t`Найдено ${count} золота.` `` — интерполяция по позиции `{0}`, `{1}` и т.д.
- Автоопределение языка из `navigator.language` при первом запуске
- Новое поле `language: string` в типе `Settings` — хранится в `localStorage` как все остальные настройки
- Переключатель языка в модальном окне настроек (отображается только если `locales` переданы)
- `t` экспортируется из `ifKit` как часть публичного API

## Capabilities

### New Capabilities

- `i18n`: tagged template `` t`...` ``, функция `initI18n()`, тип `Locales`, логика выбора и смены языка

### Modified Capabilities

- `user-settings`: добавляется поле `language: string` в тип `Settings` и `engineDefaults`
- `define-game-api`: добавляется необязательное поле `locales?: Locales` в `GameConfig`
- `settings-modal`: переключатель языка появляется когда `locales` объявлены

## Impact

- `src/ifKit/i18n.ts` — новый модуль
- `src/ifKit/settings.ts` — новое поле `language` в `Settings` и `engineDefaults`
- `src/ifKit/settings-modal.ts` — секция выбора языка
- `src/ifKit/engine.ts` — передача `locales` в `initI18n()` при старте
- `src/ifKit/index.ts` — экспорт `t` и типа `Locales`
- `src/game.ts` (шаблон) — пример двуязычной игры
