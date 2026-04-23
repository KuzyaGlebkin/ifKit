## 1. Перенос авторских файлов в src/

- [x] 1.1 Переместить `game.ts` → `src/game.ts`
- [x] 1.2 Переместить `scenes.ts` → `src/scenes.ts`
- [x] 1.3 Переместить `state.ts` → `src/state.ts`
- [x] 1.4 Переместить `style.css` → `src/style.css`
- [x] 1.5 Переместить `index.html` → `src/index.html`

## 2. Обновление импортов в авторских файлах

- [x] 2.1 В `src/game.ts` заменить `./src/ifKit` → `./ifKit`
- [x] 2.2 В `src/scenes.ts` заменить `./src/ifKit` → `./ifKit`
- [x] 2.3 В `src/state.ts` заменить `./src/ifKit` → `./ifKit`
- [x] 2.4 В `src/index.html` обновить пути к скриптам и стилям если нужно

## 3. Настройка Vite

- [x] 3.1 В `vite.config.ts` добавить `root: 'src'`
- [x] 3.2 В `vite.config.ts` установить `build.outDir: '../dist'` (путь относительно нового root)
- [x] 3.3 Проверить, что `npm run build` создаёт `dist/index.html`
- [x] 3.4 Проверить, что `npm run dev` поднимает сервер и HMR работает

## 4. Проверка конфигов

- [x] 4.1 Убедиться, что `tsconfig.json` включает `src/` в компиляцию (обычно уже включено)
- [x] 4.2 Проверить `eslint.config.js` — `src/` должна покрываться линтером
- [x] 4.3 Проверить `.prettierignore` — авторские файлы не должны быть исключены
