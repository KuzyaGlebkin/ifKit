import { mountSavesSlotLucideIcons } from './lucide-icons'
import { getLocaleForFormatting, u } from './i18n'
import { UI } from './ui-keys'
import { restoreGameState, getCurrentSnapshot } from './scenes'
import { getTabbableIn, lockModalFocus, type ModalFocusLock } from './modal-focus-lock'
import {
  getSavesStore,
  saveToSlot,
  deleteSlot,
  loadSavesStore,
} from './saves'
import type { SaveSlot, SavesStore } from './saves'

let _slotsCount = 5
let _savesOpenMode: 'full' | 'load-only' = 'full'
let _savesFocusLock: ModalFocusLock | null = null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function namedSlotPreviewExtras(slot: SaveSlot, index: number): string {
  const act = (slot.actPreview ?? '').trim()
  const go  = (slot.gotoPreview ?? '').trim()
  const out: string[] = []
  if (act) {
    const id = `ifk-slot-act-${index}`
    out.push(`<span class="ifk-slot-preview" id="${id}">${escapeHtml(act)}</span>`)
  }
  if (go) {
    const id = `ifk-slot-goto-${index}`
    out.push(`<span class="ifk-slot-preview" id="${id}">${escapeHtml(go)}</span>`)
  }
  return out.join('')
}

function formatDate(iso: string): string {
  try {
    const d  = new Date(iso)
    const lo = getLocaleForFormatting()
    const date = d.toLocaleDateString(lo, { day: '2-digit', month: '2-digit', year: 'numeric' })
    const time = d.toLocaleTimeString(lo, { hour: '2-digit', minute: '2-digit' })
    return `${date} ${time}`
  } catch {
    return iso
  }
}

// ─── Slot vertical focus (arrows) ─────────────────────────────────────────────
/** Direct children of `.ifk-slot-info` then `.ifk-slot-actions` — top to bottom, then buttons. */
function getSlotVerticalChain(card: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = []
  const info = card.querySelector('.ifk-slot-info')
  if (info) {
    for (const el of info.children) {
      if (el instanceof HTMLElement) out.push(el)
    }
  }
  const actions = card.querySelector('.ifk-slot-actions')
  if (actions) {
    for (const el of actions.children) {
      if (el instanceof HTMLElement) out.push(el)
    }
  }
  return out
}

/** Spans and confirm text are focusable for ArrowUp/Down; real buttons keep default tab order. */
function applySlotLineTabindex(card: HTMLElement): void {
  for (const el of getSlotVerticalChain(card)) {
    if (el.tagName === 'BUTTON') continue
    el.tabIndex = -1
  }
}

function onSlotCardKeydown(e: KeyboardEvent): void {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
  const card = (e.currentTarget as HTMLElement)
  const chain = getSlotVerticalChain(card)
  if (chain.length < 2) return
  const t = e.target
  if (!(t instanceof HTMLElement) || !chain.includes(t)) return
  const i = chain.indexOf(t)
  e.preventDefault()
  e.stopPropagation()
  const j =
    e.key === 'ArrowDown' ? (i + 1) % chain.length : (i - 1 + chain.length) % chain.length
  chain[j].focus()
}

function bindSlotArrowNav(card: HTMLElement): void {
  card.addEventListener('keydown', onSlotCardKeydown)
  applySlotLineTabindex(card)
}

// ─── Slot card rendering ──────────────────────────────────────────────────────

function renderAutoSlotCard(slot: SaveSlot | null): string {
  if (!slot) {
    return `
      <div class="ifk-slot ifk-slot--auto" data-slot-id="auto" role="group" aria-labelledby="ifk-slot-num-auto">
        <div class="ifk-slot-info">
          <span class="ifk-slot-num" id="ifk-slot-num-auto">${escapeHtml(u(UI.savesAuto))}</span>
          <span class="ifk-slot-empty">${escapeHtml(u(UI.savesNoData))}</span>
        </div>
        <div class="ifk-slot-actions"></div>
      </div>`
  }
  return `
    <div class="ifk-slot ifk-slot--auto" data-slot-id="auto" role="group" aria-labelledby="ifk-slot-num-auto">
      <div class="ifk-slot-info">
        <span class="ifk-slot-num" id="ifk-slot-num-auto">${escapeHtml(u(UI.savesAuto))}</span>
        <span class="ifk-slot-meta">${escapeHtml(formatDate(slot.savedAt))}</span>
      </div>
      <div class="ifk-slot-actions">
        <button type="button" class="ifk-btn-ghost ifk-slot-load-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">${escapeHtml(u(UI.savesLoad))}</span>
        </button>
      </div>
    </div>`
}

