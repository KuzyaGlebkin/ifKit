## MODIFIED Requirements

### Requirement: Модальное окно сохранений
Движок SHALL создавать модальное окно сохранений, открывающееся по кнопке `#btn-saves`. Окно SHALL содержать список слотов: авто-слот вверху, затем именные слоты в порядке индекса. Реализация SHALL следовать паттерну `settings-modal.ts`: backdrop, закрытие по Escape и клику на backdrop (без требований к focus trap и ARIA-атрибутам диалога).

#### Scenario: Открытие модалки
- **WHEN** игрок нажимает `#btn-saves`
- **THEN** модальное окно открывается и отображает все слоты в соответствии с хранилищем

#### Scenario: Закрытие по Escape
- **WHEN** модальное окно открыто и игрок нажимает Escape
- **THEN** окно закрывается

#### Scenario: Закрытие по клику на backdrop
- **WHEN** игрок кликает за пределами диалога
- **THEN** окно закрывается

## REMOVED Requirements

### Requirement: Доступность модального окна
**Reason**: Снятие a11y-контракта; см. `remove-screen-reader` proposal.
**Migration**: Снять `role="dialog"`, `aria-modal`, `aria-labelledby` и focus trap; Tab-навигация ведёт себя по умолчанию без норматива ifKit.
