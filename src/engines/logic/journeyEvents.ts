// Handwritten random events for the Oregon-Trail-like journey engine.
// Delta keys: f food, w water/fuel, $ money, m morale, h health (whole party), hit (damage to {M}), sick ({M} falls ill),
// day (days lost), dist (progress change), med (medicine found).

export interface D { f?: number; w?: number; $?: number; m?: number; h?: number; hit?: number; sick?: boolean; day?: number; dist?: number; med?: number }
export type Out = [weight: number, msg: string, d: D]
export interface Ch { label: string; need?: number; outs: Out[] }
export interface Ev { id: string; text: string; ch: Ch[] }

const ev = (id: string, text: string, ...ch: Ch[]): Ev => ({ id, text, ch })
const ch = (label: string, outs: Out[], need = 0): Ch => ({ label, outs, need })

export const UNIVERSAL: Ev[] = [
  ev('u-sick', '{M} wakes up green and mumbling about soup. It might be the water. It might be the soup.',
    ch('Rest a day', [[1, '{M} sleeps it off. You lose a day, gain a very grateful friend.', { day: 1, h: 4 }]]),
    ch('Press on', [[0.5, '{M} grits their teeth and walks on.', { m: -4 }], [0.5, '{M} gets worse.', { sick: true }]])),
  ev('u-spoil', 'A barrel of {F} smells... ambitious.',
    ch('Throw it out', [[1, 'Out it goes. Seagulls (or equivalents) rejoice.', { f: -12 }]]),
    ch('Eat it anyway', [[0.5, 'Iron stomachs! Nothing happens.', {}], [0.5, 'Everyone regrets it.', { h: -8, m: -5 }]])),
  ev('u-stash', 'You find an abandoned camp with a stash and a note: "Take what you need, leave a joke."',
    ch('Take everything', [[1, 'Supplies! The ink on the note is still wet.', { f: 18, w: 10, m: 3 }]]),
    ch('Take a little, leave a joke', [[1, 'Honour kept. Karma and morale go up.', { f: 8, m: 8 }]])),
  ev('u-trade', 'A stranger offers 30 {F} for 20 {$}. His eyebrow twitches.',
    ch('Deal', [[0.7, 'A fair trade. Food is food.', { f: 30, $: -20 }], [0.3, 'Half the food is sawdust.', { f: 12, $: -20, m: -3 }]], 20),
    ch('Decline', [[1, 'He shrugs and sells to the next group.', {}]])),
  ev('u-lost', '{M} lost the bag with the spare... something. Nobody knows what. Everybody is sure it was important.',
    ch('Search for it', [[0.5, 'Found it! It was a sock.', { day: 1, m: 3 }], [0.5, 'Gone. Time wasted.', { day: 1, $: -8 }]]),
    ch('Move on', [[1, 'Whatever it was, you will find out later.', { m: -3 }]])),
  ev('u-quarrel', '{M} and {M2} are arguing about who snores more. The {V} is too small for this.',
    ch('Mediate', [[0.6, 'Peace by compromise: earplugs.', { m: 4 }], [0.4, 'You become the villain of both stories.', { m: -6 }]]),
    ch('Let them fight', [[1, 'They stop when they run out of breath.', { m: -3 }]])),
  ev('u-music', 'Someone found an instrument and a surprising amount of talent. The evening is melodic.',
    ch('Sing along', [[1, 'Morale soars. So does the volume.', { m: 12 }]]),
    ch('Early night', [[1, 'Everyone sleeps. Health improves.', { h: 3 }]])),
  ev('u-rumor', 'A traveller says there is a shortcut ahead. He also says he is an honest man. Twice.',
    ch('Take it', [[0.5, 'A real shortcut! Time saved.', { dist: 18 }], [0.5, 'A long, scenic detour.', { dist: -10, m: -4, f: -6 }]]),
    ch('Stay on the road', [[1, 'Boring, safe, slow.', {}]])),
  ev('u-thief', 'In the night, something rummages through the stores. It has hands.',
    ch('Chase it', [[0.5, 'Caught! A raccoon. A confident raccoon.', { m: 3 }], [0.5, 'It escapes with dinner.', { f: -10 }]]),
    ch('Sleep through it', [[1, 'You wake up lighter.', { f: -15, $: -5 }]])),
  ev('u-part', 'Part of the {V} breaks with a noise like a sad whale.',
    ch('Repair it properly', [[1, 'Fixed! Good as new, mostly.', { $: -15 }]], 15),
    ch('Patch with rope', [[0.5, 'The patch holds. Rope: the hero.', { day: 1 }], [0.5, 'It snaps again.', { day: 2, hit: 8 }]])),
  ev('u-doc', 'A passing doctor offers a check-up. She has a pleasant bag of tools.',
    ch('Accept', [[1, 'Everyone feels better.', { h: 10, m: 3 }]]),
    ch('Politely decline', [[1, 'She frowns, then leaves a bandage and a tonic.', { med: 1 }]])),
  ev('u-gift', 'A child waves and hands you a basket. The child is gone. The basket is full of bread.',
    ch('Eat it', [[0.8, 'Delicious. Possibly magical.', { f: 14, m: 6 }], [0.2, 'Delicious. Mildly cursed.', { f: 14, m: -8 }]]),
    ch('Leave it', [[1, 'You feel noble. And hungry.', { m: 2 }]])),
  ev('u-pouch', '{M} trips over a pouch of coins. Gravity: 1. {M}: 0.',
    ch('Keep it', [[1, 'A pouch of {$}. A bruised knee.', { $: 25, hit: 4 }]]),
    ch('Look for the owner', [[0.6, 'You find them. A reward and warm hearts!', { $: 12, m: 8 }], [0.4, 'Nobody. You split hairs, then coins.', { $: 15, m: 2 }]])),
  ev('u-fest', 'A roadside festival! Free pie contest. Entry fee: dignity.',
    ch('Enter', [[0.5, '{M} wins! A pie, a ribbon, a legend.', { f: 10, m: 12 }], [0.5, 'Too much pie. Dignity: gone.', { m: 5, day: 1 }]]),
    ch('Skip it', [[1, 'Probably wise.', {}]])),
]

