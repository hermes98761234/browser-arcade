import { N } from '../i18n'
import { ENGINES, type Control, type EngineId } from './engines'
import { THEME_IDS, type ThemeId } from './themes'

export type Genre =
  | 'arcade' | 'puzzle' | 'action' | 'platformer' | 'shooter' | 'racing' | 'strategy' | 'simulation'
  | 'rpg' | 'cards' | 'sports' | 'education' | 'casual' | 'story' | 'creative' | 'party'

export const GENRES: Record<Genre, string> = {
  arcade: N('Arcade'), puzzle: N('Puzzle'), action: N('Action'), platformer: N('Platformer'), shooter: N('Shooter'),
  racing: N('Racing'), strategy: N('Strategy'), simulation: N('Simulation'), rpg: N('RPG & Adventure'), cards: N('Cards & Board'),
  sports: N('Sports'), education: N('Educational'), casual: N('Casual'), story: N('Story'), creative: N('Creative & Music'), party: N('Party'),
}

export type Difficulty = 'easy' | 'normal' | 'hard'
export const DIFFICULTIES: Record<Difficulty, string> = { easy: N('Easy'), normal: N('Normal'), hard: N('Hard') }

/** Raw entry from src/data/raw.json: [id, name, dim, description, build notes, section]. */
export type RawGame = [number, string, number, string, string, number]
export interface RawSection { id: number; name: string; tech: string }

export interface Game {
  id: number
  slug: string
  name: string
  dim: 2 | 3
  desc: string
  build: string
  section: number
  engine: EngineId
  theme: ThemeId
  genre: Genre
  year: number
  difficulty: Difficulty
  players: 1 | 2
  controls: Control[]
  /** Variant flags the engine reads (e.g. 'gravity', 'boss', 'versus'). */
  mods: string[]
  /** Hand-written plot (the game has a full story). */
  story: boolean
  seed: number
}

/** Games with a hand-written, multi-ending story. */
export const STORY_IDS = new Set([451, 452, 454, 455, 456, 458, 465, 467, 471, 472])

