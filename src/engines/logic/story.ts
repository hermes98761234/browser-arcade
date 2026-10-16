// Pure rules of the interactive-story engine: conditions, effects, stat-driven jumps. Tested in story.test.ts.
import type { Choice, Condition, Story } from '../../stories/types'

export interface StoryState {
  node: string
  stats: Record<string, number>
  /** Inventory items and hidden flags. */
  inv: string[]
  visited: string[]
  steps: number
}

export interface Delta {
  stats: Record<string, number>
  gained: string[]
  lost: string[]
}

export const statBounds = (story: Story, id: string): [number, number] => {
  const d = story.stats[id]
  return [d?.min ?? 0, d?.max ?? 10]
}

export function initialState(story: Story): StoryState {
  const stats: Record<string, number> = {}
  for (const [k, d] of Object.entries(story.stats)) stats[k] = d.start
  return { node: story.start, stats, inv: [], visited: [], steps: 0 }
}

export function condOk(s: StoryState, c: Condition): boolean {
  if (c.stat !== undefined) {
    const v = s.stats[c.stat] ?? 0
    if (c.min !== undefined && v < c.min) return false
    if (c.max !== undefined && v > c.max) return false
  }
  if (c.has !== undefined && !s.inv.includes(c.has)) return false
  if (c.not !== undefined && s.inv.includes(c.not)) return false
  return true
}

export type ChoiceView = 'enabled' | 'locked' | 'hidden'

export function choiceView(s: StoryState, ch: Choice): ChoiceView {
  if (!ch.if || ch.if.every((c) => condOk(s, c))) return 'enabled'
  return ch.lockedHint ? 'locked' : 'hidden'
}

function addDelta(d: Delta, s: StoryState, story: Story, eff?: Record<string, number>, give?: string[], take?: string[]) {
  for (const [k, v] of Object.entries(eff ?? {})) {
    if (!(k in story.stats)) continue
    const [lo, hi] = statBounds(story, k)
    const before = s.stats[k] ?? 0
    const after = Math.max(lo, Math.min(hi, before + v))
    s.stats[k] = after
    if (after !== before) d.stats[k] = (d.stats[k] ?? 0) + (after - before)
  }
  for (const g of give ?? []) {
    if (!s.inv.includes(g)) {
      s.inv.push(g)
      d.gained.push(g)
    }
  }
  for (const t of take ?? []) {
    const i = s.inv.indexOf(t)
    if (i >= 0) {
      s.inv.splice(i, 1)
      d.lost.push(t)
    }
  }
}

/** Apply a choice's own effects (before moving on). */
export function applyChoice(story: Story, s: StoryState, ch: Choice, d: Delta) {
  addDelta(d, s, story, ch.effects, ch.give, ch.take)
}

/** Enter a node: apply its effects and follow `onMin` jumps. Returns the node id finally shown. */
export function enterNode(story: Story, s: StoryState, id: string, d: Delta, depth = 0): string {
  const n = story.nodes[id]
  s.node = id
  s.steps++
  if (!s.visited.includes(id)) s.visited.push(id)
  if (!n) return id
  addDelta(d, s, story, n.effects, n.give, n.take)
  if (!n.ending && depth < 4) {
    for (const [k, def] of Object.entries(story.stats)) {
      if (def.onMin && id !== def.onMin && story.nodes[def.onMin] && (s.stats[k] ?? 0) <= (def.min ?? 0)) return enterNode(story, s, def.onMin, d, depth + 1)
    }
  }
  return id
}

export const emptyDelta = (): Delta => ({ stats: {}, gained: [], lost: [] })

export const endingIds = (story: Story) => Object.entries(story.nodes).filter(([, n]) => n.ending).map(([id]) => id)

/** `*italic*` / `**bold**` → segments. */
export function parseInline(s: string): { t: string; k: 'p' | 'i' | 'b' }[] {
  const out: { t: string; k: 'p' | 'i' | 'b' }[] = []
  for (const part of s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) out.push({ t: part.slice(2, -2), k: 'b' })
    else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) out.push({ t: part.slice(1, -1), k: 'i' })
    else out.push({ t: part, k: 'p' })
  }
  return out
}
