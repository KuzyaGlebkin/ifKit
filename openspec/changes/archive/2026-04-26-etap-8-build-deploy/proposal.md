## Why

Игра собирается в single-file HTML, но для публикации в Steam и на мобильных платформах нужна нативная обёртка. Tauri v2 обеспечивает desktop (Windows/macOS/Linux) и Android-сборки. Хранилище данных в нативной среде должно писать в файловую систему — для синхронизации через Steam Auto-Cloud.

## What Changes

- Добавить `vite.config.tauri.ts` — конфиг Tauri-сборки без `viteSingleFile`, с `resolve.alias` на реализацию `TauriAdapter`
- Добавить `src-tauri/` — конфигурация Tauri v2 (Rust, `tauri.conf.json`)
- Разбить `storage.ts` на три модуля: `storage/interface.ts`, `storage/local.ts`, `storage/tauri.ts`
- Реализовать `TauriAdapter` через `@tauri-apps/plugin-store` с in-memory cache и sync-интерфейсом
- Оба адаптера экспортируют `initStorage(): Promise<void>`; `defineGame` ждёт инициализации перед стартом
- `exportToFile`/`importFromFile` в Tauri-сборке используют нативные диалоги (`@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`)
- Добавить npm-скрипты: `build:tauri-web`, `tauri:dev`, `tauri:build`, `tauri:android`
- Удалить runtime-детект `'__TAURI__' in window` из `storage.ts` — адаптер выбирается на этапе сборки

## Capabilities

### New Capabilities

- `tauri-integration`: Tauri v2 настройка проекта — `src-tauri/`, `tauri.conf.json`, Cargo-зависимости, скрипты сборки для desktop и Android

### Modified Capabilities

- `storage-layer`: выбор адаптера переходит с runtime-детекта на build-time alias; TauriAdapter получает реальную реализацию через `@tauri-apps/plugin-store`; добавляется `initStorage()` в контракт; `exportToFile`/`importFromFile` становятся адаптер-специфичными
- `build-config`: добавляется второй vite-конфиг для Tauri-сборки, новые npm-скрипты

## Impact

- `src/ifKit/storage.ts` → разбивается на `src/ifKit/storage/interface.ts`, `local.ts`, `tauri.ts`
- `src/ifKit/engine.ts` — добавляется `await initStorage()` перед стартом игры
- `src/ifKit/saves.ts`, `src/ifKit/settings.ts` — импорт меняется с `'./storage'` на `'@ifkit-storage'`
- Зависимости: `@tauri-apps/plugin-store`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`
- Rust: `src-tauri/Cargo.toml` с Tauri v2 и нужными плагинами
- Два выходных каталога: `dist/` (web), `dist-tauri/` (Tauri frontend)
