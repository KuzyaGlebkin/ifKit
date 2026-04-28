## ADDED Requirements

### Requirement: Ленивая инициализация AudioContext
Аудиодвижок SHALL создавать `AudioContext` не при старте движка, а при первом вызове `PlayMusic()` или `Sound()`. Если автор не использует звук — AudioContext не создаётся никогда.

#### Scenario: AudioContext отсутствует до первого аудио-вызова
- **WHEN** игра запущена и ни `PlayMusic`, ни `Sound` не вызывались
- **THEN** `AudioContext` не существует в памяти

#### Scenario: AudioContext создаётся при первом вызове PlayMusic
- **WHEN** `resolveAudioIntent()` вызывается с непустым `_pendingMusic` первый раз
- **THEN** создаётся `AudioContext` и два мастер-узла (`_masterMusicGain`, `_masterSoundGain`), подключённые к `AudioContext.destination`

---

### Requirement: Авто-resume после первого взаимодействия
При создании `AudioContext` движок SHALL регистрировать одноразовые обработчики событий `click` и `keydown` на `document`, вызывающие `ctx.resume()`. Это позволяет музыке начать воспроизведение после первого взаимодействия пользователя, даже если контекст был создан в состоянии `suspended`.

#### Scenario: AudioContext suspended при первом рендере
- **WHEN** `PlayMusic` вызывается до первого клика пользователя
- **THEN** AudioContext создаётся, обработчики зарегистрированы; аудио не воспроизводится пока контекст `suspended`

#### Scenario: Пользователь кликает — музыка начинает играть
- **WHEN** пользователь производит первое взаимодействие (клик или нажатие клавиши)
- **THEN** `ctx.resume()` вызывается, ожидающий трек начинает воспроизведение

---

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

---

### Requirement: Изменение громкости в реальном времени
Аудиодвижок SHALL экспортировать функции `setMusicVolume(v: number): void` и `setSoundVolume(v: number): void`, которые обновляют **номинальную** громкость и немедленно выставляют соответствующий мастер-`gain`: для музыки — `v * (musicMuted ? 0 : 1) * (quietMusicForScreenReader ? α : 1)`, для звуков — `v * (soundMuted ? 0 : 1)`, где для музыки `α` — та же константа, что в требовании «Граф мастер-гейнов». Движок SHALL экспортировать функции `setMusicMuted(m: boolean): void` и `setSoundMuted(m: boolean): void` (или эквивалент с тем же поведением), которые обновляют флаг mute и **пересчитывают** `gain` из последнего номинала и текущих прочих факторов (для музыки — с учётом `quietMusicForScreenReader` и `α`). Функция `setQuietMusicForScreenReader` SHALL участвовать в пересчёте эффективного gain музыки согласно требованию «API флага тихой музыки для скринридера». Если AudioContext не инициализирован — вызовы являются no-op; номинал и флаги SHALL сохраняться для применения при следующей инициализации.

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

---

### Requirement: API флага тихой музыки для скринридера

Аудиодвижок SHALL экспортировать функцию `setQuietMusicForScreenReader(on: boolean): void`, которая обновляет внутреннее состояние флага и **пересчитывает** эффективный gain мастера музыки по тем же правилам, что и при инициализации (см. требование «Граф мастер-гейнов»). Если AudioContext не инициализирован — вызов является no-op для гейна; флаг SHALL сохраняться для применения при следующей инициализации.

#### Scenario: Включение флага снижает громкость уже играющей музыки

- **WHEN** музыка воспроизводится с `musicMuted: false`, `musicVolume: 0.8`, `quietMusicForScreenReader: false`, затем вызывается `setQuietMusicForScreenReader(true)`
- **THEN** `_masterMusicGain.gain.value` немедленно отражает произведение `0.8` на константу ослабления согласно формуле эффективной громкости

#### Scenario: setQuietMusicForScreenReader до инициализации не вызывает ошибок

- **WHEN** `setQuietMusicForScreenReader(true)` вызывается до первого `PlayMusic`
- **THEN** функция завершается без ошибки; при инициализации музыка стартует с учётом сохранённого флага

---

### Requirement: Кэш декодированных AudioBuffer
Аудиодвижок SHALL поддерживать `Map<string, AudioBuffer>`. При первом запросе src: `fetch(src)` → `decodeAudioData()` → запись в кэш. При повторном запросе того же src — возврат из кэша без повторного fetch.

#### Scenario: Повторный вызов PlayMusic с тем же треком не декодирует заново
- **WHEN** сцена вызывает `PlayMusic(forestMusic)` при каждом re-render (через `act`)
- **THEN** буфер берётся из кэша; fetch и decodeAudioData не вызываются повторно

---

### Requirement: Декларативный intent-механизм
Аудиодвижок SHALL предоставлять три внутренние функции для интеграции с игровым циклом:
- `clearAudioIntent(): void` — сбрасывает `_pendingMusic` в `null` (вызывается в начале `runGameLoop`).
- `setAudioIntent(src: string): void` — записывает `_pendingMusic = src` (вызывается из `PlayMusic()`).
- `resolveAudioIntent(): Promise<void>` — сравнивает `_pendingMusic` с `_currentSrc` и применяет crossfade при расхождении (вызывается в конце `runGameLoop`).

