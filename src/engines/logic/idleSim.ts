// Pure models for the idle engine's management sub-modes: grid city builder ("build") and needs-balancing colony / pet care ("colony").
import { P, type Pair } from './idle'

// ---------------------------------------------------------------- city builder
export interface BuildTheme {
  re: RegExp
  /** Home, food, workshop, shop, park (booster) and guard, in that order. */
  kinds: Pair[]
  pop: string
  coin: string
  unit: string
  /** Name of the periodic disaster (only used when the game text hints at one). */
  hazard: string
  /** 10x10 grid instead of 6x6. */
  big?: boolean
}
const B = (re: RegExp, kinds: string, pop: string, coin: string, unit: string, hazard: string): BuildTheme => ({ re, kinds: P(kinds), pop, coin, unit, hazard })
export const BUILDS: BuildTheme[] = [
  B(/volcano/i, 'Hut:🛖,Terrace Farm:🌾,Forge:🔥,Market:🏪,Shrine:⛩️,Lava Wall:🧱', 'Villagers', '🪙', 'coins', 'Eruption'),
  B(/theme park/i, 'Ride:🎢,Snack Stand:🌭,Mega Coaster:🎡,Gift Shop:🎁,Garden:🌷,Security:🛡️', 'Guests', '🎟️', 'tickets', 'Rainy day'),
  B(/ski|alpine/i, 'Lodge:🏠,Cafe Hut:☕,Ski Lift:🚡,Ski Shop:🎿,Pine Grove:🌲,Ski Patrol:🚑', 'Skiers', '🎿', 'lift tickets', 'Avalanche'),
  B(/boardwalk|seaside|beach/i, 'Beach Cottage:🏖️,Fish Shack:🐟,Pier Ride:🎡,Ice Cream Stand:🍦,Palm Grove:🌴,Lifeguard:🛟', 'Tourists', '🪙', 'coins', 'Storm'),
  B(/harbor|port/i, 'Cottage:🏠,Fishery:🐟,Dock:⚓,Market:🏪,Lighthouse:🗼,Coast Guard:🛡️', 'Dockers', '🪙', 'coins', 'Storm'),
  B(/treetop|canopy/i, 'Treehouse:🛖,Fruit Tree:🍎,Sawmill:🪚,Bazaar:🏪,Canopy Garden:🌿,Eagle Watch:🦅', 'Climbers', '🍃', 'leaves', 'Windstorm'),
  B(/mushroom/i, 'Cap House:🍄,Spore Farm:🧫,Spore Mill:🏭,Truffle Market:🏪,Moss Garden:🌿,Beetle Guard:🪲', 'Sporelings', '🍄', 'spores', 'Blight'),
  B(/beaver|dam/i, 'Lodge:🛖,Willow Grove:🌳,Log Mill:🪵,Trading Post:🏪,Reed Bed:🌾,Dam Wall:🧱', 'Beavers', '🪵', 'logs', 'Flood'),
  B(/hive|ant|termite|insect|pheromone/i, 'Nursery:🥚,Fungus Farm:🍄,Tunnel Works:⛏️,Pheromone Hub:🧪,Honeydew Garden:🌸,Soldier Post:🪖', 'Workers', '🍃', 'food', 'Beetle raid'),
  B(/monastery|cliffside|monk/i, 'Monk Cell:🛖,Terrace Garden:🌱,Scriptorium:📜,Pilgrim Hostel:🏯,Shrine:⛩️,Bell Tower:🔔', 'Monks', '🪷', 'merit', 'Rockfall'),
  B(/night shelter/i, 'Cot:🛏️,Vegetable Plot:🥕,Workshop:🔨,Trader:🏪,Lantern:🏮,Wall:🧱', 'Villagers', '🪵', 'supplies', 'Night creatures'),
  B(/underground|bunker|haven/i, 'Bunk Room:🛏️,Mushroom Farm:🍄,Scrap Shop:🔧,Trade Hall:🏪,Lamp Garden:💡,Blast Door:🚪', 'Survivors', '🔩', 'scrap', 'Raider attack'),
  B(/vent|reef|undersea|deep/i, 'Pod:🫧,Kelp Farm:🌿,Smelter:🌋,Trade Pod:🪸,Reef Garden:🐚,Sonar Guard:🛡️', 'Aquanauts', '🫧', 'credits', 'Pressure leak'),
  B(/ringworld|orbital|sky city|floating|space/i, 'Habitat Module:🏠,Hydroponics:🌱,Fabricator:🏭,Commerce Deck:🏬,Observation Garden:🌳,Shield Array:🛡️', 'Residents', '💫', 'credits', 'Meteor shower'),
  B(/\brail|metro\b|undercity/i, 'Neighborhood:🏘️,Cargo Yard:📦,Depot:🏭,Station:🚉,Signal Tower:🚦,Track Crew:👷', 'Commuters', '🚉', 'fares', 'Track failure'),
  B(/factory|conveyor|supply|candy/i, 'Assembler:🤖,Raw Mill:⛏️,Furnace:🔥,Packer:📦,Conveyor:➡️,Safety Valve:🚨', 'Workers', '⚙️', 'units', 'Overload'),
  B(/boss room/i, 'Treasure Pile:💰,Minion Pit:👹,Spike Trap:🪤,Cursed Altar:🔮,Torch:🕯️,Boss Statue:🗿', 'Minions', '💰', 'gold', 'Hero raid'),
  B(/boomtown|frontier|wild west/i, 'Cabin:🛖,Ranch:🐄,Mine:⛏️,General Store:🏪,Saloon:🍺,Sheriff:⭐', 'Settlers', '🥇', 'gold', 'Bandit raid'),
  B(/hamlet|kingdom|castle|walled|medieval/i, 'Cottage:🏠,Farm:🌾,Smithy:🔨,Market:🏪,Chapel Garden:⛪,Watchtower:🏯', 'Subjects', '🪙', 'coins', 'Raid'),
  B(/planner|metropolis|city/i, 'Houses:🏠,Farm:🌾,Factory:🏭,Mall:🏬,Park:🌳,Police:🚓', 'Citizens', '💵', 'coins', 'Fire'),
  B(/./, 'Home:🏠,Farm:🌾,Workshop:🔨,Market:🏪,Park:🌳,Guard Tower:🛡️', 'Citizens', '🪙', 'coins', 'Raid'),
]
export const pickBuild = (s: string): BuildTheme => BUILDS.find((b) => b.re.test(s)) ?? BUILDS[BUILDS.length - 1]
export const hasHazard = (s: string) => /raid|defen|eruption|wall|famine|siege|flood|storm|disaster|overload|rebuild|control|rock|shield|attack|walled|dam|creatures|before dark/i.test(s)
export const isBigGrid = (s: string) => /10x10|metropolis|pocket/i.test(s)

