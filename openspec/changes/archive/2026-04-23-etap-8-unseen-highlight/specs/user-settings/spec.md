## MODIFIED Requirements

### Requirement: Схема настроек v1
Движок SHALL определять тип `Settings` с полями: `theme: 'light' | 'dark' | 'system'`, `fontSize: number` (множитель 0.8–1.4), `musicVolume: number` (0–1), `soundVolume: number` (0–1), `language: string` (добавлено в этапе 7), `showUnseenHighlight: boolean` (показывать подсветку новых блоков).

#### Scenario: Тип Settings статически проверяется
- **WHEN** код пытается записать `{ theme: 'auto' }` как Settings
- **THEN** TypeScript выдаёт ошибку компиляции

#### Scenario: showUnseenHighlight принимает boolean
- **WHEN** код записывает `{ showUnseenHighlight: false }` как часть Settings
- **THEN** TypeScript принимает без ошибок

### Requirement: Движковые умолчания настроек
Движок SHALL определять константу `engineDefaults: Settings` со значениями: `theme: 'system'`, `fontSize: 1.0`, `musicVolume: 0.8`, `soundVolume: 1.0`, `language: ''`, `showUnseenHighlight: true`.

#### Scenario: engineDefaults покрывают все поля Settings
- **WHEN** `engineDefaults` используется как fallback
- **THEN** результирующий объект является валидным `Settings` без undefined-полей

#### Scenario: showUnseenHighlight включён по умолчанию
- **WHEN** читается `engineDefaults.showUnseenHighlight`
- **THEN** значение `true`
