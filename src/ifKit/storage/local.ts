import type { StorageAdapter } from './interface'
import { IFKIT_PREFIX } from './interface'

export { KEYS } from './interface'
export type { StorageAdapter }

// ─── Adapter ──────────────────────────────────────────────────────────────────

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const storage: StorageAdapter = new LocalStorageAdapter()

export async function initStorage(): Promise<void> {
  // no-op for browser: localStorage is always ready
}

// ─── Export / Import ──────────────────────────────────────────────────────────

interface ExportPayload {
  version:  number
  exported: string
  data:     Record<string, unknown>
}

export function exportToFile(): void {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(IFKIT_PREFIX)) {
      data[key] = storage.get(key)
    }
  }

  const payload: ExportPayload = {
    version:  1,
    exported: new Date().toISOString(),
    data,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ifkit-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromFile(): Promise<void> {
  return new Promise((resolve, reject) => {
    const input   = document.createElement('input')
    input.type    = 'file'
    input.accept  = '.json,application/json'

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { resolve(); return }

      const reader    = new FileReader()
      reader.onload   = (e) => {
        try {
          const payload = JSON.parse(e.target?.result as string) as ExportPayload
          if (payload.version !== 1) {
            console.warn(`[ifKit] Импорт: неизвестная версия (${payload.version}). Импорт отменён.`)
            reject(new Error(`Unknown backup version: ${payload.version}`))
            return
          }
          for (const [key, value] of Object.entries(payload.data)) {
            storage.set(key, value)
          }
          resolve()
        } catch (err) {
          console.error('[ifKit] Импорт: ошибка разбора файла.', err)
          reject(err)
        }
      }
      reader.readAsText(file)
    }

    input.click()
  })
}
