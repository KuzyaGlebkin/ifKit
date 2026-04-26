import { Store } from '@tauri-apps/plugin-store'
import { save as saveDialog, open as openDialog } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import type { StorageAdapter } from './interface'
import { IFKIT_PREFIX } from './interface'

export { KEYS } from './interface'
export type { StorageAdapter }

// ─── Adapter ──────────────────────────────────────────────────────────────────

let _store: Store | null = null
const _cache: Record<string, unknown> = {}

class TauriAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    return (key in _cache) ? (_cache[key] as T) : null
  }

  set<T>(key: string, value: T): void {
    _cache[key] = value
    _store?.set(key, value).catch((err: unknown) => {
      console.error('[ifKit] Store write error:', err)
    })
  }

  remove(key: string): void {
    delete _cache[key]
    _store?.delete(key).catch((err: unknown) => {
      console.error('[ifKit] Store delete error:', err)
    })
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const storage: StorageAdapter = new TauriAdapter()

export async function initStorage(): Promise<void> {
  _store = await Store.load('ifkit-store.json')
  const entries = await _store.entries<unknown>()
  for (const [key, value] of entries) {
    _cache[key] = value
  }
}

// ─── Export / Import ──────────────────────────────────────────────────────────

interface ExportPayload {
  version:  number
  exported: string
  data:     Record<string, unknown>
}

export async function exportToFile(): Promise<void> {
  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(_cache)) {
    if (key.startsWith(IFKIT_PREFIX)) {
      data[key] = value
    }
  }

  const payload: ExportPayload = {
    version:  1,
    exported: new Date().toISOString(),
    data,
  }

  const filePath = await saveDialog({
    defaultPath: `ifkit-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })

  if (filePath) {
    await writeTextFile(filePath, JSON.stringify(payload, null, 2))
  }
}

export async function importFromFile(): Promise<void> {
  const selected = await openDialog({
    multiple: false,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })

  const filePath = Array.isArray(selected) ? selected[0] : selected
  if (!filePath) return

  const text    = await readTextFile(filePath)
  const payload = JSON.parse(text) as ExportPayload

  if (payload.version !== 1) {
    console.warn(`[ifKit] Импорт: неизвестная версия (${payload.version}). Импорт отменён.`)
    throw new Error(`Unknown backup version: ${payload.version}`)
  }

  for (const [key, value] of Object.entries(payload.data)) {
    storage.set(key, value)
  }
}
