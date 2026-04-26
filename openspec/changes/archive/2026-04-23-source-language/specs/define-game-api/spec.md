## MODIFIED Requirements

### Requirement: Поле locales — словарь переводов (опционально)
`defineGame()` SHALL принимать необязательное поле `locales?: Locales`. Если поле передано, движок SHALL передавать его в `initI18n()` при инициализации вместе с текущим значением `settings.language`. Если поле не передано — `t` работает в режиме passthrough (возвращает оригинал). Если одновременно передано `sourceLanguage`, движок SHALL строить `fullLocales = { [sourceLanguage]: {}, ...locales }` и использовать `fullLocales` вместо `locales` во всех downstream-вызовах.

#### Scenario: locales переданы — i18n инициализируется
- **WHEN** автор передаёт `locales: { en: { "Привет": "Hello" } }` в `defineGame()`
- **THEN** после запуска `` t`Привет` `` при активном `'en'` возвращает `"Hello"`

#### Scenario: locales не переданы — t работает как identity
- **WHEN** автор вызывает `defineGame({ state, scenes })` без `locales`
- **THEN** `` t`Любая строка` `` возвращает `"Любая строка"`

## ADDED Requirements

### Requirement: Поле sourceLanguage — код языка оригинальных строк (опционально)
`defineGame()` SHALL принимать необязательное поле `sourceLanguage?: string` — BCP 47 short code языка, на котором написаны оригинальные строки в сценах (например `'ru'`, `'en'`). Если передано, движок SHALL включить этот код в список доступных языков первым и обеспечить, что при активном `sourceLanguage` функция `t` возвращает оригинальные строки (fallback на ключ). Без `sourceLanguage` поведение движка идентично текущему.

#### Scenario: sourceLanguage + перевод — переключатель языков виден
- **WHEN** автор передаёт `sourceLanguage: 'ru'` и `locales: { en: {...} }`
- **THEN** в настройках отображается переключатель с кнопками `ru` и `en`

#### Scenario: При активном sourceLanguage t возвращает оригинал
- **WHEN** `sourceLanguage: 'ru'`, активный язык `'ru'`, вызов `` t`Лес` ``
- **THEN** результат `"Лес"` (оригинальная строка, не перевод)

#### Scenario: Без sourceLanguage — поведение прежнее
- **WHEN** автор передаёт `locales: { en: {...} }` без `sourceLanguage`
- **THEN** доступен только язык `'en'`, переключатель не отображается

#### Scenario: Автоопределение по браузеру учитывает sourceLanguage
- **WHEN** `sourceLanguage: 'ru'`, `locales: { en: {...} }`, `navigator.language === 'ru-RU'`, `settings.language === ''`
- **THEN** игра стартует на `'ru'` (оригинальные строки)

#### Scenario: sourceLanguage конфликтует с ключом в locales — locales побеждает
- **WHEN** автор передаёт `sourceLanguage: 'en'` и `locales: { en: { "Лес": "Forest" } }`
- **THEN** при активном `'en'` `` t`Лес` `` возвращает `"Forest"` (перевод из locales, не пустой fallback)