function renderNamedSlotCard(slot: SaveSlot | null, index: number): string {
  const numId = `ifk-slot-num-${index}`
  const loadOnly = _savesOpenMode === 'load-only'
  if (!slot) {
    const actions = loadOnly
      ? ''
      : `
        <div class="ifk-slot-actions">
          <button type="button" class="ifk-btn-ghost ifk-slot-save-btn">
            <span class="ifk-btn-icon" aria-hidden="true"></span>
            <span class="ifk-btn-label">${escapeHtml(u(UI.savesSave))}</span>
          </button>
        </div>`
    return `
      <div class="ifk-slot" data-slot-index="${index}" role="group" aria-labelledby="${numId}">
        <div class="ifk-slot-info">
          <span class="ifk-slot-num" id="${numId}">${index + 1}</span>
          <span class="ifk-slot-empty">${escapeHtml(u(UI.savesEmpty))}</span>
        </div>
        ${actions}
      </div>`
  }
  const labelId = `ifk-slot-label-${index}`
  const actId = `ifk-slot-act-${index}`
  const goId  = `ifk-slot-goto-${index}`
  const act   = (slot.actPreview ?? '').trim()
  const go    = (slot.gotoPreview ?? '').trim()
  const labelParts: string[] = [numId]
  if (slot.label) labelParts.push(labelId)
  if (act) labelParts.push(actId)
  if (go) labelParts.push(goId)
  const labelled = labelParts.join(' ')
  const label = slot.label
    ? `<span class="ifk-slot-label" id="${labelId}">«${escapeHtml(slot.label)}»</span>`
    : ''
  const namedActions = loadOnly
    ? `
      <div class="ifk-slot-actions">
        <button type="button" class="ifk-btn-ghost ifk-slot-load-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">${escapeHtml(u(UI.savesLoad))}</span>
        </button>
      </div>`
    : `
      <div class="ifk-slot-actions">
        <button type="button" class="ifk-btn-ghost ifk-slot-load-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">${escapeHtml(u(UI.savesLoad))}</span>
        </button>
        <button type="button" class="ifk-btn-ghost ifk-slot-save-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">${escapeHtml(u(UI.savesSave))}</span>
        </button>
        <button type="button" class="ifk-btn-ghost ifk-slot-delete-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">${escapeHtml(u(UI.savesDelete))}</span>
        </button>
      </div>`
  return `
    <div class="ifk-slot" data-slot-index="${index}" role="group" aria-labelledby="${labelled}">
      <div class="ifk-slot-info">
        <span class="ifk-slot-num" id="${numId}">${index + 1}</span>
        <span class="ifk-slot-meta">${escapeHtml(formatDate(slot.savedAt))}</span>
        ${label}
        ${namedSlotPreviewExtras(slot, index)}
      </div>
      ${namedActions}
    </div>`
}

// ─── Build DOM ────────────────────────────────────────────────────────────────

function buildModal(_slots: number): HTMLElement {
  const backdrop = document.createElement('div')
  backdrop.id        = 'ifk-saves-backdrop'
  backdrop.className = 'ifk-modal-backdrop'
  backdrop.setAttribute('hidden', '')

  backdrop.innerHTML = `
    <div id="ifk-saves-dialog"
         class="ifk-modal-dialog ifk-saves-dialog">

      <div class="ifk-modal-header">
        <h2 id="ifk-saves-title" class="ifk-modal-title">${u(UI.savesTitle)}</h2>
        <button id="ifk-saves-close"
                class="ifk-modal-close"
                type="button"
                data-ifk-ui-aria="${UI.savesClose}">✕</button>
      </div>

      <div id="ifk-saves-body" class="ifk-modal-body ifk-saves-body">
      </div>
    </div>
  `

  return backdrop
}

// ─── Sync DOM ─────────────────────────────────────────────────────────────────

function syncToDOM(store: SavesStore): void {
  const body = document.getElementById('ifk-saves-body')
  if (!body) return

  let html = renderAutoSlotCard(store.auto)
  for (let i = 0; i < store.slots.length; i++) {
    html += renderNamedSlotCard(store.slots[i], i)
  }
  body.innerHTML = html
  mountSavesSlotLucideIcons(body)

  bindSlotEvents(body, store)
}

function bindSlotEvents(body: HTMLElement, store: SavesStore): void {
  // Auto slot — load
  body.querySelector('.ifk-slot--auto .ifk-slot-load-btn')?.addEventListener('click', () => {
    if (store.auto) {
      restoreGameState(store.auto)
      close()
    }
  })

  // Named slots
  body.querySelectorAll<HTMLElement>('.ifk-slot:not(.ifk-slot--auto)').forEach((card) => {
    const indexStr = card.dataset.slotIndex
    if (indexStr === undefined) return
    const index = parseInt(indexStr, 10)
    const slot  = store.slots[index] ?? null

    card.querySelector('.ifk-slot-load-btn')?.addEventListener('click', () => {
      if (slot) {
        restoreGameState(slot)
        close()
      }
    })

    if (_savesOpenMode === 'full') {
      card.querySelector('.ifk-slot-save-btn')?.addEventListener('click', () => {
        if (slot) {
          showOverwriteConfirm(card, index)
        } else {
          const snap = getCurrentSnapshot()
          saveToSlot(index, snap.sceneKey, snap.state, snap.sceneLocals)
          syncToDOM(getSavesStore())
        }
      })

      card.querySelector('.ifk-slot-delete-btn')?.addEventListener('click', () => {
        showDeleteConfirm(card, index)
      })
    }

    bindSlotArrowNav(card)
  })

  body.querySelectorAll<HTMLElement>('.ifk-slot--auto').forEach((card) => {
    bindSlotArrowNav(card)
  })
}

