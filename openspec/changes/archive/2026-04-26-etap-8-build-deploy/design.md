## Context

Проект собирается командой `vite build` в `dist/index.html` через `vite-plugin-singlefile`. Хранилище данных абстрагировано через `StorageAdapter` в `storage.ts`, но `TauriAdapter` является заглушкой поверх localStorage. Выбор адаптера сейчас происходит в runtime по `'__TAURI__' in window`.

Для Tauri v2 необходимо:
- хранить сохранения в файловой системе (`appDataDir`) — для Steam Auto-Cloud;
- иметь отдельный vite-конфиг без `viteSingleFile` (Tauri сам упаковывает ресурсы);
- при старте асинхронно загружать store из файла до запуска игрового цикла.

## Goals / Non-Goals

**Goals:**
- Два вида сборки из одного репозитория: `dist/index.html` (web) и Tauri-приложение (desktop + Android)
- `TauriAdapter` пишет в файловую систему через `@tauri-apps/plugin-store`
- Sync-интерфейс `StorageAdapter` сохраняется — вызывающий код не меняется
- Выбор адаптера на этапе сборки (resolve.alias), не в runtime
- `exportToFile`/`importFromFile` используют нативные диалоги в Tauri-сборке

**Non-Goals:**
- iOS (нет тестового устройства)
- GitHub Actions CI/CD
- Публикация npm-пакета
- Изменение публичного API `defineGame`

## Decisions

### 1. Build-time выбор адаптера через resolve.alias

**Решение:** `resolve.alias` в vite-конфиге направляет импорт `@ifkit-storage` на нужный модуль.

```
vite.config.ts        → alias @ifkit-storage → storage/local.ts
vite.config.tauri.ts  → alias @ifkit-storage → storage/tauri.ts
```

**Альтернатива:** runtime-детект `'__TAURI__' in window` (текущее состояние).

**Отказ от альтернативы:** при runtime-детекте `@tauri-apps/plugin-store` попадает в web-бандл и требует dynamic import. Build-time исключает Tauri-зависимости из web-сборки полностью — чистый tree-shaking, нет лишнего кода в `dist/index.html`.

### 2. Sync-интерфейс через in-memory cache

**Решение:** `TauriAdapter` при инициализации загружает весь store в память (`await store.load()`). После этого `get`/`set` работают синхронно с кэшем; `set` дополнительно вызывает `store.set(key, value)` без await (fire-and-forget).

```
initStorage() → await store.load() → кэш готов
get(key)      → return cache[key]
set(key, val) → cache[key] = val; store.set(key, val)  // async, не ждём
```

**Альтернатива:** сделать `StorageAdapter` полностью async.

**Отказ от альтернативы:** потребовало бы переписать все вызывающие места (`saves.ts`, `settings.ts`, `seen-content.ts`). Потеря данных при крэше между sync-set и async-flush минимальна для игровых сохранений.

### 3. Оба адаптера экспортируют initStorage()

`local.ts` экспортирует `initStorage` как no-op: `async function initStorage() {}`.
`tauri.ts` экспортирует `initStorage`, который загружает Store.

`engine.ts` всегда вызывает `await initStorage()` до `runGameLoop`. Это не создаёт асимметрии — web-вариант просто возвращает resolved Promise немедленно.

### 4. Tauri-сборка без viteSingleFile

Tauri сам упаковывает frontend в бинарь. `viteSingleFile` избыточен и может конфликтовать с Tauri IPC-injection. `vite.config.tauri.ts` не подключает этот плагин, outDir — `dist-tauri/`.

`tauri.conf.json`:
```json
{
  "build": {
    "beforeBuildCommand": "npm run build:tauri-web",
    "frontendDist": "../dist-tauri"
  }
}
```

### 5. exportToFile / importFromFile в Tauri через плагины

В web-сборке остаётся текущая реализация (Blob + `<a download>`, `<input type="file">`).
В `tauri.ts` используются:
- `@tauri-apps/plugin-dialog`: `save()` / `open()` для нативного file picker
- `@tauri-apps/plugin-fs`: `writeTextFile()` / `readTextFile()`

Эти функции экспортируются из адаптерного модуля, вызывающий код (settings-modal) импортирует их из `@ifkit-storage`.

### 6. Steam Auto-Cloud

Tauri Store файл хранится в `appDataDir()` (`%APPDATA%\<bundle-id>\`). Steam Auto-Cloud настраивается в Steamworks на синхронизацию этой директории. Конкретный путь зависит от `identifier` в `tauri.conf.json` — автор игры указывает его под свой bundle ID.

## Risks / Trade-offs

**[Риск] Fire-and-forget запись: при крэше приложения между `set` и фактической записью данные могут не сохраниться**
→ Приемлемо для игровых сохранений; localStorage имеет схожую гарантию на уровне ОС.

**[Риск] Android WebView и Audio API: системный WebView на Android может ограничивать воспроизведение аудио без user gesture**
→ Нужно проверить вручную при тестировании Android-сборки; при необходимости добавить splash-screen с явным тапом.

**[Риск] Версия Android WebView: старые устройства могут иметь устаревший WebView**
→ Tauri v2 требует Android API 24+ (Android 7.0); это задокументировать в инструкции.

**[Trade-off] Два outDir: `dist/` и `dist-tauri/`**
→ Авторы должны понимать, какой каталог для чего. Документировать в README.

## Migration Plan

1. Создать `src/ifKit/storage/` с тремя файлами; удалить `src/ifKit/storage.ts`
2. Обновить импорты во всех модулях (`saves.ts`, `settings.ts`, `seen-content.ts`, `settings-modal.ts`)
3. Добавить `await initStorage()` в `engine.ts`
4. Создать `vite.config.tauri.ts`
5. Обновить `package.json` скрипты
6. Инициализировать `src-tauri/` через `tauri init`
7. Проверить desktop-сборку (Windows)
8. Проверить Android-сборку

Rollback: `storage.ts` на момент начала работ сохранён в git. При проблемах — откат одним коммитом.
