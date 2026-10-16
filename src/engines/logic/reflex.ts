// Pure helpers for the reflex engine: micro-mode detection, judging and difficulty curves.
export type ReflexMode = 'whack' | 'bar' | 'aim' | 'react' | 'pulse' | 'hold' | 'match' | 'mash'

export function detectReflex(name: string, desc: string): ReflexMode {
  const n = name.toLowerCase()
  const s = `${n} ${desc.toLowerCase()}`
  if (/mash|ten second|clockwork heart/.test(n)) return 'mash'
  if (/whack|mole|bubble wrap|swat|rivet/.test(n)) return 'whack'
  if (/sorting|rapid sort|color switch|sushi conveyor/.test(n)) return 'match'
  if (/hold|long press|lockpick|bubble blow|stretcher|glassblower|sneeze|pole vault/.test(n)) return 'hold'
  if (/reaction|quick draw|high noon|flash|freeze|ruler|signal|slap|watering|duel/.test(n)) return 'react'
  if (/pulse|rhythm|beat|rope|new year|parry|pogo|cauldron|simon/.test(n)) return 'pulse'
  if (/aim|target|sniper|kunai|pinpoint|dart|balloon|laser tag|catch the fly|goalie|unplug|sushi grab|wagon|bubble float/.test(n)) return 'aim'
  if (/stop|bar\b|timing|forge|smith|bell|bat\b|cricket|bottle|joust|anchor|mantis|perfect|elevator|wok|microwave|fishing|bobbing|defuse|wheel|dial|twist|needle|pick/.test(n)) return 'bar'
  if (/whack|mole|hammer|bubble wrap|pop every/.test(s)) return 'whack'
  if (/reaction|green|freeze|ruler|flash|light/.test(s)) return 'react'
  if (/pulse|rhythm|beat|rope|simon|countdown/.test(s)) return 'pulse'
  if (/aim|shot|target|sniper|kunai|pinpoint|dart/.test(s)) return 'aim'
  if (/stop|bar|timing|lock|forge|dial|perfect|elevator|needle|pick/.test(s)) return 'bar'
  return 'pulse'
}

export type Judge = 'perfect' | 'good' | 'miss'
/** Judge a timing error (seconds) against windows that tighten with the round. */
export function judge(err: number, round: number, diff: 0 | 1 | 2): Judge {
  const k = [1.3, 1, 0.8][diff] * Math.max(0.55, 1 - round * 0.03)
  const a = Math.abs(err)
  return a < 0.055 * k ? 'perfect' : a < 0.12 * k ? 'good' : 'miss'
}

/** Zone width (fraction of the bar) for a round. */
export const zoneWidth = (round: number, diff: 0 | 1 | 2) => Math.max(0.05, [0.3, 0.22, 0.17][diff] - round * 0.014)

/** Mole / target lifetime in seconds for a round. */
export const lifetime = (round: number, diff: 0 | 1 | 2) => Math.max(0.55, [1.7, 1.4, 1.15][diff] - round * 0.045)

/** Points for a reaction time in ms. */
export const reactionPoints = (ms: number) => Math.max(0, Math.round((900 - ms) / 6))
