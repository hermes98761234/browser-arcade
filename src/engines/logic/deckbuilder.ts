// Slay-the-Spire-lite combat rules: card pool, enemies with intents, energy, block and statuses. Pure and deterministic given an rng.
import type { Rng } from '../kit'

export type CardType = 'attack' | 'skill' | 'power'
export type Target = 'enemy' | 'all' | 'self'
export interface CardDef {
  id: string
  name: string
  cost: number
  type: CardType
  target: Target
  desc: string
  rarity: 0 | 1 | 2
  dmg?: number
  hits?: number
  block?: number
  draw?: number
  energy?: number
  heal?: number
  str?: number
  vuln?: number
  weak?: number
  exhaust?: boolean
  /** extra damage when the target is vulnerable */
  punish?: number
  /** power effects */
  regen?: number
  fortify?: number
  drawBonus?: number
}

const A = (id: string, name: string, cost: number, desc: string, rarity: 0 | 1 | 2, o: Partial<CardDef>): CardDef => ({ id, name, cost, type: 'attack', target: 'enemy', desc, rarity, ...o })
const S = (id: string, name: string, cost: number, desc: string, rarity: 0 | 1 | 2, o: Partial<CardDef>): CardDef => ({ id, name, cost, type: 'skill', target: 'self', desc, rarity, ...o })
const P = (id: string, name: string, cost: number, desc: string, rarity: 0 | 1 | 2, o: Partial<CardDef>): CardDef => ({ id, name, cost, type: 'power', target: 'self', desc, rarity, ...o })

export const CARDS: CardDef[] = [
  A('strike', 'Strike', 1, 'Deal 6 damage.', 0, { dmg: 6 }),
  A('heavy', 'Heavy Blow', 2, 'Deal 14 damage.', 0, { dmg: 14 }),
  A('cleave', 'Cleave', 1, 'Deal 5 damage to ALL enemies.', 0, { dmg: 5, target: 'all' }),
  A('twin', 'Twin Strike', 1, 'Deal 5 damage twice.', 0, { dmg: 5, hits: 2 }),
  A('pummel', 'Pummel', 1, 'Deal 2 damage 4 times.', 1, { dmg: 2, hits: 4 }),
  A('bash', 'Bash', 2, 'Deal 8 damage. Apply 2 Vulnerable.', 0, { dmg: 8, vuln: 2 }),
  A('quick', 'Quick Slash', 0, 'Deal 4 damage.', 0, { dmg: 4 }),
  A('whirl', 'Whirlwind', 2, 'Deal 9 damage to ALL enemies.', 1, { dmg: 9, target: 'all' }),
  A('rend', 'Rend', 1, 'Deal 5 damage. Apply 1 Weak.', 0, { dmg: 5, weak: 1 }),
  A('smite', 'Smite', 3, 'Deal 26 damage. Exhaust.', 2, { dmg: 26, exhaust: true }),
  A('riposte', 'Riposte', 1, 'Deal 5 damage. Gain 5 Block.', 1, { dmg: 5, block: 5 }),
  A('finisher', 'Finisher', 2, 'Deal 8 damage. +10 if Vulnerable.', 1, { dmg: 8, punish: 10 }),
  A('spark', 'Spark', 0, 'Deal 3 damage to ALL enemies. Exhaust.', 0, { dmg: 3, target: 'all', exhaust: true }),
  A('lunge', 'Lunge', 1, 'Deal 10 damage. Draw 1 card.', 2, { dmg: 10, draw: 1 }),
  S('defend', 'Defend', 1, 'Gain 5 Block.', 0, { block: 5 }),
  S('wall', 'Iron Wall', 2, 'Gain 14 Block.', 0, { block: 14 }),
  S('shrug', 'Shrug Off', 1, 'Gain 4 Block. Draw 1 card.', 0, { block: 4, draw: 1 }),
  S('adren', 'Adrenaline', 0, 'Gain 1 Energy. Draw 1 card. Exhaust.', 1, { energy: 1, draw: 1, exhaust: true }),
  S('focus', 'Focus', 1, 'Draw 2 cards.', 0, { draw: 2 }),
  S('meditate', 'Meditate', 0, 'Gain 3 Block.', 0, { block: 3 }),
  S('taunt', 'Taunt', 1, 'Apply 2 Vulnerable.', 0, { vuln: 2, target: 'enemy' }),
  S('intimidate', 'Intimidate', 0, 'Apply 1 Weak to ALL enemies. Exhaust.', 1, { weak: 1, target: 'all', exhaust: true }),
  S('bandage', 'Bandage', 1, 'Heal 7 HP. Exhaust.', 1, { heal: 7, exhaust: true }),
  S('scout', 'Scout', 0, 'Draw 1 card.', 0, { draw: 1 }),
  S('barrier', 'Barrier', 1, 'Gain 8 Block.', 0, { block: 8 }),
  S('guardian', 'Guardian', 2, 'Gain 10 Block. Draw 1 card.', 1, { block: 10, draw: 1 }),
  S('weaken', 'Cripple', 1, 'Apply 2 Weak.', 1, { weak: 2, target: 'enemy' }),
  S('surge', 'Power Surge', 0, 'Gain 2 Energy. Exhaust.', 2, { energy: 2, exhaust: true }),
  P('rage', 'Rage', 1, 'Gain 2 Strength.', 1, { str: 2 }),
  P('fury', 'Fury', 2, 'Gain 4 Strength.', 2, { str: 4 }),
  P('regen', 'Regeneration', 2, 'Heal 3 HP at the end of each turn.', 1, { regen: 3 }),
  P('fortify', 'Fortify', 2, 'Start each turn with 4 Block.', 1, { fortify: 4 }),
  P('insight', 'Insight', 2, 'Draw 1 extra card each turn.', 2, { drawBonus: 1 }),
]
export const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]))
export const STARTER = ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash']

