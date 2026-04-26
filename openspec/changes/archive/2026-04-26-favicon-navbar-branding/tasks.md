## 1. Favicon (web + tauri-web)

- [x] 1.1 Добавить компактный production SVG favicon (белый силуэт на тёмном фоне) по мотивам `docs/if_fav.svg`, без лишних Inkscape-пространств имён; зафиксировать путь в репозитории (например под `src/`).
- [x] 1.2 Подключить favicon в `src/index.html`: для single-file — `data:image/svg+xml` (URL-encoded) или другой способ, гарантирующий работу из единственного `dist/index.html`; для tauri-web — согласованный `<link>` (относительный ассет допустим).
- [x] 1.3 Убедиться, что `npm run build` и `npm run build:tauri-web` проходят, вкладка показывает иконку.

## 2. Логотип в `#controls`

- [x] 2.1 Вставить в `src/index.html` в начало `#controls` блок логотипа: inline SVG из `docs/logo.svg` с `fill="currentColor"` (или эквивалент), обёртка с `color: var(--ifk-color-accent)`.
- [x] 2.2 В `src/style.css`: размеры (`max-height`/`height` в `rem`), отступы, выравнивание с кнопками; не ломать существующий flex `#controls`.
- [x] 2.3 Доступность: `aria-label` на обёртке (например «ifKit»), `aria-hidden="true"` на декоративном SVG; без лишнего Tab-стопа.

## 3. Tauri нативные иконки

- [x] 3.1 Подготовить квадратный мастер (PNG или SVG) из того же бренда, что и favicon.
- [x] 3.2 Перегенерировать `src-tauri/icons/*` через `@tauri-apps/cli icon`, не меняя структуру массива `icon` в `tauri.conf.json` (только заменить файлы).
- [x] 3.3 Проверить `npm run tauri:build` (или минимум `cargo check` в `src-tauri`), что пути иконок валидны.

## 4. Спеки и приёмка

- [x] 4.1 После реализации — `openspec archive` (или согласованный workflow): слить дельты `app-branding`, `build-config`, `tauri-integration` в `openspec/specs/`.
- [x] 4.2 Ручная приёмка: dev, `dist/index.html` по `file://`, tauri dev — favicon + цвет логотипа при смене темы/акцента.
