## Why

Имена выходных файлов сборок сейчас не совпадают с ожидаемым шаблоном: для распространения и документации нужен единый вид `<имя_пакета>_<версия>.<расширение>` (как в `package.json`: `ifkit` и `0.1.0`), без пробелов и с согласованными суффиксами платформы для установщиков.

## What Changes

- Web single-file сборка (`npm run build`): итоговый HTML SHALL именоваться в виде `ifkit_<version>.html` (или эквивалент с тем же шаблоном, версия из `package.json`).
- Tauri desktop bundle (`npm run tauri:build`): MSI и NSIS (и при необходимости другие цели Windows) SHALL получать базовое имя в виде `ifkit_<version>_<arch>` / `ifkit_<version>_<arch>-setup` согласно принятым в Tauri суффиксам, вместо имени, производного от `productName` с пробелами.
- Версия SHALL браться из одного источника правды (`package.json` / синхрон с `tauri.conf.json`), чтобы не расходилась между артефактами.

## Capabilities

### New Capabilities

- _(нет — требования уточняются в существующих спеках)_

### Modified Capabilities

- `build-config`: зафиксировать требование к имени файла web-сборки (`ifkit_<version>.html`).
- `tauri-integration`: зафиксировать требование к шаблону имён bundle-артефактов (пакетное имя + версия + платформенные суффиксы), согласованному с `package.json` `name`/`version`.

## Impact

- `vite.config.ts` (или связанные плагины) для `rollupOptions.output` / `assetFileNames` или постобработка имени выходного HTML.
- `src-tauri/tauri.conf.json` (и при необходимости `Cargo.toml` / переменные сборки Tauri v2 для `mainBinaryName` / bundle product name).
- Документация сборки (`docs/building.md`), если там перечислены имена файлов.
- CI или скрипты, жёстко ожидающие старые имена артефактов.
