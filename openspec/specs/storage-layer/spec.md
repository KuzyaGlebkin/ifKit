## ADDED Requirements

### Requirement: StorageAdapter — единый интерфейс хранилища
Движок SHALL определять интерфейс `StorageAdapter` с методами `get<T>(key): T | null`, `set<T>(key, value): void`, `remove(key): void`. Все модули движка, записывающие данные между сессиями, SHALL использовать этот интерфейс, а не обращаться к `localStorage` напрямую.

#### Scenario: Запись и чтение через адаптер
- **WHEN** код вызывает `storage.set('ifkit:settings', { theme: 'dark' })`
- **THEN** последующий вызов `storage.get('ifkit:settings')` возвращает `{ theme: 'dark' }`

#### Scenario: Чтение несуществующего ключа
- **WHEN** код вызывает `storage.get('ifkit:nonexistent')`
- **THEN** метод возвращает `null`

### Requirement: Namespace `ifkit:` для всех ключей движка
Все ключи, используемые движком, SHALL начинаться с префикса `ifkit:`. Модуль SHALL экспортировать константы для каждого ключа.

#### Scenario: Ключ настроек имеет правильный префикс
- **WHEN** движок сохраняет настройки
- **THEN** данные записываются под ключом `ifkit:settings`

### Requirement: Модульная структура storage
Модуль хранилища SHALL быть разбит на три файла: `src/ifKit/storage/interface.ts` (интерфейс `StorageAdapter` и константы `KEYS`), `src/ifKit/storage/local.ts` (реализация для браузера), `src/ifKit/storage/tauri.ts` (реализация для Tauri). Все модули движка SHALL импортировать хранилище из алиаса `@ifkit-storage`, а не из конкретного пути.

#### Scenario: Импорт через alias разрешается корректно
- **WHEN** в любом модуле движка написан `import { storage } from '@ifkit-storage'`
- **THEN** в web-сборке используется LocalStorageAdapter, в Tauri-сборке — TauriAdapter

### Requirement: initStorage для синхронной инициализации
Оба адаптерных модуля (`local.ts` и `tauri.ts`) SHALL экспортировать функцию `initStorage(): Promise<void>`. В `local.ts` функция SHALL быть no-op (возвращать resolved Promise). В `tauri.ts` функция SHALL асинхронно загружать данные из файла в память перед первым использованием адаптера. `defineGame` SHALL вызывать `await initStorage()` до запуска игрового цикла.

#### Scenario: Web-инициализация мгновенна
- **WHEN** `defineGame` вызывает `initStorage()` в браузере
- **THEN** Promise разрешается немедленно без I/O операций

#### Scenario: Tauri-инициализация загружает данные из файла
- **WHEN** `defineGame` вызывает `initStorage()` в Tauri-сборке
- **THEN** данные из файла `appDataDir/<bundle-id>/ifkit-store.json` загружаются в память; последующие вызовы `storage.get()` возвращают сохранённые значения

#### Scenario: Игровой цикл стартует только после инициализации
- **WHEN** `initStorage()` выполняется в Tauri-сборке
- **THEN** первая сцена отображается только после завершения загрузки store

### Requirement: TauriAdapter с in-memory cache и файловым хранилищем
`TauriAdapter` SHALL при инициализации загружать все данные в память через `@tauri-apps/plugin-store`. Методы `get` и `set` SHALL работать синхронно с кэшем. Вызов `set` SHALL дополнительно инициировать асинхронную запись на диск (fire-and-forget) без блокировки вызывающего кода. Файл store SHALL располагаться в `appDataDir()`.

#### Scenario: Данные сохраняются между сессиями
- **WHEN** пользователь сохраняет игру в Tauri-приложении, затем перезапускает приложение
- **THEN** сохранение доступно в новой сессии

#### Scenario: set не блокирует UI
- **WHEN** `storage.set(key, value)` вызывается в Tauri-сборке
- **THEN** вызов возвращается синхронно; запись на диск происходит в фоне

### Requirement: Адаптер-специфичный экспорт и импорт файлов
Каждый адаптерный модуль SHALL экспортировать `exportToFile(): Promise<void>` и `importFromFile(): Promise<void>`. В `local.ts` SHALL использоваться текущая реализация (Blob + `<a download>`, `<input type="file">`). В `tauri.ts` SHALL использоваться `@tauri-apps/plugin-dialog` для нативного file picker и `@tauri-apps/plugin-fs` для чтения/записи.

#### Scenario: Экспорт в Tauri открывает нативный диалог сохранения
- **WHEN** пользователь нажимает «Экспорт» в Tauri-приложении
- **THEN** открывается нативный системный диалог «Сохранить файл»; после выбора пути файл записывается на диск

#### Scenario: Импорт в Tauri открывает нативный диалог открытия файла
- **WHEN** пользователь нажимает «Импорт» в Tauri-приложении
- **THEN** открывается нативный системный диалог «Открыть файл»; после выбора файл читается и данные восстанавливаются

#### Scenario: Экспорт в браузере создаёт JSON-файл
- **WHEN** пользователь нажимает «Экспорт» в web-сборке
- **THEN** браузер скачивает JSON-файл вида `{ "version": 1, "exported": "...", "data": { "ifkit:...": ... } }`

#### Scenario: Импорт в браузере восстанавливает данные
- **WHEN** пользователь выбирает корректный файл экспорта в web-сборке
- **THEN** все ключи из `data` записываются в хранилище и настройки применяются к DOM

#### Scenario: Импорт файла с неизвестной версией
- **WHEN** пользователь выбирает файл с `"version": 999`
- **THEN** в консоль выводится предупреждение, импорт не выполняется
