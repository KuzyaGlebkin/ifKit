## ADDED Requirements

### Requirement: initSeenContent загружает хранилище из localStorage
Функция `initSeenContent()` SHALL читать ключ `ifkit:seen` из `localStorage` и разбирать его как `Record<string, string[]>`. При отсутствии ключа или невалидном JSON SHALL инициализировать пустой объект. Ошибки парсинга не должны прерывать запуск игры.

#### Scenario: Первый запуск — хранилище пустое
- **WHEN** в `localStorage` нет ключа `ifkit:seen`
- **THEN** `initSeenContent()` завершается без ошибки, внутреннее состояние — пустой объект

#### Scenario: Повторный запуск — хранилище загружается
- **WHEN** `localStorage` содержит `ifkit:seen: {"room": ["abc123"]}`
- **THEN** после `initSeenContent()` хеш `"abc123"` считается виденным для сцены `"room"`

### Requirement: markAndHighlight помечает новые блоки и сохраняет в localStorage
Функция `markAndHighlight(element: HTMLElement, sceneKey: string, enabled: boolean)` SHALL:
1. Если `enabled === false` — не добавлять никаких классов и завершиться
2. Для каждого прямого дочернего элемента `element` вычислить хеш его `innerHTML`
3. Если хеш отсутствует в хранилище для `sceneKey` — добавить элементу класс `paragraph--unseen` и добавить хеш в хранилище
4. Если хеш присутствует — не добавлять класс
5. После обработки всех элементов сохранить обновлённое хранилище в `localStorage`

#### Scenario: Первый рендер сцены — все блоки подсвечены
- **WHEN** `markAndHighlight` вызван для сцены, которая не встречалась ранее
- **THEN** все дочерние элементы получают класс `paragraph--unseen`

#### Scenario: Повторный рендер того же контента — нет подсветки
- **WHEN** `markAndHighlight` вызван дважды с одинаковым HTML-содержимым
- **THEN** при втором вызове ни один элемент не получает класс `paragraph--unseen`

#### Scenario: Один блок изменился — подсвечен только он
- **WHEN** первый рендер: `["<p>A</p>", "<p>B</p>"]`, второй рендер: `["<p>A</p>", "<p>C</p>"]`
- **THEN** при втором вызове только второй элемент получает класс `paragraph--unseen`

#### Scenario: enabled === false — классы не добавляются
- **WHEN** `markAndHighlight(el, sceneKey, false)` вызван
- **THEN** ни один элемент не получает класс `paragraph--unseen`

#### Scenario: Хранилище сохраняется в localStorage после маркировки
- **WHEN** `markAndHighlight` обработал новые блоки
- **THEN** `localStorage.getItem('ifkit:seen')` содержит их хеши

### Requirement: resetSeenContent очищает хранилище
Функция `resetSeenContent()` SHALL удалять ключ `ifkit:seen` из `localStorage` и сбрасывать внутреннее состояние модуля. После вызова следующий `markAndHighlight` обрабатывает все блоки как новые.

#### Scenario: После сброса блоки снова подсвечиваются
- **WHEN** блоки были виданы, затем вызван `resetSeenContent()`, затем снова `markAndHighlight`
- **THEN** все блоки получают класс `paragraph--unseen`
