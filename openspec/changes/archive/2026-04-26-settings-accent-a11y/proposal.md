## Why

Блок «Тема» и «Шрифт» в модалке настроек скрыты от вспомогательных технологий: на контейнере `#ifk-settings-theme-font` стоит `aria-hidden="true"`. Визуально соседний ряд с пресетами акцентa в `#ifk-settings-accent-row` оформляется так же, как соседний «Тема+Шрифт»: на контейнере `aria-hidden="true"`, на сегментах `tabindex="-1"`, чтобы AT не читал ряд и Tab в модалке обходил эти кнопки (см. `modal-focus-lock`).

## What Changes

- На обёртку ряда `#ifk-settings-accent-row` — `aria-hidden="true"`.
- На сегмент-кнопки пресетов акцентa — `tabindex="-1"` (как на `.ifk-theme-btn` в `#ifk-settings-theme-font`),
- Без BREAKING в `Settings` / `user-settings`.

## Capabilities

### New Capabilities

- (нет)

### Modified Capabilities

- `settings-modal`: дельта — `aria-hidden` + `tabindex` на сегментах (как у блока `ifk-settings-theme-font` с «Тема»+«Шрифт»).

## Impact

- `src/ifKit/settings-modal.ts`
- `openspec/specs/settings-modal/spec.md` (при архивации)
