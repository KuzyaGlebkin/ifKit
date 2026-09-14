## MODIFIED Requirements

### Requirement: Применение настроек к DOM
Функция `applySettings(settings)` SHALL применять настройки к DOM: для `theme` — устанавливать `data-theme` на `<html>` (`'light'` / `'dark'`) или убирать атрибут (`'system'`); для `fontSize` — устанавливать CSS-переменную `--ifk-font-size-base` на `:root` как `${fontSize}rem`, что приводит к пропорциональному scaling ширины модальных окон, основной игры и главного меню при использовании `rem` для их ширины; для `accent` **не**-`default` — устанавливать `--ifk-color-accent` (и при необходимости `--ifk-color-accent-fg` для контраста) на `document.documentElement` из встроенного мапа пресетов. Для `default` — **снимать** эти инлайн-переопределения, чтобы применялись значения из `style.css` (согласуется с `ui-theming`).

#### Scenario: Тёмная тема устанавливает data-theme
- **WHEN** `applySettings({ theme: 'dark', ... })` с **прочей** валидной `Settings`
- **THEN** `document.documentElement.dataset.theme === 'dark'`

#### Scenario: Системная тема убирает data-theme
- **WHEN** `applySettings({ theme: 'system', ... })` с **прочей** валидной `Settings`
- **THEN** атрибут `data-theme` на `<html>` отсутствует

#### Scenario: fontSize применяется как CSS-переменная
- **WHEN** `applySettings({ fontSize: 1.2, ... })` с **прочей** валидной `Settings`
- **THEN** `:root` имеет `--ifk-font-size-base: 1.2rem`

#### Scenario: Ширина модального окна масштабируется с fontSize
- **WHEN** `applySettings({ fontSize: 1.2, ... })` с **прочей** валидной `Settings` и ширина модального окна задана в `rem`
- **THEN** вычисленная ширина модального окна увеличивается в 1.2 раза относительно базовой ширины при `fontSize: 1.0`

#### Scenario: Ширина основной игры масштабируется с fontSize
- **WHEN** `applySettings({ fontSize: 0.8, ... })` с **прочей** валидной `Settings` и ширина основного контейнера игры задана в `rem`
- **THEN** вычисленная ширина основного контейнера игры уменьшается в 0.8 раза относительно базовой ширины при `fontSize: 1.0`

#### Scenario: Ширина главного меню масштабируется с fontSize
- **WHEN** `applySettings({ fontSize: 1.1, ... })` с **прочей** валидной `Settings` и ширина главного меню задана в `rem`
- **THEN** вычисленная ширина главного меню увеличивается в 1.1 раза относительно базовой ширины при `fontSize: 1.0`

#### Scenario: accent default не залипает
- **WHEN** `applySettings` вызывается с `accent: 'default'`
- **THEN** инлайн на `--ifk-color-accent` (и `accent-fg`, если писались) **снят**, чтобы работали `style.css` и `data-theme`

`applySettings` **после** инициализации i18n SHALL вызывать `syncRootLangFromI18n`, чтобы `document.documentElement.lang` согласовывался с resolved-языком i18n.

#### Scenario: applySettings обновляет lang
- **WHEN** i18n инициализирован и вызывается `applySettings` с валидными `Settings`
- **THEN** атрибут `lang` на `<html>` согласован с активным resolved языком (через `syncRootLangFromI18n`)
