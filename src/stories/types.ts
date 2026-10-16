// Data format for hand-written interactive stories (engine: src/engines/games/story.ts).
// One file per story: src/stories/<catalog id>.ts with `export default story satisfies Story`.

export interface StatDef {
  label: string
  emoji: string
  start: number
  /** Optional bounds (default 0..10). Reaching min may trigger `onMin`. */
  min?: number
  max?: number
  /** Node to jump to when the stat drops to min (e.g. sanity runs out). */
  onMin?: string
}

export interface Condition {
  /** Stat checks: value must be >= min and/or <= max. */
  stat?: string
  min?: number
  max?: number
  /** Requires (or with `not`, forbids) an inventory item / story flag. */
  has?: string
  not?: string
}

export interface Choice {
  text: string
  to: string
  /** Stat changes, e.g. { courage: +1, sanity: -2 }. */
  effects?: Record<string, number>
  /** Items / flags gained or lost (flags are just items that are not shown when they start with '_'). */
  give?: string[]
  take?: string[]
  /** Choice is shown only when all conditions hold. */
  if?: Condition[]
  /** Show the choice greyed-out with this hint instead of hiding it when conditions fail. */
  lockedHint?: string
}

export interface StoryNode {
  /** Scene illustration: 1–4 emoji composed on a themed backdrop, e.g. '🌊🗼🌙'. Inherits the previous scene if omitted. */
  scene?: string
  /** Who speaks / location caption shown above the text (optional). */
  caption?: string
  /** Paragraphs separated by blank lines. `*italic*` and `**bold**` are supported. */
  text: string
  choices?: Choice[]
  /** Terminal node. */
  ending?: { title: string; kind: 'good' | 'bad' | 'neutral' | 'secret'; score: number }
  /** Auto-applied when the node is entered. */
  effects?: Record<string, number>
  give?: string[]
  take?: string[]
}

export interface Story {
  id: number
  title: string
  /** One-paragraph blurb on the title card. */
  blurb: string
  /** Item display names: id → 'emoji Name'. Items starting with '_' are hidden flags. */
  items?: Record<string, string>
  stats: Record<string, StatDef>
  start: string
  nodes: Record<string, StoryNode>
}
