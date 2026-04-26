# Сборка и публикация

## Web-сборка (single-file HTML)

Самый простой способ распространения игры — один HTML-файл, который работает в любом браузере без сервера.

```bash
npm run build
```

Результат: `dist/index.html` — весь JS и CSS встроен внутрь. Файл можно открыть напрямую через `file://` или опубликовать на itch.io, Netlify, GitHub Pages и т.д.

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
- Windows: `.msi` и `.exe` (NSIS installer)
- macOS: `.dmg` и `.app`
- Linux: `.deb`, `.rpm`, `.AppImage`

### Настройка перед релизом

Перед публикацией обновите в `src-tauri/tauri.conf.json`:
- `identifier` — уникальный bundle ID вашей игры (например, `com.yourstudio.mygame`)
- `productName` — название игры
- `version` — версия
- `app.windows[0].title` — заголовок окна

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
| `npm run build` | Web-сборка в `dist/index.html` |
| `npm run build:tauri-web` | Frontend для Tauri в `dist-tauri/` |
| `npm run tauri:dev` | Dev-режим с нативным окном |
| `npm run tauri:build` | Desktop-установщик |
| `npm run tauri:android` | Android APK/AAB |
