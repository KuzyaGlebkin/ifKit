## ADDED Requirements

### Requirement: Префикс имён desktop bundle и синхронизация версии с npm
Конфигурация Tauri SHALL обеспечивать, что после `npm run tauri:build` имена основного исполняемого файла и сопутствующих bundle-артефактов на Windows используют префикс `<npm_package_name>_<npm_package_version>` (значения из корневого `package.json`), а не строку с пробелами из отображаемого `productName`. Для этого в `tauri.conf.json` SHALL быть задано `mainBinaryName`, совпадающее с полем `name` из `package.json`. Версия приложения для сборки SHALL браться из того же `package.json`, что и для npm (например поле `version` в `tauri.conf.json` MAY указывать путь на этот файл согласно документации Tauri v2), чтобы не дублировать semver.

#### Scenario: Windows MSI и NSIS соответствуют шаблону
- **WHEN** разработчик выполняет `npm run tauri:build` на Windows для целевой архитектуры x86_64
- **THEN** среди файлов в `src-tauri/target/release/bundle/` присутствует NSIS-установщик с именем `<name>_<version>_x64-setup.exe` и MSI, чьё имя начинается с `<name>_<version>_x64` и заканчивается на `.msi` (WiX по умолчанию MAY добавлять суффикс языка, например `_en-US`, перед расширением)

#### Scenario: Desktop-сборка по-прежнему успешна
- **WHEN** разработчик выполняет `npm run tauri:build`
- **THEN** команда завершается без ошибок и в `src-tauri/target/release/bundle/` появляется нативный установщик
