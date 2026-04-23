import { saveSettings, applySettings, resetSettings } from './settings'
import type { Settings } from './settings'
import { exportToFile, importFromFile } from './storage'

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

let _authorDefaults: Settings
let _current: Settings

// ─── Build DOM ────────────────────────────────────────────────────────────────

function buildModal(): HTMLElement {
  const backdrop = document.createElement('div')
  backdrop.id              = 'ifk-settings-backdrop'
  backdrop.className       = 'ifk-modal-backdrop'
  backdrop.setAttribute('aria-hidden', 'true')

  backdrop.innerHTML = `
    <div id="ifk-settings-dialog"
         role="dialog"
         aria-modal="true"
         aria-labelledby="ifk-settings-title"
         class="ifk-modal-dialog">

      <div class="ifk-modal-header">
        <h2 id="ifk-settings-title" class="ifk-modal-title">Настройки</h2>
        <button id="ifk-settings-close"
                class="ifk-modal-close"
                aria-label="Закрыть">✕</button>
      </div>

      <div class="ifk-modal-body">
        <div class="ifk-settings-row">
          <span class="ifk-settings-label">Тема</span>
          <div class="ifk-theme-group" role="group" aria-label="Выбор темы">
            <button class="ifk-theme-btn" data-theme-value="light">Светлая</button>
            <button class="ifk-theme-btn" data-theme-value="dark">Тёмная</button>
            <button class="ifk-theme-btn" data-theme-value="system">Системная</button>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-font-size">Шрифт</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-font-size"
                   min="0.8" max="1.4" step="0.1">
            <span id="ifk-font-size-val" class="ifk-range-val">1.0×</span>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-music-vol">Музыка</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-music-vol"
                   min="0" max="1" step="0.1">
            <span id="ifk-music-vol-val" class="ifk-range-val">0.8</span>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-sound-vol">Звуки</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-sound-vol"
                   min="0" max="1" step="0.1">
            <span id="ifk-sound-vol-val" class="ifk-range-val">1.0</span>
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
    btn.setAttribute('aria-pressed', String(btn.dataset.themeValue === settings.theme))
  })

  // Font size
  const fontRange = backdrop.querySelector<HTMLInputElement>('#ifk-font-size')
  const fontVal   = backdrop.querySelector('#ifk-font-size-val')
  if (fontRange) fontRange.value = String(settings.fontSize)
  if (fontVal)   fontVal.textContent = `${settings.fontSize}×`

  // Music volume
  const musicRange = backdrop.querySelector<HTMLInputElement>('#ifk-music-vol')
  const musicVal   = backdrop.querySelector('#ifk-music-vol-val')
  if (musicRange) musicRange.value = String(settings.musicVolume)
  if (musicVal)   musicVal.textContent = String(settings.musicVolume)

  // Sound volume
  const soundRange = backdrop.querySelector<HTMLInputElement>('#ifk-sound-vol')
  const soundVal   = backdrop.querySelector('#ifk-sound-vol-val')
  if (soundRange) soundRange.value = String(settings.soundVolume)
  if (soundVal)   soundVal.textContent = String(settings.soundVolume)
}

function commit(updated: Partial<Settings>): void {
  _current = { ..._current, ...updated }
  saveSettings(_current)
  applySettings(_current)
  syncToDOM(_current)
}

// ─── Open / Close ─────────────────────────────────────────────────────────────

function open(): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop || backdrop.getAttribute('aria-hidden') === 'false') return
  syncToDOM(_current)
  backdrop.setAttribute('aria-hidden', 'false')
  const first = backdrop.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
  first?.focus()
}

function close(): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop) return
  backdrop.setAttribute('aria-hidden', 'true')
  document.getElementById('btn-settings')?.focus()
}

// ─── Focus trap ───────────────────────────────────────────────────────────────

function trapFocus(e: KeyboardEvent): void {
  const backdrop = document.getElementById('ifk-settings-backdrop')
  if (!backdrop || backdrop.getAttribute('aria-hidden') !== 'false') return

  const focusable = Array.from(
    backdrop.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  )
  if (!focusable.length) return

  const first = focusable[0]
  const last  = focusable[focusable.length - 1]

  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus() }
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initSettingsModal(authorDefaults: Settings, initial: Settings): void {
  _authorDefaults = authorDefaults
  _current        = initial

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
    if (e.key === 'Escape' && backdrop.getAttribute('aria-hidden') === 'false') close()
  })

  // Focus trap: Tab
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') trapFocus(e)
  })

  // Theme buttons
  backdrop.querySelectorAll<HTMLButtonElement>('.ifk-theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      commit({ theme: btn.dataset.themeValue as Settings['theme'] })
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

  // Reset
  backdrop.querySelector('#ifk-settings-reset')?.addEventListener('click', () => {
    resetSettings(_authorDefaults)
    _current = { ..._authorDefaults }
    syncToDOM(_current)
  })

  // Export
  backdrop.querySelector('#ifk-settings-export')?.addEventListener('click', exportToFile)

  // Import
  backdrop.querySelector('#ifk-settings-import')?.addEventListener('click', () => {
    importFromFile()
      .then(() => {
        // Re-load settings from storage and sync UI
        const updated = { ..._current }
        _current = updated
        applySettings(_current)
        syncToDOM(_current)
      })
      .catch(() => {
        // importFromFile already logs the error
      })
  })
}
