## 1. Тип Settings — поле showUnseenHighlight

- [x] 1.1 Добавить поле `showUnseenHighlight: boolean` в тип `Settings` в `settings.ts`
- [x] 1.2 Добавить `showUnseenHighlight: true` в `engineDefaults`

## 2. Модуль seen-content

- [x] 2.1 Создать `src/ifKit/seen-content.ts`
- [x] 2.2 Реализовать `initSeenContent()` — загрузка `ifkit:seen` из localStorage с защитой от невалидного JSON
- [x] 2.3 Реализовать хеш-функцию для строк (`innerHTML`)
- [x] 2.4 Реализовать `markAndHighlight(element, sceneKey, enabled)` — хеширование дочерних элементов, сравнение с хранилищем, добавление класса `paragraph--unseen`, сохранение в localStorage
- [x] 2.5 Реализовать `resetSeenContent()` — очистка хранилища и localStorage

## 3. Интеграция в движок

- [x] 3.1 Вызывать `initSeenContent()` в `defineGame()` при инициализации
- [x] 3.2 Вызывать `markAndHighlight(_sceneEl, currentSceneKey, settings.showUnseenHighlight)` в `runGameLoop` после `flushHtmlToDOM`
- [x] 3.3 Экспортировать `resetSeenContent` из `index.ts`

## 4. CSS

- [x] 4.1 Добавить стиль `.paragraph--unseen` с CSS-переменной `--ifk-unseen-color` (значение по умолчанию: `rgba(255, 220, 80, 0.18)`)

## 5. Настройки — UI

- [x] 5.1 Добавить переключатель «Подсвечивать новый текст» в `settings-modal.ts`
- [x] 5.2 При изменении переключателя сохранять настройку в localStorage
- [x] 5.3 Добавить кнопку «Сбросить историю прочтения» в `settings-modal.ts`, по нажатию вызывать `resetSeenContent()` и `rerender()`
- [x] 5.4 При нажатии «Сбросить настройки» обновлять состояние переключателя до `authorDefaults.showUnseenHighlight`
