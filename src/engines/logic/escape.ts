// Escape room generator and rules (pure, testable). The engine (games/escape.ts) only renders what this module produces.
import type { Rng } from '../kit'

export type SourceKind = 'clock' | 'count' | 'uv' | 'slider' | 'cipher'

export interface Item {
  id: string
  emoji: string
  name: string
  /** Text shown when the item is examined. */
  read?: string
}

export type Lock =
  | { t: 'item'; item: string }
  | { t: 'digits'; code: string }
  | { t: 'colors'; code: number[] }
  | { t: 'word'; code: string }

export type Clue =
  | { t: 'clock'; h: number; m: number }
  | { t: 'count'; target: string; n: number; grid: string[] }
  | { t: 'uv'; text: string; digit: number }
  | { t: 'cipher'; plain: string; shift: number; cipher: string }
  | { t: 'colors'; seq: number[] }
  | { t: 'plate'; digit: number }

export interface Hotspot {
  id: string
  emoji: string
  name: string
  /** Position in percent of the room view. */
  x: number
  y: number
  /** 1 = normal. */
  size: number
  kind: 'decor' | 'search' | 'clue' | 'uvwall' | 'slider' | 'container' | 'door'
  text?: string
  clue?: Clue
  lock?: Lock
  give?: string[]
  /** For sliders: what the solved picture reveals. */
  reward?: { t: 'item'; id: string } | { t: 'digit'; digit: number }
}

export interface Step {
  hint: string
  done: (s: RoomState) => boolean
}

export interface Room {
  index: number
  name: string
  blurb: string
  hotspots: Hotspot[]
  items: Record<string, Item>
  steps: Step[]
  lockKind: 'digits' | 'colors' | 'word'
  code: string
  sources: SourceKind[]
}

export interface RoomState {
  inv: string[]
  opened: Set<string>
  searched: Set<string>
  seen: Set<string>
  solved: Set<string>
  noteRead: boolean
  exited: boolean
}

export const newState = (): RoomState => ({ inv: [], opened: new Set(), searched: new Set(), seen: new Set(), solved: new Set(), noteRead: false, exited: false })

export const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7']
export const COLOR_NAMES = ['red', 'blue', 'green', 'yellow', 'purple']
const NUMBER_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE']
const WORDS = ['OPEN', 'MOON', 'LAMP', 'GOLD', 'DUSK', 'DAWN', 'RUST', 'FIRE', 'BELL', 'SAFE', 'CLUE', 'TIDE', 'ECHO', 'IRIS', 'OPAL', 'JADE', 'DUST', 'WIND']

export interface Flavor {
  id: string
  rooms: string[]
  door: [string, string]
  safe: [string, string]
  drawer: [string, string]
  search: [string, string][]
  decor: [string, string][]
  intro: string
}