export const BASE_COST = [15, 30, 70, 110, 50, 140]
export const MAX_LV = 3

export interface Tile { k: number; lv: number }

export class City {
  n: number
  cells: (Tile | null)[]
  built = [0, 0, 0, 0, 0, 0]
  money = 80
  earned = 0
  constructor(n: number) {
    this.n = n
    this.cells = Array(n * n).fill(null)
  }
  neighbours(i: number): number[] {
    const x = i % this.n
    const y = Math.floor(i / this.n)
    const out: number[] = []
    if (x > 0) out.push(i - 1)
    if (x < this.n - 1) out.push(i + 1)
    if (y > 0) out.push(i - this.n)
    if (y < this.n - 1) out.push(i + this.n)
    return out
  }
  private count(i: number, k: number) {
    let c = 0
    for (const j of this.neighbours(i)) if (this.cells[j]?.k === k) c++
    return c
  }
  buildCost(k: number) {
    return Math.round(BASE_COST[k] * 1.12 ** this.built[k])
  }
  upCost(i: number) {
    const t = this.cells[i]
    return t && t.lv < MAX_LV ? Math.round(BASE_COST[t.k] * 2.4 ** t.lv) : Infinity
  }
  tileIncome(i: number): number {
    const t = this.cells[i]
    if (!t) return 0
    let v = 0
    switch (t.k) {
      case 0: v = 1 + 0.6 * this.count(i, 4); break
      case 1: v = 1.6 + 0.6 * this.count(i, 0); break
      case 2: v = Math.max(1, 4 - 0.6 * this.count(i, 0)) + 0.5 * this.count(i, 2); break
      case 3: v = 2.4 * this.count(i, 0); break
      default: v = 0
    }
    return v * 1.8 ** (t.lv - 1)
  }
  income() {
    let s = 0
    for (let i = 0; i < this.cells.length; i++) s += this.tileIncome(i)
    return s
  }
  population() {
    let p = 0
    for (const t of this.cells) if (t?.k === 0) p += 4 * t.lv
    return p
  }
  build(i: number, k: number): boolean {
    if (this.cells[i]) return false
    const c = this.buildCost(k)
    if (this.money < c) return false
    this.money -= c
    this.cells[i] = { k, lv: 1 }
    this.built[k]++
    return true
  }
  upgrade(i: number): boolean {
    const c = this.upCost(i)
    if (!isFinite(c) || this.money < c) return false
    this.money -= c
    this.cells[i]!.lv++
    return true
  }
  demolish(i: number): boolean {
    const t = this.cells[i]
    if (!t) return false
    this.money += Math.round(BASE_COST[t.k] * 0.4)
    this.built[t.k]--
    this.cells[i] = null
    return true
  }
  tick(dt: number) {
    const g = this.income() * dt
    this.money += g
    this.earned += g
  }
  /** Is tile i shielded by a guard on it or around it? */
  protectedTile(i: number) {
    return this.cells[i]?.k === 5 || this.count(i, 5) > 0
  }
  /** Disaster: destroys up to n unprotected tiles. Returns the destroyed indices. */
  strike(n: number, rnd: () => number): number[] {
    const cand: number[] = []
    this.cells.forEach((t, i) => { if (t && !this.protectedTile(i)) cand.push(i) })
    const out: number[] = []
    while (out.length < n && cand.length) {
      const j = Math.floor(rnd() * cand.length)
      const i = cand.splice(j, 1)[0]
      this.built[this.cells[i]!.k]--
      this.cells[i] = null
      out.push(i)
    }
    return out
  }
}

