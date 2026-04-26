## MODIFIED Requirements

### Requirement: Схема настроек v1
Движок SHALL определять тип `Settings` с полями: `theme: 'light' | 'dark' | 'system'`, `fontSize: number` (множитель 0.8–1.4), `musicVolume: number` (0–1), `soundVolume: number` (0–1), `language: string` (код языка или пустая строка для автоопределения), `showUnseenHighlight: boolean` (подсвечивать блоки контента, которые игрок ещё не видел), `accent: AccentPreset` — перечисление фиксированного набора (не менее `default` и нескольких именованных вариантов, точный union SHALL быть в коде).

#### Scenario: Тип Settings статически проверяется
- **WHEN** код пытается записать `{ theme: 'auto' }` как Settings
- **THEN** TypeScript выдаёт ошибку компиляции

#### Scenario: language принимает код языка
- **WHEN** код записывает `{ language: 'en' }` как часть Settings
- **THEN** TypeScript принимает без ошибок

#### Scenario: language принимает пустую строку
- **WHEN** код записывает `{ language: '' }` как часть Settings
- **THEN** TypeScript принимает без ошибок

#### Scenario: accent в объекте настроек
- **WHEN** код передаёт `{ accent: 'default' }` как валидный `accent`
- **THEN** TypeScript принимает без ошибок; нелегальный идентификатор **не** проходит (если union-тип)

### Requirement: Движковые умолчания настроек
Движок SHALL определять константу `engineDefaults: Settings` со значениями: `theme: 'system'`, `fontSize: 1.0`, `musicVolume: 0.8`, `soundVolume: 1.0`, `language: ''`, `accent: 'default'`.

#### Scenario: engineDefaults покрывают все поля Settings
- **WHEN** `engineDefaults` используется как fallback
- **THEN** результирующий объект является валидным `Settings` без undefined-полей

#### Scenario: language по умолчанию — пустая строка
- **WHEN** читается `engineDefaults.language`
- **THEN** значение `''` (автоопределение из navigator.language согласно i18n)

#### Scenario: accent по умолчанию — default
- **WHEN** читается `engineDefaults.accent`
- **THEN** значение `default` (токен акцентa из `style.css` без **лишнего** инлайн-переопределения — см. `applySettings`).

### Requirement: Применение настроек к DOM
Функция `applySettings(settings)` SHALL применять настройки к DOM: для `theme` — устанавливать `data-theme` на `<html>` (`'light'` / `'dark'`) или убирать атрибут (`'system'`); для `fontSize` — устанавливать CSS-переменную `--ifk-font-size-base` на `:root` как `${fontSize}rem`. Для `accent` **не**-`default` — устанавливать `--ifk-color-accent` (и при необходимости `--ifk-color-accent-fg` для контраста) на `document.documentElement` из встроенного мапа пресетов. Для `default` — **снимать** инлайн-переопределения, чтобы применялись значения из `style.css` (согласуется с `ui-theming`).

#### Scenario: Тёмная тема устанавливает data-theme
- **WHEN** `applySettings({ theme: 'dark', ... })` с **прочей** валидной `Settings` 
- **THEN** `document.documentElement.dataset.theme === 'dark'`

#### Scenario: Системная тема убирает data-theme
- **WHEN** `applySettings({ theme: 'system', ... })`
- **THEN** атрибут `data-theme` на `<html>` отсутствует

#### Scenario: fontSize применяется как CSS-переменная
- **WHEN** `applySettings({ fontSize: 1.2, ... })` с **прочей** валидной `Settings`
- **THEN** `:root` имеет `--ifk-font-size-base: 1.2rem`

#### Scenario: accent default не залипает
- **WHEN** `applySettings` вызывается с `accent: 'default'`
- **THEN** инлайн-на `--ifk-color-accent` (и `accent-fg`, **если** писались) **снят**, чтобы работали `style.css` + `[data-theme=…]`

## ADDED Requirements

### Requirement: Значение `accent` в сбросе и authorDefaults
Функция `resetSettings(authorDefaults)` **и** слияние `authorDefaults` SHALL **включать** `accent` так же, как остальные поля (т.е. `author` может **не** указывать — **движковый** `default`).

#### Scenario: Сброс с авторским default accent
- **WHEN** автор задал `settings: { accent: 'blue' }` в config, игрок **сменил** в UI и нажал «Сбросить**
- **THEN** `authorDefaults.accent` (например `'blue'`) восстанавливается
