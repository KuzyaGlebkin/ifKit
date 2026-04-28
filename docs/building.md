# Сборка и публикация

## Web-сборка (single-file HTML)

Самый простой способ распространения игры — один HTML-файл, который работает в любом браузере без сервера.

```bash
npm run build
```

Результат: в `dist/` один файл с именем `<name>_<version>.html`, где `name` и `version` — поля корневого `package.json` (для шаблона по умолчанию — `ifkit_0.1.0.html`); весь JS и CSS встроен внутрь. Рядом может лежать хэшированный SVG favicon. Файл можно открыть напрямую через `file://` или опубликовать на itch.io, Netlify, GitHub Pages и т.д.

---

## Desktop-сборка (Tauri)

Tauri оборачивает игру в нативное приложение для Windows, macOS и Linux.

### Требования

- [Rust](https://rustup.rs/) (stable)
- Системные зависимости Tauri:
  - **Windows**: Microsoft Visual Studio C++ Build Tools, WebView2 (обычно уже есть в Windows 11)
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: `libwebkit2gtk-4.1-dev`, `libssl-dev` и другие — полный список в [документации Tauri](https://v2.tauri.app/start/prerequisites/#linux)

### Запуск в dev-режиме

```bash
npm run tauri:dev
```

Открывает нативное окно поверх Vite dev-сервера. Используйте для отладки поведения, специфичного для Tauri.

### Сборка установщика

```bash
npm run tauri:build
```

Результат в `src-tauri/target/release/bundle/`:
- Windows: MSI (имя начинается с `<name>_<version>_x64`, по умолчанию WiX добавляет суффикс языка, например `_en-US.msi`) и NSIS `<name>_<version>_x64-setup.exe`
- macOS: `.dmg` и `.app`
- Linux: `.deb`, `.rpm`, `.AppImage`

Имена установщиков на Windows строятся от `productName` и версии в `tauri.conf.json`; в репозитории `productName` совпадает с полем `name` из `package.json`, а `version` указывает на тот же `package.json`, чтобы префиксы файлов совпадали с npm-манифестом.

### Иконки приложения и favicon

Один векторный мастер: **`src/ifk-favicon.svg`** — и для вкладки/WebView, и для нативных иконок Tauri.

- **Квадратный артборд** (`viewBox` с равной шириной и высотой) обязателен: команда [`tauri icon`](https://v2.tauri.app/develop/icons/) ожидает квадрат; иначе растровые размеры в `src-tauri/icons/` получаются с искажением.
- **Вручную** после правок SVG: `npm run icons:tauri` — пересобирает `src-tauri/icons/` из `src/ifk-favicon.svg`.
- **Автоматически** при `tauri build`: в `tauri.conf.json` в `beforeBuildCommand` уже вызывается `npm run icons:tauri` перед `npm run build:tauri-web`.

### Настройка перед релизом

Перед публикацией обновите в `src-tauri/tauri.conf.json`:
- `identifier` — уникальный bundle ID вашей игры (например, `com.yourstudio.mygame`)
- `productName` — имя для bundle (для согласованности с web держите равным `name` из `package.json`, если важны имена файлов установщиков)
- `mainBinaryName` — имя исполняемого файла (в шаблоне совпадает с `name` из `package.json`)
- `version` — версия; допустимо значение `../package.json`, чтобы не дублировать semver
- `app.windows[0].title` — заголовок окна (может отличаться от `productName`, например «ifKit Game»)

---

## Android-сборка (Tauri)

### Требования

- [Android Studio](https://developer.android.com/studio) с установленным SDK
- Android SDK API level 24+ (Android 7.0+)
- Android NDK (через Android Studio → SDK Manager → SDK Tools → NDK)
- Переменные окружения:
  ```
  ANDROID_HOME = C:\Users\<user>\AppData\Local\Android\Sdk  (Windows)
  NDK_HOME = %ANDROID_HOME%\ndk\<version>
  ```
  На macOS/Linux: `~/Library/Android/sdk` и `~/Android/Sdk` соответственно
- Rust Android targets:
  ```bash
  rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android
  ```

### Инициализация (один раз)

```bash
npx tauri android init
```

### Сборка APK/AAB

```bash
npm run tauri:android
```

Результат в `src-tauri/gen/android/app/build/outputs/`.

### Примечания

- Минимальная версия Android: 7.0 (API 24)
- Аудио в Android WebView требует пользовательского жеста перед воспроизведением — это стандартное ограничение браузера, игроки привыкли нажать экран перед стартом

---

## Локализация: `*.game.json` и `*.ui.json`

Игровые строки (`t`, сцены, кнопки `act` / `goto`) из авторского кода (`src/`, без `src/ifKit/`) собираются в **`src/locales/template.game.json`** командой `npm run i18n:extract` (скрипт `extract-game-i18n.mjs`). Этот файл статически импортируется в движке (`src/ifKit/locale-templates.ts`), поэтому отдельный импорт в `game.ts` ради попадания ключей в бандл не нужен. Движок подмешивает ключи из шаблона к каждому переданному в `defineGame` языку; переводы для конкретного кода можно хранить в `src/locales/<код>.game.json` (в т.ч. пустой `{}`, если достаточно шаблона) или только в `game` внутри `locales`.

Опциональное поле `meta: { title, description? }` в `defineGame` задаёт заголовок и краткое описание на полноэкранном стартовом меню сессии (до первой сцены); при отсутствии `title` используется заголовок документа (`document.title`).

Пара **`template.ui.json`** синхронизируется с `UiKey` вместе с остальными `*.ui.json`: для каждого `*.game.json` в каталоге `locales` скрипт обновляет соответствующий `*.ui.json`.

Системный интерфейс движка (панель, модалки настроек и сохранений) идёт через `u()` со **стабильными ключами** вида `ui.…` (см. `src/ifKit/ui-keys.ts`). В движке есть встроенные строки не для всех языков: если для кода языка нет слоя в `BUILTIN_UI`, до заполнения авторского UI подставляется **английский** из встроенного fallback. Чтобы переводить chrome для выбранного кода, рядом с игровым файлом хранится **`src/locales/<код>.ui.json`** с теми же парами «ключ — строка», и в `defineGame` передаётся `locales: { <код>: { game: …, ui: … } }`.

Ключи `*.ui.json` синхронизируются с перечислением `UiKey` скриптом `extract-ui-i18n.mjs` (тот же `npm run i18n:extract`, сразу после извлечения игровых строк). **Новым** ключам в JSON присваивается пустая строка `""`: при merge в движке такие значения **не** перекрывают встроенный `BUILTIN_UI` и встроенный fallback — это черновик к переводу. Любой новый `*.game.json` **должен** иметь пару `*.ui.json` (или создаться повторным `i18n:extract`). Если в каталоге ещё нет ни одного `*.game.json`, `extract-ui` создаёт пустой `template.game.json` и продолжает синхронизацию.

---

## Steam Auto-Cloud

При использовании Tauri-сборки данные хранятся в `appDataDir`:
- **Windows**: `%APPDATA%\<bundle-identifier>\`
- **macOS**: `~/Library/Application Support/<bundle-identifier>/`
- **Linux**: `~/.local/share/<bundle-identifier>/`

Файл хранилища: `ifkit-store.json`

### Настройка в Steamworks

В Steamworks Developer → ваше приложение → Steam Cloud:
1. Включите Steam Auto-Cloud
2. Добавьте путь (Windows): `%AppData%\<bundle-identifier>\*`
3. Для каждой платформы укажите соответствующий путь выше

Замените `<bundle-identifier>` на значение `identifier` из вашего `tauri.conf.json`.

---

## Краткая справка по скриптам

| Команда | Описание |
|---|---|
| `npm run build` | Web-сборка: один `<name>_<version>.html` в `dist/` |
| `npm run build:tauri-web` | Frontend для Tauri в `dist-tauri/` |
| `npm run tauri:dev` | Dev-режим с нативным окном |
| `npm run tauri:build` | Desktop-установщик |
| `npm run tauri:android` | Android APK/AAB |
| `npm run icons:tauri` | PNG/ICO/ICNS в `src-tauri/icons/` из `src/ifk-favicon.svg` |
| `npm run i18n:extract` | Синхронизация ключей `src/locales/*.game.json` с кодом + `src/locales/*.ui.json` с `ui-keys` |
| `npm run i18n:extract-game` / `i18n:extract-ui` | Только игровой или только UI-слой |
