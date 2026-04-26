## ADDED Requirements

### Requirement: Поле locales — словарь переводов (опционально)
`defineGame()` SHALL принимать необязательное поле `locales?: Locales`. Если поле передано, движок SHALL передавать его в `initI18n()` при инициализации вместе с текущим значением `settings.language`. Если поле не передано — `t` работает в режиме passthrough (возвращает оригинал).

#### Scenario: locales переданы — i18n инициализируется
- **WHEN** автор передаёт `locales: { en: { "Привет": "Hello" } }` в `defineGame()`
- **THEN** после запуска `` t`Привет` `` при активном `'en'` возвращает `"Hello"`

#### Scenario: locales не переданы — t работает как identity
- **WHEN** автор вызывает `defineGame({ state, scenes })` без `locales`
- **THEN** `` t`Любая строка` `` возвращает `"Любая строка"`
