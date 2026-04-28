import { createElement, Plus, Save, Settings } from 'lucide'
import type { IconNode } from 'lucide'
import { stopMusicPlaybackForMenu } from './audio'
import { u } from './i18n'
import { UI } from './ui-keys'
import { persistAutoFromSnapshot } from './saves'
import {
  runGameLoop,
  getCurrentSnapshot,
  resetGameToInitial,
  setSessionMenuExit,
} from './scenes'
import { resetSeenContent } from './seen-content'
import { openSavesModal } from './saves-modal'
import { openSettingsModal } from './settings-modal'

const LUCIDE_ICON_ATTRS = {
  class:     'ifk-lucide',
  width:     18,
  height:    18,
  'stroke-width': 2,
} as const

function mountMenuIcon(slot: Element | null, node: IconNode): void {
  if (!slot) return
  slot.replaceChildren(createElement(node, LUCIDE_ICON_ATTRS))
}

let _playing = false
let _root: HTMLElement | null = null
let _firstKey = ''
let _historySize = 20
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _initialState: any = null

function applyShellVisibility(menuVisible: boolean): void {
  document.documentElement.classList.toggle('ifk-session-menu-active', menuVisible)
  const nav = document.getElementById('controls')
  const content = document.getElementById('content')
  if (nav) {
    nav.toggleAttribute('hidden', menuVisible)
    nav.setAttribute('aria-hidden', menuVisible ? 'true' : 'false')
  }
  if (content) {
    content.toggleAttribute('hidden', menuVisible)
    content.setAttribute('aria-hidden', menuVisible ? 'true' : 'false')
  }
  if (_root) {
    _root.toggleAttribute('hidden', !menuVisible)
    if (menuVisible) {
      queueMicrotask(() =>
        (_root!.querySelector<HTMLElement>('#ifk-session-menu-new')?.focus()))
    }
  }
}

function leaveSessionMenuToPlaying(): void {
  refreshSessionMainMenuChrome()
  applyShellVisibility(false)
  _playing = true
}

function showSessionMenu(): void {
  refreshSessionMainMenuChrome()
  applyShellVisibility(true)
  _playing = false
}

export function refreshSessionMainMenuChrome(): void {
  document.getElementById('btn-brand')?.setAttribute('aria-label', u(UI.sessionMenuBrand))
  if (!_root) return

  _root.querySelector('#ifk-session-menu-brand-slot')?.setAttribute('aria-label', u(UI.sessionMenuBrand))
  _root.querySelector('#ifk-session-menu-new')?.setAttribute('aria-label', u(UI.sessionNewGame))
  _root.querySelector('#ifk-session-menu-new .ifk-btn-label')!.textContent = u(UI.sessionNewGame)
  const loadBtn = _root.querySelector('#ifk-session-menu-load')
  loadBtn?.setAttribute('aria-label', u(UI.sessionLoadGame))
  const loadLabel = loadBtn?.querySelector('.ifk-btn-label')
  if (loadLabel) loadLabel.textContent = u(UI.sessionLoadGame)
  _root.querySelector('#ifk-session-menu-settings')?.setAttribute('aria-label', u(UI.toolbarSettings))
  _root.querySelector('#ifk-session-menu-settings .ifk-btn-label')!.textContent = u(UI.toolbarSettings)
}

export function initSessionMainMenu(options: {
  title:        string
  description?: string
  firstKey:     string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState: any
  historySize:  number
}): void {
  _firstKey     = options.firstKey
  _initialState = options.initialState
  _historySize  = options.historySize

  const existing = document.getElementById('ifk-session-menu-root')
  if (!existing) {
    throw new Error('[ifKit] Элемент #ifk-session-menu-root не найден в index.html')
  }
  _root = existing as HTMLElement

  _root.innerHTML = `
    <div class="ifk-session-menu-inner">
      <div id="ifk-session-menu-brand-slot" class="ifk-session-menu-brand-wrap"></div>
      <p id="ifk-session-menu-title-text" class="ifk-session-menu-title"></p>
      <p id="ifk-session-menu-description" class="ifk-session-menu-description"></p>
      <div class="ifk-session-menu-actions">
        <button type="button" id="ifk-session-menu-new" class="ifk-btn-ghost">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label"></span>
        </button>
        <button type="button" id="ifk-session-menu-load" class="ifk-btn-ghost">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label"></span>
        </button>
        <button type="button" id="ifk-session-menu-settings" class="ifk-btn-ghost">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label"></span>
        </button>
      </div>
    </div>
  `.replace(/\n\s+/g, '\n')

  const titleEl = document.getElementById('ifk-session-menu-title-text')
  if (titleEl) titleEl.textContent = options.title
  const descEl = document.getElementById('ifk-session-menu-description')
  if (descEl) {
    const d = options.description ?? ''
    descEl.textContent = d
    if (!d.trim()) descEl.setAttribute('hidden', '')
  }

  const brandSlot = document.getElementById('ifk-session-menu-brand-slot')
  const svgSource = document.querySelector('#btn-brand .ifk-brand-logo-svg')
  if (brandSlot && svgSource) {
    const wrap        = document.createElement('span')
    wrap.className   = 'ifk-brand-logo ifk-session-menu-brand-logo'
    wrap.setAttribute('aria-hidden', 'true')
    wrap.appendChild(svgSource.cloneNode(true))
    brandSlot.appendChild(wrap)
  }

  mountMenuIcon(document.querySelector('#ifk-session-menu-new .ifk-btn-icon'), Plus)
  mountMenuIcon(document.querySelector('#ifk-session-menu-load .ifk-btn-icon'), Save)
  mountMenuIcon(document.querySelector('#ifk-session-menu-settings .ifk-btn-icon'), Settings)

  document.getElementById('ifk-session-menu-new')?.addEventListener('click', () => {
    resetSeenContent()
    resetGameToInitial(_initialState, _historySize)
    leaveSessionMenuToPlaying()
    void runGameLoop(_firstKey)
  })

  document.getElementById('ifk-session-menu-load')?.addEventListener('click', () => {
    openSavesModal({
      mode: 'load-only',
      focusReturn: document.getElementById('ifk-session-menu-load') as HTMLElement,
    })
  })

  document.getElementById('ifk-session-menu-settings')?.addEventListener('click', () => {
    openSettingsModal(document.getElementById('ifk-session-menu-settings') as HTMLElement)
  })

  const brandEl = document.getElementById('btn-brand')
  const onBrandActivateToMenu = (e: Event) => {
    if (!_playing) return
    e.preventDefault()
    persistAutoFromSnapshot(getCurrentSnapshot())
    void stopMusicPlaybackForMenu().then(() => showSessionMenu())
  }
  brandEl?.addEventListener('click', onBrandActivateToMenu)
  brandEl?.addEventListener('keydown', (e) => {
    if (e.key !== ' ') return
    onBrandActivateToMenu(e)
  })

  setSessionMenuExit(() => {
    if (!document.documentElement.classList.contains('ifk-session-menu-active')) return
    leaveSessionMenuToPlaying()
  })

  showSessionMenu()
}
