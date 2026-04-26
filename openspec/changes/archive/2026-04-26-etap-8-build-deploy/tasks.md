## 1. Рефакторинг storage

- [x] 1.1 Создать директорию `src/ifKit/storage/`
- [x] 1.2 Создать `src/ifKit/storage/interface.ts` — перенести `StorageAdapter`, `KEYS` и `IFKIT_PREFIX`
- [x] 1.3 Создать `src/ifKit/storage/local.ts` — перенести `LocalStorageAdapter`, `storage` singleton, `exportToFile`, `importFromFile`, добавить no-op `initStorage`
- [x] 1.4 Создать `src/ifKit/storage/tauri.ts` — реализовать `TauriAdapter` через `@tauri-apps/plugin-store` с in-memory cache, `initStorage` с `await store.load()`, `exportToFile`/`importFromFile` через `@tauri-apps/plugin-dialog` и `@tauri-apps/plugin-fs`
- [x] 1.5 Удалить `src/ifKit/storage.ts`
- [x] 1.6 Обновить импорты во всех модулях (`saves.ts`, `settings.ts`, `seen-content.ts`, `settings-modal.ts`) — заменить `'./storage'` на `'@ifkit-storage'`
- [x] 1.7 Добавить `await initStorage()` в `engine.ts` перед `runGameLoop`

## 2. Vite-конфиги

- [x] 2.1 Добавить `resolve.alias` для `@ifkit-storage` в `vite.config.ts` (→ `local.ts`)
- [x] 2.2 Создать `vite.config.tauri.ts` без `viteSingleFile`, с `outDir: '../dist-tauri'` и alias `@ifkit-storage` → `tauri.ts`
- [x] 2.3 Добавить скрипты в `package.json`: `build:tauri-web`, `tauri:dev`, `tauri:build`, `tauri:android`

## 3. Инициализация Tauri

- [x] 3.1 Установить Tauri CLI: `npm install --save-dev @tauri-apps/cli`
- [x] 3.2 Выполнить `tauri init` — создать `src-tauri/` с базовой конфигурацией
- [x] 3.3 Настроить `tauri.conf.json`: `beforeBuildCommand`, `frontendDist: "../dist-tauri"`, `identifier`, имя приложения
- [x] 3.4 Добавить плагины в `src-tauri/Cargo.toml`: `tauri-plugin-store`, `tauri-plugin-dialog`, `tauri-plugin-fs`
- [x] 3.5 Зарегистрировать плагины в `src-tauri/lib.rs` (или `main.rs`)
- [x] 3.6 Настроить capabilities в `src-tauri/capabilities/` для разрешения плагинов
- [x] 3.7 Добавить npm-пакеты: `@tauri-apps/plugin-store`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`

## 4. Проверка сборок

- [x] 4.1 Убедиться, что `npm run build` создаёт `dist/index.html` без Tauri-кода
- [x] 4.2 Убедиться, что `npm run build:tauri-web` создаёт `dist-tauri/` с раздельными файлами
- [ ] 4.3 Запустить `npm run tauri:dev` — проверить, что игра открывается в нативном окне
- [x] 4.4 Запустить `npm run tauri:build` — проверить desktop-сборку на Windows
- [ ] 4.5 Проверить сохранения в Tauri: сохранить, перезапустить приложение, убедиться что сохранение восстановилось
- [ ] 4.6 Проверить `exportToFile` / `importFromFile` в Tauri — нативный диалог открывается

## 5. Android-сборка

- [ ] 5.1 Выполнить `tauri android init` — настроить Android-проект
- [ ] 5.2 Запустить `npm run tauri:android` — проверить сборку APK
- [ ] 5.3 Установить APK на устройство / эмулятор — проверить запуск игры
- [ ] 5.4 Проверить Audio API на Android (воспроизведение после первого tap)

## 6. Документация

- [x] 6.1 Создать `docs/building.md` с инструкцией по сборке: web, desktop (Windows/macOS/Linux), Android
- [x] 6.2 Описать требования к окружению для Android: Android Studio, SDK API 24+, NDK, переменные `ANDROID_HOME`, `NDK_HOME`
- [x] 6.3 Описать Steam Auto-Cloud: путь `appDataDir`, как настроить в Steamworks
- [x] 6.4 Обновить `README.md` — добавить раздел «Сборка и публикация»
