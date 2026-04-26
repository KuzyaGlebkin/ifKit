## Why

Сейчас `static` рендерится в отдельный DOM-элемент (`#static`), изолированный от содержимого сцены. Авторам нужна возможность вставлять постоянный контент прямо внутрь потока сцены — перед текстом, после него или в именованные места внутри сцены.

## What Changes

- **BREAKING** Поле `static` в `defineGame` теперь принимает функцию с расширенным контекстом `StaticContext`, содержащим `before(cb)`, `after(cb)`, `slot(id, cb)` вместо простого рендера в отдельный элемент
- **BREAKING** DOM-элемент `#static` (зона `role="complementary"`) удаляется — статичный контент вставляется в `#scene-content`
- Новая тег-функция `Slot(id)` для сцен — объявляет именованное место, которое static может заполнить
- `static` по-прежнему имеет доступ к `act`, `goto`, `local` — кнопки уходят в свои зоны (`#scene-acts`, `#scene-gotos`)
- Порядок выполнения в `runGameLoop`: сначала scene (размещает маркеры `Slot`), затем static (заполняет зоны), затем compose (собирает итоговый HTML)
- Незаполненный `Slot` остаётся пустым — ошибки нет, поведение документируется

## Capabilities

### New Capabilities

- `static-scene-zones`: Механизм зонированного рендеринга static-контента — `before`, `after` и именованные `Slot` внутри сцены

### Modified Capabilities

- `define-game-api`: Изменяется тип и поведение поля `static` — теперь функция получает `StaticContext` с zone-функциями вместо обычного `SceneContext`
- `ui-zones`: Удаляется зона `#static` как отдельный DOM-элемент; обновляется логика управления фокусом (больше нет `#static` в приоритете)

## Impact

- `src/ifKit/renderer.ts` — новые буферы (`beforeBuffer`, `afterBuffer`, `slotBuffers`), функция compose
- `src/ifKit/scenes.ts` — новый `StaticContext`, изменён порядок в `runGameLoop`, удалены `_staticEl` и `_staticFn`
- `src/ifKit/engine.ts` — удалено создание `#static` DOM-элемента, изменён вызов `initDOMRefs`
- `src/ifKit/tag-functions.ts` — добавлена тег-функция `Slot(id)`
- `src/ifKit/layout.ts` — убрана логика фокуса на `_staticEl`
- `src/index.html` — обновлён комментарий о зонах
- `src/game.ts` — обновлён пример использования `static`
