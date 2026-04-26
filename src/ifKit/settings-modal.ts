import { loadSettings, saveSettings, applySettings, resetSettings } from './settings'
import type { Settings, AccentPreset } from './settings'
import { exportToFile, importFromFile } from '@ifkit-storage'
import { setMusicVolume, setSoundVolume } from './audio'
import { setLanguageOrAuto } from './i18n'
import { rerender, setShowUnseenHighlight } from './scenes'
import { resetSeenContent } from './seen-content'
import { getTabbableIn, lockModalFocus, type ModalFocusLock } from './modal-focus-lock'

let _authorDefaults: Settings
let _current: Settings
let _languages: string[] = []
let _settingsFocusLock: ModalFocusLock | null = null

function asPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}

// ─── Build DOM ────────────────────────────────────────────────────────────────

function buildLangRow(): string {
  if (_languages.length < 2) return ''
  const autoBtn
    = '<button type="button" class="ifk-lang-btn" data-lang-value="">Авто</button>'
  const rest = _languages
    .map(
      (lang) =>
        `<button type="button" class="ifk-lang-btn" data-lang-value="${lang}">${lang}</button>`,
    )
    .join('')
  return `
    <div class="ifk-settings-row ifk-settings-row--segment" id="ifk-lang-row" role="group" aria-labelledby="ifk-lang-label">
      <span id="ifk-lang-label" class="ifk-settings-label">Язык</span>
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
        <h2 id="ifk-settings-title" class="ifk-modal-title">Настройки</h2>
        <button id="ifk-settings-close"
                class="ifk-modal-close"
                type="button">✕</button>
      </div>

      <div class="ifk-modal-body">
        <div id="ifk-settings-theme-font" aria-hidden="true">
        <div class="ifk-settings-row ifk-settings-row--segment">
          <span class="ifk-settings-label">Тема</span>
          <div class="ifk-segment-group">
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="light">Светлая</button>
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="dark">Тёмная</button>
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="system">Системная</button>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-font-size">Шрифт</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-font-size" tabindex="-1"
                   min="0.8" max="1.4" step="0.1">
            <span id="ifk-font-size-val" class="ifk-range-val">100%</span>
          </div>
        </div>
        </div>

        <div class="ifk-settings-row ifk-settings-row--segment" id="ifk-settings-accent-row">
          <span class="ifk-settings-label">Акцент</span>
          <div class="ifk-segment-group">
            <button type="button" class="ifk-accent-btn" data-accent-value="default">Стандарт</button>
            <button type="button" class="ifk-accent-btn" data-accent-value="blue">Синий</button>
            <button type="button" class="ifk-accent-btn" data-accent-value="violet">Фиолет</button>
            <button type="button" class="ifk-accent-btn" data-accent-value="emerald">Зелёный</button>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-music-vol">Музыка</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-music-vol"
                   min="0" max="1" step="0.1">
            <span id="ifk-music-vol-val" class="ifk-range-val">80%</span>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-sound-vol">Звуки</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-sound-vol"
                   min="0" max="1" step="0.1">
            <span id="ifk-sound-vol-val" class="ifk-range-val">100%</span>
          </div>
        </div>

        ${buildLangRow()}

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-unseen-toggle">Новый текст</label>
          <div class="ifk-unseen-wrap">
            <input type="checkbox" id="ifk-unseen-toggle" class="ifk-checkbox">
            <button id="ifk-seen-reset" class="ifk-btn-ghost ifk-btn-sm">Сбросить историю</button>
          </div>
        </div>
      </div>

      <div class="ifk-modal-footer">
        <button id="ifk-settings-reset" class="ifk-btn-ghost">Сбросить настройки</button>
        <div class="ifk-modal-footer-actions">
          <button id="ifk-settings-export" class="ifk-btn-ghost">Экспорт</button>
          <button id="ifk-settings-import" class="ifk-btn-ghost">Импорт</button>
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

  // Music volume
  const musicRange = backdrop.querySelector<HTMLInputElement>('#ifk-music-vol')
  const musicVal   = backdrop.querySelector('#ifk-music-vol-val')
  if (musicRange) musicRange.value = String(settings.musicVolume)
  if (musicVal)   musicVal.textContent = asPercent(settings.musicVolume)

  // Sound volume
  const soundRange = backdrop.querySelector<HTMLInputElement>('#ifk-sound-vol')
  const soundVal   = backdrop.querySelector('#ifk-sound-vol-val')
  if (soundRange) soundRange.value = String(settings.soundVolume)
  if (soundVal)   soundVal.textContent = asPercent(settings.soundVolume)

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
  syncToDOM(_current)
}

// ─── Open / Close ─────────────────────────────────────────────────────────────

function open(): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop || !backdrop.hasAttribute('hidden')) return
  syncToDOM(_current)
  backdrop.removeAttribute('hidden')
  const trigger = document.getElementById('btn-settings') as HTMLElement | null
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

  // Open
  document.getElementById('btn-settings')?.addEventListener('click', open)

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

  // Language buttons
  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang-value') ?? ''
      setLanguageOrAuto(lang)
      commit({ language: lang })
      rerender()
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
    rerender()
  })

  // Reset
  backdrop.querySelector('#ifk-settings-reset')?.addEventListener('click', () => {
    resetSettings(_authorDefaults)
    _current = { ..._authorDefaults }
    setLanguageOrAuto(_authorDefaults.language)
    setShowUnseenHighlight(_authorDefaults.showUnseenHighlight)
    setMusicVolume(_current.musicVolume)
    setSoundVolume(_current.soundVolume)
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
        setShowUnseenHighlight(_current.showUnseenHighlight)
        syncToDOM(_current)
        rerender()
      })
      .catch(() => {
        // importFromFile already logs the error
      })
  })
}