// Per section: genre, fallback engine, fallback theme, strong (= section genre beats keywords in the description).
type Sec = [Genre, EngineId, ThemeId | null, boolean]
const S: Record<number, Sec> = {
  1: ['arcade', 'dodge', 'neon', false], 2: ['puzzle', 'logic', 'zen', false], 3: ['platformer', 'platformer', 'nature', true],
  4: ['shooter', 'shmup', 'space', false], 5: ['racing', 'racer', 'neon', false], 6: ['strategy', 'towerdef', 'fantasy', false],
  7: ['simulation', 'idle', 'cozy', true], 8: ['cards', 'cards', 'zen', false], 9: ['education', 'words', 'school', false],
  10: ['puzzle', 'launcher', 'nature', false], 11: ['party', 'rhythm', 'neon', false], 12: ['rpg', 'roguelike', 'fantasy', true],
  13: ['simulation', 'idle', 'cozy', false], 14: ['sports', 'pong', 'sports', false], 15: ['action', 'flight3d', 'space', false],
  16: ['education', 'quiz', 'school', false], 17: ['casual', 'reflex', 'candy', false], 18: ['party', 'pong', 'neon', false],
  19: ['story', 'journey', 'fantasy', false], 20: ['creative', 'paint', 'neon', false],
  21: ['action', 'shmup', 'space', false], 22: ['casual', 'dodge', 'ocean', false], 23: ['rpg', 'roguelike', 'fantasy', false],
  24: ['action', 'journey', 'pirate', false], 25: ['action', 'reflex', 'western', false], 26: ['action', 'arena', 'cyberpunk', false],
  27: ['action', 'journey', 'wasteland', false], 28: ['action', 'raycast', 'horror', false], 29: ['action', 'launcher', 'myth', false],
  30: ['action', 'runner', 'ninja', false], 31: ['action', 'runner', 'dino', false], 32: ['action', 'fighter', 'robot', false],
  33: ['platformer', 'platformer', 'jungle', false], 34: ['casual', 'dodge', 'arctic', false], 35: ['simulation', 'idle', 'steampunk', false],
  36: ['action', 'arena', 'hero', false], 37: ['casual', 'dodge', 'halloween', false], 38: ['casual', 'dodge', 'holiday', false],
  39: ['puzzle', 'match3', 'candy', false], 40: ['casual', 'dodge', 'insects', false],
  41: ['puzzle', 'match3', 'gems', true], 42: ['puzzle', 'slide', 'zen', true], 43: ['puzzle', 'merge', 'zen', false],
  44: ['puzzle', 'logic', 'zen', true], 45: ['puzzle', 'blocks', 'neon', true], 46: ['puzzle', 'maze', 'zen', true],
  47: ['puzzle', 'lights', 'neon', false], 48: ['puzzle', 'launcher', 'nature', false], 49: ['puzzle', 'memory', 'cozy', true],
  50: ['education', 'memory', 'zen', true], 51: ['puzzle', 'escape', 'horror', true], 52: ['puzzle', 'sort', 'candy', true],
  53: ['puzzle', 'chain', 'neon', true], 54: ['puzzle', 'words', 'school', true], 55: ['education', 'code', 'robot', true],
  56: ['puzzle', 'lights', 'candy', true], 57: ['puzzle', 'lights', 'zen', false], 58: ['puzzle', 'maze', 'zen', false],
  59: ['casual', 'stack', 'neon', true], 60: ['puzzle', 'words', 'zen', false],
  61: ['action', 'runner', 'neon', true], 62: ['action', 'arena', 'ninja', false], 63: ['action', 'fighter', 'neon', true],
  64: ['action', 'roguelike', 'horror', false], 65: ['rpg', 'roguelike', 'wasteland', false], 66: ['platformer', 'platformer', 'fantasy', true],
  67: ['action', 'shmup', 'space', false], 68: ['shooter', 'shmup', 'space', true], 69: ['rpg', 'arena', 'fantasy', false],
  70: ['action', 'arena', 'fantasy', true], 71: ['shooter', 'arena', 'neon', true], 72: ['casual', 'flappy', 'nature', false],
  73: ['casual', 'flappy', 'ocean', false], 74: ['platformer', 'platformer', 'nature', true], 75: ['action', 'arena', 'wasteland', false],
  76: ['rpg', 'arena', 'fantasy', false], 77: ['action', 'dodge', 'neon', true], 78: ['casual', 'reflex', 'zen', true],
  79: ['platformer', 'platformer', 'jungle', false], 80: ['action', 'arena', 'neon', true],
  81: ['strategy', 'tactics', 'fantasy', true], 82: ['simulation', 'idle', 'nature', false], 83: ['simulation', 'journey', 'pirate', false],
  84: ['simulation', 'idle', 'cozy', true], 85: ['simulation', 'idle', 'nature', false], 86: ['rpg', 'tactics', 'jungle', false],
  87: ['rpg', 'roguelike', 'fantasy', false], 88: ['cards', 'cards', 'fantasy', true], 89: ['strategy', 'tactics', 'fantasy', true],
  90: ['strategy', 'conquest', 'myth', true], 91: ['strategy', 'towerdef', 'fantasy', true], 92: ['simulation', 'reigns', 'myth', true],
  93: ['simulation', 'reigns', 'cozy', false], 94: ['simulation', 'idle', 'robot', false], 95: ['sports', 'idle', 'sports', false],
  96: ['simulation', 'merge', 'fantasy', false], 97: ['strategy', 'towerdef', 'horror', false], 98: ['simulation', 'journey', 'space', false],
  99: ['strategy', 'conquest', 'zen', true], 100: ['cards', 'cards', 'fantasy', true],
  101: ['cards', 'board', 'zen', true], 102: ['party', 'reflex', 'neon', false], 103: ['education', 'quiz', 'school', true],
  104: ['education', 'memory', 'candy', false], 105: ['education', 'quiz', 'school', true], 106: ['education', 'quiz', 'school', false],
  107: ['education', 'code', 'robot', true], 108: ['creative', 'paint', 'cozy', true], 109: ['creative', 'synth', 'neon', true],
  110: ['casual', 'idle', 'cozy', false], 111: ['party', 'dodge', 'neon', false], 112: ['casual', 'reflex', 'candy', false],
  113: ['casual', 'flappy', 'zen', false], 114: ['arcade', 'platformer', 'retro', false], 115: ['story', 'roguelike', 'retro', false],
  116: ['creative', 'paint', 'neon', false], 117: ['puzzle', 'words', 'zen', false], 118: ['party', 'maze', 'neon', false],
  119: ['party', 'maze', 'zen', false], 120: ['casual', 'reflex', 'neon', false],
}