// ---------------------------------------------------------------- enemies
export type Intent =
  | { k: 'attack'; n: number; times?: number }
  | { k: 'block'; n: number }
  | { k: 'buff'; n: number }
  | { k: 'weak' }
  | { k: 'vuln' }
  | { k: 'heal'; n: number }
export interface EnemyDef { id: string; name: string; hp: number; pattern: Intent[]; boss?: boolean }
export const ENEMIES: Record<string, EnemyDef> = {
  grunt: { id: 'grunt', name: 'Grunt', hp: 30, pattern: [{ k: 'attack', n: 7 }, { k: 'attack', n: 7 }, { k: 'block', n: 6 }] },
  shielder: { id: 'shielder', name: 'Shielder', hp: 36, pattern: [{ k: 'block', n: 10 }, { k: 'attack', n: 10 }, { k: 'attack', n: 6 }] },
  twin: { id: 'twin', name: 'Twin', hp: 26, pattern: [{ k: 'attack', n: 3, times: 3 }, { k: 'block', n: 6 }] },
  caster: { id: 'caster', name: 'Caster', hp: 24, pattern: [{ k: 'vuln' }, { k: 'attack', n: 8 }, { k: 'weak' }, { k: 'attack', n: 8 }] },
  brute: { id: 'brute', name: 'Brute', hp: 40, pattern: [{ k: 'attack', n: 11 }, { k: 'buff', n: 2 }, { k: 'attack', n: 8 }] },
  elite: { id: 'elite', name: 'Elite', hp: 58, pattern: [{ k: 'attack', n: 13 }, { k: 'buff', n: 2 }, { k: 'attack', n: 4, times: 3 }, { k: 'block', n: 10 }] },
  boss: {
    id: 'boss', name: 'Boss', hp: 110, boss: true,
    pattern: [{ k: 'attack', n: 12 }, { k: 'buff', n: 2 }, { k: 'attack', n: 5, times: 3 }, { k: 'block', n: 14 }, { k: 'vuln' }, { k: 'attack', n: 22 }],
  },
}

export const FLOORS = 3
/** Enemy line-up per floor: 1 grunt-ish, 2 mixed, 3 boss (+ minion on hard). */
export function floorEnemies(floor: number, rng: Rng, diff: 0 | 1 | 2): EnemyDef[] {
  const scale = [0.85, 1, 1.15][diff]
  const dm = [0.85, 1, 1.12][diff]
  const sc = (d: EnemyDef): EnemyDef => ({
    ...d,
    hp: Math.round(d.hp * scale * (1 + (floor - 1) * 0.08)),
    pattern: d.pattern.map((i) => (i.k === 'attack' ? { ...i, n: Math.max(1, Math.round(i.n * dm * (1 + (floor - 1) * 0.05))) } : i)),
  })
  if (floor <= 1) return [sc(ENEMIES[rng.pick(['grunt', 'shielder', 'twin'])])]
  if (floor === 2) return rng.chance(0.4) ? [sc(ENEMIES.elite)] : [sc(ENEMIES.brute), sc(ENEMIES[rng.pick(['caster', 'twin'])])]
  return diff === 2 ? [sc(ENEMIES.boss), sc({ ...ENEMIES.caster, hp: 18 })] : [sc(ENEMIES.boss)]
}

