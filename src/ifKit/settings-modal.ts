import { loadSettings, saveSettings, applySettings, resetSettings } from './settings'
import type { Settings, AccentPreset } from './settings'
import { exportToFile, importFromFile } from '@ifkit-storage'
import {
  setMusicVolume,
  setSoundVolume,
  setMusicMuted,
  setSoundMuted,
  setQuietMusicForScreenReader,
} from './audio'
import { u, setLanguageOrAuto } from './i18n'
import { UI } from './ui-keys'
import { rerenderForSettingsOrI18n, setShowUnseenHighlight } from './scenes'
import { resetSeenContent } from './seen-content'
import { getTabbableIn, lockModalFocus, type ModalFocusLock } from './modal-focus-lock'

let _authorDefaults: Settings
let _current: Settings
let _languages: string[] = []
let _settingsFocusLock: ModalFocusLock | null = null

function asPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}

/** Share 0–1 storage with visible label and `aria-valuetext` (integer percent). */
function formatVolumeLevel(fraction: number): string {
  const p = Math.round(fraction * 100)
  return u(UI.settingsVolumeLevel).replace(/\{0\}/g, String(p))
}

// ─── Build DOM ────────────────────────────────────────────────────────────────

function buildLangRow(): string {
  if (_languages.length < 2) return ''
  const autoBtn
    = `<button type="button" class="ifk-lang-btn" data-lang-value="" data-ifk-ui="${UI.langAuto}">${u(UI.langAuto)}</button>`
  const rest = _languages
    .map(
      (lang) =>
        `<button type="button" class="ifk-lang-btn" data-lang-value="${lang}">${lang}</button>`,
    )
    .join('')
  return `
    <div class="ifk-settings-row ifk-settings-row--segment" id="ifk-lang-row" role="group" aria-labelledby="ifk-lang-label">
      <span id="ifk-lang-label" class="ifk-settings-label" data-ifk-ui="${UI.settingsLangLabel}">${u(UI.settingsLangLabel)}</span>
      <div class="ifk-segment-group">
        ${autoBtn}
        ${rest}
      </div>
    </div>`
}

