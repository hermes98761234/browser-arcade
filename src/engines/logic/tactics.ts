// Pure tactics logic: unit classes, terrain generation, movement ranges, creature types and damage.
import type { Rng } from '../kit'

export type Cls = 'warrior' | 'archer' | 'healer' | 'mage' | 'knight' | 'rogue'
export interface ClsDef { hp: number; atk: number; move: number; rmin: number; rmax: number; icon: string; label: string; cost: number; cd: number }
export const CLS: Record<Cls, ClsDef> = {
  warrior: { hp: 34, atk: 9, move: 3, rmin: 1, rmax: 1, icon: '⚔️', label: 'Warrior', cost: 3, cd: 1 },
  knight: { hp: 48, atk: 7, move: 2, rmin: 1, rmax: 1, icon: '🛡️', label: 'Knight', cost: 4, cd: 1.1 },
  archer: { hp: 20, atk: 8, move: 3, rmin: 2, rmax: 3, icon: '🏹', label: 'Archer', cost: 3, cd: 1 },
  mage: { hp: 18, atk: 10, move: 3, rmin: 2, rmax: 3, icon: '✨', label: 'Mage', cost: 5, cd: 1.3 },
  healer: { hp: 22, atk: 4, move: 3, rmin: 1, rmax: 3, icon: '✚', label: 'Healer', cost: 4, cd: 1.1 },
  rogue: { hp: 18, atk: 11, move: 4, rmin: 1, rmax: 1, icon: '🗡️', label: 'Rogue', cost: 4, cd: 0.8 },
}
export const CLS_LIST = Object.keys(CLS) as Cls[]

/** 0 grass, 1 forest (cover, move cost 2), 2 water (blocked), 3 rock (blocked) */
export type Terrain = 0 | 1 | 2 | 3
export const blockedT = (t: number) => t === 2 || t === 3

export function genTerrain(rng: Rng, cols: number, rows: number, zone: number): Terrain[] {
  const t: Terrain[] = Array(cols * rows).fill(0)
  const axisLong = cols >= rows
  const long = axisLong ? cols : rows
  const inSpawn = (c: number, r: number) => {
    const a = axisLong ? c : r
    return a < zone || a >= long - zone
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (inSpawn(c, r)) { if (rng.chance(0.12)) t[r * cols + c] = 1; continue }
    const v = rng()
    t[r * cols + c] = v < 0.1 ? 2 : v < 0.2 ? 3 : v < 0.38 ? 1 : 0
  }
  // guarantee a walkable corridor between the two spawn zones
  const start = axisLong ? [0, Math.floor(rows / 2)] : [Math.floor(cols / 2), 0]
  const goal = axisLong ? [cols - 1, Math.floor(rows / 2)] : [Math.floor(cols / 2), rows - 1]
  if (!connected(t, cols, rows, start[0], start[1], goal[0], goal[1])) {
    let [x, y] = start
    while (x !== goal[0] || y !== goal[1]) {
      t[y * cols + x] = 0
      if (axisLong) x++; else y++
    }
    t[goal[1] * cols + goal[0]] = 0
  }
  return t
}

export function connected(t: Terrain[], cols: number, rows: number, x0: number, y0: number, x1: number, y1: number): boolean {
  const seen = new Set<number>([y0 * cols + x0])
  const q = [[x0, y0]]
  while (q.length) {
    const [x, y] = q.pop()!
    if (x === x1 && y === y1) return true
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || blockedT(t[ny * cols + nx]) || seen.has(ny * cols + nx)) continue
      seen.add(ny * cols + nx)
      q.push([nx, ny])
    }
  }
  return false
}

/** Dijkstra move range: returns cost map index -> cost for tiles reachable with `move` points. Occupied tiles can't be entered. */
export function reach(t: Terrain[], cols: number, rows: number, from: number, move: number, occupied: Set<number>): Map<number, number> {
  const best = new Map<number, number>([[from, 0]])
  const open = [from]
  while (open.length) {
    open.sort((a, b) => best.get(a)! - best.get(b)!)
    const cur = open.shift()!
    const cc = best.get(cur)!
    const x = cur % cols
    const y = Math.floor(cur / cols)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
      const i = ny * cols + nx
      if (blockedT(t[i]) || occupied.has(i)) continue
      const nc = cc + (t[i] === 1 ? 2 : 1)
      if (nc > move || nc >= (best.get(i) ?? 1e9)) continue
      best.set(i, nc)
      open.push(i)
    }
  }
  return best
}

