## 1. Задача сборки в `.vscode/tasks.json`

- [x] 1.1 Добавить нефоновую npm-задачу для `build` (например метка `Build: web (npm run build)`), без `isBackground` и без background `problemMatcher`, чтобы её можно было использовать как `preLaunchTask`.

## 2. Запуск собранного HTML в `.vscode/launch.json`

- [x] 2.1 Добавить конфигурацию «Web: built HTML (Edge)»: `type` `msedge`, `request` `launch`, `preLaunchTask` на задачу из п. 1.1, `webRoot` `${workspaceFolder}/src`, `url` — `file`-URL на `dist/ifkit_0.1.0.html` (имя SHALL совпадать с `name` и `version` корневого `package.json`, сейчас `ifkit` / `0.1.0`).
- [x] 2.2 Добавить аналог «Web: built HTML (Chrome)» с тем же `preLaunchTask` и `url`, с `runtimeExecutable` как у существующих Chrome-конфигов в этом репозитории.
- [x] 2.3 Проверить в VS Code или Cursor: конфигурации стартуют без ошибок «task not found», после сборки открывается нужный HTML, точки останова в исходниках `src/` срабатывают.

## 3. Спецификация

- [x] 3.1 Влить дельту из `openspec/changes/vscode-dev-and-web-html-build/specs/dev-tooling/spec.md` в канонический `openspec/specs/dev-tooling/spec.md` согласно процессу archive/apply репозитория.
