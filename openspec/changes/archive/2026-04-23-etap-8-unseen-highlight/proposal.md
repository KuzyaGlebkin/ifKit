## Why

В играх с множеством концовок и ветвлений игрок перепроходит одни и те же сцены несколько раз. Без визуальной подсказки сложно понять, что именно изменилось в сцене после действия или какой текст он ещё не видел в этом прохождении. Подсветка «непрочитанных» блоков решает эту проблему — аналогично флагу «skip read messages» в Ren'Py, но реализованному визуально как подсветка фона.

## What Changes

- Новый модуль `seen-content.ts` — глобальное персистентное хранилище виденных блоков контента (отдельно от слотов сохранений)
- После каждого рендера сцены движок хешируют `innerHTML` каждого дочернего элемента зоны описания, сравнивает с хранилищем и добавляет CSS-класс `paragraph--unseen` новым/изменённым блокам
- Хранилище — `localStorage` под ключом `ifkit:seen`, не сбрасывается при новой игре или загрузке сохранения
- Новое поле `showUnseenHighlight: boolean` в `Settings` (default `true`) — пользователь может отключить подсветку
- Переключатель в модальном окне настроек
- CSS-стиль подсветки с анимацией fade-out

## Capabilities

### New Capabilities

- `seen-content`: хранилище виденных блоков, функция `markAndHighlight()`, `resetSeenContent()`

### Modified Capabilities

- `user-settings`: новое поле `showUnseenHighlight: boolean` в `Settings` и `engineDefaults`
- `settings-modal`: переключатель «Подсвечивать новый текст» в настройках

## Impact

- `src/ifKit/seen-content.ts` — новый модуль
- `src/ifKit/settings.ts` — поле `showUnseenHighlight` в `Settings` и `engineDefaults`
- `src/ifKit/settings-modal.ts` — переключатель showUnseenHighlight
- `src/ifKit/scenes.ts` — вызов `markAndHighlight()` после `flushHtmlToDOM()`
- `src/ifKit/index.ts` — экспорт `resetSeenContent()`
- CSS — стиль `.paragraph--unseen`