/** Reconstruct a path (list of tile indices) from `from` to `to` within the move budget. */
export function pathTo(t: Terrain[], cols: number, rows: number, from: number, to: number, move: number, occupied: Set<number>): number[] {
  const cost = reach(t, cols, rows, from, move, occupied)
  if (!cost.has(to)) return []
  const out = [to]
  let cur = to
  while (cur !== from) {
    const x = cur % cols
    const y = Math.floor(cur / cols)
    let next = -1
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
      const i = ny * cols + nx
      const c = cost.get(i)
      if (c !== undefined && c + (t[cur] === 1 ? 2 : 1) === cost.get(cur)) { next = i; break }
    }
    if (next < 0) return []
    out.push(next)
    cur = next
  }
  return out.reverse()
}

export const manhattan = (a: number, b: number, cols: number) => Math.abs((a % cols) - (b % cols)) + Math.abs(Math.floor(a / cols) - Math.floor(b / cols))

// ---------- creatures ----------
export const TYPES = ['fire', 'water', 'plant', 'electric', 'earth', 'air'] as const
export type CType = (typeof TYPES)[number]
export const TYPE_ICON: Record<CType, string> = { fire: '🔥', water: '💧', plant: '🌿', electric: '⚡', earth: '🪨', air: '💨' }
const STRONG: Record<CType, CType[]> = {
  fire: ['plant'], water: ['fire', 'earth'], plant: ['water', 'earth'], electric: ['water', 'air'], earth: ['fire', 'electric'], air: ['plant'],
}
export function typeMult(a: CType, d: CType): number {
  if (STRONG[a].includes(d)) return 2
  if (STRONG[d].includes(a)) return 0.5
  return 1
}

export interface Move { name: string; type: CType | 'normal'; power: number; acc: number; pp: number; heal?: number }
export interface Creature {
  name: string
  emoji: string
  type: CType
  lvl: number
  maxHp: number
  hp: number
  atk: number
  def: number
  spd: number
  moves: Move[]
}

const SYL: Record<CType, string[]> = {
  fire: ['Pyro', 'Ember', 'Blaz', 'Cinder'], water: ['Aqua', 'Tidal', 'Splash', 'Drip'], plant: ['Leaf', 'Sprout', 'Mossy', 'Bloom'],
  electric: ['Zap', 'Volt', 'Spark', 'Jolt'], earth: ['Rock', 'Dusty', 'Pebb', 'Terra'], air: ['Gust', 'Zeph', 'Whirl', 'Puff'],
}
const END = ['ling', 'ix', 'o', 'on', 'ie', 'ar', 'us', 'y']
const MOVES: Record<CType, [string, string]> = {
  fire: ['Flame Jab', 'Inferno'], water: ['Bubble Shot', 'Tidal Wave'], plant: ['Vine Whip', 'Leaf Storm'],
  electric: ['Spark', 'Thunder'], earth: ['Rock Toss', 'Quake'], air: ['Gust', 'Cyclone'],
}

export function genCreature(rng: Rng, emoji: string, lvl: number, type?: CType): Creature {
  const ty = type ?? rng.pick(TYPES)
  const name = rng.pick(SYL[ty]) + rng.pick(END)
  const other = rng.pick(TYPES.filter((x) => x !== ty))
  const maxHp = 34 + lvl * 7 + rng.int(0, 6)
  return {
    name, emoji, type: ty, lvl, maxHp, hp: maxHp,
    atk: 10 + lvl * 2 + rng.int(0, 3), def: 9 + lvl * 1.6 + rng.int(0, 3), spd: 8 + rng.int(0, 10) + lvl,
    moves: [
      { name: MOVES[ty][0], type: ty, power: 50, acc: 100, pp: 18 },
      { name: MOVES[ty][1], type: ty, power: 85, acc: 80, pp: 8 },
      { name: MOVES[other][0], type: other, power: 55, acc: 95, pp: 12 },
      { name: 'Recover', type: 'normal', power: 0, acc: 100, pp: 3, heal: 0.4 },
    ],
  }
}

