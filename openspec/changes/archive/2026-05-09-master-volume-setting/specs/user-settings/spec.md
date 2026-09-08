## MODIFIED Requirements

### Requirement: Схема настроек v1
Движок SHALL определять тип `Settings` с полями: `theme: 'light' | 'dark' | 'system'`, `fontSize: number` (множитель 0.8–1.4), `masterVolume: number` (0–1), `masterMuted: boolean`, `musicVolume: number` (0–1), `soundVolume: number` (0–1), `musicMuted: boolean`, `soundMuted: boolean`, `language: string` (код языка или пустая строка для автоопределения), `showUnseenHighlight: boolean` (подсвечивать блоки контента, которые игрок ещё не видел), `accent: AccentPreset` — перечисление фиксированного набора (в коде: не менее `default` и нескольких именованных вариантов).

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

#### Scenario: masterMuted и masterVolume
- **WHEN** код записывает `{ masterMuted: false, masterVolume: 0.5 }` как часть Settings
- **THEN** TypeScript принимает без ошибок

### Requirement: Движковые умолчания настроек
Движок SHALL определять константу `engineDefaults: Settings` со значениями: `theme: 'system'`, `fontSize: 1.0`, `masterVolume: 1.0`, `masterMuted: false`, `musicVolume: 0.8`, `soundVolume: 1.0`, `musicMuted: false`, `soundMuted: false`, `language: ''`, `accent: 'default'`.

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

#### Scenario: общая громкость по умолчанию — полный уровень, без общего mute
- **WHEN** читаются `engineDefaults.masterVolume` и `engineDefaults.masterMuted`
- **THEN** `masterVolume === 1.0` и `masterMuted === false`

### Requirement: Поля громкости подключены к аудиодвижку
Поля `masterVolume` и `musicVolume`, `soundVolume` SHALL активно управлять **номинальными** уровнями согласно `audio-engine`. Поля `masterMuted`, `musicMuted` и `soundMuted` SHALL активно управлять **фактическим** отключением без изменения номинальных значений ползунков в хранилище. Эффективная слышимость SHALL быть произведением общего масштаба и пер-канальных номиналов и mute-факторов согласно `audio-engine`. При изменении любого из этих полей через UI настроек движок SHALL немедленно приводить аудиомодуль в соответствие (вызовы `setMasterVolume` / `setMasterMuted`, `setMusicVolume` / `setSoundVolume`, `setMusicMuted` / `setSoundMuted` согласно `audio-engine`). Если аудиодвижок не инициализирован (AudioContext не создан) — вызов является no-op для гейна. При инициализации аудиодвижок SHALL читать текущие значения из `loadSettings()` и устанавливать начальные **эффективные** значения с учётом всех перечисленных факторов.

#### Scenario: Изменение слайдера музыки немедленно влияет на воспроизведение
- **WHEN** пользователь перемещает слайдер музыки с 0.8 до 0.4 во время воспроизведения трека, музыка не заглушена на канале и общий звук включён
- **THEN** громкость трека изменяется немедленно без перезапуска

#### Scenario: Изменение слайдера звуков влияет на следующие Sound-вызовы
- **WHEN** пользователь устанавливает `soundVolume: 0.0` и нажимает кнопку действия с `Sound()`
- **THEN** звуковой эффект не слышен

#### Scenario: Громкость при старте берётся из сохранённых настроек
- **WHEN** игра запускается, пользователь ранее установил `musicVolume: 0.5`, `musicMuted: false`, `masterVolume: 1.0`, `masterMuted: false`
- **THEN** при первом воспроизведении музыки эффективная громкость соответствует полному произведению номиналов согласно `audio-engine`

#### Scenario: Общий ползунок масштабирует и музыку, и звуки
- **WHEN** воспроизводится музыка и звук, `masterMuted: false`, пользователь уменьшает `masterVolume` с `1.0` до `0.5`
- **THEN** обе ветки становятся тише согласно общему множителю без изменения сохранённых `musicVolume` и `soundVolume`

#### Scenario: setMusicVolume до инициализации AudioContext не вызывает ошибок
- **WHEN** пользователь открывает настройки и двигает слайдер до первого взаимодействия со звуком
- **THEN** функция завершается без ошибки; DOM-слайдер обновляется корректно

#### Scenario: Mute музыки не затирает musicVolume в хранилище
- **WHEN** пользователь установил `musicVolume: 0.7`, затем включил `musicMuted: true`, затем выключил `musicMuted`
- **THEN** в хранилище по-прежнему `musicVolume: 0.7` и слышимость соответствует номиналу после снятия mute и с учётом общего масштаба

#### Scenario: Mute звуков не затирает soundVolume
- **WHEN** пользователь установил `soundVolume: 0.5`, включил `soundMuted: true`, затем выключил `soundMuted` и вызывает `Sound()`
- **THEN** эффект слышен с громкостью согласно `0.5` и общему масштабу

#### Scenario: Общий mute не затирает masterVolume
- **WHEN** пользователь установил `masterVolume: 0.8`, затем включил `masterMuted: true`, затем выключил `masterMuted`
- **THEN** в хранилище по-прежнему `masterVolume: 0.8`; слышимость восстанавливается согласно номиналам каналов и `0.8`

## REMOVED Requirements

### Requirement: Обратная совместимость quietMusicForScreenReader

**Reason:** Настройка «тихая музыка для скринридера» удалена; поле не является частью `Settings`.

**Migration:** Ключ `quietMusicForScreenReader` в старых JSON игнорируется при загрузке (см. ADDED требование ниже). Для прежнего эффекта пользователь может снизить «Музыку» или общую громкость.

## ADDED Requirements

### Requirement: Игнорирование устаревшего ключа quietMusicForScreenReader в хранилище

При чтении объекта настроек из хранилища движок SHALL отбрасывать поле `quietMusicForScreenReader`, если оно присутствует во входных данных: оно SHALL NOT входить в нормализованный результат `Settings`. При следующей записи настроек ключ SHALL NOT появляться в сохранённом JSON.

#### Scenario: Старый JSON с quietMusicForScreenReader не ломает загрузку

- **WHEN** в хранилище есть объект с `quietMusicForScreenReader: true` и без полей `masterVolume` / `masterMuted`
- **THEN** `loadSettings` возвращает валидный `Settings` с `masterVolume` и `masterMuted` из слияния с `authorDefaults`, без поля `quietMusicForScreenReader` в типизированном результате

### Requirement: Обратная совместимость masterVolume и masterMuted при загрузке

Если в сохранённом объекте отсутствуют `masterVolume` или `masterMuted`, `loadSettings` SHALL трактовать отсутствующее поле как значение из `authorDefaults` после слияния (типично `masterVolume: 1.0`, `masterMuted: false` из движковых умолчаний).

#### Scenario: Старый JSON без master

- **WHEN** в хранилище есть валидные настройки без ключей `masterVolume` / `masterMuted`
- **THEN** результат `loadSettings` содержит `masterVolume` и `masterMuted` из `authorDefaults`
