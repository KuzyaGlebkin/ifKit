## ADDED Requirements

### Requirement: applySettings согласует язык документа

Функция `applySettings(settings)` SHALL при **инициализированной** подсистеме i18n вызывать (или вести к тому же эффекту) обновление `document.documentElement.lang` **согласно** `settings.language` и правилам авто-разрешения, **совместно** с модулем i18n, чтобы `lang` **не** расходился с фактическим resolved языком после применения темы, шрифта и прочих полей.

#### Scenario: Импорт настроек

- **WHEN** пользователь импортирует настройки с `language: 'en'` и `applySettings` выполняется
- **THEN** `document.documentElement.lang` отражает согласованный с i18n язык `'en'`

#### Scenario: Повторный applySettings без смены языка

- **WHEN** `applySettings` вызывается с тем же `settings.language`, что уже разрешён
- **THEN** `lang` **остаётся** валидным (идемпотентно, без пустой строки, если i18n resolved не пуст)