/** Damage of a move (rand in [0,1)). */
export function moveDamage(a: Creature, d: Creature, m: Move, rand: number): number {
  if (m.power <= 0) return 0
  const mult = m.type === 'normal' ? 1 : typeMult(m.type, d.type)
  const stab = m.type === a.type ? 1.2 : 1
  return Math.max(1, Math.floor(m.power * (a.atk / d.def) * 0.32 * (0.85 + rand * 0.3) * mult * stab))
}

// ---------- mode + rule selection ----------
export type TacKind = 'classic' | 'auto' | 'creature'
export type Rule = 'weather' | 'tide' | 'cold' | 'zone' | 'high' | 'xcom' | 'overwatch' | 'rewind' | 'hold' | 'bridge' | 'artillery' | 'merc' | 'gears' | 'initiative' | 'guard'

export interface TacPick { kind: TacKind; rules: Set<Rule>; collect: boolean }

export function pickTactics(info: string, mods: ReadonlySet<string>): TacPick {
  const s = info.toLowerCase()
  const rules = new Set<Rule>()
  if (/\bweather|monsoon|\bfronts?\b/.test(s)) rules.add('weather')
  if (/tide|tides/.test(s)) rules.add('tide')
  if (/cold|frost|winter|snow/.test(s)) rules.add('cold')
  if (/shrinking|light radius/.test(s)) rules.add('zone')
  if (/high ground|cliff|vertical|rooftop|\bridge\b/.test(s)) rules.add('high')
  if (/cover|flank|xcom/.test(s)) rules.add('xcom')
  if (/overwatch/.test(s)) rules.add('overwatch')
  if (/rewind/.test(s)) rules.add('rewind')
  if (/last stand|hold position|wave assault/.test(s)) rules.add('hold')
  if (/shieldwall|narrow bridges|formation push/.test(s)) rules.add('bridge')
  if (/artillery|lob shells/.test(s)) rules.add('artillery')
  if (/mercenary|hire squads|upkeep/.test(s)) rules.add('merc')
  if (/gear cycles|clockwork/.test(s)) rules.add('gears')
  if (/initiative/.test(s)) rules.add('initiative')
  if (/stance/.test(s)) rules.add('guard')
  const autoWords = /\bauto\b|autom|draft|lineup|bench|brawl|arena|roster|synerg|\bshop\b|league|melee/i.test(info) || mods.has('auto')
  const creature = !rules.size && !autoWords && /creature|monster|critter|cryptid|\bpets?\b|\bpals\b|kaiju|slime|wisps?|spirit|hatchery|fossil|coral kin|glitch|beast/i.test(info)
  const auto = !creature && !rules.size && (autoWords || /formations? auto/i.test(info))
  const collect = creature && /collect|befriend|hatch|revive|pals|pets|field guide|kindergarten|breed|raise|fuse|photograph|debug|symbiosis|wisps|slime/.test(s)
  return { kind: creature ? 'creature' : auto ? 'auto' : 'classic', rules, collect }
}

/** Water band across the middle with two narrow bridges (shieldwall maps). */
export function genBridge(rng: Rng, cols: number, rows: number): Terrain[] {
  const t: Terrain[] = Array(cols * rows).fill(0)
  const axisLong = cols >= rows
  const long = axisLong ? cols : rows
  const short = axisLong ? rows : cols
  const mid = Math.floor(long / 2)
  const b1 = Math.floor(short * 0.25)
  const b2 = Math.floor(short * 0.75)
  for (let a = 0; a < long; a++) for (let b = 0; b < short; b++) {
    const c = axisLong ? a : b
    const r = axisLong ? b : a
    const i = r * cols + c
    if (a === mid - 1 || a === mid) { t[i] = b === b1 || b === b2 ? 0 : 2; continue }
    if (a >= 2 && a < long - 2 && rng.chance(0.1)) t[i] = 1
  }
  return t
}