const ENGINE_GENRE: Record<EngineId, Genre> = {
  snake: 'arcade', breakout: 'arcade', shmup: 'shooter', runner: 'action', platformer: 'platformer', arena: 'action',
  dodge: 'arcade', flappy: 'casual', match3: 'puzzle', slide: 'puzzle', memory: 'puzzle', logic: 'puzzle', merge: 'puzzle',
  maze: 'puzzle', lights: 'puzzle', sokoban: 'puzzle', blocks: 'puzzle', stack: 'casual', towerdef: 'strategy', idle: 'simulation',
  typing: 'education', words: 'puzzle', rhythm: 'party', racer: 'racing', cards: 'cards', board: 'cards', quiz: 'education',
  roguelike: 'rpg', pong: 'sports', story: 'story', reigns: 'simulation', journey: 'rpg', paint: 'creative', synth: 'creative',
  flight3d: 'action', raycast: 'action', launcher: 'puzzle', reflex: 'casual', fighter: 'action', conquest: 'strategy',
  chain: 'puzzle', golf: 'sports', escape: 'puzzle', sort: 'puzzle', code: 'education', tactics: 'strategy',
}

// Keyword → engine, most specific first. Tested against the name, then the description, then the build notes.
const RULES: [EngineId, RegExp][] = [
  ['reigns', /swipe-left|reigns|faction meters|approval|election|parliament|president|policy|govern/],
  ['towerdef', /tower defen[cs]e|\btd\b|turrets?\b|defend the (path|base|gate|castle)|lanes? defen/],
  ['escape', /escape room|escape the|locked room|point ?& ?click escape/],
  ['code', /program(ming)?|coding|\bcode blocks?|blockly|algorithm|robot commands|logo turtle/],
  ['sort', /ball sort|water sort|sort(ing)? (balls|colors|colours|tubes|liquids)|tubes?\b/],
  ['typing', /typing|type (the |falling )?words|keyboard practice|touch typ/],
  ['snake', /\bsnakes?\b(?! and ladders)|serpent|\bworm|light ?cycle|\btron\b|slither/],
  ['breakout', /breakout|bricks?\b|arkanoid|brick-breaker|paddle and ball/],
  ['pong', /\bpong|air hockey|tennis|ping.?pong|volleyball|badminton|hockey|squash|paddles?\b/],
  ['golf', /golf|putt|billiards?|\bpool\b|snooker|curling|bowling|marbles?|croquet|shuffleboard/],
  ['fighter', /fighter|fighting|boxing|karate|wrestl|\bduel|sumo|kung.?fu|street fight|1v1|punch/],
  ['flight3d', /flight sim|flying through rings|\brings?\b.*fly|dogfight|3d fly|tunnel/],
  ['racer', /\brac(e|er|ing)\b|kart|driv(e|ing)|drift|rally|highway|motorbike|\bcar\b|cars\b|grand prix|lap/],
  ['match3', /match-?3|match three|bejeweled|swap (gems|tiles|candies)|candy crush|three in a row|tile match/],
  ['blocks', /tetris|tetromino|falling blocks|polyomino|pentomino|packing|block puzzle|line clear/],
  ['merge', /\b2048\b|merge|threes|combine (tiles|numbers)|alchemy|craft(ing)? recipes?/],
  ['chain', /chain reaction|chain explosion|domino|boomshine|explosions? spread/],
  ['stack', /stack(ing)?|balanc|jenga|tower of blocks|tallest tower|pile up/],
  ['launcher', /angry|wrecking ball|launch|catapult|cannon|slingshot|artillery|throw|projectile|trebuchet|siege|hoop|basketball/],
  ['shmup', /centipede|shmup|shoot.?em.?up|space invaders|invaders|galaga|bullet hell|danmaku|scrolling shooter|vertical shooter|boss rush/],
  ['arena', /asteroids?|twin-stick|top-down shoot|arena|\.io\b|waves of|zombies?|horde|tanks?\b|survive (the )?(waves|night)|brawler|hack.?and.?slash|beat.?em.?up/],
  ['runner', /runner|endless run|auto-?run|subway|jump over|dash(ing)? through|running/],
  ['flappy', /lunar lander|\blander\b|thrust(er)?s? to|flappy|one-?button|tap to (fly|flap|swim)|helicopter|glid(e|ing|er)|kite|balloon fl/],
  ['platformer', /platform|metroid|climb|parkour|jump(ing)? (between|across|on)|wall.?jump|grappl|swing/],
  ['rhythm', /rhythm|beat|dance|drum|guitar hero|notes? (fall|scroll)|tempo|\bdj\b/],
  ['synth', /music toy|sequencer|synth|piano|instrument|compose|melody|theremin|xylophone/],
  ['paint', /draw(ing)?|paint|doodle|colou?ring|pixel art|sand ?box|falling sand|kaleidoscope|spirograph|generative art|fractal|mandala/],
  ['cards', /cards?\b|solitaire|poker|blackjack|deck|rummy|\buno\b|tarot|klondike|spider sol|freecell|baccarat/],
  ['board', /^go\b|\bgo on|chess|checkers|draughts|reversi|othello|\bgo\b board|gomoku|connect (four|4)|tic.?tac|mancala|backgammon|ludo|\bnim\b|dots and boxes|nine men|morris|hex board|board game/],
  ['quiz', /quiz|trivia|arithmetic|times tables?|flashcards?|geograph|capitals?|flags?\b|vocabulary|periodic|translate|guess the (country|word meaning)/],
  ['words', /\bwords?\b|anagram|hangman|spell|letters?|crossword|boggle|wordle|cipher|caesar|vigen|morse|cryptogram|riddle/],
  ['logic', /minesweeper|\bmines?\b|nonogram|picross|sudoku|kakuro|nikoli|logic grid|hitori|kenken|akari|light up|slitherlink|binairo|futoshiki/],
  ['lights', /lights out|toggle|flip(ping)? (tiles|cells)|flood|laser|mirrors?|reflect|optic|prism|beam|symmetr/],
  ['slide', /slid(e|ing) (tile|puzzle)|15 puzzle|rotate tiles|rotating (tiles|rings)|jigsaw|pipes?|rotate (pieces|the)/],
  ['memory', /memory|pairs|concentration|simon|recall|remember|hidden object|spot the difference|find (the|all) hidden|i spy/],
  ['sokoban', /sokoban|push(ing)? (boxes|crates|blocks)|crates?\b/],
  ['maze', /maze|labyrinth|path ?find|draw (a )?(line|path)|connect (the )?dots|route|tilt|marble maze|one-line/],
  ['conquest', /\brts\b|real-time strategy|conquer|territor|planets?.*send|galcon|empire|4x|grand strategy|war ?game|hex(es)? map|invasion|colonize/],
  ['tactics', /tactic|squad|turn-based (combat|battle|strategy)|auto-?battl|chess-like units|grid battle|creature battle|monster battle/],
  ['roguelike', /rogue|dungeon|crawler|\brpg\b|loot|quest|jrpg|stealth|guards?\b|survival craft|crafting survival|permadeath/],
  ['journey', /oregon|caravan|trail|voyage|expedition|day-by-day|travel|trade route|merchant|sailing|survive the journey/],
  ['idle', /idle|clicker|incremental|tycoon|business|farm|manage|\bshops?\b|cook|restaurant|colony|city builder|builder\b|econom|trade|\bsim\b|simulat|garden|bakery|cafe|hotel|zoo|factory/],
  ['dodge', /dodge|avoid|evade|catch|collect(ing)? falling|basket|rain of/],
  ['reflex', /reflex|timing|reaction|whack|stop the|tap when|quick.?draw|precision|click (fast|the)|pop (the )?balloons|aim trainer/],
]

