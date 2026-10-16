// Hearthstone-lite lane battler: 3 lanes per side, mana, minions with keywords and spells. Pure rules + a heuristic AI.
import type { Rng } from '../kit'

export type Kw = 'swift' | 'venom' | 'charge' | 'shield' | 'regen' | 'thorns' | 'splash'
export type SpellFx = 'dmg' | 'heal' | 'buffAll' | 'draw' | 'kill' | 'stun' | 'sweep' | 'shield' | 'mana' | 'face'
export interface BCard {
  id: string
  name: string
  cost: number
  kind: 'minion' | 'spell'
  atk?: number
  hp?: number
  kw?: Kw[]
  /** battlecry */
  bc?: 'rally' | 'draw' | 'burn' | 'heal'
  fx?: SpellFx
  n?: number
  desc: string
  rarity: 0 | 1 | 2
}
const M = (id: string, name: string, cost: number, atk: number, hp: number, desc: string, rarity: 0 | 1 | 2, o: Partial<BCard> = {}): BCard => ({ id, name, cost, kind: 'minion', atk, hp, desc, rarity, ...o })
const Sp = (id: string, name: string, cost: number, fx: SpellFx, n: number, desc: string, rarity: 0 | 1 | 2): BCard => ({ id, name, cost, kind: 'spell', fx, n, desc, rarity })

export const BCARDS: BCard[] = [
  M('squire', 'Squire', 1, 2, 1, 'A cheap fighter.', 0),
  M('scout', 'Scout', 1, 1, 2, 'Swift: strikes first.', 0, { kw: ['swift'] }),
  M('guard', 'Guard', 2, 2, 3, 'Solid and sturdy.', 0),
  M('rogue', 'Rogue', 2, 3, 1, 'Swift: strikes first.', 0, { kw: ['swift'] }),
  M('medic', 'Medic', 2, 1, 3, 'Battlecry: heal your hero 3.', 0, { bc: 'heal', n: 3 }),
  M('spider', 'Spider', 2, 1, 2, 'Venom: kills what it damages.', 1, { kw: ['venom'] }),
  M('knight', 'Knight', 3, 3, 4, 'A reliable front-liner.', 0),
  M('bard', 'Bard', 3, 2, 2, 'Battlecry: draw a card.', 0, { bc: 'draw' }),
  M('raider', 'Raider', 3, 4, 2, 'Charge: attacks at once.', 1, { kw: ['charge'] }),
  M('captain', 'Captain', 3, 2, 3, 'Battlecry: allies get +1/+1.', 1, { bc: 'rally' }),
  M('thornback', 'Thornback', 3, 2, 4, 'Thorns: hurts attackers.', 1, { kw: ['thorns'] }),
  M('paladin', 'Paladin', 4, 3, 3, 'Shield blocks the first hit.', 1, { kw: ['shield'] }),
  M('archer', 'Archer', 3, 2, 2, 'Battlecry: 2 damage to the enemy hero.', 1, { bc: 'burn', n: 2 }),
  M('ogre', 'Ogre', 4, 5, 5, 'A big brute.', 0),
  M('druid', 'Druid', 4, 3, 4, 'Regen: heals 2 each turn.', 1, { kw: ['regen'] }),
  M('assassin', 'Assassin', 4, 3, 2, 'Swift + Venom.', 2, { kw: ['swift', 'venom'] }),
  M('hydra', 'Hydra', 5, 4, 4, 'Splash: also hits neighbours.', 2, { kw: ['splash'] }),
  M('golem', 'Golem', 6, 6, 7, 'Thorns and tough.', 1, { kw: ['thorns'] }),
  M('dragon', 'Dragon', 7, 7, 6, 'Charge. Breathes fire!', 2, { kw: ['charge', 'splash'] }),
  Sp('zap', 'Zap', 1, 'dmg', 2, 'Deal 2 damage.', 0),
  Sp('fireball', 'Fireball', 3, 'dmg', 5, 'Deal 5 damage.', 1),
  Sp('heal', 'Heal', 2, 'heal', 5, 'Restore 5 health.', 0),
  Sp('rally', 'Battle Cry', 2, 'buffAll', 1, 'Your minions get +1/+1.', 1),
  Sp('study', 'Study', 2, 'draw', 2, 'Draw 2 cards.', 0),
  Sp('smite', 'Smite', 4, 'kill', 0, 'Destroy an enemy minion.', 1),
  Sp('freeze', 'Freeze', 1, 'stun', 0, 'An enemy minion skips its next attack.', 0),
  Sp('sweep', 'Sweep', 3, 'sweep', 2, 'Deal 2 damage to all enemy minions.', 1),
  Sp('ward', 'Ward', 1, 'shield', 0, 'Give a friendly minion Shield.', 0),
  Sp('focus', 'Focus', 0, 'mana', 1, 'Gain 1 mana this turn.', 1),
  Sp('bolt', 'Lightning', 2, 'face', 4, 'Deal 4 damage to the enemy hero.', 1),
]
export const BCARD_BY_ID = new Map(BCARDS.map((c) => [c.id, c]))
export const LANES = 3
export const HERO_HP = 30

