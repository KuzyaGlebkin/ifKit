## MODIFIED Requirements

### Requirement: Схема настроек v1
Движок SHALL определять тип `Settings` с полями: `theme: 'light' | 'dark' | 'system'`, `fontSize: number` (множитель 0.8–1.4), `musicVolume: number` (0–1), `soundVolume: number` (0–1), `language: string` (код языка или пустая строка для автоопределения).

#### Scenario: Тип Settings статически проверяется
- **WHEN** код пытается записать `{ theme: 'auto' }` как Settings
- **THEN** TypeScript выдаёт ошибку компиляции

#### Scenario: language принимает код языка
- **WHEN** код записывает `{ language: 'en' }` как часть Settings
- **THEN** TypeScript принимает без ошибок

#### Scenario: language принимает пустую строку
- **WHEN** код записывает `{ language: '' }` как часть Settings
- **THEN** TypeScript принимает без ошибок

### Requirement: Движковые умолчания настроек
Движок SHALL определять константу `engineDefaults: Settings` со значениями: `theme: 'system'`, `fontSize: 1.0`, `musicVolume: 0.8`, `soundVolume: 1.0`, `language: ''`.

#### Scenario: engineDefaults покрывают все поля Settings
- **WHEN** `engineDefaults` используется как fallback
- **THEN** результирующий объект является валидным `Settings` без undefined-полей

#### Scenario: language по умолчанию — пустая строка
- **WHEN** читается `engineDefaults.language`
- **THEN** значение `''` (автоопределение из navigator.language)
