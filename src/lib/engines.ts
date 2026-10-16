import { N } from '../i18n'

/** Gameplay engines. Each catalog game is one engine + a theme + a seed + variant mods. */
export type EngineId =
  | 'snake' | 'breakout' | 'shmup' | 'runner' | 'platformer' | 'arena' | 'dodge' | 'flappy'
  | 'match3' | 'slide' | 'memory' | 'logic' | 'merge' | 'maze' | 'lights' | 'sokoban'
  | 'blocks' | 'stack' | 'towerdef' | 'idle' | 'typing' | 'words' | 'rhythm' | 'racer'
  | 'cards' | 'board' | 'quiz' | 'roguelike' | 'pong' | 'story' | 'reigns' | 'journey'
  | 'paint' | 'synth' | 'flight3d' | 'raycast' | 'launcher' | 'reflex' | 'fighter'
  | 'conquest' | 'chain' | 'golf' | 'escape' | 'sort' | 'code' | 'tactics'

export type Control = 'keyboard' | 'mouse' | 'touch'

export interface EngineMeta {
  id: EngineId
  /** Gameplay type shown in filters. */
  name: string
  /** Year the genre's defining classic appeared: the game's "era". */
  year: number
  controls: Control[]
  /** Max local players (2 = hot-seat or shared keyboard). */
  players: 1 | 2
  /** How to play, shown on the game page. */
  help: string
}

const K: Control[] = ['keyboard', 'touch']
const M: Control[] = ['mouse', 'touch']
const KM: Control[] = ['keyboard', 'mouse', 'touch']

