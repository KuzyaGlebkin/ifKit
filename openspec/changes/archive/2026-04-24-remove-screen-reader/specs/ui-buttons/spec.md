## REMOVED Requirements

### Requirement: Семантическое разделение act и goto через `aria-label`
**Reason**: Снятие договора о зачитке кнопок вспомогательными технологиями в рамках `remove-screen-reader`; визуальное разделение through классы `btn-act` / `btn-goto` сохраняется отдельным требованием.
**Migration**: Код рендера not SHALL устанавливать `aria-label` с префиксами "Act:" / "Go to:"; видимая подпись кнопки остаётся по `label`.
