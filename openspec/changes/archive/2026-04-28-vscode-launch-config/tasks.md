## 1. Конфигурация задач редактора

- [x] 1.1 Создать `.vscode/tasks.json` с фоновой npm-задачей для `dev` (`isBackground: true`, `problemMatcher`, ожидание строки готовности Vite с локальным URL).
- [x] 1.2 Добавить во `tasks.json` фоновую npm-задачу для `tauri:dev` с согласованным `problemMatcher` (лог готовности dev-сервера / Tauri).

## 2. Конфигурации запуска и проверка

- [x] 2.1 Создать `.vscode/launch.json`: конфигурация «веб» с `preLaunchTask` на задачу из п. 1.1, тип отладчика браузера (JS Debugger), URL `http://localhost:5173/`.
- [x] 2.2 Добавить в `launch.json` конфигурацию для `tauri:dev` с `preLaunchTask` на задачу из п. 1.2 (без отладки Rust).
- [x] 2.3 Проверить в VS Code или Cursor: обе конфигурации стартуют без ошибок «task not found», браузер открывается после готовности сервера.

## 3. Спецификация

- [x] 3.1 Перенести дельту из `openspec/changes/vscode-launch-config/specs/dev-tooling/spec.md` в канонический `openspec/specs/dev-tooling/spec.md` согласно процессу archive/apply репозитория.