const FLAVORS: Record<string, Flavor> = {
  lab: { id: 'lab', rooms: ['Chemistry Bench', 'Server Closet', 'Cold Storage'], door: ['🚪', 'Steel door'], safe: ['🧊', 'Sample cooler'], drawer: ['🗄️', 'Filing cabinet'], search: [['🪴', 'Dying fern'], ['🧪', 'Rack of vials'], ['🧯', 'Fire extinguisher']], decor: [['🔬', 'Microscope'], ['🧫', 'Petri dishes'], ['🧬', 'Poster'], ['⚗️', 'Flask']], intro: 'The lab door seals behind you.' },
  library: { id: 'library', rooms: ['Reading Room', 'Map Gallery', 'Forbidden Stacks'], door: ['🚪', 'Oak door'], safe: ['📦', 'Locked chest'], drawer: ['🗄️', 'Card catalogue'], search: [['🪴', 'Potted fern'], ['📚', 'Stack of books'], ['🧺', 'Basket']], decor: [['🕯️', 'Candle'], ['🦉', 'Stuffed owl'], ['🪟', 'Window'], ['🌍', 'Globe']], intro: 'The librarian locks up. You are still inside.' },
  attic: { id: 'attic', rooms: ['Dusty Attic', 'Trunk Room', 'Chimney Loft'], door: ['🚪', 'Trapdoor'], safe: ['🧳', 'Old trunk'], drawer: ['🗄️', 'Dresser'], search: [['🧸', 'Teddy bear'], ['🧺', 'Laundry basket'], ['🪴', 'Dead plant']], decor: [['🕸️', 'Cobwebs'], ['🕯️', 'Candle'], ['🪞', 'Mirror'], ['🎻', 'Violin']], intro: 'The attic ladder creaks away beneath you.' },
  sub: { id: 'sub', rooms: ['Control Deck', 'Engine Bay', 'Torpedo Room'], door: ['🛞', 'Pressure hatch'], safe: ['🧰', 'Toolbox locker'], drawer: ['🗄️', 'Chart drawer'], search: [['🪴', 'Algae jar'], ['🧯', 'Extinguisher'], ['⚓', 'Anchor chain']], decor: [['🧭', 'Compass'], ['🔭', 'Periscope'], ['📟', 'Gauge'], ['🪝', 'Hook']], intro: 'Water is rising. Find the hatch code.' },
  clock: { id: 'clock', rooms: ['Workshop', 'Gear Hall', 'Bell Tower'], door: ['🚪', 'Brass door'], safe: ['🔒', 'Clockwork safe'], drawer: ['🗄️', 'Parts drawer'], search: [['🪴', 'Potted fern'], ['⚙️', 'Pile of gears'], ['🧰', 'Tool bag']], decor: [['🔧', 'Wrench'], ['🕯️', 'Candle'], ['🎩', 'Top hat'], ['🔭', 'Brass telescope']], intro: 'Every clock in the shop stopped at once.' },
  museum: { id: 'museum', rooms: ['Main Gallery', 'Sculpture Wing', 'Night Archive'], door: ['🚪', 'Staff door'], safe: ['🔒', 'Display vault'], drawer: ['🗄️', 'Curator desk'], search: [['🪴', 'Potted palm'], ['🏺', 'Large urn'], ['🧳', 'Visitor bag']], decor: [['🖼️', 'Portrait'], ['🗿', 'Statue'], ['🪟', 'Skylight'], ['🕯️', 'Candle']], intro: 'Closing time. Someone forgot you.' },
  kitchen: { id: 'kitchen', rooms: ['Kitchen', 'Pantry', 'Cold Room'], door: ['🚪', 'Cellar door'], safe: ['📦', 'Recipe box'], drawer: ['🗄️', 'Cutlery drawer'], search: [['🪴', 'Herb pot'], ['🍞', 'Bread bin'], ['🧺', 'Flour sack']], decor: [['🍳', 'Frying pan'], ['🔪', 'Knife block'], ['🥫', 'Tins'], ['🫖', 'Teapot']], intro: 'The door swung shut and the lock clicked.' },
  tomb: { id: 'tomb', rooms: ['Entry Chamber', 'Hall of Glyphs', 'Burial Vault'], door: ['🚪', 'Stone door'], safe: ['⚱️', 'Sealed urn'], drawer: ['🗄️', 'Offering niche'], search: [['🏺', 'Clay jar'], ['🪴', 'Dry palm'], ['🪨', 'Loose rocks']], decor: [['🐍', 'Carved snake'], ['🔥', 'Torch'], ['🗿', 'Idol'], ['🦂', 'Scorpion relief']], intro: 'The great stone rolled shut.' },
  default: { id: 'default', rooms: ['The Study', 'The Cellar', 'The Vault'], door: ['🚪', 'Exit door'], safe: ['🔒', 'Wall safe'], drawer: ['🗄️', 'Desk drawer'], search: [['🪴', 'Potted plant'], ['🧺', 'Basket'], ['🛋️', 'Sofa']], decor: [['🕯️', 'Candle'], ['🪟', 'Window'], ['🖼️', 'Painting'], ['📺', 'Old TV'], ['🧸', 'Toy']], intro: 'The door locked behind you.' },
}

export function pickFlavor(name: string, mods: Set<string>): Flavor {
  const n = name.toLowerCase()
  const map: [RegExp, string][] = [
    [/lab|science|chem/, 'lab'], [/librar|book|study|mansion/, 'library'], [/attic|nursery|treehouse|cabin|haunted|puzzle box|toy/, 'attic'],
    [/submarine|ship|hatch|pod|space|elevator|train|lighthouse/, 'sub'], [/clock|observatory|steam|gear/, 'clock'], [/museum|gallery|vault|bank|heist/, 'museum'],
    [/kitchen|bakery|greenhouse|laundry|room/, 'kitchen'], [/tomb|pharaoh|temple|pyramid/, 'tomb'],
  ]
  for (const [re, id] of map) if (re.test(n)) return FLAVORS[id]
  if (mods.has('science')) return FLAVORS.lab
  return FLAVORS.default
}

