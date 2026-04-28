## ADDED Requirements

### Requirement: API флага тихой музыки для скринридера

Аудиодвижок SHALL экспортировать функцию `setQuietMusicForScreenReader(on: boolean): void`, которая обновляет внутреннее состояние флага и **пересчитывает** эффективный gain мастера музыки по тем же правилам, что и при инициализации (см. требование «Граф мастер-гейнов»). Если AudioContext не инициализирован — вызов является no-op для гейна; флаг SHALL сохраняться для применения при следующей инициализации.

#### Scenario: Включение флага снижает громкость уже играющей музыки

- **WHEN** музыка воспроизводится с `musicMuted: false`, `musicVolume: 0.8`, `quietMusicForScreenReader: false`, затем вызывается `setQuietMusicForScreenReader(true)`
- **THEN** `_masterMusicGain.gain.value` немедленно отражает произведение `0.8` на константу ослабления согласно формуле эффективной громкости

#### Scenario: setQuietMusicForScreenReader до инициализации не вызывает ошибок

- **WHEN** `setQuietMusicForScreenReader(true)` вызывается до первого `PlayMusic`
- **THEN** функция завершается без ошибки; при инициализации музыка стартует с учётом сохранённого флага

## MODIFIED Requirements

### Requirement: Граф мастер-гейнов

Аудиодвижок SHALL поддерживать два мастер-узла типа `GainNode`: `_masterMusicGain` (управляет суммарной громкостью музыки) и `_masterSoundGain` (управляет суммарной громкостью звуков). Оба подключены к `AudioContext.destination`. Начальные значения gain SHALL быть **эффективными**: для музыки `musicVolume * (musicMuted ? 0 : 1) * (quietMusicForScreenReader ? α : 1)`, где `α` — фиксированная положительная константа движка, `0 < α ≤ 1` (одна и та же для всех сценариев); для звуков `soundVolume * (soundMuted ? 0 : 1)` на момент инициализации.

#### Scenario: Начальная громкость из настроек без mute и без тихой музыки для SR

- **WHEN** AudioContext инициализируется при `musicVolume: 0.8`, `soundVolume: 1.0`, `musicMuted: false`, `soundMuted: false`, `quietMusicForScreenReader: false`
- **THEN** `_masterMusicGain.gain.value === 0.8` и `_masterSoundGain.gain.value === 1.0`

#### Scenario: Начальная громкость при включённом mute музыки

- **WHEN** AudioContext инициализируется при `musicVolume: 0.8`, `musicMuted: true`
- **THEN** `_masterMusicGain.gain.value === 0.0`

#### Scenario: Начальная громкость при включённом quietMusicForScreenReader и без mute

- **WHEN** AudioContext инициализируется при `musicVolume: 0.8`, `musicMuted: false`, `quietMusicForScreenReader: true`, константа `α === 0.25`
- **THEN** `_masterMusicGain.gain.value === 0.2`

### Requirement: Изменение громкости в реальном времени

Аудиодвижок SHALL экспортировать функции `setMusicVolume(v: number): void` и `setSoundVolume(v: number): void`, которые обновляют **номинальную** громкость и немедленно выставляют соответствующий мастер-`gain`: для музыки — `v * (musicMuted ? 0 : 1) * (quietMusicForScreenReader ? α : 1)`, для звуков — `v * (soundMuted ? 0 : 1)`, где для музыки `α` — та же константа, что в требовании «Граф мастер-гейнов». Движок SHALL экспортировать функции `setMusicMuted(m: boolean): void` и `setSoundMuted(m: boolean): void` (или эквивалент с тем же поведением), которые обновляют флаг mute и **пересчитывают** `gain` из последнего номинала и текущих прочих факторов (для музыки — с учётом `quietMusicForScreenReader` и `α`). Функция `setQuietMusicForScreenReader` SHALL участвовать в пересчёте эффективного gain музыки согласно ADDED-требованию «API флага тихой музыки для скринридера». Если AudioContext не инициализирован — вызовы являются no-op; номинал и флаги SHALL сохраняться для применения при следующей инициализации.

#### Scenario: Слайдер музыки при выключенном mute и выключенном quietMusicForScreenReader

- **WHEN** `musicMuted === false`, `quietMusicForScreenReader === false` и вызывается `setMusicVolume(0.4)`
- **THEN** `_masterMusicGain.gain.value === 0.4`; играющий трек становится тише немедленно

#### Scenario: Слайдер музыки при включённом mute не повышает gain

- **WHEN** `musicMuted === true` и вызывается `setMusicVolume(0.9)`
- **THEN** `_masterMusicGain.gain.value === 0.0`

#### Scenario: Снятие mute восстанавливает громкость по номиналу с учётом quietMusicForScreenReader

- **WHEN** номинал музыки был `0.6`, `musicMuted` переключают с `true` на `false`, `quietMusicForScreenReader === true` и `α === 0.25`
- **THEN** `_masterMusicGain.gain.value === 0.15` (сразу после применения)

#### Scenario: setMusicVolume до инициализации не вызывает ошибок

- **WHEN** `setMusicVolume(0.5)` вызывается до первого `PlayMusic`
- **THEN** функция завершается без ошибки; значение применится при следующей инициализации

#### Scenario: setMusicMuted до инициализации не вызывает ошибок

- **WHEN** `setMusicMuted(true)` вызывается до первого `PlayMusic`
- **THEN** функция завершается без ошибки; при инициализации музыка стартует с эффективным gain 0, если mute по-прежнему включён
