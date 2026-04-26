## Context

ifKit — движок для интерактивной фантастики. Авторы пишут сцены на родном языке и опционально передают словарь переводов через `GameConfig.locales`. Переключатель языков в настройках рендерится только если `languages.length >= 2` (строка в `settings-modal.ts`).

Текущий баг: при передаче только одного перевода (`locales: { en: {...} }`) оригинальный язык автора (например `'ru'`) нигде не объявлен. В итоге `languages = ['en']` — переключатель скрыт, а автоопределение из `navigator.language` может выбрать `'en'` с первого запуска.

Все данные инициализации идут через `defineGame()` → `engine.ts`. Ни `i18n.ts`, ни `settings-modal.ts` менять не нужно.

## Goals / Non-Goals

**Goals:**
- Добавить `sourceLanguage` в `GameConfig` как необязательное поле
- В `engine.ts` автоматически строить `fullLocales = { [sourceLanguage]: {}, ...config.locales }`
- Передавать `fullLocales` в `initI18n` (корректное автоопределение по браузеру)
- Передавать `Object.keys(fullLocales)` в `initSettingsModal` (переключатель виден)
- Не ломать игры без `sourceLanguage` — полная обратная совместимость

**Non-Goals:**
- Изменения в `i18n.ts`, `settings-modal.ts`, `settings.ts`
- Автоматическое определение языка оригинала без явного указания
- Локализация UI настроек (метки «Язык», «Тема» и т.д.)

## Decisions

### D1: Единственное место изменения — `engine.ts`

Вместо изменения `initI18n` или `settings-modal` — строим `fullLocales` один раз в `defineGame()` перед передачей вниз. Все downstream-функции получают уже корректные данные.

```
const fullLocales = config.sourceLanguage
  ? { [config.sourceLanguage]: {}, ...config.locales }
  : config.locales ?? {}

const languages = Object.keys(fullLocales)
initI18n(fullLocales, currentSettings.language)
initSettingsModal(authorDefaults, currentSettings, languages)
```

**Альтернатива**: передать `sourceLanguage` в `initI18n` и обрабатывать там.  
**Отклонено**: множит ответственность `i18n.ts`; текущая сигнатура уже достаточна.

### D2: `sourceLanguage: {}` — пустой словарь, а не спецмаркер

Когда `_lang = sourceLanguage` и `_locales[sourceLanguage]` — пустой объект, функция `t` делает:
```
_locales['ru']?.['Лес'] ?? 'Лес'  →  undefined ?? 'Лес'  =  'Лес'
```
Fallback на оригинальный ключ уже реализован в `t`. Никаких специальных проверок не нужно.

### D3: Spread-порядок защищает от конфликта ключей

Если автор случайно указывает `sourceLanguage: 'en'` при наличии `locales: { en: {...} }`:
```
{ en: {}, ...{ en: { 'Лес': 'Forest' } } }
→ { en: { 'Лес': 'Forest' } }  // авторский перевод побеждает
```
Поведение детерминированное, не ломается.

### D4: Без `sourceLanguage` — поведение идентично текущему

```
const fullLocales = config.sourceLanguage
  ? { [config.sourceLanguage]: {}, ...config.locales }
  : config.locales ?? {}   // ← тот же путь что сейчас
```

## Risks / Trade-offs

**[Risk] Неправильный код языка**: автор пишет `sourceLanguage: 'rus'` вместо `'ru'`. Движок создаст кнопку `rus`, при этом автоопределение по `navigator.language` вернёт `'ru'` — не совпадёт, упадёт на первый ключ.  
→ Mitigation: документировать что ожидается BCP 47 short code (`'ru'`, `'en'`, `'zh'`).

**[Risk] Порядок кнопок**: `sourceLanguage` всегда первый ключ — это обычно желательно, но автор не может изменить порядок.  
→ Mitigation: принято как разумный дефолт; явное управление порядком — за рамками этого изменения.
