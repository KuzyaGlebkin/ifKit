## MODIFIED Requirements

### Requirement: Поле settings — авторские умолчания настроек (опционально)
`defineGame()` SHALL принимать необязательное поле `settings: Partial<Settings>`. Движок SHALL сливать переданные значения с `engineDefaults`, результат использовать как `authorDefaults` — начальное состояние настроек при первом запуске и целевое состояние при сбросе. Если поле `settings` не передано, `authorDefaults` равен `engineDefaults`.

#### Scenario: Авторское поле settings перекрывает движковые умолчания
- **WHEN** автор передаёт `settings: { theme: 'dark', fontSize: 1.1 }`
- **THEN** при первом запуске применяется `theme: 'dark'` и `fontSize: 1.1`; `musicVolume` и `soundVolume` берутся из `engineDefaults`

#### Scenario: Отсутствие поля settings не вызывает ошибок
- **WHEN** автор вызывает `defineGame({ state, scenes })` без поля `settings`
- **THEN** игра запускается, применяются `engineDefaults`

#### Scenario: Кнопка «Сбросить настройки» возвращает к авторским значениям
- **WHEN** пользователь изменил тему на «Светлая» и нажал «Сбросить»
- **THEN** восстанавливается `theme: 'dark'` (авторское значение), не `theme: 'system'` (движковое)