function buildModal(): HTMLElement {
  const backdrop = document.createElement('div')
  backdrop.id              = 'ifk-settings-backdrop'
  backdrop.className       = 'ifk-modal-backdrop'
  backdrop.setAttribute('hidden', '')

  backdrop.innerHTML = `
    <div id="ifk-settings-dialog"
         class="ifk-modal-dialog">

      <div class="ifk-modal-header">
        <h2 id="ifk-settings-title" class="ifk-modal-title" data-ifk-ui="${UI.settingsTitle}">${u(UI.settingsTitle)}</h2>
        <button id="ifk-settings-close"
                class="ifk-modal-close"
                type="button"
                data-ifk-ui-aria="${UI.settingsClose}">✕</button>
      </div>

      <div class="ifk-modal-body">
        <div id="ifk-settings-theme-font" aria-hidden="true">
        <div class="ifk-settings-row ifk-settings-row--segment">
          <span class="ifk-settings-label" data-ifk-ui="${UI.settingsTheme}">${u(UI.settingsTheme)}</span>
          <div class="ifk-segment-group">
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="light" data-ifk-ui="${UI.settingsThemeLight}">${u(UI.settingsThemeLight)}</button>
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="dark" data-ifk-ui="${UI.settingsThemeDark}">${u(UI.settingsThemeDark)}</button>
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="system" data-ifk-ui="${UI.settingsThemeSystem}">${u(UI.settingsThemeSystem)}</button>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-font-size" data-ifk-ui="${UI.settingsFont}">${u(UI.settingsFont)}</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-font-size" tabindex="-1"
                   min="0.8" max="1.4" step="0.1">
            <span id="ifk-font-size-val" class="ifk-range-val">100%</span>
          </div>
        </div>
        </div>

        <div class="ifk-settings-row ifk-settings-row--segment" id="ifk-settings-accent-row" aria-hidden="true">
          <span class="ifk-settings-label" data-ifk-ui="${UI.settingsAccent}">${u(UI.settingsAccent)}</span>
          <div class="ifk-segment-group">
            <button type="button" tabindex="-1" class="ifk-accent-btn" data-accent-value="default" data-ifk-ui="${UI.settingsAccentDefault}">${u(UI.settingsAccentDefault)}</button>
            <button type="button" tabindex="-1" class="ifk-accent-btn" data-accent-value="blue" data-ifk-ui="${UI.settingsAccentBlue}">${u(UI.settingsAccentBlue)}</button>
            <button type="button" tabindex="-1" class="ifk-accent-btn" data-accent-value="orange" data-ifk-ui="${UI.settingsAccentOrange}">${u(UI.settingsAccentOrange)}</button>
            <button type="button" tabindex="-1" class="ifk-accent-btn" data-accent-value="emerald" data-ifk-ui="${UI.settingsAccentEmerald}">${u(UI.settingsAccentEmerald)}</button>
          </div>
        </div>

        <div class="ifk-settings-row ifk-settings-row--volume">
          <span class="ifk-settings-label" id="ifk-music-label" data-ifk-ui="${UI.settingsMusic}">${u(UI.settingsMusic)}</span>
          <input type="checkbox" id="ifk-music-on" class="ifk-checkbox ifk-settings-audio" data-ifk-ui-aria="${UI.settingsMusicEnabled}">
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-music-vol"
                   min="0" max="1" step="0.1" aria-labelledby="ifk-music-label">
            <span id="ifk-music-vol-val" class="ifk-range-val">80%</span>
          </div>
        </div>

        <div class="ifk-settings-row ifk-settings-row--volume">
          <span class="ifk-settings-label" id="ifk-quiet-music-sr-label" data-ifk-ui="${UI.settingsQuietMusicSr}">${u(UI.settingsQuietMusicSr)}</span>
          <input type="checkbox" id="ifk-quiet-music-sr" class="ifk-checkbox ifk-settings-audio" aria-labelledby="ifk-quiet-music-sr-label">
          <div class="ifk-range-wrap" aria-hidden="true"></div>
        </div>

        <div class="ifk-settings-row ifk-settings-row--volume">
          <span class="ifk-settings-label" id="ifk-sound-label" data-ifk-ui="${UI.settingsSound}">${u(UI.settingsSound)}</span>
          <input type="checkbox" id="ifk-sound-on" class="ifk-checkbox ifk-settings-audio" data-ifk-ui-aria="${UI.settingsSoundEnabled}">
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-sound-vol"
                   min="0" max="1" step="0.1" aria-labelledby="ifk-sound-label">
            <span id="ifk-sound-vol-val" class="ifk-range-val">100%</span>
          </div>
        </div>

        ${buildLangRow()}

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-unseen-toggle" data-ifk-ui="${UI.settingsUnseenLabel}">${u(UI.settingsUnseenLabel)}</label>
          <div class="ifk-unseen-wrap">
            <input type="checkbox" id="ifk-unseen-toggle" class="ifk-checkbox">
            <button id="ifk-seen-reset" class="ifk-btn-ghost ifk-btn-sm" type="button" data-ifk-ui="${UI.settingsResetSeen}">${u(UI.settingsResetSeen)}</button>
          </div>
        </div>
      </div>

      <div class="ifk-modal-footer">
        <button id="ifk-settings-reset" class="ifk-btn-ghost" type="button" data-ifk-ui="${UI.settingsResetAll}">${u(UI.settingsResetAll)}</button>
        <div class="ifk-modal-footer-actions">
          <button id="ifk-settings-export" class="ifk-btn-ghost" type="button" data-ifk-ui="${UI.settingsExport}">${u(UI.settingsExport)}</button>
          <button id="ifk-settings-import" class="ifk-btn-ghost" type="button" data-ifk-ui="${UI.settingsImport}">${u(UI.settingsImport)}</button>
        </div>
      </div>
    </div>
  `
  return backdrop
}

// ─── Sync UI → state ──────────────────────────────────────────────────────────

