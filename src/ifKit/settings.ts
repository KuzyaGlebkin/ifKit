import { storage, KEYS } from './storage'

export interface Settings {
  theme:       'light' | 'dark' | 'system'
  fontSize:    number   // multiplier 0.8–1.4
  musicVolume: number   // 0–1 (stub until Stage 6)
  soundVolume: number   // 0–1 (stub until Stage 6)
}

export const engineDefaults: Settings = {
  theme:       'system',
  fontSize:    1.0,
  musicVolume: 0.8,
  soundVolume: 1.0,
}

export function mergeDefaults(partial?: Partial<Settings>): Settings {
  return { ...engineDefaults, ...partial }
}

export function loadSettings(authorDefaults: Settings): Settings {
  const stored = storage.get<Partial<Settings>>(KEYS.settings)
  if (!stored || typeof stored !== 'object') return { ...authorDefaults }
  return { ...authorDefaults, ...stored }
}

export function saveSettings(settings: Settings): void {
  storage.set(KEYS.settings, settings)
}

export function applySettings(settings: Settings): void {
  const html = document.documentElement
  if (settings.theme === 'system') {
    delete html.dataset.theme
  } else {
    html.dataset.theme = settings.theme
  }
  html.style.setProperty('--ifk-font-size-base', `${settings.fontSize}rem`)
}

export function resetSettings(authorDefaults: Settings): void {
  saveSettings(authorDefaults)
  applySettings(authorDefaults)
}
