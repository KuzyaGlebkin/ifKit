## MODIFIED Requirements

### Requirement: Пресет акцентного цвета
Модалка SHALL содержать визуальную группу (сегментные кнопки в одной «рамке», контейнер `ifk-segment-group`) выбора **пресетов** акцентного цвета, соответствующих `Settings.accent` (см. `user-settings`). Активный пресет SHALL быть визуально выделен, как в группе «Тема», **в том числе без наведения указателя** на кнопку.

The root row `#ifk-settings-accent-row` (label + `ifk-segment-group`) SHALL have `aria-hidden` set the same way as the `#ifk-settings-theme-font` bundle (Theme + Font): AT must not include this subtree in the reading order. The preset segment buttons (`.ifk-accent-btn`) SHALL have `tabindex` -1, matching the theme row pattern (`.ifk-theme-btn` inside the hidden block), so the settings modal focus lock does not tab into them (see `modal-focus-lock`).

#### Scenario: Выбор ненулевого пресета меняет оформление
- **WHEN** пользователь выбирает пресет, отличный от `default`
- **THEN** визуально смена заметна на UI-элементах, использующих токен акцента; значение **сохраняется** (подтверждение в `user-settings`)

#### Scenario: Пресет `default` согласован с `style.css`
- **WHEN** `accent: 'default'`
- **THEN** `applySettings` **не** оставляет конфликтующих с темами лишних инлайнов, чтобы работали `style.css` и `data-theme` (см. `user-settings` / `ui-theming`).

#### Scenario: Активный пресет виден без наведения
- **WHEN** модалка открыта и указатель не находится над рядом «Акцент»
- **THEN** кнопка, соответствующая текущему `Settings.accent`, имеет то же явное активное оформление, что и при наведении на неактивные сегменты (индикация не зависит только от `:hover`)

#### Scenario: `aria-hidden` on accent root
- **WHEN** the settings modal is open
- **THEN** the element with `id` `ifk-settings-accent-row` has the same hidden-from-AT contract as the Theme/Font block (`#ifk-settings-theme-font`).

#### Scenario: Tab does not target accent segments
- **WHEN** the settings modal is open and the user uses Tab/Shift+Tab
- **THEN** `.ifk-accent-btn` with `tabindex` -1 are not in the same tab list as the accessible controls (same pattern as theme segment buttons in `aria-hidden`).
