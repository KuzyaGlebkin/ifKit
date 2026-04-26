## Why

Игра не работает со скринридерами: программный вызов `sceneEl.focus()` переключает NVDA/Narrator в Application Mode, из-за чего статичный текст сцены не зачитывается. Параграфы `<p>` в фокусном режиме объявляются только как "text" без содержимого. IF-игра должна быть доступна клавиатурным пользователям и пользователям со скринридерами.

## What Changes

- `#scene-content` получает `aria-live="polite"` и `aria-atomic="true"` — новый контент сцены автоматически зачитывается скринридером при изменении
- Надёжная замена контента: очистка DOM перед вставкой нового HTML, чтобы `aria-live` корректно срабатывал
- Фокус после рендера переходит на первую кнопку (act или goto), а не на `#scene-content` — скринридер остаётся в Browse Mode и может читать текст стрелками
- `tabIndex = -1` на `#scene-content` сохраняется для programmatic focus при необходимости, но `.focus()` на нём больше не вызывается в стандартном потоке

## Capabilities

### New Capabilities

- `screen-reader`: Поддержка скринридеров — `aria-live` регион для автоматического объявления контента сцены; корректный порядок фокуса

### Modified Capabilities

- `ui-zones`: Изменяется поведение фокуса в `#scene-content` — убирается автоматический `sceneEl.focus()`, добавляется `aria-live`

## Impact

- `src/ifKit/engine.ts` — добавление атрибутов `aria-live`/`aria-atomic` на `#scene-content`
- `src/ifKit/layout.ts` — правка `focusAfterRender`: убрать `sceneEl.focus()`, всегда фокусировать первую кнопку
- `src/ifKit/renderer.ts` — `flushHtmlToDOM`: двухшаговая замена (очистка → вставка) для надёжного срабатывания `aria-live`