// ---------- sliding picture puzzle ----------

/** Tiles 1..8 and 0 (blank) on a 3×3 board. Shuffled by random legal moves so it is always solvable. */
export function genSlider(rng: Rng, moves = 60): number[] {
  const t = [1, 2, 3, 4, 5, 6, 7, 8, 0]
  let blank = 8
  let prev = -1
  for (let i = 0; i < moves; i++) {
    const nb = neighbours(blank).filter((n) => n !== prev)
    const n = rng.pick(nb)
    ;[t[blank], t[n]] = [t[n], t[blank]]
    prev = blank
    blank = n
  }
  if (isSolved(t)) return genSlider(rng, moves + 7)
  return t
}
export const isSolved = (t: number[]) => t.every((v, i) => v === (i + 1) % 9)
export function neighbours(i: number): number[] {
  const r = Math.floor(i / 3)
  const c = i % 3
  const out: number[] = []
  if (r > 0) out.push(i - 3)
  if (r < 2) out.push(i + 3)
  if (c > 0) out.push(i - 1)
  if (c < 2) out.push(i + 1)
  return out
}
/** Slide the tile at index i into the blank, if adjacent. Returns true when moved. */
export function slide(t: number[], i: number): boolean {
  const b = t.indexOf(0)
  if (!neighbours(b).includes(i)) return false
  ;[t[b], t[i]] = [t[i], t[b]]
  return true
}

// ---------- ciphers ----------

export function caesar(s: string, shift: number): string {
  return s.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + shift + 26 * 4) % 26) + 65))
}

// ---------- generation ----------

interface GenOpts {
  index: number
  diff: 0 | 1 | 2
  flavor: Flavor
  /** Emoji used for counting puzzles and decoys. */
  pool: string[]
  /** Source kinds already used in earlier rooms (the generator prefers fresh ones). */
  used?: SourceKind[]
}

