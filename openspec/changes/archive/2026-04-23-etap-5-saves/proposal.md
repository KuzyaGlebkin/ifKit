## Why

Игрок не может сохранить прогресс и вернуться к нему позже, а также откатить ошибочное действие — обе возможности критичны для IF-игр. Это последний «базовый» этап перед аудио и i18n.

## What Changes

- Добавляется in-memory кольцевой буфер истории: каждый `act` и `goto` пушит снимок состояния; кнопки «Назад» / «Вперёд» (`#btn-undo` / `#btn-redo`) откатывают и восстанавливают шаги
- Добавляются именные слоты сохранений в `localStorage` (через `storage.ts`): ручное сохранение, загрузка, удаление
- Добавляется автосохранение: при каждом `goto` до вызова `runGameLoop` состояние пишется в слот `"auto"`
- Добавляется модальное окно сохранений (по кнопке `#btn-saves`): список слотов с датой и текстовым thumbnail, ручное сохранение/загрузка/удаление с inline-подтверждением
- `GameConfig` расширяется необязательным полем `saves: { slots?, historySize? }`
- `scenes.ts` получает функцию `restoreGameState(snapshot)` для восстановления из любого снимка

## Capabilities

### New Capabilities

- `history`: кольцевой буфер снимков в памяти — undo/redo на уровне каждого `act` и `goto`
- `save-slots`: именные слоты сохранений в `localStorage` — структура `SaveSlot`, схема `SavesStore`, CRUD-операции
- `saves-modal`: модальное окно «Сохранения» — список слотов, автосохранение, ручное сохранение/загрузка/удаление

### Modified Capabilities

- `define-game-api`: добавляется необязательное поле `saves: { slots?: number; historySize?: number }` в `GameConfig`

## Impact

- **`src/ifKit/saves.ts`** — реализует `SaveSlot`, `SavesStore`, историю и операции со слотами (сейчас пустой stub)
- **`src/ifKit/scenes.ts`** — добавляются push в историю внутри `act`/`goto`, функция `restoreGameState`, подключение кнопок `#btn-undo` / `#btn-redo`
- **`src/ifKit/engine.ts`** — `GameConfig` расширяется полем `saves`; инициализация модалки сохранений
- **`src/ifKit/state.ts`** — используются уже готовые `getSceneLocalSnapshot` / `restoreSceneLocal`
- **`src/ifKit/storage.ts`** — используется уже готовый `KEYS.saves`; новый файл не нужен
- **Новый файл `src/ifKit/saves-modal.ts`** — UI модального окна по паттерну `settings-modal.ts`
- **`src/index.html`** — кнопки `#btn-undo`, `#btn-redo`, `#btn-saves` уже присутствуют; изменений нет
- Нет новых внешних зависимостей
