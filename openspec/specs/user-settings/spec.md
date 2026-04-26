## ADDED Requirements

### Requirement: Схема настроек v1
Движок SHALL определять тип `Settings` с полями: `theme: 'light' | 'dark' | 'system'`, `fontSize: number` (множитель 0.8–1.4), `musicVolume: number` (0–1), `soundVolume: number` (0–1), `language: string` (код языка или пустая строка для автоопределения), `showUnseenHighlight: boolean` (подсвечивать блоки контента, которые игрок ещё не видел), `accent: AccentPreset` — перечисление фиксированного набора (в коде: не менее `default` и нескольких именованных вариантов).

#### Scenario: Тип Settings статически проверяется
- **WHEN** код пытается записать `{ theme: 'auto' }` как Settings
- **THEN** TypeScript выдаёт ошибку компиляции

#### Scenario: language принимает код языка
- **WHEN** код записывает `{ language: 'en' }` как часть Settings
- **THEN** TypeScript принимает без ошибок

#### Scenario: language принимает пустую строку
- **WHEN** код записывает `{ language: '' }` как часть Settings
- **THEN** TypeScript принимает без ошибок

#### Scenario: accent в объекте настроек
- **WHEN** код передаёт `{ accent: 'default' }` как валидный `accent`
- **THEN** TypeScript принимает без ошибок; нелегальный идентификатор **не** проходит (если union-тип)

### Requirement: Движковые умолчания настроек
Движок SHALL определять константу `engineDefaults: Settings` со значениями: `theme: 'system'`, `fontSize: 1.0`, `musicVolume: 0.8`, `soundVolume: 1.0`, `language: ''`, `accent: 'default'`.

#### Scenario: engineDefaults покрывают все поля Settings
- **WHEN** `engineDefaults` используется как fallback
- **THEN** результирующий объект является валидным `Settings` без undefined-полей

#### Scenario: language по умолчанию — пустая строка
- **WHEN** читается `engineDefaults.language`
- **THEN** значение `''` (автоопределение согласно i18n)

#### Scenario: accent по умолчанию — default
- **WHEN** читается `engineDefaults.accent`
- **THEN** значение `default` (инлайн на `--ifk-color-accent` не требуется: см. `applySettings` / `ui-theming`)

### Requirement: Движковые умолчания настроек — showUnseenHighlight
`engineDefaults.showUnseenHighlight` SHALL равняться `true`.

#### Scenario: showUnseenHighlight включён по умолчанию
- **WHEN** читается `engineDefaults.showUnseenHighlight`
- **THEN** значение `true`

#### Scenario: showUnseenHighlight принимает boolean
- **WHEN** код записывает `{ showUnseenHighlight: false }` как часть Settings
- **THEN** TypeScript принимает без ошибок

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
Функция `applySettings(settings)` SHALL применять настройки к DOM: для `theme` — устанавливать `data-theme` на `<html>` (`'light'` / `'dark'`) или убирать атрибут (`'system'`); для `fontSize` — устанавливать CSS-переменную `--ifk-font-size-base` на `:root` как `${fontSize}rem`. Для `accent` **не**-`default` — устанавливать `--ifk-color-accent` (и при необходимости `--ifk-color-accent-fg` для контраста) на `document.documentElement` из встроенного мапа пресетов. Для `default` — **снимать** эти инлайн-переопределения, чтобы применялись значения из `style.css` (согласуется с `ui-theming`).

#### Scenario: Тёмная тема устанавливает data-theme
- **WHEN** `applySettings({ theme: 'dark', ... })` с **прочей** валидной `Settings`
- **THEN** `document.documentElement.dataset.theme === 'dark'`

#### Scenario: Системная тема убирает data-theme
- **WHEN** `applySettings({ theme: 'system', ... })` с **прочей** валидной `Settings`
- **THEN** атрибут `data-theme` на `<html>` отсутствует

#### Scenario: fontSize применяется как CSS-переменная
- **WHEN** `applySettings({ fontSize: 1.2, ... })` с **прочей** валидной `Settings`
- **THEN** `:root` имеет `--ifk-font-size-base: 1.2rem`

#### Scenario: accent default не залипает
- **WHEN** `applySettings` вызывается с `accent: 'default'`
- **THEN** инлайн на `--ifk-color-accent` (и `accent-fg`, если писались) **снят**, чтобы работали `style.css` и `data-theme`

### Requirement: Сброс к авторским умолчаниям
Функция `resetSettings(authorDefaults)` SHALL сохранять `authorDefaults` в хранилище и применять их к DOM.

#### Scenario: Сброс восстанавливает авторские значения
- **WHEN** пользователь нажимает «Сбросить настройки» и подтверждает
- **THEN** все настройки возвращаются к `authorDefaults` и изменения видны немедленно

### Requirement: Поля громкости подключены к аудиодвижку
Поля `musicVolume` и `soundVolume` SHALL активно управлять воспроизведением звука. При изменении значения через UI настроек движок SHALL немедленно вызывать `setMusicVolume(v)` / `setSoundVolume(v)` из аудиомодуля. Если аудиодвижок не инициализирован (AudioContext не создан) — вызов является no-op. При инициализации аудиодвижка он SHALL читать текущие значения из `loadSettings()` и устанавливать начальную громкость мастер-узлов.

#### Scenario: Изменение слайдера музыки немедленно влияет на воспроизведение
- **WHEN** пользователь перемещает слайдер музыки с 0.8 до 0.4 во время воспроизведения трека
- **THEN** громкость трека изменяется немедленно без перезапуска

#### Scenario: Изменение слайдера звуков влияет на следующие Sound-вызовы
- **WHEN** пользователь устанавливает `soundVolume: 0.0` и нажимает кнопку действия с `Sound()`
- **THEN** звуковой эффект не слышен

#### Scenario: Громкость при старте берётся из сохранённых настроек
- **WHEN** игра запускается, пользователь ранее установил `musicVolume: 0.5`
- **THEN** при первом воспроизведении музыки `_masterMusicGain.gain.value === 0.5`

#### Scenario: setMusicVolume до инициализации AudioContext не вызывает ошибок
- **WHEN** пользователь открывает настройки и двигает слайдер до первого взаимодействия со звуком
- **THEN** функция завершается без ошибки; DOM-слайдер обновляется корректно

### Requirement: Значение `accent` в сбросе и authorDefaults
Функция `resetSettings(authorDefaults)` **и** слияние `authorDefaults` SHALL **включать** `accent` так же, как остальные поля (т.е. автор может **не** указывать в `GameConfig` — **движковый** `default`).

#### Scenario: Сброс с авторским default accent
- **WHEN** автор задал `settings: { accent: 'blue' }` в config, игрок **сменил** в UI и нажал «Сбросить настройки»
- **THEN** `authorDefaults.accent` (например `'blue'`) восстанавливается