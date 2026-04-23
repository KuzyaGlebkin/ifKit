## 1. Типы и структуры данных (`saves.ts`)

- [x] 1.1 Объявить интерфейсы `Snapshot`, `SaveSlot`, `SavesStore` и тип `SavesConfig`
- [x] 1.2 Реализовать `loadSavesStore(slots: number): SavesStore` — читает из `storage` или возвращает пустую структуру
- [x] 1.3 Реализовать `persistSavesStore(store: SavesStore): void` — пишет через `storage.set(KEYS.saves, store)`

## 2. Кольцевой буфер истории (`saves.ts`)

- [x] 2.1 Реализовать класс / объект `HistoryBuffer` с полями `entries`, `head`, `ptr`, `size`, `maxSize`
- [x] 2.2 Реализовать метод `push(snapshot: Snapshot): void` — добавить снимок, сбросить redo-стек
- [x] 2.3 Реализовать метод `undo(): Snapshot | null` — вернуть предыдущий снимок или `null`
- [x] 2.4 Реализовать метод `redo(): Snapshot | null` — вернуть следующий снимок или `null`
- [x] 2.5 Реализовать `canUndo(): boolean` и `canRedo(): boolean`
- [x] 2.6 Экспортировать `initHistory(historySize: number): void` — инициализирует буфер с заданным размером

## 3. Операции со слотами (`saves.ts`)

- [x] 3.1 Реализовать `autoSave(sceneKey: string, state: unknown, sceneLocals: null): void`
- [x] 3.2 Реализовать `saveToSlot(index: number, sceneKey: string, state: unknown, sceneLocals: Record<string, Record<string, unknown>> | null): void` — записывает `label` из `#scene-content.textContent`
- [x] 3.3 Реализовать `deleteSlot(index: number): void`
- [x] 3.4 Реализовать `getSavesStore(): SavesStore` — возвращает текущее состояние хранилища

## 4. Восстановление состояния (`scenes.ts`)

- [x] 4.1 Добавить экспортируемую функцию `restoreGameState(snapshot: Snapshot): void` — устанавливает `currentState`, восстанавливает `sceneLocals`, вызывает `runGameLoop`
- [x] 4.2 Добавить вызов `historyPush` в `act()` — до вызова `cb(state)`
- [x] 4.3 Добавить вызов `historyPush` в `goto()` — до вызова `cb(state)`
- [x] 4.4 Добавить вызов `autoSave` в `goto()` — после `cb(state)`, до `runGameLoop`
- [x] 4.5 Реализовать `updateUndoRedoButtons(): void` — обновляет `disabled` у `#btn-undo` и `#btn-redo`
- [x] 4.6 Подключить обработчики `#btn-undo` и `#btn-redo` в `initDOMRefs` или `registerScenes`

## 5. Расширение `GameConfig` (`engine.ts`)

- [x] 5.1 Добавить интерфейс `SavesConfig { slots?: number; historySize?: number }` и поле `saves?: SavesConfig` в `GameConfig`
- [x] 5.2 Передать `config.saves` в `initHistory` и `initSavesModal` при инициализации в `defineGame`

## 6. Модальное окно сохранений (`saves-modal.ts`)

- [x] 6.1 Создать файл `saves-modal.ts` по паттерну `settings-modal.ts`
- [x] 6.2 Реализовать `buildModal(slots: number): HTMLElement` — создаёт backdrop, dialog, авто-слот и N именных слотов
- [x] 6.3 Реализовать `syncToDOM(store: SavesStore): void` — обновляет карточки слотов по текущему состоянию хранилища
- [x] 6.4 Реализовать `open()` / `close()` с focus trap и обработчиками Escape / backdrop
- [x] 6.5 Подключить кнопку «Загрузить» — вызов `restoreGameState` и закрытие модалки
- [x] 6.6 Подключить кнопку «Сохранить» (пустой слот) — вызов `saveToSlot`, `syncToDOM`
- [x] 6.7 Реализовать inline-подтверждение перезаписи («Перезаписать? [Да] [Нет]»)
- [x] 6.8 Реализовать inline-подтверждение удаления («Удалить? [Да] [Нет]»)
- [x] 6.9 Экспортировать `initSavesModal(slots: number): void` — строит модалку, вешает обработчик на `#btn-saves`

## 7. Обновление роадмапа

- [x] 7.1 Отметить все задачи Этапа 5 выполненными в `docs/roadmap.md`
