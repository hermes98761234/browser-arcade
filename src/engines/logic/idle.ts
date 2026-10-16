// Pure idle/tycoon logic: number formatting, economy math and keyword -> flavor tables.

const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc']
export function fmt(n: number): string {
  if (!isFinite(n)) return '∞'
  const neg = n < 0
  n = Math.abs(n)
  let out: string
  if (n < 1000) out = n < 10 ? (Math.floor(n * 10) / 10).toString() : Math.floor(n).toString()
  else {
    const i = Math.min(SUF.length - 1, Math.floor(Math.log10(n) / 3))
    const v = n / 1000 ** i
    out = (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + SUF[i]
  }
  return neg ? '-' + out : out
}

export const GROWTH = 1.15
export const unitCost = (base: number, owned: number) => base * GROWTH ** owned
/** Cost of buying n more when owning `owned`. */
export function bulkCost(base: number, owned: number, n: number): number {
  return (base * GROWTH ** owned * (GROWTH ** n - 1)) / (GROWTH - 1)
}
/** Largest n affordable with money (>=0). */
export function maxAffordable(base: number, owned: number, money: number): number {
  const c = base * GROWTH ** owned
  if (money < c) return 0
  return Math.floor(Math.log((money * (GROWTH - 1)) / c + 1) / Math.log(GROWTH))
}

export const PROD_COST = [15, 100, 1100, 12000, 130000, 1.4e6, 2e7, 3.3e8]
export const PROD_RATE = [0.1, 1, 8, 47, 260, 1400, 7800, 44000].map((x) => x * 4)

export type Pair = [string, string]
export interface Flavor { re: RegExp; unit: string; coin: string; prod: Pair[] }

export const FLAVORS: Flavor[] = [
  { re: /bak|bread|cake|pastry|dough|oven/i, unit: 'loaves', coin: '🥖', prod: [['Rolling Pin', '🪵'], ['Oven', '🔥'], ['Baker', '🧑‍🍳'], ['Dough Mixer', '🥣'], ['Storefront', '🏪'], ['Flour Mill', '🌾'], ['Bread Factory', '🏭'], ['Pastry Empire', '🏰']] },
  { re: /cookie|candy|sweet|sugar|donut|ice cream|chocolate|cocoa/i, unit: 'sweets', coin: '🍬', prod: [['Sprinkle Bot', '🤖'], ['Mixer', '🥣'], ['Oven', '🔥'], ['Sugar Mill', '🍭'], ['Candy Shop', '🏪'], ['Cookie Factory', '🏭'], ['Chocolate River', '🍫'], ['Sugar Empire', '🍩']] },
  { re: /coffee|cafe|café|tea|barista|brew/i, unit: 'cups', coin: '☕', prod: [['Barista', '🧑‍🍳'], ['Espresso Machine', '☕'], ['Grinder', '⚙️'], ['Cozy Cafe', '🏠'], ['Roastery', '🔥'], ['Bean Farm', '🌱'], ['Cafe Chain', '🏪'], ['Coffee Empire', '👑']] },
  { re: /pizza|food|burger|kitchen|truck|cook|chef|restaurant|diner|sushi|bento|recipe|galley|tavern/i, unit: 'plates', coin: '🍽️', prod: [['Line Cook', '🧑‍🍳'], ['Grill', '🔥'], ['Food Truck', '🚚'], ['Dining Room', '🍽️'], ['Franchise', '🏪'], ['Central Kitchen', '🏭'], ['Delivery Fleet', '🛵'], ['Food Empire', '👑']] },
  { re: /space|planet|orbit|star|moon|galax|cosmic|asteroid|colony|rocket|mars|terraform|station/i, unit: 'credits', coin: '💫', prod: [['Mining Drone', '🤖'], ['Drill Rig', '⛏️'], ['Orbital Station', '🛰️'], ['Asteroid Miner', '☄️'], ['Moon Base', '🌙'], ['Starfleet', '🚀'], ['Dyson Panel', '☀️'], ['Star Forge', '🌌']] },
  { re: /pirate|ship|harbor|port|sail|grog|boat|sea lord|doubloon|treasure/i, unit: 'doubloons', coin: '🪙', prod: [['Cabin Boy', '🧒'], ['Cannon', '💣'], ['Rowboat', '🛶'], ['Sloop', '⛵'], ['Treasure Map', '🗺️'], ['Galleon', '🚢'], ['Port Town', '⚓'], ['Ghost Fleet', '🏴‍☠️']] },
  { re: /fish|ocean|sea|aqua|kelp|reef|vent|seaweed|coral/i, unit: 'catch', coin: '🐟', prod: [['Fishing Line', '🎣'], ['Net', '🕸️'], ['Rowboat', '🛶'], ['Trawler', '🚤'], ['Fish Farm', '🐟'], ['Cannery', '🥫'], ['Fleet', '⚓'], ['Sea Empire', '🔱']] },
  { re: /wizard|magic|potion|mage|spell|lich|vampire|goblin|mimic|imp|witch|dragon|hero guild|reagent/i, unit: 'mana', coin: '✨', prod: [['Apprentice', '🧙'], ['Cauldron', '🧪'], ['Spell Book', '📖'], ['Enchanter', '🪄'], ['Crystal Tower', '🔮'], ['Dragon Hoard', '🐉'], ['Portal', '🌀'], ['Archmage', '🧙‍♂️']] },
  { re: /zoo|animal|cat|pet|beast|kaiju|ant |bee|hive|ant-|safari|dog|fox/i, unit: 'paws', coin: '🐾', prod: [['Feeder', '🥣'], ['Habitat', '🌿'], ['Petting Zoo', '🐐'], ['Keeper', '🧑‍🌾'], ['Safari Ride', '🚙'], ['Aquarium', '🐠'], ['Wildlife Park', '🦁'], ['Zoo Empire', '🏛️']] },
  { re: /farm|garden|crop|vineyard|vintner|greenhouse|field|orchard|plant|forest|harvest|moss|bonsai|tulip/i, unit: 'harvest', coin: '🌾', prod: [['Seed Pouch', '🌱'], ['Watering Can', '🚿'], ['Greenhouse', '🏡'], ['Tractor', '🚜'], ['Orchard', '🌳'], ['Windmill', '🌬️'], ['Farmers Market', '🧺'], ['Agri-Complex', '🏭']] },
  { re: /startup|tech|cyber|hacker|robot|pixel|software|code|app|bbs|data|network|esports|arcade|stock/i, unit: 'bytes', coin: '💾', prod: [['Intern', '🧑‍💻'], ['Laptop', '💻'], ['Dev Team', '👥'], ['Server', '🖥️'], ['Data Center', '🏢'], ['AI Lab', '🤖'], ['Satellite', '📡'], ['Megacorp', '🌐']] },
  { re: /mine|dungeon|dino|fossil|gem|cave|crystal|drill|quarry|dig/i, unit: 'gems', coin: '💎', prod: [['Pickaxe', '⛏️'], ['Miner', '⛑️'], ['Mine Cart', '🛒'], ['Drill', '🔩'], ['Mine Shaft', '🕳️'], ['Crystal Cavern', '💎'], ['Excavator', '🚜'], ['Deep Core', '🌋']] },
  { re: /steam|brass|factory|clockwork|automaton|machine|gear|wash|garage|repair|hardware|vending/i, unit: 'cogs', coin: '⚙️', prod: [['Cog', '⚙️'], ['Piston', '🔧'], ['Steam Engine', '🚂'], ['Foundry', '🏭'], ['Clock Tower', '🕰️'], ['Airship', '🎈'], ['Automaton', '🤖'], ['Aether Core', '🔮']] },
  { re: /town|city|village|hamlet|settle|kingdom|tram|boardwalk|resort|township|oasis|cabin|home|house/i, unit: 'coins', coin: '🪙', prod: [['Hut', '🛖'], ['Well', '⛲'], ['Farm Plot', '🌾'], ['Market Stall', '🏪'], ['Workshop', '🔨'], ['Harbor', '⚓'], ['Castle', '🏰'], ['Metropolis', '🏙️']] },
]
export const GENERIC_FLAVOR: Flavor = { re: /./, unit: 'coins', coin: '🪙', prod: [['Helper', '🧑'], ['Workshop', '🛠️'], ['Team', '👥'], ['Factory', '🏭'], ['Laboratory', '🔬'], ['Network', '🌐'], ['Corporation', '🏢'], ['Empire', '👑']] }

export const pickFlavor = (s: string): Flavor => FLAVORS.find((f) => f.re.test(s)) ?? GENERIC_FLAVOR

export type Mode = 'idle' | 'farm' | 'trade' | 'shop'
export function pickMode(s: string, mods: Set<string>): Mode {
  const nm = s.toLowerCase()
  if (mods.has('farm') || /farm|garden|crop|vineyard|vintner|greenhouse|orchard|harvest|seaweed|turnip|bonsai/.test(nm)) return 'farm'
  if (mods.has('trade') || /trade|trader|bazaar|barter|market|merchant|haggle|arbitrage|wholesale|futures|broker|ticker|auction|tulip/.test(nm)) return 'trade'
  if (/shop|restaurant|cafe|café|coffee|bakery|pizza|truck|parlor|tavern|diner|kitchen|bar |barista|cook(?!ie)|galley|sushi|bento|chef|store|cat lady|vending|hardware|arcade owner|bike repair|car wash/.test(nm)) return 'shop'
  return 'idle'
}

const trip = (s: string): [string, string, number][] => s.split(',').map((x) => { const [n, e, p] = x.trim().split(':'); return [n, e, Number(p)] })

export const CROPS: { re: RegExp; list: [string, string, number][] }[] = [
  { re: /vine|wine|vintner|grape/i, list: trip('Grape:🍇:1,Plum:🍑:1,Cherry:🍒:1,Olive:🫒:1,Fig:🫐:1') },
  { re: /sea|kelp|ocean|reef/i, list: trip('Kelp:🌿:1,Sea Grapes:🍇:1,Dulse:🥬:1,Pearl Moss:🪸:1,Sunweed:🌻:1') },
  { re: /pepper|chili|spice|heat/i, list: trip('Chili:🌶️:1,Pepper:🫑:1,Garlic:🧄:1,Onion:🧅:1,Ghost Pepper:🔥:1') },
  { re: /pumpkin|halloween|ninja|poison/i, list: trip('Pumpkin:🎃:1,Mushroom:🍄:1,Beet:🫜:1,Nightshade:🌿:1,Eggplant:🍆:1') },
  { re: /.*/, list: trip('Carrot:🥕:1,Corn:🌽:1,Tomato:🍅:1,Pumpkin:🎃:1,Strawberry:🍓:1') },
]
export const GOODS: { re: RegExp; list: [string, string, number][] }[] = [
  { re: /space|galact|orbit|star|planet|cyber|tech|black market|hot/i, list: trip('Ore:🪨:12,Fuel:⛽:30,Chips:💾:70,Crystals:💎:140,Drones:🤖:260,Antimatter:⚛️:480') },
  { re: /pirate|harbor|grog|barter|island|sea|ship|ticker/i, list: trip('Salt:🧂:10,Rum:🍾:28,Silk:🧵:65,Spice:🌶️:120,Pearls:🦪:230,Gold Idol:🗿:420') },
  { re: /wizard|magic|fantasy|reagent|wholesale|potion/i, list: trip('Toadstool:🍄:11,Moonwater:💧:30,Dragon Scale:🐉:75,Mandrake:🌱:130,Star Dust:✨:250,Phoenix Ash:🔥:450') },
  { re: /.*/, list: trip('Grain:🌾:10,Wool:🧶:28,Spice:🌶️:65,Tea:🍵:120,Silk:🧵:230,Jewels:💎:420') },
]
export const MENUS: { re: RegExp; list: [string, string, number][] }[] = [
  { re: /coffee|cafe|café|barista|cat|tea/i, list: trip('Espresso:☕:3,Latte:🥛:4,Tea:🍵:3,Croissant:🥐:4,Cake:🍰:6,Cookie:🍪:2') },
  { re: /ice|parlor|candy|cookie/i, list: trip('Vanilla:🍦:3,Sundae:🍨:6,Popsicle:🍧:3,Donut:🍩:4,Cone:🍡:3,Shake:🥤:5') },
  { re: /pizza|truck|food/i, list: trip('Pizza:🍕:6,Taco:🌮:4,Burger:🍔:5,Fries:🍟:3,Hot Dog:🌭:3,Soda:🥤:2') },
  { re: /sushi|bento|japan|ninja/i, list: trip('Sushi:🍣:6,Onigiri:🍙:3,Ramen:🍜:6,Tempura:🍤:5,Tea:🍵:2,Dango:🍡:3') },
  { re: /tavern|grog|galley|pirate|goblin|vampire|dragon/i, list: trip('Ale:🍺:3,Stew:🍲:5,Roast:🍖:7,Bread:🍞:2,Wine:🍷:5,Pie:🥧:4') },
  { re: /bak/i, list: trip('Baguette:🥖:3,Croissant:🥐:4,Cake:🎂:8,Pretzel:🥨:3,Pie:🥧:5,Bagel:🥯:3') },
  { re: /.*/, list: trip('Burger:🍔:5,Fries:🍟:3,Pizza:🍕:6,Soda:🥤:2,Salad:🥗:4,Cake:🍰:5') },
]
export const pickTable = <T>(t: { re: RegExp; list: T }[], s: string): T => (t.find((x) => x.re.test(s)) ?? t[t.length - 1]).list
