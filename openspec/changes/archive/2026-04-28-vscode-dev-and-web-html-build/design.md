## Context

Проект собирается в один файл `dist/<name>_<version>.html` (`vite.config.ts`, `build-config`). В `.vscode/` уже есть фоновые задачи `dev` / `tauri:dev` и конфигурации отладки по `http://localhost:5173/`. Не хватает явной задачи `npm run build` и сценария Run and Debug для **уже собранного** HTML.

## Goals / Non-Goals

**Goals:**

- Одна npm-задача в `tasks.json` типа «Build: web» без `isBackground`, чтобы её можно было использовать как `preLaunchTask` и из палитры «Tasks: Run Task».
- Конфигурации `launch.json` (Edge и при необходимости Chrome), которые: `preLaunchTask` → сборка → открытие файла из `dist/` в JS Debugger с `webRoot: ${workspaceFolder}/src` (исходники для карт кода совпадают с dev).
- Имя файла в `url` для `file://` согласовано с текущим `package.json` (`ifkit` + `0.1.0` → `ifkit_0.1.0.html`).

**Non-Goals:**

- Автоматическое чтение `package.json` в `launch.json` (VS Code не подставляет версию); при bump версии правка URL вручную или отдельный change со скриптом-генерацией.
- Отдельная спека `build-config` — имя файла уже зафиксировано там; мы только ссылаемся на неё.

## Decisions

1. **Тип задачи сборки** — `npm` / `script: build`, без фонового matcher: проще и надёжнее, чем парсить вывод Vite для «готовности».
2. **URL для отладки** — локальный `file:///.../dist/<name>_<version>.html`. Single-file рассчитан на `file://` (`docs/building.md`); не вводим второй сервер (`preview`), чтобы не зависеть от наличия `index.html` в `dist` после переименования.
3. **Дублирование Edge/Chrome** — как у существующих конфигов: Edge без жёсткого пути, Chrome с `runtimeExecutable` под типичный путь Windows в текущем репозитории (согласованность с уже принятым стилем).
4. **Альтернатива отклонена** — только задача без launch: пользователь просил явно связку с отладкой/запуском из редактора; launch повышает ценность change.

## Risks / Trade-offs

- **[Risk] Смена `name`/`version` ломает `url` в launch** → В `tasks.md` явно указать синхронизацию с `package.json`; в комментарии в `launch.json` (если поддерживается JSONC — нет, чистый JSON) оставить только косвенно через документацию в спеке.
- **[Risk] `file://` и политики браузера** → Для этого проекта артефакт уже предназначен под `file://`; при ограничениях разработчик может открыть файл вручную после build task.

## Migration Plan

Только добавление задач и конфигураций; откат — удалить добавленные записи из `tasks.json` / `launch.json` и дельту спеки.

## Open Questions

- Нет.
