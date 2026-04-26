## ADDED Requirements

### Requirement: Функция defineGame как единственная точка входа
Движок SHALL экспортировать функцию `defineGame()`, которая является единственным обязательным вызовом для запуска игры. Автор вызывает её явно в `game.ts`.

#### Scenario: Минимальный вызов запускает игру
- **WHEN** автор вызывает `defineGame({ state, scenes })` и открывает `index.html`
- **THEN** игра запускается, отображая первую сцену из `scenes`

#### Scenario: Отсутствие вызова defineGame
- **WHEN** `game.ts` не вызывает `defineGame()`
- **THEN** страница загружается пустой, в консоли нет необработанных ошибок

### Requirement: Поле state — начальное состояние игры
`defineGame()` SHALL принимать поле `state` с объектом начального состояния. Тип этого объекта автоматически выводится как `GameState`.

#### Scenario: Состояние доступно в сценах
- **WHEN** автор передаёт `state: { hp: 10, gold: 0 }` в `defineGame()`
- **THEN** каждая сцена получает объект того же типа в первом аргументе

#### Scenario: Изменение состояния сохраняется между сценами
- **WHEN** сцена изменяет `state.hp`
- **THEN** следующая сцена видит обновлённое значение `state.hp`

### Requirement: Поле scenes — реестр сцен
`defineGame()` SHALL принимать поле `scenes` — объект, где ключи — имена сцен, значения — функции `(state: GameState) => void`.

#### Scenario: Тип ключей сцен проверяется статически
- **WHEN** автор вызывает `goto('nonexistent')`
- **THEN** TypeScript выдаёт ошибку компиляции (ключ не существует в `typeof scenes`)

#### Scenario: Все сцены получают одинаковый тип состояния
- **WHEN** автор определяет несколько сцен
- **THEN** каждая функция-сцена типизирована одним и тем же `GameState`

### Requirement: Поле static — зонированный рендеринг постоянных элементов (опционально)
`defineGame()` SHALL принимать необязательное поле `static` — функцию `(state: GameState, ctx: StaticContext<GameState, K>) => void`. Функция вызывается при каждом переходе и рендерит постоянные элементы через zone-функции контекста: `ctx.before(cb)` — перед текстом сцены, `ctx.after(cb)` — после, `ctx.slot(id, cb)` — в именованное место, объявленное сценой через `Slot(id)`. Контекст также включает `act`, `goto`, `local` — они работают так же, как в SceneContext. Отдельный DOM-элемент `#static` не создаётся; весь вывод static вставляется в `#scene-content`.

#### Scenario: Статичный контент отображается при каждом переходе
- **WHEN** автор передаёт `static: (state, { before }) => { before(() => P(\`HP: \${state.hp}\`)) }`
- **THEN** текст «HP: 10» (или актуальное значение) появляется перед содержимым каждой сцены

#### Scenario: Отсутствие поля static не вызывает ошибок
- **WHEN** автор не передаёт поле `static` в `defineGame()`
- **THEN** игра запускается и работает без статичного контента

### Requirement: Поле settings — авторские умолчания настроек (опционально)
`defineGame()` SHALL принимать необязательное поле `settings: Partial<Settings>`. Движок SHALL сливать переданные значения с `engineDefaults`, результат использовать как `authorDefaults` — начальное состояние настроек при первом запуске и целевое состояние при сбросе. Если поле `settings` не передано, `authorDefaults` равен `engineDefaults`.

#### Scenario: Авторское поле settings перекрывает движковые умолчания
- **WHEN** автор передаёт `settings: { theme: 'dark', fontSize: 1.1 }`
- **THEN** при первом запуске применяется `theme: 'dark'` и `fontSize: 1.1`; `musicVolume` и `soundVolume` берутся из `engineDefaults`

#### Scenario: Отсутствие поля settings не вызывает ошибок
- **WHEN** автор вызывает `defineGame({ state, scenes })` без поля `settings`
- **THEN** игра запускается, применяются `engineDefaults`

#### Scenario: Кнопка «Сбросить настройки» возвращает к авторским значениям
- **WHEN** пользователь изменил тему на «Светлая» и нажал «Сбросить»
- **THEN** восстанавливается `theme: 'dark'` (авторское значение), не `theme: 'system'` (движковое)

