// Tiny Web Audio synth for game sound effects. No audio files.
import type { Sfx } from './kit'

let ctx: AudioContext | null = null
let muted = false
try { muted = localStorage.getItem('arcade:muted') === '1' } catch { /* private mode */ }

/** Shared AudioContext (created on first use, after a user gesture). */
export function audio(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export const isMuted = () => muted
export function setMuted(m: boolean) {
  muted = m
  try { localStorage.setItem('arcade:muted', m ? '1' : '0') } catch { /* ignore */ }
}

/** Play a single tone. Engines that make music (rhythm, synth) can use this directly. */
export function tone(freq: number, dur = 0.12, type: OscillatorType = 'square', vol = 0.12, slide = 0, when = 0) {
  if (muted) return
  const a = audio()
  if (!a) return
  const t = a.currentTime + when
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise(dur = 0.25, vol = 0.2) {
  if (muted) return
  const a = audio()
  if (!a) return
  const len = Math.floor(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const s = a.createBufferSource()
  const g = a.createGain()
  g.gain.value = vol
  s.buffer = buf
  s.connect(g).connect(a.destination)
  s.start()
}

let lastAt = 0
let lastName = ''
export function sfx(name: Sfx) {
  // Throttle identical effects so rapid-fire games stay pleasant.
  const now = performance.now()
  if (name === lastName && now - lastAt < 45) return
  lastAt = now
  lastName = name
  switch (name) {
    case 'click': return tone(660, 0.05, 'square', 0.06)
    case 'move': return tone(330, 0.04, 'triangle', 0.06)
    case 'point': tone(880, 0.07, 'square', 0.08); return tone(1320, 0.09, 'square', 0.07, 0, 0.06)
    case 'jump': return tone(300, 0.15, 'square', 0.08, 500)
    case 'shoot': return tone(900, 0.08, 'sawtooth', 0.05, -600)
    case 'hit': return tone(160, 0.14, 'sawtooth', 0.12, -80)
    case 'boom': return noise(0.35, 0.25)
    case 'power': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.08, 'square', 0.07, 0, i * 0.06)); return
    case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 'triangle', 0.12, 0, i * 0.1)); return
    case 'lose': [392, 330, 262, 196].forEach((f, i) => tone(f, 0.2, 'triangle', 0.12, 0, i * 0.13)); return
  }
}
