## 1. ARIA-атрибуты зон интерфейса (`index.html`)

- [x] 1.1 Добавить `role="navigation"` и `aria-label="Управление игрой"` на `<nav id="controls">`
- [x] 1.2 Добавить `role="main"` и `aria-label="Сцена"` на `<div id="content">`
- [x] 1.3 Задокументировать в комментарии `index.html`, что `#scene-content`, `#scene-acts`, `#scene-gotos` создаются движком с нужными атрибутами

## 2. Инициализация layout (`layout.ts`)

- [x] 2.1 Реализовать функцию `initLayout(sceneEl: HTMLElement): void` — устанавливает `tabIndex = -1` на `#scene-content`
- [x] 2.2 Реализовать функцию `focusAfterRender(staticEl, sceneEl, actsEl, gotosEl)` с приоритетом: первый focusable в static → static → sceneEl → первая кнопка в acts/gotos
- [x] 2.3 Реализовать вспомогательную `firstFocusable(el: HTMLElement): HTMLElement | null` — ищет первый `button, a, input, [tabindex]` в потомках

## 3. Семантика зон в `engine.ts`

- [x] 3.1 При создании `#scene-content` задать `role="region"` и `aria-label="Описание сцены"`
- [x] 3.2 При создании `#scene-acts` задать `role="group"` и `aria-label="Действия"`
- [x] 3.3 При создании `#scene-gotos` задать `role="navigation"` и `aria-label="Переходы"`
- [x] 3.4 При создании `#static` задать `role="complementary"` и `aria-label="Статус"`
- [x] 3.5 Вызвать `initLayout(sceneEl)` после создания `#scene-content` в `defineGame`

## 4. Кнопки act / goto в `renderer.ts`

- [x] 4.1 В `flushActsToDOM`: добавить `btn.className = 'btn-act'` и `btn.setAttribute('aria-label', 'Act: ' + label)`
- [x] 4.2 В `flushGotosToDOM`: добавить `btn.className = 'btn-goto'` и `btn.setAttribute('aria-label', 'Go to: ' + label)`

## 5. Фокус-менеджмент в `scenes.ts`

- [x] 5.1 Импортировать `focusAfterRender` из `layout.ts`
- [x] 5.2 Вызвать `focusAfterRender(_staticEl, _sceneEl, _actsEl, _gotosEl)` в конце `runGameLoop`, после всех трёх `flush`-вызовов

## 6. CSS-переменные и темизация (`style.css`)

- [x] 6.1 Определить восемь токенов в `:root`: `--ifk-color-bg`, `--ifk-color-text`, `--ifk-color-accent`, `--ifk-color-surface`, `--ifk-color-border`, `--ifk-font-size-base`, `--ifk-radius`, `--ifk-spacing`
- [x] 6.2 Определить переопределения тёмной темы в `[data-theme="dark"]`
- [x] 6.3 Добавить `@media (prefers-color-scheme: dark)` с теми же переопределениями как фоллбэк
- [x] 6.4 Проверить контраст дефолтного `--ifk-color-accent` против фона кнопки в обеих темах (≥ 3:1 WCAG AA)

## 7. Базовые стили зон и кнопок (`style.css`)

- [x] 7.1 Стили зон: `body`, `#content`, `#static`, `#scene-content`, `#scene-acts`, `#scene-gotos` — использовать только `var(--ifk-*)`
- [x] 7.2 Стили `.btn-act` (outlined): `background: transparent`, `border: 2px solid var(--ifk-color-accent)`, `color: var(--ifk-color-accent)`
- [x] 7.3 Стили `.btn-goto` (filled): `background: var(--ifk-color-accent)`, `border: none`, `color: <контрастный цвет>`
- [x] 7.4 Flex-контейнеры для `#scene-acts` и `#scene-gotos` с `flex-wrap: wrap` и gap через `--ifk-spacing`
- [x] 7.5 Стили `#controls` (nav): расположение кнопок управления

## 8. Адаптивная вёрстка (`style.css`)

- [x] 8.1 Базовый макет для десктопа (≥ 768px): ограничение ширины контента, центрирование
- [x] 8.2 Адаптив для мобильного (< 480px): кнопки переносятся, отступы уменьшаются через `--ifk-spacing`
