## 1. Инициализация репозитория

- [x] 1.1 Создать проект через `npm create vite@latest` с шаблоном `vanilla-ts`
- [x] 1.2 Удалить лишние файлы шаблона Vite (`counter.ts`, `typescript.svg` и т.п.)
- [x] 1.3 Настроить `tsconfig.json`: включить `strict: true`, настроить `paths` и `include`

## 2. Конфигурация сборки

- [x] 2.1 Установить `vite-plugin-singlefile` и добавить в `vite.config.ts`
- [x] 2.2 Настроить `vite.config.ts`: `build.target`, `build.outDir`, подключить плагин `viteSingleFile`
- [x] 2.3 Проверить сборку командой `npm run build` — убедиться, что `dist/index.html` является standalone-файлом

## 3. Линтер и форматтер

- [x] 3.1 Установить ESLint, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
- [x] 3.2 Создать `eslint.config.js` с правилами для TypeScript
- [x] 3.3 Установить Prettier, создать `.prettierrc` с базовой конфигурацией
- [x] 3.4 Добавить скрипты `lint` и `format` в `package.json`
- [x] 3.5 Проверить: `npm run lint` проходит без ошибок, `npm run format` форматирует файлы

## 4. Структура каталогов движка

- [x] 4.1 Создать каталог `src/ifKit/` и заглушки для всех модулей: `renderer.ts`, `scenes.ts`, `state.ts`, `saves.ts`, `audio.ts`, `i18n.ts`, `layout.ts`, `transitions.ts`, `snackbar.ts`, `settings.ts`
- [x] 4.2 Создать `src/ifKit/index.ts` — публичная точка экспорта (пока экспортирует только `defineGame`)
- [x] 4.3 Создать каталоги `assets/audio/` и `assets/images/` с `.gitkeep`

## 5. Скелет index.html и style.css

- [x] 5.1 Создать `index.html` с минимальным каркасом: `<nav id="controls">` (кнопки `btn-undo`, `btn-redo`, `btn-saves`, `btn-settings`) и `<div id="content">`
- [x] 5.2 Создать `style.css` с базовым CSS-сбросом и минимальными стилями оболочки
- [x] 5.3 Подключить `style.css` в `index.html`, проверить что страница открывается без ошибок

## 6. Шаблон game.ts и API defineGame

- [x] 6.1 Реализовать функцию-заглушку `defineGame()` в `src/ifKit/index.ts` с типом параметра (`state`, `static?`, `scenes`)
- [x] 6.2 Создать `state.ts` с `initialState` и `export type GameState = typeof initialState`
- [x] 6.3 Создать `scenes.ts` с примером двух сцен (`start`, `clearing`), импортирующих `GameState` из `./state`
- [x] 6.4 Создать `game.ts` с вызовом `defineGame({ state: initialState, scenes })` и статичной функцией
- [x] 6.5 Проверить: TypeScript компилируется без ошибок, циклических импортов нет

## 7. README с минимальным примером

- [x] 7.1 Создать `README.md` с описанием проекта, структурой каталогов и минимальным примером игры
- [x] 7.2 Добавить раздел «Начало работы»: как скачать, как запустить dev-сервер, как собрать
- [x] 7.3 Добавить раздел «Структура проекта» с описанием файлов автора (`game.ts`, `scenes.ts`, `state.ts`)
