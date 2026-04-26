## Context

Движок уже хранит `musicVolume` и `soundVolume` в `Settings` и отображает их слайдерами в настройках, но `applySettings()` не передаёт значения никуда — поля помечены как «заглушки до Этапа 6». Файл `src/ifKit/audio.ts` создан пустым. Сцены рендерятся синхронно в `runGameLoop` (clearBuffers → вызов сцены → flush DOM). Аудиофайлы в single-file HTML автоматически инлайнятся как base64 через `assetsInlineLimit: 100_000_000` в `vite.config.ts`.

## Goals / Non-Goals

**Goals:**
- Воспроизведение фоновой музыки с crossfade при смене трека.
- Воспроизведение одиночных звуков без прерывания музыки.
- Декларативное управление музыкой из тела сцены: трек описывается, движок решает, менять ли его.
- Подключение слайдеров громкости к аудиодвижку в реальном времени.
- Корректная работа при откате истории (undo): музыка меняется, только если трек изменился.

**Non-Goals:**
- Несколько одновременных фоновых треков.
- Потоковая (streaming) загрузка аудио.
- 3D-звук, панорамирование, аудио-фильтры.
- Предзагрузка всего аудио при старте (только lazy-кэш).

## Decisions

### Решение 1: Web Audio API без `<audio>` тега

Весь аудиопайплайн строится на `AudioContext` + `AudioBufferSourceNode`. `<audio>` элементы не используются.

**Почему:** crossfade через `GainNode.gain.linearRampToValueAtTime` нативен для Web Audio API и не требует ручного тайминга. Два `<audio>`-элемента + `volume` давали бы заметные артефакты и сложный код.

---

### Решение 2: Граф AudioContext

```
AudioContext
├── _masterMusicGain  (gain = musicVolume)
│   ├── _fadeGainOld  (1 → 0 за CROSSFADE_MS)  ← при crossfade
│   └── _fadeGainNew  (0 → 1 за CROSSFADE_MS)  ← новый трек
└── _masterSoundGain  (gain = soundVolume)
    └── BufferSourceNode × N  (one-shot, создаются и уничтожаются)
```

`_masterMusicGain.gain.value` = `settings.musicVolume`. Изменение настройки → `setMusicVolume(v)` → мгновенно применяется ко всем треккам через мастер-узел. Fade-гейны описывают только «процент фейда», не абсолютную громкость.

---

### Решение 3: Ленивая инициализация AudioContext + авто-resume

AudioContext создаётся при первом вызове `PlayMusic` или `Sound`. Браузер может создать контекст в состоянии `suspended` (autoplay policy). При создании немедленно регистрируются одноразовые обработчики `click` и `keydown` на `document`, вызывающие `ctx.resume()`. Это гарантирует запуск музыки после первого взаимодействия пользователя.

**Почему не при `initAudio()`:** авторы, не использующие звук, не должны нести overhead AudioContext.

---

### Решение 4: Декларативный PlayMusic — intent-паттерн

`runGameLoop` получает два новых шага:

```
clearAudioIntent()        // ← до вызова сцены
...scene(state, ctx)...   // PlayMusic('src') → _pendingMusic = 'src'
flushHtmlToDOM(...)
resolveAudioIntent()      // ← после flush, сравниваем pending vs current
```

`resolveAudioIntent`:
- `_pendingMusic === _currentSrc` → ничего (трек тот же, не перезапускать).
- `_pendingMusic !== _currentSrc` → crossfade.
- `_pendingMusic === null` → fade-out (тишина).

**Почему после flush:** к этому моменту DOM уже обновлён, пользователь видит новую сцену — логично, что звук меняется вместе с ней.

---

### Решение 5: Кэш AudioBuffer

`Map<string, AudioBuffer>` живёт в модуле `audio.ts`. `fetch(src)` → `ctx.decodeAudioData()` → кэш. Повторный вызов с тем же `src` (в том числе при re-render через `act`) возвращает буфер синхронно.

**Crossfade и асинхронность:** `resolveAudioIntent` возвращает `Promise<void>`. Если буфер в кэше — воспроизведение начинается немедленно. Если нет — fetch, decode, затем crossfade. Первый вызов может дать небольшую задержку, последующие — нет.

---

### Решение 6: Подключение громкости к settings

`settings-modal.ts` при `commit()` уже вызывает `applySettings()`. После Stage 6 добавляем вызовы `setMusicVolume()` / `setSoundVolume()` из `audio.ts` прямо в `commit()` (или через расширение `applySettings`).

Выбран вариант: `commit()` импортирует из `audio.ts` и вызывает напрямую — это минимальное изменение и нет риска нарушить `applySettings`, которая остаётся чисто CSS-функцией.

`setMusicVolume` / `setSoundVolume` — no-op, если AudioContext ещё не создан (пользователь не взаимодействовал с аудио).

---

### Решение 7: Экспорт через Vite-импорт

Автор передаёт URL аудиофайла через Vite-импорт:

```typescript
import forestMusic from './music/forest.mp3'
PlayMusic(forestMusic)  // в dev: URL; в single-file: data URL (base64)
```

`assetsInlineLimit: 100_000_000` гарантирует, что аудио (и изображения) встроены в HTML при production-сборке. Никаких дополнительных конфигураций не требуется.

## Risks / Trade-offs

| Риск | Митигация |
|------|-----------|
| Первое воспроизведение трека даёт задержку (fetch + decode) | Кэш: декодирование происходит только раз. Для критичных треков автор может импортировать файл заранее (Vite bundlе его) — fetch будет из бандла, очень быстро. |
| AudioContext suspended при первом рендере | Intent-паттерн: `resolveAudioIntent` пробует `ctx.resume()`, если контекст suspended — откладывает запуск до resume. Авто-resume после первого клика. |
| `Sound()` вызванный в теле сцены воспроизводится при каждом re-render | Документировать: `Sound()` следует вызывать в колбэках `act`/`goto`, не в теле сцены. В теле — только `PlayMusic()`. |
| Большие аудиофайлы раздувают single-file HTML | Это свойство single-file подхода в целом. Для web-деплоя (не single-file) файлы остаются внешними. Задокументировать ограничение. |