// ─── Inline confirmations ─────────────────────────────────────────────────────

function showDeleteConfirm(card: HTMLElement, index: number): void {
  const actionsEl = card.querySelector('.ifk-slot-actions')
  if (!actionsEl) return

  actionsEl.innerHTML = `
    <span class="ifk-slot-confirm-text">${escapeHtml(u(UI.savesConfirmDelete))}</span>
    <button class="ifk-btn-ghost ifk-confirm-yes" type="button">${escapeHtml(u(UI.savesYes))}</button>
    <button class="ifk-btn-ghost ifk-confirm-no" type="button">${escapeHtml(u(UI.savesNo))}</button>
  `

  actionsEl.querySelector('.ifk-confirm-yes')?.addEventListener('click', () => {
    deleteSlot(index)
    syncToDOM(getSavesStore())
  })

  actionsEl.querySelector('.ifk-confirm-no')?.addEventListener('click', () => {
    syncToDOM(getSavesStore())
  })

  applySlotLineTabindex(card)
}

function showOverwriteConfirm(card: HTMLElement, index: number): void {
  const actionsEl = card.querySelector('.ifk-slot-actions')
  if (!actionsEl) return

  actionsEl.innerHTML = `
    <span class="ifk-slot-confirm-text">${escapeHtml(u(UI.savesConfirmOverwrite))}</span>
    <button class="ifk-btn-ghost ifk-confirm-yes" type="button">${escapeHtml(u(UI.savesYes))}</button>
    <button class="ifk-btn-ghost ifk-confirm-no" type="button">${escapeHtml(u(UI.savesNo))}</button>
  `

  actionsEl.querySelector('.ifk-confirm-yes')?.addEventListener('click', () => {
    const snap = getCurrentSnapshot()
    saveToSlot(index, snap.sceneKey, snap.state, snap.sceneLocals)
    syncToDOM(getSavesStore())
  })

  actionsEl.querySelector('.ifk-confirm-no')?.addEventListener('click', () => {
    syncToDOM(getSavesStore())
  })

  applySlotLineTabindex(card)
}

/** Update saves modal title and slot cards when the UI locale changes. */
export function refreshSavesModalChrome(): void {
  const backdrop = document.getElementById('ifk-saves-backdrop')
  if (backdrop) {
    backdrop.querySelectorAll<HTMLElement>('[data-ifk-ui-aria]').forEach((el) => {
      const k = el.dataset.ifkUiAria
      if (k) el.setAttribute('aria-label', u(k))
    })
  }
  const title = document.getElementById('ifk-saves-title')
  if (title) title.textContent = u(UI.savesTitle)
  const body = document.getElementById('ifk-saves-body')
  if (backdrop && body && !backdrop.hasAttribute('hidden')) {
    syncToDOM(loadSavesStore(_slotsCount))
  }
}

// ─── Open / Close ─────────────────────────────────────────────────────────────

export function openSavesModal(options?: { mode?: 'full' | 'load-only'; focusReturn?: HTMLElement | null }): void {
  const backdrop = document.getElementById('ifk-saves-backdrop')
  if (!backdrop || !backdrop.hasAttribute('hidden')) return

  _savesOpenMode = options?.mode ?? 'full'
  syncToDOM(loadSavesStore(_slotsCount))

  backdrop.removeAttribute('hidden')
  const trigger
    = options?.focusReturn ?? (document.getElementById('btn-saves') as HTMLElement | null)
  _savesFocusLock = lockModalFocus(backdrop, trigger)
  queueMicrotask(() => getTabbableIn(backdrop)[0]?.focus())
}

function close(): void {
  const backdrop = document.getElementById('ifk-saves-backdrop')
  if (!backdrop) return
  _savesFocusLock?.release()
  _savesFocusLock = null
  backdrop.setAttribute('hidden', '')
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initSavesModal(slots: number): void {
  _slotsCount = slots

  const backdrop = buildModal(slots)
  document.body.appendChild(backdrop)
  refreshSavesModalChrome()

  document.getElementById('btn-saves')?.addEventListener('click', () => {
    openSavesModal({ mode: 'full' })
  })

  backdrop.querySelector('#ifk-saves-close')?.addEventListener('click', close)

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.hasAttribute('hidden')) close()
  })
}