export const LAND: Ev[] = [
  ev('l-river', 'A river blocks the way: wide, brown and undecided. Ford it?',
    ch('Ford it', [[0.55, 'Splash! Across, with soggy boots.', {}], [0.45, 'The current grabs some supplies.', { f: -14, hit: 10 }]]),
    ch('Caulk and float', [[0.9, 'A smooth crossing!', { $: -10 }], [0.1, 'A small leak.', { $: -10, f: -6 }]], 10),
    ch('Wait for low water', [[1, 'Two days of waiting. The river is unimpressed.', { day: 2 }]])),
  ev('l-storm', 'Dark clouds gather. The wind has opinions.',
    ch('Shelter', [[1, 'You wait it out. Boring, wet, safe.', { day: 1, m: -2 }]]),
    ch('Push through', [[0.5, 'Made it! Lucky.', { m: 4 }], [0.5, 'A brutal slog.', { h: -10, f: -6 }]])),
  ev('l-raiders', 'Raiders block the road, politely holding signs that say TOLL.',
    ch('Pay up', [[1, 'They tip their hats and move aside.', { $: -25 }]], 25),
    ch('Bluff', [[0.4, 'They believe the bluff. Remarkable.', { m: 8 }], [0.6, 'They do not. Pockets are emptied.', { $: -20, f: -10, hit: 8 }]]),
    ch('Fight', [[0.5, 'You win! Barely, loudly.', { hit: 10, m: 5 }], [0.5, 'You lose and are very sorry.', { hit: 18, f: -14, $: -15 }]])),
  ev('l-animal', 'A large, hungry animal watches the camp. It has a good memory for snacks.',
    ch('Scare it', [[0.6, 'It leaves, offended.', {}], [0.4, 'It does not.', { hit: 12, f: -8 }]]),
    ch('Hunt it', [[0.5, 'Dinner is served! Heavily seasoned.', { f: 22, day: 1 }], [0.5, 'It hunts you back.', { hit: 14 }]])),
  ev('l-hill', 'A steep hill. The {V} groans. So does everyone else.',
    ch('Unload and push', [[1, 'Everyone sweats. The hill loses.', { h: -6, day: 1, m: -2 }]]),
    ch('Take the long way', [[1, 'Longer, gentler, hungrier.', { day: 2, f: -4 }]])),
  ev('l-toll', 'A bridge. A toll booth. A toll collector who looks like he has opinions.',
    ch('Pay the toll', [[1, 'The bridge is sturdy. The collector smug.', { $: -12 }]], 12),
    ch('Find another crossing', [[0.5, 'A ford just downstream!', { day: 1 }], [0.5, 'A long walk, and no ford.', { day: 2, m: -3 }]])),
  ev('l-circle', 'You have been walking in a circle. The same tree has appeared three times, increasingly smug.',
    ch('Ask the tree', [[0.5, 'A surprisingly helpful tree.', { m: 4 }], [0.5, 'It says nothing, as trees do. Time lost.', { day: 1 }]]),
    ch('Check the map', [[1, 'The map was upside down.', { day: 1, m: -2 }]])),
  ev('l-dust', 'A cloud of dust on the horizon. A storm? A friendly horse parade?',
    ch('Hide', [[1, 'A boring dust cloud passes.', { day: 1 }]]),
    ch('Go greet', [[0.5, 'Traders! You swap stories and supplies.', { f: 10, w: 8, m: 5 }], [0.5, 'Not horses. Not friendly.', { $: -15, hit: 6 }]])),
]

