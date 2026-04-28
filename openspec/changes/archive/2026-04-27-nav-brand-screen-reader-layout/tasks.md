## 1. Разметка панели

- [x] 1.1 В `src/index.html` обернуть четыре кнопки `#controls` в `<ul class="ifk-controls-actions">` с четырьмя `<li>`, сохранить порядок и `id` кнопок; логотип `.ifk-brand-logo` оставить первым дочерним элементом `#controls`.

## 2. Стили

- [x] 2.1 В `src/style.css` для `#controls` обеспечить прижатие `.ifk-controls-actions` к правому краю (`margin-inline-start: auto`), внутри списка — flex-ряд с `gap` как у текущих кнопок, `list-style: none`, нулевые margin/padding у `ul` при необходимости.
- [x] 2.2 Проверить медиазапросы (`max-width: 600px`, `300px` для логотипа): селекторы `#controls button` и скрытие `.ifk-brand-logo` работают с новой вложенностью.

## 3. Спеки и проверка

- [x] 3.1 После реализации выполнить `openspec apply` / слияние дельт в `openspec/specs/` по процессу репозитория и прогнать релевантные проверки (`npm run build` или согласованную команду проекта).
