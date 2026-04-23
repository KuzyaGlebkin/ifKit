## MODIFIED Requirements

### Requirement: Структура каталогов проекта
Шаблон проекта SHALL содержать фиксированную структуру каталогов, разделяющую оболочку движка, файлы автора и ассеты.

#### Scenario: Корневые файлы присутствуют
- **WHEN** автор открывает скачанный ZIP-шаблон
- **THEN** в корне находятся `index.html`, `package.json`, а авторские TypeScript-файлы и стили размещены в `src/`

#### Scenario: Авторские файлы сгруппированы в src/
- **WHEN** автор открывает каталог `src/`
- **THEN** в нём находятся `game.ts`, `scenes.ts`, `state.ts`, `style.css`, `index.html` и подкаталог `ifKit/`

#### Scenario: Каталог движка изолирован
- **WHEN** автор просматривает структуру проекта
- **THEN** весь код движка находится в `src/ifKit/` и не смешан с авторскими файлами

#### Scenario: Каталоги ассетов присутствуют
- **WHEN** автор хочет добавить медиафайлы
- **THEN** в корне существуют каталоги `assets/audio/` и `assets/images/`

### Requirement: Скелет index.html
Файл `src/index.html` SHALL содержать минимальный HTML-каркас с `<nav id="controls">` и `<div id="content">`, к которым движок подключает обработчики.

#### Scenario: Панель управления присутствует
- **WHEN** браузер загружает `src/index.html`
- **THEN** в DOM существует `<nav id="controls">` с кнопками `btn-undo`, `btn-redo`, `btn-saves`, `btn-settings`

#### Scenario: Контентный контейнер присутствует
- **WHEN** браузер загружает `src/index.html`
- **THEN** в DOM существует `<div id="content">`, в который движок динамически добавляет зоны сцены
