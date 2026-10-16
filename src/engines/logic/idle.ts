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
export interface Flavor { re: RegExp; unit: string; coin: string; prod: Pair[]; act?: string }

/** "Name:emoji,Name:emoji" -> pairs. */
export const P = (s: string): Pair[] => s.split(',').map((x) => x.trim().split(':') as Pair)
const F = (re: RegExp, unit: string, coin: string, prod: string, act?: string): Flavor => ({ re, unit, coin, prod: P(prod), act })

// Order matters: the first regex matching "name desc" wins, so the specific businesses come first.
export const FLAVORS: Flavor[] = [
  F(/hospital|clinic|patient/i, 'patients', '💊', 'First Aider:🩹,Nurse:🧑‍⚕️,Ward:🛏️,Surgeon:🔪,X-Ray Suite:🩻,Pharmacy:💊,Research Lab:🔬,Medical Center:🏥', 'treat patients'),
  F(/stock|ticker|broker|portfolio|crypto|bitcoin|token|futures|commodity/i, 'hashes', '₿', 'GPU Rig:🎮,Mining Rack:🗄️,ASIC Miner:🖥️,Cooling Fans:🌀,Mining Farm:🏭,Solar Array:☀️,Quantum Miner:⚛️,Hash Empire:🌐', 'mine a block'),
  F(/esports|gaming team|gaming org/i, 'subscribers', '🎮', 'Streamer:📹,Coach:🧑‍🏫,Gaming House:🏠,Sponsor Deal:🤝,Arena:🏟️,Pro Roster:🎮,Broadcast Deal:📺,World Champions:🏆', 'practice scrims'),
  F(/football|soccer|youth academy|fantasy league|draft|transfer/i, 'fans', '⚽', 'Scout:🔍,Coach:🧑‍🏫,Youth Academy:🎓,Training Ground:🏃,Stadium:🏟️,Sponsor:🤝,TV Rights:📺,Global Brand:🌍', 'train the squad'),
  F(/baseball|dugout|diamond/i, 'fans', '⚾', 'Batboy:🧒,Pitching Coach:🧑‍🏫,Farm Team:🌱,Bullpen:🔥,Ballpark:🏟️,Hot Dog Stand:🌭,Broadcast Deal:📺,Dynasty:🏆', 'run drills'),
  F(/rugby|scrum|darts|league|club management|team roster|sports|cycling|swim|relay|directeur/i, 'fans', '🏆', 'Water Carrier:🚰,Assistant Coach:🧑‍🏫,Clubhouse:🏠,Physio:💆,Stadium:🏟️,Sponsor:🤝,TV Rights:📺,League Champions:🏆', 'train the team'),
  F(/horse|stable|racing|jockey/i, 'prize money', '🏇', 'Stable Hand:🧑‍🌾,Paddock:🌿,Trainer:🧑‍🏫,Foal:🐴,Racetrack:🏁,Stud Farm:🐎,Jockey Club:🏇,Triple Crown:👑', 'train the horses'),
  F(/gym|fitness|strength|muscle|lift/i, 'gains', '💪', 'Dumbbell:🏋️,Protein Shake:🥤,Personal Trainer:🧑‍🏫,Treadmill Row:🏃,Spin Studio:🚴,Gym Branch:🏢,Supplement Brand:💊,Fitness Franchise:🌍', 'lift'),
  F(/guild|headquarters|hero.*mission/i, 'renown', '🛡️', 'Recruit:🧑,Quest Board:📜,Squire:🛡️,Healer:🧑‍⚕️,Guild Hall:🏰,Hero Party:🦸,Dragon Slayer:🐉,Legend:🌟', 'send a quest'),
  F(/ragnarok|norse|viking/i, 'glory', '⚡', 'Rune Carver:🪨,Shield Maiden:🛡️,Longship:⛵,Einherjar:⚔️,Valkyrie:🪽,Mjolnir Forge:🔨,Bifrost:🌈,Asgard:🏰', 'prepare'),
  F(/meteor|dino|fossil|impact/i, 'supplies', '🦕', 'Fern Gatherer:🌿,Nest:🥚,Water Hole:💧,Herd:🦕,Raptor Patrol:🦖,Tunnel Shelter:⛏️,Deep Bunker:🕳️,Ark:🛸', 'prepare'),
  F(/paperclip/i, 'clips', '📎', 'AutoClipper:📎,Wire Drawer:🧵,MegaClipper:⚙️,Clip Factory:🏭,Quantum Chip:💾,Probe:🛸,Drone Swarm:🐝,Universe Converter:🌌', 'make a clip'),
  F(/antimatter|particle|exponential/i, 'particles', '⚛️', 'Proton Gun:⚛️,Magnet Ring:🧲,Collider:🔄,Reactor:☢️,Dimension:🌀,Quantum Foam:🫧,Black Hole:🕳️,Multiverse:🌌', 'collide'),
  F(/terraform/i, 'eco points', '🌍', 'Lichen Seeder:🌱,Ice Melter:🧊,Atmosphere Plant:🏭,Algae Vat:🧫,Ocean Pump:🌊,Orbital Mirror:🪞,Forest Seeder:🌲,Biosphere:🌍', 'terraform'),
  F(/ant colony|ant rts|termite|\bants?\b|aphid/i, 'food', '🍃', 'Forager:🐜,Leaf Cutter:🍃,Nest Chamber:🕳️,Soldier Ant:🪖,Aphid Herd:🫛,Fungus Garden:🍄,Queen Chamber:👑,Super Colony:🏔️', 'forage'),
  F(/gold rush|gold pan|prospect|nugget/i, 'nuggets', '🥇', 'Gold Pan:🍳,Prospector:⛏️,Sluice Box:🪣,Dynamite:🧨,Claim:🚩,Steam Drill:🚂,Rail Cart:🛒,Boom Town:🏜️', 'pan for gold'),
  F(/\boil\b/i, 'barrels', '🛢️', 'Pump Jack:⛽,Derrick:🗼,Storage Tank:🛢️,Refinery:🏭,Pipeline:🧵,Offshore Rig:🌊,Tanker:🚢,Petro State:👑', 'drill'),
  F(/game dev|make games/i, 'players', '🎮', 'Indie Dev:🧑‍💻,Pixel Artist:🎨,Composer:🎵,Playtester:🕹️,Studio:🏢,Publisher:📦,Engine Tech:⚙️,AAA Blockbuster:🏆', 'ship a game'),
  F(/train (network|tycoon|station)|steam train|\brail|metro|\btram\b|streetcar|monorail|locomotive|subway/i, 'passengers', '🚉', 'Handcar:🛤️,Platform:🚏,Locomotive:🚂,Station:🚉,Depot:🏭,Rail Line:🛤️,Express Service:🚄,Rail Empire:🚆', 'sell tickets'),
  F(/ferry|tug|canal|barge/i, 'fares', '⛴️', 'Rowboat:🛶,Dock:⚓,Ferry:⛴️,Ticket Booth:🎫,Terminal:🏢,Cargo Barge:🚢,Harbor Line:🌊,Shipping Empire:🚢', 'sell tickets'),
  F(/airport|cargo|freight|airship|aircraft|runway/i, 'freight', '✈️', 'Baggage Cart:🧳,Hangar:🛩️,Cargo Plane:✈️,Runway:🛫,Control Tower:🗼,Sorting Hub:📦,Jumbo Freighter:🛬,Air Empire:🌍', 'load cargo'),
  F(/evil lord|overlord|dark lord/i, 'evil', '😈', 'Imp Intern:👺,Trap Workshop:🪤,Orc Barracks:👹,Dungeon Wing:🏚️,Dragon Division:🐉,Cursed Mine:⛏️,Evil Marketing:📣,Lair HQ:🏰', 'plot evil'),
  F(/walking dog|walk the dog|real steps|gps walk|walk real/i, 'steps', '👟', 'Dog Treat:🦴,Tennis Ball:🎾,Leash:🦮,Dog Park:🌳,Dog Walker:🚶,Pet Hotel:🏨,Fetch Arena:🏟️,Dog Utopia:🐕', 'walk'),
  F(/goblin union|union|worker demands/i, 'dues', '✊', 'Picket Sign:🪧,Shop Steward:🧌,Break Room:☕,Union Hall:🏛️,Strike Fund:💰,Lobbyist:🤝,Goblin Guild:⚔️,Grand Union:👑', 'rally'),
  F(/crypt|vampire|lich|undead|ghost|phylactery|thrall/i, 'souls', '👻', 'Skeleton Digger:💀,Ghoul Janitor:🧟,Bone Pile:🦴,Crypt:🪦,Ghost Guard:👻,Coffin Works:⚰️,Bat Colony:🦇,Necropolis:🏚️', 'haunt'),
  F(/bounty|hunt/i, 'bounty', '🎯', 'Wanted Poster:📜,Bounty Hunter:🤠,Rowboat Patrol:🛶,Navy Sloop:⛵,Harpoon Cannon:💣,Warship:🚢,Fort Royal:🏰,Admiralty:🎖️', 'chase a pirate'),
  F(/invent|tech tree/i, 'ideas', '💡', 'Sharp Stick:🪨,Wheel:🛞,Lever:⚖️,Pulley:🪢,Gear Train:⚙️,Steam Engine:🚂,Dynamo:⚡,Think Tank:🧠', 'invent'),
  F(/bird|feather/i, 'sightings', '🪶', 'Field Notes:📓,Binoculars:🔭,Bird Feeder:🪺,Hide:🛖,Camera:📷,Guide Book:📖,Birding Club:👥,Sanctuary:🦜', 'spot a bird'),
  F(/heist|robber|thief|burglar/i, 'loot', '💰', 'Lookout:👀,Lockpick:🔐,Safecracker:🧑‍🔧,Getaway Car:🚗,Hacker:💻,Vault Map:🗺️,Inside Man:🕴️,Master Plan:🧠', 'case the joint'),
  F(/mutiny|crew|captain/i, 'loyalty', '⚓', 'Whisper:🗣️,Rum Ration:🍺,Rope Knot:🪢,Ringleader:🏴‍☠️,Secret Meeting:🕯️,Cutlass Rack:⚔️,Bribed Officer:💰,Pirate King:👑', 'sway the crew'),
  F(/town hall|vote|laws|council|election/i, 'votes', '🗳️', 'Clerk:🗒️,Petition:✍️,Committee:👥,Town Meeting:🏛️,Referendum:🗳️,Press Office:📰,Lobby:🤝,Capital:🏙️', 'campaign'),
  F(/weather|climate|storm|\brain\b|cloud/i, 'climate points', '⛅', 'Cloud Seeder:☁️,Wind Fan:🌬️,Rain Maker:🌧️,Sun Lamp:🌞,Storm Engine:⛈️,Jet Stream:🌀,Aurora Net:🌌,Planet Thermostat:🌡️', 'tweak the sky'),
  F(/landlord|rent\b|crater/i, 'rent', '🌙', 'Crater Claim:🌑,Dome Rental:🏠,Alien Tenant:👽,Moon Hotel:🏨,Lunar Mall:🏬,Rover Shuttle:🚙,Billboard:🪧,Moon Realty:🏙️', 'collect rent'),
  F(/toy|workshop inc/i, 'toys', '🧸', 'Elf Helper:🧝,Wood Lathe:🪚,Paint Shop:🎨,Gift Wrapper:🎁,Toy Line:🏭,Plush Factory:🧸,Sleigh Fleet:🛷,Toy Empire:🎄', 'build a toy'),
  F(/escape room/i, 'tickets', '🔑', 'Padlock:🔒,Puzzle Box:🧩,Cipher Wall:🔐,Themed Room:🚪,Game Master:🧑‍💼,Second Venue:🏢,Booking Site:🌐,Escape Chain:🗝️', 'run a game'),
  F(/cookie|candy|sweet|sugar|donut|ice cream|chocolate|cocoa/i, 'sweets', '🍬', 'Sprinkle Bot:🤖,Mixer:🥣,Oven:🔥,Sugar Mill:🍭,Candy Shop:🏪,Cookie Factory:🏭,Chocolate River:🍫,Sugar Empire:🍩'),
  F(/bak|bread|cake|pastry|dough|oven/i, 'loaves', '🥖', 'Rolling Pin:🪵,Oven:🔥,Baker:🧑‍🍳,Dough Mixer:🥣,Storefront:🏪,Flour Mill:🌾,Bread Factory:🏭,Pastry Empire:🏰'),
  F(/coffee|cafe|café|tea|barista|brew/i, 'cups', '☕', 'Barista:🧑‍🍳,Espresso Machine:☕,Grinder:⚙️,Cozy Cafe:🏠,Roastery:🔥,Bean Farm:🌱,Cafe Chain:🏪,Coffee Empire:👑'),
  F(/pizza|food|burger|kitchen|truck|cook|chef|restaurant|diner|sushi|bento|recipe|galley|tavern/i, 'plates', '🍽️', 'Line Cook:🧑‍🍳,Grill:🔥,Food Truck:🚚,Dining Room:🍽️,Franchise:🏪,Central Kitchen:🏭,Delivery Fleet:🛵,Food Empire:👑'),
  F(/robot|bot\b|assembly|android|mech\b/i, 'units', '🤖', 'Welder Arm:🦾,Conveyor:🛞,Assembly Cell:🤖,Paint Booth:🎨,Robot Line:🏭,AI Overseer:🧠,Mega Factory:🏗️,Machine World:🌐'),
  F(/startup|tech|cyber|hacker|pixel|software|code|app\b|bbs|data|network|arcade/i, 'bytes', '💾', 'Intern:🧑‍💻,Laptop:💻,Dev Team:👥,Server:🖥️,Data Center:🏢,AI Lab:🤖,Satellite:📡,Megacorp:🌐'),
  F(/space|planet|orbit|star|moon|galax|cosmic|asteroid|colony|rocket|mars|station|telescope/i, 'credits', '💫', 'Mining Drone:🤖,Drill Rig:⛏️,Orbital Station:🛰️,Asteroid Miner:☄️,Moon Base:🌙,Starfleet:🚀,Dyson Panel:☀️,Star Forge:🌌'),
  F(/pirate|ship|harbor|port|sail|grog|boat|sea lord|doubloon|treasure/i, 'doubloons', '🪙', 'Cabin Boy:🧒,Cannon:💣,Rowboat:🛶,Sloop:⛵,Treasure Map:🗺️,Galleon:🚢,Port Town:⚓,Ghost Fleet:🏴‍☠️'),
  F(/fish|ocean|sea|aqua|kelp|reef|vent|seaweed|coral|koi|pond/i, 'catch', '🐟', 'Fishing Line:🎣,Net:🕸️,Rowboat:🛶,Trawler:🚤,Fish Farm:🐟,Cannery:🥫,Fleet:⚓,Sea Empire:🔱'),
  F(/wizard|magic|potion|mage|spell|witch|dragon|reagent/i, 'mana', '✨', 'Apprentice:🧙,Cauldron:🧪,Spell Book:📖,Enchanter:🪄,Crystal Tower:🔮,Dragon Hoard:🐉,Portal:🌀,Archmage:🧙‍♂️'),
  F(/dungeon|auto-fight|floor|goblin|mimic|imp\b|kaiju/i, 'gold', '🗡️', 'Rusty Sword:🗡️,Squire:🛡️,Archer:🏹,Knight:🐴,Barracks:🏰,Wizard Tower:🔮,Dragon Slayer:🐉,Hero Legion:🦸'),
  F(/evolv|evolution|organism|plankton|microb|food chain|species/i, 'DNA', '🧬', 'Cell:🦠,Colony:🫧,Tissue:🧫,Organ:🫀,Creature:🐛,Species:🦎,Ecosystem:🌿,Apex Lineage:🧬'),
  F(/zoo|animal|cat|pet|beast|bee|hive|safari|dog|fox|menagerie/i, 'paws', '🐾', 'Feeder:🥣,Habitat:🌿,Petting Zoo:🐐,Keeper:🧑‍🌾,Safari Ride:🚙,Aquarium:🐠,Wildlife Park:🦁,Zoo Empire:🏛️'),
  F(/farm|garden|crop|vineyard|vintner|greenhouse|field|orchard|plant|forest|harvest|moss|bonsai|tulip/i, 'harvest', '🌾', 'Seed Pouch:🌱,Watering Can:🚿,Greenhouse:🏡,Tractor:🚜,Orchard:🌳,Windmill:🌬️,Farmers Market:🧺,Agri-Complex:🏭'),
  F(/mine|gem|cave|crystal|drill|quarry|dig/i, 'gems', '💎', 'Pickaxe:⛏️,Miner:⛑️,Mine Cart:🛒,Drill:🔩,Mine Shaft:🕳️,Crystal Cavern:💎,Excavator:🚜,Deep Core:🌋'),
  F(/steam|brass|factory|clockwork|automaton|machine|gear|wash|garage|repair|hardware|vending|clock/i, 'cogs', '⚙️', 'Cog:⚙️,Piston:🔧,Steam Engine:🚂,Foundry:🏭,Clock Tower:🕰️,Airship:🎈,Automaton:🤖,Aether Core:🔮'),
  F(/town|city|village|hamlet|settle|kingdom|boardwalk|resort|township|oasis|cabin|home|house/i, 'coins', '🪙', 'Hut:🛖,Well:⛲,Farm Plot:🌾,Market Stall:🏪,Workshop:🔨,Harbor:⚓,Castle:🏰,Metropolis:🏙️'),
]
export const GENERIC_FLAVOR: Flavor = F(/./, 'coins', '🪙', 'Helper:🧑,Workshop:🛠️,Team:👥,Factory:🏭,Laboratory:🔬,Network:🌐,Corporation:🏢,Empire:👑')

