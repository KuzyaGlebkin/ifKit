## 1. Web-сборка (Vite)

- [x] 1.1 В `vite.config.ts` прочитать `name` и `version` из корневого `package.json` и задать `build.rollupOptions.output.entryFileNames` (и при необходимости имена ассетов), чтобы единственный HTML в `dist/` назывался `<name>_<version>.html`.
- [x] 1.2 Выполнить `npm run build` и убедиться, что в `dist/` один такой файл, игра открывается через `file://`, favicon не 404.

## 2. Tauri desktop bundle

- [x] 2.1 В `src-tauri/tauri.conf.json` выставить `mainBinaryName` равным `name` из `package.json` и настроить `version` на единый источник (путь к `../package.json` или эквивалент по документации CLI).
- [x] 2.2 При необходимости согласовать имя бинаря с `src-tauri/Cargo.toml` / предупреждениями `tauri build`.
- [x] 2.3 Выполнить `npm run tauri:build` на Windows (x64) и проверить имена `.msi` и NSIS `.exe` в `src-tauri/target/release/bundle/` на соответствие префиксу `<name>_<version>_x64`.

## 3. Документация и автоматизация

- [x] 3.1 Обновить `docs/building.md`: путь к web-артефакту и примеры имён bundle после изменений.
- [x] 3.2 Проверить CI/скрипты репозитория на жёсткие ссылки `dist/index.html` или старые имена установщиков; обновить при необходимости.

## 4. Спеки (архив)

- [x] 4.1 После реализации — прогнать архив изменения и слить дельты `build-config` и `tauri-integration` в `openspec/specs/`.
