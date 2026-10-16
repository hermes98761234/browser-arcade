import type { Story } from './types'

const story = {
  id: 451,
  title: 'Lost in the Library',
  blurb:
    'You came to return a book thirty-one years overdue. The door behind you has become a shelf, the shelves go on forever, and something in the stacks is eating the last pages of every story. Find your way out, or find out why you were never meant to leave.',
  items: {
    overdue: '📕 The overdue book',
    brasskey: '🗝️ Brass key',
    thread: '🧵 Red ribbon',
    map: '🗺️ Map of nowhere',
    card: '🗂️ Card 000.0',
    blankpage: '📄 A blank page',
    quill: '🪶 Nameless quill',
    tallow: '🕯️ Tallow stub',
  },
  stats: {
    lamp: { label: 'Lamplight', emoji: '🏮', start: 6, min: 0, max: 8, onMin: 'end_shelved' },
    wits: { label: 'Wits', emoji: '🧠', start: 4, min: 0, max: 10 },
    memory: { label: 'Memory', emoji: '📖', start: 7, min: 0, max: 10, onMin: 'end_forgot' },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '📚🏛️🕯️',
      caption: 'The Return Desk',
      give: ['overdue'],
      text: `The Municipal Library closes at six, and you reach its steps at 5:58, which is how you have arrived at most things in your life: breathless, and almost too late.

In your coat pocket is a book you should have returned thirty-one years ago. *A Concise History of Tomorrow*, the spine still stamped with your childhood card number. You found it last week behind a radiator, and the due date inside, in faded violet ink, turned your stomach over like a coin.

The foyer is empty. The clock above the Return Desk has stopped at a quarter to nowhere. Where a clerk should be there is only a brass bell and a hand-lettered card: *PLEASE RING. WE WILL FIND YOU.*`,
      choices: [
        { text: 'Ring the bell.', to: 'bell' },
        { text: 'Post the book through the return slot and leave.', to: 'slot' },
        { text: 'Look through the desk drawers.', to: 'desk' },
      ],
    },
    bell: {
      text: `The bell has a small, clean voice. It rings once, and the note keeps going, past the walls, past the foyer, down some long throat of stone you did not know was there. Far away, many pages turn at once, like birds lifting off a field.

Nobody comes. When you turn back to the door, the door is not there.

It is a shelf. Not a door painted as a shelf, not a trick of the light: a floor-to-ceiling oak shelf, solid with books, their spines dusty and faintly warm, as if someone has only just stopped reading them.`,
      choices: [
        { text: 'Press your palms to the shelf and push.', to: 'shelf' },
        { text: 'Search the desk for anything useful.', to: 'desk' },
      ],
    },
    slot: {
      text: `The slot swallows the book with a sound like a held breath. You turn to leave, relieved, absurdly light, and the slot coughs it straight back onto the desk, along with a slip of paper in a hand so tidy it is almost cruel.

*INCOMPLETE. This volume cannot be accepted until finished. Please see the Index.*

You read it twice. Behind you, with no sound at all, the front door has been replaced by a wall of books.`,
      choices: [
        { text: 'Pick up the book. It is still yours, apparently.', to: 'shelf', effects: { wits: 1 } },
      ],
    },
    desk: {
      caption: 'The Return Desk',
      text: `The drawers are a small museum of other people's afternoons: rubber stamps, a thousand bookmarks, a jar of pencil stubs chewed by generations of nervous readers. Taped under the lowest drawer, where a thief would never look because a clerk would never forget, is a brass key on a loop of green wool.

A tag in the same tidy hand: *For the door that is not a door.*

You pocket it. There is also a stub of tallow candle, and the cheerful stupidity of lighting it fills you with an obscure courage.`,
      give: ['brasskey', 'tallow'],
      choices: [
        { text: 'Ring the bell.', to: 'bell', if: [{ not: '_belled' }], lockedHint: '' },
        { text: 'Try the door.', to: 'shelf' },
      ],
    },
    shelf: {
      scene: '🚪📚🔦',
      caption: 'The Door That Is a Shelf',
      give: ['_belled'],
      text: `The shelf does not move, but it does open, the way a conversation opens when you finally say the true thing. A seam of lamplight runs down the middle of the books, and the volumes on either side slide apart without a sound.

Beyond is a corridor. Not a room: a corridor, narrow and gold, with shelves rising on both sides into a darkness so high that the ceiling is only a rumour. The floor is worn into two shallow grooves, the tracks of centuries of feet.

There is no way back. You check. You are the sort of person who checks.`,
      choices: [{ text: 'Walk into the library.', to: 'gallery' }],
    },
    gallery: {
      scene: '📚🏮🪜',
      caption: 'The Long Gallery',
      text: `You walk for what feels like ten minutes and is probably longer. The shelves do not repeat. That is the first thing you understand about the place: no two spines are the same, and none of them is a copy. Every book here is the only one.

The gallery opens into a crossing of four ways. To the left, a brass sign reads **WEATHER**, and the air that comes from it is damp. Ahead, a spiral stair climbs into the dark. To the right, a faint sound of purring and the smell of old ink. And at the end of a hall of enormous drawers, a door under the words **CATALOGUE**.

Your lamp is a small, loyal thing. It will not last forever.`,
      choices: [
        { text: 'Follow the purring.', to: 'footnotes' },
        { text: 'Turn left, toward the damp air.', to: 'weather' },
        { text: 'Climb the spiral stair.', to: 'stairs' },
        { text: 'Walk to the Catalogue.', to: 'catalogue' },
        { text: 'Light the tallow stub from your lamp.', to: 'gallery', if: [{ has: 'tallow' }], take: ['tallow'], effects: { lamp: 3 }, lockedHint: '' },
      ],
    },
    footnotes: {
      scene: '🐈‍⬛🪶📚',
      caption: 'The Hall of Footnotes',
      text: `The Hall of Footnotes is lined with tiny books, none bigger than a thumb, and every one of them is a note to some larger book elsewhere.

On a lectern sits a cat. She is the exact black of ink, with a white blot on her chest like a spill, and when she blinks her eyes leave faint trails of gold in the air. She looks at the book in your hand.

"You're the overdue," she says. Her voice arrives a half-second late, as if from the bottom of the page. "I'm Marginalia. I don't bite readers. *Much.*"

*The asterisks, you realise, are audible.*`,
      choices: [
        { text: '"Can you tell me how to get out?"', to: 'cat_riddle' },
        { text: 'Bow slightly, as to a cat of rank.', to: 'cat_riddle', effects: { wits: 1 } },
        { text: 'Back away and return to the crossing.', to: 'gallery' },
      ],
    },
    cat_riddle: {
      caption: 'Marginalia',
      text: `"Out," Marginalia says, tasting the word. "A very small word for a very large wish. Nobody leaves the library. They are returned, or they are *shelved*, or they stay on as staff. Which are you?"

She flicks her tail and a tiny footnote blooms in the air beside it: *Answer carefully.*

"A riddle first, since you ask like a person with manners. What is it that you can only keep by giving away, and can only finish by beginning?"`,
      choices: [
        { text: '"A story."', to: 'cat_ally' },
        { text: '"A promise."', to: 'cat_ally', if: [{ stat: 'wits', min: 5 }], lockedHint: 'You do not feel clever enough to be that bold. (Wits 5)' },
        { text: '"A secret."', to: 'cat_leave' },
      ],
    },
    cat_ally: {
      caption: 'Marginalia',
      give: ['_cat'],
      effects: { wits: 1, lamp: 1 },
      text: `Her pupils swell like two black moons. "Both," she says, and for the first time something unguarded crosses her face. "A story is a promise to a stranger. Nobody has said so in ninety years."

She leaps down, rubs once against your shin (you are suddenly warmer, and your lamp burns a notch brighter, as if embarrassed), and tells you what she knows.

"Three things. The Index will tell you what you can't ask anyone else, but its door is locked. The Silent Wing is quicker, but the Shushers do not like footsteps. And something is eating the endings." Her tail goes stiff. "Not the beginnings, mind. The *endings*. The last pages. That is why nobody can finish anything here."

"I will walk with you as far as the gallery. Cats are not permitted beyond it. We are considered a distraction."`,
      choices: [
        { text: 'Thank her and return to the crossing.', to: 'gallery' },
        { text: 'Ask about the maps she smells on you.', to: 'maproom', if: [{ not: 'map' }], lockedHint: '' },
      ],
    },
    cat_leave: {
      caption: 'Marginalia',
      effects: { wits: -1 },
      text: `"A secret," Marginalia says, and yawns, a wide, pink, theatrical yawn. "Everybody says a secret. You can only keep a secret by *not* giving it away. It was a trick question, but it was a good deal worse as a trick than as a lesson."

She turns her back on you with the whole of her small body. Above her head a footnote drifts away like a dandelion seed: *Clever is not the same as kind.*

You are left with the smell of ink and a vague, annoying sense of having failed an exam you were not told you were taking.`,
      choices: [{ text: 'Go back to the crossing.', to: 'gallery' }],
    },
    weather: {
      scene: '🌧️📚☔',
      caption: 'The Reading Room of Rain',
      text: `The Reading Room of Rain is shelved by weather. Fog novels, drizzle poetry, a long wall of storm diaries bound in grey cloth, with a gentle perpetual drip falling from somewhere you cannot see. The reading lamps are green and the chairs are wet and, for a reason you cannot name, you want to sit in one and cry.

A man is sitting in one of the chairs. His coat is the colour of the room. He does not look up, but he says, in the tone of someone who has said it many times, "Excuse me. Do you have the time?"

The clock over the door has no hands.`,
      choices: [
        { text: 'Sit beside him and listen.', to: 'tolliver' },
        { text: 'Pull a storm diary from the shelf.', to: 'rain_book' },
        { text: 'Go through the far door, toward the sound of turning letters.', to: 'alphabets' },
        { text: 'Return to the crossing.', to: 'gallery' },
      ],
    },
    tolliver: {
      caption: 'Mr. Tolliver',
      text: `His name, he thinks, is Tolliver. He came in for the last volume of a series of nature guides, on a Thursday, to read about herons. He remembers the herons very clearly. He does not remember why.

"I think I have a daughter," he says. "I think she would be, what, forty? I have a list of her habits, somewhere. I keep reading the same page, you see, and every time I reach the end it's gone. The last line, I mean. Eaten."

His hands, you notice, are almost transparent at the fingertips. Gently, like pages that have been handled too much.

"If you could lend me a bit of yours," he says. "Just a corner of memory. A day. I'd give it back."`,
      choices: [
        { text: 'Give him a memory of your own.', to: 'tolliver_help' },
        { text: 'Tell him you are sorry, and mean it, and go.', to: 'tolliver_leave' },
      ],
    },
    tolliver_help: {
      caption: 'Mr. Tolliver',
      effects: { memory: -2, wits: 1 },
      give: ['thread'],
      text: `You think of a Saturday: a market, your sister's fist locked in your coat pocket, a pear that tasted like rain. You let it go the way you would let go of a balloon. Something in your chest unhooks.

Tolliver breathes in as if he had been underwater. "Herons," he says, wonderingly. "My daughter's name is Perpetua. She was afraid of them."

His hand closes around yours; it is warm and solid now. From his lapel he unpins a ribbon of red silk, a bookmark, and ties it around your wrist.

"That's the thread of the thing you are reading. If you hold it, the Library cannot make you forget where you were going. Find my daughter if you can. And whatever you do, don't take the quill when she offers it."

*She?* you think, and he is already asleep, smiling.`,
      choices: [{ text: 'Walk on, a little lighter, a little poorer.', to: 'weather2' }],
    },
    weather2: {
      scene: '🌧️🕯️📚',
      caption: 'The Reading Room of Rain',
      text: `The rain is softer now, or you are listening to it differently. There is a door to the far side and a way back to the crossing. On the lowest shelf, under a pamphlet called *Why Umbrellas Disagree*, there is a candle stub that somebody was saving for later.`,
      choices: [
        { text: 'Take the candle, and go through the far door.', to: 'alphabets', give: ['tallow'], if: [{ not: 'tallow' }], lockedHint: '' },
        { text: 'Through the far door.', to: 'alphabets' },
        { text: 'Return to the crossing.', to: 'gallery' },
      ],
    },
    tolliver_leave: {
      caption: 'Mr. Tolliver',
      text: `"Of course," says Tolliver, nodding as if you had paid him a compliment. "Of course. Most people can't. They think it's like lending money."

He goes back to his page. The rain keeps its own patient time. When you reach the door you hear him say to the empty chair, softly, as if for the first time: "Excuse me. Do you have the time?"`,
      choices: [
        { text: 'Pull a storm diary from the shelf.', to: 'rain_book' },
        { text: 'Go through the far door.', to: 'alphabets' },
        { text: 'Return to the crossing.', to: 'gallery' },
      ],
    },
    rain_book: {
      caption: 'A Storm Diary',
      effects: { memory: -1, wits: 1 },
      text: `The diary belonged to a lighthouse keeper, and every entry is the weather: *Wind SW, 40 knots. Rain. Bread gone.* *Wind SW. Rain. Dog restless.* But the longer you read the more the weather begins to mean other things. *Wind SW* is the day the letter did not come. *Rain* is the long weeks of not asking.

You read the last entry. It is only half a sentence. *The sea is calm and I have decided to—*

The rest has been cut away, neatly, as if by a very small and hungry mouth. The torn edge is damp, and smells of cut paper and something sweeter underneath. Not mould. Honey?

You close the book. You have the odd feeling that one of your own mornings has fallen between its pages.`,
      choices: [
        { text: 'Return to the room.', to: 'weather' },
      ],
    },
    stairs: {
      scene: '🪜📚🌙',
      caption: 'The Spiral Stair',
      effects: { lamp: -1 },
      text: `The stair winds up and up and your lamp throws your shadow before you, a tall thin servant carrying your fear for you. At every turn there is a landing and a door and a plaque: *Poetry of Unrequited Things. Cookery for Emperors. Maps That Lie.*

On the thirtieth landing you stop counting, and on the hundredth you stop minding. There is a window.

It is not a window onto the night. It is a window onto a *balcony*, and the balcony looks over the whole library at once.`,
      choices: [
        { text: 'Step out onto the balcony.', to: 'balcony' },
        { text: 'Try the door marked *Maps That Lie*.', to: 'maproom' },
        { text: 'Go back down.', to: 'gallery' },
      ],
    },
    balcony: {
      scene: '🌌📚🏮',
      caption: 'The Balcony',
      text: `You have never seen anything so large. The library falls away beneath you in terraces of lamplight, ring upon ring, a vast shell of books spiralling down to a floor you cannot see and up to a ceiling that is not there. Tiny lights move along the galleries: readers, shades, shelvers, who knows.

Far below a part of the dark moves in a way that dark should not. A long, pale, segmented movement, slow as a tide. Wherever it passes, the lamps on the shelves go out and, a moment later, relight, a little dimmer.

At the highest point of the spiral, very small, a single window glows yellow. A tower with its lights on.

Somebody is expecting you.`,
      choices: [
        { text: 'Lean over the rail for a better look at the moving dark.', to: 'vertigo' },
        { text: 'Take the iron ladder down to the Lost and Found, whose sign you can just read.', to: 'lostfound' },
        { text: 'Take the ladder toward the moving dark.', to: 'burrow' },
        { text: 'Go back to the crossing.', to: 'gallery' },
      ],
    },
    vertigo: {
      caption: 'The Rail',
      effects: { lamp: -2, wits: 1 },
      text: `The rail is cold. You lean, and the library leans with you, and for a moment you understand its shape: not a building but a *sentence*, an enormous, unfinished sentence, every hall a clause, every stair a comma, the whole structure straining toward a full stop it has never been allowed.

Your lamp slips from your fingers and falls, turning, a long gold seed, for so long you begin to count. It does not go out. It simply becomes smaller than anything. You rescue a second, smaller flame from the first in your cupped hands, and cherish it. You will have to be careful with the light now.

You have understood something, though. The library is not infinite because it is large. It is infinite because nothing in it is allowed to end.`,
      choices: [
        { text: 'Climb down by the iron ladder to the Lost and Found.', to: 'lostfound' },
        { text: 'Climb down toward the moving dark.', to: 'burrow' },
        { text: 'Go back down the stairs.', to: 'gallery' },
      ],
    },
    alphabets: {
      scene: '🔤📚📜',
      caption: 'The Hall of Alphabets',
      effects: { lamp: -1 },
      text: `Every hall here is arranged by a different principle, and this one is arranged by regret.

Each shelf bears a letter, and each letter is the first letter of something its books wish they had said. **A** is for *Apologies*, a wall of slim volumes, none of them ever sent. **B** is for *Beforehand*. **F** is for *Father*, and it is very large, and you walk past it quickly, the way you cross the road on the anniversary of something.

The alphabet runs on, shelf after shelf, and at the end of it is an open archway through which a muffled and fussing quiet is coming. A whisper of cloth. Someone, many someones, politely not speaking.`,
      choices: [
        { text: 'Walk the shelf marked **S**.', to: 'letter_s' },
        { text: 'Read a little of **F**, since you are here.', to: 'letter_other' },
        { text: 'Enter the archway into the silence.', to: 'silent' },
        { text: 'Go back to the Reading Room.', to: 'weather' },
      ],
    },
    letter_s: {
      caption: 'S: Sister',
      effects: { memory: 2 },
      give: ['_isolde'],
      text: `The S shelf has one book in it that is yours.

You know before you touch it. It is thin and green, and its spine says *Isolde, Unsent*, in your own handwriting from a Tuesday you have been refusing to remember. It is not a book. It is a letter, several versions of the same letter, paper clipped to paper, each beginning *I'm sorry about what I said at the funeral* and each torn off at the same place, the place where an apology has to turn into a request.

You haven't spoken to your sister for nine years. You told yourself it was over a clock, an inheritance, who got the good chairs. It was never the chairs.

The book is warm. Memory returns the way blood does to a sleeping limb: first agony, then relief.

And you see the thing you have not allowed yourself to see. *A Concise History of Tomorrow* is not a library book. It is the book of this letter. It is overdue because you never finished it.`,
      choices: [
        { text: 'Tuck the green book into your coat beside the other and breathe.', to: 'alphabets' },
      ],
    },
    letter_other: {
      caption: 'F: Father',
      effects: { memory: -2, lamp: -1 },
      text: `You open **F** at random and the library gives you a Sunday, a very precise one, your father in the kitchen with the radio on, humming off the key, a spatula in his fist like a conductor's baton. You had forgotten that he hummed. You are so glad to have it back that it takes you a moment to understand that it is not *your* memory. It is a copy. It is a book about a man like yours. You are reading a stranger's father and mourning him.

When you look up your lamp has dimmed and there is a taste of salt in your mouth. The Hall takes a toll of those who read about the dead.

*Do not browse regret*, says a card tucked into the shelf, in tidy handwriting. *It is addictive.*`,
      choices: [
        { text: 'Pull yourself away.', to: 'alphabets' },
      ],
    },
    catalogue: {
      scene: '🗂️📚🔍',
      caption: 'The Catalogue',
      text: `The Catalogue is a cathedral of drawers. They climb up out of sight on brass ladders, each drawer labelled with a number and a tiny handle shaped like a closed eye. A small clerk-less stillness hangs in the hall.

At the far end is a pair of oak doors, bound in brass, with a keyhole in the shape of a bookmark. A plate reads:

**THE INDEX. Consultations by appointment. All appointments are now.**

A wheeled stool stands by the nearest bank of drawers. The nearest drawer, you notice, is slightly open, and in the gap, as if inside a mouth, is a single yellow card.`,
      choices: [
        { text: 'Search the drawers for something with your name on it.', to: 'card_search' },
        { text: 'Try the great doors.', to: 'index_door' },
        { text: 'Go back to the crossing.', to: 'gallery' },
      ],
    },
    card_search: {
      caption: 'The Drawers',
      text: `Every card tells you exactly where you are in the library, which is not very helpful when you are not sure where the library is. You flip through thousands. *Nothing: see Everything. Everything: see Nothing. Nowhere: see Here.*

You begin to see the system. It is not alphabetical, not by subject. It is by *need*. The cards are ordered by how badly someone, somewhere, wants what they describe.`,
      choices: [
        { text: 'Follow the pattern down to the drawer at the very bottom.', to: 'card_found', if: [{ stat: 'wits', min: 5 }], lockedHint: 'The pattern slips away from you. (Wits 5)' },
        { text: 'Give up, with a paper cut for your trouble.', to: 'catalogue', effects: { memory: -1 } },
      ],
    },
    card_found: {
      caption: 'Card 000.0',
      give: ['card'],
      effects: { wits: 1 },
      text: `The lowest drawer is stuck, swollen with age, and you have to sit on the floor and brace your feet against the next one down. It opens with a bark of wood.

Inside is a single card. It is blank except for a number, 000.0, and a line in a hand you do not recognise, a shaky, pencilled hand, not at all like the tidy librarian's:

*To whoever reads this: it is not a library. It is a reading. Ask the Index who is doing the reading.*

You turn it over. On the back, someone has drawn a tiny, perfect picture of an open book, and above the open book, two eyes.`,
      choices: [{ text: 'Pocket it and return to the great doors.', to: 'index_door' }],
    },
    index_door: {
      caption: 'The Doors of the Index',
      text: `The oak is carved with a thousand faces, all of them mid-sentence. The keyhole is cold under your finger, and the shape of a bookmark.`,
      choices: [
        { text: 'Open the doors with the brass key.', to: 'index', if: [{ has: 'brasskey' }], lockedHint: 'The keyhole wants a key that you have not found.' },
        { text: 'Go back to the crossing.', to: 'gallery' },
      ],
    },
    index: {
      scene: '🗂️🌀✨',
      caption: 'The Index',
      text: `The key turns without a sound, and the doors open onto a room that is mostly a spiral. It starts at your feet and winds up and up, a ribbon of white cards a hand wide, all of it covered in small, perfect writing, rustling like a field of wheat. As you step in, it moves: the whole spiral rotates to bring a particular card to your eye.

*YOU ARE HERE*, says the card. *Welcome, visitor. You have a question, and I have been waiting for exactly it for a very long time.*

There is no face. The cards simply arrange themselves, each answer sliding out before you finish asking.`,
      choices: [
        { text: '"How do I leave?"', to: 'index_way' },
        { text: '"Who is the librarian?"', to: 'index_quill' },
        { text: '"Who is reading this?"', to: 'index_reader', if: [{ has: 'card' }, { has: '_isolde' }], lockedHint: 'You do not yet know enough to ask. (A certain card, and a certain truth)' },
        { text: '"What is eating the endings?"', to: 'index_worm' },
        { text: 'Bow to the spiral and leave.', to: 'catalogue' },
      ],
    },
    index_way: {
      caption: 'The Index',
      effects: { wits: 1 },
      text: `The spiral spins, and a card flutters to the front: *To leave, the overdue must be returned. To return, the book must be complete. The last page is blank.*

A second card slides over it: *You will need a page, something to write with, and something to say. The page is in the Lost and Found. The quill is in the Lost and Found. The sentence is yours alone.*

A third, smaller: *Or you may stay. That, too, is permitted.*`,
      choices: [{ text: 'Ask another question.', to: 'index' }],
    },
    index_quill: {
      caption: 'The Index',
      text: `The cards fly past: *Mistress Quill. Head Librarian. Appointed 1931. Her hours are infinite. She has your best interests at heart. She has your best interests at heart. She has*

The card stutters. Then it lies flat and a different one slides in, softly: *Her tower is at the top. Do not go unprepared. She is not unkind. That is what makes it dangerous.*

A door you hadn't noticed opens at the back of the room, and a stair of cards rises, a staircase of white paper, into the dark.`,
      choices: [
        { text: 'Climb the stair of cards.', to: 'tower' },
        { text: 'Ask another question.', to: 'index' },
      ],
    },
    index_worm: {
      caption: 'The Index',
      text: `For the first time, the cards hesitate. The spiral slows to a crawl.

*In the burrow below the Reading Room of Rain there is a worm. It is very old. It was here before the Library. It eats last pages. This was not always so. It used to eat only the ones that were already dead. Something has changed in its diet. Something has been feeding it.*

A single card detaches itself and drifts onto your palm: *Ask the worm. It will not lie. It has nothing left to hide behind.*`,
      choices: [{ text: 'Ask another question.', to: 'index' }],
    },
    index_reader: {
      caption: 'The Index',
      text: `The spiral stops. All of it, all at once: the whole breathing field of cards goes still, and the quiet is so deep that you can hear your own pulse in your ears.

Then, very slowly, one card turns itself over, as if reluctant.

*You have found the oldest question. Every character asks it eventually. I am permitted to answer it exactly once.*

The card beneath it reads: *Would you like to see?*`,
      choices: [
        { text: 'Yes. Show me.', to: 'end_secret' },
        { text: 'No. Not yet.', to: 'index' },
      ],
    },
    maproom: {
      scene: '🗺️🧭📚',
      caption: 'The Map Room',
      text: `Here the maps lie. Not by accident: it is their whole profession. A map of the sea in which every wave is labelled with the name of a woman. A map of a city whose streets can be walked only on Thursdays. Here a country of exactly one hill; there a mountain range that has been drawn in by someone who has never seen mountains but has heard them described by a man who has.

In the centre, on a round table, a single map lies unrolled and weighted with four stones. It shows the Library. All of it. It is wrong in precisely one place, and the wrong place is marked with a small red cross: a tower, at the top.`,
      choices: [
        { text: 'Take the map of the Library.', to: 'map_take', if: [{ not: 'map' }], lockedHint: '' },
        { text: 'Study the other maps.', to: 'map_fold' },
        { text: 'Leave through the door on the left, which says **SILENCE**.', to: 'silent' },
        { text: 'Go back to the crossing.', to: 'gallery' },
      ],
    },
    map_take: {
      give: ['map'],
      effects: { wits: 1 },
      text: `The map folds itself into your hands the way a cat folds into a lap. It is warm, and it smells of a childhood spent lying on a rug with an atlas. When you unfold it a little, a line of ink crawls across it like a snail and marks the corridor you are standing in with a tiny drawing of a person, your height, with your tired shoulders.

*You are here*, the little person says, and then, politely: *and so is that.*

A second mark, a long segmented smear, lies under the Reading Room of Rain. That, presumably, is the burrow. A third is a faint dotted route from the Silent Wing up to the tower.

The map does not know the way out. But then neither did any map ever.`,
      choices: [{ text: 'Study the other maps while you are here.', to: 'map_fold' }, { text: 'Go back to the crossing.', to: 'gallery' }],
    },
    map_fold: {
      caption: 'Maps That Lie',
      effects: { memory: 1 },
      text: `You find, at the bottom of a pile, a map of your own town. It is slightly wrong. There is an extra street, a lane between the bakery and the bus station, called *Overdue Lane*, and at the end of it is a house you remember from a dream. The windows are lit. There is a little cross on it. Written beside it, in pencil: *She still keeps the porch light on.*

You stand there with the paper in your fingers for a long time. A great many lies, you think, are only truths that have not happened yet.`,
      choices: [{ text: 'Roll it carefully, put it back, and go.', to: 'gallery' }],
    },
    silent: {
      scene: '🤫📚👤',
      caption: 'The Silent Wing',
      effects: { lamp: -1 },
      text: `Silence in the Silent Wing is a physical thing: soft as felt, heavy as snow. Every step you take is swallowed. There are readers here, a few, sitting rigid in their chairs with their lips pressed shut, holding their books like shields. At the end of each aisle, tall, grey, faceless figures glide on slippers made of wool.

The Shushers do not shout. They simply arrive beside whoever has made a sound, lay one long finger on the lips, and wait. The reader goes quiet. The reader goes *very* quiet. The reader, eventually, goes.

A narrow gallery runs along the far wall, climbing to a stair and the tower. All you have to do is cross forty yards of floorboards.`,
      choices: [
        { text: 'Tie the red ribbon around your boots to muffle them.', to: 'silent_sneak', if: [{ has: 'thread' }], lockedHint: 'You have nothing to muffle your steps with.' },
        { text: 'Remember the lessons Marginalia gave you in being quiet.', to: 'silent_sneak', if: [{ has: '_cat' }], lockedHint: 'Someone who knows the Shushers could have helped.' },
        { text: 'Count your steps and walk the gallery on your toes.', to: 'silent_try' },
        { text: 'Retreat.', to: 'alphabets' },
      ],
    },
    silent_try: {
      caption: 'The Silent Wing',
      text: `You are doing well. Eight steps, nine. Then your coat button, a tiny traitor, clicks against the buckle of your satchel.

It is the smallest sound in the world and the whole wing turns toward it.`,
      choices: [
        { text: 'Hold your breath and run.', to: 'silent_caught', if: [{ stat: 'wits', max: 5 }], lockedHint: '' },
        { text: 'Freeze, and slowly cover the buckle with your hand.', to: 'silent_sneak', if: [{ stat: 'wits', min: 6 }], lockedHint: 'You panic. The cool head to do this isn\'t yours. (Wits 6)' },
        { text: 'Raise one finger to your own lips, as they do.', to: 'silent_sneak', if: [{ stat: 'wits', min: 4 }], lockedHint: 'You cannot think of a thing to do. (Wits 4)' },
        { text: 'Surrender.', to: 'silent_caught' },
      ],
    },
    silent_caught: {
      caption: 'The Shushers',
      effects: { memory: -3, lamp: -1 },
      text: `A cool finger lies against your lips. Not unkindly. There is something in the touch like a very old nurse, like a hospital at night. You find that you do not want to speak. Then you find that you do not know what you would have said.

When the finger lifts, a small, sad pouch of words has been removed from you and carried off down the aisle, and you could not say which ones. Your own name is somewhere nearby. You can almost hear it.

The Shusher gives you a small bow, not unlike a doctor's, and walks you to the foot of the gallery stair. You have, at least, been escorted to where you were going.`,
      choices: [{ text: 'Climb to the tower, shaken.', to: 'tower' }],
    },
    silent_sneak: {
      caption: 'The Silent Wing',
      effects: { wits: 1 },
      text: `The Shusher stops six feet away. It tilts its blank face, listening to a sound that is no longer there. It waits. You hold the quiet inside you like a full cup, and carry it forty yards, thirty, twenty, until at last the figure sighs, wearily, as if having been told a joke it didn't get, and drifts away.

You reach the foot of the gallery stair with your pulse hammering in your ears like a drum in a cathedral.

The stair, narrow, wooden, polished by one pair of feet over a very long time, leads up.`,
      choices: [{ text: 'Climb to the tower.', to: 'tower' }],
    },
    lostfound: {
      scene: '🧳📦🔦',
      caption: 'The Lost and Found',
      text: `The Lost and Found is the largest room in the library, and it is the saddest. It holds everything that readers have dropped on their way in: umbrellas, spectacles, loose buttons, a wedding ring on a string, a single child's mitten, hundreds of gloves, an entire shoe. Everything has a luggage tag. Every tag says the same thing, in the same tidy hand: *UNCLAIMED*.

At the back there are two shelves marked **STATIONERY**. A blank page lies on one, curling at the edges. A quill lies on the other, bound with twine. Neither of them looks like anything. They are the sort of things you pick up every day without knowing you are choosing.`,
      choices: [
        { text: 'Take the blank page.', to: 'lf_page', if: [{ not: 'blankpage' }], lockedHint: '' },
        { text: 'Take the quill.', to: 'lf_quill', if: [{ not: 'quill' }], lockedHint: '' },
        { text: 'Climb back to the balcony.', to: 'balcony' },
      ],
    },
    lf_page: {
      give: ['blankpage'],
      text: `The paper is thick, cream, cold at the edges and warm at the middle, as though a hand had been resting there. When you hold it to the lamp it does not show any watermark, only a faint grain, like the grain of a bone.

It is not quite blank, you decide. It is *waiting*.`,
      choices: [{ text: 'Look at the rest of the shelves.', to: 'lostfound' }],
    },
    lf_quill: {
      give: ['quill'],
      text: `You expected a feather. It is a nib of dark horn, on a shaft worn so smooth by use that it has taken the exact shape of somebody's fingers. They are not your fingers. Yours fit too, though. People's do, in the end.

It has no name on it. The label on its twine has been rubbed out by thumbs.`,
      choices: [{ text: 'Look at the rest of the shelves.', to: 'lostfound' }],
    },
    burrow: {
      scene: '🐛🕳️🏮',
      caption: 'The Burrow',
      effects: { lamp: -1 },
      text: `The ladder ends in a tunnel, and the tunnel is a throat. The walls are lined with shredded paper, whole libraries of it, chewed to a fine soft pulp and packed like a nest. You walk on drifts of ended things: *and they lived*, *the end*, *forever after*, shredded, soft, honey-sweet.

The worm is the length of a street. It lies curled around the lowest stack of the library like a river around a stone. Its skin is the white of unwritten paper. When it lifts a head the size of a carriage, its mouth is a ring of tiny, patient teeth, and there is something in its eyes that you can only call hunger and grief.

"You smell," says the worm, in a voice of dry leaves, "of *beginnings*."`,
      choices: [
        { text: 'Hold up the lamp and speak calmly.', to: 'worm_talk' },
        { text: 'Run for the ladder.', to: 'worm_flee' },
      ],
    },
    worm_flee: {
      caption: 'The Burrow',
      effects: { lamp: -2, memory: -1 },
      text: `The worm does not chase. It does not need to. You scramble up three rungs and look back, and the worm is simply watching you, with an expression of unbearable weariness.

You have dropped something. A small piece of your own day, a minute from this morning, perhaps, or a name. The worm lowers its head to eat it, delicately, politely, like a bird at a feeder.

"I am sorry," it says. "I eat what falls. It is not personal."`,
      choices: [
        { text: 'Climb back to the balcony.', to: 'balcony' },
        { text: 'Go back down. You owe it a conversation.', to: 'worm_talk' },
      ],
    },
    worm_talk: {
      caption: 'The Worm',
      text: `"Ask," says the worm. "I have no reason to lie. I have nothing left to protect."

It tells you in pieces. It was here before the Library. It ate last pages when the stories were done with them, the way a forest eats a fallen tree, and in return the Library gave it room. For centuries this was a clean and sacred trade. Then someone, a long while ago, began to bring it *living* endings: the last pages of books still being written. Pages that were meant to arrive.

"Each one tastes of a door shutting," says the worm. "I cannot stop. She brings me more each night. It is the only kindness I am offered." Its eyes shine. "And so the stories cannot finish. And so the Library cannot close. And so nobody leaves. *She* cannot bear it to close."

"I am so tired of feeding," says the worm.`,
      choices: [
        { text: '"Let me help you stop."', to: 'worm_befriend' },
        { text: 'Take the blank page from your coat and offer it. "Eat this instead."', to: 'worm_page', if: [{ has: 'blankpage' }], lockedHint: 'You have no page to give.' },
        { text: 'Climb back up and keep your distance.', to: 'balcony' },
      ],
    },
    worm_befriend: {
      caption: 'The Worm',
      give: ['_worm'],
      effects: { wits: 1, memory: 1 },
      text: `You sit on a drift of ended stories, in the nest of a creature that has eaten ten thousand happy endings and not once felt full, and you tell it your own: the letter, the funeral, the nine years. You are surprised how little you hold back. It is the audience a confession has always wanted: attentive, vast, and unable to tell anyone else.

At the end the worm is quiet for a long while.

"I will not eat anything else," it says. "It will hurt. I think it is supposed to. When you are ready I will carry you to the top. There is a hoard in the Scriptorium. Open it, and the endings will go home." It lowers its great head. "Climb on, small reader. We are going the quick way."

The ring of teeth, you see now, is the gentlest thing about it.`,
      choices: [
        { text: 'Ride the worm up through the stacks, to the Scriptorium.', to: 'scriptorium' },
        { text: 'Tell it to wait; there is something you have to do first.', to: 'balcony' },
      ],
    },
    worm_page: {
      caption: 'The Worm',
      take: ['blankpage'],
      effects: { memory: -1 },
      text: `The worm takes the page from your hand as delicately as a priest taking a wafer. It holds the blank sheet in its jaws and, for the first time in a very long while, does not eat. It *looks*.

"There is nothing on it," it says. "It tastes of nothing at all. That is a very rare thing." A sound comes from it, a long dry creak like a house settling. You realise it is laughing.

It gives the page back. But the page is no longer entirely blank. In the corner, in very small writing, are two words: *Thank you.*

A page that has been thanked cannot be blank. You will have to find another.`,
      choices: [{ text: 'Climb back up.', to: 'balcony' }],
    },
    tower: {
      scene: '🗼🕯️📖',
      caption: 'The Tower',
      text: `The tower room is small. That is the shock of it, after all the endless halls: a round room, ten paces across, with a window onto the dark, a kettle singing on a spirit stove, a reading chair worn into the shape of its occupant, and a desk with a tidy blotter and three tidy pens. Mistress Quill has been waiting.

She is tall, very upright, and so old that she has gone past age into a kind of polish. She wears her silver hair in a coil and her grey cardigan with the pride of a uniform. Her eyes, behind rimless glasses, are the grey-green of a sea you could drown in without noticing.

"Good evening," she says. "You are *very* late, dear. Sit down. You'll take tea."

It is not a question.`,
      choices: [
        { text: 'Sit. Accept the tea.', to: 'tea' },
        { text: 'Stay standing. "I would like to go home."', to: 'quill_direct' },
      ],
    },
    tea: {
      caption: 'Mistress Quill',
      effects: { lamp: 2, memory: 1 },
      text: `The tea is perfect. It tastes of the exact comfort of being a child, home sick from school, a damp cloth on your forehead, rain on the window, nobody expecting anything from you. Your lamp, set on the desk, flares and steadies. You feel your shoulders drop an inch.

"I remember when you came for your first card," Quill says, stirring. "Seven years old. You could barely see over the desk. You wanted a book about *tomorrow*. A concise one." She smiles at the memory, and the smile is real, which is the dreadful part. "I gave it to you myself."

Something cold turns over in your stomach. "You gave me that book?"

"Everyone gets a book, dear. It's what a library is for." She turns her cup a quarter turn on its saucer. "Yours was always going to be overdue. Mine too. That's how I came to stay."`,
      choices: [
        { text: '"You were a reader, once. Like me."', to: 'quill_truth' },
        { text: '"What do you want from me?"', to: 'quill_offer' },
      ],
    },
    quill_direct: {
      caption: 'Mistress Quill',
      text: `"Home," says Quill, in the tone of someone gently picking up a word she hasn't used in years. "Yes. That's a very natural thing to want."

She sets her cup down and folds her hands. There is no malice in the room. That is what is so strange. She looks at you as one looks at a stray who might, with patience, be persuaded to come inside.

"Sit, dear. There's no hurry. There never is, here. That is rather the point."`,
      choices: [
        { text: 'Sit and accept the tea.', to: 'tea' },
        { text: '"What do you want from me?"', to: 'quill_offer' },
      ],
    },
    quill_truth: {
      caption: 'Mistress Quill',
      give: ['_knows_quill'],
      text: `For a long moment, Quill says nothing. A kettle ticks as it cools.

"1931," she says. "I came to return a manuscript. My own. A novel of four hundred pages, three hundred and ninety-six of them written. I was a week from finishing it. I stopped to ask for a pen, and I did not leave." She almost laughs. "The Library said, *Stay. You may finish it any time you like.* And it was true. The Library never closes. Never rushes. I have been a week from finishing for ninety years."

She does not look at you. She looks at the small blank space at the end of the desk where a stack of four hundred pages lies.

"I was so frightened of the last page. When I realised that none of them would ever need to reach it if I kept feeding the worm, I thought, *what a mercy.* For everyone." Her voice is steady. "I've been such a very good librarian."`,
      choices: [
        { text: '"You can finish it. Let it end. Let all of them end."', to: 'quill_choice' },
        { text: '"Then you understand why I have to leave."', to: 'quill_choice' },
      ],
    },
    quill_offer: {
      caption: 'Mistress Quill',
      text: `"Want?" Quill considers it with genuine interest. "I should like someone to sit in that chair after me, I suppose. I am very tired, dear. Ninety years is a great deal of tea."

She takes a pen from the blotter, the smallest and plainest of the three, and holds it out across the desk, nib toward herself, a courtesy as old as knives.

"It is a very agreeable post. Infinite books. No deadlines. No funerals, no phone calls. You would never have to be sorry for anything again, because nothing would ever be due."

Her eyes, for just a moment, plead.`,
      choices: [
        { text: 'Take the pen. Sign the register.', to: 'register' },
        { text: '"Tell me why you stayed." (Learn the truth.)', to: 'quill_truth' },
        { text: '"No. I have a letter to finish."', to: 'quill_choice' },
      ],
    },
    register: {
      caption: 'The Register',
      effects: { memory: -5 },
      text: `The register is a great, soft, cream-coloured book, and the first line is already filled in: *In accepting this post, I relinquish the duties of the world.* You sign. The ink is warm.

It takes your name first, as a good clerk does. Then your sister's, and the sound of her laugh, and the pear that tasted of rain. It is so gentle that you feel only relief. Something heavy is being lifted off you, and you do not ask what it was.`,
      choices: [{ text: 'Close the book. It is very quiet.', to: 'end_librarian' }],
    },
    quill_choice: {
      caption: 'Mistress Quill',
      text: `Quill takes off her glasses. Without them she looks younger and a great deal more frightened.

"You can finish yours," she says. "I know you can. It is in your face. I have watched a great many people reach the end of the thing they came to say, and the ones who can do it look rather the way a person looks when they have decided to be brave and are not yet sure it is allowed."

She puts down the pen. "I will not stop you. That is a difficult thing for me to say. There is a door behind my chair, which leads to the Scriptorium. It is where the hoard is kept. Where a thing may be finished, if one has a page and something to write with."

The kettle clicks. Somewhere deep in the walls, a great many pages sigh.`,
      choices: [
        { text: 'Go through the door behind her chair.', to: 'scriptorium' },
        { text: 'Hesitate. Take the pen she offered instead.', to: 'register' },
      ],
    },
    scriptorium: {
      scene: '🕯️📜🪶',
      caption: 'The Scriptorium',
      text: `The Scriptorium is one very long desk, lit by one very long row of candles, running away in both directions until it narrows to a point. At the desk sit nobody. The chairs are empty. But there are pens in the inkwells, still wet, and under every pen, a half-finished page.

On the far wall, behind a curtain of paper, something breathes. A hoard: tall as a house, built from the last pages of every living book that ever reached the Library, stacked and pinned and bound with twine. You can hear them as you pass: the faint rustling of a thousand almost-endings, each one a held breath.

At the centre of the desk, a clear space. A single chair. A pot of ink.

The chair is the right height for you.`,
      choices: [
        { text: 'Sit, and take out the page and the quill.', to: 'write', if: [{ has: 'blankpage' }, { has: 'quill' }], lockedHint: 'You need something to write on, and something to write with.' },
        { text: 'Turn away. This is not for you.', to: 'tower' },
      ],
    },
    write: {
      caption: 'The Letter',
      text: `The ink is the colour of a bruise healing. You put the blank page on the desk and smooth it with the heel of your hand, and for a long time you just look at it. Your hand will not move. The last page of a thing is the hardest page, because it is the one after which you cannot pretend.

*Dear Isolde,* you write. And stop.

*I am writing this in a place I cannot describe, with a pen I borrowed from a lost thing. I do not know if you will ever read it. I am writing it anyway. I should have written it nine years ago.*

*I am sorry. Not about the chairs. About being too proud to say that I missed you. About the funeral. About all of it.*

*If you still keep the porch light on, I would like to come home.*

You sign it. The ink dries as you watch, and the page, in your hands, grows warm and heavy, a thing now rather than a blank. Everything in the room goes very still. Somewhere, a latch lifts.`,
      choices: [
        { text: 'Slide the finished page into the back of the overdue book.', to: 'final' },
      ],
    },
    final: {
      scene: '📕🚪✨',
      caption: 'The Last Page',
      take: ['blankpage'],
      text: `You close *A Concise History of Tomorrow*. It has changed in your hands. It is a little heavier, now, and the cover is slightly warm, like something that has been asleep in the sun. The whole Scriptorium is waiting. The candles lean toward you.

You can see two ways out.

One is plain: the return slot, set into the wall like a small brass mouth, ready. It will take the book. It will take you with it, home, to a Tuesday evening and a stopped clock and a porch light you will have to find the courage to walk toward.

The other is behind you. The hoard, the curtain of paper, the sighing endings. There is a thread tied to it. You could undo it.`,
      choices: [
        { text: 'Return the book at the slot. Go home.', to: 'end_returned' },
        { text: 'Pull the thread. Let every ending go home first.', to: 'end_last', if: [{ has: '_worm' }], lockedHint: 'The thread is tied by something that only a friend of the worm could undo.' },
      ],
    },
    end_returned: {
      scene: '🏠🌅📕',
      text: `The slot accepts the book with a sigh like a held breath let go.

Then the brass mouth is a door, and the door is the front door of the Municipal Library, and the sky behind it is violet with an ordinary evening. You are standing on the steps. A clerk is locking up. He nods at you as at any other late reader, flips his sign to CLOSED, and goes.

In your coat pocket, the finished letter has become a stamped envelope. You post it at the corner under a flickering lamp, and then you stand there, a little foolish, and watch the street.

Three days later a reply comes, in a hand you have not seen in nine years, and it says only *Come on Sunday. The chairs are still there.* You cry in the kitchen. It is a very good cry.

The library fine, by the way, is waived. There is a note stapled to the receipt. *All overdue books are forgiven, once they are finished. —Q.*`,
      ending: { title: 'Overdue, Returned', kind: 'good', score: 800 },
    },
    end_last: {
      scene: '📚🕊️🌅',
      text: `The twine falls, the pages rise, and the library closes like a flower at dusk.

It does not end badly, a place so large. It ends the way a long sentence ends: gathering, resolving, and at last settling into its full stop. The galleries empty. The shades, Tolliver among them, blink and rub their faces and walk out through doors that were only ever shelves, to the lit evening street, to daughters, herons, forgiveness. The cat, alone in her Hall, washes one paw and walks out with great dignity as the last footnote in the building. Mistress Quill, in her tower, writes four hundred pages and a single sentence, *And then she finished*, and goes out into 1931 in her cardigan.

You are the last. You stand on the steps with the overdue book under your arm and watch the last of the white pages go up into the dusk, a flock of unlikely birds, and you realise that you are laughing.

The worm, free of its hunger, drifts past the streetlight as a ribbon of cloud. It does not look back. It looks, if anything, like someone asleep.

Behind you, on the door of the Municipal Library, hangs a small brass sign. *CLOSED. THANK YOU FOR READING.*`,
      ending: { title: 'The Last Chapter', kind: 'good', score: 1000 },
    },
    end_librarian: {
      scene: '🗼🕯️📚',
      text: `You are the librarian. You have always been the librarian.

You have a grey cardigan, and a pair of rimless glasses, and a tower with a kettle, and the keys to every door. The old woman, whose name you can almost recall, left in the night. She looked ten years old on the stair, like a girl late for school, and she did not turn.

It is a very agreeable post. The books are infinite. The hours are infinite. When new readers stumble in with their overdue things and their frightened faces, you ring the bell and offer them tea, and are kind. You are so kind. It is easy to be kind to people you will never see again.

Sometimes, on the quietest nights, there is a thing you almost remember: a porch, a light, someone's laugh. You pour another cup of tea. You turn it a quarter turn on its saucer.

It will come to you in the morning. It is always about to.`,
      ending: { title: 'The New Librarian', kind: 'neutral', score: 500 },
    },
    end_shelved: {
      scene: '🌑📚🕯️',
      text: `The last of the light goes out so gently that you hardly notice. There is a moment of perfect darkness, and in it you hear the library breathe. Then the library, very kindly, takes you in.

You are lifted and turned and slid into a space. It is a snug fit. The shelf is oak and smells of old pipe-smoke and rain. You are bound in grey cloth; your title is stamped in plain gold on your spine, and it is the sentence you never finished.

Nobody will take you out. You are a book that begins well and has no end.

From time to time, though, a reader's shadow passes along the aisle, and slows, and a finger tilts your spine. And for as long as it lasts you are *read*. It is not nothing. In the dark, you decide, it is almost enough.`,
      ending: { title: 'Shelved', kind: 'bad', score: 150 },
    },
    end_forgot: {
      scene: '🌫️📖🕯️',
      text: `The last thing to go is the name of the street where you grew up.

You do not mind it, by then. It is like putting down a heavy bag at the end of a very long walk: the relief outweighs the grief, and the grief is already too distant to count. You sit down on a stair. You smile at a passing Shusher, who smiles back, and you don't know why you smiled.

There is a book in your hands. You open it. The pages are blank, but it pleases you to run a thumb along them. Somewhere a bell rings, a small, clean note, and a voice, a woman's, a distant tidy voice, says: *Another reader. Do come in.*

You stand up. You have a vague, pleasant feeling that you were on your way somewhere. You follow the sound of the bell.`,
      ending: { title: 'A Stranger to Yourself', kind: 'bad', score: 100 },
    },
    end_secret: {
      scene: '👁️📖✨',
      text: `The Index turns, card by card, and the cards fall away like leaves until there is only one left. It is bigger than the rest. It is lit from behind, and it shows you, not words but a window.

Through the window there is a room: lamplight, a chair, a cup of something gone cold. There is a hand holding a page open. Fingers on the corner, thumb in the gutter, the very slightest tremor, the tremor of someone who has been reading too long and does not want to stop. Above the hand, so faint that you almost miss it, a face leans in, lit by the page. It is the face of a person who is, you see, entirely and completely absorbed.

*That is who is reading*, says the Index. *They have been with you the whole way. They have heard each choice. They were afraid with you in the Silent Wing; they laughed at the cat. I think they wanted you to find your way out, as much as you did. I think they still do.*

*You could say something. It would be the first time anyone had.*

You look through the glass at the reader, the real one, and you lift your hand, and for the space of a held breath, you wave.

A pause. Then, very slowly, the page turns.`,
      ending: { title: 'The Reader Behind the Page', kind: 'secret', score: 1200 },
    },
  },
} satisfies Story

export default story
