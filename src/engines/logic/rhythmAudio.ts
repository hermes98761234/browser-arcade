// Web Audio voices for the rhythm engine (scheduled on the AudioContext clock).
import { audio, isMuted, tone } from '../sound'

let noiseBuf: AudioBuffer | null = null
function noiseHit(a: AudioContext, t: number, dur: number, vol: number, type: BiquadFilterType, freq: number, q = 0.7) {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = a.createBufferSource()
  s.buffer = noiseBuf
  const f = a.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = a.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f).connect(g).connect(a.destination)
  s.start(t, Math.random() * 0.5)
  s.stop(t + dur + 0.02)
}

const midiFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

function ctx(): { a: AudioContext; w: (t: number) => number } | null {
  if (isMuted()) return null
  const a = audio()
  if (!a || a.state !== 'running') return null
  return { a, w: (t) => Math.max(0, t - a.currentTime) }
}

export function kick(t: number) {
  const c = ctx()
  if (!c) return
  tone(165, 0.22, 'sine', 0.5, -120, c.w(t))
  tone(55, 0.2, 'sine', 0.28, 0, c.w(t))
}
export function snare(t: number) {
  const c = ctx()
  if (!c) return
  noiseHit(c.a, t, 0.16, 0.28, 'highpass', 1500)
  tone(200, 0.09, 'triangle', 0.15, -60, c.w(t))
}
export function hat(t: number, open = false) {
  const c = ctx()
  if (!c) return
  noiseHit(c.a, t, open ? 0.25 : 0.04, open ? 0.12 : 0.1, 'highpass', 7500)
}
export function bass(midi: number, t: number, len: number) {
  const c = ctx()
  if (!c) return
  const f = midiFreq(midi)
  tone(f, len * 1.8, 'triangle', 0.24, 0, c.w(t))
  tone(f * 2, len, 'sawtooth', 0.03, 0, c.w(t))
}
export function lead(midi: number, t: number, len: number, style: 'square' | 'soft') {
  const c = ctx()
  if (!c) return
  const f = midiFreq(midi + 12)
  if (style === 'square') {
    tone(f, len * 2.4, 'square', 0.05, 0, c.w(t))
    tone(f * 2, len * 1.2, 'triangle', 0.03, 0, c.w(t))
  } else {
    tone(f, len * 3, 'triangle', 0.1, 0, c.w(t))
    tone(f * 2.01, len * 1.5, 'sine', 0.04, 0, c.w(t))
  }
}
export function pad(midi: number, t: number, len: number) {
  const c = ctx()
  if (!c) return
  for (const iv of [0, 7, 12]) tone(midiFreq(midi + 12 + iv), len, 'sine', 0.035, 0, c.w(t))
}
export function tick(t: number, high: boolean) {
  const c = ctx()
  if (!c) return
  tone(high ? 1568 : 1046, 0.09, 'square', 0.06, 0, c.w(t))
}
/** Short sparkle on a successful hit. */
export function hitFx(lane: number, perfect: boolean) {
  if (isMuted()) return
  tone(1100 + lane * 160, 0.07, 'triangle', perfect ? 0.07 : 0.045, 0)
  if (perfect) tone(2200 + lane * 160, 0.05, 'sine', 0.03, 0)
}
export function missFx() {
  if (isMuted()) return
  tone(120, 0.14, 'sawtooth', 0.06, -50)
}
