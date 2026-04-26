## REMOVED Requirements

### Requirement: Семантические атрибуты зон интерфейса
**Reason**: Зона `#static` как отдельный DOM-элемент удалена — static-контент теперь рендерится внутри `#scene-content` через zone-функции. Требование заменяется обновлённой версией без упоминания `#static`.
**Migration**: Авторы, стилизовавшие `#static` в CSS, должны перейти на стилизацию через классы или атрибуты на элементах внутри `#scene-content`.

### Requirement: Управление фокусом после перерисовки
**Reason**: Приоритет фокуса упрощается — `#static` больше не существует как отдельный DOM-узел.
**Migration**: Нет изменений для авторов игр; поведение фокуса автоматически обновляется движком.

## ADDED Requirements

### Requirement: Семантические атрибуты зон интерфейса
`index.html` SHALL содержать ARIA-атрибуты на всех зонах интерфейса: `#controls` — `role="navigation"` с `aria-label`, `#scene-content` — `role="main"` с `aria-label`, `#scene-acts` — `role="group"` с `aria-label`, `#scene-gotos` — `role="navigation"` с `aria-label`. Зона `#static` более не создаётся.

#### Scenario: Скринридер объявляет зоны
- **WHEN** скринридер обходит страницу по landmark-регионам
- **THEN** он находит и объявляет `#controls`, `#scene-content`, `#scene-acts`, `#scene-gotos` с их именами

### Requirement: Управление фокусом после перерисовки
После каждого вызова `runGameLoop` движок SHALL переместить фокус в следующем приоритете:
1. Первый элемент с `tabindex="0"` в `#scene-content` (если не пуст)
2. Первая кнопка в `#scene-acts`
3. Первая кнопка в `#scene-gotos`
4. `#scene-content` сам (последний запасной вариант)

#### Scenario: Переход на сцену с before-контентом от static
- **WHEN** `goto` переводит на сцену, static заполнил before-зону с focusable-элементами
- **THEN** фокус перемещается на первый элемент с `tabindex="0"` в `#scene-content`

#### Scenario: Переход на сцену без static
- **WHEN** `goto` переводит на сцену, где `static` не задан, `#scene-content` не пуст
- **THEN** фокус перемещается на первый блочный элемент `#scene-content` с `tabindex="0"`

#### Scenario: Действие act без перехода
- **WHEN** игрок нажимает кнопку `act`, которая не вызывает `goto`
- **THEN** после перерисовки фокус управляется по тому же приоритету

#### Scenario: Сцена без кнопок и без focusable-контента
- **WHEN** сцена не содержит ни act, ни goto кнопок и `#scene-content` без focusable-элементов
- **THEN** фокус перемещается на `#scene-content` как последний запасной вариант
