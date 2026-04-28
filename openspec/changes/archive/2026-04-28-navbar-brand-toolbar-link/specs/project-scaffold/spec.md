## MODIFIED Requirements

### Requirement: Скелет index.html

Файл `src/index.html` SHALL содержать минимальный HTML-каркас с `<nav id="controls">` и `<div id="content">`, к которым движок подключает обработчики.

#### Scenario: Панель управления присутствует

- **WHEN** браузер загружает `src/index.html`
- **THEN** в DOM существует `<nav id="controls">`, содержащий один `<ul class="ifk-controls-actions">` с пятью `<li>`: первый — ссылка бренда с `id` `btn-brand`, далее в порядке документа кнопки с `id` `btn-undo`, `btn-redo`, `btn-saves`, `btn-settings`

#### Scenario: Контентный контейнер присутствует

- **WHEN** браузер загружает `src/index.html`
- **THEN** в DOM существует `<div id="content">`, в который движок динамически добавляет зоны сцены