function syncToDOM(settings: Settings): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop) return

  // Theme buttons
  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-theme-btn').forEach((btn) => {
    btn.classList.toggle('ifk-theme-btn--active', btn.dataset.themeValue === settings.theme)
  })

  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-accent-btn').forEach((btn) => {
    const v = btn.getAttribute('data-accent-value') as AccentPreset
    btn.classList.toggle('ifk-accent-btn--active', v === settings.accent)
  })

  // Font size
  const fontRange = backdrop.querySelector<HTMLInputElement>('#ifk-font-size')
  const fontVal   = backdrop.querySelector('#ifk-font-size-val')
  if (fontRange) fontRange.value = String(settings.fontSize)
  if (fontVal)   fontVal.textContent = asPercent(settings.fontSize)

  // Music volume + on/off (checkbox checked = not muted)
  const musicOn = backdrop.querySelector<HTMLInputElement>('#ifk-music-on')
  const musicRange = backdrop.querySelector<HTMLInputElement>('#ifk-music-vol')
  const musicVal   = backdrop.querySelector('#ifk-music-vol-val')
  if (musicOn) musicOn.checked = !settings.musicMuted
  if (musicRange) musicRange.value = String(settings.musicVolume)
  if (musicVal)   musicVal.textContent = formatVolumeLevel(settings.musicVolume)
  if (musicRange) musicRange.setAttribute('aria-valuetext', formatVolumeLevel(settings.musicVolume))

  const quietSr = backdrop.querySelector<HTMLInputElement>('#ifk-quiet-music-sr')
  if (quietSr) quietSr.checked = settings.quietMusicForScreenReader

  // Sound volume + on/off (checkbox checked = not muted)
  const soundOn = backdrop.querySelector<HTMLInputElement>('#ifk-sound-on')
  const soundRange = backdrop.querySelector<HTMLInputElement>('#ifk-sound-vol')
  const soundVal   = backdrop.querySelector('#ifk-sound-vol-val')
  if (soundOn) soundOn.checked = !settings.soundMuted
  if (soundRange) soundRange.value = String(settings.soundVolume)
  if (soundVal)   soundVal.textContent = formatVolumeLevel(settings.soundVolume)
  if (soundRange) soundRange.setAttribute('aria-valuetext', formatVolumeLevel(settings.soundVolume))

  // Language buttons
  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-lang-btn').forEach((btn) => {
    const raw = btn.getAttribute('data-lang-value') ?? ''
    btn.classList.toggle('ifk-lang-btn--active', raw === settings.language)
  })

  // Unseen highlight toggle
  const unseenToggle = backdrop.querySelector<HTMLInputElement>('#ifk-unseen-toggle')
  if (unseenToggle) unseenToggle.checked = settings.showUnseenHighlight
}

function commit(updated: Partial<Settings>): void {
  _current = { ..._current, ...updated }
  saveSettings(_current)
  applySettings(_current)
  setMusicVolume(_current.musicVolume)
  setSoundVolume(_current.soundVolume)
  setMusicMuted(_current.musicMuted)
  setSoundMuted(_current.soundMuted)
  setQuietMusicForScreenReader(_current.quietMusicForScreenReader)
  syncToDOM(_current)
}

// ─── Open / Close ─────────────────────────────────────────────────────────────

export function openSettingsModal(focusReturn?: HTMLElement | null): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop || !backdrop.hasAttribute('hidden')) return
  syncToDOM(_current)
  backdrop.removeAttribute('hidden')
  const trigger
    = focusReturn ?? (document.getElementById('btn-settings') as HTMLElement | null)
  _settingsFocusLock = lockModalFocus(backdrop, trigger)
  queueMicrotask(() => getTabbableIn(backdrop)[0]?.focus())
}

function close(): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop) return
  _settingsFocusLock?.release()
  _settingsFocusLock = null
  backdrop.setAttribute('hidden', '')
}

