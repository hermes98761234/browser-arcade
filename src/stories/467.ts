import type { Story } from './types'

const story: Story = {
  id: 467,
  title: 'Ghost Detective',
  blurb:
    'Sir Ambrose Hale was poisoned at his own birthday dinner, and the inspector is stuck behind a flooded road until dawn. You are Odalys Finch, medium, hired to ask the dead who did it. The house is full of them, and none of them are quite honest.',
  items: {
    vial: '🧪 Empty blue vial',
    ledger: '📒 Doctored ledger',
    tonic: '🍾 Sweet tonic bottle',
    will: '📜 Scorched will fragment',
    key: '🗝️ Dorothea\'s room key',
    letter: '✉️ Philippa\'s unopened letter',
    _code: 'safe code',
    _vialhint: 'vial hint',
    _maud: 'Maud saw the doctor',
    _brigid: 'Brigid on the tonic',
    _stair: 'Rennick on the stair',
    _peace: 'Ambrose at peace',
    _v_amb: 'seen Ambrose',
    _v_brig: 'seen Brigid',
    _v_maud: 'seen Maud',
    _v_ren: 'seen Rennick',
    _v_crane: 'seen Crane',
    _v_dor: 'seen Dorothea',
    _v_pom: 'seen Pommeroy',
    _v_jul: 'seen Julian',
    _v_phil: 'seen Philippa',
    _grate: 'searched grate',
    _safe: 'searched safe',
    _phil: 'Philippa told of letters',
    _desk: 'searched desk',
    _portraits: 'viewed portraits',
  },
  stats: {
    focus: { label: 'Focus', emoji: '🕯️', start: 7, min: 0, max: 10, onMin: 'end_possessed' },
    night: { label: 'Hours to dawn', emoji: '⏳', start: 9, min: 0, max: 9, onMin: 'end_dawn' },
    nerve: { label: 'Rapport', emoji: '💠', start: 3, min: 0, max: 10 },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🏚️🌧️🕯️',
      caption: 'Thornwick House, 11 p.m.',
      text: `The rain has been falling since Tuesday. By the time the cab leaves you at the gate it has stopped being weather and become an opinion.

Thornwick House stands at the top of its drive like a man who has heard bad news and is determined to bear it. Every window is lit. In the third from the left, a curtain moves, though nobody is holding it.

*Odalys Finch,* you say to the dark, because manners matter with the dead. *I am a guest, and I mean no harm.*

From somewhere inside, not quite a voice, comes a long sigh, as of a house exhaling.`,
      choices: [{ text: 'Knock.', to: 'inspector' }],
    },
    inspector: {
      scene: '👮🏚️☔',
      caption: 'Inspector Marsh',
      text: `Inspector Marsh meets you in the hall. He is a large, damp, unhappy man with the manner of someone who dislikes being proved wrong by his own sister.

*Sir Ambrose Hale,* he says. *Seventy tonight. He raised a glass of port at the end of dinner, drank, and was dead before the cheese. Poison, the police surgeon thinks, though the police surgeon is also a guest and was drinking.*

*The road to town is under four feet of river. The constables arrive at dawn, not before. Whoever did this is in the house.*

He lowers his voice. *The widow believes in your sort. I do not. But she is paying, and I find, God help me, I am out of ideas.*`,
      choices: [
        { text: 'Say you will need the house to yourself.', to: 'seance' },
        { text: 'Say you will need the suspects, one by one.', to: 'seance', effects: { nerve: 1 } },
      ],
    },
    seance: {
      scene: '🕯️👻🚪',
      caption: 'The great hall',
      text: `You do not use a table, a trumpet or a bell. You take off your gloves, light one candle, and sit on the bottom stair with your hands open on your knees.

*I am listening,* you say.

The flame leans. The temperature drops by the width of a hand. And then they come: not appearing, exactly, but arriving, as one notices a person has been in the room for some time.

An old man at the study door, in evening dress, bewildered. A stout old woman in a nurse's apron on the landing, arms folded. A girl in a scorched maid's cap, peering from the kitchen passage. A tall man in a powdered wig, on the stairs, with a hand on his sword.

*Well,* says the man in the wig. *At last, a person who can hear.*`,
      choices: [{ text: 'Begin.', to: 'hub' }],
    },
    hub: {
      scene: '🏚️🕯️🔍',
      caption: 'Thornwick House',
      text: `It is a quarter past eleven. The candle burns steady. You have a little less than nine hours, and a house full of people who each saw a different part of the evening.

You can speak with the dead, who see more and cannot lie well. You can speak with the living, who can lie very well indeed. You can search the rooms. And at some point you must decide whom to name.

Every conversation costs a little of the night. Every ghost costs a little of you.`,
      choices: [
        { text: 'Speak to Sir Ambrose, newly dead.', to: 'amb_intro', if: [{ not: '_v_amb' }] },
        { text: 'Speak to the nurse on the landing.', to: 'brig_intro', if: [{ not: '_v_brig' }] },
        { text: 'Speak to the maid in the kitchen passage.', to: 'maud_intro', if: [{ not: '_v_maud' }] },
        { text: 'Speak to the gentleman on the stairs.', to: 'ren_intro', if: [{ not: '_v_ren' }] },
        { text: 'Question Dr. Elias Crane, the family physician.', to: 'crane_intro', if: [{ not: '_v_crane' }] },
        { text: 'Question Dorothea Hale, the widow.', to: 'dor_intro', if: [{ not: '_v_dor' }] },
        { text: 'Question Pommeroy, the butler.', to: 'pom_intro', if: [{ not: '_v_pom' }] },
        { text: 'Question Julian Hale, the nephew.', to: 'jul_intro', if: [{ not: '_v_jul' }] },
        { text: 'Answer the knock at the front door.', to: 'phil_intro', if: [{ not: '_v_phil' }] },
        { text: 'Walk the portrait gallery while the candle steadies.', to: 'portraits', if: [{ not: '_portraits' }] },
        { text: 'Go to the study.', to: 'study' },
        { text: 'Go to the conservatory.', to: 'conservatory' },
        { text: 'Go up to Dorothea\'s room.', to: 'bedroom' },
        { text: 'Return to Sir Ambrose with the letter.', to: 'amb_letter', if: [{ has: 'letter' }, { not: '_peace' }] },
        { text: 'Make your accusation.', to: 'accuse' },
      ],
    },

    amb_intro: {
      scene: '👴🍷😶',
      caption: 'Sir Ambrose Hale',
      text: `He is standing at the study door, with a napkin still tucked into his collar. He looks about as dead as a man can who has not been told.

*I say,* he says. *Is the dinner over? I seem to have lost the thread.*

When you gently tell him, his face does an odd thing. It goes flat, like a pond when the wind drops. Then a great anger fills it.

*Murdered,* he says. *In my own house. On my seventieth birthday. Well, madam. What do you require of me?*`,
      effects: { night: -1, focus: -1 },
      give: ['_v_amb'],
      choices: [{ text: 'Ask what he remembers.', to: 'amb_menu' }],
    },
    amb_menu: {
      scene: '👴🕯️💭',
      caption: 'Sir Ambrose Hale',
      text: `The ghost of Sir Ambrose drifts back and forth, fraying a little at the edges when he is upset. His memory comes and goes, like a radio between stations.

*Ask me something particular, madam,* he says. *I am much better at particulars.*`,
      choices: [
        { text: 'Ask about the last moments at the table.', to: 'amb_last', if: [{ not: '_vialhint' }] },
        { text: 'Ask who might wish him harm.', to: 'amb_enemies' },
        { text: 'Ask if there is anything in the house he was hiding.', to: 'amb_safe', if: [{ not: '_code' }] },
        { text: 'Leave him for now.', to: 'hub', effects: { nerve: 0 } },
      ],
    },
    amb_last: {
      scene: '🍷💀🕯️',
      text: `*The port,* he says slowly. *Tawny. Pommeroy brought it in on the tray. I raised my glass to the room. There was a taste on the second sip, bitter, with something like pepper. My tongue went numb. And I remember...*

He puts his hand to his chest.

*The doctor was at my elbow, and he said, "Steady, Ambrose." He sounded so very calm. He was looking not at me but at the clock.*

His voice dips. *Earlier. Before dinner. Someone had been among the ferns. There was a smell in the conservatory like a chemist's shop. I thought nothing of it.*`,
      give: ['_vialhint'],
      effects: { nerve: 1 },
      choices: [{ text: 'Ask another question.', to: 'amb_menu' }],
    },
    amb_enemies: {
      scene: '👴😠🏚️',
      text: `*Enemies?* Sir Ambrose barks a laugh that echoes oddly. *I am seventy years old. I have outlived my enemies, and quarrelled with their widows.*

He counts on his fingers, like a schoolboy.

*My nephew Julian owes everyone in three counties. My wife, Dorothea, spends more than the house earns and does not like to be told. My daughter Philippa has not spoken to me since 1931, and I do not blame her. Pommeroy has served me forty years and I suspect despises me. And Elias Crane has been my doctor for fifteen years and I have lately had... questions.*

*Questions?* you say.

*Of an arithmetical nature,* he says, and will not say more.`,
      effects: { nerve: 1 },
      choices: [{ text: 'Ask another question.', to: 'amb_menu' }],
    },
    amb_safe: {
      scene: '🔐👴💭',
      text: `*My safe,* he says, with a flicker of cunning. *Yes. I put something in it, three weeks ago. A little book. I meant to take it to my solicitor on Monday.*

*The combination?*

*Ah. I have never been able to remember it, you know. I set it to a year. A year I could not forget, since the man himself would remind me every day.* He chuckles weakly. *Ask Captain Rennick. He will be delighted.*

His outline wavers, and he sinks into a chair that is not there. *I am tired, madam. May I rest?*`,
      effects: { focus: -1 },
      choices: [{ text: 'Let him rest.', to: 'amb_menu' }],
    },
    amb_letter: {
      scene: '✉️👴🕯️',
      caption: 'Sir Ambrose Hale',
      text: `You find him in the study, sitting very upright in a chair that is no longer there.

*I have something for you,* you say, and hold out the envelope. Philippa's handwriting, on the front: *Father.* The seal unbroken.

He does not take it. He cannot. But he leans close. His eyes go over the envelope again and again, as a man reads a letter by the sheer force of reading.

*She wrote,* he says. *She wrote to me. I never opened... Oh, I never opened it. I thought it would be reproach.*

You break the seal for him, and read it aloud. It is eleven lines long. It begins: *Dear Father, I am not angry any more.*

When you finish, Sir Ambrose is weeping, silently, and the room is warm.`,
      effects: { night: -1, focus: -1, nerve: 3 },
      give: ['_peace'],
      take: ['letter'],
      choices: [{ text: 'Sit with him a while, then return to the hall.', to: 'hub' }],
    },

    brig_intro: {
      scene: '👵🕯️🧶',
      caption: 'Nanny Brigid',
      text: `The old woman on the landing has a face like a walnut and a gaze that has seen off three generations of Hale children.

*Brigid,* she says. *I was nurse to the first Sir Ambrose's grandchildren. I've been dead since the old Queen was on the throne, and I've watched every meal in this house since. Sit up straight, girl.*

You sit up straight.

*I'll answer you,* she says, *if you answer me. I won't have my time wasted by people who can't see what's in front of them.*`,
      effects: { night: -1, focus: -1 },
      give: ['_v_brig'],
      choices: [{ text: 'Agree to her terms.', to: 'brig_riddle' }],
    },
    brig_riddle: {
      scene: '👵🧩💭',
      caption: 'Nanny Brigid',
      text: `*Here is mine,* she says. *Everyone in this house is sweet to the master. Who is sweetest?*

*One who is kind?* you offer.

*One who is sweet,* she repeats, as to a child, *in the cup.*

Her eyes are flint. *A sweet thing is always the best place to hide a bitter one. Think of that, girl. And think of who tends the sugar.*`,
      choices: [
        { text: 'Answer: the cook.', to: 'brig_wrong' },
        { text: 'Answer: the one who gives him his tonic.', to: 'brig_right' },
        { text: 'Answer: the one who was at his elbow when he fell.', to: 'brig_wrong2' },
      ],
    },
    brig_wrong: {
      scene: '👵😒🕯️',
      text: `*Cook has not stirred a sauce wrong since the Boer War,* Brigid snaps. *Think again. I haven't the patience of a saint, and I've been dead long enough to lose the rest.*

She turns half away.`,
      effects: { nerve: -1 },
      choices: [{ text: 'Try again.', to: 'brig_riddle' }, { text: 'Leave her.', to: 'hub' }],
    },
    brig_wrong2: {
      scene: '👵🤔🕯️',
      text: `*The doctor? A fine bedside manner. Wrong, though,* Brigid says, *or at least, not the whole of it. He was at the elbow because someone had made the elbow need him.*

She taps her temple. *Try again. Think of who gives the master his sweet medicine, every night.*`,
      choices: [{ text: 'Try again.', to: 'brig_riddle' }],
    },
    brig_right: {
      scene: '👵🍵👀',
      text: `Her face breaks into an old, fierce smile.

*There. A brain.* She leans so close you can smell lavender and carbolic soap. *Every night for four months, Mrs. Hale has taken the master his tonic on a little tray. A sweet, thick, brown one. She stirs it herself, and does not let Pommeroy touch it. She keeps the bottle in her room, behind the hat boxes. And he has grown weaker, and thinner, and she has grown kinder.*

*I have seen poisoners before, girl,* says Brigid. *They are always kinder at the end.*`,
      give: ['_brigid'],
      effects: { nerve: 2 },
      choices: [{ text: 'Thank her.', to: 'hub' }],
    },

    maud_intro: {
      scene: '👧🍳🔥',
      caption: 'Maud',
      text: `She is perhaps nineteen, and wrong in the way of the recent dead: her cap is singed, her sleeves are black, and she smells of burnt sugar.

*Didn't mean to listen,* she says in a rush. *Only I always hang about the kitchen on grand nights. It's where I was when it went up. 1926. A chip pan. I never did get my wages.*

She wrings her apron, which crackles faintly.

*I saw the tray,* she says. *I saw everything. Only I'm frightened what'll happen if I say.*`,
      effects: { night: -1, focus: -1 },
      give: ['_v_maud'],
      choices: [
        { text: 'Reassure her. Nothing can hurt her now.', to: 'maud_saw', effects: { nerve: 1 } },
        { text: 'Pour her a cup of tea first (she cannot drink it, but she likes the smell).', to: 'maud_tea' },
      ],
    },
    maud_tea: {
      scene: '☕👧💛',
      text: `You fill two cups at the range and set one on the table where she can lean over it. She breathes the steam like a woman at the sea.

*Haven't smelt that in years,* she says. Her outline firms, thickens, grows less transparent.

You drink yours slowly, and your own hands steady. There is a strength in warmth that has nothing to do with the dead.

*Right,* says Maud. *Right, then. I'll tell you.*`,
      effects: { focus: 2, nerve: 1 },
      choices: [{ text: 'Listen.', to: 'maud_saw' }],
    },
    maud_saw: {
      scene: '👧🍷🥼',
      text: `*Mr. Pommeroy decanted the port at half past six, as he does. Put the stopper in. Set the tray on the sideboard in the dining room with the glasses, and went off to dress the table.*

*And then, ten minutes after, in comes the doctor. In his gloves, because he has that skin complaint. He goes to the sideboard. He's got his back to the door. He takes the stopper out, and holds something over the decanter, a little blue bottle, and tips it. He is ever so careful.*

She swallows. *He puts the stopper back, and the bottle in his pocket, and goes out by the conservatory door, whistling.*

*I tried to shout,* she whispers. *Nobody can hear me.*`,
      give: ['_maud'],
      effects: { nerve: 2 },
      choices: [{ text: 'Thank her, and promise to speak for her.', to: 'hub' }],
    },

    ren_intro: {
      scene: '🤺🪜🕯️',
      caption: 'Captain Rennick',
      text: `*Captain Lucius Rennick,* announces the man in the wig, bowing so low his sword clicks on the banister. *Late of His Majesty's Dragoons, late of this life, killed in a most unjust duel on this very staircase in the year seventeen hundred and ninety-four.*

*Which I should have won,* he adds. *The man cheated.*

He has a long nose and a magnificent, unreasonable moustache. His boots are mud-splashed to the knee.

*I have kept watch here for a hundred and fifty years, madam. I see everything that goes up and down. It is my one remaining joy.*`,
      effects: { night: -1, focus: -1 },
      give: ['_v_ren'],
      choices: [
        { text: 'Flatter his swordsmanship.', to: 'ren_flatter', effects: { nerve: 1 } },
        { text: 'Ask directly what he saw.', to: 'ren_stair' },
      ],
    },
    ren_flatter: {
      scene: '🤺✨😄',
      text: `*Madam, you have a discerning eye!* He draws the sword and gives a flourish that nearly takes the head off a bust of Pitt. *Seven duels, and I lost but one. And that, by treachery.*

He sheathes it, glowing.

*I owe you a service for that. Ask.*

*You could tell me,* you say, *whatever you noticed on the stair this evening.*`,
      choices: [{ text: 'Listen.', to: 'ren_stair' }],
    },
    ren_stair: {
      scene: '🪜👤🌙',
      text: `*Twenty to ten,* says the Captain, promptly. *Mr. Julian creeping down in his stockings, with his shoes in his hand like a footpad. He went into the study, and was inside a quarter hour. He came out looking pleased.*

*A quarter to ten: the doctor, in a great hurry, going toward the conservatory. Ten minutes later, coming back. He had a smudge of earth on his glove, and his face wore an expression of satisfaction.*

*As for the combination of the safe,* adds the Captain, lowering his voice, *the old rogue set it to the year of my death. Impudent. Seventeen ninety-four. He thought it a great joke.*`,
      give: ['_stair', '_code', '_vialhint'],
      effects: { nerve: 1 },
      choices: [{ text: 'Thank him.', to: 'hub' }],
    },

    crane_intro: {
      scene: '🩺🥃🛋️',
      caption: 'Dr. Elias Crane',
      text: `The doctor is in the drawing room, pouring himself a brandy with a steady hand. He is fifty or so, pink and silver, with the soft authority of a man whose voice has soothed a thousand bedsides.

*Miss Finch,* he says. *Elias Crane. I confess I find this entire business distasteful. But one must humour the grieving.*

He wears grey kid gloves, though the room is warm.

*Poor Ambrose. His heart had been failing a long while. I warned them all. I expect the police surgeon will find it was misadventure, brought on by too much claret.*`,
      effects: { night: -1 },
      give: ['_v_crane'],
      choices: [
        { text: 'Ask why he wears gloves indoors.', to: 'crane_gloves' },
        { text: 'Ask where he was before dinner.', to: 'crane_where' },
        { text: 'Let him be, for now.', to: 'hub' },
      ],
    },
    crane_gloves: {
      scene: '🧤🩺😐',
      text: `*Eczema,* he says easily. *A hereditary affliction. My hands, I fear, are not fit to be seen.*

*Of course.*

His eyes remain pleasant, but you notice they have stopped moving. It is the stillness of a man who has stopped himself from reaching for a pocket.

*Is there anything else?*`,
      effects: { nerve: 1 },
      choices: [{ text: 'Ask where he was before dinner.', to: 'crane_where' }, { text: 'Leave.', to: 'hub' }],
    },
    crane_where: {
      scene: '🩺⏳💭',
      text: `*Before dinner? Dressing. Then a turn in the garden for a cigar, till the rain drove me in.*

*Not the conservatory?*

*Good heavens, no,* he says, a little too quickly. *Why, the damp does my chest no good.*

He sips. You do not need to be a medium to know that he is lying. But you are, and the room has gone slightly colder, as if somebody in the corner were nodding.`,
      choices: [{ text: 'Thank him and withdraw.', to: 'hub' }],
    },

    dor_intro: {
      scene: '👩‍🦰🖤🕰️',
      caption: 'Dorothea Hale',
      text: `The widow receives you in the morning room, perfectly composed in black crêpe, with a pearl choker and an expression of exquisitely managed grief.

*Miss Finch.* Her voice is low and sweet. *Thank you for coming. I understand it is a lot to ask. I only want to know that he did not suffer.*

She is perhaps forty-five, a good deal younger than her husband, and handsome in the way of a well-tended sword. When she dabs her eye it is the left one, and her handkerchief is dry.

*Ask me anything,* she says. *I have nothing to hide.*`,
      effects: { night: -1 },
      give: ['_v_dor'],
      choices: [
        { text: 'Ask about the tonic she gave him each night.', to: 'dor_tonic' },
        { text: 'Ask about the will.', to: 'dor_will' },
        { text: 'Offer condolences and withdraw.', to: 'hub' },
      ],
    },
    dor_tonic: {
      scene: '🍾👩‍🦰😟',
      text: `The pause is perhaps a quarter second.

*Dr. Crane prescribed it,* she says smoothly. *A little iron and malt. Ambrose liked it. I merely carried it up.*

*I should like to see the bottle.*

*I'm afraid I threw it out.* A small smile. *I can't think why you want it.*

The candle at your elbow gutters. Somewhere above, a floorboard creaks, as if an old woman had shifted her weight and folded her arms.`,
      effects: { nerve: 1 },
      choices: [{ text: 'Ask about the will.', to: 'dor_will' }, { text: 'Withdraw.', to: 'hub' }],
    },
    dor_will: {
      scene: '📜👩‍🦰🔥',
      text: `*His will?* She lifts one beautifully pencilled brow. *Why, it leaves everything as it should be: the house to Julian, a settlement to me. I believe there was talk of change. Ambrose liked to talk.*

*Talk of what change?*

*Oh,* she says airily, *he was in a sentimental humour. He wanted to be reconciled with Philippa. One doesn't take these things seriously.*

You note that her hands, in her lap, are gripping each other very tightly, and that there is a faint smell in the room of burnt paper.`,
      choices: [{ text: 'Withdraw.', to: 'hub' }],
    },

    pom_intro: {
      scene: '🎩🍷🕯️',
      caption: 'Pommeroy',
      text: `The butler waits in the pantry, standing, because he has not sat down in front of anyone in forty years. He is as thin and grey as a candle, and his white gloves are spotless.

*Miss Finch.* Even grief, in him, is formal. *I understand you have a gift. I make no comment. I will say only that Sir Ambrose was not always an easy master, and that he was a just one.*

*Pommeroy,* you say. *You served the port.*

A flicker. *I did. I decanted it myself at half past six, from the bin, and set it in the dining room. I touched no other thing. I would like that understood. I would like it written down.*`,
      effects: { night: -1 },
      give: ['_v_pom'],
      choices: [
        { text: 'Ask about Mrs. Hale\'s room.', to: 'pom_room' },
        { text: 'Ask whether anyone entered the dining room afterward.', to: 'pom_dining' },
        { text: 'Reassure him and withdraw.', to: 'hub', effects: { nerve: 1 } },
      ],
    },
    pom_room: {
      scene: '🎩🗝️😬',
      text: `He hesitates for a long time.

*Mrs. Hale locks her room, madam,* he says at last. *Since October. I am not permitted to clean it. I am not, as a rule, one to carry tales.*

He takes a small key from his waistcoat and sets it on the table between you. *But Sir Ambrose is dead, and I find I cannot go on being neutral.*

*It is the duplicate,* he adds. *I was given it by the master himself. In case.*`,
      give: ['key'],
      effects: { nerve: 1 },
      choices: [{ text: 'Thank him.', to: 'hub' }],
    },
    pom_dining: {
      scene: '🎩🍽️🌫️',
      text: `*Mr. Julian looked in,* says Pommeroy stiffly, *at ten to seven, to be sure of the seating. And Dr. Crane passed through to speak to me about the evening's medicines. He did not remain.*

*Passed through,* you echo.

*I assumed, madam, that a gentleman in the family's confidence might pass where he pleased.* The thin face shows a crack of misery. *Did I assume wrongly?*

*I do not know yet,* you say honestly.`,
      choices: [{ text: 'Thank him.', to: 'hub' }],
    },

    jul_intro: {
      scene: '🧑‍🦱🥃🃏',
      caption: 'Julian Hale',
      text: `Julian lounges in the billiard room, a cue in one hand, a cigarette in the other, with the glassy ease of a man who has not yet understood he is cornered.

*Another inquisition,* he says. *Well. I did it, naturally. Everyone suspects me. Put me in irons.*

He is young, and handsome, and very drunk. Under it, he is frightened.

*I was in the study at ten to ten,* he admits, before you ask. *I was looking for the will. Uncle was altering it. I'd heard. I wanted to know what I was losing. But he didn't die at ten to ten. He died at nine, at dinner, like a fool, with a glass in his hand.*`,
      effects: { night: -1 },
      give: ['_v_jul'],
      choices: [
        { text: 'Ask what he found in the study.', to: 'jul_study' },
        { text: 'Ask why he did not help the dying man.', to: 'jul_help' },
      ],
    },
    jul_study: {
      scene: '🧑‍🦱📜🔥',
      text: `*Nothing. The safe was shut. The grate was warm, though. Someone had burned something, and not long before.*

He grins crookedly. *I'd have burned it myself, if I'd found it first.*

He's lying about something, but not this.`,
      effects: { nerve: 1 },
      choices: [{ text: 'Withdraw.', to: 'hub' }],
    },
    jul_help: {
      scene: '🧑‍🦱😰🕯️',
      text: `The grin slides off his face.

*I was frozen,* he says. *Isn't that pathetic? Doctor Crane was on his knees at once, and Aunt Dorothea screamed, and I just stood there with my napkin. I've always been rather useless in a crisis.*

He ashes the cigarette on the carpet. *I'm no murderer, Miss Finch. I haven't the nerve for it.*

You believe him. It is not a compliment.`,
      choices: [{ text: 'Withdraw.', to: 'hub' }],
    },

    phil_intro: {
      scene: '🚪🌧️👩',
      caption: 'Philippa Hale',
      text: `The knock is soft, and has been going on for some time.

On the step stands a woman of about thirty-five, in a mackintosh black with rain, her hat dripping, her shoes ruined. She has waded the lane. She carries a small valise and the look of a person who has practised a speech for eleven hundred miles and forgotten it at the door.

*I'm Philippa,* she says. *His daughter. I had a telegram. They said I was too late.*

Her chin shakes once. Then it does not.

*I'd like to see him,* she says. *Whatever is left.*

Behind her, in the study doorway, you see the shape of an old man turn his head.`,
      effects: { night: -1 },
      give: ['_v_phil'],
      choices: [
        { text: 'Take her into the kitchen and give her tea.', to: 'phil_talk', effects: { focus: 1 } },
        { text: 'Tell her gently what you can see.', to: 'phil_talk', effects: { nerve: 1 } },
      ],
    },
    phil_talk: {
      scene: '☕👩🕯️',
      text: `She sits at the scrubbed deal table with both hands around the cup, shivering inside her wet coat.

*We quarrelled about my mother,* she says. *Fifteen years ago. He married Dorothea within the year, and I could not forgive it. I said things. He said worse. I thought: let him come to me.*

*He never did.* A shaky smile. *Neither did I. We were so alike.*

*I wrote to him, last month. Twice. He never replied.* She looks up. *I thought: he is still angry.*

*I wonder,* you say slowly, *whether he ever read them.*`,
      choices: [
        { text: 'Ask whether she knows where the letters would have gone.', to: 'phil_letter' },
      ],
    },
    phil_letter: {
      scene: '✉️🕯️💭',
      text: `*To the hall tray, I suppose,* says Philippa. *Pommeroy always sorted the post. Then it would go up to the study.*

She wipes her eyes. *If I know my father, he kept anything he could not answer, shut in the left-hand drawer of his desk. He kept all my school reports there. And a clipping about my wedding that I never knew he had.*

*May I look?* you ask.

*Please,* she says. *I would so much like someone to.*`,
      give: ['_phil'],
      choices: [{ text: 'Return to the hall.', to: 'hub' }],
    },
    desk: {
      scene: '🗄️✉️💛',
      text: `The left-hand drawer sticks, then slides.

School reports, tied with string. A clipping from a paper twenty years old. A child's drawing of a lighthouse, in wax crayon, signed *P., aged 6*.

And on top, squared carefully to the edge, two envelopes in the same upright hand. The stamps are new. The seals are unbroken.

You hold them for a moment. It is an odd thing, to hold the weight of an unspoken sentence.

You take the later one, and slip it into your sleeve.`,
      give: ['letter', '_desk'],
      choices: [{ text: 'Continue searching.', to: 'study' }],
    },
    portraits: {
      scene: '🖼️🕯️👁️',
      caption: 'The portrait gallery',
      text: `A long panelled passage, hung with Hales. You walk its length with the candle held low and the faces swim up out of the dark one after another.

A Hale in armour, with a thin smile. A Hale in a bishop's lawn, looking cross. A Hale in a hunting coat, with a spaniel that is clearly the better portrait.

At the end hangs the newest, a young Ambrose, painted forty years ago: black-haired, laughing, one hand on a girl's shoulder. The girl is turned from the painter, as if called away, but you can see her chin. It is Philippa's chin.

The paint over her face has been scratched. Not recently. Someone, long ago, tried to remove her, and thought better of it.

*He could never finish it,* says a voice behind you, and you do not turn. *Such a stubborn man.*`,
      give: ['_portraits'],
      effects: { nerve: 1, focus: 1 },
      choices: [{ text: 'Go back to the hall.', to: 'hub' }],
    },
    study: {
      scene: '📚🔐🔥',
      caption: 'The study',
      text: `Ambrose's study smells of cigars and old paper. A tall green safe stands behind the desk. In the fireplace, a few last coals still tick.

*Be quick,* says a rather cross voice at your shoulder. It is the Captain, perched on the edge of the desk with his boots on the blotter.

You have time for one thing, or two, if you are careful.`,
      effects: { night: -1 },
      choices: [
        { text: 'Rake through the grate.', to: 'grate', if: [{ not: '_grate' }] },
        { text: 'Open the safe with the Captain\'s year.', to: 'safe', if: [{ has: '_code' }, { not: '_safe' }], lockedHint: 'You do not know the combination.' },
        { text: 'Search the desk for letters.', to: 'desk', if: [{ has: '_phil' }, { not: '_desk' }], lockedHint: 'You have no reason yet to search the desk.' },
        { text: 'Go back to the hall.', to: 'hub' },
      ],
    },
    grate: {
      scene: '🔥📜🧹',
      text: `You kneel, and with the poker you rake the cinders.

Among the ash, curled and brittle, lies a half sheet of heavy paper, scorched along three edges. A lawyer's hand. You read: *...the remainder of my estate to my daughter, Philippa Hale, in token of... and to my wife the sum of one hundred pounds per annum...*

It is signed and dated last Tuesday.

Someone burned this in a hurry. Someone who did not know that good paper does not burn all at once.`,
      give: ['will', '_grate'],
      choices: [{ text: 'Continue searching.', to: 'study' }],
    },
    safe: {
      scene: '🔐📒👴',
      text: `*Seventeen... ninety... four,* says the Captain, delighted, as you turn the dial. *Dear me. I am a combination.*

The door swings. Inside lie a bundle of bonds, a small revolver, and a black account book.

The book is the doctor's. You know it by the neat, rounded script: fifteen years of patients, fees, prescriptions. And, in a second column in red ink, in Ambrose's cramped hand, sums that do not agree. Fees charged for visits that never happened. Medicines billed that were never made. A wealthy man's estate, bled very softly.

In the margin on the last page: *Confront C. Sat. After dinner.*`,
      give: ['ledger', '_safe'],
      choices: [{ text: 'Continue searching.', to: 'study' }],
    },
    conservatory: {
      scene: '🌿🌧️🔍',
      caption: 'The conservatory',
      text: `The glass roof drums with rain. The air is thick and close, smelling of earth and wet leaf. Palms rise like frozen fireworks. In one corner a great aspidistra squats in a brass pot, as hideous and indestructible as a duchess.

You have no light but your candle. Everything is shadow, and every shadow is a person.

If there is something to be found here, you must know where to dig.`,
      effects: { night: -1 },
      choices: [
        { text: 'Dig in the aspidistra pot.', to: 'vial', if: [{ has: '_vialhint' }], lockedHint: 'There are fifty plants. You need a hint where to look.' },
        { text: 'Search the benches at random.', to: 'conservatory_fail', effects: { focus: -1 } },
        { text: 'Return to the hall.', to: 'hub' },
      ],
    },
    conservatory_fail: {
      scene: '🌿🕸️😩',
      text: `You pat down pots, shift trays of seedlings, turn over a watering can. A spider the size of a florin looks at you with disapproval.

Nothing. Your fingernails are black, your hem is wet, and the clock in the hall strikes midnight like a reprimand.

You will have to ask the house for help.`,
      effects: { night: -1 },
      choices: [{ text: 'Return to the hall.', to: 'hub' }],
    },
    vial: {
      scene: '🧪🌿✨',
      text: `Beneath the lowest leaves of the aspidistra the soil has been disturbed. You dig with your fingers, and your nails scrape glass.

A little blue bottle, the kind chemists give out, with a cork. Empty. Stuck to the inside is a ring of white residue that smells, even now, of pepper and cold earth.

The label is torn away. On the base, in minute raised letters, is the mark of a manufacturer in Geneva that supplies only physicians.

You wrap it in your handkerchief as though it were a baby bird.`,
      give: ['vial'],
      choices: [{ text: 'Return to the hall.', to: 'hub' }],
    },
    bedroom: {
      scene: '🛏️🗝️🎩',
      caption: 'Mrs. Hale\'s room',
      text: `Dorothea's door is locked. In the passage the portraits watch you with the cold interest of people who have no more to lose.

You can go in, if you have the key. You can try the lock with a hairpin and your luck, if you have not.

Behind you on the stairs, a floorboard shifts. The air smells of lavender.`,
      effects: { night: -1 },
      choices: [
        { text: 'Unlock the door with Pommeroy\'s key.', to: 'tonic', if: [{ has: 'key' }], lockedHint: 'You do not have a key.' },
        { text: 'Try the lock with a hairpin.', to: 'bedroom_pick', effects: { focus: -1 } },
        { text: 'Go back down.', to: 'hub' },
      ],
    },
    bedroom_pick: {
      scene: '🔒📍😬',
      text: `A hairpin is a clumsy thing. It slips. It bends. The lock gives a click so loud you expect the whole house to wake, and then, after what feels like a year, it opens.

Inside: silk, powder, the smell of Dorothea's scent. A dressing table. A hatbox, slightly ajar.

Nanny Brigid's voice, close by your ear, says *Behind the hats, girl.*`,
      effects: { night: -1 },
      choices: [{ text: 'Look behind the hat boxes.', to: 'tonic' }],
    },
    tonic: {
      scene: '🍾🎩🔍',
      text: `Behind a tower of hat boxes, wrapped in a scarf, stands a brown bottle, three-quarters full.

*Ambrose's Restorative Tonic,* says the label, in Dr. Crane's hand. You uncork it. It smells of syrup and almonds and something underneath, faint and metallic.

You are not a chemist. You are a medium, and the dead will tell you what a chemist would, if you ask them nicely.

The room has grown cold. In the dressing-table mirror, for the length of a heartbeat, you see an old woman looking over your shoulder, and nodding.`,
      give: ['tonic'],
      choices: [{ text: 'Slip out, and lock up behind you.', to: 'hub' }],
    },

    accuse: {
      scene: '⚖️🕯️👥',
      caption: 'The drawing room, near dawn',
      text: `You gather them: the widow, the doctor, the nephew, the butler. Inspector Marsh stands by the fire with his arms folded. The ghosts crowd the edges of the room, visible only to you.

The rain has thinned. Beyond the curtains the sky is the colour of dishwater, the first hint of light.

*Miss Finch,* says the Inspector, tiredly. *You have the floor.*

Everything you've learned, everything you've found, is now a question of what you can prove. You take a breath, and speak a name.`,
      choices: [
        { text: 'Accuse Dr. Crane.', to: 'acc_crane' },
        { text: 'Accuse Dorothea Hale.', to: 'acc_dor' },
        { text: 'Accuse them both.', to: 'acc_both', if: [{ has: 'vial' }, { has: 'ledger' }, { has: 'tonic' }], lockedHint: 'You do not yet have enough for both.' },
        { text: 'Accuse Pommeroy, who served the port.', to: 'acc_pom' },
        { text: 'Accuse Julian, who lied about the study.', to: 'acc_jul' },
        { text: 'Let Sir Ambrose speak for himself.', to: 'acc_voice', if: [{ has: '_peace' }, { has: 'ledger' }, { stat: 'focus', min: 3 }], lockedHint: 'He is not yet at peace, or you lack the strength and the proof.' },
      ],
    },
    acc_crane: {
      scene: '🩺⚖️😰',
      text: `*Doctor Crane,* you say.

He puts down his brandy, slowly, and smiles. *Come now, Miss Finch.*

The room waits. What do you put on the table?`,
      choices: [
        { text: 'Lay out the vial and the ledger, and Maud\'s testimony.', to: 'end_half', if: [{ has: 'vial' }, { has: 'ledger' }], lockedHint: 'You need both the vial and the ledger.' },
        { text: 'Accuse him on the strength of a ghost\'s word alone.', to: 'end_wrong' },
      ],
    },
    acc_dor: {
      scene: '👩‍🦰⚖️😶',
      text: `*Mrs. Hale,* you say.

The widow does not move. Her black crêpe does not so much as rustle.

*I should like to know,* she says coolly, *what you have.*`,
      choices: [
        { text: 'Lay out the tonic bottle and the scorched will.', to: 'end_half', if: [{ has: 'tonic' }, { has: 'will' }], lockedHint: 'You need both the tonic and the will fragment.' },
        { text: 'Accuse her on suspicion alone.', to: 'end_wrong' },
      ],
    },
    acc_pom: {
      scene: '🎩⚖️😔',
      text: `*Pommeroy,* you say. *He decanted. He carried. He had the best chance.*

The old man does not argue. He merely closes his eyes, like a man hearing something he has long expected.

On the stairs, the Captain draws his sword with a clang, and Nanny Brigid's voice cuts across the room like a whip: *You foolish girl.*`,
      choices: [{ text: 'Press on.', to: 'end_wrong' }],
    },
    acc_jul: {
      scene: '🧑‍🦱⚖️😰',
      text: `*Julian,* you say. *You lied. You were in the study.*

*Yes!* he cries. *Yes, and I've said so, haven't I? I'm a fool, I'm a liar, I owe three hundred pounds to a bookie, but I did not...*

His aunt has not looked at him once. The doctor has taken out a handkerchief and is polishing a glove.

*Inspector,* says Julian, white to the lips.`,
      choices: [{ text: 'Press on.', to: 'end_wrong' }],
    },
    acc_both: {
      scene: '⚖️🕯️🔍',
      text: `*Both,* you say.

The room goes still.

You lay them on the occasional table one by one, like a patient's hand of cards: the little blue vial, the ledger with its red margin notes, the brown tonic bottle with its smell of almonds.

*Dr. Crane was robbing his patient for fifteen years. When Sir Ambrose found out, and made a new will cutting out his wife, they had a problem. Mrs. Hale had already been dosing him with arsenic in his tonic, slow, quiet, to make a death by weak heart. The new will made it urgent. Dr. Crane put the aconite in the port. She burnt the will. And he sat at the old man's elbow and said "Steady," while he died.*

For a long moment nobody breathes. Then Maud's thin voice, from the passage, says: *That's him. That's how it was.* And only you can hear.`,
      choices: [{ text: 'Wait for the answer.', to: 'end_whole' }],
    },
    acc_voice: {
      scene: '👴🕯️✨',
      text: `*I would like,* you say, *to ask Sir Ambrose to speak.*

The Inspector opens his mouth to protest. The candle flares green.

You close your eyes and open your hands, and say, as you have said so rarely in this life: *Sir, you may borrow what I have.*

It does not hurt. It is like having someone you love put on your coat. A warm breath fills your chest, and your voice, when it comes, is deeper than your own, a little cracked, very stern.

*Good evening,* says Sir Ambrose Hale, through your mouth. *I should like to say a few words about the matter of my death.*`,
      effects: { focus: -2 },
      choices: [{ text: 'Let him speak.', to: 'end_voice' }],
    },

    end_whole: {
      scene: '⚖️🌅🕯️',
      text: `Dr. Crane runs first. He gets as far as the hall, where the Captain, with a delighted shout, sticks out a ghostly foot, and the doctor goes down on the tiles in a heap, with a noise like a sack of coal. Inspector Marsh sits on him.

Mrs. Hale says nothing. She straightens her choker. Only her eyes move, to the burnt scrap of the will on the table, and they look, for the first time, tired.

At dawn the constables arrive on boats. Pommeroy brings tea. Julian is sick in a rhododendron.

The house goes quiet around you, thoughtfully, the way a church does after a funeral.

On the stairs, the Captain removes his hat, and the nurse nods, once. Maud smiles, and for a moment her cap is not burnt at all.`,
      ending: { title: 'The Whole Truth', kind: 'good', score: 100 },
    },
    end_half: {
      scene: '⚖️🌧️😕',
      text: `You lay your evidence out, and the case is good, as far as it goes.

The accused is led away. The constables nod at your cleverness. Inspector Marsh, to his visible agony, thanks you.

But as the boat pulls out across the flooded lawn you see a second figure on the steps, in a black coat, watching the first go. She is not weeping. She is calculating.

You have proved one hand. The other is still free, and it will be careful now.

In the hall the nurse shakes her head, once, slowly. *Half,* she says. *Half is a great deal, girl. But you knew it wasn't enough.*`,
      ending: { title: 'Half a Truth', kind: 'neutral', score: 55 },
    },
    end_wrong: {
      scene: '⚖️🌧️💔',
      text: `Your accusation is neat, and bold, and wrong. There is not enough to hold it, and the guilty party knows it.

The Inspector sighs. A constable takes someone by the arm, someone who did not deserve it. The real poisoner pours another brandy.

You are driven back to the station through a dawn washed the colour of pewter. In the house behind you, the ghosts are quiet. Maud is crying, without sound, in the kitchen. The nurse turns her back on the carriage.

*You were so close,* says the Captain, as the gate shuts. *I do hate a bungled duel.*

Somewhere in Thornwick House, an innocent man is being measured for a rope.`,
      ending: { title: 'The Wrong Name', kind: 'bad', score: 15 },
    },
    end_voice: {
      scene: '👴⚖️✨',
      text: `He speaks for twenty minutes.

He gives the dates. He gives the names. He gives the amounts, to the shilling, and the sums in the red column. He tells the Inspector exactly where to find the second bottle, and he describes the doctor's hand tipping it, and the shape of the stopper, and the doctor's habit of humming through his teeth.

Dr. Crane goes white as paper. Dorothea says *It's a trick,* and then, as he describes the bedroom and the hat boxes, *Stop it.*

At the end he turns his head, my head, toward a girl in the doorway whom nobody else can see. *Philippa,* he says. *I did open it. I am sorry I was so slow.*

The Inspector, who does not believe in ghosts, writes down every word.`,
      ending: { title: 'A Host\'s Last Words', kind: 'secret', score: 130 },
    },
    end_possessed: {
      scene: '😶🕯️🌫️',
      text: `You have given too much. You feel it the way a swimmer feels the shore recede.

The candle goes out. The Captain's laugh, the nurse's rebuke, Maud's whisper, the old man's confusion, all rush into the space where you used to be, and you cannot find the door of yourself.

*Sit,* says someone using your mouth. *Sit down, girl. You're tired.*

By morning Inspector Marsh finds you in the hall, sitting bolt upright on the bottom stair, eyes open, talking in four voices.

The house is very full. It always wanted a medium who would stay.`,
      ending: { title: 'The House Keeps You', kind: 'bad', score: 10 },
    },
    end_dawn: {
      scene: '🌅🚔🏚️',
      text: `The sun comes up on a house full of questions.

The constables row across the flooded lawn. They set up a table in the dining room. The Inspector asks for your findings, and you hold out empty hands.

Dr. Crane, with the unctuous sympathy of the professionally bereaved, signs a certificate: heart failure. Sir Ambrose Hale, aged seventy, died of natural causes.

Quietly, in the hall, an old man weeps, and a girl in a scorched cap puts a hand on his sleeve.

*Never mind,* she says. *Never mind. You tried.*

Nobody else hears it. Nobody ever does.`,
      ending: { title: 'Morning Comes Too Soon', kind: 'bad', score: 20 },
    },
  },
}

export default story