// Themes detected in the name/description of games outside the 20 themed sections.
const THEME_RULES: [ThemeId, RegExp][] = [
  ['halloween', /halloween|pumpkin|witch|trick.or.treat/], ['holiday', /christmas|santa|holiday|xmas|gift|elf\b|reindeer|snowman/],
  ['space', /space|alien|galax|planet|rocket|astro|star ?ship|asteroid|orbit|lunar|moon|mars|ufo|cosmic|satellite/],
  ['ocean', /ocean|underwater|\bfish|\bsea\b|shark|submarine|coral|diver|whale|octopus|mermaid|aquarium/],
  ['pirate', /pirate|treasure|galleon|buccaneer|cannonball/], ['western', /cowboy|western|sheriff|saloon|outlaw|gunslinger|desert/],
  ['cyberpunk', /cyber|hack(er|ing)|neon city|synthwave|android|netrunner|glitch/], ['wasteland', /zombie|apocalyp|wasteland|mutant|nuclear|survivor|bunker/],
  ['horror', /ghost|haunt|horror|spooky|creepy|nightmare|vampire|crypt|graveyard|undead/], ['myth', /myth|greek|norse|olymp|egypt|pharaoh|god(s|dess)?\b|titan|viking|roman/],
  ['ninja', /ninja|samurai|kung|shogun|dojo|katana|japan/], ['dino', /dino|prehistoric|cave ?man|stone age|fossil|jurassic|mammoth/],
  ['robot', /robot|mech\b|mechs|android|drone|cyborg|bot\b|factory/], ['jungle', /jungle|safari|monkey|tiger|lion|rainforest|temple run|aztec|savanna/],
  ['arctic', /snow|\bice\b|icy|arctic|penguin|winter|frozen|ski|glacier|polar|sled/], ['steampunk', /steam|clockwork|\bgears?\b|airship|victorian|brass/],
  ['hero', /superhero|hero\b|villain|caped|powers?\b/], ['candy', /candy|sweet|cake|food|cook|pizza|burger|donut|chef|bakery|fruit|kitchen|sushi/],
  ['insects', /\bbugs?\b|insect|\bants?\b|\bbees?\b|spider|beetle|butterfl|firefl/], ['fantasy', /dragon|wizard|knight|castle|magic|spell|kingdom|elf|dwarf|sword|medieval|potion/],
  ['sports', /football|soccer|basket|baseball|sport|athlet|olympic|stadium|goal\b|golf|tennis|hockey/], ['school', /math|school|learn|educat|quiz|science|chem|physics|class/],
  ['cozy', /cozy|relax|tea\b|\bcats?\b|kitten|calm|knit|plant|flower|garden/], ['gems', /gem|jewel|crystal|diamond|ruby|treasure/],
  ['nature', /forest|animal|nature|tree|bird|fox|meadow|river|mountain|farm/], ['retro', /retro|8-bit|pixel|game ?boy|\bnes\b|arcade cabinet|crt|chiptune/],
  ['zen', /zen|minimal|monochrome|abstract|geometr/], ['neon', /neon|glow|laser|light ?cycle|synth/],
]

