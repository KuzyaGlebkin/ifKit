## 1. Аудиодвижок (audio.ts)

- [x] 1.1 Реализовать ленивую инициализацию AudioContext: создание при первом вызове, авто-resume через одноразовые обработчики `click` / `keydown`
- [x] 1.2 Создать `_masterMusicGain` и `_masterSoundGain`, подключить к `AudioContext.destination`; задать начальные значения gain из параметра (settings.musicVolume / soundVolume)
- [x] 1.3 Реализовать `Map<string, AudioBuffer>` кэш и функцию `getBuffer(src): Promise<AudioBuffer>` (fetch → decodeAudioData → кэш)
- [x] 1.4 Реализовать intent-механизм: `clearAudioIntent()`, `setAudioIntent(src)`, `_pendingMusic`, `_currentSrc`
- [x] 1.5 Реализовать `resolveAudioIntent(): Promise<void>`: сравнение pending vs current, crossfade при расхождении, fade-out при `null`
- [x] 1.6 Реализовать crossfade: создание нового `AudioBufferSourceNode` (loop=true) с `GainNode` (0→1), рамп gain текущего (1→0) за `CROSSFADE_MS=1000`, остановка и отключение старого source после fade
- [x] 1.7 Реализовать `playSound(src: string): void`: getBuffer → новый BufferSourceNode → connect через `_masterSoundGain` → start → disconnect в `onended`
- [x] 1.8 Реализовать и экспортировать `setMusicVolume(v: number): void` и `setSoundVolume(v: number): void` (no-op если AudioContext не создан)
- [x] 1.9 Реализовать и экспортировать `initAudioVolumes(musicVolume: number, soundVolume: number): void` — вызывается при инициализации движка для установки начальных значений без создания AudioContext

## 2. Интеграция с игровым циклом (scenes.ts)

- [x] 2.1 Добавить вызов `clearAudioIntent()` в начало `runGameLoop` (до вызова сцены)
- [x] 2.2 Добавить `await resolveAudioIntent()` в конец `runGameLoop` (после `focusAfterRender`)
- [x] 2.3 Сделать `runGameLoop` асинхронной функцией (`async`) для поддержки `await resolveAudioIntent()`

## 3. Теговые функции (tag-functions.ts + index.ts)

- [x] 3.1 Добавить `PlayMusic(src: string): void` в `tag-functions.ts`: вызывает `setAudioIntent(src)`
- [x] 3.2 Добавить `Sound(src: string): void` в `tag-functions.ts`: вызывает `playSound(src)`
- [x] 3.3 Экспортировать `PlayMusic` и `Sound` из `src/ifKit/index.ts`

## 4. Подключение настроек громкости (settings-modal.ts + engine.ts)

- [x] 4.1 В `engine.ts` (`defineGame`): вызвать `initAudioVolumes(currentSettings.musicVolume, currentSettings.soundVolume)` при инициализации
- [x] 4.2 В `settings-modal.ts` функции `commit()`: добавить вызовы `setMusicVolume` и `setSoundVolume` из `audio.ts` при изменении соответствующих полей

## 5. Шаблон игры (game.ts / scenes.ts)

- [x] 5.1 Добавить в `src/scenes.ts` пример использования `PlayMusic` (закомментированный) с пояснением паттерна Vite-импорта аудиофайла