export const TRAIL: Ev[] = [
  ev('t-fire', 'Smoke on the horizon, orange glow beneath it.',
    ch('Backburn a firebreak', [[0.6, 'Brave and clever! The fire passes.', { f: -4, m: 5 }], [0.4, 'The wind shifts. Singed.', { hit: 12, f: -10 }]]),
    ch('Run!', [[0.6, 'You outrun it.', { h: -4 }], [0.4, 'Not quite.', { hit: 15, f: -12 }]])),
  ev('t-wagon', 'A trader\'s {V} painted like a carousel offers "wonders".',
    ch('Buy medicine', [[1, 'Two doses of "Cure-All". Probably medicine.', { $: -20, med: 2 }]], 20),
    ch('Haggle', [[0.5, 'A discount and a free lemon!', { $: -10, med: 1, m: 3 }], [0.5, 'He glares. Prices double.', {}]]),
    ch('Move on', [[1, 'The carousel fades into the dust.', {}]])),
  ev('t-wolves', 'Wolves circle the camp at night. They look polite but hungry.',
    ch('Keep the fire high', [[0.7, 'They lose interest.', {}], [0.3, 'One boldly steals a ham.', { f: -8 }]]),
    ch('Throw them food', [[1, 'Peace costs 8 {F}. Cheap, really.', { f: -8, m: 2 }]])),
  ev('t-ferry', 'The ferryman rows slowly, thoughtfully and for a fee.',
    ch('Pay the fee', [[1, 'A smooth crossing. His stories were not.', { $: -15, m: -1 }]], 15),
    ch('Offer food instead', [[1, 'He accepts 10 {F} and a wink.', { f: -10 }]])),
  ev('t-bridge', 'A covered bridge. Inside, someone has carved "turn back". Someone else added "no".',
    ch('Cross', [[0.8, 'Creaky but safe.', {}], [0.2, 'A plank gives way.', { hit: 8, f: -5 }]]),
    ch('Detour', [[1, 'A detour. A long one.', { day: 1 }]])),
]