// ---------------------------------------------------------------- colony / care sim
export interface ColonyTheme {
  re: RegExp
  pop: string
  /** Housing item that raises the population cap. */
  home: Pair
  /** Four needs, each drained by the population. */
  needs: Pair[]
  /** What you build to supply each need. */
  makers: Pair[]
  coin: string
  unit: string
  /** Incident name (a random need drops). */
  event: string
}
const C = (re: RegExp, pop: string, home: string, needs: string, makers: string, coin: string, unit: string, event: string): ColonyTheme => ({
  re, pop, home: P(home)[0], needs: P(needs), makers: P(makers), coin, unit, event,
})
export const COLONIES: ColonyTheme[] = [
  C(/starship|bridge/i, 'Crew', 'Cabin Deck:🛏️', 'Shields:🛡️,Weapons:🔫,Engines:🚀,Life Support:🫧', 'Shield Generator:🛡️,Gunner Station:🔫,Engineering:🔧,Air Scrubber:🫧', '🚀', 'merit', 'Enemy fire'),
  C(/arcane|wizard zoo/i, 'Beasts', 'Cage:🏠', 'Mana:✨,Meat:🥩,Ward Strength:🔒,Affection:💖', 'Mana Well:✨,Meat Locker:🥩,Rune Ward:🔒,Petting Corner:💖', '✨', 'mana', 'Escape attempt'),
  C(/school year|wizard school/i, 'Students', 'Dorm:🏠', 'Grades:📚,Magic:🪄,Friends:💬,Sleep:💤', 'Library:📚,Spell Lab:🪄,Common Room:💬,Dorm Bed:💤', '⭐', 'house points', 'Pop quiz'),
  C(/mars dome|dome planner|pressure|bathysphere/i, 'Colonists', 'Dome Module:🏠', 'Pressure:🎈,Oxygen:🫧,Heat:🌡️,Water:💧', 'Pressure Pump:🛠️,Oxygenator:🌱,Heater:🔥,Ice Miner:⛏️', '💫', 'credits', 'Dust storm'),
  C(/space|moon|orbital|lunar|oxygen|colony/i, 'Colonists', 'Habitat Pod:🏠', 'Oxygen:🫧,Food:🍲,Power:⚡,Water:💧', 'Oxygenator:🌱,Hydroponics:🥬,Reactor:☢️,Ice Miner:⛏️', '💫', 'credits', 'Hull breach'),
  C(/fief|famine|peasant/i, 'Peasants', 'Cottage:🏠', 'Food:🌾,Firewood:🪵,Morale:😊,Health:🩹', 'Granary:🌾,Woodcutter:🪓,Tavern:🍺,Herbalist:🌿', '🌾', 'tithe', 'Hard winter'),
  C(/frostbite|glacier|northern|arctic|polar|sled|winter|research post|ashfall/i, 'Explorers', 'Warm Tent:⛺', 'Warmth:🔥,Food:🍖,Fuel:🪵,Morale:😊', 'Stove:🔥,Hunter:🏹,Woodcutter:🪓,Campfire Stories:🎻', '🧣', 'supplies', 'Blizzard'),
  C(/desert|oasis|nomad|dune/i, 'Nomads', 'Tent:⛺', 'Water:💧,Shade:🏕️,Food:🍖,Morale:😊', 'Well:⛲,Palm Awning:🌴,Date Grove:🌴,Drum Circle:🥁', '🐪', 'trade goods', 'Sandstorm'),
  C(/cabin|hermit|woods|farmhouse/i, 'Seasons', 'Extra Room:🏠', 'Firewood:🪵,Food:🍲,Sanity:🧠,Warmth:🔥', 'Woodpile:🪓,Garden:🥕,Hobby Corner:📚,Fireplace:🔥', '🪵', 'comfort', 'Cold snap'),
  C(/ant farm|tiny survivors/i, 'Ants', 'Chamber:🕳️', 'Food:🍃,Air:💨,Moisture:💧,Tunnels:⛏️', 'Leaf Pile:🍃,Air Shaft:💨,Dew Drop:💧,Digger:⛏️', '🐜', 'food', 'Spider visit'),
  C(/island|survival|survive|shipwreck/i, 'Castaways', 'Hut:🛖', 'Water:💧,Food:🥥,Shelter:🛖,Fire:🔥', 'Rain Catcher:🪣,Fishing Spot:🎣,Palm Roof:🌴,Fire Pit:🔥', '🥥', 'resources', 'Tropical storm'),
  C(/fief|famine|peasant|medieval/i, 'Peasants', 'Cottage:🏠', 'Food:🌾,Firewood:🪵,Morale:😊,Health:🩹', 'Granary:🌾,Woodcutter:🪓,Tavern:🍺,Herbalist:🌿', '🌾', 'tithe', 'Hard winter'),
  C(/dino|daycare/i, 'Hatchlings', 'Nest:🥚', 'Meat:🥩,Play:🎾,Splash:🛁,Nap:💤', 'Meat Basket:🥩,Chew Toy:🦴,Mud Bath:🛁,Warm Nest:🪺', '🦕', 'cuddles', 'Tantrum'),
  C(/unicorn/i, 'Unicorns', 'Stall:🏠', 'Hay:🌾,Brushing:🪮,Magic:✨,Rest:💤', 'Hay Rack:🌾,Brush:🪮,Rainbow Pool:🌈,Cloud Bed:☁️', '🦄', 'sparkles', 'Thunder'),
  C(/koi|pond|fish|aquarium/i, 'Koi', 'Pond Extension:🏠', 'Food:🍞,Oxygen:🫧,Clean Water:💧,Calm:🪷', 'Feeder:🍞,Bubbler:🫧,Filter:🧽,Lily Pads:🪷', '🐟', 'ripples', 'Heron visit'),
  C(/bee|hive|honey/i, 'Bees', 'Hive Box:🐝', 'Nectar:🌸,Warmth:🔥,Space:🏠,Queen Care:👑', 'Flower Patch:🌸,Hive Heater:🔥,Comb Frame:🍯,Royal Jelly:👑', '🍯', 'honey', 'Wasp raid'),
  C(/menagerie|clockwork|mechanical/i, 'Clockworks', 'Display Case:🏠', 'Winding:🔑,Oil:🛢️,Polish:✨,Spare Parts:⚙️', 'Winding Station:🔑,Oil Can:🛢️,Polish Cloth:✨,Parts Bin:⚙️', '⚙️', 'cogs', 'Rust'),
  C(/cat lady|cat|pet|tamagotchi|virtual|zoo|dog/i, 'Pets', 'Pet Bed:🛏️', 'Hunger:🍖,Fun:🎾,Clean:🛁,Sleep:💤', 'Food Bowl:🍖,Toy Box:🎾,Bath:🛁,Cozy Bed:💤', '💖', 'love', 'Tantrum'),
  C(/retirement|village|golden/i, 'Residents', 'Cottage:🏠', 'Health:🩺,Social:💬,Fun:🎲,Care:🧑‍⚕️', 'Clinic:🩺,Social Club:☕,Game Room:🎲,Nurse:🧑‍⚕️', '🌻', 'joy', 'Flu season'),
  C(/monastery|monk/i, 'Monks', 'Cell:🛖', 'Prayer:🙏,Food:🍲,Labor:🔨,Silence:🤫', 'Chapel:🙏,Kitchen:🍲,Workshop:🔨,Garden:🌿', '🪷', 'merit', 'Gossip'),
  C(/diary|teen|school|high/i, 'Friends', 'Locker:🔐', 'Grades:📚,Friends:💬,Sleep:💤,Fun:🎮', 'Study Nook:📚,Group Chat:💬,Bed:💤,Game Console:🎮', '⭐', 'popularity', 'Pop quiz'),
  C(/van|road|journey/i, 'Travelers', 'Camper Bed:🛏️', 'Fuel:⛽,Food:🍲,Sleep:💤,Fun:🎵', 'Gas Can:⛽,Camp Stove:🍲,Hammock:💤,Radio:🎵', '🛣️', 'miles', 'Flat tire'),
  C(/life|bachelor|pad|apartment|second chance/i, 'Life', 'Upgraded Home:🏠', 'Energy:⚡,Food:🍲,Social:💬,Mood:😊', 'Bed:🛏️,Fridge:🥫,Phone:📱,Hobby:🎨', '💵', 'savings', 'Bad day'),
  C(/weather|climate|front/i, 'Biomes', 'Biome Dome:🌍', 'Temperature:🌡️,Humidity:💧,Wind:🌬️,Sunlight:☀️', 'Heater:🔥,Rain Maker:🌧️,Wind Fan:🌀,Sun Lamp:☀️', '⛅', 'climate points', 'Heat wave'),
  C(/ecosystem|food web|plankton|chain/i, 'Species', 'Habitat:🌳', 'Plants:🌱,Herbivores:🐇,Predators:🐺,Decomposers:🍄', 'Seeder:🌱,Warren:🐇,Den:🐺,Compost:🍄', '🧬', 'biomass', 'Drought'),
  C(/pepper|heat|chili/i, 'Eaters', 'Bigger Table:🍽️', 'Cooling:🥛,Water:💧,Courage:💪,Bread:🍞', 'Milk Jug:🥛,Water Pitcher:💧,Cheer Squad:📣,Bread Basket:🍞', '🌶️', 'fire points', 'Ghost pepper'),
  C(/factory|overload|line/i, 'Machines', 'New Machine:🏭', 'Coolant:❄️,Pressure:🔧,Jam-free:🔩,Power:⚡', 'Coolant Pump:❄️,Valve:🔧,Unjammer:🔩,Generator:⚡', '⚙️', 'parts', 'Overload'),
  C(/bunker|rad storm|ration plan/i, 'Survivors', 'Bunk Room:🛏️', 'Food:🥫,Water:💧,Shielding:🛡️,Morale:😊', 'Ration Kitchen:🥫,Water Still:💧,Lead Plating:🛡️,Radio Hour:📻', '🥫', 'rations', 'Rad storm'),
  C(/gas mask|breath|fog|filter/i, 'Survivors', 'Shelter:🏠', 'Filters:😷,Clean Air:💨,Water:💧,Morale:😊', 'Filter Press:😷,Air Scrubber:💨,Still:💧,Radio:📻', '😷', 'supplies', 'Toxic cloud'),
  C(/nap|sleep/i, 'Dreamers', 'Bigger Bed:🛏️', 'Calm:🧘,Dark:🌑,Warmth:🧣,Quiet:🤫', 'Lullaby:🎶,Curtains:🌑,Blanket:🧣,Earplugs:🤫', '💤', 'Zs', 'Alarm clock'),
  C(/./, 'Citizens', 'Housing:🏠', 'Food:🍲,Water:💧,Power:⚡,Morale:😊', 'Farm:🌾,Well:⛲,Generator:⚡,Party Hall:🎉', '🪙', 'coins', 'Disaster'),
]
export const pickColony = (s: string): ColonyTheme => COLONIES.find((c) => c.re.test(s)) ?? COLONIES[COLONIES.length - 1]

