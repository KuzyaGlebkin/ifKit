import { mountSavesSlotLucideIcons } from './lucide-icons'
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
let _savesFocusLock: ModalFocusLock | null = null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const date = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    return `${date} ${time}`
  } catch {
    return iso
  }
}

// ─── Slot card rendering ──────────────────────────────────────────────────────

function renderAutoSlotCard(slot: SaveSlot | null): string {
  if (!slot) {
    return `
      <div class="ifk-slot ifk-slot--auto" data-slot-id="auto" role="group" aria-labelledby="ifk-slot-num-auto">
        <div class="ifk-slot-info">
          <span class="ifk-slot-num" id="ifk-slot-num-auto">Авто</span>
          <span class="ifk-slot-empty">── нет данных ──</span>
        </div>
        <div class="ifk-slot-actions"></div>
      </div>`
  }
  return `
    <div class="ifk-slot ifk-slot--auto" data-slot-id="auto" role="group" aria-labelledby="ifk-slot-num-auto">
      <div class="ifk-slot-info">
        <span class="ifk-slot-num" id="ifk-slot-num-auto">Авто</span>
        <span class="ifk-slot-meta">${escapeHtml(formatDate(slot.savedAt))}</span>
      </div>
      <div class="ifk-slot-actions">
        <button type="button" class="ifk-btn-ghost ifk-slot-load-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Загрузить</span>
        </button>
      </div>
    </div>`
}

function renderNamedSlotCard(slot: SaveSlot | null, index: number): string {
  const numId = `ifk-slot-num-${index}`
  if (!slot) {
    return `
      <div class="ifk-slot" data-slot-index="${index}" role="group" aria-labelledby="${numId}">
        <div class="ifk-slot-info">
          <span class="ifk-slot-num" id="${numId}">${index + 1}</span>
          <span class="ifk-slot-empty">── пусто ──</span>
        </div>
        <div class="ifk-slot-actions">
          <button type="button" class="ifk-btn-ghost ifk-slot-save-btn">
            <span class="ifk-btn-icon" aria-hidden="true"></span>
            <span class="ifk-btn-label">Сохранить</span>
          </button>
        </div>
      </div>`
  }
  const labelId = `ifk-slot-label-${index}`
  const labelled = slot.label ? `${numId} ${labelId}` : numId
  const label = slot.label
    ? `<span class="ifk-slot-label" id="${labelId}">«${escapeHtml(slot.label)}»</span>`
    : ''
  return `
    <div class="ifk-slot" data-slot-index="${index}" role="group" aria-labelledby="${labelled}">
      <div class="ifk-slot-info">
        <span class="ifk-slot-num" id="${numId}">${index + 1}</span>
        <span class="ifk-slot-meta">${escapeHtml(formatDate(slot.savedAt))}</span>
        ${label}
      </div>
      <div class="ifk-slot-actions">
        <button type="button" class="ifk-btn-ghost ifk-slot-load-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Загрузить</span>
        </button>
        <button type="button" class="ifk-btn-ghost ifk-slot-save-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Сохранить</span>
        </button>
        <button type="button" class="ifk-btn-ghost ifk-slot-delete-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Удалить</span>
        </button>
      </div>
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
        <h2 id="ifk-saves-title" class="ifk-modal-title">Сохранения</h2>
        <button id="ifk-saves-close"
                class="ifk-modal-close"
                type="button">✕</button>
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
  })
}

// ─── Inline confirmations ─────────────────────────────────────────────────────

function showDeleteConfirm(card: HTMLElement, index: number): void {
  const actionsEl = card.querySelector('.ifk-slot-actions')
  if (!actionsEl) return

  actionsEl.innerHTML = `
    <span class="ifk-slot-confirm-text">Удалить?</span>
    <button class="ifk-btn-ghost ifk-confirm-yes">Да</button>
    <button class="ifk-btn-ghost ifk-confirm-no">Нет</button>
  `

  actionsEl.querySelector('.ifk-confirm-yes')?.addEventListener('click', () => {
    deleteSlot(index)
    syncToDOM(getSavesStore())
  })

  actionsEl.querySelector('.ifk-confirm-no')?.addEventListener('click', () => {
    syncToDOM(getSavesStore())
  })
}

function showOverwriteConfirm(card: HTMLElement, index: number): void {
  const actionsEl = card.querySelector('.ifk-slot-actions')
  if (!actionsEl) return

  actionsEl.innerHTML = `
    <span class="ifk-slot-confirm-text">Перезаписать?</span>
    <button class="ifk-btn-ghost ifk-confirm-yes">Да</button>
    <button class="ifk-btn-ghost ifk-confirm-no">Нет</button>
  `

  actionsEl.querySelector('.ifk-confirm-yes')?.addEventListener('click', () => {
    const snap = getCurrentSnapshot()
    saveToSlot(index, snap.sceneKey, snap.state, snap.sceneLocals)
    syncToDOM(getSavesStore())
  })

  actionsEl.querySelector('.ifk-confirm-no')?.addEventListener('click', () => {
    syncToDOM(getSavesStore())
  })
}

// ─── Open / Close ─────────────────────────────────────────────────────────────

function open(): void {
  const backdrop = document.getElementById('ifk-saves-backdrop')
  if (!backdrop || !backdrop.hasAttribute('hidden')) return

  syncToDOM(loadSavesStore(_slotsCount))

  backdrop.removeAttribute('hidden')
  const trigger = document.getElementById('btn-saves') as HTMLElement | null
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

  document.getElementById('btn-saves')?.addEventListener('click', open)

  backdrop.querySelector('#ifk-saves-close')?.addEventListener('click', close)

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.hasAttribute('hidden')) close()
  })
}