// Variant flags engines can read.
const MOD_RULES: [string, RegExp][] = [
  ['gravity', /gravity|planet pull|orbit/], ['wrap', /wrap|toroid|edges loop/], ['timer', /timer|countdown|time limit|against the clock|seconds/],
  ['portal', /portal|teleport|wormhole/], ['boss', /boss/], ['ice', /\bice\b|icy|slippery|frozen/], ['dark', /dark|night|shadow|torch|flashlight|fog/],
  ['mirror', /mirror|reflect/], ['wind', /wind|storm|gust/], ['versus', /2p\b|two.player|versus|\bvs\b|pvp|1v1|co-?op|multiplayer|hot-?seat|local/],
  ['endless', /endless|infinite|forever/], ['shield', /shield/], ['bomb', /bomb|explos|dynamite|tnt/], ['combo', /combo|chain/],
  ['rotate', /rotat|spin|twist/], ['hex', /\bhex/], ['lander', /lander|thrust/], ['tiny', /tiny|micro|mini\b/], ['giant', /giant|huge|colossal|titan/],
  ['fast', /fast|speed|rush|turbo|frenzy|hyper/], ['zen', /zen|relax|calm|cozy|chill|no fail/], ['hard', /hardcore|brutal|hard\b|nightmare|insane/],
  ['hell', /bullet hell|danmaku|curtain/], ['melee', /melee|sword|punch|brawl|slash|beat.?em/], ['io', /\.io\b|agar|grow by eating/],
  ['tank', /\btanks?\b/], ['swim', /swim|dive|diving|underwater/], ['climb', /climb|wall.?jump|vertical/], ['grapple', /grappl|rope|swing|hook/],
  ['stealth', /stealth|sneak|guard|vision cone/], ['farm', /farm|crop|harvest|garden|plant/], ['trade', /trade|merchant|market|buy low/],
  ['deck', /deck.?build/], ['battle', /battler|card battle|\bbattle\b/], ['auto', /auto-?battl|autochess|auto chess/],
  ['lang', /language|vocabulary|spanish|french|german|japanese|ukrainian|translate/], ['science', /science|chemistry|physics|biology|periodic|planet|anatomy/],
  ['math', /math|arithmetic|number|times table|fraction|equation|count/], ['geo', /geograph|capital|country|countries|flag|map quiz|continent/],
  ['cipher', /cipher|caesar|vigen|morse|code ?break|crypt/], ['spot', /spot the difference|hidden object|find the hidden|i spy|where'?s/],
  ['daily', /daily|seed of the day/], ['laser', /laser|beam|optic|prism/], ['color', /colou?r/], ['tilt', /tilt|gyro|accelerometer|lean/],
  ['chess', /chess/], ['checkers', /checkers|draughts/], ['reversi', /reversi|othello/], ['connect', /connect (four|4)|four in a row/],
  ['ttt', /tic.?tac|noughts/], ['mancala', /mancala|oware|kalah/], ['gomoku', /gomoku|five in a row|renju/], ['dots', /dots and boxes/],
  ['nim', /\bnim\b|matchsticks?/], ['solitaire', /solitaire|klondike|freecell|patience/], ['blackjack', /blackjack|twenty-?one/],
  ['poker', /poker/], ['war', /\bwar\b/], ['sudoku', /sudoku/], ['nonogram', /nonogram|picross|griddler/], ['mines', /mine/],
  ['wordle', /wordle|guess the (five|5)|word guess/], ['anagram', /anagram|scrambl/], ['hangman', /hangman/], ['crossword', /crossword/],
  ['flood', /flood/], ['pipe', /pipe/], ['jigsaw', /jigsaw/], ['key', /\bkeys?\b|locks?|doors?/],
]

function hash(n: number): number {
  let x = (n ^ 0x9e3779b9) >>> 0
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0
  return (x ^ (x >>> 16)) >>> 0
}

const match = <K>(rules: [K, RegExp][], s: string): K | undefined => rules.find(([, re]) => re.test(s))?.[0]

export function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-')
}

