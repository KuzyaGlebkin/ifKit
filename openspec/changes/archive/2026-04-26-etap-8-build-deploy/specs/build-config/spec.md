## ADDED Requirements

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