### Requirement: Разделение файлов автора на game.ts, scenes.ts, state.ts
Шаблон SHALL содержать три отдельных файла для предотвращения циклических импортов: `game.ts` (вызов `defineGame`), `scenes.ts` (сцены), `state.ts` (тип и начальное состояние).

#### Scenario: Нет циклических импортов в шаблоне
- **WHEN** разработчик запускает сборку шаблона
- **THEN** Vite не выдаёт предупреждений о циклических зависимостях

#### Scenario: GameState импортируется из state.ts в scenes.ts
- **WHEN** автор открывает `scenes.ts`
- **THEN** тип `GameState` импортируется из `./state`, а не переопределяется заново

### Requirement: Поле saves — конфигурация системы сохранений (опционально)
`defineGame()` SHALL принимать необязательное поле `saves: { slots?: number; historySize?: number }`. Движок SHALL использовать `slots` как количество именных слотов (default 5) и `historySize` как максимальную глубину undo-буфера (default 20). Если поле `saves` не передано, используются оба значения по умолчанию.

#### Scenario: Авторские значения slots и historySize применяются
- **WHEN** автор передаёт `saves: { slots: 3, historySize: 30 }` в `defineGame()`
- **THEN** модальное окно сохранений показывает 3 именных слота; undo-буфер хранит до 30 снимков

#### Scenario: Отсутствие поля saves не вызывает ошибок
- **WHEN** автор вызывает `defineGame({ state, scenes })` без поля `saves`
- **THEN** игра запускается с 5 именными слотами и глубиной истории 20

### Requirement: Поле locales — словарь переводов (опционально)
`defineGame()` SHALL принимать необязательное поле `locales?: Locales`. Если поле передано, движок SHALL передавать его в `initI18n()` при инициализации вместе с текущим значением `settings.language`. Если поле не передано — `t` работает в режиме passthrough (возвращает оригинал). Если одновременно передано `sourceLanguage`, движок SHALL строить `fullLocales = { [sourceLanguage]: {}, ...locales }` и использовать `fullLocales` вместо `locales` во всех downstream-вызовах.

#### Scenario: locales переданы — i18n инициализируется
- **WHEN** автор передаёт `locales: { en: { "Привет": "Hello" } }` в `defineGame()`
- **THEN** после запуска `` t`Привет` `` при активном `'en'` возвращает `"Hello"`

#### Scenario: locales не переданы — t работает как identity
- **WHEN** автор вызывает `defineGame({ state, scenes })` без `locales`
- **THEN** `` t`Любая строка` `` возвращает `"Любая строка"`

### Requirement: Поле sourceLanguage — код языка оригинальных строк (опционально)
`defineGame()` SHALL принимать необязательное поле `sourceLanguage?: string` — BCP 47 short code языка, на котором написаны оригинальные строки в сценах (например `'ru'`, `'en'`). Если передано, движок SHALL включить этот код в список доступных языков первым и обеспечить, что при активном `sourceLanguage` функция `t` возвращает оригинальные строки (fallback на ключ). Без `sourceLanguage` поведение движка идентично текущему.

#### Scenario: sourceLanguage + перевод — переключатель языков виден
- **WHEN** автор передаёт `sourceLanguage: 'ru'` и `locales: { en: {...} }`
- **THEN** в настройках отображается переключатель с кнопками `ru` и `en`

#### Scenario: При активном sourceLanguage t возвращает оригинал
- **WHEN** `sourceLanguage: 'ru'`, активный язык `'ru'`, вызов `` t`Лес` ``
- **THEN** результат `"Лес"` (оригинальная строка, не перевод)

#### Scenario: Без sourceLanguage — поведение прежнее
- **WHEN** автор передаёт `locales: { en: {...} }` без `sourceLanguage`
- **THEN** доступен только язык `'en'`, переключатель не отображается

#### Scenario: Автоопределение по браузеру учитывает sourceLanguage
- **WHEN** `sourceLanguage: 'ru'`, `locales: { en: {...} }`, `navigator.language === 'ru-RU'`, `settings.language === ''`
- **THEN** игра стартует на `'ru'` (оригинальные строки)

#### Scenario: sourceLanguage конфликтует с ключом в locales — locales побеждает
- **WHEN** автор передаёт `sourceLanguage: 'en'` и `locales: { en: { "Лес": "Forest" } }`
- **THEN** при активном `'en'` `` t`Лес` `` возвращает `"Forest"` (перевод из locales, не пустой fallback)
