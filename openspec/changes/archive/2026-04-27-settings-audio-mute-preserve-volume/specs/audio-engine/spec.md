## MODIFIED Requirements

### Requirement: Граф мастер-гейнов
Аудиодвижок SHALL поддерживать два мастер-узла типа `GainNode`: `_masterMusicGain` (управляет суммарной громкостью музыки) и `_masterSoundGain` (управляет суммарной громкостью звуков). Оба подключены к `AudioContext.destination`. Начальные значения gain SHALL быть **эффективными**: для музыки `musicVolume * (musicMuted ? 0 : 1)`, для звуков `soundVolume * (soundMuted ? 0 : 1)` на момент инициализации.

#### Scenario: Начальная громкость из настроек без mute
- **WHEN** AudioContext инициализируется при `musicVolume: 0.8`, `soundVolume: 1.0`, `musicMuted: false`, `soundMuted: false`
- **THEN** `_masterMusicGain.gain.value === 0.8` и `_masterSoundGain.gain.value === 1.0`

#### Scenario: Начальная громкость при включённом mute музыки
- **WHEN** AudioContext инициализируется при `musicVolume: 0.8`, `musicMuted: true`
- **THEN** `_masterMusicGain.gain.value === 0.0`

### Requirement: Изменение громкости в реальном времени
Аудиодвижок SHALL экспортировать функции `setMusicVolume(v: number): void` и `setSoundVolume(v: number): void`, которые обновляют **номинальную** громкость и немедленно выставляют соответствующий мастер-`gain` в `v * (muted ? 0 : 1)`, где `muted` — текущий флаг mute для этой ветки. Движок SHALL экспортировать функции `setMusicMuted(m: boolean): void` и `setSoundMuted(m: boolean): void` (или эквивалент с тем же поведением), которые обновляют флаг mute и **пересчитывают** `gain` из последнего номинала. Если AudioContext не инициализирован — вызов является no-op; номинал и флаги SHALL сохраняться для применения при следующей инициализации.

#### Scenario: Слайдер музыки при выключенном mute
- **WHEN** `musicMuted === false` и вызывается `setMusicVolume(0.4)`
- **THEN** `_masterMusicGain.gain.value === 0.4`; играющий трек становится тише немедленно

#### Scenario: Слайдер музыки при включённом mute не повышает gain
- **WHEN** `musicMuted === true` и вызывается `setMusicVolume(0.9)`
- **THEN** `_masterMusicGain.gain.value === 0.0`

#### Scenario: Снятие mute восстанавливает громкость по номиналу
- **WHEN** номинал музыки был `0.6`, `musicMuted` переключают с `true` на `false`
- **THEN** `_masterMusicGain.gain.value === 0.6` (сразу после применения)

#### Scenario: setMusicVolume до инициализации не вызывает ошибок
- **WHEN** `setMusicVolume(0.5)` вызывается до первого `PlayMusic`
- **THEN** функция завершается без ошибки; значение применится при следующей инициализации

#### Scenario: setMusicMuted до инициализации не вызывает ошибок
- **WHEN** `setMusicMuted(true)` вызывается до первого `PlayMusic`
- **THEN** функция завершается без ошибки; при инициализации музыка стартует с эффективным gain 0, если mute по-прежнему включён
