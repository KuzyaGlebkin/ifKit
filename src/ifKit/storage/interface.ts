export interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
}

export const KEYS = {
  settings: 'ifkit:settings',
  saves:    'ifkit:saves',
  seen:     'ifkit:seen',
} as const

export const IFKIT_PREFIX = 'ifkit:'