export function genRoom(rng: Rng, o: GenOpts): Room {
  const { flavor: f, index } = o
  const lockKind: Room['lockKind'] = index === 0 ? 'digits' : index === 1 ? (rng.chance(0.5) ? 'colors' : 'word') : rng.chance(0.7) ? 'digits' : 'word'
  const nDigits = o.diff === 0 ? 3 : index === 2 || o.diff === 2 ? 4 : 3
  const items: Record<string, Item> = {
    smallkey: { id: 'smallkey', emoji: '🗝️', name: 'Small key' },
    exitkey: { id: 'exitkey', emoji: '🔑', name: 'Exit key' },
    uvlight: { id: 'uvlight', emoji: '🔦', name: 'UV torch', read: 'A purple-light torch. Shine it on anything that looks blank.' },
  }

  // ---- sources
  let sources: SourceKind[] = []
  let code = ''
  const digits: number[] = []
  let colorSeq: number[] = []
  let word = ''
  if (lockKind === 'digits') {
    const all: SourceKind[] = ['clock', 'count', 'uv', 'slider', 'cipher']
    const fresh = all.filter((s) => !o.used?.includes(s))
    const order = [...rng.shuffle([...fresh]), ...rng.shuffle(all.filter((s) => !fresh.includes(s)))]
    sources = order.slice(0, nDigits)
    for (let i = 0; i < nDigits; i++) digits.push(rng.int(1, 9))
    code = digits.join('')
  } else if (lockKind === 'colors') {
    colorSeq = Array.from({ length: 4 }, () => rng.int(0, COLORS.length - 1))
    code = colorSeq.join('')
  } else {
    word = rng.pick(WORDS)
    code = word
    sources = ['cipher']
  }
  const useUv = sources.includes('uv')
  const sliderIsSource = sources.includes('slider')
  const sliderChain = !sliderIsSource && rng.chance(0.5)

  // ---- hotspot construction
  const hs: Hotspot[] = []
  const slots = layoutSlots(rng)
  const take = () => slots.shift()!
  const add = (h: Omit<Hotspot, 'x' | 'y' | 'size'> & { size?: number }, big = false) => {
    const s = take()
    hs.push({ size: big ? 1.2 : 1, ...h, x: s.x, y: s.y })
  }

  add({ id: 'door', emoji: f.door[0], name: f.door[1], kind: 'door', text: 'Locked tight. It needs a proper key.' }, true)
  const safeLock: Lock = lockKind === 'digits' ? { t: 'digits', code } : lockKind === 'colors' ? { t: 'colors', code: colorSeq } : { t: 'word', code }
  add({ id: 'safe', emoji: f.safe[0], name: f.safe[1], kind: 'container', lock: safeLock, give: ['exitkey'], text: 'There is a lock on it.' }, true)
  add({ id: 'drawer', emoji: f.drawer[0], name: f.drawer[1], kind: 'container', lock: { t: 'item', item: 'smallkey' }, give: useUv ? ['codenote', 'uvlight'] : ['codenote'], text: 'The little lock needs a small key.' })

  // key chain: rug search or slider picture
  const keyHome = f.search[rng.int(0, f.search.length - 1)]
  if (sliderChain) {
    add({ id: 'slider', emoji: '🖼️', name: 'Crooked picture', kind: 'slider', reward: { t: 'item', id: 'smallkey' }, text: 'The picture is split into sliding tiles.' })
  } else {
    add({ id: 'search', emoji: keyHome[0], name: keyHome[1], kind: 'search', give: ['smallkey'], text: `You dig through the ${keyHome[1].toLowerCase()} and find a small key!` })
  }

  const noteLines: string[] = []
  const stepsClue: Step[] = []
  const srcHotspot = (kind: SourceKind, digit: number): void => {
    switch (kind) {
      case 'clock': {
        const m = rng.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
        add({ id: 'clock', emoji: '🕰️', name: 'Wall clock', kind: 'clue', clue: { t: 'clock', h: digit, m } })
        noteLines.push('🕰️ the hour on the clock')
        break
      }
      case 'count': {
        const target = rng.pick(o.pool)
        const decoys = o.pool.filter((p) => p !== target)
        const total = digit + rng.int(5, 9)
        const grid: string[] = Array.from({ length: digit }, () => target)
        while (grid.length < total) grid.push(rng.pick(decoys))
        rng.shuffle(grid)
        add({ id: 'count', emoji: '🗃️', name: 'Shelf of curios', kind: 'clue', clue: { t: 'count', target, n: digit, grid } })
        noteLines.push(`${target} how many ${target} are on the shelf`)
        break
      }
      case 'uv': {
        add({ id: 'uv', emoji: '🪧', name: 'Blank sign', kind: 'uvwall', clue: { t: 'uv', text: `THE NUMBER IS ${digit}`, digit }, text: 'A blank, faded sign. Strange that anyone would hang it.' })
        noteLines.push('🔦 the number that glows under UV light')
        break
      }
      case 'slider': {
        add({ id: 'slider', emoji: '🧩', name: 'Jammed picture', kind: 'slider', reward: { t: 'digit', digit }, text: 'A picture made of sliding tiles.' })
        noteLines.push('🧩 the number behind the picture puzzle')
        break
      }
      case 'cipher': {
        const plain = NUMBER_WORDS[digit]
        const shift = rng.int(2, 7)
        add({ id: 'cipher', emoji: '✉️', name: 'Coded letter', kind: 'clue', clue: { t: 'cipher', plain, shift, cipher: caesar(plain, shift) } })
        noteLines.push('✉️ the number spelled in the coded letter')
        break
      }
    }
  }

  if (lockKind === 'digits') {
    sources.forEach((s, i) => srcHotspot(s, digits[i]))
  } else if (lockKind === 'colors') {
    add({ id: 'colors', emoji: '🧱', name: 'Toy block tower', kind: 'clue', clue: { t: 'colors', seq: colorSeq } })
    noteLines.push('🧱 colours of the block tower, top to bottom')
  } else {
    const shift = rng.int(2, 7)
    add({ id: 'cipher', emoji: '✉️', name: 'Coded letter', kind: 'clue', clue: { t: 'cipher', plain: word, shift, cipher: caesar(word, shift) } })
    noteLines.push('✉️ the word in the coded letter')
  }

  // decor
  const nDecor = Math.min(slots.length, o.diff === 0 ? 2 : o.diff === 1 ? 3 : 4)
  const decorPool = rng.shuffle([...f.decor])
  for (let i = 0; i < nDecor; i++) {
    const d = decorPool[i % decorPool.length]
    add({ id: `decor${i}`, emoji: d[0], name: d[1], kind: 'decor', text: rng.pick(['Nothing useful here.', 'Just ordinary. Probably.', 'You look closer and find only dust.', 'Not part of the puzzle, you suspect.']) })
  }

  const unlockWhat = lockKind === 'digits' ? `a ${nDigits}-digit code` : lockKind === 'colors' ? 'a colour sequence' : 'a four-letter word'
  items.codenote = {
    id: 'codenote',
    emoji: '📝',
    name: 'Torn note',
    read: `The ${f.safe[1].toLowerCase()} opens with ${unlockWhat}:\n\n${noteLines.map((l, i) => `${lockKind === 'digits' ? `${i + 1}. ` : ''}${l}`).join('\n')}${lockKind === 'digits' ? '\n\nEnter the digits in this order.' : ''}`,
  }

  const nameOf = (id: string) => hs.find((h) => h.id === id)?.name ?? id
  const steps: Step[] = []
  if (sliderChain) steps.push({ hint: `The ${nameOf('slider').toLowerCase()} looks like a puzzle. Slide the tiles into order.`, done: (s) => s.solved.has('slider') })
  else steps.push({ hint: `Search the ${nameOf('search').toLowerCase()}. A small key could be hidden there.`, done: (s) => s.searched.has('search') })
  steps.push({ hint: `Use the small key on the ${f.drawer[1].toLowerCase()}.`, done: (s) => s.opened.has('drawer') })
  steps.push({ hint: 'Read the torn note. Select it in your bag, then tap it again.', done: (s) => s.noteRead })
  if (lockKind === 'digits') {
    for (const k of sources) {
      const id = k === 'clock' ? 'clock' : k === 'count' ? 'count' : k === 'uv' ? 'uv' : k === 'slider' ? 'slider' : 'cipher'
      if (k === 'uv') stepsClue.push({ hint: `Shine the UV torch on the ${nameOf('uv').toLowerCase()}.`, done: (s) => s.seen.has('uv') })
      else if (k === 'slider') stepsClue.push({ hint: `Solve the ${nameOf('slider').toLowerCase()} and read what is behind it.`, done: (s) => s.seen.has('slider') })
      else stepsClue.push({ hint: `Look closely at the ${nameOf(id).toLowerCase()}.`, done: (s) => s.seen.has(id) })
    }
  } else if (lockKind === 'colors') stepsClue.push({ hint: 'Study the block tower and note the colours from the top down.', done: (s) => s.seen.has('colors') })
  else stepsClue.push({ hint: 'Decode the letter with the cipher wheel.', done: (s) => s.seen.has('cipher') })
  steps.push(...stepsClue)
  steps.push({ hint: `Enter the code on the ${f.safe[1].toLowerCase()}.`, done: (s) => s.opened.has('safe') })
  steps.push({ hint: 'Select the exit key and use it on the door.', done: (s) => s.exited })

  return {
    index,
    name: f.rooms[index % f.rooms.length],
    blurb: index === 0 ? f.intro : 'Another locked door. Another puzzle.',
    hotspots: hs,
    items,
    steps,
    lockKind,
    code,
    sources,
  }
}

