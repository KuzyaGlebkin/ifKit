## ADDED Requirements

### Requirement: Сборка в single-file HTML
Проект SHALL собираться командой `npm run build` в один самодостаточный HTML-файл с инлайн JavaScript и CSS, не требующий веб-сервера для запуска. Имя этого файла в каталоге `dist/` SHALL быть `<npm_package_name>_<npm_package_version>.html`, где `npm_package_name` и `npm_package_version` — поля `name` и `version` корневого `package.json` репозитория (для текущего шаблона проекта при версии 0.1.0 — `ifkit_0.1.0.html`).

#### Scenario: Успешная сборка
- **WHEN** разработчик выполняет `npm run build`
- **THEN** в каталоге `dist/` появляется ровно один HTML-файл с именем `<name>_<version>.html` со всем JS и CSS внутри

#### Scenario: Файл открывается без сервера
- **WHEN** пользователь открывает этот HTML-файл напрямую в браузере (через `file://`)
- **THEN** игра загружается и работает без ошибок в консоли

### Requirement: Web single-file без минификации JS/CSS

Конфигурация Vite для web-сборки (`vite.config.ts` в корне репозитория, используемая скриптом `npm run build`) SHALL задавать `build.minify: false` (или эквивалентное отключение минификации **production**-бандла для JavaScript и CSS, встраиваемых в HTML). Обоснование: размер артефакта доминируют инлайновые бинарные ассеты (аудио и т.п.); экономия от минификации текста мала, зато читаемый бандл упрощает инспекцию, отладку и **ручную** работу с встроенными строками локализации.

Сборка `build:tauri-web` (`vite.config.tauri.ts`) **не** входит в это требование: для неё допустима стандартная минификация Vite, если она включена по умолчанию.

#### Scenario: В конфиге web-сборки отключена минификация
- **WHEN** разработчик открывает `vite.config.ts`, относящийся к `npm run build`
- **THEN** в объекте `build` указано `minify: false`

#### Scenario: После сборки инлайн-скрипт пригоден для чтения человеком
- **WHEN** разработчик выполняет `npm run build` и открывает `dist/<name>_<version>.html` в текстовом редакторе
- **THEN** встроенный JavaScript **не** свёрнут в типичный однострочный минифицированный блок без исходных переносов строк (остаётся формат, удобный для поиска по фрагментам кода и строковым литералам)

### Requirement: Режим разработки с горячей перезагрузкой
Проект SHALL поддерживать команду `npm run dev`, запускающую dev-сервер Vite с горячей перезагрузкой модулей (HMR).

#### Scenario: Dev-сервер запускается
- **WHEN** разработчик выполняет `npm run dev`
- **THEN** Vite запускает локальный сервер и выводит адрес (например, `http://localhost:5173`)

#### Scenario: Изменения отражаются без перезапуска
- **WHEN** разработчик сохраняет изменение в `src/game.ts` или `src/scenes.ts`
- **THEN** браузер обновляет страницу автоматически без ручного рефреша

### Requirement: TypeScript как основной язык
Проект SHALL компилировать TypeScript без ошибок с включённым строгим режимом (`strict: true`).

#### Scenario: Строгая типизация включена
- **WHEN** разработчик проверяет `tsconfig.json`
- **THEN** в нём установлен `"strict": true`

#### Scenario: Компиляция проходит без ошибок
- **WHEN** разработчик выполняет `npm run build`
- **THEN** TypeScript не выдаёт ошибок типизации для кода шаблона

### Requirement: Tauri-сборка frontend через отдельный npm-скрипт
`package.json` SHALL содержать скрипт `build:tauri-web`, который **в той же последовательности, что и web `build`**, запускает извлечение ключей i18n (см. `dev-tooling`, `i18n:extract`), затем `tsc`, затем `vite build --config vite.config.tauri.ts`, и выводит результат в `dist-tauri/`.

#### Scenario: build:tauri-web создаёт правильный outDir
- **WHEN** разработчик выполняет `npm run build:tauri-web`
- **THEN** в `dist-tauri/` появляется `index.html` и директория `assets/`; `dist/` не затрагивается

### Requirement: Web-сборка не включает Tauri-зависимости
В web-сборке (`npm run build`) alias `@ifkit-storage` SHALL указывать на `local.ts`. Пакеты `@tauri-apps/plugin-store`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs` SHALL отсутствовать в единственном HTML-артефакте в `dist/`.

#### Scenario: Web-бандл не содержит кода Tauri
- **WHEN** разработчик выполняет `npm run build` и инспектирует сгенерированный `<name>_<version>.html` в `dist/`
- **THEN** в файле отсутствуют строки, связанные с `@tauri-apps`

### Requirement: Favicon в артефактах web и tauri-web

Команда `npm run build` SHALL производить `dist/<name>_<version>.html`, в котором объявлен favicon (элемент `<link rel="icon" ...>`), удовлетворяющий требованиям `app-branding`, со ссылкой на SVG, **содержимое которого** соответствует `src/ifk-favicon.svg` (Vite MAY вывести хэшированное имя файла рядом с HTML в `dist/`). Команда `npm run build:tauri-web` SHALL производить `dist-tauri/index.html` с тем же смыслом favicon (отдельный файл ассета в `dist-tauri/assets/` допустим).

#### Scenario: Web-сборка и favicon

- **WHEN** разработчик выполняет `npm run build` и открывает `dist/<name>_<version>.html` (и при необходимости соседний выведенный `.svg` из той же папки `dist/`)
- **THEN** браузер показывает favicon во вкладке без 404 на ресурс иконки

#### Scenario: Tauri frontend dist

- **WHEN** разработчик выполняет `npm run build:tauri-web`
- **THEN** `dist-tauri/index.html` ссылается на favicon способом, валидным для локального загрузчика Tauri (относительный путь или data URL)