export const pickFlavor = (s: string): Flavor => FLAVORS.find((f) => f.re.test(s)) ?? GENERIC_FLAVOR

export type Mode = 'idle' | 'farm' | 'trade' | 'shop' | 'build' | 'colony'

const CLASSIC_RE = /idle bakery|wheel inventor|bitcoin|paperclip|hero guild|mutiny|esports|baseball|rugby|darts|cycling|swim squad|football|youth academy|fantasy league|horse stable|gym membership|strength/
const BUILD_RE = /kingdom builder|city planner|hamlet|boomtown|treetop|metropolis|boardwalk|volcano village|beaver dam|hive mind|cliffside|harbor haven|mushroom kingdom|sky city|orbital ring|ringworld|underground haven|deep vent|theme park|ski resort|undercity|conveyor kingdom|factory line|supply chain|candy factory|boss room|termite tower|bunker colony|island raid|night shelter|city builder|town builder|village builder/
const COLONY_RE = /space colony|moon base|mars dome|dome planner|frostbite|glacier outpost|northern outpost|desert nomad|desert oasis|deep woods cabin|hermit cabin|farmhouse|island survival|fief|famine|pet virtual|tamagotchi|daycare|cat lady|unicorn stable|koi pond|bee hive keeper|menagerie|life sim|diary|retirement|bachelor pad|monastery life|van life|weather maker|ecosystem|food web|plankton|ant farm|pepper heat|factory overload|gas mask|bathysphere|sled dog|survival|oxygen|arcane menagerie|school year|starship bridge|underground bunker|bunker ration|rad storm|frostbite camp|shipwrecked|tiny survivors|research post|ashfall|aquarium/
const TRADE_RE = /\btrad(e|er|ers|ing)\b|trades\b|antique|bazaar|barter|merchant|haggl|arbitrage|wholesale|futures|broker|ticker|auction|tulip|commodity|stock (market|ticker)|stock market|crypto|coin collector|flipper|winter market|hauler/
const SHOP_RE = /heraldry|dungeon landlord|dungeon tour|tavern under|hospital|clinic|patient|airport|landing|traffic|intersection|hotel|motel|cinema|laundromat|car wash|groom|tattoo|hangar|bike repair|clockmaker|inventor's|automaton|potion shop|bookshop|comic shop|record store|florist|flower stall|bubble tea|ramen|dumpling|pasta|pitmaster|barbecue|bento|chili|cheese|tea house|lemonade|arcade owner|vending|hardware|bowling|postal|warehouse|tugboat|lock keeper|haunted halls|mimic shop|cooking chaos|kitchen rush|pixel chef|cat cafe|visual novel|coffee|cafe|café|barista|ice cream|sushi|tavern|galley|bakery|bread kneader|pizza|food truck|restaurant|diner|kitchen|chef|\bshop\b|store|haunted hotel|stand\b/
const FARM_RE = /slime farm|seedling|farm|garden|crop|vineyard|vintner|greenhouse|orchard|harvest|seaweed|turnip|bonsai|pumpkin|scarecrow|hydroponic|spice garden|honey meadow|mushroom cellar|sprout|moss/