#### Scenario: Тот же трек при re-render не перезапускается
- **WHEN** сцена вызывает `PlayMusic(forestMusic)` и уже играет `forestMusic`
- **THEN** `resolveAudioIntent` обнаруживает `_pendingMusic === _currentSrc` и не трогает воспроизведение

#### Scenario: Новый трек запускает crossfade
- **WHEN** `_pendingMusic === 'cave.mp3'` и `_currentSrc === 'forest.mp3'`
- **THEN** начинается crossfade: `forest.mp3` fade-out, `cave.mp3` fade-in одновременно

#### Scenario: Отсутствие PlayMusic в сцене останавливает музыку
- **WHEN** сцена не вызывает `PlayMusic`, `_pendingMusic === null`, `_currentSrc !== null`
- **THEN** текущий трек плавно затухает (fade-out) до 0

---

### Requirement: Crossfade через GainNode ramp
При смене трека аудиодвижок SHALL создавать новый `AudioBufferSourceNode` (loop=true) с `GainNode` (fade-in: 0→1 за `CROSSFADE_MS`) и одновременно рампить gain текущего трека (1→0 за `CROSSFADE_MS`). После завершения fade старый source SHALL быть остановлен и отключён. Значение `CROSSFADE_MS` SHALL быть константой модуля `audio.ts`, по умолчанию `1000`.

#### Scenario: Crossfade длится заданное время
- **WHEN** вызывается crossfade от `forest.mp3` к `cave.mp3`
- **THEN** оба трека слышны одновременно в течение 1000мс; по истечении только `cave.mp3`

#### Scenario: Новый AudioBufferSourceNode воспроизводится в цикле
- **WHEN** начинается воспроизведение нового музыкального трека
- **THEN** `source.loop === true`; трек повторяется бесконечно до смены или остановки

---

### Requirement: Воспроизведение одиночного звука
Аудиодвижок SHALL предоставлять функцию `playSound(src: string): void`. Функция создаёт `AudioBufferSourceNode` (loop=false), подключает его через `_masterSoundGain`, запускает воспроизведение. По завершении sound-source SHALL быть отключён автоматически (`onended`).

#### Scenario: Звуковой эффект воспроизводится однократно
- **WHEN** `playSound('click.mp3')` вызывается в колбэке `act`
- **THEN** звук играет один раз; фоновая музыка не прерывается

#### Scenario: Несколько звуков одновременно
- **WHEN** два `playSound` вызываются почти одновременно
- **THEN** оба звука слышны без взаимного прерывания

---

### Requirement: Остановка фоновой музыки в стартовом меню без изменения настроек

Когда движок переходит в режим стартового меню сессии (включая возврат по логотипу из навбара), воспроизведение фоновой музыки SHALL быть остановлено или приведено к нулевой слышимости согласно внутреннему API движка (например остановка источников и/или сброс audio intent), при этом **сохранённые** пользователем значения `musicMuted`, `musicVolume`, `quietMusicForScreenReader` и эквиваленты SHALL NOT изменяться в хранилище настроек. После выхода из меню в игру правила громкости и mute SHALL снова применяться к музыке согласно сцене и настройкам.

#### Scenario: Меню — музыка не слышна

- **WHEN** показано стартовое меню после начала сессии или из игры
- **THEN** фоновая музыка не воспроизводится слышимо

#### Scenario: Настройки не перезаписаны меню

- **WHEN** перед входом в меню `musicMuted` был `false` и `musicVolume` был `0.5`, затем игрок вышел из меню в игру
- **THEN** в пользовательских настройках по-прежнему `musicMuted: false` и номинальная громкость `0.5` (без побочного mute от самого факта меню)

---

### Requirement: Нет старта фоновой музыки сцены при обновлении только из настроек на сессионном главном меню

Пока активен экран сессионного главного меню (состояние оболочки, при котором `#content` скрыт и показан UI возврата в игру), повторное разрешение намерения музыки SHALL NOT приводить к началу или возобновлению воспроизведения фоновой музыки **только** из-за действий в модалке настроек, которые обновляют локаль UI или сбрасывают учёт просмотренного контента без выхода в игру.

#### Scenario: Смена языка на сессионном главном меню не включает музыку

- **WHEN** пользователь вернулся на сессионное главное меню из игры, открыл настройки и меняет язык интерфейса
- **THEN** фоновая музыка игры не начинает воспроизводиться до выхода с главного меню в игру обычным способом (например «Новая игра» / загрузка)

#### Scenario: Сброс просмотренного контента на сессионном главном меню не включает музыку

- **WHEN** пользователь на сессионном главном меню сбрасывает учёт просмотренного контента из настроек
- **THEN** фоновая музыка игры не начинает воспроизводиться до выхода с главного меню в игру
