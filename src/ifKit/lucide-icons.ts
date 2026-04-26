import {
  createElement,
  Undo,
  Redo,
  Save,
  Settings,
  ArrowUpFromLine,
  ArrowDownToLine,
  Trash,
} from 'lucide'
import type { IconNode } from 'lucide'

const lucideAttrs = {
  class: 'ifk-lucide',
  width: 18,
  height: 18,
  'stroke-width': 2,
}

function mountIntoIconSlot(slot: Element, node: IconNode): void {
  slot.replaceChildren(createElement(node, lucideAttrs))
}

/** SVG icons in `#controls` (expects `.ifk-btn-icon` in each button). */
export function initToolbarLucideIcons(): void {
  const pairs: [string, IconNode][] = [
    ['btn-undo', Undo],
    ['btn-redo', Redo],
    ['btn-saves', Save],
    ['btn-settings', Settings],
  ]
  for (const [id, node] of pairs) {
    const slot = document.querySelector(`#${id} .ifk-btn-icon`)
    if (slot) mountIntoIconSlot(slot, node)
  }
}

/** Icons for load / save / delete in saves modal body (after `innerHTML`). */
export function mountSavesSlotLucideIcons(container: HTMLElement): void {
  const specs: [string, IconNode][] = [
    ['.ifk-slot-load-btn', ArrowUpFromLine],
    ['.ifk-slot-save-btn', ArrowDownToLine],
    ['.ifk-slot-delete-btn', Trash],
  ]
  for (const [sel, node] of specs) {
    container.querySelectorAll(sel).forEach((slotBtn) => {
      const iconSlot = slotBtn.querySelector('.ifk-btn-icon')
      if (iconSlot) mountIntoIconSlot(iconSlot, node)
    })
  }
}
