// Snackbar notifications for state changes — Этап 2

// ---------------------------------------------------------------------------
// WatchConfig type
// ---------------------------------------------------------------------------

/**
 * Declares which state keys to track and how to format their change messages.
 * Return `null` from a formatter to suppress the notification for that change.
 *
 * @example
 * ```ts
 * watch: {
 *   hp:   (prev, next) => `HP: ${prev} → ${next}`,
 *   gold: (prev, next) => next > prev ? `+${next - prev} золота` : null,
 * }
 * ```
 */
export type WatchConfig<S> = {
  [K in keyof S]?: (prev: S[K], next: S[K]) => string | null
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let _watch: WatchConfig<Record<string, unknown>> = {}
let _container: HTMLElement | null = null

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/** Called once from `defineGame` to register the watch config and create the DOM container. */
export function initSnackbar<S extends object>(watch: WatchConfig<S>): void {
  _watch = watch as WatchConfig<Record<string, unknown>>

  if (document.getElementById('snackbar-container')) return
  _container = document.createElement('div')
  _container.id = 'snackbar-container'
  document.body.appendChild(_container)
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

/** Snapshots the current values of all watched keys. */
export function snapshotWatched<S extends object>(state: S): Partial<S> {
  const snapshot = {} as Partial<S>
  for (const key in _watch) {
    if (Object.prototype.hasOwnProperty.call(_watch, key)) {
      snapshot[key as keyof S] = (state as Record<string, unknown>)[key] as S[keyof S]
    }
  }
  return snapshot
}

/**
 * Compares current state against `before` snapshot for watched keys.
 * Returns formatted notification strings for every changed key.
 * Skips keys whose formatter returns `null`.
 */
export function diffAndNotify<S extends object>(state: S, before: Partial<S>): string[] {
  const messages: string[] = []
  for (const key in _watch) {
    if (!Object.prototype.hasOwnProperty.call(_watch, key)) continue
    const k = key as keyof S
    const prev = before[k]
    const next = (state as Record<string, unknown>)[key] as S[keyof S]
    if (prev !== next) {
      const fmt = (_watch as WatchConfig<S>)[k]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = fmt?.(prev as any, next as any) ?? null
      if (msg !== null) messages.push(msg)
    }
  }
  return messages
}

// ---------------------------------------------------------------------------
// DOM display
// ---------------------------------------------------------------------------

const SNACKBAR_DURATION_MS = 3000

/**
 * Appends one snackbar item per message to the container.
 * Each item auto-removes after `SNACKBAR_DURATION_MS`.
 */
export function showSnackbar(messages: string[]): void {
  if (!_container || messages.length === 0) return
  for (const text of messages) {
    const el = document.createElement('div')
    el.className = 'snackbar-item'
    el.textContent = text
    _container.appendChild(el)
    setTimeout(() => el.remove(), SNACKBAR_DURATION_MS)
  }
}
