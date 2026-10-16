import { N } from '../i18n'

/** Visual style of a game: palette + emoji sprite set. Engines draw with these. */
export interface Theme {
  id: ThemeId
  name: string
  /** Background gradient top / bottom. */
  bg: string
  bg2: string
  /** Main foreground, accent, secondary accent, danger and "good" colours. */
  fg: string
  accent: string
  accent2: string
  danger: string
  good: string
  /** Player character / avatar. */
  hero: string
  /** Enemies / hazards. */
  foes: string[]
  /** Collectibles / tile symbols (at least 6). */
  items: string[]
  /** Solid colours for bricks, tiles, blocks (at least 6). */
  blocks: string[]
}

export type ThemeId =
  | 'neon' | 'retro' | 'space' | 'ocean' | 'fantasy' | 'pirate' | 'western' | 'cyberpunk' | 'wasteland'
  | 'horror' | 'myth' | 'ninja' | 'dino' | 'robot' | 'jungle' | 'arctic' | 'steampunk' | 'hero'
  | 'halloween' | 'holiday' | 'candy' | 'insects' | 'nature' | 'sports' | 'school' | 'cozy' | 'gems' | 'zen'

const T = (id: ThemeId, name: string, c: string[], hero: string, foes: string, items: string, blocks: string): Theme => ({
  id, name, bg: c[0], bg2: c[1], fg: c[2], accent: c[3], accent2: c[4], danger: c[5], good: c[6],
  hero, foes: splitEmoji(foes), items: splitEmoji(items), blocks: blocks.split(' '),
})

/** Split a string of emoji into grapheme clusters. */
function splitEmoji(s: string): string[] {
  const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
  return [...seg.segment(s)].map((x) => x.segment).filter((x) => x.trim())
}

