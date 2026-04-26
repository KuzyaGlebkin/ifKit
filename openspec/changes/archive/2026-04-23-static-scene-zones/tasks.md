## 1. Renderer — новые буферы и compose

- [x] 1.1 Добавить в `renderer.ts` переменные `beforeBuffer`, `afterBuffer`, `slotBuffers: Record<string, string>` и переменную `activeTarget` для отслеживания текущего буфера
- [x] 1.2 Изменить `appendHtml()` так, чтобы он писал в `activeTarget` (по умолчанию — `htmlBuffer` / sceneBuffer)
- [x] 1.3 Добавить внутренние функции `setActiveBuffer` и `restoreActiveBuffer` для временного переключения буфера во время выполнения callback
- [x] 1.4 Добавить функцию `composeScene(): string` — собирает `beforeBuffer + sceneBuffer (с заменёнными маркерами слотов) + afterBuffer`
- [x] 1.5 Обновить `clearBuffers()` — сбрасывать все новые буферы (`beforeBuffer`, `afterBuffer`, `slotBuffers`)

## 2. Тег-функция Slot

- [x] 2.1 Добавить в `tag-functions.ts` функцию `Slot(id: string): void` — вставляет маркер `<div data-slot="${id}"></div>` в текущий буфер через `appendHtml`
- [x] 2.2 Экспортировать `Slot` из `ifKit/index.ts`

## 3. StaticContext и runGameLoop

- [x] 3.1 Добавить в `scenes.ts` тип `StaticContext<S, K>` — расширяет `SceneContext<S, K>` полями `before`, `after`, `slot`
- [x] 3.2 Добавить в `scenes.ts` фабрику `createStaticContext<S, K>(state: S): StaticContext<S, K>` — `before(cb)` / `after(cb)` / `slot(id, cb)` переключают активный буфер, вызывают cb, восстанавливают буфер
- [x] 3.3 Удалить `_staticEl: HTMLElement | null` и `_staticFn` из переменных модуля `scenes.ts`
- [x] 3.4 Обновить `initDOMRefs()` — убрать параметры `staticEl` и `staticFn`
- [x] 3.5 Переписать порядок в `runGameLoop`: сначала выполняется `sceneFn`, затем `staticFn` (через `createStaticContext`), затем `composeScene()` сбрасывается в `_sceneEl`

## 4. Engine — удалить #static DOM-элемент

- [x] 4.1 Удалить из `engine.ts` создание DOM-элемента `#static` и связанных ARIA-атрибутов
- [x] 4.2 Обновить тип `GameConfig.static` — изменить сигнатуру с `SceneFn<S, K>` на `(state: S, ctx: StaticContext<S, K>) => void`
- [x] 4.3 Обновить вызов `initDOMRefs()` — убрать аргументы `staticEl` и `config.static`
- [x] 4.4 Передавать `config.static` напрямую в `runGameLoop` через переменную модуля `scenes.ts` (по аналогии с текущим `_staticFn`)

## 5. Layout — обновить логику фокуса

- [x] 5.1 В `layout.ts` удалить параметр `staticEl` из `focusAfterRender()` и убрать логику фокуса на `#static`
- [x] 5.2 Реализовать новый приоритет фокуса: 1) первый `tabindex="0"` в `#scene-content`, 2) первая кнопка в `#scene-acts`, 3) первая кнопка в `#scene-gotos`, 4) `#scene-content` сам
- [x] 5.3 Обновить вызов `focusAfterRender` в `scenes.ts` — убрать аргумент `_staticEl`

## 6. index.html и game.ts

- [x] 6.1 Обновить комментарий в `index.html` — убрать упоминание `#static` из списка зон
- [x] 6.2 Обновить `game.ts` — переписать пример `static` с использованием `before(cb)`

## 7. Экспорт типов

- [x] 7.1 Экспортировать тип `StaticContext` из `engine.ts` (рядом с `SceneContext`)
