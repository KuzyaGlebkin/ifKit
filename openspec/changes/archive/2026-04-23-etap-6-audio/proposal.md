## Why

ifKit уже хранит настройки громкости (musicVolume, soundVolume) и отображает слайдеры в UI, но аудиодвижок отсутствует — поля помечены как «заглушки до Этапа 6». Без звука авторам недоступен ключевой инструмент атмосферы интерактивной прозы: фоновая музыка и звуковые эффекты.

## What Changes

- Новый аудиодвижок на Web Audio API: воспроизведение фоновой музыки с crossfade и одиночных звуков.
- Две теговые функции, экспортируемые из `ifKit`: `PlayMusic(src)` — декларативный маркер желаемой фоновой музыки, `Sound(src)` — императивное воспроизведение одиночного звука.
- Подключение слайдеров громкости (ранее «заглушки») к аудиодвижку: изменение настроек немедленно влияет на воспроизведение.
- Кэш декодированных `AudioBuffer`: повторный вызов `PlayMusic` с тем же src не декодирует файл заново.

## Capabilities

### New Capabilities

- `audio-engine`: AudioContext, MasterGainNode для музыки и для звуков, кэш AudioBuffer, crossfade через GainNode ramp, декларативный intent-механизм (clearAudioIntent / resolveAudioIntent).
- `audio-tag-functions`: Публичные функции `PlayMusic(src)` и `Sound(src)`, экспортируемые из `index.ts` в одном ряду с `H1`, `P` и т.д.

### Modified Capabilities

- `user-settings`: Поля `musicVolume` и `soundVolume` перестают быть заглушками — изменение значений SHALL немедленно применяться к аудиодвижку. Функция `applySettings()` расширяется: кроме CSS-переменных она уведомляет аудиодвижок об изменении громкости.

## Impact

- **Новые файлы**: `src/ifKit/audio.ts` (пустой каркас уже создан).
- **Изменяемые файлы**: `src/ifKit/index.ts` (экспорт PlayMusic, Sound), `src/ifKit/scenes.ts` (вызов clearAudioIntent/resolveAudioIntent в runGameLoop), `src/ifKit/settings.ts` / `src/ifKit/settings-modal.ts` (подключение громкости к аудиодвижку).
- **Зависимости**: нет новых npm-пакетов, только браузерный Web Audio API.
- **Ограничения**: AudioContext требует user gesture для инициализации — авторам рекомендуется использовать «обложку» как первую сцену (стандартная практика VN).