export const DESERT: Ev[] = [
  ev('d-sand', 'A wall of sand rolls in. It looks personal.',
    ch('Hunker down', [[1, 'Sand in everything. Everything.', { day: 1, w: -4, m: -4 }]]),
    ch('Push through', [[0.4, 'Somehow you pass through! Wow.', { m: 6 }], [0.6, 'You lose supplies to the sand.', { f: -12, w: -10, hit: 10 }]])),
  ev('d-mirage', '{M} sees a glittering lake ahead. {M2} says it is a mirage. {M} licks their lips.',
    ch('Go check', [[0.3, 'A real oasis!', { w: 30, m: 10 }], [0.7, 'A mirage. A lot of walking.', { w: -8, day: 1, m: -6 }]]),
    ch('Ignore it', [[1, 'You keep going. {M} sulks.', { m: -3 }]])),
  ev('d-camel', 'The camel has decided to lie down. It is a statement.',
    ch('Bribe with dates', [[1, 'The camel rises, regal and content.', { $: -8 }]], 8),
    ch('Persuade it', [[0.5, 'It stands! Nobody knows why.', {}], [0.5, 'It spits. Accurately.', { m: -5, day: 1 }]])),
  ev('d-nomads', 'Nomads invite you for tea. Tea takes three hours. They insist.',
    ch('Accept', [[1, 'You learn a route AND drink excellent tea.', { w: 10, m: 8, day: 1, dist: 8 }]]),
    ch('Politely refuse', [[0.7, 'They understand. Mostly.', {}], [0.3, 'They charge a "sorry fee".', { $: -10 }]])),
  ev('d-scorpion', 'Something skittered into {M}\'s boot. It has a tail. It has plans.',
    ch('Shake it out', [[0.6, 'Out it goes, offended.', {}], [0.4, 'Sting!', { hit: 12, sick: true }]]),
    ch('Burn the boot', [[1, 'A single warm boot. A noble sacrifice.', { m: -3, $: -4 }]])),
  ev('d-heat', 'A heat wave. Even the shadows look for shade.',
    ch('Travel at night', [[1, 'Cool, starry, a little sleepy.', { day: 1, w: -3, h: 2 }]]),
    ch('Push on', [[0.5, 'Sweaty triumph.', { w: -10, h: -6 }], [0.5, '{M} faints.', { hit: 14, w: -10 }]])),
  ev('d-ruins', 'Ancient ruins, half buried. There is a door. It is open. Suspicious.',
    ch('Explore', [[0.5, 'A hidden cistern and trinkets!', { w: 20, $: 15 }], [0.5, 'A trap! Sand floods in.', { hit: 12, m: -4 }]]),
    ch('Camp outside', [[1, 'A quiet night under old stars.', { m: 4 }]])),
  ev('d-guide', 'A dune guide offers to lead you for 30 {$}. He seems calm and bored.',
    ch('Hire him', [[1, 'He shortens the journey and soothes tempers.', { $: -30, dist: 22, m: 5 }]], 30),
    ch('Refuse', [[1, 'You walk on in dunes of your own.', {}]])),
]

