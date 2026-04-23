## 1. Утилита клонирования

- [x] 1.1 Реализовать `jsonClone<T>(value: T): T` в `state.ts`
- [x] 1.2 Добавить JSDoc на `GameConfig.state` с предупреждением о JSON-ограничении

## 2. Локальные переменные сцены

- [x] 2.1 Добавить хранилище `sceneLocals: Record<string, Record<string, unknown>>` в `state.ts`
- [x] 2.2 Реализовать `getSceneLocal<T extends object>(sceneKey: string, defaults: T): T` в `state.ts`
- [x] 2.3 Реализовать `getSceneLocalSnapshot(sceneKey: string): unknown` в `state.ts` (`@internal`)
- [x] 2.4 Реализовать `restoreSceneLocal(sceneKey: string, snapshot: unknown): void` в `state.ts` (`@internal`)
- [x] 2.5 Добавить `local<T extends object>(defaults: T): T` в тип `SceneContext` в `scenes.ts`
- [x] 2.6 Подключить `local` в `createContext` через `getSceneLocal(currentSceneKey, defaults)`
- [x] 2.7 Сбрасывать локали старой сцены в `runGameLoop` при смене `currentSceneKey`

## 3. Snackbar — конфигурация

- [x] 3.1 Добавить тип `WatchConfig<S>` в `engine.ts`
- [x] 3.2 Добавить поле `watch?: WatchConfig<S>` в `GameConfig`
- [x] 3.3 Передавать `watch` из `defineGame` в `registerScenes` (или отдельную функцию инициализации snackbar)

## 4. Snackbar — дифф и уведомления

- [x] 4.1 Реализовать функцию `diffAndNotify<S>(state: S, watch: WatchConfig<S>, before: Partial<S>): string[]` в `snackbar.ts`
- [x] 4.2 Обернуть колбэк `act` в `createContext`: снять `before`, выполнить колбэк, вызвать `diffAndNotify`, поставить уведомления в очередь
- [x] 4.3 Обернуть колбэк `goto` аналогично

## 5. Snackbar — DOM-компонент

- [x] 5.1 Создать DOM-элемент `#snackbar-container` в `snackbar.ts`, добавлять в `document.body` при инициализации
- [x] 5.2 Реализовать `showSnackbar(messages: string[]): void` — добавляет элементы в контейнер с авто-скрытием по таймеру
- [x] 5.3 Вызывать `showSnackbar` после ре-рендера в `act` и `goto`

## 6. Экспорты

- [x] 6.1 Экспортировать `WatchConfig` из `src/ifKit/index.ts`
