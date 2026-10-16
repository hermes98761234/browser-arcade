import type { Story } from './types'

const story = {
  id: 456,
  title: 'The Haunted Inn',
  blurb:
    'A blizzard on the high moor, one lantern guttering, and a single lit window: the Gallows & Lantern, where the fire is warm, the beds are made, and nobody ever seems to leave. The innkeeper takes no coin. The guests keep odd hours. Something knocks in the night. Keep your wits, keep your light, and do not ask what anyone is waiting for.',
  items: {
    key7: '🗝️ Key to Room 7',
    cellar_key: '🗝️ Cellar key',
    salt: '🧂 Pouch of salt',
    locket: '📿 Tarnished locket',
    ledger: '📖 Guest ledger',
    shard: '🪞 Mirror shard',
    horse: '🐴 Wooden horse',
    watch: '⌚ Stopped pocket watch',
  },
  stats: {
    sanity: { label: 'Sanity', emoji: '🧠', start: 8, min: 0, max: 10, onMin: 'end_madness' },
    candle: { label: 'Candle', emoji: '🕯️', start: 7, min: 0, max: 8, onMin: 'end_dark' },
    recall: { label: 'Recall', emoji: '🧩', start: 1, min: 0, max: 8 },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🌨️🏚️🕯️',
      caption: 'The High Moor, Night',
      text: `You have been walking for what feels like hours, though the cold has made hours into a single long grey smear. Snow comes at you sideways. The road, which was a road at noon, is now a rumour. Your lantern, a stub of tallow in a tin cage, flickers in your fist like a frightened bird.

You cannot remember where you were going. That does not alarm you as much as it should. It is only the cold, you tell yourself. The cold gets into the head.

Then, over a rise, a light.

A single window, yellow as butter, in the side of a long low building with a crooked sign swinging over the door. The sign has a picture of a gallows, and beside it a lantern. THE GALLOWS & LANTERN, says the painted lettering, in a hand that is somehow *friendly*. Smoke rises from a chimney, straight up, as if the wind had decided not to trouble it.

You do not decide to walk toward it. Your feet are simply already going.`,
      choices: [{ text: 'Knock at the door.', to: 'door' }],
    },
    door: {
      caption: 'The Gallows & Lantern',
      text: `You knock once. The door opens before your knuckles have finished.

The woman who stands there is small and square and perhaps sixty, with grey hair in a plait the thickness of a hawser and a brown apron that smells of woodsmoke and roasting onion. She has kind, tired, beautifully lined eyes, and she looks at you as though you were exactly the sort of thing she had been expecting, and had prepared for.

"There you are," says the woman. "Come in out of that. Mind the step. Wipe your feet. I am Mrs. Pell. You'll want a fire."

Heat, and the scent of bread, and the low murmur of other people's voices roll out over the threshold like a wave. You reach for your purse, and she lays a hand on your wrist: small, cool, firm.

"No," she says gently. "There's no need for that. Not here."`,
      choices: [
        { text: 'Step inside.', to: 'pell' },
      ],
    },
    pell: {
      scene: '🔥🪑🍞',
      caption: 'Mrs. Pell',
      text: `The common room is low and beamed and warm, with a great stone hearth in which a fire is burning with the sullen steadiness of a thing that has never once needed more wood. Four tables. A scarred bar, with no taps. A long-case clock in the corner whose hands stand at eleven minutes past eleven.

"It stopped," says Mrs. Pell, following your eyes. "It does. Never mind it. You'll have Room Seven, at the top of the stair, with the good window. I've aired it. There's a bottle in the bed."

She counts it off on her fingers, a landlady's litany, brisk and kind.

"Supper is whenever you wish. Don't open the cellar door. If anyone knocks after midnight, don't answer. And dear — " here she touches your sleeve — "please don't ask the guests what they are waiting for. It *upsets* them."

It is such a strange list that you almost laugh. Then you look at her face, and you don't.`,
      choices: [
        { text: 'Take your seat by the fire.', to: 'common' },
        { text: '"Why is the clock stopped at eleven past eleven?"', to: 'pell_clock' },
      ],
    },
    pell_clock: {
      caption: 'Mrs. Pell',
      effects: { sanity: -1 },
      text: `"Because that is when it is," says Mrs. Pell, with a small, practised smile. She is straightening a cushion that does not need straightening. "Eleven past eleven. I've been keeping it so a very long time. It's... easier for everyone to know what the hour is. The ones who stay. It stops them looking for another."

"Another hour?"

"Another *way*, dear." She pats your arm, once, briskly, and moves toward the kitchen. "Never mind. Go and sit down. You look perished."

You watch her go. Her shadow, you notice, is a little late to follow her, like a dog that has been told to stay.`,
      choices: [{ text: 'Go to the fire.', to: 'common' }],
    },
    common: {
      scene: '🔥🪑👥',
      caption: 'The Common Room',
      text: `There are three other guests. You notice them one at a time, as one notices things in a dream, as though each had been waiting for you to look.

By the window, a stout man in a checked waistcoat, holding a gold watch to his ear and scowling at it, tapping the glass. A small black-haired woman in widow's weeds, very still on a settle, a book open in her lap that she is not reading. And on the hearthrug, cross-legged, so near the fire that you fear for his eyebrows, a thin boy of nine or ten, in a nightshirt, building a tower of kindling with the careful, hopeless attention of a child at prayer.

None of them looks up. Not at once. Then the stout man snaps the watch closed and does, and the others follow, one by one, like a row of sunflowers.

"A new face!" cries the stout man, rather too loud. "A *new face*, by God, and in this weather. Come and sit down, friend. You can't have come far."

It is not a question. You find you can't answer it.`,
      choices: [
        { text: 'Sit with the stout man.', to: 'crowe' },
        { text: 'Go to the widow by the window.', to: 'dorothea' },
        { text: 'Kneel by the boy on the hearthrug.', to: 'albie' },
        { text: 'Warm your hands, and light your candle from the fire.', to: 'hearth', if: [{ stat: 'candle', max: 6 }], lockedHint: '' },
        { text: 'Climb the stairs to your room.', to: 'hub' },
        { text: 'Ask Mrs. Pell for supper.', to: 'supper' },
      ],
    },
    hearth: {
      caption: 'The Hearth',
      effects: { candle: 3, sanity: 1 },
      text: `The flames lean toward your lantern like cats toward a hand. You hold the little tin cage into the heart of the hearth, and the wick catches, brightens, steadies, and burns white and tall for the first time since the moor.

It is a curious thing. The fire gives off no smoke. Nothing in it crackles. It does not, you notice, cast any shadow on the wall behind you. But your hands are warmer, and your mind is clearer, and you do not look too hard at why.

You will want to keep this light close. The inn's upper floors are very dark, and the dark here does not behave as it should.`,
      choices: [{ text: 'Turn back to the room.', to: 'common' }],
    },
    crowe: {
      caption: 'Mr. Fenwick Crowe',
      text: `"Fenwick Crowe, at your service." He pumps your hand, which is unpleasant: his own is damp and very cold. "Lightning rods, sir. The Crowe Patent Conductor. Have you ever been struck by lightning? I should not recommend it. Been here since Tuesday. Or Wednesday. The ford's flooded. The moor road's gone. A *dreadful* thing, to be stranded in a place with no *custom*."

He laughs loudly. He keeps patting his waistcoat pocket.

"Mrs. Pell is a saint, mind. Won't take a penny. And the beds are first-rate. It's only the *waiting*. A man in my profession, sir, he can't *wait*. Every hour I sit in this chair is a sale somebody else is making in Halifax."

He takes out the watch. Holds it to his ear. Frowns. Taps. "Seems to have stopped. Seems to have stopped at... would you say it's late?"

Beyond the window, the snow falls up, and not down.`,
      choices: [
        { text: 'Look closely at the watch.', to: 'crowe_watch' },
        { text: 'Say nothing. Go back to the fire.', to: 'common' },
      ],
    },
    crowe_watch: {
      caption: 'The Watch',
      give: ['watch'],
      effects: { recall: 1, sanity: -1 },
      text: `He lets you hold it. The case is warm, as if it has lain next to a heart, but the face behind the cracked glass is quite dry, and the hands are fixed at 11:11, like the clock in the corner. Inside the case lid, in a tiny script, is an inscription. *To F.C., from his Margaret. So that you are never late.*

There is a bloom of damp along the edge, a green waterline, like a stain left by a river. You turn it over, and a little water, clear and cold, runs out of the stem and spatters onto your palm.

Crowe takes the watch back, hurriedly, not meeting your eyes. "Bit of a leak," he says. "Crossing the ford. I'll have it seen to." His laugh has a high, tight note in it. "I'll have *everything* seen to, once the road clears."

You glance at his boots. They are very wet. They have been very wet, you realise, for a long time.`,
      choices: [{ text: 'Go back to the fire.', to: 'common' }],
    },
    dorothea: {
      caption: 'Miss Dorothea Lisle',
      text: `She does not look up from her book. When she does, it is with a slow, startled courtesy, like a woman waking from a nap in church.

"Forgive me," she says. "Dorothea Lisle. I was reading." Her voice is light and exact and entirely without breath. "Are you here to wait too? It is so very kind of Mrs. Pell. I came on the Thursday coach. My husband was to meet me. Arthur. He is a surveyor. He said that he'd be here by supper, and then he said — well. I have been here since."

"Since when?"

"Oh, it's hard to say." She smiles, polite, and turns a page that does not turn. "There is only supper here. And the fire. And I keep thinking that if I stop *looking* for him, he won't come. It's a silly thing. Don't you find, sometimes, that the waiting is the only thing you've got?"

You realise that you have been standing here for some time, and have not once seen her blink.`,
      choices: [
        { text: 'Gently take her hand.', to: 'dorothea_hand' },
        { text: 'Murmur something kind. Go back to the fire.', to: 'common' },
      ],
    },
    dorothea_hand: {
      caption: 'Miss Dorothea Lisle',
      effects: { recall: 1, sanity: -1 },
      text: `Her fingers are cold. Not winter-cold: *clay*-cold, the cold of a church font. She looks down at your joined hands, and a little frown creases her forehead, the smallest wrinkle, like a puzzle.

"Oh," she says. "How odd. Yours are cold too."

You pull away. She has not let go. She is looking at your wrist, where the cuff has ridden up. "I thought," she says in wonder, "that I was the only one. I thought it was the *room*. But you haven't a pulse either, have you? Does it not bother you? I find that it comes and goes."

"I — "

"I'm sorry." She releases you, with a tiny gasp, as if she had touched a hot stove. Her face has gone the colour of tallow. "I've said something I oughtn't. Mrs. Pell will be *so* cross. Please forget I spoke."

She goes back to her book, and her hands shake so hard that the page rattles.`,
      choices: [{ text: 'Back away, heart pounding. (Or is it?)', to: 'common' }],
    },
    albie: {
      caption: 'Albie',
      text: `The boy does not speak. He has a small thin face with enormous eyes, smudged with soot, and a way of holding his breath when he's concentrating. He is building the tower with extraordinary care, each splinter laid across the last, and when you kneel beside him he shifts to make room without looking up.

You hand him a stick. He takes it as a duchess takes a letter, and sets it on the top. The tower trembles, holds, and then, very gently, folds in on itself.

For a moment you think he will cry. Instead he looks up at you, and the corners of his mouth lift, and he begins, with huge seriousness, to build it again.

He points up. At the ceiling, to the room above, where a small footstep is crossing the boards, back and forth, the same four paces, over and over. Then he puts a finger to his lips. *Not a word.* And with the other hand, silently, he mimes holding the reins of a horse.`,
      choices: [
        { text: 'Mime a horse back at him. Smile.', to: 'albie_game' },
        { text: 'Go back to the room.', to: 'common' },
      ],
    },
    albie_game: {
      caption: 'Albie',
      give: ['_albie_hint'],
      effects: { sanity: 2 },
      text: `You neigh. It's a terrible neigh, a very bad neigh, a creaking pantomime neigh, and the boy's face splits with delight. He lets out a silent, gasping, full-bellied laugh, and for a moment the whole hearth *brightens*, and the firelight on the wall seems to lean in, to listen.

He takes your hand, and tugs, and mimes a staircase, a long dark climb, a door at the top of it, and something small and wooden with four legs, and then he lays his palm flat on his chest, and shakes his head sadly. *Lost.*

*Up there*, he is telling you. *In the attic. My horse. I cannot go. Will you?*

You squeeze his small cold hand. He squeezes back, rather harder than a child ought.

"I'll look," you say.

The footsteps overhead stop. All at once. Like a held breath.`,
      choices: [{ text: 'Rise. The room feels brighter for a minute.', to: 'common' }],
    },
    supper: {
      scene: '🍲🍞🕯️',
      caption: 'Supper',
      text: `Mrs. Pell serves a stew. It is thick and brown and smells of every good Sunday you remember. She ladles it into pewter bowls, places one before each of you, and sits at the end of the table with her hands in her lap, watching, with an expression of tender hunger.

You lift the spoon. The broth goes in. You taste... nothing. A warmth without a flavour, like drinking the memory of a taste. You swallow, and feel it settle, and it does not seem to fill anything.

Across the table Crowe is eating enormously, talking with his mouth full, and the soup is passing straight through him in a thin silver stream onto the floor. Dorothea is stirring hers round and round. The boy has not been given any. Nobody mentions it.

"Eat," says Mrs. Pell. "Eat what you like. It does no harm."

You put down your spoon.`,
      choices: [
        { text: 'Ask Mrs. Pell what is in the stew.', to: 'kitchen_pell' },
        { text: 'Leave the table. Quietly.', to: 'hub' },
      ],
    },
    hub: {
      scene: '🏚️🕯️🚪',
      caption: 'The Gallows & Lantern',
      text: `The inn is larger from inside than out. A hall runs the length of the ground floor, with the common room at one end and the kitchen at the other, and in the middle, at the foot of the stair, a small desk with a candle and a thick book open on it. The stair rises into dark. Under it, a squat door with an iron ring and a heavy bolt. The cellar.

The clock in the corner of the common room strikes. It is not eleven. It is not any number. It makes the sound of a single bell, struck very softly, and the sound goes on for a very long time.

The candles flicker. They do not blow out. They lean, all in the same direction, toward the cellar door.

You have a feeling, of the kind you can't argue with, that you ought to explore before the night is much further gone.`,
      choices: [
        { text: 'The desk and the thick book.', to: 'desk' },
        { text: 'Up the stairs to Room Seven.', to: 'room7' },
        { text: 'The attic, at the top of a ladder.', to: 'attic' },
        { text: 'The kitchen.', to: 'kitchen' },
        { text: 'The back door, and the yard.', to: 'yard' },
        { text: 'The cellar door.', to: 'cellar_door' },
        { text: 'Back to the common room.', to: 'common' },
        { text: 'Wait for midnight.', to: 'midnight' },
      ],
    },
    desk: {
      caption: 'The Guest Ledger',
      text: `It is a tall book bound in black leather, ruled in columns: *Name. Arrived. Departed. Remarks.* The ink is brown, the pages heavy as cloth. A pen stands in a pot beside it. The candle by it burns without a flicker.

You turn the pages with great care. There are hundreds. Names in a hundred different hands, going back and back: *Hannah Roe. Mr. J. Tolliver. Two sisters, unnamed. Corporal M. Ashby.* The dates run through decades, then centuries, in no order, as if the book had been used for a long, long time by a long, long line of tired people.

Under *Departed* there is, in a different hand every time, the same neat note, in Mrs. Pell's careful copperplate. *Went on.* *Went on.* *Went on.*

There are some entries without a note. They are the ones that make your skin crawl.

A drawer in the desk is ajar, and in it, on a ring, a small iron key.`,
      choices: [
        { text: 'Take the cellar key.', to: 'desk_key', if: [{ not: 'cellar_key' }], lockedHint: '' },
        { text: 'Read the most recent entries.', to: 'ledger_read' },
        { text: 'Step away.', to: 'hub' },
      ],
    },
    desk_key: {
      give: ['cellar_key'],
      effects: { sanity: -1 },
      text: `The key is heavy and very cold. It's as long as your hand, rough-forged, with a bow in the shape of a closed eye. On the barrel, someone has scratched, with a nail, a single word.

*Don't.*

It is in a hand you almost recognise.`,
      choices: [{ text: 'Close the drawer. Quietly.', to: 'desk' }],
    },
    ledger_read: {
      caption: 'The Last Page',
      give: ['ledger'],
      effects: { recall: 2, sanity: -2 },
      text: `The last entries are the freshest. *Arthur D. Lisle, surveyor. Arrived Dec. 2nd. Departed Dec. 4th. Went on.* You think of the widow in black, waiting at her book. You think of the small flat clink in your chest.

*F. Crowe, travelling agent. Arrived (flood), Dec. 10th. Remarks: Does not accept.*

*Albie Pell, aged 9. Arrived 1851 (fire). Remarks: Cannot go. Will not leave his mother.*

And at the bottom of the page, in ink so fresh that it is still faintly wet, a line you do not want to read.

*[Your name]. Arrived tonight, from the high road. Remarks: Found on the crossroads at the third hour. Does not yet know.*

The ink is your own handwriting. You know it. You wrote that. You have a memory of writing that, with a stub of pencil, in the snow, with a numb hand, as you sat down very tired in the white road to rest.`,
      choices: [{ text: 'Put a hand over your mouth. Back away.', to: 'hub' }],
    },
    room7: {
      scene: '🛏️🪞🌨️',
      caption: 'Room Seven',
      effects: { candle: -1 },
      text: `Room Seven is at the top of the house, under the eaves, a narrow white room with a slanted ceiling and a bed turned down with a hospital's precision. A bottle of warm stone waits between the sheets. On the wall, a mirror in a tarnished frame; on the sill, a candle that has never been lit.

It is, you think, the loneliest room you have ever seen. The window looks over the moor: a wide white plain under a low cloud, shimmering with a faint, unnatural glow. Far off, at the very edge of sight, a line of small lights is crawling across the snow. Lanterns. People searching.

The room has the feeling of a room that has been *kept*. A bed that no one has slept in for a very long time, but that someone has aired, and aired, and aired, on the off chance.`,
      choices: [
        { text: 'Look in the mirror.', to: 'room7_mirror' },
        { text: 'Go to the window.', to: 'room7_window' },
        { text: 'Search the bedside drawer.', to: 'room7_drawer' },
        { text: 'Back to the hall.', to: 'hub' },
      ],
    },
    room7_mirror: {
      caption: 'The Mirror',
      give: ['shard'],
      effects: { recall: 1, sanity: -2 },
      text: `You stand in front of the glass. The room is behind you, white and kept. The bed. The window. The candle.

You are not in it.

That is all. There is no face, no coat, no frightened eye. A faint disturbance in the dust on the glass, perhaps, in the shape of a man. But nothing looks back. Nothing *breathes* on it.

You lift a hand. In the mirror, the room waves. Your fingertips have gone white and a little translucent, like a candle-flame held up to the sun. A crack runs across the glass. When you touch it, a sliver the size of a thumbnail falls free into your palm, and in it, a tiny reflection of a stranger: grey, thin, hollow-eyed, with snow in his hair.

It is you. You remember, now, what you looked like.`,
      choices: [{ text: 'Pocket the shard. Step back from the glass.', to: 'room7' }],
    },
    room7_window: {
      caption: 'The Window',
      effects: { sanity: -1 },
      text: `You wipe a circle in the frost. The lights on the moor are nearer. A line of men with lanterns, spread across the white like beads on a string, walking slowly, calling. You cannot hear them. But you can see their mouths. They are all shouting the same name.

It is a very ordinary name. It's yours.

The thought is a dreadful, tender one: *someone is looking for me.*

Behind them, on the road, a long cart is drawn by a patient horse. A woman sits on the box, wrapped in a shawl, and she is not looking at the moor. She is looking straight at the window of Room Seven, as if she knew exactly which one. She raises one gloved hand, and holds it there.

You find that you have raised yours.`,
      choices: [{ text: 'Turn from the glass.', to: 'room7' }],
    },
    room7_drawer: {
      caption: 'The Drawer',
      give: ['locket', 'key7'],
      effects: { recall: 1 },
      text: `In the drawer, a pair of spectacles with one lens missing, a handkerchief with an initial worked in blue thread, and a locket on a broken chain.

You know it at once. Silver, tarnished, with a dent in the lid where it was dropped on a stone floor in a house you can almost remember. Inside, two miniatures: an old woman with a stern, kindly, familiar face, and a girl of twelve with a gap in her teeth.

*Ada*, you think. Your sister. She is the one on the cart. She has been looking for you since dusk.

Under the locket, the key to Room Seven. It has a tag. *Never locked.* The writing is Mrs. Pell's.

*It was always yours,* the tag seems to say. *We've been keeping it.*`,
      choices: [{ text: 'Close the drawer, and your eyes.', to: 'room7' }],
    },
    attic: {
      scene: '🪜🕸️🐴',
      caption: 'The Attic',
      effects: { candle: -1 },
      text: `A ladder, a trap, a place of beams and cobwebs and cold. Your candle makes a small, brave island in the dark. Trunks. A dressmaker's dummy with a hat on it. A rocking chair that moves, a very little, on its own.

The footsteps you heard from below were *here*. Four paces and back. In the middle of the floor, the boards are worn into a pale, shallow track. Someone has paced this room for a hundred and seventy years.

At the far end, under the gable, a child's bed, neatly made. A row of tin soldiers on the sill, all facing the window. And in a corner, behind a trunk, a small shape, four-legged, on a stick.

A wooden horse. Painted dapple-grey, with a red-ribbon mane and a missing ear.`,
      choices: [
        { text: 'Take the horse.', to: 'attic_horse' },
        { text: 'Leave it. Climb down.', to: 'hub' },
      ],
    },
    attic_horse: {
      caption: 'The Horse',
      give: ['horse'],
      effects: { sanity: -1 },
      text: `It is a small thing, light as a bird. As you lift it, the attic *breathes*. Every board creaks at once. The tin soldiers turn, with a faint dry click, to face you.

A very small voice, directly in your ear, so close that it ruffles your hair, says: "*Careful. She wasn't ready.*"

You freeze. No one is there. But the rocking chair has stopped, and in the dust on the floor, where there was no print before, there is now a line of tiny bare footprints. They lead from the child's bed to the horse. They lead from the horse to you.

You tuck the toy into your coat. It is, you think, a very kind sort of theft.`,
      choices: [{ text: 'Descend the ladder.', to: 'hub' }],
    },
    kitchen: {
      scene: '🍳🧂🕯️',
      caption: 'The Kitchen',
      text: `A long stone room, hot as a bakery. A black range with a dozen iron pots, a table scarred by a century of knives, strings of onions and dried herbs hung from the beams like a hanged garden. Mrs. Pell is at the sink with her sleeves up, scrubbing a pot that has been scrubbed for fifty years.

"There you are," she says, without turning. "Hungry?"

"No."

"No. They never are." She sets the pot down. "It's the strangest thing about the dying. People imagine it hurts. It doesn't. It simply, one day, stops being *interesting*. The body forgets what to want."

She dries her hands. She is not looking at you; she is looking at the stove, at the little sizzling blue flame, so that you will have time to compose your face.

"It's all right," says Mrs. Pell. "I've done this a very long time. I promise I'm very good at it."`,
      choices: [
        { text: '"Mrs. Pell. What is this place?"', to: 'kitchen_pell' },
        { text: 'Take the pouch of salt from the shelf.', to: 'kitchen_salt', if: [{ not: 'salt' }], lockedHint: '' },
        { text: 'Leave her to her pots.', to: 'hub' },
      ],
    },
    kitchen_salt: {
      give: ['salt'],
      effects: { sanity: 1 },
      text: `The pouch is made of grey linen, and tied with a cord of horsehair. It smells of the sea, and of tears, and of salt: the oldest preservative in the world, the oldest charm against the things that cling.

"Good," says Mrs. Pell, still not turning. "Take it. They don't like it. Not the poor ones, I mean. It only hurts the other thing. The one in the cellar."

You freeze, the pouch in your hand.

"Don't worry," she says. "He can't hurt you if you don't let him." Her scrub brush stops. "But please, dear. Don't let him."`,
      choices: [{ text: 'Tuck the salt into your pocket.', to: 'kitchen' }],
    },
    kitchen_pell: {
      caption: 'Mrs. Pell',
      effects: { sanity: -1 },
      text: `"It is an inn," she says. "It has always been an inn. People walk the high road, and some of them are tired, and some of them are lost, and some of them are neither, but have simply *stopped*. I keep a light on. I keep a fire. I let them come in, and sit, and be warm, and when they are ready, they go on."

"On where?"

She looks at you for a long moment. It is the first time she has looked at you fully, and you see how very old she is, how tired, how fond.

"I don't know," says Mrs. Pell. "I've never gone. It is not that sort of door. I only keep it. I am the Keeper. It's what I do, and I do it as well as I can, and every year there are more who won't go, and I cannot make them. I can only keep the door, and the fire, and wait."

She picks up the brush.

"You'll want to see the stable, dear. When you're ready. I should have told you sooner. But it's a very difficult thing to say."`,
      choices: [
        { text: 'Go out to the yard.', to: 'yard' },
        { text: 'Go back to the hall.', to: 'hub' },
      ],
    },
    yard: {
      scene: '🌨️🐴🏚️',
      caption: 'The Yard',
      effects: { candle: -1 },
      text: `The back door opens on a cobbled yard, blown clear of snow in a perfect circle, as if by a very careful hand. Beyond the circle the blizzard goes on as it has for hours, a wall of white, soundless as a shroud. Across the yard, the stable door stands open.

There is a single lantern burning inside, on a hook. A horse stands in the nearest stall, a stolid, dappled, patient horse, with frost on its whiskers. It does not look at you. It does not move its ears.

On the straw in the second stall, beneath a blanket of rime, something long and grey is lying.

You know what it is. It is the shape of a man, curled on his side in the way of a person trying to keep warm. His coat is yours. His boots are yours. In his hand, clenched, frozen, a stub of tallow and a tin lantern with its door open.

You have been very slow to understand.`,
      choices: [
        { text: 'Go to the stall.', to: 'stable_body' },
        { text: 'Turn and run for the inn.', to: 'hub', effects: { sanity: -2 } },
      ],
    },
    stable_body: {
      caption: 'The Stall',
      effects: { recall: 3, sanity: -3 },
      text: `You kneel. The face turned up to the lamplight is your face, white and calm and slightly surprised, with snow in the eyelashes. The mouth is a little open, as if you had been about to say something.

You remember the road. The long white road, the wind like knives, the tiny light. You remember sitting down, just for a moment, in the lee of a milestone, because it was so very tiring, and you were so very sure that you'd only close your eyes.

You remember the cold stopping. That was the strangest part. The cold simply stopped, and a warmth came up under you like a hand. And you looked up, and there was a window, and a light, and a sign with a lantern on it.

*Dead*, you think. The word is surprisingly small. It sits on the tongue like a seed. *I am dead.*

Behind you, with the same kind and sorry voice she used at the door, Mrs. Pell says: "There you are, dear. I thought you'd come out here."`,
      choices: [
        { text: 'Turn to face her.', to: 'pell_truth', if: [{ stat: 'recall', min: 5 }], lockedHint: '' },
        { text: 'Scream.', to: 'pell_truth', effects: { sanity: -2 } },
      ],
    },
    pell_truth: {
      scene: '🕯️👵🚪',
      caption: 'Mrs. Pell',
      effects: { recall: 2 },
      text: `She does not touch you. She stands in the stable door, with the snow behind her and the lamp before, a small square woman in a brown apron, and her face is wet.

"I am so sorry," she says. "I would have told you, but it is better when you find it. They fight less. You were walking. You were nearly home, you know, a few miles on, a place that you'd loved. The cold is a gentle way. It is nearly always the cold."

"Ada," you say. It comes out in a whisper.

"Your sister is on the road with the lanterns. She has been out all evening. She will find you in the morning, by the milestone. She will not be glad, but she will be *able* to bury you, and that matters more than you'll think." Mrs. Pell lays a hand over her heart. "There is a door at the back of the inn. I keep it. I don't know where it goes, only that it is not where you were, and the ones who step through never come back. They are never afraid, after. I have watched ten thousand."

"And the others?"

"Won't go." Her mouth trembles. "Mr. Crowe. Miss Lisle. My Albie. They can't *quite*. And so I keep the fire."

From below, from the cellar, from the dark under the floor, there comes a long, slow scraping, like a hand dragged across stone.`,
      choices: [
        { text: '"What is in the cellar?"', to: 'pell_cellar' },
        { text: '"I want to help them. All of them."', to: 'pell_help' },
        { text: '"Show me the door."', to: 'last_door' },
      ],
    },
    pell_cellar: {
      caption: 'Mrs. Pell',
      text: `"What's left," says Mrs. Pell, "when someone refuses to go for long enough. Grief that has turned. It is the thing the others will become, if they wait much longer. It is hungry. It tells them *stay, stay, there's nothing out there*. It has been in the cellar since the fire."

She wrings her apron.

"I can't send it away. I can only keep the bolt shot. And pray that the poor ones go on before the bolt gives. Albie's the oldest. Every year the thing is hungrier. Every year, it sounds more like *him*."

"Like Albie?"

"Like my boy," says Mrs. Pell, "when he was calling for me, in the fire. It is very cruel. It knows which voice to use."

Her face breaks, and you step forward before you think, and put your arms around her, and she feels like a bundle of warm kindling, like a bird, like a mother.

"You're a good one," she says into your coat. "You always were."`,
      choices: [
        { text: 'Promise to help.', to: 'pell_help' },
        { text: '"Show me the door."', to: 'last_door' },
      ],
    },
    pell_help: {
      caption: 'Mrs. Pell',
      text: `"Oh," says Mrs. Pell. "Oh, would you? I had not dared to ask." She lifts her hands, and there is a fierce, wild, helpless hope in her face, like a flame that has been told it may blaze. "They each have a little thing, you see. A small, sad, unfinished thing. If you could only *give* it back. If you could just show them. They would go. I *know* they would."

She ticks them off on her fingers.

"Mr. Crowe, you must show that he is dead. He'll only believe a thing he can hold. Miss Lisle is waiting for a husband who has already gone ahead; the ledger will tell her so. And my Albie..." She cannot say it. She presses her lips together. "Albie wants only his horse."

You have it. You have all of them. You have had them since the first hour. A shard of mirror, a ledger, a toy. All the things you were *given*, without knowing, and for what.

The clock in the corner of the common room, in the distance, begins to strike.`,
      choices: [
        { text: 'Go to the common room.', to: 'common_final' },
        { text: 'Go and wait for midnight.', to: 'midnight' },
      ],
    },
    common_final: {
      scene: '🔥👥🕯️',
      caption: 'The Common Room',
      text: `They are all there, in the glow of the fire that gives no heat, as if they had known you were coming. The stout man, the widow, the boy. The room is very still. The long-case clock has begun to chime, a single soft note, stretching like a thread.

You have the horse in one coat pocket, the ledger in your arms, the watch, the shard of glass in your fist. A candle burns in your other hand. You have never in your life felt so frightened.

Who do you go to first?`,
      choices: [
        { text: 'Go to Mr. Crowe.', to: 'free_crowe', if: [{ has: 'shard' }, { has: 'watch' }], lockedHint: 'I need something he will believe. (The watch, and the mirror shard)' },
        { text: 'Go to Miss Lisle.', to: 'free_dorothea', if: [{ has: 'ledger' }], lockedHint: 'I need the ledger.' },
        { text: 'Kneel by Albie.', to: 'free_albie', if: [{ has: 'horse' }], lockedHint: 'There is something he wants from the attic.' },
        { text: 'Go to the door that Mrs. Pell keeps.', to: 'last_door' },
      ],
    },
    free_crowe: {
      caption: 'Mr. Fenwick Crowe',
      give: ['_f_crowe'],
      effects: { sanity: -1 },
      text: `You hold the shard of mirror up so that he can see himself in it, or rather, so that he can see that he cannot. He stares at it, red in the face. He opens his mouth to blare, and no sound comes.

You set the watch in his hand. "It stopped at eleven past eleven," you say, gently. "You were crossing the ford. It was very cold. It was very quick."

"I have a sale in Halifax," says Crowe, in a small clear voice quite unlike his own. He looks at his own wet boots. "I have a wife. *Margaret.* She'll be... she'll be wondering..."

"She will have been told."

The stout man closes his hand on the watch. His shoulders sag. He seems all at once much smaller, and much older, and strangely relieved, like a man who has put down a very heavy case. He stands, adjusts his waistcoat, straightens his back, and says, in a clipped, dignified, utterly un-salesmanlike tone: "I should like to go on, now. If that is quite convenient."

The watch ticks. For the first time in a hundred years, it ticks.`,
      choices: [{ text: 'Walk him to the back door. Then return.', to: 'common_final' }],
    },
    free_dorothea: {
      caption: 'Miss Dorothea Lisle',
      give: ['_f_dorothea'],
      effects: { sanity: 1 },
      text: `You open the ledger to the page and lay it on her knee. She reads it slowly, like a woman translating from a foreign tongue. *Arthur D. Lisle, surveyor. Arrived Dec. 2nd. Departed Dec. 4th. Went on.*

"He was *here*," she whispers. "He came for me."

"He waited two days. And then he went through the door, and he left it open behind him."

The book trembles in her hands. A tear runs down her cheek and falls on the page, and the old brown ink drinks it, and where it lands, below the line, a very faint pencil mark appears. A little heart. And under it, in a hand that is not Mrs. Pell's, a looping, hurried scrawl: *Dorothea: I'll be on the other side. Take your time. —A.*

She laughs. It's a great glad ragged sound, half a sob.

"Oh," says Dorothea. "Oh, the *fool*. He was never on time for anything."

She rises. She smooths her black skirt. And for a moment, in the firelight, she is a young woman in a pink dress, on a station platform, with a hat in her hand, waving.`,
      choices: [{ text: 'See her to the door. Then come back.', to: 'common_final' }],
    },
    free_albie: {
      caption: 'Albie',
      give: ['_f_albie'],
      effects: { sanity: 2 },
      text: `You take the little horse from your coat and set it in his lap. He looks down at it. He does not touch it. The whole room waits.

Then he picks it up, with two hands, as one lifts a bird, and holds it to his chest, and shuts his eyes. A tear the size of a bead runs down through the soot on his cheek.

"*Thank you*," says Albie. It is the only word he has said in a hundred and seventy years. It is a small clear voice, like a church bell heard across water. "I've been looking so long. I couldn't go without him. He's Jess. He's never been left alone."

From the kitchen door comes a cry, quickly smothered. Mrs. Pell, standing white to the lips, with her apron in her fists.

"Mam," says the boy. "I can go now. It's all right. Will you come?"

"I can't, love," says Mrs. Pell. "Somebody has to keep the door."

He nods, gravely. He kisses her, once, on the cheek. And then he walks, with the horse in his arms, through the kitchen, toward the back of the house, a very small boy on a very long journey.`,
      choices: [{ text: 'Hold the door for him. Then return.', to: 'common_final' }],
    },
    cellar_door: {
      scene: '🚪⛓️🕯️',
      caption: 'The Cellar Door',
      effects: { candle: -1 },
      text: `Squat and black and banded with iron, with a bolt shot home and a ring cold as an eel. When you press your ear to the wood you hear nothing. When you press harder, you begin to hear *something*, very faint, very far down: a voice.

A child's voice, calling. *Mam. Mam. Mam, it's hot. Mam, come and get me.*

Your hand is on the bolt before you know it. The iron burns, though it is cold. The voice grows louder, and sweeter, and closer, and now it is not a child's, but your sister's, saying your name, and now Mrs. Pell's, and now the voice of your own mother, dead twenty years, singing the lullaby she sang when you were ill.

*Open the door. We're so cold. Won't you let us in?*`,
      choices: [
        { text: 'Draw the bolt. Go down.', to: 'cellar_down', if: [{ has: 'cellar_key' }], lockedHint: 'The door is locked, as well as bolted. (The cellar key)' },
        { text: 'Pour a line of salt on the sill.', to: 'cellar_salt', if: [{ has: 'salt' }], lockedHint: '' },
        { text: 'Step back. Block your ears.', to: 'hub', effects: { sanity: -1 } },
      ],
    },
    cellar_salt: {
      caption: 'The Salt',
      effects: { sanity: 2 },
      text: `You break the cord and pour the salt in a line across the threshold. The voice, at the first grain, gives a small gasp, almost a hiss, a sound like water on a hot stove. The pressure on the bolt eases. The pleading falls away, voice by voice, into a low sullen mutter.

You sit down on the floor with your back against the wall and your heart in your throat and you breathe, which is a funny thing, for the dead, to do. Nobody tells you how much comfort there is in a habit.

For the moment, the thing below has been held. It will not stay held. You can feel it testing the edges of the line, patient as the tide.`,
      choices: [{ text: 'Get up. There is still the night to get through.', to: 'hub' }],
    },
    cellar_down: {
      scene: '🕳️🕯️👹',
      caption: 'The Cellar',
      effects: { candle: -2, sanity: -2 },
      text: `The key turns. The bolt slides. And the door opens on a stair of wet stone, going down into a darkness that is not an absence of light but a presence: a thick, black, humming dark, a velvet with a pulse.

You go. You tell yourself you are only looking. Your candle burns smaller with every step, thinning to a blue bead, as though something below were breathing it in.

At the bottom, a cellar like a cathedral crypt. Barrels. Webs. The remains of a fire, a long time cold, with blackened beams collapsed across the floor. And in the middle of it, a shape. A tall slow patient thing, made of shadow and cinder, with a thousand mouths, each calling softly in a different voice, and a hollow where a face should be.

It turns toward you. It has been waiting a long time, and it is so glad.`,
      choices: [
        { text: 'Fling the salt at it.', to: 'hollow_salt', if: [{ has: 'salt' }], lockedHint: '' },
        { text: 'Listen. Let it speak.', to: 'hollow_listen' },
        { text: 'Run for the stair.', to: 'hub', effects: { sanity: -2 } },
      ],
    },
    hollow_salt: {
      caption: 'The Hollow Man',
      effects: { candle: -1, sanity: 1 },
      take: ['salt'],
      text: `The salt goes out in a white fan. Where it falls, the dark shrieks. A hundred voices rise in a single wail, and the shape recoils, folding in on itself like paper over a flame, into the corner behind the barrels, and there it stays, coiling, flickering, resentful.

It does not die. It cannot. It is not that sort of thing. But it is *held*.

You stand with your pulse (you have no pulse) hammering, the bag empty in your hand. The dark begins to creep back along the floor toward your feet, patient as water. You have bought yourself a minute. Perhaps two.

"*Please*," says the thing, in a small, wet, cajoling, childish voice. "*Please don't go. I've been so lonely.*"`,
      choices: [
        { text: 'Retreat, up the stair, and bolt the door behind you.', to: 'hub' },
        { text: 'Stay a moment. Hear it out.', to: 'hollow_listen' },
      ],
    },
    hollow_listen: {
      caption: 'The Hollow Man',
      effects: { sanity: -2 },
      text: `It speaks in a dozen voices at once, and slowly, they harmonise, until it is only one: low, sweet, reasonable, intimate, a voice like a hand on the back of the neck.

"*It's so cold out there,*" it says. "*Isn't it? It's so very far. And you've done so well. You've walked so long. Why should you go on, when you could stay? Nobody asks anything of you here. There's a fire, and a bed, and a room that is always aired. And I would never ask you to leave.*"

It is the most tempting thing you've ever heard. It knows exactly what you want. It is, you think, *grief*, only grief, a mountain of it, with all the want left in and the dying taken out.

"*Give me your name,*" it says tenderly. "*Just the name. I'll keep it safe. I'll wear it like a coat. And you'll never have to be afraid again.*"

Somewhere above you, in the common room, a clock strikes. It has been striking for a long, long time.`,
      choices: [
        { text: '"Take it."', to: 'end_hollow' },
        { text: '"No. You do not get my name."', to: 'hollow_refuse' },
      ],
    },
    hollow_refuse: {
      caption: 'The Hollow Man',
      effects: { sanity: 1, recall: 1 },
      text: `"No," you say.

It's a small word. It comes out very clear in the black. The nearest mouths stop in the middle of their sentence, one by one, like a row of birds struck silent by a cat.

"I am not going to stay," you say. "And I'm not going to give you what's mine. I'm tired, and I'm frightened, and I think I'm dead, but I'm not going to be *eaten*. There are four people upstairs who would give anything to be where I'm going. If you want my name, you'll have to come up the stairs and take it, in front of Mrs. Pell. I don't think you will."

The darkness hangs there a very long moment. Then, with a faint, wet, thwarted sigh, like a tide going out, it draws back into its corner and lies there, coiled, watching.

You walk up the stair. You don't look back. When you reach the top, you realise, slowly, that your knees are shaking, and that you have been smiling all the way.`,
      choices: [{ text: 'Shut the door. Bolt it.', to: 'hub' }],
    },
    midnight: {
      scene: '🕛🌨️🚪',
      caption: 'Midnight',
      text: `The clock in the corner strikes twelve at last, a deep, slow, hollow chime that you feel in the floor, in the walls, in the blood you no longer have.

On the twelfth stroke, someone knocks at the front door.

Three knocks. Even. Patient. *Rap, rap, rap.* The sound is wood on wood, a knuckle's worth. It is not a loud knock. It is the knock of someone who has been walking for a very long time, and does not intend to stop.

Mrs. Pell stands in the kitchen door with her hands in her apron, and her face is the colour of paper. "Don't," she says. "Don't answer. I do beg you. It is so hard when they come with names."

The knocking comes again. Then a voice, small and raw with cold and weeping, on the far side of the door. A woman's voice, which you would know in the dark, in the grave, in the middle of the sea.

"*Please*," it says. "*Please. Is anyone there? I'm looking for my brother. He's very tall, and he's got a limp. Please. He's been gone since this morning.*"`,
      choices: [
        { text: 'Open the door.', to: 'knock_answer' },
        { text: 'Put your hand on the wood. Say nothing.', to: 'knock_ignore' },
        { text: 'Turn away. There is still work to do.', to: 'hub' },
      ],
    },
    knock_ignore: {
      caption: 'Ada',
      effects: { sanity: -2, recall: 1 },
      text: `You put your palm flat on the door, and the wood is warm, and on the other side there is another palm, you would swear it, laid precisely against yours, the pressure of a living hand.

"Please," says Ada, so softly. "I know you're in there. I can feel it. I'm so tired, and so cold, and if you aren't, I don't know what to do."

Every instinct you have says *answer*. You close your eyes. You think: *if I open this door, I will go out onto the moor, and I will not come back.* You think: *if I open it, I will be near her.* They are the same thought. They are not the same thought at all.

"I love you," you say. You say it into the wood, in a whisper that cannot cross it. "I'm sorry. I am so very sorry. Go home."

On the other side, after a very long time, a slow shuffle of feet. A sound of someone getting back onto a cart. Then nothing but the wind.`,
      choices: [{ text: 'Wipe your eyes. Go on.', to: 'hub' }],
    },
    knock_answer: {
      caption: 'Ada',
      text: `The door swings in. And there, in the whirling white, is nothing. No cart. No sister. No lantern. Only the moor, wide and glittering and endless, and a single set of footprints leading away, shallow and clear, toward the horizon.

*Yours.*

You step over the threshold before you know you have moved. The snow is soft under your boots. It's quite warm. And far away across the white, small as a spark, you see a lantern, and you begin to walk toward it, and you do not look back.

Behind you, very faintly, you hear Mrs. Pell cry out. The door does not close. It cannot. You have gone through a door that is not hers.`,
      choices: [{ text: 'Keep walking.', to: 'end_escape' }],
    },
    last_door: {
      scene: '🚪✨🕯️',
      caption: 'The Back Door',
      text: `At the end of a short passage behind the kitchen, past the coat pegs and the lamp-oil and the boots of ten thousand guests, there is a door.

It is a plain, narrow, battered door of grey wood, with an iron latch worn to silver by a million hands. You would not look twice at it. There is a thin line of light under it, not yellow, not white, but the colour of a very early morning, before the sun.

Mrs. Pell stands beside you with her hands folded. She is not smiling. She is not weeping. She has the look of a woman at a harbour wall.

"I never see what is on the other side," she says. "I never have. It is not my door. But I have watched ten thousand go through, and not one has looked back with anything but wonder."

The light under the door moves, slowly, like breath.`,
      choices: [
        { text: 'Lift the latch. Go on.', to: 'end_pass', if: [{ stat: 'recall', min: 5 }], lockedHint: 'I do not know myself well enough yet to go. (Recall 5)' },
        { text: 'Stay. Keep the door in her place, and set the others free.', to: 'end_keeper', if: [{ has: '_f_crowe' }, { has: '_f_dorothea' }, { has: '_f_albie' }, { has: 'ledger' }], lockedHint: 'There are others still to free before I could stay. (Crowe, Dorothea, and Albie)' },
        { text: 'Go back to the hall.', to: 'hub' },
      ],
    },
    end_pass: {
      scene: '🚪🌅✨',
      text: `You lay your hand on the latch. It is warm.

"Thank you," you say, to Mrs. Pell. "For the fire."

"It was no trouble," she says. "It never is."

The latch lifts. The door opens inward, onto a morning. A grey dawn breaking on a long cold road, but a road that runs *down*, now, instead of up, toward a valley full of lamplit windows, toward the faint sound of a river, toward something very far and very familiar, like a song you half remember from the cradle. The air is sweet. The snow has stopped.

On the road, a long way off, two small figures are waiting. One of them is a stout man with a watch. The other is a slim woman in pink, with a hat in her hand. They wave. They are laughing.

You are not afraid. That is the surprising thing: you are not afraid at all. You step over the threshold, and the door closes quietly behind you, and the inn, the high moor, the cold, fall away like a coat dropped from the shoulders.

Behind you, in the quiet, Mrs. Pell sits down at the hearth. She picks up her knitting. A moment later, someone knocks at the front door. She sighs, smiles, and rises to let them in.`,
      ending: { title: 'The Last Inn', kind: 'good', score: 800 },
    },
    end_keeper: {
      scene: '🕯️🚪🏚️',
      text: `"No," you say. "Not yet. Let *her* go."

Mrs. Pell stares. "I couldn't. I've never. Someone has to keep it."

"Then I'll keep it." You take the apron off its peg. It is warm. It smells of woodsmoke and onions. "I'm a very good listener. I know what it is to be afraid of the door. I'll sit by the fire and I'll let them come in, and I'll make the soup, and I'll give them back the things they lost. And when they're ready, I'll tell them it's all right. And you'll go and find your boy."

She is weeping openly now, with her hands over her face, and then she is laughing, wildly, joyfully, the laugh of a woman who has been told a prison is only a house. She kisses you on both cheeks. She takes her bonnet from its hook, a very old bonnet with a faded ribbon, and, at the door, she turns to look back at the long warm hall and the fire that gives no heat.

"It's the dreadfullest job in the world," she says. "I'd not give it up for a kingdom. You'll see."

She lifts the latch. A grey and golden morning pours in. She walks into it, a small square woman in a brown dress, with her arms already open, and in the distance a boy runs up the road with a wooden horse.

You close the door. You light the lamp over the sign. In the morning, when the snow lifts, a wagon will come down the road, and a woman will find a milestone, and a body, and weep.

And then you will have a guest.

*THE GALLOWS & LANTERN*, says the sign. *Come in out of that. You'll want a fire.*`,
      ending: { title: 'The Keeper', kind: 'secret', score: 1200 },
    },
    end_escape: {
      scene: '🌨️🔦🌌',
      text: `The lantern is always a little farther than it seems. You walk toward it across a moor that does not end. The snow is soft, the cold only a rumour, and the glow ahead is as warm as a hand. You think: *I'll reach it soon.* You think: *she'll be there.*

You never do. You never will. Some nights the lantern is just over the next rise. Some nights it is a mile off. You've lost track of the nights. You walk, and you walk, and you call a name into the wind, and it is not always clear whose name it is, or who is calling to whom.

Travellers on the high road, in winter, sometimes catch sight of you. A tall thin shape at the edge of the lamplight, always going away, with snow in his hair and a limp. They have a name for you now. They say it quietly, in the taverns, with a glance at the door.

*The Walker of the Moor.*

Sometimes, very faintly, from far behind you, there is the sound of a bell. A small clear note, like a kettle on a stove. It is the inn, calling you back. Mrs. Pell has never taken the light from the window.

But the door is open. You have gone through the wrong one.`,
      ending: { title: 'The Walker of the Moor', kind: 'neutral', score: 250 },
    },
    end_hollow: {
      scene: '👤🕯️🕳️',
      text: `"Take it," you say.

It is the easiest thing you have ever done. A breath, a sigh, a small clean giving, like putting down a stone you had not known was so heavy.

*Thank you*, says the dark, in your own voice, with such sweetness. It slides up the stair like a flood. It stands in the doorway of the common room, wearing your coat and your boots and your face, with its tin lantern held in a gloved hand, and it smiles at Mrs. Pell, and she steps back with a thin high cry.

"Good evening," says the thing in your skin. "I'm so sorry to trouble you. I've come a long way. Might I have a bed?"

You are in the cellar now. You do not mind. It is very quiet. A good many people have joined you down here: a stout man with a watch, a woman in black, a small, hot, soot-faced boy. You sit with them in the dark, and nobody speaks, and every night somebody upstairs, somebody wearing a stolen name, opens the door to the next traveller on the high road.

*Come in out of that.* It's your voice. *You'll want a fire.*

You do not remember what you were called.`,
      ending: { title: 'A Borrowed Face', kind: 'bad', score: 100 },
    },
    end_madness: {
      scene: '🪞👁️🌀',
      text: `It is not any one thing. It is the way the clock keeps *striking*, the way the candle flames lean, the way the dead are so *polite*. It is that your own hand is translucent, now, and the fire casts no shadow, and the soup tastes of nothing, and there are so many doors in this house, and not one of them goes anywhere you can name.

Something in your head, a thin taut wire you had not noticed was holding up the roof, gives, with a small musical *ping*.

You begin to laugh. It is a good laugh, high and bright and unstoppable, and you cannot stop, even as Mrs. Pell lays a hand on your shoulder and says *dear, dear*. You laugh at the clock, at the stove, at the moor. You laugh at the guest ledger, with its tidy columns, *Arrived, Departed, Went on*. You laugh at Mr. Crowe's sale in Halifax. You laugh until you are crying and then you are not sure which.

They put you in Room Seven, at the top of the stair, with the good window and the mirror and the bottle in the bed. You are very quiet, there, after a bit. You sit at the glass. You smile at the stranger in it, who is not you, who is not anyone, who is the eighth guest of the Gallows & Lantern.

*It's all right*, says the stranger, in your own voice. *You're not alone. I'm here.*

The clock strikes eleven past eleven.`,
      ending: { title: 'The Eighth Guest', kind: 'bad', score: 120 },
    },
    end_dark: {
      scene: '🕯️🌑👁️',
      text: `The candle gutters. You cup your palm around it, and breathe, which is what the living do, and it does not help, and the flame shrinks to a blue bead, to a spark, to a red thread in the dark.

And goes out.

It is quite impossible to say what the dark is like. It is not black. It is *occupied*. It has a texture like felt and a smell like a wet church, and it comes close, close, until it is just behind the ear and in the mouth, and it whispers, with great kindness, in a voice like Mrs. Pell's: *There, now. That's better. You don't need the light. It was never yours.*

You try to scream. The dark gets into the sound. You try to find the door. There are only walls, and the walls are soft.

Mrs. Pell finds your lantern in the morning, in the hall, burned down to a smear of tallow in a tin cage. She stands over it for a long while with her apron in her fists. Then she sets it on the sill of Room Seven, with a fresh wick, and a card in her careful copperplate.

*For the next one. Do keep it lit.*`,
      ending: { title: 'Lights Out', kind: 'bad', score: 110 },
    },
  },
} satisfies Story

export default story
