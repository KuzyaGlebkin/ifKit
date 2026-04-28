## MODIFIED Requirements

### Requirement: Сборка в single-file HTML
Проект SHALL собираться командой `npm run build` в один самодостаточный HTML-файл с инлайн JavaScript и CSS, не требующий веб-сервера для запуска. Имя этого файла в каталоге `dist/` SHALL быть `<npm_package_name>_<npm_package_version>.html`, где `npm_package_name` и `npm_package_version` — поля `name` и `version` корневого `package.json` репозитория (для текущего шаблона проекта при версии 0.1.0 — `ifkit_0.1.0.html`).

#### Scenario: Успешная сборка
- **WHEN** разработчик выполняет `npm run build`
- **THEN** в каталоге `dist/` появляется ровно один HTML-файл с именем `<name>_<version>.html` со всем JS и CSS внутри

#### Scenario: Файл открывается без сервера
- **WHEN** пользователь открывает этот HTML-файл напрямую в браузере (через `file://`)
- **THEN** игра загружается и работает без ошибок в консоли

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
