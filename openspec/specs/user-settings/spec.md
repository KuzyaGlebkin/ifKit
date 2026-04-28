## ADDED Requirements

### Requirement: Схема настроек v1
Движок SHALL определять тип `Settings` с полями: `theme: 'light' | 'dark' | 'system'`, `fontSize: number` (множитель 0.8–1.4), `musicVolume: number` (0–1), `soundVolume: number` (0–1), `musicMuted: boolean`, `soundMuted: boolean`, `quietMusicForScreenReader: boolean` (снижать **эффективную** громкость фоновой музыки для лучшей слышимости скринридера, без изменения сохранённого `musicVolume`), `language: string` (код языка или пустая строка для автоопределения), `showUnseenHighlight: boolean` (подсвечивать блоки контента, которые игрок ещё не видел), `accent: AccentPreset` — перечисление фиксированного набора (в коде: не менее `default` и нескольких именованных вариантов).

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

#### Scenario: musicMuted и soundMuted — boolean
- **WHEN** код записывает `{ musicMuted: true, soundMuted: false }` как часть Settings
- **THEN** TypeScript принимает без ошибок

#### Scenario: quietMusicForScreenReader — boolean
- **WHEN** код записывает `{ quietMusicForScreenReader: true }` как часть Settings
- **THEN** TypeScript принимает без ошибок

### Requirement: Движковые умолчания настроек
Движок SHALL определять константу `engineDefaults: Settings` со значениями: `theme: 'system'`, `fontSize: 1.0`, `musicVolume: 0.8`, `soundVolume: 1.0`, `musicMuted: false`, `soundMuted: false`, `quietMusicForScreenReader: false`, `language: ''`, `accent: 'default'`.

#### Scenario: engineDefaults покрывают все поля Settings
- **WHEN** `engineDefaults` используется как fallback
- **THEN** результирующий объект является валидным `Settings` без undefined-полей

#### Scenario: language по умолчанию — пустая строка
- **WHEN** читается `engineDefaults.language`
- **THEN** значение `''` (автоопределение согласно i18n)

#### Scenario: accent по умолчанию — default
- **WHEN** читается `engineDefaults.accent`
- **THEN** значение `default` (инлайн на `--ifk-color-accent` не требуется: см. `applySettings` / `ui-theming`)

#### Scenario: mute по умолчанию выключен
- **WHEN** читаются `engineDefaults.musicMuted` и `engineDefaults.soundMuted`
- **THEN** оба значения `false`

#### Scenario: quietMusicForScreenReader по умолчанию выключен
- **WHEN** читается `engineDefaults.quietMusicForScreenReader`
- **THEN** значение `false`

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

`applySettings` **после** инициализации i18n SHALL вызывать `syncRootLangFromI18n`, чтобы `document.documentElement.lang` согласовывался с resolved-языком i18n.

#### Scenario: applySettings обновляет lang
- **WHEN** i18n инициализирован и вызывается `applySettings` с валидными `Settings`
- **THEN** атрибут `lang` на `<html>` согласован с активным resolved языком (через `syncRootLangFromI18n`)

### Requirement: Сброс к авторским умолчаниям
Функция `resetSettings(authorDefaults)` SHALL сохранять `authorDefaults` в хранилище и применять их к DOM.

#### Scenario: Сброс восстанавливает авторские значения
- **WHEN** пользователь нажимает «Сбросить настройки» и подтверждает
- **THEN** все настройки возвращаются к `authorDefaults` и изменения видны немедленно

### Requirement: Поля громкости подключены к аудиодвижку
Поля `musicVolume` и `soundVolume` SHALL активно управлять **номинальной** громкостью воспроизведения. Поля `musicMuted` и `soundMuted` SHALL активно управлять **фактическим** отключением соответствующей ветки без изменения номинальных значений ползунков в хранилище. Поле `quietMusicForScreenReader` SHALL активно влиять на **эффективную** громкость музыки согласно `audio-engine` (множитель к номиналу при незаглушенной музыке), **не** изменяя сохранённый `musicVolume`. При изменении любого из этих полей через UI настроек движок SHALL немедленно приводить аудиомодуль в соответствие (вызовы `setMusicVolume` / `setSoundVolume`, `setMusicMuted` / `setSoundMuted`, `setQuietMusicForScreenReader` согласно `audio-engine`). Если аудиодвижок не инициализирован (AudioContext не создан) — вызов является no-op для гейна. При инициализации аудиодвижка он SHALL читать текущие значения из `loadSettings()` и устанавливать начальные **эффективные** значения мастер-гейнов с учётом mute и `quietMusicForScreenReader`.

