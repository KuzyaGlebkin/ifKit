import { storage, KEYS } from '@ifkit-storage'
import { syncRootLangFromI18n } from './i18n'

export type AccentPreset = 'default' | 'blue' | 'orange' | 'emerald'

const ACCENT_PRESETS: Record<Exclude<AccentPreset, 'default'>, { accent: string; fg: string }> = {
  blue:    { accent: '#2563eb', fg: '#ffffff' },
  orange:  { accent: '#d97832', fg: '#ffffff' },
  emerald: { accent: '#059669', fg: '#ffffff' },
}

export interface Settings {
  theme:                'light' | 'dark' | 'system'
  fontSize:             number   // multiplier 0.8–1.4
  musicVolume:          number   // 0–1
  soundVolume:          number   // 0–1
  musicMuted:           boolean
  soundMuted:           boolean
  quietMusicForScreenReader: boolean
  language:             string   // lang code or '' for auto-detect
  showUnseenHighlight:  boolean  // highlight content the player hasn't seen yet
  accent:               AccentPreset
}

export const engineDefaults: Settings = {
  theme:               'system',
  fontSize:            1.0,
  musicVolume:         0.8,
  soundVolume:         1.0,
  musicMuted:          false,
  soundMuted:          false,
  quietMusicForScreenReader: false,
  language:            '',
  showUnseenHighlight: true,
  accent:                'default',
}

function isAccentToken(x: string): x is AccentPreset {
  return x === 'default' || x === 'blue' || x === 'orange' || x === 'emerald'
}

/** `violet` was renamed to `orange`; old saves and configs may still use `violet`. */
function normalizeAccent(value: unknown, fallback: AccentPreset): AccentPreset {
  if (value === 'violet') return 'orange'
  if (typeof value === 'string' && isAccentToken(value)) return value
  return fallback
}

export function mergeDefaults(partial?: Partial<Settings>): Settings {
  const m: Settings = { ...engineDefaults, ...partial }
  m.accent = normalizeAccent(m.accent, engineDefaults.accent)
  return m
}

export function loadSettings(authorDefaults: Settings): Settings {
  const stored = storage.get<Partial<Settings>>(KEYS.settings)
  if (!stored || typeof stored !== 'object') return { ...authorDefaults }
  const merged: Settings = { ...authorDefaults, ...stored }
  merged.accent = normalizeAccent(merged.accent, authorDefaults.accent)
  if (typeof merged.musicMuted !== 'boolean') merged.musicMuted = authorDefaults.musicMuted
  if (typeof merged.soundMuted !== 'boolean') merged.soundMuted = authorDefaults.soundMuted
  if (typeof merged.quietMusicForScreenReader !== 'boolean') {
    merged.quietMusicForScreenReader = authorDefaults.quietMusicForScreenReader
  }
  return merged
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
  syncRootLangFromI18n()
}

export function resetSettings(authorDefaults: Settings): void {
  saveSettings(authorDefaults)
  applySettings(authorDefaults)
}