export interface Minion { id: number; card: string; atk: number; hp: number; maxHp: number; kw: Kw[]; sick: boolean; shield: boolean; stunned: boolean }
export interface Side { hp: number; mana: number; maxMana: number; deck: string[]; hand: string[]; board: (Minion | null)[]; fatigue: number }
export interface BState { sides: [Side, Side]; turn: 0 | 1; n: number; nextId: number; over: null | 0 | 1; }
export type Target = { side: 0 | 1; lane: number }
export type Action = { t: 'play'; hand: number; lane?: number; target?: Target } | { t: 'end' }
export type BEv =
  | { k: 'attack'; side: 0 | 1; lane: number }
  | { k: 'dmg'; side: 0 | 1; lane: number; n: number }
  | { k: 'heal'; side: 0 | 1; lane: number; n: number }
  | { k: 'die'; side: 0 | 1; lane: number }
  | { k: 'summon'; side: 0 | 1; lane: number }
  | { k: 'draw'; side: 0 | 1 }
  | { k: 'buff'; side: 0 | 1; lane: number }

export function buildDeck(rng: Rng, size = 30): string[] {
  const pool = BCARDS.slice()
  const deck: string[] = []
  const count = new Map<string, number>()
  while (deck.length < size) {
    const c = rng.pick(pool)
    const lim = c.rarity === 2 ? 1 : 2
    if ((count.get(c.id) ?? 0) >= lim) continue
    // weight cheap cards a bit more
    if (c.cost >= 5 && rng.chance(0.4)) continue
    count.set(c.id, (count.get(c.id) ?? 0) + 1)
    deck.push(c.id)
  }
  return deck
}

const mkSide = (deck: string[]): Side => ({ hp: HERO_HP, mana: 0, maxMana: 0, deck, hand: [], board: Array(LANES).fill(null), fatigue: 0 })

export function newGame(deckA: string[], deckB: string[], rng: Rng): { s: BState; ev: BEv[] } {
  const s: BState = { sides: [mkSide(rng.shuffle(deckA.slice())), mkSide(rng.shuffle(deckB.slice()))], turn: 0, n: 0, nextId: 1, over: null }
  const ev: BEv[] = []
  for (let i = 0; i < 4; i++) draw(s, 0, ev)
  for (let i = 0; i < 5; i++) draw(s, 1, ev)
  ev.push(...startTurn(s, 0))
  return { s, ev }
}

export function draw(s: BState, who: 0 | 1, ev: BEv[] = []): void {
  const side = s.sides[who]
  if (!side.deck.length) {
    side.fatigue++
    side.hp -= side.fatigue
    ev.push({ k: 'dmg', side: who, lane: -1, n: side.fatigue })
    if (side.hp <= 0) s.over = who === 0 ? 1 : 0
    return
  }
  const c = side.deck.shift()!
  if (side.hand.length < 8) {
    side.hand.push(c)
    ev.push({ k: 'draw', side: who })
  }
}