// ---------------------------------------------------------------- combat
export interface Ent { hp: number; maxHp: number; block: number; str: number; vuln: number; weak: number }
export interface Enemy extends Ent { id: number; def: EnemyDef; idx: number; intent: Intent; dead: boolean; skin: number }
export interface PlayerEnt extends Ent { energy: number; maxEnergy: number; regen: number; fortify: number; drawBonus: number }
export interface Combat {
  player: PlayerEnt
  enemies: Enemy[]
  draw: string[]
  hand: string[]
  discard: string[]
  exhaust: string[]
  turn: number
  over: null | 'win' | 'lose'
  floor: number
}
export type Ev =
  | { k: 'dmg'; to: 'p' | number; n: number; blocked: number }
  | { k: 'block'; to: 'p' | number; n: number }
  | { k: 'heal'; to: 'p' | number; n: number }
  | { k: 'buff'; to: 'p' | number; what: string }
  | { k: 'die'; to: number }
  | { k: 'draw'; n: number }

export const intentOf = (d: EnemyDef, i: number): Intent => d.pattern[i % d.pattern.length]

export function startCombat(deck: string[], hp: number, maxHp: number, defs: EnemyDef[], rng: Rng, floor: number, maxEnergy = 3): Combat {
  const c: Combat = {
    player: { hp, maxHp, block: 0, str: 0, vuln: 0, weak: 0, energy: maxEnergy, maxEnergy, regen: 0, fortify: 0, drawBonus: 0 },
    enemies: defs.map((d, i) => ({ id: i, def: d, hp: d.hp, maxHp: d.hp, block: 0, str: 0, vuln: 0, weak: 0, idx: 0, intent: intentOf(d, 0), dead: false, skin: i })),
    draw: rng.shuffle(deck.slice()),
    hand: [],
    discard: [],
    exhaust: [],
    turn: 0,
    over: null,
    floor,
  }
  startPlayerTurn(c, rng)
  return c
}

export function drawCards(c: Combat, n: number, rng: Rng): number {
  let drawn = 0
  for (let i = 0; i < n; i++) {
    if (!c.draw.length) {
      if (!c.discard.length) break
      c.draw = rng.shuffle(c.discard.splice(0))
    }
    if (c.hand.length >= 10) {
      c.discard.push(c.draw.pop()!)
      continue
    }
    c.hand.push(c.draw.pop()!)
    drawn++
  }
  return drawn
}

export function startPlayerTurn(c: Combat, rng: Rng): Ev[] {
  const ev: Ev[] = []
  c.turn++
  c.player.block = c.player.fortify
  if (c.player.fortify) ev.push({ k: 'block', to: 'p', n: c.player.fortify })
  c.player.energy = c.player.maxEnergy
  const n = drawCards(c, 5 + c.player.drawBonus, rng)
  ev.push({ k: 'draw', n })
  return ev
}

/** Damage after strength, weak (x0.75) and vulnerable (x1.5). */
export function calcDamage(base: number, attacker: Ent, target: Ent): number {
  let d = base + attacker.str
  if (attacker.weak > 0) d = Math.floor(d * 0.75)
  if (target.vuln > 0) d = Math.floor(d * 1.5)
  return Math.max(0, d)
}

function hit(c: Combat, from: Ent, to: Ent, toId: 'p' | number, base: number, ev: Ev[]): void {
  const d = calcDamage(base, from, to)
  const blocked = Math.min(to.block, d)
  to.block -= blocked
  const real = d - blocked
  to.hp -= real
  ev.push({ k: 'dmg', to: toId, n: real, blocked })
  if (to.hp <= 0) {
    to.hp = 0
    if (toId !== 'p') {
      const e = c.enemies[toId]
      if (!e.dead) {
        e.dead = true
        ev.push({ k: 'die', to: toId })
      }
    }
  }
}

export const playable = (c: Combat, handIdx: number): boolean => {
  const def = CARD_BY_ID.get(c.hand[handIdx])
  return !!def && c.over === null && def.cost <= c.player.energy
}
export const livingEnemies = (c: Combat) => c.enemies.filter((e) => !e.dead)

