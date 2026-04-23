## ADDED Requirements

### Requirement: Система CSS-переменных `--ifk-*`
`style.css` SHALL определять набор CSS-переменных с префиксом `--ifk-` на `:root`. Токены SHALL включать: цвет фона (`--ifk-color-bg`), цвет текста (`--ifk-color-text`), акцентный цвет (`--ifk-color-accent`), цвет поверхности (`--ifk-color-surface`), цвет границы (`--ifk-color-border`), базовый размер шрифта (`--ifk-font-size-base`), скругление (`--ifk-radius`), базовый отступ (`--ifk-spacing`).

#### Scenario: Токены определены в :root
- **WHEN** браузер загружает `style.css`
- **THEN** все восемь токенов `--ifk-*` доступны через `getComputedStyle(document.documentElement)`

#### Scenario: Токены используются в стилях компонентов
- **WHEN** применяются стили зон и кнопок
- **THEN** они ссылаются на `var(--ifk-*)`, а не на литеральные значения цветов, размеров или отступов

### Requirement: Светлая и тёмная темы
`style.css` SHALL определять значения токенов для светлой темы в `:root` и переопределять их для тёмной темы в `[data-theme="dark"]`. Тёмная тема активируется установкой атрибута `data-theme="dark"` на `<html>` или `<body>`. Система SHALL также поддерживать `@media (prefers-color-scheme: dark)` как фоллбэк при отсутствии явного атрибута.

#### Scenario: Светлая тема по умолчанию
- **WHEN** `data-theme` не установлен и системная тема светлая
- **THEN** применяются значения токенов из `:root`

#### Scenario: Тёмная тема через атрибут
- **WHEN** `document.documentElement.setAttribute('data-theme', 'dark')` вызван
- **THEN** применяются значения токенов из `[data-theme="dark"]`

#### Scenario: Тёмная тема через системные настройки
- **WHEN** `data-theme` не установлен и `prefers-color-scheme: dark` активен
- **THEN** применяются значения токенов из блока `@media (prefers-color-scheme: dark)`

### Requirement: Единый акцентный токен
`--ifk-color-accent` SHALL быть единым токеном, работающим в обеих темах. Дефолтное значение SHALL обеспечивать контраст ≥ 3:1 против фона кнопки `btn-goto` как в светлой, так и в тёмной теме (WCAG AA для крупных элементов).

#### Scenario: Контраст акцента в светлой теме
- **WHEN** применяется светлая тема
- **THEN** контраст `--ifk-color-accent` против `--ifk-color-bg` составляет ≥ 3:1

#### Scenario: Контраст акцента в тёмной теме
- **WHEN** применяется тёмная тема
- **THEN** контраст `--ifk-color-accent` против `--ifk-color-bg` составляет ≥ 3:1

### Requirement: Три слоя переопределения токенов
Каскад SHALL поддерживать три независимых уровня кастомизации без конфликтов:
1. **Движок** — дефолты в `style.css` (`:root`)
2. **Автор игры** — переопределение в своём CSS или через `<style>` инжектированный в `game.ts`
3. **Игрок** — переопределение через `document.documentElement.style.setProperty('--ifk-*', value)` из JS (реализуется в этапе 4)

#### Scenario: Переопределение автором
- **WHEN** автор задаёт `--ifk-color-accent: #c0392b` в своём CSS после `style.css`
- **THEN** кнопки `btn-goto` отображаются с цветом `#c0392b`

#### Scenario: Переопределение игроком через JS
- **WHEN** `document.documentElement.style.setProperty('--ifk-font-size-base', '1.4rem')` вызван
- **THEN** весь текст игры масштабируется до `1.4rem` без перезагрузки