export const ENGINES: Record<EngineId, EngineMeta> = {
  snake: { id: 'snake', name: N('Snake'), year: 1976, controls: K, players: 1, help: N('Steer with arrow keys / WASD or swipe. Eat food to grow, avoid walls and your own tail.') },
  breakout: { id: 'breakout', name: N('Brick breaker'), year: 1976, controls: KM, players: 1, help: N('Move the paddle with the mouse, finger or arrow keys. Keep the ball alive and clear every brick.') },
  shmup: { id: 'shmup', name: N("Shoot 'em up"), year: 1978, controls: KM, players: 1, help: N('Move with arrows / WASD or drag. Your ship fires automatically. Dodge bullets, destroy waves and bosses.') },
  runner: { id: 'runner', name: N('Endless runner'), year: 2009, controls: KM, players: 1, help: N('Press Space / Up, click or tap to jump; hold for a higher jump. Down to duck. Run as far as you can.') },
  platformer: { id: 'platformer', name: N('Platformer'), year: 1985, controls: K, players: 1, help: N('Arrows / WASD to move, Space or Up to jump. Collect stars, avoid enemies and reach the flag.') },
  arena: { id: 'arena', name: N('Arena action'), year: 1979, controls: KM, players: 1, help: N('Move with WASD / arrows, aim and shoot with the mouse (or auto-aim on touch). Survive the waves.') },
  dodge: { id: 'dodge', name: N('Dodge & catch'), year: 1981, controls: KM, players: 1, help: N('Move with the mouse, finger or arrows. Catch the good items, dodge the bad ones.') },
  flappy: { id: 'flappy', name: N('One-button flyer'), year: 2013, controls: KM, players: 1, help: N('Click, tap or press Space to flap. Fly through the gaps.') },
  match3: { id: 'match3', name: N('Match-3'), year: 1994, controls: M, players: 1, help: N('Swap two neighbouring tiles to line up three or more of the same kind. Reach the target score before moves run out.') },
  slide: { id: 'slide', name: N('Sliding puzzle'), year: 1880, controls: KM, players: 1, help: N('Click a tile next to the gap (or use arrows) to slide it. Put the tiles in order.') },
  memory: { id: 'memory', name: N('Memory'), year: 1959, controls: M, players: 1, help: N('Flip two cards at a time and find all matching pairs in as few moves as possible.') },
  logic: { id: 'logic', name: N('Grid logic'), year: 1990, controls: M, players: 1, help: N('Use the clues to deduce the grid. Right-click or long-press to place a flag / mark.') },
  merge: { id: 'merge', name: N('Merge numbers'), year: 2014, controls: K, players: 1, help: N('Slide all tiles with arrows or swipes. Equal tiles merge. Reach the goal tile.') },
  maze: { id: 'maze', name: N('Maze & paths'), year: 1973, controls: K, players: 1, help: N('Find the way to the exit with arrows / WASD or swipes. Pick up keys to open doors.') },
  lights: { id: 'lights', name: N('Toggle puzzle'), year: 1995, controls: M, players: 1, help: N('Click a cell to flip it and its neighbours. Make the whole board one colour.') },
  sokoban: { id: 'sokoban', name: N('Box pushing'), year: 1982, controls: K, players: 1, help: N('Push every crate onto a target with arrows / WASD. You can push but not pull. Z or Backspace to undo.') },
  blocks: { id: 'blocks', name: N('Falling blocks'), year: 1984, controls: K, players: 1, help: N('Left/right to move, Up to rotate, Down to drop faster, Space for hard drop. Fill lines to clear them.') },
  stack: { id: 'stack', name: N('Stacking'), year: 2016, controls: KM, players: 1, help: N('Click, tap or press Space to drop the moving block. Overhangs are cut off. Build as high as you can.') },
  towerdef: { id: 'towerdef', name: N('Tower defense'), year: 2007, controls: M, players: 1, help: N('Click empty ground to build towers, click a tower to upgrade it. Stop the enemies before they reach the end.') },
  idle: { id: 'idle', name: N('Idle & tycoon'), year: 2013, controls: M, players: 1, help: N('Click to earn, buy producers and upgrades. Your income keeps growing even while you watch.') },
  typing: { id: 'typing', name: N('Typing'), year: 1986, controls: ['keyboard'], players: 1, help: N('Type the falling words before they reach the bottom. Mistakes break your combo.') },
  words: { id: 'words', name: N('Word puzzle'), year: 1938, controls: KM, players: 1, help: N('Guess or build words from the letters. Type with the keyboard or click the letter tiles.') },
  rhythm: { id: 'rhythm', name: N('Rhythm'), year: 1996, controls: K, players: 1, help: N('Hit D F J K (or tap the lanes) as notes cross the line. Timing builds your combo.') },
  racer: { id: 'racer', name: N('Racing'), year: 1986, controls: K, players: 1, help: N('Up / W to accelerate, Down to brake, Left / Right to steer. Overtake rivals before time runs out.') },
  cards: { id: 'cards', name: N('Card game'), year: 1600, controls: M, players: 1, help: N('Click cards and buttons to play. Each table explains its own rules on the felt.') },
  board: { id: 'board', name: N('Board game'), year: 1500, controls: M, players: 2, help: N('Click to make your move against the computer, or switch to two players on one device.') },
  quiz: { id: 'quiz', name: N('Quiz'), year: 1981, controls: KM, players: 1, help: N('Pick the right answer (click or press 1-4). Answer quickly for bonus points.') },
  roguelike: { id: 'roguelike', name: N('Roguelike'), year: 1980, controls: K, players: 1, help: N('Move with arrows / WASD, bump into monsters to attack, step on stairs to descend. Each step is a turn.') },
  pong: { id: 'pong', name: N('Paddle sports'), year: 1972, controls: KM, players: 2, help: N('Player 1: W/S or the mouse. Player 2: arrow keys. First to the target score wins.') },
  story: { id: 'story', name: N('Interactive story'), year: 1976, controls: M, players: 1, help: N('Read the story and choose what happens next. Your choices change the ending.') },
  reigns: { id: 'reigns', name: N('Decision cards'), year: 2016, controls: KM, players: 1, help: N('Swipe or press Left / Right to decide. Keep every meter balanced — too low or too high ends your reign.') },
  journey: { id: 'journey', name: N('Journey survival'), year: 1971, controls: M, players: 1, help: N('Manage supplies, choose how to travel and react to events. Reach the destination alive.') },
  paint: { id: 'paint', name: N('Creative toy'), year: 1984, controls: M, players: 1, help: N('Draw with the mouse or finger. Try the tools and colours, then save your picture.') },
  synth: { id: 'synth', name: N('Music toy'), year: 1980, controls: M, players: 1, help: N('Click grid cells to place notes. Press Play to hear your loop. Change tempo and sound.') },
  flight3d: { id: 'flight3d', name: N('3D flight'), year: 1993, controls: KM, players: 1, help: N('Steer with arrows / WASD or the mouse. Fly through the rings, avoid obstacles.') },
  raycast: { id: 'raycast', name: N('3D exploration'), year: 1992, controls: K, players: 1, help: N('W/S or Up/Down to walk, A/D or Left/Right to turn. Find the exit; Space to use / shoot.') },
  launcher: { id: 'launcher', name: N('Physics launcher'), year: 1991, controls: M, players: 1, help: N('Drag back from the launcher to aim and set power, release to fire. Hit every target.') },
  reflex: { id: 'reflex', name: N('Reflex & timing'), year: 1976, controls: KM, players: 1, help: N('Click, tap or press Space at exactly the right moment. It gets faster.') },
  fighter: { id: 'fighter', name: N('Fighting'), year: 1987, controls: K, players: 2, help: N('P1: A/D move, W jump, F punch, G kick. P2 (or AI): arrows, K punch, L kick. Win two rounds.') },
  conquest: { id: 'conquest', name: N('Strategy'), year: 1992, controls: M, players: 1, help: N('Click one of your bases, then a target to send half its troops. Capture every base.') },
  chain: { id: 'chain', name: N('Chain reaction'), year: 2007, controls: M, players: 1, help: N('Click once to start an explosion. Every touched object explodes too. Reach the target count.') },
  escape: { id: 'escape', name: N('Escape room'), year: 2004, controls: M, players: 1, help: N('Click around the room to search it. Collect items, read clues and crack the locks to escape.') },
  sort: { id: 'sort', name: N('Sort puzzle'), year: 2019, controls: M, players: 1, help: N('Click a tube to pick up its top items, click another to drop them on a matching colour. Sort every tube.') },
  code: { id: 'code', name: N('Programming puzzle'), year: 2008, controls: M, players: 1, help: N('Build a program from command blocks, press Run and guide the robot to every goal tile.') },
  tactics: { id: 'tactics', name: N('Turn-based tactics'), year: 1990, controls: M, players: 1, help: N('Click a unit, then a tile to move or an enemy to attack. End your turn when ready. Defeat the enemy squad.') },
  golf: { id: 'golf', name: N('Mini golf & billiards'), year: 1983, controls: M, players: 1, help: N('Drag back from the ball to aim and set power, release to shoot. Sink it in as few shots as possible.') },
}

export const ENGINE_IDS = Object.keys(ENGINES) as EngineId[]