#### Scenario: Изменение слайдера музыки немедленно влияет на воспроизведение
- **WHEN** пользователь перемещает слайдер музыки с 0.8 до 0.4 во время воспроизведения трека и музыка не заглушена
- **THEN** громкость трека изменяется немедленно без перезапуска

#### Scenario: Изменение слайдера звуков влияет на следующие Sound-вызовы
- **WHEN** пользователь устанавливает `soundVolume: 0.0` и нажимает кнопку действия с `Sound()`
- **THEN** звуковой эффект не слышен

#### Scenario: Громкость при старте берётся из сохранённых настроек
- **WHEN** игра запускается, пользователь ранее установил `musicVolume: 0.5` и `musicMuted: false`
- **THEN** при первом воспроизведении музыки эффективное значение мастер-гейна музыки соответствует `0.5`, дополнительно умноженное на `α` если `quietMusicForScreenReader` истинно

#### Scenario: setMusicVolume до инициализации AudioContext не вызывает ошибок
- **WHEN** пользователь открывает настройки и двигает слайдер до первого взаимодействия со звуком
- **THEN** функция завершается без ошибки; DOM-слайдер обновляется корректно

#### Scenario: Mute музыки не затирает musicVolume в хранилище
- **WHEN** пользователь установил `musicVolume: 0.7`, затем включил `musicMuted: true`, затем выключил `musicMuted`
- **THEN** в хранилище по-прежнему `musicVolume: 0.7` и слышимость соответствует 70% (с учётом `quietMusicForScreenReader` и `α`) после снятия mute

#### Scenario: Mute звуков не затирает soundVolume
- **WHEN** пользователь установил `soundVolume: 0.5`, включил `soundMuted: true`, затем выключил `soundMuted` и вызывает `Sound()`
- **THEN** эффект слышен с громкостью согласно `0.5`

#### Scenario: Включение quietMusicForScreenReader не затирает musicVolume
- **WHEN** пользователь установил `musicVolume: 0.7`, затем включил `quietMusicForScreenReader: true`, затем выключил `quietMusicForScreenReader`
- **THEN** в хранилище по-прежнему `musicVolume: 0.7`; при снятии флага слышимость возвращается к `0.7` (при отключённом mute)

### Requirement: Обратная совместимость полей mute при загрузке
Если в сохранённом объекте настроек отсутствуют `musicMuted` или `soundMuted`, `loadSettings` SHALL трактовать отсутствующее поле как `false` после слияния с `authorDefaults`.

#### Scenario: Старый JSON без mute
- **WHEN** в хранилище есть валидные настройки без ключей `musicMuted` / `soundMuted`
- **THEN** результат `loadSettings` содержит `musicMuted: false` и `soundMuted: false` (или значения из `authorDefaults`, если автор их задал)

### Requirement: Обратная совместимость quietMusicForScreenReader

Если в сохранённом объекте настроек отсутствует `quietMusicForScreenReader`, `loadSettings` SHALL трактовать отсутствующее поле как `false` после слияния с `authorDefaults`.

#### Scenario: Старый JSON без quietMusicForScreenReader

- **WHEN** в хранилище есть валидные настройки без ключа `quietMusicForScreenReader`
- **THEN** результат `loadSettings` содержит `quietMusicForScreenReader: false` (или значение из `authorDefaults`, если автор явно задал в `GameConfig`)

### Requirement: Значение `accent` в сбросе и authorDefaults
Функция `resetSettings(authorDefaults)` **и** слияние `authorDefaults` SHALL **включать** `accent` так же, как остальные поля (т.е. автор может **не** указывать в `GameConfig` — **движковый** `default`).

#### Scenario: Сброс с авторским default accent
- **WHEN** автор задал `settings: { accent: 'blue' }` в config, игрок **сменил** в UI и нажал «Сбросить настройки»
- **THEN** `authorDefaults.accent` (например `'blue'`) восстанавливается

### Requirement: Миграция устаревшего значения `accent: 'violet'`

Движок SHALL при нормализации/слиянии настроек, прочитанных из хранилища (или иного внешнего JSON), преобразовывать `accent: 'violet'` в `accent: 'orange'`, поскольку перечислимый пресет `violet` заменён на `orange`. Тип `AccentPreset` SHALL NOT содержать `'violet'`.

#### Scenario: Старый сейв с violet становится orange

- **WHEN** из хранилища получен объект, где `accent` равен `'violet'`
- **THEN** после нормализации значение `accent` в результате `loadSettings` (или эквивалентного пути) равно `'orange'`

#### Scenario: Нормальный сейв с orange

- **WHEN** в хранилище сохранено `accent: 'orange'`
- **THEN** значение **не** меняется на другой пресет