/** Push current `u()` strings into the settings modal (open or closed). */
export function refreshSettingsModalI18n(): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop) return
  backdrop.querySelectorAll<HTMLElement>('[data-ifk-ui]').forEach((el) => {
    const k = el.dataset.ifkUi
    if (k) el.textContent = u(k)
  })
  backdrop.querySelectorAll<HTMLElement>('[data-ifk-ui-aria]').forEach((el) => {
    const k = el.dataset.ifkUiAria
    if (k) el.setAttribute('aria-label', u(k))
  })
  syncToDOM(_current)
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initSettingsModal(
  authorDefaults: Settings,
  initial: Settings,
  languages: string[] = [],
): void {
  _authorDefaults = authorDefaults
  _current        = initial
  _languages      = languages

  const backdrop = buildModal()
  document.body.appendChild(backdrop)
  refreshSettingsModalI18n()

  // Open
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    openSettingsModal()
  })

  // Close: ✕ button
  backdrop.querySelector('#ifk-settings-close')?.addEventListener('click', close)

  // Close: backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })

  // Close: Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.hasAttribute('hidden')) close()
  })

  // Theme buttons
  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      commit({ theme: btn.dataset.themeValue as Settings['theme'] })
    })
  })

  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-accent-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-accent-value') as AccentPreset
      commit({ accent: v })
    })
  })

  // Font size slider
  backdrop.querySelector('#ifk-font-size')?.addEventListener('input', (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value)
    commit({ fontSize: val })
  })

  // Music volume slider
  backdrop.querySelector('#ifk-music-vol')?.addEventListener('input', (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value)
    commit({ musicVolume: val })
  })

  // Sound volume slider
  backdrop.querySelector('#ifk-sound-vol')?.addEventListener('input', (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value)
    commit({ soundVolume: val })
  })

  backdrop.querySelector('#ifk-music-on')?.addEventListener('change', (e) => {
    const on = (e.target as HTMLInputElement).checked
    commit({ musicMuted: !on })
  })

  backdrop.querySelector('#ifk-sound-on')?.addEventListener('change', (e) => {
    const on = (e.target as HTMLInputElement).checked
    commit({ soundMuted: !on })
  })

  backdrop.querySelector('#ifk-quiet-music-sr')?.addEventListener('change', (e) => {
    const on = (e.target as HTMLInputElement).checked
    commit({ quietMusicForScreenReader: on })
  })

  // Language buttons
  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang-value') ?? ''
      setLanguageOrAuto(lang)
      commit({ language: lang })
      rerenderForSettingsOrI18n()
    })
  })

  // Unseen highlight toggle
  backdrop.querySelector('#ifk-unseen-toggle')?.addEventListener('change', (e) => {
    const enabled = (e.target as HTMLInputElement).checked
    setShowUnseenHighlight(enabled)
    commit({ showUnseenHighlight: enabled })
  })

  // Reset seen content
  backdrop.querySelector('#ifk-seen-reset')?.addEventListener('click', () => {
    resetSeenContent()
    rerenderForSettingsOrI18n()
  })

  // Reset
  backdrop.querySelector('#ifk-settings-reset')?.addEventListener('click', () => {
    resetSettings(_authorDefaults)
    _current = { ..._authorDefaults }
    setLanguageOrAuto(_authorDefaults.language)
    setShowUnseenHighlight(_authorDefaults.showUnseenHighlight)
    setMusicVolume(_current.musicVolume)
    setSoundVolume(_current.soundVolume)
    setMusicMuted(_current.musicMuted)
    setSoundMuted(_current.soundMuted)
    setQuietMusicForScreenReader(_current.quietMusicForScreenReader)
    syncToDOM(_current)
  })

  // Export
  backdrop.querySelector('#ifk-settings-export')?.addEventListener('click', exportToFile)

  // Import
  backdrop.querySelector('#ifk-settings-import')?.addEventListener('click', () => {
    importFromFile()
      .then(() => {
        _current = loadSettings(_authorDefaults)
        applySettings(_current)
        setLanguageOrAuto(_current.language)
        setMusicVolume(_current.musicVolume)
        setSoundVolume(_current.soundVolume)
        setMusicMuted(_current.musicMuted)
        setSoundMuted(_current.soundMuted)
        setQuietMusicForScreenReader(_current.quietMusicForScreenReader)
        setShowUnseenHighlight(_current.showUnseenHighlight)
        syncToDOM(_current)
        rerenderForSettingsOrI18n()
      })
      .catch(() => {
        // importFromFile already logs the error
      })
  })
}
