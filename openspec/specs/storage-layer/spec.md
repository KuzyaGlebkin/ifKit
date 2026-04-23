## ADDED Requirements

### Requirement: StorageAdapter — единый интерфейс хранилища
Движок SHALL определять интерфейс `StorageAdapter` с методами `get<T>(key): T | null`, `set<T>(key, value): void`, `remove(key): void`. Все модули движка, записывающие данные между сессиями, SHALL использовать этот интерфейс, а не обращаться к `localStorage` напрямую.

#### Scenario: Запись и чтение через адаптер
- **WHEN** код вызывает `storage.set('ifkit:settings', { theme: 'dark' })`
- **THEN** последующий вызов `storage.get('ifkit:settings')` возвращает `{ theme: 'dark' }`

#### Scenario: Чтение несуществующего ключа
- **WHEN** код вызывает `storage.get('ifkit:nonexistent')`
- **THEN** метод возвращает `null`

### Requirement: Авто-детект среды выполнения
Модуль `storage.ts` SHALL автоматически выбирать адаптер при первой инициализации: если `'__TAURI__' in window` — использовать `TauriAdapter`, иначе — `LocalStorageAdapter`.

#### Scenario: HTML-сборка использует LocalStorageAdapter
- **WHEN** игра открыта как HTML-файл в браузере (без Tauri)
- **THEN** `storage.set(key, value)` записывает данные в `localStorage`

#### Scenario: Tauri-сборка использует TauriAdapter
- **WHEN** игра запущена в Tauri (`window.__TAURI__` присутствует)
- **THEN** `storage.set(key, value)` делегирует вызов в `TauriAdapter`

### Requirement: TauriAdapter как заглушка
`TauriAdapter` SHALL реализовывать `StorageAdapter`, делегируя все вызовы `LocalStorageAdapter`. Реализация SHALL содержать комментарий `// TODO Этап 8: заменить на @tauri-apps/plugin-store`.

#### Scenario: TauriAdapter функционально эквивалентен LocalStorageAdapter
- **WHEN** TauriAdapter получает вызов `set(key, value)`
- **THEN** данные сохраняются и доступны через последующий `get(key)`

### Requirement: Namespace `ifkit:` для всех ключей движка
Все ключи, используемые движком, SHALL начинаться с префикса `ifkit:`. Модуль SHALL экспортировать константы для каждого ключа.

#### Scenario: Ключ настроек имеет правильный префикс
- **WHEN** движок сохраняет настройки
- **THEN** данные записываются под ключом `ifkit:settings`

### Requirement: Экспорт всех данных движка в JSON-файл
Функция `exportToFile()` SHALL собирать все ключи с префиксом `ifkit:` из хранилища, упаковывать их в JSON-объект с полями `version`, `exported` (ISO-строка), `data`, и инициировать скачивание файла через браузерный API.

#### Scenario: Экспорт создаёт файл с корректной структурой
- **WHEN** пользователь нажимает «Экспорт»
- **THEN** браузер скачивает JSON-файл вида `{ "version": 1, "exported": "...", "data": { "ifkit:settings": {...} } }`

#### Scenario: Экспорт при пустом хранилище
- **WHEN** в хранилище нет ключей `ifkit:*`
- **THEN** браузер скачивает файл с `"data": {}`

### Requirement: Импорт данных из JSON-файла
Функция `importFromFile()` SHALL открывать диалог выбора файла, читать выбранный JSON, валидировать поле `version`, и записывать все ключи из `data` через адаптер. При несовпадении версии SHALL выводить предупреждение в консоль и предлагать сброс.

#### Scenario: Успешный импорт восстанавливает данные
- **WHEN** пользователь выбирает корректный файл экспорта
- **THEN** все ключи из `data` записываются в хранилище и настройки применяются к DOM

#### Scenario: Импорт файла с неизвестной версией
- **WHEN** пользователь выбирает файл с `"version": 999`
- **THEN** в консоль выводится предупреждение, импорт не выполняется
