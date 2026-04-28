## ADDED Requirements

### Requirement: Парные JSON в `src/locales/`

Каталог `src/locales/` в шаблоне **рекомендуемой** структуры SHALL содержать для каждого кода, под которым существует `<code>.game.json`, **файл** `<code>.ui.json` (возможны пустые значения-заглушки по правилам `dev-tooling` до ручного перевода). `README` в `locales` MAY дополнять соглашение, но **не** заменять наличие пар при принятом в change правиле «один код — два JSON».

#### Scenario: Список файлов

- **WHEN** в репозитории есть `en.game.json` и `by.game.json`
- **THEN** рядом присутствуют `en.ui.json` и `by.ui.json` (создаются/поддерживаются согласно `dev-tooling`)
