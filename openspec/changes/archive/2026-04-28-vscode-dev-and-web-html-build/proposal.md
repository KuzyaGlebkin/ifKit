## Why

В редакторе уже удобно поднимать dev-сервер и отлаживать Vite, но типичный релизный артефакт проекта — один HTML в `dist/` (`build-config`). Нет одного шага из палитры задач / Run and Debug для **сборки** этого файла и проверки/отладки уже собранной версии без ручного `npm run build` и поиска имени файла.

## What Changes

- Расширить `.vscode/tasks.json`: добавить задачу **сборки веб-артефакта** (`npm run build`), завершающуюся по окончании сборки (не фоновая).
- Расширить `.vscode/launch.json`: добавить конфигурацию(и), которые **после** `preLaunchTask` сборки открывают сгенерированный single-file HTML в браузере с JS Debugger (аналогично сценарию dev).
- Обновить спецификацию `dev-tooling`: зафиксировать требования к задаче сборки и к опциональной конфигурации «собрать и открыть dist HTML».

## Capabilities

### New Capabilities

- _(нет — поведение описываем дельтой существующей спеки)_

### Modified Capabilities

- `dev-tooling`: дополнить требование «Конфигурации запуска VS Code» задачей `npm run build` и сценариями отладки собранного `dist/<name>_<version>.html`.

## Impact

- Файлы `.vscode/tasks.json`, `.vscode/launch.json`.
- Дельта `openspec/specs/dev-tooling/spec.md` в каталоге изменения.
- Имя HTML в `launch.json` должно соответствовать `name` и `version` из корневого `package.json` (как в `vite.config.ts` / `build-config`); при смене версии путь в конфигурации нужно обновить.