function startTurn(s: BState, who: 0 | 1): BEv[] {
  const ev: BEv[] = []
  s.turn = who
  s.n++
  const side = s.sides[who]
  side.maxMana = Math.min(10, side.maxMana + 1)
  side.mana = side.maxMana
  for (const [i, m] of side.board.entries()) {
    if (!m) continue
    m.sick = false
    if (m.kw.includes('regen') && m.hp < m.maxHp) {
      const h = Math.min(2, m.maxHp - m.hp)
      m.hp += h
      ev.push({ k: 'heal', side: who, lane: i, n: h })
    }
  }
  draw(s, who, ev)
  return ev
}

export const cloneB = (s: BState): BState => structuredClone(s)

/** Which targets does a card need? */
export function needsTarget(c: BCard): 'enemy' | 'friend' | 'any' | null {
  if (c.kind !== 'spell') return null
  if (c.fx === 'dmg') return 'any'
  if (c.fx === 'heal') return 'any'
  if (c.fx === 'kill' || c.fx === 'stun') return 'enemy'
  if (c.fx === 'shield') return 'friend'
  return null
}

export function legalActions(s: BState): Action[] {
  const out: Action[] = [{ t: 'end' }]
  if (s.over !== null) return []
  const me = s.sides[s.turn]
  const foe = (s.turn === 0 ? 1 : 0) as 0 | 1
  me.hand.forEach((id, hand) => {
    const c = BCARD_BY_ID.get(id)!
    if (c.cost > me.mana) return
    if (c.kind === 'minion') {
      me.board.forEach((m, lane) => {
        if (!m) out.push({ t: 'play', hand, lane })
      })
      return
    }
    const need = needsTarget(c)
    if (!need) {
      out.push({ t: 'play', hand })
      return
    }
    const targets: Target[] = []
    const add = (side: 0 | 1) => {
      s.sides[side].board.forEach((m, lane) => m && targets.push({ side, lane }))
      if (c.fx === 'dmg' || c.fx === 'heal') targets.push({ side, lane: -1 })
    }
    if (need === 'enemy' || need === 'any') {
      if (c.fx === 'kill' || c.fx === 'stun') s.sides[foe].board.forEach((m, lane) => m && targets.push({ side: foe, lane }))
      else add(foe)
    }
    if (need === 'friend' || need === 'any') {
      if (c.fx === 'shield') s.sides[s.turn].board.forEach((m, lane) => m && targets.push({ side: s.turn, lane }))
      else if (need === 'any') add(s.turn)
    }
    for (const target of targets) out.push({ t: 'play', hand, target })
  })
  return out
}

function hurtMinion(s: BState, side: 0 | 1, lane: number, n: number, ev: BEv[], venom = false): void {
  const m = s.sides[side].board[lane]
  if (!m || n <= 0) return
  if (m.shield) {
    m.shield = false
    ev.push({ k: 'dmg', side, lane, n: 0 })
    return
  }
  m.hp -= n
  ev.push({ k: 'dmg', side, lane, n })
  if (m.hp <= 0 || venom) {
    s.sides[side].board[lane] = null
    ev.push({ k: 'die', side, lane })
  }
}
function hurtHero(s: BState, side: 0 | 1, n: number, ev: BEv[]): void {
  if (n <= 0) return
  s.sides[side].hp -= n
  ev.push({ k: 'dmg', side, lane: -1, n })
  if (s.sides[side].hp <= 0) s.over = side === 0 ? 1 : 0
}

