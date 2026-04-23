## 1. Storage Layer (`storage.ts`)

- [x] 1.1 Определить интерфейс `StorageAdapter` и константы ключей (`KEYS.settings`, `KEYS.saves`)
- [x] 1.2 Реализовать `LocalStorageAdapter`
- [x] 1.3 Реализовать `TauriAdapter` как заглушку (делегирует в LocalStorageAdapter, TODO-комментарий)
- [x] 1.4 Реализовать авто-детект среды и экспортировать синглтон `storage`
- [x] 1.5 Реализовать `exportToFile()`: сбор `ifkit:*`, упаковка в `{ version, exported, data }`, скачивание
- [x] 1.6 Реализовать `importFromFile()`: диалог выбора файла, валидация `version`, запись ключей

## 2. Модуль настроек (`settings.ts`)

- [x] 2.1 Определить тип `Settings` и константу `engineDefaults`
- [x] 2.2 Реализовать `mergeDefaults(partial)` → `authorDefaults`
- [x] 2.3 Реализовать `loadSettings(authorDefaults)` с fallback на `authorDefaults`
- [x] 2.4 Реализовать `saveSettings(settings)` через Storage Layer
- [x] 2.5 Реализовать `applySettings(settings)`: `data-theme` на `<html>`, `--ifk-font-size-base` на `:root`
- [x] 2.6 Реализовать `resetSettings(authorDefaults)`: сохранить + применить `authorDefaults`

## 3. Расширение GameConfig (`engine.ts`)

- [x] 3.1 Добавить поле `settings?: Partial<Settings>` в интерфейс `GameConfig`
- [x] 3.2 В `defineGame()` вычислять `authorDefaults` и вызывать `loadSettings` + `applySettings` при старте

## 4. UI модального окна

- [x] 4.1 Создать HTML-структуру модалки в `engine.ts` (backdrop + dialog с заголовком и ✕)
- [x] 4.2 Добавить группу кнопок темы (Светлая / Тёмная / Системная) с выделением активной
- [x] 4.3 Добавить `<input type="range">` размера шрифта (0.8–1.4, шаг 0.1) с отображением значения
- [x] 4.4 Добавить `<input type="range">` громкости музыки (0–1, шаг 0.1) с отображением значения
- [x] 4.5 Добавить `<input type="range">` громкости звуков (0–1, шаг 0.1) с отображением значения
- [x] 4.6 Добавить кнопки «Сбросить настройки», «Экспорт», «Импорт»
- [x] 4.7 Привязать обработчики: каждый элемент управления вызывает `saveSettings` + `applySettings` немедленно
- [x] 4.8 Реализовать открытие/закрытие: по `#btn-settings`, ✕, `Escape`, клику на backdrop
- [x] 4.9 Реализовать фокус-ловушку (Tab-цикл внутри модалки)
- [x] 4.10 Добавить ARIA-атрибуты: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

## 5. Стили модалки (`style.css`)

- [x] 5.1 Стили backdrop (полупрозрачное перекрытие, `position: fixed`)
- [x] 5.2 Стили dialog-окна (отступы, тень, скругления, max-width)
- [x] 5.3 Стили группы кнопок темы (активное состояние)
- [x] 5.4 Стили ползунков и лейблов
- [x] 5.5 Стили строки кнопок (Сбросить / Экспорт / Импорт)
- [x] 5.6 Адаптивность: корректное отображение на мобильных

## 6. Публичный API (`index.ts`)

- [x] 6.1 Экспортировать тип `Settings` и функцию `loadSettings` для авторов плагинов и расширений