/** Play a card from the hand. targetIdx = enemy index (ignored for self/all). Returns events or null when illegal. */
export function playCard(c: Combat, handIdx: number, targetIdx: number, rng: Rng): Ev[] | null {
  const def = CARD_BY_ID.get(c.hand[handIdx])
  if (!def || c.over || def.cost > c.player.energy) return null
  const alive = livingEnemies(c)
  let target: Enemy | undefined
  if (def.target === 'enemy') {
    target = c.enemies[targetIdx]
    if (!target || target.dead) target = alive.length === 1 ? alive[0] : undefined
    if (!target) return null
  }
  const ev: Ev[] = []
  c.player.energy -= def.cost
  c.hand.splice(handIdx, 1)
  const p = c.player
  const targets = def.target === 'all' ? alive : target ? [target] : []
  if (def.dmg !== undefined) {
    for (const e of targets) {
      for (let h = 0; h < (def.hits ?? 1); h++) {
        if (e.dead) break
        const bonus = def.punish && e.vuln > 0 ? def.punish : 0
        hit(c, p, e, e.id, def.dmg + bonus, ev)
      }
    }
  }
  if (def.block) {
    p.block += def.block
    ev.push({ k: 'block', to: 'p', n: def.block })
  }
  for (const e of targets) {
    if (e.dead) continue
    if (def.vuln) e.vuln += def.vuln
    if (def.weak) e.weak += def.weak
    if (def.vuln || def.weak) ev.push({ k: 'buff', to: e.id, what: def.vuln ? 'vulnerable' : 'weak' })
  }
  if (def.heal) {
    const n = Math.min(def.heal, p.maxHp - p.hp)
    p.hp += n
    ev.push({ k: 'heal', to: 'p', n })
  }
  if (def.energy) p.energy += def.energy
  if (def.str) {
    p.str += def.str
    ev.push({ k: 'buff', to: 'p', what: 'strength' })
  }
  if (def.regen) p.regen += def.regen
  if (def.fortify) p.fortify += def.fortify
  if (def.drawBonus) p.drawBonus += def.drawBonus
  if (def.draw) ev.push({ k: 'draw', n: drawCards(c, def.draw, rng) })
  if (def.type === 'power') {
    // powers leave the deck for the rest of the combat
    c.exhaust.push(def.id)
  } else if (def.exhaust) c.exhaust.push(def.id)
  else c.discard.push(def.id)
  if (!livingEnemies(c).length) c.over = 'win'
  return ev
}

/** End the player's turn: discard the hand, enemies act, statuses tick, next turn starts. */
export function endTurn(c: Combat, rng: Rng): Ev[] {
  const ev: Ev[] = []
  if (c.over) return ev
  c.discard.push(...c.hand.splice(0))
  const p = c.player
  if (p.regen) {
    const n = Math.min(p.regen, p.maxHp - p.hp)
    if (n) {
      p.hp += n
      ev.push({ k: 'heal', to: 'p', n })
    }
  }
  for (const e of c.enemies) {
    if (e.dead) continue
    e.block = 0
    const it = e.intent
    if (it.k === 'attack') {
      for (let t = 0; t < (it.times ?? 1); t++) hit(c, e, p, 'p', it.n, ev)
    } else if (it.k === 'block') {
      e.block += it.n
      ev.push({ k: 'block', to: e.id, n: it.n })
    } else if (it.k === 'buff') {
      e.str += it.n
      ev.push({ k: 'buff', to: e.id, what: 'strength' })
    } else if (it.k === 'weak') {
      p.weak += 2
      ev.push({ k: 'buff', to: 'p', what: 'weak' })
    } else if (it.k === 'vuln') {
      p.vuln += 2
      ev.push({ k: 'buff', to: 'p', what: 'vulnerable' })
    } else if (it.k === 'heal') {
      e.hp = Math.min(e.maxHp, e.hp + it.n)
      ev.push({ k: 'heal', to: e.id, n: it.n })
    }
    if (e.vuln > 0) e.vuln--
    if (e.weak > 0) e.weak--
    e.idx++
    e.intent = intentOf(e.def, e.idx)
    if (p.hp <= 0) {
      c.over = 'lose'
      return ev
    }
  }
  if (p.vuln > 0) p.vuln--
  if (p.weak > 0) p.weak--
  ev.push(...startPlayerTurn(c, rng))
  return ev
}

/** Three distinct reward cards; later floors lean toward rarer cards. */
export function rewardChoices(rng: Rng, floor: number, owned: string[] = []): CardDef[] {
  const pool = CARDS.filter((c) => c.id !== 'strike' && c.id !== 'defend')
  const weight = (c: CardDef) => (c.rarity === 0 ? 5 : c.rarity === 1 ? 3 + floor : 1 + floor) * (owned.filter((o) => o === c.id).length >= 3 ? 0.2 : 1)
  const out: CardDef[] = []
  const bag = pool.slice()
  while (out.length < 3 && bag.length) {
    const tot = bag.reduce((a, c) => a + weight(c), 0)
    let r = rng() * tot
    let pick = 0
    for (let i = 0; i < bag.length; i++) {
      r -= weight(bag[i])
      if (r <= 0) {
        pick = i
        break
      }
    }
    out.push(bag.splice(pick, 1)[0])
  }
  return out
}