export function classify(raw: RawGame): Game {
  const [id, name, dim, desc, build, section] = raw
  const [secGenre, secEngine, secTheme, strong] = S[section] ?? ['arcade', 'dodge', null, false]
  const n = name.toLowerCase()
  const d = desc.toLowerCase()
  const b = build.toLowerCase()
  const all = `${n} ${d} ${b}`
  const story = STORY_IDS.has(id)

  let engine: EngineId
  if (story) engine = 'story'
  else {
    const byName = match(RULES, n)
    const byDesc = match(RULES, d)
    engine = strong ? secEngine : byName ?? byDesc ?? match(RULES, b) ?? secEngine
    // 3D entries prefer a real 3D engine for movement-heavy genres.
    if (dim === 3 && (engine === 'maze' || engine === 'roguelike')) engine = 'raycast'
    if (dim === 3 && (engine === 'flappy' || engine === 'runner') && /fly|plane|tunnel|space|ship|glid/.test(all)) engine = 'flight3d'
  }

  const themed = section >= 21 && section <= 40
  const theme: ThemeId = themed && secTheme ? secTheme : match(THEME_RULES, `${n} ${d}`) ?? secTheme ?? THEME_IDS[hash(id) % THEME_IDS.length]
  const genre: Genre = story ? 'story' : themed || !strong ? ENGINE_GENRE[engine] ?? secGenre : secGenre
  const mods = MOD_RULES.filter(([, re]) => re.test(`${n} ${d}`)).map(([m]) => m)
  const h = hash(id)
  const difficulty: Difficulty = mods.includes('hard') ? 'hard' : mods.includes('zen') ? 'easy' : (['easy', 'normal', 'normal', 'hard'] as const)[h % 4]
  const meta = ENGINES[engine]
  const players: 1 | 2 = meta.players === 2 || (mods.includes('versus') && ['pong', 'fighter', 'board', 'snake', 'racer', 'tactics'].includes(engine)) ? 2 : 1
  return {
    id, slug: `${id}-${slugify(name)}`, name, dim: dim === 3 ? 3 : 2, desc, build, section, engine, theme, genre,
    year: meta.year, difficulty, players, controls: meta.controls, mods, story, seed: h,
  }
}

