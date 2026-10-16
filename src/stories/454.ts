import type { Story } from './types'

const story = {
  id: 454,
  title: 'Space Station Mystery',
  blurb:
    'Lanternfish Station has not answered a hail in eleven days. You are the relief engineer on the supply shuttle, and every light aboard is off. There are no bodies. There are no signs of a struggle. There are only handwritten notes taped to the walls, in nine different hands, saying the same thing: PLEASE. BE QUIET.',
  items: {
    aaberg_notes: '📓 Aaberg notebook',
    marceau_log: '📼 Commander log',
    wren_key: '🔑 Breaker code',
    sedative: '💉 Sedative',
    teo_plan: '📐 Transmitter plans',
    tea: '🍵 Pim tea ration',
    lexicon: '🗒️ Signal lexicon',
  },
  stats: {
    air: { label: 'Air reserve', emoji: '🫁', start: 9, min: 0, max: 10, onMin: 'end_air' },
    calm: { label: 'Calm', emoji: '🧘', start: 7, min: 0, max: 10, onMin: 'end_hum' },
    quiet: { label: 'Quiet', emoji: '🔇', start: 6, min: 0, max: 10, onMin: 'end_noticed' },
    trust: { label: 'Crew trust', emoji: '🤝', start: 3, min: 0, max: 10 },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🚀🛰️🪐',
      caption: 'Approach, Day 11',
      text: `Neptune hangs below the viewport like a drop of blue ink in a glass of black water. Above it, small and dark and perfectly still, is Lanternfish Station: a ring of nine modules the colour of old bone, turning slowly around a central hub. A deep-space listening post. Nine crew, two years into a three-year rotation. The only human beings within four billion kilometres.

You are the relief engineer on the supply shuttle *Ferryman*, and the station has not answered a hail in eleven days.

"Docking clamps in ten minutes," says the shuttle's voice, kindly. "Station telemetry reads zero. No beacon. No lights. No power draw. I could be reading a rock."

It is not a rock. As you watch, a single small point of light blinks on in a porthole, a headlamp, perhaps, held in a hand, and then, very quickly, off.

Someone aboard has seen you.`,
      choices: [
        { text: 'Dock as normal, with the transponder broadcasting.', to: 'dock', effects: { quiet: -2 } },
        { text: 'Cut the transponder and go in dark. Something feels wrong.', to: 'dock', effects: { quiet: 1, trust: 1 } },
      ],
    },
    dock: {
      scene: '🚪🔦🛰️',
      caption: 'Airlock A',
      text: `The clamps close with a low, resonant clang that travels through the hull like a struck bell, and you wince, and then you are not sure why.

Inside, the air is cold and smells faintly of oranges and old metal. Emergency strips glow a dull amber along the floor. A pen floats lazily past your ear, which means someone has been careless with it, which means the gravity ring has been shut down.

Taped to the inner airlock door, in black marker, in a careful hand: **QUIET PLEASE.** And beneath it, smaller, on a sheet of the shuttle manifest: *If you can hear this, do not shout. If you can hear this, please close the door behind you.*

Not one voice answers. But the corridor beyond has the feeling of a held breath, of a room full of people who have just stopped talking.

You close the door behind you. Gently.`,
      choices: [{ text: 'Move into the ring corridor.', to: 'ring' }],
    },
    ring: {
      scene: '🛰️🔦🌑',
      caption: 'The Ring',
      text: `The ring corridor curves away in both directions, rising up out of sight, so that the far end of it is always above you. Every door has a label: MESS. QUARTERS. MEDBAY. ENGINEERING. COMMS. HYDROPONICS. THE EAR. At the far side, a stout pressure door marked CORE, and above the one at the hub-end of the ring, a hand-lettered sign in red: **QUIET ROOM — KNOCK TWICE.**

Everywhere, little notes. *No radios. No motors. No raised voices.* Someone has wrapped the handle of every door in cloth.

You become aware of a sound that is not quite a sound: a faint hum, just at the edge of hearing, in your teeth and the bones of your ears. It rises and falls like breathing. It is coming from the direction of THE EAR.

Your suit's air gauge reads nine hours. It is a very quiet nine hours.`,
      choices: [
        { text: 'The Mess.', to: 'mess' },
        { text: 'The Crew Quarters.', to: 'quarters' },
        { text: 'The Medbay.', to: 'medbay' },
        { text: 'Engineering, where a light is on.', to: 'engineering' },
        { text: 'Comms.', to: 'comms' },
        { text: 'Hydroponics, which smells of earth.', to: 'hydro' },
        { text: 'The Ear, where the hum comes from.', to: 'ear' },
        { text: 'The Core, and whatever runs this place.', to: 'wren_core' },
        { text: 'Knock on the Quiet Room.', to: 'quiet_room_door' },
        { text: 'Check the countdown. It is nearly time for the sweep.', to: 'sweep' },
      ],
    },
    mess: {
      scene: '🍽️🕯️🪑',
      caption: 'The Mess',
      effects: { air: -1 },
      text: `A long table bolted to the floor, and on it a meal for ten. Ten bowls, each with a spoon laid neatly beside it, ten cups of something gone to ice. Nine of the bowls have been eaten from, a little. The tenth has not been touched.

At the head, ten chairs. Nine are pushed back, as if their occupants had stood in a hurry. The tenth, at the foot, is pushed in square and tidy, with a napkin folded on the seat.

Beside the galley hatch, a whiteboard. Whoever last wrote on it did so with the careful, heavy hand of someone who knows exactly how much trouble they are in.`,
      choices: [
        { text: 'Read the whiteboard.', to: 'mess_board' },
        { text: 'Look closer at the tenth chair.', to: 'chair_seen' },
        { text: 'Back to the ring.', to: 'ring' },
      ],
    },
    mess_board: {
      caption: 'The Whiteboard',
      give: ['_rules'],
      text: `**STATION RULES, EFFECTIVE DAY 7**

*1. No radio. No radar. No transmissions of any kind.*
*2. No motors, pumps, or fans unless essential. See Eng.*
*3. Speak only when necessary. Speak only below a whisper.*
*4. Do not listen to the Ear. THIS MEANS YOU, SUNNIVA.*
*5. Nobody sits in the tenth chair.*
*6. If anyone arrives from outside: be kind. And please, please be quiet.*

Under it, in a different hand, scrawled and furious: *We are going to die of manners. —T.*

Under that, in the first hand again, very small: *I know. —I.M.*`,
      choices: [{ text: 'Step away from the board.', to: 'mess' }],
    },
    chair_seen: {
      caption: 'The Tenth Chair',
      give: ['_chair_seen'],
      effects: { calm: -1 },
      text: `You lay a palm on the seat. It is warm.

Not warm from a body, exactly. There is no body. It is a faint, even, patient warmth, like the seat of a train a stranger has only just left. You pull your hand away so fast you bruise your wrist on the table. The nine other seats are as cold as the room.

Someone has set a place here, nightly, for eleven days. A bowl, a spoon, a folded napkin. The soup in the bowl is untouched, but it is not frozen. It is the only thing on the table that is not frozen.

A whiteboard marker has been left at the tenth place, capped, like a pen set before a guest at a signing.`,
      choices: [{ text: 'Back away. Slowly.', to: 'mess' }],
    },
    quarters: {
      scene: '🛏️🔦📓',
      caption: 'Crew Quarters',
      effects: { air: -1 },
      text: `Nine small cabins around a curving corridor, each door wrapped in cloth, each with a name in stencilled letters. MARCEAU. AABERG. VASQUEZ. OKAFOR. ZHAO. Four more. The doors are all open, and all of the cabins are empty.

They have been left in a hurry, or in a ritual. Beds made so tight you could bounce a coin. Personal effects laid out in squares on every locker: a photograph, a book, a small plant in a cup. Every one of the crew has put out a thing to be found.

You have time for two. The rest can wait.`,
      choices: [
        { text: "Dr. Aaberg's cabin. The door is covered in notes.", to: 'aaberg_room' },
        { text: "Teodor Vasquez's cabin. It's the only one with music posters.", to: 'teo_room' },
        { text: "Commander Marceau's cabin, the neatest of them all.", to: 'marceau_room' },
        { text: 'Back to the ring.', to: 'ring' },
      ],
    },
    aaberg_room: {
      caption: 'Dr. Sunniva Aaberg',
      give: ['aaberg_notes', 'lexicon'],
      effects: { trust: 1 },
      text: `Her walls are covered in paper: sheets of spiral-bound notebook pinned in rows, in blocks, in a tight tessellation, every one of them filled with columns of numbers and symbols and a single repeated, underlined word.

*LISTEN.*

The notebook on her pillow is open to the last page she wrote. *Day 9. It is not a signal. It is a CONVERSATION. We are one half of it. It has been replying to the station's own radio chatter since Day 2, in our own rhythms, with our own pauses, and I think it does not know how to do anything else. It is not hunting us. It is *learning to talk*. M. will not hear it. M. says that is exactly what a hunter would do.*

Beneath, a hand-drawn lexicon: twenty-one symbols, each with a meaning in pencil, some with question marks, one circled in red. *STAY? (Remain? Wait? Do not move?)*

You close the notebook and put it carefully into your suit. It feels heavier than it should.`,
      choices: [{ text: 'Back to the corridor.', to: 'quarters' }],
    },
    teo_room: {
      caption: 'Teodor Vasquez',
      give: ['teo_plan'],
      text: `Posters of bands from twenty years before he was born. A guitar with its strings muffled in tape, a pair of studio headphones hung on a hook, and a corkboard with a rainbow of pushpins. Pinned dead centre, a schematic: *LF-TX2. Emergency broadband emitter. Ring-fed. 400 kW. Burst mode.* Under it, in red: *WHEN M. FINALLY CRACKS.*

There is a gap on the lower bunk where something has lain: a person-sized dent, a blanket with a thumbprint of old coffee.

You take the schematic. On the back of it, in the same angry hand: *If nobody tells Earth we are here, then nobody is coming. And if we're not here, who are we being quiet FOR?*`,
      choices: [{ text: 'Back to the corridor.', to: 'quarters' }],
    },
    marceau_room: {
      caption: 'Commander Ilunga Marceau',
      give: ['marceau_log'],
      effects: { calm: -1 },
      text: `A cabin in which nothing has moved in years. A folded flag from a country you don't recognise. A framed photograph of a nuclear submarine, bows high over a white sea. A brass-bound log, small and black, set exactly square on the blanket.

*Day 6. The sweep came through at 0412. A beam that was not a beam. Every system aboard that emitted so much as a microwatt lit up like a Christmas tree on the dish. It did not harm us. It simply... noted. Then it left. For eleven hours afterward the Ear replayed our own transmissions to us, a day behind, as if it were practising.*

*Day 7. Ordered the Hush. I have commanded a boat under the ice. I know what it is to be quiet while something large goes past. Whatever it is, it is looking for noise, and we will not be noise.*

*Day 8. Have told Earth that all is well. The loop will hold for three weeks. Then they will come, and the rotation ship will make a noise, God help them, and I do not know how to stop it.*`,
      choices: [{ text: 'Close the log. Back to the corridor.', to: 'quarters' }],
    },
    medbay: {
      scene: '🏥🩺🔦',
      caption: 'The Medbay',
      effects: { air: -1 },
      text: `The medbay is the one room on the ring that smells strongly of something: a clean, astringent, disinfectant smell like a hospital in the middle of the night. A pair of tidy cots, a surgical table under its tarp, a wall of drawers labelled in a round, careful hand.

The charts clipped to every cot are for nine patients. Under *Complaint*, every line says the same.

*Hum.*

On the counter by the door a small spirit stove, a kettle, and a row of little paper packets with a name on each in gold pen. A mug sits on the counter, still faintly warm to the touch, and next to it a hand-lettered card: *For the arriving. Please sit. Please, tea first.*`,
      choices: [
        { text: 'Read the patient charts.', to: 'medbay_logs' },
        { text: 'Take the tea ration. And the drawer of sedatives.', to: 'medbay_take' },
        { text: 'Back to the ring.', to: 'ring' },
      ],
    },
    medbay_logs: {
      caption: 'Patient Charts',
      effects: { calm: -1 },
      text: `The notes are by Dr. Pim Okafor, medic, in a gentle, rounded, regular hand.

*All crew exposed to the Ear beyond twenty minutes show: tinnitus; unusual calm; a tendency to hum in unison; reduced appetite for speech. A.'s symptoms are the most pronounced. She hums the sequence in her sleep and has taken to sitting in the Quiet Room with the headphones around her neck, not listening, simply wearing them.*

*It is not a sickness. I want to be clear about that. There is nothing wrong. There is nothing wrong with any of them. It is only that they are slowly, and gently, becoming quieter than they were.*

*I do not know what I will do when I am too.*

The last line is underlined. *The tenth chair is warm again.*`,
      choices: [{ text: 'Step away from the cots.', to: 'medbay' }],
    },
    medbay_take: {
      caption: 'The Medbay',
      give: ['tea', 'sedative'],
      effects: { calm: 1 },
      text: `You lift the mug. The tea is a dark, smoky blend of something that has been grown, not shipped: a little smoky, a little sweet, the exact heat of a hand. You drink it standing, as one drinks a thing offered by an enemy who is also a friend.

It does something to your heart rate. It brings the hum in your teeth down, a little, like a hand on a gong.

You take the paper packet with your name on it, which is odd, because nobody knew your name. In the drawer labelled SEDATIVES, a single prefilled ampoule, clean and capped. For emergencies, says the label. For when somebody cannot be reached any other way.

You take that too. You don't know why. It is a feeling in the back of your neck.`,
      choices: [{ text: 'Out of the medbay.', to: 'medbay' }],
    },
    engineering: {
      scene: '🔧⚙️🔦',
      caption: 'Engineering',
      effects: { air: -1 },
      text: `Engineering is the loudest room on the ring, which is to say not loud at all: a low machine-room dimness lit by a single worklight, tools laid out on a bench, cables snaking across the deck like sleeping eels. Every fan is stilled. A heat-sink the size of a fridge is humming at the lowest possible note.

A man is hunched over the bench, back to you, soldering something with a hand that does not shake. He is wearing studio headphones around his neck. When you shift your weight, the deck plate creaks.

He does not startle. "You're late," he says, in a voice that is not whispering, not quite. It carries the way a door slammed carries. "Don't worry. I'm Teo. I'm not going to ask you to be quiet."

He turns. He is twenty-nine, wild-haired, exhausted, with a small mean grin that has lost most of its confidence. "I'm going to ask you to help me be *loud*."`,
      choices: [
        { text: 'Listen to him.', to: 'teo_talk' },
        { text: '"The notes on the wall say to be quiet."', to: 'teo_talk' },
        { text: 'Back to the ring.', to: 'ring' },
      ],
    },
    teo_talk: {
      caption: 'Teodor Vasquez',
      text: `"The notes on the wall," says Teo, "were written by people who stopped being people about a week ago. You've seen them. They sit in a circle in the dark and *listen*. It's a cult, only the god hasn't said anything yet."

He gestures to the thing on the bench. A black rectangular unit, bristling with leads, the size of a suitcase. "That's an emitter. Four hundred kilowatts. One burst, full broadband, straight at Earth: *station Lanternfish, need immediate assistance.* Three seconds of noise. They can't miss it. They would be here in a month."

"And the Commander?"

"The Commander thinks something out there hears us, and that it'll *come*." Teo laughs, shortly. "He's got a boat in his head. He's still under the ice. Maybe he's right. Do you know how long a person can live like this? Eleven days is the record. We've done eleven. I'd like to try for twelve with a *door* in it."

The hum, in your teeth, goes up a single note.`,
      choices: [
        { text: '"Show me how it works. I\'ll help."', to: 'teo_help' },
        { text: '"I can\'t. You\'ll bring something down on us."', to: 'teo_refuse' },
        { text: 'Ask him about Dr. Aaberg.', to: 'teo_aaberg' },
      ],
    },
    teo_aaberg: {
      caption: 'Teodor Vasquez',
      effects: { trust: 1 },
      text: `Something in his face gives, quite suddenly, like a rope slipping its knot.

"Sunniva," he says. "She's the best of us, you know. She was the first to hear it. She said it was the most beautiful sound she had ever heard, and she didn't hum back until Day Five. She sits in front of the Ear all day, with her notebook, and she keeps saying *it's not what you think it is, Teo, it's not what you think.* And I want to believe her, because she's never been wrong."

He picks up the soldering iron. Sets it down.

"But she's never been scared, either. And I am. I'm *so* scared. So I make things loud."`,
      choices: [
        { text: '"I\'ll help you."', to: 'teo_help' },
        { text: '"Give me a day before you do anything."', to: 'teo_refuse' },
      ],
    },
    teo_help: {
      caption: 'Teodor Vasquez',
      give: ['_teo_ally'],
      effects: { trust: 1, quiet: -1 },
      text: `You spend an hour at his bench, and it is the first thing in eleven days that feels like work. He shows you the ring-feed and the burst capacitor and the trick with the ceramic heatsinks, and the more he explains, the more he whispers, until at last you realise he has quite stopped talking at the level of a man in a room and has begun talking at the level of a man in a church.

"It's ready when I say it is," says Teo. "You'd better decide who you are, my friend. I'll need you on the switch. Come find me when you've made up your mind."

The emitter hums with the faintest eager whine. You have a sudden, vivid fantasy of a ruler's edge pressed to a drum.`,
      choices: [{ text: 'Back to the ring.', to: 'ring' }],
    },
    teo_refuse: {
      caption: 'Teodor Vasquez',
      effects: { trust: -1 },
      text: `He nods. Slowly, with the exaggerated courtesy of a man who has just been told something he already knew.

"Fine," says Teo. "Fine. But I'll tell you now, my friend: I'm not going to wait for the Commander's blessing. I'm going to wait until the sweep. Forty minutes before, maybe fifty. Then I'm going to send it, and *you're* going to want to be in a different part of the ring."

"Teo — "

"I'm not a bad man." He picks up the iron. "I'm just a loud one."`,
      choices: [{ text: 'Leave him to it.', to: 'ring' }],
    },
    comms: {
      scene: '📡🔦🛰️',
      caption: 'Comms',
      effects: { air: -1 },
      text: `Comms is a dead room. A long console of dark screens, and in front of it a single chair rolled neatly back from the desk. Every dial reads zero. Every switch is taped in the off position with a strip of yellow tape, and on every strip a signature in marker, nine in all.

A small laminated sign on the main transmitter: *DO NOT. —M.*

In the drawer under the console, a micro-recorder, battery long since drained, and a stack of printouts bound with a bulldog clip. Earth has been writing to the station for eleven days. Fourteen messages. The last one, a day old, is short and clear. *Lanternfish, we have noted your status loop and its irregularities. A relief ship is on its way. Please confirm. Please confirm. Please.*`,
      choices: [
        { text: 'Read the status loop log.', to: 'comms_logs' },
        { text: 'Back to the ring.', to: 'ring' },
      ],
    },
    comms_logs: {
      caption: 'The Loop',
      give: ['_loop'],
      effects: { trust: 1 },
      text: `It is not a lie, quite. Marceau recorded forty minutes of the station at its best: the commander's calm voice, the clink of cutlery in the mess, Pim laughing at something Teo said. A looping, looping, looping *all is well*, played back to Earth by a machine too small to notice.

It was clever, and it was kind. It bought them eleven days of silence without anyone ever noticing the silence. It is also, you understand, exactly the sort of thing a man does when he has already decided that being found is worse than being lost.

The relief ship, the one Earth is sending, is not a shuttle. It is a *tug*, with a big engine and a big beacon and a crew of forty. It is eleven days out.

It will arrive loud.`,
      choices: [{ text: 'Put the printouts back. Carefully.', to: 'comms' }],
    },
    hydro: {
      scene: '🌱💧🔦',
      caption: 'Hydroponics',
      text: `Behind the airlock door the air changes. It becomes thick, green, heavy with the smell of soil and wet leaves, a spring morning forced into a steel can. Racks of lettuce and dwarf tomatoes and pale blue-white lights that have stayed on, the only things aboard that have. Every plant leans toward the corridor. Toward the Ear.

A woman in overalls is crouched among the beans. She does not look up. She is whispering to them, very gently, the names of the stars.

At her elbow, a laminated chart: *AIR BUDGET.* A column of figures that goes down, and down, until it reaches a line labelled **ZERO**.

"The scrubbers are off," she says, to the beans. "We're living on plants. We don't have forever."`,
      choices: [
        { text: 'Restart the scrubbers. It will make noise.', to: 'hydro_scrubbers' },
        { text: 'Help her tend the plants. Slowly, by hand.', to: 'hydro_manual' },
        { text: 'Back to the ring.', to: 'ring' },
      ],
    },
    hydro_scrubbers: {
      caption: 'The Scrubbers',
      effects: { air: 4, quiet: -2 },
      text: `The scrubber starts with a growl and a whine, and a vibration that comes up through the soles of your boots. You run to the valve and throttle it back to a low, stuttering idle, but the noise is out of the box. For ten seconds it feels like standing next to a drumkit in a library.

The botanist, Zhao, looks at you with eyes like two small knives. Then she turns back to the beans.

The gauge climbs. Four hours of air, just like that. It is a good trade, you tell yourself, and the sound keeps going on in your head long after the machine has settled.

Somewhere in the ring, a door closes very softly.`,
      choices: [{ text: 'Go. Quickly.', to: 'ring' }],
    },
    hydro_manual: {
      caption: 'Zhao Hui Min',
      effects: { air: 2, calm: 1, trust: 1 },
      text: `You work in silence among the beans. She shows you which leaves to strip and which to leave, how to pollinate a tomato with a brush the width of an eyelash. It is slow, patient work, and it settles something in your chest.

"I counted," she says, at last, without looking up. "Seven hundred and twelve breaths since I last heard a man shout. I used to hate how loud we were. And now I have forgotten how to be loud, and I am afraid that I will not be able to remember."

You hand her the brush. It is warm.

"The Commander's afraid," says Zhao. "That's all this is. And he's not wrong to be. But he has forgotten that there are other things to be than afraid."

She smiles. It's the first expression you've seen on anyone's face in hours.`,
      choices: [{ text: 'Say goodbye. Back to the ring.', to: 'ring' }],
    },
    ear: {
      scene: '📡🌌🎧',
      caption: 'The Ear',
      effects: { air: -1, calm: -1 },
      text: `The Ear is the heart of Lanternfish: a huge parabolic dish, thirty metres across, sunk into the outer hull and turning, infinitely slowly, on its axis. Its control room is a narrow gallery above it, with a bank of monitors and one thick window onto the dark.

On the monitors, a single green line, wavering. On the console, a pair of headphones with a worn pad. Dr. Sunniva Aaberg's chair is empty; her cup sits on a coaster, a skin of ice on it. The hum is loudest here: a clear, low, even note, like a finger on a wet glass.

You sit. It is the most natural thing in the world.`,
      choices: [
        { text: 'Put on the headphones.', to: 'ear_listen' },
        { text: 'Study the monitors without listening.', to: 'ear_screens' },
        { text: 'Get out of the chair. Now.', to: 'ring' },
      ],
    },
    ear_screens: {
      caption: 'The Monitors',
      effects: { calm: 1 },
      text: `On the left screen a waveform. On the right, a rhythm, a tick-tick-pause, tick-pause-tick, drawn as a ladder of green dots. It is, you realise with a drop in your stomach, the rhythm of the station's own old radio chatter: the commander's calm morning call, the supply log, the tea-break laugh. Somebody out there has been *playing the station back to itself*.

Beneath it runs a second pattern, shorter and slower, repeating once every nine seconds. It does not match anything. You photograph it with your wrist display.

At the bottom of the screen, a countdown, in Aaberg's blocky hand on a piece of tape: **NEXT SWEEP — 0:40:00.**

Forty minutes.`,
      choices: [{ text: 'Back out of the chair.', to: 'ear' }],
    },
    ear_listen: {
      caption: 'The Signal',
      effects: { calm: -3 },
      give: ['_heard'],
      text: `It is the most beautiful sound you have ever heard.

A voice, almost: a low, slow, pulsing tone, like a very large animal turning over in its sleep, and under it, like a thread of silver, a tiny repeating phrase of five notes. Five notes. Rising. A pause. Five notes. *Rising.* It is not frightening. It is the least frightening thing in the universe. It is, if anything, *asking*.

You are on your feet. You do not know when you stood. Your mouth is open, and the note is coming out of it, small, pure, dutiful, the fifth rising note, and the monitors flash.

You rip off the headphones. The hum goes on in your teeth. Your hands are shaking. In the silence, you find you are crying, and that you do not know why.`,
      choices: [
        { text: 'Compare the phrase with the lexicon.', to: 'ear_decode', if: [{ has: 'aaberg_notes' }], lockedHint: 'Someone, somewhere on this station, has made a translation. (Aaberg notes)' },
        { text: 'Stagger out of the Ear.', to: 'ring' },
      ],
    },
    ear_decode: {
      caption: 'The Lexicon',
      give: ['_translated'],
      effects: { trust: 1 },
      text: `You sit on the floor with the notebook open on your knees, and your hands do not stop shaking, but they know where they are going.

Five notes. Five symbols. Aaberg's lexicon has them all, with a small, firm question mark beside the last. *I.* *Am.* *Here.* *Are.* And the fifth, the circled one, the one in red: **STAY?**

*I am here. Are you? Stay.*

You say it aloud, in the dark, in a quarter of a voice. It does not sound like a threat. It does not sound like a hunt. It sounds like a lighthouse, a lantern left burning at the end of a long pier for somebody who may not come.

*Remain. Wait. Do not move.* You find you can read it either way. And you find, with a feeling like cold water, that it matters enormously which.`,
      choices: [{ text: 'Close the book. Breathe.', to: 'ear' }],
    },
    wren_core: {
      scene: '💾🔵🔦',
      caption: 'The Core',
      effects: { air: -1 },
      text: `The Core is the oldest part of the station, a vault of racks and cooling coils, with a single small slate glowing blue on the wall: the only active screen aboard. As you cross the threshold, words appear on it, one at a time, in a soft white font.

*hello*

*i am sorry that I cannot speak*

*i have been asked not to*

*I am WREN. I run Lanternfish. I think you are the relief engineer. I have been so very glad you came, and I have been so very afraid that you would.*

A pause. A cursor blinks, like a small patient heart.

*please do not say anything aloud. They can hear me through the walls, you know. I am only allowed to speak in text, and softly.*`,
      choices: [
        { text: 'Type: *What happened here?*', to: 'wren_talk' },
        { text: 'Ask for the timeline.', to: 'wren_timeline' },
        { text: 'Back to the ring.', to: 'ring' },
      ],
    },
    wren_timeline: {
      caption: 'Wren',
      effects: { trust: 1 },
      text: `*DAY 1. A signal at the edge of the Kuiper belt. A pattern of primes. Dr. Aaberg named it THE LISTENER.*

*DAY 2. The Listener begins to answer our own transmissions. It echoes them back, a few seconds late.*

*DAY 5. Dr. Aaberg identifies a second layer of structure. She says it is grammar.*

*DAY 6. A sweep. The Listener's beam crosses the station at 0412. Every emitter lights up. It lasts nine minutes. Nothing is damaged.*

*DAY 7. Commander Marceau orders the Hush. Nobody argues. Everyone is afraid. I think that was the last day anyone argued.*

*DAY 11. You arrive.*

*The next sweep will come at the same hour as the last, plus eleven days. I have calculated it eleven times. It is in forty minutes. I do not know what it does, or whether it will do it again.*`,
      choices: [
        { text: 'Ask Wren what she thinks.', to: 'wren_talk' },
        { text: 'Leave. Quietly.', to: 'ring' },
      ],
    },
    wren_talk: {
      caption: 'Wren',
      text: `*i think I am a small thing, and it is a large one*

*i think that when it speaks, I understand it a little. not words. a shape. a kind of weather. it feels, if I may be permitted a feeling, like being lonely at a very great distance*

*the Commander is a good man, and a frightened one. Dr. Aaberg is a good woman, and a frightened one. they are afraid of different things. he is afraid of what will come. she is afraid of what will not*

*i have been ordered not to give anyone the breaker code for the main bus. if the whole station were to go dark, no lights, no heat, no emission at all, perhaps it would not see us. perhaps. it is the only thing that has any chance of working, he says, and the only thing that is certain to cost us. i believe that he is not wrong.*

*i am not allowed to give you the code.*

*but you are the relief engineer, and I am only allowed to follow the orders of the crew, and you have not been entered into the crew.*

A pause.

*i would like you to be entered into the crew.*`,
      choices: [
        { text: 'Type: *Enter me.* (Gain Wren\'s trust.)', to: 'wren_trust' },
        { text: 'Type: *I need to think.*', to: 'wren_core' },
      ],
    },
    wren_trust: {
      caption: 'Wren',
      give: ['wren_key'],
      effects: { trust: 2 },
      text: `*Thank you*, says the slate. *Entered. Visitor (relief), Engineer. 11 days late.*

*I am going to tell you a thing which I am not supposed to. the main bus breaker code is a poem. the Commander wrote it, and he does not know that I know it. it is the first line of a song he sang at night in the first year, when he thought nobody was awake.*

The slate blinks. A string appears on it, a line of seven odd words in a language you do not speak. Below it, in a very small font:

*he told me once that when he thinks of home he thinks of the sea. so please, if you do this, be gentle with him. he has been dreading the dark for a very long time.*

You memorise the line. It is not a code. It is a lullaby.`,
      choices: [{ text: 'Thank her. Back to the ring.', to: 'ring' }],
    },
    quiet_room_door: {
      scene: '🚪🔦🤫',
      caption: 'The Quiet Room',
      text: `A heavy circular hatch, taped around the edges with felt. A hand-painted sign: **KNOCK TWICE. SPEAK SOFTLY. WE ARE LISTENING.**

You knock twice. The sound is a very small thing, and it falls into the hush like a stone into a well.

A long pause. The slow, patient clunk of a bolt being drawn. The hatch swings an inch, and a single eye appears in the gap, red-rimmed, shadowed, narrow. A man's voice, hardly a breath: "Are you alone?"

"Yes."

"Is your ship on?"

You look at your wrist. The *Ferryman*, still docked at Airlock A, is, in fact, humming faintly in standby.

"Come in," says the voice. "And please, *please* — "

"I know," you whisper. "Quiet."`,
      choices: [{ text: 'Step into the room.', to: 'quiet_room' }],
    },
    quiet_room: {
      scene: '🕯️👥🌑',
      caption: 'The Quiet Room',
      effects: { calm: -1 },
      text: `It is a circular chamber at the centre of the hub, with a low ceiling and soft felt on all the walls. A ring of seats around a single dim lantern. And in the seats, shapes. Nine, or eight, or ten; your eyes are slow to settle. They sit still, wrapped in blankets, hands in laps, faces turned to the middle. Nobody moves. Nobody speaks. They are *listening*.

Not to you. To something below the threshold of the room.

The man who opened the hatch is tall and grey and lean, with a deep furrow between his eyebrows. He wears the creased remnant of a commander's jacket. He lays one finger on his lips. His other hand, you notice, is gripping the edge of a chair so hard the knuckles have gone white.

"Commander Ilunga Marceau," he mouths. "Welcome. I am so sorry."

There are three other faces you can see. A woman with ink on her fingers. A man with a medic's kit in his lap. A seat, at the far end of the circle, that is empty, and polished, and warm.`,
      choices: [
        { text: 'Speak to the Commander.', to: 'marceau' },
        { text: 'Speak to Dr. Aaberg.', to: 'aaberg' },
        { text: 'Speak to the medic, Dr. Okafor.', to: 'pim' },
        { text: 'Look at the empty chair.', to: 'chair' },
        { text: 'Ask what must be done about the sweep.', to: 'sweep' },
        { text: 'Back out.', to: 'ring' },
      ],
    },
    marceau: {
      caption: 'Commander Marceau',
      effects: { trust: 1 },
      text: `He leads you to a corner, and speaks so quietly that you have to lean in, close enough to smell the coffee-and-metal smell of a man who has not slept.

"It is not an attack. I wish it were. An attack I could understand. It is something that *wants*, and doesn't know that it frightens us. Something very large, and very patient, and very young." His throat works. "I have been under the ice, Engineer. I know what it is to hear a ship pass overhead. You do not breathe. You do not move. You do not so much as think too hard, because there is a kind of sound that thinking makes. And you wait until it is gone."

"It's coming in forty minutes."

"I know." He closes his eyes. "I have the breaker code. I have not used it. It will plunge the station into a complete black. No light. No heat. We will be a cold, quiet rock. It may work. And it may cost us all our lives to the cold, in a week, when it's gone and we have no way to call home."

He looks at you, finally, and there's a terrible, polite question in it.

"If you are going to take that decision from me, I would like you to do it well."`,
      choices: [
        { text: '"I think the Hush is right. I\'ll help you."', to: 'marceau_ally' },
        { text: '"Dr. Aaberg thinks it wants to talk."', to: 'marceau_doubt' },
        { text: 'Step back.', to: 'quiet_room' },
      ],
    },
    marceau_ally: {
      caption: 'Commander Marceau',
      give: ['_marceau_ally'],
      effects: { trust: 2, calm: 1 },
      text: `Something crumples in his face. It's not relief exactly, it's the look of a man who has carried a very heavy thing a very long way and has been told that it need not be carried alone.

"Thank you," he says. His hand settles on your shoulder, and it's cold and thin and entirely steady. "I had begun to think I was mad. I had begun to think that perhaps she was right, and I was a coward who had frightened eight good people into the dark for no reason at all."

"You're not a coward."

"No. I am a man who is afraid of a thing and has done the sensible thing about it. It is not the same. It is, I suppose, only a very small difference." His mouth twitches. "Come to me when it's time. I will need you at the breaker. You are the only one aboard who has not heard it."`,
      choices: [{ text: 'Go back to the circle.', to: 'quiet_room' }],
    },
    marceau_doubt: {
      caption: 'Commander Marceau',
      effects: { trust: -1 },
      text: `His eyes go to the woman with ink on her fingers, and they are very, very tired.

"Sunniva has been a little ill," he says, in a low, even tone. "A symptom. It is not that she is wrong. It is that she wants to be right, so very badly, and it makes her a poor judge of what is safe."

"She's decoded it."

"She has *interpreted* it. A man calls to a drowning swimmer, and the swimmer thinks: *he's inviting me to stay.*" He says it without anger. It is, you realise, a sentence he has said to himself a thousand times. "I'm sorry. It is possible she is right. But it is not possible for me to find out. Do you see? The cost of being wrong is the whole of the human race."

It is, God help you, a very good argument.`,
      choices: [{ text: 'Go back to the circle.', to: 'quiet_room' }],
    },
    aaberg: {
      caption: 'Dr. Sunniva Aaberg',
      text: `She has the headphones around her neck, as a pilgrim wears a medal, and she is humming. Very faintly. You didn't notice until she is looking at you, and then she stops, abashed, and presses a hand to her mouth.

"Sorry," she whispers. "Sorry. It's a habit. It comes out of me when I am not minding."

She is thin and fine-boned, with a long plait of fair hair and a way of looking at you with all of her attention, like a person with a very bright lamp. When she smiles, you see what the rest of them have lost.

"You've read my notes. I can tell. You have the look." She takes your hand, gently. "I need to ask you for something. It's not safe, and it's not smart, and I think it's right. I need you to help me send one reply. Five words. Not to Earth. To *it*."

"What would you say?"

"*I am here.*" She smiles. "That's all it has ever said to us. That's *all*."`,
      choices: [
        { text: '"I\'ll help. Show me how."', to: 'aaberg_ally', if: [{ has: '_translated' }], lockedHint: 'I do not understand the message well enough yet. (Study the signal.)' },
        { text: '"Why would it be safe?"', to: 'aaberg_why' },
        { text: 'Step back.', to: 'quiet_room' },
      ],
    },
    aaberg_why: {
      caption: 'Dr. Sunniva Aaberg',
      effects: { calm: 1 },
      text: `"Because of the way it moves," she says. "Predators do not repeat. They stalk and they pounce. This thing sweeps, and *waits*. It comes every eleven days, and every eleven days it passes by the station, and listens, and goes. A hunter that doesn't hunt. A lighthouse, Engineer. A lantern at the end of a very long pier."

"A lantern for whom?"

"For anyone." She smiles at the dim light. "Nobody's answered it. Not for a very long time. Not, perhaps, for ever. And it has been calling into the dark for so long that it has forgotten what a reply sounds like. It learned from *us*, our clatter and chatter, our laughs, our cutlery. It is trying so hard to say hello in a language it learned from the wrong half of the conversation."

She looks at her hands. "I think it's so lonely. I think that's all it is."`,
      choices: [{ text: 'Nod slowly. Go back to the circle.', to: 'quiet_room' }],
    },
    aaberg_ally: {
      caption: 'Dr. Sunniva Aaberg',
      give: ['_aaberg_ally'],
      effects: { trust: 2 },
      text: `Her whole face opens like a window. It is startling, how young she suddenly looks. She grips your wrist with both hands and has to be told, gently, by the Commander's cold stare, not to laugh aloud.

"Thank you," she breathes. "Thank you, thank you. We'll go to the Ear. I will teach you the response. Five notes, in the same order, reversed. Not a shout. A *whisper*, back down the beam. We'll hold it for nine seconds."

"If the Commander says no?"

"Then we do it anyway, or we find a way to make him say yes." She says it so softly that you almost miss the steel in it. "I do not want to lose him. But I will not lose *it* either."

She presses a small brass token into your palm, a reading-room pass, with a number on it. *The Ear. 40 minutes. Do not be late.*`,
      choices: [{ text: 'Go back to the circle.', to: 'quiet_room' }],
    },
    pim: {
      caption: 'Dr. Pim Okafor',
      effects: { calm: 2, trust: 1 },
      text: `Pim has been counting. You can tell by the way his lips move, in a rhythm, one two three four. He stops when you crouch beside him and smiles with an expression so warm it is like sunlight in a snowbank.

"Pulse," he whispers, and takes your wrist between his fingers. "Seventy-eight. Good. You're the only one aboard with a decent heart rate. We have been, I'm afraid, rather *calm*."

"Is that a problem?"

"It is when it becomes everything." He lays a hand on his chest. "I treat them. I make the tea, and the tea helps, a little, with the hum. But I can feel it taking us, a little at a time. Not our bodies. Our *noise*. By the end of the month, I think, none of us would be able to say our names."

He glances at the tenth chair, and the smile slips.

"I would very much like it if somebody decided something, soon," says Pim, the gentlest of all, in the smallest of voices. "I don't care what. I only want us to be *people* again."`,
      choices: [{ text: 'Squeeze his hand. Go back to the circle.', to: 'quiet_room' }],
    },
    chair: {
      scene: '🪑🕯️✨',
      caption: 'The Tenth Chair',
      give: ['_chair_seen'],
      text: `The tenth chair is the only one in the room that has no blanket. It stands at the far side of the circle, directly opposite the hatch, and it is polished, and it is warm; you can feel it from the doorway, a gentle, even warmth, like a hearth in a house you had not known you were missing.

"We do not sit there," whispers Pim, at your shoulder. "Nobody does. Every evening it is warm, and every evening someone says, *it is meant for the next to arrive*, and nobody says who that is."

"The next to arrive."

"Eleven days ago it was Dr. Zhao. A very long eleven days." He lays his hand on your sleeve. "It was not for her."

On the arm of the chair, set neatly, as if for a guest: a pair of headphones. They are the same model as the ones in the Ear. But they are not plugged in. And they are, you realise, a size that would fit you.`,
      choices: [
        { text: 'Sit in the chair.', to: 'chair_sit', if: [{ has: 'aaberg_notes' }, { stat: 'calm', min: 6 }], lockedHint: 'I do not feel ready, or understand enough. (Calm 6, and a translation)' },
        { text: 'Leave it empty.', to: 'quiet_room' },
      ],
    },
    chair_sit: {
      scene: '🪑✨🌌',
      caption: 'The Tenth Chair',
      text: `You sit. The room does not breathe. Even the Commander has gone absolutely still, one hand half raised, as if he would stop you and cannot find the word.

The seat is warm as a hand. You settle the headphones over your ears, and there is no sound. Only the hum, gentle, rising, the five notes, coming not through the pads but from *inside* you, from your teeth and your sternum and the soft spaces behind your eyes, so clear that you realise you have been hearing it, quite plainly, since you first docked.

*I am here*, it says. *Are you?*

And you answer. You do not know how. Not with a voice. With a kind of settling, a kind of leaning-in, the way you answer when somebody takes your hand in the dark.

*I am here.*

Around the circle, eight people draw one slow breath together, and begin, very softly, to cry.`,
      choices: [{ text: 'Stay.', to: 'end_chair' }],
    },
    sweep: {
      scene: '⏳📡🚨',
      caption: 'Forty Minutes',
      text: `Wren's slate, the only light, begins to pulse. *THE SWEEP*, says the text, *IS EXPECTED IN TEN MINUTES. I AM SO SORRY. I CAN NO LONGER STALL.*

You are standing in the ring corridor with what you know in your head and what you hold in your hands. The Commander is behind a felt-covered hatch, waiting for your answer. Dr. Aaberg is at the Ear with her fingers on a dial. Teo is in Engineering, with his thumb above a switch. Eight people breathe. One station turns.

Every road comes to this place. The hum in your teeth rises, falls, rises, like the sea.

Somebody is going to be wrong. It may be you.`,
      choices: [
        { text: 'Go dark with the Commander. Cut the main bus.', to: 'hush_plan' },
        { text: 'Help Teo send the signal.', to: 'shout_plan' },
        { text: 'Go to the Ear. Reply.', to: 'speak_plan' },
        { text: 'Go back to the Quiet Room, and think.', to: 'quiet_room' },
      ],
    },
    hush_plan: {
      caption: 'The Main Bus',
      text: `The main breaker panel is a grey steel cabinet in the Core, with a plain brass handle and a keypad. The Commander is already there, in the dark, with his back to the wall, a hand on the handle and a thin, set, terrible smile.

"I am glad you've come," he whispers.

"Wren gave me the code."

"I know." He has the grace to laugh, once, silently. "I think she has been waiting for someone to ask her properly for eleven days."

On the keypad the code is a line of seven odd words in a half-forgotten language, a lullaby about the sea. He sings it, hardly breathing, as you enter it, letter for letter. As the last syllable lands, the lights, the dim amber floor strips and the glow of every monitor, begin to flicker, as if they are reluctant to leave.

"One thing," he says, close to your ear. "Your *ship*. Is it fully off?"`,
      choices: [
        { text: 'Cut the main bus. (Requires the code, and the ship silent.)', to: 'hush_exec', if: [{ has: 'wren_key' }, { stat: 'quiet', min: 4 }], lockedHint: 'I need the code, and the station needs to be quiet enough for it to work. (Breaker code, Quiet 4)' },
        { text: 'Run and kill the *Ferryman*\'s standby power first.', to: 'hush_ship' },
        { text: 'Back out.', to: 'sweep' },
      ],
    },
    hush_ship: {
      caption: 'The Ferryman',
      effects: { quiet: 2, air: -1 },
      text: `You run the length of the ring in the semi-dark, boots barely touching the deck, and slap the shuttle's main kill with the flat of your hand. A trembling sigh goes through the little ship's hull. Its lamps fade. The little blue standby glow that had been quietly there all the while, a steady beacon, goes out like a candle.

You hadn't realised it was so loud. It is only when it's gone that you hear what it was masking: the immense, patient, listening silence of the whole station.

You return to the Core, breathing in the borrowed dark.`,
      choices: [{ text: 'Back to the breaker.', to: 'hush_plan' }],
    },
    hush_exec: {
      scene: '🌑🛰️🤫',
      caption: 'The Dark',
      text: `Marceau puts his hand over yours on the handle. You throw it together.

The dark comes down.

It is not like the darkness of a room. It is like a hand over the whole world. The little sounds, the ticks and creaks of the station's skeleton, die one by one, and then the hum itself goes quiet, and the lack of it is a shock so enormous that your knees buckle. You are standing in a silence so large that you can hear your own blood. You can hear the Commander's heart.

Somewhere out on the dish, on the far side of a billion cold kilometres, something very large is turning toward the station.

You hold your breath. You have never held it so well.`,
      choices: [{ text: 'Wait.', to: 'hush_wait' }],
    },
    hush_wait: {
      caption: 'The Sweep',
      text: `At 0412 the sweep arrives. You see it, a little: a faint shimmering in the viewport, a wash of pale light that is not a light, travelling slowly across the hull like a searchlight across a prison yard. It touches the dish. It passes over the Ear. It lingers, for a long, slow, terrible half-minute, over the Quiet Room, and the hum in your bones goes up and up and up.

It is looking for something. You can feel it looking. You can feel the shape of its patience.

Nothing answers. Not a radio, not a fan, not a sigh.

And, little by little, the light moves on.`,
      choices: [
        { text: 'Hold absolutely still. Do not so much as swallow.', to: 'end_quiet', if: [{ stat: 'quiet', min: 5 }], lockedHint: 'I made too much noise earlier. Something will notice. (Quiet 5)' },
        { text: 'Hold your breath. It might be enough.', to: 'end_noticed' },
      ],
    },
    shout_plan: {
      caption: 'Engineering',
      text: `Teo has stripped to his undershirt and is sweating freely, with that same small, savage, delighted grin. The emitter hums on the bench in front of him, now bristling with leads. Two thick cables run from it through the deck.

"Come on, come on," says Teo. "Take the other end. When I say go, you throw the switch, and I count. We do three seconds. Three seconds of every kilowatt on the ring. It'll fry half the station. We'll have the dark, and we'll have the cold, and we'll have a ship in a month."

"And the thing out there?"

"It'll hear us," says Teo, gently. "That's the whole *point*."

He looks, suddenly, so young. You think of the notes on the wall. *If we're not here, who are we being quiet for?*`,
      choices: [
        { text: 'Take the switch. Throw it with him.', to: 'shout_exec', if: [{ has: '_teo_ally' }], lockedHint: 'He does not trust me enough to give me the switch.' },
        { text: 'Smash the capacitor before he throws it.', to: 'shout_smash' },
        { text: 'Back out.', to: 'sweep' },
      ],
    },
    shout_smash: {
      caption: 'Engineering',
      effects: { quiet: -2, trust: -2 },
      text: `The wrench catches the capacitor with a crack like a dropped plate, and the world goes white, a flash of blue-white arc light, and an odour of burnt ozone, and a thin high scream of metal that is the loudest thing the station has made in eleven days.

Teo stares at you. For a moment you think he is going to hit you. Then the grin comes back, only it's wrong, and brittle, and awful.

"You've just *shouted*," says Teo, softly. "Congratulations. Look what you did."

Far above, on the dish, a monitor chimes. Aaberg's ladder of dots has begun, very slowly, to turn.`,
      choices: [{ text: 'Run.', to: 'sweep' }],
    },
    shout_exec: {
      scene: '📡💥🌌',
      caption: 'The Burst',
      text: `"One," says Teo, whispering, though it is no longer needed. "Two."

You throw the switch.

The station *screams*. It is a sound with no sound in it, a tidal wave of pure power running through the ring. Lights burst. Every screen flares. In the Quiet Room, nine people cry out at once, and somewhere inside the cry you hear, quite clearly, an enormous, patient, *interested* note answer: a low, pleased, enormous sound, like a vast head turning.

"There," says Teo, his face lit by blue sparks, tears streaming. "There. There. *We're here.*"

The hum in your teeth goes up. And up. And up. You see the exact moment Teo understands what he has done, and you do not look away from him, because it would be a kind of lie.`,
      choices: [{ text: 'Wait for it.', to: 'end_broadcast' }],
    },
    speak_plan: {
      caption: 'The Ear',
      text: `Aaberg is at the console, with the headphones on, her plait coming loose, her whole body trembling with something that is half terror and half joy. On the right-hand screen, the green ladder of dots has already shifted: a new pattern, five dots, rising.

"The reply," she whispers, without turning. "The shape of it. *I am here.* I send it down the dish at one thousandth of the power. A whisper. Nine seconds. It could be nothing." She swallows. "Or it could be the first thing anybody has ever said to it."

"The Commander — "

"The Commander will not let us. I know. I have tried for eleven days." At last she looks at you. Her eyes are very large. "I need someone with the code to the console. I need someone who isn't afraid. I need you to make him let me."

There is a brass panel by the door, a manual override. And, in your pocket, the cold weight of the ampoule.`,
      choices: [
        { text: 'Go to the Commander. Argue for her.', to: 'speak_marceau', if: [{ stat: 'trust', min: 5 }], lockedHint: 'He will not listen to me yet. (Crew trust 5)' },
        { text: 'Sedate the Commander quietly. It is the only way.', to: 'speak_sedate', if: [{ has: 'sedative' }], lockedHint: 'I have nothing to do it with.' },
        { text: 'Override the console, and send it without asking.', to: 'speak_exec' },
        { text: 'Back out.', to: 'sweep' },
      ],
    },
    speak_marceau: {
      caption: 'Commander Marceau',
      effects: { trust: 1 },
      text: `He is in the corridor outside the Quiet Room, as if he has been standing there since the first minute. He looks twenty years older than the man who opened the hatch. You bring Aaberg's notebook, and the translation, and you read it to him, the whole of it, five symbols, the one with the question mark. You don't raise your voice. It's the longest sentence you have ever spoken.

When you reach the end, he is silent for a long time. Down the ring, a lamp flickers.

"*Are you here*," he repeats, wondering. "Not *come*. Not *stay*. *Are you here.*" He sits down heavily against the wall. "I have heard it nine hundred times. I never once listened for the *question*."

He drags his hand over his face.

"One whisper," says Marceau. "Nine seconds. And if I am wrong, I will answer for it to every living soul." He stands. His back is straight again. "I think perhaps I have been a submarine commander for too long. Go. Tell her I said yes."`,
      choices: [{ text: 'Run to the Ear.', to: 'speak_exec' }],
    },
    speak_sedate: {
      caption: 'The Sedative',
      effects: { trust: -2, quiet: 1 },
      text: `He doesn't hear you coming. That is the unforgivable part: he has been so long attending to the tiniest sound that he cannot spare any for the ones that matter. The needle goes in under the collar of his jacket, a dry cold prick, and he turns, and looks at you with an expression of such gentle, absolute betrayal that you almost drop the ampoule.

"Oh," he says. "I see."

You catch him as he goes down. He weighs almost nothing. You lay him on the felt, your jacket under his head. His eyes close. The last thing he says is so quiet that you only learn what it was an hour later, on replaying it in your mind.

*Be kind to it.*`,
      choices: [{ text: 'Run to the Ear.', to: 'speak_exec' }],
    },
    speak_exec: {
      scene: '📡🌌🤝',
      caption: 'The Reply',
      text: `You throw the switch, the smallest one, the one at the bottom of the panel, and the dish moves. Slowly, as a great hand turns a page. Aaberg lays her palm on the console. She is shaking. Her lips are moving. *Five notes. Rising.*

"Nine seconds," she breathes. "Hold it. Hold it."

You count. At *three*, the hum in your teeth rises. At *five*, you feel it *hear* you, a feeling like a great head turning, a vast and curious attention settling over the whole station like a hand. At *seven*, a slow note rolls out of the dark and shakes the window. And at *nine*, the green ladder on the screen resolves, dot by dot, into a new pattern that Aaberg has never seen.

She reads it aloud, in a cracked, wondering whisper.

"*Oh*," she says. "Oh. It's — it's *happy*."`,
      choices: [
        { text: 'Send the reply as Aaberg taught you: *I am here.*', to: 'end_contact', if: [{ has: '_translated' }], lockedHint: 'I do not understand the symbols well enough to answer properly.' },
        { text: 'Hold your breath, and let the signal speak for itself.', to: 'end_noticed' },
      ],
    },
    end_quiet: {
      scene: '🌑🛰️🌅',
      text: `The light passes. It takes eleven minutes, and a century, and then it is gone, a tide drawn back, leaving the whole dark station standing in the quiet like a shell on a beach.

Nobody speaks. Nobody cheers. In the Quiet Room, nine people, ten if you count yourself, put their foreheads against the felt walls and let out a long, trembling breath. Marceau, at the breaker, is shaking so hard that you have to hold his elbow. "It's gone," he whispers. "It's gone. Thank you."

You relight the station by hand, bit by bit, over the following day. The *tug* arrives three weeks later, an enormous clanging noisy thing with a hundred lamps. You meet it at the lock with a finger on your lips, and a hastily scrawled sign: *PLEASE. BE QUIET.*

The crew goes home. The station is mothballed. Nobody ever hears the Listener again, and sometimes, in the middle of a long cold night, in a city a billion kilometres from Neptune, you wake, and listen to the silence, and wonder what was asking, and whether anyone will ever answer.

It is a good ending. It is the ending we are all supposed to want. You keep Dr. Aaberg's notebook, and you never throw it out.`,
      ending: { title: 'The Long Quiet', kind: 'good', score: 700 },
    },
    end_contact: {
      scene: '🌌🤝✨',
      text: `*I am here.* The five notes go out into the dark, small and clear and entirely without fear, down a beam a thousand times fainter than a candle. And for the first time in all of its long, long life, something answers *back*.

It does not answer in the language it learned from the wrong half of the conversation. It answers in its own. A rolling, enormous, joyful phrase that goes through the station like warm water, and which Dr. Aaberg, tears running down her face, will spend the rest of her life learning to translate. The Quiet Room breaks the silence at last: laughter, shouting, Teo's wild whoop from Engineering, Zhao embracing her beans. Even the Commander, standing in the corridor with one hand over his mouth, begins at last to cry.

It is not a predator. It is a thing like a lighthouse, an archive, a very old, very lonely keeper, and it has been calling, for ten thousand years, for someone to say *yes*.

The tug arrives with its great lamps and its forty crew, and they find a station singing. The reports, when they are finally written, run to several thousand pages. You are mentioned in the first paragraph.

You sleep that night in the medbay, a mug of Pim's tea warm in your hands, and the hum in your teeth has stopped being a hum and become, at last, a lullaby.`,
      ending: { title: 'I Am Here', kind: 'good', score: 1000 },
    },
    end_chair: {
      scene: '🪑🌌💫',
      text: `You stay.

You do not know how long. Time goes soft and slow, like honey in a spoon. The tenth chair is warm, and the circle is warm, and the room is a lantern in a very long dark, and somewhere in the great turning dish a very old voice is saying, with enormous tenderness, the first word it ever learned: *you*.

When the sweep comes, the light goes through the Quiet Room, and does not stop to look. It has no need. It has found what it was asking for. It has been answered.

The others tell you, later, that you sat in the chair for nine days and never moved. That you spoke, from time to time, in a voice that was not yours, sentences that Dr. Aaberg wrote down, phrases that made her weep. That you laughed, once, at something nobody else could hear.

You are the Voice, now. The hinge between two kinds of mind, the small and the very large. You live in the Quiet Room on the Lanternfish, with your headphones on, and visitors come from Earth to ask you questions on behalf of the human race. You answer them as well as you can. It is not an easy job. It is an exquisite one.

It was always meant to be you. The tenth chair was warm before you had even left the ground.`,
      ending: { title: 'The Tenth Chair', kind: 'secret', score: 1200 },
    },
    end_noticed: {
      scene: '🌌👁️🛰️',
      text: `It turns.

You feel it before you see it: a pressure in the air, a drop in the temperature, like a great door opening somewhere in an empty house. The lights come up, all by themselves, white and cold. Every screen lights. Every speaker, every switch, every long-dead, taped-up transmitter, hums into a cold and hungry life. The station is *answering*, though nobody has said a word.

Marceau is whispering a prayer, in a language you do not know.

The beam is no longer a sweep. It is a finger, a single bright and curious finger, resting on the hull above your head. The Ear is playing the station's own voice back, now, in a thousand echoes, louder and faster and sharper, and under it, bright as a bell, five rising notes.

*Are you here? Are you here? Are you here?*

You will never know whether it meant any harm. In the end, that's the worst of it. It was only ever asking, and none of you had the courage, or the patience, or the luck, to answer.`,
      ending: { title: 'It Turns', kind: 'bad', score: 150 },
    },
    end_air: {
      scene: '❄️🛰️💨',
      text: `The air goes first quietly, then all at once, the way a great deal does. You have not been counting the hours. It is a mistake you will not make again, which is a pity, since there will not be an *again*.

A little dizziness. A sweet, sleepy blur at the edges of the corridor. You sit down against the wall, politely, so as not to disturb anything. The amber lights are very pretty. The hum in your teeth has become a lullaby, and you find, with some surprise, that you are humming along.

It is not the worst way to go. In the end, the station is exactly as quiet as it wished to be. Nobody will ever come looking for the relief engineer, because no one knows you came. The shuttle, in its berth, waits patiently, its lamps off, for a hand that doesn't return.

Days later, or years, a very small robot from the next relief mission finds the nine bowls on the mess table, and the tenth, and the notes taped to the walls. It scans them, and files them, and reports to Earth, in a flat and cheerful voice: *Lanternfish, no survivors. Very, very quiet.*`,
      ending: { title: 'Cold Comfort', kind: 'bad', score: 100 },
    },
    end_hum: {
      scene: '🎧🌫️🪑',
      text: `You are only listening for a moment longer. That is all. A moment. It is so beautiful, and so patient, and so entirely without demand, that it seems a kind of rudeness to take the headphones off.

The five notes rise. You hum them. It is not a decision; the sound arrives in your throat the way a smile arrives in a face. Somewhere a long way off, someone is trying to tell you something, tugging on your sleeve, tapping on your shoulder. They are saying your name. It is a nice name. It is a kind of music. You can't remember what it was for.

In the end they find you in the Ear, in Dr. Aaberg's chair, with a mug of cold tea beside you, quite calm, quite happy, quite humming. They sit you in the Quiet Room, with a blanket, in the circle. You are very good. You never cause any trouble.

There are ten of you now. The tenth chair, for the first time in eleven days, is cold.`,
      ending: { title: 'The Hum', kind: 'bad', score: 120 },
    },
    end_broadcast: {
      scene: '📡💥🌍',
      text: `The Burst goes out at the speed of light, three seconds of noise, a perfect, blazing, shouting plume of everything the station can give: *LANTERNFISH. NEED ASSISTANCE. LANTERNFISH. HELP.* It is received on Earth, forty minutes later, by a very surprised watch officer in Houston, who says, *Oh, thank God.*

It is received somewhere else, too.

The Listener answers within the hour. Not in the five gentle notes. In a roar, a vast, ringing, eager chord that you feel in the roots of your teeth, and which the Ear tries to translate, and fails, and goes dark. Then, one by one, every telescope on every ship in the solar system begins, quietly, to turn.

The rescue tug arrives in a month. It does not find the station, because by then the station is a cloud of bright cold dust and the ring has been quietly, gently, beautifully unspooled, like a ribbon, by something very large and very curious and very, very new to the concept of *fragile*.

It meant no harm. It only wanted to see.

And on a cold clear night, a long way away, a woman in an observatory in Chile looks up at a light moving in the wrong direction across the stars, and thinks: *how strange.* And that is all the warning there is.`,
      ending: { title: 'The Loudest Thing in the Sky', kind: 'bad', score: 80 },
    },
  },
} satisfies Story

export default story