const list: Theme[] = [
  T('neon', N('Neon arcade'), ['#0b0420', '#1a0b3b', '#f5f3ff', '#22d3ee', '#e879f9', '#f43f5e', '#a3e635'], '🟢', '👾👻💀', '💎⭐🍒🔷🔶💠🍀', '#22d3ee #e879f9 #a3e635 #facc15 #fb7185 #818cf8 #34d399'),
  T('retro', N('Retro 8-bit'), ['#0f380f', '#306230', '#e0f8d0', '#9bbc0f', '#8bac0f', '#d04648', '#e0f8d0'], '🕹️', '👾👹🤖', '🍄⭐🪙🍒🔑💾🎈', '#9bbc0f #8bac0f #306230 #e0f8d0 #d04648 #597dce #d27d2c'),
  T('space', N('Space & sci-fi'), ['#02030f', '#0b1a3a', '#e2e8f0', '#60a5fa', '#c084fc', '#f87171', '#4ade80'], '🚀', '👽🛸☄️👾', '⭐🪐🌟💫🛰️🌍🌙', '#60a5fa #c084fc #f472b6 #facc15 #4ade80 #f87171 #94a3b8'),
  T('ocean', N('Underwater'), ['#012a4a', '#013a63', '#e0fbfc', '#48cae4', '#90e0ef', '#ff6b6b', '#80ffdb'], '🐠', '🦈🐙🦑🪼', '🐚🦀🐡🐟🦐🫧🐬', '#48cae4 #00b4d8 #90e0ef #ffd166 #ff6b6b #80ffdb #b388eb'),
  T('fantasy', N('Medieval fantasy'), ['#1b1035', '#3b1f5c', '#fdf4ff', '#fbbf24', '#a78bfa', '#ef4444', '#34d399'], '🧙', '🐉👹🧌💀', '💎🗡️🛡️🧪👑📜🔮', '#a78bfa #fbbf24 #34d399 #f472b6 #60a5fa #ef4444 #f97316'),
  T('pirate', N('Pirates & seas'), ['#0c2a3b', '#1d4e5f', '#fef3c7', '#f59e0b', '#38bdf8', '#dc2626', '#22c55e'], '🏴‍☠️', '🦈🐙💣🦜', '🪙💰🗝️🧭🍾🦜⚓', '#f59e0b #38bdf8 #a16207 #fde68a #dc2626 #22c55e #64748b'),
  T('western', N('Wild West'), ['#3b1d0c', '#9a3412', '#fff7ed', '#f59e0b', '#fdba74', '#b91c1c', '#65a30d'], '🤠', '🐍🦂🌵🐂', '💰🪙🐎⭐🥃🔫🌵', '#f59e0b #fdba74 #c2410c #78350f #65a30d #b91c1c #fde68a'),
  T('cyberpunk', N('Cyberpunk'), ['#090014', '#2a0040', '#fdf2ff', '#ff2bd6', '#00f0ff', '#ff3b3b', '#c6ff00'], '🦾', '🤖👁️🛸💀', '💾🔋💿📡🧬💠🔌', '#ff2bd6 #00f0ff #c6ff00 #ffe600 #8b5cf6 #ff3b3b #1fffa0'),
  T('wasteland', N('Post-apocalyptic'), ['#1c1917', '#57391f', '#fef3c7', '#eab308', '#a8a29e', '#dc2626', '#84cc16'], '🧑‍🚒', '🧟☢️🦂🐀', '🥫💧🔋⛽🩹🔧📻', '#eab308 #a8a29e #78716c #84cc16 #dc2626 #f97316 #57534e'),
  T('horror', N('Spooky & horror'), ['#050505', '#1f0a0a', '#e7e5e4', '#dc2626', '#a3a3a3', '#ef4444', '#65a30d'], '🕯️', '👻🧟🦇💀', '🔑🕯️📜🔮🗝️🩸🕸️', '#7f1d1d #44403c #a3a3a3 #dc2626 #65a30d #57534e #e7e5e4'),
  T('myth', N('Ancient myths'), ['#1e1b4b', '#7c2d12', '#fefce8', '#facc15', '#38bdf8', '#dc2626', '#4ade80'], '🏛️', '🐍🦅🐂🔥', '⚡🏺🪙🌿🔱☀️🦉', '#facc15 #38bdf8 #f97316 #fefce8 #4ade80 #dc2626 #a78bfa'),
  T('ninja', N('Ninja & samurai'), ['#0a0a0a', '#3f0d12', '#fafafa', '#ef4444', '#fca5a5', '#f97316', '#22c55e'], '🥷', '👺🐉🗡️👹', '🍣🏮🎋🌸⭐🍙🪭', '#ef4444 #fafafa #fca5a5 #a3a3a3 #22c55e #f97316 #1f2937'),
  T('dino', N('Dinosaurs'), ['#14532d', '#713f12', '#f7fee7', '#84cc16', '#f59e0b', '#dc2626', '#22d3ee'], '🦖', '🦕🌋☄️🦴', '🥚🦴🌿🍖🪨🦖🌴', '#84cc16 #f59e0b #a16207 #22c55e #dc2626 #22d3ee #78350f'),
  T('robot', N('Robots & mechs'), ['#0f172a', '#334155', '#f1f5f9', '#38bdf8', '#94a3b8', '#ef4444', '#22c55e'], '🤖', '👾🛸⚙️💣', '🔩⚙️🔋🔧💡🛠️📡', '#38bdf8 #94a3b8 #f59e0b #22c55e #ef4444 #e2e8f0 #6366f1'),
  T('jungle', N('Jungle & safari'), ['#052e16', '#166534', '#f0fdf4', '#facc15', '#4ade80', '#ea580c', '#a3e635'], '🐒', '🐍🐅🐊🦂', '🍌🥥🦜🌺🍍🐘🦒', '#4ade80 #facc15 #ea580c #a3e635 #16a34a #f472b6 #92400e'),
  T('arctic', N('Arctic & winter'), ['#0c4a6e', '#bae6fd', '#082f49', '#0ea5e9', '#f0f9ff', '#e11d48', '#10b981'], '🐧', '❄️🐻‍❄️🌨️🦭', '🐟❄️⛄🧊🎿🐋🧣', '#0ea5e9 #bae6fd #f0f9ff #7dd3fc #e11d48 #10b981 #6366f1'),
  T('steampunk', N('Steampunk'), ['#1c1209', '#5c3d1e', '#fdf6e3', '#d4a24c', '#b87333', '#a33b20', '#6b8e23'], '🎩', '⚙️🦾💥🐙', '⚙️🕰️🔩🎈⚗️🔭🗝️', '#d4a24c #b87333 #8c6239 #fdf6e3 #6b8e23 #a33b20 #5c4033'),
  T('hero', N('Superheroes'), ['#1e1b4b', '#4c1d95', '#fff7ed', '#facc15', '#ef4444', '#f97316', '#22c55e'], '🦸', '🦹💥🤖☄️', '⭐⚡💎🛡️🏆💫🔋', '#facc15 #ef4444 #3b82f6 #22c55e #f97316 #a855f7 #f8fafc'),
  T('halloween', N('Halloween'), ['#1a0b2e', '#431407', '#fff7ed', '#f97316', '#a855f7', '#dc2626', '#84cc16'], '🎃', '👻🦇🕷️🧟', '🍬🍭🎃🕯️🔮🍫🧹', '#f97316 #a855f7 #84cc16 #1f2937 #facc15 #dc2626 #fde68a'),
  T('holiday', N('Winter holidays'), ['#052e16', '#7f1d1d', '#fefce8', '#ef4444', '#22c55e', '#b91c1c', '#facc15'], '🎅', '❄️⛄🦌🌨️', '🎁🎄⭐🔔🍪🕯️🧦', '#ef4444 #22c55e #facc15 #f8fafc #3b82f6 #b91c1c #a855f7'),
  T('candy', N('Candy & food'), ['#fdf2f8', '#fbcfe8', '#831843', '#ec4899', '#8b5cf6', '#ef4444', '#10b981'], '🧁', '🌶️🧅🥦🪳', '🍬🍭🍩🍓🍰🍫🍪', '#ec4899 #8b5cf6 #f59e0b #10b981 #3b82f6 #ef4444 #fde047'),
  T('insects', N('Insects & tiny worlds'), ['#1a2e05', '#3f6212', '#f7fee7', '#facc15', '#84cc16', '#dc2626', '#22d3ee'], '🐞', '🕷️🦗🦂🐜', '🌼🍯🍃🌸🍄💧🌻', '#facc15 #84cc16 #dc2626 #22d3ee #a16207 #f472b6 #65a30d'),
  T('nature', N('Nature'), ['#064e3b', '#065f46', '#ecfdf5', '#34d399', '#fbbf24', '#ef4444', '#a3e635'], '🦊', '🐺🐻🦅🐍', '🍎🌻🍄🌰🦋🍇🌿', '#34d399 #fbbf24 #f87171 #60a5fa #a3e635 #c084fc #fb923c'),
  T('sports', N('Sports'), ['#14532d', '#15803d', '#f0fdf4', '#facc15', '#f8fafc', '#ef4444', '#38bdf8'], '⚽', '🥅🧱🏀🎾', '⚽🏀🏈⚾🎾🏐🏆', '#facc15 #f8fafc #ef4444 #38bdf8 #22c55e #f97316 #a855f7'),
  T('school', N('Classroom'), ['#1e3a8a', '#1e40af', '#eff6ff', '#facc15', '#38bdf8', '#ef4444', '#22c55e'], '🎓', '❌📛🐛🌀', '📚✏️🧮🔬🌍💡📐', '#facc15 #38bdf8 #ef4444 #22c55e #a855f7 #f97316 #f8fafc'),
  T('cozy', N('Cozy & relaxing'), ['#fff7ed', '#fde2c8', '#431407', '#ea8c55', '#81b29a', '#e07a5f', '#3d9970'], '🐱', '🌧️🐝🍂🕸️', '☕🌷🧶🍵🪴🍰📖', '#ea8c55 #81b29a #f2cc8f #e07a5f #3d405b #a8dadc #ffb4a2'),
  T('gems', N('Jewels'), ['#1e1033', '#3b0764', '#faf5ff', '#e879f9', '#22d3ee', '#f43f5e', '#4ade80'], '💎', '💣🪨⛓️🔥', '💎🔷🔶💠🟣🟢❤️', '#e879f9 #22d3ee #f43f5e #4ade80 #facc15 #60a5fa #fb923c'),
  T('zen', N('Minimal zen'), ['#f5f5f4', '#e7e5e4', '#1c1917', '#0f766e', '#a16207', '#be123c', '#15803d'], '⚪', '⚫🔺⬛🔻', '🔵🟢🟡🟠🔴🟣⚪', '#0f766e #a16207 #be123c #15803d #1d4ed8 #7c3aed #57534e'),
]

export const THEMES = Object.fromEntries(list.map((t) => [t.id, t])) as Record<ThemeId, Theme>
export const THEME_IDS = list.map((t) => t.id)