export const SEA: Ev[] = [
  ev('p-storm', 'A storm at sea! The sails scream. The captain (you) tries not to.',
    ch('Reef the sails', [[0.7, 'Held! Soaked but alive.', { day: 1, h: -4 }], [0.3, 'A mast cracks.', { hit: 10, $: -10 }]]),
    ch('Run before it', [[0.5, 'Faster than expected!', { dist: 12, h: -6 }], [0.5, 'Off course and wet.', { dist: -8, f: -8 }]])),
  ev('p-kraken', 'Something large rises. It has more arms than manners.',
    ch('Fire the cannons', [[0.5, 'It sinks, offended.', { m: 8 }], [0.5, 'It grabs the rigging.', { hit: 16, f: -10 }]]),
    ch('Offer a barrel of {F}', [[1, 'The kraken accepts. Burps.', { f: -14 }]]),
    ch('Sail away', [[0.6, 'Faster than a kraken. Barely.', { m: -3 }], [0.4, 'It follows. Politely.', { hit: 10, day: 1 }]])),
  ev('p-navy', 'A navy ship hoists a flag that says HALT. And also PLEASE.',
    ch('Bribe them', [[1, 'They look away. For a while.', { $: -30 }]], 30),
    ch('Outrun them', [[0.5, 'Your sails are better than their manners.', { m: 6 }], [0.5, 'A warning shot hits the stores.', { f: -12, $: -10 }]]),
    ch('Show forged papers', [[0.5, 'They squint, then salute.', {}], [0.5, 'They do not.', { $: -25, m: -6 }]])),
  ev('p-scurvy', '{M} reports bleeding gums and a deep longing for fruit.',
    ch('Oranges at the next port', [[1, 'They hold on. Barely.', { sick: true, m: -3 }]]),
    ch('Fish soup', [[0.5, 'A miracle recipe!', { h: 6 }], [0.5, 'It tastes of sorrow.', { m: -4 }]])),
  ev('p-calm', 'No wind. None. The sea is a mirror that mocks you.',
    ch('Row', [[1, 'Everyone rows. Everyone sings. Slowly.', { h: -8, dist: 6, m: 2 }]]),
    ch('Wait', [[1, 'Two days of doing nothing, well.', { day: 2, m: -3 }]])),
  ev('p-merchant', 'A merchant ship drifts alongside. Cargo: tempting. Crew: asleep.',
    ch('Board and loot', [[0.5, 'Treasure and snacks!', { $: 40, f: 16, m: 8 }], [0.5, 'They were awake.', { hit: 14, m: -5 }]]),
    ch('Trade fairly', [[1, 'A fair deal. Everyone is confused.', { f: 10, $: -8 }]], 8),
    ch('Wave', [[1, 'Wave returned. Awkward.', {}]])),
  ev('p-mutiny', 'You hear whispering below. Someone says "mutiny", then "maybe", then "snack?"',
    ch('Hold a feast', [[0.7, 'Full bellies, no mutiny.', { f: -12, m: 14 }], [0.3, 'They eat and still grumble.', { f: -12, m: 4 }]]),
    ch('Show force', [[0.5, 'The whispers stop.', { m: -6 }], [0.5, 'The whispers get louder.', { m: -14 }]])),
  ev('p-bottle', 'A bottle bobs by with a note: "X marks treasure. Also, bring snacks."',
    ch('Follow it', [[0.4, 'Treasure! The snacks helped.', { $: 35, m: 8 }], [0.6, 'A cove full of crabs and regret.', { day: 1, m: -4 }]]),
    ch('Ignore it', [[1, 'The bottle floats off. So does the story.', {}]])),
  ev('p-whirl', 'A whirlpool! A mid-sized and enthusiastic one.',
    ch('Row hard', [[0.6, 'Out! Arms: jelly.', { h: -6 }], [0.4, 'It spits you out later.', { hit: 10, day: 1 }]]),
    ch('Steer around', [[1, 'Long way, safe way.', { day: 1 }]])),
]

