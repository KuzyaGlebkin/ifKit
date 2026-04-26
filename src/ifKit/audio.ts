// Audio engine — Этап 6

const CROSSFADE_MS = 1000

let _ctx: AudioContext | null = null
let _masterMusicGain: GainNode | null = null
let _masterSoundGain: GainNode | null = null

let _initMusicVolume = 0.8
let _initSoundVolume = 1.0

const _bufferCache = new Map<string, AudioBuffer>()

let _pendingMusic: string | null = null
let _currentSrc: string | null = null
let _currentSource: AudioBufferSourceNode | null = null
let _currentFadeGain: GainNode | null = null

// ── Task 1.1: Lazy AudioContext init with auto-resume ─────────────────────────

function getContext(): AudioContext {
  if (_ctx) return _ctx

  _ctx = new AudioContext()

  _masterMusicGain = _ctx.createGain()
  _masterMusicGain.gain.value = _initMusicVolume
  _masterMusicGain.connect(_ctx.destination)

  _masterSoundGain = _ctx.createGain()
  _masterSoundGain.gain.value = _initSoundVolume
  _masterSoundGain.connect(_ctx.destination)

  const resume = () => { _ctx?.resume() }
  document.addEventListener('click', resume, { once: true })
  document.addEventListener('keydown', resume, { once: true })

  return _ctx
}

// ── Task 1.3: AudioBuffer cache ───────────────────────────────────────────────

async function getBuffer(src: string): Promise<AudioBuffer> {
  const cached = _bufferCache.get(src)
  if (cached) return cached

  const ctx = getContext()
  const response = await fetch(src)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  _bufferCache.set(src, audioBuffer)
  return audioBuffer
}

// ── Tasks 1.4 & 1.5 & 1.6: Intent mechanism + resolveAudioIntent + crossfade ─

export function clearAudioIntent(): void {
  _pendingMusic = null
}

export function setAudioIntent(src: string): void {
  _pendingMusic = src
}

export async function resolveAudioIntent(): Promise<void> {
  if (_pendingMusic === _currentSrc) return

  const ctx = _pendingMusic !== null ? getContext() : _ctx

  if (_pendingMusic === null) {
    // Task 1.5: fade-out when no PlayMusic in scene
    if (_currentSource && _currentFadeGain && ctx) {
      const now = ctx.currentTime
      _currentFadeGain.gain.setValueAtTime(_currentFadeGain.gain.value, now)
      _currentFadeGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_MS / 1000)
      const oldSource = _currentSource
      const oldGain = _currentFadeGain
      setTimeout(() => {
        try { oldSource.stop() } catch { /* already stopped */ }
        oldSource.disconnect()
        oldGain.disconnect()
      }, CROSSFADE_MS)
      _currentSource = null
      _currentFadeGain = null
    }
    _currentSrc = null
    return
  }

  // Task 1.5 + 1.6: crossfade to new track
  const buffer = await getBuffer(_pendingMusic)
  const activeCtx = getContext()

  if (_currentSource && _currentFadeGain) {
    const now = activeCtx.currentTime
    _currentFadeGain.gain.setValueAtTime(_currentFadeGain.gain.value, now)
    _currentFadeGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_MS / 1000)
    const oldSource = _currentSource
    const oldGain = _currentFadeGain
    setTimeout(() => {
      try { oldSource.stop() } catch { /* already stopped */ }
      oldSource.disconnect()
      oldGain.disconnect()
    }, CROSSFADE_MS)
  }

  const fadeGain = activeCtx.createGain()
  fadeGain.gain.value = 0
  fadeGain.connect(_masterMusicGain!)

  const source = activeCtx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  source.connect(fadeGain)
  source.start()

  const now = activeCtx.currentTime
  fadeGain.gain.setValueAtTime(0, now)
  fadeGain.gain.linearRampToValueAtTime(1, now + CROSSFADE_MS / 1000)

  _currentSource = source
  _currentFadeGain = fadeGain
  _currentSrc = _pendingMusic
}

// ── Task 1.7: playSound ───────────────────────────────────────────────────────

export function playSound(src: string): void {
  getBuffer(src).then(buffer => {
    const ctx = getContext()
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = false
    source.connect(_masterSoundGain!)
    source.start()
    source.onended = () => { source.disconnect() }
  })
}

// ── Tasks 1.8 & 1.9: volume control + init ───────────────────────────────────

export function setMusicVolume(v: number): void {
  if (!_masterMusicGain) return
  _masterMusicGain.gain.value = v
}

export function setSoundVolume(v: number): void {
  if (!_masterSoundGain) return
  _masterSoundGain.gain.value = v
}

export function initAudioVolumes(musicVolume: number, soundVolume: number): void {
  _initMusicVolume = musicVolume
  _initSoundVolume = soundVolume
}
