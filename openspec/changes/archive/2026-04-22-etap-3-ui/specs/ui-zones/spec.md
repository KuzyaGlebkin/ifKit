## ADDED Requirements

### Requirement: Семантические атрибуты зон интерфейса
`index.html` SHALL содержать ARIA-атрибуты на всех зонах интерфейса: `#controls` — `role="navigation"` с `aria-label`, `#scene-content` — `role="main"` с `aria-label`, `#scene-acts` — `role="group"` с `aria-label`, `#scene-gotos` — `role="navigation"` с `aria-label`. Зона `#static` при наличии SHALL иметь `role="complementary"` с `aria-label`.

#### Scenario: Скринридер объявляет зоны
- **WHEN** скринридер обходит страницу по landmark-регионам
- **THEN** он находит и объявляет все присутствующие зоны с их именами

#### Scenario: Статичная зона присутствует
- **WHEN** автор объявил функцию `static` в `defineGame`
- **THEN** `#static` рендерится с `role="complementary"` и `aria-label`

#### Scenario: Статичная зона отсутствует
- **WHEN** автор не объявил функцию `static`
- **THEN** элемент `#static` не создаётся в DOM

### Requirement: Программный фокус `#scene-content`
`#scene-content` SHALL иметь атрибут `tabindex="-1"`, установленный один раз при инициализации в `layout.ts`. Это позволяет перемещать фокус на контейнер программно, не включая его в порядок Tab-навигации пользователя.

#### Scenario: Инициализация layout
- **WHEN** `initLayout(sceneEl)` вызывается при старте игры
- **THEN** `sceneEl.tabIndex` равно `-1`

#### Scenario: Повторный рендер не сбрасывает tabindex
- **WHEN** `flushHtmlToDOM` перезаписывает содержимое `#scene-content`
- **THEN** `tabindex="-1"` на контейнере сохраняется (он не является `innerHTML`)

### Requirement: Управление фокусом после перерисовки
После каждого вызова `runGameLoop` движок SHALL переместить фокус в следующем приоритете:
1. Первый focusable-потомок `#static` (если зона существует и содержит focusable-элементы)
2. Иначе — сам `#static` (если зона существует)
3. Иначе — `#scene-content` (если не пуст)
4. Иначе — первая кнопка в `#scene-acts`, затем `#scene-gotos`

`aria-live` на `#scene-content` SHALL NOT устанавливаться, чтобы избежать двойного зачитывания.

#### Scenario: Переход на сцену с контентом и без static
- **WHEN** `goto` переводит на сцену, где `static` не задан, а `scene-content` не пуст
- **THEN** фокус перемещается на `#scene-content`

#### Scenario: Переход на сцену со static
- **WHEN** `goto` переводит на сцену, где задана статичная зона
- **THEN** фокус перемещается на первый focusable-потомок `#static` или на сам `#static`

#### Scenario: Сцена без контента и без static
- **WHEN** автор не добавил контент в `scene-content` и не задал `static`
- **THEN** фокус перемещается на первую кнопку в `#scene-acts`, при её отсутствии — в `#scene-gotos`

#### Scenario: Действие `act` без перехода
- **WHEN** игрок нажимает кнопку `act`, которая не вызывает `goto`
- **THEN** после перерисовки фокус управляется по тому же приоритету (static → scene → кнопка)
