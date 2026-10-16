import type { Story } from './types'

const story = {
  id: 452,
  title: 'Detective Noir',
  blurb:
    'Port Halloran, 1947, and it has been raining for eleven days. A dead insurance man, a suicide note that does not smell right, a client who pays in cash and tells you only half of it. Chase the clues across a drowned city, and when you finally name the killer, be sure you can prove it.',
  items: {
    umbrella: '☂️ Umbrella',
    revolver: '🔫 Your .38',
    note: '📄 Typed suicide note',
    cufflink: '🔗 Stag cufflink',
    locker_key: '🗝️ Locker 31 key',
    ledger: '📓 Ashgrove ledger',
    elevator_log: '📒 Elevator log',
    typewriter_key: '🔤 Page with a broken e',
    certificate: '📋 Death certificate',
    matchbook: '🔥 Blue Lantern matches',
  },
  stats: {
    grit: { label: 'Grit', emoji: '💪', start: 6, min: 0, max: 8, onMin: 'end_beaten' },
    hours: { label: 'Hours till dawn', emoji: '🕰️', start: 12, min: 0, max: 12, onMin: 'end_late' },
    instinct: { label: 'Instinct', emoji: '🔍', start: 4, min: 0, max: 10 },
    trust: { label: "Captain's trust", emoji: '🤝', start: 3, min: 0, max: 10 },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🌧️🕵️🏙️',
      caption: 'Halloran Street, 9 p.m.',
      give: ['umbrella', 'revolver'],
      text: `It had been raining for eleven days, and the city had started to look like a photograph left out in the gutter. I sat in my office above Lindqvist's Laundry with my feet on the desk and a bottle that was two fingers from honest, listening to the street try to drown itself.

The steam from the laundry came up through the floorboards and made the wallpaper curl. My name is on the glass in cracked gold letters. People find it when they have run out of better doors.

At nine o'clock a woman found it.

She came in shaking the rain from a black hat, small and straight-backed, thirty or so, with a face that had been pretty until it learned to be careful. She set an envelope on my blotter without being asked. It was thick. That was the first thing I liked about her.`,
      choices: [
        { text: 'Pour her a drink and ask her to sit.', to: 'ines' },
        { text: 'Leave the envelope where it is and wait.', to: 'ines', effects: { instinct: 1 } },
      ],
    },
    ines: {
      caption: 'Ines Calloway',
      text: `"Ines Calloway," she said. "I was Edmund Ashgrove's secretary for six years. Yesterday they found him in Suite 412 of the Hotel Meridian with a bullet in his head. The police say he did it himself."

"You don't."

"Mr. Ashgrove was happy, Mr. — " She looked at the glass on the door. "He had tickets to Lisbon. He was leaving his wife, leaving the firm, leaving this whole wet city. People who are about to be happy don't type goodbye notes."

*Typed.* I turned the word over like a coin. She told it as a woman tells a thing she has rehearsed in front of a mirror: neat, in order, the tears kept in reserve in case they were needed. Fifty dollars a day, and expenses, and a key to the dead man's office.

"Find who killed him," she said. "I don't care what it costs."

I always care what it costs. That's the only honest part of the trade.`,
      choices: [
        { text: 'Take the case.', to: 'take_case' },
        { text: '"Who gains when a man like Ashgrove dies?"', to: 'ines_ask' },
      ],
    },
    ines_ask: {
      caption: 'Ines Calloway',
      effects: { instinct: 1 },
      text: `"His wife, Vivian. There was insurance, naturally; it was his business. His partner, Corbin Teague, who has no end of debts and no end of charm. Dr. Fenn, who signed the death certificate before the body was cold. And," she smiled thinly, "Captain Brandt, who closed the file in an afternoon. He doesn't like to leave things open. You'd be amazed what he's willing to leave shut."

She said the last part a fraction too lightly, like a wire pulled gently to see what it's attached to. I filed it. I file everything. Most of it never comes out of the drawer.

"Anything else?"

"No." She stood. "Only that I'd rather you were quick. People talk about eleven days of rain as if it were weather. It isn't. It's a clock."`,
      choices: [{ text: 'Take the case.', to: 'take_case' }],
    },
    take_case: {
      scene: '🌃🌧️🚕',
      caption: 'The City',
      text: `She left. The rain closed behind her like a curtain. I put the envelope in the drawer, the bottle in the other drawer, and the .38 in my coat, because it was a night for coats.

Port Halloran is a city of seven bridges and one opinion: that everyone has something to hide. I had until dawn before the Meridian's day staff changed over and the evidence of 412 was scrubbed, vacuumed and re-let to honeymooners.

Twelve hours. A dead man. Five people with reasons. I picked up my hat.`,
      choices: [{ text: 'Out into the rain.', to: 'city' }],
    },
    city: {
      scene: '🌃🌧️🚕',
      caption: 'The City',
      text: `The streets were black and shining, and every neon sign bled a different colour into the gutters. I had a cab that didn't smell of wet dog and a list that didn't smell of anything yet. Where?

Time was the one thing I couldn't buy more of. Every stop costs an hour at least, and the night does not wait for a man to be thorough.

I could always call the thing early. Gather the lot of them in the Meridian's lounge and tell them what I knew. If it came to that. If I knew enough.`,
      choices: [
        { text: 'The Hotel Meridian, where Ashgrove died.', to: 'hotel' },
        { text: 'The offices of Ashgrove & Teague.', to: 'office' },
        { text: 'The Blue Lantern, where the widow sings.', to: 'club' },
        { text: 'Police headquarters, and Captain Brandt.', to: 'hq' },
        { text: "Dr. Fenn's clinic on Pell Street.", to: 'clinic' },
        { text: 'Union Station.', to: 'station' },
        { text: 'A diner for coffee. (Costs an hour. Restores grit.)', to: 'diner' },
        { text: 'Enough. Call the suspects together at the Meridian.', to: 'gather' },
      ],
    },
    diner: {
      scene: '☕🌧️🍳',
      caption: 'Sal\'s All-Night',
      effects: { hours: -1, grit: 2 },
      text: `Sal's is a steel box with a counter and nine stools and a waitress named Dot who has seen me at my worst and never mentioned it. The coffee tastes of tin and heat and mercy. I drink two cups and eat a slab of pie that I can't later describe except as *warm*.

A truck driver at the end of the counter is arguing with a radio about the Halloran Hawks. Rain runs down the window in long steady threads. For ten minutes the case does not exist.

Then it does, and I put a quarter under the saucer, and I am a little more of a man than I was.`,
      choices: [{ text: 'Back into the night.', to: 'city' }],
    },
    hotel: {
      scene: '🏨🌧️🛗',
      caption: 'The Hotel Meridian',
      effects: { hours: -1 },
      text: `The Meridian has a lobby like a wedding cake that has been left out in the rain: marble, gilt, a little sad at the edges. A clerk named Pruitt stands behind the desk with the posture of a man who has been told to say nothing and wants badly to say everything. In the corner, an elevator with a brass gate, and in the elevator, on a tall stool, a girl in a maroon uniform with a clipboard on her knee.

A uniformed patrolman sits in a lobby chair, reading a racing form. The tape across the door to 412 is still there. But police tape, like most laws, is a suggestion to a man with a good enough reason.`,
      choices: [
        { text: 'Talk to the clerk.', to: 'clerk' },
        { text: 'Talk to the elevator girl.', to: 'nell' },
        { text: 'Slip upstairs to Suite 412.', to: 'suite' },
        { text: 'Back out to the cab.', to: 'city' },
      ],
    },
    clerk: {
      caption: 'Mr. Pruitt',
      text: `"Dreadful business," says Pruitt, in a whisper that carries to the mezzanine. "Mr. Ashgrove kept that suite by the month. Very quiet gentleman. Very *regular*. Thursday nights, always alone, always with a bottle of the Armagnac. Not the sort to do himself in."

"Who visited him Thursday?"

Pruitt's eyes go to the patrolman, then to the elevator, then to the ceiling. "I wouldn't know. I was at the desk. The girl runs the car. She writes everything down. She's a stickler. *Nell*, I mean. Nell Ostrander. A good girl. Doesn't like men in hats."

I take my hat off. He looks relieved, as if he's seen a small miracle.`,
      choices: [
        { text: 'Go to the elevator girl.', to: 'nell' },
        { text: 'Go up to 412 by the stairs.', to: 'suite' },
        { text: 'Leave.', to: 'hotel' },
      ],
    },
    nell: {
      scene: '🛗🌧️📒',
      caption: 'Nell Ostrander',
      text: `Nell's got a freckled face and a mouth that looks as if it was made for arguing. She doesn't get up when I enter her car, but she watches my coat, which is dripping on her floor, and my hat, which is in my hand, and in the end my face.

"Tape's up," she says. "Nobody goes to four-twelve. Captain's orders."

"I'm not going to four-twelve. I'm going where you're going. Up and down, all night long, and nobody ever asks the girl what she saw."

Her chin comes up. She's wet through at the shoulders. She came in with the rain, and it's still on her, and she's far too proud to ask for a thing.

I've got an umbrella in my hand that I've been carrying for nobody in particular.`,
      choices: [
        { text: 'Offer her the umbrella and say nothing.', to: 'nell_umbrella' },
        { text: 'Flash the licence. "Thursday night. Everyone who rode up. Now."', to: 'nell_press' },
        { text: 'Leave her be.', to: 'hotel' },
      ],
    },
    nell_umbrella: {
      caption: 'Nell Ostrander',
      take: ['umbrella'],
      give: ['elevator_log'],
      effects: { instinct: 1 },
      text: `She looks at it a long time, as if kindness were a thing she'd have to count for pennies. Then she takes it, quickly, and opens the clipboard on her knee, and tears a page out of the ledger.

"It's the log," she says. "You ought not to have it. I ought not to give it. But they ruled it a suicide in an afternoon, and I don't care for how fast the suicides are getting this month."

She puts a finger on the paper. *Thursday. 9:40 p.m., Mr. C. Teague, to four. Came down 10:10, in a hurry. 9:55, a gentleman, grey coat, no name, nodded to Pruitt, went up without stopping; I thought he was police. 10:05, Dr. Fenn, with her bag. Down at 10:25. 10:30, the shot. 11:40, the Captain and two uniforms.*

"The gentleman in grey," I say. "Seen again?"

"Not so's I'd know him." She shrugs. "He wore his collar up. And he had the nicest hands."`,
      choices: [{ text: 'Tip my hat, and meant it.', to: 'hotel' }],
    },
    nell_press: {
      caption: 'Nell Ostrander',
      effects: { instinct: -1 },
      text: `The licence has the effect on her that a hand has on a hedgehog. She goes small and sharp and shuts her mouth.

"You're not police," she says. "Police don't have to show it twice."

"Miss Ostrander — "

"I'm on duty." She slams the gate between us, and the car goes up with a creak and a shudder, and I'm left in the lobby watching the numbers climb. A wiser man would have asked nicely. I am not, as a rule, that man.

The clerk pretends to be looking at his shoes. The patrolman is looking at me.`,
      choices: [{ text: 'Try something else.', to: 'hotel' }],
    },
    suite: {
      scene: '🏨🔫🕯️',
      caption: 'Suite 412',
      effects: { hours: -1 },
      text: `The service stair is hung with cobwebs and the smell of a hundred small cigarettes. On the fourth-floor landing I wait for the patrolman's laugh to stop echoing from below. Then I slip the tape and pick the lock with a hairpin I keep for that purpose.

The suite is still the way they left it: a good bed, an armchair of green leather, a writing desk by the window and a stain on the carpet the size and colour of a dinner plate, a little to the right of the chair, as if a drink had been spilled there. It hadn't been a drink.

The window is half open. Rain has been blowing in all night, and the sill is dark with it. On the desk sits a typewriter case. Beside it, the note.`,
      choices: [
        { text: 'Read the note.', to: 'suite_note' },
        { text: 'Get down on my knees and search under the bed.', to: 'suite_bed' },
        { text: 'Check the radiator by the window.', to: 'suite_rad' },
        { text: 'Slip out, before the patrolman gets curious.', to: 'hotel' },
      ],
    },
    suite_note: {
      caption: 'The Note',
      give: ['note', '_note_typed'],
      effects: { instinct: 1 },
      text: `*I cannot go on. Forgive me, Vivian. It was all for nothing. E.*

Eleven words, plus the initial. Typed on thin hotel paper, and neatly. The *e* in *Forgive* has a drag to the bottom of the loop, a tiny broken tail, like a hair across a lens. It's the sort of flaw you only see when you've spent a life reading other people's mistakes.

There is no typewriter in Suite 412. The case on the desk is empty.

A man who is about to be happy doesn't type goodbye. A man who is about to be dead doesn't carry a typewriter *out* of the room, either. Somebody brought this paper in already written.`,
      choices: [{ text: 'Pocket it. Keep searching.', to: 'suite' }],
    },
    suite_bed: {
      caption: 'Under the Bed',
      give: ['cufflink'],
      effects: { instinct: 1 },
      text: `The carpet is pale blue and gritty with the dust of other people's secrets. Under the bed, behind a slipper, something winks at me: a cufflink. Heavy, solid gold, expensive in the quiet way. On its face is a crest, a stag's head over a crossed pair of keys, worn a little at the edges by a thumb that has turned it a thousand times.

Edmund Ashgrove's cuffs, in the one photograph the paper printed, were plain. This belongs to a man who wears his money on his wrist.

I wrap it in my handkerchief and put it where I keep the things I'm not sure of yet.`,
      choices: [{ text: 'Keep searching.', to: 'suite' }],
    },
    suite_rad: {
      caption: 'The Radiator',
      give: ['locker_key'],
      effects: { instinct: 1 },
      text: `Radiators are the safe deposit boxes of the poor and the careful. This one is cold, and when I run my fingers along the back of it, under the paint, I find a lump of tape and a small brass key with a number stamped on the bow: **31**.

Not a hotel key. A locker key. Union Station, I'd bet my licence on it; the old kind, with the gothic number.

Under it, folded small, is a ticket receipt. *Passage, S.S. Calista, Lisbon, two berths, sailing 6 a.m. Friday.* Two berths. Ines had said he was leaving his wife. Whoever the second berth was for, it wasn't going to be Ines.

Somebody here had been in a hurry. Somebody had hidden a key and not lived to use it.`,
      choices: [{ text: 'Pocket the key. Keep looking.', to: 'suite' }],
    },
    office: {
      scene: '🏢🌧️💼',
      caption: 'Ashgrove & Teague, Insurance',
      effects: { hours: -1 },
      text: `The office is on the ninth floor of the Prudential Building, and the night man lets me up because I'm carrying a key with Ines Calloway's name on the tag and I look like a man with a cause. The corridor smells of floor wax and lemon oil. Frosted glass doors, two names in gold leaf: ASHGROVE. TEAGUE.

There's a light under one of them.

Corbin Teague is working late at his desk, shirt sleeves rolled, tie loosened, like an actor between acts. He's fifty, handsome, with a smile you could light a cigar from. A silver cigarette case sits next to his elbow. He rises as though he'd been expecting me, which is never a good sign.`,
      choices: [
        { text: 'Talk to Teague.', to: 'teague' },
        { text: "Look through Ashgrove's desk while he's occupied.", to: 'edmunds_desk' },
        { text: 'Leave.', to: 'city' },
      ],
    },
    teague: {
      caption: 'Corbin Teague',
      text: `"Terrible, terrible," says Corbin Teague, and pours me a bourbon I didn't ask for. "Edmund was my oldest friend. We started with one desk and a borrowed typewriter. He was the dull one, you understand, the numbers. I was the one people liked."

"Where were you Thursday night?"

"The Blue Lantern. From eight until closing. Ask anyone." He smiles as if I'd made a pretty joke. "Vivian was singing. You've never heard anything like it."

I'd heard a great many things in my life, and one of them was a man who answers a question before it's finished. The bourbon is very good. The smile does not move even a hair.

"Ines hired you, didn't she? Sweet girl. A little excitable. Don't take it too hard if she's wrong."`,
      choices: [
        { text: 'Ask about the typewriter on the desk behind him.', to: 'teague_sneak' },
        { text: 'Thank him, and glance at his cuffs on the way out.', to: 'teague_cuffs' },
        { text: 'Go.', to: 'office' },
      ],
    },
    teague_cuffs: {
      caption: 'Corbin Teague',
      effects: { instinct: 1 },
      text: `He has a pair of plain silver links, polished, bought for him by somebody who loves him, or somebody who was paid. Not a stag in sight. Both cuffs are accounted for.

He sees me looking. "A gift from Vivian," says Teague. "On our tenth anniversary. Ours, I mean, the firm's. She has the taste in the family."

I thank him for his time. In the corridor the frosted glass catches my reflection: a wet coat, a wet hat, a tired man looking at himself. I wonder what Teague saw. Probably a man who'd be easy to feed to the river.`,
      choices: [{ text: 'Back to the office.', to: 'office' }],
    },
    teague_sneak: {
      caption: "Teague's Typewriter",
      text: `On a stand behind his desk is a black Remington, hooded in a canvas cover. Too big a thing to miss, too useless a thing to hide. I make a joke about my own hunt-and-peck, and he laughs, and comes round the desk to put a hand on my shoulder, and in the second that takes I have a page from the platen between my finger and thumb.

Or I would, if I were quicker. Teague's hand tightens.

"That's private correspondence," he says, still smiling.`,
      choices: [
        { text: 'Palm the page anyway.', to: 'teague_page', if: [{ stat: 'instinct', min: 5 }], lockedHint: 'My hands are not quick enough for this yet. (Instinct 5)' },
        { text: 'Spill the bourbon over his desk, and while he mops, take the page.', to: 'teague_page' },
        { text: 'Smile back. Let it go.', to: 'office' },
      ],
    },
    teague_page: {
      caption: "Teague's Typewriter",
      give: ['typewriter_key'],
      effects: { grit: -1, instinct: 1 },
      text: `He swears, very prettily, and for a moment the charm slips and I see the man beneath it: a flat, tired, calculating face, an accountant of other people's weaknesses. Then the smile is back and he's telling me not to worry about the carpet.

On the page in my pocket there are three lines about a policy renewal. In the second line, the word *premium*, with its e dragging a tiny hairlike tail across the loop. The same stray stroke as on the note in Suite 412.

I don't say anything. I thank him for the bourbon. I take care to leave as slowly as a man with nothing in his pocket.`,
      choices: [{ text: 'Out into the corridor.', to: 'office' }],
    },
    edmunds_desk: {
      caption: "Edmund's Desk",
      effects: { instinct: 1 },
      text: `Ines's key opens the corner room. It's a tidy office, a place for someone who believed in order. A blotter. A brass lamp. A framed photograph of a woman on a beach in the twenties, laughing. Vivian, young, before the careful face.

In the second drawer is a leather appointment book. Thursday night: *9 p.m. — C.T. Re: the books. Final.* A line is drawn under *final*, hard enough to tear.

And on the blotter, in the soft grey of a pencil rubbing, the faint impress of a name and a number. *Station. 31. Hand to no one but the D.A.*

Edmund Ashgrove was a bookkeeper who had finally decided to be brave. It's an expensive thing to be, in this town.`,
      choices: [{ text: 'Close the drawer. Quietly.', to: 'office' }],
    },
    club: {
      scene: '🎷🌧️💃',
      caption: 'The Blue Lantern',
      effects: { hours: -1 },
      text: `The Blue Lantern is a basement on Cutler Street with a sign shaped like a lantern and an owner shaped like a boulder. Inside there's blue light, blue smoke and a piano that has been drunk for years. At the back, in a pool of silver, the widow of Edmund Ashgrove is singing a song about a man who left by the morning train.

Vivian Ashgrove is not a woman you look away from. Black dress, red mouth, a voice like a hand on the back of the neck. When she's finished, there's no applause for a moment, only the particular silence of people who have been told the truth.

At the bar, a bartender with a face like a clenched fist wipes the same glass for the third time. He has been watching me since I came in.`,
      choices: [
        { text: 'Wait for the widow in the dressing room.', to: 'vivian' },
        { text: 'Order a drink at the bar.', to: 'moses' },
        { text: 'Leave.', to: 'city' },
      ],
    },
    vivian: {
      scene: '💃🪞🌹',
      caption: 'Vivian Ashgrove',
      give: ['matchbook'],
      text: `Her dressing room is a closet with a mirror, and she sits before it with a cigarette in a long holder and her husband's death in her face like a stone in a shoe.

"The police said suicide, and Captain Brandt was so very kind about it." She smiles at my reflection. "Thank God. For a minute I thought they'd say I'd done it."

"Did you?"

"Edmund and I were not happy, Mr. — but we were old. You don't kill what you're used to." A match is struck. She hands me the book, black, with a lantern printed on it. "Eight to eleven, I was on that stage, with sixty witnesses. Moses will tell you. He's never lied to a policeman in his life, because he's never been asked a question he didn't want to answer."

"Was your husband left-handed, Mrs. Ashgrove?"

She blinks. "Why on earth — yes. Always. He wrote with his left, ate with his left, held his drink with the left. It used to infuriate his mother."

The wound, according to the papers, was in the *right* temple.`,
      effects: { instinct: 2 },
      choices: [
        { text: '"Where was he going? Lisbon?"', to: 'vivian_tickets' },
        { text: 'Thank her. Take the matches.', to: 'club' },
      ],
    },
    vivian_tickets: {
      caption: 'Vivian Ashgrove',
      give: ['_lefty'],
      text: `She laughs, a short surprised noise, and it turns into something else halfway out. "Lisbon. Yes. Two berths. He had that look. A man planning to leave sits differently. And I thought, how lovely, he's going to leave me, and I'll have the flat and the piano and not a soul to make me feel guilty."

She takes a long pull on the cigarette. "But the second ticket wasn't for the girl at the office. It was for me, Mr. Detective. He'd *come round*. He'd stopped being afraid. He told me there was a man who owned him, and a book that would end him, and when it was done we'd sail."

"A man?"

"He never said the name." Her mouth tightens. "He'd say it was a gentleman, and nothing else. A *gentleman*. As if there were any."`,
      choices: [{ text: 'Say goodnight.', to: 'club' }],
    },
    moses: {
      caption: 'Moses, Bartender',
      give: ['_teague_lied'],
      text: `The bartender slides a rye across the bar without being asked, and nods at the empty stool. "You've got a look. Insurance, or the church."

"Thursday night. Was Corbin Teague here?"

Moses wipes the glass again. "He's a regular. He wasn't here Thursday. First time in a month he missed the late set. Mrs. Ashgrove asked after him twice." He puts the glass down. "He'll tell you different. He'll tell you he never left that corner table. I've got a great deal of respect for a man who can lie like that to my face and tip me for it."

"You'd swear to it?"

"I'd put my hand on the Book." He looks at the ceiling. "If the Captain were to ask me. He didn't."`,
      choices: [{ text: 'Leave a five on the bar and go.', to: 'club' }],
    },
    hq: {
      scene: '🏛️🌧️🚓',
      caption: 'Police Headquarters',
      effects: { hours: -1 },
      text: `Headquarters at night has the stale warmth of a sickroom: green paint, long benches, a desk sergeant asleep with his chin on his tie. Upstairs, the Captain keeps a glass-fronted office with a view of the river and a rubber plant that is, as far as anyone can tell, the only thing in the building that has never taken a bribe.

Captain Hollis Brandt rises as I enter. He's a tall, slow, grey man in a good grey suit, with a face like a bank and a voice like a Sunday sermon. He shakes my hand with a dry, careful hand. He has, as it happens, a beautiful pair of hands.

"A private citizen asking questions about an accidental death. At this hour." He smiles. "You'll want to be sure of what you find, friend. A man can drown in his own curiosity."`,
      choices: [
        { text: 'Be respectful. Ask for his time.', to: 'brandt' },
        { text: 'Glance at his cuffs.', to: 'brandt_cuff', if: [{ has: 'cufflink' }], lockedHint: 'There is something about his cuffs I would notice if I had something to compare them to.' },
        { text: 'Leave.', to: 'city' },
      ],
    },
    brandt: {
      caption: 'Captain Brandt',
      effects: { trust: 2 },
      text: `He listens as a priest listens: a little bored, entirely patient. I tell him Ines Calloway doesn't believe in the suicide. He nods, as he's heard it. "Grief makes detectives of us all, friend. I have the report. Death by his own hand. The weapon in his grip, the note on the desk, the doctor's signature before the hour was out. It's a closed door. I'd advise you not to hammer on it."

"And if it's not a closed door?"

"Then you'll find that out," says the Captain, "in the manner that people generally do." He means it kindly. That's the unpleasant part. He means everything kindly.

"But you've a good name in this city, and I'd like to help. Come back in an hour, if you want to see the file. I'll have Sergeant Doyle pull it."`,
      choices: [
        { text: 'See the file now. Press him politely.', to: 'brandt_files', if: [{ stat: 'trust', min: 5 }], lockedHint: "He won't let me see the file yet. (Trust 5)" },
        { text: 'Thank him, and say you will.', to: 'hq' },
      ],
    },
    brandt_files: {
      caption: 'The File',
      give: ['certificate'],
      effects: { instinct: 1 },
      text: `Doyle's an elderly sergeant with a limp and a deep reluctance toward paper. The file is thin as a communion wafer: two photographs, a statement from the patrolman who found the body, and the certificate, in a physician's hand, tidy and fluent:

*Edmund J. Ashgrove, 52. Cause: self-inflicted gunshot wound, right temple. Time of death, approximately 10:30 p.m. Signed, O. Fenn, M.D., 11:15 p.m.*

I read it three times, and it's the time that does it. The Captain and two uniforms did not reach the hotel until 11:40. Dr. Fenn had signed a certificate for a dead man *before the police were called*. And the paper is crisp, too clean, typed so neatly that it might have been typed before it was needed.

"Take a copy," the Captain says from the door, mildly. "It's a public record. I can't see the harm."`,
      choices: [{ text: 'Take the copy. Say thank you.', to: 'hq' }],
    },
    brandt_cuff: {
      caption: 'Captain Brandt',
      give: ['_stag'],
      effects: { instinct: 2, trust: -1 },
      text: `He is gesturing, easy and expansive, with a hand like a flag. And as the grey sleeve rides up, I see it: the left cuff is held shut with a pin. A plain steel pin, the sort you use when you've lost the proper link.

Gold, on the right. A stag's head over crossed keys.

I do not look at the cufflink in my pocket. I do not look at the Captain's face. I look at the rubber plant, and I admire it very much.

The room has the quiet of a bank before it shuts. Brandt tilts his head. "Something on your mind?"

"The rain," I say. "It's getting to me."

"It gets to everyone," says the Captain.`,
      choices: [{ text: 'Say goodnight. Carefully.', to: 'hq' }],
    },
    clinic: {
      scene: '🏥🌧️💊',
      caption: 'Dr. Fenn\'s Clinic',
      effects: { hours: -1 },
      text: `Pell Street at one a.m.: a row of shuttered shops, an all-night chemist, and above the chemist a brass plate: **O. FENN, M.D.** The light is on.

Dr. Ottilie Fenn opens the door herself. She's fifty and square-shouldered, grey eyes behind steel spectacles, a grey braid over one shoulder. She has hands steadier than most men's. She's the sort of person you want holding a scalpel and cannot imagine lying about anything, until you see a small tremor under the left eye, quickly mastered.

"You're the detective," she says. "I've been expecting you. You'd better come in, Mr. — and take off your coat. You're dripping on the lino."`,
      choices: [
        { text: 'Ask about the death certificate.', to: 'fenn' },
        { text: 'Ask to see the body at the morgue downstairs.', to: 'morgue' },
        { text: 'Leave.', to: 'city' },
      ],
    },
    fenn: {
      caption: 'Dr. Fenn',
      text: `Her consulting room is as orderly as a prayer. A skeleton hangs in the corner wearing somebody's old hat. She makes tea in a chipped pot and sits with her hands around the cup.

"I was called to the Meridian at ten-fifteen," she says. "Edmund was my patient. He'd been taking something for his nerves. I arrived to find him as described. I did my duty."

"Ten-fifteen. He died at half past ten."

"I mean I was *called* at ten-fifteen." She doesn't blink. "I don't make mistakes about times, Mr. Detective. I sign what I see."

It's very well done. There's only the little pulse in her temple, ticking as steadily as a watch.`,
      choices: [
        { text: 'Lay the death certificate on her desk and say nothing.', to: 'fenn_press', if: [{ has: 'certificate' }], lockedHint: 'I have nothing to put in front of her yet.' },
        { text: 'Mention the elevator log.', to: 'fenn_press', if: [{ has: 'elevator_log' }], lockedHint: 'I have nothing to put in front of her yet.' },
        { text: 'Thank her for the tea. Leave it for now.', to: 'clinic' },
      ],
    },
    fenn_press: {
      caption: 'Dr. Fenn',
      give: ['_fenn_cracked'],
      effects: { instinct: 1, grit: -1 },
      text: `The paper lies between us like a blade. She does not touch it. Her eyes go to the little window, where the rain is making a river of the glass.

"Eleven-fifteen," she says finally. "I know. I wrote *ten-thirty* before it had happened." Her voice is dry as sand. "A man came to my surgery at ten, a tall man in a grey coat, with the most beautiful manners, and he said: *Doctor, there is going to be a tragedy at the Meridian, and you're going to be so very helpful about it.* He knew about the pills. The morphine, I mean. Nine years ago, after my husband, and no one ever knew. He knew the dose and the date."

"Who?"

"He never said his name. He didn't have to." She lifts her chin, and for a moment she is a woman who has stopped running. "I went up. Edmund was dead. I signed what he handed me. I have not slept since, Mr. Detective, and I am so tired. Write it down. Whatever you have to."

I do.`,
      choices: [{ text: 'Close the notebook. Thank her.', to: 'clinic' }],
    },
    morgue: {
      scene: '🕯️🏥💀',
      caption: 'The Morgue',
      effects: { instinct: 1, grit: -1 },
      text: `The morgue is a cellar of white tile, a drain in the middle of the floor, and a smell no one ever gets used to. Fenn pulls the drawer herself.

Edmund Ashgrove does not look like a man who had ever chosen anything. He looks like a bookkeeper: soft, tidy, a little surprised. The wound is in the right temple, small and neat, with a scorch ring that is much too thin for a gun held to the skin. His left hand has a callus on the middle finger. A pen callus.

"Left-handed," I say.

Fenn says nothing. After a while she takes off her spectacles, and rubs her eyes. "I noticed that too," she says. "At the time."

A left-handed man does not shoot himself in the right temple, from a distance, with a gun in his wrong hand. The rest is paperwork.`,
      give: ['_wound'],
      choices: [{ text: 'Close the drawer, gently.', to: 'clinic' }],
    },
    station: {
      scene: '🚉🌧️🧳',
      caption: 'Union Station',
      effects: { hours: -1 },
      text: `Union Station is a cathedral built to a god of timetables. A hundred feet of vaulted iron and soot-stained glass, a departures board that clicks like a flock of insects, and along one wall a bank of left-luggage lockers with a brass number on every door.

It's after two in the morning. A few sleepers lie on the benches like ships run aground. A porter pushes a trolley down the long hall, whistling a tune with all the notes in the wrong places.

I find Locker 31 on the second row from the bottom. It's the kind of locker that expects to be forgotten.`,
      choices: [
        { text: 'Open Locker 31 with the key.', to: 'locker', if: [{ has: 'locker_key' }], lockedHint: 'I do not have the key for this one.' },
        { text: 'Go back to the street.', to: 'city' },
      ],
    },
    locker: {
      caption: 'Locker 31',
      give: ['ledger'],
      effects: { instinct: 1 },
      text: `The key turns with a sound like a sigh. Inside is a flat brown package tied up in string, no larger than a family Bible, wrapped in an oilskin against the damp of an eleven-day rain.

I untie it right there on the floor. It is a ledger, double-entry, in a clear left-handed script: *Payments made on behalf of H.B.* The dates run back six years. The sums are monthly, and large, and they stop on Thursday.

On the last page, below a column of figures: *E. Ashgrove. I give this to whoever finds it. I should have done so long ago. It was never for the money. It was for the not being afraid.*

I tie the string. My hands are not quite steady. I have the feeling of someone with a small, very heavy animal that is waking up.`,
      choices: [{ text: 'Stand. Turn around.', to: 'tail' }],
    },
    tail: {
      caption: 'Union Station',
      text: `There are two of them. They are very good, in the way that men are good at a thing they've been paid to do for years: they don't hurry. One wears a green hat. One has a face I have never been able to remember and will never forget.

"Evening," says the one in the green hat. "We'd like the parcel."

"It's a family Bible."

"Of course it is."

The hall is long, and empty, and the echo of the rain is a roar. I'm holding the ledger in my left hand. My right hand is two feet from the .38 and has never in its life been so far.`,
      choices: [
        { text: 'Fight. Swing the ledger for the green hat, and draw.', to: 'fight' },
        { text: 'Run for the platform, the crowd, the late train.', to: 'hide' },
        { text: 'Talk. "I know who sent you."', to: 'tail_talk', if: [{ has: '_stag' }], lockedHint: 'I have no name to throw at them.' },
      ],
    },
    fight: {
      caption: 'Union Station',
      effects: { grit: -3 },
      text: `The ledger takes the green hat across the nose, which is a poor use for a ledger. I get the .38 out, and the fat one hits me in the ribs with what I think is a lead pipe. The world goes white and goes red and goes the colour of a very long train.

I put one into the ceiling. The pigeons go up like a hymn. The second man swears and I run with a sound in my chest like a wet paper bag, past the ticket windows, toward the Pullman platforms.

Behind me the porter's trolley goes over, and brass trunks, and a lady's scream. When I look back neither of them is following. I'm bleeding into my collar, and somewhere under the pain, I'm laughing.`,
      choices: [{ text: 'Take the stair to the upper concourse. Think.', to: 'ines_station' }],
    },
    hide: {
      caption: 'Union Station',
      effects: { grit: -1, hours: -1 },
      text: `The Midnight Express is in on Platform Four, panting steam, a long dark animal at rest. I jump the barrier, shoulder through a gate, find a coach with the blinds drawn and a conductor asleep over a crossword, and fold myself between two trunks in the luggage rack.

For ten minutes I hear them walking. A sound like a man with a good deal of time. Then the whistle goes, the carriage shudders, and I'm riding out of the station with a ledger on my chest and a long walk back.

I get off at the first stop, with an apology to the conductor and a dollar, and take a cab through the rain. It costs me an hour. It costs me more than that. It buys me my life.`,
      choices: [{ text: 'Back to the city, thinking.', to: 'ines_station' }],
    },
    tail_talk: {
      caption: 'Union Station',
      effects: { instinct: 1 },
      text: `"A stag's head," I say, "over a pair of keys. On a man who can't be bothered to replace a cufflink. The one with the nice hands, who goes up to the fourth floor in a grey coat and doesn't wait for the elevator."

The green hat goes still. The man with the memorable-forgettable face tilts his head as if I've said something in French.

"I'm not going to give you this," I say. "And I'm not going to run. Tell the Captain that the Bible's been read."

They look at each other. I think it's the first time they've been unsure of an order. When the whistle of the night mail sounds at the end of the hall, they melt back into the crowd, like men who've decided that a rainy night is no time to be brave.`,
      choices: [{ text: 'Breathe. Then go up to the concourse.', to: 'ines_station' }],
    },
    ines_station: {
      scene: '🚉🌧️💼',
      caption: 'Ines Calloway',
      text: `She is standing under the departures board with her hat in her hand and her small, straight back to the wall. She doesn't look surprised to see me. That, more than anything, is what tells me.

"You found it," says Ines Calloway. "I knew you would. They told me you were the best of the bad ones."

"*They.*"

"I'm sorry. I was told to hire a man who would go to the places we couldn't. A private man, a stubborn one, with no ties to the police. Somebody who would be so busy proving it was murder that he'd never ask why I was the one who knew it." She holds out her hand, palm up, for the ledger. "You've been wonderful. You'll be paid, of course. More than the fifty a day. Enough to make the rain stop."

Her other hand is in her coat pocket and it's not holding a handkerchief.`,
      choices: [
        { text: 'Give her the ledger. Take the money.', to: 'end_paid' },
        { text: '"I don\'t think so, Ines."', to: 'standoff' },
      ],
    },
    standoff: {
      caption: 'Ines Calloway',
      text: `She has a small gun, a lady's gun, with a pearl grip, and she holds it exactly as someone taught her to. I hold the ledger in front of my chest. It's not much of a shield. It's the only thing in the building that matters.

"Edmund was going to the D.A.," I say. "And you told them where."

"He was going to ruin everyone." Her voice is steady and it's the saddest thing I've ever heard. "He wasn't a hero. He was a man who'd forgotten he was in it too. I'm so tired of being clean."

"You're not clean, Ines."

"No," she says. "That's what's so tiresome about it."

A porter whistles on the far side of the hall. Her eyes flick to the sound for half a second.`,
      choices: [
        { text: 'Throw the ledger at her face, and go for the gun.', to: 'standoff_fight', if: [{ stat: 'grit', min: 3 }], lockedHint: "I haven't the strength. (Grit 3)" },
        { text: 'Bluff. "There are three cops behind you."', to: 'standoff_bluff', if: [{ stat: 'instinct', min: 6 }], lockedHint: 'I cannot make it believable yet. (Instinct 6)' },
        { text: 'Hand the ledger over, slowly.', to: 'end_paid' },
      ],
    },
    standoff_fight: {
      caption: 'Ines Calloway',
      effects: { grit: -2 },
      text: `It isn't pretty. The ledger bounces off her shoulder, and the gun goes off with a flat little crack that sends the pigeons up for the second time tonight. I feel the bullet pass through the skirt of my coat as a hot thin line. Then I have her wrist. She's lighter than she looks, and she doesn't fight like a woman who wants to win. She fights like a woman who wants it to be over.

The gun clatters across the marble. We both look at it. Neither of us goes for it.

"Go on," she says. "Take me in."

"Not Brandt's police," I say. "The D.A.'s."

For the first time in all those hours, Ines laughs, and it's an honest sound, and it breaks in the middle.`,
      choices: [{ text: 'Walk her out into the rain.', to: 'city' }],
    },
    standoff_bluff: {
      caption: 'Ines Calloway',
      effects: { instinct: 1 },
      text: `"Three, with the Assistant D.A.," I say, not looking over her shoulder, with the confidence of a man who's lied his whole life for a living. "Your Captain's had two of them following you since the Meridian. You really ought to have checked the elevator girl's alibi, Ines."

She doesn't turn. But the shot of her pupils, a flicker to the left and right, is all I need. I step in and take the pistol from her fingers like taking a cup from a child.

She sits down on a bench and puts her face in her hands. She doesn't cry. She just sits there with that straight back, trying to find some tidy way to fold herself up.

"The Captain," she says, muffled. "You know it's him."

"I know."`,
      choices: [{ text: 'Sit beside her. Listen.', to: 'city' }],
    },
    gather: {
      scene: '🏨🕯️🌧️',
      caption: "The Meridian Lounge, 4 a.m.",
      text: `They come because I ask, which is the power of a man who looks as though he knows something. The Meridian's lounge has been closed for the night, chairs up on the tables, a single lamp left burning over the baby grand. Teague takes the piano stool and crosses his legs. Vivian lights a cigarette. Fenn sits very straight. Ines stands. The Captain, who arrived last and unsummoned, leans in the doorway with his hands folded in front of him.

The rain has not stopped for a second. It sounds like applause.

I've got a coat, a hat, a notebook and whatever I managed to gather in a night of cold stairs. In every detective story there's a moment when the whole room waits, and the detective says a name. In real life the waiting is the same. The name is just heavier.`,
      choices: [
        { text: 'Corbin Teague.', to: 'accuse_teague' },
        { text: 'Vivian Ashgrove.', to: 'accuse_vivian' },
        { text: 'Ines Calloway.', to: 'accuse_ines' },
        { text: 'Dr. Ottilie Fenn.', to: 'accuse_fenn' },
        { text: 'Captain Hollis Brandt.', to: 'accuse_brandt' },
        { text: 'Not yet. Slip out. There\'s more to find.', to: 'city' },
      ],
    },
    accuse_teague: {
      caption: 'Corbin Teague',
      text: `"Corbin Teague," I say, and the room changes shape. Teague looks up from the piano keys with a look of such perfect injured warmth that I almost apologise.

"My dear fellow," he says. "I've been at the Blue Lantern all night."

"You were not." I take a step. "Thursday, 9:40, up to the fourth floor. Down at ten past ten, in a hurry. And a note typed on a machine with a tiny hair across the *e*."

Everyone in the room is perfectly still. Teague's hand is on the closed lid of the piano, a good hand, a salesman's hand. It's trembling very slightly.

"You'd better be able to prove all that," he says softly.

I take out my notebook.`,
      choices: [
        { text: 'Lay it all out: the log, the typed page, and the ledger.', to: 'end_truth', if: [{ has: 'typewriter_key' }, { has: 'elevator_log' }, { has: 'ledger' }], lockedHint: 'I need the typed page, the elevator log, and more behind them.' },
        { text: 'Lay it all out: the log, the typed page, and the doctor\'s statement.', to: 'end_truth', if: [{ has: 'typewriter_key' }, { has: 'elevator_log' }, { has: '_fenn_cracked' }, { not: 'ledger' }] },
        { text: 'Name him anyway. Trust the instinct.', to: 'end_walks' },
        { text: 'Hold my tongue. Not yet.', to: 'gather' },
      ],
    },
    accuse_vivian: {
      caption: 'Vivian Ashgrove',
      text: `"Mrs. Ashgrove," I say, "was alone with a man whose death paid for the piano, the flat and the freedom."

Vivian doesn't flinch. She puts the cigarette out, slowly, in a saucer. The room has gone as cold as a cellar. I see the Captain smile very slightly in the doorway, a small smile, the smile of a man who has been handed a cheque.

"Say it," Vivian says. "Say it properly. You've the nerve."

The thing about a sentence like that is that you can feel, as it leaves your mouth, the exact size of what it's going to do.`,
      choices: [
        { text: 'Go on. Accuse her.', to: 'end_innocent' },
        { text: 'No. I\'ve made a mistake. Step back.', to: 'gather' },
      ],
    },
    accuse_ines: {
      caption: 'Ines Calloway',
      text: `"Ines Calloway," I say. "You hired me to find a murderer, when what you wanted was a ledger."

Ines does not move. Of everyone in the room she's the only one who doesn't look at me. She looks at the Captain.

"A detective's best trick," says Brandt, mildly, "is to blame the person who brought him the case. It's an old one. And it ends the same way every time."

The room breathes out. It's a thing I can feel: the unspoken agreement of a room that wants it to be small, and soon, and over. Ines's face is blank as a porcelain plate.

"I didn't kill him," she says. "Is that what you're going to say, Mr. —? I didn't."

"No," I say. "That's the trouble."`,
      choices: [
        { text: 'Accuse her of murder, regardless.', to: 'end_walks' },
        { text: 'Step back. There\'s a better answer.', to: 'gather' },
      ],
    },
    accuse_fenn: {
      caption: 'Dr. Fenn',
      text: `"Doctor Fenn," I say. "You signed a death certificate for a man before he was officially dead."

Fenn doesn't deny it. She sits, ramrod-straight, under the lamp, and I see that the courage it takes is greater than anything I've shown in twelve hours. She looks at the Captain. Then, with great effort, away from him.

"I did," she says. "I did sign it."

But she's not the one with the gun, and I know it; and the room knows it; and the Captain, who has been silent, steps forward with a gentle noise of regret.

"A very sad business," he says. "The doctor will be dealt with. And we'll hear no more of conspiracies. Will we, friend?"`,
      choices: [
        { text: 'Name Fenn as the killer.', to: 'end_walks' },
        { text: 'Hold it. That is not the whole story. Step back.', to: 'gather' },
      ],
    },
    accuse_brandt: {
      caption: 'Captain Brandt',
      text: `"Captain Hollis Brandt," I say, and the lamp seems to dim by a few degrees. He doesn't move from the doorway. A lesser man would have smiled, or shouted, or reached for something. The Captain simply waits, with his beautiful hands folded in front of him.

"That," he says, "is a very serious thing to say about a servant of this city."

"It's a serious thing to have done."

"Have you the proof?" He asks it so gently. He asks it like a doctor asking where it hurts. "Have you, friend? Because if you haven't, then we are going to have a very different conversation, in a very different room, with no rain."

The silence in the lounge is long and deep. Everyone is waiting to see what's in my hand.`,
      choices: [
        { text: 'Put the cufflink on the piano. Then the ledger. Then Fenn\'s statement.', to: 'end_secret', if: [{ has: 'cufflink' }, { has: '_stag' }, { has: 'ledger' }, { has: '_fenn_cracked' }], lockedHint: 'I have not got enough to bring down a man like that. (A cufflink, matched to his cuff; the ledger; the doctor\'s word.)' },
        { text: 'Say it anyway.', to: 'end_beaten' },
        { text: 'Smile. "Just testing the room." Step back.', to: 'gather' },
      ],
    },
    end_truth: {
      scene: '⚖️🌅🕵️',
      text: `It takes forty minutes. It takes the typed page, and the elevator log, and then the ledger, and then Dr. Fenn, standing without being asked, to say in a clear dry voice, "I signed what I was given." It takes Vivian's coldly quiet *he was left-handed*, and Moses from the Blue Lantern, called out of bed, saying that Mr. Teague missed the late set.

Corbin Teague doesn't break. He deflates. It's like watching a very fine balloon lose its air. At the end he says, mildly, "It was only ever supposed to be the books. Ed was going to the D.A. I only wanted the ledger. I only wanted to *talk*."

He is taken downtown that dawn by two uniformed officers I've never seen before. The rain stops at six, abruptly, as if somebody switched it off. The light that comes up over the river is the colour of a new dime.

The Captain walks out of the Meridian with his hands in his pockets and his collar turned up. I watch him go. I have not the least idea what he is, and a very good idea what he might be. In this city, that is as close to justice as anyone is allowed.

But Ines gets a small, cold, grateful look from me on the steps, and Vivian takes my arm. "Thank you," she says, "for the truth. It's better than he deserved."

A good night's work. I sleep for twenty hours.`,
      ending: { title: 'Case Closed', kind: 'good', score: 900 },
    },
    end_walks: {
      scene: '🌧️⚖️🚪',
      text: `It's a good accusation. It would have made a fine speech in a better courtroom. But a good accusation isn't evidence, and a hunch is only a rumour with a hat on.

By nine, Teague's lawyer has had the whole thing dissolved. A man who types a note on a borrowed machine is not a killer; a missing alibi is not a crime; a detective who breaks into a private office is the one who goes before the magistrate. The Captain is very gracious. He drops the charges against me with a smile like a man throwing a penny to a beggar.

Teague is on the *Calista* by Friday night, with a first-class berth and a tan lotion. Ines is never seen again. The ledger, if it was ever in the world, goes where such things go.

Eleven days of rain end that weekend. The city comes up washed and gleaming, like a clean plate. I stand at the office window with the bottle, watching the sun try to be normal, and the heaviest feeling in the world is being right with nothing in my hand.`,
      ending: { title: 'Reasonable Doubt', kind: 'bad', score: 200 },
    },
    end_innocent: {
      scene: '💔🌧️🚪',
      text: `Vivian Ashgrove does not weep. She stands, and gathers her coat, and takes a long, level look at me as one might at a stain.

"I trusted you," she says. "He said you were the sort of man who finished what he started. He was right. I hope it's a comfort."

The Captain takes her out himself, gently. He holds the door. The papers say *WIDOW HELD IN INSURANCE SLAYING* the next morning, and the day after: *SONGBIRD'S ALIBI CRUMBLES*. They find that Moses of the Blue Lantern has quite suddenly forgotten what he saw. They find that a man has been paid.

She is not hanged. This is a more civilised city than that. She gets eleven years, and a standing offer from a woman's prison choir. I send a postcard every Christmas. She never answers.

The real thing about a wrong accusation is that it does not feel wrong while you are making it. It feels like finally being right.`,
      ending: { title: 'The Wrong Woman', kind: 'bad', score: 100 },
    },
    end_beaten: {
      scene: '🌧️🌃🩸',
      text: `It's a narrow alley behind the Meridian with the rain coming down it like a drain. I've been in a lot of alleys. This one has two men at the end of it, and a third behind me with a pipe.

I think, with the odd clarity of such moments: *they'd have done better to let me finish the sentence.* Then the pipe comes down. A light, a taste of copper, an extremely detailed view of a puddle with the neon in it.

I wake in the County General, three days later, with a headache like a bell. A nurse tells me my licence has been suspended, pending an inquiry. A uniformed officer tells me the inquiry will be brief. There is a get-well card on the table, unsigned. It has a stag on it, a very small one, in the corner, in gold.

The rain, the nurse says, stopped on Tuesday. I don't believe her. I've been listening to it in my head ever since.`,
      ending: { title: 'The Alley', kind: 'bad', score: 120 },
    },
    end_late: {
      scene: '🚢🌅🌧️',
      text: `The sky is going grey over the harbour when I finally understand. It happens the way it always does: not in a flash but in a slow dawning, like a stain spreading through a cloth. I've got everything but the time.

Somewhere on the docks a ship's horn gives a low, ripe, patient sound. The *Calista*. Six a.m. Friday. Whoever was going to be on it is on it now, with a first-class berth and a steward to bring the tea.

I walk back to the office through streets that have started to fill with milk carts and clerks. At my door is an envelope, Ines Calloway's, with a hundred dollars in it and a note in her neat hand. *Case closed. You were very thorough. Thank you.*

I sit down at my desk. The rain is still coming. I do not think it ever stops for a man who's too slow.

I drink the whole bottle, which is, in the end, the only honest thing I do all week.`,
      ending: { title: 'Too Late for the Calista', kind: 'neutral', score: 250 },
    },
    end_paid: {
      scene: '💰🌧️🚉',
      text: `She takes the ledger from me with both hands, as one takes an infant. It's a small relief, almost: the weight leaves me, and my arms feel strangely light.

"Thank you," Ines says. "You've done a good thing, Mr. Detective. For the right people."

There is an envelope in my coat when I get home. Two thousand dollars, new bills, with a little wax seal on the flap, a stag's head over crossed keys. I look at it for a long time.

In the morning the papers say that the Ashgrove suicide has been *closed with the cooperation of the Captain and his department*. Corbin Teague takes a chair at the new Halloran Mutual. Vivian leaves the Blue Lantern and is not seen. The rain stops, the sun comes up, and I buy a very good suit with money that's never, if I'm honest, quite clean.

On clear nights, when the streets are dry and the bridges are lit, a thing I can't quite name stands at the end of the bar and looks at me with Edmund's patient eyes. It never says a word. It doesn't have to.`,
      ending: { title: 'Paid in Full', kind: 'neutral', score: 300 },
    },
    end_secret: {
      scene: '⚖️🌅🔗',
      text: `I put the cufflink on the piano with a small clean click. It rolls once, on its gold edge, and falls over. Then the ledger, with its six years of payments to *H.B.* Then I ask Dr. Fenn to stand.

Nobody has ever heard a room go so quiet. Captain Brandt looks at the stag on the lid of the Steinway, and then at the pin in his left sleeve, and for a long moment he is only a tired man in a grey suit who has made a mistake over a very long time.

"It was only ever to be a small thing," he says, in the sermon voice. "A little arrangement. A city needs its arrangements. You'd be astonished what falls apart without them."

"I'd be astonished," I say, "at what holds together."

I've had Assistant D.A. Oyelaran waiting in a cab outside since three. She comes in with two officers from the county, and they are very polite, very pale, very quick. The Captain doesn't resist. He takes his hat, and thanks Pruitt, and holds the door for the lady.

Teague talks by noon. Ines, by evening. The Gentleman has a name at last, and an office with a view of the river, and a rubber plant that was never, as it turns out, quite honest.

The rain stops at dawn. I stand on the steps of the Meridian and watch the sun do something it has not done in eleven days. Vivian takes my arm. We say nothing at all, and it is the most eloquent thing in the city.`,
      ending: { title: 'The Gentleman Wears a Badge', kind: 'secret', score: 1200 },
    },
  },
} satisfies Story

export default story