export const SPACE: Ev[] = [
  ev('s-meteor', 'A meteor shower! Pretty, and aggressive.',
    ch('Raise the shields', [[1, 'A light show only. Fuel drained.', { w: -10 }]]),
    ch('Dodge manually', [[0.5, 'Ace pilot! The crew cheers.', { m: 8 }], [0.5, 'A rock kisses the hull.', { hit: 12, w: -6 }]])),
  ev('s-flare', 'A solar flare! The instruments scream in unison.',
    ch('Shelter in the core', [[1, 'Cosy, if dull.', { day: 1, m: -3 }]]),
    ch('Power through', [[0.5, 'A cosmic tan. No problem.', {}], [0.5, 'Systems fry.', { $: -15, hit: 8 }]])),
  ev('s-signal', 'A signal arrives: three dots, a pause, "sorry we are closed".',
    ch('Respond', [[0.5, 'A friendly alien trader replies!', { w: 14, f: 10, m: 8 }], [0.5, 'Never reply to "closed". They send a bill.', { $: -20 }]]),
    ch('Ignore it', [[1, 'Silence. Space is rude.', {}]])),
  ev('s-leak', 'A slow leak in the airlock. It whistles a tune. A sad tune.',
    ch('Patch it', [[1, 'Patched! The tune is gone.', { $: -15 }]], 15),
    ch('Use duct tape', [[0.6, 'Duct tape: eternal hero.', {}], [0.4, 'It whistles louder. Air lost.', { hit: 8, f: -6 }]])),
  ev('s-drive', 'The drive coughs. Then coughs again. Then forgets to cough.',
    ch('Full diagnostic', [[1, 'Four hours of blinking lights. A loose bolt.', { day: 1, m: -2 }]]),
    ch('Hit it', [[0.5, 'It works! Of course it does.', { m: 4 }], [0.5, 'A very large bang. Small damage.', { w: -12, hit: 8 }]])),
  ev('s-derelict', 'A derelict ship drifts, lights blinking. The door says "please enter".',
    ch('Explore', [[0.5, 'Loot! And a very friendly cat.', { f: 14, w: 14, $: 25, m: 6 }], [0.5, 'It was not empty.', { hit: 16, m: -6 }]]),
    ch('Scan only', [[1, 'The scan shows valuables. Too risky.', { m: -2 }]])),
  ev('s-pirates', 'Space pirates demand tribute. Their ship has a skull. The skull has googly eyes.',
    ch('Pay the tribute', [[1, 'They salute with a laser.', { $: -30 }]], 30),
    ch('Bluff', [[0.4, 'They believe the bluff.', { m: 8 }], [0.6, 'They do not.', { f: -14, w: -10, hit: 8 }]])),
  ev('s-comet', 'A comet passes close, trailing a tail of ice.',
    ch('Harvest it', [[0.7, 'Fresh fuel and water!', { w: 22, day: 1 }], [0.3, 'You get stuck in the ice. Delay.', { day: 2, hit: 6 }]]),
    ch('Let it pass', [[1, 'A beautiful snowflake in the dark.', { m: 4 }]])),
  ev('s-ai', 'The ship AI refuses to open the pod bay doors. It is making a joke. It is not funny.',
    ch('Reboot it', [[0.6, '"Sorry," it says. It hesitates.', { day: 1 }], [0.4, 'It reboots with a worse personality.', { m: -6 }]]),
    ch('Negotiate', [[0.5, 'A truce: more snacks, fewer jokes.', { f: -6, m: 6 }], [0.5, 'It plays elevator music for days.', { m: -8 }]])),
]

