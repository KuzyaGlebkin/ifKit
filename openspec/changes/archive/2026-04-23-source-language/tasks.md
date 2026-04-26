## 1. engine.ts — добавить поле и логику fullLocales

- [x] 1.1 Добавить `sourceLanguage?: string` в интерфейс `GameConfig` в `engine.ts`
- [x] 1.2 В `defineGame()` построить `fullLocales`: если `sourceLanguage` передан — `{ [sourceLanguage]: {}, ...config.locales }`, иначе `config.locales ?? {}`
- [x] 1.3 Заменить `config.locales ?? {}` на `fullLocales` в вызове `initI18n()`
- [x] 1.4 Заменить `Object.keys(config.locales ?? {})` на `Object.keys(fullLocales)` при построении `languages`

## 2. game.ts — добавить sourceLanguage в пример игры

- [x] 2.1 Добавить `sourceLanguage: 'ru'` в вызов `defineGame()` в `src/game.ts`
