## Context

Сейчас `static` в `runGameLoop` выполняется первым и пишет в единственный `htmlBuffer`, который сразу же сбрасывается в отдельный DOM-элемент `_staticEl` (`#static`). Сцена затем пишет в тот же `htmlBuffer` и сбрасывается в `_sceneEl`. Это делает два рендера независимыми и не даёт static влиять на поток сцены.

Цель — переработать модель так, чтобы static мог вставлять контент в три зоны `_sceneEl`: до текста сцены (`before`), после (`after`) и в именованные слоты, объявленные самой сценой (`Slot("id")`).

## Goals / Non-Goals

**Goals:**
- Добавить zone-контекст для static: `before(cb)`, `after(cb)`, `slot(id, cb)`
- Добавить тег-функцию `Slot(id)` для сцен — объявляет именованный маркер
- Удалить `_staticEl` — весь вывод static идёт в `_sceneEl`
- Сохранить `act`, `goto`, `local` в контексте static (кнопки по-прежнему уходят в `_actsEl`/`_gotosEl`)
- Незаполненный Slot → пустое место, предупреждение в документации

**Non-Goals:**
- Вложенные слоты или иерархические зоны
- Слоты между разными сценами (каждая сцена объявляет свои слоты независимо)
- Валидация соответствия слотов сцены и заполнений static во время компиляции

## Decisions

### 1. Порядок выполнения: scene → static → compose

**Решение:** сцена выполняется первой, static — после.

**Почему:** `Slot("id")` в сцене должен разместить маркер (`<div data-slot="id"></div>`) в sceneBuffer до того, как static начнёт заполнять слоты. Альтернатива — static выполняется первым, а маркеры вставляются в конце — потребовала бы двухпроходного рендера сцены. Текущий порядок проще.

### 2. Буферы: три новых, один compose

**Решение:** в `renderer.ts` добавляются `beforeBuffer`, `afterBuffer`, `slotBuffers: Record<string, string>` и функция `composeScene()`.

```
composeScene():
  1. Берёт sceneBuffer
  2. Заменяет каждый <div data-slot="id"></div> на slotBuffers[id] ?? ''
  3. Возвращает beforeBuffer + result + afterBuffer
```

`appendHtml()` по-прежнему пишет в `htmlBuffer` (= sceneBuffer). Новые функции `appendBefore()`, `appendAfter()`, `appendSlot(id)` пишут в соответствующие буферы. Их вызывают callback'и из `StaticContext`.

### 3. StaticContext — расширяет SceneContext

**Решение:** отдельный тип `StaticContext<S, K>` с полями:

```ts
type StaticContext<S, K> = SceneContext<S, K> & {
  before: (cb: () => void) => void
  after:  (cb: () => void) => void
  slot:   (id: string, cb: () => void) => void
}
```

`before(cb)` временно переключает активный буфер через `setActiveBuffer('before')`, выполняет `cb()`, возвращает буфер назад. Аналогично для `after` и `slot`. Это изолирует побочные эффекты внутри callback.

### 4. Тег-функция Slot в сценах — только императивная

**Решение:** `Slot(id: string)` (uppercase) вызывает `appendHtml('<div data-slot="' + id + '"></div>')`. Lowercase-версия `slot` не нужна: слот — всегда side-effect, строковая версия не имеет смысла.

### 5. Удаление _staticEl — без миграции

**Решение:** `_staticEl` и связанный DOM-узел `#static` удаляются. Это breaking change для авторов, которые стилизовали `#static` в CSS. Документируется в CHANGELOG.

## Risks / Trade-offs

- **Порядок буферов при множественных вызовах** → `before(cb)` вызванный несколько раз конкатенирует результаты в `beforeBuffer`. Это ожидаемо, но может удивить авторов. Документировать.
- **Фокус-логика в layout.ts** → текущая логика `focusAfterRender` учитывает `_staticEl`. После удаления приоритет фокуса упрощается: первый focusable в `_sceneEl` → кнопки act → кнопки goto → `_sceneEl` сам.
- **Незаполненный Slot** → рендерится как пустой `<div>`, не удаляется из DOM. Может создать лишний пустой блок. Митигация: `composeScene` заменяет маркер на пустую строку (не на `<div></div>`), т.е. маркер полностью исчезает.
