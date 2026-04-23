## ADDED Requirements

### Requirement: Схема настроек v1
Движок SHALL определять тип `Settings` с полями: `theme: 'light' | 'dark' | 'system'`, `fontSize: number` (множитель 0.8–1.4), `musicVolume: number` (0–1), `soundVolume: number` (0–1).

#### Scenario: Тип Settings статически проверяется
- **WHEN** код пытается записать `{ theme: 'auto' }` как Settings
- **THEN** TypeScript выдаёт ошибку компиляции

### Requirement: Движковые умолчания настроек
Движок SHALL определять константу `engineDefaults: Settings` со значениями: `theme: 'system'`, `fontSize: 1.0`, `musicVolume: 0.8`, `soundVolume: 1.0`.

#### Scenario: engineDefaults покрывают все поля Settings
- **WHEN** `engineDefaults` используется как fallback
- **THEN** результирующий объект является валидным `Settings` без undefined-полей

### Requirement: Авторские умолчания через GameConfig
`defineGame()` SHALL принимать необязательное поле `settings: Partial<Settings>`. Движок SHALL сливать его с `engineDefaults` (авторские значения имеют приоритет) и использовать результат как `authorDefaults`.

#### Scenario: Авторское поле theme перекрывает движковое
- **WHEN** автор передаёт `settings: { theme: 'dark' }`
- **THEN** `authorDefaults.theme === 'dark'`, остальные поля из `engineDefaults`

#### Scenario: Отсутствие поля settings в GameConfig
- **WHEN** автор не передаёт `settings` в `defineGame()`
- **THEN** `authorDefaults` равен `engineDefaults`

### Requirement: Загрузка настроек из хранилища
Функция `loadSettings(authorDefaults)` SHALL читать `ifkit:settings` через Storage Layer. Если ключ отсутствует или данные невалидны — возвращать `authorDefaults`.

#### Scenario: Первый запуск без сохранённых настроек
- **WHEN** в хранилище нет ключа `ifkit:settings`
- **THEN** `loadSettings()` возвращает `authorDefaults`

#### Scenario: Повторный запуск с сохранёнными настройками
- **WHEN** в хранилище есть `ifkit:settings: { theme: 'dark', fontSize: 1.2, ... }`
- **THEN** `loadSettings()` возвращает эти значения

### Requirement: Применение настроек к DOM
Функция `applySettings(settings)` SHALL применять настройки к DOM: для `theme` — устанавливать `data-theme` на `<html>` (`'light'` / `'dark'`) или убирать атрибут (`'system'`); для `fontSize` — устанавливать CSS-переменную `--ifk-font-size-base` на `:root` как `${fontSize}rem`.

#### Scenario: Тёмная тема устанавливает data-theme
- **WHEN** `applySettings({ theme: 'dark', ... })`
- **THEN** `document.documentElement.dataset.theme === 'dark'`

#### Scenario: Системная тема убирает data-theme
- **WHEN** `applySettings({ theme: 'system', ... })`
- **THEN** атрибут `data-theme` на `<html>` отсутствует

#### Scenario: fontSize применяется как CSS-переменная
- **WHEN** `applySettings({ fontSize: 1.2, ... })`
- **THEN** `:root` имеет `--ifk-font-size-base: 1.2rem`

### Requirement: Сброс к авторским умолчаниям
Функция `resetSettings(authorDefaults)` SHALL сохранять `authorDefaults` в хранилище и применять их к DOM.

#### Scenario: Сброс восстанавливает авторские значения
- **WHEN** пользователь нажимает «Сбросить настройки» и подтверждает
- **THEN** все настройки возвращаются к `authorDefaults` и изменения видны немедленно

### Requirement: Поля громкости — заглушки
Поля `musicVolume` и `soundVolume` SHALL храниться и отображаться в UI, но не влиять на воспроизведение звука до реализации Этапа 6. Аудиомодуль Этапа 6 SHALL самостоятельно читать эти значения из `loadSettings()` при инициализации.

#### Scenario: Изменение громкости в UI сохраняется
- **WHEN** пользователь перемещает ползунок музыки
- **THEN** значение сохраняется в `ifkit:settings`, но звук не изменяется