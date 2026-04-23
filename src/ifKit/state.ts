// Game state utilities — Этап 2

// ---------------------------------------------------------------------------
// Cloning
// ---------------------------------------------------------------------------

/**
 * Deep-clones a value via JSON round-trip.
 * Constraint: `value` must be a JSON-compatible data tree
 * (primitives, plain objects, arrays). `Date`, `Map`, `Set`, functions
 * and class instances are not supported and will be silently corrupted.
 */
export function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

// ---------------------------------------------------------------------------
// Scene-local storage
// ---------------------------------------------------------------------------

const sceneLocals: Record<string, Record<string, unknown>> = {}

/**
 * Returns the mutable local-state object for `sceneKey`.
 * On first access the object is created from `jsonClone(defaults)`.
 * On subsequent accesses within the same scene the same object is returned.
 */
export function getSceneLocal<T extends object>(sceneKey: string, defaults: T): T {
  if (!(sceneKey in sceneLocals)) {
    sceneLocals[sceneKey] = jsonClone(defaults) as Record<string, unknown>
  }
  return sceneLocals[sceneKey] as T
}

/**
 * @internal Used by the history system (Этап 5).
 * Returns a deep clone of the local state for `sceneKey`, or `null`.
 */
export function getSceneLocalSnapshot(sceneKey: string): Record<string, unknown> | null {
  if (!(sceneKey in sceneLocals)) return null
  return jsonClone(sceneLocals[sceneKey])
}

/**
 * @internal Used by the history system (Этап 5).
 * Replaces the local state for `sceneKey` with `snapshot`.
 */
export function restoreSceneLocal(sceneKey: string, snapshot: Record<string, unknown>): void {
  sceneLocals[sceneKey] = snapshot
}

/** Removes the local state entry for `sceneKey`. */
export function clearSceneLocal(sceneKey: string): void {
  delete sceneLocals[sceneKey]
}
