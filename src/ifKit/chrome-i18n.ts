import { u } from './i18n'
import { UI } from './ui-keys'

const TOOLBAR: Array<{ btn: string; key: (typeof UI)[keyof typeof UI] }> = [
  { btn: '#btn-undo',    key: UI.toolbarUndo },
  { btn: '#btn-redo',    key: UI.toolbarRedo },
  { btn: '#btn-saves',   key: UI.toolbarSaves },
  { btn: '#btn-settings', key: UI.toolbarSettings },
]

export function refreshToolbarI18n(): void {
  for (const { btn, key } of TOOLBAR) {
    const el = document.querySelector(`${btn} .ifk-btn-label`)
    if (el) el.textContent = u(key)
  }
}