export function pickMode(s: string, mods: Set<string>): Mode {
  const nm = s.toLowerCase()
  if (CLASSIC_RE.test(nm)) return 'idle'
  if (/seedling|sapling/.test(nm)) return 'farm'
  if (BUILD_RE.test(nm)) return 'build'
  if (TRADE_RE.test(nm) || (mods.has('trade') && !/shop|port|kingdom/.test(nm))) return 'trade'
  if (COLONY_RE.test(nm)) return 'colony'
  if (SHOP_RE.test(nm)) return 'shop'
  if (mods.has('farm') || FARM_RE.test(nm)) return 'farm'
  return 'idle'
}

/** Games with a countdown to doom: reach the goal before the clock runs out. */
export const hasDeadline = (s: string) => /countdown|before doom|impact/i.test(s)

const trip = (s: string): [string, string, number][] => s.split(',').map((x) => { const [n, e, p] = x.trim().split(':'); return [n, e, Number(p)] })

export const CROPS: { re: RegExp; list: [string, string, number][] }[] = [
  { re: /vine|wine|vintner|grape/i, list: trip('Grape:🍇:1,Plum:🍑:1,Cherry:🍒:1,Olive:🫒:1,Fig:🫐:1') },
  { re: /sea|kelp|ocean|reef/i, list: trip('Kelp:🌿:1,Sea Grapes:🍇:1,Dulse:🥬:1,Pearl Moss:🪸:1,Sunweed:🌻:1') },
  { re: /pepper|chili|spice|heat/i, list: trip('Chili:🌶️:1,Pepper:🫑:1,Garlic:🧄:1,Onion:🧅:1,Ghost Pepper:🔥:1') },
  { re: /slime|dungeon/i, list: trip('Green Slime:🟢:1,Blue Slime:🔵:1,Fire Slime:🟠:1,Gold Slime:🟡:1,Rainbow Slime:🌈:1') },
  { re: /pumpkin|halloween|ninja|poison/i, list: trip('Pumpkin:🎃:1,Mushroom:🍄:1,Beet:🫜:1,Nightshade:🌿:1,Eggplant:🍆:1') },
  { re: /mushroom|cellar|fung/i, list: trip('Button:🍄:1,Shiitake:🍄‍🟫:1,Oyster:🐚:1,Truffle:🟤:1,Glow Cap:✨:1') },
  { re: /flower|honey|meadow|butterfl|bloom/i, list: trip('Daisy:🌼:1,Tulip:🌷:1,Sunflower:🌻:1,Lavender:🪻:1,Rose:🌹:1') },
  { re: /.*/, list: trip('Carrot:🥕:1,Corn:🌽:1,Tomato:🍅:1,Pumpkin:🎃:1,Strawberry:🍓:1') },
]