export function buildCatalog(games: RawGame[]): Game[] {
  return games.map(classify)
}

// ---- Filtering ----

export type Era = 'classic' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s'
export const ERAS: Record<Era, string> = {
  classic: N('Timeless classics (before 1970)'), '1970s': N('1970s'), '1980s': N('1980s'), '1990s': N('1990s'), '2000s': N('2000s'), '2010s': N('2010s and later'),
}
export function eraOf(year: number): Era {
  if (year < 1970) return 'classic'
  if (year >= 2010) return '2010s'
  return `${Math.floor(year / 10) * 10}s` as Era
}

export type Sort = 'featured' | 'az' | 'za' | 'oldest' | 'newest' | 'number'

export interface Filters {
  q: string
  genre: Genre | ''
  theme: ThemeId | ''
  engine: EngineId | ''
  era: Era | ''
  dim: '' | '2' | '3'
  players: '' | '1' | '2'
  control: Control | ''
  difficulty: Difficulty | ''
  section: number
  story: boolean
  fav: boolean
  recent: boolean
  sort: Sort
  page: number
}

export const DEFAULT_FILTERS: Filters = {
  q: '', genre: '', theme: '', engine: '', era: '', dim: '', players: '', control: '', difficulty: '', section: 0, story: false, fav: false, recent: false, sort: 'featured', page: 1,
}

export const PAGE_SIZE = 50

/** Featured order: one game per engine in turn (stories lead), so every page is varied. */
export function featuredOrder(games: Game[]): Game[] {
  const groups = new Map<EngineId, Game[]>()
  for (const g of [...games].sort((a, b) => a.seed - b.seed)) {
    const l = groups.get(g.engine) ?? []
    l.push(g)
    groups.set(g.engine, l)
  }
  const out: Game[] = []
  const lists = [...groups.values()].sort((a, b) => Number(b[0].story) - Number(a[0].story))
  for (let i = 0; out.length < games.length; i++) for (const l of lists) if (i < l.length) out.push(l[i])
  return out
}