/** Class names per theme keyword (warrior, archer, healer, mage, knight, rogue). */
export const LABELS: { re: RegExp; names: [string, string, string, string, string, string] }[] = [
  { re: /chess|pawn/i, names: ['Pawn', 'Bishop', 'Rook', 'Queen', 'Knight', 'Jester'] },
  { re: /fruit|juic/i, names: ['Melon', 'Cherry', 'Orange', 'Grape', 'Coconut', 'Chili'] },
  { re: /toy|puppet|paper|marionette|origami|wind-up/i, names: ['Tin Soldier', 'Dart Gun', 'Teddy', 'Jack-in-Box', 'Block Knight', 'Marble'] },
  { re: /bug|insect|microbe|cell|ant\b/i, names: ['Beetle', 'Spitter', 'Nurse Bee', 'Stinger', 'Rhino', 'Mantis'] },
  { re: /snack|junk food|kitchen|burger/i, names: ['Burger', 'Fry Slinger', 'Milk Carton', 'Hot Sauce', 'Pizza Knight', 'Taco Rogue'] },
  { re: /robot|mech|clockwork|rumble/i, names: ['Brawler Bot', 'Turret', 'Repair Drone', 'Arc Caster', 'Heavy Mech', 'Stealth Unit'] },
  { re: /dino|raptor|dragon/i, names: ['Raptor', 'Spitter', 'Nurturer', 'Fire Breather', 'Armored Beast', 'Pouncer'] },
  { re: /undead|skeleton|lich|crypt/i, names: ['Skeleton', 'Bone Archer', 'Ghoul', 'Lich', 'Death Knight', 'Wraith'] },
  { re: /pirate|crew/i, names: ['Deckhand', 'Gunner', 'Surgeon', 'Cannoneer', 'Bosun', 'Cutthroat'] },
  { re: /space|fleet|starfall|squadron/i, names: ['Frigate', 'Lancer', 'Repair Tender', 'Missile Boat', 'Battleship', 'Stealth Skiff'] },
  { re: /wizard|mage|magic|witch/i, names: ['Battle Mage', 'Wand Archer', 'Cleric', 'Archmage', 'Rune Knight', 'Shade'] },
  { re: /samurai|shogun|ronin|ninja|sengoku/i, names: ['Ashigaru', 'Yumi Archer', 'Monk', 'Onmyoji', 'Samurai', 'Ninja'] },
  { re: /western|sheriff|cowboy|standoff|frontier/i, names: ['Deputy', 'Rifleman', 'Doc', 'Dynamite Man', 'Marshal', 'Outlaw'] },
  { re: /cactus|desert/i, names: ['Cactus Bruiser', 'Thorn Archer', 'Aloe Healer', 'Mirage Mage', 'Armadillo', 'Scorpion'] },
  { re: /myth|god|zodiac|titan/i, names: ['Hoplite', 'Artemis Archer', 'Oracle', 'Storm Mage', 'Titan', 'Trickster'] },
  { re: /gladiator/i, names: ['Murmillo', 'Sagittarius', 'Medicus', 'Retiarius', 'Champion', 'Velite'] },
  { re: /element/i, names: ['Earth Golem', 'Wind Archer', 'Water Healer', 'Fire Mage', 'Stone Knight', 'Shadow'] },
  { re: /trench|war\b|wwi|commando|squad|patrol|brigade/i, names: ['Rifleman', 'Sniper', 'Medic', 'Grenadier', 'Heavy Gunner', 'Scout'] },
  { re: /badger|woodland|animal|critter/i, names: ['Badger', 'Squirrel Archer', 'Hedgehog Healer', 'Owl Mage', 'Boar', 'Fox'] },
  { re: /knight|kingdom|medieval|castle|clash/i, names: ['Footman', 'Longbow', 'Priest', 'Court Mage', 'Knight', 'Thief'] },
]
/** Order of LABELS entries. */
export const LABEL_ORDER: Cls[] = ['warrior', 'archer', 'healer', 'mage', 'knight', 'rogue']
export const classLabels = (s: string) => LABELS.find((l) => l.re.test(s))?.names
