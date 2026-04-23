## Why

ifKit — движок интерактивной литературы на TypeScript, который автор скачивает как ZIP-шаблон и редактирует напрямую. Перед реализацией любых фич необходимо зафиксировать структуру каталогов, точку входа автора (`game.ts`) и конфигурацию сборки — без этого фундамента все последующие этапы не имеют базы.

## What Changes

- Инициализация репозитория с Vite + TypeScript
- Базовая конфигурация `vite.config.ts` со сборкой в single-file HTML через `vite-plugin-singlefile`
- Настройка ESLint и Prettier
- Шаблонные файлы проекта: `index.html`, `style.css`, `game.ts`, `scenes.ts`, `state.ts`
- Структура движка в `src/ifKit/` с модулями по фичам и точкой входа `index.ts`
- README с минимальным рабочим примером игры

## Capabilities

### New Capabilities

- `project-scaffold`: Базовая структура каталогов проекта — оболочка (`index.html`, `style.css`), файлы автора (`game.ts`, `scenes.ts`, `state.ts`), движок (`src/ifKit/`)
- `build-config`: Конфигурация Vite со сборкой single-file HTML, линтером и форматтером
- `define-game-api`: Публичный API точки входа автора — функция `defineGame()` с полями `state`, `static`, `scenes`
- `dev-tooling`: Конфигурация ESLint и Prettier, подключённые к проекту

### Modified Capabilities

<!-- Нет существующих спецификаций — это первый этап проекта -->

## Impact

- Создаётся корневая структура всего проекта, все последующие этапы опираются на неё
- `src/ifKit/index.ts` становится публичной точкой входа движка; остальные модули — приватными
- Зависимости: `vite`, `typescript`, `vite-plugin-singlefile`, `eslint`, `prettier`