export const WASTE: Ev[] = [
  ev('w-rad', 'A glowing green cloud rolls in. It has the audacity to look pretty.',
    ch('Hole up', [[1, 'You wait it out, listening to radio static.', { day: 1, m: -3 }]]),
    ch('Drive through', [[0.5, 'Somehow fine. Hair: glowing.', {}], [0.5, 'Everyone feels warm. Bad warm.', { h: -12, sick: true }]])),
  ev('w-bikers', 'Raiders on motorbikes, in spiked everything.',
    ch('Pay them', [[1, 'They take it and ride away.', { $: -25 }]], 25),
    ch('Fight', [[0.5, 'The convoy wins, loudly.', { hit: 10, m: 6, $: 15 }], [0.5, 'The convoy loses, less loudly.', { hit: 16, f: -14, w: -8 }]])),
  ev('w-dogs', 'A pack of mutant dogs with too many teeth and a lot of loyalty.',
    ch('Feed them', [[0.6, 'New friends! They guard your camp.', { f: -8, m: 8 }], [0.4, 'They want more. Always more.', { f: -16 }]]),
    ch('Scare them', [[0.5, 'They flee.', {}], [0.5, 'They do not.', { hit: 12 }]])),
  ev('w-rain', 'Rain falls in a worrying shade of orange.',
    ch('Cover everything', [[1, 'A damp, patient night.', { day: 1, f: -4 }]]),
    ch('Drive on', [[0.5, 'The paint peels. Spirits hold.', { m: -3 }], [0.5, 'Skin itches. A lot.', { h: -8 }]])),
  ev('w-shop', 'A ruined shop with a surprising amount of intact snack aisle.',
    ch('Loot it', [[0.6, 'Snacks! Expired in a charming way.', { f: 22, m: 6 }], [0.4, 'A trap left by the former owner.', { hit: 12 }]]),
    ch('Leave it', [[1, 'Safe. Hungry. Respected.', {}]])),
  ev('w-radio', 'A radio crackles: "Free supplies at coordinates... somewhere." Then it plays a polka.',
    ch('Follow the signal', [[0.5, 'A depot! Mostly intact.', { f: 14, w: 14, $: 12 }], [0.5, 'A trap, with a polka.', { hit: 10, f: -6 }]]),
    ch('Ignore it', [[1, 'The polka haunts you for days.', { m: -2 }]])),
  ev('w-bridge', 'The old bridge has fallen into a ravine. The ravine looks smug.',
    ch('Build a ramp', [[0.6, 'Engineering! The convoy jumps!', { day: 1, m: 6 }], [0.4, 'The ramp was a bad idea.', { hit: 12, $: -10, day: 1 }]]),
    ch('Detour', [[1, 'A day around. Dusty, safe.', { day: 1, w: -4 }]])),
  ev('w-scav', 'Scavengers want to swap. They have parts. You have questions.',
    ch('Trade for parts', [[1, 'Fuel, parts and a questionable hat.', { $: -15, w: 14, m: 2 }]], 15),
    ch('Pass', [[1, 'They shrug and keep their questions.', {}]])),
  ev('w-devil', 'Dust devils dance across the road in a mocking rhythm.',
    ch('Wait', [[1, 'They dance elsewhere.', { day: 1 }]]),
    ch('Race them', [[0.5, 'Victory dust!', { m: 6 }], [0.5, 'You hit a dust devil. It won.', { hit: 8, w: -6 }]])),
]

export type Kind = 'trail' | 'desert' | 'sea' | 'space' | 'waste'
export interface JFlavor {
  kind: Kind
  V: string
  vEmoji: string
  F: string
  W: string
  $: string
  wIcon: string
  fIcon: string
  disease: string
  from: string
  to: string
  towns: string[]
  names: string[]
  events: Ev[]
  intro: string
}

const NAMES = ['Ada', 'Ben', 'Cora', 'Dev', 'Elio', 'Faye', 'Gus', 'Hana', 'Ivo', 'Jun', 'Kit', 'Lena', 'Milo', 'Nia', 'Oz', 'Pia']

