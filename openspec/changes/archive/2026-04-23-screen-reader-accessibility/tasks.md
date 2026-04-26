## 1. renderer.ts — двухшаговая замена DOM

- [x] 1.1 В `flushHtmlToDOM` заменить `element.innerHTML = html` на двухшаговое `element.innerHTML = ''` → `element.innerHTML = html`

## 2. layout.ts — tabindex и aria-label на блочные элементы сцены

- [x] 2.1 Добавить `makeSceneContentFocusable(sceneEl)`: перебрать `p, h1, h2, h3, ul, img` в `#scene-content`, проставить `tabIndex = 0` и `aria-label` из `textContent` (или `alt` для img)
- [x] 2.2 Обновить `FOCUSABLE` селектор с `[tabindex]` на `[tabindex="0"]` (исключить элементы с tabindex="-1")

## 3. layout.ts — новый приоритет фокуса

- [x] 3.1 В `focusAfterRender` новый приоритет: static → первый focusable в sceneEl (первый абзац/заголовок) → первая кнопка → sceneEl (fallback)

## 4. scenes.ts — вызов makeSceneContentFocusable после рендера

- [x] 4.1 Вызвать `makeSceneContentFocusable(_sceneEl)` после `markAndHighlight` в `runGameLoop`

## 5. style.css — focus ring для элементов сцены

- [x] 5.1 Добавить `#scene-content [tabindex="0"]:focus-visible` с outline и border-radius

## 6. openspec/specs — обновить мастер-спеки

- [x] 6.1 Обновить `openspec/specs/ui-zones/spec.md` (приоритет фокуса)
- [x] 6.2 Обновить `openspec/specs/screen-reader/spec.md` (tabindex-подход вместо aria-live)