export function filterGames(games: Game[], f: Filters, featured: Game[] = games, mine: { fav: number[]; recent: number[] } = { fav: [], recent: [] }): Game[] {
  const words = f.q.toLowerCase().split(/\s+/).filter(Boolean)
  let src = f.sort === 'featured' ? featured : games
  // Personal lists keep their own order (most recent first).
  if (f.fav || f.recent) {
    const byId = new Map(games.map((g) => [g.id, g]))
    src = (f.recent ? mine.recent : mine.fav).map((id) => byId.get(id)).filter((g): g is Game => !!g)
    if (f.fav && f.recent) src = src.filter((g) => mine.fav.includes(g.id))
  }
  const out = src.filter((g) => {
    if (f.genre && g.genre !== f.genre) return false
    if (f.theme && g.theme !== f.theme) return false
    if (f.engine && g.engine !== f.engine) return false
    if (f.era && eraOf(g.year) !== f.era) return false
    if (f.dim && String(g.dim) !== f.dim) return false
    if (f.players === '2' && g.players !== 2) return false
    if (f.control && !g.controls.includes(f.control)) return false
    if (f.difficulty && g.difficulty !== f.difficulty) return false
    if (f.section && g.section !== f.section) return false
    if (f.story && !g.story) return false
    if (words.length) {
      const hay = `${g.name} ${g.desc} ${g.id}`.toLowerCase()
      if (!words.every((w) => hay.includes(w))) return false
    }
    return true
  })
  switch (f.sort) {
    case 'az': return out.sort((a, b) => a.name.localeCompare(b.name))
    case 'za': return out.sort((a, b) => b.name.localeCompare(a.name))
    case 'oldest': return out.sort((a, b) => a.year - b.year || a.id - b.id)
    case 'newest': return out.sort((a, b) => b.year - a.year || a.id - b.id)
    case 'number': return out.sort((a, b) => a.id - b.id)
    default: return out
  }
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): { items: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const p = Math.min(Math.max(1, Math.floor(page) || 1), pages)
  return { items: items.slice((p - 1) * size, p * size), page: p, pages }
}

/** Page numbers to show: first, last, current ±2, with 0 as an ellipsis. */
export function pageList(page: number, pages: number): number[] {
  const set = new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2].filter((p) => p >= 1 && p <= pages))
  const sorted = [...set].sort((a, b) => a - b)
  const out: number[] = []
  for (const p of sorted) {
    if (out.length && p - out[out.length - 1] > 1) out.push(0)
    out.push(p)
  }
  return out
}

// ---- URL state ----

export function filtersToQuery(f: Filters): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(f) as [keyof Filters, unknown][]) {
    if (v === DEFAULT_FILTERS[k]) continue
    p.set(k, typeof v === 'boolean' ? '1' : String(v))
  }
  return p.toString()
}

export function queryToFilters(q: string): Filters {
  const p = new URLSearchParams(q)
  const f: Filters = { ...DEFAULT_FILTERS }
  const s = (k: keyof Filters) => p.get(k) ?? ''
  f.q = s('q')
  f.genre = (s('genre') in GENRES ? s('genre') : '') as Filters['genre']
  f.theme = (THEME_IDS.includes(s('theme') as ThemeId) ? s('theme') : '') as Filters['theme']
  f.engine = (s('engine') in ENGINES ? s('engine') : '') as Filters['engine']
  f.era = (s('era') in ERAS ? s('era') : '') as Filters['era']
  f.dim = (['2', '3'].includes(s('dim')) ? s('dim') : '') as Filters['dim']
  f.players = (['1', '2'].includes(s('players')) ? s('players') : '') as Filters['players']
  f.control = (['keyboard', 'mouse', 'touch'].includes(s('control')) ? s('control') : '') as Filters['control']
  f.difficulty = (s('difficulty') in DIFFICULTIES ? s('difficulty') : '') as Filters['difficulty']
  f.section = Math.max(0, Math.min(120, Number(s('section')) || 0))
  f.story = p.get('story') === '1'
  f.fav = p.get('fav') === '1'
  f.recent = p.get('recent') === '1'
  f.sort = (['featured', 'az', 'za', 'oldest', 'newest', 'number'].includes(s('sort')) ? s('sort') : 'featured') as Sort
  f.page = Math.max(1, Number(s('page')) || 1)
  return f
}