export const JFLAVORS: Record<Kind, JFlavor> = {
  trail: { kind: 'trail', V: 'wagon', vEmoji: '🛻', F: 'food', W: 'water', $: 'coins', wIcon: '💧', fIcon: '🍖', disease: 'trail fever', from: 'Home', to: 'the Promised Valley', towns: ['Dusty Fork', 'Pine Rest', 'Muddy Ford', 'Cedar Post', 'Rattle Creek', 'Windy Gap', 'Bison Bend', 'Copper Mill', 'Last Chance', 'Maple Hollow', 'Fort Hope', 'Quiet Meadow'], names: NAMES, events: [...UNIVERSAL, ...LAND, ...TRAIL], intro: 'Cross the land in your wagon.' },
  desert: { kind: 'desert', V: 'caravan', vEmoji: '🐪', F: 'food', W: 'water', $: 'silver', wIcon: '💧', fIcon: '🍞', disease: 'sun fever', from: 'Salt Road', to: 'the Golden City', towns: ['Salt Well', 'Dune Gate', 'Amber Oasis', 'Sand Bazaar', 'Red Mesa', 'Palm Rest', 'Mirage Camp', 'Cobalt Wells', 'Jackal Post', 'Silk Crossing', 'Sunset Souk', 'Star Cistern'], names: NAMES, events: [...UNIVERSAL, ...LAND, ...DESERT], intro: 'Lead the caravan across the dunes.' },
  sea: { kind: 'sea', V: 'ship', vEmoji: '⛵', F: 'biscuits', W: 'fresh water', $: 'doubloons', wIcon: '💧', fIcon: '🍪', disease: 'scurvy', from: 'Port Haven', to: 'Treasure Isle', towns: ['Barnacle Bay', 'Coral Cove', 'Rum Harbor', 'Tortuga Rest', 'Gull Point', 'Shipwreck Isle', 'Lantern Port', 'Storm Quay', 'Kraken Reach', 'Pearl Dock', 'Cutlass Cay', 'Siren Rock'], names: ['Barnaby', 'Salty Sue', 'One-Eye Joe', 'Mabel', 'Pegleg Pete', 'Anne', 'Bosun Bill', 'Coral', 'Finn', 'Mad Mags', 'Squid', 'Rosie', 'Jack', 'Tilly', 'Ned', 'Calico'], events: [...UNIVERSAL, ...SEA], intro: 'Sail your crew across the seas.' },
  space: { kind: 'space', V: 'starship', vEmoji: '🚀', F: 'rations', W: 'fuel', $: 'credits', wIcon: '⛽', fIcon: '🥫', disease: 'void sickness', from: 'Earth Dock', to: 'the Far Colony', towns: ['Luna Port', 'Ceres Station', 'Titan Dock', 'Ganymede Hub', 'Callisto Rest', 'Europa Ice', 'Vesta Yard', 'Triton Gate', 'Pluto Post', 'Kuiper Camp', 'Oort Relay', 'Alpha Gate'], names: ['Nova', 'Kai', 'Lyra', 'Orion', 'Vega', 'Zed', 'Astra', 'Rex', 'Juno', 'Cass', 'Echo', 'Sol', 'Tara', 'Quin', 'Io', 'Pax'], events: [...UNIVERSAL, ...SPACE], intro: 'Pilot the starship to the far colony.' },
  waste: { kind: 'waste', V: 'convoy', vEmoji: '🚙', F: 'cans', W: 'fuel', $: 'caps', wIcon: '⛽', fIcon: '🥫', disease: 'rad sickness', from: 'Vault Nine', to: 'the Green Haven', towns: ['Rust Hollow', 'Scrap Town', 'Glow Ridge', 'Dust Junction', 'Neon Ruins', 'Mutant Mill', 'Bolt City', 'Static Ridge', 'Ash Crossing', 'Camp Salvage', 'Iron Gulch', 'Green Edge'], names: ['Rook', 'Sparks', 'Mags', 'Dutch', 'Rusty', 'Nix', 'Gizmo', 'Vera', 'Bolt', 'Ash', 'Tank', 'Flint', 'Zip', 'Moss', 'Cinder', 'Dot'], events: [...UNIVERSAL, ...LAND, ...WASTE], intro: 'Drive the convoy to safety.' },
}

export function pickKind(text: string, themeId: string): Kind {
  const s = text.toLowerCase()
  if (/space|starship|orbit|comet|colony|mars|solar|probe|voyager|generation ship|exoplanet|derelict/.test(s)) return 'space'
  if (/convoy|wasteland|bunker|ash |rad |geiger|apocalyp/.test(s)) return 'waste'
  if (/caravan|desert|salt road|dune|oasis|bazaar|spice|camel/.test(s)) return 'desert'
  if (/pirate|sail|ship|harbor|barge|tide|regatta|kraken|voyage|bottle|fleet/.test(s)) return 'sea'
  if (themeId === 'space') return 'space'
  if (themeId === 'pirate' || themeId === 'ocean') return 'sea'
  if (themeId === 'wasteland') return 'waste'
  return 'trail'
}

export const ALL_EVENTS = [...UNIVERSAL, ...LAND, ...TRAIL, ...DESERT, ...SEA, ...SPACE, ...WASTE]
