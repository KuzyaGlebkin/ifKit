## ADDED Requirements

### Requirement: PlayMusic — декларативный маркер фоновой музыки
Движок SHALL экспортировать функцию `PlayMusic(src: string): void` из `src/ifKit/index.ts`. Вызов `PlayMusic(src)` в теле функции-сцены SHALL записывать `src` как намерение (`_pendingMusic`) для текущего цикла рендера. Реальное изменение воспроизведения происходит в `resolveAudioIntent()` после завершения рендера — не в момент вызова.

#### Scenario: PlayMusic в теле сцены не перезапускает тот же трек при re-render
- **WHEN** сцена содержит `PlayMusic(forestMusic)` и пользователь нажимает кнопку действия (re-render)
- **THEN** трек продолжает играть без прерывания и без перезапуска с начала

#### Scenario: PlayMusic меняет трек при переходе в другую сцену
- **WHEN** сцена «Пещера» вызывает `PlayMusic(caveMusic)`, а до этого играл `forestMusic`
- **THEN** начинается crossfade: `forestMusic` затухает, `caveMusic` нарастает

#### Scenario: PlayMusic экспортируется из ifKit
- **WHEN** автор пишет `import { PlayMusic } from './ifKit'`
- **THEN** импорт успешен; TypeScript не выдаёт ошибок типов

---

### Requirement: Sound — императивное воспроизведение звука
Движок SHALL экспортировать функцию `Sound(src: string): void` из `src/ifKit/index.ts`. Вызов `Sound(src)` SHALL немедленно инициировать воспроизведение одиночного звука через аудиодвижок. Звук воспроизводится один раз без цикла и не влияет на фоновую музыку.

#### Scenario: Sound в колбэке act воспроизводит звук при действии
- **WHEN** автор пишет `act('Открыть дверь', s => { Sound(doorSound); s.doorOpen = true })`
  и пользователь нажимает кнопку
- **THEN** звук двери воспроизводится однократно

#### Scenario: Sound экспортируется из ifKit
- **WHEN** автор пишет `import { Sound } from './ifKit'`
- **THEN** импорт успешен; TypeScript не выдаёт ошибок типов

#### Scenario: Sound не прерывает фоновую музыку
- **WHEN** `Sound(clickSound)` вызывается во время воспроизведения фоновой музыки
- **THEN** музыка продолжает играть; звуковой эффект слышен поверх неё

---

### Requirement: Аудио-src передаётся через Vite-импорт
Движок SHALL принимать в `PlayMusic` и `Sound` строку URL. Рекомендуемый способ получения URL — импорт аудиофайла через Vite (`import src from './music/track.mp3'`), который возвращает корректный URL как в режиме разработки, так и в production (data URL при сборке single-file HTML).

#### Scenario: Vite-импорт аудиофайла даёт корректный URL
- **WHEN** автор пишет `import forestMusic from './music/forest.mp3'` и передаёт в `PlayMusic(forestMusic)`
- **THEN** в режиме dev браузер загружает файл с dev-сервера; в production — из data URL, встроенного в HTML
