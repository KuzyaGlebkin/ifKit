## Why

Движок умеет рендерить сцены и переключаться между ними, но не имеет механизма хранения состояния игры. Без него невозможны ни переменные персонажа, ни уведомления об их изменении, ни сохранения, ни откат назад.

## What Changes

- Добавляется утилита `jsonClone<T>` — единый механизм клонирования для истории и сохранений
- Вводится хранилище локальных переменных сцены (`sceneLocals`) и API `ctx.local(defaults)`
- `GameConfig` расширяется полем `watch` для декларативного объявления отслеживаемых характеристик
- Реализуется snackbar: дифф watch-ключей вокруг каждого `act`/`goto`, DOM-компонент уведомлений

## Capabilities

### New Capabilities

- `game-state`: Глобальное состояние игры — тип `GameState`, инициализация, клонирование через `jsonClone`
- `scene-locals`: Локальные переменные сцены — `ctx.local(defaults)`, хранилище по ключу сцены, сброс при переходе
- `snackbar`: Уведомления об изменении характеристик — `WatchConfig`, дифф до/после колбэка, DOM-компонент

### Modified Capabilities

## Impact

- `src/ifKit/state.ts` — сейчас пустой, станет основным модулем для `jsonClone` и `sceneLocals`
- `src/ifKit/snackbar.ts` — сейчас пустой, получит полную реализацию
- `src/ifKit/scenes.ts` — `SceneContext` расширяется методом `local`, `createContext` обновляется, `runGameLoop` сбрасывает локали при смене сцены; `act`/`goto` оборачиваются диффом watch-ключей
- `src/ifKit/engine.ts` — `GameConfig` расширяется полем `watch?: WatchConfig<S>`
- `src/ifKit/index.ts` — экспорт новых публичных типов
