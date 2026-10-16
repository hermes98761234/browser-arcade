# Writing a game engine

Every catalog game runs one **engine** (`src/engines/games/<id>.ts`) with its own **theme**, **hero**, **variant flags** (`mods`), **difficulty** and **seed**. One engine powers many games, so an engine must read those inputs and let them visibly change the game. `snake.ts` is the reference implementation: read it first.

## Contract

```ts
import { type Engine } from '../kit'
const engine: Engine = { start(env) { …; return { destroy() {…}, pause(p) {…} } } }
export default engine
```

`env` (see `kit.ts → GameEnv`):

| field | use |
|---|---|
| `host` | Empty element filling the play area (wide, ~16:9; phones: portrait-ish). Render into it with `createStage(host, w, h)` (canvas, fixed logical size, auto-fit) or `createDom(host, theme)` (DOM games). |
| `rng` / `seed` | **Only** randomness source for level/content generation (`Math.random` is fine for cosmetic particles). Same seed → same levels. |
| `difficulty` | 0 easy, 1 normal, 2 hard. Use `byDiff(env, e, n, h)`. Must change speed/counts/AI strength. |
| `theme` | Palette (`bg bg2 fg accent accent2 danger good`), `hero` (the player's character emoji — **always use it as the player / avatar / cursor piece**), `foes` (enemy emoji), `items` (pickups / tile symbols, ≥6), `blocks` (solid colours, ≥6). Draw emoji with `emoji(ctx, ch, x, y, size)`. |
| `mods` | `Set<string>` of variant flags from the catalog. Handle the ones listed for your engine (and any others that make sense: `gravity wrap timer portal boss ice dark mirror wind versus endless shield bomb combo rotate hex tiny giant fast slow zen hard hell melee io tank swim climb grapple stealth farm trade deck battle auto lang science math geo cipher spot daily laser color tilt lander key …`). |
| `name`, `desc` | Title and one-line pitch of the specific game (English). Show the name on an intro/title card. You may use keywords in them to pick a sub-mode. |
| `players` | 2 when the user picked two-player mode (only offered when the catalog marks the game 2-player). |
| `score(n)` | Report live score whenever it changes. |
| `status(s)` | Short HUD line (level, lives as ❤️, moves, timer…). |
| `end({score, won, text})` | Call exactly once when the game is over (won/lost/finished). The page shows the result + Play again. Endless/sandbox engines (paint, synth, idle) may never call it, or call it from an in-game "Finish" button. |
| `sfx(name)` | `hit point jump shoot boom win lose click power move`. |

Return `{ destroy, pause }`. `destroy()` must remove **everything** (loop, listeners, DOM, timers, audio). Use `Bag`, `loop`, `keys`, `pointer`, `swipe`, `vpad` from `kit.ts`.

## Rules

- **No `t()` / `N()` calls in engines** and no new i18n keys. In-game text is short English (numbers and icons preferred).
- Text inside the canvas: `text(ctx, s, x, y, {size, color})` (pixel font).
- **Controls:** keyboard + mouse + touch wherever possible. Canvas games that need direction keys call `vpad(host, keys, 'dpad' | 'lr' | 'none', [{action:'a', label:'⤒'}])` (shown only on touch screens). Use `pointer(stage)` for clicks/drags; `swipe()` for grid games.
- **First frame matters:** the game must look alive within 1 s (title card or immediate play). A short 1–2 s "how to" hint drawn on the canvas is nice.
- **Progression:** levels, waves or rising speed so a run lasts minutes, not seconds. Easy must be beatable by a casual player.
- **Juice:** particles (`Particles`), screen shake (`Shake`), sfx, smooth animation, glow (`shadowBlur`) — this is a game platform; it must feel good.
- Performance: 60 fps on a laptop; no allocations of big arrays per frame; cap entities.
- Pure logic that can be unit-tested (generators, solvers, rules) goes in `src/engines/logic/<id>.ts` with a `*.test.ts` next to it (vitest). E.g. "generated sudoku has a unique solution", "match-3 board has no initial matches", "2048 merge rules".
- Dependencies: only what is already in package.json, except where your task says otherwise.
- TypeScript strict, `noUnusedLocals`. `npm run lint && npx tsc -b && npx vitest run` must pass.

## Preview thumbnail

Also write `src/previews/<id>.ts` (see `src/previews/snake.ts`): `default (ctx, w=320, h=180, theme, rng, game) => void` drawing a static, attractive mid-game scene in the game's theme, featuring `theme.hero`. Must be fast (< 2 ms), deterministic from `rng`, no timers/DOM.

## Checking your engine visually

```bash
npm run build && PREVIEW_PORT=<yours> CDP_PORT=<yours> bash scripts/play.sh <slug> /path/out.png 3000 "<js to run after start, e.g. dispatch keys>"
```

Then look at the PNG. Find slugs with: `node -e "const r=require('./src/data/raw.json');…"` or look in the catalog test helpers. A slug is `<id>-<kebab-name>` (see `slugify` in `src/lib/catalog.ts`).
