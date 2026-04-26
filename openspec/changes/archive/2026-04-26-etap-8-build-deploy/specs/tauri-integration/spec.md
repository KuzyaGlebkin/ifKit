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
- **THEN** изменяется только `dist/index.html`; содержимое `dist-tauri/` не затрагивается

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
