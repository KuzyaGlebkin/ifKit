## Context

Инфраструктура для этапа заложена заранее: `storage.ts` с `KEYS.saves`, функции `getSceneLocalSnapshot` / `restoreSceneLocal` в `state.ts`, кнопки `#btn-undo` / `#btn-redo` / `#btn-saves` в HTML, пустой `saves.ts`. Вся новая логика реализуется в рамках существующих модулей без внешних зависимостей.

Детальный анализ решений зафиксирован в `docs/decisions/etap-5-saves.md`.

## Goals / Non-Goals

**Goals:**
- Undo/redo на уровне каждого `act` и `goto` (RenPy-стиль)
- Именные слоты сохранений + автосохранение в `localStorage`
- Модальное окно сохранений с единым экраном (сохранение + загрузка)
- Конфигурируемые параметры через `GameConfig.saves`

**Non-Goals:**
- Визуальные screenshot-thumbnail (только текстовый срез `textContent`)
- Облачная синхронизация сохранений
- Экспорт/импорт только сохранений (уже покрывается общим экспортом `storage.ts`)

## Decisions

### D1. Единая структура `Snapshot` для истории и слотов

```ts
interface Snapshot {
  sceneKey:    string
  state:       unknown   // JSON-клон GameState
  sceneLocals: Record<string, Record<string, unknown>> | null
}

interface SaveSlot extends Snapshot {
  id:      string   // 'auto' | 'slot-0' | 'slot-1' | ...
  savedAt: string   // ISO timestamp
  label:   string   // textContent[:80] из #scene-content (пусто для 'auto')
}
```

Один тип снимка используется и для истории в памяти, и для слотов в `localStorage`. Разница только в обёртке (`SaveSlot` добавляет мета-поля). Это устраняет асимметрию между «работает в памяти» и «работает при загрузке».

### D2. Кольцевой буфер истории с указателем

```
entries: [ s0, s1, s2, s3, s4, ... ] (фиксированная длина N)
head:    индекс следующей записи (кольцо)
ptr:     индекс текущей позиции (для undo/redo)
size:    количество валидных записей
```

- `push(snapshot)`: записать по `head`, сдвинуть `head`, обрезать redo-стек (`ptr = head - 1`), обновить `size`
- `undo()`: декрементировать `ptr`, вернуть `entries[ptr]`
- `redo()`: инкрементировать `ptr`, вернуть `entries[ptr]`
- При `size === N` самый старый снимок молча вытесняется (кольцо)

Альтернатива (массив + splice) — отклонена: лишние аллокации при глубокой истории.

### D3. Порядок событий в `goto` / `act`

```
act():
  historyPush(clone state + sceneLocals + currentSceneKey)  // ДО мутации
  cb(state)
  diffAndNotify → snackbar
  rerender()

goto():
  historyPush(clone state + sceneLocals + currentSceneKey)  // ДО мутации
  cb(state)  (если передан)
  diffAndNotify
  autoSave({ sceneKey: newKey, state: clone, sceneLocals: {} })  // ДО render
  runGameLoop(newKey)
  snackbar
```

Автосохранение пишется до рендера: фиксируется состояние «уже в новой сцене» без текстового thumbnail (сцена не отрисована). При загрузке автосохранения игрок оказывается в начале новой сцены.

### D4. `restoreGameState` — единая точка восстановления

Вводится в `scenes.ts`:

```ts
export function restoreGameState(snapshot: Snapshot): void {
  currentState = jsonClone(snapshot.state)
  if (snapshot.sceneLocals) {
    for (const [key, locals] of Object.entries(snapshot.sceneLocals)) {
      restoreSceneLocal(key, locals)
    }
  }
  runGameLoop(snapshot.sceneKey)
}
```

`runGameLoop` при смене `sceneKey` очищает локали старой сцены — это корректно, потому что нужные локали уже восстановлены до вызова.

Используется для: undo, redo, загрузки именного слота, загрузки автосохранения.

### D5. Схема `SavesStore` в `localStorage`

```ts
interface SavesStore {
  auto:  SaveSlot | null
  slots: Array<SaveSlot | null>  // длина = GameConfig.saves.slots (default 5)
}
// Ключ: KEYS.saves = 'ifkit:saves'
```

Один объект под одним ключом. Читается целиком при открытии модалки, пишется целиком при любом изменении. Для IF-игр объём ничтожен.

Альтернатива (отдельный ключ на каждый слот) — отклонена: сложнее экспорт/импорт, нет выгоды при малом числе слотов.

### D6. UI модалки по паттерну `settings-modal.ts`

`saves-modal.ts` следует той же структуре: `buildModal()`, `open()` / `close()`, focus trap, Escape / клик-за-модалкой. Кнопка открытия — `#btn-saves`.

Состояния слота:
- **Пустой**: «── пусто ──» + кнопка «Сохранить»
- **Занятый**: дата + label + кнопки «Загрузить» / «Удалить»
- **Удаление**: inline-подтверждение «Удалить? [Да] [Нет]» (без `confirm()`)
- **Перезапись**: inline-подтверждение «Перезаписать? [Да] [Нет]»
- **Авто-слот**: только «Загрузить», без «Сохранить» и «Удалить»

### D7. `GameConfig.saves` — конфигурация через `defineGame`

```ts
interface SavesConfig {
  slots?:       number  // кол-во именных слотов, default 5
  historySize?: number  // глубина undo-буфера, default 20
}

interface GameConfig<S, K> {
  // ...существующие поля...
  saves?: SavesConfig
}
```

Значения передаются при инициализации в `engine.ts` → `saves.ts` и `saves-modal.ts`.

## Risks / Trade-offs

- **Разрастание истории**: при глубоком `historySize` и сложном `GameState` память может расти. Митигация: N=20 по умолчанию, кольцевой буфер вытесняет старое.
- **`currentState` — mutable singleton**: `restoreGameState` заменяет ссылку; любые захваченные контексты становятся невалидными. Митигация: каждый `runGameLoop` создаёт новый `createContext(currentState)`, старые контексты недостижимы после ре-рендера.
- **textContent как thumbnail**: при смене языка (Этап 7) thumbnail останется на языке, который был при сохранении. Допустимо для v1.
- **Автосохранение без label**: карточка auto-слота показывает только дату — менее информативно, чем именные слоты. Компромисс ради простоты.
