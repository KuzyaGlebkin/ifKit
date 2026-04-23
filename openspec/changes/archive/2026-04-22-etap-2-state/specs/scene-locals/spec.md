## ADDED Requirements

### Requirement: ctx.local API
`SceneContext` SHALL предоставлять метод `local<T extends object>(defaults: T): T`. Метод SHALL возвращать мутируемый объект, тип которого выводится из `defaults`.

#### Scenario: Первый вход в сцену
- **WHEN** сцена вызывается впервые и внутри вызывается `ctx.local({ count: 0 })`
- **THEN** возвращается новый объект `{ count: 0 }`, созданный из `defaults`

#### Scenario: Повторный рендер той же сцены
- **WHEN** внутри `act` изменяется `local.count`, после чего происходит ре-рендер той же сцены
- **THEN** `ctx.local({ count: 0 })` возвращает тот же объект с сохранённым значением `count`

#### Scenario: Тип выводится из defaults
- **WHEN** вызывается `ctx.local({ visited: false, attempts: 0 })`
- **THEN** TypeScript знает, что `local.visited` — `boolean`, `local.attempts` — `number`

### Requirement: Сброс при переходе в другую сцену
Локали текущей сцены SHALL удаляться при переходе (`goto`) в сцену с другим ключом.

#### Scenario: Переход в другую сцену
- **WHEN** игрок переходит из сцены `forest` в сцену `cave`
- **THEN** локали сцены `forest` удаляются из хранилища

#### Scenario: Ре-рендер той же сцены
- **WHEN** вызывается `act` и сцена перерисовывается с тем же ключом
- **THEN** локали не удаляются

### Requirement: Снимок для истории
Движок SHALL экспортировать `@internal` функции `getSceneLocalSnapshot(sceneKey)` и `restoreSceneLocal(sceneKey, snapshot)` для использования в системе истории (Этап 5).

#### Scenario: Получение снимка
- **WHEN** вызывается `getSceneLocalSnapshot('forest')`
- **THEN** возвращается `jsonClone` объекта локалей сцены `forest`, либо `null` если локалей нет

#### Scenario: Восстановление снимка
- **WHEN** вызывается `restoreSceneLocal('forest', snapshot)`
- **THEN** хранилище для сцены `forest` заменяется переданным снимком