/** Apply an action in place. Returns events, or null if illegal. */
export function apply(s: BState, a: Action, rng?: Rng): BEv[] | null {
  void rng
  if (s.over !== null) return null
  const ev: BEv[] = []
  const who = s.turn
  const foe = (who === 0 ? 1 : 0) as 0 | 1
  const me = s.sides[who]
  if (a.t === 'end') {
    // battle: every ready minion attacks the minion in its lane (or the hero)
    for (let lane = 0; lane < LANES; lane++) {
      const m = me.board[lane]
      if (!m || s.over !== null) continue
      if (m.stunned) {
        m.stunned = false
        continue
      }
      if (m.sick && !m.kw.includes('charge')) continue
      ev.push({ k: 'attack', side: who, lane })
      const d = s.sides[foe].board[lane]
      if (m.kw.includes('splash')) {
        for (const adj of [lane - 1, lane + 1]) if (adj >= 0 && adj < LANES) hurtMinion(s, foe, adj, 1, ev)
      }
      if (d) {
        const swift = m.kw.includes('swift')
        const dSwift = d.kw.includes('swift')
        const dmgToD = m.atk
        const dmgToM = d.atk
        if (swift && !dSwift) {
          const before = s.sides[foe].board[lane]
          hurtMinion(s, foe, lane, dmgToD, ev, m.kw.includes('venom') && dmgToD > 0 && !before?.shield)
          if (s.sides[foe].board[lane]) {
            hurtMinion(s, who, lane, dmgToM, ev, d.kw.includes('venom') && dmgToM > 0 && !m.shield)
          }
        } else if (dSwift && !swift) {
          hurtMinion(s, who, lane, dmgToM, ev, d.kw.includes('venom') && dmgToM > 0 && !m.shield)
          if (s.sides[who].board[lane]) hurtMinion(s, foe, lane, dmgToD, ev, m.kw.includes('venom') && dmgToD > 0 && !d.shield)
        } else {
          const mShield = m.shield
          const dShield = d.shield
          hurtMinion(s, foe, lane, dmgToD, ev, m.kw.includes('venom') && dmgToD > 0 && !dShield)
          hurtMinion(s, who, lane, dmgToM, ev, d.kw.includes('venom') && dmgToM > 0 && !mShield)
        }
        if (d.kw.includes('thorns') && s.sides[who].board[lane]) hurtMinion(s, who, lane, 1, ev)
      } else hurtHero(s, foe, m.atk, ev)
    }
    if (s.over === null) ev.push(...startTurn(s, foe))
    return ev
  }
  const id = me.hand[a.hand]
  const c = id ? BCARD_BY_ID.get(id) : undefined
  if (!c || c.cost > me.mana) return null
  if (c.kind === 'minion') {
    if (a.lane === undefined || a.lane < 0 || a.lane >= LANES || me.board[a.lane]) return null
    me.mana -= c.cost
    me.hand.splice(a.hand, 1)
    const m: Minion = { id: s.nextId++, card: c.id, atk: c.atk!, hp: c.hp!, maxHp: c.hp!, kw: [...(c.kw ?? [])], sick: true, shield: !!c.kw?.includes('shield'), stunned: false }
    me.board[a.lane] = m
    ev.push({ k: 'summon', side: who, lane: a.lane })
    if (c.bc === 'rally') {
      me.board.forEach((o, i) => {
        if (o && o !== m) {
          o.atk++
          o.hp++
          o.maxHp++
          ev.push({ k: 'buff', side: who, lane: i })
        }
      })
    } else if (c.bc === 'draw') draw(s, who, ev)
    else if (c.bc === 'burn') hurtHero(s, foe, c.n ?? 2, ev)
    else if (c.bc === 'heal') {
      const h = Math.min(c.n ?? 3, HERO_HP - me.hp)
      me.hp += h
      ev.push({ k: 'heal', side: who, lane: -1, n: h })
    }
    return ev
  }
  // spells
  const need = needsTarget(c)
  const t = a.target
  if (need) {
    if (!t) return null
    const tgt = t.lane === -1 ? 'hero' : s.sides[t.side].board[t.lane]
    if (!tgt) return null
    if (need === 'enemy' && (t.side !== foe || t.lane === -1)) return null
    if (need === 'friend' && (t.side !== who || t.lane === -1)) return null
    if (t.lane === -1 && c.fx !== 'dmg' && c.fx !== 'heal') return null
  }
  me.mana -= c.cost
  me.hand.splice(a.hand, 1)
  switch (c.fx) {
    case 'dmg':
      if (t!.lane === -1) hurtHero(s, t!.side, c.n!, ev)
      else hurtMinion(s, t!.side, t!.lane, c.n!, ev)
      break
    case 'heal': {
      if (t!.lane === -1) {
        const h = Math.min(c.n!, HERO_HP - s.sides[t!.side].hp)
        s.sides[t!.side].hp += h
        ev.push({ k: 'heal', side: t!.side, lane: -1, n: h })
      } else {
        const m = s.sides[t!.side].board[t!.lane]!
        const h = Math.min(c.n!, m.maxHp - m.hp)
        m.hp += h
        ev.push({ k: 'heal', side: t!.side, lane: t!.lane, n: h })
      }
      break
    }
    case 'buffAll':
      me.board.forEach((m, i) => {
        if (m) {
          m.atk += c.n!
          m.hp += c.n!
          m.maxHp += c.n!
          ev.push({ k: 'buff', side: who, lane: i })
        }
      })
      break
    case 'draw':
      for (let i = 0; i < c.n!; i++) draw(s, who, ev)
      break
    case 'kill':
      s.sides[t!.side].board[t!.lane] = null
      ev.push({ k: 'die', side: t!.side, lane: t!.lane })
      break
    case 'stun':
      s.sides[t!.side].board[t!.lane]!.stunned = true
      ev.push({ k: 'buff', side: t!.side, lane: t!.lane })
      break
    case 'sweep':
      for (let i = 0; i < LANES; i++) hurtMinion(s, foe, i, c.n!, ev)
      break
    case 'shield':
      s.sides[t!.side].board[t!.lane]!.shield = true
      ev.push({ k: 'buff', side: t!.side, lane: t!.lane })
      break
    case 'mana':
      me.mana += c.n!
      break
    case 'face':
      hurtHero(s, foe, c.n!, ev)
      break
  }
  return ev
}

