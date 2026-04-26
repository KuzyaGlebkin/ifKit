## ADDED Requirements

### Requirement: Пресет акцентного цвета из настроек игрока
Когда `applySettings` применяет `Settings.accent` (см. `user-settings`), **не-`default` пресет** SHALL устанавливать на `document.documentElement` инлайн-значения `--ifk-color-accent` и при необходимости `--ifk-color-accent-fg` из **фиксированной** таблицы, согласованной с `style.css` и контрастом кнопок. **Пресет** `default` SHALL снимать эти инлайн, чтобы **воспользовались** значениями **из** `style.css` (движок/автор) и `data-theme`.

#### Scenario: Смена пресета и возврат к `default`
- **WHEN** `accent: 'violet'`, затем `accent: 'default'`, при **любой** допустимой `theme`
- **THEN** в состоянии `violet` акцент **из** таблицы; в `default` — **без** инлайн, как в `style.css` для текущей темы