/** Evenly spread jittered positions on the wall and floor, shuffled. */
function layoutSlots(rng: Rng): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  const cols = 5
  const rows = [26, 52, 80]
  for (const y of rows) {
    for (let c = 0; c < cols; c++) out.push({ x: 10 + (80 / (cols - 1)) * c + rng.range(-3, 3), y: y + rng.range(-3, 3) })
  }
  return rng.shuffle(out)
}

/** The digit/letter value a clue shows (used by tests: what a careful player reads off the clue). */
export function clueValue(c: Clue): string {
  switch (c.t) {
    case 'clock': return String(c.h)
    case 'count': return String(c.grid.filter((g) => g === c.target).length)
    case 'uv': return String(c.digit)
    case 'plate': return String(c.digit)
    case 'colors': return c.seq.join('')
    case 'cipher': {
      const w = caesar(c.cipher, -c.shift)
      const i = NUMBER_WORDS.indexOf(w)
      return i >= 0 ? String(i) : w
    }
  }
}

// ---------- interaction ----------

export type Modal =
  | { t: 'clue'; clue: Clue; title: string }
  | { t: 'lock'; id: string; lock: Lock; title: string }
  | { t: 'slider'; id: string; title: string }
  | { t: 'read'; item: Item }

export type Action =
  | { t: 'msg'; text: string }
  | { t: 'modal'; modal: Modal }
  | { t: 'got'; items: string[]; text: string }
  | { t: 'exit'; text: string }

const give = (st: RoomState, ids: string[]) => {
  for (const id of ids) if (!st.inv.includes(id)) st.inv.push(id)
}

