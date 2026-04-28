## Context

Snackbar реализован в `src/ifKit/snackbar.ts`: создаётся `#snackbar-container` в `body`, сообщения — `.snackbar-item` с `textContent`. Стили отсутствуют. В `style.css` уже заданы `--ifk-radius` (6px, как у кнопок) и визуал непрочитанного абзаца (`.paragraph--unseen` с `border-radius: 3px` и полупрозрачным жёлтым фоном). Требуется визуальная согласованность без дублирования «третьего» радиуса: для плашек snackbar использовать **`var(--ifk-radius)`** как у кнопок; непрочитанное в спеке упоминается как ориентир силуэта, не как отдельное значение 3px, если нет дизайн-причины оставлять 3px.

## Goals / Non-Goals

**Goals:**

- Фиксированная зона **внизу экрана, по горизонтали по центру**; safe-area/inset снизу на мобильных при необходимости.
- Каждое уведомление — отдельная плашка с **скруглением** `border-radius: var(--ifk-radius)`.
- Темы: читаемый текст/фон/обводка через существующие токены (`--ifk-color-bg`, `--ifk-color-text`, `--ifk-color-border`, опционально `--ifk-color-surface`).
- `z-index` выше контента, ниже или на уровне модалок — чтобы snackbar оставался видимым, но не перекрывал критичные модалки; разумно **ниже** `.ifk-modal-backdrop` (1000) или согласовать (например 900), чтобы настройки/сейвы оставались сверху.

**Non-Goals:**

- Анимации появления/ухода (fade/slide) — вне scope, если не запрошено в tasks.
- Изменение длительности авто-скрытия или TypeScript-логики очереди.
- Менять классы/разметку в `snackbar.ts` — только если чистого CSS недостаточно (стараться избегать).

## Decisions

1. **Позиционирование** — `#snackbar-container`: `position: fixed; left: 50%; transform: translateX(-50%); bottom: max(env(safe-area-inset-bottom, 0px), var(--ifk-spacing));` (или `bottom` + `left`/`right` с flex и `align-items: center` через flex на full-width обёртке). Альтернатива: `left: 0; right: 0; display: flex; flex-direction: column; align-items: center` — проще для стека снизу вверх. **Выбор:** flex-колонка, `align-items: center`, `bottom` + горизонтальные `padding`, чтобы длинные строки не касались краёв.

2. **Порядок стека** — визуально новые снизу (как сейчас append) или наоборот: append добавляет в конец; при `column-reverse` последний визуально окажется «ниже». **Выбор:** оставить порядок DOM как есть (`flex-direction: column` без reverse), новые плашки **ниже** предыдущих — согласовано с типичным snackbar.

3. **z-index** — `z-index: 900` (пример) при модалке 1000 — snackbar не перекрывает модалки. Если нужно видеть и под модалкой — вне scope; по умолчанию контент кликабелен, модалка редка.

4. **Фон плашки** — `background: var(--ifk-color-surface)` + `border: 1px solid var(--ifk-color-border)` + тень лёгкая (как у диалога или слабее) для отделения от сцены; **не** копировать жёлтый `paragraph--unseen` на фон snackbar, чтобы не путать с непрочитанным; скругление берём как у кнопок.

## Risks / Trade-offs

- **[Фиксированный низ перекрывает gotos на узком экране]** → `bottom` + достаточный `padding` у `#content` не вводим глобально в этом change; при жалобах — follow-up. Можно добавить отступ снизу у `#game`/`body` при наличии snackbar — out of scope unless в tasks.
- **[transform на контейнере и position fixed]** — избегать `transform` на container если ломает `position: fixed` детей в старых Safari; **предпочтение** flex centering без transform на wrapper.

## Migration Plan

Только визуальные стили: откат — удаление блока CSS. Релиз: обычный deploy.

## Open Questions

- Нужен ли `prefers-reduced-motion` для появления — только если появятся анимации.