// ---------------------------------------------------------------- AI
/** Score of a board position for the side `who` (higher is better). */
export function evaluate(s: BState, who: 0 | 1): number {
  const me = s.sides[who]
  const foe = s.sides[who === 0 ? 1 : 0]
  if (s.over === who) return 1e6
  if (s.over !== null) return -1e6
  let v = (me.hp - foe.hp) * 3
  for (const m of me.board) if (m) v += m.atk * 2 + m.hp * 1.5 + (m.kw.length ? 2 : 0) + (m.shield ? 2 : 0)
  for (const m of foe.board) if (m) v -= m.atk * 2 + m.hp * 1.5 + (m.kw.length ? 2 : 0) + (m.shield ? 2 : 0)
  v += me.hand.length * 0.8 - foe.hand.length * 0.8
  return v
}

/** Choose the next action for the side to move. diff: 0 random-ish, 1 greedy, 2 greedy with end-of-turn lookahead. */
export function aiChoose(s: BState, diff: 0 | 1 | 2, rng: Rng): Action {
  const acts = legalActions(s).filter((a) => a.t === 'play')
  if (!acts.length) return { t: 'end' }
  const who = s.turn
  if (diff === 0) {
    if (rng.chance(0.25)) return { t: 'end' }
    return rng.pick(acts)
  }
  let best: Action = { t: 'end' }
  let bestV = -Infinity
  const consider = (a: Action) => {
    const c = cloneB(s)
    if (!apply(c, a)) return
    let v: number
    if (diff === 2) {
      // look ahead through our own battle phase
      const c2 = cloneB(c)
      apply(c2, { t: 'end' })
      v = evaluate(c2, who) * 0.6 + evaluate(c, who) * 0.4
    } else v = evaluate(c, who)
    // prefer spending mana efficiently
    const spent = a.t === 'play' ? BCARD_BY_ID.get(s.sides[who].hand[a.hand])!.cost : 0
    v += spent * 0.6 + rng() * 0.2
    if (v > bestV) {
      bestV = v
      best = a
    }
  }
  for (const a of acts) consider(a)
  // only end the turn when nothing improves on the current position
  const base = diff === 2 ? (() => {
    const c = cloneB(s)
    apply(c, { t: 'end' })
    return evaluate(c, who)
  })() : evaluate(s, who)
  const cur = diff === 2 ? base : base
  if (bestV < cur - 1.5 && s.sides[who].mana < 2) return { t: 'end' }
  return best
}