export function tap(room: Room, st: RoomState, id: string, selected: string | null): Action {
  const h = room.hotspots.find((x) => x.id === id)
  if (!h) return { t: 'msg', text: '' }
  switch (h.kind) {
    case 'decor':
      return { t: 'msg', text: h.text ?? '' }
    case 'search':
      if (st.searched.has(h.id)) return { t: 'msg', text: 'You already searched here.' }
      st.searched.add(h.id)
      give(st, h.give ?? [])
      return { t: 'got', items: h.give ?? [], text: h.text ?? 'You found something!' }
    case 'clue':
      st.seen.add(h.id)
      return { t: 'modal', modal: { t: 'clue', clue: h.clue!, title: h.name } }
    case 'uvwall':
      if (st.seen.has(h.id)) return { t: 'modal', modal: { t: 'clue', clue: h.clue!, title: h.name } }
      if (selected === 'uvlight') {
        st.seen.add(h.id)
        return { t: 'modal', modal: { t: 'clue', clue: h.clue!, title: h.name } }
      }
      return { t: 'msg', text: h.text ?? '' }
    case 'slider':
      if (st.solved.has(h.id)) {
        if (h.reward?.t === 'digit') {
          st.seen.add(h.id)
          return { t: 'modal', modal: { t: 'clue', clue: { t: 'plate', digit: h.reward.digit }, title: 'Behind the picture' } }
        }
        return { t: 'msg', text: 'The picture is complete. The compartment is empty now.' }
      }
      return { t: 'modal', modal: { t: 'slider', id: h.id, title: h.name } }
    case 'container': {
      if (st.opened.has(h.id)) return { t: 'msg', text: 'Empty now.' }
      const l = h.lock!
      if (l.t === 'item') {
        if (selected === l.item) {
          st.opened.add(h.id)
          st.inv = st.inv.filter((i) => i !== l.item)
          give(st, h.give ?? [])
          return { t: 'got', items: h.give ?? [], text: `The ${h.name.toLowerCase()} unlocks!` }
        }
        return { t: 'msg', text: h.text ?? 'Locked.' }
      }
      return { t: 'modal', modal: { t: 'lock', id: h.id, lock: l, title: h.name } }
    }
    case 'door':
      if (selected === 'exitkey' && st.inv.includes('exitkey')) {
        st.exited = true
        return { t: 'exit', text: 'The key turns. The door swings open!' }
      }
      return { t: 'msg', text: st.inv.includes('exitkey') ? 'Select the exit key in your bag, then tap the door.' : (h.text ?? 'Locked.') }
  }
}

/** Mark a slider solved (engine calls this when the tiles are in order). Returns the action to show. */
export function solveSlider(room: Room, st: RoomState, id: string): Action {
  const h = room.hotspots.find((x) => x.id === id)!
  st.solved.add(id)
  if (h.reward?.t === 'item') {
    give(st, [h.reward.id])
    return { t: 'got', items: [h.reward.id], text: 'The picture clicks into place. A hidden compartment drops a key!' }
  }
  st.seen.add(id)
  return { t: 'modal', modal: { t: 'clue', clue: { t: 'plate', digit: (h.reward as { digit: number }).digit }, title: 'Behind the picture' } }
}

/** Try a combination. On success the container opens and its contents are given. */
export function tryLock(room: Room, st: RoomState, id: string, attempt: string | number[]): { ok: boolean; items: string[] } {
  const h = room.hotspots.find((x) => x.id === id)
  if (!h?.lock || st.opened.has(id)) return { ok: false, items: [] }
  const l = h.lock
  let ok = false
  if (l.t === 'digits' || l.t === 'word') ok = String(attempt) === l.code
  else if (l.t === 'colors') ok = Array.isArray(attempt) && attempt.length === l.code.length && attempt.every((v, i) => v === l.code[i])
  if (!ok) return { ok: false, items: [] }
  st.opened.add(id)
  give(st, h.give ?? [])
  return { ok: true, items: h.give ?? [] }
}

/** Opening the note counts as reading it. */
export function readItem(room: Room, st: RoomState, id: string): Modal | null {
  const it = room.items[id]
  if (!it?.read) return null
  if (id === 'codenote') st.noteRead = true
  return { t: 'read', item: it }
}

export function nextHint(room: Room, st: RoomState): string {
  for (const s of room.steps) if (!s.done(st)) return s.hint
  return 'You have everything. Head for the door!'
}
