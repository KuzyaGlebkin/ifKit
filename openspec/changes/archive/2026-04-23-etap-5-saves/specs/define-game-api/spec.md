## ADDED Requirements

### Requirement: Поле saves — конфигурация системы сохранений (опционально)
`defineGame()` SHALL принимать необязательное поле `saves: { slots?: number; historySize?: number }`. Движок SHALL использовать `slots` как количество именных слотов (default 5) и `historySize` как максимальную глубину undo-буфера (default 20). Если поле `saves` не передано, используются оба значения по умолчанию.

#### Scenario: Авторские значения slots и historySize применяются
- **WHEN** автор передаёт `saves: { slots: 3, historySize: 30 }` в `defineGame()`
- **THEN** модальное окно сохранений показывает 3 именных слота; undo-буфер хранит до 30 снимков

#### Scenario: Отсутствие поля saves не вызывает ошибок
- **WHEN** автор вызывает `defineGame({ state, scenes })` без поля `saves`
- **THEN** игра запускается с 5 именными слотами и глубиной истории 20
