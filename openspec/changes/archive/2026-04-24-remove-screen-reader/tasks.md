## 1. Спеки

- [x] 1.1 Смержить change `remove-screen-reader` в `openspec/specs` (или выполнить шаги архива/apply по принятому в репозитории процессу) так, чтобы дельты применились: удаление `screen-reader`, обновление `ui-zones`, `ui-buttons`, `settings-modal`, `saves-modal`.
- [x] 1.2 Удалить `openspec/specs/screen-reader/spec.md` (или пустой каталог), если merge не сделал это автоматически; убедиться, что в индексе/списке нет ссылок на устаревшую спеку.

## 2. Сцена и макет

- [x] 2.1 Удалить `makeSceneContentFocusable`, `focusAfterRender` и `initLayout` (или сузить `initLayout`: не выставлять `tabindex` на контейнер сцены, если снято требование) из `src/ifKit/layout.ts`; удалить неиспользуемые экспорты.
- [x] 2.2 В `src/ifKit/scenes.ts` убрать вызовы удалённых функций после рендера.
- [x] 2.3 В `src/style.css` убрать правила для `#scene-content [tabindex="0"]:focus-visible` (и иные, завязанные только на a11y-сцене).

## 3. Кнопки act/goto и зоны

- [x] 3.1 В `src/ifKit/renderer.ts` убрать установку `aria-label` на кнопки act и goto.
- [x] 3.2 В `src/index.html` снять `role` / `aria-label` с `#controls`, кнопок панели (или оставить минимальную вёрстку по желанию), `#content` — так, чтобы не было обязательных ARIA-landmark по старой спеке.
- [x] 3.3 В `src/ifKit/engine.ts` снять `setAttribute` ARIA/role с динамически создаваемых зон сцены (`#scene-content`, `#scene-acts`, `#scene-gotos` и т.д.) согласно дельте `ui-zones`.

## 4. Модалки

- [x] 4.1 В `src/ifKit/settings-modal.ts` убрать `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-hidden` (если снято требованием), атрибуты `role`/`aria-*` на группах, ловушку фокуса (обработчики `Tab`); сохранить открытие/закрытие, Escape, backdrop.
- [x] 4.2 В `src/ifKit/saves-modal.ts` — то же: без focus trap и ARIA-диалога по спекe.
- [x] 4.3 Проверить, что сценарии «модалка открылась/закрылась» работают вручную (мышь, Escape).

## 5. Проверка

- [x] 5.1 `npm run build` (и при наличии `npm test`) без ошибок.
- [x] 5.2 Быстрый смоук: старт сцены, act, goto, настройки, сохранения.
