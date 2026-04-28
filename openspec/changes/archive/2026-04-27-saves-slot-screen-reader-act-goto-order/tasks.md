## 1. Разметка слота и `aria-labelledby`

- [x] 1.1 В `src/ifKit/saves-modal.ts` расширить `namedSlotPreviewExtras` (или место вывода превью): для непустого `actPreview` / `gotoPreview` ренерить `span.ifk-slot-preview` с устойчивыми `id` вида `ifk-slot-act-{index}` / `ifk-slot-goto-{index}` (index — индекс именного слота).
- [x] 1.2 В `renderNamedSlotCard` для занятого слота собрать список id для `aria-labelledby` в порядке: `ifk-slot-num-{index}`; при непустом `label` — `ifk-slot-label-{index}`; при непустом act — id act-превью; при непустом goto — id goto-превью; подставить в `role="group"` на карточке.

## 2. Спеки и проверка

- [x] 2.1 Перенести **MODIFIED** требование из `openspec/changes/.../specs/saves-modal/spec.md` в `openspec/specs/saves-modal/spec.md` (по правилам apply для основной спеки).
- [x] 2.2 Ручная проверка: NVDA/JAWS — занятый слот с `label` + act + goto: после озвучивания сцены объявляются обе строки превью до перехода к кнопкам; варианты только act, только goto, без подписи сцены.

## 3. Вертикальная навигация ArrowUp/ArrowDown в карточке слота

- [x] 3.1 В `src/ifKit/saves-modal.ts`: цепочка фокуса — дети `.ifk-slot-info`, затем дети `.ifk-slot-actions`; `keydown` на `.ifk-slot` переключает фокус по кольцу; `tabindex="-1"` на не-кнопках; `bindSlotArrowNav` / `applySlotLineTabindex` на именных и авто-карточках; `applySlotLineTabindex` после `showDeleteConfirm` / `showOverwriteConfirm`.
- [x] 3.2 В `src/style.css`: `:focus-visible` для детей `.ifk-slot-info` и `.ifk-slot-confirm-text` в области действий.
- [x] 3.3 **ADDED** требование в дельте `specs/saves-modal/spec.md` change и в `openspec/specs/saves-modal/spec.md` — клавиатурная вертикальная навигация по карточке.
- [x] 3.4 Ручная проверка: с фокуса на кнопке «Загрузить» **ArrowUp** проходит по строкам слота, **↓** с последней строки/кнопки — к началу цепочки; режим «Удалить?» / «Перезаписать?»; автослот.
