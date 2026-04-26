import { storage, KEYS } from '@ifkit-storage'

export type AccentPreset = 'default' | 'blue' | 'violet' | 'emerald'

const ACCENT_PRESETS: Record<Exclude<AccentPreset, 'default'>, { accent: string; fg: string }> = {
  blue:    { accent: '#2563eb', fg: '#ffffff' },
  violet:  { accent: '#7c3aed', fg: '#ffffff' },
  emerald: { accent: '#059669', fg: '#ffffff' },
}

export interface Settings {
  theme:                'light' | 'dark' | 'system'
  fontSize:             number   // multiplier 0.8–1.4
  musicVolume:          number   // 0–1
  soundVolume:          number   // 0–1
  language:             string   // lang code or '' for auto-detect
  showUnseenHighlight:  boolean  // highlight content the player hasn't seen yet
  accent:               AccentPreset
}

export const engineDefaults: Settings = {
  theme:               'system',
  fontSize:            1.0,
  musicVolume:         0.8,
  soundVolume:         1.0,
  language:            '',
  showUnseenHighlight: true,
  accent:                'default',
}

export function mergeDefaults(partial?: Partial<Settings>): Settings {
  return { ...engineDefaults, ...partial }
}

export function loadSettings(authorDefaults: Settings): Settings {
  const stored = storage.get<Partial<Settings>>(KEYS.settings)
  if (!stored || typeof stored !== 'object') return { ...authorDefaults }
  const merged: Settings = { ...authorDefaults, ...stored }
  if (!isAccentPreset(merged.accent)) merged.accent = authorDefaults.accent
  return merged
}

function isAccentPreset(x: string | undefined): x is AccentPreset {
  return x === 'default' || x === 'blue' || x === 'violet' || x === 'emerald'
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

  if (settings.accent === 'default') {
    html.style.removeProperty('--ifk-color-accent')
    html.style.removeProperty('--ifk-color-accent-fg')
  } else {
    const p = ACCENT_PRESETS[settings.accent]
    html.style.setProperty('--ifk-color-accent', p.accent)
    html.style.setProperty('--ifk-color-accent-fg', p.fg)
  }
}

export function resetSettings(authorDefaults: Settings): void {
  saveSettings(authorDefaults)
  applySettings(authorDefaults)
}
