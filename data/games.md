# 3000 Browser Game Ideas (JavaScript)

Every game runs in a browser with plain JS + Canvas/DOM/WebGL or a common library.
Each entry: **name** `[2D|3D]` — what it is. *Build:* how to implement it.


## 1. Arcade Classics & Remixes — *Canvas 2D / Kaboom.js*
1. **Neon Snake** `[2D]` — snake on a glowing grid. *Build:* Canvas 2D grid array, setInterval tick, arrow keys, shadowBlur glow.
2. **Brick Breaker Blitz** `[2D]` — Breakout with power-ups. *Build:* Canvas 2D, brick array with AABB ball collisions, falling power-up objects, mouse/arrow paddle.
3. **Asteroid Drift** `[2D]` — Asteroids with inertia. *Build:* Canvas 2D vector ship with velocity and friction, screen wraparound, circle collisions, arrow keys.
4. **Pixel Pong Duel** `[2D]` — Pong vs AI. *Build:* Canvas 2D, requestAnimationFrame loop, AI paddle tracking ball with capped speed, W/S keys.
5. **Maze Muncher** `[2D]` — Pac-Man-style maze eater. *Build:* Canvas 2D tile maze array, ghost BFS chasing, grid-snapped movement, arrow keys.
6. **Frog Crossing** `[2D]` — Frogger remake. *Build:* Canvas 2D lanes of moving cars and logs, grid hop movement, rectangle collisions, arrow keys.
7. **Space Swarm** `[2D]` — Space Invaders remix. *Build:* Canvas 2D alien formation array stepping sideways, bullet pools, AABB hits, arrow keys plus space.
8. **Centipede Storm** `[2D]` — mushroom-field shooter. *Build:* Canvas 2D mushroom grid, segmented centipede linked list that splits on hit, mouse-aim shooter.
9. **Missile Guard** `[2D]` — Missile Command remake. *Build:* Canvas 2D, click spawns expanding explosion circles, incoming missiles as line segments, radius collision.
10. **Lunar Lander Pro** `[2D]` — thrust and land gently. *Build:* Canvas 2D gravity and thrust vectors, procedural line terrain, velocity check on landing pad, arrow keys.
11. **Tron Trails** `[3D]` — light-cycle duel. *Build:* Three.js grid arena, trail walls stored as segments, grid-step collision checks, keyboard turns.
12. **Dig Dug Deep** `[2D]` — tunnel and pump enemies. *Build:* Canvas 2D dirt tile grid erased as player digs, enemy pathfinding through tunnels, arrow keys plus pump key.
13. **Qix Claim** `[2D]` — claim area by drawing lines. *Build:* Canvas 2D bitmap grid, flood fill from enemy to claim enclosed area, arrow-key line drawing.
14. **Tempest Tube** `[3D]` — tube shooter in vector style. *Build:* Three.js tube of lane segments, player rotates around rim, enemies climb lanes, left/right keys.
15. **Galaga Wing** `[2D]` — formation dive shooter. *Build:* Canvas 2D enemy formation slots with Bezier dive paths, bullet pools, arrow keys plus space.
16. **Bomber Grid** `[2D]` — Bomberman-like blasts. *Build:* Canvas 2D tile grid, timed bomb entities with cross-shaped flame raycast, destructible blocks, arrow keys.
17. **Paddle Juggler** `[2D]` — keep many balls alive. *Build:* Canvas 2D, array of balls with reflection physics, spawn timer adds balls, mouse paddle.
18. **Comet Catcher** `[2D]` — catch falling stars. *Build:* Canvas 2D falling star objects with speed ramp, basket rectangle collision, mouse or arrow movement.
19. **Joust Flap** `[2D]` — flap-and-lance arena. *Build:* Canvas 2D gravity with flap impulse, height comparison decides joust winner, screen wrap, arrow keys.
20. **Robo Berzerk** `[2D]` — maze robot shooter. *Build:* Canvas 2D room maze, robots moving toward player, 8-direction shooting, WASD plus arrows.
21. **Arkanoid Orbit** `[2D]` — circular brick breaker. *Build:* Canvas 2D polar coordinates, bricks on concentric rings, paddle rotating around center, mouse angle.
22. **Snake Duo** `[2D]` — two snakes, one board. *Build:* Canvas 2D shared grid, two snake arrays, head-to-body collision checks, WASD and arrow keys.
23. **Dot Eater 3000** `[2D]` — speed-run maze dots. *Build:* Canvas 2D tile maze with dot array, run timer and localStorage best time, arrow keys.
24. **Retro Rally Dash** `[2D]` — top-down arcade racer. *Build:* Canvas 2D rotated car sprite, velocity with drift friction, track mask collision, arrow keys.
25. **Bubble Pop Cannon** `[2D]` — Puzzle Bobble shooter. *Build:* Canvas 2D hex-offset bubble grid, flood-fill match-3 removal, wall-bounce aiming, mouse angle.

## 2. Puzzle & Logic — *DOM / Canvas*
26. **Slide 15** `[2D]` — sliding tile puzzle. *Build:* DOM CSS grid of tiles, solvable shuffle via random legal moves, click or arrow keys.
27. **Sudoku Zen** `[2D]` — Sudoku with hints. *Build:* DOM 9x9 inputs, backtracking generator and solver for hints, conflict highlighting, keyboard entry.
28. **Minesweeper Plus** `[2D]` — hex & square modes. *Build:* Canvas 2D square or hex grid, BFS reveal of zero cells, right-click flags, mouse input.
29. **Nonogram Studio** `[2D]` — picture-logic grids. *Build:* DOM grid with row/column clue arrays, line-solver validation, click and drag to fill cells.
30. **Lights Out Lab** `[2D]` — toggle all lights off. *Build:* DOM 5x5 button grid, toggle cell and neighbours, solvable random presses generate puzzles, click input.
31. **Tower of Hanoi Rush** `[2D]` — timed Hanoi. *Build:* DOM or Canvas peg stacks as arrays, legal-move check, countdown timer, click-to-select disks.
32. **2048 Fusion** `[2D]` — merge tiles. *Build:* DOM 4x4 grid matrix, slide-and-merge row algorithm, CSS transitions, arrow keys and swipe.
33. **Kakuro Keys** `[2D]` — cross-sum puzzles. *Build:* DOM grid with sum clue cells, constraint validation per run, keyboard digit entry.
34. **Flow Connect** `[2D]` — link same-colored dots. *Build:* Canvas 2D grid, drag paths cell to cell, path arrays overwrite crossings, mouse/touch input.
35. **Pipe Mania** `[2D]` — route water through pipes. *Build:* Canvas 2D pipe tile grid, BFS water flow through connections over time, click placement.
36. **Sokoban Warehouse** `[2D]` — push crates. *Build:* DOM or Canvas tile map from level strings, push rules, undo stack, arrow keys.
37. **Tangram Shapes** `[2D]` — fit seven pieces. *Build:* SVG polygons, drag and rotate pieces, snap-to-target polygon overlap check, mouse/touch.
38. **Laser Mirrors** `[2D]` — bounce lasers to targets. *Build:* Canvas 2D grid, ray march laser through mirror tiles reflecting direction, click to rotate mirrors.
39. **Rush Hour Jam** `[2D]` — unblock the red car. *Build:* DOM or Canvas 6x6 grid, cars as axis-locked rectangles, BFS solver for hints, drag input.
40. **Hashi Bridges** `[2D]` — connect islands. *Build:* SVG islands and lines, bridge count graph with connectivity check, click between islands.
41. **KenKen Grid** `[2D]` — arithmetic Latin squares. *Build:* DOM grid with cage arithmetic constraints, Latin-square validation, keyboard digit entry.
42. **Jigsaw Snap** `[2D]` — image jigsaw with any photo. *Build:* Canvas 2D, slice uploaded image into pieces, drag with snapping to neighbours, FileReader input.
43. **Mastermind Code** `[2D]` — guess the color code. *Build:* DOM peg rows, compute exact and color-only matches, click color palette to fill guess.
44. **Peg Solitaire** `[2D]` — jump-remove pegs. *Build:* DOM cross-shaped board array, jump-over validation, click select then target, undo stack.
45. **Color Fill Flood** `[2D]` — flood-it puzzle. *Build:* Canvas 2D color grid, flood fill from top-left on color choice, move counter, button input.
46. **Rotate the Path** `[2D]` — rotate tiles to connect. *Build:* Canvas 2D tile grid with edge bitmasks, click rotates bits, BFS checks source-to-goal connection.
47. **Unblock Me Gems** `[2D]` — gem sliding variant. *Build:* Canvas 2D grid of gem blocks, axis-constrained sliding with collision, drag input.
48. **Binary Grid** `[2D]` — Takuzu 0/1 puzzles. *Build:* DOM grid cycling 0/1/blank, row/column balance and uniqueness checks, click input.
49. **Star Battle** `[2D]` — place stars by region. *Build:* DOM grid with colored regions, adjacency and per-row/column/region star counts, click to toggle.
50. **Gravity Box** `[2D]` — tilt board to solve. *Build:* Canvas 2D tile grid, tilt slides all pieces until blocked, arrow keys or device orientation.

## 3. Platformers — *Phaser 3*
51. **Jumpy Jelly** `[2D]` — bouncy slime platformer. *Build:* Phaser 3 arcade physics, squash-and-stretch tween on landing, tilemap levels, arrow keys.
52. **Wall Kick Ninja** `[2D]` — wall-jump climber. *Build:* Phaser 3 arcade physics, wall-contact check enables opposite jump impulse, vertical camera follow.
53. **Pixel Knight Quest** `[2D]` — castle platformer. *Build:* Phaser 3 Tiled tilemap, sprite animations, enemy patrol AI, sword hitbox, arrow keys.
54. **Gravity Flip Runner** `[2D]` — toggle gravity. *Build:* Phaser 3 arcade physics, invert gravity.y and flip sprite on keypress, auto-scrolling level.
55. **Lava Rising** `[2D]` — climb before lava rises. *Build:* Phaser 3 arcade physics, rising lava rectangle on timer, procedural platforms, camera follow upward.
56. **Double Dash Fox** `[2D]` — dash & double jump. *Build:* Phaser 3 arcade physics, jump counter and dash velocity burst with cooldown, keyboard input.
57. **Shadow Swap** `[2D]` — swap between light/dark worlds. *Build:* Phaser 3 two tilemap layers toggling collision and visibility, swap key, arrow keys.
58. **Grapple Monkey** `[2D]` — swing with a rope. *Build:* Phaser 3 Matter physics, distance constraint rope to anchor point, mouse click to attach.
59. **Cloud Hopper** `[2D]` — jump across clouds. *Build:* Phaser 3 one-way platforms with checkCollision.down only, procedural cloud spawn, arrow keys.
60. **Time Rewind Rex** `[2D]` — rewind on death. *Build:* Phaser 3, circular buffer of player state snapshots replayed backward on death, arrow keys.
61. **Tiny Robot Trek** `[2D]` — collectible platformer. *Build:* Phaser 3 tilemap with collectible object layer, saved progress in localStorage, arrow keys.
62. **Ice Slide Penguin** `[2D]` — slippery levels. *Build:* Phaser 3 arcade physics, low drag on ice tiles via tile properties, arrow keys.
63. **Bounce Ball Bob** `[2D]` — ball-only platformer. *Build:* Phaser 3 arcade physics circle body with bounce, rolling via angular velocity, arrow keys.
64. **Spike Dodger** `[2D]` — precision obstacle course. *Build:* Phaser 3 tilemap spike layer, instant respawn at checkpoint, coyote time and jump buffering.
65. **Ghost Echo** `[2D]` — cooperate with past runs. *Build:* Phaser 3, record input per frame, replay ghosts alongside player to press switches, arrow keys.
66. **Portal Pup** `[2D]` — place two portals. *Build:* Phaser 3, two portal objects, teleport preserving rotated velocity, mouse-aimed placement.
67. **Magnet Boots** `[2D]` — stick to metal walls. *Build:* Phaser 3, per-surface gravity direction on metal tiles, rotate sprite to surface, arrow keys.
68. **Paper Plane Glide** `[2D]` — glide platformer. *Build:* Phaser 3, glide physics with lift from pitch angle, wind zones, up/down keys.
69. **Coin Climber** `[2D]` — vertical coin collecting. *Build:* Phaser 3 procedural vertical platforms, coin groups, camera scrolls upward, arrow keys.
70. **Mirror Twins** `[2D]` — control two mirrored heroes. *Build:* Phaser 3, two sprites with mirrored horizontal input, both must reach goals, arrow keys.
71. **Speedrun Squirrel** `[2D]` — timer-based levels. *Build:* Phaser 3 tilemap levels, millisecond timer with splits, localStorage best times, keyboard.
72. **Blob Split** `[2D]` — split into small blobs. *Build:* Phaser 3, split blob into smaller bodies by mass, merge on overlap, select with number keys.
73. **Rope Bridge Hero** `[2D]` — build bridges to cross. *Build:* Phaser 3 Matter physics, place plank bodies linked by joints, stress check, mouse placement.
74. **Jetpack Joe** `[2D]` — fuel-limited flight. *Build:* Phaser 3 arcade physics, thrust while fuel above zero, fuel pickups, hold space to fly.
75. **Moon Bounce** `[2D]` — low-gravity platformer. *Build:* Phaser 3 arcade physics with low gravity and long airtime, parallax starfield, arrow keys.

## 4. Shooters & Shmups — *Phaser / PixiJS*
76. **Starfall Squadron** `[2D]` — vertical shmup. *Build:* PixiJS sprites, scrolling background, object-pooled bullets, scripted enemy waves, arrow keys plus Z.
77. **Bullet Bloom** `[2D]` — bullet-hell flowers. *Build:* PixiJS, radial bullet patterns from parametric angle formulas, small player hitbox, keyboard input.
78. **Twin Stick Arena** `[2D]` — top-down survival. *Build:* Canvas 2D, WASD movement plus mouse aim, enemy spawner, circle collisions, bullet pool.
79. **Zombie Siege** `[2D]` — defend the house. *Build:* Phaser 3, zombies path toward house, barricade health, click to shoot, reload timer.
80. **Sky Ace 1942** `[2D]` — WWII plane shooter. *Build:* Phaser 3 vertical scroller, enemy formations from JSON, power-up spread shots, arrow keys plus space.
81. **Neon Geometry Wars** `[2D]` — vector arena. *Build:* Canvas 2D additive glow lines, particle explosions, spatial hash collisions, twin-stick WASD and mouse.
82. **Turret Hold** `[2D]` — rotate turret to survive. *Build:* Canvas 2D central turret rotated by atan2 to mouse, enemy waves from edges, click to fire.
83. **Alien Abduction** `[2D]` — UFO shooter. *Build:* Phaser 3, UFO with tractor beam cone, ground units shoot back, arrow keys plus space.
84. **Laser Grid Escape** `[2D]` — dodge & shoot lasers. *Build:* Canvas 2D, timed laser lines with warning flash, line-circle collision, WASD movement.
85. **Mech Rampage** `[2D]` — side-scrolling mech. *Build:* Phaser 3 side-scrolling tilemap, mech with heavy inertia and rotating arm cannon, keyboard plus mouse.
86. **Pirate Cannon Clash** `[2D]` — ship broadsides. *Build:* Canvas 2D ships with heading and sail speed, broadside cannonball arcs, A/D steering and Q/E fire.
87. **Duck Hunt Web** `[2D]` — mouse-aim hunting. *Build:* Canvas 2D ducks on random Bezier flight paths, crosshair cursor, click hit-test, ammo count.
88. **Sniper Rooftop** `[2D]` — precision shots. *Build:* Canvas 2D scope view with sway noise, hold breath key steadies, click to shoot targets.
89. **Robot Wave Survival** `[2D]` — endless waves. *Build:* PixiJS top-down arena, escalating wave spawner, upgrade shop between waves, WASD plus mouse.
90. **Orbit Defender** `[2D]` — defend a planet core. *Build:* Canvas 2D polar movement around planet, enemies approach from radius, left/right plus space.
91. **Pixel Tank Battle** `[2D]` — destructible tanks. *Build:* Canvas 2D bitmap terrain carved by explosions, tank turret angle and power, keyboard input.
92. **Hover Drone Ops** `[2D]` — top-down drone shooter. *Build:* Canvas 2D top-down drone with inertia, raycast line-of-sight enemies, WASD plus mouse fire.
93. **Asteroid Miner Gunner** `[2D]` — mine & shoot. *Build:* Canvas 2D asteroids splitting into ore pickups, mining laser hold, ship upgrade shop, keyboard.
94. **Bullet Time Cowboy** `[2D]` — slow-mo duels. *Build:* Canvas 2D, global timeScale slows world on key hold, reaction-timed draw duel, mouse aim.
95. **Swarm Survivor** `[2D]` — Vampire-Survivors-like. *Build:* Canvas 2D or PixiJS, auto-firing weapons, XP gems, level-up choices, spatial grid collisions, WASD.
96. **Space Trader Raider** `[2D]` — shoot & loot. *Build:* Canvas 2D star map with trade prices, combat scenes dropping loot, save to localStorage, keyboard.
97. **Glow Worm Wars** `[2D]` — light-trail battle. *Build:* Canvas 2D worms leaving light trails, trail segment collisions kill, particle glow, arrow keys.
98. **Galaxy Patrol** `[2D]` — wave-based space shooter. *Build:* Phaser 3, wave definitions in JSON, scrolling starfield, power-up drops, arrow keys plus space.
99. **Cyber Hacker Shooter** `[2D]` — shoot code bugs. *Build:* Canvas 2D, bug sprites crawl code-text background, monospace fonts, mouse-aim shooting.
100. **Sky Fortress** `[2D]` — boss-rush shooter. *Build:* Phaser 3, boss state machines with attack patterns, health bars, bullet pools, keyboard.

## 5. Racing & Driving — *Three.js / Canvas*
101. **Pixel Kart GP** `[2D]` — top-down kart racer. *Build:* Canvas 2D top-down karts, track waypoints for AI, item boxes, arrow keys.
102. **Drift King** `[2D]` — drifting score attack. *Build:* Canvas 2D car with lateral friction for drift, score from slip angle, arrow keys.
103. **Highway Dodge** `[2D]` — endless traffic weaving. *Build:* Canvas 2D vertical scrolling lanes, random traffic spawns, AABB collisions, left/right keys.
104. **Moto Hill Climb** `[2D]` — physics bike climb. *Build:* Planck.js wheel joints on procedural hill terrain, throttle and lean keys, fuel meter.
105. **Neon Racer 3D** `[3D]` — synthwave track. *Build:* Three.js extruded spline track, neon emissive materials with bloom, arrow keys.
106. **Micro Machines Mini** `[2D]` — tabletop racing. *Build:* Canvas 2D top-down table-scale tracks with object obstacles, local two-player keyboard.
107. **Rally Mud Run** `[3D]` — off-road rally. *Build:* Three.js heightmap terrain, cannon-es raycast vehicle, mud particle trails, arrow keys.
108. **Space Pod Race** `[3D]` — sci-fi hover race. *Build:* Three.js canyon track, hover car spring height above ground, boost pads, arrow keys.
109. **Boat Rush** `[3D]` — speedboat slalom. *Build:* Three.js animated water plane, boat physics with buoyancy wobble, gate checkpoints, arrow keys.
110. **Parking Master** `[2D]` — precise parking puzzle. *Build:* Canvas 2D car with bicycle steering model, oriented rectangle collisions, arrow keys.
111. **Taxi Rush City** `[2D]` — pick up passengers. *Build:* Canvas 2D top-down city grid, passenger pickup and drop markers, timer, arrow keys.
112. **Police Chase** `[2D]` — escape the cops. *Build:* Canvas 2D city, police cars pathfind toward player with A*, damage meter, arrow keys.
113. **Snowboard Slope** `[3D]` — downhill tricks. *Build:* Three.js slope mesh, sliding physics, airtime trick rotations, arrow keys.
114. **Skate Line** `[2D]` — skateboarding runs. *Build:* Canvas 2D side view, ollie and grind timing on rail objects, combo score, keyboard.
115. **Monster Truck Crush** `[2D]` — crush cars. *Build:* Planck.js truck with big wheel joints, crushable car bodies, arrow keys.
116. **Ghost Lap** `[2D]` — beat your ghost. *Build:* Canvas 2D racer, record position per frame, replay best lap as translucent ghost, arrow keys.
117. **Bicycle Courier** `[2D]` — deliver packages. *Build:* Canvas 2D top-down city, delivery queue with deadlines, bike stamina, arrow keys.
118. **Tractor Pull** `[2D]` — farm power contest. *Build:* Canvas 2D side view, increasing sled drag vs RPM gear power, timed key presses.
119. **Formula Pixel** `[2D]` — F1 strategy racing. *Build:* Canvas 2D track, tire wear and fuel model, pit-stop decisions via DOM buttons.
120. **Drag Strip Duel** `[2D]` — shift-timing drag race. *Build:* Canvas 2D, RPM needle and gear ratio model, shift on green zone, space key.
121. **Retro Outrun** `[2D]` — pseudo-3D road. *Build:* Canvas 2D pseudo-3D road with projected segments and curves, sprite scaling, arrow keys.
122. **Lawn Mower Race** `[2D]` — mow fastest. *Build:* Canvas 2D grass grid cleared under mower, percentage tracking, race timer, arrow keys.
123. **Rocket Sled** `[2D]` — speed records. *Build:* Canvas 2D side view, staged thrust with heat meter, distance records in localStorage.
124. **Zero-G Racer** `[3D]` — tube racing. *Build:* Three.js TubeGeometry track, player angle around tube, obstacle rings, left/right keys.
125. **Bumper Cars Chaos** `[2D]` — arena bumping. *Build:* Planck.js arena with car bodies and restitution, AI bumpers, arrow keys.

## 6. Strategy & Tower Defense — *Phaser / Canvas*
126. **Tower Guard** `[2D]` — classic TD. *Build:* Canvas 2D grid path, tower range checks and projectiles, wave spawner, click to place.
127. **Castle Clash Lite** `[2D]` — lane strategy. *Build:* Phaser 3 three-lane battlefield, unit spawn buttons with elixir timer, auto-advancing units.
128. **Hex Conquest** `[2D]` — hex territory war. *Build:* Canvas 2D axial hex grid, territory ownership map, turn-based AI, click to attack.
129. **Mini RTS Battle** `[2D]` — small-scale RTS. *Build:* Canvas 2D units with A* pathfinding, drag-box selection, right-click move orders.
130. **Kingdom Builder** `[2D]` — grow and defend. *Build:* Canvas 2D tile grid buildings producing resources, raid waves, click placement menus.
131. **Orc Wall** `[2D]` — hold the gate. *Build:* Phaser 3, gate health, orc waves with ladders, archers placed on walls by click.
132. **Lane Wars** `[2D]` — auto-battler lanes. *Build:* Canvas 2D lanes, units auto-fight on contact, gold income tick, DOM unit buttons.
133. **Space Fleet Command** `[2D]` — turn-based fleets. *Build:* Canvas 2D hex sector map, turn-based fleet moves and dice combat, click orders.
134. **Ant Colony Wars** `[2D]` — ant RTS. *Build:* Canvas 2D ants following pheromone grid, food foraging, colony upgrade buttons.
135. **Viral Spread** `[2D]` — infect the world strategy. *Build:* SVG world map regions, SIR-style infection model per tick, DOM upgrade tree.
136. **Siege Engineer** `[2D]` — build catapults. *Build:* Planck.js catapult built from parts, projectile launch at castle bodies, drag-and-drop editor.
137. **Island Conquest** `[2D]` — naval strategy. *Build:* Canvas 2D island tile map, ships with move ranges, turn-based combat, click input.
138. **Chess Tactics Arena** `[2D]` — chess puzzles. *Build:* DOM chessboard with chess.js validation, puzzle FEN list, drag pieces to solve.
139. **Mini Civ** `[2D]` — tiny civilization game. *Build:* Canvas 2D tile map, cities growing population, tech tree in DOM, end-turn button.
140. **Merge Defense** `[2D]` — merge towers. *Build:* Canvas 2D TD grid, drag identical towers together to merge levels, wave spawner.
141. **Galactic Empire** `[2D]` — 4X in a page. *Build:* Canvas 2D procedural star map, planets with production queues, turn-based AI empires.
142. **Bug Swarm Defense** `[2D]` — garden defense. *Build:* Canvas 2D garden lanes, plant-defender grid placement, bug waves, click input.
143. **Medieval Battles** `[2D]` — formation tactics. *Build:* Canvas 2D units in formations, flanking damage bonuses, drag orders, pause-and-plan.
144. **Mage Tower** `[2D]` — spell-tower TD. *Build:* Phaser 3 TD, elemental spell towers with status effects, click to place and upgrade.
145. **Trench Line** `[2D]` — WWI tactics. *Build:* Canvas 2D side trenches, turn-based artillery and advance orders, DOM command buttons.
146. **Robot Factory War** `[2D]` — build bots, attack. *Build:* Canvas 2D factory queue producing bots, auto-attack lanes, resource tick, click upgrades.
147. **Elemental Clash** `[2D]` — rock-paper-scissors armies. *Build:* Canvas 2D armies of three types with counter multipliers, simultaneous turn resolution, buttons.
148. **Frontier Outpost** `[2D]` — wild-west defense. *Build:* Phaser 3 outpost map, bandit waves, place fences and gunners, click input.
149. **Zombie Barricade** `[2D]` — build barricades. *Build:* Canvas 2D grid, place barricade tiles in day phase, zombies A* at night, mouse.
150. **Auto Chess Lite** `[2D]` — drafting auto battler. *Build:* DOM shop draft with gold, Canvas 2D board auto-combat simulation, drag units to board.

## 7. Idle & Incremental — *Vanilla JS*
151. **Cookie Empire** `[2D]` — click cookies. *Build:* DOM click button, setInterval production tick, upgrade costs scaling exponentially, localStorage saves.
152. **Space Miner Idle** `[2D]` — automated mining. *Build:* DOM resource counters, drone purchases with per-second rates, offline progress via timestamps.
153. **Lemonade Tycoon** `[2D]` — run a stand. *Build:* DOM stand UI, weather-driven demand formula, price sliders, day cycle timer.
154. **Dungeon Idle** `[2D]` — auto-fight floors. *Build:* DOM floor progress, auto-battle tick with stats, gear upgrades, localStorage saves.
155. **Factory Clicker** `[2D]` — production chains. *Build:* DOM resource graph with recipes consuming inputs, per-tick production, click to build.
156. **Bitcoin Farmer** `[2D]` — mining parody. *Build:* DOM fake rigs with hash-rate, price random walk, buy and sell buttons.
157. **Planet Terraformer** `[2D]` — idle terraforming. *Build:* Canvas 2D planet color shifting with progress, idle resource ticks, DOM upgrade list.
158. **Idle Wizard Academy** `[2D]` — train wizards. *Build:* DOM wizard roster, training timers, mana generation tick, localStorage persistence.
159. **Antimatter Clicker** `[2D]` — exponential growth. *Build:* DOM tiered generators, break_infinity.js big numbers, prestige resets.
160. **Fishing Idle** `[2D]` — auto fishing. *Build:* DOM auto-cast timers, random fish table rarity rolls, Canvas pond animation.
161. **Bakery Boss** `[2D]` — idle bakery. *Build:* DOM ovens with bake timers, sell rates, staff hiring upgrades, offline gains.
162. **Universe Paperclips** `[2D]` — paperclip maximizer. *Build:* DOM stats and buttons, staged unlocks via event thresholds, per-tick production loop.
163. **Idle Zoo** `[2D]` — collect animals. *Build:* DOM enclosure cards, visitor income tick, animal gacha rolls, localStorage saves.
164. **Prestige Tower** `[2D]` — reset for multipliers. *Build:* DOM floors climbed automatically, prestige currency multiplies speed after reset.
165. **Gold Rush Idle** `[2D]` — prospecting. *Build:* DOM claims with random yield rolls, buy pans and dredges, tick loop.
166. **Idle Farm Valley** `[2D]` — crops grow passively. *Build:* Canvas 2D farm grid with crop growth timers, auto-harvesters, DOM shop.
167. **Robot Assembly** `[2D]` — assembly line idle. *Build:* Canvas 2D conveyor animation, DOM station upgrades increasing throughput, tick loop.
168. **Spell Clicker** `[2D]` — click to cast. *Build:* DOM click casts spells, mana regeneration, spell combo unlocks, localStorage saves.
169. **Hero Guild Idle** `[2D]` — send heroes on quests. *Build:* DOM hero roster, quest timers with success rolls, loot inventory, localStorage.
170. **Oil Baron** `[2D]` — drilling empire. *Build:* Canvas 2D map of wells, oil price fluctuation, DOM purchase and upgrade panel.
171. **Idle Space Station** `[2D]` — station upgrades. *Build:* Canvas 2D modular station sprites, DOM module upgrades, resource tick loop.
172. **Pixel Evolution** `[2D]` — evolve organisms. *Build:* Canvas 2D creatures, merge-to-evolve tiers, passive DNA income tick, mouse drag.
173. **Idle Train Network** `[2D]` — rail empire. *Build:* Canvas 2D map with stations, route lines, trains earning per trip, DOM upgrades.
174. **Clicker Kingdom** `[2D]` — kingdom upgrades. *Build:* DOM building cards with costs, income tick, kingdom events, localStorage saves.
175. **Startup Simulator** `[2D]` — idle tech company. *Build:* DOM hires and products, revenue formulas per tick, funding rounds as prestige.

## 8. Card & Board — *DOM / Canvas*
176. **Solitaire Classic** `[2D]` — Klondike. *Build:* DOM card elements, drag-and-drop with stack validation, undo stack, auto-complete.
177. **Spider Solitaire** `[2D]` — 1/2/4 suits. *Build:* DOM tableau of 10 columns, same-suit run removal, suit-count selector, drag input.
178. **FreeCell Pro** `[2D]` — FreeCell. *Build:* DOM cards, free cell and foundation validation, supermove count, drag or click.
179. **Chess Online** `[2D]` — chess vs AI (chess.js). *Build:* DOM board with chess.js rules, minimax alpha-beta AI, drag-and-drop pieces.
180. **Checkers Royale** `[2D]` — draughts. *Build:* Canvas 2D 8x8 board, forced-capture rules, minimax AI, click to move.
181. **Reversi Flip** `[2D]` — Othello. *Build:* Canvas 2D 8x8 board, flip in 8 directions, corner-weighted greedy AI, click input.
182. **Connect Four Drop** `[2D]` — vs AI. *Build:* DOM 7x6 grid, gravity drop, four-in-a-row check, minimax AI, click columns.
183. **Backgammon Board** `[2D]` — classic backgammon. *Build:* Canvas 2D board with point arrays, dice rolls, bar and bear-off rules, click to move.
184. **Mahjong Tiles** `[2D]` — Mahjong solitaire. *Build:* Canvas 2D layered tile stacks, free-tile detection, matching pairs, click input.
185. **Go Mini 9x9** `[2D]` — Go on small board. *Build:* Canvas 2D 9x9 grid, liberty flood fill capture, simple Monte Carlo AI, click to place.
186. **Blackjack Table** `[2D]` — 21 vs dealer. *Build:* DOM cards, shoe shuffle, dealer hits until 17, hit/stand/double buttons.
187. **Texas Hold'em Lite** `[2D]` — poker vs bots. *Build:* DOM table, hand evaluator ranking, simple bot betting logic, bet buttons.
188. **Uno-like Color Cards** `[2D]` — shedding game. *Build:* DOM card hand, color/number matching rules, action cards, bot opponents.
189. **Ludo Race** `[2D]` — board race. *Build:* Canvas 2D cross board, dice roll, token path arrays, capture rules, click tokens.
190. **Snakes & Ladders** `[2D]` — dice classic. *Build:* Canvas 2D 10x10 board, dice roll animation, snake and ladder jump map.
191. **Memory Match** `[2D]` — card pairs. *Build:* DOM grid of cards with CSS 3D flip transform, shuffled pairs, click input.
192. **Battleship Strike** `[2D]` — naval guessing. *Build:* DOM two grids, ship placement, AI hunt-target strategy, click to fire.
193. **Dominoes Draw** `[2D]` — dominoes. *Build:* DOM tile chain with open ends, draw pile, matching rules, drag tiles.
194. **Mancala Stones** `[2D]` — sowing game. *Build:* DOM pits as arrays, sowing loop with capture rules, minimax AI, click pits.
195. **Hearts Card Game** `[2D]` — trick-taking. *Build:* DOM card table, trick-taking rules, passing phase, rule-based bot AI.
196. **Gin Rummy** `[2D]` — rummy vs AI. *Build:* DOM hands, meld detection algorithm, knock and gin scoring, rummy bot AI.
197. **Yahtzee Dice** `[2D]` — dice combos. *Build:* DOM dice with hold toggles, three rolls, scorecard category calculations.
198. **Tic-Tac-Toe Ultimate** `[2D]` — nested 3x3. *Build:* DOM nested 3x3 grids, send-to-board rule, win checks per sub-board, click input.
199. **Deckbuilder Dungeon** `[2D]` — Slay-the-Spire-like. *Build:* DOM card hand and enemy intents, energy system, deck/discard arrays, map nodes.
200. **Pyramid Solitaire** `[2D]` — pair to 13. *Build:* DOM pyramid layout, exposed-card check, pairs summing 13, click input.

## 9. Word & Typing — *DOM*
201. **Wordle Clone** `[2D]` — 5-letter guess. *Build:* DOM 6x5 grid, word list validation, green/yellow evaluation, on-screen and physical keyboard.
202. **Hangman Hero** `[2D]` — guess the word. *Build:* DOM letter buttons, SVG hangman parts revealed per miss, word list.
203. **Typing Racer** `[2D]` — WPM race. *Build:* DOM text spans with per-character correctness, WPM calculation, AI racer car bars.
204. **Word Search Grid** `[2D]` — find words. *Build:* DOM grid filled with words in 8 directions, drag to select, found-word list.
205. **Crossword Daily** `[2D]` — mini crosswords. *Build:* DOM crossword grid with clue numbering, arrow-key navigation, check answers.
206. **Anagram Blitz** `[2D]` — unscramble fast. *Build:* DOM letter tiles, dictionary Set lookup for valid sub-words, countdown timer.
207. **Boggle Board** `[2D]` — 4x4 letter dice. *Build:* DOM 4x4 dice grid, adjacency path validation, trie dictionary lookup, drag across letters.
208. **Spelling Bee Hive** `[2D]` — 7-letter hive. *Build:* SVG hexagon hive, words must use center letter, dictionary Set, keyboard input.
209. **Zombie Typer** `[2D]` — type to shoot zombies. *Build:* Canvas 2D zombies approaching with word labels, typed prefix targeting, keyboard.
210. **Word Chain** `[2D]` — last-letter chain. *Build:* DOM chain list, dictionary validation, last-letter rule, timer per turn.
211. **Letter Drop** `[2D]` — Tetris with letters. *Build:* Canvas 2D falling letter blocks, row word detection via dictionary, arrow keys.
212. **Typing Defense** `[2D]` — type words to defend. *Build:* Canvas 2D enemies carrying words toward base, type to destroy, keyboard input.
213. **Cryptogram Crack** `[2D]` — decode quotes. *Build:* DOM quote cipher with substitution map, letter inputs, frequency hints.
214. **Scrabble Lite** `[2D]` — tile word game. *Build:* DOM 11x11 board, tile rack, letter scores and multipliers, dictionary validation, drag tiles.
215. **Word Ladder** `[2D]` — change one letter. *Build:* DOM word steps, one-letter-difference check, BFS for optimal path, keyboard input.
216. **Emoji Riddles** `[2D]` — guess the phrase. *Build:* DOM emoji clue strings, text input with fuzzy match, hint buttons.
217. **Keyboard Ninja** `[2D]` — slice typed words. *Build:* Canvas 2D words fly across screen, typing slices them with particle effects.
218. **Speed Spell** `[2D]` — spell under time. *Build:* DOM, Web Speech API speaks the word, timed text input, scoring.
219. **Word Snake** `[2D]` — snake that eats letters. *Build:* Canvas 2D grid snake eating letters in order to spell target word, arrow keys.
220. **Codeword Puzzle** `[2D]` — number-letter grid. *Build:* DOM grid of numbers mapped to letters, letter assignment inputs, solution check.
221. **Rhyme Time** `[2D]` — find rhymes. *Build:* DOM prompt word, rhyme dictionary by suffix matching, timed input.
222. **Typing Rhythm** `[2D]` — type on the beat. *Build:* DOM falling words synced to Web Audio beat clock, timed typing accuracy.
223. **Synonym Sprint** `[2D]` — match synonyms. *Build:* DOM word cards, synonym pairs JSON, click to match, timer.
224. **Word Bubbles** `[2D]` — pop letters into words. *Build:* Canvas 2D floating letter bubbles, click in order to form words, dictionary check.
225. **Lexicon Tower** `[2D]` — stack words high. *Build:* Canvas 2D stacking word blocks with Matter.js physics, longer words wider blocks.

## 10. Physics — *Matter.js / Planck.js*
226. **Angry Catapult** `[2D]` — launch at towers. *Build:* Matter.js slingshot constraint, block towers and target bodies, mouse drag to launch.
227. **Cut the Rope Candy** `[2D]` — rope-cutting puzzle. *Build:* Matter.js chain of bodies as rope, swipe intersection cuts link, gravity candy.
228. **Stack Tower** `[2D]` — balance blocks. *Build:* Matter.js falling blocks, stability check over time, click or tap to drop.
229. **Bridge Builder** `[2D]` — engineer bridges. *Build:* Matter.js beams as bodies with joint stress limits, test vehicle, mouse placement.
230. **Marble Run Maker** `[2D]` — build marble tracks. *Build:* Matter.js static track pieces, marble bodies, drag-and-drop editor, play button.
231. **Ragdoll Stairs** `[2D]` — ragdoll falls. *Build:* Matter.js ragdoll from bodies and constraints, damage from impact force, push power slider.
232. **Pinball Wizard** `[2D]` — full pinball table. *Build:* Matter.js table with flippers on hinges, bumpers with restitution, plunger, Z/M keys.
233. **Domino Chain** `[2D]` — set up chain reactions. *Build:* Matter.js domino rectangles, click to place and rotate, push to start chain.
234. **Physics Drawer** `[2D]` — draw shapes to solve. *Build:* Matter.js, convert mouse-drawn stroke to compound body, gravity solves puzzle.
235. **Balloon Pop Physics** `[2D]` — float & pop. *Build:* Matter.js balloons with negative gravity, pins and spikes, click to pop.
236. **Jelly Car** `[2D]` — soft-body driving. *Build:* Matter.js soft body from spring-linked particle grid, wheel motors, arrow keys.
237. **Pool Billiards** `[2D]` — 8-ball. *Build:* Matter.js balls with friction and restitution, cue drag for power and angle, pocket sensors.
238. **Mini Golf Physics** `[2D]` — putting courses. *Build:* Matter.js ball with friction on top-down course, drag to aim and power.
239. **Water Bucket** `[2D]` — fluid fill puzzle. *Build:* Canvas 2D SPH particles or Matter.js circles, pour into buckets, drawable lines.
240. **Rube Goldberg Lab** `[2D]` — contraption sandbox. *Build:* Matter.js sandbox with parts palette, ropes, springs, triggers, goal sensor.
241. **Ball Drop Plinko** `[2D]` — plinko board. *Build:* Matter.js static peg grid, ball drop, slot sensors award points, click to drop.
242. **Crane Claw** `[2D]` — claw machine. *Build:* Matter.js claw with joint grip strength, prize bodies, arrow keys and drop button.
243. **Wrecking Ball** `[2D]` — demolish buildings. *Build:* Matter.js stacked building bodies, pendulum constraint ball, crane controls via keys.
244. **Car Crusher** `[2D]` — crash physics. *Build:* Matter.js vehicles with breakable welded parts on impact force, ramp launches.
245. **Cannon Balance** `[2D]` — balance on seesaw. *Build:* Matter.js seesaw hinge, cannon fires weights to balance, angle and power input.
246. **Sand Falling** `[2D]` — falling-sand sandbox. *Build:* Canvas 2D ImageData cellular automaton with material rules, mouse brush.
247. **Gravity Wells** `[2D]` — orbit ball to goal. *Build:* Canvas 2D custom inverse-square gravity, place wells by click, ball reaches goal.
248. **Spring Jumper** `[2D]` — spring physics hopper. *Build:* Matter.js spring constraint compresses on hold, release to jump, platform hops.
249. **Tumble Jenga** `[3D]` — pull blocks out. *Build:* Three.js with cannon-es stacked blocks, drag to pull block out, stability check.
250. **Boat Floater** `[2D]` — buoyancy puzzles. *Build:* Planck.js buoyancy by submerged area calculation, cargo placement, mouse drag.

## 11. Rhythm & Music — *Tone.js / Web Audio*
251. **Beat Tap** `[2D]` — tap to the beat. *Build:* Web Audio scheduled beat clock, timing window grading, space key, Canvas pulse.
252. **Piano Tiles Web** `[2D]` — tap black tiles. *Build:* Canvas 2D tile columns scrolling, Tone.js notes on tap, four keys or touch.
253. **Drum Hero** `[2D]` — keyboard drum game. *Build:* Tone.js drum samples, note chart JSON, hit windows, keyboard keys per drum.
254. **Synth Runner** `[2D]` — runner synced to music. *Build:* Canvas 2D runner, Web Audio AnalyserNode beats spawn obstacles, space to jump.
255. **Melody Memory** `[2D]` — Simon says with notes. *Build:* DOM four pads, Tone.js synth notes, growing sequence array, click or keys.
256. **DJ Mixer Battle** `[2D]` — crossfade on time. *Build:* Tone.js two players with crossfader, beat-match BPM scoring, slider input.
257. **Guitar Fret Rush** `[2D]` — Guitar Hero-like. *Build:* Canvas 2D highway of five lanes, note chart, hit windows, keys 1-5 strum.
258. **Beat Saber 2D** `[2D]` — slash arrows. *Build:* Canvas 2D arrow blocks synced to beat, mouse swipe direction detection.
259. **Rhythm Dungeon** `[2D]` — move to the beat. *Build:* Canvas 2D grid dungeon, moves only valid on beat window, Web Audio clock, arrows.
260. **Sound Painter** `[2D]` — draw to compose. *Build:* Canvas 2D drawing mapped to pitch and time, Tone.js playback of strokes.
261. **Note Catcher** `[2D]` — catch falling notes. *Build:* Canvas 2D falling notes from melody, catch with basket to play them, arrow keys.
262. **Pitch Perfect** `[2D]` — match pitch with mic. *Build:* Web Audio mic AnalyserNode, autocorrelation pitch detection, Canvas pitch target line.
263. **Bass Drop Shooter** `[2D]` — beat-reactive shmup. *Build:* Canvas 2D shmup, enemy spawns and fire driven by audio FFT energy, keyboard.
264. **Loop Station** `[2D]` — build loops game. *Build:* Tone.js Transport loop tracks, recording layers, goal pattern matching, click pads.
265. **Ear Trainer** `[2D]` — identify intervals. *Build:* Tone.js plays two notes, DOM answer buttons for intervals, score streak.
266. **Tempo Jumper** `[2D]` — platformer on beat. *Build:* Phaser 3 platformer, platforms appear on beat from Tone.js Transport, arrow keys.
267. **Chord Builder** `[2D]` — puzzle with chords. *Build:* DOM piano keyboard, Tone.js chord playback, build target chords via note selection.
268. **Dance Arrows** `[2D]` — DDR-style. *Build:* Canvas 2D four arrow lanes, scrolling note chart, hit window grading, arrow keys.
269. **Music Box Puzzle** `[2D]` — set pins to play tune. *Build:* Canvas 2D rotating cylinder grid, place pins, Tone.js plays notes on rotation.
270. **Beatbox Battle** `[2D]` — record & compete. *Build:* MediaRecorder captures mic, Web Audio onset detection scores rhythm accuracy.
271. **Orchestra Conductor** `[2D]` — wave tempo. *Build:* Canvas 2D, mouse wave speed measured as tempo, Tone.js playbackRate follows.
272. **Sequencer Quest** `[2D]` — puzzles in a step sequencer. *Build:* DOM 16-step grid, Tone.js Sequence, match target pattern puzzles, click steps.
273. **Rhythm Cooking** `[2D]` — chop on beat. *Build:* Canvas 2D kitchen, ingredient prompts on beat, key presses graded by timing.
274. **Audio Visualizer Racer** `[2D]` — track from audio. *Build:* Web Audio decodes user file, FFT energy builds track curves, Canvas racer, arrows.
275. **Clap Along** `[2D]` — clap via microphone. *Build:* Web Audio mic amplitude threshold detects claps, timing vs beat clock.

## 12. Roguelike & Dungeon — *rot.js*
276. **ASCII Depths** `[2D]` — classic roguelike. *Build:* rot.js Display with ASCII tiles, Digger map generator, FOV, turn-based arrow keys.
277. **Dungeon Dice** `[2D]` — dice-based combat. *Build:* rot.js map, DOM dice tray, assign rolled dice to attacks, turn-based.
278. **Crypt Crawler** `[2D]` — turn-based crawler. *Build:* rot.js Uniform map, Scheduler for turns, A* monsters, arrow keys.
279. **Wizard's Descent** `[2D]` — spell roguelike. *Build:* rot.js map, spell list with mana, projectile line FOV, number keys to cast.
280. **Pixel Dungeon Run** `[2D]` — real-time rogue-lite. *Build:* Canvas 2D procedural rooms, real-time movement and melee hitboxes, WASD.
281. **Loot Goblin** `[2D]` — grab and escape. *Build:* rot.js map, steal treasure then guards chase via A*, exit timer, arrow keys.
282. **Card Crawl** `[2D]` — card dungeon. *Build:* DOM 3x3 card grid dungeon, weapon and shield slots, drag cards.
283. **Tower of 100 Floors** `[2D]` — climb roguelike. *Build:* rot.js generated floors, difficulty scaling per floor, permadeath, arrow keys.
284. **Shipwreck Rogue** `[2D]` — island survival rogue. *Build:* rot.js Cellular island maps, hunger and crafting, turn-based arrow keys.
285. **Necro Minions** `[2D]` — summon armies. *Build:* rot.js map, raise corpses as allied AI minions, command keys, turn-based.
286. **Hex Dungeon** `[2D]` — hex-tile rogue. *Build:* Canvas 2D axial hex dungeon, hex FOV, turn-based enemies, click or QWEASD keys.
287. **Rogue Chess** `[2D]` — chess-piece roguelike. *Build:* Canvas 2D 8x8 board rooms, player moves as chess piece, enemies chess AI.
288. **Space Derelict** `[2D]` — sci-fi rogue. *Build:* rot.js map with oxygen meter, doors and airlocks, turn-based arrow keys.
289. **One Room Dungeon** `[2D]` — single-screen rogue. *Build:* Canvas 2D single room, escalating waves, run upgrades between rooms, arrow keys.
290. **Torchlight Rogue** `[2D]` — light radius mechanic. *Build:* Canvas 2D dungeon, radial light mask with gradient, torch fuel, arrow keys.
291. **Mimic Hunt** `[2D]` — find the mimic chests. *Build:* rot.js map, chests randomly mimics, tell-tale clue system, arrow keys.
292. **Potion Brewer Rogue** `[2D]` — mix unknown potions. *Build:* rot.js map, potions with shuffled unknown effects per run, identify by use.
293. **Dungeon Builder Rogue** `[2D]` — design dungeon defense. *Build:* Canvas 2D grid, place traps and monsters, simulated hero AI invasions.
294. **Rogue Snake** `[2D]` — snake roguelike. *Build:* Canvas 2D grid snake in rooms, body length as HP, upgrades, arrow keys.
295. **Labyrinth of Minos** `[2D]` — maze rogue. *Build:* rot.js maze generator, minotaur hunts by sound, FOV, arrow keys.
296. **Cursed Relics** `[2D]` — risk-reward items. *Build:* rot.js map, relics with buffs and curse modifiers, inventory DOM, arrow keys.
297. **Rogue Archer** `[2D]` — bow combat dungeons. *Build:* Canvas 2D dungeon, mouse-aimed arrows with charge time, WASD movement.
298. **Daily Dungeon** `[2D]` — seeded daily run. *Build:* rot.js RNG seeded by date string, leaderboard via localStorage, arrow keys.
299. **Infinite Catacombs** `[2D]` — procedural endless. *Build:* rot.js chunked endless map generation, depth counter, arrow keys.
300. **Bullet Rogue** `[2D]` — bullet-hell rogue-lite. *Build:* Canvas 2D rooms with bullet patterns, upgrade pickups, WASD plus mouse.

## 13. Simulation & Management — *Canvas / Vanilla JS*
301. **City Planner Mini** `[2D]` — tiny SimCity. *Build:* Canvas 2D tile zoning, population and traffic simulation tick, click to build.
302. **Pixel Farm** `[2D]` — crops & animals. *Build:* Canvas 2D tile farm, crop growth stages and animal care, day cycle, click.
303. **Restaurant Rush** `[2D]` — serve customers. *Build:* Canvas 2D diner, customer queue with patience timers, click to serve orders.
304. **Aquarium Keeper** `[2D]` — fish tank sim. *Build:* Canvas 2D tank, fish with boids steering, water quality stats, feed button.
305. **Ant Farm Sim** `[2D]` — ant behavior. *Build:* Canvas 2D side-view soil grid, ant state machines and pheromones, click food.
306. **Traffic Light Control** `[2D]` — manage intersections. *Build:* Canvas 2D intersections, car agents queue at lights, click to toggle signals.
307. **Airport Tower** `[2D]` — guide landings. *Build:* Canvas 2D radar, plane vectors, drag paths to runways, collision warnings.
308. **Hospital Manager** `[2D]` — treat patients. *Build:* Canvas 2D hospital rooms, patient queue with diagnoses, staff assignment by drag.
309. **Theme Park Tycoon** `[2D]` — build rides. *Build:* Canvas 2D isometric tile park, visitor agents with happiness, click to build rides.
310. **Ecosystem Sim** `[2D]` — predator/prey. *Build:* Canvas 2D agents with Lotka-Volterra-style rules, population chart, parameter sliders.
311. **Space Colony** `[2D]` — manage oxygen & food. *Build:* Canvas 2D modules, oxygen and food balance per tick, DOM build panel.
312. **Pet Virtual** `[2D]` — Tamagotchi. *Build:* DOM pet sprite, hunger and happiness decaying by timestamps, localStorage, buttons.
313. **Garden Grower** `[2D]` — plant growth sim. *Build:* Canvas 2D L-system plants growing with water and light, click to tend.
314. **Train Dispatcher** `[2D]` — route trains. *Build:* Canvas 2D track graph, switches toggled by click, trains on schedules.
315. **Coffee Shop Barista** `[2D]` — make orders. *Build:* DOM recipe order tickets, click ingredient steps, timer and tips.
316. **Game Dev Story Lite** `[2D]` — make games sim. *Build:* DOM studio sim, genre/topic combos scored, staff stats, release events.
317. **Stock Market Sim** `[2D]` — trade stocks. *Build:* DOM portfolio, Canvas 2D price charts from random walk, buy/sell buttons.
318. **Bee Hive Keeper** `[2D]` — manage bees. *Build:* Canvas 2D hex hive, bee agents foraging, honey stats, click to place frames.
319. **Weather Maker** `[2D]` — control climate. *Build:* Canvas 2D map, temperature and moisture grids diffusing, slider controls.
320. **Elevator Logic** `[2D]` — program elevators. *Build:* DOM code editor, JS user script controls elevator sim, Canvas 2D shaft view.
321. **Hotel Tycoon** `[2D]` — manage rooms. *Build:* Canvas 2D hotel cross-section, guest arrivals, room cleaning tasks, click.
322. **Pizza Delivery Manager** `[2D]` — route drivers. *Build:* Canvas 2D city graph, Dijkstra routing for drivers, drag orders to drivers.
323. **Conway's Life Playground** `[2D]` — cellular sim. *Build:* Canvas 2D grid, Conway rules with double buffers, click to paint cells, play/pause.
324. **Factory Line Builder** `[2D]` — conveyor logistics. *Build:* Canvas 2D grid, conveyor tiles moving items, machine recipes, click placement.
325. **Island Survival Sim** `[2D]` — resource survival. *Build:* Canvas 2D island tiles, hunger, thirst and crafting stats, day cycle, click.

## 14. Sports — *Phaser / Three.js*
326. **Penalty Kick** `[2D]` — football shootout. *Build:* Phaser 3 goal view, swipe sets direction and curve, keeper AI dives.
327. **Basketball Hoops** `[2D]` — flick shots. *Build:* Phaser 3 arcade physics, flick gesture sets velocity, rim and net collisions.
328. **Tennis Rally** `[2D]` — 2D tennis. *Build:* Phaser 3 court, ball with shadow for height, timing-based swings, arrow keys.
329. **Bowling Strike** `[3D]` — 10-pin. *Build:* Three.js with cannon-es pins and ball, swipe to set aim and spin.
330. **Golf Pixel Tour** `[2D]` — 2D golf. *Build:* Canvas 2D side-view terrain, angle and power meter, wind, ball physics.
331. **Table Tennis Pro** `[2D]` — ping pong. *Build:* Canvas 2D top-down table, ball bounce with spin, paddle follows mouse.
332. **Archery Range** `[2D]` — wind archery. *Build:* Canvas 2D target, projectile arc with wind vector, drag-to-draw bow.
333. **Baseball Homerun Derby** `[2D]` — timing swings. *Build:* Canvas 2D pitch speed variation, swing timing window sets launch angle, space key.
334. **Hockey Air** `[2D]` — air hockey. *Build:* Canvas 2D table, circle collisions with restitution, mallet follows mouse, AI opponent.
335. **Boxing Punch-Out** `[2D]` — reflex boxing. *Build:* Canvas 2D boxer sprites, opponent tell animations, dodge and punch keys.
336. **Darts 501** `[2D]` — dart throwing. *Build:* Canvas 2D dartboard, hand sway, click to throw, 501 checkout scoring.
337. **Volleyball Beach** `[2D]` — 2v2 beach. *Build:* Phaser 3 beach court, AI teammates, jump-and-hit timing, arrow keys.
338. **Ski Jump** `[2D]` — distance jumping. *Build:* Canvas 2D ramp, takeoff timing and lean balance in flight, key input.
339. **Cricket Smash** `[2D]` — batting game. *Build:* Canvas 2D pitch, ball line and length, shot timing window, arrow keys.
340. **Curling Slide** `[2D]` — sweep stones. *Build:* Canvas 2D sheet, stone friction reduced by sweeping clicks, drag to throw.
341. **Sumo Push** `[2D]` — push out of ring. *Build:* Matter.js circular ring, sumo bodies pushing with impulses, arrow keys.
342. **Head Soccer** `[2D]` — big-head 1v1. *Build:* Phaser 3 arcade physics, big-head players and ball, jump and kick keys.
343. **Swimming Race** `[2D]` — rhythm strokes. *Build:* Canvas 2D lanes, alternate key rhythm builds speed, stamina meter.
344. **Javelin Throw** `[2D]` — angle & power. *Build:* Canvas 2D side view, angle oscillator and power meter, projectile physics.
345. **Skateboard Halfpipe** `[2D]` — tricks. *Build:* Canvas 2D halfpipe curve, momentum physics, trick key combos in air.
346. **Fencing Duel** `[2D]` — sword timing. *Build:* Canvas 2D side-view fencers, attack/parry states with timing windows, keys.
347. **Rowing Sprint** `[2D]` — key mash rowing. *Build:* Canvas 2D boats, alternating keys stroke power, rhythm bonus.
348. **Surf Wave** `[2D]` — wave riding. *Build:* Canvas 2D sine-based wave surface, board angle physics, arrow keys.
349. **Mini Football Manager** `[2D]` — pick tactics. *Build:* DOM squad and tactics UI, Canvas 2D match sim with player dots.
350. **Track & Field 100m** `[2D]` — sprint mashing. *Build:* Canvas 2D track, key mash builds speed, false-start detection.

## 15. 3D Games — *Three.js / Babylon.js*
351. **Cube Runner 3D** `[3D]` — dodge cubes. *Build:* Three.js endless corridor, cube spawns ahead, left/right steering, AABB collisions.
352. **Voxel Builder** `[3D]` — Minecraft-like sandbox. *Build:* Three.js voxel chunks with greedy meshing, raycast place/remove, PointerLockControls.
353. **Maze 3D** `[3D]` — first-person maze. *Build:* Three.js boxes from a DFS-generated maze, PointerLockControls, AABB collisions.
354. **Flight Sim Lite** `[3D]` — fly a plane. *Build:* Three.js plane with lift, drag and thrust model, heightmap terrain, keyboard.
355. **Marble Roll 3D** `[3D]` — tilt-maze marble. *Build:* Three.js maze board tilted by mouse or gyroscope, cannon-es sphere physics.
356. **Space Dogfight 3D** `[3D]` — cockpit combat. *Build:* Three.js cockpit camera, quaternion flight controls, laser raycasts, mouse and keys.
357. **Stack 3D** `[3D]` — stack slabs. *Build:* Three.js moving slab, slice overlap on click, camera rises with stack.
358. **Tank Arena 3D** `[3D]` — tank battles. *Build:* Three.js arena, tank hull and turret rotation, projectile physics, WASD plus mouse.
359. **Low-Poly Island** `[3D]` — explore an island. *Build:* Three.js simplex-noise terrain, water plane, flat-shaded low poly, WASD walk.
360. **Rubik's Cube Sim** `[3D]` — solve the cube. *Build:* Three.js 27 cubies, layer rotation via pivot group, mouse drag to turn.
361. **Dungeon FPS Retro** `[3D]` — Wolfenstein-style raycaster. *Build:* Canvas 2D raycaster with grid map and textured walls, WASD plus mouse.
362. **Helix Jump** `[3D]` — fall through helix. *Build:* Three.js rotating cylinder of platform segments, ball bounce, drag to rotate.
363. **Snow Globe Sled** `[3D]` — 3D sledding. *Build:* Three.js snowy terrain, sled sliding physics, trees obstacles, arrow keys.
364. **Bowling 3D** `[3D]` — physics bowling. *Build:* Three.js with cannon-es pins and ball, drag to aim and set power.
365. **Planet Hopper** `[3D]` — tiny planet platformer. *Build:* Three.js sphere planets, radial gravity toward center, camera follow, WASD.
366. **Ocean Sailing** `[3D]` — sail with wind. *Build:* Three.js water shader, wind direction and sail angle physics, keyboard.
367. **Drone Racer 3D** `[3D]` — FPV drone race. *Build:* Three.js FPV camera, drone rate controls, gate rings track, keyboard or gamepad.
368. **Haunted House 3D** `[3D]` — explore & escape. *Build:* Three.js dark rooms, flashlight SpotLight, PointerLockControls, puzzles and keys.
369. **Spaceship Docking** `[3D]` — dock precisely. *Build:* Three.js station port, RCS thrusters translate and rotate ship, keyboard.
370. **Cyber City Runner** `[3D]` — neon parkour. *Build:* Three.js neon city blocks, parkour runner with jump and slide, keyboard.
371. **Tower Crane 3D** `[3D]` — crane operator. *Build:* Three.js crane with cannon-es hook rope, place loads on targets, keys.
372. **Gem Mine 3D** `[3D]` — dig voxel caves. *Build:* Three.js voxel caves, raycast digging, ore types, PointerLockControls.
373. **Paper Toss 3D** `[3D]` — throw into bin. *Build:* Three.js room, paper ball arc with fan wind, swipe to throw.
374. **Dice Tower 3D** `[3D]` — physics dice. *Build:* Three.js with cannon-es dice, read top face after rest, click to roll.
375. **Solar System Explorer** `[3D]` — fly between planets. *Build:* Three.js scaled solar system, orbital motion, flight controls with warp, keyboard.

## 16. Educational & Math — *DOM / Canvas*
376. **Math Blaster** `[2D]` — shoot correct answers. *Build:* Canvas 2D asteroids labeled with answers, shoot the correct one, arrow keys.
377. **Times Table Race** `[2D]` — multiplication race. *Build:* DOM race track progress bars, typed answers advance car, timer.
378. **Fraction Pizza** `[2D]` — fraction slicing. *Build:* Canvas 2D pizza arcs, drag to slice into fractions, match orders.
379. **Geography Quiz Map** `[2D]` — click the country. *Build:* SVG world map with country paths, click hit-testing, quiz prompts.
380. **Flag Master** `[2D]` — guess flags. *Build:* DOM flag images from emoji or SVG, multiple choice buttons, streak.
381. **Periodic Table Hunt** `[2D]` — element quiz. *Build:* DOM periodic table grid, click elements matching clues, timer.
382. **Code Robot** `[2D]` — program a robot with blocks. *Build:* DOM drag-and-drop command blocks, Canvas 2D grid robot executes program.
383. **Binary Blitz** `[2D]` — convert binary fast. *Build:* DOM bit toggles or input, number conversion prompts, timer.
384. **Clock Reader** `[2D]` — tell time game. *Build:* SVG analog clock with draggable hands, answer checking.
385. **Coin Counter** `[2D]` — make change. *Build:* DOM coin buttons to make change, total check, timer.
386. **Shape Sorter** `[2D]` — geometry game. *Build:* SVG shapes, drag into matching property bins, scoring.
387. **Planet Order** `[2D]` — order solar system. *Build:* DOM draggable planet cards, order validation, facts popups.
388. **Spelling Safari** `[2D]` — kids spelling. *Build:* DOM animal pictures, letter tiles to spell names, speech synthesis.
389. **Equation Balance** `[2D]` — solve on a scale. *Build:* Canvas 2D balance scale tilting with equation sides, drag operations.
390. **History Timeline** `[2D]` — order events. *Build:* DOM event cards, drag to timeline, chronological validation.
391. **Music Notes Quiz** `[2D]` — read sheet music. *Build:* SVG staff with notes, multiple choice note names, Tone.js playback.
392. **Anatomy Puzzle** `[2D]` — place organs. *Build:* SVG body outline, drag organs to targets with snapping.
393. **Capital Cities Rush** `[2D]` — capitals quiz. *Build:* DOM country prompts, text input with fuzzy match, countdown.
394. **Prime Hunter** `[2D]` — find primes. *Build:* Canvas 2D number grid, click primes, sieve check, timer.
395. **Graph Plotter Game** `[2D]` — hit targets with functions. *Build:* Canvas 2D graph, user enters function, math.js evaluates, plot path hits targets.
396. **Logic Gates Lab** `[2D]` — build circuits. *Build:* SVG gate palette, drag wires between pins, truth table evaluation.
397. **Language Flashcards** `[2D]` — vocab game. *Build:* DOM flip cards, spaced-repetition scheduling in localStorage, keyboard answers.
398. **Chemistry Mixer** `[2D]` — combine elements. *Build:* DOM element tiles, recipe map combines into compounds, discovery log.
399. **Typing for Kids** `[2D]` — learn keyboard. *Build:* DOM on-screen keyboard highlights next key, finger guides, accuracy.
400. **Regex Golf** `[2D]` — match patterns. *Build:* DOM regex input, live match testing against two word lists, scoring.

## 17. Casual & Hyper-casual — *Canvas / Kaboom.js*
401. **Flappy Feather** `[2D]` — tap to fly. *Build:* Canvas 2D gravity and tap impulse, scrolling pipe gaps, AABB, space or click.
402. **Stack Jump** `[2D]` — perfect timing stack. *Build:* Canvas 2D moving block, overlap trimming on tap, camera up.
403. **Color Switch Ball** `[2D]` — pass matching colors. *Build:* Canvas 2D rotating color rings, ball color must match segment, tap to jump.
404. **Knife Hit** `[2D]` — throw knives at log. *Build:* Canvas 2D rotating log, stuck knives as angles, angle collision check, tap.
405. **Fruit Slicer** `[2D]` — swipe fruits. *Build:* Canvas 2D thrown fruit arcs, swipe line-circle intersection, halves particles.
406. **Doodle Jumper** `[2D]` — endless vertical jump. *Build:* Canvas 2D endless platforms, wraparound, camera up, tilt or arrow keys.
407. **Dino Run** `[2D]` — offline T-Rex runner. *Build:* Canvas 2D side runner, cactus spawner, jump and duck, space key.
408. **Ball Sort** `[2D]` — sort colored balls. *Build:* DOM tubes as stacks, move top balls if colors match, click tubes.
409. **Hole Swallow** `[3D]` — grow a black hole. *Build:* Three.js city props, hole grows as objects fall in, drag to move.
410. **Paper.io Lite** `[2D]` — claim territory. *Build:* Canvas 2D grid, trail polygon claims area via flood fill, arrow keys.
411. **Rolling Ball Sky** `[3D]` — endless roll. *Build:* Three.js endless tile path, rolling ball with gaps, left/right keys.
412. **Tap Tap Dash** `[2D]` — turn on taps. *Build:* Canvas 2D isometric path with turns, tap to rotate direction at timing.
413. **Zigzag Path** `[3D]` — tap to turn. *Build:* Three.js isometric zigzag path, ball switches direction on tap.
414. **Pop It Fidget** `[2D]` — bubble pop toy. *Build:* DOM grid of CSS bubbles, click toggles pop state with sound.
415. **Helix Spiral** `[3D]` — drop the ball. *Build:* Three.js helix tower, rotate by drag, ball falls through gaps.
416. **Draw Line Save** `[2D]` — draw to protect. *Build:* Matter.js, draw line as static body to protect character from falling hazards.
417. **Aim Trainer** `[2D]` — click targets. *Build:* DOM or Canvas targets spawn randomly, accuracy and reaction stats, click.
418. **Reaction Time** `[2D]` — reflex test. *Build:* DOM screen color change at random delay, measure performance.now click time.
419. **Bottle Flip** `[2D]` — flip timing. *Build:* Canvas 2D bottle rotation physics, hold power and release, landing check.
420. **Crowd Runner** `[3D]` — gather a crowd. *Build:* Three.js runner, gates multiply crowd count, instanced meshes, swipe.
421. **Hexa Merge** `[2D]` — merge hex tiles. *Build:* Canvas 2D hex grid, drag hex pieces, merge three adjacent same numbers.
422. **Bubble Shooter Lite** `[2D]` — match-3 bubbles. *Build:* Canvas 2D hex bubble grid, flood-fill matches, mouse aim shooter.
423. **Candy Match 3** `[2D]` — match-3 swap. *Build:* Canvas 2D 8x8 gem grid, swap and cascade match-3 algorithm, drag or click.
424. **Infinite Stairs** `[2D]` — climb stairs. *Build:* Canvas 2D stair steps, tap direction alternating, timer pressure.
425. **Whack-a-Mole** `[2D]` — classic whack. *Build:* DOM holes grid, random mole timers, click to whack, score.

## 18. Multiplayer & Party — *Socket.IO / WebRTC (PeerJS)*
426. **Agar Blobs** `[2D]` — eat & grow online. *Build:* Canvas 2D world, Socket.IO server authoritative positions, eat and grow, mouse.
427. **Draw & Guess** `[2D]` — Pictionary online. *Build:* Canvas 2D drawing strokes broadcast via Socket.IO, guess chat, turn rotation.
428. **Trivia Party** `[2D]` — live quiz rooms. *Build:* DOM quiz rooms, Socket.IO question broadcast, timed answers, leaderboard.
429. **Snake Arena IO** `[2D]` — multiplayer snake. *Build:* Canvas 2D snakes, Socket.IO server tick state sync, arrow keys.
430. **Tank Battle IO** `[2D]` — online tanks. *Build:* Canvas 2D tanks, Socket.IO input sync with interpolation, WASD and mouse.
431. **Hot Potato** `[2D]` — pass before boom. *Build:* DOM player circle, Socket.IO random timer, click to pass potato.
432. **Imposter Hunt** `[2D]` — social deduction. *Build:* Canvas 2D map, Socket.IO roles, tasks and voting UI, WASD.
433. **Speed Typing Duel** `[2D]` — real-time typing. *Build:* DOM text spans, Socket.IO broadcasts each typist progress, live WPM comparison.
434. **Battleship Online** `[2D]` — 1v1 battleship. *Build:* DOM grids, PeerJS data channel exchanges shots, turn validation.
435. **Online Chess Rooms** `[2D]` — play friends. *Build:* DOM board with chess.js, Socket.IO rooms with move relay, drag pieces.
436. **Codenames Lite** `[2D]` — word team game. *Build:* DOM 5x5 word grid, Socket.IO teams with spymaster view, click cards.
437. **Tic-Tac-Toe Live** `[2D]` — P2P matches. *Build:* DOM 3x3 grid, PeerJS P2P moves, room codes.
438. **Werewolf Village** `[2D]` — night/day roles. *Build:* DOM role cards, Socket.IO night/day phases, voting UI.
439. **Racing Lobby** `[2D]` — online kart racing. *Build:* Canvas 2D karts, Socket.IO lobby and state sync, arrow keys.
440. **Bomb Party** `[2D]` — word bomb game. *Build:* DOM syllable prompt, Socket.IO turn bomb timer, dictionary check.
441. **Pixel Canvas War** `[2D]` — r/place-like. *Build:* Canvas 2D pixel grid, Socket.IO pixel updates with cooldown, click to paint.
442. **Spaceship Co-op** `[2D]` — share ship roles. *Build:* Canvas 2D ship, Socket.IO role stations (pilot, gunner, engineer), keys.
443. **Rock Paper Scissors League** `[2D]` — ranked RPS. *Build:* DOM choice buttons, Socket.IO matchmaking queue, Elo rating ladder stored server-side.
444. **Fishbowl Charades** `[2D]` — party charades. *Build:* DOM word bowl, Socket.IO round timer, team scoring.
445. **Pong Online** `[2D]` — P2P pong. *Build:* Canvas 2D pong, PeerJS host-authoritative ball, W/S keys.
446. **Capture the Flag 2D** `[2D]` — team CTF. *Build:* Canvas 2D team map, Socket.IO flag state, tagging, WASD.
447. **Dice Liar** `[2D]` — Liar's Dice. *Build:* DOM dice cups, Socket.IO bids and challenges, hidden dice per player.
448. **Hide & Seek Shadows** `[2D]` — hide in dark map. *Build:* Canvas 2D dark map, light radius visibility, Socket.IO hider/seeker roles.
449. **Cooking Chaos Co-op** `[2D]` — Overcooked-like. *Build:* Canvas 2D kitchen, Socket.IO shared order queue, interact keys.
450. **Couch Party Pack** `[2D]` — local multi-controller minigames. *Build:* Canvas 2D minigames, Gamepad API for multiple local controllers.

## 19. Adventure & Narrative — *Ink.js / Twine / Phaser*
451. **Lost in the Library** `[2D]` — text adventure. *Build:* DOM text output, Ink.js story with inventory variables, choice buttons.
452. **Detective Noir** `[2D]` — clue-solving story. *Build:* DOM clue board, Ink.js branches, deduction checks, click choices.
453. **Escape Room: Lab** `[2D]` — point & click escape. *Build:* Canvas 2D or DOM room scenes, hotspot clicks, inventory combine puzzles.
454. **Space Station Mystery** `[2D]` — sci-fi narrative. *Build:* DOM narrative, Ink.js knots for station areas, choice buttons.
455. **Dragon's Choice** `[2D]` — branching fantasy. *Build:* DOM passages, Twine-style story graph with variables, branching endings, choice buttons.
456. **The Haunted Inn** `[2D]` — horror text adventure. *Build:* DOM text, Ink.js horror with sanity variable, ambient Web Audio.
457. **Pirate Island Quest** `[2D]` — point & click. *Build:* Phaser 3 scenes, hotspot clicks, dialog trees, inventory.
458. **Time Traveler's Diary** `[2D]` — choose-your-path. *Build:* DOM diary pages, Ink.js time-period branches, choice buttons.
459. **Zork-like Caverns** `[2D]` — parser adventure. *Build:* DOM terminal, text parser for verb-noun commands, room graph.
460. **Visual Novel Café** `[2D]` — dating-sim story. *Build:* DOM character sprites, dialog with affection variables, choice buttons.
461. **Mystery Mansion** `[2D]` — find the culprit. *Build:* DOM mansion room map, clue collection inventory, accusation logic against suspect data.
462. **Survival Diary** `[2D]` — day-by-day choices. *Build:* DOM day cards, food and morale resource variables, choice buttons change outcomes.
463. **Kingdom Reigns** `[2D]` — swipe-left decision game. *Build:* DOM card swipe with Hammer-like touch, four faction meters, card deck.
464. **Hacker Terminal** `[2D]` — fake-OS hacking story. *Build:* DOM fake terminal, command parser with virtual filesystem, story triggers.
465. **Lighthouse Keeper** `[2D]` — atmospheric story. *Build:* Canvas 2D lighthouse scene, day/night cycle, Ink.js story beats.
466. **Spy Codebreaker** `[2D]` — narrative ciphers. *Build:* DOM cipher puzzles (Caesar, Vigenère), Ink.js story progression.
467. **Ghost Detective** `[2D]` — talk to spirits. *Build:* DOM scene images, Ink.js spirit dialogue trees, evidence inventory, choice buttons.
468. **Alien First Contact** `[2D]` — dialogue puzzles. *Build:* DOM alien symbol language, deduce meanings via dialogue puzzles.
469. **Dungeon Master AI** `[2D]` — procedural quests. *Build:* DOM, procedural quest generator from templates, choice buttons.
470. **Courtroom Objection** `[2D]` — legal deduction. *Build:* DOM testimony statements, present evidence to contradictions, click.
471. **Letters from War** `[2D]` — epistolary story. *Build:* DOM letter pages, Ink.js reply choices shaping story.
472. **Murder on the Express** `[2D]` — whodunit. *Build:* DOM train cars, interview suspects, clue notebook, accusation.
473. **Wizard School Year** `[2D]` — life-sim story. *Build:* DOM weekly calendar, stat-raising activity picks, Ink.js random events, choice buttons.
474. **Desert Caravan** `[2D]` — Oregon-Trail-like. *Build:* Canvas 2D travel map, supply and health events, DOM choices.
475. **Dream Walker** `[2D]` — surreal exploration. *Build:* Canvas 2D or WebGL surreal scenes, shader distortion, point-and-click exploration.

## 20. Experimental, Retro & Art — *WebGL / p5.js / Shaders*
476. **Shader Maze** `[2D]` — GPU-rendered maze. *Build:* WebGL fragment shader raymarches maze from SDF, WASD uniforms.
477. **Particle Painter** `[2D]` — interactive particles. *Build:* p5.js particle system, mouse attraction and color modes.
478. **Gravity Sandbox** `[2D]` — n-body toy. *Build:* Canvas 2D n-body gravity with Verlet integration, click to spawn bodies.
479. **Fractal Diver** `[2D]` — zoom Mandelbrot game. *Build:* WebGL Mandelbrot shader, zoom to targets, mouse wheel.
480. **Pixel Art Puzzle** `[2D]` — color by number. *Build:* DOM or Canvas grid with numbered cells, palette click to fill.
481. **ASCII Racer** `[2D]` — text-mode racing. *Build:* DOM pre text grid, pseudo-3D ASCII road, arrow keys.
482. **Boids Flock Herder** `[2D]` — herd a flock. *Build:* p5.js boids flocking rules, mouse acts as herding repulsor.
483. **Webcam Dodge** `[2D]` — dodge with your body (TensorFlow.js). *Build:* TensorFlow.js pose detection on webcam, Canvas 2D obstacles to dodge.
484. **Hand Gesture Ninja** `[2D]` — slice via webcam. *Build:* MediaPipe Hands tracking on webcam, Canvas fruit slicing.
485. **Voice Command Pilot** `[2D]` — steer by voice. *Build:* Web Speech API recognition commands steer ship, Canvas 2D.
486. **Tilt Maze Mobile** `[2D]` — device orientation maze. *Build:* Canvas 2D maze, DeviceOrientation API tilt rolls ball.
487. **Infinite Terrain Walk** `[3D]` — Perlin landscape. *Build:* Three.js chunked Perlin noise terrain, WASD walk, fog.
488. **One-Button Wonder** `[2D]` — single-input game. *Build:* Canvas 2D, single key/tap controls, mechanic changes each level.
489. **Glitch Runner** `[2D]` — corrupted-visual runner. *Build:* Canvas 2D runner with glitch shader effects, pixel displacement.
490. **Shadow Puppet** `[2D]` — light & shadow puzzle. *Build:* Canvas 2D light source, shadow casting via ray polygons, rotate objects.
491. **Kaleidoscope Match** `[2D]` — symmetry puzzle. *Build:* Canvas 2D radial symmetry drawing, match target pattern.
492. **Mirror World** `[2D]` — reflection-based puzzle. *Build:* Canvas 2D two mirrored halves, player moves reflect, puzzle goals.
493. **1-Bit Adventure** `[2D]` — two-color game. *Build:* Canvas 2D two-color palette, tile map adventure, arrow keys.
494. **Tiny Code Golf Game** `[2D]` — 1KB JS game. *Build:* Canvas 2D in under 1KB JS, minified with Terser.
495. **Generative Garden** `[2D]` — grow procedural plants. *Build:* p5.js L-system plants grow procedurally, click to plant seeds.
496. **Sound Wave Surfer** `[2D]` — ride audio waveforms. *Build:* Web Audio AnalyserNode waveform as terrain, Canvas 2D surfer, arrows.
497. **Black & White Inversion** `[2D]` — switch world colors. *Build:* Canvas 2D two-color tiles, invert key swaps solidity, platformer physics.
498. **Paint Splat Arena** `[2D]` — paint coverage battle. *Build:* Canvas 2D paint grid coverage, splat projectiles, WASD plus mouse.
499. **Lo-Fi Fishing** `[2D]` — chill pixel fishing. *Build:* Canvas 2D pixel art, fishing timing minigame, lo-fi audio loop.
500. **Endless Ocean Dive** `[3D]` — calm procedural deep-sea dive. *Build:* Three.js underwater fog, procedural creatures and terrain, swim controls.

## 21. Space & Sci-Fi — *Phaser 3 / Three.js*
501. **Orbital Slingshot** `[2D]` — fling probes around planet gravity. *Build:* Canvas 2D, Euler-integrated inverse-square gravity, drag-to-aim launch vector, trajectory preview dots.
502. **Nebula Harvester** `[3D]` — scoop gas clouds, dodge pirates. *Build:* Three.js Points nebula, ship with WASD thrust, sphere-distance pickups, simple pursuit AI.
503. **Airlock Panic** `[2D]` — seal breaches before oxygen fails. *Build:* DOM grid of rooms, random breach timers, per-room O2 meters, click doors to seal.
504. **Ring World Relay** `[3D]` — run packets around a ringworld. *Build:* Three.js TorusGeometry interior, camera follows runner along angle parameter, lane-switch keys.
505. **Comet Tail Surfer** `[2D]` — ride ion tails between moons. *Build:* Phaser 3 particle tails as spline paths, hold key to grip, release to jump.
506. **Starlane Cartographer** `[2D]` — chart warp routes, avoid anomalies. *Build:* Canvas graph of star nodes, click edges to build route, Dijkstra fuel cost check.
507. **Moonbase Bricklayer** `[2D]` — stack modules on low gravity. *Build:* Matter.js with low gravity, drop modules from swinging crane, height-based scoring.
508. **Quasar Quarterback** `[2D]` — pass energy orbs past defenders. *Build:* Phaser 3 top-down field, mouse-aimed lob arcs, defender steering behaviors, receiver routes.
509. **Derelict Salvage Crew** `[3D]` — strip hulls before reactor blows. *Build:* Three.js corridor rooms, raycast click to salvage parts, countdown timer, weight inventory.
510. **Solar Sail Regatta** `[2D]` — tack against stellar winds. *Build:* Canvas 2D, wind vector field, sail angle via mouse, thrust from dot product.
511. **Wormhole Weaver** `[2D]` — link portals to route freighters. *Build:* Canvas 2D grid, place portal pairs, freighters follow pathfinding, teleport on overlap.
512. **Crater Golf** `[3D]` — putt across cratered asteroids. *Build:* Three.js displaced sphere mesh, cannon-es ball physics, drag power meter, radial gravity.
513. **Ion Storm Courier** `[2D]` — deliver mail through static storms. *Build:* Phaser 3 side-scroller, lightning hazard telegraphs, timed delivery checkpoints, arrow-key thrust.
514. **Exoplanet Botanist** `[2D]` — grow alien plants, balance atmosphere. *Build:* DOM sim panel, plant L-systems drawn on Canvas, gas percentages updated per tick.
515. **Hyperjump Calculator** `[2D]` — plot jumps with fuel math. *Build:* DOM puzzle, coordinate vectors, player inputs jump distances, validate fuel equation per jump.
516. **Gravity Tether Tug** `[2D]` — tow drifting cargo to dock. *Build:* Matter.js distance constraint tether, thruster forces on keys, dock sensor bodies.
517. **Satellite Juggler** `[2D]` — keep satellites from colliding. *Build:* Canvas 2D circular orbits, click to change orbit radius, circle collision checks.
518. **Red Giant Escape** `[3D]` — outrun an expanding star. *Build:* Three.js shader-glow sphere scaling over time, ship dodges debris, boost meter.
519. **Pulsar Pinball** `[2D]` — pinball bumpers powered by pulsars. *Build:* Matter.js table, flipper hinge constraints, pulsing bumpers modulate restitution on timer.
520. **Cryo Pod Shuffle** `[2D]` — wake crew in the right order. *Build:* DOM logic puzzle, dependency constraints between crew, drag to reorder, validate sequence.
521. **Alien Phrasebook** `[2D]` — decode glyphs to trade peacefully. *Build:* DOM glyph cards, substitution-cipher dictionary, player hypotheses tracked, trade dialogue tree.
522. **Meteor Shield Weaver** `[2D]` — draw shields to deflect rocks. *Build:* Canvas 2D, mouse-drawn line segments as walls, reflect meteor velocity on intersection.
523. **Mothership Tetris** `[2D]` — fit fighters into hangar bays. *Build:* Canvas polyomino packing, rotate with R, grid occupancy array, bay fill scoring.
524. **Black Hole Bakery** `[2D]` — bake cookies near event horizon. *Build:* DOM idle bakery, time dilation multiplier by orbit slider, upgrade shop, localStorage save.
525. **Lone Beacon** `[3D]` — relight relays across dark sector. *Build:* Three.js fog-heavy space, PointLight per relay, minimal HUD compass, WASD drift controls.

## 22. Underwater & Ocean — *PixiJS / Three.js*
526. **Coral Architect** `[2D]` — rebuild reefs, attract fish. *Build:* PixiJS tile placement, coral types boost fish spawn rates, boids fish flocking.
527. **Bathysphere Descent** `[3D]` — dive deep, manage pressure. *Build:* Three.js vertical shaft, depth-based fog density, pressure gauge, cable winch keys.
528. **Kelp Forest Hideout** `[2D]` — sneak past sharks in kelp. *Build:* PixiJS stealth, shark vision cones via raycasts, kelp swaying sprites as cover.
529. **Pearl Diver's Breath** `[2D]` — hold breath, grab pearls. *Build:* Canvas 2D swim physics, breath meter depletes, click oysters timing-open minigame.
530. **Octopus Escape Artist** `[2D]` — squeeze through tank pipes. *Build:* Matter.js soft-body ring of circles, squeeze key shrinks constraints, pipe level layouts.
531. **Anglerfish Lure** `[2D]` — lure prey in the dark. *Build:* Canvas 2D radial-gradient light mask, mouse moves lure, prey attraction steering.
532. **Tidepool Tinkerer** `[2D]` — rearrange rocks to save critters. *Build:* Canvas grid puzzle, sliding rocks, water fill flood algorithm per tide step.
533. **Whale Song Echo** `[2D]` — repeat whale call patterns. *Build:* Tone.js synthesized calls, Simon-style sequence memory, keyboard or click pitch pads.
534. **Shipwreck Sonar** `[2D]` — ping sonar to map wrecks. *Build:* Canvas 2D hidden tilemap, radial ping reveals tiles via raycast, minesweeper-style deduction.
535. **Jellyfish Drift** `[2D]` — pulse gently through currents. *Build:* PixiJS, click to pulse impulse, Perlin-noise current field, hazards to avoid.
536. **Seahorse Courier** `[2D]` — carry eggs through crowded reef. *Build:* Phaser 3 side-scroller, slow floaty controls, egg count lost on collision.
537. **Hermit Crab Housing** `[2D]` — swap shells as you grow. *Build:* Canvas 2D top-down, size stat, shell pickups with size ranges, predator chase AI.
538. **Plankton Bloom** `[2D]` — feed plankton, grow food chain. *Build:* Canvas 2D ecosystem sim, Lotka-Volterra population update, sliders for nutrients.
539. **Manta Glide** `[3D]` — glide and loop through rays. *Build:* Three.js open water, mouse-steered pitch/yaw, ring checkpoints, caustics texture on seabed.
540. **Abyssal Lantern** `[2D]` — light trenches without startling beasts. *Build:* Canvas 2D light radius toggle, beasts with alert meters, noise-based stealth.
541. **Submarine Sardines** `[2D]` — pack sub crews efficiently. *Build:* DOM grid bunk puzzle, crew shift constraints, drag-drop placement, conflict highlighting.
542. **Barnacle Battle** `[2D]` — cling and defend hull territory. *Build:* Canvas hex grid territory, spread rules like Go, simple minimax AI.
543. **Riptide Rescue** `[2D]` — pull swimmers from rip currents. *Build:* Phaser 3 top-down beach, flow field currents, rescue boat with arrow keys.
544. **Dolphin Ring Toss** `[2D]` — flip through hoops for combos. *Build:* Phaser 3 arcade physics, jump out of water, rotate in air for trick points.
545. **Sea Turtle Homecoming** `[2D]` — hatchlings race to surf. *Build:* Canvas 2D, click to steer multiple hatchlings, gull dive attacks, count survivors.
546. **Clownfish Anemone Swap** `[2D]` — match fish to anemones. *Build:* DOM match-3 variant, swap adjacent tiles, cascade resolution, combo multiplier.
547. **Bubble Net Feast** `[2D]` — circle bubbles to trap fish. *Build:* Canvas 2D mouse-drawn loop, polygon point-in-test captures fish, timed rounds.
548. **Narwhal Joust** `[3D]` — tusk-duel beneath sea ice. *Build:* Three.js arena under ice plane, two-player local keys, capsule collisions, knockback.
549. **Deep Vent Colony** `[2D]` — build habitat by thermal vents. *Build:* Canvas tile city builder, heat and power resource graph, tick-based economy.
550. **Squid Ink Getaway** `[2D]` — ink clouds to evade predators. *Build:* PixiJS, spacebar spawns ink sprites blocking predator line-of-sight raycasts.

## 23. Medieval Fantasy — *Phaser 3 / Three.js*
551. **Moat & Drawbridge** `[2D]` — time drawbridges for armies. *Build:* Phaser 3 lane sim, click bridges to raise/lower, enemy and ally unit queues.
552. **Scribe of Runes** `[2D]` — trace runes to cast spells. *Build:* Canvas 2D gesture capture, $1 Unistroke recognizer, spell effects on enemies.
553. **Dragon Egg Smuggler** `[2D]` — sneak eggs past castle guards. *Build:* Phaser 3 top-down stealth, patrol waypoints, vision cone polygons, egg carry slows.
554. **Alchemist's Cauldron** `[2D]` — mix reagents by color theory. *Build:* DOM drag ingredients, RGB blending math, target color tolerance scoring.
555. **Joust of Thorns** `[3D]` — timing-based lance tournament. *Build:* Three.js tiltyard, charging camera, timing meter for lance aim, hit zone scoring.
556. **Wandering Bard** `[2D]` — play lute to calm crowds. *Build:* Tone.js plucked synth, note highway rhythm input, crowd mood meter.
557. **Fief & Famine** `[2D]` — manage peasants through winters. *Build:* DOM turn-based management, seasonal events table, grain storage and morale formulas.
558. **Goblin Tollbooth** `[2D]` — charge travelers, spot cheaters. *Build:* DOM papers-please style inspection, rule list per day, accept/deny buttons.
559. **Enchanted Forge** `[2D]` — hammer blades with rhythm strikes. *Build:* Canvas 2D heat bar, click in timing window, blade quality from accuracy.
560. **Griffin Post** `[3D]` — deliver scrolls by griffin flight. *Build:* Three.js low-poly terrain heightmap, flight controls with mouse, delivery markers.
561. **Witch's Broom Derby** `[3D]` — race brooms through spires. *Build:* Three.js track of ring gates, CatmullRom AI paths, boost on perfect rings.
562. **Troll Bridge Riddles** `[2D]` — answer riddles to cross. *Build:* DOM text adventure, riddle JSON bank, fuzzy answer matching, lives system.
563. **Castle Siege Ladders** `[2D]` — climb walls, dodge oil. *Build:* Phaser 3 vertical climber, lane switching, falling hazard spawner, ladder segments.
564. **Unicorn Stable Hand** `[2D]` — groom and train unicorns. *Build:* DOM pet sim, stat decay timers, brush minigame on Canvas, localStorage saves.
565. **Heraldry Designer** `[2D]` — craft crests, match noble requests. *Build:* SVG layered shield editor, tinctures and charges, rule checker for requests.
566. **Catacomb Torchbearer** `[2D]` — light path for the party. *Build:* rot.js dungeon map, FOV light radius, torch fuel, party follows A* path.
567. **Fairy Ring Dance** `[2D]` — step in mushroom circle patterns. *Build:* Canvas 2D circle of pads, sequence memory with arrow keys, speeding tempo.
568. **Mead Hall Brawl** `[3D]` — bar-fight arena with chairs. *Build:* Three.js with cannon-es throwable props, ragdoll-lite knockback, local multiplayer keys.
569. **Wizard Duel Glyphs** `[2D]` — draw gestures to counter spells. *Build:* Canvas gesture recognizer, rock-paper-scissors spell matrix, AI casting timer.
570. **Tavern Keeper's Night** `[2D]` — serve adventurers before riot. *Build:* Phaser 3 click-serve tables, patience bars, order queue, tips economy.
571. **Elven Archery Trial** `[3D]` — wind-aware longbow targets. *Build:* Three.js range, projectile arc with wind vector, mouse draw-and-release aim.
572. **Royal Taster** `[2D]` — detect poison by clues. *Build:* DOM deduction puzzle, symptom clue cards, logic-grid notes, choose dish to taste.
573. **Squire's Errands** `[2D]` — fetch quests on a timer. *Build:* Phaser 3 town tilemap, quest list, routing optimization against countdown.
574. **Dragon Hoard Sorter** `[2D]` — sort treasure before dragon wakes. *Build:* DOM drag-sort into chests, noise meter rises on mistakes, timer.
575. **Knightfall Chess** `[2D]` — chess where pieces level up. *Build:* DOM board, chess.js move validation, XP on captures unlocking extra moves.

## 24. Pirates & Seafaring — *Phaser 3 / Three.js*
576. **Plank Walkers** `[2D]` — push rivals off plank. *Build:* Matter.js plank on pivot, local two-player shove keys, balance physics.
577. **Treasure Map Tear** `[2D]` — piece together torn maps. *Build:* Canvas jigsaw with irregular polygon pieces, snapping by edge matching, rotate.
578. **Broadside Barrage** `[2D]` — angle cannons between swells. *Build:* Canvas 2D sine-wave sea, projectile physics, ship bob affects launch angle.
579. **Parrot Translator** `[2D]` — decode parrot squawk messages. *Build:* Web Audio squawk patterns, mapping to letters, cipher-solving DOM interface.
580. **Crow's Nest Lookout** `[3D]` — spot sails in fog. *Build:* Three.js FogExp2 ocean, spyglass zoom via FOV change, click to identify ships.
581. **Kraken Tug-of-War** `[2D]` — free ship from tentacles. *Build:* Canvas 2D button-mash meters per tentacle, cutlass click targets, health bars.
582. **Rum Barrel Roll** `[2D]` — roll barrels down ramps. *Build:* Matter.js circle bodies, draggable ramps placement puzzle, goal sensor.
583. **Message in a Bottle** `[2D]` — follow bottle clue trail. *Build:* DOM point-and-click map, clue inventory, ocean current riddles, branching ending.
584. **Mutiny Vote** `[2D]` — sway crew before captain notices. *Build:* DOM social sim, crew opinion graph, actions modify trust, suspicion meter.
585. **Lighthouse Smugglers** `[2D]` — sneak cargo past beams. *Build:* Canvas 2D rotating beam cone intersection test, boat stealth, cargo delivery.
586. **Grog Shop Haggle** `[2D]` — barter goods for profit. *Build:* DOM trading UI, port price tables with random drift, haggle offer acceptance curve.
587. **Rigging Climber** `[2D]` — climb ropes during storm. *Build:* Phaser 3 vertical rope network, wind gusts push player, lightning hazards.
588. **Compass Rose Drift** `[3D]` — steer by shifting winds. *Build:* Three.js Water shader, sail trim and rudder keys, wind direction changes, island waypoints.
589. **Doubloon Divers** `[2D]` — dive wrecks for coins. *Build:* Phaser 3 platformer underwater, air pockets, coin collection, eel patrols.
590. **Cutlass & Cards** `[2D]` — card battler with swordplay. *Build:* DOM deckbuilder, card JSON data, energy per turn, enemy intent display.
591. **Galleon Builder** `[3D]` — design hull, test seaworthiness. *Build:* Three.js modular ship parts, buoyancy calculation from volume, stormy test voyage.
592. **Port Royal Bounty** `[2D]` — hunt pirates for rewards. *Build:* Phaser 3 top-down naval map, wanted list, broadside combat, upgrade shop.
593. **Siren Strait** `[2D]` — resist siren calls, keep course. *Build:* Canvas 2D, rhythm prompts counter siren pull force on ship steering.
594. **Anchor Drop Precision** `[2D]` — anchor in tiny coves. *Build:* Canvas 2D drift physics, momentum stopping, drop anchor key, distance scoring.
595. **Pirate Cook's Galley** `[2D]` — feed crew rationed meals. *Build:* DOM resource puzzle, crew preferences and morale, limited pantry over voyage days.
596. **Skull Island Dig** `[2D]` — dig X marks, avoid traps. *Build:* Canvas grid with hidden traps, number hints like Minesweeper, shovel clicks.
597. **Fog Bank Phantom** `[3D]` — chase ghost ship through fog. *Build:* Three.js volumetric fog planes, audio panning cues, chase pursuit steering.
598. **Cannonball Bowling** `[3D]` — knock barrels with cannonballs. *Build:* Three.js with cannon-es rigid bodies, aim-and-power launch, barrel pin setups.
599. **Sea Shanty Sync** `[2D]` — sing shanties to row faster. *Build:* Tone.js beat track, press keys on downbeats, boat speed from accuracy.
600. **Peg Leg Parkour** `[2D]` — hop deck obstacles one-legged. *Build:* Phaser 3 runner, hop-only jumps, rolling deck tilt shifts gravity vector.

## 25. Wild West — *Kaboom.js / Three.js*
601. **High Noon Reflex** `[2D]` — draw fastest at duel. *Build:* Kaboom.js, random delay signal, measure reaction ms, false-start penalty.
602. **Tumbleweed Tumble** `[2D]` — ride wind across desert. *Build:* Matter.js circle body, wind gust forces, cactus obstacles, distance score.
603. **Stagecoach Guard** `[3D]` — shoot bandits from coach roof. *Build:* Three.js rail shooter along spline, raycast mouse shooting, bandit spawn waves.
604. **Lasso Loop** `[2D]` — rope runaway cattle. *Build:* Kaboom.js, mouse swing circle builds power, throw rope arc, collision catch.
605. **Saloon Piano Man** `[2D]` — keep tune during brawl. *Build:* Tone.js piano, falling notes rhythm input, dodge thrown bottles with mouse.
606. **Gold Pan Shaker** `[2D]` — shake pans to find nuggets. *Build:* Canvas 2D particles sim of sand, mouse shake motion, density separation.
607. **Railroad Spike Race** `[2D]` — lay track before rival. *Build:* Canvas grid path-building, terrain costs, rival AI using A*, race to station.
608. **Sheriff's Wanted Board** `[2D]` — match posters to outlaws. *Build:* DOM face composite generator, feature matching, timed crowd lineup.
609. **Cactus Water Trek** `[2D]` — survive desert crossing. *Build:* rot.js map, water and heat stats, cactus harvesting, day-night cycles.
610. **Bucking Bronco** `[2D]` — stay mounted eight seconds. *Build:* Canvas 2D balance meter, opposing mouse movement to counter random tilts.
611. **Boomtown Builder** `[2D]` — grow a frontier town. *Build:* Canvas isometric tile builder, resource flows, population happiness formula.
612. **Canyon Echo** `[2D]` — bounce shots off canyon walls. *Build:* Canvas 2D ray reflection math, limited bullets, puzzle levels hitting targets.
613. **Train Heist Timing** `[3D]` — leap between moving cars. *Build:* Three.js moving train segments, third-person jump physics, tunnel hazards.
614. **Snake Oil Salesman** `[2D]` — pitch tonics to skeptics. *Build:* DOM dialogue, crowd belief meters, choice cards with persuasion stats.
615. **Horseshoe Toss** `[3D]` — classic toss with wind. *Build:* Three.js with cannon-es, spin and power swipe input, ringer scoring.
616. **Dust Devil Dodge** `[2D]` — avoid swirling twisters. *Build:* Kaboom.js top-down, twisters with vortex pull forces, collect supplies.
617. **Bounty Trail Tracker** `[2D]` — follow hoofprints and clues. *Build:* Canvas scrolling map, procedural track trails, clue deduction, ambush events.
618. **Telegraph Tapper** `[2D]` — send Morse before deadline. *Build:* Web Audio beep, spacebar dot/dash timing, Morse decoding lookup table.
619. **Coyote Night Watch** `[2D]` — guard chickens from coyotes. *Build:* Canvas 2D flashlight cone, coyote approach AI, scare by spotlight.
620. **Prairie Dog Pop-Up** `[2D]` — click popping prairie dogs. *Build:* DOM hole grid, randomized pop timers, decoy snakes, combo multiplier.
621. **Mine Cart Mayhem** `[3D]` — switch rails in collapsing mine. *Build:* Three.js tunnel track graph, junction switches by key, cave-in timers.
622. **Rodeo Clown Rescue** `[2D]` — distract bulls from riders. *Build:* Phaser 3 arena, bull charge AI targeting nearest, barrel hide zones.
623. **Ghost Town Showdown** `[2D]` — duel phantom gunslingers. *Build:* Kaboom.js, gesture-based draw patterns, enemy tells, escalating speed.
624. **Wagon Wheel Repair** `[2D]` — fix spokes under pressure. *Build:* Canvas rotating wheel, click empty spoke slots, hammer timing minigame.
625. **Campfire Tall Tales** `[2D]` — branching stories by firelight. *Build:* Ink.js narrative, Canvas fire particles, choices affect ending tally.

## 26. Cyberpunk — *PixiJS / Three.js*
626. **Neon Courier** `[3D]` — parkour deliveries across rooftops. *Build:* Three.js city blocks, first-person movement with wall-run, delivery timer markers.
627. **Firewall Breach** `[2D]` — hack nodes before trace completes. *Build:* DOM node graph, BFS reachable paths, trace timer, hack minigames.
628. **Chrome Clinic** `[2D]` — install implants, avoid rejection. *Build:* DOM body diagram, compatibility stats, risk probability rolls, patient queue.
629. **Data Smuggler** `[2D]` — hide files from scanners. *Build:* Canvas grid packing, scanner sweeps reveal tiles, stealth placement puzzle.
630. **Rainy Alley Detective** `[3D]` — noir investigation with drones. *Build:* Three.js alley scene, rain particles, drone camera clue scanning, deduction board.
631. **Megacorp Elevator** `[2D]` — sneak up corporate tower floors. *Build:* Phaser 3 floor layouts, guard patrols, elevator timing between floors.
632. **Glitch Graffiti** `[2D]` — tag walls, dodge security drones. *Build:* PixiJS, hold to spray paint mask, drone patrol paths, escape routes.
633. **Synth Noodle Stand** `[2D]` — serve ramen to android clientele. *Build:* DOM order assembly, ingredient queue, patience meters, upgrade shop.
634. **Drone Swarm Pilot** `[3D]` — command micro-drone formations. *Build:* Three.js boids flocking, formation shapes via keys, obstacle course.
635. **Black Market Bazaar** `[2D]` — trade hot tech for profit. *Build:* DOM trading sim, fluctuating prices, heat level from police, inventory capacity.
636. **Memory Shard Broker** `[2D]` — piece together stolen memories. *Build:* DOM fragment ordering puzzle, timeline drag, reveal narrative via Ink.js.
637. **Holo Billboard Hijack** `[2D]` — rewrite ads with puzzles. *Build:* Canvas pixel-grid nonogram, glitch shader overlay, timer before reset.
638. **Netrunner Maze** `[3D]` — navigate shifting cyberspace grids. *Build:* Three.js wireframe maze, regenerate walls with Prim's algorithm, WASD navigation.
639. **Street Samurai Dash** `[2D]` — slice through gang ambushes. *Build:* PixiJS dash-attack to mouse point, slow-motion aiming, enemy waves.
640. **Augment Arena** `[2D]` — fight using swappable limbs. *Build:* Phaser 3 arena brawler, limb slots modify attack stats, wave survival.
641. **Vending Machine Heist** `[2D]` — crack AI vending machines. *Build:* DOM logic puzzle, code-breaking with Mastermind feedback, alarm escalation.
642. **Maglev Surfer** `[3D]` — ride atop maglev trains. *Build:* Three.js endless track lanes, procedural obstacle spawning, jump and duck controls.
643. **Password Phantom** `[2D]` — guess passwords from social clues. *Build:* DOM fake social profiles, clue-based password guessing, attempt counter.
644. **Corporate Ladder Climb** `[2D]` — vertical climber of office floors. *Build:* Kaboom.js vertical platformer, falling papers hazards, coworker NPCs.
645. **Blackout District** `[2D]` — restore power to city blocks. *Build:* Canvas grid pipe-rotation puzzle, power flow via BFS, block lighting.
646. **Facial Recog Dodge** `[2D]` — disguise past camera grids. *Build:* Phaser 3 stealth, camera detection meters, disguise items swap appearance tags.
647. **Ripperdoc Rush** `[2D]` — fix patients' faulty cyberware. *Build:* Canvas operation minigame, steady hand mouse path tracking, time limit.
648. **Signal Jammer** `[2D]` — block surveillance waves rhythmically. *Build:* Tone.js beats, waves approach lanes, key press timing to jam.
649. **Neural Link Sync** `[2D]` — match brainwave patterns. *Build:* Canvas sine-wave matching, adjust frequency and amplitude sliders, sync threshold.
650. **Undercity Rail** `[2D]` — manage metro lines below slums. *Build:* Canvas line-drawing between stations, passenger spawning, train capacity sim.

## 27. Post-Apocalyptic — *Phaser 3 / Three.js*
651. **Wasteland Scavenger** `[2D]` — loot ruins, manage weight. *Build:* rot.js procedural ruins, grid inventory weight limits, scavenger encounters.
652. **Rad Storm Shelter** `[2D]` — reinforce bunker before storm. *Build:* DOM resource allocation, storm countdown, wall integrity values per room.
653. **Water Purifier** `[2D]` — route filters for clean water. *Build:* Canvas pipe network puzzle, contamination values reduced per filter node.
654. **Rust Bucket Racer** `[3D]` — build buggy from junk. *Build:* Three.js with cannon-es RaycastVehicle, part stats editor, desert track.
655. **Mutant Garden** `[2D]` — grow strange crops safely. *Build:* Canvas grid farming, mutation probability per crop pair, harvest timers.
656. **Bunker Ration Plan** `[2D]` — feed survivors fairly. *Build:* DOM daily allocation sliders, health and morale formulas, random events.
657. **Caravan Guard** `[2D]` — protect convoy across wastes. *Build:* Phaser 3 escort defense, raider waves, turret placement on wagons.
658. **Broken Radio Signals** `[2D]` — tune radio for survivors. *Build:* Web Audio noise plus voice tones, dial frequency matching, story unlocks.
659. **Scrapyard Tower** `[2D]` — stack junk into watchtower. *Build:* Matter.js irregular polygons, drop stacking, wind gusts, height goals.
660. **Last Library** `[2D]` — save books from fire. *Build:* Canvas fire cellular automaton spread, carry books to exit, value scoring.
661. **Fallout Forager** `[2D]` — identify safe mushrooms. *Build:* DOM field guide traits, procedural mushroom features, identification deduction.
662. **Concrete Jungle Climb** `[3D]` — climb overgrown skyscrapers. *Build:* Three.js tower with ledge grab points, stamina meter, third-person camera.
663. **Gas Mask Breather** `[2D]` — manage filters through fog. *Build:* Phaser 3 platformer, filter timer, fog density zones, breath-hold mechanic.
664. **Dust Bowl Farmer** `[2D]` — farm through drought cycles. *Build:* DOM turn sim, rainfall random table, soil moisture model, crop choice.
665. **Settlement Council** `[2D]` — vote decisions for survival. *Build:* DOM card events, faction approval meters, Reigns-style swipes.
666. **Road Warrior Lanes** `[3D]` — swerve wrecks at speed. *Build:* Three.js endless highway, lane-based dodging, ramming enemy cars, fuel pickups.
667. **Junk Robot Companion** `[2D]` — upgrade a scrap buddy. *Build:* DOM crafting tree, robot stats, Canvas auto-battle encounters.
668. **Seed Vault Run** `[2D]` — carry seeds through ruins. *Build:* Phaser 3 escort run, fragile seed meter, collapse hazards, checkpoints.
669. **Barter Town** `[2D]` — trade items with fickle merchants. *Build:* DOM merchant moods, value tables per merchant, haggle dialogue.
670. **Solar Panel Scramble** `[2D]` — angle panels before nightfall. *Build:* Canvas sun arc, rotate panels to maximize dot product output.
671. **Ash Wanderer** `[3D]` — trek through ash, find signs. *Build:* Three.js gray fog terrain, particle ash, minimal exploration, landmark discovery log.
672. **Geiger Hunt** `[2D]` — find hotspots by sound. *Build:* Web Audio click rate by distance, hidden hotspot coordinates, mouse search.
673. **Subway Settlement** `[2D]` — build homes in tunnels. *Build:* Canvas side-view colony builder, room placement, resource chains.
674. **Flood City Rafter** `[2D]` — raft between drowned towers. *Build:* Phaser 3 top-down raft, current flow field, supply pickups.
675. **Mutated Moth Swarm** `[2D]` — dodge moths drawn to light. *Build:* Canvas boids attracted to player lamp, toggle light, darkness maze.

## 28. Spooky & Horror — *Canvas 2D / Three.js*
676. **Flashlight Battery** `[3D]` — explore dark with dying light. *Build:* Three.js SpotLight on camera, battery drain timer, PointerLockControls house.
677. **Creaky Floorboards** `[2D]` — sneak without making noise. *Build:* Canvas grid with hidden creaky tiles, noise radius alerts monster AI.
678. **Mirror Mirror** `[2D]` — spot changes in reflections. *Build:* Canvas spot-the-difference, mirrored render with randomized altered objects.
679. **Ouija Spellout** `[2D]` — guide planchette to answer spirits. *Build:* Canvas board, planchette drag with resistance forces, word puzzle answers.
680. **Locked Asylum** `[3D]` — escape-room puzzles in ward. *Build:* Three.js rooms, raycast item inspection, inventory combining, combination locks.
681. **Doll Collector** `[2D]` — keep dolls from moving. *Build:* Canvas camera-switch view, dolls move when unobserved, timed survival.
682. **Basement Door** `[2D]` — survive nights, keep door shut. *Build:* DOM resource management, audio cues for approach, door hold timing.
683. **Static Television** `[2D]` — tune channels for ghost clues. *Build:* Canvas noise generator, dial channel, hidden frames reveal clues.
684. **Fog Lighthouse Horror** `[3D]` — keep lamp lit against shapes. *Build:* Three.js lighthouse top, rotating light beam, shapes retreat when lit.
685. **Night Shift Motel** `[2D]` — check in strange guests. *Build:* DOM guest inspection, rule checklist, anomaly detection, consequence tallies.
686. **Wendigo Woods** `[3D]` — survive forest by stealth. *Build:* Three.js instanced trees, sound-based monster AI, crouch and hide controls.
687. **Séance Circle** `[2D]` — match candles to summon right ghost. *Build:* DOM logic puzzle, candle color constraints, ghost identity hints.
688. **Cursed Photograph** `[2D]` — find hidden faces in photos. *Build:* Canvas hidden object scene, zoom and pan, click hitboxes.
689. **Tape Recorder EVP** `[2D]` — decode ghostly recordings. *Build:* Web Audio playback speed and reverse controls, transcribe hidden words.
690. **Shadow Under Bed** `[2D]` — check bed when sounds occur. *Build:* Canvas bedroom, randomized sound events, timed check actions.
691. **Abandoned Carnival** `[3D]` — explore rides at midnight. *Build:* Three.js low-poly carnival, flickering PointLights, each ride a lever or valve puzzle, PointerLockControls exploration.
692. **Silent Hallway** `[3D]` — red light green light horror. *Build:* Three.js corridor, entity moves when player looks away, camera direction checks.
693. **Crypt Keeper's Ledger** `[2D]` — bury the dead correctly. *Build:* DOM rule puzzle, grave plot grid, family relation constraints.
694. **Phone Call at 3AM** `[2D]` — choose answers to survive. *Build:* DOM dialogue tree, timed responses, Web Audio voice-like tones.
695. **Haunted Elevator** `[2D]` — pick floors, avoid wrong ones. *Build:* DOM floor buttons, anomaly spotting per floor, exit-8-style loop.
696. **Possessed Typewriter** `[2D]` — type before it types back. *Build:* DOM typing race against autonomous text generator, word timing.
697. **Grave Robber's Regret** `[2D]` — dig graves, flee guardians. *Build:* Phaser 3 top-down, dig timers, guardian chase AI, loot score.
698. **Masks of the Manor** `[2D]` — identify the imposter guest. *Build:* DOM social deduction, procedurally generated alibis per guest, click statements to flag contradictions, accuse button.
699. **Midnight Radio Host** `[2D]` — calls from the unknown. *Build:* DOM call queue, screen callers by clues, branching story outcomes.
700. **Sleepwalker Guide** `[2D]` — steer sleepwalker away from danger. *Build:* Canvas Lemmings-style placement of objects to redirect walker.

## 29. Ancient Myths — *Phaser 3 / Three.js*
701. **Pyramid Architect** `[3D]` — place blocks with ramps. *Build:* Three.js voxel grid, ramp and block placement, worker pathfinding.
702. **Scales of Ma'at** `[2D]` — weigh hearts against feather. *Build:* Canvas balance scale physics, deed cards add weight, judgment puzzles.
703. **Labors of Strength** `[2D]` — twelve hero microchallenges. *Build:* Phaser 3 scene per labor, varied minigames, overall score tally.
704. **Bifrost Bridge Run** `[3D]` — race across rainbow bridge. *Build:* Three.js color lanes, match lane color to gates, procedural track.
705. **Odin's Ravens** `[2D]` — scout map with two ravens. *Build:* Canvas fog-of-war reveal, two controllable units, enemy discovery.
706. **Medusa Mirror Shield** `[2D]` — reflect gaze at foes. *Build:* Canvas raycasting reflection, rotate shield angle, stone petrification.
707. **Sphinx Riddle Gate** `[2D]` — answer riddles to pass. *Build:* DOM riddle bank, text input with fuzzy matching, lives.
708. **Ragnarok Countdown** `[2D]` — prepare gods before doom. *Build:* DOM turn strategy, resource allocation to gods, final battle simulation.
709. **Olympus Feud** `[2D]` — gods' favor balancing strategy. *Build:* DOM faction favor meters, card-based decisions, consequence events.
710. **Nile Flood Farmer** `[2D]` — plant by flood cycles. *Build:* Canvas tile farming, flood level cycle, irrigation channel placement.
711. **Thor's Hammer Throw** `[2D]` — boomerang hammer physics. *Build:* Phaser 3 arc throw with return path, enemy targets, catch timing.
712. **Icarus Wings** `[2D]` — fly without melting wax. *Build:* Canvas flight altitude heat meter, flap controls, wing integrity.
713. **Anubis Tomb Guard** `[2D]` — guard tombs from robbers. *Build:* Phaser 3 tower defense, trap placement, robber paths.
714. **Pandora's Jar** `[2D]` — catch escaping evils. *Build:* Canvas swirling sprites escaping, click capture, accuracy combo.
715. **Yggdrasil Climber** `[3D]` — climb the world tree realms. *Build:* Three.js spiral branch platforms per realm, third-person jump physics with raycast ground checks, WASD and space.
716. **Minotaur Thread** `[2D]` — unspool thread through maze. *Build:* Canvas procedural maze, limited thread length, backtracking, minotaur roars.
717. **Valkyrie Chooser** `[2D]` — choose fallen warriors. *Build:* DOM warrior cards, stat-based selection, hall capacity limits.
718. **Scarab Roller** `[2D]` — roll sun across sky. *Build:* Matter.js circle body pushed by beetle, arrow-key torque and momentum, sky obstacle courses from sunrise to sunset.
719. **Trojan Horse Sneak** `[2D]` — hide soldiers, fool guards. *Build:* DOM grid packing of soldiers inside horse, guard inspection probability per exposed cell, timed gate approach.
720. **Loki's Tricks** `[2D]` — swap shapes to deceive. *Build:* Phaser 3 shapeshift platformer, forms unlock abilities, puzzle levels.
721. **Oracle of Delphi** `[2D]` — interpret vague prophecies. *Build:* DOM choice consequences, prophecy text generator, outcome tracking.
722. **Hieroglyph Decoder** `[2D]` — translate glyph puzzles. *Build:* DOM glyph substitution, letter mapping UI, phrase reveal.
723. **Argonaut Rowers** `[3D]` — row in sync past clashing rocks. *Build:* Three.js ship, rhythm-based rowing input, rock clap timing.
724. **Fenrir Chain** `[2D]` — forge chain to bind wolf. *Build:* DOM crafting puzzle, gather mythical ingredients, timing assembly.
725. **Persephone's Seasons** `[2D]` — balance seasons above and below. *Build:* Canvas split-world sim, season slider, crop and soul meters.

## 30. Ninja & Samurai — *Kaboom.js / Three.js*
726. **Shuriken Ricochet** `[2D]` — bounce stars off walls. *Build:* Kaboom.js star projectiles, reflection vectors off wall normals, limited throws per level, mouse drag to aim.
727. **Bamboo Slice** `[2D]` — slice bamboo at angles. *Build:* Canvas line slicing, polygon split math, Matter.js falling pieces.
728. **Paper Lantern Stealth** `[2D]` — move between lantern shadows. *Build:* Phaser 3 light radius detection, guard patrols, shadow zones.
729. **Katana Draw Duel** `[3D]` — iaido reflex duel. *Build:* Three.js duel scene, reaction prompt timing, slow-motion strike camera.
730. **Smoke Bomb Escape** `[2D]` — vanish and reposition. *Build:* Kaboom.js teleport puzzles, smoke particle cover, guard confusion.
731. **Rooftop Tile Run** `[3D]` — run castle roofs silently. *Build:* Three.js tiled rooftops, stealth meter, endless runner path.
732. **Ronin Road** `[2D]` — wander, choose duels. *Build:* DOM roguelite map, duel timing combat, honor stat.
733. **Cherry Blossom Kata** `[2D]` — perform moves in rhythm. *Build:* Tone.js koto beat track, directional arrow-key sequences on downbeats, Canvas petal particles for perfect hits.
734. **Shogun's Castle Siege** `[2D]` — infiltrate castle layers. *Build:* Phaser 3 stealth levels, guard vision cones, layer progression.
735. **Kunai Pinpoint** `[2D]` — hit targets through gaps. *Build:* Canvas rotating obstacle rings, kunai fired on click along fixed line, timing-based gap passage, level progression.
736. **Tea Ceremony Spy** `[2D]` — overhear secrets politely. *Build:* DOM etiquette quick-time steps, overheard dialogue fragments as clues, suspicion meter rises on rude mistakes.
737. **Dojo Sparring** `[2D]` — block and counter combos. *Build:* Kaboom.js fighting inputs, combo strings, AI pattern learning.
738. **Grappling Hook Ninja** `[2D]` — swing through forest canopy. *Build:* Matter.js rope constraint attached at clicked anchor point, release to fling with momentum, side-scrolling canopy levels.
739. **Silent Footsteps** `[2D]` — avoid creaky nightingale floors. *Build:* Canvas grid memory puzzle, hidden creaky tiles, noise penalties.
740. **Samurai Armor Smith** `[2D]` — forge armor plates. *Build:* Canvas hammer timing, plate shape matching, quality grading.
741. **Ninja Scroll Thief** `[2D]` — steal scrolls from guards. *Build:* Phaser 3 stealth top-down, pickpocket timing, alert levels.
742. **Waterfall Meditation** `[2D]` — balance focus under falls. *Build:* Canvas balance needle drifts under falling water force, counter with mouse, breathe on spacebar timing, distraction events.
743. **Poison Dart Garden** `[2D]` — navigate garden traps. *Build:* Phaser 3 trap timing, pressure plates, dart patterns.
744. **Bushido Code** `[2D]` — honor-based choice adventure. *Build:* Ink.js branching samurai story, honor and loyalty variables, Canvas ink-wash illustrations, multiple endings saved to localStorage.
745. **Shadow Clone Puzzle** `[2D]` — split clones to press switches. *Build:* Phaser 3 platformer recording input frames, replay as clones that hold switches, solve doors with cooperation.
746. **Calligraphy Blade** `[2D]` — draw kanji to attack. *Build:* Canvas stroke order recognition, enemy weaknesses per kanji.
747. **Moonlit Assassination** `[3D]` — time strike with clouds. *Build:* Three.js night scene, cloud cover cycles light, stealth approach.
748. **Bamboo Forest Maze** `[3D]` — navigate dense bamboo. *Build:* Three.js instanced bamboo, procedural maze, fog and sound cues.
749. **Hidden Village Defense** `[2D]` — set traps for invaders. *Build:* Phaser 3 trap placement, enemy waves, choke points.
750. **Kite Glider Ninja** `[2D]` — glide over moats on kites. *Build:* Canvas wind currents, lift and drag model, landing zones.

## 31. Dinosaurs & Prehistoric — *Phaser 3 / Three.js*
751. **Raptor Pack Hunt** `[2D]` — coordinate pack tactics. *Build:* Phaser 3 multi-unit control, flanking AI prey, stamina.
752. **Volcano Egg Rescue** `[2D]` — save eggs from lava. *Build:* Canvas rising lava, carry eggs to safety, platform jumps.
753. **Pterodactyl Fishing** `[2D]` — dive for fish. *Build:* Kaboom.js dive timing, water surface splash, fish schools.
754. **Fossil Dig Site** `[3D]` — brush bones, assemble skeletons. *Build:* Three.js voxel dirt removal, brush tool raycast, skeleton assembly.
755. **Tar Pit Trap** `[2D]` — lure predators into tar. *Build:* Phaser 3 bait placement, predator pathing, sticky zones.
756. **Mammoth Herd Drive** `[2D]` — guide mammoths to valley. *Build:* Canvas boids herding, player pressure zones, terrain obstacles.
757. **Caveman Fire Starter** `[2D]` — rub sticks rhythmically. *Build:* DOM rhythm meter, friction heat build, spark success.
758. **Meteor Countdown** `[2D]` — prepare dinos for impact. *Build:* DOM resource sim over limited turns, assign dinos to dig shelters or gather food, survival percentage at impact.
759. **Stegosaurus Stack** `[2D]` — balance plates on back. *Build:* Matter.js stacking, walking motion adds sway, plate shapes.
760. **Brontosaurus Bridge** `[2D]` — use necks as bridges. *Build:* Phaser 3 puzzle, rotate neck angles, small dinos cross.
761. **Cave Painting Hunt** `[2D]` — paint hunts to summon luck. *Build:* Canvas drawing tool, shape recognition, hunt success bonus.
762. **Trilobite Tunnels** `[2D]` — burrow ancient seabeds. *Build:* Canvas Dig Dug-style tunneling, predator fish, fossil collectibles.
763. **Dino Daycare** `[2D]` — feed baby dinos properly. *Build:* DOM pet sim with hunger and mood meters per baby, herbivore versus carnivore diets, growth stages with timers.
764. **Ice Age Migration** `[3D]` — move tribe before freeze. *Build:* Three.js terrain, path planning, freeze line advancing, resource gathering.
765. **Saber Tooth Chase** `[3D]` — flee across glacier. *Build:* Three.js endless glacier runner, procedurally spawned crevasses, slide and jump keys, cat closes gap on stumbles.
766. **Amber Collector** `[2D]` — collect insects in amber. *Build:* Canvas resin drops with viscosity-based falling speed, move tree branch to trap flying insects, collection gallery.
767. **Wheel Inventor** `[2D]` — invent tools in tech tree. *Build:* DOM tech tree unlocking stone tools to wheel, click resource gathering, idle production rates, localStorage save.
768. **Jurassic Volcano Surf** `[3D]` — surf lava flows. *Build:* Three.js flowing lava surface, board physics, rock obstacles.
769. **Dodo Dodgeball** `[2D]` — prehistoric dodgeball chaos. *Build:* Kaboom.js arena, throw and catch timing, AI teams.
770. **Ankylosaur Smash** `[2D]` — tail-club smash puzzles. *Build:* Matter.js destructible block structures, tail-club swing as hinged body, mouse drag sets swing angle and power.
771. **Primordial Soup** `[2D]` — evolve cell into creature. *Build:* Canvas cell steering toward mouse, eat smaller particles, spend DNA points on traits like flagella or spikes.
772. **Mammoth Ice Sculptor** `[3D]` — carve ice for tribe. *Build:* Three.js voxel block, chisel removal raycast, target silhouette match.
773. **Dino Egg Incubator** `[2D]` — keep eggs right temperature. *Build:* DOM temperature sliders per nest, heat drift with random weather events, hatch timers, sex and health outcomes.
774. **Spear Fishing Tribe** `[2D]` — spear fish in shallows. *Build:* Canvas refraction offset aim, fish swim AI, throw timing.
775. **T-Rex Tiny Arms** `[2D]` — reach things with tiny arms. *Build:* Phaser 3 humorous puzzles, limited reach radius, tool use.

## 32. Robots & Mechs — *Matter.js / Three.js*
776. **Mech Pilot Academy** `[3D]` — learn mech controls in drills. *Build:* Three.js mech with tank-style WASD controls and mouse turret, drill courses with timed targets and grading.
777. **Servo Sync** `[2D]` — coordinate robotic limbs. *Build:* Matter.js jointed limbs, QWOP-style key mapping, distance goal.
778. **Junkyard Robot Fighter** `[2D]` — build bot from scrap. *Build:* DOM part editor, Matter.js arena battles, stat-based AI.
779. **Battery Swap** `[2D]` — keep robots charged. *Build:* DOM juggling task, battery drain timers, swap clicks.
780. **Assembly Arm** `[2D]` — place parts with robotic arm. *Build:* Canvas inverse kinematics arm, mouse target, grab and place.
781. **Robot Dance Off** `[3D]` — sequence dance moves. *Build:* Three.js robot rig with keyframed poses, Tone.js beat, arrow-key move sequences, AI opponent scoring by accuracy.
782. **Titan Walker** `[3D]` — walk giant mech on terrain. *Build:* Three.js heightmap terrain, alternating leg keys plant feet, center-of-mass balance check prevents tipping over.
783. **Circuit Board Repair** `[2D]` — solder broken paths. *Build:* Canvas grid circuit, click to draw solder traces, BFS validates power reaches every component without shorts.
784. **Rogue AI Containment** `[2D]` — isolate rogue code. *Build:* Canvas grid spreading virus, place firewalls, contain area.
785. **Mech Hangar Manager** `[2D]` — repair mechs between missions. *Build:* DOM management sim, damaged part inventory, assign mechanics per bay, mission outcomes rolled from mech stats.
786. **Sentry Bot Patrol** `[2D]` — program patrol routes. *Build:* Canvas waypoint editor for patrol routes, simulated intruders with pathfinding, vision cone detection test scoring.
787. **Robot Sumo** `[3D]` — push bots out of ring. *Build:* Three.js ring with cannon-es rigid-body bots, local two-player keyboard controls, push opponent off platform edge.
788. **Gear Grinder** `[2D]` — mesh gears to power machines. *Build:* Canvas gear placement on pegs, mesh detection by radius sum, rotation propagates with ratio math to machines.
789. **Android Empathy Test** `[2D]` — detect androids by answers. *Build:* DOM interview questions, procedural response patterns with subtle tells, classify each subject human or android.
790. **Robot Pet Trainer** `[2D]` — teach robot pet tricks. *Build:* DOM command buttons, reinforcement learning with success probabilities raised by treats, Canvas pet animations.
791. **Mecha Kaiju Clash** `[3D]` — mech versus monster brawls. *Build:* Three.js city arena, light/heavy combo attacks with hitboxes, destructible building boxes, kaiju attack patterns.
792. **Nanobot Swarm** `[2D]` — guide nanobots through body. *Build:* Canvas boids swarm following mouse flow field, steer through vessels, destroy infection cells, swarm count is health.
793. **Logic Bot Programmer** `[2D]` — drag-drop code blocks. *Build:* DOM drag-drop command blocks, small interpreter steps bot on grid, loops and conditionals unlock per level.
794. **Exo Suit Climber** `[3D]` — climb cliffs in exosuit. *Build:* Three.js cliff with raycast grab points, alternate mouse buttons per hand, stamina and battery meters drain.
795. **Factory Overload** `[2D]` — stop runaway assembly line. *Build:* Canvas conveyor sim, quick switch toggles, overflow fail state.
796. **Robot Uprising Negotiator** `[2D]` — dialogue to prevent war. *Build:* Ink.js branching dialogue, trust and tension variables, DOM terminal-styled UI, peace or war endings.
797. **Scrap Golem** `[3D]` — absorb scrap to grow. *Build:* Three.js top-down arena, golem mesh scales with absorbed scrap count, size-based collision rules, WASD movement.
798. **Magnet Crane Bot** `[2D]` — lift and sort metal. *Build:* Matter.js metal bodies attracted by inverse-square magnet force, arrow-key crane, toggle magnet to drop into bins.
799. **Rocket Fist** `[2D]` — punch-launch puzzle platformer. *Build:* Phaser 3 projectile fist, grapple pull, puzzle switches.
800. **Self-Driving Test** `[2D]` — train car AI checkpoints. *Build:* Canvas simple neural net, raycast sensors, genetic algorithm.

## 33. Jungle & Safari — *Phaser 3 / Three.js*
801. **Vine Swinger** `[2D]` — swing vine to vine. *Build:* Matter.js pendulum constraints on vine anchors, spacebar release timing, momentum carries to next vine.
802. **Safari Photographer** `[3D]` — snap rare animal photos. *Build:* Three.js jeep rail path, camera zoom, photo scoring by framing.
803. **Temple Vine Puzzle** `[2D]` — rotate vines to unlock doors. *Build:* Canvas grid of rotatable vine tiles, click to rotate, flood-fill connectivity check opens temple door.
804. **Anteater Feast** `[2D]` — slurp ants by line drawing. *Build:* Canvas mouse drawn tongue path, ant collision detection.
805. **Hippo River Crossing** `[2D]` — hop on hippos carefully. *Build:* Phaser 3 Frogger-style river lanes, hippos submerge on timers, arrow-key hops, crocodile hazards.
806. **Elephant Water Spray** `[2D]` — douse brush fires. *Build:* Canvas fire spread automaton, aim water stream particles.
807. **Gorilla Banana Toss** `[2D]` — lob bananas over canopy. *Build:* Canvas turn-based artillery, projectile arcs with wind, pixel-mask destructible canopy, angle and power input.
808. **Poacher Patrol** `[2D]` — protect wildlife from poachers. *Build:* Phaser 3 top-down patrol, stealth detection, rescue mechanics.
809. **Parrot Paint Feathers** `[2D]` — color parrots to match. *Build:* DOM color palette, RGB mixing to match target feather colors, accuracy from color distance, timed rounds.
810. **Quicksand Escape** `[2D]` — wriggle out of quicksand. *Build:* Canvas sinking depth meter, alternating left/right key mashing raises player, panic mashing sinks faster.
811. **Lion Pride Leader** `[2D]` — manage pride territory. *Build:* Canvas territory map, rival prides AI, hunting resource.
812. **Watering Hole Wait** `[2D]` — time drinks around predators. *Build:* Canvas timing game, predator patrol cycles at waterhole, hold space to drink, thirst meter drains constantly.
813. **Chameleon Camouflage** `[2D]` — match background colors. *Build:* Canvas background sampling under chameleon, HSL picker to match color, predator detection by color distance.
814. **Giraffe Neck Reach** `[2D]` — stretch to reach leaves. *Build:* Phaser 3 extendable neck segments with mouse angle, avoid branch obstacles, eat leaves for points.
815. **Sloth Speedrun** `[2D]` — slowest fastest run. *Build:* Phaser 3 hand-over-hand grip timing with alternating keys, momentum carry bonus, split timer for speedruns.
816. **Zebra Stripe Match** `[2D]` — identify zebras by stripes. *Build:* Canvas procedural noise-based stripe patterns, find matching zebra in herd, click selection with timer.
817. **Canopy Zipline** `[3D]` — zip across treetops. *Build:* Three.js CatmullRom cable paths through trees, brake and speed keys, duck under branch obstacles.
818. **Termite Mound Engineer** `[2D]` — build ventilation tunnels. *Build:* Canvas grid cellular airflow sim, dig tunnels with mouse, keep chamber temperatures in target range.
819. **Jungle Drum Messages** `[2D]` — relay drum codes. *Build:* Tone.js drum patterns as codes, memorize and replay on keys, relay chain lengthens each village.
820. **Croc Jaw Dentist** `[2D]` — clean teeth without bites. *Build:* DOM random bite tooth, click teeth, risk probability.
821. **Tribal Mask Memory** `[2D]` — memorize mask sequences. *Build:* DOM memory grid with SVG procedurally generated masks, flip pairs, grid size increases each round.
822. **Monsoon Rafting** `[3D]` — raft flooded rivers. *Build:* Three.js river spline with flow velocity field, A/D paddle forces, rock and log obstacles in rapids.
823. **Leopard Tree Stash** `[2D]` — hide kills in trees. *Build:* Phaser 3 climbing platformer, carried prey reduces jump height, hyenas steal unattended kills.
824. **Savanna Stampede** `[3D]` — dodge stampeding wildebeest. *Build:* Three.js instanced wildebeest herd, lane dodging with arrow keys, dust particle sprites limit visibility.
825. **Firefly Lantern Night** `[2D]` — collect fireflies in jars. *Build:* Canvas glowing sprites, mouse jar capture, night timer.

## 34. Arctic & Winter — *Canvas 2D / Three.js*
826. **Igloo Builder** `[3D]` — cut and place snow blocks. *Build:* Three.js block placement on spiral, structural stability check.
827. **Polar Bear Fishing** `[2D]` — fish through ice holes. *Build:* Canvas ice holes with fish shadows passing below, swipe mouse at right moment, catch combo multiplier.
828. **Sled Dog Musher** `[2D]` — manage dog team energy. *Build:* Canvas side-scroller, per-dog stamina, rest and feed decisions at checkpoints, snow and ice terrain types.
829. **Avalanche Outrun** `[3D]` — ski ahead of avalanche. *Build:* Three.js downhill slope, trees obstacles, avalanche wall chasing.
830. **Ice Fishing Hut** `[2D]` — patience fishing with tip-ups. *Build:* DOM tip-up flags rise randomly, reaction-time reel minigame, fish species table with rarity weights.
831. **Aurora Painter** `[2D]` — paint northern lights. *Build:* Canvas WebGL shader brush, color gradients, gallery saving.
832. **Frozen Lake Crack** `[2D]` — cross ice without breaking. *Build:* Canvas ice grid with thickness values, cracks propagate from heavy steps, plan path crossing with cargo weight.
833. **Penguin Waddle Huddle** `[2D]` — rotate huddle to stay warm. *Build:* Canvas hex huddle, per-penguin body temperature, click to rotate outer and inner rings before freezing.
834. **Snowflake Designer** `[2D]` — create symmetric snowflakes. *Build:* Canvas drawing mirrored with 6-fold radial symmetry via rotate transforms, export PNG, challenge target shapes.
835. **Blizzard Navigator** `[3D]` — reach camp in whiteout. *Build:* Three.js heavy fog and snow particles, compass HUD, temperature meter, reach camp before freezing.
836. **Icebreaker Captain** `[3D]` — plow routes through floes. *Build:* Three.js ship with cannon-es ice floe bodies, momentum steering keys, clear channel for cargo convoys.
837. **Walrus Tusk Climb** `[2D]` — climb ice with tusks. *Build:* Phaser 3 vertical ice wall, alternating key tusk planting, stamina bar, crumbling ice ledges.
838. **Seal Pup Rescue** `[2D]` — rescue pups from orcas. *Build:* Phaser 3 swim AI, orca patrols, rescue zones.
839. **Arctic Fox Pounce** `[2D]` — listen and pounce in snow. *Build:* Web Audio StereoPanner positional rustle cues under snow, mouse pounce aim, distance-based success.
840. **Snowshoe Trek** `[2D]` — trek deep snow efficiently. *Build:* Canvas tile map with snow depth values, A* stamina-cost pathing, choose route to reach cabin.
841. **Glacier Crevasse** `[2D]` — rope across crevasses. *Build:* Matter.js rope chains between anchor points, place anchors to swing team across crevasse gaps.
842. **Frostbite Survival** `[2D]` — manage warmth and food. *Build:* rot.js survival map, body temperature and hunger stats, craft fires and shelters from gathered items.
843. **Ice Sculpture Contest** `[2D]` — chisel within time. *Build:* Canvas mask carving with mouse chisel, compare remaining pixels to target silhouette for scoring.
844. **Reindeer Herder** `[2D]` — migrate herd seasonally. *Build:* Canvas boids herd with player dog repulsion, seasonal map changes move pastures, wolf threats.
845. **Northern Outpost** `[2D]` — run research station. *Build:* DOM resource management of fuel and food, research upgrades tree, random storm events, localStorage save.
846. **Snowball Fort War** `[3D]` — build forts, lob snowballs. *Build:* Three.js voxel snow forts, cannon-es snowball physics, destroy enemy fort blocks, mouse aim throws.
847. **Curling Stone Puzzle** `[2D]` — slide stones into patterns. *Build:* Canvas friction physics, drag to throw stone, hold space to sweep reducing friction, target patterns.
848. **Frozen Pipe Plumber** `[2D]` — thaw pipes before bursting. *Build:* Canvas pipe grid with heat diffusion sim, place heaters with mouse before pipes reach freezing threshold.
849. **Yeti Footprints** `[2D]` — track yeti via clues. *Build:* Canvas map with procedurally generated tracks, deduce yeti route from scattered clues, mark final den location.
850. **Polar Night Lantern** `[3D]` — find way during polar night. *Build:* Three.js dark terrain, lantern PointLight radius, star constellations as navigation, fuel limited lantern.

## 35. Steampunk — *PixiJS / Three.js*
851. **Airship Captain** `[3D]` — steer dirigible through storms. *Build:* Three.js dirigible with wind vector fields, altitude ballast and propeller keys, storm cloud obstacles.
852. **Clockwork Heart** `[2D]` — wind gears to keep alive. *Build:* Canvas interlocking gear rotation, hold to wind mainspring with timing input, failure state when stopped.
853. **Brass Automaton** `[2D]` — build steam-powered helpers. *Build:* DOM crafting tree of parts, assign built automatons to tasks, idle production simulation per tick.
854. **Steam Pressure Valve** `[2D]` — balance boiler pressure. *Build:* Canvas pressure gauges, multiple boilers, valve sliders release steam, explosion above threshold.
855. **Cog Puzzle Tower** `[3D]` — rotate cogs to open. *Build:* Three.js gear meshes on pegs, rotation propagation through meshing, align slots to unlock doors.
856. **Zeppelin Dogfight** `[2D]` — balloon aerial combat. *Build:* Phaser 3 buoyancy flight physics, hydrogen leak damage lowers altitude, harpoon gun mouse aim.
857. **Aether Telegraph** `[2D]` — send messages across aether. *Build:* DOM node routing puzzle for aether lines, encode messages with Vigenère cipher, deadline timer.
858. **Inventor's Workshop** `[2D]` — combine parts into gadgets. *Build:* DOM drag-drop crafting combos, recipe discovery table, gadgets unlock new parts and orders.
859. **Gaslight Gumshoe** `[2D]` — detective in foggy streets. *Build:* Canvas point-and-click foggy street scenes, clue journal, DOM deduction board linking suspects.
860. **Pneumatic Tube Post** `[2D]` — route tubes for mail. *Build:* Canvas tube routing grid, mail capsules travel paths via BFS, delivery queue with timers.
861. **Steam Train Tycoon** `[2D]` — manage steam rail lines. *Build:* Canvas rail network builder, train schedules on graph, cargo demand and profit economy.
862. **Monocle Inspector** `[2D]` — spot forged blueprints. *Build:* Canvas blueprint zoom lens with mouse, find forged differences, hit-test regions for flags.
863. **Copper Diving Bell** `[3D]` — explore with brass suit. *Build:* Three.js underwater seabed, oxygen and pressure meters, tether length limit, salvage pickups.
864. **Tesla Coil Defense** `[3D]` — arc coils at invaders. *Build:* Three.js tower defense board, chain lightning targeting nearest enemies, line arcs with jitter, mouse placement.
865. **Gearhead Racers** `[3D]` — race steam carts. *Build:* Three.js track, cannon-es RaycastVehicle carts, steam pressure boost meter, drift steering keys.
866. **Victorian Flying Machine** `[2D]` — test bizarre contraptions. *Build:* Matter.js contraption builder with wings and boilers, launch test flight, distance-based scoring.
867. **Chronometer Heist** `[2D]` — steal time devices. *Build:* Phaser 3 stealth levels, hold key to slow time scale, guard patrols, steal clocks before alarm.
868. **Smokestack City** `[2D]` — manage smog and industry. *Build:* Canvas city builder grid, smog diffusion between tiles, balance factories with clean-air parks.
869. **Goggles of Truth** `[2D]` — reveal hidden mechanisms. *Build:* Canvas toggle overlay layer reveals hidden gears, solve platform puzzles switching between views.
870. **Brass Spider Escape** `[2D]` — evade mechanical spiders. *Build:* Phaser 3 chase with spider pathfinding AI, trigger environmental traps, run through workshop levels.
871. **Steam Organ Concert** `[2D]` — play pipe organ rhythm. *Build:* Tone.js organ synth, rhythm note lanes mapped to keys, pipe steam particles on hits.
872. **Clocktower Climber** `[3D]` — climb inside giant clock. *Build:* Three.js rotating gear platforms, timed jumps between teeth, third-person camera following climber.
873. **Rivet Rush Riveter** `[2D]` — rivet hull plates fast. *Build:* Canvas hull plates with rivet holes, click accuracy and timing, plate integrity drops on misses.
874. **Aetheric Compass** `[2D]` — follow compass to treasure. *Build:* Canvas compass needle with spring physics pointing to hidden target, hot-cold search on tile map.
875. **Mechanical Menagerie** `[2D]` — care for clockwork animals. *Build:* DOM pet care sim for clockwork animals, winding needs decay timers, Canvas animated pets.

## 36. Original Superheroes — *Phaser 3 / Three.js*
876. **Cape Glide City** `[3D]` — glide between skyscrapers. *Build:* Three.js city blocks, glide physics with lift and drag, thermal updraft zones, mouse steering.
877. **Sidekick Training** `[2D]` — learn hero basics. *Build:* Phaser 3 minigame tutorials for punch, dodge and rescue, skill unlocks with badges.
878. **Villain Lair Infiltration** `[2D]` — sneak into lairs. *Build:* Phaser 3 stealth levels, guard vision cones via raycasts, laser grids, hacking keypad minigame.
879. **Speedster Errands** `[2D]` — finish chores super fast. *Build:* Canvas town graph, time-limited route optimization through errands, super-speed path drawing.
880. **Gravity Hero** `[2D]` — reverse gravity powers. *Build:* Phaser 3 platformer, key toggles gravity direction in four ways, hazards and rescue targets.
881. **Shield Bearer** `[2D]` — block projectiles for civilians. *Build:* Canvas shield angle via mouse, reflect projectiles with normal math, escort civilians to safety.
882. **Power Swap League** `[2D]` — swap powers each round. *Build:* Phaser 3 arena brawler, random power assignment each round, local two-player keyboard controls.
883. **Secret Identity Juggle** `[2D]` — balance hero and daily life. *Build:* DOM daily schedule management, hero calls interrupt work, suspicion meter from coworkers.
884. **Telekinetic Traffic** `[3D]` — lift cars from jams. *Build:* Three.js road grid, raycast-select cars and lift with mouse drag, traffic flow sim clears jams.
885. **Hero Headquarters** `[2D]` — manage team and missions. *Build:* DOM mission dispatch board, hero stats and fatigue, success chance rolls, roster upgrades.
886. **Shrinking Hero** `[3D]` — shrink to solve puzzles. *Build:* Three.js room-scale levels, toggle scale changes collision and reach, crawl through vents.
887. **Weather Witch Heroine** `[2D]` — control storms vs villains. *Build:* Canvas weather effects with area damage zones, select storm type, villains with elemental weaknesses.
888. **Mind Reader Interrogation** `[2D]` — read thoughts for clues. *Build:* DOM dialogue, hover suspects to reveal hidden thought text, catch lies through contradictions.
889. **Laser Eye Precision** `[2D]` — cut shapes with eyes. *Build:* Canvas line cutting along dashed shapes with mouse, deviation accuracy scoring, time limit.
890. **Stretch Hero Reach** `[2D]` — stretch limbs across gaps. *Build:* Matter.js elastic distance constraints for limbs, grab points with mouse, swing across gaps.
891. **Elemental Twins** `[2D]` — two heroes, combined powers. *Build:* Phaser 3 co-op switching between fire and ice heroes, element combo puzzles, tab swap.
892. **Bank Robbery Response** `[3D]` — stop robbers quickly. *Build:* Three.js street chase with car following path, takedown quick-time events on key prompts.
893. **Invisible Hero Sneak** `[2D]` — stay unseen while helping. *Build:* Canvas visibility meter rises when moving, stealth helping tasks, NPC vision cones.
894. **Origin Story Maker** `[2D]` — choose powers via story. *Build:* Ink.js branching origin story, choices assign power stats, DOM hero card generator output.
895. **Hero Rescue Dispatch** `[2D]` — dispatch heroes to emergencies. *Build:* DOM city map dispatch, travel time from distances, emergency queue with deadlines.
896. **Super Strength Builder** `[2D]` — lift heavier stuff. *Build:* DOM clicker lifting heavier objects, strength upgrades, idle training, localStorage save.
897. **Comic Panel Hero** `[2D]` — act inside comic panels. *Build:* DOM comic panel grid, rearrange panel order to change outcomes, panel-hopping puzzles.
898. **Mega Villain Boss Rush** `[3D]` — consecutive boss battles. *Build:* Three.js arena, sequential bosses with telegraphed attack patterns, dodge roll and combo attacks.
899. **Time Freeze Hero** `[2D]` — freeze time puzzles. *Build:* Phaser 3 key pauses physics bodies, rearrange frozen objects, solve rescue puzzles.
900. **Rookie Hero Patrol** `[3D]` — patrol neighborhoods for trouble. *Build:* Three.js open neighborhood map, random event spawns, response timer, WASD flying patrol.

## 37. Halloween — *Kaboom.js / Three.js*
901. **Trick or Treat Route** `[2D]` — plan candy-max routes. *Build:* Canvas house graph, TSP nearest-neighbor heuristic hints, plan route before curfew time limit.
902. **Pumpkin Carver** `[3D]` — carve jack-o'-lantern designs. *Build:* Three.js CSG carving via mouse paths, inner candle light.
903. **Witch Potion Brewing** `[2D]` — follow recipes, avoid explosions. *Build:* DOM recipe steps, drag ingredients, circular mouse stirring timing, explosion on wrong order.
904. **Candy Corn Catcher** `[2D]` — catch falling candy corn. *Build:* Kaboom.js falling candy corn objects, basket movement with arrow keys, avoid rotten candy.
905. **Haunted Hayride** `[3D]` — shoot targets from wagon. *Build:* Three.js rail path through haunted farm, raycast mouse shooting of popup targets, combo scoring.
906. **Costume Contest** `[2D]` — mix and match costumes. *Build:* DOM layered sprite dress-up, judge preference rules each round, scoring by theme match.
907. **Bat Swarm Herder** `[2D]` — guide bats to belfry. *Build:* Canvas boids flocking with cursor attraction, guide swarm into belfry, avoid owls.
908. **Monster Mash Dance** `[2D]` — monster rhythm dance. *Build:* Tone.js spooky beat, arrow key timing windows, monster dance animations on Canvas.
909. **Graveyard Shift** `[2D]` — keep zombies in graves. *Build:* DOM whack-a-mole grid of graves, zombie rise timers, shovel clicks push them back.
910. **Spider Web Spinner** `[2D]` — spin webs to catch flies. *Build:* Canvas line drawing between anchor nodes, web strength by length, fly collision tests.
911. **Black Cat Crossing** `[2D]` — avoid crossing paths. *Build:* Phaser 3 maze, black cat patrol paths, luck meter drops on crossing paths.
912. **Skeleton Assembly** `[2D]` — reassemble skeletons. *Build:* DOM drag-drop bone puzzle with snap points, timed assembly, anatomy hints.
913. **Cauldron Bubble Pop** `[2D]` — pop bubbles before boil-over. *Build:* Canvas bubble spawn rate rises, click popping before boil-over meter fills, combo bonus.
914. **Jack-o-Lantern Defense** `[2D]` — pumpkins defend house. *Build:* Phaser 3 lane tower defense, pumpkin turret types, monster waves, mouse placement grid.
915. **Mummy Wrap Race** `[2D]` — wrap mummies quickly. *Build:* Canvas circular mouse motion detection via angle accumulation, wrap progress race against AI.
916. **Werewolf Moon Phases** `[2D]` — control transformations. *Build:* DOM moon cycle timer, switch human and wolf forms, platforming abilities per form.
917. **Candy Bucket Balance** `[2D]` — balance overflowing candy. *Build:* Matter.js stacking candy shapes in bucket, tilt bucket with mouse, overflow loses points.
918. **Bobbing for Apples** `[3D]` — time bites in tub. *Build:* Three.js water tub with floating apples, buoyancy bob animation, head dip timing on click.
919. **Witch Hat Toss** `[3D]` — ring toss with hats. *Build:* Three.js carnival booth, cannon-es spinning hat projectiles, ring pegs, mouse swipe throw.
920. **Vampire Sunrise Dash** `[2D]` — reach coffin before dawn. *Build:* Phaser 3 runner, advancing sunlight hazard, shade zones, reach coffin before dawn.
921. **Pumpkin Patch Picker** `[2D]` — choose perfect pumpkins. *Build:* DOM pumpkin selection, procedurally generated traits, compare quality against customer requests.
922. **Spooky Hide & Seek** `[3D]` — find hiding monsters. *Build:* Three.js house rooms, monsters hidden in furniture, raycast click to find them.
923. **Haunted Pumpkin Bowling** `[3D]` — bowl skulls at pins. *Build:* Three.js lane, cannon-es physics skull ball, spin control by mouse swipe, pin knockdowns.
924. **Zombie Conga Line** `[2D]` — lead growing zombie line. *Build:* Canvas snake-like follow chain of zombies, recruit dancers, avoid self-collision.
925. **Ghost Busting Vacuum** `[2D]` — suck ghosts into vacuum. *Build:* Canvas suction force field cone, ghost evasion AI, hold mouse to vacuum.

## 38. Winter Holidays — *DOM / Canvas / Three.js*
926. **Gift Wrapping Rush** `[2D]` — wrap gifts neatly fast. *Build:* DOM steps to cut, fold and tape paper, timing windows, accuracy score.
927. **Reindeer Flight School** `[3D]` — train reindeer to fly. *Build:* Three.js flight rings over snowy town, stamina meter, mouse steering of reindeer.
928. **Chimney Drop** `[2D]` — drop presents down chimneys. *Build:* Canvas side-scrolling sleigh, gift projectile drops with momentum, chimney target hitboxes.
929. **Snowman Builder** `[3D]` — stack and decorate snowmen. *Build:* Three.js sphere stacking with balance check, drag decorations onto surface via raycast.
930. **Cookie Decorator** `[2D]` — ice cookies with patterns. *Build:* Canvas icing drawing tool, compare to pattern template by pixel overlap scoring.
931. **Ornament Hanger** `[3D]` — balance ornaments on tree. *Build:* Three.js tree with branch nodes, cannon-es weight balance tipping, place ornaments with mouse.
932. **Elf Workshop Line** `[2D]` — assemble toys on belt. *Build:* Canvas conveyor belt, drag parts onto toys before they exit, assembly accuracy score.
933. **Hot Cocoa Stand** `[2D]` — serve cocoa orders. *Build:* DOM order queue, ingredient mixing buttons, patience timers per customer.
934. **Sleigh Bell Rhythm** `[2D]` — jingle bells in time. *Build:* Tone.js bell synth, rhythm timing lanes, holiday song charts.
935. **Naughty or Nice List** `[2D]` — sort kids by clues. *Build:* DOM deduction puzzle with clue cards per child, sort into lists, accuracy reveal.
936. **Gingerbread Village** `[3D]` — build gingerbread houses. *Build:* Three.js modular gingerbread pieces, icing glue joints, structural stability check.
937. **Candle Lighting Puzzle** `[2D]` — light candles in order. *Build:* DOM logic puzzle, light candles following sequence rules, toggle constraints.
938. **Stocking Stuffer** `[2D]` — fit gifts in stockings. *Build:* Canvas packing puzzle with irregular gift shapes, rotate and fit into stocking outline.
939. **Present Pile Tetris** `[2D]` — stack gifts under tree. *Build:* Canvas falling gift blocks, line clear rules, holiday-themed bonuses.
940. **Holiday Light Untangle** `[2D]` — untangle string lights. *Build:* Canvas planar graph untangle puzzle, drag nodes until edges have no crossings.
941. **Snow Angel Maker** `[2D]` — make perfect snow angels. *Build:* Canvas mouse motion symmetry scoring, compare left and right arm arcs.
942. **Frosty Window Art** `[2D]` — draw on frosted glass. *Build:* Canvas erase mask with mouse, frost regrows over time, reveal picture goals.
943. **New Year's Countdown** `[2D]` — fireworks timing show. *Build:* Canvas particle fireworks, rhythm timing launches, countdown to midnight show.
944. **Winter Market Vendor** `[2D]` — sell crafts at market. *Build:* DOM pricing sim, customer preference profiles, daily sales report.
945. **Toy Sorting Elves** `[2D]` — sort toys by type. *Build:* DOM drag sorting toys into bins, speed increases each wave, error penalties.
946. **Mistletoe Matchmaker** `[2D]` — pair up villagers. *Build:* DOM preference matching puzzle, stable marriage algorithm checks pair validity.
947. **North Pole Delivery Map** `[2D]` — plan delivery routes. *Build:* Canvas world map route planning, time zones affect delivery windows.
948. **Sledding Hill Race** `[3D]` — sled down hills. *Build:* Three.js slope heightmap, sled physics, steering keys, tree and rock obstacles.
949. **Caroling Choir** `[2D]` — harmonize carols. *Build:* Tone.js pitch matching with microphone pitch detection, harmony scoring.
950. **Gingerbread Escape** `[2D]` — gingerbread runner escapes oven. *Build:* Phaser 3 runner escaping oven, heat hazards, crumbs collectibles.

## 39. Candy & Food Worlds — *Phaser 3 / Three.js*
951. **Chocolate River Raft** `[3D]` — raft through chocolate. *Build:* Three.js river spline, raft steering with paddle keys, candy rock obstacles.
952. **Gumdrop Mountain Climb** `[2D]` — climb sticky gumdrops. *Build:* Phaser 3 sticky platforms that slow jumps, jump timing, climb to summit.
953. **Lollipop Forest Run** `[3D]` — run through lollipop trees. *Build:* Three.js endless runner through instanced lollipop trees, lane switching, collectible candies.
954. **Soda Fizz Rocket** `[2D]` — shake bottles to launch. *Build:* Canvas shake meter from mouse velocity, rocket launch physics, altitude scoring.
955. **Cupcake Tower** `[3D]` — stack cupcakes high. *Build:* Three.js with cannon-es stacking cupcakes, sway oscillation, click to drop timing.
956. **Jellybean Sorter** `[2D]` — sort beans by flavor. *Build:* DOM sorting jellybeans into jars, flavor clues by color and pattern, timer.
957. **Pizza Topping Puzzle** `[2D]` — arrange toppings by orders. *Build:* Canvas grid placement of toppings, order rules per slice, drag-and-drop.
958. **Sushi Conveyor Chef** `[2D]` — prepare sushi on belt. *Build:* DOM conveyor timing, recipe matching with ingredient buttons, customer queue.
959. **Burger Stack Balance** `[2D]` — balance burger layers. *Build:* Matter.js layered burger stacking, ingredient shapes, wobble physics.
960. **Taco Truck Rush** `[2D]` — fill taco orders. *Build:* DOM order queue, ingredient assembly clicks, time bonus per order.
961. **Cotton Candy Clouds** `[2D]` — jump on candy clouds. *Build:* Phaser 3 platformer, dissolving cloud platforms on timers, double jump.
962. **Popcorn Popper** `[2D]` — catch popping kernels. *Build:* Canvas particle burst kernels, move bowl with mouse to catch, burnt ones penalize.
963. **Noodle Slurp Race** `[2D]` — slurp noodles faster. *Build:* DOM rapid alternate-key input meter, AI opponent speed curve, choking penalty.
964. **Donut Hole Golf** `[3D]` — golf through donut holes. *Build:* Three.js course, cannon-es ball physics, donut ring obstacles, drag power putt.
965. **Ice Cream Scoop Stack** `[2D]` — stack scoops on cone. *Build:* Matter.js scoop stacking on cone, melting timer softens shapes, balance.
966. **Gummy Bear Rescue** `[2D]` — save gummies from melting. *Build:* Canvas heat zones, draw paths for gummies to follow, melting meter.
967. **Waffle Grid Puzzle** `[2D]` — fill waffle squares. *Build:* Canvas waffle grid logic puzzle, syrup flow fills cells, constraint clues.
968. **Pancake Flip Chef** `[3D]` — flip pancakes perfectly. *Build:* Three.js pan and pancake rigid body, mouse flick flip physics, landing angle score.
969. **Spice Market Merchant** `[2D]` — trade exotic spices. *Build:* DOM trading sim across bazaars, price fluctuations random walk, caravan capacity.
970. **Fruit Salad Mixer** `[2D]` — combine fruits by recipe. *Build:* DOM drag-drop fruits into bowl, recipe ratios scoring, time limit.
971. **Marshmallow Roast** `[3D]` — roast golden not burnt. *Build:* Three.js campfire with particle flames, hold distance to heat, color gradient browning.
972. **Pretzel Twist Logic** `[2D]` — untwist pretzel knots. *Build:* Canvas knot graph puzzle, drag crossings to untwist, check crossing count.
973. **Candy Factory Line** `[2D]` — manage candy production. *Build:* Canvas conveyor sim, machine upgrades, throughput bottleneck management.
974. **Pepper Heat Challenge** `[2D]` — eat peppers, manage heat. *Build:* DOM risk meter rising with each pepper, cooling items, push-your-luck scoring.
975. **Bubblegum Bubble Blow** `[2D]` — blow bubbles without popping. *Build:* Canvas hold-to-inflate bubble, random pop threshold, release timing scoring.

## 40. Insects & Tiny Worlds — *Matter.js / Three.js*
976. **Ant Picnic Raid** `[2D]` — carry crumbs back home. *Build:* Canvas ant agents with pheromone trail grid, place food, carry crumbs back home.
977. **Ladybug Leaf Hop** `[2D]` — hop leaves in garden. *Build:* Phaser 3 platform hopping across leaves, wind sway physics, aphid collectibles.
978. **Dragonfly Pond Patrol** `[3D]` — catch mosquitoes midair. *Build:* Three.js flight controls over pond, mosquito swarm AI, catch with collision spheres.
979. **Spider Silk Bridge** `[2D]` — build silk bridges. *Build:* Matter.js rope physics bridges, weight tests with crawling bugs.
980. **Firefly Signal** `[2D]` — flash patterns to communicate. *Build:* Canvas light pulse patterns, memorize and repeat flashes, Simon-like sequences.
981. **Caterpillar Metamorphosis** `[2D]` — eat, cocoon, transform. *Build:* Phaser 3 growth stages unlock abilities, platforming from caterpillar to butterfly.
982. **Beetle Ball Roller** `[3D]` — roll dung balls uphill. *Build:* Three.js hilly terrain, cannon-es sphere physics, push dung ball uphill with WASD.
983. **Grasshopper Long Jump** `[2D]` — jump distance challenges. *Build:* Canvas charge jump physics with angle selection, distance scoring.
984. **Mosquito Dodge** `[2D]` — dodge swatting hands. *Build:* Canvas random swat zones telegraphed, mouse dodge timing, blood collection score.
985. **Bee Waggle Dance** `[2D]` — dance directions to flowers. *Build:* Canvas dance encoding angle and duration, other bees follow direction to flowers.
986. **Termite Tower Builder** `[2D]` — build mound structures. *Build:* Canvas cellular building, airflow simulation through tunnels, colony temperature.
987. **Snail Mail Race** `[2D]` — slow snail race strategy. *Build:* DOM stamina management, slime trail boosts, AI racer strategies.
988. **Moth to Flame** `[2D]` — avoid flames, find light. *Build:* Canvas attraction forces toward lights, flame hazards, guide moth to safe lamp.
989. **Cricket Chorus** `[2D]` — chirp in harmony. *Build:* Tone.js chirp synth, keys shift pitch to match swarm, rhythm and harmony grading.
990. **Butterfly Garden Planner** `[2D]` — plant flowers for butterflies. *Build:* Canvas grid garden planner, flower attraction rules, butterfly visit simulation.
991. **Stick Insect Disguise** `[2D]` — blend into branches. *Build:* Canvas pose matching to branch silhouette, predator scan timer.
992. **Water Strider Skate** `[3D]` — skate pond surface. *Build:* Three.js water surface with ripple shader, momentum skating, prey catching.
993. **Pill Bug Roll** `[3D]` — curl up and roll. *Build:* Three.js garden, cannon-es mode switch walking to rolling sphere, slopes.
994. **Hornet Hive Defense** `[2D]` — defend hive from hornets. *Build:* Phaser 3 tower defense, bee units with stingers, hornet waves.
995. **Flea Circus Ringmaster** `[2D]` — direct flea performances. *Build:* DOM timing commands for flea acts, crowd score meter.
996. **Mantis Strike Timing** `[2D]` — perfect strike reflex. *Build:* Canvas reaction timing, prey moves randomly, strike window shrinks.
997. **Earthworm Tunneler** `[2D]` — dig tunnels, aerate soil. *Build:* Canvas tunnel carving grid, soil health score, avoid moles.
998. **Aphid Farmer Ants** `[2D]` — herd aphids for honeydew. *Build:* Canvas herding AI, honeydew resource collection, ladybug predators.
999. **Microbe Safari** `[3D]` — explore droplet microworld. *Build:* Three.js particle microbes, zoom exploration inside droplet, photo log.
1000. **Dewdrop Lens** `[2D]` — refract light to grow plants. *Build:* Canvas ray refraction through drops, lens placement puzzle, sunlight reaches seedlings.

## 41. Match-3 & Tile Matching — *PixiJS*
1001. **Gem Cascade** `[2D]` — classic swap-three gem matcher. *Build:* PixiJS sprites on 8x8 array, scan rows/cols for runs, tween gravity refill, pointer swipe.
1002. **Candy Lattice** `[2D]` — match candies on hex grid. *Build:* Canvas 2D axial hex coords, flood-fill matches along three axes, click-to-swap neighbors.
1003. **Rune Weaver** `[2D]` — match runes to cast spells. *Build:* PixiJS grid, matched rune types add mana counters, spell buttons trigger board effects.
1004. **Fruit Fizz** `[2D]` — fizzy fruit merges and combos. *Build:* Canvas grid, match-4 spawns bomb tile, particle bursts, combo multiplier on cascades.
1005. **Mahjong Drift** `[3D]` — tile solitaire on floating layers. *Build:* Three.js stacked tile meshes, free-tile check via neighbor lookup, raycast picking, orbit camera.
1006. **Triple Tide** `[2D]` — collect triples into small tray. *Build:* DOM layered tiles with z-index blocking, seven-slot tray array, auto-clear triples, tap input.
1007. **Coral Combo** `[2D]` — match reef creatures, free fish. *Build:* PixiJS match grid, cage tiles cleared by adjacent matches, bubble particle effects.
1008. **Swap Shift** `[2D]` — rows shift after each match. *Build:* Canvas grid, after each match cyclically rotate matched row, recheck runs, swipe input.
1009. **Jelly Jam** `[2D]` — clear jelly under matched tiles. *Build:* Canvas two-layer grid (tile plus jelly flag), level goal counter, touch swaps.
1010. **Domino Pairs** `[2D]` — pair dominoes summing to twelve. *Build:* DOM grid of domino divs, select two free pieces, validate pip sum, shuffle on stall.
1011. **Pixel Pairs** `[2D]` — match sprites linked by short paths. *Build:* Canvas grid, BFS path with max two turns between identical tiles, draw connecting line.
1012. **Bead Burst** `[2D]` — slide beads on wire loops. *Build:* Canvas circular loops as arrays, rotate loop by drag, detect three same beads at intersections.
1013. **Clockwork Gems** `[2D]` — gears rotate tile clusters. *Build:* PixiJS grid, click 2x2 gear rotates four tiles clockwise, then standard match scan.
1014. **Mosaic Mender** `[2D]` — match colors to restore mosaic. *Build:* Canvas match board; each clear paints one tile on hidden mosaic image overlay.
1015. **Bubble Trio** `[3D]` — pop three adjacent bubbles. *Build:* Three.js glossy spheres in hex grid, raycast clicks, cluster flood-fill, physics-ish fall tweens.
1016. **Spice Market** `[2D]` — match spices to fill orders. *Build:* DOM grid plus customer order queue, matched spice counts decrement orders, timer.
1017. **Frost Facets** `[2D]` — matches thaw frozen tiles. *Build:* Canvas grid with ice hit-points, adjacent matches reduce ice, frost spreads each turn.
1018. **Cookie Crumble** `[2D]` — gravity-flip cookie matching. *Build:* Canvas grid, button rotates gravity direction, refill from new top edge, match scan.
1019. **Tile Tango** `[2D]` — two boards swap tiles together. *Build:* two DOM grids sharing swaps mirrored; matches must resolve on both boards simultaneously.
1020. **Petal Pop** `[2D]` — bloom flowers by matching petals. *Build:* Canvas radial petal tiles around hubs, rotate hubs, full same-color flower clears.
1021. **Totem Triples** `[3D]` — stack totem faces in threes. *Build:* Three.js cylinder columns, rotate segments with arrow keys, horizontal triple faces vanish.
1022. **Shape Shuffle** `[2D]` — match shapes, not colors. *Build:* Canvas tiles with shape and color attributes, rule toggles each level, swipe swaps.
1023. **Lantern Link** `[2D]` — chain glowing lanterns by touch. *Build:* Canvas drag path over adjacent same-hue lanterns, min three, additive blend glow.
1024. **Moonstone Merge** `[2D]` — merge stones into bigger moons. *Build:* Canvas grid, drop stone, three connected same-tier merge upward via flood-fill.
1025. **Crystal Columns** `[3D]` — falling triplet column matcher. *Build:* Three.js well of cubes, falling 3-stack with cycle key, diagonal match detection, bloom.

## 42. Sliding & Rotating Puzzles — *DOM / CSS transforms*
1026. **Ring Twister** `[2D]` — rotate concentric rings to align. *Build:* SVG ring segments, drag rotation snapping to sectors, win when image aligns.
1027. **Tile Turnstile** `[2D]` — rotate 2x2 blocks to solve. *Build:* DOM grid, click corner pivot rotates four cells, BFS hint solver for small boards.
1028. **Hex Spinner** `[3D]` — spin hexagons to connect paths. *Build:* Three.js hex prism tiles with edge pipes, click rotates 60 degrees, BFS connectivity.
1029. **Sliding Snapshots** `[2D]` — slide photo pieces back. *Build:* DOM tiles with background-position slices, solvable shuffle via random legal moves.
1030. **Cube Slide** `[3D]` — sliding puzzle on cube faces. *Build:* Three.js cube with tile planes per face, empty slot wraps across edges, orbit controls.
1031. **Gearwheel Riddle** `[3D]` — rotate meshed gears to targets. *Build:* Three.js extruded gear meshes, raycast drag rotation, mesh graph propagates tooth ratios.
1032. **Row Roller** `[2D]` — cyclically shift rows and columns. *Build:* DOM grid, drag row or column to rotate array, CSS transition, move counter.
1033. **Klotski Keep** `[2D]` — free the large block. *Build:* DOM absolutely positioned blocks, drag with occupancy grid collision, BFS optimal move count.
1034. **Penguin Glide** `[2D]` — slide penguins until they hit. *Build:* Canvas grid, move until blocked, penguins act as stoppers, BFS level validator.
1035. **Ice Rink Escape** `[3D]` — slippery block sliding maze. *Build:* Three.js rink, block slides until wall, arrow keys, tween movement, isometric camera.
1036. **Dial Lock** `[2D]` — rotate dials to match pattern. *Build:* SVG dials where turning one rotates linked dials, modular arithmetic state.
1037. **Orbit Shuffle** `[2D]` — rotate planets around orbits. *Build:* Canvas overlapping circular orbits, rotate selected orbit's tokens by one slot.
1038. **Rotor Grid** `[2D]` — rotate tiles to form image. *Build:* DOM image fragments with random 90-degree rotations, click rotates, check all zero.
1039. **Spin Stack** `[3D]` — rotate stacked discs to align notches. *Build:* Three.js stacked cylinders with notch, drag spins disc, linked discs counter-rotate.
1040. **Pinwheel Path** `[2D]` — rotate pinwheels to make path. *Build:* Canvas cells with arm bitmasks, rotate on click, flood test from start.
1041. **Belt Shifter** `[2D]` — conveyor loops shift tiles. *Build:* Canvas belt loops as index cycles, button advances belt, shared cells across belts.
1042. **Carousel Cipher** `[2D]` — spin carousels to spell words. *Build:* DOM letter carousels, rotate to align columns, dictionary check per row.
1043. **Tilt Tiles** `[2D]` — slide all tiles one direction. *Build:* Canvas grid, arrow keys slide every tile until blocked, match goal layout.
1044. **Hexa Slide** `[2D]` — sliding puzzle on hex board. *Build:* Canvas hex grid with one gap, click adjacent tile to slide, solvable shuffle.
1045. **Compass Rose** `[3D]` — rotate needles to point north. *Build:* Three.js needle meshes on pedestals, click rotates linked row, linear-algebra solver hints.
1046. **Safe Cracker** `[3D]` — rotate tumblers in order. *Build:* Three.js safe dial mesh, drag rotation, Web Audio clicks near correct numbers.
1047. **Glide Garage** `[2D]` — slide cars out diagonally. *Build:* DOM rotated 45-degree grid, cars move along axis only, occupancy collision.
1048. **Pivot Pieces** `[2D]` — pieces rotate around fixed pins. *Build:* Canvas polyomino pieces pinned at cell, rotate if swept cells free.
1049. **Twister Torus** `[3D]` — slide rows on wraparound board. *Build:* Three.js torus textured with grid, shift rows and rings via UV offsets.
1050. **Swirl Sorter** `[2D]` — rotate quadrants to sort numbers. *Build:* DOM 4x4 grid, rotate any 2x2 quadrant, IDA* solver for hints.

## 43. Number Puzzles — *DOM*
1051. **Sum Snake** `[2D]` — trace path totaling target. *Build:* Canvas grid, drag path over orthogonal neighbors, live running sum display.
1052. **Prime Prowler** `[2D]` — find primes in number grid. *Build:* DOM grid of random numbers, Miller-Rabin check, timed tapping, score streaks.
1053. **Digit Drop** `[2D]` — falling digits sum to ten. *Build:* Canvas falling digit blocks, connect adjacent blocks summing to ten to clear.
1054. **Factor Forest** `[2D]` — split numbers into factor trees. *Build:* SVG tree nodes, click to split into chosen factor pair, prime leaves glow.
1055. **Magic Square Maker** `[2D]` — fill rows with equal sums. *Build:* DOM inputs, row/column/diagonal sum validation, generator from Siamese method.
1056. **Number Bridge** `[2D]` — connect equal sums across gap. *Build:* Canvas two columns, link numbers whose sums match target, line drawing.
1057. **Cage Calc** `[2D]` — arithmetic cage Latin square. *Build:* DOM grid with cage outlines, operation clues, backtracking generator ensures uniqueness.
1058. **Count Down** `[2D]` — reach target using six numbers. *Build:* DOM number tiles and operator buttons, recursive solver reveals best answer.
1059. **Hundred Hop** `[2D]` — hop board summing to hundred. *Build:* Canvas board, knight-style hops add cell values, reach exactly one hundred.
1060. **Fraction Fit** `[2D]` — combine fractions to make whole. *Build:* DOM fraction bars, drag into container, rational arithmetic with gcd reduction.
1061. **Calcudoku Daily** `[2D]` — daily arithmetic cage grid. *Build:* DOM grid, date-seeded PRNG generator, notes mode, localStorage streak.
1062. **Binary Bloom** `[2D]` — fill grid with ones and zeros. *Build:* DOM grid, no three in a row, balanced rows, unique rows validator.
1063. **Skyscraper Count** `[3D]` — place towers by visibility. *Build:* Three.js city blocks rising by value, edge clues, keyboard digit input.
1064. **Futoshiki Signs** `[2D]` — inequality-driven Latin square. *Build:* DOM grid with inequality markers, constraint propagation hint system.
1065. **Numberlink Loop** `[2D]` — connect numbers without crossing. *Build:* Canvas drag paths between equal numbers, fill every cell, path arrays.
1066. **Kakurasu Keys** `[2D]` — weighted row and column sums. *Build:* DOM grid, shaded cells contribute index weights, check edge totals.
1067. **Digit Dash** `[2D]` — make equations from digit pool. *Build:* DOM tiles, parse expression with shunting-yard, timed target rounds.
1068. **Equation Grid** `[2D]` — crossword of arithmetic equations. *Build:* DOM grid of numbers and operators, fill blanks, evaluate left-to-right.
1069. **Odd Even Out** `[2D]` — balance odds and evens. *Build:* DOM grid, each row and column needs equal odd/even counts, swap tiles.
1070. **Ten Tumble** `[2D]` — merge pairs summing to ten. *Build:* Canvas grid, drag rectangle around numbers summing ten to clear, timer.
1071. **Modulo Maze** `[2D]` — move by remainder rules. *Build:* Canvas grid maze, step allowed when value mod n matches current state.
1072. **Number Hive** `[2D]` — place digits in hexagon cells. *Build:* SVG hex rings, each hex ring of six contains 1-6, backtracking generator.
1073. **Abacus Puzzle** `[3D]` — reach totals with bead moves. *Build:* Three.js abacus rods and bead meshes, click slides beads, place value sum.
1074. **Divisor Drop** `[2D]` — clear tiles by divisibility. *Build:* Canvas falling numbers, pick divisor tile to clear all divisible neighbors.
1075. **Pyramid Sums** `[3D]` — fill number pyramid from base. *Build:* Three.js stacked cube pyramid, each cube equals two below, digit input.

## 44. Grid Logic (Nikoli-style) — *DOM / Canvas*
1076. **Slither Loop** `[2D]` — draw single loop around numbers. *Build:* Canvas dot lattice, click edges toggle, check single cycle and clue counts.
1077. **Akari Glow** `[2D]` — place lamps to light grid. *Build:* DOM grid, ray-cast light per row/column, wall clue counts, conflicts highlighted.
1078. **Heyawake Rooms** `[2D]` — shade cells within room rules. *Build:* DOM grid with room borders, connectivity BFS, three-room span check.
1079. **Nurikabe Isles** `[2D]` — separate islands with sea walls. *Build:* Canvas grid, flood-fill island sizes, no 2x2 sea pools, click shading.
1080. **Masyu Pearls** `[2D]` — loop through black and white pearls. *Build:* Canvas cell-center paths, drag to draw, pearl turn rules validation.
1081. **Shikaku Split** `[2D]` — divide grid into rectangles. *Build:* Canvas drag rectangles, each containing one number equal to its area.
1082. **Hitori Shade** `[2D]` — shade duplicates, keep connectivity. *Build:* DOM grid, no adjacent shaded cells, BFS unshaded connectivity.
1083. **Twin Stars** `[2D]` — place stars, two per row. *Build:* DOM grid with regions, two stars per row/column/region, no touching.
1084. **Tents & Trees** `[2D]` — pitch a tent beside each tree. *Build:* DOM grid, bipartite matching check, row/column tent count clues.
1085. **Yajilin Arrows** `[2D]` — shade cells and draw loop. *Build:* Canvas grid, arrow clues count shaded cells, loop through remaining cells.
1086. **Kurodoko View** `[2D]` — shade cells by sightlines. *Build:* DOM grid, numbers count visible cells orthogonally, connectivity check.
1087. **LITS Blocks** `[2D]` — place tetrominoes in regions. *Build:* Canvas region grid, shade four per region, no same shapes adjacent.
1088. **Fillomino Fill** `[2D]` — fill regions sized by numbers. *Build:* DOM grid, flood-fill regions size equals digit, same sizes not touching.
1089. **Norinori Pairs** `[2D]` — shade dominoes, two per region. *Build:* DOM grid, each region exactly two shaded, shaded cells form dominoes.
1090. **Fleet Finder** `[2D]` — deduce hidden fleet positions. *Build:* DOM grid, row/column counts plus revealed segments, ship list validator.
1091. **Suguru Cells** `[2D]` — fill regions with nonrepeating digits. *Build:* DOM grid with regions 1-N, no equal digits touching diagonally.
1092. **Tapa Trails** `[2D]` — shade walls by clue clusters. *Build:* Canvas grid, clue lists match neighbor run lengths, connected wall check.
1093. **Kropki Dots** `[2D]` — dots mark consecutive or double. *Build:* DOM Latin square with white/black dots between cells, constraint checker.
1094. **Hidato Chain** `[2D]` — number path through adjacent cells. *Build:* DOM grid with given numbers, fill consecutive chain via king moves.
1095. **Light and Shadow** `[2D]` — split grid into two shades. *Build:* Canvas grid, each colored region size matches its number clue.
1096. **Corral Count** `[2D]` — fence a single enclosed area. *Build:* Canvas cell shading, numbers count visible inside cells, single loop boundary.
1097. **Galaxy Spiral** `[2D]` — divide grid into symmetric galaxies. *Build:* Canvas edges, each region rotationally symmetric about its dot.
1098. **Aquarium Fill** `[2D]` — fill tanks to water level. *Build:* DOM grid tanks, water fills bottom-up per tank, row/column counts.
1099. **Thermo Sudoku** `[2D]` — digits rise along thermometers. *Build:* DOM Sudoku grid with SVG thermometer overlays, increasing-value check.
1100. **Binairo Blocks** `[3D]` — balance black and white tiles. *Build:* Three.js flip tiles with two-sided material, click flips, binary rules check.

## 45. Packing & Polyomino — *Canvas 2D*
1101. **Pentomino Pack** `[2D]` — fill box with twelve pentominoes. *Build:* Canvas drag pieces, R key rotates, F flips, occupancy grid snapping.
1102. **Suitcase Stuffer** `[3D]` — pack luggage before departure. *Build:* Three.js suitcase voxel grid, drag items, rotate keys, lid closes when fits.
1103. **Fridge Fit** `[2D]` — fit groceries into fridge shelves. *Build:* Canvas shelves with heights, irregular polyomino groceries, drag-snap placement.
1104. **Moving Day** `[3D]` — load truck with furniture shapes. *Build:* Three.js truck bed voxel grid, polycube furniture, rotate on three axes.
1105. **Quilt Patch** `[2D]` — fit fabric pieces into quilt. *Build:* Canvas grid with patterned piece textures, adjacency color bonus, drag placement.
1106. **Bento Box** `[2D]` — pack food shapes neatly. *Build:* Canvas compartments, food polyominoes must fit by type, scoring for neatness.
1107. **Shelf Squeeze** `[2D]` — arrange books on tight shelves. *Build:* DOM flex shelves, book widths sum to capacity, drag reorder, height limits.
1108. **Garden Plots** `[2D]` — fit flower beds into yard. *Build:* Canvas grid with trees as blockers, pieces need sunlight adjacency rule.
1109. **Cargo Hold** `[3D]` — pack spaceship cargo bay. *Build:* Three.js voxel bay, polycube crates, weight balance center-of-mass check.
1110. **Polyomino Patch** `[2D]` — cover board with given pieces. *Build:* Canvas irregular boards, Algorithm X exact-cover solver for hints.
1111. **Hex Packer** `[2D]` — fit hexomino shapes on hex grid. *Build:* Canvas axial hex coordinates, six rotations per piece, snap placement.
1112. **Puzzle Pantry** `[2D]` — stock pantry with odd jars. *Build:* Canvas shelves with circles approximated as cells, drag fit, overflow check.
1113. **Tray Trouble** `[2D]` — fit cookies onto baking tray. *Build:* Canvas tray grid, cookies expand when baked, plan spacing ahead.
1114. **Treasure Chest** `[2D]` — pack gold pieces into chest. *Build:* Canvas grid, pieces carry values, maximize value via limited space.
1115. **Iso Packer** `[3D]` — isometric 3D block packing. *Build:* Three.js orthographic camera, polycube pieces, layer slicing view toggle.
1116. **Circle Cram** `[2D]` — pack circles into a frame. *Build:* Canvas circles dragged freely, overlap test by distance, fit all within border.
1117. **Parking Planner** `[2D]` — fit vehicles into lot. *Build:* Canvas lot grid with lanes, vehicles must reach exit after placement BFS.
1118. **Domino Tiling** `[2D]` — cover board using only dominoes. *Build:* Canvas mutilated boards, click pairs of cells, parity hint coloring.
1119. **Island Builder** `[2D]` — assemble landmasses from tetrominoes. *Build:* Canvas ocean grid, placed pieces must connect, target silhouette shape.
1120. **Toy Box** `[3D]` — fit toys before lid closes. *Build:* Three.js box with cannon-es physics, drop toys, lid height check.
1121. **Shape Shelter** `[2D]` — fit animals into shelter pens. *Build:* Canvas pens, animal polyominoes, predator-prey adjacency restrictions.
1122. **Seat Planner** `[2D]` — seat wedding guests by shapes. *Build:* DOM table grid, guest groups as polyominoes, feud constraints checker.
1123. **Stamp Collector** `[2D]` — fit stamps into album page. *Build:* Canvas page grid, rectangular stamps with perforation gaps, drag fit.
1124. **Crate Crafter** `[3D]` — fill crates with zero gaps. *Build:* Three.js transparent crate, polycube placement via grid cursor, gap counter.
1125. **Trimino Tango** `[2D]` — tile board with L-triminoes. *Build:* Canvas 2^n board with one missing cell, divide-and-conquer hint.

## 46. Path & Line Drawing — *Canvas 2D*
1126. **One Stroke** `[2D]` — draw figure without lifting pen. *Build:* Canvas graph edges, drag along edges, Eulerian path degree check.
1127. **Rail Planner** `[2D]` — lay tracks connecting stations. *Build:* Canvas grid track tiles, drag draws track, simulate train along path.
1128. **Wire Weaver** `[2D]` — route circuit wires without crossing. *Build:* Canvas grid, drag orthogonal wires between pins, crossing detection.
1129. **Knight's Tour** `[2D]` — visit every square as knight. *Build:* DOM chessboard, legal move highlights, Warnsdorff heuristic hints.
1130. **Garden Hose** `[2D]` — route hose to every plant. *Build:* Canvas grid, hose length limit, path must pass adjacent to all plants.
1131. **Subway Sketch** `[2D]` — design non-crossing metro lines. *Build:* SVG stations, drag polylines at 45-degree angles, segment intersection checks.
1132. **Yarn Path** `[2D]` — thread yarn through every peg. *Build:* Canvas pegs, click order builds polyline, no segment crossings allowed.
1133. **Firefly Trail** `[2D]` — connect fireflies in order. *Build:* Canvas moving fireflies, draw path through numbered ones before they fade.
1134. **Dot Dash** `[2D]` — connect dots in single path. *Build:* Canvas grid of dots, drag visits all once, Hamiltonian validity check.
1135. **Ant Highway** `[2D]` — draw paths for marching ants. *Build:* Canvas spline paths, ants follow polylines, collisions at crossings fail.
1136. **River Route** `[3D]` — carve river to the sea. *Build:* Three.js heightmap terrain, drag lowers vertices, water flows downhill simulation.
1137. **Isle Linker** `[2D]` — link islands with straight lines. *Build:* Canvas islands, straight orthogonal bridges, count clues, no crossings.
1138. **Postman Path** `[2D]` — visit every street once. *Build:* SVG street graph, click edges in order, Chinese postman optimal comparison.
1139. **Hamilton Hike** `[3D]` — visit each node exactly once. *Build:* Three.js polyhedron vertices, raycast clicks, edges highlight path order.
1140. **Kite Strings** `[2D]` — untangle crossing kite lines. *Build:* Canvas line endpoints draggable on ground, count intersections to zero.
1141. **Light Trail** `[2D]` — trace glowing path over tiles. *Build:* Canvas grid, cells require exact visit counts, drag path decrements.
1142. **Ink Flow** `[2D]` — draw lines, ink limited. *Build:* Canvas freehand lines become Matter.js static bodies, ball rolls to goal.
1143. **Thread the Needle** `[2D]` — draw route through narrow gaps. *Build:* Canvas freehand path, polyline-vs-obstacle collision, then replay ball.
1144. **Bee Line** `[2D]` — guide bees to matching flowers. *Build:* Canvas drawn paths per bee, simultaneous movement, collision timing check.
1145. **Fence Line** `[2D]` — enclose sheep with one fence. *Build:* Canvas grid edges, closed loop check, point-in-polygon for sheep and wolves.
1146. **Ladder Lines** `[2D]` — draw ladder rungs to reroute. *Build:* SVG vertical lines, add horizontal rungs, simulate amidakuji descent mapping.
1147. **Plumber's Pencil** `[2D]` — sketch pipes connecting tanks. *Build:* Canvas grid drag paths, color mixing where pipes merge, flow simulation.
1148. **Zigzag Zone** `[2D]` — paths may only turn right. *Build:* Canvas grid, drag path validates turn direction, reach exit cell.
1149. **Snail Trail** `[2D]` — snail never crosses its slime. *Build:* Canvas grid, arrow-key movement, visited set blocks, fill-all goal.
1150. **Untangle Graph** `[2D]` — drag nodes until no crossings. *Build:* Canvas planar graph generator, draggable nodes, segment intersection counting.

## 47. Light, Lasers & Optics — *Canvas 2D*
1151. **Prism Split** `[2D]` — split white light into colors. *Build:* Canvas ray tracing with refraction per wavelength, place prisms, color sensors.
1152. **Beam Bender** `[2D]` — rotate mirrors to hit sensors. *Build:* Canvas grid, ray march with mirror reflections, click rotates 45 degrees.
1153. **Lens Lab** `[2D]` — focus light with convex lenses. *Build:* Canvas thin-lens ray equations, drag lenses on rail, focus point target.
1154. **Shadow Caster** `[3D]` — position lamps to shape shadows. *Build:* Three.js shadow maps, drag point lights, compare shadow render to template.
1155. **Refraction Run** `[2D]` — bend beams through glass blocks. *Build:* Canvas Snell's law ray tracing, polygon glass blocks, drag placement.
1156. **Photon Path** `[2D]` — guide photons around obstacles. *Build:* Canvas moving photon particles, place deflectors, timing-based routing.
1157. **Periscope Puzzle** `[3D]` — align mirrors to see target. *Build:* Three.js render targets as mirror views, rotate mirrors to show target.
1158. **Laser Lock** `[3D]` — open vault with beam combos. *Build:* Three.js vault room, line beams with bloom, toggle emitters, sensors check exact beam set.
1159. **Beacon Sweep** `[2D]` — rotate beams to guide ships. *Build:* Canvas rotating light cone, ships steer toward lit areas, reefs fail.
1160. **Color Filter** `[2D]` — mix beams through colored glass. *Build:* Canvas RGB bitmask beams, filters AND masks, combiners OR masks.
1161. **Splitter Grid** `[2D]` — duplicate beams with half-mirrors. *Build:* Canvas grid ray tracer with recursive branching, loop detection set.
1162. **Solar Sails** `[2D]` — reflect sunlight to power ships. *Build:* Canvas sun rays, rotatable panels, energy integrates per frame.
1163. **Disco Dazzle** `[3D]` — aim lasers at dance floor. *Build:* Three.js line beams with bloom, rotate disco mirror ball, hit target tiles.
1164. **Fiber Optic** `[2D]` — route light through cables. *Build:* Canvas grid cable tiles, rotate tiles, total internal reflection corner pieces.
1165. **Moonbeam Mirrors** `[2D]` — reflect moonlight to flowers. *Build:* Canvas moving moon angle over time, mirrors placed before nightfall.
1166. **Polar Puzzle** `[2D]` — rotate polarizers to block light. *Build:* Canvas Malus's law intensity calculation, drag polarizer angles.
1167. **Kaleido Beam** `[2D]` — beams inside kaleidoscope chamber. *Build:* Canvas polygonal mirror chamber, ray bounces limited, target hits.
1168. **Sunbeam Garden** `[2D]` — redirect sunlight to grow plants. *Build:* Canvas day cycle, mirror tiles, plants accumulate light growth.
1169. **Shadow Match** `[3D]` — rotate object to match silhouette. *Build:* Three.js abstract mesh, drag rotate, compare projected shadow pixels.
1170. **Laser Maze Heist** `[2D]` — sneak through moving laser grids. *Build:* Canvas rotating laser lines, player AABB vs segment checks, WASD.
1171. **Beam Portal** `[2D]` — beams pass through linked portals. *Build:* Canvas ray tracer with portal pairs remapping position and direction.
1172. **Spectrum Lock** `[2D]` — match spectral lines to unlock. *Build:* Canvas emission spectra bars, combine elements to match target lines.
1173. **Prism Tower** `[3D]` — stack prisms to hit summit. *Build:* Three.js stacked prism meshes, 3D ray-plane refraction, rotate prisms.
1174. **Refract Reef** `[2D]` — guide light into underwater caves. *Build:* Canvas water surface refraction, wave offsets animate beam angle.
1175. **Lamp Lattice** `[2D]` — light every tile with angles. *Build:* Canvas grid lamps cast cones, polygon visibility, cover all tiles.

## 48. Physics Puzzles — *Matter.js*
1176. **Rope Snip** `[2D]` — cut ropes to drop candy. *Build:* Matter.js constraint chains, swipe line intersects constraints, remove them.
1177. **Domino Drop** `[3D]` — topple chain to ring bell. *Build:* Three.js plus cannon-es dominoes, place spacing, push first domino.
1178. **Seesaw Solve** `[2D]` — balance loads to launch ball. *Build:* Matter.js revolute seesaw, drop weights, ball launches toward goal.
1179. **Balloon Lift** `[2D]` — pop balloons to lower cargo. *Build:* Matter.js buoyant bodies with upward forces, click to pop.
1180. **Pulley Problem** `[2D]` — lift weights with pulleys. *Build:* Matter.js constraints simulating rope length, mechanical advantage calculation.
1181. **Marble Chute** `[3D]` — build tracks for marbles. *Build:* Three.js track pieces snap on grid, cannon-es marble rolls through.
1182. **Bounce Bridge** `[2D]` — place springs to cross gap. *Build:* Matter.js high-restitution pads, ball trajectory, limited placements.
1183. **Wrecking Wonder** `[3D]` — swing ball to topple tower. *Build:* Three.js plus cannon-es pendulum, release angle, knock all blocks.
1184. **Water Wheel** `[2D]` — redirect water to turn wheel. *Build:* Canvas particle fluid, place deflectors, wheel torque from impacts.
1185. **Catapult Craft** `[3D]` — tune catapult to hit target. *Build:* Three.js catapult model, cannon-es projectile, sliders tune counterweight and release angle.
1186. **Magnet Maze** `[2D]` — toggle magnets to move ball. *Build:* Matter.js inverse-square attraction forces, click toggles magnets.
1187. **Plank Placer** `[2D]` — place planks so ball rolls home. *Build:* Matter.js static rotatable planks, play button releases ball.
1188. **Ragdoll Rescue** `[2D]` — guide ragdoll to safety. *Build:* Matter.js composite ragdoll, remove obstacles to land softly.
1189. **Bubble Float** `[2D]` — float objects with bubbles. *Build:* Matter.js bubbles apply buoyancy to enclosed bodies, pop timing.
1190. **Contraption Lab** `[2D]` — chain-reaction machine builder. *Build:* Matter.js parts palette, drag-place, run simulation, goal sensor.
1191. **Cut and Fall** `[2D]` — slice shapes to drop pieces. *Build:* Canvas polygon splitting by swipe line, new Matter.js bodies.
1192. **Wind Tunnel** `[2D]` — fans push ball to goal. *Build:* Matter.js force fields in fan cones, rotate and toggle fans.
1193. **Hammock Drop** `[2D]` — catch egg without breaking. *Build:* Matter.js soft-body net via constraints, impact velocity threshold.
1194. **Sand Pour** `[2D]` — direct falling sand into cup. *Build:* Canvas cellular sand automaton, draw lines as walls.
1195. **Pendulum Puzzle** `[2D]` — time swings to hit buttons. *Build:* Matter.js pendulums, release order timing, button sensors.
1196. **Jelly Bridge** `[2D]` — soft bodies bridge the gap. *Build:* Matter.js soft-body composites, stack jellies to span gap.
1197. **Gear Drive** `[3D]` — connect gears to power machine. *Build:* Three.js gear meshes on pegboard, mesh adjacency graph, rotation ratio propagation.
1198. **Cannon Clear** `[3D]` — knock all blocks off platform. *Build:* Three.js plus cannon-es blocks, aim cannon with mouse, limited shots.
1199. **Spring Shot** `[2D]` — compress springs to launch. *Build:* Matter.js spring constraint stiffness, drag to compress, aim projectile.
1200. **Teeter Tumble** `[2D]` — tilt platforms to roll ball. *Build:* Matter.js kinematic platforms rotated by keys, ball navigation.

## 49. Hidden Object & Spot the Difference — *DOM / Canvas*
1201. **Odd One Out** `[2D]` — find tile that differs. *Build:* Canvas grid of procedural shapes, one variant parameter, shrinking difference.
1202. **Twin Scenes** `[2D]` — spot ten differences. *Build:* Canvas two procedurally generated scenes, modify ten objects, click hitboxes.
1203. **Attic Search** `[3D]` — find items in cluttered attic. *Build:* Three.js room with scattered meshes, raycast click checklist, orbit camera.
1204. **Pixel Detective** `[2D]` — spot changed pixels. *Build:* Canvas pixel art pair, ImageData diff, click within radius.
1205. **Crowd Seeker** `[3D]` — find character in busy crowd. *Build:* Three.js instanced low-poly crowd, unique target outfit, orbit zoom, raycast pick.
1206. **Night Lens** `[3D]` — flashlight reveals hidden objects. *Build:* Three.js dark room, SpotLight follows mouse raycast, click hidden objects to collect.
1207. **Shape Seeker** `[2D]` — find hidden shapes in patterns. *Build:* SVG overlapping line art, click outlines of target shape.
1208. **Magnifier Mystery** `[2D]` — zoom to find tiny clues. *Build:* Canvas high-res image, magnifier lens drawImage subregion follows cursor.
1209. **Garage Sale Hunt** `[2D]` — find items on shopping list. *Build:* DOM image map hitboxes, list crosses off, timer and hints.
1210. **Mirror Mismatch** `[2D]` — find asymmetric details. *Build:* Canvas symmetric scene with altered half, click mismatched detail.
1211. **Camouflage Critters** `[2D]` — spot animals blending in. *Build:* Canvas noise textures, animals drawn with matching palette, subtle edges.
1212. **Flicker Spot** `[2D]` — differences flash briefly. *Build:* Canvas alternating frames with blank gap, change-blindness paradigm, click change.
1213. **Shadow Hunt** `[2D]` — match objects to shadows. *Build:* Canvas silhouettes generated via fill black, drag objects onto shadows.
1214. **Silhouette Seek** `[3D]` — find objects from outlines. *Build:* Three.js scene, outline postprocessing on target meshes, raycast pick.
1215. **Junk Drawer** `[2D]` — find tools in messy drawer. *Build:* Matter.js pile of items, drag shuffle to uncover targets.
1216. **Lost Letters** `[2D]` — find hidden letters in scene. *Build:* SVG scene with rotated letter glyphs embedded, click to collect.
1217. **Clock Clues** `[2D]` — spot wrong time details. *Build:* DOM scene with clocks, shadows, lamps, find inconsistent time cue.
1218. **Market Stall** `[2D]` — find items before closing. *Build:* Canvas side-scrolling market, list of goods, countdown timer.
1219. **Underwater Finder** `[3D]` — spot creatures in coral. *Build:* Three.js reef scene with fog, swim camera, raycast on hidden fish.
1220. **Bookcase Hunt** `[2D]` — find books by spine clues. *Build:* DOM shelves of generated spines, clues describe color and title.
1221. **Sky Gazer** `[3D]` — find constellations in starfield. *Build:* Three.js celestial sphere of stars, drag-look camera, click stars to connect constellations.
1222. **Zoom Out** `[2D]` — guess scene from extreme closeup. *Build:* Canvas cropped image region expands each wrong guess, text input.
1223. **Pattern Glitch** `[2D]` — find break in repeating pattern. *Build:* Canvas tiled pattern, one tile mutated, click detection.
1224. **Dust Off** `[2D]` — brush away dust to find relics. *Build:* Canvas dust layer erased by pointer drag, reveal percentage.
1225. **Change Blind** `[2D]` — detect slow-morphing changes. *Build:* Canvas scene with one property lerping slowly, click changed object.

## 50. Memory & Brain Training — *DOM*
1226. **Card Flip Recall** `[3D]` — classic memory card pairs. *Build:* Three.js card meshes with flip tweens, raycast click, pair matching.
1227. **Sequence Echo** `[2D]` — repeat growing color sequence. *Build:* DOM four pads, Web Audio tones, sequence array grows each round.
1228. **Grid Recall** `[2D]` — remember lit squares. *Build:* DOM grid flashes pattern, input clicks, grid size scales up.
1229. **Face Names** `[2D]` — match faces to names. *Build:* Canvas procedural cartoon faces, name list study phase, recall quiz.
1230. **Number Span** `[2D]` — recall digit strings. *Build:* DOM flashing digits, input field, forward and backward modes.
1231. **Stroop Sprint** `[2D]` — name ink, not word. *Build:* DOM colored word display, color buttons, reaction time logging.
1232. **Path Recall** `[2D]` — retrace shown path. *Build:* Canvas grid animates path, user drags replay, compare cell sequence.
1233. **Speed Match** `[2D]` — is card same as previous. *Build:* DOM symbol cards, yes/no arrow keys, accuracy and speed scoring.
1234. **N-Back Ninja** `[2D]` — dual n-back training. *Build:* DOM grid positions plus Web Speech letters, adaptive n level.
1235. **Object Count** `[2D]` — count flashed objects. *Build:* Canvas random shapes shown 500ms, numeric input, increasing counts.
1236. **Shopping List** `[2D]` — remember items in order. *Build:* DOM item icons shown sequentially, drag to reorder from memory.
1237. **Mental Rotate** `[3D]` — are shapes rotated twins. *Build:* Three.js polycube pairs, random rotations or mirror, same/different keys.
1238. **Quick Math** `[2D]` — rapid-fire arithmetic. *Build:* DOM generated problems, keypad input, 60-second timer, difficulty ramp.
1239. **Symbol Swap** `[2D]` — decode symbol-digit pairs. *Build:* DOM key table, symbol prompts, type matching digits fast.
1240. **Trail Maker** `[2D]` — connect alternating numbers and letters. *Build:* Canvas scattered circles, click sequence 1-A-2-B, timing.
1241. **Tone Recall** `[2D]` — repeat musical note sequences. *Build:* Tone.js synth, on-screen piano keys, sequence playback and input.
1242. **Word Recall** `[2D]` — memorize then pick words. *Build:* DOM study list, distractor grid later, recognition scoring.
1243. **Map Memory** `[3D]` — recall city layout. *Build:* Three.js low-poly town flyover, then place landmarks on top-down map from memory.
1244. **Peripheral Pop** `[2D]` — spot flashes in peripheral vision. *Build:* Canvas fixation center task, peripheral targets, click location.
1245. **Reaction Ruler** `[3D]` — test reaction time. *Build:* Three.js falling ruler mesh, press key to catch, distance converts to ms.
1246. **Spatial Span** `[2D]` — tap blocks in order. *Build:* Canvas irregular block layout, Corsi sequence highlight, replay input.
1247. **Color Recall** `[2D]` — rebuild colored grid from memory. *Build:* DOM grid with palette, study phase, paint from memory.
1248. **Story Recall** `[2D]` — answer questions after reading. *Build:* DOM short generated stories from templates, multiple-choice quiz.
1249. **Focus Filter** `[2D]` — ignore distractors, find target. *Build:* Canvas visual search arrays, target present or absent keys.
1250. **Brain Bench** `[3D]` — daily mixed cognitive tests. *Build:* Three.js hub room with stations, each launches DOM minigame, stats chart.

## 51. Mini Escape Rooms — *DOM / Point-and-click*
1251. **Locked Lab** `[3D]` — escape science lab. *Build:* Three.js room, raycast interactables, inventory array, chemical mixing puzzle.
1252. **Attic Exit** `[2D]` — find key in dusty attic. *Build:* DOM layered scenes, clickable hotspots, inventory drag-and-drop combine.
1253. **Submarine Hatch** `[2D]` — open hatch before flooding. *Build:* DOM panels with valve puzzles, water level timer overlay.
1254. **Clockmaker's Shop** `[2D]` — solve gear puzzles. *Build:* SVG gear trains, set clock hands to reveal codes, hotspots.
1255. **Library Lockdown** `[2D]` — decode book clues. *Build:* DOM shelves, book titles form acrostic code, keypad lock.
1256. **Train Car Escape** `[3D]` — escape moving train. *Build:* Three.js carriage interior, scrolling landscape outside, raycast puzzles.
1257. **Greenhouse Gate** `[2D]` — plant puzzles unlock door. *Build:* DOM plant pots, watering order logic, color bloom code.
1258. **Elevator Stuck** `[2D]` — fix elevator panel. *Build:* DOM wiring panel, swap wires to match schematic, floor button code.
1259. **Pharaoh's Tomb** `[3D]` — hieroglyph puzzles to exit. *Build:* Three.js torch-lit chamber, rotate glyph blocks, PointerLockControls.
1260. **Space Pod** `[3D]` — restart pod systems to escape. *Build:* Three.js cockpit interior, raycast panels, power routing puzzle, oxygen countdown.
1261. **Kitchen Locked** `[2D]` — recipe clues open door. *Build:* DOM kitchen hotspots, recipe quantities form lock digits.
1262. **Cabin Fever** `[3D]` — snowed-in cabin puzzles. *Build:* Three.js cabin with fireplace light, raycast items, inventory combine.
1263. **Museum Night** `[2D]` — escape after closing time. *Build:* DOM gallery rooms, painting details give codes, guard patrol timer.
1264. **Haunted Nursery** `[2D]` — toys hide the clues. *Build:* DOM scene, music box tune puzzle with Web Audio, hidden drawers.
1265. **Lighthouse Lock** `[2D]` — climb and escape lighthouse. *Build:* DOM floors connected by stairs, lens rotation puzzle at top.
1266. **Mansion Study** `[3D]` — secret bookcase exit. *Build:* Three.js study, pull books in order, bookcase slide animation.
1267. **Bank Vault** `[3D]` — crack vault mechanism. *Build:* Three.js vault door, drag dial rotation, Web Audio clicks near numbers, keypad mesh.
1268. **Ship Cabin** `[2D]` — nautical knot and map puzzles. *Build:* DOM sea chart coordinates puzzle, rope knot sequence matching.
1269. **Toy Box Escape** `[3D]` — escape as tiny toy. *Build:* Three.js oversized room scale, third-person toy, physics push puzzles.
1270. **Observatory** `[3D]` — star chart unlocks dome. *Build:* Three.js starfield dome, rotate telescope camera to align constellations revealing code.
1271. **Bakery Backroom** `[2D]` — ovens hide codes. *Build:* DOM oven dials, temperature and timer combos, recipe card clues.
1272. **Puzzle Box** `[3D]` — open nested puzzle boxes. *Build:* Three.js box with sliding panels, drag panels in sequence, nested reveal.
1273. **Laundry Room** `[2D]` — washers hide combinations. *Build:* DOM machine panels, sock color pattern gives combination.
1274. **Music Room** `[2D]` — piano notes open lock. *Build:* Tone.js piano, sheet music clue, correct melody triggers door.
1275. **Treehouse Hideout** `[2D]` — kid-made traps and codes. *Build:* DOM hand-drawn scenes, secret handshake sequence, pulley crate.

## 52. Sorting & Organizing — *DOM / Canvas*
1276. **Tube Tidy** `[2D]` — sort colored balls into tubes. *Build:* Canvas tube stacks as arrays, top-ball moves, solvability via BFS.
1277. **Water Sort** `[2D]` — pour liquids until uniform. *Build:* Canvas layered tubes, pour animation, capacity checks, undo stack.
1278. **Bookshelf Order** `[2D]` — alphabetize books on shelves. *Build:* DOM draggable spines, sortable list, minimal-swap scoring.
1279. **Sock Sorter** `[2D]` — pair socks quickly. *Build:* Canvas procedural sock patterns, drag pairs to basket, timer.
1280. **Screw Sort** `[3D]` — unscrew and sort bolts. *Build:* Three.js plates held by screws, raycast unscrew, color boxes collect.
1281. **Closet Organizer** `[2D]` — hang clothes by type. *Build:* DOM rails with categories, drag hangers, rule cards per level.
1282. **Recycling Rush** `[3D]` — sort trash into bins. *Build:* Three.js conveyor belt, raycast drag items into bins, speed ramps up.
1283. **Mail Room** `[2D]` — route letters by zip code. *Build:* DOM pigeonholes, read envelope codes, keyboard shortcuts for slots.
1284. **Spice Rack** `[2D]` — arrange jars by color. *Build:* DOM rack grid, swap jars, gradient order check via hue.
1285. **Card Deck Sort** `[2D]` — sort cards with few moves. *Build:* DOM four piles, move top cards, target order by suit.
1286. **Pancake Flip** `[2D]` — sort stack by flipping. *Build:* Canvas stack, click spatula position reverses prefix, optimal count.
1287. **Train Yard** `[3D]` — sort wagons onto tracks. *Build:* Three.js rail sidings, shunting locomotive moves, stack-based sidings.
1288. **Bubble Sorter** `[2D]` — sort by swapping neighbors. *Build:* Canvas bar heights, adjacent swap only, compare with algorithm count.
1289. **Tidy Desk** `[3D]` — organize desk items. *Build:* Three.js desk scene, drag items into drawer outlines, snap placement and sounds.
1290. **Brick Bins** `[2D]` — sort bricks by shape. *Build:* Canvas falling bricks, drag to bins by stud count, combo streaks.
1291. **Gem Drawer** `[2D]` — sort gems by cut and color. *Build:* DOM grid drawer, two-attribute rows and columns, swap tiles.
1292. **Library Return** `[2D]` — reshelve books by code. *Build:* DOM decimal call numbers, insert into sorted shelf, binary search hints.
1293. **Fish Tank Sort** `[3D]` — move fish into tanks. *Build:* Three.js tanks with boid fish, click fish to transfer, species sorting.
1294. **Parking Valet** `[2D]` — park cars by color. *Build:* Canvas one-lane lots acting as stacks, move cars between lots.
1295. **Bead Strings** `[2D]` — sort beads onto strings. *Build:* Canvas strings as queues, beads enter one end, exit the other.
1296. **Nut and Bolt** `[3D]` — match nuts onto bolts. *Build:* Three.js bolt stacks, nuts move top-only, color grouping goal.
1297. **Pill Organizer** `[2D]` — fill weekly pill box. *Build:* DOM seven-day box, prescription rules, drag pills to compartments.
1298. **Archive Clerk** `[2D]` — file documents by date. *Build:* DOM cabinet drawers, parse varied date formats, drag folders.
1299. **Penny Wrapper** `[2D]` — sort coins into rolls. *Build:* Canvas coin pile, drag coins by denomination, roll fills at count.
1300. **Wardrobe Wipe** `[2D]` — fold and stack laundry. *Build:* Canvas swipe folding gestures, stack by type and color.

## 53. Chain Reactions — *Canvas 2D*
1301. **Boom Chain** `[2D]` — one tap triggers explosions. *Build:* Canvas drifting dots, expanding radius explosions, overlap triggers neighbors.
1302. **Firework Fuse** `[3D]` — chain fireworks across sky. *Build:* Three.js Points particle bursts, burst particles ignite nearby rockets, bloom pass.
1303. **Domino Rally** `[3D]` — design toppling chains. *Build:* Three.js plus cannon-es, place dominoes along drawn curve, tip first.
1304. **Pop Spread** `[2D]` — burst spreads to neighbors. *Build:* Canvas grid counters, overflow at capacity spreads, recursive queue.
1305. **Critical Mass** `[2D]` — atoms split and cascade. *Build:* Canvas grid cells with capacity by neighbor count, two-player turns.
1306. **Bubble Blast Chain** `[2D]` — bubbles trigger bubbles. *Build:* Canvas bubbles fire four droplets on pop, droplets hit others.
1307. **Spark Circuit** `[2D]` — sparks ignite fuse network. *Build:* Canvas graph of fuses with burn speeds, Dijkstra timing visualization.
1308. **Ripple Effect** `[2D]` — waves knock buoys together. *Build:* Canvas wave equation height grid, buoys tip on amplitude threshold.
1309. **Firecracker Field** `[2D]` — place one match to clear. *Build:* Canvas cellular grass fire spread, wind direction, firecracker blasts.
1310. **Cascade Coins** `[3D]` — coins tip coin stacks. *Build:* Three.js plus cannon-es pusher machine, drop coins, edge spills.
1311. **Virus Vector** `[2D]` — infect cells in chain. *Build:* Canvas cell agents, infection radius spread, one click seed.
1312. **Pinball Burst** `[2D]` — bumpers trigger bumpers. *Build:* Matter.js balls spawned by bumper hits, chain counting.
1313. **Glow Burst** `[2D]` — glowing orbs light neighbors. *Build:* Canvas orbs with charge, lit orb transfers charge by distance.
1314. **Mousetrap Mayhem** `[2D]` — traps spring other traps. *Build:* Matter.js traps launching balls, place traps to hit all.
1315. **Snowball Slide** `[3D]` — snowballs grow and knock. *Build:* Three.js slope, rolling sphere scales with distance, cannon-es collisions.
1316. **Bottle Rocket** `[2D]` — rockets trigger rockets. *Build:* Canvas rocket trajectories, explosion radius ignites others, aim first one.
1317. **Kaboom Grid** `[2D]` — bombs blast in crosses. *Build:* Canvas grid bombs with range, cross-shaped propagation queue.
1318. **Seed Burst** `[2D]` — pods scatter seeds that burst. *Build:* Canvas seed projectiles with gravity, landing seeds grow pods.
1319. **Neural Spark** `[2D]` — neurons fire into network. *Build:* Canvas graph, threshold integrate-and-fire neurons, set weights.
1320. **Orbital Collapse** `[3D]` — orbits destabilize in chain. *Build:* Three.js n-body Verlet integration, nudge one moon, cascade collisions.
1321. **Lantern Release** `[2D]` — lanterns light lanterns. *Build:* Canvas rising lanterns with wind drift, flame spreads on proximity.
1322. **Fuse Box** `[2D]` — route fuses to detonate all. *Build:* Canvas grid fuse tiles rotate, BFS burn propagation from match.
1323. **Balloon Pop Chain** `[2D]` — pins pop balloon clusters. *Build:* Matter.js balloons release pins on pop, pins fly.
1324. **Nova Nest** `[2D]` — stars supernova into neighbors. *Build:* Canvas star masses, explosion adds mass to neighbors over threshold.
1325. **Rocket Relay** `[3D]` — rockets launch next rockets. *Build:* Three.js launch pads, rocket arcs, landing triggers next pad.

## 54. Ciphers & Codes — *DOM*
1326. **Caesar Shift** `[2D]` — decode shifted alphabets. *Build:* DOM rotating alphabet wheel, shift slider, live decrypt preview.
1327. **Cryptogram Club** `[2D]` — solve substitution quotes. *Build:* DOM letter inputs mapping, random permutation key, quote list.
1328. **Morse Master** `[2D]` — decode beeps and dots. *Build:* Web Audio oscillator beeps, tap spacebar to transmit, timing decoder.
1329. **Vigenere Vault** `[2D]` — crack keyword cipher. *Build:* DOM tabula recta, Kasiski hint tool, keyword guess input.
1330. **Pigpen Puzzle** `[2D]` — decode symbol grid cipher. *Build:* SVG pigpen glyphs drawn from grid segments, mapping input.
1331. **Semaphore Signals** `[3D]` — read flag positions. *Build:* Three.js figure with flag arms, angle pairs map letters, quiz.
1332. **Rotor Room** `[3D]` — rotor machine decoding. *Build:* Three.js rotor wheels, stepping rotor and reflector simulation, set rings.
1333. **Book Code** `[2D]` — decode via page and line. *Build:* DOM paginated public-domain text, page-line-word triplets to words.
1334. **Rail Fence** `[2D]` — zigzag transposition cipher. *Build:* Canvas zigzag grid visualization, rail count guess, decode.
1335. **Binary Messages** `[2D]` — decode bits to text. *Build:* DOM toggle bit rows, ASCII conversion preview, message unlock.
1336. **Braille Reader** `[2D]` — decode tactile dot patterns. *Build:* DOM six-dot cells, toggle dots, Unicode Braille mapping.
1337. **Codebreaker Pegs** `[3D]` — deduce hidden peg code. *Build:* Three.js peg board, raycast placement, black/white feedback logic.
1338. **Atbash Mirror** `[2D]` — reverse alphabet cipher. *Build:* DOM mirrored alphabet strips, drag letters to decode quotes.
1339. **Hex Decoder** `[2D]` — convert hex to message. *Build:* DOM hex dump viewer, highlight bytes, conversion table helper.
1340. **Spy Drop** `[2D]` — decode dead-drop notes. *Build:* DOM city map hotspots, layered cipher clues lead to next drop.
1341. **Glyph Translator** `[2D]` — learn alien alphabet. *Build:* Canvas procedural glyphs, deduce mapping from context sentences.
1342. **Frequency Hunter** `[2D]` — crack via letter frequency. *Build:* DOM bar chart of letter counts, drag-to-assign substitution.
1343. **Playfair Puzzle** `[2D]` — digraph square cipher. *Build:* DOM 5x5 key square editor, digraph decryption rules applied.
1344. **Keypad Code** `[2D]` — phone keypad letter codes. *Build:* DOM retro keypad, multi-tap sequences decode, T9 dictionary hint.
1345. **Stego Scan** `[2D]` — find messages hidden in images. *Build:* Canvas getImageData, toggle bit-plane views, reveal hidden text.
1346. **Route Cipher** `[2D]` — read grid in spiral. *Build:* DOM letter grid, select reading route patterns, live output.
1347. **Anagram Agent** `[2D]` — unscramble secret phrases. *Build:* DOM draggable letter tiles, dictionary check, timed missions.
1348. **Polybius Square** `[2D]` — coordinate letter cipher. *Build:* DOM 5x5 grid, number pairs highlight letters, decode input.
1349. **Number Station** `[2D]` — decode radio number broadcasts. *Build:* Web Speech number readout, one-time pad sheet, subtract mod 10.
1350. **Bacon Code** `[2D]` — two-typeface hidden message. *Build:* DOM text with two fonts, mark A/B, five-bit decoding.

## 55. Programming Puzzles — *DOM / Blockly*
1351. **Robo Coder** `[2D]` — program robot with command blocks. *Build:* Blockly workspace, interpret commands step-by-step on Canvas grid.
1352. **Loop Lab** `[2D]` — solve levels with loops. *Build:* DOM drag blocks with nested repeat, block count limit, animated run.
1353. **Function Forest** `[2D]` — reuse functions to navigate. *Build:* DOM main plus two function slots, recursion allowed, call stack.
1354. **Assembly Ace** `[2D]` — tiny assembly language puzzles. *Build:* DOM code editor, custom interpreter with registers, input/output tapes.
1355. **Logic Gate Lab** `[2D]` — build circuits from gates. *Build:* SVG drag gates and wires, topological evaluation, truth table goals.
1356. **Turtle Draw** `[2D]` — draw shapes with turtle commands. *Build:* Canvas turtle interpreter, compare drawn pixels to target.
1357. **Regex Ranger** `[2D]` — write regex to match words. *Build:* DOM match and avoid lists, live RegExp testing, length scoring.
1358. **Queue Quest** `[2D]` — manage stack and queue puzzles. *Build:* DOM visual stack and queue, push/pop commands to reorder.
1359. **Bot Factory** `[3D]` — program assembly line arms. *Build:* Three.js robot arms, simple command script, timeline simulation.
1360. **Recursion Rift** `[2D]` — solve with recursive calls. *Build:* Canvas fractal targets, recursive draw rules editor, depth slider.
1361. **State Machine** `[2D]` — design automata for strings. *Build:* SVG state nodes and arrows, simulate DFA on test strings.
1362. **Bug Squasher** `[2D]` — fix broken code snippets. *Build:* DOM code editor, sandboxed iframe runs tests, pass/fail list.
1363. **Sort Bots** `[2D]` — program robots to sort items. *Build:* DOM compare-and-swap instructions, run on random arrays, step count.
1364. **Cellular Coder** `[2D]` — write rules for automata. *Build:* Canvas grid, rule table editor, match target pattern after N steps.
1365. **Conveyor Code** `[2D]` — program conveyors to deliver. *Build:* Canvas grid conveyor tiles with conditionals, item simulation.
1366. **Packet Router** `[2D]` — program routers for packets. *Build:* SVG network graph, routing table entries, animated packet delivery.
1367. **Binary Builder** `[2D]` — build adders from gates. *Build:* SVG gate editor, reusable subcircuits, automatic test vectors.
1368. **Shader Golf** `[3D]` — shortest code to match image. *Build:* WebGL fragment shader editor, pixel diff score, char count.
1369. **Drone Script** `[3D]` — script drone deliveries. *Build:* Three.js city, JS-like command API sandbox, drones animate paths.
1370. **Code Golf Mini** `[2D]` — shortest solution wins. *Build:* DOM editor, Web Worker sandboxed eval, tests, character count leaderboard.
1371. **Event Wiring** `[2D]` — connect triggers to actions. *Build:* SVG node graph, event propagation simulation, door and light outputs.
1372. **Lambda Lane** `[2D]` — compose functions to transform. *Build:* DOM function cards chained, map/filter on item lists, match output.
1373. **Memory Machine** `[2D]` — program registers to compute. *Build:* DOM register machine, increment/decrement/jump instructions, interpreter.
1374. **Pathfinder AI** `[2D]` — write pathfinding heuristic. *Build:* Canvas grid, user heuristic function sandbox, A* visualization.
1375. **Spreadsheet Puzzle** `[2D]` — formulas solve challenges. *Build:* DOM grid cells, tiny formula parser with dependency graph.

## 56. Color Puzzles — *Canvas 2D*
1376. **Flood Fill** `[2D]` — flood board in fewest moves. *Build:* Canvas grid, color buttons, flood-fill from corner, move limit.
1377. **Hue Order** `[2D]` — arrange tiles by gradient. *Build:* DOM tiles with bilinear interpolated colors, swap, fixed anchors.
1378. **Color Mixer** `[2D]` — mix paints to match swatch. *Build:* DOM sliders, subtractive pigment mixing approximation, Delta-E score.
1379. **Paint Roller** `[3D]` — roll paint over every tile. *Build:* Three.js grid, rolling cube paints tiles, swipe direction moves.
1380. **Chroma Chain** `[2D]` — connect similar hues. *Build:* Canvas dot grid, link dots within hue threshold, chain length scoring.
1381. **Gradient Grid** `[2D]` — restore scrambled gradient. *Build:* Canvas 2D gradient tiles shuffled, drag swap, corners fixed.
1382. **Tint Shift** `[2D]` — shift hues to match target. *Build:* Canvas tiles, row and column hue rotation buttons, HSL math.
1383. **Palette Match** `[2D]` — guess hex code of color. *Build:* DOM color swatch, hex input, distance feedback, five guesses.
1384. **Color Wheel** `[2D]` — rotate wheel to match complements. *Build:* SVG color wheel rings, rotate to align opposite hues.
1385. **Dye Vats** `[2D]` — dip cloth to reach color. *Build:* DOM vats, RGB multiply blending per dip, minimal dips.
1386. **Spectrum Sort** `[2D]` — sort beads by wavelength. *Build:* Canvas beads, wavelength to RGB conversion, drag order.
1387. **Ink Blend** `[2D]` — overlap inks to form colors. *Build:* Canvas multiply composite layers, drag shapes to overlap target.
1388. **Pixel Painter** `[2D]` — color pixels by number clues. *Build:* Canvas paint-by-number, clue numbers per cell, zoom and pan.
1389. **Rainbow Bridge** `[3D]` — build bridge in spectral order. *Build:* Three.js plank meshes, colors sorted, hero walks across when ordered.
1390. **Dot Plate Test** `[2D]` — find number in dots. *Build:* Canvas circle packing, digits drawn by hue contrast, input answer.
1391. **Swatch Stack** `[2D]` — stack translucent swatches. *Build:* Canvas alpha compositing layers, reorder stack to match target.
1392. **Hue Hunt** `[2D]` — find slightly different shade. *Build:* DOM grid tiles, one tile offset lightness, shrinking delta.
1393. **Chameleon Path** `[2D]` — change color to cross tiles. *Build:* Canvas grid, walk only matching tiles, color-swap pads.
1394. **Color Lock** `[2D]` — combine filters to open lock. *Build:* DOM filter cards as RGB masks, combine to match lock.
1395. **Stained Glass** `[2D]` — fill panes with right tints. *Build:* SVG Voronoi panes, adjacent panes must differ, palette constraint.
1396. **Shade Ladder** `[2D]` — order shades from light to dark. *Build:* DOM sortable list, perceptual lightness via Lab conversion.
1397. **Neon Flood** `[2D]` — spread neon colors to fill. *Build:* Canvas two-player flood territory, turn-based color picks.
1398. **Color Bomb** `[2D]` — mix colors to neutralize. *Build:* Canvas color blobs, combine complements to grey, clear board.
1399. **Opposite Hues** `[2D]` — pair complementary colors. *Build:* DOM cards with hues, pair within 180 degree tolerance.
1400. **Tone Tiles** `[3D]` — match tiles by lightness only. *Build:* Three.js tile grid with varied hues, grayscale toggle hint, swaps.

## 57. Mirror & Symmetry — *Canvas 2D*
1401. **Mirror Draw** `[2D]` — complete symmetrical drawing. *Build:* Canvas freehand stroke mirrored across axis, overlap score vs target.
1402. **Reflection Walk** `[2D]` — two characters move mirrored. *Build:* Canvas split grid, one input moves both mirrored, both exits.
1403. **Symmetry Fill** `[2D]` — make grid symmetric. *Build:* DOM grid toggle cells, axis chosen per level, fewest toggles.
1404. **Kaleido Craft** `[2D]` — build kaleidoscope patterns. *Build:* Canvas wedge drawing replicated by rotation and reflection transforms.
1405. **Half Picture** `[2D]` — draw missing half. *Build:* Canvas pixel grid, paint the other half, compare mirrored cells.
1406. **Fold Finder** `[3D]` — predict folded paper shape. *Build:* Three.js paper plane mesh folds via vertex rotation, choose result.
1407. **Mirror Maze** `[2D]` — navigate with reflected controls. *Build:* Canvas maze, inputs mirror horizontally in zones, WASD.
1408. **Rotation Check** `[2D]` — spot rotational symmetry. *Build:* Canvas generated patterns, choose order of rotational symmetry.
1409. **Twin Walkers** `[2D]` — guide two mirrored walkers. *Build:* Canvas two grids, obstacles differ, coordinated movement puzzle.
1410. **Paper Cutter** `[2D]` — fold and cut to match pattern. *Build:* Canvas fold layers, polygon cut, unfold by reflecting cuts.
1411. **Axis Hunter** `[2D]` — find all symmetry axes. *Build:* Canvas shapes, drag lines, check reflection invariance of vertices.
1412. **Mirror Tiles** `[2D]` — place mirrors to complete picture. *Build:* Canvas half-images, place mirror line to reconstruct target.
1413. **Flip Grid** `[2D]` — flip rows to make symmetric. *Build:* DOM grid, reverse rows or columns, achieve symmetry state.
1414. **Snowflake Design** `[3D]` — design six-fold symmetric flakes. *Build:* Three.js extruded shape from drawn wedge, six-fold replication.
1415. **Inkblot Match** `[2D]` — match inkblot halves. *Build:* Canvas random blobs mirrored, choose matching half among decoys.
1416. **Reverse World** `[2D]` — mirrored world platform puzzle. *Build:* Phaser 3 two layers, flip between mirrored platforms, key toggle.
1417. **Mandala Maker** `[2D]` — rotational symmetry painting. *Build:* Canvas drawing replicated N times around center, goal templates.
1418. **Echo Steps** `[2D]` — mirrored character copies moves. *Build:* Canvas grid, clone mirrors moves with delay, both on plates.
1419. **Butterfly Wings** `[2D]` — paint matching wing patterns. *Build:* SVG wing regions, paint left, match hidden right pattern.
1420. **Point Reflect** `[2D]` — reflect shapes through points. *Build:* Canvas coordinate plane, drag center point, overlay target.
1421. **Lake Reflection** `[3D]` — fix wrong reflections. *Build:* Three.js scene with planar reflection, find mismatched reflected objects.
1422. **Tessellate** `[2D]` — create tiling patterns. *Build:* Canvas edit tile edges with translation symmetry, preview tiling.
1423. **Mirror Shards** `[3D]` — reassemble broken mirror. *Build:* Three.js reflective shard meshes, rotate and place pieces until reflections align.
1424. **Glide Pattern** `[2D]` — complete glide-reflection friezes. *Build:* Canvas frieze strip, place motifs, check frieze group.
1425. **Symmetry Sudoku** `[2D]` — grid with mirrored constraints. *Build:* DOM Sudoku, mirrored cell pairs share parity, solver check.

## 58. Gravity & Tilt Puzzles — *Matter.js / DeviceOrientation*
1426. **Tilt Maze** `[3D]` — tilt board to roll ball. *Build:* Three.js board, DeviceOrientation or mouse tilt, cannon-es ball.
1427. **Gravity Flip** `[2D]` — switch gravity direction. *Build:* Phaser 3 arcade physics, key flips gravity vector, spike levels.
1428. **Rotate World** `[2D]` — rotate level to drop ball. *Build:* Matter.js world gravity rotates with level, arrow keys.
1429. **Labyrinth Tilt** `[3D]` — avoid holes on tilting board. *Build:* Three.js wooden board, tilt controls, ball falls through holes.
1430. **Marble Drop** `[3D]` — rotate board to sink marble. *Build:* Three.js box maze, rotate board 90 degrees, marble slides cell by cell under gravity.
1431. **Comet Nudge** `[2D]` — place wells to guide comet. *Build:* Canvas inverse-square attractors, Verlet integration, place and launch.
1432. **Upside Down** `[2D]` — flip gravity to escape. *Build:* Phaser 3 tilemap, character walks on ceiling, switch timing.
1433. **Sand Tilt** `[2D]` — tilt to pour sand into molds. *Build:* Canvas falling-sand automaton with rotating gravity direction.
1434. **Orbit Drop** `[3D]` — release ball into planet orbits. *Build:* Three.js planets with gravity, release timing, orbital capture.
1435. **Slime Slide** `[2D]` — tilt to steer slime blob. *Build:* Matter.js soft-body slime, accelerometer or arrow tilt.
1436. **Pinball Tilt** `[2D]` — nudge table to sink balls. *Build:* Matter.js table, nudge impulse, tilt penalty meter.
1437. **Liquid Level** `[2D]` — tilt container to fill cups. *Build:* Canvas SPH-lite particles, rotate container with mouse.
1438. **Gravity Swap** `[2D]` — swap gravity between objects. *Build:* Matter.js per-body gravity scale, click toggles direction.
1439. **Rolling Cube** `[3D]` — roll cube to exit. *Build:* Three.js cube rolls on edges, pivot rotation tween, tile switches.
1440. **Tilt Tower** `[3D]` — tilt board to stack pieces. *Build:* Three.js plus cannon-es, tilt platform to slide blocks.
1441. **Spin Maze** `[3D]` — circular maze rotates. *Build:* Three.js extruded circular maze, rotate maze around ball, cannon-es gravity.
1442. **Falling Blocks Tilt** `[2D]` — tilt so blocks fill gaps. *Build:* Canvas grid, tilt shifts gravity, blocks slide to fill.
1443. **Anti-Gravity** `[2D]` — float items to ceiling targets. *Build:* Matter.js negative gravity zones, place zones then play.
1444. **Bubble Level** `[2D]` — level the bubble precisely. *Build:* Canvas spirit level, DeviceOrientation input, hold steady timer.
1445. **Gravity Ball** `[2D]` — guide ball through gravity zones. *Build:* Matter.js zones with different vectors, draw zones.
1446. **Coin Roll** `[3D]` — tilt to roll coins into slots. *Build:* Three.js tilting table, cannon-es coins roll into slots, mouse or tilt input.
1447. **Tumble Box** `[3D]` — rotate box to sort balls. *Build:* Three.js transparent box, cannon-es balls, rotate box, holes by color.
1448. **Moon Gravity** `[2D]` — low gravity puzzle platformer. *Build:* Phaser 3 low gravity, momentum puzzles, crate stacking.
1449. **Black Hole** `[2D]` — tilt space to avoid black holes. *Build:* Canvas gravity sinks, tilt input applies acceleration.
1450. **Drip Drop** `[2D]` — tilt to merge water droplets. *Build:* Canvas metaball droplets, tilt gravity, merge on contact.

## 59. Stacking & Balancing — *Matter.js*
1451. **Tower Stack** `[3D]` — stack swinging blocks high. *Build:* Three.js swinging slab, tap to drop, trim overhang, camera rises.
1452. **Balance Beam** `[2D]` — keep beam level with weights. *Build:* Matter.js beam on pivot, drag weights, torque balance.
1453. **Rock Cairn** `[3D]` — balance stones into cairn. *Build:* Three.js plus cannon-es irregular stones, drag place, settle check.
1454. **Block Pull** `[3D]` — remove blocks without collapse. *Build:* Three.js plus cannon-es tower, drag blocks out, stability check.
1455. **Cake Stacker** `[2D]` — stack cake layers perfectly. *Build:* Canvas moving layer, tap drop, overhang trims, combo for perfect.
1456. **Animal Pile** `[3D]` — stack animals into tower. *Build:* Three.js plus cannon-es convex animal meshes, drop from crane, height goal.
1457. **Mobile Maker** `[2D]` — balance hanging mobile. *Build:* Canvas tree of arms, torque equilibrium math, place weights.
1458. **Crate Tower** `[3D]` — stack irregular crates. *Build:* Three.js plus cannon-es irregular crates, rotate before drop, orbit camera.
1459. **Plate Spinner** `[3D]` — stack plates on spinning pole. *Build:* Three.js pole wobble, click to spin plates, decay timers.
1460. **Scales of Justice** `[2D]` — balance weights on scales. *Build:* DOM two pans, find odd weight in few weighings.
1461. **Card House** `[3D]` — build house of cards. *Build:* Three.js plus cannon-es thin boxes, place in leaning pairs.
1462. **Pancake Tower** `[2D]` — stack wobbly pancakes. *Build:* Matter.js soft pancake composites, drop on moving plate.
1463. **Ice Stack** `[2D]` — stack slippery ice cubes. *Build:* Matter.js low friction bodies, melting shrinks over time.
1464. **Book Balance** `[2D]` — overhang books off table. *Build:* Matter.js stacked books, maximize overhang harmonic series.
1465. **Burger Builder** `[2D]` — stack ingredients in order. *Build:* Canvas falling ingredients, catch with bun, order recipe.
1466. **Totem Tower** `[2D]` — stack totem pieces upright. *Build:* Matter.js carved pieces, balance center of mass.
1467. **Cup Pyramid** `[3D]` — stack cups into pyramid. *Build:* Three.js cup meshes snap into pyramid slots, click placement, speed stacking timer.
1468. **Counterweight** `[2D]` — balance crane with counterweights. *Build:* Canvas crane torque, slide counterweight, lift loads.
1469. **Skyscraper Stack** `[3D]` — drop floors on swaying tower. *Build:* Three.js tower with sway oscillation, timing drops.
1470. **Moon Rocks** `[2D]` — stack rocks in low gravity. *Build:* Matter.js low gravity, slow settle, height target.
1471. **Seesaw Stack** `[2D]` — balance both sides of seesaw. *Build:* Matter.js seesaw pivot, alternate drops, tilt limit.
1472. **Bridge Balance** `[2D]` — keep bridge level under load. *Build:* Matter.js truss bridge, move supports as trucks cross.
1473. **Tipping Point** `[2D]` — remove items without tipping. *Build:* Matter.js stacked structure, click remove, tip detection.
1474. **Gift Wrap Stack** `[2D]` — stack presents under tree. *Build:* Matter.js boxes of various sizes, drag place, stability.
1475. **Feather Balance** `[2D]` — balance feathers on wind. *Build:* Canvas feathers with drag, blow with mouse, keep aloft.

## 60. Daily Puzzle Formats — *DOM / Vanilla JS*
1476. **Word Pentad** `[2D]` — guess five-letter word daily. *Build:* DOM six-row grid, date-seeded word, letter feedback colors.
1477. **Daily Grid** `[2D]` — new logic grid each day. *Build:* DOM generated puzzle seeded by date, streak in localStorage.
1478. **Pocket Crossword** `[2D]` — five-by-five crossword. *Build:* DOM grid, clue list, keyboard navigation, timer.
1479. **Daily Quartets** `[2D]` — group sixteen words into four. *Build:* DOM tiles, select four, mistakes counter, share result.
1480. **Target Tally** `[2D]` — reach target number. *Build:* DOM six numbers, operator buttons, solver checks best possible.
1481. **Outline Atlas** `[2D]` — guess country by outline. *Build:* SVG country paths from GeoJSON, guesses show distance and bearing.
1482. **Tune Teaser** `[2D]` — guess song from notes. *Build:* Tone.js melody snippets, longer each guess, autocomplete input.
1483. **Blur Reveal** `[2D]` — guess blurred image. *Build:* Canvas CSS blur reduces per guess, public-domain image set.
1484. **Shortcut Daily** `[2D]` — find shortest path. *Build:* Canvas weighted grid, user path vs Dijkstra optimal score.
1485. **Mate in Two** `[2D]` — solve daily chess puzzle. *Build:* DOM chessboard, chess.js move validation, puzzle database.
1486. **Emoji Phrase** `[2D]` — guess phrase from emojis. *Build:* DOM emoji clue, fuzzy text matching, hint reveals.
1487. **Year Guesser** `[2D]` — guess year from events. *Build:* DOM event clues, slider guess, closeness scoring.
1488. **Word Ladder Daily** `[2D]` — word ladder start to end. *Build:* DOM steps, dictionary check, one-letter change validation.
1489. **Quote Crypt** `[2D]` — decode daily quote. *Build:* DOM cryptogram, substitution inputs, date-seeded quote.
1490. **Hive Letters** `[2D]` — make words from letters. *Build:* DOM hexagon of seven letters, center required, dictionary scoring.
1491. **Trivia Five** `[2D]` — five questions per day. *Build:* DOM quiz, JSON question bank, share streak emoji grid.
1492. **Next in Line** `[2D]` — guess next item in sequence. *Build:* DOM sequence display, pattern types, multiple choice.
1493. **Shape Shadow** `[3D]` — reconstruct shape from hints. *Build:* Three.js daily voxel shape, three projections as clues, build voxels.
1494. **Distance Dart** `[2D]` — guess distance between cities. *Build:* DOM city pairs, haversine formula, slider guess.
1495. **Price Pinch** `[2D]` — guess product price. *Build:* DOM product card, higher/lower feedback, five tries.
1496. **Hue of the Day** `[2D]` — guess color from hint. *Build:* DOM HSL sliders, Delta-E scoring against daily color.
1497. **Anagram Daily** `[2D]` — solve daily anagram. *Build:* DOM scrambled letters, tap order, timer and streak.
1498. **Clue Chain** `[2D]` — deduce answer from clues. *Build:* DOM clues revealed one by one, fewer clues higher score.
1499. **Equation Daily** `[2D]` — solve daily equation. *Build:* DOM equation guessing like word game, operator feedback.
1500. **Riddle Box** `[3D]` — answer daily riddle. *Build:* Three.js box unlocks with answer, fuzzy match, reveal animation.

## 61. Endless Runners — *Kaboom.js / Canvas 2D*
1501. **Rooftop Courier** `[2D]` — leap skyscrapers delivering urgent parcels. *Build:* Kaboom.js side-scroller, procedural rooftop gaps, jump/hold-glide on space, parcel timer.
1502. **Tidal Sprint** `[3D]` — outrun a rising tsunami wave. *Build:* Three.js chase camera, wave mesh advancing behind, lane-based obstacles, arrow keys to steer.
1503. **Lighthouse Leap** `[2D]` — run along a stormy pier. *Build:* Canvas 2D procedural pier planks, wave hazards on timers, jump and slide keys.
1504. **Sandstorm Sprinter** `[2D]` — dash dunes before sand swallows. *Build:* Canvas 2D, Perlin-noise dune heightmap, encroaching sand wall, tap to jump dunes.
1505. **Chicken Run Riot** `[2D]` — escape the farm, dodge pitchforks. *Build:* Kaboom.js runner, random pitchfork and dog spawners, jump/duck keys, egg coin pickups.
1506. **Lane Shifter** `[3D]` — three-lane swipe dodging traffic. *Build:* Three.js three-lane road, pooled car meshes, swipe or arrow lane switching, speed ramp.
1507. **Volcano Dash** `[2D]` — sprint across cooling lava crust. *Build:* Canvas 2D tiles that cool over time arrays, jump on space, crust-crack timers.
1508. **Subway Phantom** `[2D]` — ghost phasing through train cars. *Build:* Canvas 2D train interior chunks, phase toggle with cooldown, collision skipped while phasing.
1509. **Polar Panic** `[3D]` — penguin belly-slides past orcas. *Build:* Three.js icy slope, belly-slide physics with friction, orca jump-attack telegraphs, tilt steering.
1510. **Gravity Lane** `[2D]` — flip ceiling and floor mid-run. *Build:* Canvas 2D runner, gravity sign flip on tap, procedural floor/ceiling spike pattern.
1511. **Torch Bearer** `[2D]` — keep flame lit through rain. *Build:* Kaboom.js runner, flame meter drains in rain zones, shelter pickups refill, jump/duck keys.
1512. **Paper Boy Blitz** `[2D]` — toss papers while sprinting suburbs. *Build:* Canvas 2D side-scroller, mailbox targets, mouse-aim newspaper throws with arc physics.
1513. **Shadow Stride** `[2D]` — stay inside moving shadows. *Build:* Canvas 2D runner, moving shadow polygons, point-in-polygon check drains light meter outside.
1514. **Desert Train Hop** `[2D]` — jump between speeding freight cars. *Build:* Phaser 3 arcade physics, speeding wagon tiles, jump between cars, tunnel duck prompts.
1515. **Jungle Vine Dash** `[2D]` — swing and slide through canopy. *Build:* Phaser 3 runner, vine anchors with pendulum swing, slide under logs, tap timing.
1516. **Skate Grind City** `[2D]` — grind rails for combo speed. *Build:* Kaboom.js runner, rail grind detection, combo multiplier increases scroll speed, ollie on space.
1517. **Haunted Hallway** `[3D]` — endless corridor with shifting doors. *Build:* Three.js first-person corridor, door segments pooled and randomized, WASD dodge spooks.
1518. **Asteroid Belt Run** `[2D]` — astronaut hops drifting rocks. *Build:* Canvas 2D, drifting rock bodies, low-gravity jump arcs, oxygen meter, mouse aim jumps.
1519. **Glacier Getaway** `[3D]` — outrun cracking ice sheets. *Build:* Three.js third-person runner, crack shader on ice tiles, tiles fall after timers, arrow keys.
1520. **Balloon Bound** `[2D]` — float upward avoiding birds. *Build:* Canvas 2D vertical scroller, hold to rise, release to sink, bird flock spawners.
1521. **Night Market Dash** `[2D]` — weave through crowded stalls. *Build:* Canvas 2D crowd sprites as obstacles, lane weaving, food pickups boost speed.
1522. **Rainbow Road Rush** `[2D]` — color-match lanes to survive. *Build:* Canvas 2D lanes colored randomly, press number key to match player color in time.
1523. **Cyber Courier** `[3D]` — data runner dodging firewalls. *Build:* Three.js neon tunnel, firewall gates with gaps, mouse steering, bloom post-processing.
1524. **Sewer Slider** `[2D]` — rat surfing on sewer currents. *Build:* Canvas 2D flowing water scroller, board tilt with arrow keys, grate and pipe obstacles.
1525. **Thief on Rooftops** `[2D]` — loot-grabbing endless chase. *Build:* Kaboom.js rooftop runner, loot bags add weight slowing jumps, police searchlight chase.

## 62. Beat-'em-ups — *Phaser 3*
1526. **Alley Brawlers** `[2D]` — side-scrolling street fight duo. *Build:* Phaser 3 belt-scroller, depth sorting by y, combo state machine, two-player keyboard split.
1527. **Pizza Punchers** `[2D]` — delivery crew fights mob goons. *Build:* Phaser 3 brawler, pizza-box throwables, enemy wave triggers per screen, punch/kick/jump keys.
1528. **Kung Fu Corridor** `[2D]` — one-lane hallway fistfight. *Build:* Phaser 3 single-lane fighter, enemies approach both sides, left/right attack timing.
1529. **Robot Riot Street** `[2D]` — scrap rogue robots by hand. *Build:* Phaser 3 brawler, robot part damage sprites, scrap currency, grab-and-throw mechanic.
1530. **Barroom Bash** `[2D]` — saloon brawl with breakable furniture. *Build:* Phaser 3 arcade physics, destructible chairs/bottles as pickups, knockback through tables.
1531. **Samurai Sweep** `[2D]` — swordsman clears bandit villages. *Build:* Phaser 3 brawler, stance switching, enemy wave spawner per village scene, slash combos.
1532. **Neon Knuckles** `[2D]` — synthwave city gang beatdown. *Build:* PixiJS brawler, neon glow filters, synthwave background parallax, juggle combo system.
1533. **Wrestle Mania Town** `[3D]` — suplex enemies across streets. *Build:* Three.js low-poly street, ragdoll throws via cannon-es, grab and suplex button prompts.
1534. **Pirate Plank Brawl** `[2D]` — ship-deck melee against crews. *Build:* Phaser 3 tilting deck, crew waves, plank pushes enemies overboard, cutlass combos.
1535. **Granny Fists** `[2D]` — grandma kung fu avenger. *Build:* Phaser 3 brawler, cane and handbag attacks, special kung fu meter, enemy waves.
1536. **Subway Scrap** `[3D]` — fight across moving train cars. *Build:* Three.js train top, scrolling scenery, tunnel duck timing, punch combos with raycast hits.
1537. **Mall Rat Rumble** `[2D]` — shopping mall gang showdown. *Build:* Phaser 3 multi-floor mall stages, escalator travel, shop-item weapons, gang boss fights.
1538. **Viking Raid Rush** `[2D]` — axe-swinging coastal brawler. *Build:* Phaser 3 longship coast levels, axe throw and recall, shield block, rage meter.
1539. **Clown Car Clash** `[2D]` — circus-themed slapstick brawler. *Build:* Phaser 3 brawler, pie throws, honk stun, clown car summons, slapstick knockback.
1540. **Lumberjack Justice** `[2D]` — axe-wielding forest brawler. *Build:* Phaser 3 forest levels, axe weapons, falling-tree hazard, chop to make bridges.
1541. **Office Uprising** `[2D]` — staplers versus corporate goons. *Build:* Phaser 3 office cubicle levels, stapler projectiles, printer traps, boss is CEO.
1542. **Dojo Defenders** `[2D]` — protect dojo from rival schools. *Build:* Phaser 3 single-screen defense, rival waves enter dojo, kicks and throws, health bar.
1543. **Bigfoot Brawl** `[2D]` — cryptid smashes hunters' camp. *Build:* Phaser 3 brawler, giant sasquatch sprite, smash tents and trucks, roar stun area.
1544. **Zombie Fistfight** `[3D]` — punch-only undead brawler. *Build:* Three.js isometric streets, zombie hordes instanced, punch combos, grab-and-throw, stamina meter.
1545. **Monk Path** `[2D]` — pacifist parries, counter-throw only. *Build:* Phaser 3, parry-only input window, counter-throw enemies into each other, no attack button.
1546. **Cyber Ronin** `[3D]` — katana combos in megacity. *Build:* Three.js neon city, katana slash arcs as trail meshes, dash cancel combos, gamepad API.
1547. **Food Fight Frenzy** `[2D]` — cafeteria brawler with food weapons. *Build:* Phaser 3 cafeteria, food items with different arcs, tray block, splat decals.
1548. **Knightfall Melee** `[2D]` — armored knight belt-scroller. *Build:* Phaser 3 castle belt-scroller, armor durability, heavy and light attack combos.
1549. **Junkyard Dogs** `[2D]` — scrapyard brawling with tires. *Build:* Phaser 3 junkyard, tires and pipes as weapons, car crusher hazard, dog enemies.
1550. **Disco Dukes** `[2D]` — groove-powered beatdown on dancefloor. *Build:* Phaser 3 disco floor, beat-synced attacks via Web Audio clock, groove meter power.

## 63. 1v1 Fighting — *Phaser 3 / Canvas 2D*
1551. **Stick Clash** `[2D]` — stick-figure combo fighting. *Build:* Canvas 2D stick figures from line joints, input buffer combos, hitbox/hurtbox rectangles.
1552. **Pixel Fists** `[2D]` — retro sprite fighter with specials. *Build:* Phaser 3 sprite fighter, frame-based hitboxes, quarter-circle special input parser, AI opponent.
1553. **Elemental Duel Arena** `[2D]` — fire versus water fighters. *Build:* Phaser 3 fighter, element matchups via damage multiplier table, special projectiles, two-player keys.
1554. **Mecha Mash** `[3D]` — giant robot one-on-one bouts. *Build:* Three.js arena, robot models with joint animations, punch raycasts, part damage meter.
1555. **Sword Stance** `[2D]` — one-hit-kill timing duel. *Build:* Canvas 2D, both fighters stand still, react to flash, first input wins.
1556. **Kitchen Knockout** `[2D]` — chefs fight with utensils. *Build:* Phaser 3 kitchen stage, spatula and pan weapons, hazard stoves, combo inputs.
1557. **Ink Brawl** `[2D]` — calligraphy brush fighters. *Build:* Canvas 2D brush stroke trails as hitboxes, mouse-drawn special attacks, ink meter.
1558. **Shadow Box Duel** `[2D]` — silhouette fighters, parry focus. *Build:* Canvas 2D silhouettes, parry window frames, counter attacks, local two-player keyboard.
1559. **Lucha Libre Lite** `[2D]` — masked wrestlers, aerial throws. *Build:* Phaser 3 ring with ropes, rope bounce physics, aerial dives, pin countdown.
1560. **Wizard Fistcuffs** `[2D]` — spell inputs via combo strings. *Build:* Phaser 3, combo strings parsed into spells by lookup table, mana bar, projectiles.
1561. **Rooster Rumble** `[2D]` — feathered fighters peck and kick. *Build:* Phaser 3, peck and flying kick moves, feather particle effects, best-of-three rounds.
1562. **Samurai Showdown Lite** `[2D]` — draw-first standoff duels. *Build:* Canvas 2D standoff, random draw cue delay, reaction timing decides one-hit kill.
1563. **Cardboard Kombat** `[2D]` — box-costume kids fight. *Build:* Phaser 3 fighter, cardboard armor breaks per hit, backyard stages, two-player keys.
1564. **Gladius Duel** `[3D]` — gladiators with weapon swapping. *Build:* Three.js coliseum, weapon pickups change move sets, block/attack stances, crowd meter.
1565. **Tiny Titans** `[3D]` — miniature heroes on tabletops. *Build:* Three.js tabletop diorama, tiny figurine fighters, orbit camera, combo input buffer.
1566. **Hex Fighters** `[2D]` — rune-casting combo fighter. *Build:* Phaser 3, rune symbols drawn with mouse gestures recognized via $1 unistroke algorithm.
1567. **Slime Sparring** `[2D]` — squishy blobs grab and bounce. *Build:* Matter.js soft-body slimes, grab/throw via constraints, bounce knockouts off walls.
1568. **Pillow Punch** `[2D]` — sleepover pillow-fight duels. *Build:* Canvas 2D bedroom stage, pillow knockback, feather particles, stun meter, two players.
1569. **Frame Trap** `[2D]` — fighting game with frame-data training. *Build:* Phaser 3 fighter with frame-data overlay, hitbox visualizer, training dummy recording playback.
1570. **Robo Boxer** `[2D]` — boxing bots with part damage. *Build:* Canvas 2D boxing ring, robot parts with hp, swap parts between rounds, AI opponent.
1571. **Kaiju Clash** `[3D]` — monsters fight across city blocks. *Build:* Three.js city blocks with destructible buildings, kaiju models, grab and throw specials.
1572. **Mirror Match** `[2D]` — fight a copy of yourself. *Build:* Phaser 3, AI replays recorded player inputs from previous round as opponent.
1573. **Bo Staff Duel** `[2D]` — reach-based staff fighting. *Build:* Phaser 3, long reach staff hitboxes, spacing-focused AI, sweep and vault moves.
1574. **Retro Arcade Fighter** `[2D]` — 16-bit-style six-button fighter. *Build:* Phaser 3 retro fighter, six-button layout, gamepad API, CRT shader post-effect.
1575. **Dojo Duel Online** `[2D]` — peer-to-peer two-player fighter. *Build:* Phaser 3 fighter, PeerJS WebRTC, rollback netcode with input delay buffer.

## 64. Stealth — *Phaser 3 / Canvas 2D*
1576. **Silent Vault** `[2D]` — crack safes past laser guards. *Build:* Phaser 3 top-down, laser beams as rotating raycasts, safe dial minigame with mouse.
1577. **Cat Burglar Night** `[2D]` — sneak through mansion rooftops. *Build:* Canvas 2D side-view mansion, rooftop pathing, guard patrol waypoints, noise radius.
1578. **Ninja Lantern** `[2D]` — avoid light cones, strike unseen. *Build:* Phaser 3 top-down, guard vision cones via raycast polygons, backstab when behind.
1579. **Museum Heist** `[3D]` — swap artifacts without alarms. *Build:* Three.js museum rooms, weight-swap puzzle on pedestals, camera frustum detection, WASD.
1580. **Cookie Thief** `[2D]` — sneak snacks past sleeping parents. *Build:* Canvas 2D house, sleeping parents wake on noise meter, creaky floorboard tiles.
1581. **Shadow Courier** `[2D]` — deliver secrets past patrols. *Build:* Phaser 3 city map, A* patrol routes, line-of-sight checks, delivery objectives.
1582. **Camouflage Chameleon** `[2D]` — change colors to blend in. *Build:* Canvas 2D, background tile color sampled, player matches hue via keys to hide.
1583. **Prison Break Quiet** `[2D]` — escape cells without detection. *Build:* Phaser 3 prison tilemap, guard schedules, cell key items, detection meter.
1584. **Noise Meter** `[2D]` — every footstep makes sound ripples. *Build:* Canvas 2D, footsteps emit expanding ripple circles, guards investigate ripple origins.
1585. **Spy Embassy** `[2D]` — infiltrate parties wearing disguises. *Build:* Phaser 3 top-down party, disguise system, NPC suspicion meters, keycard doors.
1586. **Ghost Protocol Lite** `[2D]` — hack cameras, loop feeds. *Build:* DOM camera feed panel plus Canvas map, loop feeds on timer, guard AI.
1587. **Mouse in House** `[2D]` — dodge cats and traps. *Build:* Canvas 2D house, cat AI pathfinding toward noise, cheese pickups, trap tiles.
1588. **Sneak Peek** `[2D]` — peek corners before moving. *Build:* Phaser 3, hold key to peek reveals hidden area via raycast fog of war.
1589. **Fox Henhouse** `[2D]` — steal eggs from guarded coop. *Build:* Canvas 2D farm, dog and farmer patrols, egg carry slows speed, grass hiding.
1590. **Blackout Agent** `[2D]` — cut power for darkness windows. *Build:* Phaser 3 building, fuse box interactions, lights off for timed windows, flashlight guards.
1591. **Cardboard Infiltrator** `[3D]` — hide in boxes when watched. *Build:* Three.js warehouse, enter box to freeze, guard vision cones as transparent meshes.
1592. **Vision Cone** `[2D]` — turn-based stealth grid puzzle. *Build:* DOM grid turn-based, guards rotate vision each turn, plan moves to exit.
1593. **Assassin Rooftops** `[3D]` — silent takedowns from above. *Build:* Three.js city rooftops, drop takedown on unaware guards, raycast line-of-sight, WASD.
1594. **Laser Ballet** `[2D]` — contort through laser grids. *Build:* Canvas 2D, rotating laser segments, line-segment intersection checks, crouch and crawl keys.
1595. **Masquerade Thief** `[2D]` — blend into ballroom dancers. *Build:* Phaser 3 ballroom, dancer NPCs follow rhythm path, steal jewels while blending.
1596. **Submarine Silent Run** `[2D]` — avoid sonar pings underwater. *Build:* Canvas 2D side-view sea, sonar pings as expanding circles, engine noise throttle.
1597. **Library Hush** `[2D]` — sneak past strict librarians. *Build:* Canvas 2D library tilemap, noise meter, quiet-walk key, librarian patrol AI.
1598. **Smuggler Docks** `[2D]` — move cargo past customs patrols. *Build:* Phaser 3 docks, crate pushing, customs patrol schedules, container hiding spots.
1599. **Night Owl Scout** `[2D]` — owl recon avoiding hunters. *Build:* Canvas 2D forest, owl flight scouting, hunter flashlight cones, perch to hide.
1600. **Ticking Footsteps** `[2D]` — rhythm stealth matching guard beats. *Build:* Canvas 2D, guards move on beat via Web Audio clock, step only between beats.

## 65. 2D Survival & Crafting — *Phaser 3 / Canvas 2D*
1601. **Driftwood Isle** `[2D]` — raft survival gathering ocean debris. *Build:* Canvas 2D ocean, drifting debris spawner, hook throw with mouse, hunger/thirst meters.
1602. **Frostbite Camp** `[2D]` — keep fire alive in blizzards. *Build:* Phaser 3 top-down, fire fuel timer, warmth radius, blizzard particle storms.
1603. **Wasteland Scrapper** `[2D]` — craft gear from scrap. *Build:* Phaser 3 top-down wasteland, crafting recipes as JSON, durability, raider AI.
1604. **Cave Dweller** `[2D]` — mine, smelt, and fend monsters. *Build:* Canvas 2D tile mining grid, smelting recipes, light radius, monster spawns at dark.
1605. **Sky Island Settler** `[3D]` — build on floating islands. *Build:* Three.js floating islands, voxel placement on grid, bridge crafting, first-person build.
1606. **Desert Nomad** `[2D]` — manage water across dunes. *Build:* Canvas 2D map, water canteen drains, oasis locations, day/night temperature.
1607. **Mushroom Forager** `[2D]` — identify safe fungi to survive. *Build:* DOM card inspection UI plus Canvas forest, fungus trait identification, poison chance.
1608. **Underground Bunker** `[2D]` — post-apocalypse shelter crafting. *Build:* Phaser 3 side-view bunker, room building grid, resource meters, raider events.
1609. **Moon Base Crafter** `[3D]` — oxygen management lunar crafting. *Build:* Three.js lunar surface, oxygen tank management, habitat module placement, low gravity.
1610. **Swamp Shack** `[2D]` — build stilts above flooding marsh. *Build:* Canvas 2D marsh, tide level sine wave, build stilt platforms above water.
1611. **Night Shelter** `[2D]` — build walls before dark creatures. *Build:* Phaser 3 top-down, day/night cycle timer, wall placement grid, creature waves at night.
1612. **Tundra Trapper** `[2D]` — hunt, skin, and craft furs. *Build:* Canvas 2D tundra, animal AI herds, trap placement, fur crafting recipes.
1613. **Shipwrecked Kid** `[2D]` — child survives beach with crafting. *Build:* Phaser 3 beach, simple crafting menu, energy meter, tide and crab hazards.
1614. **Abandoned Mall** `[2D]` — scavenge stores during outbreak. *Build:* Phaser 3 mall tilemap, store loot tables, barricade crafting, zombie AI.
1615. **Tiny Survivors** `[2D]` — insect-sized backyard survival. *Build:* Canvas 2D giant backyard, insect scale, crumb resources, spider predator AI.
1616. **Seedling Survival** `[2D]` — sapling grows against seasons. *Build:* Canvas 2D side-view, root and leaf growth upgrades, seasons cycle, weather events.
1617. **Lava Planet Outpost** `[3D]` — heat-shield crafting on volcanoes. *Build:* Three.js volcanic terrain, heat zones as distance fields, shield crafting, lava flows.
1618. **Deep Woods Cabin** `[2D]` — chop, cook, and stay sane. *Build:* Phaser 3 forest, sanity meter, cook recipes, axe chopping, night sounds.
1619. **Pixel Wilderness** `[2D]` — procedural biomes, crafting trees. *Build:* Canvas 2D, simplex noise biomes, chunked world, crafting tree graph UI.
1620. **Treehouse Haven** `[2D]` — survive on jungle canopy platforms. *Build:* Phaser 3 canopy platforms, rope bridge crafting, jaguar predator, rain collection.
1621. **Sewer Survivor** `[2D]` — craft from trash underground. *Build:* Phaser 3 tunnels, trash item crafting, flood timers, rat swarm AI.
1622. **Arctic Research Post** `[2D]` — repair generator during storms. *Build:* Canvas 2D research base, generator repair minigames, storm events, temperature meters.
1623. **Orbit Wreck** `[3D]` — space station salvage survival. *Build:* Three.js zero-g station modules, salvage objects via raycast, oxygen and power meters.
1624. **Farmstead Frontier** `[2D]` — farming plus raider defense. *Build:* Phaser 3 farm tiles, crop growth timers, raider waves, fence crafting.
1625. **Ashfall Valley** `[2D]` — survive after volcanic winter. *Build:* Canvas 2D, ash particle fall, crop failure events, shelter crafting, food stores.

## 66. Metroidvania-lite — *Phaser 3*
1626. **Echo Caverns** `[2D]` — sonar ability reveals hidden paths. *Build:* Phaser 3 tilemap, sonar pulse reveals hidden tiles temporarily, ability-gated doors.
1627. **Clockwork Keep** `[2D]` — gear abilities unlock castle wings. *Build:* Phaser 3 castle tilemap, gear abilities unlock rotating platforms, map room graph.
1628. **Abyss Lantern** `[2D]` — light radius grows with upgrades. *Build:* Canvas 2D with radial light mask, lantern upgrades enlarge radius, room graph map.
1629. **Sunken Citadel** `[2D]` — gain swim then dash powers. *Build:* Phaser 3 underwater tilemap, swim ability toggles buoyancy, dash breaks walls.
1630. **Hollow Bell Tower** `[2D]` — bell rings reshape map. *Build:* Phaser 3, ringing bell swaps tilemap layers, open new paths, minimap.
1631. **Robo Relic** `[2D]` — salvage parts for new abilities. *Build:* Phaser 3 tilemap, part pickups grant double jump and grapple, save rooms.
1632. **Moth Wing Ruins** `[2D]` — glide unlocks distant ledges. *Build:* Phaser 3, glide reduces fall velocity, wind zones, collectible wing upgrades.
1633. **Fungal Depths** `[2D]` — spore powers grow platforms. *Build:* Phaser 3, spore throw spawns temporary mushroom platforms, ability-gated map.
1634. **Crystal Hollow** `[2D]` — shoot crystals to open walls. *Build:* Phaser 3, crystal walls break on hit type, ability upgrades, room transitions.
1635. **Exiled Spirit** `[2D]` — possess creatures for abilities. *Build:* Phaser 3, possess enemies to borrow movement abilities, spirit form travel.
1636. **Starship Derelict** `[2D]` — explore ship, restore power zones. *Build:* Phaser 3 ship tilemap, power routing unlocks zones, tracked minimap, save stations.
1637. **Witch Woods** `[2D]` — collect spells to open forest. *Build:* Phaser 3 forest, spell inventory, color-coded barriers matching spells.
1638. **Ancient Automaton** `[2D]` — rusty robot regains functions. *Build:* Phaser 3, robot starts limited, regains jump/dash/arm cannon, interconnected map.
1639. **Inverted Keep** `[2D]` — gravity-flip ability reopens map. *Build:* Phaser 3, gravity flip ability, rooms designed for both orientations, minimap.
1640. **Tide Temple** `[2D]` — raise water levels to explore. *Build:* Phaser 3, water level controlled by switches, swim physics, tilemap flooding.
1641. **Fox Spirit Shrine** `[2D]` — dual-world shrine exploration. *Build:* Phaser 3, dual-layer world toggle, fox form abilities, shrine keys.
1642. **Bone Labyrinth** `[2D]` — skeleton gains new bones. *Build:* Phaser 3 labyrinth, collect bones for new skeleton abilities, map graph.
1643. **Pocket Metroid** `[2D]` — whole map fits one screen. *Build:* Canvas 2D single-screen map, abilities unlock routes, quick speedrun-friendly design.
1644. **Dream Fragments** `[2D]` — collect memories unlocking rooms. *Build:* Phaser 3, memory items unlock rooms, dreamy shader backgrounds, non-linear map.
1645. **Scrap Squirrel** `[2D]` — tiny critter's backyard metroidvania. *Build:* Phaser 3 backyard tilemap, squirrel abilities, acorn collectibles, interconnected areas.
1646. **Ember Knight** `[2D]` — fire upgrades melt ice gates. *Build:* Phaser 3, fire upgrades melt ice tiles, ember dash, castle map.
1647. **Lost Lighthouse** `[2D]` — restore beams to explore coast. *Build:* Phaser 3 coastal map, restore lighthouse beams to light dark areas.
1648. **Rune Sentinel** `[2D]` — rune combos open sealed doors. *Build:* Phaser 3, rune combination doors, inventory runes, sentinel boss gates.
1649. **Mole Kingdom** `[2D]` — burrowing ability unlocks tunnels. *Build:* Phaser 3, burrow ability passes through dirt tiles, underground kingdom map.
1650. **Wisp Wander** `[2D]` — tiny spirit absorbs elements. *Build:* Canvas 2D, wisp absorbs element orbs to gain abilities, glowing particle trails.

## 67. Boss Rush — *Phaser 3 / Canvas 2D*
1651. **Titan Trials** `[3D]` — ten giant bosses back-to-back. *Build:* Three.js arena, giant titan models with weak points, dodge roll, timed attacks.
1652. **One Hit Heroes** `[2D]` — you and bosses die once. *Build:* Phaser 3, both player and bosses have one hp, pattern-based bosses.
1653. **Colossus Climb** `[3D]` — scale giant bosses to strike. *Build:* Three.js giant boss mesh with climbable surfaces, grip stamina, stab weak points.
1654. **Boss Gauntlet Daily** `[2D]` — new boss order every day. *Build:* Phaser 3, seeded RNG from date picks boss order, leaderboard via localStorage.
1655. **Pantheon Pursuit** `[2D]` — defeat gods of each element. *Build:* Phaser 3, element-themed god bosses, pattern state machines, elemental weapon swaps.
1656. **Dragon Ladder** `[3D]` — climb tiers of dragons. *Build:* Three.js arena, dragon models with breath cones, tiered ladder progression, WASD dodge.
1657. **Mech Overlord** `[2D]` — multi-phase robot boss fights. *Build:* Phaser 3, multi-phase robot boss state machine, part destruction, laser sweeps.
1658. **Tiny Hero Giants** `[2D]` — small knight versus huge foes. *Build:* Canvas 2D, tiny knight scales huge boss sprites, weak-point hitboxes.
1659. **Rhythm Bosses** `[2D]` — bosses attack on music beat. *Build:* Canvas 2D, boss attacks scheduled on Web Audio beat clock, dodge on beat.
1660. **Sky Serpent** `[3D]` — fight flying serpent mid-air. *Build:* Three.js sky arena, serpent spline body, glider player, shoot glowing scales.
1661. **Shape Lords** `[2D]` — geometric bosses with patterns. *Build:* Canvas 2D, geometric bosses spawn shape patterns, polygon collision.
1662. **Haunted Hall of Bosses** `[2D]` — ghostly boss portrait gallery. *Build:* Phaser 3 gallery hub, enter paintings to fight ghost bosses.
1663. **Boss Blitz Speedrun** `[2D]` — race the clock per boss. *Build:* Phaser 3, per-boss timer splits, ghost replay of best run.
1664. **Chef Showdown** `[2D]` — culinary bosses with food attacks. *Build:* Phaser 3 kitchen arena, food projectile patterns, chef bosses with phases.
1665. **Cosmic Tyrants** `[3D]` — planet-sized space bosses. *Build:* Three.js space arena, planet-sized boss meshes, orbit camera, ship dodging.
1666. **Kaiju Gauntlet** `[3D]` — city defense against kaiju waves. *Build:* Three.js city diorama, kaiju waves, destructible buildings, turret player controls.
1667. **Slime King Rush** `[2D]` — slime bosses split when hit. *Build:* Phaser 3, slime bosses split into smaller slimes on hit, merge timers.
1668. **Arena of Echoes** `[2D]` — boss learns your moves. *Build:* Phaser 3, boss records player attack patterns and counters frequent moves.
1669. **Clockwork Colossi** `[2D]` — mechanical bosses with weak gears. *Build:* Phaser 3, gear weak points rotate, timing hits to stop mechanisms.
1670. **Reverse Boss** `[2D]` — play the boss vs heroes. *Build:* Phaser 3, play boss with attack patterns against AI hero parties.
1671. **Pixel Pantheon** `[2D]` — retro-style boss collection. *Build:* Canvas 2D pixel art bosses, retro palette, quick fight menu.
1672. **Bone Throne** `[2D]` — undead royals in succession. *Build:* Phaser 3, undead royals in sequence, throne room arenas, curses carry over.
1673. **Puzzle Bosses** `[2D]` — weaknesses require clever tricks. *Build:* Phaser 3, bosses require puzzle solutions like mirrors or switches.
1674. **Storm Giants** `[2D]` — weather-powered boss battles. *Build:* Phaser 3, weather systems change boss attacks, lightning, wind push.
1675. **Last Stand Boss** `[2D]` — survive final boss endlessly. *Build:* Canvas 2D, endless final boss survival, escalating phase patterns, score timer.

## 68. Bullet Hell — *PixiJS / Canvas 2D*
1676. **Danmaku Garden** `[2D]` — flower-pattern bullet curtains. *Build:* PixiJS, petal-shaped bullet patterns via polar equations, pooled sprites, focus slow key.
1677. **Graze Master** `[2D]` — score by grazing bullets closely. *Build:* Canvas 2D, graze radius around hitbox adds score, bullet pooling.
1678. **Spiral Inferno** `[2D]` — rotating spiral pattern survival. *Build:* PixiJS, rotating spiral emitters, angle increments per frame, survival timer.
1679. **Hitbox Heart** `[2D]` — tiny heart dodges blooming patterns. *Build:* Canvas 2D, tiny heart hitbox, bloom pattern emitters, arrow keys.
1680. **Witch Barrage** `[2D]` — witches duel with spell curtains. *Build:* PixiJS, witch boss spell cards, bullet pattern scripts, bomb key.
1681. **Neon Cathedral** `[2D]` — stained-glass bullet patterns. *Build:* PixiJS, stained-glass colored bullets, symmetrical pattern emitters, glow filters.
1682. **Petal Storm** `[2D]` — cherry blossom bullet waves. *Build:* Canvas 2D, petal bullets drift with wind, spawn waves, focus mode.
1683. **Bullet Reverb** `[2D]` — patterns synced to music. *Build:* PixiJS, Web Audio analyser triggers bullet waves on beats.
1684. **Starlight Danmaku** `[2D]` — constellation-shaped bullet patterns. *Build:* Canvas 2D, constellation line patterns, bullets travel along star paths.
1685. **Overload Core** `[2D]` — shoot reactor while dodging sprays. *Build:* PixiJS, central reactor boss, rotating bullet sprays, shoot core weak points.
1686. **Pattern Editor Hell** `[2D]` — design and share patterns. *Build:* DOM editor UI plus Canvas preview, pattern JSON export and share codes.
1687. **Mirror Bullets** `[2D]` — bullets reflect off screen edges. *Build:* Canvas 2D, bullets bounce off screen edges once, reflection math.
1688. **Slow Mo Bullets** `[2D]` — focus mode slows time. *Build:* Canvas 2D, focus key slows time scale, slow-mo meter.
1689. **Cursed Orbs** `[2D]` — homing orbs and lasers. *Build:* PixiJS, homing orbs with steering, laser beams, dodge patterns.
1690. **Ribbon Fire** `[2D]` — laser ribbons sweep the arena. *Build:* PixiJS, laser ribbons as curved polylines, sweeping arcs, collision sampling.
1691. **Galaxy Curtain** `[2D]` — vertical shmup bullet hell. *Build:* PixiJS vertical shmup, galaxy background shader, bullet curtains, power-ups.
1692. **Bullet Echo** `[2D]` — past bullets reappear later. *Build:* Canvas 2D, bullet positions recorded, replayed later as ghost bullets.
1693. **Monochrome Hell** `[2D]` — black and white polarity dodge. *Build:* Canvas 2D, toggle polarity color, absorb same-color bullets, avoid opposites.
1694. **Pocket Danmaku** `[2D]` — one-screen micro bullet hell. *Build:* Canvas 2D single-screen patterns, short stages, quick restart.
1695. **Snowflake Storm** `[2D]` — fractal snowflake bullet patterns. *Build:* PixiJS, fractal snowflake bullet patterns via recursive emitters.
1696. **Flak Garden** `[2D]` — bullets bloom into mines. *Build:* Canvas 2D, bullets become mines after delay, field management.
1697. **Bomb Absorber** `[2D]` — collect bullets to charge bombs. *Build:* Canvas 2D, absorb bullets with shield to charge bomb meter.
1698. **Rainbow Rain** `[2D]` — color-coded bullet waves. *Build:* PixiJS, color-coded bullet waves, match ship color to absorb, rainbow gradient shaders.
1699. **Orbit Barrage** `[2D]` — bullets orbit the player. *Build:* Canvas 2D, bullets orbit player, shrinking orbit radius, dash dodge.
1700. **Fairy Fury** `[2D]` — tiny fairies, massive bullet fields. *Build:* PixiJS, fairy swarm emitters, massive bullet fields, pooled sprites.

## 69. Top-down Action RPG — *Phaser 3*
1701. **Emberblade Saga** `[3D]` — sword quest through burning kingdom. *Build:* Three.js isometric low-poly kingdom, sword combo state machine, fire hazard spread grid, WASD and mouse.
1702. **Woodland Warden** `[2D]` — ranger protects forest villages. *Build:* Phaser 3 tilemap forest, bow shots and snare traps, quest log JSON, villager NPC dialogue.
1703. **Rune Ranger** `[2D]` — top-down runic combat adventure. *Build:* Phaser 3 dungeon rooms, rune slots combine into spells via lookup table, keyboard casting hotkeys.
1704. **Grave Keeper Quest** `[2D]` — undead-slaying graveyard hero. *Build:* Phaser 3 graveyard tilemap, undead wave spawner at night, shovel melee, holy water area damage.
1705. **Dungeon Courier** `[2D]` — deliver mail through monster dens. *Build:* Phaser 3 top-down, parcel delivery timer, A* monster patrols in dens, dodge-roll on space.
1706. **Knight of Tides** `[3D]` — coastal islands sword adventure. *Build:* Three.js island chain, boat travel with simple buoyancy, sword arcs via hit cones, tide timers.
1707. **Spirit Archer** `[2D]` — bow-focused top-down RPG. *Build:* Phaser 3, mouse-aimed bow with charge time, arrow ricochet, spirit wolf companion follow AI.
1708. **Mage Apprentice** `[2D]` — learn spells by slaying. *Build:* Phaser 3 dungeons, XP unlocks spell tree, mana regeneration, elemental damage table, hotkeys.
1709. **Golem Heart** `[3D]` — craft golem companion while questing. *Build:* Three.js top-down, craftable golem follower with behavior tree, part slots, WASD plus click attack.
1710. **Cursed Crown** `[2D]` — wear crown, gain powers, curses. *Build:* Phaser 3, crown slots grant buffs with random curse debuffs, risk-reward loot rolls, saves in localStorage.
1711. **Sand Kingdom Saga** `[2D]` — desert ruins hack-and-slash. *Build:* Phaser 3 desert ruins, hack-and-slash combo chains, sandstorm reduces visibility mask, relic inventory.
1712. **Ruinsword** `[2D]` — broken sword reforged by quests. *Build:* Phaser 3, sword fragments from quests upgrade stats, branching skill tree, multi-phase boss fights.
1713. **Blight Hunter** `[2D]` — purge corruption from lands. *Build:* Phaser 3, corruption tiles spread via cellular automaton, cleanse with staff, wave defense.
1714. **Frost Shepherd** `[2D]` — protect flock on icy mountains. *Build:* Phaser 3 mountain map, flocking sheep boids to protect, wolf AI hunters, slippery ice tiles.
1715. **Village Defender** `[2D]` — town levels up as you fight. *Build:* Phaser 3, village buildings upgrade with loot gold, night raid waves, shop and blacksmith menus.
1716. **Pixel Paladin** `[2D]` — holy knight with heal combos. *Build:* Phaser 3, holy knight heals with cooldown abilities, combo strikes, party NPC follower AI.
1717. **Shard Seeker** `[2D]` — collect crystal shards for powers. *Build:* Phaser 3, crystal shard pickups socket into gear, ability tree, procedurally connected dungeon rooms.
1718. **Tea Kingdom Tales** `[2D]` — cozy RPG with tea potions. *Build:* Phaser 3 cozy tilemap, tea brewing recipes as potions, light combat, day calendar system.
1719. **Rogue Druid** `[2D]` — shapeshift into animals for combat. *Build:* Phaser 3, hotkeys shapeshift bear, wolf, hawk forms, each with unique hitboxes and movement.
1720. **Bog Witch Errand** `[2D]` — witch errands through swamp. *Build:* Phaser 3 swamp tilemap, witch errand quest chain, potion crafting menu, bog monster encounters.
1721. **Mech Pilot Quest** `[3D]` — mech overworld action RPG. *Build:* Three.js isometric overworld, mech pilot upgrades, missile lock-on via raycasts, WASD and mouse aim.
1722. **Pirate Cutlass Isles** `[2D]` — swashbuckling islands RPG. *Build:* Phaser 3 islands, cutlass parry combat, ship sailing minimap, treasure map dig spots.
1723. **Scarecrow Knight** `[2D]` — farm defender against crows. *Build:* Phaser 3 farm tilemap, crow flock boids raid crops, scarecrow knight melee and pumpkin bombs.
1724. **Ember Isles** `[3D]` — volcanic archipelago loot RPG. *Build:* Three.js low-poly volcanic islands, random loot tables, lava hazard meshes, orbit camera combat.
1725. **Lantern Wanderer** `[3D]` — night-only exploration action. *Build:* Three.js night terrain, lantern point light radius, shadow enemies flee light, fog exp2.

## 70. Melee Arenas — *Phaser 3 / Kaboom.js*
1726. **Colosseum Clash** `[3D]` — gladiator waves in arena. *Build:* Three.js arena bowl, gladiator wave spawner, crowd favor meter, weapon pickups, third-person camera.
1727. **Spear Circle** `[2D]` — reach-based spear survival. *Build:* Phaser 3 circular arena, long spear thrust hitbox, enemies circle and lunge, stamina meter.
1728. **Shield Bash Arena** `[2D]` — knock foes into spikes. *Build:* Phaser 3, shield bash impulse knockback, spike tile edges kill, block with right mouse.
1729. **Mace Mayhem** `[2D]` — flail physics swinging melee. *Build:* Matter.js flail on chain constraint, damage scales with swing velocity, mouse-driven swing.
1730. **Chain Whip Pit** `[2D]` — whip enemies into hazards. *Build:* Phaser 3, whip as segmented rope, lash enemies into fire pits and spike walls.
1731. **Dual Dagger Den** `[2D]` — fast dagger combo arena. *Build:* Phaser 3, fast dual-dagger combo input buffer, dodge roll i-frames, bleed damage ticks.
1732. **Hammer Time Arena** `[2D]` — ground-pound shockwave melee. *Build:* Phaser 3 top-down, hammer ground pound expanding shockwave radius, crowd waves, charge meter.
1733. **Ring of Blades** `[3D]` — shrinking ring sword fights. *Build:* Three.js circular arena, ring radius shrinks over time, sword clashes, AI duelists, edge falloff.
1734. **Viking Pit** `[3D]` — berserker axe survival waves. *Build:* Three.js pit arena, berserker axe swings, rage meter boosts speed, endless waves, third-person.
1735. **Brawl Bowl** `[2D]` — four-player couch melee. *Build:* Phaser 3 single screen, four-player couch melee via Gamepad API, stock lives, item drops.
1736. **Katana Clash Arena** `[2D]` — parry-focused sword arena. *Build:* Phaser 3, parry window frames, posture break meter, katana duelists in arena waves.
1737. **Bat Swing Brawl** `[2D]` — baseball-bat slugfest knockback. *Build:* Phaser 3, baseball bat swing arcs, knockback launch distance score, home-run bonuses.
1738. **Pitchfork Rebels** `[2D]` — peasants versus knights melee. *Build:* Phaser 3, peasant horde with pitchforks versus armored knights, rally banner buffs.
1739. **Sumo Sword Ring** `[3D]` — push-out sword arena. *Build:* Three.js round platform, sword strikes push opponents out, cannon-es physics, sumo-style knockback.
1740. **Gauntlet Grinder** `[2D]` — ever-tougher melee waves. *Build:* Phaser 3, endless melee waves with scaling stats, perks chosen between rounds.
1741. **Sparring Dummies** `[2D]` — dummies come alive and fight. *Build:* Phaser 3, training dummies animate after hits, combo practice tracker, damage numbers.
1742. **Lance Joust Ring** `[3D]` — mounted charge combat arena. *Build:* Three.js arena, mounted charge physics, lance tip raycast hit detection, gallop speed meter.
1743. **Frying Pan Fury** `[2D]` — kitchen utensil melee arena. *Build:* Phaser 3 kitchen arena, frying pans and rolling pins, slapstick ragdoll knockback.
1744. **Bone Club Brawl** `[2D]` — caveman clubbing arena. *Build:* Phaser 3 prehistoric arena, caveman club swings, dino stampede hazards, bone pickups.
1745. **Scythe Dance** `[2D]` — wide-arc reaping melee. *Build:* Phaser 3, wide arc scythe sweeps hit multiple enemies, soul meter for reaping specials.
1746. **Tornado Spin** `[3D]` — spin attack momentum arena. *Build:* Three.js arena, spin attack builds momentum, dizziness meter wobbles camera, crowd waves.
1747. **Shovel Knightmare** `[2D]` — dig and bash arena. *Build:* Phaser 3, shovel digs pit traps on tile grid, bash enemies into holes.
1748. **Combo Coliseum** `[2D]` — combo meter drives score. *Build:* Phaser 3, combo meter multiplies score, decays over time, wave spawns, leaderboard.
1749. **Wrestling Ring Rumble** `[2D]` — throw foes over ropes. *Build:* Phaser 3 ring, rope bounce physics, throw foes over ropes with grab button.
1750. **Rapier Rondo** `[3D]` — lunge and riposte fencing arena. *Build:* Three.js fencing piste, lunge and riposte timing, blade raycasts, mouse thrust control.

## 71. Twin-stick Variants — *Phaser 3 / PixiJS*
1751. **Twin Nebula** `[3D]` — space twin-stick with gravity wells. *Build:* Three.js top-down space, gravity wells bend bullet trajectories, twin-stick WASD plus mouse aim.
1752. **Grid Blaster** `[3D]` — neon grid twin-stick waves. *Build:* Three.js neon grid plane, deforming grid via vertex shader, bloom, particle explosions, gamepad.
1753. **Dual Pistol Dungeon** `[2D]` — room-clearing twin-stick crawler. *Build:* Phaser 3 room-based dungeon, dual pistols auto-fire, procedural room graph, item pickups.
1754. **Ricochet Rumble** `[2D]` — bullets bounce off walls. *Build:* Canvas 2D, ricochet bullets reflect off walls using normal vector math, limited bounces.
1755. **Magnet Gunner** `[2D]` — pull and fling enemies. *Build:* Phaser 3, magnet beam pulls enemies, release to fling them into others, mouse aim.
1756. **Paint Gun Zone** `[2D]` — paint floor to gain power. *Build:* Canvas 2D, floor grid paint coverage percentage boosts fire rate, enemies erase paint.
1757. **Laser Leash** `[2D]` — tethered laser between two ships. *Build:* Canvas 2D, two co-op ships linked by laser line, segment intersection kills enemies.
1758. **Backward Shooter** `[2D]` — shoot only behind movement. *Build:* Canvas 2D, guns fire only opposite movement vector, forcing retreating aim.
1759. **Bubble Blaster** `[2D]` — trap foes in bubbles. *Build:* Phaser 3, bubble projectiles trap enemies temporarily, pop chain reactions for points.
1760. **Orbit Gunner** `[2D]` — gun orbits around ship. *Build:* Canvas 2D, gun orbits ship at fixed angular speed, fire timing replaces aiming.
1761. **Retro Robot Rampage** `[2D]` — robots swarm tiny arenas. *Build:* PixiJS, robot swarms in tiny arenas, spatial hash collisions, twin-stick gamepad support.
1762. **Flamethrower Frenzy** `[2D]` — short-range fire twin-stick. *Build:* Phaser 3, short-range flamethrower cone particles, fuel management, burn damage over time.
1763. **Couch Co-op Blaster** `[3D]` — two players share screen. *Build:* Three.js shared camera framing two players, Gamepad API twin-stick, co-op revive mechanic.
1764. **Vacuum Hero** `[2D]` — suck up enemies, shoot them. *Build:* Canvas 2D, vacuum cone sucks enemies into tank, fire them back as projectiles.
1765. **Cyber Swarm** `[2D]` — hack enemies into allies. *Build:* Phaser 3, hacking beam converts enemies into allies, swarm follower AI, twin-stick.
1766. **Slingshot Squad** `[2D]` — kids with slingshots twin-stick. *Build:* Phaser 3, slingshot charge power with mouse hold, kid-themed backyard twin-stick waves.
1767. **Snowball Showdown** `[2D]` — snowball twin-stick winter brawl. *Build:* Canvas 2D winter arena, snowball projectiles, buildable snow fort walls, WASD and mouse.
1768. **Shield Shooter** `[2D]` — rotating shield blocks fire. *Build:* Canvas 2D, rotating shield arc blocks bullets by angle check, twin-stick shooting.
1769. **Rock Shooter Cave** `[2D]` — destructible cave twin-stick. *Build:* Canvas 2D, destructible cave tiles via pixel mask, twin-stick shooting, explosive barrels.
1770. **Tiny Tank Twin** `[3D]` — tank turret aims independently. *Build:* Three.js tiny tank, turret aims independent of hull, mouse raycast aim, WASD drive.
1771. **Light Beam Hero** `[2D]` — flashlight beam damages shadows. *Build:* Canvas 2D darkness mask, flashlight cone damages shadow enemies, battery meter.
1772. **Lost Ammo** `[2D]` — retrieve each fired bullet. *Build:* Canvas 2D, fired bullets remain on floor, walk over to reload, limited magazine.
1773. **Garden Gnome Gun** `[2D]` — gnome defends garden twin-stick. *Build:* Phaser 3 garden, gnome blasts pests with seed gun, plant growth defense rows.
1774. **Ghost Buster Grid** `[3D]` — vacuum ghosts in mansions. *Build:* Three.js mansion rooms, vacuum beam captures ghosts, ghost AI phasing walls, twin-stick.
1775. **Water Gun Wars** `[3D]` — water pressure-limited twin-stick. *Build:* Three.js backyard, water pressure meter limits shots, refill at hose stations, splash particles.

## 72. Flying & Gliding — *Phaser 3 / Three.js*
1776. **Feather Drift** `[3D]` — glide on thermal currents. *Build:* Three.js open sky, thermal columns as volumes, glide physics with lift and drag, mouse pitch.
1777. **Wingsuit Canyon** `[3D]` — dive through narrow canyons. *Build:* Three.js canyon terrain from heightmap, wingsuit speed dive, proximity score, arrow keys.
1778. **Hang Glider Ridge** `[2D]` — ride ridge lift updrafts. *Build:* Canvas 2D side-view ridge, updraft zones near slopes, hang glider pitch with arrow keys.
1779. **Kite Dancer** `[2D]` — steer kite through wind gusts. *Build:* Canvas 2D, kite on string constraint, mouse steers, random wind gust vector events.
1780. **Owl Night Flight** `[3D]` — silent owl hunts mice. *Build:* Three.js night forest, owl flight controls, mice spotted via heat outline shader, silent dive.
1781. **Dragon Glide** `[3D]` — dragon soars collecting embers. *Build:* Three.js mountain range, dragon flight physics, ember collectibles, bloom post-processing.
1782. **Seagull Steal** `[2D]` — swoop beaches stealing fries. *Build:* Canvas 2D beach, seagull swoop dives, steal fries from tourists, timing-based grabs.
1783. **Biplane Barnstorm** `[3D]` — stunt flying through barns. *Build:* Three.js countryside, biplane flight model, barn fly-through gates, keyboard pitch and roll.
1784. **Leaf on Wind** `[2D]` — falling leaf rides breezes. *Build:* Canvas 2D, falling leaf with flutter physics, wind force vectors, avoid puddles and branches.
1785. **Dandelion Drift** `[2D]` — seed floats across fields. *Build:* Canvas 2D, dandelion seed drifts on flow field winds, steer gently with mouse.
1786. **Bat Echo Flight** `[2D]` — echolocation navigating dark caves. *Build:* Canvas 2D cave, echolocation pulse reveals walls briefly via radial mask, spacebar ping.
1787. **Hummingbird Hover** `[2D]` — hover and sip flowers. *Build:* Canvas 2D, hummingbird hover with fine thrust, sip nectar to refill energy meter.
1788. **Zeppelin Pilot** `[3D]` — steer airship through storms. *Build:* Three.js storm sky, zeppelin buoyancy and ballast, wind forces, lightning hazard strikes.
1789. **Jet Ring Race** `[3D]` — fly through floating rings. *Build:* Three.js sky, ring checkpoints along spline, jet flight controls, lap timer and ghost.
1790. **Sky Whale** `[3D]` — giant whale glides cloud oceans. *Build:* Three.js cloud ocean with shader clouds, giant whale glide, ambient exploration, mouse steering.
1791. **Squirrel Glider** `[2D]` — flying squirrel tree hops. *Build:* Canvas 2D forest, flying squirrel glides between trees, flap-free momentum physics.
1792. **Butterfly Migration** `[2D]` — guide butterflies across continents. *Build:* Canvas 2D world map, guide butterfly flock using boids, avoid storms and predators.
1793. **Cloud Surfer** `[2D]` — surf atop cloud waves. *Build:* Canvas 2D, surf atop sine-wave clouds, trick timing on crests, tap controls.
1794. **Parachute Drop** `[2D]` — land precisely on targets. *Build:* Canvas 2D, parachute steering left and right, wind drift, land on target rings.
1795. **Blimp Rescue** `[2D]` — pick survivors from rooftops. *Build:* Canvas 2D city, blimp buoyancy control, lower rope to pick survivors from rooftops.
1796. **Crow Courier** `[2D]` — deliver shiny trinkets by air. *Build:* Canvas 2D, crow carries trinkets between nests, timed routes, hawk chasers.
1797. **Pterodactyl Patrol** `[3D]` — prehistoric flight over volcanoes. *Build:* Three.js prehistoric terrain, pterodactyl flight, volcano eruptions, dive attack on prey.
1798. **Thermal Hawk** `[3D]` — circle thermals to gain height. *Build:* Three.js valley, circle thermals to gain altitude, hawk banking controls, prey diving.
1799. **Kite Line** `[2D]` — steer a kite through gusts. *Build:* Canvas 2D string constraint to anchor, wind vector field, mouse tension control.
1800. **Rocket Glider** `[2D]` — boost and glide balance. *Build:* Canvas 2D side view, rocket boost then glide, fuel meter, distance record.

## 73. Swimming & Diving — *Phaser 3 / Canvas 2D*
1801. **Coral Diver** `[3D]` — explore reefs on limited air. *Build:* Three.js reef with instanced coral, oxygen meter, swim physics with drag, WASD and mouse.
1802. **Pearl Hunter** `[2D]` — dive for pearls, avoid eels. *Build:* Phaser 3 side-view sea, pearl collection, eel ambush AI, breath timer resets at surface.
1803. **Deep Sea Descent** `[3D]` — descend into trench darkness. *Build:* Three.js deep ocean, fog density increases with depth, headlight cone, pressure meter.
1804. **Salmon Upstream** `[2D]` — leap waterfalls and bears. *Build:* Phaser 3 river, salmon leap waterfalls with jump timing, bear swipe hazards.
1805. **Shark Escape** `[2D]` — outswim hungry sharks. *Build:* Canvas 2D, shark chase AI with pathfinding, swim burst stamina, hiding in rocks.
1806. **Otter Odyssey** `[2D]` — playful otter river adventure. *Build:* Phaser 3 river tilemap, otter play tricks, collectible shells, current flow tiles.
1807. **Seal Slalom** `[2D]` — dive through kelp gates. *Build:* Canvas 2D buoyancy physics, arrow steering, gate scoring, breath meter.
1808. **Kelp Forest Maze** `[2D]` — navigate swaying kelp. *Build:* Canvas 2D kelp maze, swaying stalks via sine waves, procedurally generated paths.
1809. **Sunken Treasure Rush** `[3D]` — loot wrecks before air runs out. *Build:* Three.js shipwrecks, oxygen timer, treasure pickups via raycast, swim controls.
1810. **Turtle Return** `[2D]` — baby turtle reaches ocean. *Build:* Canvas 2D beach, baby turtle dash to ocean, predator birds dive, crab obstacles.
1811. **Bubble Breath** `[2D]` — collect bubbles to breathe. *Build:* Canvas 2D side view, collect rising bubbles to refill air meter, avoid urchins.
1812. **Squid Ink Escape** `[2D]` — ink clouds to escape predators. *Build:* Canvas 2D, ink cloud particles block predator line-of-sight checks, cooldown escape.
1813. **Cave Diving Dread** `[3D]` — tight underwater cave navigation. *Build:* Three.js underwater caves, tight tunnels, guideline rope, flashlight cone, silt particles.
1814. **Dolphin Leap** `[2D]` — jump and flip for tricks. *Build:* Phaser 3, dolphin jumps out of water, flips and spins for trick scoring.
1815. **Free Diver** `[3D]` — breath-hold depth challenge. *Build:* Three.js open water column, breath-hold depth dive, buoyancy and heartbeat audio.
1816. **Frog Pond Paddle** `[2D]` — frog swims lily pad mazes. *Build:* Phaser 3 pond, frog swims between lily pads, fly snacks, heron hazard.
1817. **Whale Song** `[3D]` — whale sings to guide pods. *Build:* Three.js ocean, whale song notes guide pods, sonar ring visualization, Web Audio tones.
1818. **Piranha River** `[2D]` — cross rivers dodging swarms. *Build:* Canvas 2D river, piranha swarm boids, crossing timing, log platforms.
1819. **Trench Escape** `[2D]` — outswim a giant squid upward. *Build:* Canvas 2D vertical scroller, pressure zones, tentacle chaser AI, dash cooldown.
1820. **Seahorse Steer** `[2D]` — slow seahorse current navigation. *Build:* Canvas 2D, slow seahorse steering through current vector fields, tail anchor to rest.
1821. **Sub Rescue** `[3D]` — rescue trapped submarine crew. *Build:* Three.js seabed, submarine rescue mission, sonar pings, oxygen countdown.
1822. **Penguin Plunge** `[2D]` — dive and catch fish. *Build:* Phaser 3, penguin dives from ice floes, fish catches, oxygen meter, leopard seal hazard.
1823. **Duck Dive** `[2D]` — duck dives for snacks. *Build:* Canvas 2D pond, duck dives for snack collection, buoyancy timer, turtle snappers.
1824. **Abyssal Light** `[3D]` — bioluminescent creature exploration. *Build:* Three.js abyss, bioluminescent creatures glow, GPU particle shaders, slow exploration.
1825. **Mermaid Messenger** `[2D]` — deliver shells through reef. *Build:* Phaser 3 reef, deliver shells to merfolk, sea creature hazards, current paths.

## 74. Climbing & Parkour — *Phaser 3 / Matter.js*
1826. **Ledge Grab** `[2D]` — precise ledge-hanging climbing. *Build:* Phaser 3 side view, ledge grab detection via corner sensors, stamina meter, falling rocks.
1827. **Vault Runner** `[2D]` — parkour vaults over obstacles. *Build:* Phaser 3 obstacles, vault over by timing key presses, momentum flow multiplier.
1828. **Wall Run City** `[3D]` — run along building walls. *Build:* Three.js city, wall-run on building faces, raycast contact, first-person camera.
1829. **Cliff Hanger** `[2D]` — manage grip stamina on cliffs. *Build:* Canvas 2D cliff face, grip stamina per hand, rest ledges, chalk pickups.
1830. **Bouldering Problems** `[2D]` — plan holds on climbing routes. *Build:* Canvas 2D climbing wall, hold planning, limb drag controls, route grading.
1831. **Free Runner** `[3D]` — flowing rooftop parkour combos. *Build:* Three.js rooftops, flowing parkour combos, third-person camera, trick scoring.
1832. **Ice Axe Ascent** `[2D]` — swing axes up ice walls. *Build:* Canvas 2D ice wall, alternating axe swings via left/right keys, crumble chance.
1833. **Tower Scramble** `[3D]` — climb crumbling tower fast. *Build:* Three.js crumbling tower, falling brick meshes, race to top before collapse.
1834. **Two Hands Climb** `[2D]` — control each hand separately. *Build:* Matter.js ragdoll climber, each hand mapped to mouse buttons, grip on holds.
1835. **Chimney Sweep Climb** `[2D]` — wall-jump up chimneys. *Build:* Phaser 3 vertical chimney shafts, wall-jump timing, soot hazards, rising fire.
1836. **Rope Climb Rush** `[2D]` — climb ropes dodging hazards. *Build:* Phaser 3 vertical level, rope climbing with alternating keys, swinging hazards.
1837. **Gecko Grip** `[2D]` — sticky gecko climbs walls. *Build:* Canvas 2D, sticky gecko walls and ceilings, tongue snatch insects, bird predators.
1838. **Mountain Summit** `[3D]` — expedition climb with weather. *Build:* Three.js mountain, weather events, expedition climbing route, camp placement with supplies.
1839. **Crane Climber** `[3D]` — scale construction cranes. *Build:* Three.js crane structure, climb rebar beams, wind sway, vertigo camera.
1840. **Monkey Bars** `[2D]` — swing bar to bar timing. *Build:* Canvas 2D, swing between monkey bars with alternating key timing, slips on miss.
1841. **Pole Vault Pro** `[2D]` — plant pole, launch over. *Build:* Phaser 3, pole vault plant timing, launch arc physics, height bar progression.
1842. **Ninja Course** `[2D]` — obstacle course reflex parkour. *Build:* Phaser 3 obstacle course, reflex prompts, split timer, ghost run replay.
1843. **Scaffold Scramble** `[2D]` — climb collapsing scaffolding. *Build:* Phaser 3, collapsing scaffolding planks, climb race against crumble timer.
1844. **Tree Top Climb** `[3D]` — climb giant tree branches. *Build:* Three.js giant tree, branch climbing, procedurally generated branches, orbit camera.
1845. **Lighthouse Ascent** `[3D]` — spiral climb in storm. *Build:* Three.js lighthouse, spiral climb in storm, rain particles, wind gusts push player.
1846. **Momentum Monk** `[2D]` — parkour monk chains flips. *Build:* Phaser 3, monk flips chain together, combo multiplier, rooftop temple levels.
1847. **Trick Line** `[2D]` — parkour trick scoring lines. *Build:* Canvas 2D, draw trick lines through obstacle course, trick scoring per segment.
1848. **Window Washer** `[2D]` — dangle and climb skyscrapers. *Build:* Canvas 2D skyscraper, window washer platform rope climb, clean windows for points.
1849. **Crag Crawler** `[2D]` — spider-limbed climbing physics. *Build:* Matter.js, spider-limbed procedural climbing physics, inverse kinematics legs, mouse target.
1850. **Ladder Race** `[2D]` — race opponents up ladders. *Build:* Phaser 3, ladder race against AI climbers, alternating key presses, sabotage items.

## 75. Vehicle Combat — *Phaser 3 / Three.js*
1851. **Derby Wreckers** `[3D]` — demolition derby smash arena. *Build:* Three.js derby arena, cannon-es car physics, deformable damage meshes, last car standing.
1852. **Armored Convoy** `[2D]` — defend trucks from raiders. *Build:* Phaser 3 top-down, defend convoy trucks along path, raider wave spawner, turret upgrades.
1853. **Road Warrior Run** `[3D]` — post-apocalypse highway combat. *Build:* Three.js desert highway, post-apocalypse vehicles, weapon turrets, mouse aim chase camera.
1854. **Battle Kart Arena** `[3D]` — kart arena with rockets. *Build:* Three.js kart arena, rocket pickups, drifting physics, split-screen viewports.
1855. **Tank Turret Duel** `[2D]` — two tanks, destructible walls. *Build:* Canvas 2D, destructible walls via tile grid, two-tank duel, ricochet shells.
1856. **Hovercraft Havoc** `[2D]` — slidey hovercraft shootout. *Build:* Phaser 3 top-down, slidey hovercraft inertia physics, shootouts, ice arena maps.
1857. **Ram Racer** `[3D]` — ram opponents off track. *Build:* Three.js oval track, ram opponents via cannon-es impulses, speed boost pads, crash physics.
1858. **Mech Walker Wars** `[3D]` — walking mechs duel. *Build:* Three.js arena, mech walkers with weapon arms, cockpit view, heat management meter.
1859. **Gunboat Gauntlet** `[2D]` — river gunboat combat. *Build:* Phaser 3 river scroller, gunboat turret combat, ambush boats, repair docks.
1860. **Buggy Brawl** `[2D]` — dune buggies with weapons. *Build:* Phaser 3 dunes, buggy suspension physics, mounted weapons, jump ramps.
1861. **Bulldozer Bash** `[2D]` — push enemies into pits. *Build:* Matter.js, bulldozer blade pushes enemies into pits, physics-based arena.
1862. **Chopper Strike** `[3D]` — helicopter attack missions. *Build:* Three.js city, helicopter attack missions, missile targeting, rotor physics.
1863. **Battle Bus** `[2D]` — school bus with turrets. *Build:* Phaser 3 top-down, school bus with turrets, escort students, zombie waves.
1864. **Spiked Wheels** `[2D]` — spike-wheel arena combat. *Build:* Phaser 3 arena, spike wheel collisions, health bars, arena hazards.
1865. **Lawnmower Wars** `[2D]` — mowers clash in suburbs. *Build:* Phaser 3 suburbs, mower clash leaving grass trails, collision combat.
1866. **Shopping Cart Joust** `[2D]` — cart-based joust duels. *Build:* Matter.js, shopping cart joust collisions with mop lances, store aisles.
1867. **Ice Cream Truck Wars** `[2D]` — jingle-powered vehicle combat. *Build:* Phaser 3 top-down, ice cream truck jingle sound wave attacks, ammo cones.
1868. **Monster Rig Rampage** `[3D]` — monster trucks crushing turrets. *Build:* Three.js arena, monster trucks crush turrets, raycast vehicle suspension physics.
1869. **Train Raider** `[2D]` — attack trains on horseback. *Build:* Phaser 3 side-scroller, horseback train raiding, revolver shooting, jump between cars.
1870. **Hover Tank Hex** `[2D]` — hex-grid hover tank battles. *Build:* Canvas 2D hex grid, hover tank battles, turn-based movement, cube coordinates.
1871. **Sub Hunter** `[3D]` — submarine torpedo combat. *Build:* Three.js ocean, submarine torpedo combat, sonar detection, depth layers.
1872. **Jetski Skirmish** `[3D]` — water jetski weapon battles. *Build:* Three.js water with wave shader, jetski weapon battles, buoy checkpoints.
1873. **Rocket Car Ball** `[3D]` — car combat ball arena. *Build:* Three.js arena, rocket car physics with ball, goals, boost pads.
1874. **Snowplow Siege** `[2D]` — plow vehicles push snow traps. *Build:* Phaser 3 snowy streets, snowplow pushes snow traps, enemy vehicles.
1875. **Steam Tank Siege** `[2D]` — steampunk siege vehicles battle. *Build:* Phaser 3 side view, steampunk siege vehicles battle, artillery arcs.

## 76. Monster Hunting — *Phaser 3 / Canvas 2D*
1876. **Beast Tracker** `[2D]` — follow tracks to lairs. *Build:* Phaser 3 tilemap, footprint trail tracking to monster lairs, scent markers.
1877. **Wyvern Hunt** `[3D]` — hunt wyverns, craft armor. *Build:* Three.js valley, wyvern AI, armor crafting from parts, lock-on combat.
1878. **Swamp Stalker** `[2D]` — hunt swamp beasts with traps. *Build:* Phaser 3 swamp, trap placement grid, monster AI pathing, bait items.
1879. **Cryptid Catcher** `[2D]` — photograph and capture cryptids. *Build:* Canvas 2D forest, photograph cryptids with timing, capture nets, sighting journal.
1880. **Slayer's Contract** `[2D]` — accept bounties on monsters. *Build:* Phaser 3, bounty board contracts, monster hunting quests, reward shop.
1881. **Kraken Quest** `[3D]` — harpoon sea monsters. *Build:* Three.js ocean, harpoon throwing physics, kraken tentacle meshes, boat steering.
1882. **Werewolf Watch** `[2D]` — hunt werewolves by moon phase. *Build:* Phaser 3 village, moon phase cycle affects werewolf strength, silver bullets.
1883. **Giant Bug Hunt** `[2D]` — net giant insects. *Build:* Phaser 3 meadow, net swing timing catches giant insects, collection book.
1884. **Vampire Stakeout** `[2D]` — find vampire among townsfolk. *Build:* DOM town UI with Canvas map, deduce vampire NPC from clues, stake at night.
1885. **Lure and Snare** `[2D]` — bait-based monster trapping. *Build:* Phaser 3, bait placement, trap types, monster trapping strategy, loot rewards.
1886. **Monster Field Guide** `[2D]` — study weaknesses, then hunt. *Build:* DOM field guide bestiary, Canvas hunting stages, exploit discovered weaknesses.
1887. **Yeti Expedition** `[3D]` — track yeti in blizzards. *Build:* Three.js snowy mountains, yeti footprints, blizzard fog, tracking expedition.
1888. **Hydra Heads** `[2D]` — sever heads in right order. *Build:* Phaser 3, hydra heads regrow unless severed in correct order, fire cauterize.
1889. **Behemoth Bounty** `[3D]` — co-op giant monster hunting. *Build:* Three.js arena, co-op giant monster hunting via PeerJS WebRTC, part breaks.
1890. **Desert Wurm Hunt** `[2D]` — detect sand wurm vibrations. *Build:* Canvas 2D desert, vibration ripples detection, wurm burst attacks, thumper devices.
1891. **Ghost Trapper** `[2D]` — trap spirits with gadgets. *Build:* Phaser 3 haunted house, ghost trap gadgets, EMF meter detects spirits.
1892. **Spore Beast Hunt** `[2D]` — hunt fungal monsters. *Build:* Phaser 3 caves, fungal monster hunts, spore cloud hazards, gas mask timer.
1893. **Chimera Chase** `[3D]` — multi-part monster weak points. *Build:* Three.js arena, multi-part chimera weak points per head, lock-on targeting.
1894. **Basilisk Mirror** `[2D]` — use mirrors against gaze. *Build:* Canvas 2D, rotate mirrors to reflect basilisk gaze beams back, ray reflection.
1895. **Gryphon Rider Hunt** `[3D]` — airborne monster hunting. *Build:* Three.js sky, gryphon riding flight controls, aerial monster hunting, lance strikes.
1896. **Lake Monster Lure** `[2D]` — fish for lake monsters. *Build:* Canvas 2D lake, fishing line tension meter, lake monster lure and reel fight.
1897. **Golem Breaker** `[3D]` — crack stone giants' cores. *Build:* Three.js quarry, golem core weak points, cracking stone meshes, climb to strike.
1898. **Troll Bridge Bounty** `[2D]` — clear bridges of trolls. *Build:* Phaser 3 bridges, troll bounties, toll riddles, club-dodging combat.
1899. **Monster Taxidermist** `[2D]` — hunt and display trophies. *Build:* Phaser 3, hunt monsters for trophies, trophy display hall, rarity tiers.
1900. **Night Hunter Lodge** `[2D]` — guild-based monster contracts. *Build:* Phaser 3 guild hub, monster contract board, party hire, rank progression.

## 77. Pure Dodge Games — *Canvas 2D*
1901. **Raindrop Dodger** `[2D]` — dodge falling raindrops. *Build:* Canvas 2D, raindrop spawner with increasing rate, player dodge with arrow keys.
1902. **Meteor Shower** `[3D]` — evade incoming meteor storms. *Build:* Three.js plain, meteor shower with shadow-marked impact zones, WASD dodge, crater decals.
1903. **Square Survive** `[2D]` — square dodges flying squares. *Build:* Canvas 2D, square dodges flying squares from edges, survival timer, speed ramp.
1904. **Circle Escape** `[2D]` — stay in circle dodging spikes. *Build:* Canvas 2D, stay inside circle while radial spikes shoot inward, mouse movement.
1905. **Laser Lines** `[2D]` — dodge sweeping laser beams. *Build:* Canvas 2D, sweeping laser lines with warning flashes, segment collision checks.
1906. **Arrow Rain** `[2D]` — dodge hail of arrows. *Build:* Canvas 2D, arrow hail from sky with arc trajectories, shield cooldown dodge.
1907. **Dot Dodge** `[2D]` — tiny dot avoids everything. *Build:* Canvas 2D, tiny dot dodges everything, minimalist hitbox, mouse-follow movement.
1908. **Saw Blade Room** `[2D]` — dodge bouncing saw blades. *Build:* Canvas 2D, bouncing saw blades in room, reflection physics, survival timer.
1909. **Cursor Panic** `[2D]` — mouse cursor avoids projectiles. *Build:* DOM and Canvas, cursor avoids projectiles, mouse movement survival, pointer lock.
1910. **Missile Evade** `[2D]` — outmaneuver homing missiles. *Build:* Canvas 2D, homing missiles with turn-rate limits, outmaneuver with tight turns.
1911. **Falling Pianos** `[2D]` — dodge cartoon falling objects. *Build:* Canvas 2D, falling cartoon pianos and anvils, shadow warnings, dodge left and right.
1912. **Fireball Fiesta** `[2D]` — dodge fireballs from all sides. *Build:* Canvas 2D, fireballs from all screen sides, telegraph arrows, dash dodge.
1913. **Wall Closer** `[2D]` — dodge closing walls gaps. *Build:* Canvas 2D, closing walls with random gaps, timing movement through openings.
1914. **Bouncing Balls Room** `[3D]` — avoid ever-multiplying balls. *Build:* Three.js box room, ever-multiplying bouncing balls with cannon-es physics, WASD dodge.
1915. **Shrinking Safe Zone** `[2D]` — stay inside shrinking zone. *Build:* Canvas 2D, shrinking safe zone circle, outside damages player, moving hazards.
1916. **Pixel Rain** `[2D]` — dodge pixel storm blocks. *Build:* Canvas 2D, pixel storm blocks fall in patterns, grid-based dodging, arrow keys.
1917. **Hedgehog Hop** `[2D]` — dodge cars rolling as hedgehog. *Build:* Canvas 2D, hedgehog rolls across road lanes dodging cars, timing taps.
1918. **Shockwave Ring** `[2D]` — jump expanding shockwave rings. *Build:* Canvas 2D, expanding shockwave rings, jump timing over ring edges.
1919. **Thunderstrike** `[2D]` — dodge lightning strike warnings. *Build:* Canvas 2D, lightning strike warnings on grid tiles, dodge before flash.
1920. **Spinning Blades** `[3D]` — avoid rotating blade arms. *Build:* Three.js arena, rotating blade arms with speed variance, third-person dodging.
1921. **Ninja Star Storm** `[2D]` — dodge shuriken barrage. *Build:* Canvas 2D, shuriken barrage patterns, tiny hitbox dodging, survival score.
1922. **Snowball Swarm** `[2D]` — dodge snowball volleys. *Build:* Canvas 2D, snowball volleys from throwers, dodge and weave, timer.
1923. **Bee Swarm Escape** `[2D]` — outrun chasing bee swarm. *Build:* Canvas 2D, bee swarm chase using boids, outrun to water, speed boosts.
1924. **Ghost Gauntlet** `[2D]` — ghosts drift through walls toward you. *Build:* Canvas 2D, ghosts drift through walls toward player, flashlight slows them.
1925. **Ten Second Survive** `[2D]` — micro dodge challenges. *Build:* Canvas 2D, ten-second micro dodge challenges in rapid sequence, WarioWare-style rotation.

## 78. Reflex & Timing — *Canvas 2D / DOM*
1926. **Quick Draw Western** `[3D]` — draw when signal shows. *Build:* Three.js western street, draw on signal, reaction timer, mouse click to shoot.
1927. **Perfect Stop** `[2D]` — stop the bar dead center. *Build:* Canvas 2D, stop moving bar at center, timing precision, speed increases.
1928. **Catch the Drop** `[2D]` — catch falling objects precisely. *Build:* Canvas 2D, catch falling objects precisely with basket, timing windows.
1929. **Slap Hands** `[2D]` — pull hand away in time. *Build:* DOM, slap hands timing game, two-player keyboard, fake-out moves.
1930. **Ruler Drop** `[2D]` — catch falling ruler test. *Build:* DOM, ruler drop reaction test, millisecond timing, leaderboard.
1931. **Parry Master** `[2D]` — parry attacks at right moment. *Build:* Canvas 2D, parry attacks with timing windows, combo counter, enemy telegraphs.
1932. **Timing Bar Smith** `[2D]` — forge sword with timing taps. *Build:* Canvas 2D, forge sword with timing taps on heat bar, quality rating.
1933. **Pinpoint Pulse** `[2D]` — tap on rhythmic pulse peaks. *Build:* DOM, tap on rhythmic pulse peaks, Web Audio beat clock, streak meter.
1934. **Traffic Signal Sprint** `[2D]` — go on green, stop red. *Build:* DOM, traffic signal go/stop reflex, false start penalties, reaction times.
1935. **Button Mash Duel** `[2D]` — mashing contest, two players. *Build:* DOM, button mash contest two players, tug-of-war meter, keyboard input.
1936. **Flash Freeze** `[2D]` — freeze when lights flash. *Build:* DOM, freeze movement on light flash, penalty for movement, survival.
1937. **Goalie Reflex** `[3D]` — save rapid-fire penalty shots. *Build:* Three.js goal, rapid penalty shots, goalie dive with mouse direction, reflex saves.
1938. **Spinning Wheel Stop** `[2D]` — stop wheel on target. *Build:* Canvas 2D, spinning wheel stop timing on target segment, speed ramp.
1939. **Lockpick Tension** `[2D]` — release pick at sweet spot. *Build:* Canvas 2D, lockpick tension sweet spot, mouse rotation, vibration feedback.
1940. **Hammer Bell** `[2D]` — strike carnival bell perfectly. *Build:* Canvas 2D, carnival bell strike timing with power meter, prize tiers.
1941. **Rapid Sort** `[2D]` — swipe items to correct bins. *Build:* DOM, swipe items to correct bins, speed ramp, combo multiplier.
1942. **Simon Speed** `[2D]` — repeat sequences getting faster. *Build:* DOM, Simon color sequences speed up each round, Web Audio tones.
1943. **Catch the Fly** `[2D]` — chopsticks grab flies. *Build:* Canvas 2D, chopsticks grab erratic flies, timing clicks, buzzing paths.
1944. **Laser Tag Reflex** `[2D]` — shoot targets as they flash. *Build:* Canvas 2D, shoot flashing targets with mouse before they vanish, accuracy score.
1945. **Timing Jump Rope** `[2D]` — jump rope rhythm game. *Build:* Canvas 2D, jump rope rhythm timing, rope speed increases, combo streaks.
1946. **Swat Mosquito** `[2D]` — swat mosquitoes before bites. *Build:* Canvas 2D, swat mosquitoes reflex with mouse clicks, bite meter.
1947. **Reaction Duel** `[2D]` — two-player reaction race. *Build:* DOM, two-player reaction race, random cue, keyboard split controls.
1948. **Egg Catch Chicken** `[2D]` — catch eggs from hens. *Build:* Canvas 2D, catch eggs from hens with basket, timing speed-up.
1949. **Bomb Defuse Timing** `[2D]` — cut wires on time. *Build:* DOM, cut colored wires before timer ends, manual clue lookup.
1950. **Sushi Grab** `[2D]` — grab sushi off fast conveyor. *Build:* Canvas 2D conveyor belt, grab sushi plates by click timing, combo orders.

## 79. Grappling & Rope — *Matter.js / Phaser 3*
1951. **Hook Shot Hero** `[2D]` — grapple through ceiling hooks. *Build:* Matter.js, grapple hooks via distance constraints, ceiling anchors, mouse aim and release.
1952. **Swing City** `[3D]` — web-swing across skyline. *Build:* Three.js skyline, web-swing physics with spring constraints, mouse aim anchor raycasts.
1953. **Rope Swing Jungle** `[2D]` — vine physics swinging. *Build:* Matter.js, vine swing physics with pendulum momentum, release timing.
1954. **Grapple Climb** `[3D]` — hook upward endless tower. *Build:* Three.js endless tower, grapple climbing with raycast anchors, procedural ledges.
1955. **Tether Ball Space** `[3D]` — swing around asteroids. *Build:* Three.js space, swing around asteroids with tether constraint, orbital momentum.
1956. **Lasso Rancher** `[2D]` — rope cattle with physics lasso. *Build:* Matter.js, lasso loop physics catches cattle, rope tension, ranch fences.
1957. **Harpoon Pull** `[2D]` — pull platforms toward you. *Build:* Matter.js, harpoon pulls platforms toward player, constraint reel-in.
1958. **Zip Line Rush** `[3D]` — ride and switch zip lines. *Build:* Three.js forest canopy, zip line splines, switch lines with timing, speed boosts.
1959. **Pendulum Pass** `[2D]` — momentum swings over pits. *Build:* Matter.js, pendulum momentum swings over pits, anchor points, release timing.
1960. **Grapple Ninja** `[2D]` — hook and slash enemies. *Build:* Phaser 3, hook and slash enemies, grapple-based combo attacks.
1961. **Chain Hook Pirate** `[2D]` — hook enemy ships. *Build:* Phaser 3 naval, chain hook enemy ships, boarding melee.
1962. **Bungee Drop** `[2D]` — bungee jump collect coins. *Build:* Matter.js, bungee jump with spring constraint, coin collection at bottom.
1963. **Rope Cutter Hero** `[2D]` — cut ropes, rescue swinging. *Build:* Matter.js, cut ropes to swing rescue pod to safe zones.
1964. **Spider Swing** `[2D]` — spider silk swinging adventure. *Build:* Matter.js, spider silk swinging from ceilings, web anchors, insect collection.
1965. **Kite String Swing** `[2D]` — swing from flying kites. *Build:* Matter.js, swing from flying kites, wind changes, height score.
1966. **Tightrope Tension** `[2D]` — balance on swaying rope. *Build:* Canvas 2D, tightrope balance via mouse tilt, wind gusts, center-of-mass meter.
1967. **Grapple Golf** `[2D]` — grapple ball into hole. *Build:* Matter.js, grapple ball into hole, rope tension, golf scoring.
1968. **Whip Swing Explorer** `[2D]` — whip-swing temple ruins. *Build:* Phaser 3, whip swing temple ruins, anchor rings, trap avoidance.
1969. **Elastic Fling** `[2D]` — slingshot off stretchy ropes. *Build:* Matter.js, slingshot off stretchy rope constraints, launch velocity, targets.
1970. **Rope Race** `[2D]` — race by grappling only. *Build:* Matter.js, grapple-only racing levels, ghost replays, split timers.
1971. **Hook Line Fish** `[2D]` — grappling fisherman catches fish. *Build:* Matter.js, grappling hook fisherman catches fish, reel tension physics.
1972. **Magnet Tether** `[2D]` — magnetic tether swing physics. *Build:* Matter.js, magnetic tether swing physics, polarity toggles, metal anchors.
1973. **Rescue Rope** `[2D]` — lower ropes to save people. *Build:* Matter.js, lower ropes to rescue people from rising flood, rope physics.
1974. **Anchor Toss** `[2D]` — throw anchor, reel yourself. *Build:* Matter.js, throw anchor, reel yourself toward it, momentum chaining.
1975. **Double Grapple** `[2D]` — two hooks, one body. *Build:* Matter.js, two grappling hooks on one body, alternating mouse buttons.

## 80. .io-style Arenas — *Socket.IO / Canvas*
1976. **Orb Eater IO** `[2D]` — eat orbs, grow bigger. *Build:* Canvas 2D with Socket.IO server, eat orbs to grow, camera zoom scales.
1977. **Territory Paint IO** `[2D]` — claim land by painting. *Build:* Canvas 2D with Socket.IO, territory painting by enclosing loops, flood fill.
1978. **Worm Wars IO** `[2D]` — slither and cut off rivals. *Build:* Canvas 2D with Socket.IO, slither worms, cut off rivals, segment collisions.
1979. **Spike Ball IO** `[2D]` — spiked ball knock arena. *Build:* Canvas 2D with Socket.IO, spiked ball knockback, arena edges, power-ups.
1980. **Hole Hunger IO** `[3D]` — swallow city and rivals. *Build:* Three.js city with Socket.IO, hole swallows objects smaller than radius, rivals.
1981. **Fish Food IO** `[2D]` — fish eat smaller fish. *Build:* Canvas 2D with Socket.IO, fish eat smaller fish, growth tiers, chase AI bots.
1982. **Kite Battle IO** `[2D]` — cut others' kite strings. *Build:* Canvas 2D with Socket.IO, kite string cutting via line intersection, wind.
1983. **Planet Grab IO** `[3D]` — capture planets with gravity. *Build:* Three.js with Socket.IO, planets capture via gravity, orbital mechanics, rivals.
1984. **Sword Swing IO** `[2D]` — growing swords cut rivals. *Build:* Canvas 2D with Socket.IO, swords grow per kill, arc collision cutting rivals.
1985. **Bumper Boats IO** `[3D]` — knock boats off map. *Build:* Three.js water arena with Socket.IO, bumper boats knockback, cannon-es physics.
1986. **Hive Mind IO** `[2D]` — grow bee swarm army. *Build:* Canvas 2D with Socket.IO, bee swarm army via boids, territory hives.
1987. **Blob Merge IO** `[2D]` — merge cells, split attack. *Build:* Canvas 2D with Socket.IO, merge cells, split attack mechanic, mass decay.
1988. **Laser Tag IO** `[3D]` — online laser tag battles. *Build:* Three.js maze with Socket.IO, online laser tag, raycast beams, team scores.
1989. **Zombie Horde IO** `[2D]` — infect players to grow. *Build:* Canvas 2D with Socket.IO, infect players to grow zombie horde, survivor timer.
1990. **Mower Mayhem IO** `[2D]` — mow lawns, cut rivals. *Build:* Canvas 2D with Socket.IO, mow lawn tiles, cut rivals with blade trails.
1991. **Ship Wars IO** `[2D]` — pirate ships upgrade cannons. *Build:* Canvas 2D with Socket.IO, pirate ship upgrades, broadside cannon arcs.
1992. **Tower Rush IO** `[2D]` — build towers, destroy rivals. *Build:* Canvas 2D with Socket.IO, build towers on grid, destroy rival bases.
1993. **Pixel Battle IO** `[2D]` — draw pixels, claim canvas. *Build:* Canvas 2D with Socket.IO, pixel canvas claiming, cooldown placement, territory.
1994. **Snowball IO** `[3D]` — roll bigger snowballs, crush. *Build:* Three.js snowy slope with Socket.IO, rolling snowball growth, crush rivals.
1995. **Star Collector IO** `[2D]` — grab stars before others. *Build:* Canvas 2D with Socket.IO, grab stars spawned randomly, leaderboard ranking.
1996. **Dino Stomp IO** `[3D]` — dinosaurs grow by eating. *Build:* Three.js with Socket.IO, dinosaurs grow by eating, stomp smaller players.
1997. **Pac Arena IO** `[2D]` — multiplayer maze munching. *Build:* Canvas 2D with Socket.IO, multiplayer maze munching, power pellet chases.
1998. **Magnet Pull IO** `[2D]` — attract debris, crush rivals. *Build:* Canvas 2D with Socket.IO, magnet attracts debris, orbiting junk crushes rivals.
1999. **Bubble Trap IO** `[2D]` — trap players in bubbles. *Build:* Canvas 2D with Socket.IO, bubble shots trap players, pop for points.
2000. **Tank Grow IO** `[2D]` — tank upgrades with points. *Build:* Canvas 2D with Socket.IO, tank upgrade tree with points, bullet stats.

## 81. Turn-based Tactics — *Phaser 3*
2001. **Squad Ember** `[2D]` — fire-team tactics with overwatch. *Build:* Phaser tilemap grid, BFS movement range, overwatch reaction triggers on enemy move, mouse clicks.
2002. **Knightfall Ridge** `[3D]` — cliffside battles using high ground. *Build:* Three.js heightmap tiles, elevation damage bonus, A* pathfinding, raycast tile picking with mouse.
2003. **Badger Brigade** `[2D]` — woodland animals in grid skirmishes. *Build:* Phaser sprites on square grid, turn queue array, simple utility AI, click to move.
2004. **Mercenary Ledger** `[2D]` — hire squads, pay upkeep, fight. *Build:* DOM roster screens plus Phaser battle grid, localStorage campaign save, gold upkeep per turn.
2005. **Shieldwall Saga** `[2D]` — formation pushing on narrow bridges. *Build:* Canvas lane grid, push/shove resolution with adjacency checks, units fall off edges, clicks.
2006. **Cover & Flank** `[3D]` — XCOM-lite cover percentage combat. *Build:* Three.js isometric voxel map, line-of-sight raycasts for cover, hit chance calculation, mouse picking.
2007. **Chrono Gambit** `[2D]` — rewind one turn per battle. *Build:* Phaser grid, snapshot game state array each turn, restore on rewind, click controls.
2008. **Pawnstorm Tactics** `[2D]` — chess pieces gain RPG abilities. *Build:* Canvas 8x8 board, chess move generators plus HP and ability cooldowns, minimax AI.
2009. **Ronin Crossroads** `[2D]` — samurai duels with stance choices. *Build:* Phaser sprites, rock-paper-scissors stance matrix, simultaneous turn reveal, keyboard or buttons.
2010. **Siegebreak Squad** `[2D]` — breach walls with ladders, rams. *Build:* Canvas side-view grid, destructible wall tile HP, ladder placement actions, mouse input.
2011. **Frostbite Patrol** `[2D]` — tactics where cold drains movement. *Build:* Phaser grid with heat sources, temperature map per tile, movement points reduced by cold.
2012. **Tidewatch Isles** `[2D]` — battles shift with rising tides. *Build:* Canvas tilemap with water level per turn, tiles flood by height, A* rerouting.
2013. **Lantern Brigade** `[2D]` — fight monsters inside shrinking light. *Build:* Canvas grid with light radius shadowcasting, fog of war mask, click to move.
2014. **Robot Rumble Grid** `[2D]` — program mechs, then resolve turns. *Build:* DOM command slots, simultaneous resolution order by priority, Canvas grid animation playback.
2015. **Paper Generals** `[3D]` — origami armies on desk maps. *Build:* Three.js low-poly paper figures on plane, hex grid overlay, raycast picking, turn manager.
2016. **Sheriff's Standoff** `[2D]` — western shootouts with initiative order. *Build:* Phaser grid, initiative queue sorted by speed, cover tiles, hit dice rolls, mouse.
2017. **Clockwork Legion** `[2D]` — units act in fixed gear cycles. *Build:* Canvas grid, units with cyclic action arrays indexed by turn modulo, click setup phase.
2018. **Witchwood Skirmish** `[2D]` — terrain spells reshape the grid. *Build:* Phaser tilemap with mutable tile types, spells transform areas, pathfinding recalculated each turn.
2019. **Vanguard Echo** `[2D]` — clone units replay previous moves. *Build:* Canvas grid, record move histories per unit, spawn ghost units replaying arrays.
2020. **Gnome Artillery** `[2D]` — lob shells over mushroom hills. *Build:* Canvas side-view terrain heightmap, projectile parabola with wind, crater pixel removal, drag to aim.
2021. **Rooftop Raiders** `[3D]` — vertical city-block tactics. *Build:* Three.js stacked voxel buildings, 3D grid pathfinding with ladders, OrbitControls camera, raycast selection.
2022. **Kitchen Commandos** `[2D]` — tiny soldiers on countertop terrain. *Build:* Phaser top-down kitchen tilemap, object obstacles as cover, turn queue, click movement.
2023. **Monsoon Front** `[2D]` — weather fronts alter each turn. *Build:* Canvas grid with moving weather cells, modifiers to accuracy and movement, AI turns.
2024. **Last Stand Lighthouse** `[2D]` — hold position against wave assaults. *Build:* Phaser grid, enemy waves from spawn edges, survive N turns objective, mouse orders.
2025. **Hex Tactics Duo** `[2D]` — hotseat duels on small hexes. *Build:* Canvas axial-coordinate hex grid, hotseat turn switching, unit stats JSON, click controls.

## 82. City & Colony Builders — *Canvas 2D / PixiJS*
2026. **Hamlet Rising** `[2D]` — grow village into walled town. *Build:* PixiJS isometric tile grid, building placement with adjacency bonuses, resource tick loop.
2027. **Ringworld Habitat** `[3D]` — build along a spinning ring. *Build:* Three.js torus segments as build slots, rotating camera, resource simulation tick, raycast placement.
2028. **Mars Dome Planner** `[2D]` — manage oxygen and pressure domes. *Build:* Canvas grid domes, oxygen flow via graph connections, breach events, click to build.
2029. **Treetop Township** `[2D]` — vertical canopy city building. *Build:* Canvas side-view tree branches as slots, weight limits per branch, rope bridges, mouse.
2030. **Canal Republic** `[2D]` — water-network city like Venice. *Build:* PixiJS tile grid, canal flood fill for boat access, gondola routing BFS, zoning clicks.
2031. **Underground Haven** `[3D]` — dig bunker colony for survivors. *Build:* Three.js voxel cross-section digging, room types, colonist job queue with pathfinding.
2032. **Floating Archipelago** `[2D]` — chain rafts into city islands. *Build:* Canvas raft tiles with buoyancy balance, connected component checks, drag placement.
2033. **Glacier Outpost** `[2D]` — survive polar winters with heat grids. *Build:* PixiJS grid, heat diffusion cellular simulation, generators fuel tick, click building.
2034. **Desert Oasis Settlement** `[2D]` — ration wells and shade crops. *Build:* Canvas grid, groundwater level map, shade radius bonuses, seasonal tick, mouse.
2035. **Moonbase Alpha Grid** `[3D]` — lunar base with power balancing. *Build:* Three.js modular habitat meshes on grid, power graph solver, OrbitControls, raycast placement.
2036. **Mushroom Kingdom Builder** `[2D]` — fungal city with spore roads. *Build:* PixiJS tiles, mycelium network spreads via cellular automaton, buildings need connection.
2037. **Pocket Metropolis** `[2D]` — tiny city on a 10x10 grid. *Build:* DOM CSS grid, zoning adjacency scoring, demand bars, click cycles building types.
2038. **Zoning Zen** `[2D]` — minimalist zoning with no UI clutter. *Build:* Canvas paint zones with drag, growth simulation by neighbor density, soft colors.
2039. **Seaside Boardwalk** `[2D]` — build boardwalk town for tourists. *Build:* PixiJS side-scrolling strip, tourist agents with needs, attraction placement, mouse.
2040. **Volcano Village** `[3D]` — rebuild after scheduled eruptions. *Build:* Three.js terrain mesh, lava flow downhill cellular simulation, building placement via raycast.
2041. **Beaver Dam Colony** `[2D]` — rodent engineers controlling rivers. *Build:* Canvas grid water flow simulation, dam tiles raise level, beaver job AI.
2042. **Cloud Citadel** `[3D]` — sky city held by balloons. *Build:* Three.js floating platforms, lift versus weight balance, OrbitControls camera, click to attach modules.
2043. **Orbital Ring Station** `[3D]` — modular orbital habitat builder. *Build:* Three.js snapping modules on docking ports, crew needs simulation, OrbitControls.
2044. **Pioneer Trail Town** `[2D]` — frontier settlement with caravans. *Build:* PixiJS tile map, caravan arrivals by timer, resource economy, click placement.
2045. **Hive Mind Colony** `[2D]` — insect city by pheromone paths. *Build:* Canvas grid pheromone diffusion and decay, agent ants follow gradients, paint trails.
2046. **Ruins Reclaimed** `[2D]` — rebuild post-apocalyptic city ruins. *Build:* PixiJS isometric map, salvage clearing jobs, rebuilding costs, worker pathfinding A*.
2047. **Cliffside Monastery** `[2D]` — terraced monk village on mountain. *Build:* Canvas side-view terraces, stair connectivity graph, food and faith resources.
2048. **Neon Megablock** `[3D]` — stacked arcology housing simulator. *Build:* Three.js stacked box floors, residents happiness model, elevator capacity simulation, raycast build.
2049. **Harbor Haven** `[2D]` — port town shaped by trade ships. *Build:* PixiJS tile map, ship arrivals with cargo demand, warehouse capacity, click building.
2050. **Lakeside Commune** `[2D]` — cooperative village with shared votes. *Build:* DOM proposal cards plus Canvas map, villager opinion model, voting resolution tick.

## 83. Trading & Economy — *Vanilla JS / DOM*
2051. **Spice Route Ledger** `[2D]` — buy low across caravan towns. *Build:* DOM price tables, random walk prices per town, travel time days, buttons.
2052. **Merchant Barge** `[2D]` — river trading with toll gates. *Build:* Canvas river path map, toll checkpoints events, inventory weight limits, click to travel.
2053. **Silk & Saffron** `[2D]` — medieval bazaar haggling sim. *Build:* DOM dialogue, haggle model with merchant patience meter, hidden reserve price, sliders.
2054. **Commodity Pit** `[2D]` — open-outcry futures trading game. *Build:* Canvas price chart, AI traders shouting bids, order book matching, keyboard quick trades.
2055. **Galactic Bazaar** `[3D]` — interstellar goods arbitrage. *Build:* Three.js star map spheres, raycast system selection, per-system supply-demand prices, DOM trade panel.
2056. **Pawn Counter** `[2D]` — appraise items, haggle with customers. *Build:* DOM item cards with hidden value, offer slider, customer patience timer, localStorage.
2057. **Tulip Mania** `[2D]` — ride and escape a speculative bubble. *Build:* Canvas line chart, bubble price model with sentiment, buy and sell buttons.
2058. **Barter Island** `[2D]` — trade without money between tribes. *Build:* DOM inventory grids, tribe want-lists, exchange ratio matching, drag and drop items.
2059. **Black Market Runner** `[2D]` — smuggle goods past inspectors. *Build:* DOM city list, inspection probability per route, hidden compartment capacity, risk choices.
2060. **Crypto Tycoon Sim** `[2D]` — volatile token portfolio management. *Build:* Canvas candlestick charts, geometric Brownian motion prices, news events, DOM buttons.
2061. **Auction House Hustle** `[2D]` — flip items in timed auctions. *Build:* DOM auction listings, AI bidders with valuations, countdown timers, click to bid.
2062. **Fur Trader's Winter** `[2D]` — frontier trading post survival. *Build:* DOM day turns, trapper visits, supply spoilage, seasonal price tables, choices.
2063. **Salt Road Caravan** `[2D]` — camel caravans across dunes. *Build:* Canvas map nodes, water consumption per day, sandstorm events, route selection clicks.
2064. **Gold Standard** `[2D]` — central bank currency balancing. *Build:* DOM sliders for rates and reserves, inflation model equations, Canvas chart history.
2065. **Pirate Fence** `[2D]` — sell plunder without getting caught. *Build:* DOM buyer list, heat meter rising per sale, item provenance flags, choices.
2066. **Orbital Exchange** `[3D]` — station-to-station cargo trading. *Build:* Three.js orbiting stations, Kepler-like circular orbits, transfer windows timing, DOM market.
2067. **Antique Hunter** `[2D]` — garage sales to antique shows. *Build:* DOM item grid with hidden rarity, expertise skill reveals, sell at shows, localStorage.
2068. **Stock Ticker Tape** `[2D]` — 1920s ticker trading simulation. *Build:* DOM scrolling ticker CSS animation, random walk prices, margin calls, buttons.
2069. **Supply & Demand Lab** `[2D]` — set prices, watch markets react. *Build:* Canvas supply and demand curves, agent buyers with reservation prices, sliders.
2070. **Ivory Tower Trades** `[2D]` — university town book trading. *Build:* DOM semester calendar, textbook demand spikes, inventory buying, price setting inputs.
2071. **Rare Coin Collector** `[2D]` — grade and trade coins. *Build:* Canvas zoomable coin images with flaws, grading guess, market value tables.
2072. **Harbor Futures** `[2D]` — bet on ship arrival cargo. *Build:* DOM contracts, ship voyages with storm probability, settlement on arrival tick.
2073. **Venture Ledger** `[2D]` — fund startups for equity returns. *Build:* DOM startup cards with hidden potential, funding rounds, dilution math, timelines.
2074. **Tea Clipper Race** `[3D]` — race ships for tea profits. *Build:* Three.js ocean plane and ship models, wind vector field, keyboard sail trimming.
2075. **Wholesale Wizard** `[2D]` — magic reagent wholesaling. *Build:* DOM shop UI, reagent decay timers, wizard customer orders queue, buy-sell buttons.

## 84. Shop & Business Tycoons — *Vanilla JS / Canvas*
2076. **Ramen Stand Empire** `[2D]` — noodle cart to restaurant chain. *Build:* Canvas shop view, customer queue agents, recipe upgrades, branch expansion menus.
2077. **Bookshop Nook** `[2D]` — curate shelves for picky readers. *Build:* DOM shelf grid drag and drop, customer genre preferences matching, daily sales.
2078. **Arcade Owner** `[3D]` — buy cabinets, manage tokens. *Build:* Three.js room with cabinet models, visitor agents pathing, revenue per machine, raycast placement.
2079. **Flower Stall Florist** `[2D]` — arrange bouquets for orders. *Build:* Canvas drag flowers into vase, color harmony scoring, order tickets, timer.
2080. **Laundromat Tycoon** `[2D]` — machines, coins, and repairs. *Build:* Canvas top-down floor, machine state machines, breakdown chance, customer wait patience.
2081. **Food Truck Fleet** `[2D]` — route trucks to hungry crowds. *Build:* Canvas city map heatmap of demand by hour, drag trucks to spots.
2082. **Gym Membership Mogul** `[2D]` — grow a fitness chain. *Build:* DOM dashboards, membership churn model, equipment purchases, Canvas member graph.
2083. **Record Store Days** `[2D]` — vinyl crate digging and sales. *Build:* DOM crate flipping cards, genre trends, pricing inputs, collector customer events.
2084. **Ice Cream Parlor** `[2D]` — scoop combos, manage melt. *Build:* Canvas cone stacking, melt timer per scoop, order matching, mouse drag.
2085. **Tattoo Studio Sim** `[2D]` — book artists, design flash. *Build:* Canvas trace-the-stencil drawing scored by path distance, booking calendar DOM.
2086. **Toy Workshop Inc** `[2D]` — manufacture seasonal toy hits. *Build:* DOM production lines, trend popularity curves, inventory, holiday demand spike.
2087. **Car Wash Kingpin** `[2D]` — upgrade wash bays for throughput. *Build:* Canvas queue simulation of cars, bay processing times, upgrade buttons.
2088. **Pet Grooming Salon** `[2D]` — groom, style, satisfy owners. *Build:* Canvas brush and trim tools, fur mask erasing, owner request matching.
2089. **Thrift Shop Flipper** `[2D]` — price donations, find treasures. *Build:* DOM donation bins, hidden item value, price tag inputs, sell-through rate.
2090. **Bike Repair Garage** `[3D]` — diagnose and fix bicycles. *Build:* Three.js bike model with clickable parts, fault diagnosis tree, part swapping.
2091. **Cinema Manager** `[2D]` — schedule films, sell popcorn. *Build:* DOM timeline schedule drag, film popularity decay, concession sales model.
2092. **Bubble Tea Bar** `[2D]` — mix drinks, tune menu. *Build:* Canvas cup filling layers, order recipes, tap timing, menu pricing DOM.
2093. **Hardware Haven** `[2D]` — stock tools for contractors. *Build:* DOM inventory reorder points, contractor order queue, supplier lead times.
2094. **Boutique Hotel Manager** `[3D]` — design rooms, five-star reviews. *Build:* Three.js room interiors with furniture placement, guest preference scoring, review text generator.
2095. **Escape Room Owner** `[2D]` — build rooms, tune puzzles. *Build:* Canvas room editor, puzzle difficulty parameters, simulated group solve times, reviews.
2096. **Ski Resort Tycoon** `[3D]` — lifts, lodges, snow conditions. *Build:* Three.js mountain heightmap, lift placement, skier agents down slopes, snowfall tick.
2097. **Ferry Line Owner** `[2D]` — buy boats, schedule crossings. *Build:* Canvas harbor map, timetable editor DOM, passenger demand by hour, fuel costs.
2098. **Comic Shop Corner** `[2D]` — pull lists and collector events. *Build:* DOM subscriber pull lists, weekly releases, event planning, rarity speculation.
2099. **Vending Machine Baron** `[2D]` — place machines across city. *Build:* Canvas city map foot traffic heat, restock routes, product selection DOM.
2100. **Bowling Alley Boss** `[3D]` — lanes, leagues, and snacks. *Build:* Three.js alley with lane meshes, league schedule, maintenance events, raycast upgrades.

## 85. Farming & Cooking — *Phaser 3 / Canvas*
2101. **Moonlit Orchard** `[2D]` — night farming with glowing fruit. *Build:* Phaser tilemap, moon phase growth modifiers, light radius glow sprites, keyboard movement.
2102. **Rooftop Greenhouse** `[3D]` — urban hydroponics farming sim. *Build:* Three.js greenhouse interior, plant growth scaling meshes, pH and light sliders, raycast.
2103. **Terrace Rice Paddy** `[2D]` — flood-manage hillside rice fields. *Build:* Canvas terraced grid, water flowing downhill between tiers, gate toggles, growth tick.
2104. **Sourdough Starter** `[2D]` — feed starters, bake perfect loaves. *Build:* DOM jar with rise meter, feeding schedule real time, oven timing minigame.
2105. **Dumpling Diner** `[2D]` — fold dumplings to orders. *Build:* Canvas pinch gestures via mouse drag sequences, order queue, accuracy scoring.
2106. **Hydro Harvest** `[2D]` — nutrient-solution balancing farm. *Build:* DOM sliders for nutrients, plant health model, Canvas growth graph, alerts.
2107. **Sushi Counter** `[2D]` — slice, roll, serve omakase. *Build:* Canvas swipe-to-slice mouse gestures, rolling timing bar, customer satisfaction queue.
2108. **Pumpkin Patch Fair** `[3D]` — grow giant prize pumpkins. *Build:* Three.js pumpkin sphere scaling with noise deformation, watering and fertilizer choices, fair judging.
2109. **Vineyard Vintner** `[2D]` — grow grapes, age wines. *Build:* Phaser vineyard tiles, weather seasons, barrel aging stats, blending ratio sliders.
2110. **Goat Cheese Valley** `[2D]` — milk goats, craft cheeses. *Build:* Phaser top-down farm, goat happiness, cheese aging timers in cellar slots.
2111. **Spice Garden** `[2D]` — rare herbs with soil chemistry. *Build:* Canvas garden grid, soil pH and nitrogen per tile, companion planting bonuses.
2112. **Taco Tower** `[2D]` — stack tacos fast for customers. *Build:* Canvas falling ingredient stacking, order matching, keyboard lane controls, timer.
2113. **Bento Builder** `[2D]` — pack balanced lunchboxes. *Build:* DOM grid packing polyomino foods, nutrition score balance, drag and drop.
2114. **Honey Meadow** `[2D]` — flower-placement pollination farming. *Build:* Canvas field, bee agents seeking nearest flowers, nectar yield, click to plant.
2115. **Mushroom Cellar** `[2D]` — grow fungi in damp darkness. *Build:* Canvas cellar grid humidity diffusion, spore spreading automaton, harvest clicks.
2116. **Pancake Flip Stack** `[2D]` — timing-based griddle cooking. *Build:* Canvas griddle, browning timer per pancake, click to flip, stack physics wobble.
2117. **Seaweed Farmer** `[3D]` — underwater kelp cultivation. *Build:* Three.js underwater scene with fog, kelp line growth via bone chains, current direction.
2118. **Chili Cook-off** `[2D]` — balance heat for judges. *Build:* DOM ingredient sliders, flavor vector scoring versus judge preferences, simmer timer.
2119. **Maple Sugarhouse** `[2D]` — tap trees, boil syrup. *Build:* Canvas forest, sap flow by daily temperature swings, boil-down concentration meter.
2120. **Pasta Workshop** `[2D]` — hand-shape pasta varieties. *Build:* Canvas dough deformation via mouse gesture paths, shape template matching score.
2121. **Crop Rotation Puzzle** `[2D]` — plan fields across seasons. *Build:* DOM grid puzzle, soil nutrient arrays per field, season-by-season scoring.
2122. **Grandma's Recipe Box** `[2D]` — recreate dishes from vague notes. *Build:* DOM recipe cards, hidden target ratios, taste feedback hints, ingredient inputs.
2123. **Barbecue Pitmaster** `[3D]` — smoke meats, manage fire. *Build:* Three.js smoker with particle smoke, temperature curve model, vent sliders, wood timing.
2124. **Tofu Tycoon Farm** `[2D]` — soy to tofu supply chain. *Build:* Phaser farm tiles plus factory conveyor, processing timers, market sales DOM.
2125. **Wok Toss Master** `[2D]` — stir-fry timing and heat. *Build:* Canvas wok physics with ingredient particles, mouse flick tosses, char level per item.

## 86. Creature Collecting — *Phaser 3*
2126. **Mothling Catcher** `[2D]` — net nocturnal moths by lantern. *Build:* Phaser night scene, moth boids attracted to light, click net capture, journal.
2127. **Slime Ranch Pals** `[2D]` — breed and color-mix slimes. *Build:* Phaser pens, RGB gene mixing on breeding, trait inheritance tables, drag slimes.
2128. **Cryptid Field Guide** `[3D]` — photograph elusive cryptids. *Build:* Three.js forest, cryptid AI fleeing when seen, camera framing score, pointer-lock controls.
2129. **Pebble Pets** `[2D]` — collect living stones with traits. *Build:* Canvas riverbed scan, procedural stone shapes, trait rarity rolls, localStorage collection.
2130. **Spirit Lantern Bond** `[2D]` — befriend wandering spirits. *Build:* Phaser overworld, spirit mood minigames, bond level stats, keyboard exploration.
2131. **Beetle Battle League** `[2D]` — catch and spar beetles. *Build:* Phaser sumo-push battles with stat-based physics, catching traps on trees.
2132. **Tidepool Tamers** `[2D]` — collect coastal creatures. *Build:* Canvas tide timer revealing pools, creature spawns per pool, click capture, dex.
2133. **Dragon Egg Hatchery** `[3D]` — incubate eggs for rare dragons. *Build:* Three.js egg models with temperature shaders, incubation sliders, hatch outcomes table.
2134. **Feather Finders** `[2D]` — birdwatching collection journey. *Build:* Phaser biomes, birds with schedule spawns, binocular zoom minigame, field notes.
2135. **Pixel Critter Dex** `[2D]` — complete a 150-critter dex. *Build:* Phaser tall-grass encounter rolls, turn battle, catch probability formula, JSON dex.
2136. **Fossil Revivers** `[2D]` — dig fossils, revive beasts. *Build:* Canvas layered dig grid with brush and pick, bone assembly puzzle, revival.
2137. **Sprout Spirits** `[2D]` — plant creatures grown from seeds. *Build:* Phaser garden plots, growth conditions decide species, care stats timers.
2138. **Elemental Wisps** `[2D]` — fuse wisps into new elements. *Build:* Canvas particle wisps, fusion recipe table, discovery log, drag to combine.
2139. **Starfall Familiars** `[3D]` — catch creatures from meteor showers. *Build:* Three.js night sky with falling meteors, raycast clicks to catch, landing spot search.
2140. **Moss Monsters** `[2D]` — mossy critters that evolve by biome. *Build:* Phaser biome map, exposure counters drive evolution branches, turn battles.
2141. **Bug Jar Summer** `[2D]` — summer bug catching collection. *Build:* Phaser meadow, bug movement patterns per species, net swing hitbox, day timer.
2142. **Puddle Pals** `[2D]` — rainy-day amphibian collecting. *Build:* Canvas rain particle weather, puddle spawning, frog hop AI, click capture.
2143. **Kaiju Kindergarten** `[2D]` — raise tiny kaiju. *Build:* DOM care stats, training minigames, growth stages art swaps, localStorage persistence.
2144. **Gem Golems** `[3D]` — mine and awaken gem creatures. *Build:* Three.js cave voxels with mining, gem combos create golems, raycast digging.
2145. **Shadowbeast Tamer** `[2D]` — tame creatures only at night. *Build:* Phaser day-night cycle, shadow creatures appear in darkness, taming rhythm minigame.
2146. **Fluffball Fusion** `[2D]` — merge fluffy creatures for traits. *Build:* Canvas merge grid, trait combination rules, rarity tiers, drag to merge.
2147. **Coral Kin** `[3D]` — reef creatures with symbiosis bonds. *Build:* Three.js reef scene, creature pair bonuses graph, swim controls with WASD.
2148. **Arcane Menagerie** `[2D]` — wizard zoo of captured beasts. *Build:* Phaser zoo pens, visitor satisfaction, beast escape chance, capture expeditions.
2149. **Glitch Pets** `[2D]` — corrupted data creatures to debug. *Build:* Canvas pixel sprites with glitch shader effects, debugging puzzles to tame.
2150. **Cloud Critters** `[2D]` — catch creatures from passing clouds. *Build:* Canvas parallax cloud layers, creature shapes from Perlin noise, click capture.

## 87. JRPG-style — *Phaser 3 / Canvas*
2151. **Crystal Vow** `[2D]` — four heroes restore fading crystals. *Build:* Phaser tilemaps, random encounters, menu turn-based battles, JSON item and spell data.
2152. **Ember Saga** `[2D]` — fire-touched hero's turn-based quest. *Build:* Phaser overworld, ATB gauge battles, heat meter mechanic, keyboard menus.
2153. **Skyship Chronicle** `[3D]` — airship world exploration RPG. *Build:* Three.js low-poly globe, airship flight controls, towns as Phaser scenes, turn battles.
2154. **Moonbell Requiem** `[2D]` — music-powered battle system. *Build:* Phaser battles with Tone.js note sequences as spells, timing input bonuses.
2155. **Wandering Blade** `[2D]` — lone swordsman ATB adventure. *Build:* Phaser ATB battles, parry timing windows, skill tree JSON, keyboard input.
2156. **Starlight Sonata** `[2D]` — party bonds unlock combo attacks. *Build:* Phaser battles, bond matrix between party members, combo unlock thresholds.
2157. **Eclipse Wardens** `[2D]` — day/night swap party roles. *Build:* Phaser world with time toggle, role stat swaps, enemy weaknesses by phase.
2158. **Tidewalker Tales** `[2D]` — ocean-hopping island JRPG. *Build:* Phaser sailing overworld, island tilemaps, crew recruitment, turn-based battles.
2159. **Iron Lotus** `[2D]` — mech pilots in feudal world. *Build:* Phaser battles with mech part targeting, part HP arrays, keyboard menus.
2160. **Sunken Kingdom Tale** `[2D]` — undersea quest with air meter. *Build:* Phaser tilemaps, air meter depletes during exploration, bubble refills, battles.
2161. **Petal Knights** `[2D]` — flower-themed job class system. *Build:* Phaser job system JSON, ability points per class, menu-based turn combat.
2162. **Frostfang Legend** `[3D]` — wolf-rider winter campaign. *Build:* Three.js snowy overworld, wolf mount movement, turn-based battle arena scene.
2163. **Clockwork Crown** `[2D]` — steampunk heir reclaims throne. *Build:* Phaser tilemaps, gear-upgrade crafting, turn battles with steam gauge resource.
2164. **Mirror Realm Odyssey** `[2D]` — party swaps between mirror worlds. *Build:* Phaser dual tilemaps toggled by mirrors, puzzle switches, turn battles.
2165. **Lantern Pilgrims** `[2D]` — escort a fragile light shrine. *Build:* Phaser overworld, shrine HP and light radius, encounter battles protecting shrine.
2166. **Dragon Heir Quest** `[2D]` — hatchling grows with party. *Build:* Phaser battles, dragon growth stages from fed items, evolving skill sets.
2167. **Echoes of Aether** `[2D]` — magic system from echoing spells. *Build:* Phaser battles, spells repeat next turn at half power, queue system.
2168. **Rune Breaker** `[2D]` — break enemy runes for weak points. *Build:* Phaser battles, enemies with rune shields arrays, elemental breaking, stun turns.
2169. **Shrine Maiden Path** `[2D]` — purification-based battle JRPG. *Build:* Phaser battles where enemies purified not killed, corruption meters, talismans.
2170. **Turnip Hero** `[2D]` — farm boy saves kingdom, comedic. *Build:* Phaser tilemaps, vegetable-based weapons, joke dialogue trees, turn-based battles.
2171. **Celestial Bus Stop** `[2D]` — whimsical JRPG on a cosmic bus. *Build:* Phaser bus-stop hub scenes, passengers as party members, turn battles.
2172. **Gearsoul Brigade** `[2D]` — robots seeking human memories. *Build:* Phaser tilemaps, memory chip equipment slots, battle stats, branching dialogue JSON.
2173. **Verdant Wanderer** `[3D]` — overgrown world restoration RPG. *Build:* Three.js low-poly world, restored areas regrow vegetation, turn-based encounters, WASD.
2174. **Twin Moons Covenant** `[2D]` — dual-world party JRPG. *Build:* Phaser two parties alternating, shared inventory, moon phase buffs, turn battles.
2175. **Sandglass Paladin** `[2D]` — time-limited heroic quest. *Build:* Phaser world with global day countdown, events schedule, turn battles, multiple endings.

## 88. Deck-builders — *DOM / Vanilla JS*
2176. **Spire of Cards** `[2D]` — climb floors, refine deck. *Build:* DOM card hand, draw-discard pile arrays, branching map graph, enemy intent display.
2177. **Hexcaster Deck** `[2D]` — spell cards placed on hex grid. *Build:* Canvas hex grid, cards define area patterns, drag cards onto hexes.
2178. **Pirate's Hand** `[2D]` — ship battles with crew cards. *Build:* DOM card UI, ship hull and sail HP, broadside cards, map events.
2179. **Gardener's Deck** `[2D]` — grow cards that bloom later. *Build:* DOM cards with growth counters, delayed effects queue, garden slots.
2180. **Heist Hand** `[2D]` — build deck to rob vaults. *Build:* DOM cards, alarm meter, vault lock sequences, guard patrol event deck.
2181. **Train Deck Express** `[2D]` — cards are train cars. *Build:* DOM horizontal train lane, car order matters for adjacency effects, drag.
2182. **Kitchen Deck Duel** `[2D]` — ingredient cards form recipes. *Build:* DOM hand, recipe pattern matching sets, customer enemy HP, discard pile.
2183. **Necromancer's Pile** `[2D]` — discard pile revives as minions. *Build:* DOM cards, discard array becomes minion pool, summon costs, enemy intents.
2184. **Starship Loadout** `[3D]` — module cards for space combat. *Build:* Three.js ship model showing installed modules, DOM card hand, shield facing combat.
2185. **Bard's Ballad Deck** `[2D]` — chain cards into songs. *Build:* DOM cards with note tags, sequence matching for song bonuses, Tone.js audio.
2186. **Cursed Tarot Run** `[2D]` — tarot cards with dark costs. *Build:* DOM tarot cards, curse status stacks, branching path map, localStorage runs.
2187. **Monk's Path Cards** `[2D]` — stance-switching combo deck. *Build:* DOM cards, stance state machine changing card effects, combo counters.
2188. **Wild West Draw** `[2D]` — gunslinger poker-hand deckbuilder. *Build:* DOM poker hand evaluator determines damage, bullets as energy, enemy duels.
2189. **Mecha Deck Assault** `[2D]` — mech parts as cards. *Build:* DOM cards equip to part slots, heat buildup, overheat shutdown penalties.
2190. **Dice & Deck** `[2D]` — cards modify dice rolls. *Build:* DOM dice with CSS 3D roll animations, cards adjust faces, target sums.
2191. **Alchemist's Satchel** `[2D]` — potion-brewing card combos. *Build:* DOM cauldron slots, ingredient cards combine into potion effects table.
2192. **Ninja Scrolls** `[2D]` — stealth-or-strike card decisions. *Build:* DOM cards, detection meter, enemy awareness states, stealth bonus damage.
2193. **Weather Deck** `[2D]` — forecast cards shift battlefield. *Build:* DOM weather state modifying card values, forecast queue preview, enemy intents.
2194. **Ghost Draw** `[2D]` — haunted cards with delayed effects. *Build:* DOM cards that trigger after N turns, haunting timer badges, spooky CSS.
2195. **Coral Deck Reef** `[2D]` — build reef ecosystem cards. *Build:* DOM reef grid, card synergies by neighbor species, pollution event deck.
2196. **Trainyard Gambit** `[2D]` — rail-switching card puzzles. *Build:* Canvas rail network, cards flip switches, trains route to targets.
2197. **Viking Saga Deck** `[2D]` — raid villages, gain glory cards. *Build:* DOM map of villages, raid battles, glory currency to buy cards.
2198. **Circus Deck Act** `[2D]` — juggle cards for audience applause. *Build:* DOM cards in juggle slots, audience excitement meter, combo decay.
2199. **Deep Sea Deck** `[3D]` — pressure-based deckbuilding descent. *Build:* Three.js descending submarine view with fog, DOM card hand, pressure damage per depth.
2200. **Thief Guild Cards** `[2D]` — steal enemy cards mid-battle. *Build:* DOM dual decks, steal actions move card objects between arrays, intents.

## 89. Auto-battlers — *PixiJS / Canvas*
2201. **Bench Brawl** `[2D]` — buy units, auto fight. *Build:* PixiJS board grid, shop rerolls, units target nearest enemy, attack timers.
2202. **Critter Clash Arena** `[2D]` — animals battle automatically. *Build:* Canvas arena, animal traits synergy counts, auto combat tick, drag placement.
2203. **Synergy Siege** `[2D]` — trait combos defeat waves. *Build:* PixiJS grid, trait thresholds activate buffs, PvE waves, shop UI DOM.
2204. **Gladiator Draft** `[3D]` — draft fighters, watch duels. *Build:* Three.js arena with low-poly fighters, stat-driven auto combat animations, draft picks.
2205. **Robo Roster** `[2D]` — assemble robots, auto combat. *Build:* DOM part assembly, Canvas battle with module-based behaviors, auto tick.
2206. **Wizard Wars Auto** `[2D]` — mages cast automatically each round. *Build:* PixiJS particles for spells, mana regen timers, positional targeting rules.
2207. **Fruit Fighters** `[2D]` — fruit units with juicy synergies. *Build:* Canvas grid, fruit family traits, merge three to upgrade, auto combat.
2208. **Dragon Draft League** `[2D]` — breed dragons for auto fights. *Build:* DOM breeding traits, PixiJS auto battles, league standings table.
2209. **Microbe Melee** `[2D]` — cell colonies auto-battle. *Build:* Canvas cells with division and absorption rules, colony placement, simulation tick.
2210. **Kingdom Clash Auto** `[3D]` — position knights, watch battle. *Build:* Three.js battlefield grid, unit meshes, auto melee and ranged resolution, raycast placement.
2211. **Pirate Crew Auto** `[2D]` — crew lineups clash ships. *Build:* PixiJS two ship decks, crew roles, cannon timers, boarding resolution.
2212. **Undead Shop** `[2D]` — buy skeletons, merge to liches. *Build:* Canvas bench, merge triples, auto combat, death revive mechanics.
2213. **Zodiac Arena** `[2D]` — constellation-based unit synergies. *Build:* PixiJS grid, constellation patterns from unit positions grant buffs.
2214. **Toy Box Battles** `[2D]` — wind-up toys fight automatically. *Build:* Canvas toy units with wind-up energy duration, auto combat, shop.
2215. **Shogun Lineup** `[2D]` — samurai formations auto-duel. *Build:* PixiJS lines of samurai, formation bonuses, auto duel resolution.
2216. **Space Fleet Auto** `[3D]` — ship fleets battle autonomously. *Build:* Three.js ships with steering behaviors, laser lines, fleet composition shop.
2217. **Bug Brigade Brawl** `[2D]` — insect squads with traits. *Build:* Canvas insects, swarm traits, auto combat, reroll shop with gold interest.
2218. **Elemental Draft** `[2D]` — combine element units. *Build:* PixiJS element counters wheel, fusion of adjacent units, auto battles.
2219. **Snack Attack Auto** `[2D]` — junk food warriors brawl. *Build:* Canvas grid, snack units with sugar rush buffs, auto combat, shop.
2220. **Mythos Bench** `[2D]` — gods and monsters auto battle. *Build:* PixiJS pantheon traits, divine ultimate abilities on mana fill, auto tick.
2221. **Cactus Cavalry** `[2D]` — desert units, thorny synergies. *Build:* Canvas grid, thorns reflect damage, desert terrain bonuses, auto combat.
2222. **Robot Rodeo Auto** `[3D]` — mech beasts battle automatically. *Build:* Three.js mech beast models, charge and stomp AI behaviors, arena rounds.
2223. **Puppet Theatre War** `[2D]` — marionettes fight on stage. *Build:* Canvas puppets with Verlet rope strings, auto combat on stage lanes.
2224. **Mage Tower Draft** `[2D]` — stack mages in towers. *Build:* DOM tower slots vertical, height affects range, auto spell exchanges.
2225. **Dino Draft Arena** `[3D]` — dinosaur lineups battle. *Build:* Three.js low-poly dinosaurs, herd traits, auto combat, draft shop UI.

## 90. Lite 4X & Grand Strategy — *Canvas 2D / Vanilla JS*
2226. **Pocket Empires** `[2D]` — 30-turn mini 4X matches. *Build:* Canvas hex map, city growth, tech tree JSON, simple AI rivals.
2227. **Starlane Dominion** `[3D]` — tiny galaxy 4X. *Build:* Three.js star nodes and starlane lines, fleet movement, planet colonization, raycast.
2228. **Dynasty Ledger** `[2D]` — manage royal family successions. *Build:* DOM family tree, trait inheritance, marriages, succession crisis events.
2229. **Archipelago Reign** `[2D]` — island-hopping conquest. *Build:* Canvas procedural islands, ship transport, island control, AI rivals.
2230. **Feudal Banners** `[2D]` — vassals, fiefs, and loyalty. *Build:* Canvas province map, vassal loyalty model, levy armies, events.
2231. **Stone Age Dawn** `[2D]` — tribes grow into civilizations. *Build:* Canvas hex map, tribe migration, tech discovery, population growth.
2232. **Crown & Council** `[2D]` — grand strategy with advisors. *Build:* DOM advisor cards, Canvas map, advisor bias affecting recommendations.
2233. **Nomad Khanate** `[2D]` — steppe empire expansion. *Build:* Canvas map, horse herds as resource, tribute from sedentary states.
2234. **Colonial Frontier** `[2D]` — explore and settle new lands. *Build:* Canvas fog of war map, scout units, settlement placement, AI rivals.
2235. **Sea Lords Lite** `[2D]` — naval empire 4X. *Build:* Canvas ocean hex grid, port cities, fleet battles, trade routes.
2236. **Byzantine Plots** `[2D]` — intrigue-heavy empire strategy. *Build:* DOM character relationship graph, plots with success odds, Canvas map.
2237. **Galactic Senate War** `[3D]` — diplomacy-first galaxy 4X. *Build:* Three.js galaxy map, senate voting DOM, faction influence, fleet movement.
2238. **Bronze Age Collapse** `[2D]` — survive collapsing trade empires. *Build:* Canvas trade network graph, cascading failures, sea peoples raids.
2239. **Hexplore Empire** `[2D]` — procedural hex 4X. *Build:* Canvas hex grid with Perlin noise terrain, exploration, city building, AI.
2240. **Druid Circle Realm** `[2D]` — nature magic 4X. *Build:* Canvas map with forest spreading automaton, druid circles, magic resources.
2241. **Merchant Princes** `[2D]` — trade-based city-state strategy. *Build:* Canvas Italian-style map, trade route profits, mercenary armies.
2242. **Ancient River Valleys** `[2D]` — river civilizations compete. *Build:* Canvas river flood cycles, farmland fertility, civilization growth AI.
2243. **Clan Wars Highland** `[2D]` — highland clan grand strategy. *Build:* Canvas glen map, clan feuds, cattle raids, alliance marriages.
2244. **Planet Partition** `[3D]` — cold war on one continent. *Build:* Three.js globe sphere with regions, influence spreading, raycast region selection.
2245. **Tribe to Throne** `[2D]` — evolve tribe to kingdom. *Build:* Canvas map, government stage unlocks, population and stability meters.
2246. **Lich Empire Rising** `[2D]` — undead 4X conquest. *Build:* Canvas hex map, corpse resource from battles, blight spread automaton.
2247. **Iron Curtain Lite** `[2D]` — Cold War influence map. *Build:* Canvas world map regions, influence tokens, crisis cards deck, AI.
2248. **Spice Planet Rule** `[2D]` — desert planet house politics. *Build:* Canvas desert hex map, spice harvesting, house alliances, sandworm events.
2249. **Cosmic Colonizers** `[3D]` — seed planets, expand outward. *Build:* Three.js solar system spheres, colony ships, expansion tick, raycast selection.
2250. **Shogunate Ascend** `[2D]` — unify warring provinces. *Build:* Canvas province map, daimyo AI, armies, honor and loyalty values.

## 91. Tower Defense Variants — *Phaser 3*
2251. **Reverse Rampart** `[2D]` — play attackers vs AI towers. *Build:* Phaser path map, spawn units from budget, AI tower placement heuristics.
2252. **Maze Maker TD** `[2D]` — build mazes with towers. *Build:* Phaser grid, towers block tiles, A* recalculated path, validity check prevents sealing.
2253. **Garden Gnome Guard** `[2D]` — gnomes defend vegetable patch. *Build:* Phaser lanes, gnome towers, pest enemies, click to place.
2254. **Spinning Citadel** `[3D]` — rotating ring tower defense. *Build:* Three.js rotating ring with tower slots, enemies approach radially, keyboard rotation.
2255. **Sky Lanes Defense** `[2D]` — air paths in 3 layers. *Build:* Phaser layered paths, towers target specific altitudes, wave spawner.
2256. **Orbital Picket** `[3D]` — defend planet from orbit. *Build:* Three.js planet sphere, orbital tower satellites, incoming asteroid trajectories, raycast placement.
2257. **Tetris Towers TD** `[2D]` — place tower shapes like tetrominoes. *Build:* Phaser grid, tetromino towers rotate and place, path recalculation.
2258. **Candy Castle Guard** `[2D]` — sweets repel ant hordes. *Build:* Phaser path, candy towers with sticky slow effects, wave timers.
2259. **Mirror Beam TD** `[2D]` — redirect lasers between towers. *Build:* Canvas laser ray reflection math, rotatable mirrors, enemies along beams.
2260. **Hero Plus Towers** `[2D]` — hero unit supports towers. *Build:* Phaser hero controlled with WASD, tower placement, hero skills.
2261. **Cell Immunity TD** `[2D]` — white blood cells defend body. *Build:* Phaser bloodstream paths, immune cell towers, virus waves.
2262. **Firewall Defender** `[2D]` — defend network from packets. *Build:* Canvas node graph network, packets travel edges, firewall towers on nodes.
2263. **Pinball Defense** `[2D]` — bounce balls into enemies. *Build:* Matter.js pinball physics, enemy targets descend, flipper keys.
2264. **Merge Tower Rush** `[2D]` — merge identical towers to upgrade. *Build:* Phaser grid, drag-merge towers, random spawn, wave timer.
2265. **Bubble Barrier TD** `[2D]` — trap enemies in bubbles. *Build:* Phaser bubble projectiles, trapped enemies float, pop for damage.
2266. **Haunted Graveyard TD** `[2D]` — ghosts defend crypts. *Build:* Phaser grave tile map, ghost towers phase through walls, waves.
2267. **Train Track Defense** `[2D]` — towers on moving trains. *Build:* Phaser train path loops, towers mounted on cars, enemies track.
2268. **Word Tower TD** `[2D]` — type words to fire towers. *Build:* Phaser towers labeled with words, keyboard typing to fire, waves.
2269. **Card Tower TD** `[2D]` — draw cards for towers. *Build:* Phaser path map, DOM card hand, card placement onto grid.
2270. **Lighthouse Sentinels** `[3D]` — light beams repel sea monsters. *Build:* Three.js sea with lighthouses, rotating spotlight cones, monsters approach shore.
2271. **Gravity Well TD** `[2D]` — bend enemy paths with gravity. *Build:* Canvas enemies with velocity, gravity well towers attract them, collision damage.
2272. **Elemental Weave TD** `[2D]` — combine element towers. *Build:* Phaser grid, adjacency combos create elemental hybrids, wave enemies with resistances.
2273. **Roguelite Ramparts** `[2D]` — random tower draft runs. *Build:* Phaser maps generated per run, tower drafting, persistent unlocks localStorage.
2274. **Beehive Defense** `[2D]` — bees guard hive from hornets. *Build:* Phaser honeycomb hex grid, bee towers, hornet waves.
2275. **Snowfort Siege** `[3D]` — snowball turrets vs invaders. *Build:* Three.js snowy field, snowball turrets with projectile arcs, enemy pathing.

## 92. Politics & Government Sims — *DOM / Vanilla JS*
2276. **Mayor for a Day** `[2D]` — balance city budget decisions. *Build:* DOM budget sliders, citizen satisfaction model, daily events, charts.
2277. **Campaign Trail** `[2D]` — run for office, win swing states. *Build:* Canvas map, travel actions per day, polling model, ads budget.
2278. **Parliament Puzzle** `[2D]` — form coalitions to pass bills. *Build:* DOM party seats, coalition negotiation, policy compatibility matrix.
2279. **Dictator's Dilemma** `[2D]` — keep power without revolt. *Build:* DOM faction loyalty meters, event cards, revolt threshold checks.
2280. **Budget Balancer** `[2D]` — allocate national budget categories. *Build:* DOM sliders, deficit calculations, economic growth model, Canvas chart.
2281. **Press Secretary** `[2D]` — spin press questions under fire. *Build:* DOM timed dialogue choices, reporter memory, credibility meter.
2282. **Swing District** `[2D]` — micro-target voters in one district. *Build:* Canvas neighborhood map, voter agent preferences, canvassing actions.
2283. **Royal Decree** `[2D]` — monarch's daily decisions game. *Build:* DOM swipe card decisions, four estate meters, game over thresholds.
2284. **Lobbyist Ledger** `[2D]` — influence votes with favors. *Build:* DOM legislator profiles, favor currency, vote prediction model.
2285. **Polling Panic** `[2D]` — read polls, shift messaging. *Build:* Canvas poll charts with noise, message topics, voter shift model.
2286. **Constitution Crafter** `[2D]` — write rules, watch society react. *Build:* DOM rule toggles, agent-based society sim, Canvas stats.
2287. **Senate Filibuster** `[2D]` — stall votes with endurance speeches. *Build:* DOM typing endurance speech, stamina meter, timer, keyboard.
2288. **Town Hall Showdown** `[2D]` — answer angry citizens. *Build:* DOM dialogue with mood meter, timed responses, crowd reaction CSS animations.
2289. **Diplomat's Table** `[2D]` — negotiate treaties across nations. *Build:* DOM treaty clause cards, AI preference weights, offer counteroffer loop.
2290. **Election Night Desk** `[2D]` — call races from live data. *Build:* Canvas map with live-updating counts, statistical projection, call buttons.
2291. **Revolution Roadmap** `[2D]` — organize grassroots movement. *Build:* Canvas network graph of activists, spread mechanics, crackdown events.
2292. **Tax Code Tinker** `[2D]` — adjust taxes, watch economy. *Build:* DOM tax sliders, Laffer-like revenue model, Canvas charts over years.
2293. **Ministry of Paperwork** `[2D]` — bureaucratic stamp-approving sim. *Build:* DOM documents with rules checklist, drag stamp, daily rule changes.
2294. **Spin Doctor** `[2D]` — manage scandals and headlines. *Build:* DOM news feed, scandal severity, spin choices, approval rating chart.
2295. **City Council Clash** `[2D]` — negotiate zoning with councilors. *Build:* Canvas zoning map, councilor preferences, vote negotiation DOM.
2296. **UN Crisis Room** `[3D]` — resolve global crises by vote. *Build:* Three.js rotating globe with crisis markers, DOM resolution voting, delegate AI.
2297. **Pirate Democracy** `[2D]` — run a ship by crew vote. *Build:* DOM crew members with opinions, vote proposals, mutiny threshold.
2298. **Coup Countdown** `[2D]` — hold capital through 48 hours. *Build:* Canvas city map, faction units, hourly turns, loyalty shifts.
2299. **Referendum Run** `[2D]` — campaign for yes or no. *Build:* DOM campaign actions, demographic support model, final vote reveal.
2300. **Banana Republic Lite** `[2D]` — satirical island presidency. *Build:* DOM event cards, faction meters, comedic text generator, choices.

## 93. Life Sims — *Vanilla JS / DOM*
2301. **Second Chance Life** `[2D]` — text life sim, choices matter. *Build:* DOM text events by age, stat variables, random life events table.
2302. **Little Apartment** `[3D]` — decorate flat, keep routines. *Build:* Three.js apartment room, furniture placement raycast, daily routine needs meters.
2303. **Retirement Village** `[2D]` — manage golden years social life. *Build:* Canvas village map, social relationship graph, daily activities.
2304. **Roommate Drama** `[2D]` — balance chores and friendships. *Build:* DOM chore schedule, roommate mood meters, relationship events.
2305. **College Years** `[2D]` — study, party, graduate. *Build:* DOM weekly schedule allocation, GPA and social stats, events.
2306. **Hermit Cabin** `[3D]` — solitary forest life sim. *Build:* Three.js low-poly forest cabin, wood chopping, seasons cycle, WASD controls.
2307. **Pixel Suburbia** `[2D]` — family life on a cul-de-sac. *Build:* Phaser top-down street, family members with needs, neighbor relationships.
2308. **Night Shift Nurse** `[2D]` — juggle shifts and sleep. *Build:* DOM calendar, sleep debt meter, patient triage minigame, choices.
2309. **Small Town Mailman** `[2D]` — route mail, learn neighbors. *Build:* Phaser town tilemap, delivery routes, neighbor friendship dialogue.
2310. **Houseboat Living** `[3D]` — life drifting along rivers. *Build:* Three.js river scene, boat travel, fishing and repairs, daily needs.
2311. **Teen Diary Sim** `[2D]` — high school social life. *Build:* DOM diary entries, friend groups graph, stats influence events.
2312. **Daily Grind Commuter** `[2D]` — job, commute, and hobbies. *Build:* DOM day scheduler, money and energy balance, career ladder.
2313. **Ghost Roommate** `[2D]` — share life with a ghost. *Build:* Canvas house view, ghost mood mechanics, coexistence routines.
2314. **Lighthouse Family** `[2D]` — generations living at lighthouse. *Build:* DOM family tree across generations, lighthouse upkeep, storm events.
2315. **Witch Cottage Days** `[2D]` — cozy witch daily routine. *Build:* Phaser cottage tilemap, potion brewing chores, villager requests, day cycle.
2316. **Van Life Journey** `[2D]` — road trip life sim. *Build:* Canvas map route, van maintenance, budget, campsite events.
2317. **Space Station Living** `[3D]` — astronaut daily life. *Build:* Three.js station modules, zero-g movement, daily experiments schedule.
2318. **Generations Tree** `[2D]` — guide a family over 100 years. *Build:* DOM family tree visualization, yearly turns, trait inheritance.
2319. **Island Hermit Days** `[2D]` — castaway daily routine. *Build:* Phaser island tilemap, hunger and shelter needs, crafting, day cycle.
2320. **Cat Lady Simulator** `[2D]` — adopt and care for cats. *Build:* Canvas house, cat agents with moods, feeding schedule, adoption events.
2321. **Bachelor Pad Sim** `[2D]` — first apartment budgeting. *Build:* DOM bills calendar, groceries, rent, budget charts, events.
2322. **Robot Housemate** `[2D]` — teach a robot human habits. *Build:* Canvas house, robot learning via reward feedback, habit stats.
2323. **Monastery Life** `[2D]` — quiet monk routine sim. *Build:* DOM bell schedule, meditation focus minigame, garden tending.
2324. **Influencer Life** `[2D]` — grow followers, keep sanity. *Build:* DOM post creation, follower growth model, burnout meter, trends.
2325. **Old Farmhouse Years** `[3D]` — inherit and restore farmhouse. *Build:* Three.js farmhouse with repairable parts, seasons, life events timeline.

## 94. Transport & Logistics — *Canvas 2D*
2326. **Rail Baron Lite** `[2D]` — lay track between cities. *Build:* Canvas map, track drawing along grid, train scheduling, cargo demand.
2327. **Cargo Port Crane** `[3D]` — stack containers efficiently. *Build:* Three.js crane and container boxes, stack ordering puzzle, keyboard crane controls.
2328. **Metro Line Drawer** `[2D]` — draw subway lines, reduce crowding. *Build:* Canvas station nodes, drag to draw lines, passenger agents pathing.
2329. **Bus Route Planner** `[2D]` — plan stops, satisfy riders. *Build:* Canvas city grid, rider origin-destination pairs, route coverage scoring.
2330. **Air Cargo Hub** `[3D]` — schedule freight flights. *Build:* Three.js globe with flight arcs, schedule DOM, cargo demand per city.
2331. **Postal Sorter** `[2D]` — sort parcels on conveyor belts. *Build:* Canvas conveyor belts, switch gates with clicks, parcels by destination color.
2332. **Tugboat Harbor** `[2D]` — guide ships into docks. *Build:* Canvas harbor, ship physics with momentum, tug pushing with mouse drag.
2333. **Pipeline Planner** `[2D]` — route oil across terrain. *Build:* Canvas terrain map, pipe placement with costs, flow capacity graph.
2334. **Last Mile Courier** `[2D]` — optimize delivery van routes. *Build:* Canvas city map, TSP-style routing, time windows, drag stops order.
2335. **Freight Yard Shunter** `[2D]` — shunt cars to right trains. *Build:* Canvas track switches, train car arrays, sorting puzzle, clicks.
2336. **Drone Delivery Grid** `[3D]` — route drones around no-fly zones. *Build:* Three.js city blocks, drone waypoint paths, no-fly zone volumes, raycast.
2337. **Cable Car Tycoon** `[3D]` — mountain gondola networks. *Build:* Three.js mountain heightmap, cable line placement, passenger flows.
2338. **Ferry Network** `[2D]` — island ferry scheduling. *Build:* Canvas islands map, ferry timetables, passenger demand, weather events.
2339. **Warehouse Picker** `[2D]` — optimize picking paths. *Build:* Canvas warehouse grid, order lists, shortest path picking, timer score.
2340. **Truck Stop Logistics** `[2D]` — dispatch long-haul trucks. *Build:* DOM dispatch board, driver hours rules, Canvas map routes.
2341. **Canal Lock Keeper** `[2D]` — operate locks for barges. *Build:* Canvas side-view locks, water level filling sim, gate controls.
2342. **Snowplow Routes** `[2D]` — clear roads before rush hour. *Build:* Canvas road graph, snow accumulation, plow route planning, timer.
2343. **Conveyor Kingdom** `[2D]` — design factory conveyor layouts. *Build:* Canvas grid belts and splitters, item flow simulation, throughput.
2344. **Blimp Line Co** `[3D]` — airship passenger routes. *Build:* Three.js map with blimp models, wind affecting routes, passenger demand.
2345. **Space Freight Lanes** `[3D]` — interplanetary cargo routes. *Build:* Three.js solar system orbits, transfer windows, cargo contracts DOM.
2346. **Garbage Route Tycoon** `[2D]` — waste collection efficiency. *Build:* Canvas city map, bins fill rates, truck routes, cost scoring.
2347. **Monorail Dreams** `[3D]` — elevated monorail city network. *Build:* Three.js city, spline-based monorail tracks, station placement, ridership.
2348. **Ambulance Dispatch** `[2D]` — route emergency vehicles. *Build:* Canvas city graph, emergency calls spawn, Dijkstra routing, response timer.
2349. **Tram Town** `[2D]` — streetcar network management. *Build:* Canvas street grid, tram line drawing, traffic interactions, passenger agents.
2350. **Supply Chain Saga** `[2D]` — raw goods to retail shelves. *Build:* Canvas node network of factories and stores, flow simulation, bottlenecks.

## 95. Sports Management — *DOM / Vanilla JS*
2351. **Gaffer's Ledger** `[2D]` — football club tactics and transfers. *Build:* DOM squad tables, match engine probabilistic sim, transfer market.
2352. **Hoops Front Office** `[2D]` — basketball GM drafting. *Build:* DOM draft board, player ratings, salary cap math, season sim.
2353. **Diamond Dugout** `[2D]` — baseball lineup management. *Build:* DOM lineup cards, pitch-by-pitch probability sim, bullpen management.
2354. **Racing Team Principal** `[3D]` — manage pit strategy and budgets. *Build:* Three.js track with car markers, tire wear model, pit stop decisions.
2355. **Cricket Captaincy** `[2D]` — field placements and bowling changes. *Build:* Canvas field drag fielders, ball outcome probabilities by placement.
2356. **Ice Rink GM** `[2D]` — hockey roster management. *Build:* DOM roster lines, line chemistry, game simulation, trades.
2357. **Tennis Agent** `[2D]` — manage tennis players' careers. *Build:* DOM player calendar, ranking points, match sim, sponsorships.
2358. **Cycling Directeur** `[3D]` — Tour-style team tactics. *Build:* Three.js stage elevation profile, rider energy model, breakaway orders.
2359. **Esports Org Boss** `[2D]` — manage gaming team rosters. *Build:* DOM roster, scrim schedules, morale, tournament brackets.
2360. **Boxing Promoter** `[2D]` — book fights, build champions. *Build:* DOM fighter rankings, purse negotiation, fight sim with stats.
2361. **Marathon Coach** `[2D]` — train runners for races. *Build:* DOM training plans, fatigue and fitness model, race sim chart.
2362. **Rugby Scrum Boss** `[2D]` — rugby club management. *Build:* DOM squad, match engine, injury model, tactics sliders.
2363. **Horse Stable Manager** `[3D]` — breed and race horses. *Build:* Three.js race track with horse models, breeding genetics, race sim.
2364. **Sumo Stable** `[2D]` — manage sumo wrestler stable. *Build:* DOM wrestler ranks, training regimen, tournament sim, banzuke.
2365. **Golf Caddie Coach** `[2D]` — pick clubs, read greens. *Build:* Canvas top-down hole, wind and lie, club choice outcomes.
2366. **Volleyball Club Sim** `[2D]` — rotation and lineup tactics. *Build:* Canvas court rotation visual, rally probability sim, substitutions.
2367. **Fantasy League Lab** `[2D]` — weekly fantasy draft manager. *Build:* DOM draft room, simulated player stats, weekly scoring.
2368. **Swim Squad Coach** `[2D]` — relay order optimization. *Build:* DOM swimmer splits, relay order drag, race sim with variance.
2369. **Wrestling Booker** `[2D]` — book storylines and matches. *Build:* DOM storyline cards, crowd heat meter, match rating sim.
2370. **Sailing Regatta Crew** `[3D]` — manage yacht racing crew. *Build:* Three.js sea with yacht, wind shifts, crew role assignments.
2371. **Youth Academy** `[2D]` — develop young football prospects. *Build:* DOM prospect potential, training focus, growth curves, promotions.
2372. **Ski Team Director** `[3D]` — alpine team selection. *Build:* Three.js slope with gates, skier sim with wax and line choices.
2373. **Stadium Owner** `[3D]` — build and run a stadium. *Build:* Three.js stadium building placement, attendance model, concessions revenue.
2374. **Chess Club Manager** `[2D]` — manage chess team pairings. *Build:* DOM team boards, Elo-based outcome probabilities, league table.
2375. **Darts League Boss** `[2D]` — darts circuit management. *Build:* DOM player averages, match sim with checkout probabilities, rankings.

## 96. Crafting & Alchemy — *Vanilla JS / Canvas*
2376. **Little Alchemy Lab** `[2D]` — combine elements, discover more. *Build:* DOM element tiles drag together, recipe lookup table, discovery log.
2377. **Blacksmith's Forge** `[3D]` — hammer metal at right heat. *Build:* Three.js anvil and glowing ingot shader, heat timing, mouse hammer strikes.
2378. **Potion Shop Puzzle** `[2D]` — brew potions from customer hints. *Build:* DOM ingredients with hidden properties, deduction from hint text.
2379. **Runesmith** `[2D]` — carve runes into weapon combos. *Build:* Canvas rune drawing with gesture recognition, combo effects table.
2380. **Glassblower Studio** `[3D]` — shape molten glass artworks. *Build:* Three.js lathe geometry deformed by mouse, rotation timing, cooling.
2381. **Elixir Grid** `[2D]` — place ingredients on alchemy grid. *Build:* Canvas grid, adjacency reactions, potency scoring, drag placement.
2382. **Loom & Dye** `[2D]` — weave patterned textiles. *Build:* Canvas warp and weft grid, pattern matching targets, dye color mixing.
2383. **Enchanter's Bench** `[2D]` — enchant gear with risky runes. *Build:* DOM item slots, failure chance math, enchantment stacking rules.
2384. **Transmutation Circle** `[2D]` — draw circles to transmute. *Build:* Canvas freehand drawing, shape recognition of circles and symbols.
2385. **Candle Maker** `[2D]` — mix wax, scent, color. *Build:* Canvas pour layers, color blending, scent combo scoring.
2386. **Perfumer's Palette** `[2D]` — blend scent notes to brief. *Build:* DOM note sliders, top-heart-base vector matching to client brief.
2387. **Jewelry Bench** `[3D]` — set gems in rings. *Build:* Three.js ring models, gem facets with refraction material, prong placement.
2388. **Pottery Wheel** `[3D]` — throw pots, glaze, kiln fire. *Build:* Three.js LatheGeometry shaped by mouse, glaze painting, kiln randomness.
2389. **Witch Cauldron** `[2D]` — bubbling brew timing game. *Build:* Canvas cauldron particles, ingredient timing windows, color reaction.
2390. **Clockmaker** `[2D]` — assemble gears into working clocks. *Build:* Canvas gear meshing simulation, tooth ratios, drag gears.
2391. **Bookbinder** `[2D]` — bind and decorate books. *Build:* Canvas page folding steps, stitching pattern minigame, cover design.
2392. **Tinker Gadgets** `[2D]` — craft gadgets from scrap. *Build:* DOM part slots, gadget recipes with tolerance checks, test runs.
2393. **Element Fusion Chart** `[2D]` — fuse elements on periodic chart. *Build:* DOM periodic table grid, fusion proton sum rules, unlocks.
2394. **Mead Brewer** `[2D]` — ferment honey wines. *Build:* DOM fermentation timer real days, sugar and yeast model, tasting.
2395. **Leatherworks** `[2D]` — craft armor from hides. *Build:* Canvas pattern cutting on hide shapes, minimizing waste scoring.
2396. **Arcane Recipes** `[2D]` — discover recipes by experimentation. *Build:* DOM ingredients, hidden property vectors, experiment log.
2397. **Philosopher's Path** `[2D]` — chase the philosopher's stone. *Build:* DOM progression tree of alchemical stages, resource crafting.
2398. **Woodcarver's Workshop** `[3D]` — carve figures from blocks. *Build:* Three.js voxel block, mouse carving removes voxels, target silhouette score.
2399. **Soap Craft** `[2D]` — design and sell soaps. *Build:* Canvas soap mold swirls, oil ratio calculator, market demand.
2400. **Crystal Grower** `[3D]` — grow crystals by solution chemistry. *Build:* Three.js crystal growth via procedural facets, concentration and temperature sliders.

## 97. Dungeon Management — *Phaser 3 / rot.js*
2401. **Dungeon Landlord** `[2D]` — rent rooms to monsters. *Build:* Phaser grid rooms, monster tenant preferences, rent collection, hero raids.
2402. **Lair Architect** `[3D]` — design traps against heroes. *Build:* Three.js dungeon blocks, trap placement, hero AI pathing through traps.
2403. **Boss Room Builder** `[2D]` — build the perfect boss room. *Build:* Phaser single room editor, boss abilities, hero party simulations.
2404. **Goblin Union** `[2D]` — manage goblin worker demands. *Build:* DOM worker demands, strike chances, Canvas dungeon digging.
2405. **Dragon's Hoard Keeper** `[2D]` — protect gold from thieves. *Build:* rot.js map, thief AI with stealth, dragon patrol routes.
2406. **Trap Designer** `[2D]` — chain traps for maximum effect. *Build:* Canvas trap grid, trigger chain reactions, combo scoring.
2407. **Minion Payroll** `[2D]` — balance minion wages and morale. *Build:* DOM payroll ledger, morale model, desertion events.
2408. **Evil Lord Inc** `[2D]` — corporate villain dungeon management. *Build:* DOM department budgets, Phaser dungeon view, KPI reports.
2409. **Crypt Keeper Sim** `[2D]` — undead staff management. *Build:* rot.js crypt map, undead workers with decay timers, raises.
2410. **Monster Hotel** `[2D]` — host monsters between raids. *Build:* Phaser rooms, guest needs, check-in schedule, raid interruptions.
2411. **Labyrinth Lord** `[2D]` — reshape maze each night. *Build:* rot.js maze generation, player edits walls, heroes navigate.
2412. **Hero Repellent** `[2D]` — deter adventurers with defenses. *Build:* Phaser entrance layout, hero morale model, scare tactics.
2413. **Slime Farm Dungeon** `[2D]` — breed slimes as defenders. *Build:* Phaser slime pens, breeding traits, defense waves.
2414. **Mimic Shop** `[2D]` — disguise mimics as treasure. *Build:* Canvas shop layout, hero greed AI, mimic placement scoring.
2415. **Overlord's Ledger** `[2D]` — dungeon budget and raids. *Build:* DOM ledger, raid events probability, investment choices.
2416. **Imp Workshop** `[2D]` — imps craft traps and gear. *Build:* Phaser workshop stations, imp job queue, crafting timers.
2417. **Tavern Under Dungeon** `[2D]` — feed adventurers before ambush. *Build:* Phaser tavern, adventurer satisfaction, ambush timing trade-off.
2418. **Dungeon Tour Guide** `[2D]` — run tours in a dungeon. *Build:* Phaser tour routes, tourist excitement, monster scheduling.
2419. **Lich Lair Planner** `[3D]` — phylactery protection management. *Build:* Three.js lair layout, hiding spot visibility raycasts, hero search AI.
2420. **Kobold Kingdom** `[2D]` — kobold tunnels expansion. *Build:* rot.js digging grid, kobold job AI, resource veins.
2421. **Haunted Halls Manager** `[2D]` — ghosts scare intruders. *Build:* Phaser halls, fear meters, ghost patrol routes, intruder AI.
2422. **Vampire Castle Keeper** `[3D]` — manage castle and thralls. *Build:* Three.js castle rooms, thrall tasks, sunlight exposure checks.
2423. **Spider Den** `[2D]` — web-based dungeon defense. *Build:* Canvas web strands as Verlet ropes, prey entanglement, spider movement.
2424. **Treasure Bait** `[2D]` — lure heroes with loot. *Build:* rot.js map, hero greed pathfinding toward loot, trap placement.
2425. **Orc Barracks Boss** `[2D]` — train orc defenders. *Build:* Phaser barracks, training stats, defense battles auto-resolved.

## 98. Space Exploration Sims — *Three.js / Canvas*
2426. **Deep Probe** `[3D]` — launch probes into unknown systems. *Build:* Three.js procedural star systems, probe trajectories, scan reveals.
2427. **Starship Captain Log** `[2D]` — command ship through events. *Build:* DOM event log, crew and fuel stats, branching choices.
2428. **Orbit Mechanic** `[3D]` — orbital maneuvers with real physics. *Build:* Three.js orbits with Newtonian integration, burn controls, keyboard.
2429. **Exoplanet Surveyor** `[3D]` — scan planets for habitability. *Build:* Three.js planet spheres with shader surfaces, spectrum minigame, data log.
2430. **Wormhole Cartographer** `[3D]` — map unstable wormhole networks. *Build:* Three.js node graph, changing edges, route planning.
2431. **Asteroid Prospector** `[3D]` — survey and claim asteroids. *Build:* Three.js asteroid field with noise geometry, scan and claim UI.
2432. **Generation Ship** `[3D]` — manage centuries-long voyage. *Build:* Three.js rotating ship cutaway, population and resource sim per generation, DOM events.
2433. **Comet Chaser** `[3D]` — intercept comets for samples. *Build:* Three.js comet tail particles, intercept trajectory planning.
2434. **Nebula Drifter** `[3D]` — explore colorful nebulae. *Build:* Three.js volumetric shader nebulae, free-flight controls, discovery points.
2435. **Lunar Rover Ops** `[3D]` — drive rover with signal delay. *Build:* Three.js lunar terrain, delayed command queue, rover physics.
2436. **Mars Sample Return** `[3D]` — plan multi-stage mission. *Build:* Three.js Earth-Mars orbit scene, delta-v budget math, stage failure probabilities.
2437. **Space Telescope Sim** `[2D]` — schedule observations, find discoveries. *Build:* Canvas sky map, scheduling constraints, random discoveries.
2438. **Solar Sail Voyage** `[3D]` — tack sunlight to travel. *Build:* Three.js sail angle vs light pressure vector, orbit changes.
2439. **Alien Signal Decoder** `[2D]` — decode signals from space. *Build:* Canvas spectrogram, pattern puzzles, Web Audio tones.
2440. **Derelict Explorer** `[3D]` — board abandoned ships. *Build:* Three.js corridors, flashlight spotlight, oxygen timer, pointer lock.
2441. **Rocket Workshop** `[3D]` — design and launch rockets. *Build:* Three.js stacked stage parts, thrust-to-weight physics, launch sim.
2442. **Gas Giant Diver** `[3D]` — dive atmospheres for data. *Build:* Three.js layered fog atmosphere, pressure and heat meters.
2443. **Star Charter** `[2D]` — procedural galaxy mapping. *Build:* Canvas seeded star generation, pan and zoom, charting notes.
2444. **Voyager's Legacy** `[3D]` — long probe journey sim. *Build:* Three.js solar system, gravity assists, time acceleration.
2445. **Black Hole Edge** `[3D]` — navigate near event horizons. *Build:* Three.js lensing shader, time dilation effects, thrust controls.
2446. **Orbital Debris Sweep** `[3D]` — clean up space junk. *Build:* Three.js orbit paths, burn timing to rendezvous, net capture, fuel budget.
2447. **Cosmic Botanist** `[2D]` — catalog alien plant life. *Build:* Canvas L-system procedural plants, taxonomy journal, planet hopping.
2448. **Ice Moon Drill** `[3D]` — drill to subsurface oceans. *Build:* Three.js cross-section layers, drill heat and torque management.
2449. **Starlight Hauler** `[3D]` — exploration-trading space sim. *Build:* Three.js flight with WASD, stations to trade, jump drives.
2450. **Mission Control Desk** `[2D]` — run launch-day checklists. *Build:* DOM consoles with blinking alerts, checklist sequencing, telemetry charts.

## 99. Hex Wargames — *Canvas 2D / Vanilla JS*
2451. **Panzer Hex Front** `[2D]` — WWII armored hex warfare. *Build:* Canvas axial hex grid, zone of control, combat results table.
2452. **Hexfield Napoleon** `[2D]` — Napoleonic hex battles. *Build:* Canvas hex map, formations line and square, morale checks.
2453. **Desert Rats Hex** `[2D]` — North Africa campaign. *Build:* Canvas desert hexes, fuel supply lines, armored units.
2454. **Hex Legions** `[3D]` — Roman legion hex tactics. *Build:* Three.js hex field with cohort meshes, facing and flanking bonuses, OrbitControls camera.
2455. **Kursk Salient** `[3D]` — massive tank battle hexes. *Build:* Three.js hex terrain with tank models, minefields, defensive lines, raycast unit orders.
2456. **Hex Naval Clash** `[3D]` — fleets on hex oceans. *Build:* Three.js hex ocean tiles, ship models, gunnery ranges.
2457. **Medieval Hexfront** `[2D]` — knights and archers hexes. *Build:* Canvas hexes, ranged fire arcs, charge momentum.
2458. **Fantasy Hex Warlords** `[2D]` — orcs vs elves hex war. *Build:* Canvas hex map, faction abilities, magic spells.
2459. **Civil War Hexes** `[2D]` — American Civil War battles. *Build:* Canvas hex map, artillery, morale routing.
2460. **Sci-Fi Hexstrike** `[3D]` — future warfare hex grid. *Build:* Three.js hex tiles with elevation, hover tanks, lasers.
2461. **Pacific Island Hop** `[2D]` — island campaign hexes. *Build:* Canvas hex ocean and islands, amphibious landings, carriers.
2462. **Supply Lines Hex** `[2D]` — war of logistics and supply. *Build:* Canvas hex grid, supply trace BFS from depots.
2463. **Air Superiority Hex** `[2D]` — aerial combat over hex maps. *Build:* Canvas hexes with altitude levels, fighter energy.
2464. **Hex Blitzkrieg** `[2D]` — fast breakthrough tactics. *Build:* Canvas hex map, exploitation movement phase, encirclement checks.
2465. **Partisan Hex** `[2D]` — guerrilla warfare hex game. *Build:* Canvas hidden units, detection rolls, ambush mechanics.
2466. **Hex Siege of Vienna** `[2D]` — historical siege battle. *Build:* Canvas city walls hexes, siege works, relief army timer.
2467. **Alpine Hex War** `[3D]` — mountain warfare hexes. *Build:* Three.js elevated hex terrain, altitude movement costs, avalanches.
2468. **Hex Crusade** `[2D]` — medieval crusade campaigns. *Build:* Canvas campaign hex map, castles, attrition model.
2469. **Hex Mecha Front** `[3D]` — giant robot hex warfare. *Build:* Three.js hex grid with mech models, part damage, raycast selection.
2470. **Zulu Dawn Hex** `[2D]` — colonial-era battles. *Build:* Canvas hex map, ammunition supply, morale and terrain.
2471. **Hex Arctic Front** `[2D]` — winter warfare campaign. *Build:* Canvas snowy hexes, frostbite attrition, ski troops movement.
2472. **Samurai Hex Clash** `[2D]` — Sengoku period battles. *Build:* Canvas hexes, clan loyalty defection rolls, cavalry charges.
2473. **Hex Ardennes** `[2D]` — winter offensive scenario. *Build:* Canvas forest hexes, weather turns, fuel shortages.
2474. **Hex Cavalry Charge** `[2D]` — horse units dominate hexes. *Build:* Canvas hexes, momentum-based charge damage, wheeling.
2475. **Hex Pocket War** `[2D]` — small 15-minute hex skirmish. *Build:* Canvas 7x7 hex map, few units, quick AI.

## 100. Card Battlers — *DOM / PixiJS*
2476. **Arcane Duel** `[2D]` — two-player spell card duels. *Build:* DOM hands, mana curve, hotseat or AI, stack resolution.
2477. **Mythic Clash** `[2D]` — gods battle via cards. *Build:* PixiJS card animations, divine favor resource, AI opponent.
2478. **Beast Bond Cards** `[2D]` — summon beasts, combine attacks. *Build:* DOM board slots, bond combos between adjacent beasts.
2479. **Lane Cards Battle** `[2D]` — three-lane card combat. *Build:* DOM three lanes, lane power totals, simultaneous reveals.
2480. **Ninja Card Duel** `[2D]` — fast-paced ninja card fights. *Build:* DOM real-time card plays with cooldown timers.
2481. **Dragon Deck Duel** `[3D]` — dragon-summoning card battles. *Build:* Three.js board with summoned dragon models, DOM card hand, AI.
2482. **Tarot Battle** `[2D]` — tarot-based card combat. *Build:* DOM tarot spreads determine buffs, upright or reversed effects.
2483. **Elemental Duels** `[2D]` — elemental counter-card battling. *Build:* DOM element triangle counters, simultaneous selection, reveal.
2484. **Robot Card Arena** `[3D]` — mech-part card combat. *Build:* Three.js arena robots assembled from played cards, combat resolution.
2485. **Pirate Card Clash** `[2D]` — sea-themed card battles. *Build:* PixiJS ship board, crew cards, cannon volleys.
2486. **Kaiju Card Battle** `[3D]` — giant monsters clash. *Build:* Three.js city diorama, kaiju models, card-driven attacks.
2487. **Mini Card Brawl** `[2D]` — 5-card quick duels. *Build:* DOM five-card hands, quick rounds, AI heuristics.
2488. **Shadow Card Duel** `[2D]` — hidden-card bluff battles. *Build:* DOM face-down plays, bluff call mechanics, AI bluffing probability.
2489. **Card Kingdoms** `[2D]` — card territory wars. *Build:* Canvas territory map, card plays claim regions, AI.
2490. **Witch Card Duel** `[2D]` — hexes and curses cards. *Build:* DOM status effects stack, curse duration counters.
2491. **Space Card Clash** `[2D]` — fleet card battles. *Build:* PixiJS fleet lanes, ship cards, shield and hull.
2492. **Samurai Card Duel** `[2D]` — honor-based card fights. *Build:* DOM honor meter influencing card power, duels.
2493. **Fairy Card Battle** `[2D]` — fae magic card duels. *Build:* DOM glamour mana, illusions as fake cards.
2494. **Mecha Card Wars** `[2D]` — mechs card combat. *Build:* PixiJS mech frames, card upgrades, heat management.
2495. **Zombie Card Clash** `[2D]` — undead horde card battles. *Build:* DOM horde growth each turn, infection spreading.
2496. **Card Arena Royale** `[2D]` — tower-lane card battler. *Build:* Canvas two-lane arena, real-time unit deployment from elixir-like resource.
2497. **Sword & Card** `[2D]` — weapon-card duel system. *Build:* DOM weapon cards with durability, parry and riposte chains.
2498. **Card Hero Clash** `[2D]` — hero-led card combat. *Build:* DOM hero powers, minion board, AI turn logic.
2499. **Spirit Card Duel** `[2D]` — spirit realm card battles. *Build:* DOM realm switching mechanic, cards active only in realms.
2500. **Card Legends Arena** `[2D]` — legendary heroes card clash. *Build:* PixiJS animations, legendary card unlocks, ranked ladder localStorage.

## 101. Traditional Board Games of the World — *DOM / Canvas / Three.js*
2501. **Senet Passage** `[2D]` — ancient Egyptian race to the afterlife. *Build:* Canvas 2D 30-square snake path array, four throw-stick RNG, click pieces, simple AI.
2502. **Royal Ur Race** `[3D]` — Mesopotamian dice-and-path classic. *Build:* Three.js board meshes, tetrahedral dice physics via cannon-es, raycast piece selection, rosette rules.
2503. **Hnefatafl Siege** `[2D]` — Viking king escapes the corners. *Build:* DOM 11x11 CSS grid, custodial capture checks, rook-move validation, minimax AI depth 2.
2504. **Nine Men's Morris** `[2D]` — form mills, remove opponent pieces. *Build:* SVG board with 24 node graph, mill lookup table, drag-and-drop pieces, phase state machine.
2505. **Pachisi Palace** `[3D]` — Indian cross-shaped cowrie race. *Build:* Three.js cloth board, animated cowrie shell toss, path arrays per player, orbit camera.
2506. **Xiangqi River** `[2D]` — Chinese chess across the river. *Build:* Canvas 2D 9x10 intersections, per-piece move generators, flying-general check, alpha-beta AI.
2507. **Shogi Drops** `[2D]` — Japanese chess with captured drops. *Build:* DOM grid plus hand trays, drop legality rules, promotion prompts, Web Worker AI search.
2508. **Janggi Palace** `[2D]` — Korean chess with palace diagonals. *Build:* SVG board, palace diagonal adjacency map, cannon jump rules, click-to-move with highlights.
2509. **Oware Seeds** `[3D]` — West African sowing and capturing. *Build:* Three.js carved wooden board, instanced seed spheres, sowing animation queue, minimax AI.
2510. **Bao Masters** `[2D]` — Swahili four-row mancala variant. *Build:* Canvas 2D 4x8 pit array, relay sowing loop, capture rules, tap pits to sow.
2511. **Fanorona Strike** `[2D]` — Malagasy capture by approach. *Build:* SVG 9x5 lattice with diagonals, approach/withdrawal capture detection, chained moves, click input.
2512. **Alquerque Lines** `[2D]` — Moorish jumping on lattice. *Build:* Canvas 2D 5x5 node graph, mandatory jump search, draughts-style captures, hot-seat or AI.
2513. **Konane Leap** `[2D]` — Hawaiian jump-only stone battle. *Build:* DOM 8x8 grid, orthogonal multi-jump generator, no-move loss check, greedy AI opponent.
2514. **Patolli Bets** `[2D]` — Aztec beans and gambling track. *Build:* Canvas 2D cross track, five-bean coin flips, wager counters, turn-based pass-and-play.
2515. **Pallanguzhi Pits** `[2D]` — South Indian shell-counting game. *Build:* DOM 2x7 pits, continuous sowing until empty pit, capture logic, animated shell counts.
2516. **Hex Honeycomb** `[2D]` — connect your sides on rhombus. *Build:* Canvas 2D axial hex coords, union-find win detection, Monte Carlo AI, click hexes.
2517. **Puluc Raiders** `[2D]` — Mayan capture-and-stack race. *Build:* DOM linear track, stacked piece arrays, four-stick dice RNG, prisoner release rules.
2518. **Bul Ballgame** `[2D]` — Mayan corn-dice battle race. *Build:* Canvas 2D row of kernels track, marked-corn dice, collision captures, two-player hot-seat.
2519. **Surakarta Loops** `[2D]` — Javanese captures via circular tracks. *Build:* Canvas 2D 6x6 with arc paths, loop traversal capture search, animated arc travel.
2520. **Tablut Lapland** `[2D]` — Sami variant of tafl. *Build:* DOM 9x9 grid, armed-king rule toggle, sandwich capture, local storage saved matches.
2521. **Pente Pairs** `[2D]` — five-in-row with pair captures. *Build:* Canvas 2D 19x19 grid, line-scan win check, pair capture detection, threat-scoring AI.
2522. **Gomoku Grid** `[3D]` — classic five-stones on Go board. *Build:* Three.js wooden goban, glossy stone meshes, raycast placement, pattern-score AI.
2523. **Kalah Classic** `[2D]` — six-pit American mancala. *Build:* DOM pit buttons, store-landing extra turn, opposite capture, minimax with alpha-beta.
2524. **Chaturanga Origins** `[3D]` — ancient Indian chess ancestor. *Build:* Three.js carved ivory-style pieces, elephant and minister moves, raycast picking, simple AI.
2525. **Yut Nori Toss** `[3D]` — Korean stick-throw board race. *Build:* Three.js four-stick physics toss with cannon-es, shortcut path graph, piece stacking.

## 102. Party Mini-games — *Socket.IO / DOM*
2526. **Button Mash Mayhem** `[2D]` — fastest tapper wins round. *Build:* DOM big button per phone, Socket.IO tap counts, server-synced timer, host scoreboard screen.
2527. **Freeze Frame Pose** `[2D]` — hold still when music stops. *Build:* webcam frame differencing on Canvas, random audio stop times, motion threshold elimination.
2528. **Balloon Pump Panic** `[2D]` — inflate without popping first. *Build:* Canvas 2D balloon scale, hidden random pop threshold, Socket.IO turns, cash-out button.
2529. **Fake Artist Sketch** `[2D]` — spot the bluffing doodler. *Build:* shared Canvas strokes via Socket.IO, secret word assignment, one stroke per turn, voting.
2530. **Quick Draw Saloon** `[2D]` — wait for signal, then shoot. *Build:* Canvas cowboy sprites, random delay timer, server timestamp comparison, early-shot penalty.
2531. **Crown Keeper** `[2D]` — steal and hold the crown. *Build:* Phaser 3 arena, Socket.IO position sync, collision crown transfer, hold-time scoring.
2532. **Countdown Bluff** `[2D]` — guess who stops timer closest. *Build:* DOM hidden timer, server-side elapsed calculation, tap to stop, reveal ranking animation.
2533. **Lie Detector Lounge** `[2D]` — vote whose story is false. *Build:* DOM prompt cards, text submissions over Socket.IO, anonymous voting, bluff scoring.
2534. **Musical Chairs Online** `[3D]` — grab seats when beat drops. *Build:* Three.js circle of chairs, Tone.js loop with random stops, Socket.IO first-claim seats.
2535. **Shared Symbol Snap** `[2D]` — race to spot the shared symbol. *Build:* DOM cards from projective-plane symbol sets, tap match, room scoring.
2536. **Sketch Telephone** `[2D]` — draw, guess, redraw chain. *Build:* Canvas drawing pad, round-robin assignment of prompts, chain reveal slideshow at end.
2537. **Pass the Bomb Word** `[2D]` — say word containing syllable. *Build:* DOM input, dictionary Set lookup, hidden fuse timer, bomb passes on valid word.
2538. **Number Squeeze** `[2D]` — guess closest without going over. *Build:* DOM number inputs, trivia numeric answers JSON, server ranks guesses, points table.
2539. **Sabotage Kitchen** `[2D]` — secretly ruin team recipes. *Build:* Phaser 3 top-down kitchen, secret saboteur role, Socket.IO sync, accusation voting.
2540. **Emoji Pictionary** `[2D]` — describe movies only in emoji. *Build:* DOM emoji picker, restricted input, guesses via chat, fuzzy title matching.
2541. **Thumb Wrestle Tap** `[2D]` — rhythm tapping tug-of-war. *Build:* Canvas rope marker, tap rate per player over Socket.IO, beat bonus windows.
2542. **Dance Off Vote** `[2D]` — perform moves, crowd votes. *Build:* webcam preview via getUserMedia, PeerJS streams, timed rounds, emoji reaction voting.
2543. **Who Said It** `[2D]` — match quotes to friends. *Build:* DOM forms collect answers, server shuffles quotes, players drag names to quotes, scoring.
2544. **Silly Superlatives** `[2D]` — vote who is most likely. *Build:* DOM prompt deck JSON, avatar vote buttons, Socket.IO tallies, animated bar reveal.
2545. **Bid for Junk** `[2D]` — auction absurd fake items. *Build:* DOM generated item cards, countdown auction timer, Socket.IO bids, hidden item values.
2546. **Mime Relay** `[2D]` — act clues to teammates. *Build:* PeerJS video for actor, word deck timer, teammates type guesses, team rotation.
2547. **Spot the Bot** `[2D]` — find the AI player. *Build:* DOM chat rounds, scripted bot answers from templates, timed responses, final vote.
2548. **Last Word Standing** `[2D]` — category chain elimination. *Build:* DOM text input, category word lists, repetition Set check, shrinking timer per turn.
2549. **Tap Sumo Ring** `[3D]` — shove rivals off platform. *Build:* Three.js round platform, cannon-es bodies, phones as controllers over Socket.IO.
2550. **Hidden Agenda** `[2D]` — complete secret party missions. *Build:* DOM private mission cards per phone, self-report with witness confirm, end-game reveal.

## 103. Trivia & Quiz — *DOM / Vanilla JS*
2551. **Brainwave Buzzer** `[2D]` — first-buzz general knowledge battles. *Build:* DOM question JSON, Socket.IO buzz with server timestamps, lockout timer, scoreboard.
2552. **Decade Detective** `[2D]` — guess the year from clues. *Build:* DOM slider for year, progressive clue reveal, distance-based scoring, daily set.
2553. **Map Pin Drop** `[3D]` — click where events happened. *Build:* Three.js textured globe, raycast click to drop pin, haversine distance scoring.
2554. **Sound Bite Quiz** `[2D]` — identify sounds and noises. *Build:* Web Audio clip playback, multiple choice buttons, shorter clips for higher bonus.
2555. **Higher or Lower Stats** `[2D]` — compare populations and prices. *Build:* DOM two cards, stats dataset JSON, streak counter, slide-in animation.
2556. **Logo Silhouettes** `[2D]` — name brands from outlines. *Build:* Canvas black-filled SVG paths, original generic logos, typed answers with fuzzy match.
2557. **Movie Frame Guess** `[2D]` — zoomed still reveals slowly. *Build:* Canvas drawImage cropping that widens each wrong guess, public-domain film stills.
2558. **Pixelated Portraits** `[2D]` — unblur famous paintings. *Build:* Canvas downscale-upscale pixelation, decreasing block size per hint, autocomplete answers.
2559. **Element Riddler** `[2D]` — chemistry clue chains. *Build:* DOM periodic table JSON, clue generator from properties, click table to answer.
2560. **Who Came First** `[2D]` — order inventions by date. *Build:* DOM drag-to-reorder list via SortableJS, invention year data, partial scoring.
2561. **Myth or Fact** `[2D]` — true-false science claims. *Build:* DOM swipe cards with Pointer Events, explanation reveal, accuracy streaks.
2562. **Capital Chain** `[2D]` — link capitals by letters. *Build:* DOM input, capital list lookup, last-letter rule, used-word Set, timer.
2563. **Price Is Close** `[2D]` — guess historic item prices. *Build:* DOM slider input, inflation-adjusted dataset, percentage error scoring.
2564. **Animal Kingdom Quiz** `[2D]` — identify species from facts. *Build:* DOM progressive fact reveal, species JSON with images, fewer clues more points.
2565. **Lyrics Gap Fill** `[2D]` — complete public-domain song lines. *Build:* DOM text with blanks, folk song lyric dataset, Tone.js melody hint playback.
2566. **Constellation Quiz** `[3D]` — name star patterns. *Build:* Three.js star sphere from catalog coords, highlight constellation lines, multiple-choice answers.
2567. **Flag Fragments** `[2D]` — identify flags from slices. *Build:* Canvas clip regions of SVG flags, reveal more slices per miss, choices.
2568. **Language Ear** `[2D]` — guess spoken language samples. *Build:* Web Speech synthesis voices per language, multiple choice, region map feedback.
2569. **Trivia Ladder** `[2D]` — climb with risk-it-all answers. *Build:* DOM ladder levels, safe-point checkpoints, lifelines like fifty-fifty, question bank.
2570. **Space Facts Sprint** `[3D]` — rapid astronomy questions. *Build:* Three.js rotating planet backdrop, 60-second DOM quiz overlay, combo multiplier.
2571. **Food Origins Quiz** `[2D]` — match dishes to countries. *Build:* SVG world map clickable countries, dish cards, drag-and-drop matching.
2572. **Sports Records Quiz** `[2D]` — guess record-holding numbers. *Build:* DOM numeric guess input, closeness bands scoring, records dataset JSON.
2573. **Riddle Me Rapid** `[2D]` — classic riddles against clock. *Build:* DOM riddle list, normalized answer synonyms, countdown bar, hint penalty.
2574. **Wiki Hop Race** `[2D]` — navigate articles by links. *Build:* Wikipedia REST API fetch, render link list, click count and time scoring.
2575. **Daily Five Quiz** `[2D]` — five questions every day. *Build:* date-seeded question pick, localStorage streaks, emoji result share string.

## 104. Kids & Toddlers — *Canvas 2D / Kaboom.js*
2576. **Bubble Bath Pop** `[2D]` — tap floating bubbles gently. *Build:* Canvas 2D drifting circles, sine wobble, pointerdown hit test, pop sound synth.
2577. **Peekaboo Animals** `[2D]` — tap bushes to reveal critters. *Build:* DOM bush sprites, CSS transforms reveal animals, speech synthesis names.
2578. **Color Splash Farm** `[2D]` — paint barnyard animals. *Build:* Canvas flood fill on line art, big color palette buttons, touch input.
2579. **Shape Train** `[2D]` — load shapes onto wagons. *Build:* Kaboom.js drag shapes, outline-matching slots, train chugs off animation.
2580. **Count the Ducks** `[2D]` — tap and count ducklings. *Build:* Canvas ducks with numbers spoken via Web Speech, tapped ducks hop.
2581. **Dress the Bear** `[2D]` — mix and match outfits. *Build:* DOM layered PNG/SVG clothing, drag-and-drop snapping to body slots.
2582. **Alphabet Aquarium** `[2D]` — letters swim, tap to hear. *Build:* Canvas letter fish with boids motion, tap triggers phonics speech.
2583. **Dino Egg Hatch** `[3D]` — crack eggs, meet dinosaurs. *Build:* Three.js low-poly eggs, tap-count cracking shader, hatching animation reveal.
2584. **Sticker Safari** `[2D]` — place stickers on scenes. *Build:* DOM sticker tray, pointer drag, rotate and scale handles, save to localStorage.
2585. **Bedtime Lights** `[2D]` — tuck animals, switch lamps. *Build:* Canvas bedroom scene, tap lamps toggles radial gradient light, lullaby audio.
2586. **Big Button Piano** `[2D]` — giant colorful note keys. *Build:* DOM large buttons, Web Audio oscillators, animal sound mode toggle.
2587. **Puddle Jumper Kid** `[2D]` — splash in rainy puddles. *Build:* Kaboom.js side-scroller, tap to jump, particle splashes, no fail state.
2588. **Sorting Socks** `[2D]` — match pairs by pattern. *Build:* DOM generated SVG sock patterns, drag pairs together, clothesline reward.
2589. **Fire Truck Rescue** `[2D]` — spray water on fires. *Build:* Canvas particle water stream following pointer, fire sprites shrink on hit.
2590. **Cupcake Decorator** `[3D]` — frost and sprinkle treats. *Build:* Three.js cupcake mesh, decal frosting painting via raycast, instanced sprinkles.
2591. **Toy Box Tidy** `[3D]` — drag toys into bins. *Build:* Three.js toy room, cannon-es toys, drag via raycast plane, category bins with cheers.
2592. **Balloon Numbers** `[2D]` — pop balloons in order. *Build:* Canvas rising balloons with numerals, sequence check, voice counting feedback.
2593. **Little Gardener** `[2D]` — water seeds, watch blooms. *Build:* Canvas watering can follows pointer, plant growth stages over timer.
2594. **Feed the Monster** `[2D]` — drop fruits in mouths. *Build:* Matter.js fruit drag-and-drop, sensor body mouth, chewing animation, colors spoken.
2595. **Teddy Tooth Brush** `[2D]` — brush away sugar bugs. *Build:* Canvas scrub detection by pointer movement distance over tooth regions.
2596. **Car Wash Fun** `[3D]` — scrub and rinse cars. *Build:* Three.js car model, dirt texture erased via render-to-texture brush, foam particles.
2597. **Rainbow Builder** `[2D]` — stack color arcs. *Build:* Canvas arcs drag into ordered slots, color names spoken, sparkle on completion.
2598. **Opposites Pairs** `[2D]` — match big and small. *Build:* DOM card pairs, tap two to match, illustrated SVG concepts, audio prompts.
2599. **Barnyard Sounds** `[2D]` — tap animals to hear them. *Build:* DOM SVG barn scene, recorded animal sounds, bounce CSS animations.
2600. **Weather Dress Up** `[2D]` — pick clothes for weather. *Build:* DOM weather scene randomizer, clothing drag targets, correct-fit feedback.

## 105. Language Learning — *DOM / Web Speech API*
2601. **Verb Volley** `[2D]` — conjugate before ball lands. *Build:* Canvas ball arc timer, DOM input, conjugation tables JSON, speed increases.
2602. **Gender Bender Nouns** `[2D]` — sort nouns by article. *Build:* DOM falling word cards, swipe left/right into gender bins, spaced repetition.
2603. **Phrase Builder Bricks** `[2D]` — snap words into sentences. *Build:* DOM draggable word tiles, order validation against accepted answers.
2604. **Accent Match** `[2D]` — repeat phrases, speech scored. *Build:* Web Speech recognition, Levenshtein similarity scoring, synthesis playback.
2605. **Kanji Strokes** `[2D]` — trace characters in order. *Build:* Canvas stroke capture, KanjiVG path data, direction and order checking.
2606. **Hangul Blocks** `[2D]` — assemble Korean syllables. *Build:* DOM jamo tiles, Unicode syllable composition formula, speech output.
2607. **Cyrillic Decoder** `[2D]` — read signs letter by letter. *Build:* DOM sign images, letter-by-letter typing, transliteration map hints.
2608. **Listening Labyrinth** `[3D]` — follow spoken directions. *Build:* Three.js maze, speech synthesis gives turn instructions, WASD movement.
2609. **Menu Order Sim** `[2D]` — order food in target language. *Build:* DOM café dialog tree, multiple-choice replies, waiter speech synthesis.
2610. **Idiom Island** `[2D]` — match idioms to meanings. *Build:* DOM matching pairs, island map progression, localStorage mastery tracking.
2611. **False Friend Trap** `[2D]` — avoid misleading cognates. *Build:* DOM rapid true/false cards, cognate dataset, explanation popups.
2612. **Dictation Drop** `[2D]` — type words you hear. *Build:* Web Speech synthesis, falling words Canvas, typed input clears matching word.
2613. **Vocab Garden** `[2D]` — words grow when reviewed. *Build:* Canvas plants per word, SM-2 spaced repetition scheduling, localStorage.
2614. **Tense Time Machine** `[2D]` — shift sentences across tenses. *Build:* DOM sentence templates, tense rules per language, dial UI.
2615. **Picture Labeler** `[2D]` — tag objects in scenes. *Build:* SVG scene with hotspots, drag labels onto objects, pronunciation playback.
2616. **Pinyin Tones** `[2D]` — choose correct tone marks. *Build:* Web Speech zh voice, tone contour SVG choices, streak scoring.
2617. **Article Archer** `[2D]` — shoot correct der die das. *Build:* Phaser 3 archery, three targets labeled articles, noun prompts.
2618. **Preposition Park** `[3D]` — place items by preposition. *Build:* Three.js park scene, drag objects relative to bench, spatial relation check.
2619. **Number Market** `[2D]` — haggle with spoken numbers. *Build:* Web Speech synthesis prices, typed numeric answers, haggling dialog.
2620. **Subtitle Sync** `[2D]` — order dialogue lines. *Build:* DOM sortable subtitle cards, audio playback per line, timing check.
2621. **Script Swap** `[2D]` — transliterate Greek words. *Build:* DOM input with live transliteration map, word list, accuracy meter.
2622. **Dialogue Detective** `[2D]` — pick polite responses. *Build:* DOM branching conversation JSON, formality scoring, NPC mood meter.
2623. **Plural Factory** `[2D]` — form irregular plurals. *Build:* Canvas conveyor belt, typed plurals, irregular lists per language.
2624. **Word Root Tree** `[2D]` — build words from roots. *Build:* SVG tree nodes, prefix/suffix tiles, dictionary validation Set.
2625. **Pen Pal Puzzles** `[2D]` — decode short letters. *Build:* DOM letter text with clickable unknown words, glossary hints, comprehension quiz.

## 106. Science Education — *p5.js / Canvas / Three.js*
2626. **Circuit Sandbox** `[2D]` — wire bulbs, batteries, switches. *Build:* Canvas grid components, graph traversal for closed loops, Ohm's law brightness.
2627. **Photosynthesis Factory** `[2D]` — balance light, water, CO2. *Build:* DOM sliders feeding rate equation, Canvas leaf glucose output gauge.
2628. **Cell Defender** `[2D]` — immune cells fight pathogens. *Build:* Phaser 3 tower defense, antibody units, mutation waves, click placement.
2629. **Plate Tectonics Push** `[3D]` — collide plates, form mountains. *Build:* Three.js displaced plane heightmap, drag plates, uplift where boundaries converge.
2630. **Orbit Slingshot** `[3D]` — learn gravity assists. *Build:* Three.js planets, Verlet N-body integration, launch vector drag, trajectory preview.
2631. **Wave Interference Pool** `[2D]` — ripple tank experiments. *Build:* Canvas 2D wave equation on grid, click to add sources, ImageData rendering.
2632. **Food Web Builder** `[2D]` — connect predators and prey. *Build:* SVG nodes and drag edges, Lotka-Volterra simulation, population graphs.
2633. **pH Potion Lab** `[2D]` — mix acids and bases. *Build:* DOM beakers, logarithmic pH calculation, indicator color gradient mapping.
2634. **Density Tank** `[3D]` — predict sink or float. *Build:* Three.js water tank, cannon-es bodies with buoyancy force by density, prediction buttons.
2635. **Lens Optics Bench** `[2D]` — focus light rays. *Build:* Canvas ray tracing with thin-lens equation, draggable lenses and objects.
2636. **Pendulum Lab** `[2D]` — tweak length and gravity. *Build:* Canvas RK4 pendulum integration, sliders, period measurement chart.
2637. **DNA Zipper** `[3D]` — pair base sequences. *Build:* Three.js double helix of instanced meshes, click complementary bases, unzip animation.
2638. **Weather Front Sim** `[2D]` — clash warm and cold air. *Build:* Canvas 2D fluid advection grid, temperature and humidity fields, cloud spawning.
2639. **Volcano Builder** `[3D]` — layer magma and ash. *Build:* Three.js cone mesh growth, particle lava flows, eruption type sliders.
2640. **Moon Phase Spinner** `[3D]` — rotate Earth and Moon. *Build:* Three.js directional sunlight, orbit drag, split view showing phase from Earth.
2641. **Erosion River** `[2D]` — carve canyons over time. *Build:* Canvas heightmap, hydraulic erosion droplets algorithm, rain brush input.
2642. **Atom Assembler** `[3D]` — build atoms from particles. *Build:* Three.js nucleus spheres, electron shells orbits, stability rules from isotope table.
2643. **Heat Flow Grid** `[2D]` — conduct heat across materials. *Build:* Canvas grid diffusion equation, material conductivity brushes, heatmap colors.
2644. **Bug Life Cycle** `[2D]` — guide metamorphosis stages. *Build:* Kaboom.js stage-based minigames, egg to adult transitions, fact cards.
2645. **Sound Speed Race** `[2D]` — waves through mediums. *Build:* Canvas wavefront circles, medium selector speeds, Web Audio delayed playback.
2646. **Magnet Field Lines** `[2D]` — sprinkle virtual iron filings. *Build:* Canvas dipole field vector math, thousands of oriented filing particles.
2647. **Rocket Fuel Mix** `[3D]` — balance thrust equations. *Build:* Three.js rocket launch, Tsiolkovsky equation from fuel sliders, altitude chart.
2648. **Germ Spread Petri** `[2D]` — grow cultures, test soap. *Build:* Canvas cellular automaton colonies, antiseptic brush, growth curve plot.
2649. **Rock Cycle Quest** `[2D]` — transform rock types. *Build:* DOM state graph of rock types, choose heat/pressure/erosion actions.
2650. **Water Cycle Journey** `[3D]` — droplet travels the world. *Build:* Three.js landscape, droplet follows spline per process choice, narration.

## 107. Coding Education — *DOM / Blockly*
2651. **Turtle Trails** `[2D]` — draw with move commands. *Build:* Canvas turtle graphics, tiny interpreter for forward/turn/repeat, target overlays.
2652. **Loop Lagoon** `[2D]` — collect fish using loops. *Build:* Blockly workspace, grid boat sprite, step-by-step execution highlighting.
2653. **Variable Vault** `[2D]` — open safes with variables. *Build:* DOM code editor, sandboxed eval in iframe, assertions checking variable values.
2654. **Bug Squash Debugger** `[2D]` — fix broken code lines. *Build:* CodeMirror editor, hidden test suite run in Web Worker, bug count.
2655. **Function Factory** `[2D]` — compose machines from functions. *Build:* SVG node-graph pipes, function blocks transform inputs to expected outputs.
2656. **Async Airport** `[2D]` — schedule promises as flights. *Build:* DOM timeline visualization, user writes async code, simulated delays.
2657. **Recursion Tree** `[2D]` — grow trees recursively. *Build:* Canvas recursive draw function edited by user, depth slider, target match.
2658. **Array Train** `[2D]` — sort carriages with methods. *Build:* DOM carriage elements, user calls map/filter/sort, animated results.
2659. **CSS Garden Grid** `[2D]` — position plants with grid. *Build:* DOM live CSS textarea injected into scoped style, grid-area validation.
2660. **Flexbox Frogs Pond** `[2D]` — align lily pads with flex. *Build:* DOM flex container, user CSS input, element position comparison.
2661. **SQL Detective** `[2D]` — query database to solve crime. *Build:* sql.js SQLite in browser, story tables, query results grid, answer check.
2662. **Git Branch Forest** `[2D]` — merge and rebase visually. *Build:* SVG commit DAG, simulated git commands parser, goal graph comparison.
2663. **Regex Rescue** `[2D]` — match patterns to free prisoners. *Build:* DOM regex input, JS RegExp test against must/must-not lists.
2664. **Boolean Bridges** `[2D]` — open gates with logic. *Build:* Canvas gate puzzles, user writes boolean expressions, truth table checks.
2665. **Big-O Race** `[2D]` — pick efficient algorithms. *Build:* Canvas race visualizing operation counts, growing input sizes, choose algorithm cards.
2666. **Stack Overflow Tower** `[2D]` — push and pop blocks. *Build:* Kaboom.js tower stack, command buttons, match target sequences.
2667. **Pointer Maze** `[2D]` — follow linked lists. *Build:* SVG nodes with arrows, user types next-pointer traversal, reach target node.
2668. **Sorting Dance** `[2D]` — visualize bubble and quick sort. *Build:* Canvas bars, generator-based sorting steps, player predicts next swap.
2669. **Shell Quest** `[2D]` — navigate filesystem with commands. *Build:* xterm.js terminal, virtual filesystem tree object, cd/ls/cat parser.
2670. **API Fetch Fetcher** `[2D]` — dog retrieves JSON data. *Build:* DOM fetch to mock JSON endpoints, user writes access paths, dog animation.
2671. **Event Loop Juggler** `[2D]` — order callbacks correctly. *Build:* DOM call stack, microtask and task queues, drag predictions.
2672. **Pixel Program** `[2D]` — paint pixels via code. *Build:* Canvas 16x16 grid, user nested loops in sandbox, compare to target image.
2673. **Bot Battle Script** `[2D]` — code AI tank behaviors. *Build:* Canvas arena, user scripts in Web Workers, tick API, bullets collision.
2674. **Assembly Arcade** `[2D]` — tiny CPU instruction puzzles. *Build:* DOM register view, custom 8-instruction VM interpreter, I/O test cases.
2675. **Unit Test Trials** `[2D]` — write tests to catch bugs. *Build:* CodeMirror, mutant function variants, run user tests to kill mutants.

## 108. Drawing & Creative — *p5.js / Canvas*
2676. **Symmetry Doodle** `[2D]` — mirrored brush mandala drawing. *Build:* Canvas rotational and mirror transforms per stroke, adjustable segment count.
2677. **One Line Art** `[2D]` — draw without lifting. *Build:* Canvas single continuous path capture, resets on pointerup, shape-match scoring.
2678. **Spirograph Studio** `[2D]` — gear-based curve art. *Build:* Canvas hypotrochoid equations, gear and pen offset sliders, animated drawing.
2679. **Pixel Quilt** `[2D]` — collaborative patchwork pixels. *Build:* Canvas 32x32 patches, Supabase realtime merge into quilt grid.
2680. **Watercolor Bloom** `[2D]` — paint with bleeding pigments. *Build:* WebGL ping-pong diffusion shader, pigment and water layers, pressure brush.
2681. **Stencil Spray** `[2D]` — graffiti with cut stencils. *Build:* Canvas clip paths from user-cut polygons, spray particle brush, drips.
2682. **Collage Cutter** `[2D]` — snip and arrange paper. *Build:* Canvas lasso cut from textures, draggable rotated pieces, export PNG.
2683. **Blind Contour** `[2D]` — draw while view hidden. *Build:* Canvas hidden during drawing, reference photo shown, reveal and compare.
2684. **Ink Blot Maker** `[2D]` — fold paint into shapes. *Build:* Canvas mirrored blot splats, metaball smoothing, fold animation reveal.
2685. **Comic Panel Creator** `[2D]` — build strips with bubbles. *Build:* DOM panel layouts, draggable SVG speech bubbles, html2canvas export.
2686. **Tile Pattern Designer** `[2D]` — seamless repeating tiles. *Build:* Canvas wraparound drawing on tile edges, live tiled preview background.
2687. **Neon Sign Bender** `[3D]` — shape glowing tubes. *Build:* Three.js TubeGeometry along drawn curve, bloom postprocessing, wall backdrop.
2688. **Sand Mandala** `[2D]` — pour colored sand patterns. *Build:* Canvas falling-sand cellular automaton, radial symmetry pouring, sweep away ending.
2689. **Chalk Sidewalk** `[2D]` — smudgy pavement drawings. *Build:* Canvas textured chalk brush with noise mask, smudge tool, rain wash.
2690. **Silhouette Cutout** `[3D]` — paper-cut scenery layers. *Build:* Three.js layered extruded shapes from drawings, backlight, parallax camera.
2691. **Mosaic Maker** `[2D]` — chip tiles into images. *Build:* Canvas image quantized into tile grid, click to place colored tesserae.
2692. **Stamp Carver** `[2D]` — carve and print linocuts. *Build:* Canvas carve mask, ink roller texture, mirrored stamping prints.
2693. **Face Doodle Prompt** `[2D]` — draw from random prompts. *Build:* Canvas sketchpad, combinatorial prompt generator, timer and gallery.
2694. **Constellation Draw** `[3D]` — connect your own stars. *Build:* Three.js star sphere, click stars to link lines, name and save myths.
2695. **Typography Toy** `[2D]` — warp and style letters. *Build:* opentype.js glyph paths, Canvas point displacement, gradient fills.
2696. **Rangoli Grid** `[2D]` — dot-based festive patterns. *Build:* SVG dot grid, curve snapping between dots, symmetric fill coloring.
2697. **Shadow Box Layers** `[3D]` — depth paper dioramas. *Build:* Three.js stacked planes with drawn alpha textures, soft shadows, tilt view.
2698. **Zen Brush Calligraphy** `[2D]` — pressure ink strokes. *Build:* Canvas Pointer Events pressure and velocity width, ink bleed texture.
2699. **Pixel Sprite Forge** `[2D]` — design tiny game sprites. *Build:* Canvas zoomed pixel editor, palette, frame animation preview, PNG export.
2700. **Glitch Painter** `[2D]` — paint with corrupted pixels. *Build:* Canvas ImageData channel shifting and pixel sorting brushes.

## 109. Music Toys — *Tone.js / Web Audio*
2701. **Pendulum Chimes** `[2D]` — swinging bells make harmony. *Build:* Canvas pendulums with different lengths, Tone.js bell synth on center crossing.
2702. **Raindrop Synth** `[2D]` — drops on surfaces play notes. *Build:* Matter.js drops, drawn ledges mapped to pitches, collision triggers notes.
2703. **Bouncing Notes** `[2D]` — balls bounce off note walls. *Build:* Canvas polygon walls assigned notes, ball reflection physics, Tone.js.
2704. **Grid Tone Matrix** `[2D]` — toggle cells for loops. *Build:* DOM 16x16 grid, Tone.Transport sequencing, pentatonic mapping, share URL.
2705. **Wind Harp** `[2D]` — mouse breeze strums strings. *Build:* Canvas strings, pointer velocity excites Karplus-Strong plucked synthesis.
2706. **Theremin Hover** `[2D]` — pointer controls pitch and volume. *Build:* Web Audio oscillator, X maps frequency, Y gain, vibrato LFO.
2707. **Marble Xylophone** `[3D]` — marbles roll over keys. *Build:* Three.js track, cannon-es marbles, contact events trigger mallet samples.
2708. **Planet Arpeggiator** `[3D]` — orbiting planets trigger notes. *Build:* Three.js orbits, notes fire when planets cross a beam, Tone.js.
2709. **Bell Garden** `[2D]` — grow flowers that ring. *Build:* Canvas generative flowers, each tuned bell, wind gusts trigger chords.
2710. **Vocal Choir Toy** `[2D]` — drag singers into harmony. *Build:* DOM singers, formant-filtered oscillators, chord detection from positions.
2711. **Drum Circle** `[2D]` — tap hand drums together. *Build:* DOM drum pads, Tone.js membrane synth, PeerJS shared session sync.
2712. **Kalimba Keys** `[2D]` — thumb piano with tines. *Build:* SVG tines, multi-touch Pointer Events, FM bell-like synthesis.
2713. **Glass Harmonica** `[3D]` — rub wine glasses for tones. *Build:* Three.js glasses, circular pointer motion detection, sustained sine with vibrato.
2714. **Music Box Punch** `[2D]` — punch paper strips. *Build:* Canvas scrolling strip, click holes on note grid, crank speed slider.
2715. **Beat Blocks** `[2D]` — stack blocks as rhythm. *Build:* Matter.js blocks, column heights form step sequence, Tone.js drum samples.
2716. **Wave Shaper** `[2D]` — draw custom oscillator waves. *Build:* Canvas waveform drawing, PeriodicWave from FFT of drawing, keyboard play.
2717. **Chord Wheel** `[2D]` — spin to hear progressions. *Build:* SVG circle of fifths, drag rotation, Tone.js PolySynth chord playback.
2718. **Looper Pedal** `[2D]` — layer recorded mic loops. *Build:* MediaRecorder or AudioWorklet capture, synced loop buffers, waveform display.
2719. **Bird Song Mixer** `[2D]` — combine birdcall patterns. *Build:* Web Audio FM chirp synthesis, tree branch slots, tempo sync.
2720. **Harmonic Strings** `[2D]` — pluck physics-based strings. *Build:* Canvas string mass-spring sim, displacement drives audio via AudioWorklet.
2721. **Gamelan Gongs** `[3D]` — Indonesian bronze ensemble. *Build:* Three.js gong meshes, click strike, metallic inharmonic synthesis, pelog tuning.
2722. **Scale Painter** `[2D]` — color strokes become melodies. *Build:* Canvas strokes, Y to scale degree, playback cursor sweeps left-right.
2723. **Tuning Fork Lab** `[2D]` — combine frequencies, hear beats. *Build:* Web Audio sines, frequency knobs, Canvas waveform sum visualization.
2724. **Ambient Generator** `[2D]` — evolving drone soundscapes. *Build:* Tone.js layered pads, random walk parameters, generative visual circles.
2725. **Toy Orchestra** `[2D]` — conduct cartoon instrument sections. *Build:* Canvas sections, pointer gesture speed sets tempo, Tone.js parts.

## 110. Cozy & Relaxing — *Canvas / PixiJS / Three.js*
2726. **Tea House Tending** `[2D]` — brew tea for visitors. *Build:* PixiJS scene, steep timer per leaf type, customer preference matching.
2727. **Moss Terrarium** `[3D]` — arrange moss and stones. *Build:* Three.js glass jar, drag-place objects with raycast, orbit camera, soft lighting.
2728. **Bonsai Pruner** `[3D]` — shape a tiny tree. *Build:* Three.js L-system branches, click to prune, seasonal growth over sessions.
2729. **Cloud Watching** `[2D]` — find shapes in clouds. *Build:* Canvas Perlin noise clouds drifting, tag shapes, gentle ambient audio.
2730. **Laundry Line** `[3D]` — hang clothes in breeze. *Build:* Three.js cloth Verlet simulation, drag clothes to pegs, wind gusts sway fabric.
2731. **Bonsai Trimmer** `[2D]` — shape a tiny tree. *Build:* Canvas L-system branches, click to prune, growth saved in localStorage.
2732. **Bookshop Shelving** `[2D]` — sort books by color. *Build:* DOM drag books on shelves, HSL gradient scoring, cat wandering.
2733. **Rainy Window** `[2D]` — trace on foggy glass. *Build:* Canvas fog layer erased by pointer, refogging over time, droplet trails.
2734. **Koi Pond** `[3D]` — feed fish, ripple water. *Build:* Three.js water shader with ripple heightmap, boid koi, tap food pellets.
2735. **Knitting Patterns** `[2D]` — stitch cozy scarves. *Build:* Canvas stitch grid, rhythmic key presses add rows, pattern charts.
2736. **Cat Cafe Nap** `[2D]` — arrange sleeping cats. *Build:* Canvas tile room, cats have spot preferences, constraint puzzle placement.
2737. **Rain Window** `[2D]` — bet on racing raindrops. *Build:* Canvas droplet particles that merge and slide, pick a winner, soft rain audio.
2738. **Sushi Roll Calm** `[2D]` — slowly prepare rolls. *Build:* Canvas ingredient drag, roll gesture swipe, slice taps, no timer.
2739. **Stargazing Blanket** `[3D]` — connect stars at night. *Build:* Three.js sky dome, real star catalog, drag look-around, soft crickets.
2740. **Seashell Collector** `[2D]` — stroll and beachcomb. *Build:* PixiJS scrolling beach, tide-wave shader, procedural shells collection book.
2741. **Flower Pressing** `[2D]` — arrange petals in books. *Build:* DOM drag petals onto page, rotate, save page to gallery.
2742. **Bread Kneader** `[2D]` — shape and bake loaves. *Build:* Canvas soft-body dough, drag kneading, oven timer browning.
2743. **Snowfall Cabin** `[3D]` — decorate cabin as snow falls. *Build:* Three.js cabin interior, instanced snow particles, drag-place ornaments.
2744. **Unpacking Boxes** `[2D]` — place items in new home. *Build:* Canvas grid rooms, item drag snapping, sensible placement hints.
2745. **Postcard Writer** `[2D]` — design and send postcards. *Build:* Canvas stamp and drawing tools, text, shareable link encoding image.
2746. **Fireplace Stoker** `[3D]` — build and tend a fire. *Build:* Three.js hearth, cannon-es logs, particle flames scale with fuel, crackle audio.
2747. **Origami Fold** `[3D]` — follow calm folding steps. *Build:* Three.js paper mesh with hinge rotations, drag folds along crease lines.
2748. **Picnic Planner** `[2D]` — pack and arrange blankets. *Build:* DOM basket packing grid, Tetris-like fitting, ant visitors.
2749. **Firefly Meadow** `[2D]` — catch and release fireflies. *Build:* Canvas glowing particles with noise motion, jar catching, release.
2750. **Zen Sand Rake** `[3D]` — rake patterns in a sand garden. *Build:* Three.js heightmap displaced by mouse drag, stone placement, soft lighting.

## 111. Webcam & Motion Fitness — *TensorFlow.js / MediaPipe*
2751. **Squat Jumper** `[2D]` — squat to charge jumps. *Build:* MediaPipe Pose hip height, Canvas runner, squat depth sets jump strength.
2752. **Jumping Jack Rocket** `[3D]` — jacks fuel a launch. *Build:* MoveNet arm/leg spread detection, rep counter, Three.js rocket ascent.
2753. **Pose Match Wall** `[3D]` — fit shapes in walls. *Build:* MediaPipe Pose keypoints, Three.js wall holes, skeleton overlap scoring.
2754. **Yoga Flow Guide** `[2D]` — hold poses for points. *Build:* MoveNet joint angles vs targets, hold timer, Canvas skeleton overlay.
2755. **Air Boxing Combo** `[3D]` — punch targets on screen. *Build:* MediaPipe wrist velocity, Three.js floating pads, punch-through hit detection, combos.
2756. **Plank Timer Quest** `[2D]` — plank holds power journey. *Build:* Pose body line angle check, Canvas map progress per second.
2757. **Head Tilt Steer** `[3D]` — drive by tilting head. *Build:* MediaPipe Face Mesh roll angle, Three.js road, steering input.
2758. **Wave Hello Catch** `[2D]` — hands catch falling fruit. *Build:* MediaPipe Hands positions, Canvas falling fruit, mirrored webcam.
2759. **Lunge Lanes** `[3D]` — lunge to switch lanes. *Build:* Pose knee positions, Three.js endless runner, lunge direction detection.
2760. **Mirror Dance Copy** `[2D]` — mimic avatar moves. *Build:* recorded keypoint sequences, cosine similarity per frame, beat-timed.
2761. **Kick Goal Keeper** `[2D]` — block shots with limbs. *Build:* Pose limb segments as colliders, Matter.js balls, mirrored video.
2762. **Arm Circle Windmill** `[2D]` — spin turbines by arms. *Build:* wrist angular velocity around shoulder, Canvas turbines, power meter.
2763. **Breath Balloon Cam** `[2D]` — chest motion inflates balloon. *Build:* Pose shoulder rise tracking, smoothing, Canvas balloon breathing pacing.
2764. **Shadow Fencing** `[2D]` — parry with arm motion. *Build:* MediaPipe Hands line, opponent strikes, angle-based parry checks.
2765. **Knee High Sprint** `[3D]` — run in place to race. *Build:* Pose knee lift cadence mapped to speed, Three.js stadium track race.
2766. **Stretch Reach Stars** `[2D]` — reach toward glowing points. *Build:* Pose wrists and ankles, Canvas targets at reach limits.
2767. **Body Tetris** `[2D]` — form blocks with body. *Build:* segmentation mask grid sampling, Tetromino shape matching, Canvas.
2768. **Blink Runner** `[2D]` — blinks trigger jumps. *Build:* Face Mesh eye aspect ratio threshold, Kaboom.js runner.
2769. **Smile Meter** `[2D]` — keep smiling to fly. *Build:* Face Mesh mouth corner distance, Canvas bird altitude from smile.
2770. **Eyebrow Lift** `[2D]` — raise brows to flap. *Build:* Face Mesh brow-eye distance, flappy-style Canvas game.
2771. **Tai Chi Flow** `[3D]` — slow motions guide water. *Build:* Pose hand velocities, Three.js water particles, reward slowness.
2772. **Burpee Blaster** `[2D]` — burpees fire cannons. *Build:* Pose vertical position state machine, rep detection, Phaser defense.
2773. **Finger Count Math** `[2D]` — show answers with fingers. *Build:* MediaPipe Hands extended finger count, arithmetic prompts, DOM.
2774. **Mouth Open Chomp** `[2D]` — eat objects with mouth. *Build:* Face Mesh lip distance and position, Canvas flying snacks.
2775. **Side Step Dodge** `[3D]` — lean to avoid obstacles. *Build:* Pose torso X position, Three.js tunnel obstacles, collision.

## 112. Touch Gesture Games — *Hammer.js / Pointer Events*
2776. **Swipe Sushi Chef** `[2D]` — swipe to slice rolls. *Build:* Canvas swipe trails, segment-circle intersection, combo slicing.
2777. **Pinch Planet Zoom** `[3D]` — pinch to resize planets. *Build:* Three.js planets, two-pointer distance scales, fit gaps puzzle.
2778. **Two-Finger Twist** `[2D]` — rotate locks precisely. *Build:* Pointer Events two-touch angle delta, SVG dial, tumbler targets.
2779. **Flick Paper Ball** `[3D]` — flick into trash bin. *Build:* Three.js ball, swipe velocity to launch vector, wind, cannon-es.
2780. **Spread the Herd** `[2D]` — spread fingers to scatter. *Build:* multi-touch repulsors, Canvas sheep boids, pen goals.
2781. **Long Press Charge** `[2D]` — hold to charge attacks. *Build:* Pointer down duration, Canvas charge ring, enemy waves.
2782. **Trace the Rune** `[2D]` — draw runes to cast. *Build:* $1 Unistroke Recognizer, Canvas trails, spell effects.
2783. **Multi-Tap Moles** `[2D]` — tap simultaneous targets. *Build:* Canvas multi-touch hit tests, synchronized mole groups.
2784. **Swipe Combo Fighter** `[2D]` — gesture-based combat moves. *Build:* swipe direction sequences, Phaser fighter animations, combo table.
2785. **Drag Link Dots** `[2D]` — connect same-color chains. *Build:* Canvas grid, drag path adjacency, gravity refill, square bonus.
2786. **Rub Scratch Card** `[2D]` — reveal hidden prizes. *Build:* Canvas destination-out erasing, reveal percentage via pixel sampling.
2787. **Circle Lasso** `[2D]` — encircle groups to catch. *Build:* Canvas freeform loop, point-in-polygon tests on critters.
2788. **Thumb Joystick Race** `[3D]` — virtual stick drifting. *Build:* nipplejs joystick, Three.js top-down track, arcade drift car physics.
2789. **Tap Rhythm Bricks** `[2D]` — tap on beat to build. *Build:* Tone.js beat clock, timing windows, Canvas tower growth.
2790. **Pinch Pull Slingshot** `[2D]` — stretch and release. *Build:* Matter.js sling, drag distance power, projectile targets.
2791. **Double Tap Dash** `[2D]` — double-tap to teleport. *Build:* double-tap detection timing, Canvas teleport to tap point, hazards.
2792. **Swipe Sort Mail** `[2D]` — sort letters left or right. *Build:* DOM swipe cards with Hammer.js, address rules, speed-up.
2793. **Finger Twister** `[2D]` — hold multiple spots at once. *Build:* Pointer Events track active touches, Canvas colored circles.
2794. **Drag Water Channels** `[2D]` — dig paths for water. *Build:* Canvas sand grid, finger carves, water flow cellular automaton.
2795. **Swipe Spell Book** `[3D]` — flip pages with gestures. *Build:* Three.js page curl mesh, swipe flips, symbol gestures cast.
2796. **Edge Swipe Escape** `[2D]` — swipe edges to dodge. *Build:* Canvas center character, swipe direction from edges, projectiles.
2797. **Tap Hold Release** `[2D]` — timing jumps across gaps. *Build:* Kaboom.js charge jump, hold duration to distance.
2798. **Two Thumb Tennis** `[2D]` — each thumb controls paddle. *Build:* split-screen touch zones, Canvas ball physics, AI rally.
2799. **Smudge Clean Glass** `[2D]` — wipe windows clean. *Build:* Canvas dirt layer erasure, pixel coverage check, timed levels.
2800. **Stroke Order Racer** `[2D]` — draw shapes as fast as possible. *Build:* Canvas shape templates, stroke matching via Fréchet distance, timer.

## 113. One-Button Games — *Kaboom.js / Canvas*
2801. **Pogo Stick Pete** `[2D]` — tap timing for bounces. *Build:* Kaboom.js, perfect timing window boosts height, platforms.
2802. **Lighthouse Beam** `[2D]` — hold to sweep the light. *Build:* Canvas rotating cone, hold rotates, ships need light, rocks.
2803. **Hook Line Sinker** `[2D]` — tap to drop fishing hook. *Build:* Canvas swinging hook, tap drop, fish catch collision, reel up.
2804. **Orbit Jumper** `[2D]` — tap to switch orbits. *Build:* Canvas circular orbits, tap jumps outward, hazards on rings.
2805. **Pole Vault Hold** `[2D]` — hold to run, release jump. *Build:* Canvas speed accumulation, pole plant timing, bar heights.
2806. **Crane Drop Stack** `[3D]` — tap to drop crates. *Build:* Three.js swinging crane, cannon-es stacking, height camera follow.
2807. **Spin Stop Lock** `[2D]` — stop spinning dial correctly. *Build:* Canvas rotating needle, target arc, speed escalation.
2808. **Pendulum Swinger** `[2D]` — release swing at peak. *Build:* Canvas pendulum physics, release projectile, landing zones.
2809. **Kite Rider** `[3D]` — hold to rise in wind. *Build:* Three.js kite and string line, hold for lift vs gravity, noise wind, obstacles.
2810. **Bridge Stretcher** `[2D]` — hold to grow plank. *Build:* Canvas growing stick, release rotates, gap landing check.
2811. **Lane Flip Car** `[3D]` — tap to switch lanes. *Build:* Three.js two-lane highway, tap toggles lane, oncoming traffic pool, speed ramp.
2812. **Gravity Toggle** `[2D]` — tap flips gravity. *Build:* Kaboom.js runner, gravity sign flip, ceiling and floor spikes.
2813. **Arrow Release** `[2D]` — tap at wind-adjusted moment. *Build:* Canvas oscillating aim, wind drift calculation, target rings.
2814. **Rocket Burn** `[2D]` — hold to thrust, release coast. *Build:* Canvas thrust physics, fuel limit, gate passages.
2815. **Bubble Rise** `[2D]` — hold to inflate and float. *Build:* Canvas bubble radius buoyancy, pop if too big, spikes.
2816. **Mole Hammer Timing** `[2D]` — single button whack timing. *Build:* Canvas swinging hammer across holes, tap to strike.
2817. **Rope Cutter Swing** `[2D]` — tap to release grapple. *Build:* Matter.js rope constraint, tap releases and auto-hooks next.
2818. **Dive Bird** `[2D]` — tap to dive for fish. *Build:* Canvas gull flight, dive arc, fish schools, ascend auto.
2819. **Ping Return** `[2D]` — tap to return ball. *Build:* Canvas auto-moving paddle, timing determines angle, rally count.
2820. **Elevator Stop** `[2D]` — stop at exact floor. *Build:* Canvas accelerating elevator, floor alignment scoring, passengers.
2821. **Heartbeat Run** `[2D]` — tap in pulse rhythm. *Build:* Tone.js heartbeat, tap timing drives speed, ECG line graphics.
2822. **Sling Satellite** `[3D]` — release to escape orbit. *Build:* Three.js planet, orbiting satellite, release tangent velocity to next target.
2823. **Wall Climber Tap** `[2D]` — tap to hop walls. *Build:* Canvas two walls, tap jumps across, spike patterns.
2824. **Seesaw Launch** `[2D]` — tap to launch partner. *Build:* Matter.js seesaw, timed jump impact, height scoring.
2825. **Bouncy Cube** `[3D]` — tap to rotate falling cube. *Build:* Three.js cube faces colored, tap rotates 90°, match landing pad.

## 114. Retro Console Style (NES/Game Boy look) — *Phaser 3 / Canvas*
2826. **Four Shade Quest** `[2D]` — Game Boy-palette dungeon crawl. *Build:* Phaser 3 160x144 canvas scaled, 4-color palette, tilemap rooms.
2827. **Cartridge Knight** `[2D]` — 8-bit side-scrolling sword hero. *Build:* Phaser 3 Tiled maps, arcade physics, sword hitboxes, gamepad.
2828. **Pixel Plumber Pipes** `[2D]` — NES-style pipe platformer. *Build:* Phaser 3 tilemap, pipe warp zones, stomp collisions, chiptune.
2829. **Bit Brawler** `[2D]` — beat-em-up in 8-bit streets. *Build:* Phaser 3 depth-sorted sprites, combo inputs, enemy state machines.
2830. **Chiptune Raider** `[2D]` — tomb raiding with chip music. *Build:* Phaser 3 platformer, Tone.js square-wave music, trap triggers.
2831. **Monochrome Monster Tamer** `[2D]` — catch creatures, 4-color. *Build:* Canvas tile overworld, turn-based battles, creature stats JSON.
2832. **Dot Matrix Golf** `[2D]` — pocket handheld golfing. *Build:* Canvas top-down course, power meter, ball roll friction, 4 shades.
2833. **Scanline Racer** `[2D]` — mode-7 style kart racing. *Build:* Canvas per-scanline affine floor projection, sprites scaling, AI karts.
2834. **Tiny Kingdom Tactics** `[2D]` — grid-based NES strategy. *Build:* Canvas tile grid, BFS movement range, turn phases, simple AI.
2835. **Pocket Ninja Scroll** `[2D]` — handheld stealth platformer. *Build:* Phaser 3, guard vision cones, hide spots, wall climbing.
2836. **Famicom Fishing** `[2D]` — 8-bit lake angling. *Build:* Canvas cast arc, line tension minigame, fish species tables.
2837. **Sprite Flicker Shmup** `[2D]` — old-school vertical shooter. *Build:* Phaser 3, sprite-per-line flicker emulation, bullet pools.
2838. **Pixel Puncher** `[2D]` — boxing with big sprites. *Build:* Canvas opponent pattern tells, dodge and punch timing.
2839. **Green Screen Detective** `[2D]` — Game Boy point-and-click. *Build:* DOM scene images, verb menu, inventory, dialog scripts.
2840. **Overworld Odyssey** `[2D]` — top-down Zelda-like quest. *Build:* Phaser 3 screen-flip rooms, items unlock areas, hearts HUD.
2841. **Password Continue** `[2D]` — retro adventure with codes. *Build:* Canvas platformer, state encoded into base32 password strings.
2842. **Bit Bomber Bay** `[2D]` — bombing runs over sea. *Build:* Canvas side-view plane, bomb arc physics, ship targets.
2843. **Cart Cave Diver** `[2D]` — 4-color spelunker. *Build:* Phaser 3 rope and lamp mechanics, oxygen meter, procedural caves.
2844. **Palette Swap Hero** `[2D]` — swap palettes to reveal paths. *Build:* Canvas indexed color rendering, palette switch toggles platform visibility.
2845. **8-Bit Ice Hockey** `[2D]` — tiny sprite hockey. *Build:* Canvas rink, skating inertia, puck physics, 3v3 AI.
2846. **Mini Tile RPG** `[2D]` — turn-based handheld JRPG. *Build:* Canvas tilemap, random encounters, menu battle system, save in localStorage.
2847. **Retro Wrestle Ring** `[2D]` — 8-bit pro wrestling. *Build:* Phaser 3 grapple button mash, rope bounces, pin counts.
2848. **Pocket Pinball** `[2D]` — handheld single-table pinball. *Build:* Planck.js flippers and bumpers, 160x144 render, tilt.
2849. **Chunky Pixel Chef** `[2D]` — retro cooking action. *Build:* Canvas order queue, ingredient stations, timing minigames.
2850. **Dot Sprite Soccer** `[2D]` — top-down NES football. *Build:* Canvas scrolling pitch, pass and shoot, simple team AI.

## 115. Text & Terminal Games — *xterm.js / DOM*
2851. **Command Line Heist** `[2D]` — break into fake systems. *Build:* xterm.js shell, virtual network graph, command parser, trace timer.
2852. **Text Tavern** `[2D]` — chat-driven inn management. *Build:* DOM chat log, keyword parser, guest needs and coin economy.
2853. **MUD Lite** `[2D]` — single-player text dungeon. *Build:* DOM terminal, room graph JSON, verb-noun parser, NPC combat.
2854. **Prompt Survivor** `[2D]` — survive by typed choices. *Build:* DOM prose, resource counters, random event tables, typed commands.
2855. **Mail Server Mystery** `[2D]` — read fake emails for clues. *Build:* DOM inbox UI, branching email reveals, password puzzles.
2856. **ASCII Aquarium** `[2D]` — watch and feed text fish. *Build:* pre element animation loop, character fish sprites, feeding commands.
2857. **Telnet Trader** `[2D]` — space trading over console. *Build:* xterm.js, sector graph, price simulation, cargo commands.
2858. **BBS Simulator** `[2D]` — explore a 90s bulletin board. *Build:* xterm.js ANSI art, menu navigation, door games, message boards.
2859. **Typewriter Tales** `[2D]` — branching story via keystrokes. *Build:* Ink.js story, typed choices, typewriter sound effects.
2860. **Terminal Tetris** `[2D]` — falling blocks in characters. *Build:* xterm.js render buffer, tetromino matrices, keyboard rotation.
2861. **Shell Gardener** `[2D]` — grow plants via commands. *Build:* DOM terminal, plant growth timers, ASCII plant stages.
2862. **Morse Operator** `[2D]` — decode signals at station. *Build:* Web Audio beeps, timing to dot-dash, typed decoding.
2863. **Radio Static Story** `[2D]` — tune frequencies for plot. *Build:* DOM dial, Web Audio noise with filtered voices, story fragments.
2864. **Logfile Forensics** `[2D]` — find intruder in logs. *Build:* DOM generated logs, grep-like search command, timestamp correlation.
2865. **Text Mines** `[2D]` — minesweeper on character grid. *Build:* pre grid, coordinate commands, flood reveal recursion.
2866. **Bash Dungeon** `[2D]` — explore folders as rooms. *Build:* xterm.js, virtual filesystem rooms, cat to read monsters.
2867. **Chat Bot Interrogation** `[2D]` — question suspects by text. *Build:* DOM chat, keyword-matched response trees, contradiction tracking.
2868. **Ticker Tape Trader** `[2D]` — stock market via text. *Build:* DOM scrolling ticker, random walk prices, buy/sell commands.
2869. **Diary of Doors** `[2D]` — choose doors in prose. *Build:* DOM paragraphs, procedurally chained door rooms, inventory.
2870. **Ascii Fishing Pier** `[2D]` — text-based angling. *Build:* pre animated water, cast timing, ASCII fish catalog.
2871. **Prompt Poetry Duel** `[2D]` — compose rhyming responses. *Build:* DOM input, CMU rhyme dictionary lookup, meter counting.
2872. **Kernel Panic** `[2D]` — fix crashing OS in time. *Build:* xterm.js, cascading process failures, kill and restart commands.
2873. **Rogue Terminal** `[2D]` — classic @ hero adventures. *Build:* rot.js display, map generator, FOV, turn scheduler.
2874. **Text Farm Ledger** `[2D]` — farming with typed orders. *Build:* DOM ledger table, crop timers, commands for planting.
2875. **Cipher Console** `[2D]` — crack layered text ciphers. *Build:* DOM tools for frequency analysis, Caesar and Vigenère decoders.

## 116. Procedural & Generative — *p5.js / Three.js / Simplex Noise*
2876. **Infinite Archipelago** `[3D]` — sail generated islands. *Build:* Three.js chunked simplex heightmaps, water shader, boat physics.
2877. **Endless Cave Spelunk** `[3D]` — noise-generated caverns. *Build:* Three.js marching cubes on 3D noise, flashlight, chunk streaming.
2878. **Seed Galaxy** `[3D]` — explore galaxies from seeds. *Build:* Three.js points spiral arms, seeded PRNG, star system zoom.
2879. **Planet Forge** `[3D]` — sculpt generated worlds. *Build:* Three.js icosphere noise displacement, biome coloring, brush raise/lower.
2880. **L-System Forest** `[3D]` — grow fractal trees. *Build:* Three.js L-system turtle interpreter to cylinders, rule editor.
2881. **Dungeon Seed Hunt** `[2D]` — share seeds for dungeons. *Build:* rot.js BSP dungeon from seed string, leaderboard per seed.
2882. **Wave Collapse Town** `[3D]` — WFC-generated villages. *Build:* Three.js tile meshes, wave function collapse solver, walk mode.
2883. **Procedural Creature Zoo** `[3D]` — breed generated animals. *Build:* Three.js parametric body-part meshes, genome crossover breeding, orbit-view enclosures.
2884. **Random Recipe Chef** `[2D]` — generated dishes to cook. *Build:* DOM grammar-based recipe generator, cooking step minigames.
2885. **Name Forge Kingdom** `[2D]` — procedural lore and names. *Build:* Markov chain names, Tracery lore, Canvas map.
2886. **Noise Terrain Glider** `[3D]` — glide over infinite hills. *Build:* Three.js streamed terrain chunks, glider lift physics, thermals.
2887. **Dreamscape Generator** `[3D]` — surreal levels per run. *Build:* Three.js random primitives, shader palettes, rule mutations.
2888. **Generated Golf Holes** `[3D]` — infinite random courses. *Build:* Three.js noise terrain, spline fairway, cannon-es ball.
2889. **Fractal Map Explorer** `[2D]` — zoom into map fractals. *Build:* WebGL Mandelbrot shader, coordinates as treasure locations.
2890. **Cellular Cave Builder** `[2D]` — automaton caves to explore. *Build:* Canvas cellular automata smoothing, flood fill connectivity, explore.
2891. **Rune Generator Duel** `[2D]` — procedural spell glyphs. *Build:* Canvas stroke grammar glyphs, glyph features map to effects.
2892. **Endless Library** `[3D]` — infinite generated book rooms. *Build:* Three.js hexagonal rooms, seeded text books, first-person.
2893. **Sky City Builder** `[3D]` — randomized floating islands. *Build:* Three.js noise islands, place buildings, bridge connections.
2894. **Voronoi Kingdoms** `[2D]` — conquer generated regions. *Build:* d3-delaunay Voronoi map, region adjacency, turn-based armies.
2895. **Infinite Tower Climb** `[2D]` — generated vertical levels. *Build:* Phaser 3, chunk templates stitched by seed, rising hazard.
2896. **Weather World** `[3D]` — procedural climate exploration. *Build:* Three.js globe, latitude-based climate model, biome textures.
2897. **Random Monster Hunt** `[2D]` — generated beast encounters. *Build:* Canvas modular sprites, stat roll tables, turn combat.
2898. **Melody Map** `[2D]` — terrain becomes music. *Build:* Canvas heightmap, scanline converts heights to notes, Tone.js.
2899. **Seeded Racing Tracks** `[3D]` — infinite spline circuits. *Build:* Three.js CatmullRom track extrude, seeded control points, car.
2900. **Strange Attractor Ride** `[3D]` — fly through chaos curves. *Build:* Three.js Lorenz attractor line, camera follows path, rings.

## 117. Daily & Async Multiplayer — *Firebase / Supabase*
2901. **Daily Seed Run** `[2D]` — same level for everyone. *Build:* date-seeded generator, Canvas platformer, Firebase daily leaderboard.
2902. **Postcard Chess** `[2D]` — slow correspondence chess. *Build:* chess.js rules, Firestore game docs, push notifications on move.
2903. **Ghost Race Daily** `[3D]` — race others' recorded runs. *Build:* Three.js track, record input frames, replay ghost cars from Supabase.
2904. **Shared Mural** `[2D]` — one pixel per day. *Build:* Canvas grid, Supabase rate-limited writes, realtime subscribe.
2905. **Message Bottle Sea** `[3D]` — send notes to strangers. *Build:* Three.js ocean, random bottle fetch from Firestore, moderation filters.
2906. **Daily Heist Plan** `[2D]` — plan robberies, compare results. *Build:* DOM planning grid, deterministic simulation, percentile ranking.
2907. **Turn-a-Day Empire** `[2D]` — one move per day. *Build:* Canvas hex map, server-side turn resolution via cloud function.
2908. **Async Word Duel** `[2D]` — alternating word plays. *Build:* DOM letter board, dictionary Set, Firestore turn sync.
2909. **Leaderboard Lottery** `[2D]` — daily luck rankings. *Build:* DOM dice rolls seeded by user plus date, global ranks.
2910. **Puzzle Relay** `[2D]` — players pass partial solutions. *Build:* DOM sliding puzzle, save state, next player continues.
2911. **Daily Island Raid** `[2D]` — build defenses, raid others. *Build:* Canvas grid base editor, deterministic raid sim against stored layouts.
2912. **Community Garden** `[2D]` — shared plot, daily watering. *Build:* Canvas tiles, Supabase plot ownership, growth timers.
2913. **Weekly Kingdom Vote** `[2D]` — collective decisions. *Build:* DOM decree cards, Firestore vote tallies, outcome narrative.
2914. **Letter Chain Story** `[2D]` — add one sentence daily. *Build:* DOM story feed, one-post-per-day limit, upvotes.
2915. **Async Battle Deck** `[2D]` — set lineups, auto-battle. *Build:* DOM deck builder, deterministic battle replay against saved decks.
2916. **Daily Riddle Board** `[2D]` — community guesses. *Build:* DOM riddle, hashed answer checking, solve-time distribution chart.
2917. **Town Hall Sim** `[2D]` — vote on town laws. *Build:* Canvas town sim, laws modify parameters, daily tick.
2918. **Treasure Map Swap** `[2D]` — hide and seek treasures. *Build:* Canvas generated island maps, hide coordinates, others dig.
2919. **Daily Draft** `[2D]` — pick team from shared pool. *Build:* DOM player cards, seeded pool, simulated season scoring.
2920. **Slow Space Race** `[3D]` — spend hourly fuel. *Build:* Three.js solar system, fuel accrues per hour, async positions.
2921. **Clan Fortress** `[2D]` — defend base offline. *Build:* Phaser 3 base editor, attack replays stored, clan chat.
2922. **Asynchronous Duel Golf** `[2D]` — trade shots over hours. *Build:* Canvas 2D course, store shot vectors, replay opponent shots.
2923. **Daily Stock Pick** `[2D]` — compete on predictions. *Build:* DOM fictional market random walk, daily picks, weekly standings.
2924. **World Clock Pet** `[2D]` — shared global pet. *Build:* Canvas pet, Firestore global stats, any player can feed.
2925. **Turn Mail Battleship** `[2D]` — slow-turn naval warfare. *Build:* DOM grids, Firestore shots, email-style turn notifications.

## 118. Online Co-op — *Socket.IO / PeerJS*
2926. **Bomb Defusal Duo** `[2D]` — one reads manual, one cuts. *Build:* DOM bomb modules, generated manual page, PeerJS voice.
2927. **Spaceship Repair Crew** `[3D]` — fix systems together. *Build:* Three.js ship interior, Socket.IO sync, failing system timers.
2928. **Two-Key Vault** `[2D]` — coordinate simultaneous unlocks. *Build:* DOM panels, server checks timestamp within 200ms window.
2929. **Shared Puzzle Box** `[3D]` — each sees half the clues. *Build:* Three.js puzzle box, per-player hidden faces, Socket.IO state.
2930. **Co-op Kitchen Rush** `[2D]` — split cooking stations. *Build:* Phaser 3 kitchen, authoritative server orders, item handoff counters.
2931. **Raft Survival** `[3D]` — keep raft afloat together. *Build:* Three.js ocean, buoyancy on planks, repair and fishing roles.
2932. **Dungeon Duo** `[2D]` — tank and healer roles. *Build:* Phaser 3 top-down, aggro system, Socket.IO state sync.
2933. **Rescue Helicopter** `[3D]` — pilot and winch operator. *Build:* Three.js heli physics, second player rope winch, PeerJS.
2934. **Train Track Layers** `[3D]` — lay tracks before train. *Build:* Three.js voxel grid, shared resource gathering, track adjacency path check, Socket.IO.
2935. **Mirror Maze Pair** `[2D]` — guide each other blind. *Build:* Canvas mazes, each sees other's map, chat or voice.
2936. **Siege Defenders** `[2D]` — hold walls together. *Build:* Phaser 3 wall segments, enemy ladders, cooperative repair.
2937. **Haunted Hotel Co-op** `[3D]` — ghost hunters with tools. *Build:* Three.js corridors, EMF and camera roles, Socket.IO.
2938. **Submarine Crew** `[2D]` — sonar, steering, torpedoes. *Build:* DOM role consoles, server sub physics, sonar pings Canvas.
2939. **Moving Couch** `[3D]` — carry furniture through doors. *Build:* Three.js cannon-es couch, each player holds end.
2940. **Firefighter Squad** `[2D]` — hose and rescue roles. *Build:* Canvas fire spread automaton, water particles, rescue carrying.
2941. **Tandem Bike Race** `[2D]` — synchronize pedaling. *Build:* Canvas bike, alternating key sync bonus, Socket.IO.
2942. **Heist Team** `[2D]` — hacker and thief roles. *Build:* Canvas floorplan, hacker toggles cameras via DOM panel.
2943. **Lighthouse Signals** `[2D]` — relay codes between keepers. *Build:* Canvas light flashes, Morse decoding, ship routing.
2944. **Farm Co-op Seasons** `[2D]` — share harvest chores. *Build:* Phaser 3 tilemap farm, shared inventory, season clock.
2945. **Mech Two Pilots** `[3D]` — legs and arms split. *Build:* Three.js mech, player A moves, player B aims weapons.
2946. **Boss Rush Party** `[2D]` — co-op boss gauntlet. *Build:* Phaser 3 bullet patterns, revive mechanic, 4-player sync.
2947. **Ice Climber Rope** `[2D]` — roped climbing pair. *Build:* Matter.js rope between players, anchors, falling saves.
2948. **Archaeology Dig** `[3D]` — excavate shared site. *Build:* Three.js voxel dirt, brush tools, artifact assembly.
2949. **Zoo Escape** `[2D]` — herd escaped animals together. *Build:* Canvas animal flee AI, players as repulsors, pens.
2950. **Starship Bridge** `[2D]` — captain, engineer, gunner roles. *Build:* DOM role screens, Canvas tactical map, power routing.

## 119. Sensor Games (gyro, mic, geolocation) — *DeviceOrientation / Web Audio / Geolocation API*
2951. **Tilt Marble Labyrinth** `[3D]` — tilt phone to roll marble. *Build:* Three.js board, DeviceOrientation beta/gamma to gravity, cannon-es.
2952. **Shake Snow Globe** `[3D]` — shake to make snowstorms. *Build:* DeviceMotion acceleration, Three.js globe particles settle.
2953. **Blow Out Candles** `[2D]` — mic breath extinguishes flames. *Build:* getUserMedia, low-frequency RMS detection, Canvas flames.
2954. **Scream Rocket** `[2D]` — volume powers thrust. *Build:* AnalyserNode volume, Canvas rocket altitude, obstacles.
2955. **Whistle Pitch Glide** `[2D]` — whistle to steer bird. *Build:* autocorrelation pitch detection, pitch to Y position.
2956. **Compass Treasure** `[2D]` — real heading finds loot. *Build:* deviceorientationabsolute alpha, hot-cold feedback, random bearings.
2957. **GPS Walk Quest** `[2D]` — walk real distances for XP. *Build:* Geolocation watchPosition, haversine distance accumulation, RPG levels.
2958. **Geo Flag Capture** `[2D]` — claim nearby real locations. *Build:* Leaflet map, Geolocation, Supabase location claims.
2959. **Tilt Pour Water** `[2D]` — fill glasses without spilling. *Build:* DeviceOrientation pour angle, Canvas fluid particles.
2960. **Hum Tune Match** `[2D]` — hum to hit pitches. *Build:* pitch detection, target note lines, scoring by cents error.
2961. **Clap Detector Drum** `[2D]` — clap to play beats. *Build:* onset detection via energy spikes, rhythm patterns.
2962. **Step Counter Pet** `[2D]` — walking feeds companion. *Build:* DeviceMotion step peaks, Canvas pet, localStorage.
2963. **Phone Flip Coin** `[3D]` — flip device to toss. *Build:* DeviceMotion rotation rate, Three.js coin animation.
2964. **Level Bubble Balance** `[2D]` — keep bubble centered. *Build:* DeviceOrientation, Canvas spirit level, drifting targets.
2965. **Light Sensor Ghosts** `[2D]` — darkness reveals spirits. *Build:* webcam average brightness as light sensor, Canvas ghosts fade in.
2966. **Gyro Sword Duel** `[3D]` — swing phone like sword. *Build:* DeviceMotion rotation, Three.js blade, PeerJS opponent.
2967. **Noise Meter Library** `[2D]` — stay quiet to sneak. *Build:* mic RMS threshold alerts librarian, Canvas stealth.
2968. **Geocache Riddles** `[2D]` — solve riddles at locations. *Build:* Geolocation radius check, unlocking riddle chain, map.
2969. **Tilt Pinball** `[3D]` — nudge table by tilting. *Build:* Three.js table, cannon-es ball and flippers, DeviceOrientation gravity vector.
2970. **Walking Dog Sim** `[2D]` — real steps walk dog. *Build:* step detection, Canvas dog park scene progression.
2971. **Sun Compass** `[3D]` — face sun to charge. *Build:* SunCalc azimuth, device heading, Three.js solar panel.
2972. **Spin Top Phone** `[3D]` — spin device to win. *Build:* gyroscope rotation rate integration, Three.js top visualization.
2973. **Shake Cocktail Mixer** `[2D]` — shake to mix drinks. *Build:* DeviceMotion shake intensity, Canvas shaker gauge, recipes.
2974. **Map Paint Run** `[2D]` — paint map by walking. *Build:* Leaflet polyline from watchPosition, area fill scoring.
2975. **Voice Volume Lift** `[2D]` — sing loud to lift weights. *Build:* sustained volume above threshold, Canvas weightlifter.

## 120. Microgames & Weird Jam Ideas — *Kaboom.js / Canvas*
2976. **Ten Second Hero** `[2D]` — save world in ten seconds. *Build:* Kaboom.js tiny levels, global 10-second timer, rapid restarts.
2977. **Sentient Toaster** `[2D]` — escape before breakfast. *Build:* Canvas kitchen platformer, toast ejection jumps, heat zones.
2978. **Tax Return Dragon** `[2D]` — file paperwork for dragons. *Build:* DOM forms with absurd rules, gold sums validation.
2979. **Sock Puppet Diplomacy** `[2D]` — negotiate peace with puppets. *Build:* Canvas puppets, dialog choices, mood meters.
2980. **Gravity Is Optional** `[2D]` — physics changes every level. *Build:* Matter.js per-level gravity and friction mutators.
2981. **Backwards Platformer** `[2D]` — level plays in reverse. *Build:* Phaser 3 reversed recording, player undoes events.
2982. **Cursor Shepherd** `[2D]` — herd sheep with mouse. *Build:* Canvas boids fleeing cursor, pen goal.
2983. **Pigeon Accountant** `[2D]` — balance birdseed books. *Build:* DOM ledger, arithmetic puzzles, pigeon interruptions.
2984. **Upside Down Office** `[3D]` — work while ceiling walking. *Build:* Three.js inverted office, first-person, task objects.
2985. **Haunted Spreadsheet** `[2D]` — cells hide ghostly secrets. *Build:* DOM table grid, formula parser, ghost cell events.
2986. **Unplug Everything** `[2D]` — find sockets before blackout. *Build:* Canvas cluttered room, cable path tracing, timer.
2987. **Microwave Countdown** `[2D]` — reheat items perfectly. *Build:* DOM keypad, item heat curves, temperature scoring.
2988. **Nap Simulator** `[2D]` — avoid alarm clock attacks. *Build:* Canvas bed, snooze reflexes, dream meter.
2989. **Tiny Volcano Chef** `[3D]` — cook with lava. *Build:* Three.js miniature volcano, timing skewers over lava.
2990. **Snail Speedrun** `[3D]` — slowest race ever. *Build:* Three.js garden obstacle course, slime trail decal, leaf boosts, chase camera.
2991. **Inverse Snake** `[2D]` — grow smaller by eating. *Build:* Canvas snake array shrinks on eat, start huge.
2992. **Fly Swatter Frenzy** `[2D]` — swat buzzing pests. *Build:* Canvas erratic noise flight paths, swat area hit test.
2993. **Lost Remote Hunt** `[3D]` — search couch cushions. *Build:* Three.js couch, lift cushions via raycast, hidden objects.
2994. **Bubble Wrap Rampage** `[2D]` — pop every bubble fast. *Build:* DOM grid of buttons, pop sounds, speed timer.
2995. **Sneeze Holder** `[2D]` — suppress sneezes in meetings. *Build:* Canvas pressure meter, hold key, QTE timing.
2996. **Elevator Small Talk** `[2D]` — pick awkward conversation lines. *Build:* DOM dialog choices, awkwardness meter, floor countdown.
2997. **Rubber Duck Debug** `[2D]` — explain bugs to duck. *Build:* DOM text input, keyword detection, duck reactions.
2998. **Cactus Hugger** `[2D]` — find safe hug spots. *Build:* Canvas cactus spine map, click hug spots, pain meter.
2999. **Moon Landlord** `[3D]` — rent craters to aliens. *Build:* Three.js moon sphere, crater picking, tenant management.
3000. **Last Pixel Standing** `[2D]` — defend final screen pixel. *Build:* Canvas single pixel center, enemies converge, click shots.
