import type { Story } from './types'

const story: Story = {
  id: 458,
  title: "Time Traveler's Diary",
  blurb:
    'Wren Ashby keeps a diary in her father\'s clock shop. One morning the pages come unstuck: some are in her own handwriting, dated years she has not lived. Follow them through gaslight, blackout and flood, and decide what a life is worth when it can be edited.',
  items: {
    watch: '⌚ Father\'s pocket watch',
    key: '🗝️ Brass winding key',
    ink: '🖋️ Ghost-ink',
    photo: '📷 Torn photograph',
    page88: '📜 Page of 1888',
    page43: '📜 Page of 1943',
    page71: '📜 Page of 2071',
    _met_self: 'met self',
    _saved_father: 'saved father',
    _told_tobias: 'told Tobias',
    _done88: 'done 1888',
    _done43: 'done 1943',
    _done71: 'done 2071',
    _trusted: 'trusted stranger',
    _diary: 'read diary',
    _clocks: 'listened to clocks',
  },
  stats: {
    paradox: { label: 'Paradox', emoji: '🌀', start: 0, min: 0, max: 10 },
    anchor: { label: 'Anchor', emoji: '🧭', start: 7, min: 0, max: 10, onMin: 'end_unwritten' },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '📖🕰️☕',
      caption: 'Marlow Row, 3 March 1923',
      text: `The shop smells of oil and cold tea. Forty clocks tick in forty slightly different times, and you have never minded. It is how your father taught you to listen: to the gaps between the ticks.

You are Wren Ashby, eighteen, and you write in your diary every morning before the shutters go up.

This morning the diary will not close. Loose pages slide from the binding like fish from a net. Three of them are not yours.

Or rather, they are yours. The handwriting is. But the dates say 1888, 1943 and 2071, and the ink is still wet.`,
      choices: [
        { text: 'Read the page on top.', to: 'page' },
        { text: 'Shut the diary and shove it in a drawer.', to: 'drawer', effects: { anchor: -1 } },
      ],
    },
    drawer: {
      scene: '🗄️🕰️😰',
      text: `You lock the drawer and stand with your back against it, like a girl in a play.

Behind you the clocks tick. One of them, the tall case clock your father never finished, ticks a half-beat late. Then a half-beat early. Then it stops altogether.

The drawer is warm against your spine. It hums.

You hold out for almost a minute. Then you remember that you have never in your life left a page unread.`,
      choices: [{ text: 'Open the drawer and read.', to: 'page' }],
    },
    page: {
      scene: '📜🖋️🕛',
      text: `The top page is in your hand, slanted hard to the right the way it goes when you are frightened.

*Do not open the shop door at noon. Whoever knocks, let them in by the back. Listen to her. She will be old and she will be rude. She is right.*

*Do not trust the man in the grey coat. He is not a man.*

Under it, smaller, as though added in a hurry: *I am sorry. I did not know it would be you.*

The cuckoo in the corner clears its throat. It is eleven fifty-eight.`,
      choices: [
        { text: 'Obey. Wait by the back door.', to: 'wait' },
        { text: 'Nobody gives you orders, not even you. Open the front door at noon.', to: 'door_noon', effects: { paradox: 1 } },
      ],
    },
    door_noon: {
      scene: '🚪🌫️🔔',
      text: `At the first stroke of noon you turn the bolt and pull the door wide.

There is no Marlow Row. There is fog the colour of a pigeon's chest, and a lamp on a pole, and a man in a grey coat standing very still beneath it. He lifts his hat. He has no face under the brim worth remembering, only a smooth impression of one.

*Miss Ashby,* he says kindly. *You are early.*

You slam the door so hard that three clocks stop. When you look again the street is just the street. But the diary on the counter has fallen open, and all three loose pages are glowing faintly, like coals.`,
      effects: { paradox: 1, anchor: -1 },
      choices: [{ text: 'Go to the pages.', to: 'hub' }],
    },
    wait: {
      scene: '🚪🕰️🔔',
      text: `You wait in the narrow passage by the back door with the diary hugged to your chest.

Noon strikes, forty clocks disagreeing about it. From the front of the shop comes a bell, though nobody has touched the door. A tap-tap-tap of a cane on the pavement outside the back. Slow. Impatient.

*Open up, girl. My knees are older than your grandfather.*

The voice is cracked, and it is the strangest thing you have ever heard, because you know it. You know it the way you know your own cough.`,
      choices: [{ text: 'Open the back door.', to: 'stranger' }],
    },
    stranger: {
      scene: '👵🕯️🗝️',
      caption: 'The old woman',
      text: `She is tiny and furious, wrapped in a coat the colour of tea. Her eyes are your eyes, with seventy years of weather behind them.

*Don't gape,* she says. *Yes. I am. No, you may not touch my face. Put the kettle on, I haven't long. The thing is already looking for me.*

She sits at your father's bench as if it were her own, and in a way it is. She sets down a brass winding key and a small blue bottle with something silver moving in it.`,
      choices: [
        { text: 'Listen to her.', to: 'stranger_talk', give: ['_trusted'] },
        { text: 'Demand proof. Anyone could dress up like this.', to: 'stranger_proof' },
        { text: 'Back away. This is a trick.', to: 'stranger_refuse', effects: { anchor: -1 } },
      ],
    },
    stranger_proof: {
      scene: '👵🔍📖',
      text: `*Proof,* the old woman snorts. *You have a scar under your left knee from the cellar stairs. You have never told anybody you let the canary out on purpose. And when you were nine you wrote in this diary that you would marry a lighthouse.*

You go hot to the ears. Nobody has read that page. Nobody.

*Satisfied?* she says. *Good. Then sit.*`,
      choices: [{ text: 'Sit and listen.', to: 'stranger_talk', give: ['_trusted'] }],
    },
    stranger_talk: {
      scene: '👵🔑🧪',
      caption: 'The old woman',
      text: `*Your father built a clock,* she says. *The Stillwater. He meant it to be the most accurate clock in the world. It was, and that was the trouble. Time noticed.*

*It is stitched wrong now. Three places where the thread puckers: 1888, 1943, 2071. Your diary is the needle, because you have written in it every morning of your life. You are the only thing that runs through all those years like a wire.*

She slides the key and the bottle across.

*Bring me the three pages. Each one is a stitch. If you can pull them straight, the hour between will open and you can mend it from inside. Don't change anything you don't have to. Every change leaves a mark on you.*`,
      choices: [
        { text: 'Take the key and the ink.', to: 'stranger_gift', give: ['key', 'ink'] },
        { text: 'Take only the key. Leave the strange ink.', to: 'stranger_gift', give: ['key'] },
      ],
    },
    stranger_gift: {
      scene: '🔑🕰️✨',
      text: `The key is warm, as if someone has just let go of it. It fits the palm of your hand exactly.

*Last thing,* the old woman says, standing, and her knees crack like twigs. *The man in the grey coat. If he offers you a bargain, remember he is selling you your own life back at a price you've already paid.*

You blink, and the chair is empty. The tea in her cup is still steaming.

On the counter the three pages begin to rustle, one by one, like birds waking.`,
      choices: [{ text: 'Go to the pages.', to: 'hub' }],
    },
    stranger_refuse: {
      scene: '👵💨🚪',
      text: `*Fine,* she says, with a terrible patience. *You were always stubborn. I would have been disappointed otherwise.*

She leaves the brass key on the bench and walks out through the back door into daylight, and you chase after her, and the alley is empty.

Only the key remains, and the three pages, stirring on the counter, impatient as horses.

You did not get the blue bottle. You will have to find your own way to do this.`,
      give: ['key'],
      effects: { anchor: -1 },
      choices: [{ text: 'Go to the pages.', to: 'hub' }],
    },
    hub: {
      scene: '📜🌀🕰️',
      caption: 'The unstuck pages',
      text: `The three pages lie in a fan on the counter. Each one, when you put a finger near it, pulls at you like a current.

1888. A gaslit street and the smell of hot brass.
1943. Black windows, a siren winding down.
2071. Water, and a light the colour of old tin.

You can feel the diary waiting. Whatever you do, you will do it in your own handwriting.`,
      choices: [
        { text: 'Touch the page of 1888.', to: 'e88_arrive', if: [{ not: '_done88' }] },
        { text: 'Touch the page of 1943.', to: 'e43_arrive', if: [{ not: '_done43' }] },
        { text: 'Touch the page of 2071.', to: 'e71_arrive', if: [{ not: '_done71' }] },
        { text: 'Leaf through the rest of the diary before you go.', to: 'diary_read', if: [{ not: '_diary' }] },
        { text: 'Stand still among the clocks and listen.', to: 'shop_clocks', if: [{ not: '_clocks' }] },
        {
          text: 'Gather all three pages and wind the Stillwater clock.',
          to: 'hour',
          if: [{ has: 'page88' }, { has: 'page43' }, { has: 'page71' }],
          lockedHint: 'You need the stitch from every era first.',
        },
      ],
    },

    diary_read: {
      scene: '📖🖋️🌀',
      caption: 'The diary',
      text: `Before you go, you turn back through the bound pages, the ones that stayed where you put them.

There is the entry for your ninth birthday, where you married a lighthouse. There is the week your mother's cough turned into something else, with the handwriting getting smaller each day, as if you could write her better by writing less. There is a shopping list. A pressed violet. A blot.

You find that the margins are not empty. They never were. In the white space beside each entry, in a hand slanted far over to the right, someone has written small, careful notes.

*Yes. This one hurt.* *You were right to be afraid.* *Don't skip breakfast.*

Whoever she is, she has been reading over your shoulder for years. It is, you decide, the kindest sort of haunting.`,
      give: ['_diary'],
      effects: { anchor: 1 },
      choices: [{ text: 'Close the diary.', to: 'hub' }],
    },
    shop_clocks: {
      scene: '🕰️👂🌿',
      caption: 'The shop',
      text: `You stand in the middle of the floor with your eyes closed, the way your father taught you.

Forty clocks. Forty rates of passing. The tall case clock is the slowest, a deep unhurried tock. The cuckoo is nervous and fast. The little carriage clock on the shelf by the window ticks with the sly eagerness of a child trying not to laugh.

If you listen long enough they begin to braid. For a moment you can hear all the hours of your life at once: the time you were small and the time you are, and a long thin note after, rising, like something yet to come.

It is not frightening. It is almost a lullaby. You open your eyes, and the world has settled a little deeper into its place.`,
      give: ['_clocks'],
      effects: { anchor: 1 },
      choices: [{ text: 'Return to the pages.', to: 'hub' }],
    },
    e88_arrive: {
      scene: '🌫️🏮🏚️',
      caption: '1888, the Lamp Quarter',
      text: `The floor drops. You land on your knees on wet cobbles, and the first breath you take tastes of coal and horse and boiled cabbage.

Marlow Row is the same street and a different one. The shop is there, but its sign is fresh paint. TOBIAS ASHBY, CLOCKMAKER. Your grandfather's name, in gold leaf that has not yet had time to flake.

Through the window a young man is bent over a bench, whistling. He is perhaps twenty-five. He has your father's chin.`,
      choices: [
        { text: 'Go in and speak to him.', to: 'e88_tobias' },
        { text: 'Slip in by the cellar hatch and look at the clock first.', to: 'e88_workshop' },
      ],
    },
    e88_tobias: {
      scene: '👨‍🔧🕰️🔔',
      caption: 'Tobias Ashby',
      text: `*We're shut, miss,* he says, without looking up. Then he does look, and his whistle dies.

*You've got the Ashby jaw,* he says slowly. *Whose girl are you?*

You open your mouth to say *yours*, and shut it again.

On the bench between you sits a half-built mechanism no bigger than a loaf. The mainspring is silver, not steel. It is not ticking, and yet you can hear it, deep in your teeth.

*It's my masterpiece,* Tobias says shyly. *I call it the Stillwater. It will never lose a second.*`,
      choices: [
        { text: 'Tell him the truth: you are his granddaughter, and the clock is dangerous.', to: 'e88_tell', effects: { paradox: 2 }, give: ['_told_tobias'] },
        { text: 'Lie. Say you are a collector wanting to see his work.', to: 'e88_lie' },
        { text: 'Ask him what the silver spring is made of.', to: 'e88_spring' },
      ],
    },
    e88_tell: {
      scene: '😲🕰️💬',
      text: `You tell it badly, in the wrong order. The diary, the old woman, the man in the grey coat.

Tobias goes quite still. Then he laughs, once, a short helpless laugh, and sits down on his own stool.

*I knew it,* he says. *Lately the clocks tick out of order when I walk past. I thought I was going mad.* He looks at the silver spring. *Do I stop?*

*I don't know,* you say honestly. *If you stop, will my father be born?*

It is a ridiculous thing to ask a stranger. He is not a stranger. His hands shake.`,
      choices: [
        { text: 'Ask him to leave the spring unfinished.', to: 'e88_page', effects: { paradox: 1 } },
        { text: 'Tell him to do as he likes. You only need the page.', to: 'e88_page' },
      ],
    },
    e88_lie: {
      scene: '🎩🕰️🤫',
      text: `*A collector,* Tobias says, pleased. He does not stop to ask why a collector should be dressed in a girl's wool skirt and clutching a diary like a hymn book.

He shows you everything: the escapement, the jewel bearings, the little brass bell. You nod in the right places.

When he turns to fetch a lamp you see, on the shelf behind him, a page stuck to the wall with a nail. Your own writing. Of course.`,
      choices: [{ text: 'Take it while he is distracted.', to: 'e88_page' }],
    },
    e88_spring: {
      scene: '🔩🌙✨',
      text: `*Moonlight,* Tobias says, and then blushes. *Not really. A tincture of silver and a bit of an old cathedral clock that stopped the night the bishop died. Everyone says it is only metal. But look.*

He holds it to the lamp. The light bends strangely around it, as if the spring were pulling the room's minutes toward itself and storing them.

*Clocks don't make time,* you say, almost to yourself. *They just count it.*

*This one,* says your grandfather, very quietly, *saves it.*`,
      choices: [{ text: 'Ask where he keeps the finished pages of his notes.', to: 'e88_page' }],
    },
    e88_workshop: {
      scene: '🕳️🕰️🔦',
      text: `The cellar is cool and smells of turpentine. You climb the stairs by touch, the way you did when you were small, and come out behind the bench.

Up close the clock is awful in its beauty. Under the brass there is a pulse. A tick, and the tick of the tick, and the tick of the tick of the tick, nesting down like dolls.

A page of your own handwriting is pinned to the underside of the bench. You reach for it.

*Don't,* says a voice in your ear, courteous and dry. *Not yet. Let me show you something.*`,
      choices: [
        { text: 'Turn around.', to: 'e88_grey' },
        { text: 'Grab the page and run.', to: 'e88_page', effects: { paradox: 1 } },
      ],
    },
    e88_grey: {
      scene: '🧥🌫️🕰️',
      caption: 'The man in the grey coat',
      text: `He is standing exactly where the shadow is thickest. This close, you cannot tell his age or his eyes.

*I admire your family,* he says. *You make small, honest things. I should like to help. Give me the key you carry, and I will see that no page ever puzzles you again. You will never be torn.*

*I am nothing to fear. I am only a clerk. Something has to keep the accounts of time.*

The key is hot in your pocket, like a swallowed coal.`,
      choices: [
        { text: 'Give him the key.', to: 'e88_give', if: [{ has: 'key' }], lockedHint: 'You have nothing to give him.' },
        { text: 'Refuse. Tell him you know what he is.', to: 'e88_refuse', if: [{ has: '_trusted' }], lockedHint: 'You do not know enough to name him.' },
        { text: 'Throw the contents of your inkpot at him.', to: 'e88_ink' },
      ],
    },
    e88_give: {
      scene: '🔑🧥😶',
      text: `You hold out the key. His fingers do not close around it. They pass through, and the key stays on your palm, and he smiles.

*Thank you,* he says. *That was all I needed. A person who offers freely.*

It feels as if a button has been undone somewhere inside your chest. The cellar tilts, and you lose a Tuesday, or a week, you cannot say which. The grey coat is gone.

When you come back to yourself you are standing by the bench, and the page is in your hand, and you do not remember taking it.`,
      effects: { anchor: -3, paradox: 1 },
      choices: [{ text: 'Look at what you hold.', to: 'e88_page' }],
    },
    e88_refuse: {
      scene: '🧥✋🔥',
      text: `*A clerk,* you say. *Of debts. That is all you are. You do not make anything. You only collect what is left over when someone else has made a mistake.*

For an instant the smooth place under his hat has a mouth, and the mouth is not pleased.

*Clever,* he says. *Remember, Miss Ashby. Nothing I say is untrue.*

He steps backward into the shadow, and the shadow is only a shadow.`,
      effects: { anchor: 1 },
      choices: [{ text: 'Take the page from under the bench.', to: 'e88_page' }],
    },
    e88_ink: {
      scene: '🖋️🧥💥',
      text: `You fling the contents of your pen case. A thin black arc of ink hits his coat and does not stain. It slides down it in beads, as if he were made of wax.

He looks at the ink, then at you, with gentle disappointment.

*A child's trick,* he says. *Run along.*

You do, though not far, because it is a cellar. The back of your hand is trembling when you find the page.`,
      effects: { anchor: -1 },
      choices: [{ text: 'Take the page.', to: 'e88_page' }],
    },
    e88_page: {
      scene: '📜🕰️🏮',
      text: `The page comes away from its nail with a sound like a held breath let go.

It is in your writing. It says, in full: *I came here. I told him, or I did not. It makes no difference. He built it either way. Look for him in the bell.*

You look at the little brass bell on the clock. Inside it, scratched with a pin, there are initials. T.A. and underneath, much newer: W.A.

The street outside is lengthening, bending away like a reflection in a spoon. It is time to go home.`,
      give: ['page88', '_done88'],
      choices: [{ text: 'Let the page pull you back.', to: 'hub' }],
    },

    e43_arrive: {
      scene: '🌃✈️🏚️',
      caption: '1943, the blackout',
      text: `Dark, and a rising whine like a kettle the size of a city.

You are in Marlow Row. Every window is papered black. Somewhere over the rooftops searchlights cross and uncross like the legs of a pair of giant compasses. A man in a tin helmet is bellowing *Lights out, lights OUT!* at an upstairs window.

The shop is still there, but the sign is gone and half the roof with it. Someone has chalked on the door: *OPEN. ASK FOR ASHBY.*`,
      choices: [
        { text: 'Run for the shop.', to: 'e43_shop' },
        { text: 'Get down into the shelter on the corner.', to: 'e43_shelter' },
      ],
    },
    e43_shelter: {
      scene: '🛖🕯️👥',
      text: `The shelter is a hole under a sheet of corrugated iron with a bench along each wall. A dozen strangers sit with their knees touching. A baby sleeps. A boy of about ten is reading by a torch with a blue lens.

*Mind my brother,* says a girl. *He bites.*

Nobody asks who you are. In the dark you could be anyone's cousin. The ground shudders. A faint powder of dust falls.

When it passes you take your chance and go up the steps, quickly, before you can think better of it.`,
      choices: [{ text: 'Run for the shop.', to: 'e43_shop' }],
    },
    e43_shop: {
      scene: '🏚️🕯️🕰️',
      text: `Half the clocks are gone. The others are all stopped at the same time: a quarter past two.

At the bench, in the light of a single candle, sits a woman of thirty-eight in a warden's armband. She has your mouth. She has your mother's tired eyes. She is writing in a diary.

You have not decided what to do when you see yourself. It turns out your body decides for you. You make a small, unintended sound.

She looks up.`,
      give: ['_met_self'],
      effects: { paradox: 2 },
      choices: [
        { text: 'Say nothing. Back away.', to: 'e43_backaway', effects: { anchor: -1 } },
        { text: 'Say: *It is all right. I am you.*', to: 'e43_self' },
      ],
    },
    e43_backaway: {
      scene: '🕯️👤😨',
      text: `She stands. She does not look frightened. She looks like a woman who has had a very long week.

*You're the one from the diary,* she says. *I wondered whether you'd come at this part. Sit. No, I can't hold your hand, they say that makes it worse. Nobody told me what, exactly, it makes worse.*

Her voice is low and flat. She has been crying and has finished.

*Father died here,* she says. *Tonight. In about an hour. The Row takes a direct hit. I am only waiting.*`,
      choices: [{ text: 'Sit with her.', to: 'e43_father' }],
    },
    e43_self: {
      scene: '🕯️👥💬',
      caption: 'Wren, aged thirty-eight',
      text: `*I know,* she says. *I've read it. You said it, word for word. I have been practising not to flinch.*

She does flinch, a little. You both do.

She tells you in a dry, quick voice, as one reads out a list of groceries: it is the night of the fourteenth of March. In an hour a bomb will fall on the corner of Marlow Row. Your father, Edmund Ashby, sixty and half-deaf, has refused to leave his bench.

*He's out the back with the Stillwater,* she says. *He says it is the only thing in London that's keeping honest time.*`,
      choices: [{ text: 'Go to him.', to: 'e43_father' }],
    },
    e43_father: {
      scene: '👴🕰️🕯️',
      caption: 'Edmund Ashby',
      text: `Your father is bent over the clock, with a loupe screwed into his eye. He has less hair, and more beard, and he is humming off-key.

He sees you and takes the loupe out slowly, the way he does when something is very important.

*Wren,* he says, and it is not clear which of you he means. Both, perhaps.

There is a siren in the distance, and under it, closer, the soft ominous drone of engines. You have perhaps ten minutes.

On the bench lies a photograph torn in half: a woman with a baby in front of the shop. He presses it into your hand without explanation. *Your mother wanted you to have it,* he says. *I never knew when.*`,
      give: ['photo'],
      choices: [
        { text: 'Take his arm and drag him to the shelter.', to: 'e43_warn', effects: { paradox: 3 }, give: ['_saved_father'] },
        { text: 'Tell him you love him. Stay with him. Do not interfere.', to: 'e43_accept', effects: { anchor: 1 } },
        { text: 'Ask for his pocket watch, to remember him by.', to: 'e43_watch' },
      ],
    },
    e43_warn: {
      scene: '🏃‍♂️💨💥',
      text: `He fights you, of course. He is a clockmaker; you are asking him to leave something unfinished. But you were taught by him to be exact, and you are exact now.

*Father. Please. For me.*

You get him as far as the corner when the whistle comes down. The world goes white and then the colour of a bruise.

When you open your eyes, you are in the shelter and he is beside you, grey with plaster, alive, swearing, and perfectly furious. Beyond the iron the Row burns. The shop is gone.

Somewhere deep in you, a thread has snapped. You feel it as a loose tooth feels.`,
      choices: [{ text: 'Find the page.', to: 'e43_page' }],
    },
    e43_accept: {
      scene: '👨‍👧🕯️🕰️',
      text: `You do not drag him. It is the hardest thing you have ever done, to stand in a doorway and let someone choose.

He shows you the Stillwater's little brass bell, and tells you the whole story of building it, the way he never did when you were small. He tells you he is proud of you. He tells you where he hid the good brandy.

At twelve minutes to three he puts his hand over yours.

*You'll go on now,* he says. *Both of you.* You are not certain who he means. When you look up, your older self is crying silently, and nodding.`,
      choices: [{ text: 'Walk out together before the whistle.', to: 'e43_page', effects: { anchor: -1 } }],
    },
    e43_watch: {
      scene: '⌚👴🕯️',
      text: `*Hm?* He fumbles it from his waistcoat: a plain steel watch with the glass chipped at the six. *It loses four minutes a week. I never could fix it.*

You close your fingers around it. It is the first object you have ever carried out of a time and into another one, and it feels like holding a very small heart.

*Take care of it,* he says, *and you'll never be late.*

He does not know what he has said. You do.`,
      give: ['watch'],
      choices: [
        { text: 'Now drag him to the shelter.', to: 'e43_warn', effects: { paradox: 3 }, give: ['_saved_father'] },
        { text: 'Now stay with him until the end.', to: 'e43_accept' },
      ],
    },
    e43_page: {
      scene: '📜🔥🌙',
      text: `The page is pinned to the clock's casing, and the heat of the night has curled it at the edges.

It reads: *You can save him. You can't save him and keep everything else. I do not know which I wished for you to choose. That is the kind of thing a diary is for.*

You fold the page into your pocket. Behind you the older Wren has already turned away. She lifts a hand without looking back, the way people do when they are saying goodbye and do not want to be seen.

The searchlights swing and swing, and the night rolls up like a map.`,
      give: ['page43', '_done43'],
      choices: [{ text: 'Let go of the year.', to: 'hub' }],
    },

    e71_arrive: {
      scene: '🌊🏙️🌅',
      caption: '2071, the Drowned Row',
      text: `You surface in water to your knees, warm as a bath, and brown, and full of small silver fish.

Marlow Row is a canal. The upper floors have been joined with rope bridges and washing lines, and the roofs grow tomatoes. Where the shop should be there is a squat building with a green glass door and the legend *MUSEUM OF THE HOUR (ADMISSION BY BARTER)*.

Something is wrong with the light. It is the colour of tin, and it comes from everywhere at once.`,
      choices: [
        { text: 'Wade to the museum.', to: 'e71_museum' },
        { text: 'Watch for a moment from the bridge.', to: 'e71_bridge' },
      ],
    },
    e71_bridge: {
      scene: '🌉🐟🌅',
      text: `From the rope bridge you can see the whole of the Drowned Row: boats moored at upstairs windows, children diving from the guttering, a woman hanging up a quilt that appears to be stitched from hundreds of different clock faces.

Nobody here is in a hurry. The bell of some distant church rings seven times, and then, after a pause, seven again. People pause, smile, and shrug. Time keeps sloppy hours these days.

You understand, with a pang, that this is what the Stillwater did. Not stopped time. Only loosened it.`,
      choices: [{ text: 'Go to the museum.', to: 'e71_museum' }],
    },
    e71_museum: {
      scene: '🏛️🕰️📚',
      caption: 'Pim, archivist',
      text: `Inside, the museum is one long room full of broken clocks laid out on drying racks. A girl of about twelve is sitting on a stepladder, sorting springs by size.

*Admission is barter,* she says, without turning around. *What have you got?*

Then she turns around and sees your face.

*Oh,* she says, and drops a spring. *Oh, you're the real one. You're Wren Ashby. We have your diary in a case. It's the oldest thing in the building. It's the only reason we're here.*`,
      choices: [
        { text: 'Ask to see the diary in the case.', to: 'e71_case' },
        { text: 'Offer her the pocket watch as barter.', to: 'e71_barter', if: [{ has: 'watch' }], lockedHint: 'You have nothing worth bartering.' },
        { text: 'Ask what she means: the only reason you are here?', to: 'e71_pim' },
      ],
    },
    e71_barter: {
      scene: '⌚👧✨',
      text: `Pim takes the steel watch as though it might break if she breathed on it. She turns it over. She finds the tiny scratched initials on the back: *E.A.*

*It's not in the catalogue,* she whispers. *It's supposed to have been lost in the bombing.*

She tucks it into her pinafore, and then, after a long moment, takes it out and presses it back into your hand.

*You should keep it. It's going to matter. I don't know how, but the diary says so.* She clears her throat, businesslike. *Admission waived.*`,
      choices: [{ text: 'See the diary.', to: 'e71_case' }],
    },
    e71_pim: {
      scene: '👧📖🌊',
      text: `*The Stillwater,* says Pim. *You know. Everyone knows. It was wound once, in a bad hour, and it never ran down. The tides followed it, and the weather, and the calendar. The scholars say that every hour since has been slightly borrowed.*

She sits on the step with her chin on her knees.

*Your diary is the only record of how it was meant to go. You wrote down the real hours. We have been reading it for fifty years, trying to work out how to give the time back.*

Her eyes are enormous. *You're supposed to be dead.*`,
      choices: [{ text: 'See the diary.', to: 'e71_case' }],
    },
    e71_case: {
      scene: '📖🔒💡',
      text: `The diary lies open under glass, in a case lit by a bulb that Pim cranks by hand.

You know that cover. You know that crooked stitch. You lean down and read the open page, and your heart goes still, because it is today's entry. This morning's. The words you wrote at dawn about the wet pages, the smell of tea, and the cuckoo clearing its throat.

*It's been open at that page for fifty years,* Pim says. *Nobody can turn it. And look at the ink.*

The ink is wet.`,
      choices: [
        { text: 'Press the glass. Try to turn the page.', to: 'e71_turn', effects: { paradox: 2 } },
        { text: 'Read the margin notes in the book next to it.', to: 'e71_book' },
      ],
    },
    e71_turn: {
      scene: '📖💥🌀',
      text: `The glass thrums under your palm. There is a sound like a sheet being torn very slowly.

The page lifts an inch, and for one moment you see what is written on its back, in letters that grow even as you read them. *You will write this. You will write this. You will write this.*

Then your hand is thrown off, and Pim catches you before you fall in the shallow water. The case is whole. The page lies flat.

*Nobody can,* she says. *Not even you. Sorry.*

You are shaking. The tin-coloured light flickers.`,
      effects: { anchor: -1 },
      choices: [{ text: 'Read the book beside it.', to: 'e71_book' }],
    },
    e71_book: {
      scene: '📚👵🕰️',
      caption: 'Annotated Diary of W. Ashby (4th edition)',
      text: `The book is a scholarly edition, fat with footnotes. You flip to the preface, and read the first line twice.

*The identity of the elderly visitor in the entry for 3 March 1923 has long been debated. We now believe she is the diarist herself, returned through the Stillwater at the end of her natural life, in an attempt to ensure her younger self would begin the repair.*

*The note in the margin of the same page reads: "I did not know it would be you."*

You understand now. The old woman did not come to save you. She came because she had been saved before, by an older one, and an older one, and it has been going round for ever.`,
      choices: [
        { text: 'Ask Pim for the loose page the scholars could not place.', to: 'e71_page' },
        { text: 'Ask whether the grey man is in the footnotes.', to: 'e71_grey' },
      ],
    },
    e71_grey: {
      scene: '🧥📚🕯️',
      text: `Pim's face closes like a door.

*We don't say his name,* she says. *Grandmother taught me. He is called the Auditor, and he arrives when a debt is unpaid. When the clock was wound, a thousand years of hours were borrowed. He collects, a little at a time. People who forget their own birthdays. Lovers who wake and cannot recall a face.*

*He cannot touch you if you are truly yourself,* she adds, and the way she says it makes you wonder how often it has been tested.

She finds the page and hands it over, tied with a string of green wool.`,
      effects: { anchor: 1 },
      choices: [{ text: 'Take it.', to: 'e71_page' }],
    },
    e71_page: {
      scene: '📜🧵🌅',
      text: `The last page is brittle, written in a hand much older and shakier than any you recognise. It says only:

*Come home. Bring the three. Wind the clock backwards, not forwards. You will have to decide what to give up, and I will not tell you what I gave. It would be unfair to you.*

*There is a tide in everything. It goes out.*

Pim helps you fold it. At the door she asks whether you will remember her. You say you will. You are not certain it is true.`,
      give: ['page71', '_done71'],
      choices: [{ text: 'Step out into the tin-coloured light.', to: 'hub' }],
    },

    hour: {
      scene: '🕰️🌌⏳',
      caption: 'The Hour Between',
      text: `You lay the three pages on the counter and wind the Stillwater with the brass key, one full turn, backwards.

The shop falls away. You stand in a long, still room whose floor is the face of a clock and whose ceiling is the underside of a wave. Every second of your life hangs there like a bead of glass, and you can walk among them.

At the centre is the Stillwater, enormous, ticking in all the times at once.

Beside it stands the man in the grey coat. He takes off his hat. His face has settled into one at last. It is yours, very old, very kind, and very hungry.`,
      choices: [
        { text: 'Listen to what he has to say.', to: 'hour_grey' },
        { text: 'Go to the clock without speaking.', to: 'hour_clock' },
      ],
    },
    hour_grey: {
      scene: '🧥🕰️🤝',
      caption: 'The Auditor',
      text: `*I am what is left over,* he says, in your voice. *When you save a life, the hours must come from somewhere. When you take a day back, a day is spent. All I do is keep the books.*

*Wind the clock forward and the loop closes. You become the old woman. You go back and send yourself, as she did, and it goes on, kindly and for ever, and nobody is hurt. Wind it back, and everything you changed is undone, including the changes you hold most dear.*

*Or hand me your name. I shall be generous.*`,
      choices: [
        { text: 'Wind it forward. Close the loop.', to: 'end_loop' },
        { text: 'Wind it back. Undo everything.', to: 'hour_back' },
        { text: 'Give him a different payment: the hours of your own life.', to: 'hour_pay', if: [{ has: 'watch' }], lockedHint: 'You would need something of your father to pay with.' },
        { text: 'Write the last page yourself.', to: 'hour_blank', if: [{ has: 'ink' }, { has: 'photo' }], lockedHint: 'You lack the means to write something that cannot be unwritten.' },
      ],
    },
    hour_clock: {
      scene: '🕰️🔑🌌',
      text: `You do not look at him. You walk across the face of the clock, over the numerals, and the glass beads of your days chime softly against your sleeves.

The Stillwater is ticking in four-four, in three-four, in every metre ever invented. Behind its glass door is the silver spring. You can see your grandfather's thumbprint on it.

*Careful,* says the Auditor, politely. *You are making it difficult for both of us.*

On the mantel of the clock are three small slots, the exact shape of the pages.`,
      choices: [
        { text: 'Turn and face him.', to: 'hour_grey' },
        { text: 'Slot the pages and wind it back at once.', to: 'hour_back' },
      ],
    },
    hour_back: {
      scene: '🔙🕰️🌀',
      text: `The key turns hard, and the room runs backwards. Pages flutter into place. Bombs rise into their planes. Your grandfather puts down a silver spring and sighs, relieved.

How much that will cost you depends on how much you changed.

You feel the whole tally of it pass through you like a long cold wind.`,
      choices: [
        { text: 'Brace yourself.', to: 'end_unwritten', if: [{ stat: 'paradox', min: 8 }] },
        { text: 'Brace yourself.', to: 'end_mended', if: [{ stat: 'paradox', max: 7 }, { not: '_saved_father' }] },
        { text: 'Brace yourself.', to: 'end_father', if: [{ stat: 'paradox', max: 7 }, { has: '_saved_father' }] },
      ],
    },
    hour_pay: {
      scene: '⌚🧥🎁',
      text: `You set your father's watch on the clock face. It lies there ticking four minutes slow.

*These are the hours he did not live,* you say. *And these are the hours you owe him. The count is wrong, Auditor, and you know it. Let them cancel.*

The Auditor stares at the watch for a long time. Then, very slowly, something in his face loosens.

*Nobody has ever asked me that,* he says. *I am not certain that I can. But I am willing to be argued with.*`,
      choices: [
        { text: 'Argue, in your father\'s voice, until dawn.', to: 'end_mended', if: [{ stat: 'paradox', max: 6 }], lockedHint: 'Your paradox is too high; he will not listen.' },
        { text: 'It is too late: the loop will close anyway.', to: 'end_loop' },
      ],
    },
    hour_blank: {
      scene: '📖🖋️✨',
      text: `You lay the torn photograph on the diary. It shows a woman you have never met, holding a baby, standing in front of the shop. On the back is written, in a hand you know: *Your mother. You were three days old.*

You unscrew the blue bottle. The ghost-ink moves in it like a minnow.

*That is cheating,* says the Auditor, but gently, and with something like awe.

You write one line on the blank page the clock has been saving for you since the first morning. You write it with the whole of your hand.`,
      choices: [{ text: 'Read what you wrote.', to: 'end_blank' }],
    },

    end_loop: {
      scene: '🔄🕰️👵',
      text: `You wind the Stillwater forward. The loop closes with a soft, domestic click, like a drawer.

Seventy years pass, and you take them one morning at a time, writing in the diary every day. You become a woman with a tea-coloured coat and cracked knees.

And on a Tuesday in March, you cross the shop threshold with a brass key in your fist, to knock on the back door of a girl who does not yet know she will be you.

*Open up,* you say. *My knees are older than your grandfather.*

It is not unhappy. It is only round.`,
      ending: { title: 'The Closed Loop', kind: 'neutral', score: 60 },
    },
    end_mended: {
      scene: '🕰️🌅🌷',
      text: `The hour unwinds without a sound. When it has finished you are standing in the shop at ten to noon on an ordinary Tuesday. The tall case clock ticks. The cuckoo coughs. Everything is as it was, except for one thing.

You remember. Every era, every face. Nobody else will. But you do, and you write it down, at the bench, in the morning, in your own hand.

On the last page of the diary you add: *I mended it. I did not know it would be me.*

The clocks all chime noon together, for the first time in your life.`,
      ending: { title: 'The Mended Hour', kind: 'good', score: 100 },
    },
    end_father: {
      scene: '👨‍👧🕰️🌷',
      text: `The hour unwinds, but there is a snag where you pulled your father from the fire. The Auditor's ledger cannot make the figures close.

So something is spared. When you open your eyes you are in the shop, and he is at the bench, whole, alive, grumbling about the late milk. The year is 1923 and he is fifty-seven, and he is not going to die in a bombing.

He will die of ordinary things, a long time from now, in his own bed. You have bought him that, and you will never be able to explain.

You hold the pocket watch to your ear and it is four minutes slow.`,
      ending: { title: 'A Father Spared', kind: 'good', score: 90 },
    },
    end_unwritten: {
      scene: '🌀📖🌫️',
      text: `There is too much of you, in too many places. The Auditor does not even have to take. He only has to wait.

You feel yourself spread thin, like butter over too much bread. You are a girl in a shop, a warden in a blackout, an archivist's story, an old woman at a door. None of them is quite you.

The pages blow out of your hands. One by one the words on them let go.

*Do not be afraid,* the Auditor says. *There is a place for people who have been in too many hours. It is not unpleasant. It is only quiet.*

The Stillwater ticks, and ticks, and you cannot count it.`,
      ending: { title: 'Unwritten', kind: 'bad', score: 15 },
    },
    end_blank: {
      scene: '📖✨🌅',
      text: `What you wrote is short. It is not a command, or a spell, or a bargain. It is a sentence of the kind your father used to hum while he worked.

*Whatever hour it is, I am here, and I was loved.*

The Auditor reads it over your shoulder. His hat falls from his hand, and he does not pick it up. His face is a face now, and it is no longer hungry.

*That cannot be repaid,* he says, wondering. *Therefore it cannot be owed.*

The Stillwater strikes once, and then it begins to run, quietly and truly, at the pace of a human heart. You step out of the Hour into a morning that is only a morning.`,
      ending: { title: 'The Last Page', kind: 'secret', score: 130 },
    },
  },
}

export default story
