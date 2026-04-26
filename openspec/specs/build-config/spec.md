## ADDED Requirements

### Requirement: Сборка в single-file HTML
Проект SHALL собираться командой `npm run build` в один самодостаточный `index.html` с инлайн JavaScript и CSS, не требующий веб-сервера для запуска.

#### Scenario: Успешная сборка
- **WHEN** разработчик выполняет `npm run build`
- **THEN** в каталоге `dist/` появляется единственный файл `index.html` со всем JS и CSS внутри

#### Scenario: Файл открывается без сервера
- **WHEN** пользователь открывает `dist/index.html` напрямую в браузере (через `file://`)
- **THEN** игра загружается и работает без ошибок в консоли

### Requirement: Режим разработки с горячей перезагрузкой
Проект SHALL поддерживать команду `npm run dev`, запускающую dev-сервер Vite с горячей перезагрузкой модулей (HMR).

#### Scenario: Dev-сервер запускается
- **WHEN** разработчик выполняет `npm run dev`
- **THEN** Vite запускает локальный сервер и выводит адрес (например, `http://localhost:5173`)

#### Scenario: Изменения отражаются без перезапуска
- **WHEN** разработчик сохраняет изменение в `src/game.ts` или `src/scenes.ts`
- **THEN** браузер обновляет страницу автоматически без ручного рефреша

### Requirement: TypeScript как основной язык
Проект SHALL компилировать TypeScript без ошибок с включённым строгим режимом (`strict: true`).

#### Scenario: Строгая типизация включена
- **WHEN** разработчик проверяет `tsconfig.json`
- **THEN** в нём установлен `"strict": true`

#### Scenario: Компиляция проходит без ошибок
- **WHEN** разработчик выполняет `npm run build`
- **THEN** TypeScript не выдаёт ошибок типизации для кода шаблона

### Requirement: Tauri-сборка frontend через отдельный npm-скрипт
`package.json` SHALL содержать скрипт `build:tauri-web`, который выполняет `tsc && vite build --config vite.config.tauri.ts` и выводит результат в `dist-tauri/`.

#### Scenario: build:tauri-web создаёт правильный outDir
- **WHEN** разработчик выполняет `npm run build:tauri-web`
- **THEN** в `dist-tauri/` появляется `index.html` и директория `assets/`; `dist/` не затрагивается

### Requirement: Web-сборка не включает Tauri-зависимости
В web-сборке (`npm run build`) alias `@ifkit-storage` SHALL указывать на `local.ts`. Пакеты `@tauri-apps/plugin-store`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs` SHALL отсутствовать в `dist/index.html`.

#### Scenario: Web-бандл не содержит кода Tauri
- **WHEN** разработчик выполняет `npm run build` и инспектирует `dist/index.html`
- **THEN** в файле отсутствуют строки, связанные с `@tauri-apps`

### Requirement: Favicon в артефактах web и tauri-web

Команда `npm run build` SHALL производить `dist/index.html`, в котором объявлен favicon (элемент `<link rel="icon" ...>`), удовлетворяющий требованиям `app-branding`, со ссылкой на SVG, **содержимое которого** соответствует `src/ifk-favicon.svg` (Vite MAY вывести хэшированное имя файла рядом с `index.html` в `dist/`). Команда `npm run build:tauri-web` SHALL производить `dist-tauri/index.html` с тем же смыслом favicon (отдельный файл ассета в `dist-tauri/assets/` допустим).

#### Scenario: Web-сборка и favicon

- **WHEN** разработчик выполняет `npm run build` и открывает `dist/index.html` (и при необходимости соседний выведенный `.svg` из той же папки `dist/`)
- **THEN** браузер показывает favicon во вкладке без 404 на ресурс иконки

#### Scenario: Tauri frontend dist

- **WHEN** разработчик выполняет `npm run build:tauri-web`
- **THEN** `dist-tauri/index.html` ссылается на favicon способом, валидным для локального загрузчика Tauri (относительный путь или data URL)
