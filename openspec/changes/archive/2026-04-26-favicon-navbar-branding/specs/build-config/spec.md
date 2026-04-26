## ADDED Requirements

### Requirement: Favicon в артефактах web и tauri-web

Команда `npm run build` SHALL производить `dist/index.html`, в котором объявлен favicon (элемент `<link rel="icon" ...>` или эквивалент), удовлетворяющий требованиям `app-branding`, без зависимости от отдельного файла favicon рядом с `index.html` в `dist/`. Команда `npm run build:tauri-web` SHALL производить `dist-tauri/index.html` с тем же смыслом favicon (допускается отдельный файл ассета в `dist-tauri/assets/`, так как мультифайловая сборка).

#### Scenario: Single-file web

- **WHEN** разработчик выполняет `npm run build` и открывает только `dist/index.html`
- **THEN** браузер показывает favicon во вкладке без 404 на ресурс иконки

#### Scenario: Tauri frontend dist

- **WHEN** разработчик выполняет `npm run build:tauri-web`
- **THEN** `dist-tauri/index.html` ссылается на favicon способом, валидным для локального загрузчика Tauri (относительный путь или data URL)
