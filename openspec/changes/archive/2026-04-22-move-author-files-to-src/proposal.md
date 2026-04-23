## Why

Файлы автора (`game.ts`, `scenes.ts`, `state.ts`, `style.css`, `index.html`) лежат в корне проекта вперемешку с `README.md`, `docs/`, конфигами (`tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `package.json`). Автор вынужден постоянно «видеть» технический мусор, хотя ему важна только его рабочая зона.

## What Changes

- Файлы автора перемещаются из корня в `src/`: `game.ts` → `src/game.ts`, `scenes.ts` → `src/scenes.ts`, `state.ts` → `src/state.ts`, `style.css` → `src/style.css`, `index.html` → `src/index.html`
- Файлы движка остаются в `src/ifKit/` — ничего не меняется
- Vite настраивается на точку входа `src/index.html`
- Импорты в авторских файлах и в `src/ifKit/` обновляются под новые пути
- README и проектные конфиги остаются в корне — автор их просто не трогает

## Capabilities

### New Capabilities

_(нет новых capabilities)_

### Modified Capabilities

- `project-scaffold`: меняется структура каталогов — авторские файлы переезжают из корня в `src/`, требования к расположению файлов обновляются
- `build-config`: точка входа Vite меняется с корневого `index.html` на `src/index.html`

## Impact

- `vite.config.ts` — добавить `root: 'src'` или явный `input: 'src/index.html'`
- `src/game.ts`, `src/scenes.ts`, `src/state.ts`, `src/style.css`, `src/index.html` — новые пути авторских файлов
- Импорты движка внутри авторских файлов — пути могут измениться (например, `./src/ifKit` → `./ifKit`)
- `tsconfig.json` — возможно нужна правка `rootDir` / `include`
- `.prettierignore`, `.gitignore` — проверить, не захватывают ли `src/` лишнее
