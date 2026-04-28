## ADDED Requirements

### Requirement: Tauri v2 проект инициализирован
Репозиторий SHALL содержать директорию `src-tauri/` с корректным `tauri.conf.json`, `Cargo.toml` и capabilities-файлами, обеспечивающими работу плагинов `plugin-store`, `plugin-dialog` и `plugin-fs`.

#### Scenario: Tauri desktop-сборка успешно компилируется
- **WHEN** разработчик выполняет `npm run tauri:build`
- **THEN** команда завершается без ошибок и в `src-tauri/target/release/bundle/` появляется нативный установщик

#### Scenario: Tauri dev-режим запускается
- **WHEN** разработчик выполняет `npm run tauri:dev`
- **THEN** открывается нативное окно с запущенной игрой поверх Vite dev server

### Requirement: Tauri-сборка использует отдельный Vite-конфиг
Проект SHALL содержать `vite.config.tauri.ts`, который НЕ подключает `viteSingleFile`, использует `outDir: '../dist-tauri'` и задаёт `resolve.alias` для `@ifkit-storage` на `./src/ifKit/storage/tauri.ts`. `tauri.conf.json` SHALL указывать `beforeBuildCommand: "npm run build:tauri-web"` и `frontendDist: "../dist-tauri"`.

#### Scenario: Tauri-сборка не создаёт single-file HTML
- **WHEN** разработчик выполняет `npm run build:tauri-web`
- **THEN** в `dist-tauri/` появляются отдельные файлы (index.html + assets), а не единый инлайн-файл

#### Scenario: Web-сборка не затрагивает dist-tauri
- **WHEN** разработчик выполняет `npm run build`
- **THEN** изменяется только содержимое `dist/` (web single-file артефакт); содержимое `dist-tauri/` не затрагивается

### Requirement: Скрипты сборки для desktop и Android
`package.json` SHALL содержать скрипты: `build:tauri-web` (сборка Vite-фронтенда для Tauri), `tauri:dev` (dev-режим), `tauri:build` (desktop-сборка), `tauri:android` (Android-сборка).

#### Scenario: npm run tauri:android собирает APK
- **WHEN** на машине настроено Android SDK и NDK, разработчик выполняет `npm run tauri:android`
- **THEN** команда завершается без ошибок и создаётся APK-файл

### Requirement: Инструкция по требованиям к окружению
Проект SHALL содержать документацию, описывающую минимальные требования для каждого типа сборки: desktop (Rust, системные зависимости Tauri по ОС), Android (Android Studio, Android SDK API 24+, NDK, переменные окружения `ANDROID_HOME`, `NDK_HOME`).

#### Scenario: Автор может настроить окружение по инструкции
- **WHEN** новый разработчик читает документацию по сборке
- **THEN** он находит полный список зависимостей и команды для их установки на своей ОС

### Requirement: Нативные иконки приложения согласованы с брендовым favicon

Файлы в `src-tauri/icons/`, перечисленные в `tauri.conf.json` как `icon`, SHALL визуально соответствовать бренду favicon (светлый символ if на тёмном поле), чтобы иконка в установщике, панели задач и системном списке приложений совпадала с ожиданием пользователя вкладки. Пути в `tauri.conf.json` SHALL оставаться действительными после обновления файлов.

Репозиторий SHALL содержать скрипт **`npm run icons:tauri`**, вызывающий `tauri icon` с единственным мастером **`src/ifk-favicon.svg`** (квадратный артборд — см. `app-branding`). Команда SHALL перезаписывать набор в `src-tauri/icons/`, согласованный с `bundle.icon` в `tauri.conf.json`. Перед production-сборкой фронта для Tauri (`beforeBuildCommand` в `tauri.conf.json`) SHALL выполняться та же регенерация, чтобы бинарник не уезжал от актуального favicon.

#### Scenario: Desktop bundle

- **WHEN** разработчик выполняет `npm run tauri:build` после обновления иконок
- **THEN** сборка завершается успешно и сгенерированный bundle использует обновлённые изображения

#### Scenario: Конфиг указывает на существующие файлы

- **WHEN** проверяется `src-tauri/tauri.conf.json`
- **THEN** каждый путь в массиве `icon` указывает на существующий файл в `src-tauri/icons/`

### Requirement: Префикс имён desktop bundle и синхронизация версии с npm
Конфигурация Tauri SHALL обеспечивать, что после `npm run tauri:build` имена основного исполняемого файла и сопутствующих bundle-артефактов на Windows используют префикс `<npm_package_name>_<npm_package_version>` (значения из корневого `package.json`), без пробелов в базовом имени файла. Поле `productName` в `tauri.conf.json` SHALL совпадать с полем `name` из `package.json`, поскольку WiX/NSIS используют его в имени установщика; поле `mainBinaryName` SHALL совпадать с тем же `name` для согласованного имени `.exe`. Версия приложения для сборки SHALL браться из того же `package.json`, что и для npm (например поле `version` в `tauri.conf.json` MAY указывать путь на этот файл согласно документации Tauri v2), чтобы не дублировать semver. Отображаемый заголовок окна MAY задаваться отдельно через `app.windows[].title`.

#### Scenario: Windows MSI и NSIS соответствуют шаблону
- **WHEN** разработчик выполняет `npm run tauri:build` на Windows для целевой архитектуры x86_64
- **THEN** среди файлов в `src-tauri/target/release/bundle/` присутствует NSIS-установщик с именем `<name>_<version>_x64-setup.exe` и MSI, чьё имя начинается с `<name>_<version>_x64` и заканчивается на `.msi` (WiX по умолчанию MAY добавлять суффикс языка, например `_en-US`, перед расширением)

#### Scenario: Desktop-сборка по-прежнему успешна
- **WHEN** разработчик выполняет `npm run tauri:build`
- **THEN** команда завершается без ошибок и в `src-tauri/target/release/bundle/` появляется нативный установщик
