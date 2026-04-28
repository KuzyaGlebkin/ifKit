## ADDED Requirements

### Requirement: Обратная совместимость quietMusicForScreenReader

Если в сохранённом объекте настроек отсутствует `quietMusicForScreenReader`, `loadSettings` SHALL трактовать отсутствующее поле как `false` после слияния с `authorDefaults`.

#### Scenario: Старый JSON без quietMusicForScreenReader

- **WHEN** в хранилище есть валидные настройки без ключа `quietMusicForScreenReader`
- **THEN** результат `loadSettings` содержит `quietMusicForScreenReader: false` (или значение из `authorDefaults`, если автор явно задал в `GameConfig`)

## MODIFIED Requirements

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
