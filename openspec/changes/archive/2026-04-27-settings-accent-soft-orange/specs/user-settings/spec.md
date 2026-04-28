## ADDED Requirements

### Requirement: Миграция устаревшего значения `accent: 'violet'`

Движок SHALL при нормализации/слиянии настроек, прочитанных из хранилища (или иного внешнего JSON), преобразовывать `accent: 'violet'` в `accent: 'orange'`, поскольку перечислимый пресет `violet` заменён на `orange`. Тип `AccentPreset` SHALL NOT содержать `'violet'`.

#### Scenario: Старый сейв с violet становится orange

- **WHEN** из хранилища получен объект, где `accent` равен `'violet'`
- **THEN** после нормализации значение `accent` в результате `loadSettings` (или эквивалентного пути) равно `'orange'`

#### Scenario: Нормальный сейв с orange

- **WHEN** в хранилище сохранено `accent: 'orange'`
- **THEN** значение **не** меняется на другой пресет
