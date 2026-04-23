## 1. Буферы рендеринга (renderer.ts)

- [x] 1.1 Создать `src/ifKit/renderer.ts`; объявить тип `ActionDef = { label: string; handler: () => void }` и три буфера: `let htmlBuffer = ''`, `const actBuffer: ActionDef[] = []`, `const gotoBuffer: ActionDef[] = []`
- [x] 1.2 Реализовать и экспортировать `clearBuffers(): void` — очищает все три буфера
- [x] 1.3 Реализовать и экспортировать `getHtmlBuffer(): string`
- [x] 1.4 Реализовать и экспортировать `appendHtml(html: string): void`
- [x] 1.5 Реализовать и экспортировать `addAct(label: string, handler: () => void): void`
- [x] 1.6 Реализовать и экспортировать `addGoto(label: string, handler: () => void): void`
- [x] 1.7 Реализовать и экспортировать `flushHtmlToDOM(element: HTMLElement): void` — присваивает `element.innerHTML = htmlBuffer`, затем очищает `htmlBuffer`
- [x] 1.8 Реализовать и экспортировать `flushActsToDOM(element: HTMLElement): void` — очищает `element`, создаёт `<button>` для каждого элемента `actBuffer` с обработчиком click, очищает `actBuffer`
- [x] 1.9 Реализовать и экспортировать `flushGotosToDOM(element: HTMLElement): void` — очищает `element`, создаёт `<button>` для каждого элемента `gotoBuffer` с обработчиком click, очищает `gotoBuffer`

## 2. Теговые функции (tag-functions.ts)

- [x] 2.1 Создать `src/ifKit/tag-functions.ts`
- [x] 2.2 Реализовать внутреннюю вспомогательную функцию `buildTag(tag: string, content?: string, attrs?: Record<string, string>): string` — собирает HTML-строку вида `<tag attr="val">content</tag>`
- [x] 2.3 Реализовать и экспортировать функциональные функции: `p`, `h1`, `h2`, `h3`, `em`, `strong`, `span`, `a` — принимают `(content: string, attrs?: Record<string, string>)`, возвращают строку
- [x] 2.4 Реализовать и экспортировать функциональные функции: `li(content: string): string`, `ul(...items: string[]): string`
- [x] 2.5 Реализовать и экспортировать функциональные функции для пустых/самозакрывающихся тегов: `img(attrs: { src: string; alt?: string }): string`, `hr(): string`, `br(): string`
- [x] 2.6 Реализовать и экспортировать императивные аналоги верхнего регистра: `P`, `H1`, `H2`, `H3`, `Em`, `Strong`, `Span`, `A` — каждая вызывает `appendHtml(funcLower(...args))`
- [x] 2.7 Реализовать и экспортировать `Ul(...items: string[]): void` и `Img(attrs: { src: string; alt?: string }): void`, `Hr(): void`

## 3. Движок сцен (scenes.ts)

- [x] 3.1 Создать `src/ifKit/scenes.ts`
- [x] 3.2 Объявить и экспортировать тип `SceneContext<S, K extends string> = { act: (label: string, cb: (s: S) => void) => void; goto: (key: K, label: string, cb?: (s: S) => void) => void }`
- [x] 3.3 Объявить и экспортировать тип `SceneFn<S, K extends string = string> = (state: S, ctx: SceneContext<S, K>) => void`
- [x] 3.4 Объявить и экспортировать тип `Scenes<S> = Record<string, SceneFn<S, any>>`
- [x] 3.5 Реализовать внутренний реестр: `let registeredScenes`, `let currentState`, `let currentSceneKey`
- [x] 3.6 Реализовать и экспортировать `registerScenes<S, K extends string>(scenes: Record<K, SceneFn<S, K>>, state: S): void`
- [x] 3.7 Реализовать внутреннюю функцию `createContext<S, K extends string>(scenes, state, sceneEl, actsEl, gotosEl, staticFn?, staticEl?): SceneContext<S, K>` — возвращает объект с `act` и `goto`, каждый из которых: вызывает `addAct`/`addGoto` с замкнутым handler; handler для `act` выполняет `cb(state)` → `rerender()`; handler для `goto` выполняет `cb?(state)` → `runGameLoop(key)`
- [x] 3.8 Реализовать внутреннюю функцию `rerender(): void` — перезапускает `runGameLoop` для `currentSceneKey`
- [x] 3.9 Реализовать и экспортировать `runGameLoop<S, K extends string>(sceneKey: K, scenes, state, sceneEl, actsEl, gotosEl, staticFn?, staticEl?): void` — полный цикл: `clearBuffers()` → если есть `staticFn`: вызвать → `flushHtmlToDOM(staticEl)` → вызвать сцену с ctx → `flushHtmlToDOM(sceneEl)` → `flushActsToDOM(actsEl)` → `flushGotosToDOM(gotosEl)`; выбрасывает ошибку если ключ не найден; не сбрасывает DOM при исключении в сцене

## 4. Точка входа и defineGame (engine.ts + index.ts)

- [x] 4.1 Обновить `src/ifKit/engine.ts`: обновить тип `GameConfig<S, K>` — поле `static` теперь `SceneFn<S, K>`, добавить `SceneContext` в типы; реализовать `defineGame<S, K extends string>(config: { state: S; scenes: Record<K, SceneFn<S, K>>; static?: SceneFn<S, K> }): void`
- [x] 4.2 Внутри `defineGame`: создать DOM-зоны динамически в `#content`: `#static` (если есть `config.static`), `#scene-content`, `#scene-acts`, `#scene-gotos`
- [x] 4.3 Внутри `defineGame`: вызвать `registerScenes(config.scenes, config.state)`
- [x] 4.4 Внутри `defineGame`: запустить первую сцену через `runGameLoop(Object.keys(config.scenes)[0], ...)` после `DOMContentLoaded` (или сразу, если DOM уже готов)
- [x] 4.5 Обновить `src/ifKit/index.ts`: экспортировать все теговые функции из `tag-functions.ts`; экспортировать `SceneContext`, `SceneFn`, `Scenes` из `scenes.ts`; экспортировать `defineGame` и `GameConfig` из `engine.ts`

## 5. Шаблон автора

- [x] 5.1 Обновить `game.ts` в корне: заменить `console.log` в `static` на теговые функции (`H2`, `P`)
- [x] 5.2 Обновить `scenes.ts` в корне: добавить теговые функции, вызовы `act` и `goto` для демонстрации перехода между двумя сценами
