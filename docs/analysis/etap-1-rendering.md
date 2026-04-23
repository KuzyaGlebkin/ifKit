# Анализ: Этап 1 — Ядро движка (рендеринг и сцены)

## 1. Буферная система рендеринга

**Решение: один буфер, последовательный запуск.**

Буфер — три независимых потока на уровне модуля `renderer.ts`:

```
htmlBuffer  string       — накапливает HTML от P(), H1(), Img() и др.
actBuffer   ActDef[]     — накапливает act()-вызовы
gotoBuffer  GotoDef[]    — накапливает goto()-вызовы
```

Игровой цикл при каждом переходе:

```
clearBuffers()
     │
     ▼
static(state, ctx)         → htmlBuffer → #static (flush сразу)
                             actBuffer и gotoBuffer продолжают накапливать
     │
     ▼
scene(state, ctx)          → htmlBuffer → #scene-desc (flush сразу)
                             actBuffer и gotoBuffer продолжают накапливать
     │
     ▼
flushActBuffer()           → #scene-acts   (сначала static-акты, потом scene-акты)
flushGotoBuffer()          → #scene-goto
```

`static` и `scene` пишут в одни и те же три буфера. Никаких отдельных контекстов — движок управляет порядком сброса, пользователь этого не замечает.

## 2. Теговые функции

**Решение: полный набор с первого этапа.**

### Императивные (пишут в `htmlBuffer`, возвращают `void`)

```ts
P(content: string): void
H1(content: string): void
H2(content: string): void
H3(content: string): void
Ul(...items: string[]): void   // items — строки, обычно через li()
Hr(): void
Img(attrs: { src: string; alt?: string }): void
```

`Img` принимает объект — единственная теговая функция с атрибутами. Остальные блочные теги принимают только контент: если автору нужна кастомизация через CSS, он добавляет свою функцию.

### Функциональные (возвращают `string`, для вставки внутрь других)

```ts
em(content: string): string
strong(content: string): string
span(content: string): string
br(): string
li(content: string): string
```

Пример композиции:

```ts
P(`Вокруг ${em('мёртвая')} тишина. Золото: ${strong(String(state.gold))}.`)
Ul(li('Пойти на север'), li(`Использовать ${em('факел')}`))
```

## 3. Тип `Scenes` и type-safe ключи

**Решение: `defineScenes` с самореферентным generic, `goto` как аргумент.**

```ts
function defineScenes<S>(
  scenes: {
    [K in keyof typeof scenes]: (
      state: S,
      ctx: { act: ActFn<S>; goto: GotoFn<keyof typeof scenes, S> }
    ) => void
  }
): typeof scenes
```

TypeScript инферит `K` из ключей передаваемого объекта. Автодополнение в `goto(...)` работает без явного указания типов автором.

Пример:

```ts
// scenes.ts
export const scenes = defineScenes<GameState>({
  start: (state, { act, goto }) => {
    H1('Лес')
    P(`HP: ${strong(String(state.hp))}`)

    act('Поднять ветку', s => { s.hasBranch = true })

    goto('clearing', 'Пойти на поляну')
    goto('cave', 'Войти в пещеру', s => { s.exploredCave = true })
  },
  clearing: (state, { goto }) => { ... },
  cave:     (state, { goto }) => { ... },
  temple:   (state, { goto }) => { ... },
})
```

## 4. Формат возвращаемого значения

**Решение: HTML-строки.**

Теговые функции производят `string`. Буфер — `string`. Сброс в DOM — через `element.innerHTML`. Никаких зависимостей, совместимо со сборкой в single-file HTML.

## 5. Сигнатуры `act` и `goto`

Оба работают как билдеры: вызываются во время рендера сцены/static и ставят кнопку в очередь.

```ts
act(label: string, cb: (s: S) => void): void
// → кнопка в #scene-acts; по клику: cb(state) → перерисовать текущую сцену

goto(key: K, label: string, cb?: (s: S) => void): void
// → кнопка в #scene-goto; по клику: cb?(state) → перейти к сцене key
```

`goto` без колбэка валиден — просто переход без изменения state.  
`act` без колбэка — нет, кнопка без эффекта бессмысленна (колбэк обязателен).

## 6. `static` получает тот же контекст

`static` получает `{ act, goto }` — идентично сценам. `defineGame` инферит ключи из переданного `scenes` и типизирует `goto` в `static` автоматически.

```ts
// game.ts
defineGame({
  state: initialState,
  scenes,
  static: (state, { act, goto }) => {
    H2('Персонаж')
    P(`HP: ${state.hp}  |  Gold: ${state.gold}`)

    if (state.hasScroll) {
      goto('temple', 'Использовать свиток', s => { s.hasScroll = false })
    }
  },
})
```

`goto` в `static` — корректный паттерн для глобальных переходов (инвентарь, телепортация). Он попадает в `gotoBuffer` и рендерится в `#scene-goto` наравне со сценными переходами.
