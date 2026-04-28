## MODIFIED Requirements

### Requirement: Пресет акцентного цвета из настроек игрока

Когда `applySettings` применяет `Settings.accent` (см. `user-settings`), **не-`default` пресет** SHALL устанавливать на `document.documentElement` инлайн-значения `--ifk-color-accent` и при необходимости `--ifk-color-accent-fg` из **фиксированной** таблицы, согласованной с `style.css` и контрастом кнопок. **Пресет** `default` SHALL снимать эти инлайн, чтобы **воспользовались** значениями **из** `style.css` (движок/автор) и `data-theme`. Таблица SHALL содержать пресет `orange` (мягкий оранжевый) **вместо** удалённого `violet`.

#### Scenario: Смена пресета и возврат к `default`

- **WHEN** `accent: 'orange'`, затем `accent: 'default'`, при **любой** допустимой `theme`
- **THEN** в состоянии `orange` акцент **из** таблицы; в `default` — **без** лишнего инлайн, как в `style.css` для текущей темы
