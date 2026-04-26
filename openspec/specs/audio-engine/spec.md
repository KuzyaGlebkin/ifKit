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
Аудиодвижок SHALL поддерживать два мастер-узла типа `GainNode`: `_masterMusicGain` (управляет суммарной громкостью музыки) и `_masterSoundGain` (управляет суммарной громкостью звуков). Оба подключены к `AudioContext.destination`. Начальные значения gain берутся из `settings.musicVolume` и `settings.soundVolume` на момент инициализации.

#### Scenario: Начальная громкость из настроек
- **WHEN** AudioContext инициализируется при `musicVolume: 0.8`, `soundVolume: 1.0`
- **THEN** `_masterMusicGain.gain.value === 0.8` и `_masterSoundGain.gain.value === 1.0`

---

### Requirement: Изменение громкости в реальном времени
Аудиодвижок SHALL экспортировать функции `setMusicVolume(v: number): void` и `setSoundVolume(v: number): void`, которые мгновенно обновляют соответствующий мастер-узел. Если AudioContext не инициализирован — вызов является no-op.

#### Scenario: Слайдер музыки меняет громкость немедленно
- **WHEN** пользователь перемещает слайдер музыки, `setMusicVolume(0.4)` вызывается
- **THEN** `_masterMusicGain.gain.value === 0.4`; играющий трек становится тише немедленно

#### Scenario: setMusicVolume до инициализации не вызывает ошибок
- **WHEN** `setMusicVolume(0.5)` вызывается до первого `PlayMusic`
- **THEN** функция завершается без ошибки; значение применится при следующей инициализации

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