// ---------- trade ----------
export interface TradeTheme {
  re: RegExp
  list: [string, string, number][]
  /** Capacity word ("Cargo", "Portfolio"). */
  cargo: string
  /** Capacity upgrade label. */
  big: string
  coin: string
  intro: string
  up: string
  down: string
}
const T = (re: RegExp, list: string, cargo: string, big: string, intro: string, up: string, down: string, coin = '💵'): TradeTheme => ({ re, list: trip(list), cargo, big, coin, intro, up, down })
export const TRADES: TradeTheme[] = [
  T(/crypto|token/i, 'BitCoin:🟠:12,DogeCoin:🐕:30,MoonToken:🌙:70,ByteCoin:💾:140,RocketCoin:🚀:260,DiamondHands:💎:480', 'Wallet', 'Bigger wallet', 'Exchanges open 24/7. HODL or sell!', 'pumps on a tweet!', 'plunges in a rug pull!', '₿'),
  T(/stock|ticker|broker|portfolio|equity|wall street/i, 'Rail Co:🚂:12,Steel Inc:⚙️:30,Oil Corp:🛢️:70,Bank Corp:🏦:140,Radio Co:📻:260,Tech Corp:💾:480', 'Portfolio', 'Bigger portfolio', 'The bell rings. Buy low, sell high!', 'surges on great earnings!', 'plunges on bad news!', '💵'),
  T(/commodity|futures|pit/i, 'Wheat:🌾:10,Corn:🌽:28,Coffee:☕:65,Crude Oil:🛢️:120,Copper:🟤:230,Gold:🥇:420', 'Contracts', 'More margin', 'Traders are shouting in the pit. Shout back!', 'rallies on a shortage!', 'crashes on a glut!'),
  T(/coin/i, 'Penny:🪙:10,Silver Dollar:🥈:28,Gold Eagle:🥇:65,Ancient Drachma:🏺:120,Error Coin:🔍:230,Royal Ducat:👑:420', 'Coin album', 'Bigger album', 'The coin show is open. Grade, buy, flip!', 'is in a collector craze!', 'hit by a forgery scare!'),
  T(/ivory|book|university|campus/i, 'Textbook:📘:10,Atlas:🗺️:28,First Edition:📕:65,Manuscript:📜:120,Rare Folio:📚:230,Codex:🪶:420', 'Backpack', 'Bigger backpack', 'Term begins. Students need books!', 'is on every syllabus!', 'was just reprinted!'),
  T(/fur|trading post|frontier/i, 'Beaver Pelt:🦫:10,Fox Fur:🦊:28,Salt:🧂:65,Musket:🔫:120,Gold Dust:✨:230,Bear Hide:🐻:420', 'Sled', 'Bigger sled', 'The trading post opens. Winter is coming.', 'is scarce this winter!', 'floods the post!'),
  T(/black market|hot tech|space|galact|orbit|star|planet|cyber|tech|hauler/i, 'Ore:🪨:12,Fuel:⛽:30,Chips:💾:70,Crystals:💎:140,Drones:🤖:260,Antimatter:⚛️:480', 'Cargo', 'Bigger hold', 'Docking bay open. Buy low, sell high!', 'shortage! Prices soar.', 'glut! Prices crash.'),
  T(/pirate|grog|ship|sea|island|barter/i, 'Coconut:🥥:10,Rum:🍾:28,Silk:🧵:65,Spice:🌶️:120,Pearls:🦪:230,Gold Idol:🗿:420', 'Hold', 'Bigger hold', 'The harbor market is open. Barter well!', 'shortage! Prices soar.', 'glut! Prices crash.', '🪙'),
  T(/wizard|magic|fantasy|reagent|wholesale|potion/i, 'Toadstool:🍄:11,Moonwater:💧:30,Dragon Scale:🐉:75,Mandrake:🌱:130,Star Dust:✨:250,Phoenix Ash:🔥:450', 'Crate space', 'Bigger crate', 'The reagent exchange is open.', 'shortage! Prices soar.', 'glut! Prices crash.'),
  T(/silk|saffron|bazaar|spice|haggl/i, 'Dates:🌴:10,Rugs:🧶:28,Saffron:🧡:65,Silk:🧵:120,Incense:🪔:230,Jewels:💎:420', 'Camel packs', 'Bigger caravan', 'The bazaar is loud. Haggle hard!', 'shortage! Prices soar.', 'glut! Prices crash.', '🪙'),
  T(/tulip/i, 'Crocus:🌷:10,Hyacinth:🪻:28,Striped Tulip:🌷:65,Rare Bulb:🧅:120,Semper Augustus:🌺:260,Greenhouse Deed:🏡:480', 'Bulb crate', 'Bigger crate', 'The tulip exchange buzzes. Ride the bubble, escape before it bursts!', 'is in a frenzy! Prices soar.', 'collapses! The bubble bursts.'),
  T(/auction|antique|garage sale/i, 'Teacup:🍵:10,Old Clock:🕰️:28,Vase:🏺:65,Oil Painting:🖼️:120,Bronze Statue:🗿:230,Royal Jewel:💎:420', 'Van space', 'Bigger van', 'Gavel up! Find bargains and flip them at the next auction.', 'is hot with collectors!', 'is a fake! Prices crash.'),
  T(/winter|vendor|craft|thrift|flipper/i, 'Candles:🕯️:10,Mittens:🧤:28,Ornaments:🎄:65,Snow Globes:❄️:120,Music Boxes:🎶:230,Antiques:🏺:420', 'Stall space', 'Bigger stall', 'Doors open. Find the bargains and flip them!', 'is the hit of the season!', 'is out of fashion!'),
  T(/.*/, 'Grain:🌾:10,Wool:🧶:28,Spice:🌶️:65,Tea:🍵:120,Silk:🧵:230,Jewels:💎:420', 'Cargo', 'Bigger wagon', 'Markets open. Buy low, sell high!', 'shortage! Prices soar.', 'glut! Prices crash.'),
]
export const pickTrade = (s: string): TradeTheme => TRADES.find((t) => t.re.test(s)) ?? TRADES[TRADES.length - 1]

