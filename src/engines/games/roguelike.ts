// Roguelike: turn-based dungeon crawler with fog of war, themed foes, items, XP and depth as score; `stealth` swaps combat for guard patrols.
// Variants from the game text (logic pickRogue): allies (healer / escort shrine / minions / pet), spell kits with mana, bow, dice combat, errands,
// slayer contracts, turn timer, air meter, noise, cursed relics, unidentified potions, real-time, mimic chests, compass, one-room levels.
import { Bag, byDiff, createStage, emoji, isTouch, keys, loop, makeRng, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'
import { bfsField, canStep, computeFov, findPath, genLevel, los, pickRogue, type Level } from '../logic/roguelike'

type P = { x: number; y: number }

interface Mon {
  x: number; y: number
  vx: number; vy: number
  hp: number; maxhp: number; atk: number; xp: number
  kind: 'grunt' | 'brute' | 'archer' | 'wisp' | 'boss' | 'guard'
  face: string
  awake: boolean
  cd: number
  skip: number
  /** Guard state. */
  face2: P
  route: P[]
  ri: number
  st: 'patrol' | 'sus' | 'chase' | 'stun'
  sus: number
  stun: number
  lost: number
  last: P | null
  flash: number
  target?: boolean
}

type GroundKind = 'heal' | 'might' | 'tele' | 'fire' | 'map' | 'smoke' | 'weapon' | 'armor' | 'gold' | 'air' | 'relic' | 'parcel' | 'chest' | 'potion'
interface Ground { x: number; y: number; kind: GroundKind; tier: number; amount: number }
interface Ally { x: number; y: number; vx: number; vy: number; hp: number; max: number; face: string; kind: 'healer' | 'shrine' | 'minion' | 'pet'; life: number; cd: number }
const SPELLS = {
  wizard: [['🔥', 'Fire burst', 3], ['✨', 'Blink', 2], ['💚', 'Heal', 4]],
  druid: [['🐻', 'Bear form', 3], ['🐺', 'Wolf dash', 2], ['🌿', 'Regrow', 4]],
  necro: [['💀', 'Raise minion', 3], ['🩸', 'Drain life', 2], ['💚', 'Mend', 4]],
} as const
const RELICS = ['Crown of Might: +3 attack, -6 max HP', 'Vampire Fang: heal on kills, -4 max HP', 'Greedy Idol: double gold, foes wake up', 'Iron Mask: +2 defence, -2 attack', 'Glass Eye: see the whole map, -5 max HP']
const CHESS_FOES = ['♟️', '♞', '♝', '♜', '♛']

const CONS: Record<string, { emoji: string; glyph: string; name: string; color: string }> = {
  heal: { emoji: '🧪', glyph: '!', name: 'healing potion', color: '#ff6b81' },
  might: { emoji: '⚗️', glyph: '!', name: 'potion of might', color: '#ffa94d' },
  tele: { emoji: '📜', glyph: '?', name: 'scroll of teleport', color: '#74c0fc' },
  fire: { emoji: '🔥', glyph: '?', name: 'scroll of fire', color: '#ff8c42' },
  map: { emoji: '🗺️', glyph: '?', name: 'scroll of mapping', color: '#b197fc' },
  smoke: { emoji: '💨', glyph: '*', name: 'smoke bomb', color: '#adb5bd' },
  potion0: { emoji: '🧪', glyph: '!', name: 'red potion', color: '#ff6b81' },
  potion1: { emoji: '🧪', glyph: '!', name: 'blue potion', color: '#74c0fc' },
  potion2: { emoji: '🧪', glyph: '!', name: 'green potion', color: '#8ce99a' },
  potion3: { emoji: '🧪', glyph: '!', name: 'yellow potion', color: '#ffe066' },
}
const WEAPONS = [['🗡️', 'dagger', 1], ['⚔️', 'sword', 3], ['🪓', 'axe', 5], ['🔱', 'trident', 8]] as const
const ARMORS = [['🥋', 'padded vest', 1], ['🛡️', 'shield', 2], ['⛑️', 'plate armour', 4]] as const

const engine: Engine = {
  start(env) {
    const { theme: t, mods } = env
    const bag = new Bag()
    const O = pickRogue(`${env.name} ${env.desc}`, mods, t.id)
    const { stealth, dark, ascii, kind, endless } = O
    const heroFace = O.chess ? '♚' : t.hero
    const goal = endless ? 999 : stealth ? byDiff(env, 6, 8, 10) : byDiff(env, 7, 10, 13)
    const baseSeed = mods.has('daily') ? Number(new Date().toISOString().slice(0, 10).replace(/-/g, '')) : env.seed

    // ---- layout
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const touch = isTouch()
    const T = 32
    const W = portrait ? 480 : 960
    const PAD = portrait && touch ? 150 : 0
    const H = portrait ? 760 + PAD : 540
    const TOP = 40
    const PANEL = portrait ? 118 : 100
    const mapH = H - TOP - PANEL - PAD
    const VW = Math.floor(W / T)
    const VH = Math.floor(mapH / T)
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const ptr = pointer(st)
    const fx = new Particles()
    const shake = new Shake()
    bag.add(() => k.dispose())
    bag.add(() => ptr.dispose())
    bag.add(() => st.dispose())
    bag.add(vpad(env.host, k, 'dpad', [{ action: 'a', label: O.bow ? '🏹' : '⏳' }, { action: 'b', label: stealth ? (O.emp ? '⚡' : '💨') : '🧪' }]))
    if (O.gb) st.canvas.style.filter = 'grayscale(1) sepia(1) hue-rotate(38deg) saturate(2.2) contrast(1.15)'

    // ---- state
    let depth = 1
    let lv!: Level
    let explored: Uint8Array
    let visible: Uint8Array
    let wallShow: Uint8Array
    let mons: Mon[] = []
    let ground: Ground[] = []
    const hero = { x: 0, y: 0, vx: 0, vy: 0 }
    const pl = { hp: byDiff(env, 28, 20, 16), maxhp: byDiff(env, 28, 20, 16), atk: 2, def: 0, xp: 0, lvl: 1, weapon: -1, armor: -1, gold: 0, kills: 0, lives: 3 }
    const inv: { id: string; n: number }[] = []
    const allies: Ally[] = []
    const mana = { v: 12, max: 12 }
    let air = 100
    let turnsLeft = byDiff(env, 280, 230, 200)
    let noise = 0
    let rtT = 0
    let parcelsLeft = 0
    let targetAlive = false
    let bearT = 0
    let lifeSteal = 0
    let goldMul = 1
    const kit = O.spells ? SPELLS[O.spells] : null
    const invCap = kit ? 3 : 6
    const potionFx = rngShuffle(['heal', 'might', 'poison', 'tele'])
    const potionKnown = [false, false, false, false]
    function rngShuffle<T>(a: T[]): T[] {
      const b = [...a]
      for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(env.rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
      return b
    }
    let log: { t: string; c: string }[] = []
    let turn = 0
    let regen = 0
    let over = false
    let overTimer = 0
    let msgFlash = 0
    let travel: P[] = []
    let travelT = 0
    let time = 0
    let dist: Int16Array<ArrayBufferLike> = new Int16Array(0)
    let cones = new Uint8Array(0)
    let grace = 0
    const floaters: { x: number; y: number; s: string; c: string; life: number }[] = []
    const shots: { x0: number; y0: number; x1: number; y1: number; life: number }[] = []
    const radius = dark ? 4 : stealth ? 9 : 8

    const say = (s: string, c = t.fg) => {
      log.push({ t: s, c })
      if (log.length > 40) log = log.slice(-30)
      msgFlash = 1
    }
    const at = (x: number, y: number) => y * lv.w + x
    const rng = env.rng

    function hud() {
      env.score(depth * 100 + pl.kills * 5 + Math.floor(pl.gold / 5) + (stealth ? pl.lives * 25 : 0))
      env.status(stealth ? `Floor ${depth} · ${'❤️'.repeat(Math.max(0, pl.lives))}` : `Depth ${depth} · HP ${Math.max(0, pl.hp)}/${pl.maxhp} · Lv ${pl.lvl}${O.timer ? ` · ⏳${turnsLeft}` : ''}${O.air ? ` · 🫧${air}` : ''}${kit ? ` · MP ${mana.v}` : ''}`)
    }

    // ---- level setup
    function newLevel() {
      const lrng = makeRng((baseSeed * 2654435761 + depth * 40503) >>> 0)
      const lw = kind === 'room' ? VW : 48 + Math.min(depth, 6) * 2
      const lh = kind === 'room' ? VH : 30
      lv = genLevel(lrng, lw, lh, kind)
      explored = new Uint8Array(lv.w * lv.h)
      visible = new Uint8Array(lv.w * lv.h)
      cones = new Uint8Array(lv.w * lv.h)
      wallShow = new Uint8Array(lv.w * lv.h)
      for (let x = 0; x < lv.w; x++) for (let y = 0; y < lv.h; y++) {
        if (!lv.tiles[at(x, y)]) {
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            const yy = y + dy
            if (xx >= 0 && yy >= 0 && xx < lv.w && yy < lv.h && lv.tiles[at(xx, yy)]) wallShow[at(x, y)] = 1
          }
        }
      }
      hero.x = hero.vx = lv.start.x
      hero.y = hero.vy = lv.start.y
      mons = []
      ground = []
      travel = []
      noise = 0
      for (let i = allies.length - 1; i >= 0; i--) if (allies[i].kind === 'minion') allies.splice(i, 1)
      const dStart = bfsField(lv.tiles, lv.w, lv.h, lv.start.x, lv.start.y, 9999)
      const spots: P[] = []
      for (let i = 0; i < lv.tiles.length; i++) if (lv.tiles[i] && dStart[i] >= 7 && i !== at(lv.stairs.x, lv.stairs.y)) spots.push({ x: i % lv.w, y: Math.floor(i / lv.w) })
      const pick = () => spots.splice(lrng.int(0, spots.length - 1), 1)[0] ?? { x: lv.stairs.x, y: lv.stairs.y }
      const crowd = byDiff(env, 0.8, 1, 1.25)
      if (stealth) populateGuards(lrng, pick, crowd)
      else populateMonsters(pick, crowd)
      const nItems = 4 + lrng.int(0, 2)
      for (let i = 0; i < nItems; i++) {
        const p = pick()
        const r = lrng()
        let g: Ground
        if (stealth) g = r < 0.45 ? { x: p.x, y: p.y, kind: 'smoke', tier: 0, amount: 1 } : { x: p.x, y: p.y, kind: 'gold', tier: 0, amount: 5 + depth * 3 }
        else if (r < 0.32) g = { x: p.x, y: p.y, kind: 'heal', tier: 0, amount: 1 }
        else if (r < 0.5) g = { x: p.x, y: p.y, kind: lrng.pick(['tele', 'fire', 'map'] as const), tier: 0, amount: 1 }
        else if (r < 0.62) g = { x: p.x, y: p.y, kind: 'weapon', tier: Math.min(3, Math.floor((depth + lrng.int(0, 2)) / 3)), amount: 1 }
        else if (r < 0.72) g = { x: p.x, y: p.y, kind: 'armor', tier: Math.min(2, Math.floor((depth + lrng.int(0, 2)) / 4)), amount: 1 }
        else if (r < 0.77) g = { x: p.x, y: p.y, kind: 'might', tier: 0, amount: 1 }
        else g = { x: p.x, y: p.y, kind: 'gold', tier: 0, amount: lrng.int(4, 9) + depth * 3 }
        if (O.unknown && (g.kind === 'heal' || g.kind === 'might')) g = { x: g.x, y: g.y, kind: 'potion', tier: lrng.int(0, 3), amount: 1 }
        ground.push(g)
      }
      if (O.errand) {
        parcelsLeft = 2 + Math.floor(depth / 3)
        for (let i = 0; i < parcelsLeft; i++) { const p = pick(); ground.push({ x: p.x, y: p.y, kind: 'parcel', tier: 0, amount: 1 }) }
      } else parcelsLeft = 0
      if (O.contract) {
        const cand = mons.filter((m) => m.kind !== 'boss')
        const m = cand[lrng.int(0, Math.max(0, cand.length - 1))]
        if (m) { m.target = true; m.hp = m.maxhp = Math.round(m.maxhp * 2.5); m.atk = Math.round(m.atk * 1.3); m.xp *= 3; m.awake = true; targetAlive = true; m.face = t.foes[t.foes.length - 1] ?? m.face }
      } else targetAlive = false
      if (O.air) for (let i = 0; i < 3; i++) { const p = pick(); ground.push({ x: p.x, y: p.y, kind: 'air', tier: 0, amount: 40 }) }
      if (O.relic && depth % 2 === 1) { const p = pick(); ground.push({ x: p.x, y: p.y, kind: 'relic', tier: lrng.int(0, RELICS.length - 1), amount: 1 }) }
      if (O.chest) for (let i = 0; i < 6; i++) { const p = pick(); ground.push({ x: p.x, y: p.y, kind: 'chest', tier: 0, amount: 1 }) }
      // persistent companions follow you down; minions do not
      if (O.ally && O.ally !== 'minion') {
        let a = allies.find((q) => q.kind === O.ally)
        if (!a) {
          const face = O.ally === 'shrine' ? '🏮' : (t.heroes.find((h) => h !== t.hero) ?? '🧑')
          a = { x: 0, y: 0, vx: 0, vy: 0, hp: O.ally === 'shrine' ? 14 : 20, max: O.ally === 'shrine' ? 14 : 20, face, kind: O.ally, life: 9999, cd: 0 }
          allies.push(a)
        }
        const sp = nearFree(hero.x, hero.y, 1)
        a.x = a.vx = sp.x
        a.y = a.vy = sp.y
        if (O.ally === 'shrine') a.hp = Math.min(a.max, a.hp + 6)
      }
      refreshView()
      dist = bfsField(lv.tiles, lv.w, lv.h, hero.x, hero.y, 30)
      say(stealth ? `Floor ${depth}. Stay out of the light cones. Find the exit.` : depth % 5 === 0 && !stealth ? `Depth ${depth}. Something huge waits here.` : `You arrive on depth ${depth}.`, t.accent)
      hud()
    }

    const blank = (): Mon => ({ x: 0, y: 0, vx: 0, vy: 0, hp: 1, maxhp: 1, atk: 1, xp: 1, kind: 'grunt', face: '', awake: false, cd: 0, skip: 0, face2: { x: 1, y: 0 }, route: [], ri: 0, st: 'patrol', sus: 0, stun: 0, lost: 0, last: null, flash: 0 })

    function populateMonsters(pick: () => P, crowd: number) {
      const n = Math.round((4 + depth * 1.3) * crowd)
      const foes = O.chess ? CHESS_FOES : t.foes.length ? t.foes : ['👾']
      for (let i = 0; i < n; i++) {
        const p = pick()
        const r = rng()
        let kd: Mon['kind'] = 'grunt'
        if (depth >= 3 && r < 0.22) kd = 'brute'
        else if (depth >= 2 && r < 0.4) kd = 'archer'
        else if (depth >= 2 && r < 0.55) kd = 'wisp'
        const hpBase = 4 + depth * 2.4
        const m = blank()
        const mult = kd === 'brute' ? 2 : kd === 'archer' ? 0.7 : kd === 'wisp' ? 0.6 : 1
        m.x = m.vx = p.x
        m.y = m.vy = p.y
        m.kind = kd
        m.hp = m.maxhp = Math.max(2, Math.round(hpBase * mult))
        m.atk = Math.max(1, Math.round((1 + depth * 0.85) * (kd === 'brute' ? 1.4 : kd === 'wisp' ? 0.9 : 1)))
        m.xp = 3 + depth + (kd === 'brute' ? 4 : 0)
        m.face = foes[(kd === 'grunt' ? 0 : kd === 'brute' ? 1 : kd === 'archer' ? 2 : 3) % foes.length]
        m.awake = rng.chance(0.4)
        mons.push(m)
      }
      if (depth % 5 === 0) {
        const p = { x: lv.stairs.x, y: lv.stairs.y }
        const spot = nearFree(p.x, p.y, 2)
        const b = blank()
        b.x = b.vx = spot.x
        b.y = b.vy = spot.y
        b.kind = 'boss'
        b.hp = b.maxhp = Math.round((4 + depth * 2.4) * 6)
        b.atk = Math.round(2 + depth * 1.3)
        b.xp = 30 + depth * 5
        b.face = foes[foes.length - 1]
        b.awake = true
        mons.push(b)
      }
    }

    function populateGuards(lrng: ReturnType<typeof makeRng>, pick: () => P, crowd: number) {
      const n = Math.min(11, Math.round((2 + depth * 1.1) * crowd))
      const foes = t.foes.length ? t.foes : ['👾']
      for (let i = 0; i < n; i++) {
        const a = pick()
        const route = [a]
        const legs = lrng.int(1, 2)
        for (let j = 0; j < legs; j++) route.push(pick())
        const m = blank()
        m.kind = 'guard'
        m.x = m.vx = a.x
        m.y = m.vy = a.y
        m.route = route
        m.ri = 1 % route.length
        m.face = foes[i % foes.length]
        m.awake = true
        m.hp = m.maxhp = 1
        mons.push(m)
      }
    }

    function nearFree(x: number, y: number, r: number): P {
      for (let rr = 1; rr <= r + 6; rr++) {
        for (let dy = -rr; dy <= rr; dy++) {
          for (let dx = -rr; dx <= rr; dx++) {
            const xx = x + dx
            const yy = y + dy
            if (xx > 0 && yy > 0 && xx < lv.w - 1 && yy < lv.h - 1 && lv.tiles[at(xx, yy)] && !monAt(xx, yy) && !(xx === hero.x && yy === hero.y)) return { x: xx, y: yy }
          }
        }
      }
      return { x, y }
    }

    const monAt = (x: number, y: number) => mons.find((m) => m.x === x && m.y === y && m.hp > 0)

    function refreshView() {
      computeFov(lv.tiles, lv.w, lv.h, hero.x, hero.y, radius, visible)
      for (let i = 0; i < visible.length; i++) if (visible[i]) explored[i] = 1
    }

    // ---- combat helpers
    const weaponBonus = () => (pl.weapon >= 0 ? WEAPONS[pl.weapon][2] : 0)
    const armorBonus = () => (pl.armor >= 0 ? ARMORS[pl.armor][2] : 0)
    const px = (x: number) => (x - camX) * T
    const py = (y: number) => TOP + (y - camY) * T
    let camX = 0
    let camY = 0

    function float(x: number, y: number, s: string, c: string) {
      floaters.push({ x: x * T + T / 2, y: y * T, s, c, life: 0.9 })
    }

    function damageMon(m: Mon, dmg: number, src = 'You') {
      m.hp -= dmg
      m.flash = 0.15
      m.awake = true
      float(m.x, m.y, `-${dmg}`, '#fff')
      fx.burst((m.x + 0.5) * T, (m.y + 0.5) * T, t.danger, 8, 120)
      if (m.hp <= 0) {
        pl.kills++
        pl.xp += m.xp
        say(`${src} destroyed the ${m.face}. (+${m.xp} xp)`, t.good)
        if (lifeSteal && pl.hp < pl.maxhp) { pl.hp = Math.min(pl.maxhp, pl.hp + lifeSteal); float(hero.x, hero.y, `+${lifeSteal}`, t.good) }
        if (m.target) { targetAlive = false; say('The contract is fulfilled! The stairs unseal.', t.accent) }
        fx.burst((m.x + 0.5) * T, (m.y + 0.5) * T, t.accent, 18, 200, 4)
        env.sfx('boom')
        shake.kick(3)
        if (m.kind === 'boss') {
          ground.push({ x: m.x, y: m.y, kind: 'heal', tier: 0, amount: 1 }, { x: m.x, y: m.y, kind: 'gold', tier: 0, amount: 40 + depth * 6 })
          say('The guardian falls. Its hoard spills out!', t.accent)
        } else if (rng.chance(0.18)) ground.push({ x: m.x, y: m.y, kind: rng.chance(0.6) ? 'heal' : 'gold', tier: 0, amount: 6 + depth })
        checkLevelUp()
      }
    }

    function checkLevelUp() {
      while (pl.xp >= pl.lvl * 14) {
        pl.xp -= pl.lvl * 14
        pl.lvl++
        pl.maxhp += 5
        pl.hp = Math.min(pl.maxhp, pl.hp + 10)
        if (pl.lvl % 2 === 0) pl.atk++
        say(`Level up! You are now level ${pl.lvl}.`, t.accent)
        env.sfx('power')
        fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, t.accent2, 24, 180, 4)
        float(hero.x, hero.y - 0.5, 'LEVEL UP', t.accent)
      }
    }

    function hurtPlayer(dmg: number, who: string) {
      const d = Math.max(1, dmg - armorBonus())
      pl.hp -= d
      regen = 0
      float(hero.x, hero.y, `-${d}`, t.danger)
      say(`${who} hits you for ${d}.`, t.danger)
      env.sfx('hit')
      shake.kick(5)
      fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, t.danger, 10, 140)
      if (pl.hp <= 0) die()
    }

    function die() {
      if (over) return
      over = true
      overTimer = 1.6
      env.sfx('lose')
      say(`You die on depth ${depth}.`, t.danger)
      travel = []
    }

    // ---- player actions
    function playerMove(dx: number, dy: number): boolean {
      if (over) return false
      if (dx === 0 && dy === 0) {
        noise = Math.max(0, noise - 3)
        endTurn()
        return true
      }
      const nx = hero.x + dx
      const ny = hero.y + dy
      if (!lv.tiles[at(nx, ny)]) return false
      if (dx && dy && !canStep(lv.tiles, lv.w, hero.x, hero.y, dx, dy)) return false
      const m = monAt(nx, ny)
      if (m) {
        if (stealth) {
          const behind = m.st !== 'chase' && m.st !== 'stun' && (m.face2.x * (hero.x - m.x) + m.face2.y * (hero.y - m.y) <= 0)
          if (m.st === 'stun') {
            say('The guard is already out cold.', t.fg)
            return false
          }
          if (behind) {
            m.st = 'stun'
            m.stun = 30
            say('You silently take the guard down.', t.good)
            env.sfx('hit')
            fx.burst((m.x + 0.5) * T, (m.y + 0.5) * T, t.accent, 10, 100)
          } else {
            say('The guard spots you at point blank range!', t.danger)
            caught()
            return true
          }
        } else {
          const roll = rng.int(1, 6)
          const crit = O.dice ? roll === 6 : rng.chance(0.1)
          if (rng.chance(0.92)) {
            const base = O.dice ? roll + Math.floor((pl.atk + weaponBonus()) / 2) + 1 : pl.atk + weaponBonus() + rng.int(0, 2)
            const dmg = (base + (bearT > 0 ? 3 : 0)) * (crit ? 2 : 1)
            say(`${O.dice ? `🎲${roll}: ` : ''}You hit the ${m.face} for ${dmg}${crit ? ' (critical!)' : ''}.`, crit ? t.accent : t.fg)
            env.sfx('hit')
            damageMon(m, dmg)
          } else {
            say(`You miss the ${m.face}.`, '#9aa')
            float(m.x, m.y, 'miss', '#aaa')
          }
          hero.vx += dx * 0.3
          hero.vy += dy * 0.3
        }
        endTurn()
        return true
      }
      hero.x = nx
      hero.y = ny
      if (O.noise) noise = Math.min(7, noise + 2)
      pickup()
      if (nx === lv.stairs.x && ny === lv.stairs.y) {
        if (stairsLocked()) {
          say(parcelsLeft > 0 ? `Sealed: ${parcelsLeft} parcel${parcelsLeft > 1 ? 's' : ''} still to collect.` : 'The stairs are sealed until the contract target falls.', t.accent)
          endTurn()
          return true
        }
        descend()
        return true
      }
      endTurn()
      return true
    }
    const stairsLocked = () => parcelsLeft > 0 || targetAlive

    function pickup() {
      for (let i = ground.length - 1; i >= 0; i--) {
        const g = ground[i]
        if (g.x !== hero.x || g.y !== hero.y) continue
        if (g.kind === 'gold') {
          const amt = g.amount * goldMul
          pl.gold += amt
          say(`You pick up ${amt} gold.`, t.accent)
          float(hero.x, hero.y - 0.4, `+${amt}`, t.accent)
          env.sfx('point')
          ground.splice(i, 1)
        } else if (g.kind === 'air') {
          air = Math.min(100, air + g.amount)
          say('You breathe from an air bubble.', '#74c0fc')
          float(hero.x, hero.y - 0.4, '+air', '#74c0fc')
          env.sfx('point')
          ground.splice(i, 1)
        } else if (g.kind === 'parcel') {
          parcelsLeft--
          say(parcelsLeft > 0 ? `Parcel collected. ${parcelsLeft} to go.` : 'All parcels collected. The stairs unseal.', t.accent)
          env.sfx('power')
          ground.splice(i, 1)
        } else if (g.kind === 'relic') {
          takeRelic(g.tier)
          ground.splice(i, 1)
        } else if (g.kind === 'chest') {
          ground.splice(i, 1)
          if (rng.chance(0.35)) {
            const sp = nearFree(g.x, g.y, 1)
            const b = blank()
            b.x = b.vx = sp.x
            b.y = b.vy = sp.y
            b.kind = 'brute'
            b.hp = b.maxhp = Math.round((4 + depth * 2.4) * 2)
            b.atk = Math.round(2 + depth * 1.2)
            b.xp = 8 + depth * 2
            b.face = '📦'
            b.awake = true
            mons.push(b)
            say('The chest sprouts teeth. It is a mimic!', t.danger)
            env.sfx('hit')
          } else {
            const amt = (6 + depth * 3 + rng.int(0, 8)) * goldMul
            pl.gold += amt
            if (rng.chance(0.4) && inv.length < invCap) inv.push({ id: O.unknown ? 'potion0' : 'heal', n: 1 })
            say(`The chest holds ${amt} gold!`, t.accent)
            env.sfx('power')
          }
        } else if (g.kind === 'potion') {
          const id = `potion${g.tier}`
          const have = inv.find((q) => q.id === id)
          if (have) have.n++
          else if (inv.length < invCap) inv.push({ id, n: 1 })
          else { say('Your pack is full.', '#9aa'); continue }
          say(`You pick up a ${CONS[id].name}.`, CONS[id].color)
          env.sfx('point')
          ground.splice(i, 1)
        } else if (g.kind === 'weapon') {
          const w = WEAPONS[g.tier]
          if (g.tier > pl.weapon) {
            pl.weapon = g.tier
            say(`You wield the ${w[1]} (+${w[2]} attack).`, t.good)
            env.sfx('power')
          } else say(`You leave the ${w[1]}. Yours is better.`, '#9aa')
          ground.splice(i, 1)
        } else if (g.kind === 'armor') {
          const a = ARMORS[g.tier]
          if (g.tier > pl.armor) {
            pl.armor = g.tier
            say(`You equip the ${a[1]} (+${a[2]} defence).`, t.good)
            env.sfx('power')
          } else say(`You leave the ${a[1]}. Yours is better.`, '#9aa')
          ground.splice(i, 1)
        } else {
          const have = inv.find((s) => s.id === g.kind)
          if (have) have.n++
          else if (inv.length < invCap) inv.push({ id: g.kind, n: 1 })
          else {
            say('Your pack is full.', '#9aa')
            continue
          }
          say(`You pick up a ${CONS[g.kind].name}.`, CONS[g.kind].color)
          env.sfx('point')
          ground.splice(i, 1)
        }
      }
    }

    function consumeItem(i: number) {
      const s = inv[i]
      if (!s || over) return
      let id = s.id
      let used = true
      if (/^potion\d$/.test(id)) {
        const n = Number(id.slice(6))
        const fxk = potionFx[n]
        const first = !potionKnown[n]
        potionKnown[n] = true
        CONS[id].name = `${fxk === 'heal' ? 'healing' : fxk === 'might' ? 'might' : fxk === 'poison' ? 'poison' : 'teleport'} potion`
        if (first) say(`It was a ${CONS[id].name}!`, CONS[id].color)
        if (fxk === 'poison') {
          pl.hp -= 6
          float(hero.x, hero.y, '-6', t.danger)
          say('Poison! It burns going down.', t.danger)
          env.sfx('hit')
          if (pl.hp <= 0) die()
          s.n--
          if (s.n <= 0) inv.splice(i, 1)
          if (!over) endTurn()
          return
        }
        id = fxk
      }
      if (id === 'heal') {
        if (pl.hp >= pl.maxhp) {
          say('You are already healthy.', '#9aa')
          used = false
        } else {
          const h = Math.round(pl.maxhp * 0.5) + 4
          pl.hp = Math.min(pl.maxhp, pl.hp + h)
          say(`You drink the potion and recover ${h} HP.`, t.good)
          float(hero.x, hero.y, `+${h}`, t.good)
          fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, t.good, 14, 100)
        }
      } else if (id === 'might') {
        pl.atk++
        say('You feel stronger! (+1 attack)', t.accent)
        fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, t.accent, 14, 100)
      } else if (id === 'tele') {
        const c = nearFree(rng.int(2, lv.w - 3), rng.int(2, lv.h - 3), 0)
        hero.x = hero.vx = c.x
        hero.y = hero.vy = c.y
        say('The world lurches. You are elsewhere.', '#74c0fc')
        fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, '#74c0fc', 20, 160)
      } else if (id === 'fire') {
        let n = 0
        refreshView()
        for (const m of mons) {
          if (m.hp > 0 && visible[at(m.x, m.y)]) {
            n++
            damageMon(m, 6 + depth * 2, 'The flames')
          }
        }
        say(n ? 'A burst of flame engulfs your foes!' : 'The flames find nothing to burn.', '#ff8c42')
        shake.kick(6)
        env.sfx('boom')
      } else if (id === 'map') {
        explored.fill(1)
        say('The layout of the level flashes through your mind.', '#b197fc')
      } else if (id === 'smoke') {
        let n = 0
        for (const m of mons) {
          if (O.emp || Math.hypot(m.x - hero.x, m.y - hero.y) <= 4.5) {
            m.st = 'stun'
            m.stun = O.emp ? 10 : 7
            n++
          }
        }
        say(O.emp ? 'The power cuts out: every camera and guard goes dark for a while.' : n ? `Smoke blinds ${n} guard${n > 1 ? 's' : ''}.` : 'You release smoke. Nobody was near.', '#adb5bd')
        fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, '#ccc', 26, 110, 6)
      }
      if (!used) return
      env.sfx('power')
      s.n--
      if (s.n <= 0) inv.splice(i, 1)
      endTurn()
    }

    function takeRelic(i: number) {
      say(`Cursed relic! ${RELICS[i]}.`, t.accent)
      env.sfx('power')
      if (i === 0) { pl.atk += 3; pl.maxhp = Math.max(6, pl.maxhp - 6); pl.hp = Math.min(pl.hp, pl.maxhp) } else if (i === 1) { lifeSteal += 2; pl.maxhp = Math.max(6, pl.maxhp - 4); pl.hp = Math.min(pl.hp, pl.maxhp) } else if (i === 2) {
        goldMul = 2
        for (const m of mons) m.awake = true
      } else if (i === 3) { pl.armor = Math.max(pl.armor, 2); pl.atk = Math.max(1, pl.atk - 2) } else { explored.fill(1); pl.maxhp = Math.max(6, pl.maxhp - 5); pl.hp = Math.min(pl.hp, pl.maxhp) }
    }

    // ---- spells (mana kits) and bow
    function cast(i: number) {
      if (!kit || over) return
      const sp = kit[i]
      if (mana.v < sp[2]) { say(`Not enough mana for ${sp[1]} (${sp[2]}).`, '#9aa'); return }
      let ok = true
      if (O.spells === 'wizard' && i === 0) {
        let n = 0
        refreshView()
        for (const m of mons) if (m.hp > 0 && visible[at(m.x, m.y)] && Math.hypot(m.x - hero.x, m.y - hero.y) <= 5) { n++; damageMon(m, 5 + depth * 2, 'Your fire') }
        say(n ? 'Flames burst from your hands!' : 'The flames find nothing.', '#ff8c42')
        shake.kick(5)
        env.sfx('boom')
      } else if ((O.spells === 'wizard' || O.spells === 'druid') && i === 1) {
        const c = nearFree(hero.x + rng.int(-5, 5), hero.y + rng.int(-5, 5), 1)
        hero.x = hero.vx = c.x
        hero.y = hero.vy = c.y
        say(O.spells === 'druid' ? 'You dash as a wolf!' : 'You blink away.', '#74c0fc')
        fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, '#74c0fc', 18, 150)
        pickup()
        if (hero.x === lv.stairs.x && hero.y === lv.stairs.y && !stairsLocked()) { descend(); mana.v -= sp[2]; return }
      } else if (i === 2) {
        const h = Math.round(pl.maxhp * 0.4) + 3
        if (pl.hp >= pl.maxhp) { say('You are already healthy.', '#9aa'); ok = false } else {
          pl.hp = Math.min(pl.maxhp, pl.hp + h)
          float(hero.x, hero.y, `+${h}`, t.good)
          say(`Healing light restores ${h} HP.`, t.good)
          env.sfx('power')
        }
      } else if (O.spells === 'druid' && i === 0) {
        bearT = 10
        say('You take bear form: +3 damage for 10 turns.', t.accent)
        env.sfx('power')
      } else if (O.spells === 'necro' && i === 0) {
        const c = nearFree(hero.x, hero.y, 1)
        allies.push({ x: c.x, y: c.y, vx: hero.x, vy: hero.y, hp: 8 + depth * 2, max: 8 + depth * 2, face: '💀', kind: 'minion', life: 30, cd: 0 })
        say('A skeleton claws out of the floor.', t.accent)
        env.sfx('power')
      } else if (O.spells === 'necro' && i === 1) {
        const tg = nearestVisible(7)
        if (!tg) { say('No target to drain.', '#9aa'); ok = false } else {
          const d = 6 + depth
          damageMon(tg, d, 'Your drain')
          pl.hp = Math.min(pl.maxhp, pl.hp + Math.ceil(d / 2))
          shots.push({ x0: hero.x, y0: hero.y, x1: tg.x, y1: tg.y, life: 0.25 })
        }
      }
      if (!ok) return
      mana.v -= sp[2]
      endTurn()
    }
    function nearestVisible(range: number): Mon | null {
      let best: Mon | null = null
      let bd = 99
      for (const m of mons) {
        if (m.hp <= 0 || !visible[at(m.x, m.y)]) continue
        const d = Math.hypot(m.x - hero.x, m.y - hero.y)
        if (d <= range && d < bd && los(lv.tiles, lv.w, hero.x, hero.y, m.x, m.y)) { bd = d; best = m }
      }
      return best
    }
    function shoot(target?: Mon | null) {
      if (over) return
      const m = target && target.hp > 0 && visible[at(target.x, target.y)] ? target : nearestVisible(7)
      if (!m) { say('Nothing to shoot.', '#9aa'); return }
      shots.push({ x0: hero.x, y0: hero.y, x1: m.x, y1: m.y, life: 0.2 })
      env.sfx('shoot')
      if (rng.chance(0.85)) {
        const dmg = pl.atk + weaponBonus() + rng.int(1, 3) + (bearT > 0 ? 3 : 0)
        say(`Your arrow hits the ${m.face} for ${dmg}.`, t.fg)
        damageMon(m, dmg)
      } else {
        say('Your arrow misses.', '#9aa')
        float(m.x, m.y, 'miss', '#aaa')
      }
      endTurn()
    }

    function quick() {
      const i = inv.findIndex((s) => s.id === (stealth ? 'smoke' : 'heal') || (O.unknown && !stealth && /^potion\d$/.test(s.id) && potionKnown[Number(s.id.slice(6))] && potionFx[Number(s.id.slice(6))] === 'heal'))
      if (i >= 0) consumeItem(i)
      else say(stealth ? 'No smoke bombs.' : 'No healing potions.', '#9aa')
    }

    function descend() {
      env.sfx('win')
      if (depth >= goal) {
        win()
        return
      }
      depth++
      if (O.timer) turnsLeft += 70
      if (O.air) air = Math.min(100, air + 30)
      say(`You descend to depth ${depth}.`, t.accent)
      if (!stealth) {
        pl.hp = Math.min(pl.maxhp, pl.hp + 2)
      }
      newLevel()
    }

    function win() {
      if (over) return
      over = true
      overTimer = 1.4
      pl.kills += 0
      say(stealth ? 'You slip out into the night. Free!' : 'You reach the surface with your life and your loot!', t.good)
      env.score(depth * 100 + pl.kills * 5 + Math.floor(pl.gold / 5) + 300)
      winFlag = true
    }
    let winFlag = false

    // ---- monsters
    function endTurn(timerTick = false) {
      if (O.rt && !timerTick) {
        refreshView()
        dist = bfsField(lv.tiles, lv.w, lv.h, hero.x, hero.y, 30)
        hud()
        return
      }
      turn++
      refreshView()
      if (!stealth && ++regen >= 9 && pl.hp < pl.maxhp) {
        pl.hp++
        regen = 0
      }
      if (kit && turn % 3 === 0 && mana.v < mana.max) mana.v++
      if (bearT > 0) bearT--
      if (O.timer && --turnsLeft <= 0 && !over) { say('Time runs out!', t.danger); die(); return }
      if (O.air && !over) {
        air = Math.max(0, air - 2)
        if (air === 0) hurtPlayer(2, 'The water')
        if (over) return
      }
      dist = bfsField(lv.tiles, lv.w, lv.h, hero.x, hero.y, 30)
      alliesAct()
      if (stealth) guardsAct()
      else monstersAct()
      if (O.noise && noise > 0 && !over) noise = Math.max(0, noise - 1)
      refreshView()
      if (stealth) computeCones()
      hud()
    }

    function alliesAct() {
      for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]
        if (a.hp <= 0) continue
        if (a.kind === 'minion' && --a.life <= 0) { allies.splice(i, 1); continue }
        const foe = mons.find((m) => m.hp > 0 && Math.max(Math.abs(m.x - a.x), Math.abs(m.y - a.y)) <= 1 && canStep(lv.tiles, lv.w, a.x, a.y, m.x - a.x, m.y - a.y))
        if (a.kind === 'healer') {
          a.cd--
          if (a.cd <= 0 && pl.hp < pl.maxhp * 0.6) {
            const h = 4 + Math.floor(depth / 2)
            pl.hp = Math.min(pl.maxhp, pl.hp + h)
            a.cd = 5
            float(hero.x, hero.y, `+${h}`, t.good)
            say(`${a.face} heals you for ${h}.`, t.good)
            fx.burst((hero.x + 0.5) * T, (hero.y + 0.5) * T, t.good, 10, 90)
          }
        }
        if (foe && (a.kind === 'healer' || a.kind === 'minion' || a.kind === 'pet')) {
          const d = a.kind === 'pet' ? 2 + Math.floor(depth / 2) + 1 : a.kind === 'minion' ? 2 + Math.floor(depth / 2) : 1 + Math.floor(depth / 3)
          damageMon(foe, d, `${a.face}`)
          a.vx += (foe.x - a.x) * 0.3
          a.vy += (foe.y - a.y) * 0.3
          continue
        }
        if (a.kind === 'shrine' && turn % 2) continue
        // follow the hero
        const d0 = dist[at(a.x, a.y)]
        if (d0 > 1 || d0 < 0) {
          let best: P | null = null
          let bd = d0 < 0 ? 9999 : d0
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            if (!canStep(lv.tiles, lv.w, a.x, a.y, dx, dy)) continue
            const nx = a.x + dx
            const ny = a.y + dy
            if (monAt(nx, ny) || (nx === hero.x && ny === hero.y) || allies.some((q) => q !== a && q.x === nx && q.y === ny && q.hp > 0)) continue
            const dd = dist[at(nx, ny)]
            if (dd >= 0 && dd < bd) { bd = dd; best = { x: nx, y: ny } }
          }
          if (best) { a.x = best.x; a.y = best.y }
        }
      }
    }
    function hurtAlly(a: Ally, dmg: number, who: string) {
      a.hp -= dmg
      float(a.x, a.y, `-${dmg}`, t.danger)
      env.sfx('hit')
      if (a.hp <= 0) {
        say(`${who} destroys ${a.face}.`, t.danger)
        fx.burst((a.x + 0.5) * T, (a.y + 0.5) * T, t.danger, 14, 140)
        if (a.kind === 'shrine' || a.kind === 'healer') { say(a.kind === 'shrine' ? 'The light shrine goes out. The pilgrimage fails.' : 'Your companion falls.', t.danger); if (a.kind === 'shrine') die() }
        const i = allies.indexOf(a)
        if (i >= 0 && a.kind !== 'shrine') allies.splice(i, 1)
      }
    }

    function stepMon(m: Mon, field: Int16Array, away = false) {
      let best: P | null = null
      const cur = field[at(m.x, m.y)]
      let bd = cur < 0 ? (away ? -1 : 9999) : cur
      const order = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      rng.shuffle(order)
      for (const [dx, dy] of order) {
        if (!canStep(lv.tiles, lv.w, m.x, m.y, dx, dy)) continue
        const nx = m.x + dx
        const ny = m.y + dy
        if (monAt(nx, ny) || (nx === hero.x && ny === hero.y)) continue
        const d = field[at(nx, ny)]
        if (d < 0) continue
        if (away ? d > bd : d < bd) {
          bd = d
          best = { x: nx, y: ny }
        }
      }
      if (best) {
        m.x = best.x
        m.y = best.y
      }
      return !!best
    }

    function monstersAct() {
      for (const m of mons) {
        if (m.hp <= 0 || over) continue
        const d = dist[at(m.x, m.y)]
        const seen = visible[at(m.x, m.y)] === 1
        if (!m.awake) {
          if (seen && d >= 0 && d <= 6 && rng.chance(0.35)) {
            m.awake = true
            float(m.x, m.y - 0.4, '!', t.danger)
          }
          continue
        }
        if (d < 0) continue
        if (m.kind === 'brute' && (turn + m.x) % 2) continue
        if (m.kind === 'wisp' && rng.chance(0.5)) {
          const o = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          const [dx, dy] = rng.pick(o)
          if (canStep(lv.tiles, lv.w, m.x, m.y, dx, dy) && !monAt(m.x + dx, m.y + dy) && !(m.x + dx === hero.x && m.y + dy === hero.y)) {
            m.x += dx
            m.y += dy
          }
          continue
        }
        const adj = Math.max(Math.abs(m.x - hero.x), Math.abs(m.y - hero.y)) <= 1 && canStep(lv.tiles, lv.w, m.x, m.y, hero.x - m.x, hero.y - m.y)
        if (!adj && allies.length) {
          const al = allies.find((q) => q.hp > 0 && Math.max(Math.abs(m.x - q.x), Math.abs(m.y - q.y)) <= 1 && canStep(lv.tiles, lv.w, m.x, m.y, q.x - m.x, q.y - m.y))
          if (al) {
            if (rng.chance(0.8)) hurtAlly(al, Math.max(1, m.atk + rng.int(-1, 0)), `The ${m.face}`)
            m.flash = 0.1
            if (over) return
            continue
          }
        }
        if (m.kind === 'archer') {
          const clear = d <= 7 && los(lv.tiles, lv.w, m.x, m.y, hero.x, hero.y)
          if (clear && d >= 2) {
            if (m.cd <= 0) {
              m.cd = 2
              shots.push({ x0: m.x, y0: m.y, x1: hero.x, y1: hero.y, life: 0.22 })
              if (rng.chance(0.78)) hurtPlayer(Math.max(1, m.atk - 1), `The ${m.face}'s shot`)
              else say(`The ${m.face}'s shot whistles past.`, '#9aa')
            } else m.cd--
            if (d <= 3) stepMon(m, dist, true)
            continue
          }
        }
        if (adj) {
          if (rng.chance(0.82)) hurtPlayer(m.atk + rng.int(-1, 1), `The ${m.face}`)
          else say(`The ${m.face} misses you.`, '#9aa')
          m.flash = 0.1
          m.vx += (hero.x - m.x) * 0.3
          m.vy += (hero.y - m.y) * 0.3
        } else stepMon(m, dist)
        if (over) return
      }
    }

    // ---- stealth
    const inCone = (g: Mon, x: number, y: number, range = 7) => {
      const dx = x - g.x
      const dy = y - g.y
      const dd = Math.hypot(dx, dy)
      if (dd === 0) return true
      if (dd > range) return false
      const dot = (g.face2.x * dx + g.face2.y * dy) / (dd * Math.hypot(g.face2.x, g.face2.y))
      return dot >= 0.62 && los(lv.tiles, lv.w, g.x, g.y, x, y)
    }

    function computeCones() {
      cones.fill(0)
      for (const g of mons) {
        if (g.st === 'stun') continue
        for (let y = Math.max(1, g.y - 7); y <= Math.min(lv.h - 2, g.y + 7); y++) {
          for (let x = Math.max(1, g.x - 7); x <= Math.min(lv.w - 2, g.x + 7); x++) {
            if (lv.tiles[at(x, y)] && inCone(g, x, y)) cones[at(x, y)] = g.st === 'chase' ? 2 : 1
          }
        }
      }
    }

    function caught() {
      pl.lives--
      env.sfx('hit')
      shake.kick(8)
      hud()
      if (pl.lives <= 0) {
        die()
        return
      }
      say(`Caught! ${pl.lives} ${pl.lives === 1 ? 'life' : 'lives'} left. Back to the start.`, t.danger)
      hero.x = hero.vx = lv.start.x
      hero.y = hero.vy = lv.start.y
      for (const g of mons) {
        if (g.st === 'chase' || g.st === 'sus') {
          g.st = 'stun'
          g.stun = 5
          g.sus = 0
        }
      }
      grace = 4
      travel = []
      refreshView()
    }

    function guardsAct() {
      if (grace > 0) grace--
      for (const g of mons) {
        if (over) return
        if (g.st === 'stun') {
          if (--g.stun <= 0) g.st = 'patrol'
          continue
        }
        // detection
        const heard = O.noise && noise > 0 && Math.hypot(g.x - hero.x, g.y - hero.y) <= noise + 1
        const sees = grace === 0 && (inCone(g, hero.x, hero.y, 7) || heard)
        const near = Math.max(Math.abs(g.x - hero.x), Math.abs(g.y - hero.y)) <= 1
        if (sees || (near && grace === 0)) {
          g.sus++
          g.last = { x: hero.x, y: hero.y }
          g.lost = 0
          if (g.st !== 'chase') float(g.x, g.y - 0.4, g.sus >= 2 || near ? '❗' : '?', g.sus >= 2 ? t.danger : t.accent)
          if (g.sus >= 2 || near) {
            if (g.st !== 'chase') {
              say('A guard spotted you! Run!', t.danger)
              env.sfx('hit')
              for (const o of mons) if (o !== g && o.st !== 'stun' && Math.hypot(o.x - g.x, o.y - g.y) < 10 && o.st === 'patrol') {
                o.st = 'sus'
                o.last = { x: hero.x, y: hero.y }
              }
            }
            g.st = 'chase'
          } else if (g.st === 'patrol') g.st = 'sus'
        } else if (g.st === 'chase') {
          if (++g.lost > 8) {
            g.st = 'patrol'
            g.sus = 0
            say('A guard loses your trail.', t.good)
          }
        } else if (g.st === 'sus' && g.sus === 0 && !g.last) g.st = 'patrol'
        else if (g.sus > 0 && !sees) g.sus = Math.max(0, g.sus - 0.34)
        // movement
        let target: P | null = null
        if (g.st === 'chase') {
          if (turn % 3 === 0) continue
          target = g.lost > 0 && g.last ? g.last : { x: hero.x, y: hero.y }
        } else if (g.st === 'sus' && g.last) {
          target = g.last
          if (g.x === g.last.x && g.y === g.last.y) {
            g.last = null
            g.st = 'patrol'
          }
        } else {
          target = g.route[g.ri]
          if (g.x === target.x && g.y === target.y) {
            g.ri = (g.ri + 1) % g.route.length
            target = g.route[g.ri]
          }
        }
        if (!target) continue
        const field = bfsField(lv.tiles, lv.w, lv.h, target.x, target.y, 60)
        const ox = g.x
        const oy = g.y
        if (g.st === 'chase' && Math.max(Math.abs(g.x - hero.x), Math.abs(g.y - hero.y)) <= 1) {
          say('The guard grabs you!', t.danger)
          caught()
          return
        }
        stepMon(g, field)
        if (g.x !== ox || g.y !== oy) g.face2 = { x: g.x - ox, y: g.y - oy }
        if (g.st === 'chase' && Math.max(Math.abs(g.x - hero.x), Math.abs(g.y - hero.y)) <= 1 && g.x === hero.x) {
          caught()
          return
        }
      }
    }

    // ---- input
    let lastDir = ''
    let hold = 0
    const dirOf = () => {
      const a = k.axis()
      return { dx: a.x, dy: a.y }
    }
    k.onKey((e) => {
      if (over) return
      const c = e.code
      const diag: Record<string, [number, number]> = { KeyY: [-1, -1], KeyU: [1, -1], KeyB: [-1, 1], KeyN: [1, 1], Numpad7: [-1, -1], Numpad9: [1, -1], Numpad1: [-1, 1], Numpad3: [1, 1], Numpad8: [0, -1], Numpad2: [0, 1], Numpad4: [-1, 0], Numpad6: [1, 0] }
      if (diag[c]) {
        travel = []
        playerMove(diag[c][0], diag[c][1])
      } else if (c === 'Period' || c === 'Numpad5') playerMove(0, 0)
      else if (/^Digit[1-6]$/.test(c)) {
        const n = Number(c.slice(5)) - 1
        if (kit && n < 3) cast(n)
        else consumeItem(n - (kit ? 3 : 0))
      } else if (c === 'KeyQ') quick()
      else if (c === 'KeyF' && O.bow) shoot()
    })

    function tapAt(x: number, y: number) {
      if (over) return
      // inventory slots
      const slot = slotAt(x, y)
      if (slot >= 0) {
        if (kit && slot < 3) cast(slot)
        else consumeItem(slot - (kit ? 3 : 0))
        return
      }
      if (y < TOP || y > TOP + VH * T) return
      const tx = Math.floor(x / T + camX)
      const ty = Math.floor((y - TOP) / T + camY)
      if (tx < 0 || ty < 0 || tx >= lv.w || ty >= lv.h) return
      const dx = tx - hero.x
      const dy = ty - hero.y
      if (dx === 0 && dy === 0) {
        playerMove(0, 0)
        return
      }
      if (O.bow) {
        const tm = monAt(tx, ty)
        if (tm && visible[at(tx, ty)] && Math.max(Math.abs(dx), Math.abs(dy)) > 1) { travel = []; shoot(tm); return }
      }
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
        travel = []
        playerMove(dx, dy)
        return
      }
      if (!explored[at(tx, ty)] || !lv.tiles[at(tx, ty)]) return
      const p = findPath(lv.tiles, lv.w, lv.h, hero, { x: tx, y: ty }, (i) => explored[i] === 1 && lv.tiles[i] === 1)
      travel = p
      travelT = 0
    }
    ptr.onDown((p) => {
      if (p.button === 0 || p.button === 2) tapAt(p.x, p.y)
    })

    const slotRect = (i: number) => {
      const sw = 46
      const gap = 6
      if (portrait) return { x: 10 + (i % 6) * (sw + gap), y: H - PAD - PANEL + 8, w: sw, h: sw }
      return { x: W - 10 - (6 - i) * (sw + gap) + gap, y: H - PANEL + 38, w: sw, h: sw }
    }
    const slotAt = (x: number, y: number) => {
      const n = (kit ? 3 : 0) + inv.length
      for (let i = 0; i < n; i++) {
        const r = slotRect(i)
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i
      }
      return -1
    }

    function visibleHostile() {
      return mons.some((m) => m.hp > 0 && m.awake && visible[at(m.x, m.y)] && m.st !== 'stun')
    }

    // ---- update
    const lp = loop(
      (dt) => {
        time += dt
        shake.update(dt)
        fx.update(dt, 0)
        for (const f of floaters) {
          f.life -= dt
          f.y -= 28 * dt
        }
        while (floaters.length && floaters[0].life <= 0) floaters.shift()
        for (const s of shots) s.life -= dt
        while (shots.length && shots[0].life <= 0) shots.shift()
        msgFlash = Math.max(0, msgFlash - dt * 1.5)
        const sp = 1 - Math.pow(0.0005, dt)
        hero.vx += (hero.x - hero.vx) * sp
        hero.vy += (hero.y - hero.vy) * sp
        for (const m of mons) {
          m.vx += (m.x - m.vx) * sp
          m.vy += (m.y - m.vy) * sp
          m.flash = Math.max(0, m.flash - dt)
        }
        if (over) {
          overTimer -= dt
          if (overTimer <= 0 && overTimer > -5) {
            overTimer = -10
            env.end({ score: depth * 100 + pl.kills * 5 + Math.floor(pl.gold / 5) + (winFlag ? 300 : 0), won: winFlag, text: winFlag ? `Escaped from depth ${depth}` : `Died on depth ${depth} · level ${pl.lvl}` })
          }
          return
        }
        // keyboard / pad movement with repeat
        const { dx, dy } = dirOf()
        const key = `${dx},${dy}`
        if (dx || dy) {
          travel = []
          if (key !== lastDir) {
            playerMove(dx, dy)
            hold = 0.2
          } else {
            hold -= dt
            if (hold <= 0) {
              playerMove(dx, dy)
              hold = 0.085
            }
          }
          lastDir = key
        } else lastDir = ''
        if (k.hit('a')) { if (O.bow) shoot(); else playerMove(0, 0) }
        if (k.hit('b')) quick()
        if (O.rt) {
          rtT += dt
          if (rtT >= 0.6) { rtT = 0; endTurn(true) }
        }
        // travel
        if (travel.length) {
          travelT -= dt
          if (travelT <= 0) {
            if (visibleHostile() && !stealth) {
              travel = []
              say('You stop: an enemy is in view.', '#9aa')
            } else {
              const n = travel.shift()!
              const hp0 = pl.hp
              if (!playerMove(n.x - hero.x, n.y - hero.y) || pl.hp < hp0) travel = []
              travelT = 0.07
            }
          }
        }
      },
      () => draw(),
    )
    bag.add(() => lp.stop())

    // ---- drawing
    const lighten = (hex: string, k: number) => {
      const m = /^#?([0-9a-f]{6})$/i.exec(hex)
      if (!m) return hex
      const n = parseInt(m[1], 16)
      const c = (v: number) => Math.round(v + (255 - v) * k)
      return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`
    }
    const floorA = lighten(t.bg2, 0.16)
    const floorB = lighten(t.bg2, 0.1)
    const wallCol = () => t.blocks[(depth + 2) % t.blocks.length]
    function draw() {
      ctx.save()
      ctx.fillStyle = ascii ? '#030603' : '#05050a'
      ctx.fillRect(0, 0, W, H)
      shake.apply(ctx)
      // camera
      const tcx = Math.max(0, Math.min(lv.w - VW, Math.round(hero.vx - VW / 2 + 0.5)))
      const tcy = Math.max(0, Math.min(lv.h - VH, Math.round(hero.vy - VH / 2 + 0.5)))
      camX += (tcx - camX) * 0.25
      camY += (tcy - camY) * 0.25
      if (Math.abs(tcx - camX) < 0.02) camX = tcx
      if (Math.abs(tcy - camY) < 0.02) camY = tcy
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, TOP, W, VH * T)
      ctx.clip()
      const x0 = Math.floor(camX)
      const y0 = Math.floor(camY)
      const wc = wallCol()
      for (let y = y0; y <= y0 + VH + 1; y++) {
        for (let x = x0; x <= x0 + VW + 1; x++) {
          if (x < 0 || y < 0 || x >= lv.w || y >= lv.h) continue
          const i = at(x, y)
          if (!explored[i]) continue
          const vis = visible[i] === 1
          const X = px(x)
          const Y = py(y)
          if (!lv.tiles[i]) {
            if (!wallShow[i]) continue
            if (ascii) {
              text(ctx, '#', X + T / 2, Y + T / 2, { size: 26, color: vis ? t.accent2 : '#2a4a2a', font: 'ui-monospace, monospace', weight: 700 })
            } else {
              ctx.fillStyle = wc
              ctx.fillRect(X, Y, T, T)
              ctx.fillStyle = 'rgba(0,0,0,0.42)'
              ctx.fillRect(X, Y, T, T)
              ctx.fillStyle = 'rgba(255,255,255,0.16)'
              ctx.fillRect(X, Y, T, 5)
              ctx.fillStyle = 'rgba(0,0,0,0.3)'
              ctx.fillRect(X, Y + T - 6, T, 6)
              ctx.fillRect(X + T - 3, Y, 3, T)
            }
          } else {
            if (ascii) {
              text(ctx, '.', X + T / 2, Y + T / 2 + 3, { size: 22, color: vis ? t.accent : '#1c3a1c', font: 'ui-monospace, monospace' })
            } else {
              ctx.fillStyle = (x + y) % 2 ? floorA : floorB
              ctx.fillRect(X, Y, T, T)
              ctx.fillStyle = 'rgba(255,255,255,0.05)'
              ctx.fillRect(X, Y, T, 1)
              ctx.fillRect(X, Y, 1, T)
            }
            if (x === lv.stairs.x && y === lv.stairs.y) {
              if (ascii) text(ctx, '>', X + T / 2, Y + T / 2, { size: 28, color: t.good, font: 'ui-monospace, monospace', shadow: t.good })
              else {
                ctx.fillStyle = 'rgba(0,0,0,0.5)'
                ctx.fillRect(X + 3, Y + 3, T - 6, T - 6)
                emoji(ctx, stairsLocked() ? '🔒' : '🪜', X + T / 2, Y + T / 2, 24)
              }
            }
            if (cones[i] && vis) {
              ctx.fillStyle = cones[i] === 2 ? 'rgba(255,40,40,0.38)' : 'rgba(255,200,0,0.26)'
              ctx.fillRect(X, Y, T, T)
            }
          }
          // light falloff and fog
          if (vis) {
            const d = Math.hypot(x - hero.x, y - hero.y) / (radius + 1)
            const a = Math.min(0.75, d * d * (dark ? 0.95 : 0.5))
            if (a > 0.02) {
              ctx.fillStyle = `rgba(0,0,0,${a})`
              ctx.fillRect(X, Y, T, T)
            }
          } else {
            ctx.fillStyle = 'rgba(0,0,12,0.62)'
            ctx.fillRect(X, Y, T, T)
          }
        }
      }
      // ground items
      for (const g of ground) {
        if (!visible[at(g.x, g.y)]) continue
        const X = px(g.x) + T / 2
        const Y = py(g.y) + T / 2 + Math.sin(time * 3 + g.x) * 1.5
        if (ascii) {
          const special = g.kind === 'air' ? 'o' : g.kind === 'parcel' ? '=' : g.kind === 'relic' ? '&' : g.kind === 'chest' ? '~' : ''
          const gl = special || (g.kind === 'gold' ? '$' : g.kind === 'weapon' ? '/' : g.kind === 'armor' ? '[' : g.kind === 'potion' ? '!' : CONS[g.kind].glyph)
          text(ctx, gl, X, Y, { size: 24, color: g.kind === 'gold' || special ? t.accent : g.kind === 'weapon' || g.kind === 'armor' ? t.accent2 : g.kind === 'potion' ? CONS[`potion${g.tier}`].color : CONS[g.kind].color, font: 'ui-monospace, monospace', weight: 800 })
        } else {
          const e = g.kind === 'gold' ? '💰' : g.kind === 'weapon' ? WEAPONS[g.tier][0] : g.kind === 'armor' ? ARMORS[g.tier][0] : g.kind === 'air' ? '🫧' : g.kind === 'parcel' ? '✉️' : g.kind === 'relic' ? '🏺' : g.kind === 'chest' ? '📦' : g.kind === 'potion' ? '🧪' : CONS[g.kind].emoji
          ctx.shadowColor = t.accent
          ctx.shadowBlur = 8
          emoji(ctx, e, X, Y, 22)
          ctx.shadowBlur = 0
        }
      }
      // monsters
      for (const m of mons) {
        if (m.hp <= 0 || !visible[at(m.x, m.y)]) continue
        const X = px(m.vx) + T / 2
        const Y = py(m.vy) + T / 2
        const big = m.kind === 'boss'
        if (ascii) {
          text(ctx, { grunt: 'g', brute: 'O', archer: 'a', wisp: 'w', boss: 'D', guard: 'G' }[m.kind], X, Y, { size: big ? 34 : 26, color: m.flash > 0 ? '#fff' : m.st === 'stun' ? '#778' : t.danger, font: 'ui-monospace, monospace', weight: 800, shadow: t.danger })
        } else {
          if (m.flash > 0) ctx.globalAlpha = 0.6
          if (m.st === 'stun') ctx.globalAlpha = 0.45
          emoji(ctx, m.face, X, Y - 2 + Math.sin(time * 4 + m.x) * 1.2, big ? 44 : 26)
          ctx.globalAlpha = 1
        }
        if (!stealth && m.hp < m.maxhp) {
          ctx.fillStyle = '#300'
          ctx.fillRect(X - 12, Y + (big ? 20 : 13), 24, 3)
          ctx.fillStyle = t.danger
          ctx.fillRect(X - 12, Y + (big ? 20 : 13), 24 * (m.hp / m.maxhp), 3)
        }
        if (stealth && m.st === 'sus') text(ctx, '?', X, Y - 20, { size: 16, color: t.accent })
        if (m.st === 'chase') text(ctx, '!', X, Y - 20, { size: 16, color: t.danger })
        if (m.st === 'stun') text(ctx, 'z', X + 10, Y - 14, { size: 12, color: '#aab' })
        if (m.target) text(ctx, '🎯', X, Y - 22, { size: 16, color: t.danger })
      }
      // allies
      for (const a of allies) {
        if (a.hp <= 0 || !visible[at(Math.round(a.x), Math.round(a.y))]) continue
        a.vx += (a.x - a.vx) * 0.25
        a.vy += (a.y - a.vy) * 0.25
        const X = px(a.vx) + T / 2
        const Y = py(a.vy) + T / 2
        if (ascii) text(ctx, a.kind === 'shrine' ? '*' : 'a', X, Y, { size: 26, color: t.good, font: 'ui-monospace, monospace', weight: 800 })
        else {
          ctx.shadowColor = t.good
          ctx.shadowBlur = a.kind === 'shrine' ? 18 : 8
          emoji(ctx, a.face, X, Y - 2, a.kind === 'shrine' ? 28 : 24)
          ctx.shadowBlur = 0
        }
        ctx.fillStyle = '#040'
        ctx.fillRect(X - 11, Y + 13, 22, 3)
        ctx.fillStyle = t.good
        ctx.fillRect(X - 11, Y + 13, 22 * Math.max(0, a.hp / a.max), 3)
      }
      if (O.noise && noise > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(px(hero.vx) + T / 2, py(hero.vy) + T / 2, (noise + 1) * T, 0, 7)
        ctx.stroke()
      }
      // hero
      {
        const X = px(hero.vx) + T / 2
        const Y = py(hero.vy) + T / 2
        if (ascii) text(ctx, '@', X, Y, { size: 30, color: t.fg, font: 'ui-monospace, monospace', weight: 800, shadow: t.accent })
        else {
          ctx.fillStyle = 'rgba(0,0,0,0.35)'
          ctx.beginPath()
          ctx.ellipse(X, Y + 13, 11, 4, 0, 0, 6.3)
          ctx.fill()
          ctx.shadowColor = t.accent
          ctx.shadowBlur = 14
          emoji(ctx, heroFace, X, Y - 1 + Math.sin(time * 3) * 1, 28)
          ctx.shadowBlur = 0
        }
      }
      // projectiles
      for (const s of shots) {
        ctx.strokeStyle = t.accent
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(px(s.x0) + T / 2, py(s.y0) + T / 2)
        ctx.lineTo(px(s.x1) + T / 2, py(s.y1) + T / 2)
        ctx.stroke()
      }
      // particles/floaters in world space
      ctx.save()
      ctx.translate(-camX * T, TOP - camY * T)
      fx.draw(ctx)
      for (const f of floaters) text(ctx, f.s, f.x, f.y, { size: 14, color: f.c, shadow: '#000' })
      ctx.restore()
      ctx.restore()
      drawHud()
      ctx.restore()
    }

    function drawHud() {
      // top bar
      ctx.fillStyle = 'rgba(0,0,0,0.72)'
      ctx.fillRect(0, 0, W, TOP)
      const mono = ascii ? 'ui-monospace, monospace' : undefined
      if (!stealth) {
        const bw = portrait ? 130 : 220
        ctx.fillStyle = '#300'
        ctx.fillRect(10, 12, bw, 16)
        ctx.fillStyle = pl.hp / pl.maxhp < 0.3 ? '#ff3b3b' : t.danger
        ctx.fillRect(10, 12, bw * Math.max(0, pl.hp / pl.maxhp), 16)
        text(ctx, `HP ${Math.max(0, pl.hp)}/${pl.maxhp}`, 10 + bw / 2, 21, { size: 11, color: '#fff', font: mono })
        text(ctx, `D${depth}`, 10 + bw + 28, 21, { size: 15, color: t.accent, font: mono })
        text(ctx, `Lv${pl.lvl}`, 10 + bw + 76, 21, { size: 13, color: t.fg, font: mono })
        if (!portrait) {
          ctx.fillStyle = '#223'
          ctx.fillRect(380, 16, 120, 8)
          ctx.fillStyle = t.accent2
          ctx.fillRect(380, 16, 120 * Math.min(1, pl.xp / (pl.lvl * 14)), 8)
          text(ctx, `ATK ${pl.atk + weaponBonus()}  DEF ${armorBonus()}  💰${pl.gold}`, 640, 21, { size: 13, color: t.fg, font: mono })
        } else text(ctx, `⚔${pl.atk + weaponBonus()} 🛡${armorBonus()} 💰${pl.gold}`, W - 80, 21, { size: 12, color: t.fg, font: mono })
      } else {
        text(ctx, `FLOOR ${depth}/${goal}`, 80, 21, { size: 14, color: t.accent, font: mono })
        text(ctx, '❤️'.repeat(Math.max(0, pl.lives)), W / 2, 21, { size: 18, color: t.danger })
        text(ctx, `💰${pl.gold}`, W - 60, 21, { size: 13, color: t.fg, font: mono })
      }
      if (kit) {
        const mx = portrait ? 262 : 380
        const my = portrait ? 16 : 29
        const mw = portrait ? 70 : 120
        ctx.fillStyle = '#123'
        ctx.fillRect(mx, my, mw, portrait ? 8 : 6)
        ctx.fillStyle = '#4dabf7'
        ctx.fillRect(mx, my, mw * (mana.v / mana.max), portrait ? 8 : 6)
        text(ctx, `MP ${mana.v}`, mx + mw + 22, my + 4, { size: 10, color: '#9cf', font: mono })
      }
      // variant readouts on the map
      {
        const ex: string[] = []
        if (O.timer) ex.push(`⏳ ${turnsLeft}`)
        if (O.air) ex.push(`🫧 ${air}%`)
        if (parcelsLeft > 0) ex.push(`✉️ ${parcelsLeft}`)
        if (targetAlive) ex.push('🎯 target')
        if (bearT > 0) ex.push(`🐻 ${bearT}`)
        if (O.noise) ex.push(`🔊 ${noise}`)
        if (O.compass) {
          let bd = 1e9
          let bx = lv.stairs.x
          let by = lv.stairs.y
          for (const g of ground) if (g.kind === 'gold' || g.kind === 'chest' || g.kind === 'relic') { const d = Math.hypot(g.x - hero.x, g.y - hero.y); if (d < bd) { bd = d; bx = g.x; by = g.y } }
          const a = Math.atan2(by - hero.y, bx - hero.x)
          const arrows = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗']
          ex.push(`🧭 ${arrows[(Math.round(a / (Math.PI / 4)) + 8) % 8]} ${Math.round(Math.min(bd, Math.hypot(bx - hero.x, by - hero.y)))}`)
        }
        if (ex.length) {
          const label = ex.join('   ')
          roundRect(ctx, 8, TOP + 6, Math.min(W - 16, 18 + label.length * 8), 24, 12, 'rgba(0,0,0,0.65)')
          text(ctx, label, 16, TOP + 18, { size: 13, color: t.fg, align: 'left', font: mono })
        }
      }
      // bottom panel
      const py0 = H - PANEL - PAD
      ctx.fillStyle = 'rgba(0,0,0,0.82)'
      ctx.fillRect(0, py0, W, PANEL)
      ctx.strokeStyle = ascii ? t.accent : 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, py0 + 0.5, W - 1, PANEL - 1)
      const lines = portrait ? 4 : 4
      const shown = log.slice(-lines)
      const lx = portrait ? 10 : 12
      const lyBase = portrait ? py0 + 62 : py0 + 14
      const lw = portrait ? W - 20 : W - 340
      shown.forEach((l, i) => {
        const a = 0.45 + 0.55 * ((i + 1) / shown.length)
        ctx.globalAlpha = a
        let s = l.t
        ctx.font = `700 ${portrait ? 12 : 13}px ${ascii ? 'ui-monospace, monospace' : 'system-ui, sans-serif'}`
        while (ctx.measureText(s).width > lw && s.length > 4) s = s.slice(0, -2)
        if (s !== l.t) s += '…'
        text(ctx, s, lx, lyBase + i * (portrait ? 14 : 20), { size: portrait ? 12 : 13, color: l.c, align: 'left', font: ascii ? 'ui-monospace, monospace' : 'system-ui, sans-serif', weight: 600 })
      })
      ctx.globalAlpha = 1
      // inventory
      for (let i = 0; i < 6; i++) {
        const r = slotRect(i)
        roundRect(ctx, r.x, r.y, r.w, r.h, 8, 'rgba(255,255,255,0.07)', kit && i < 3 ? t.accent2 : i - (kit ? 3 : 0) < inv.length ? t.accent : 'rgba(255,255,255,0.2)', 1.5)
        const off = kit ? 3 : 0
        if (kit && i < 3) {
          const sp = kit[i]
          const ready = mana.v >= sp[2]
          ctx.globalAlpha = ready ? 1 : 0.4
          if (ascii) text(ctx, sp[1][0].toUpperCase(), r.x + r.w / 2, r.y + r.h / 2 - 3, { size: 24, color: t.accent2, font: 'ui-monospace, monospace' })
          else emoji(ctx, sp[0], r.x + r.w / 2, r.y + r.h / 2 - 3, 22)
          text(ctx, `${sp[2]}mp`, r.x + r.w / 2, r.y + r.h - 6, { size: 9, color: '#9cf' })
          ctx.globalAlpha = 1
          text(ctx, String(i + 1), r.x + 6, r.y + 8, { size: 9, color: 'rgba(255,255,255,0.5)', align: 'left' })
          continue
        }
        const s = inv[i - off]
        if (s) {
          if (ascii) text(ctx, CONS[s.id].glyph, r.x + r.w / 2, r.y + r.h / 2, { size: 26, color: CONS[s.id].color, font: 'ui-monospace, monospace' })
          else emoji(ctx, CONS[s.id].emoji, r.x + r.w / 2, r.y + r.h / 2, 24)
          if (s.n > 1) text(ctx, `×${s.n}`, r.x + r.w - 4, r.y + r.h - 8, { size: 10, color: '#fff', align: 'right' })
        }
        text(ctx, String(i + 1), r.x + 6, r.y + 8, { size: 9, color: 'rgba(255,255,255,0.5)', align: 'left' })
      }
      // hint
      if (time < 6 && !over) {
        ctx.globalAlpha = Math.min(1, (6 - time) / 1.5)
        const msg = stealth ? (O.noise ? 'Every step makes noise (circle) · wait to stay quiet · reach the exit' : 'Avoid the red/yellow cones · slip behind guards to take them down · reach the exit')
          : kit ? `Spells 1-3 (${kit.map((q) => q[1]).join(', ')}) · bump to attack · find the stairs`
            : O.bow ? 'Tap an enemy or press F to shoot · move with arrows / tap · find the stairs'
              : O.errand ? 'Collect every parcel, then take the stairs' : O.contract ? 'Kill the marked target to unseal the stairs' : O.ally ? 'Your companion follows and helps · find the stairs' : 'Move: arrows / WASD / tap · bump to attack · find the stairs'
        roundRect(ctx, W / 2 - 230, TOP + 8, 460, 26, 13, 'rgba(0,0,0,0.7)')
        text(ctx, msg, W / 2, TOP + 21, { size: portrait ? 10 : 11, color: t.fg })
        ctx.globalAlpha = 1
      }
      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, TOP, W, VH * T)
        text(ctx, winFlag ? 'ESCAPED!' : 'YOU DIED', W / 2, TOP + (VH * T) / 2, { size: 30, color: winFlag ? t.good : t.danger, shadow: '#000' })
      }
    }

    newLevel()
    for (const m of mons) if (m.kind !== 'guard') m.awake = m.awake && Math.hypot(m.x - hero.x, m.y - hero.y) > 12
    if (stealth) computeCones()
    camX = Math.max(0, Math.min(lv.w - VW, hero.x - VW / 2))
    camY = Math.max(0, Math.min(lv.h - VH, hero.y - VH / 2))

    return {
      destroy() {
        bag.dispose()
      },
      pause(p) {
        lp.pause(p)
      },
    }
  },
}

export default engine
