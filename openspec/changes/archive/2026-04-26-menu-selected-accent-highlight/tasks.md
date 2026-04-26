## 1. CSS: специфичность и акцент

- [x] 1.1 В `src/style.css` повысить специфичность правил для `.ifk-theme-btn--active`, `.ifk-accent-btn--active`, `.ifk-lang-btn--active` (включая `:hover` на активном), чтобы они перекрывали базовые `.ifk-segment-group .ifk-theme-btn` / `.ifk-accent-btn` / `.ifk-lang-btn` и общий `:hover` для неактивных — активное оформление видно без наведения указателя.
- [x] 1.2 Привязать `--ifk-segment-selected-bg`, `--ifk-segment-selected-fg` (и при необходимости `--ifk-segment-selected-bg-hover`) к `var(--ifk-color-accent)` / `var(--ifk-color-accent-fg)` во всех ветках темы (`:root`, `[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`), сохранив читаемый hover для активного сегмента.

## 2. Спеки и проверка

- [x] 2.1 После архивации этого change — перенести дельты из `openspec/changes/menu-selected-accent-highlight/specs/*/spec.md` в канонические `openspec/specs/settings-modal/spec.md` и `openspec/specs/ui-theming/spec.md` (или выполнить согласно процессу проекта `openspec archive`).
- [x] 2.2 Ручная проверка: открыть модалку настроек, не наводя курсор на «Тема» / «Акцент» / «Язык», убедиться, что выбранный сегмент окрашен акцентом; переключить пресет акцента и тему — индикация остаётся согласованной с акцентом.