// ---------- shop ----------
export interface ShopTheme {
  re: RegExp
  menu: [string, string, number][]
  /** Who walks in ("patients"). */
  who: string
  /** Caption above the menu. */
  counter: string
  /** Verb past tense for the counter ("served"). */
  done: string
  /** Customer faces (defaults to the theme's cast). */
  faces?: string[]
}
const S = (re: RegExp, menu: string, who: string, done: string, counter: string, faces?: string): ShopTheme => ({ re, menu: trip(menu), who, done, counter, faces: faces ? faces.split(' ') : undefined })
export const SHOPS: ShopTheme[] = [
  S(/hospital|clinic|patient|doctor|nurse/i, 'Bandage:🩹:3,Pills:💊:4,Shot:💉:5,X-Ray:🩻:7,Fever Check:🌡️:3,Checkup:🩺:6', 'patients', 'treated', 'Pick the treatments, then tap the patient (the ER is open)', '🤒 🤕 😷 🤧 🥴 😵'),
  S(/airport|landing|runway|air traffic|control tower/i, 'Land:🛬:6,Take Off:🛫:6,Refuel:⛽:4,Baggage:🧳:3,Tow:🚜:3,Taxi:🛩️:2', 'flights', 'cleared', 'Give clearances, then tap the aircraft that asked', '✈️ 🛩️ 🚁 🛫 🪂 🛸'),
  S(/traffic|intersection|crossing/i, 'Green:🟢:3,Red:🔴:2,Walk:🚶:3,Bus Lane:🚌:4,Siren Way:🚨:5,Turn Arrow:↪️:3', 'vehicles', 'moved', 'Set the signals, then tap the waiting vehicle', '🚗 🚕 🚌 🚑 🚚 🏍️'),
  S(/heraldry|crest|coat of arms/i, 'Lion:🦁:5,Eagle:🦅:5,Crown:👑:6,Sword:⚔️:4,Shield:🛡️:3,Rose:🌹:3', 'nobles', 'pleased', 'Combine the charges for the noble\'s crest, then tap them', '🤴 👸 🧐 🎩 👑 🤵'),
  S(/dungeon landlord|rent rooms|monster hotel/i, 'Web Room:🕸️:5,Slime Bath:🫧:4,Raw Steak:🥩:6,Coffin Bed:⚰️:7,Candle:🕯️:2,Bone Snack:🦴:3', 'tenants', 'housed', 'Prepare what the monster tenant asked for, then tap them', '👹 🧟 🧛 👻 🧌 🐲'),
  S(/dungeon tour|tour guide|\btours?\b/i, 'Torch:🔦:2,Map:🗺️:3,Snack:🥨:2,Photo Spot:📸:4,Spooky Story:👻:5,Souvenir:🎁:6', 'tourists', 'toured', 'Give the tourists their tour kit, then tap the group', '🧑 👩 🧓 🧒 📸 🤠'),
  S(/monster hotel/i, 'Web Room:🕸️:5,Slime Bath:🫧:4,Raw Steak:🥩:6,Coffin Bed:⚰️:7,Candle:🕯️:2,Bone Snack:🦴:3', 'guests', 'hosted', 'Prepare what the monster asked for, then tap the guest', '👹 🧟 🧛 👻 🧌 🐲'),
  S(/haunted hotel|ghost hunter/i, 'Flashlight:🔦:3,EMF Meter:📟:4,Salt:🧂:2,Holy Water:💧:5,Camera:📷:4,Spirit Box:📻:6', 'ghosts', 'banished', 'Pick the hunting tools, then tap the haunting ghost', '👻 😈 💀 🧟 👹 🦇'),
  S(/hotel|motel|inn\b|lodging|boutique/i, 'Room Key:🔑:5,Clean Room:🧹:4,Breakfast:🥐:4,Fresh Towels:🛁:2,Luggage:🧳:3,Minibar:🍾:6', 'guests', 'checked in', 'Prepare the request, then tap the guest at the desk', '🧑‍💼 👵 🧔 💁 🕵️ 🤴'),
  S(/cinema|movie|film|popcorn/i, 'Ticket:🎟️:5,Popcorn:🍿:4,Soda:🥤:3,Candy:🍬:2,3D Glasses:🥽:2,Nachos:🌮:5', 'moviegoers', 'served', 'Prepare the snacks and tickets, then tap the guest', '🧑 👧 🧒 👩 🧓 🤓'),
  S(/laundromat|laundry|washing/i, 'Wash:🫧:3,Dry:🌬️:3,Fold:👕:2,Iron:♨️:4,Detergent:🧴:2,Coins:🪙:1', 'customers', 'cleaned', 'Run the machines the customer needs, then tap them', '🧑 👩 🧓 🧔 🧒 👨‍🍳'),
  S(/car wash|carwash/i, 'Soap:🧼:3,Rinse:🚿:2,Wax:✨:5,Dry:💨:2,Vacuum:🧹:4,Tire Shine:🛞:3', 'cars', 'washed', 'Choose the wash steps, then tap the car', '🚗 🚙 🚕 🛻 🚐 🏎️'),
  S(/groom|salon|cat lady|pet shop/i, 'Bath:🛁:4,Brush:🪮:3,Trim:✂️:5,Treat:🦴:1,Bow:🎀:2,Nails:💅:3', 'pets', 'groomed', 'Pick the grooming steps, then tap the pet', '🐶 🐱 🐰 🐹 🦜 🐩'),
  S(/tattoo/i, 'Stencil:📄:2,Ink:🖋️:4,Heart:💖:5,Skull:💀:6,Dragon:🐉:8,Rose:🌹:5', 'clients', 'inked', 'Mix the flash designs, then tap the client', '🧔 👩‍🎤 🧑‍🎤 😎 🤘 👱'),
  S(/mech hangar|hangar manager/i, 'Weld:🔥:5,Armor:🛡️:6,Ammo:💥:4,Reactor:⚡:8,Paint:🎨:2,Servo:⚙️:3', 'mechs', 'repaired', 'Do the repairs, then tap the mech in the bay', '🤖 🦾 🦿 🚀 🛸 🦖'),
  S(/bike|bicycle|garage|repair/i, 'Wrench:🔧:3,Tire:🛞:4,Chain:⛓️:3,Oil:🛢️:2,Bolt:🔩:2,Paint:🎨:4', 'riders', 'fixed', 'Diagnose and fix, then tap the customer', '🚲 🛵 🧑 👩 🧓 🧒'),
  S(/clockmaker|inventor|automaton|gadget|workshop.*parts|combine parts/i, 'Gear:⚙️:3,Spring:🌀:3,Lens:🔍:5,Valve:🔧:4,Crystal:🔮:8,Spyglass:🔭:6', 'commissions', 'built', 'Combine parts into the gadget, then tap the client', '🧐 🎩 👩‍🔬 🧙 🤵 👒'),
  S(/potion|alchem|apothec/i, 'Toadstool:🍄:3,Moonwater:💧:3,Frog:🐸:4,Herb:🌿:2,Star Dust:✨:6,Bat Wing:🦇:5', 'customers', 'brewed', 'Combine reagents to match the hint, then tap the customer', '🧙 🧝 🧛 🧟 🧚 🦸'),
  S(/book|manga|library/i, 'Novel:📕:5,Atlas:🗺️:6,Poetry:📜:4,Cookbook:📗:5,Mystery:🕵️:5,Bookmark:🔖:1', 'readers', 'sold', 'Pick the books the reader wants, then tap them', '👓 🧑 👵 🧒 🤓 🧔'),
  S(/comic/i, 'Superhero:🦸:5,Manga:📘:4,Figure:🧸:6,Trading Cards:🃏:3,Poster:🖼️:3,Variant Cover:🌟:8', 'collectors', 'sold', 'Pull the items on the list, then tap the collector', '🤓 🧑 🧒 👦 🕶️ 🧔'),
  S(/record store|vinyl/i, 'Jazz LP:🎷:5,Rock LP:🎸:5,Classical LP:🎻:6,Pop 45:💿:3,Poster:🖼️:2,Headphones:🎧:7', 'diggers', 'sold', 'Dig out the records, then tap the customer', '🧑‍🎤 🧔 👩‍🎤 🕶️ 🧓 🧑'),
  S(/flower|florist|bouquet/i, 'Rose:🌹:4,Tulip:🌷:3,Sunflower:🌻:3,Lily:🪷:5,Daisy:🌼:2,Ribbon:🎀:1', 'orders', 'delivered', 'Arrange the bouquet, then tap the order', '👵 🧑 👩 🤵 🧒 💁'),
  S(/bubble tea|boba/i, 'Milk Tea:🧋:5,Tapioca Pearls:⚫:2,Fruit Tea:🍹:4,Pudding:🍮:3,Ice:🧊:1,Taro:🍠:4', 'customers', 'served', 'Mix the drink, then tap the customer', '🧑 👧 🧒 👩 😋 🧑‍🎓'),
  S(/ramen|noodle/i, 'Ramen:🍜:6,Egg:🥚:2,Pork Slice:🍖:4,Broth:🍲:3,Fish Cake:🍥:2,Green Tea:🍵:2', 'diners', 'served', 'Build the bowl, then tap the hungry diner', '🧑‍🍳 🧔 👩 🧑 🧓 👨‍💼'),
  S(/dumpling|bao/i, 'Dumpling:🥟:5,Rice:🍚:2,Soy Dip:🥢:1,Soup:🥣:4,Chili Oil:🌶️:2,Tea:🍵:2', 'diners', 'served', 'Fold the dumplings to order, then tap the diner'),
  S(/pasta|spaghetti/i, 'Spaghetti:🍝:5,Ravioli:🥟:6,Tomato:🍅:2,Cheese:🧀:2,Basil:🌿:1,Garlic Bread:🥖:3', 'diners', 'served', 'Shape and sauce the pasta, then tap the diner'),
  S(/barbecue|pitmaster|bbq/i, 'Ribs:🍖:7,Brisket:🥩:8,Sausage:🌭:4,Corn:🌽:2,Bread:🍞:1,Sauce:🥫:1', 'guests', 'fed', 'Smoke the meats, then tap the hungry guest'),
  S(/bento|lunchbox/i, 'Rice Ball:🍙:3,Fish:🐟:4,Egg:🍳:2,Pickles:🥒:1,Fruit:🍎:2,Tempura:🍤:5', 'lunch orders', 'packed', 'Pack the lunchbox, then tap the order'),
  S(/chili|cook-off|cook off/i, 'Chili:🌶️:5,Beans:🫘:2,Cheese:🧀:2,Corn Bread:🍞:2,Sour Cream:🥛:1,Jalapeno:🫑:3', 'judges', 'wowed', 'Balance the bowl, then tap the judge', '🧑‍⚖️ 👩‍⚖️ 🧔 👨‍🍳 🤠 👵'),
  S(/tofu|soy/i, 'Soy Milk:🥛:3,Tofu Block:⬜:4,Fried Tofu:🟨:4,Miso:🥣:3,Edamame:🫛:2,Tea:🍵:1'.replace('⬜', '🧈'), 'buyers', 'sold', 'Press and pack the order, then tap the buyer'),
  S(/cheese|goat/i, 'Goat Milk:🥛:3,Fresh Chèvre:🧀:4,Aged Cheddar:🧀:6,Butter:🧈:3,Bread:🥖:2,Honey:🍯:3', 'buyers', 'sold', 'Craft the cheeses, then tap the buyer'),
  S(/tea house|tea room|teahouse/i, 'Green Tea:🍵:3,Chai:☕:4,Mochi:🍡:3,Biscuit:🍪:2,Honey:🍯:1,Iced Tea:🧊:3', 'visitors', 'served', 'Brew the tea, then tap the visitor'),
  S(/lemonade|stand/i, 'Lemonade:🍋:3,Ice:🧊:1,Sugar:🍬:1,Cookie:🍪:2,Orange Juice:🍊:3,Cup Holder:🥤:1', 'thirsty folk', 'served', 'Mix the order, then tap the customer'),
  S(/arcade owner|arcade cabinet|token/i, 'Token:🪙:1,Joystick:🕹️:4,Ticket Roll:🎟️:3,Prize:🧸:6,Snack:🍿:3,Soda:🥤:2', 'players', 'served', 'Hand over tokens and snacks, then tap the player', '👦 👧 🧑‍🎤 🧒 🤓 🕶️'),
  S(/vending/i, 'Soda:🥤:2,Chips:🥔:2,Candy Bar:🍫:2,Water:💧:1,Coffee:☕:3,Gum:🫧:1', 'buyers', 'sold', 'Restock what they want, then tap the buyer'),
  S(/hardware|contractor|tool/i, 'Hammer:🔨:5,Nails:📌:1,Saw:🪚:6,Paint:🎨:4,Wrench:🔧:4,Light Bulb:💡:2', 'contractors', 'sold', 'Stock the tools they asked for, then tap the contractor', '👷 🧑‍🔧 🧔 👩‍🔧 🤠 🧑'),
  S(/bowling/i, 'Lane:🎳:5,Shoes:👟:2,Pizza:🍕:4,Beer:🍺:3,Nachos:🌮:3,Trophy:🏆:8', 'bowlers', 'served', 'Book lanes and snacks, then tap the party', '🧑 👨 👩 🧓 🧒 🤠'),
  S(/postal|parcel|mail sort/i, 'Letter:✉️:1,Parcel:📦:3,Express:🚀:5,Fragile:🍷:4,Heavy:⚖️:4,Overseas:🌍:6', 'parcels', 'sorted', 'Label the route, then tap the parcel on the belt', '📦 ✉️ 🎁 📫 📮 🧳'),
  S(/warehouse|picker|picking/i, 'Box:📦:2,Pallet:🪵:3,Barrel:🛢️:3,Crate:🧰:4,Forklift:🏗️:5,Tape:🩹:1', 'pick orders', 'picked', 'Pick the items on the list, then tap the order', '📋 🧑‍🏭 👷 🧑‍💼 🧔 📦'),
  S(/tugboat|tug/i, 'Tow:🚢:5,Dock:⚓:3,Pilot:🧭:4,Fuel:⛽:3,Cargo:📦:4,Customs:🛃:3', 'ships', 'docked', 'Guide the ship through the steps, then tap it', '🚢 🛳️ ⛴️ 🚤 ⛵ 🛶'),
  S(/lock keeper|canal lock/i, 'Raise:⬆️:3,Lower:⬇️:3,Fill:💧:3,Drain:🕳️:3,Signal:🚦:2,Gate:🚪:2', 'barges', 'passed', 'Run the lock cycle, then tap the waiting barge', '🛶 ⛵ 🚤 🚢 🛥️ ⛴️'),
  S(/haunted halls|ghost.*intruder|scare intruders/i, 'Boo:👻:4,Chains:⛓️:3,Cold Spot:🥶:3,Wail:😱:4,Flicker:🕯️:2,Door Slam:🚪:3', 'intruders', 'scared off', 'Pick the scares, then tap the intruder', '🕵️ 🧑‍🚒 🤠 🧑‍🔬 🧔 💂'),
  S(/mimic shop|mimic/i, 'Fake Gold:🪙:3,Gem:💎:6,Potion:🧪:4,Sword:⚔️:5,Chest Lid:🧰:2,Teeth:🦷:3', 'adventurers', 'tricked', 'Disguise the loot they want, then tap the adventurer', '🧙 🥷 🧝 🧑‍🚀 🤺 🏹'),
  S(/cooking chaos|kitchen rush|co-op kitchen|chunky|pixel chef|overcooked/i, 'Burger:🍔:5,Fries:🍟:3,Pizza:🍕:6,Soda:🥤:2,Salad:🥗:4,Soup:🍲:4', 'orders', 'served', 'Prep the dishes, then tap the ticket (Enter = serve)'),
  S(/cat cafe|cat café/i, 'Espresso:☕:3,Latte:🥛:4,Cat Treat:🐟:2,Croissant:🥐:4,Cake:🍰:6,Cookie:🍪:2', 'guests', 'served', 'Serve the coffee, then tap the guest (cats nap on laps)', '🐱 😺 😸 🐈 🧑 👩'),
  S(/visual novel|dating/i, 'Espresso:☕:3,Latte:🥛:4,Cake:🍰:6,Compliment:💬:2,Flowers:🌹:5,Love Note:💌:4', 'regulars', 'charmed', 'Pick coffee and charm, then tap the regular', '🧑‍🎤 👩‍🎤 🥰 😳 😎 🧑‍🏫'),
  S(/coffee|cafe|café|barista|tea|cat/i, 'Espresso:☕:3,Latte:🥛:4,Tea:🍵:3,Croissant:🥐:4,Cake:🍰:6,Cookie:🍪:2', 'customers', 'served', 'Prepare the order, then tap the customer'),
  S(/ice|parlor|candy|cookie/i, 'Vanilla:🍦:3,Sundae:🍨:6,Popsicle:🍧:3,Donut:🍩:4,Cone:🍡:3,Shake:🥤:5', 'customers', 'served', 'Scoop the order, then tap the customer'),
  S(/sushi|japan|ninja/i, 'Sushi:🍣:6,Onigiri:🍙:3,Ramen:🍜:6,Tempura:🍤:5,Tea:🍵:2,Dango:🍡:3', 'diners', 'served', 'Prepare the order, then tap the diner'),
  S(/tavern|grog|galley|pirate|goblin|vampire|dragon|crew/i, 'Ale:🍺:3,Stew:🍲:5,Roast:🍖:7,Bread:🍞:2,Wine:🍷:5,Pie:🥧:4', 'patrons', 'served', 'Serve the table, then tap the patron'),
  S(/bak|bread|dough/i, 'Baguette:🥖:3,Croissant:🥐:4,Cake:🎂:8,Pretzel:🥨:3,Pie:🥧:5,Bagel:🥯:3', 'customers', 'served', 'Bake the order, then tap the customer'),
  S(/pizza|truck|food|burger|diner|restaurant|kitchen|chef|cook(?!ie)|store|shop|bar /i, 'Pizza:🍕:6,Taco:🌮:4,Burger:🍔:5,Fries:🍟:3,Hot Dog:🌭:3,Soda:🥤:2', 'customers', 'served', 'Prepare the order, then tap the customer'),
]
export const pickShopTheme = (s: string): ShopTheme | undefined => SHOPS.find((t) => t.re.test(s))
export const pickShop = (s: string): ShopTheme => pickShopTheme(s) ?? SHOPS[SHOPS.length - 1]

export const pickTable = <T>(t: { re: RegExp; list: T }[], s: string): T => (t.find((x) => x.re.test(s)) ?? t[t.length - 1]).list
