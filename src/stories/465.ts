import type { Story } from './types'

const story: Story = {
  id: 465,
  title: 'Lighthouse Keeper',
  blurb:
    'Tam Aldous keeps the light on Gannet Skerry, a rock three miles from anyone. Tonight the glass is falling, a ship is firing rockets in the fog, and something out there is singing in a voice he has not heard for twenty years.',
  items: {
    key: '🗝️ Oil-store key',
    lantern: '🏮 Storm lantern',
    rope: '🪢 Boathouse rope',
    flares: '🎆 Flares',
    logbook: '📓 The old logbook',
    locket: '💛 Elin\'s locket',
    letter: '✉️ Unsent letter',
    _oil: 'carried oil',
    _boat: 'visited boathouse',
    _read: 'read log',
    _radio: 'tried radio',
    _pip: 'met Pip',
    _lowlamp: 'lit low lamp',
    _knows: 'knows the truth',
    _birds: 'sheltered petrels',
    _bell: 'rang bell',
  },
  stats: {
    oil: { label: 'Lamp oil', emoji: '🛢️', start: 5, min: 0, max: 10, onMin: 'end_dark' },
    strength: { label: 'Strength', emoji: '💪', start: 7, min: 0, max: 10, onMin: 'end_collapse' },
    peace: { label: 'Peace', emoji: '🕊️', start: 3, min: 0, max: 10 },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🌅🗼🌊',
      caption: 'Gannet Skerry, dusk',
      text: `The last of the sun lies along the sea like a blade laid down.

You have kept this light for twenty-two years. In that time you have learned the rock the way you once learned a woman's face: where it is hard, where it is soft, where it has a way of going quiet before it says something.

Tonight it is quiet. The gulls have gone in early. The barometer in the passage has fallen two tenths since noon, and the air tastes of pennies.

*Weather coming,* you say to nobody. Nobody has been here to answer for a long time.`,
      choices: [
        { text: 'Climb the tower and light the lamp.', to: 'lamp_room' },
        { text: 'Stand a moment longer on the gallery.', to: 'gallery' },
      ],
    },
    gallery: {
      scene: '🌊🌫️🌅',
      text: `The sea out to the west is the colour of a bruise healing. To the east it has already gone to slate.

A long bank of fog sits on the horizon, white as a sheet drawn up over a sleeper. It is not moving, and fog should move.

You count the seconds between swells, the way she used to. *Eleven,* Elin would say, *that's the long water. Something's coming up the Channel.*

You have not said her name aloud in a month. The wind takes it anyway.`,
      effects: { peace: 1 },
      choices: [{ text: 'Go up and light the lamp.', to: 'lamp_room' }],
    },
    lamp_room: {
      scene: '🔥🔭🗼',
      caption: 'The lamp room',
      text: `A hundred and four steps. Your knees count every one.

At the top, the great lens waits, tall as a man, a beehive of cut glass, ringed in brass. In the last daylight it holds a thousand tiny suns.

You trim the wick. You prime the burner. You strike the match, and the mantle takes with a sound like a held breath let go, and the whole room blooms.

The beam sweeps out across the water, long and white. Out in the dark, somewhere, a man looks up and thinks: *there.*

That is the only prayer you have left. *There.*`,
      effects: { oil: -1 },
      choices: [{ text: 'Go down to supper.', to: 'supper' }],
    },
    supper: {
      scene: '🍲☕🕯️',
      caption: 'The kitchen',
      text: `The kitchen is the warmest room on the rock, which is not to say that it is warm. You make tea strong enough to stand a spoon in. You open a tin of mackerel and do not much want it.

On the dresser stands a photograph of a woman in a pilot's cap, laughing at the camera as if it had told her a joke she did not intend to forgive. Next to it, a small blue-and-gold locket on a chain.

Twenty years ago this night, Elin Aldous took the *Lantern Bride* out of the harbour in the dusk, and never brought her home.

You eat standing up. It is easier.`,
      choices: [
        { text: 'Take the locket from the dresser.', to: 'locket', give: ['locket'] },
        { text: 'Sit a while in the chair by the stove.', to: 'memory' },
        { text: 'Leave it where it is. Go and check the barometer.', to: 'storm_rises' },
      ],
    },
    memory: {
      scene: '🔥🪑💭',
      text: `The chair by the stove has a hollow in it the shape of you. Opposite is another chair, with a dent in its cushion nobody has sat in for twenty years. You have never moved it.

You close your eyes. For a moment it is not tonight but some other night, long ago, with the kettle singing and Elin's boots steaming on the fender.

*What would you do,* she asks, *if you could be anywhere?*

*Here,* you had said. *Obviously.*

*Liar,* she said, delighted, and threw a dishcloth at you. It is still the best thing anyone has ever thrown.

You open your eyes. The stove ticks as it cools. The wind starts up again outside, patient as a creditor.`,
      effects: { peace: 1 },
      choices: [{ text: 'Get up and check the barometer.', to: 'storm_rises' }],
    },
    locket: {
      scene: '💛🕯️📜',
      text: `The locket is lighter than you remember. It always is.

Inside, on one side, there is a curl of her dark hair, and on the other, folded very small, a letter in your own hand. You wrote it the week after. You were going to say *I am sorry.* You never got further than that.

You unfold it, and the paper is soft as a leaf in November. You read the one line again.

You do not read the rest, because there is no rest.

You put the letter in your pocket. It seems right to have it with you tonight.`,
      give: ['letter'],
      effects: { peace: -1 },
      choices: [{ text: 'Go and check the barometer.', to: 'storm_rises' }],
    },
    storm_rises: {
      scene: '⛈️🌊🗼',
      caption: 'The passage, nine o\'clock',
      text: `The glass has dropped again. You tap it, as if that would help.

The wind arrives like an argument, first reasonable, then all at once not. The windows hum. The shutters begin to knock. Spray rattles on the lantern glass above, a handful of gravel thrown at a girl's window.

You put on your oilskins. You tie the sou'wester under your chin. You feel, as you always do at the start of a gale, a small shameful gladness: *now I have something to do.*

From the top of the tower, faintly, comes a sound you know: the lamp, turning.`,
      effects: { oil: -1 },
      choices: [{ text: 'Go up to the gallery to look.', to: 'first_rocket' }],
    },
    first_rocket: {
      scene: '🎆🌫️⛈️',
      text: `The fog has finally moved. It is rolling in along the water like a slow white wave, swallowing the swells one by one.

Then, far out in it, a smear of red climbs the dark, hangs, and breaks into sparks.

A rocket. A second follows. Then a third. Three reds, evenly spaced, the signal of a ship that cannot see her way.

Your mouth is dry. Nobody has sailed the Channel in a night like this in years, not since they put in the new harbour lights at Pell.

*Who the devil are you,* you say, *and what are you doing here?*`,
      choices: [{ text: 'Go down and see what you can do.', to: 'hub' }],
    },
    hub: {
      scene: '🗼🌙⛈️',
      caption: 'The base of the tower',
      text: `The storm builds. Rain comes in sheets. Somewhere beyond the fog a ship is lost.

You have a few hours before the worst, and a short list of things you could do with them.

The oil store is under the stair. The boathouse is down on the landing. The radio is in the kitchen, and the old logbooks are on the shelf above it. And the lamp, always the lamp, needs you.`,
      choices: [
        { text: 'Try the radio.', to: 'radio', if: [{ not: '_radio' }] },
        { text: 'Fetch oil from the store.', to: 'oilstore', if: [{ not: '_oil' }] },
        { text: 'Go down to the boathouse.', to: 'boathouse', if: [{ not: '_boat' }] },
        { text: 'Take down the old logbook.', to: 'logbook', if: [{ not: '_read' }] },
        { text: 'Check on the lamp room. Something is tapping the glass.', to: 'petrels', if: [{ not: '_birds' }] },
        { text: 'Go out and ring the fog bell on the landing.', to: 'fogbell', if: [{ not: '_bell' }] },
        { text: 'Go up and watch through the night.', to: 'midnight' },
      ],
    },
    petrels: {
      scene: '🐦⛈️🔥',
      caption: 'The lamp room',
      text: `Storm petrels have found the lantern glass. Dozens of them, small, dark and fluttering, dashing at the light and falling back, the way moths do at a window.

They are the sea's souls, the old keepers said, the ones who could not rest. Your own grandfather used to take his cap off to them.

You open the little door on the lee side and let a handful in to dry. They sit on the brass rail in a row, wet and affronted, and look at you with black bead eyes.

One of them tilts its head. For a moment you could swear it is listening for something in the fog beyond you. Then it shakes its feathers, and the spell breaks.

You are not so alone, it seems. Not quite.`,
      effects: { peace: 1 },
      give: ['_birds'],
      choices: [{ text: 'Go back down.', to: 'hub' }],
    },
    fogbell: {
      scene: '🔔🌫️🌊',
      caption: 'The landing',
      text: `The fog bell hangs under a little iron roof at the edge of the rock, green with weather. You haul on its rope, and the sound rolls out across the water, flat and large, like a stone dropped into a well.

You ring it for a long time. Once every ten seconds, as the regulations say. It is a lonely duty. It is also, strangely, a companionable one, a way of saying *here, here, here* to anyone who is listening.

The sea answers, in its way. A swell comes up the rock in a long white tongue and licks your boots. A sea-fret curls round your knees.

Somewhere out in the murk, very faint, another bell answers: higher, thinner, and not quite in time.

You stop ringing. The other bell goes on for three strokes more, then falls silent.`,
      give: ['_bell'],
      effects: { strength: -1, peace: 1 },
      choices: [{ text: 'Go back in.', to: 'hub' }],
    },
    radio: {
      scene: '📻⚡🌫️',
      caption: 'The kitchen',
      text: `The set wheezes into life. You turn the dial past a weather report, past the shipping forecast, past a woman singing something in a language you do not know.

*Calling any vessel, calling any vessel, this is Gannet Skerry light. Do you read?*

Static. A long sea of it. Then, small and clear and impossibly near, a voice. Not a ship's voice. A woman's. She is laughing.

*Tam,* she says. *Tam, put your lamp on the left.*

The radio coughs, and dies, and the valves go dark. They do not warm again.`,
      effects: { peace: -1 },
      give: ['_radio'],
      choices: [{ text: 'Sit for a moment with your hands over your face.', to: 'hub', effects: { strength: -1 } }],
    },
    oilstore: {
      scene: '🛢️🗝️🪜',
      caption: 'The oil store',
      text: `The key hangs where it has hung for two decades: on a nail by the door, wrapped in a bit of green wool, so a man can find it by feel.

The store is a damp vault in the base of the tower. The drums are rusted. You sniff them, one after another, tapping with a knuckle. Most ring hollow.

At the back, in the dark, you find one full.

It weighs as much as a small child. The stairs are a hundred and four. You think about your back, and your age, and the sea outside, and then about a ship with its rockets going up, red, red, red.`,
      give: ['key'],
      choices: [
        { text: 'Carry it up in one go.', to: 'oil_carry', effects: { strength: -3, oil: 4 }, give: ['_oil'] },
        { text: 'Decant it into the cans and make three trips.', to: 'oil_carry', effects: { strength: -1, oil: 3 }, give: ['_oil'] },
      ],
    },
    oil_carry: {
      scene: '🪜🔥😮‍💨',
      text: `By the sixtieth step your heart is a fist on a door.

By the eightieth you are speaking aloud, a child's rhyme, to keep your feet going.

At the top you tip the oil into the reservoir, and the lamp drinks it down with a small contented sound, like a cat. You sit on the iron floor with your back to the lens and breathe.

Far below, the sea slams the rock. The tower flexes, as it has flexed for a hundred years. It is a very old, very stubborn thing, and it has never once let you down.`,
      choices: [{ text: 'Go down.', to: 'hub' }],
    },
    boathouse: {
      scene: '🛶🪢🌊',
      caption: 'The boathouse',
      text: `The boathouse is a stone shed cut into the rock at the landing, where the sea comes in through the slip like a tongue. The *Pilchard* is there: a clinker dinghy, nine feet, patched with a hundred winters.

Down here the storm is a different animal, close and bellowing. Waves lift the slip-door in its frame, and put it down again.

On a hook above the oars you find a coil of good manila rope and a tin box. In the box are four flares, damp but dry in the middle, where it counts.

You do not look at the boat for long. You know what it would be, on a night like this.`,
      give: ['rope', 'flares', '_boat'],
      choices: [{ text: 'Go back up to the tower.', to: 'hub' }],
    },
    logbook: {
      scene: '📓🕯️🌫️',
      caption: 'The kitchen',
      text: `The old books live on the shelf above the radio: forty years of Gannet Skerry, in the hands of three keepers. Wind speeds. Ships passing. A gull with a broken wing.

You take the one for the year she was lost. You have not opened it since. You have told yourself it is because you know what it says.

It does not say what you remember.

Under the date, in your own hand, in the cramped capitals of a man taking care: *LAMP LIT 6.14 PM. EXTINGUISHED 1.50 AM. NO SHIPS. NO FAULT.*

You stare at the figures. You did not put the lamp out at 1.50. You were here. You were asleep in the chair.`,
      give: ['logbook', '_read'],
      choices: [
        { text: 'Read the rest of the page.', to: 'logbook_truth' },
        { text: 'Close the book. You cannot do this tonight.', to: 'hub', effects: { peace: -1 } },
      ],
    },
    logbook_truth: {
      scene: '📓💔🌊',
      text: `You read it all. It takes only a minute.

The lamp went out at 1.50 in the morning because the oil ran dry, and it ran dry because you had not filled the reservoir. You had been tired. It was only one night.

On the opposite page, a different pen. Not yours. Rougher, hurried. *We saw no light. Bearing lost. Elin says she will try for Pell on the dead reckoning. God keep her.* Signed by the mate of a fishing boat that came in at dawn.

For twenty years you told yourself it was the weather. It was the weather. It was also you.`,
      give: ['_knows'],
      effects: { peace: -1 },
      choices: [{ text: 'Close the book and go up.', to: 'hub' }],
    },
    midnight: {
      scene: '🌑🔦🌫️',
      caption: 'The gallery, midnight',
      text: `At midnight the fog arrives all the way. It comes up the rock and over it and wraps the tower like a bandage. The beam swings through it and falls apart into white.

You cannot see the sea. You can hear it, and you can hear something else.

It is very faint. At first you take it for the wind in the lightning rod, that thin wail it makes in a southerly. But it has a shape. It has a tune. You know the tune. She used to hum it while she scrubbed pans.

*Come out, Tam,* sings the fog. *Come out and see.*`,
      effects: { oil: -1 },
      choices: [
        { text: 'Answer it. Call out into the dark.', to: 'fog_answer' },
        { text: 'Stuff your ears with oakum and trim the lamp.', to: 'fog_refuse' },
        { text: 'Climb down the outer ladder toward the voice.', to: 'fog_follow', effects: { peace: -1 } },
      ],
    },
    fog_answer: {
      scene: '🌫️👂🌊',
      text: `*Who is there?* you shout. The wind eats half of it.

The singing stops. In the pause the whole sea seems to lean in, listening.

*Tam,* says the voice again, much closer. It is not exactly hers. It is the shape of hers, filled in with something else: the sound of a woman's voice as a bell might remember it. *You are late. You are always late.*

*Elin?*

*Light the lamp on the left,* says the voice. *The low one. We cannot find the way.*

Then there is only the sea.`,
      choices: [{ text: 'Go down. Look for the cause of this.', to: 'pip' }],
    },
    fog_refuse: {
      scene: '🔥🔦🙉',
      text: `You pack your ears and the world goes soft. The lamp's mechanism whirrs in your bones instead. The beam goes round, and round, and round.

For an hour it works. You read the barometer and the thermometer and the wind, and write them in the log, in a hand you almost recognise.

Then the lamp room door opens. There is nobody in it, only a puddle on the iron floor, spreading, and a smell of salt and wet wool. Down the stair, a step. Another. Bare feet, small and quick.

You pull the wool from your ears with a trembling hand.`,
      effects: { strength: -1, peace: 1 },
      choices: [{ text: 'Follow the wet footprints.', to: 'pip' }],
    },
    fog_follow: {
      scene: '🪜🌫️🌊',
      text: `The ladder is slick and the iron burns your hands with cold. The rock opens beneath you, vague with weed.

*That's it,* sings the fog. *Not far now. A little further. See, here is the water, here is the boat, here is the table laid.*

It is warm in the fog. That is the terrible thing. It is warm and soft and smells of her hair.

Your foot finds the edge of the landing, and the water beyond. You hear, from very high up, the lamp turning, tick, tick, tick. A small stubborn sound. A thing that needs you.`,
      choices: [
        { text: 'Step forward into the warmth.', to: 'end_follow' },
        { text: 'Turn. Climb back toward the beating light.', to: 'pip', effects: { strength: -2, peace: 1 } },
      ],
    },
    pip: {
      scene: '👦💧🕯️',
      caption: 'Pip',
      text: `He is sitting on the third step from the bottom, a boy of about twelve, in a pea jacket two sizes too large. Water drips from his hair, from his cuffs, from the end of his nose.

*Evenin',* he says, in a flat Pell accent. *Sorry about the puddle. I can't help it.*

*You're not real,* you say. It sounds feeble.

*Neither's the sea, mostly,* he says. *It just looks that way.* He swings a bare foot. *I'm the cabin boy. Pip. We were meant to dock twenty years ago and I'd very much like to get on with it.*

He looks at you steadily. *You're him. Mr Aldous. She talked about you all the way down the Channel.*`,
      give: ['_pip'],
      choices: [
        { text: 'Ask him about Elin.', to: 'pip_elin' },
        { text: 'Ask him about the ship.', to: 'pip_ship' },
      ],
    },
    pip_elin: {
      scene: '👦💛⚓',
      text: `*She was the best pilot out of Pell,* Pip says, with a boy's fierce pride. *She never let us panic. When the light went out she said, "Never mind, boys, the keeper's had a long day. We'll find our own way." And we did. For a bit.*

He pushes his wet fringe out of his eyes.

*She never blamed you. Not once. She said you were the kind of man who'd have lit the sun if somebody'd asked politely.*

You find you have sat down on the stair without meaning to.`,
      effects: { peace: 2 },
      choices: [{ text: 'Ask about the ship.', to: 'pip_ship' }],
    },
    pip_ship: {
      scene: '🚢🌫️🕯️',
      text: `*She's out there now,* says Pip. *Every night it's like this, the same night, and she comes up the Channel looking for the light. She can't see it, because it wasn't lit. And so she can't dock. And so we go round again.*

*The big lamp isn't right for her. It's the wrong light. She was looking for the little one, the low lamp on the Wether rock, the one your granddad put in for fishermen. It's been dark since before my time.*

He looks up at you.

*Light it, Mr Aldous. Then she can come in. Then we can all go home.*`,
      choices: [{ text: 'Ask what the voice in the fog is.', to: 'pip_fog' }, { text: 'Say you will do it.', to: 'plan' }],
    },
    pip_fog: {
      scene: '🌫️👦😟',
      text: `Pip scuffs his heel on the stair.

*That's the Fog,* he says. *It's not wicked. It's hungry. It likes things that were lost, because they're easy to carry. It's got the sound of every drowned thing on this coast, and it uses them to talk.*

*It found Elin's voice a long time ago.* He lowers his own. *If you go to it, it will keep you. It'll be kind. You won't even know.*

*That's why I came up here,* he adds. *Somebody had to tell you.*`,
      effects: { peace: 1 },
      choices: [{ text: 'Say you will light the low lamp.', to: 'plan' }],
    },
    plan: {
      scene: '🗺️🔦🌊',
      caption: 'The low lamp',
      text: `The Wether rock lies a quarter mile to the north, a black hump at low water, joined to the Skerry by a causeway of rocks that the tide covers twice a day.

Tonight the tide is making. You have perhaps an hour before the causeway drowns.

A lamp stands there, in a small iron hut, a tin lantern on a post. You haven't been to it in ten years. It will need a flame, and shelter, and a miracle in the wind.

*Do it,* Pip says. *Or I can show you another way.*`,
      choices: [
        { text: 'Cross the causeway on foot.', to: 'causeway', if: [{ has: 'rope' }], lockedHint: 'You will want a rope before you go near that water.' },
        { text: 'Row for the Wether in the Pilchard.', to: 'row', if: [{ has: 'rope' }, { stat: 'strength', min: 4 }], lockedHint: 'You would need rope and a good deal more strength.' },
        { text: 'Use the big lamp. Set the lens to reach her.', to: 'lens' },
      ],
    },
    lens: {
      scene: '🔭💡🌊',
      text: `You climb back up, every step a debt. At the top you throw the brass clutch of the clockwork, and the lens, which has not stood still in twenty years, shudders to a halt.

You swing it by hand. The beam lies like a spear across the water, steady, white, pointing at a place that has no harbour in it.

For ten minutes nothing happens. Out in the fog a ship's horn groans and falls silent.

*It's the wrong light,* says Pip, from the top of the stairs. He is dripping onto the iron. *I told you. She'll go straight past.* His face crumples a little. *I'm sorry.*`,
      effects: { strength: -1, oil: -1 },
      choices: [
        { text: 'Try again. Take the lantern and cross to the Wether.', to: 'plan2' },
        { text: 'Wind the clockwork again. Keep the lamp turning.', to: 'wind' },
      ],
    },
    plan2: {
      scene: '🏮🌊🌫️',
      text: `You take the old storm lantern from its hook by the door, the one with the dented hood, and fill it from the reservoir.

*Back in the light,* says Pip, nodding. *Good. You're a stubborn sort.*

You pass the rope across your shoulder and take the stair down at a pace your knees will remember tomorrow, if there is a tomorrow.

At the landing the sea has crept up the steps. Beyond it, in the black, the line of the causeway: a faint pale thread.`,
      give: ['lantern'],
      choices: [{ text: 'Go onto the causeway.', to: 'causeway', if: [{ has: 'rope' }], lockedHint: 'You need the rope from the boathouse to cross.' }],
    },
    wind: {
      scene: '⚙️🔥😮‍💨',
      text: `The clockwork weights hang down the middle of the tower like a plumb line. Every hour, someone must wind them up, a hundred turns of the crank.

You do it, and then do it again, for the sake of doing something. The sweat freezes on your neck.

*It's all right,* says Pip, not unkindly. *It isn't only the light. You've kept the one that's lit, all this while. It's the unlit one she needs.*

You lean on the crank, and look at your own hands, and know what they are going to have to do.`,
      effects: { strength: -2 },
      choices: [{ text: 'Take the lantern and go.', to: 'plan2' }],
    },
    row: {
      scene: '🛶🌊⛈️',
      text: `The *Pilchard* leaves the slip like a fish out of a hand.

The sea is a hill and a valley and a hill. Each oar stroke is an argument you only just win. The lantern in the bow throws a small yellow room around you, and outside it, the whole of the dark.

Halfway across, a swell lifts the boat and sets it down sideways. Water comes in over the rail. You bail with your hat.

Pip is sitting in the stern. He is dry, now, and not wet at all. *Good rowing,* he says. *My dad was a fisherman.*

The Wether rock rises out of the fog like a whale's back.`,
      effects: { strength: -3 },
      give: ['lantern'],
      choices: [{ text: 'Haul the boat onto the rock.', to: 'lowlamp' }],
    },
    causeway: {
      scene: '🪨🌊🏮',
      text: `The causeway is a line of flat rocks, slick with weed, with the sea sucking at both sides.

You tie the rope round your waist and the other end to an iron ring on the landing. Pip walks ahead, light as a gull. The water that wets his boots does not seem to make a sound.

Halfway across a wave breaks over the rocks and knocks you to your knees. The rope snaps taut. For a moment the sea has you by the legs, cold as a closing hand.

Then it lets go. You get up, spitting brine. You are very, very awake.`,
      effects: { strength: -2 },
      give: ['lantern'],
      choices: [{ text: 'Go on to the hut.', to: 'lowlamp' }],
    },
    lowlamp: {
      scene: '🏮🌑🔥',
      caption: 'The Wether rock',
      text: `The hut is a box of rusted iron, its door hanging by one hinge. Inside, the low lamp stands on its post: a small thing, a tin cage, a lens the size of a bucket.

Your granddad built it. You remember being lifted up to look at it when you were five, the flame inside like a trapped bee.

The wind finds every gap. Your matches are damp. Your hands will not keep still.

*You can do it,* Pip says. *Light her for me.*`,
      choices: [
        { text: 'Light it with the flares.', to: 'light_flare', if: [{ has: 'flares' }], lockedHint: 'You left your flares behind.' },
        { text: 'Light it with the storm lantern.', to: 'light_lantern', if: [{ has: 'lantern' }], lockedHint: 'You have no lantern.' },
        { text: 'Light it with the letter.', to: 'light_letter', if: [{ has: 'letter' }], lockedHint: 'You have nothing of your own to burn.' },
      ],
    },
    light_flare: {
      scene: '🎆🏮🔥',
      text: `The flare spits, sputters, and goes off in your hand with a red roar. The hut fills with a hellish light. You hold it to the wick until the wick takes and the flame grows. Then you drop the flare, and it hisses in the wet.

The low lamp burns. It is not a handsome light. It is yellow and thin and flickers in every gust. But it is there.

You stand with burnt fingers and watch it. Beyond, in the fog, the sound of the ship's bell comes slowly nearer.

It burns less well than it might have. The wind is still your enemy.`,
      take: ['flares'],
      effects: { strength: -1 },
      give: ['_lowlamp'],
      choices: [{ text: 'Shield it with your body.', to: 'shield' }],
    },
    light_lantern: {
      scene: '🏮🔥🌬️',
      text: `You open the dented hood and tip the wick of the storm lantern to the wick of the low lamp, kissing them, one flame handed to another.

It takes at once. A small, clean, steady flame.

You close the glass. The yellow light spills out across the black water, and beyond it, from the fog, a ship's bell answers, once.

Pip makes a sound that is half a laugh and half a sob.

*That's it,* he says. *That's her.*`,
      take: ['lantern'],
      give: ['_lowlamp'],
      effects: { peace: 1 },
      choices: [{ text: 'Shield it with your body.', to: 'shield' }],
    },
    light_letter: {
      scene: '✉️🔥🏮',
      text: `You hold the letter to the last dry match. The paper takes the flame the way old paper does, all at once, with a curl of blue.

*I am sorry,* it says, for a second, in the light. Then it is a bright brown leaf, and ash.

You hold the burning page to the wick of the low lamp and the wick catches. A small, clear flame, the colour of honey.

You open your hand and let the ash go. The wind takes it out over the water, a flock of tiny black birds.

You feel lighter, and more alone, and better.`,
      take: ['letter'],
      give: ['_lowlamp'],
      effects: { peace: 3, strength: -1 },
      choices: [{ text: 'Shield it with your body.', to: 'shield' }],
    },
    shield: {
      scene: '🏮🌬️🌫️',
      text: `You crouch in the doorway with your back to the wind, your oilskins spread like wings.

Minutes pass. The cold goes through you, and out the other side. You think of nothing. You are a wall for a flame.

Out in the fog, shapes begin to gather. First a glow. Then a second, below it. Then a long shadow with a mast, and lit portholes, one after another, warm yellow, in a row. A ship like a sleeping town.

Her bow lifts out of the white, black and lovely. On the bow, in letters of fading gold, you read: LANTERN BRIDE.`,
      choices: [{ text: 'Stand and watch her come.', to: 'ship' }],
    },
    ship: {
      scene: '🚢✨🌊',
      text: `She comes up the Channel slow as a thought, with the lamp on the Wether rock dead ahead.

Pip is at your side, and he is crying openly. *There's me mam's gate,* he says. *There's the Pell light. There's the bell. Oh, there's everyone.*

The deck is crowded with people. You see a fisherman in a yellow hat, a woman with a baby, a priest with a bundle of umbrellas. They are all looking at the light. They are all, very quietly, smiling.

And at the wheel, her cap on the back of her head, a woman turns toward you across the water.`,
      choices: [{ text: 'Raise your hand.', to: 'elin' }],
    },
    elin: {
      scene: '👩‍✈️💛🌊',
      caption: 'Elin',
      text: `She does not shout. She does not need to. Across the water, in a voice as close as a breath at your ear:

*Tam Aldous. You look terrible.*

You laugh. It comes out like a sob.

*You have been blaming yourself,* she says. *Don't. I knew the oil was low. I checked it from the boat, by the colour of your beam. I steered for Pell anyway, because I thought I was cleverer than the weather. That was my sin. Not yours.*

Her face is clear in the lamp's glow. The years have not touched it. They never did.

*Come aboard,* she says. *Or let us go. You must choose, my love.*`,
      choices: [
        { text: 'Say you are sorry. Say it all.', to: 'forgive', effects: { peace: 2 } },
        { text: 'Hold up the locket and ask her to stay.', to: 'stay', if: [{ has: 'locket' }], lockedHint: 'You left the locket on the dresser.' },
        { text: 'Tell her to go, and to be well. You will keep the light.', to: 'let_go' },
        { text: 'Walk into the sea toward her.', to: 'end_sail' },
      ],
    },
    forgive: {
      scene: '💛🌊🕊️',
      text: `You say it all. The oil, the chair, the clock hands moving past two. The letter that stopped halfway. Twenty years of tea drunk standing up.

It takes longer than you expect. She listens, with her head tilted, the way she did when you read her the weather. She does not interrupt. When you have finished, there is a silence like the one after a bell.

*Thank you,* she says. *That was heavy. You can put it down now.*

Something in your chest, which has been clenched for two decades, lets go with a small sound, like a knot of rope coming out of its hole.`,
      effects: { peace: 3 },
      choices: [
        { text: 'Hold up the locket.', to: 'stay', if: [{ has: 'locket' }], lockedHint: 'You left the locket on the dresser.' },
        { text: 'Let her go.', to: 'let_go' },
        { text: 'Ask to come aboard.', to: 'end_sail' },
      ],
    },
    stay: {
      scene: '💛🔦🌌',
      text: `You hold the locket high. The chain swings. The little gold case catches the light of the low lamp and throws it back, a coin of fire against the fog.

*You kept it,* Elin says.

*I kept it.*

*Then I will have an hour,* she says. *They'll let me. The Fog has had a very long time of me and it can spare me a little.*

She steps off the bow onto the water as if onto a stair, and crosses it, and walks up the rocks in her wet boots, and she stands on the Wether in front of you, solid and warm and smelling of salt and engine oil.`,
      choices: [
        {
          text: 'Walk her back to the tower, as the dawn comes up.',
          to: 'end_hour',
          if: [{ has: 'letter' }, { stat: 'peace', min: 6 }],
          lockedHint: 'There is something you still carry that has to be settled first.',
        },
        { text: 'Hold her and let the ship go on without her.', to: 'end_harbor' },
      ],
    },
    let_go: {
      scene: '🚢🌅🕊️',
      text: `*Go on,* you say. *Take them home. Tell Pell I kept the light.*

She nods. The old, firm nod she used to give at the end of an argument she had won.

Slowly the *Lantern Bride* comes round on the water, as a great beast turns in its sleep. The bell rings, once, and then again, and the sound travels across the Channel to a harbour that has been waiting twenty years.

The fog thins in her wake. In its place, there is a long pale line, low in the east, and the first light you've seen all night that you did not make yourself.`,
      choices: [
        { text: 'Watch her out of sight.', to: 'end_harbor' },
      ],
    },
    end_harbor: {
      scene: '🚢🌅⚓',
      text: `She goes home, in the end, at the speed of the tide. The *Lantern Bride* slides into the mouth of Pell harbour as the sun lifts out of the sea, and the town's few lights go out one by one, put out by the day.

Pip waves from the rail. He is quite dry now.

You stay on the Wether rock till the tide has gone out far enough to walk back. You put out the low lamp. It is only a lamp. It has finished.

At the tower you climb the hundred and four steps, trim the wick, and write in the log: *LAMP LIT 6.14 PM. EXTINGUISHED AT DAWN. ONE SHIP SEEN HOME. NO FAULT.*

For the first time in twenty years, you sleep.`,
      ending: { title: 'Safe Harbour', kind: 'good', score: 100 },
    },
    end_hour: {
      scene: '💛🌅🗼',
      text: `You walk back across the causeway together in the first grey light, hand in hand, her wet boots squeaking on the weed. Behind you the *Lantern Bride* waits at the edge of the fog, patient as a horse.

You show her the kitchen. She touches the dresser, the kettle, the chair where you slept. She reads the new line in the log and laughs until she has to sit down.

You have an hour. You spend it badly, wonderfully: tea, and talk, and nothing in particular.

When the sun clears the sea she kisses your forehead, and goes down to the landing, and the tide takes her out, as gentle as a hand.

You do not mind. That is the secret of it. You do not mind at all.`,
      ending: { title: 'One Hour of Morning', kind: 'secret', score: 130 },
    },
    end_sail: {
      scene: '🌊🚢🌫️',
      text: `The water is warmer than you expected. It closes round your knees, your waist, your chest, and you walk on, toward the bright row of portholes.

Elin holds out her hand over the rail. You take it. It is cold, and it is hers.

The deck is crowded and cheerful. Someone puts a cup of tea in your fingers. The *Lantern Bride* turns her bow to the open water, away from Pell, away from the Skerry, into a fog that is not so much a fog as a long country.

On the Wether rock the low lamp burns on, unwatched, for a while, until the oil gives out.

Out in the Channel, the keeper is gone. The light stays lit all the same.`,
      ending: { title: 'Aboard the Lantern Bride', kind: 'neutral', score: 40 },
    },
    end_follow: {
      scene: '🌫️🌊💤',
      text: `The fog is warm as a bed. You step into it with your eyes closed, and the voice is all around you, singing the tune she used to hum over the dishes.

It is a very gentle way to go. You do not fall; you are lowered. The cold arrives late, and then not at all.

High above, the lamp goes on turning for a little while, tick, tick, tick, with no hand to wind it. A ship passes, unseen, a long way off. The master notes in his log a light on the Skerry, steady and sure.

The light goes out an hour before dawn. By then the fog has gone home with its prize.`,
      ending: { title: 'The Fog Keeps Its Own', kind: 'bad', score: 10 },
    },
    end_collapse: {
      scene: '🌊🏚️💨',
      text: `You are too tired. Your legs know it before you do.

You sit down on the stair to catch your breath, and your breath does not come back. The tower hums around you. The lens turns on above. Somewhere a boy is calling your name, and the call grows smaller, and smaller.

In the morning the fishing boats from Pell find the light still burning, and the door of the tower open, and the kettle cold. They find the keeper at the foot of the stair, his oilskins neatly buttoned, and his face turned toward the sea, quite calm.

They carry him home. They do not leave the lamp unlit.`,
      ending: { title: 'The Last Hundred Steps', kind: 'bad', score: 20 },
    },
    end_dark: {
      scene: '🌑🗼🚢',
      text: `It is a small sound at first: a cough of the burner, a stutter of the beam. You look up from your task, and your stomach turns over.

The reservoir is dry.

The great lens slows, and slows, and stops. The beam dies on the water, and the dark rushes in from every side like a crowd into a hall.

You clamber for the oil store, for the cans, for anything. It is too late. Out in the fog you hear a ship's horn, once, a long way off, and then the crash.

You have seen this night before. You are the keeper who let the light go out, twice.`,
      ending: { title: 'The Lamp Goes Dark', kind: 'bad', score: 5 },
    },
  },
}

export default story
