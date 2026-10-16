import type { Story } from './types'

const story: Story = {
  id: 472,
  title: 'Murder on the Express',
  blurb:
    'The Aurelian Night Express is stopped dead in a snowdrift, forty miles from anywhere. In compartment seven lies Silas Vane, auctioneer, bolted in and silent. Six passengers, one conductor, a notebook and eight hours until the plough: someone on this train knows exactly how he died.',
  items: {
    thread: '🧵 Red silk thread',
    card: '🃏 Bent playing card',
    cufflink: '🔗 Torn cufflink',
    ledger: '📓 Aske\'s ledger',
    vial: '🧴 Odile\'s empty drops bottle',
    letter_doc: '✉️ Doctor\'s letter',
    pact: '📜 Handwritten pact',
    key: '🗝️ Luggage van key',
    _needle: 'noticed needle mark',
    _body: 'examined body',
    _door: 'examined door',
    _desk: 'examined desk',
    _venn_claim: 'Venn claims she slept',
    _saw_venn: 'Reiss saw Venn in corridor',
    _odile_visit: 'Odile visited at 1:40',
    _morph: 'missing morphine ampoule',
    _will: 'Vane\'s new will',
    _twoglass: 'two glasses',
    _trunk: 'searched trunk',
    _obs: 'visited observation car',
    _v_venn: 'seen Venn',
    _v_odile: 'seen Odile',
    _v_aske: 'seen Aske',
    _v_quill: 'seen Quill',
    _v_agnes: 'seen Agnes',
    _v_reiss: 'seen Reiss',
    _a1: 'asked a1',
    _a2: 'asked a2',
    _a3: 'asked a3',
    _a4: 'asked a4',
    _a5: 'asked a5',
    _a6: 'asked a6',
    _a7: 'asked a7',
    _a8: 'asked a8',
    _a9: 'asked a9',
    _a10: 'asked a10',
    _a11: 'asked a11',
    _a12: 'asked a12',
  },
  stats: {
    time: { label: 'Hours to the plough', emoji: '⏳', start: 9, min: 0, max: 9, onMin: 'end_thaw' },
    standing: { label: 'Standing', emoji: '🎩', start: 6, min: 0, max: 10, onMin: 'end_mutiny' },
    insight: { label: 'Insight', emoji: '🔍', start: 0, min: 0, max: 10 },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🚂❄️🌙',
      caption: 'The Aurelian Night Express, 9 p.m.',
      text: `The dining car smells of beef stock, cigars and wet wool. Snow falls past the windows in long diagonal lines, as though someone were crossing out the night.

You are Ines Calloway, an insurance investigator, travelling second class and dining first, because your employers will be paying for neither. You have a notebook, a bad cold and an unreasonably good memory for faces.

It is the sort of train that collects people who are running toward something or away from it. You count six at the nearby tables, and you cannot help it. You assign each of them a motive before the soup.

At the best table, laughing too loudly, sits a stout man in a velvet jacket. He raises his glass to the room.

*To the long night!* says Silas Vane.`,
      choices: [{ text: 'Take a seat and watch.', to: 'dinner' }],
    },
    dinner: {
      scene: '🍷🍽️👥',
      text: `You see it all over the consommé.

A silver-haired woman in a red silk scarf, performing a coin trick for the waiter, with fingers like a pianist's. She is Isadora Venn, the retired magician, and she does not once look at Vane.

A tall soprano with a throat swathed in sable: Odile Sarrazin. She looks at Vane constantly, as one looks at a bill.

A grey Lord Peregrine Aske, who keeps consulting his watch. A nervous young man, Tobias Quill, who is cutting Vane's meat for him. A calm woman in nurse's grey, Sister Agnes Holloway, reading a hymnal at the corner table. And the conductor, Anton Reiss, so smooth and anonymous that you would forget him if he were not holding your ticket.

At eleven the train shudders, groans, and stops. The lamps stutter. Outside, the white goes on for ever.`,
      choices: [{ text: 'Go to bed. It is not your business.', to: 'murder' }],
    },
    murder: {
      scene: '🚪🔦😨',
      caption: 'Three in the morning',
      text: `You are woken by a hand on the door and a voice that has lost its manners.

*Madam, you are an investigator. The Sister says you are. Please come.*

In the corridor of the sleeping car, a ring of pale faces. Quill is kneeling on the carpet in his pyjamas, shaking. Reiss has a crowbar in his hand and a splintered door at his shoulder.

Compartment seven. The bolt on the inside has been ripped from the wood. The window is sealed with a skin of ice. The room is warm and smells of brandy, and on the bed, fully dressed, lies Silas Vane. His eyes are closed. His face is calm.

*He is dead,* says the Sister softly. *Some time since.*

*No one went in or out,* says Reiss. *I swear it. The door was bolted from inside.*`,
      choices: [{ text: 'Take charge. Send them all back to their compartments.', to: 'hub' }],
    },
    hub: {
      scene: '🚂🔍📓',
      caption: 'The sleeping car',
      text: `The train ticks as it cools. Your notebook is open on your knee.

Eight hours, the conductor says, until the plough comes from Karst. After that the passengers will be taken off, statements will be taken and lost, and whoever killed Silas Vane will be a very respectable person on a platform somewhere.

You have a body, a locked room and six people, each of whom has already decided how much to lie.

The questions are small and simple. How was the door bolted? Who had a reason? Who was in that corridor?`,
      choices: [
        { text: 'Examine compartment seven.', to: 'comp7' },
        { text: 'Speak to Isadora Venn, the magician.', to: 'venn_intro', if: [{ not: '_v_venn' }] },
        { text: 'Speak to Odile Sarrazin, the soprano.', to: 'odile_intro', if: [{ not: '_v_odile' }] },
        { text: 'Speak to Lord Peregrine Aske.', to: 'aske_intro', if: [{ not: '_v_aske' }] },
        { text: 'Speak to Tobias Quill, the secretary.', to: 'quill_intro', if: [{ not: '_v_quill' }] },
        { text: 'Speak to Sister Agnes Holloway.', to: 'agnes_intro', if: [{ not: '_v_agnes' }] },
        { text: 'Speak to Anton Reiss, the conductor.', to: 'reiss_intro', if: [{ not: '_v_reiss' }] },
        { text: 'Go to the luggage van and open Venn\'s trunk.', to: 'trunk', if: [{ has: 'key' }, { not: '_trunk' }], lockedHint: 'You need a key to the luggage van.' },
        { text: 'Walk back to the observation car and look at the snow.', to: 'observation', if: [{ not: '_obs' }] },
        { text: 'Sit by yourself and review the notebook.', to: 'notebook' },
        { text: 'Make your accusation.', to: 'accuse' },
      ],
    },
    notebook: {
      scene: '📓✏️🕯️',
      caption: 'Your notebook',
      text: `You turn a page and put down what you know.

The victim: Silas Vane, 61, auctioneer, of Aske & Vane. Forged papers, forged provenance, forged friendships, from the look of him. A man everybody on this train appears to have known for years, and no one appears to have liked.

The room: bolted inside. Window frozen shut. A warm room, two glasses on the table, one half-finished.

The time: around two, the Sister says.

You close the book. There is only one honest way to untangle a lie, and that is to sit with the liars.`,
      effects: { insight: 1 },
      choices: [{ text: 'Back to work.', to: 'hub' }],
    },

    observation: {
      scene: '🌨️🚂🌌',
      caption: 'The observation car',
      text: `The last car is a glass bubble full of wicker chairs and dead ferns, designed for summer scenery. Now it shows only the dark, and the snow in it, and your own tired face looking back.

You are not alone. In the far corner, in the dimness, Isadora Venn is sitting with a pack of cards, laying out patience on a little brass table.

*Insomnia,* she says. *It is the curse of the old. Come and keep me company, Miss Calloway. I shan't bite.*

You sit. She deals. Her hands move like water. You notice that she does not once look at the cards.

*Do you believe in fair play?* she asks, turning up a queen of spades. *I do. It is why I never cheat at cards. Only at everything else.*

She smiles, and slips the queen back into the pack. The snow goes on falling.`,
      effects: { time: -1, insight: 1 },
      give: ['_obs'],
      choices: [{ text: 'Excuse yourself and return to work.', to: 'hub' }],
    },
    comp7: {
      scene: '🛏️🔍🥃',
      caption: 'Compartment seven',
      text: `They have left the room as it was, at your order. Reiss stands guard in the corridor, grim and sleepless.

The light is low and yellow. The window is a sheet of white. On the little table stand a half-empty decanter, a bowl of walnuts, and two glasses.

Vane lies with his hands at his sides as though somebody had arranged him.

You have an hour here, if you wish to use it. You will not get a second look before the plough.`,
      effects: { time: -1 },
      choices: [
        { text: 'Look closely at the body.', to: 'body', if: [{ not: '_body' }] },
        { text: 'Examine the broken door.', to: 'door', if: [{ not: '_door' }] },
        { text: 'Search the table and the floor.', to: 'desk', if: [{ not: '_desk' }] },
        { text: 'Go through his coat pockets.', to: 'coat', if: [{ has: '_needle' }, { not: 'letter_doc' }], lockedHint: 'You have no reason yet to look further than his pockets.' },
        { text: 'Step back out.', to: 'hub' },
      ],
    },
    body: {
      scene: '🧑‍⚕️🔍💉',
      text: `There is no blood. The face is relaxed to the point of peace. Rigor has begun at the jaw and the hands.

You turn back the cuff of the left sleeve. In the crook of the elbow, small and neat, a puncture mark, with the faint purple halo of a bruise.

A needle. Not a struggle: a quiet one. He held out his arm.

And there is a faint sweet smell about his mouth that is not brandy. Your mind runs through every poison you know and finds one that fits. Morphine.`,
      give: ['_body', '_needle'],
      effects: { insight: 1 },
      choices: [{ text: 'Go on looking.', to: 'comp7', effects: { time: 0 } }],
    },
    door: {
      scene: '🚪🔩🔬',
      text: `The door is of oak. The bolt is a brass slide, three inches long, with a screw hole that has been wrenched out.

You kneel. The bolt has not been forced: it was driven shut. There are tiny scratches on the brass, running from left to right. The inside of the frame, at the height of your shoulder, has a sticky patch of something.

You tease a fibre from it with a fingernail. Red. Silk. Fine as a hair, with a slight twist.

A thread, run through the gap beneath the door, looped round the bolt, and pulled from the corridor side. You have seen the trick on a stage.`,
      give: ['thread', '_door'],
      effects: { insight: 2 },
      choices: [{ text: 'Go on looking.', to: 'comp7' }],
    },
    desk: {
      scene: '🥃🃏🔍',
      text: `Two glasses. One, still half full, smells of brandy and sugar. The other has a bright crescent of lipstick on the rim, a dark red, theatrical.

You smile grimly. Beneath the bed, in a drift of dust, your fingers find something stiff and small. A playing card, the queen of hearts, bent down the middle by a firm thumb. There is a tiny pinprick in one corner.

On the carpet by the leg of the table, half a gold cufflink, torn from its pair, with a crest of a stag.

The lipstick, the cufflink and the card are three different stories. You can only hear one at a time.`,
      give: ['card', 'cufflink', '_desk', '_twoglass'],
      effects: { insight: 1 },
      choices: [{ text: 'Go on looking.', to: 'comp7' }],
    },
    coat: {
      scene: '🧥✉️🔍',
      text: `The coat hangs on the hook inside the door. You go through the pockets with the delicacy of a pickpocket and the resolve of a magistrate.

A handkerchief. A packet of mints. A railway timetable with a pencil ring around Karst.

In the lining, sewn in with small stitches that were not made by a valet, a letter in a long cream envelope. It is dated three weeks ago. The letterhead is a hospital in Vessen.

*Dear Mr. Vane, I regret to inform you that the growth is inoperable. In my judgement, you have between four and six months. I am sorry to tell you this by letter. I would rather have told you in person.*

Underneath, in another hand, in pencil: *Tell no one. Only I.*`,
      give: ['letter_doc'],
      effects: { insight: 2 },
      choices: [{ text: 'Go on looking.', to: 'comp7' }],
    },

    venn_intro: {
      scene: '🎩🪄🧣',
      caption: 'Isadora Venn',
      text: `She receives you in her compartment, sitting very straight, in a dressing gown embroidered with dragons. A deck of cards ripples through her fingers and vanishes.

*Miss Calloway. I know your sort. You will want to ask me where I was.* She smiles. *Everyone will lie to you tonight. I shall try to be the best.*

She is sixty-three. Her eyes are very blue, and amused, and far too steady.

*Poor Silas,* she says. *I knew him forty years. He began as my assistant. I used to saw him in half. He was always better at it than he was at being whole.*`,
      effects: { time: -1 },
      give: ['_v_venn'],
      choices: [{ text: 'Ask where she was at two.', to: 'venn_menu' }],
    },
    venn_menu: {
      scene: '🎩🪄❓',
      caption: 'Isadora Venn',
      text: `She folds her hands. The rings on them are large, and flash when she gestures.

*Ask,* she says. *I am an open book. Though one of those books with a false cover.*`,
      choices: [
        { text: 'Ask where she was between one and three.', to: 'venn_alibi', if: [{ not: '_a1' }] },
        { text: 'Ask about her history with Vane.', to: 'venn_past', if: [{ not: '_a2' }] },
        { text: 'Thank her and go.', to: 'hub' },
      ],
    },
    venn_alibi: {
      scene: '🎩😴🕰️',
      text: `*Asleep,* says Isadora Venn. *From midnight. I took a powder at eleven-thirty, and I do not wake for guns. Ask the Sister, she gave me the headache powder.*

*You did not leave your compartment?*

*Not once.* She smiles at you with great warmth, and you write it down.

On her lap, the red silk of the scarf she wore at dinner has been tucked into the sleeve of the gown. There is a little spool of fine thread in the pocket of the dragon dressing gown, which she touches without noticing.`,
      give: ['_venn_claim', '_a1'],
      choices: [{ text: 'Ask another question.', to: 'venn_menu', effects: { insight: 1 } }],
    },
    venn_past: {
      scene: '🎩💔🎭',
      text: `*We were lovers, once,* she says, without a flicker. *Before the war. We were also partners. He did the patter, I did the hands. Then he discovered that people paid more for old paintings than for new tricks, and I discovered that I did not love him enough to follow.*

*Is it true he was your enemy?*

*He was my oldest friend. They are not different things.* She looks at the window. *Enemies are the ones who die in nice rooms. I wish him no ill.*

It is a beautiful performance. It is only afterward that you wonder at the tense.`,
      give: ['_a2'],
      choices: [{ text: 'Ask another question.', to: 'venn_menu' }],
    },

    odile_intro: {
      scene: '🎤🌹🧣',
      caption: 'Odile Sarrazin',
      text: `The soprano lies on a chaise in a nest of furs, a damp cloth on her brow. Her compartment is full of flowers that are slightly past their best.

*Oh,* she says. *The detective. I do hope you aren't one of those who shout.*

She is forty, and spectacularly beautiful, and fully aware that she is being looked at. When she shifts, the room shifts with her.

*Silas,* she says, and her mouth trembles. *I loved him once. Or I thought I did. He was so generous. He gave me my first necklace, and he kept the receipt.*`,
      effects: { time: -1 },
      give: ['_v_odile'],
      choices: [{ text: 'Ask her gently.', to: 'odile_menu' }],
    },
    odile_menu: {
      scene: '🎤🌹❓',
      caption: 'Odile Sarrazin',
      text: `She sits up, arranging the furs round her, and pours herself a glass of water from a silver flask.

*Ask what you like. I'm an artiste. I have told the truth only twice in my life, and both times on stage.*`,
      choices: [
        { text: 'Ask whether she visited his compartment tonight.', to: 'odile_visit', if: [{ not: '_a3' }] },
        { text: 'Ask about the bottle of drops in her bag.', to: 'odile_vial', if: [{ not: '_a4' }] },
        { text: 'Thank her and go.', to: 'hub' },
      ],
    },
    odile_visit: {
      scene: '🎤🚪🕰️',
      text: `The pause is eloquent.

*Yes,* she says. *I went. Of course I went. At twenty to two. I wanted my letters back. He kept them, you know. In a box. A woman's letters are her only ammunition.*

*What happened?*

*We quarrelled. He laughed at me.* The beautiful voice goes flat. *I threw a glass of brandy at his collar. I left. It was five to two, perhaps. He was alive, and grinning, and he bolted the door behind me. I heard it go. That bolt is the loudest noise I have ever heard.*

She puts a hand to her throat. *I swear it. I swear on my voice.*`,
      give: ['_odile_visit', '_a3'],
      effects: { insight: 1 },
      choices: [{ text: 'Ask another question.', to: 'odile_menu' }],
    },
    odile_vial: {
      scene: '🧴🎤😬',
      text: `She goes pale under the powder. Then, with a fine sense of the dramatic, she opens her reticule and produces a small brown bottle with a pipette cap.

*Laudanum,* she says. *A few drops, for my nerves. I gave Silas a bottle, once. He was sleeping badly. He said he would take some tonight. It is empty now. I do not know who emptied it.*

You turn the bottle in the light. It is indeed empty. And not a drop is in the brandy glass, you think, because the glass smelt of sugar.

*Take it,* she says bitterly. *I look guilty enough as it is.*`,
      give: ['vial', '_a4'],
      choices: [{ text: 'Ask another question.', to: 'odile_menu' }],
    },

    aske_intro: {
      scene: '🎩📈🚬',
      caption: 'Lord Peregrine Aske',
      text: `Lord Aske has not undressed. He sits stiff on his bunk in a good grey suit, a cigar unlit between his fingers.

*I am told that I am a suspect,* he says. *I confess I find it novel.*

He is fifty-five, long-faced, elegant, and a little too still. The cigar has been rolled until the leaf shreds.

*Silas and I were partners for twenty years,* he says. *Aske and Vane. One brought the name, the other the nerve. I leave it to you to decide which was which.*`,
      effects: { time: -1 },
      give: ['_v_aske'],
      choices: [{ text: 'Press him gently.', to: 'aske_menu' }],
    },
    aske_menu: {
      scene: '🎩📈❓',
      caption: 'Lord Aske',
      text: `He drops the cigar into the ashtray with a small, dry sound.

*I shall be quite candid. I find it saves time.*`,
      choices: [
        { text: 'Ask about the business.', to: 'aske_money', if: [{ not: '_a5' }] },
        { text: 'Ask about the torn cufflink.', to: 'aske_cuff', if: [{ has: 'cufflink' }, { not: '_a6' }], lockedHint: 'You have no cufflink to show.' },
        { text: 'Thank him and go.', to: 'hub' },
      ],
    },
    aske_money: {
      scene: '📓💰🎩',
      text: `*Silas has been cooking the books,* he says, with the tired disgust of a man who has known for years. *Selling copies as originals. Taking commissions on both sides. I found out in October.*

*I was going to confront him tonight. We quarrelled at ten, in the smoking room, quite loudly. I said I would go to the police in Marlenne. He told me I would be ruined. We were both right.*

He hands over a small black ledger. *This is my copy of the accounts. It is not a pretty reading. But it is why I did not kill him. A dead partner cannot be arrested.*`,
      give: ['ledger', '_a5'],
      choices: [{ text: 'Ask another question.', to: 'aske_menu', effects: { insight: 1 } }],
    },
    aske_cuff: {
      scene: '🔗🎩😳',
      text: `You lay the broken stag-crested half on his knee. He glances down. He laughs, once, hard.

*That is mine,* he says. *Torn off in the smoking room, when he took me by the cuff. I did not realise. I suppose I left it in his compartment when I looked in at one, to try once more.*

*You were there at one?*

*Five minutes. He was drunk and unrepentant, and I was a fool.* He touches his bare wrist. *He wished me goodnight. I promise you, the man was alive when I left.*`,
      give: ['_a6'],
      choices: [{ text: 'Ask another question.', to: 'aske_menu' }],
    },

    quill_intro: {
      scene: '🧑‍💼📎😰',
      caption: 'Tobias Quill',
      text: `Tobias Quill is in the corridor on a folding seat, with a blanket round his shoulders and a pencil he has chewed to splinters.

*Miss Calloway,* he says. *I found him. I am the one who found him.*

He is twenty-four, pale, and very polite. His shoes are on the wrong feet.

*Mr. Vane engaged me two years ago,* he says. *Letters, appointments, luggage. He was... not an easy employer. I will say no more about that.* He looks at his hands. *I did not like him. I did not kill him either.*`,
      effects: { time: -1 },
      give: ['_v_quill'],
      choices: [{ text: 'Be kind to him.', to: 'quill_menu', effects: { standing: 1 } }],
    },
    quill_menu: {
      scene: '🧑‍💼📎❓',
      caption: 'Tobias Quill',
      text: `He swallows, and nods several times, as though agreeing with something you haven't said.

*I will tell you whatever I can,* he says. *I have not got a very good head for lies.*`,
      choices: [
        { text: 'Ask about his duties and his keys.', to: 'quill_key', if: [{ not: '_a7' }] },
        { text: 'Ask about Vane\'s will.', to: 'quill_will', if: [{ not: '_a8' }] },
        { text: 'Let him rest.', to: 'hub' },
      ],
    },
    quill_key: {
      scene: '🗝️🧑‍💼🚂',
      text: `*I keep his keys,* says Quill. *The compartment, the dressing case. This one,* a small brass key from his waistcoat, *opens the luggage van. Mr. Vane's cases are in there, and a few of the other passengers'. We were told we might fetch things.*

*You were with him last at...*

*Half past twelve. He sent me to bed.* He is white. *I stayed in my compartment until three, and then I heard a sound like a cough in the corridor. I went out. I found the door bolted and Anton, the conductor, running.*

He puts the key into your hand, trusting as a boy.`,
      give: ['key', '_a7'],
      choices: [{ text: 'Ask another question.', to: 'quill_menu' }],
    },
    quill_will: {
      scene: '📜🧑‍💼😟',
      text: `*Oh,* says Quill. *I should not say.*

You wait. You are very good at waiting.

*He changed it, a month ago. Mr. Vane. He left almost everything to charity. He left his stake in Aske and Vane to Lord Aske, which seemed to me a curious generosity. And there was a bequest. The Cecilia, the little panel, the real one. For Miss Isadora Venn.*

*Why?*

*He said,* Quill whispers, *that she was the only person who had ever told him the truth.*`,
      give: ['_will', '_a8'],
      effects: { insight: 1 },
      choices: [{ text: 'Ask another question.', to: 'quill_menu' }],
    },

    agnes_intro: {
      scene: '🩺🙏🕯️',
      caption: 'Sister Agnes Holloway',
      text: `Sister Agnes is in the dining car, alone, with a pot of tea and the hymnal open at the same page it was open at nine.

*Sit down, my dear,* she says. *You look dreadful.*

She is perhaps fifty. Her hands, round the cup, are broad, scarred and capable. She has the unhurried manner of someone who has sat with a great many deaths.

*I looked at him before they moved him,* she says. *You will want to know. I think you already do.*`,
      effects: { time: -1 },
      give: ['_v_agnes'],
      choices: [{ text: 'Ask her.', to: 'agnes_menu' }],
    },
    agnes_menu: {
      scene: '🩺🙏❓',
      caption: 'Sister Agnes',
      text: `She pours you a cup. The tea is dark, and hot, and strong enough to stand a spoon in.

*I take a medical case everywhere,* she says. *I have done for twenty years. One does not stop being a nurse just because one is on a train.*`,
      choices: [
        { text: 'Ask about the time of death.', to: 'agnes_time', if: [{ not: '_a9' }] },
        { text: 'Ask about her medical bag.', to: 'agnes_bag', if: [{ not: '_a10' }] },
        { text: 'Thank her and go.', to: 'hub' },
      ],
    },
    agnes_time: {
      scene: '🩺🕰️💭',
      text: `*Between a quarter to two and half past,* she says. *I would stake my certificate on it. The jaw was stiff, the hands beginning. The room was warm, which delays, but not by much.*

*There was no sign of a struggle. And there was a puncture in his arm. You will have seen it. A neat one.*

She looks at you steadily. *He did not fight. I do not say he welcomed it. I say he did not fight.*

It is a careful sentence. You write it down word for word.`,
      give: ['_a9'],
      effects: { insight: 1 },
      choices: [{ text: 'Ask another question.', to: 'agnes_menu' }],
    },
    agnes_bag: {
      scene: '💼💉😟',
      text: `She opens the bag on the table. Bandages, scissors, carbolic, a tray of ampoules, each in its own little velvet slot.

*One is missing,* she says. *Morphine. A single dose, ten milligrammes, sealed. I counted before dinner and again at midnight. I did not notice until after.*

*Who could have taken it?*

*Anyone who was near the bag.* She rubs her forehead. *At dinner, Miss Venn complained of a headache, and I let her look through it for the powders. I thought no more of it. Mr. Quill borrowed a plaster. Lord Aske asked about indigestion.*

*A busy bag,* you say.

*A bag in a busy place,* says the Sister, and shuts it.`,
      give: ['_morph', '_a10'],
      choices: [{ text: 'Ask another question.', to: 'agnes_menu' }],
    },

    reiss_intro: {
      scene: '🚂🔦👨‍✈️',
      caption: 'Anton Reiss',
      text: `The conductor is at the end of the car, brushing snow from his sleeves with the same movements he has used for thirty years. His uniform is spotless. His eyes are bloodshot.

*I am responsible,* he says. *For the train, for the passengers. I will answer anything.*

He is perhaps fifty, with a long jaw and a way of standing so still that you forget him. It is a useful gift for a man in his profession, and possibly for other professions as well.

*Walk with me, if you please,* he says. *I do the rounds every hour.*`,
      effects: { time: -1 },
      give: ['_v_reiss'],
      choices: [{ text: 'Walk with him.', to: 'reiss_menu' }],
    },
    reiss_menu: {
      scene: '🚂🔦❓',
      caption: 'Anton Reiss',
      text: `The corridor is narrow and swaying and smells of snow and hot metal. He moves down it with a lantern, glancing into each shadow.

*I keep a log,* he says. *Of everything that happens on my train. It is a habit.*`,
      choices: [
        { text: 'Ask what the log says about the corridor tonight.', to: 'reiss_log', if: [{ not: '_a11' }] },
        { text: 'Ask who he saw near compartment seven after two.', to: 'reiss_venn', if: [{ not: '_a12' }, { stat: 'standing', min: 4 }], lockedHint: 'He is not inclined to be pressed by someone he does not trust.' },
        { text: 'Thank him and go.', to: 'hub' },
      ],
    },
    reiss_log: {
      scene: '📖🚂🕰️',
      text: `*Twenty to eleven, we stopped. Eleven-forty, I rounded the cars. Half past twelve, Mr. Quill retired. At twenty to two,* he reads, *Madame Sarrazin entered compartment seven. At five to two, left it. I heard the bolt.*

*You heard it?*

*I was at the end of the car, sir. Madame left in tears. Mr. Vane called after her, "Goodnight, my dear, mind the step." I thought nothing of it.* His jaw works. *At one, Lord Aske looked in. A short visit.*

He closes the book. *It is not a very exciting log.*`,
      give: ['_a11'],
      choices: [{ text: 'Ask another question.', to: 'reiss_menu' }],
    },
    reiss_venn: {
      scene: '🧣🚂🌑',
      text: `The lantern wavers.

*I should not say it,* he says. *A gentleman does not tell on a lady. But if there is a man dead...*

*Five past two. The corridor was dark. A figure in a long dressing gown, with a scarf, going from compartment seven toward the end of the car. A woman, tall and quick. She had her face turned away.*

*She was carrying something at her hip, like a handbag or a case.* He hesitates. *The dressing gown had dragons on it. I saw them in the lamp. I thought she was walking in her sleep.*

*Dragons,* you repeat.

*Miss Venn's,* he says miserably. *Yes. I am afraid so.*`,
      give: ['_saw_venn', '_a12'],
      effects: { insight: 2 },
      choices: [{ text: 'Thank him.', to: 'reiss_menu' }],
    },

    trunk: {
      scene: '🧳🗝️🚂',
      caption: 'The luggage van',
      text: `The luggage van is a long cold box of trunks and crates, lit by one swinging lamp. Snow has crept in at the seams and lies in little drifts on the lids.

Isadora Venn's trunk is easy to find. It is covered in stickers from every city in the old world, and on one side, in faded gold, is the legend: THE GREAT ISADORA.

The lock yields to Quill's small brass key, as though it had been waiting. Inside there are costumes and wigs and a bundle of red silk scarves, one of which has a ragged end, as though a length had been cut. Beneath them is a false bottom, with a spool of the finest thread, a pack of cards missing its queen of hearts, and a folded sheet of notepaper.

The notepaper is in Silas Vane's flamboyant hand.`,
      effects: { time: -1 },
      give: ['_trunk'],
      choices: [{ text: 'Read it.', to: 'trunk_pact' }],
    },
    trunk_pact: {
      scene: '📜🕯️💔',
      text: `*My dear Izzy,*

*You have asked me twice if I am sure. I am sure. The doctors will let me linger for four months and I will spend them in a bed, being fed with a spoon, and I am vain enough that I would rather not.*

*I want to leave on my feet, with a glass in my hand and the lights up. I want it to be you. You are the only person who has ever kept my secrets. On the Aurelian, at two. I will make sure of the door. You will make sure of the rest.*

*Do not be tender about it. Be a professional. Be Isadora.*

*Silas.*

*P.S. I have left you the Cecilia. It is the real one. Don't let Peregrine tell you otherwise.*`,
      give: ['pact'],
      effects: { insight: 2 },
      choices: [{ text: 'Fold it carefully and return to the sleeping car.', to: 'hub' }],
    },

    accuse: {
      scene: '⚖️🚂🕯️',
      caption: 'The dining car, near dawn',
      text: `You gather them under the lamps, in the cold first light. The snow has stopped. Far off, down the line, comes the deep unearthly note of a plough's whistle.

Six passengers: Isadora Venn, composed. Odile Sarrazin, shivering in sables. Lord Aske, pale as paper. Tobias Quill, wide-eyed. Sister Agnes, praying. Anton Reiss, standing, as always, a little apart.

*Miss Calloway,* says Lord Aske. *It is, I think, your moment.*

The notebook is open in your hand. You have what you have. You will have to prove the rest with your voice.`,
      choices: [
        { text: 'Accuse Isadora Venn.', to: 'acc_venn' },
        { text: 'Accuse Odile Sarrazin.', to: 'acc_odile' },
        { text: 'Accuse Lord Aske.', to: 'acc_aske' },
        { text: 'Accuse Tobias Quill.', to: 'acc_quill' },
        { text: 'Accuse Sister Agnes.', to: 'acc_agnes' },
        { text: 'Accuse Anton Reiss.', to: 'acc_reiss' },
      ],
    },
    acc_venn: {
      scene: '🎩⚖️🧵',
      text: `*Miss Venn,* you say.

She inclines her head, like a performer receiving the first applause. There is no fear in her face. If anything there is a kind of relief.

*You will have to be very clever,* she says gently. *I have had forty years of being looked at. Show me what you have.*

The room waits. What do you lay on the table?`,
      choices: [
        {
          text: 'The thread, the bent card, and the conductor\'s sighting: how the door was bolted, and who was in the corridor.',
          to: 'end_justice',
          if: [{ has: 'thread' }, { has: 'card' }, { has: '_saw_venn' }],
          lockedHint: 'You need the thread, the card and a witness who saw her in the corridor.',
        },
        {
          text: 'The doctor\'s letter and Vane\'s own note: why he wanted it, and what she agreed to.',
          to: 'end_mercy',
          if: [{ has: 'letter_doc' }, { has: 'pact' }],
          lockedHint: 'You do not know yet what he asked of her.',
        },
        { text: 'Accuse her on a hunch and a bad feeling.', to: 'end_notenough' },
      ],
    },
    acc_odile: {
      scene: '🎤⚖️🧴',
      text: `*Madame Sarrazin,* you say.

She stands, a column of sable. *At last,* she says. *Someone is brave enough to say it. Say it again.*

You say it again. You describe the quarrel, the lipstick on the glass, the empty bottle of drops. She listens, and her face does something complicated.

*It is quite true that I hated him,* she says. *I did not kill him.*

Isadora Venn is looking at the table. The Sister is looking at you, with an expression you cannot read.`,
      choices: [{ text: 'Press the accusation.', to: 'end_wrong' }],
    },
    acc_aske: {
      scene: '🎩⚖️🔗',
      text: `*Lord Aske,* you say. *You have the motive. You have the cufflink. You have the ledger that proves the fraud.*

He draws himself up. *I had all three,* he says, *on the day I decided to bring a lawsuit instead.*

His voice is cold and carries across the car. *Madam. If you accuse me on this, I shall have your licence by Christmas.*

Nobody is looking at him. Nobody is looking at you. There is a long silence, in which a clock somewhere ticks off the last of the night.`,
      choices: [{ text: 'Press the accusation.', to: 'end_wrong' }],
    },
    acc_quill: {
      scene: '🧑‍💼⚖️🗝️',
      text: `*Mr. Quill,* you say. *You had the keys. You found the body. You gained nothing, but you were the only one who could have made certain.*

He stares. His mouth opens, and closes.

*I,* he says. *I. Oh, please.* Tears run down his face and drip from his jaw. *He was horrid to me. I never. I never.*

Reiss moves a step toward him, and stops. You have said it now. You cannot unsay it.`,
      choices: [{ text: 'Press the accusation.', to: 'end_wrong' }],
    },
    acc_agnes: {
      scene: '🩺⚖️💉',
      text: `*Sister Holloway,* you say. *The needle. The morphine from your bag. Your calm.*

She puts down her hymnal. She does not seem surprised. She seems very, very tired.

*I have sat beside four hundred dying people,* she says. *I have never once taken a life. But I understand why you thought it. It is a very good guess.*

*It is a guess,* says Lord Aske, for the first time sounding human.

You hear the plough's whistle again, closer.`,
      choices: [{ text: 'Press the accusation.', to: 'end_wrong' }],
    },
    acc_reiss: {
      scene: '🚂⚖️🔦',
      text: `*Mr. Reiss,* you say. *You were there. You heard the bolt. You had the master key. You alone could pass anywhere without notice.*

The conductor takes off his cap and holds it before him.

*I have served the Aurelian for twenty-six years,* he says. *I have never lost a passenger. I am sorry to have lost this one. If you wish to arrest me, madam, I will come without a fuss.*

It is an extremely dignified speech. It is also, you slowly realise, not a denial.`,
      choices: [{ text: 'Press the accusation.', to: 'end_wrong' }],
    },

    end_justice: {
      scene: '🎩⚖️🚂',
      text: `You lay it out as a magician lays out a trick, backwards, so the audience sees how every piece fits.

The thread beneath the door. The bolt driven from the corridor side. The bent queen, slid through the gap to hold the loop in place. The red silk. The conductor's sighting of a dragon dressing gown, walking at five past two.

Isadora Venn listens to all of it without moving. When you reach the card, her mouth twitches. *Well,* she says. *That was sloppy. I have been out of the business too long.*

She does not deny it. She rises, bows to the table, and holds out her wrists.

*An old woman's work,* she says. *But a clean one.*

The plough arrives at eight. The snow falls away. You watch her go with the constables down the white embankment, the red scarf trailing, and you cannot tell whether what you feel is triumph.`,
      ending: { title: 'The Magician\'s Last Trick', kind: 'good', score: 100 },
    },
    end_mercy: {
      scene: '📜🕯️🎩',
      text: `You do not mention the thread. You put down the letter from the hospital and the note in Vane's flourishing hand, and you read them aloud. All of it. Even the postscript.

When you reach *be a professional*, Isadora Venn closes her eyes. Odile gasps. Lord Aske looks away. Sister Agnes crosses herself and says, softly, *God forgive us all.*

*He asked me,* says Isadora. *Twice. I refused twice. The third time he was crying.*

Nobody speaks for a long time. At last it is the Sister who stands. *I will sign what I am asked to sign,* she says. *Respiratory failure. A natural end, in his sleep. I will swear to it.*

*And I,* says Reiss. *And I,* says Quill, and Lord Aske, and one by one the others. Last of all you.

The plough arrives at eight. You step down onto the platform at Marlenne in the pale sun with a notebook full of blank pages, having solved the case. You do not, ever, write down the answer.`,
      ending: { title: 'The Last Act', kind: 'secret', score: 130 },
    },
    end_notenough: {
      scene: '⚖️🚉😶',
      text: `Isadora Venn is magnificent. She dissects your accusation as a cook takes a fish apart, bone by bone. You have a hunch and nothing to hang it on.

*Dear child,* she says, not unkindly. *You are quite right to be suspicious. But you must be able to show it.*

The plough arrives. The train moves. At Marlenne station, the constables take statements, and by midday all six of the passengers have gone their separate ways.

A week later you receive a postcard, with a picture of a lighthouse. On the back, in a flowing hand: *Better luck next time, my dear. The trick is in the patience.*

It is unsigned. You keep it in the notebook.`,
      ending: { title: 'Not Enough', kind: 'neutral', score: 45 },
    },
    end_wrong: {
      scene: '⚖️🚉💔',
      text: `Your accusation is neat, confident and wrong.

You see it in the way the others look at the floor. You see it in the way the accused does not fight, as the innocent never do, only stands there, gently, while the constables put on the handcuffs.

The plough arrives at eight. The station at Marlenne is full of grey faces and steam. The real killer shakes your hand at the platform, and says, with perfect politeness, *Thank you, Miss Calloway. A most remarkable night.*

You will remember it for years, that handshake. It was warm and dry and unshaking.

Months later, at the trial, a blue-eyed old lady in the gallery will watch the verdict with an expression of mild distress, and leave before the sentence is read.`,
      ending: { title: 'The Wrong Name', kind: 'bad', score: 15 },
    },
    end_thaw: {
      scene: '🌅🚂🌫️',
      text: `The plough arrives at eight. You are still in the corridor with a notebook full of crossings-out.

The sun comes out on a fairy-tale landscape, the snow glittering, the engine hissing, a hundred thin silver icicles dripping from the carriage roofs. Reiss has the door open. The passengers file out one by one, nodding to you as they go, like people leaving a mediocre concert.

By noon there are constables and reporters and a medical examiner who calls it misadventure. By evening Silas Vane is a paragraph on page six.

You put your notebook in your bag. Somewhere on the platform at Marlenne, a woman in a red scarf is laughing. You never find out why.`,
      ending: { title: 'The Plough Arrives', kind: 'bad', score: 20 },
    },
    end_mutiny: {
      scene: '😠🚪🚂',
      text: `The mood in the dining car has turned. It happens quietly, the way ice forms: a look, a muttered word, a chair scraped back.

*She has no authority,* says Lord Aske. *She is an insurance clerk.*

*She has been through my luggage,* says Odile.

*She frightened the boy,* says the Sister, in a voice like a closing door.

By four in the morning they have locked you in the luggage van with the trunks and a blanket, for your own protection. They are very polite about it. When the plough comes at eight, a stranger lets you out and asks what you are doing in a trunk.

The murder is never solved. You are not asked to sit on any more trains.`,
      ending: { title: 'Thrown Off the Train', kind: 'bad', score: 10 },
    },
  },
}

export default story