export class Colony {
  pop = 2
  needs = [75, 75, 75, 75]
  lv = [1, 1, 1, 1]
  housing = 1
  auto = 0
  money = 20
  earned = 0
  dead = 0
  growT = 0
  dieT = 0
  private cd = [0, 0, 0, 0]
  /** Per-need demand weights so the four needs behave differently. */
  static W = [1, 0.9, 1.1, 0.8]
  cap() { return 3 + 3 * this.housing }
  demand(i: number) { return (0.35 + 0.28 * this.pop) * Colony.W[i] }
  supply(i: number) { return 1.5 * this.lv[i] }
  net(i: number) { return this.supply(i) - this.demand(i) }
  satisfaction() { return Math.min(1, Math.min(...this.needs) / 30) }
  income() { return this.pop * 0.9 * (1 + 0.25 * this.auto) * this.satisfaction() }
  makerCost(i: number) { return Math.round(25 * 1.75 ** (this.lv[i] - 1)) }
  homeCost() { return Math.round(45 * 1.9 ** (this.housing - 1)) }
  autoCost() { return Math.round(120 * 2.2 ** this.auto) }
  get lost() { return this.pop <= 0 }
  boost(i: number): boolean {
    if (this.cd[i] > 0) return false
    this.cd[i] = 0.35
    this.needs[i] = Math.min(100, this.needs[i] + 14)
    return true
  }
  incident(i: number) { this.needs[i] = Math.max(0, this.needs[i] - 35) }
  buyMaker(i: number) { const c = this.makerCost(i); if (this.money < c) return false; this.money -= c; this.lv[i]++; return true }
  buyHome() { const c = this.homeCost(); if (this.money < c) return false; this.money -= c; this.housing++; return true }
  buyAuto() { const c = this.autoCost(); if (this.money < c || this.auto >= 5) return false; this.money -= c; this.auto++; return true }
  tick(dt: number) {
    for (let i = 0; i < 4; i++) {
      this.cd[i] = Math.max(0, this.cd[i] - dt)
      this.needs[i] = Math.max(0, Math.min(100, this.needs[i] + this.net(i) * dt * 2))
    }
    const g = this.income() * dt
    this.money += g
    this.earned += g
    const lo = Math.min(...this.needs)
    if (lo <= 0) {
      this.dieT += dt
      if (this.dieT >= 3) { this.dieT = 0; this.pop--; this.dead++ }
      this.growT = 0
    } else {
      this.dieT = 0
      if (lo > 55 && this.pop < this.cap()) {
        this.growT += dt
        if (this.growT >= 7) { this.growT = 0; this.pop++ }
      }
    }
  }
}
