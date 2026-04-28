## MODIFIED Requirements

### Requirement: Структура SaveSlot

Движок SHALL определять тип `SaveSlot` с полями: `id` (string), `savedAt` (ISO timestamp), `label` (текстовый thumbnail сцены), `actPreview` (string, первая подпись первого элемента act в `#scene-acts`), `gotoPreview` (string, первая подпись первого элемента goto в `#scene-gotos`), `sceneKey` (string), `state` (unknown), `sceneLocals` (Record | null). Записи в `localStorage` без ключей `actPreview` / `gotoPreview` SHALL при загрузке обрабатываться как пустые строки.

#### Scenario: SaveSlot содержит все необходимые данные

- **WHEN** игрок сохраняет игру в именной слот
- **THEN** слот содержит текущее состояние, ключ сцены, `sceneLocals`, дату, `label` и при наличии соответствующих узлов в DOM — непустые `actPreview` и/или `gotoPreview`

### Requirement: Автосохранение при переходе между сценами

При каждом `goto` движок SHALL записывать снимок в слот `"auto"` **до** вызова `runGameLoop`. Слот `"auto"` содержит `sceneKey` новой сцены, состояние после выполнения колбэка `cb`, `sceneLocals: null`, `label: ''`, `actPreview: ''`, `gotoPreview: ''`.

#### Scenario: Автосохранение обновляется при каждом goto

- **WHEN** игрок переходит в новую сцену
- **THEN** слот `"auto"` в хранилище обновляется с новым `sceneKey` и текущим состоянием; поля `actPreview` и `gotoPreview` остаются пустыми строками

#### Scenario: Загрузка автосохранения помещает игрока в начало сцены

- **WHEN** игрок загружает автосохранение
- **THEN** игра запускается с сохранённым состоянием в сохранённой сцене, sceneLocals инициализируются заново

### Requirement: Ручное сохранение в именной слот

Движок SHALL поддерживать запись текущего состояния в именной слот. `label` SHALL содержать первые 80 символов `document.getElementById('scene-content')?.textContent` (после `trim`). `actPreview` SHALL содержать первые 80 символов текста первой кнопки act (первый релевантный потомок `#scene-acts`, например `.btn-act`), или пустую строку, если такой нет. `gotoPreview` SHALL содержать первые 80 символов текста первого goto (первый релевантный потомок `#scene-gotos`, например `.btn-goto`), или пустую строку. `savedAt` — ISO timestamp момента сохранения.

#### Scenario: Сохранение в пустой слот

- **WHEN** игрок сохраняет в пустой слот
- **THEN** слот заполняется текущим состоянием, датой, `label` и превью act/goto согласно текущему DOM

#### Scenario: Перезапись занятого слота

- **WHEN** игрок подтверждает перезапись занятого слота
- **THEN** старый слот заменяется новым снимком текущего состояния вместе с обновлёнными `label`, `actPreview`, `gotoPreview` и датой
