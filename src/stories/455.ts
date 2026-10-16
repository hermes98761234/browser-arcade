import type { Story } from './types'

const story = {
  id: 455,
  title: "Dragon's Choice",
  blurb:
    'For three hundred years the dragon on Ashmoor Mountain has kept the valley warm, and the valley has paid her in bells. Now the Duke has sent knights to kill her, a dying bellringer has put the tithe bell in your hands, and the dragon is waiting. Befriend her, slay her, or take her fire for your own. Every road has a price.',
  items: {
    bell: '🔔 Tithe bell',
    scroll: "📜 Hob's translation",
    scale: '🐉 Dragon scale',
    gold: '💰 Hoard gold',
    heartstone: '🔥 Heartstone',
    egg: '🥚 Ember egg',
    lament: '⚔️ Lament, the dragonsbane',
    charter: '🖋️ Treaty charter',
  },
  stats: {
    life: { label: 'Vitality', emoji: '❤️', start: 7, min: 0, max: 10, onMin: 'end_burned' },
    heart: { label: 'Heart', emoji: '💛', start: 6, min: 0, max: 10, onMin: 'end_hoard' },
    bond: { label: 'Dragon bond', emoji: '🐉', start: 2, min: 0, max: 10 },
    honor: { label: 'Knights\' regard', emoji: '🛡️', start: 3, min: 0, max: 10 },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🏔️🔔🏘️',
      caption: "Harrow's Rest, First Frost",
      text: `The valley of Ashmoor has never had a winter. Snow falls on the high peaks and stops, politely, at the treeline, as if somebody had drawn a line there with a ruler. Down in the village the orchards bloom a month early, and the hot springs smoke in the dawn, and old women swear the mountain breathes.

It does. Everyone knows it. You can feel it in the paving stones at night, a deep slow warmth, like a sleeping animal under a quilt.

Old Orrin has rung the tithe bell for sixty years, every year on the first frost, up the Bellman's Stair, and tonight he cannot rise from his bed. His breath whistles. His hands, spotted and enormous, are folded on his chest like two old gloves. He has been asking for you for an hour.

"Come here, girl," he says. "Quickly. I haven't got long, and I never was any good at speeches."`,
      choices: [
        { text: 'Kneel at his bedside.', to: 'orrin' },
      ],
    },
    orrin: {
      caption: 'Orrin the Bellman',
      give: ['bell'],
      effects: { bond: 1 },
      text: `He presses something into your hands. A bell, no bigger than a fist, of dark bronze gone green at the lip, with a clapper worn smooth as a thumb. It rings, even in his weak grip, with a clear, small, impossible note that you feel in your back teeth.

"They'll tell you she's a monster," he says. "The Duke's men, the priests. Maybe she is. I've never been in the room." He laughs, and it becomes a cough. "But I'll tell you what I do know. Every year, I ring that bell at her door, and every year, she rings back. Once. From inside the mountain. As if to say: *I'm still here, Orrin. Are you?*"

"Orrin — "

"Ask her what she *keeps*," he says, very softly. His eyes are fixed on something beyond the ceiling. "Everyone asks what she hoards. Nobody has asked what she keeps."

His hand relaxes in yours. It's like holding a leaf.`,
      choices: [{ text: 'Close his eyes. Go out into the square.', to: 'square' }],
    },
    square: {
      scene: '🏰🛡️🐴',
      caption: "The Square",
      text: `By noon the Duke's company is in the square. Twelve horsemen in white and grey, banners snapping, mud to their knees. In front, a woman in battered plate, grave and sunburned, with a sword in a plain scabbard that nobody looks at directly. Ser Alis Brightwater, who is said to have killed a wyvern with a spoon. Beside her, mounted on a very clean white mule, a smiling man in a priest's cassock: Brother Anselm Voss.

A herald reads from a scroll. The Duke of Corvane, in his wisdom, has resolved to end the menace of Ashmoor. A reward of a thousand crowns. The hoard of the dragon to be the Crown's. Any local with knowledge of the mountain paths will be paid, thanked, and, the herald does not quite say, expected.

Every eye in the square goes, a little, to the bell in your hand.

"Is that the tithe bell?" says the priest, with a very warm smile. "Child, you must be so *proud*."`,
      choices: [
        { text: 'Offer to guide the knights up the mountain.', to: 'knights_deal' },
        { text: 'Slip away. Climb the Bellman\'s Stair alone, tonight.', to: 'night_stair' },
        { text: 'Ask old Gran Mothe what she remembers of the mountain.', to: 'gran' },
      ],
    },
    gran: {
      caption: 'Gran Mothe',
      give: ['_song'],
      effects: { heart: 1 },
      text: `Gran Mothe sells beeswax candles and bad news from a stall by the well. She's ninety, or a hundred, and wears her white braid wound twice around her head like a crown. When you ask, she doesn't answer. She hums.

It is a very old song, the kind sung to children: a slow tune with an odd pattern, five rising notes, then a fall. The words are almost gone. *Who keeps the fire? Who keeps the snow? Who keeps the quiet we all must go?*

"My grandmother said she wasn't always a dragon," says Gran Mothe, wrapping a candle in paper. "Said she was a girl once. The first shepherd of the valley. And one winter, the winter that never ended, she walked up into the mountain, and the winter did."

She presses the candle into your palm. "Take that. It never goes out. Don't ask me why."

It is warm. It smells of honey.`,
      choices: [
        { text: 'Offer to guide the knights.', to: 'knights_deal' },
        { text: 'Take the Bellman\'s Stair, alone, tonight.', to: 'night_stair' },
      ],
    },
    knights_deal: {
      scene: '🛡️🏔️🔥',
      caption: 'Ser Alis Brightwater',
      effects: { honor: 1 },
      text: `Ser Alis does not smile. She takes your hand in a callused, dry grip, and looks at you with the unflinching gaze of a woman who has already seen her own death several times and found it unremarkable.

"A guide," she says. "Good. I'd rather go with someone who knows where the ground is hot." She nods at the priest. "And Brother Anselm will be at your elbow, to bless the venture."

"I am *so* looking forward to it," says Anselm.

You march at dusk. Twelve riders and one girl on foot with a bronze bell, up out of the warm valley and into a night that is, quite suddenly, much colder. The road winds higher. You find yourself listening for something, though you could not say what.`,
      choices: [{ text: 'Make camp at the first shelf of the mountain.', to: 'k_camp' }],
    },
    k_camp: {
      scene: '🏕️🔥🌌',
      caption: 'The Camp',
      text: `They pitch the tents on a shelf of grey rock, under a sky so full of stars that it hurts. The fire is built too high, and Ser Alis, without a word, kicks half of it out. The horses are nervous. The mountain, behind you, exhales a thread of steam from some crack in the rock.

You sit between two worlds: the soldiers, joking too loudly, and the dark, listening.

Alis cleans her sword beside the fire. Brother Anselm sits cross-legged on a silk cushion that somebody has carried for four miles, humming over a small silver reliquary. A boy squire, perhaps fifteen, whispers a prayer to a wooden saint.`,
      choices: [
        { text: 'Sit beside Ser Alis.', to: 'k_alis' },
        { text: 'Sit beside Brother Anselm.', to: 'k_anselm' },
        { text: 'Sleep, and ready yourself for the climb.', to: 'k_road' },
      ],
    },
    k_alis: {
      caption: 'Ser Alis Brightwater',
      effects: { honor: 2 },
      give: ['_alis_talk'],
      text: `"It is called Lament," says Ser Alis, when she sees you looking. She draws the sword two inches. The blade is the colour of old smoke, and the steel seems to listen. "It was forged to kill one kind of thing. It has killed it nine times. Every time it does, it takes something from the hand that holds it. A name. A birthday. The face of a mother." She slides it home. "I have forgotten a great many things."

"Why do it?"

"Because somebody has to be the one who goes up the mountain." There's a dry crack of humour in her voice. "And because the Duke pays. And because I am tired of listening to people being afraid." She stares into the fire. "I'll tell you something, bellgirl. I have never seen this dragon. For two years I've had nightmares of a thing with a hundred teeth. And do you know, in all of those nightmares, it never once *did* anything."

She looks at you. "It just watched me."`,
      choices: [{ text: 'Thank her, and go to bed.', to: 'k_road' }],
    },
    k_anselm: {
      caption: 'Brother Anselm Voss',
      give: ['_anselm_plot'],
      effects: { heart: -1 },
      text: `"Shy of priests?" says Brother Anselm, patting the cushion. "Everyone is. It's the black. Sit, child. I shan't bite." His teeth are very even and very white.

He tells you the quest is a holy one. The King, it seems, is dying. A long, slow, expensive death. And in the heart of the Ashmoor Dragon, according to certain very ancient and very *private* texts, there lies a stone, a living coal, a *heartstone*, which can burn out any sickness. "A single ember. Hardly worth a mention. The beast would never miss it."

"And the dragon?"

"Dragons are not people, dear." He pats your knee. "They are weather with teeth."

In the firelight, the reliquary in his hand is not a reliquary. It's a small iron cage, lined with something dark. It's just the right size to hold a coal.`,
      choices: [{ text: 'Say goodnight. Quietly.', to: 'k_road' }],
    },
    k_road: {
      scene: '❄️🏔️🐺',
      caption: 'Frost Pass',
      effects: { life: -1 },
      text: `The pass is a cut in the mountain like a notch in a blade, full of wind, glassy with old ice. Above the treeline the warmth drops away, and for the first time in your life you know what winter is: a thing that wants to climb into your coat and settle.

You lead the way, picking holds, calling back. The horses are left at the last shelf with the squire. The knights climb on foot, creaking, cursing in the cold, and slowly, steadily, the mountain begins to *breathe*.

You feel it first in your boots. Then in the stones. Then, in the air above the pass, a long, low, even sound, like a sigh being drawn through a very large pair of lungs.

"What is that?" the squire whispers.

"Wind," says Ser Alis, quietly, who knows better.`,
      choices: [{ text: 'Climb on.', to: 'k_ambush' }],
    },
    k_ambush: {
      scene: '🐉🌌🏔️',
      caption: 'The Shadow',
      text: `It passes over you at dusk. A shadow the shape of a cathedral roof with wings, so vast and so slow that for a moment you mistake it for a cloud. The wind of it rolls down the pass in a warm wave. The stones glow, faintly, red under your hands.

Nobody screams. That is what you will remember. Twelve armed men and one priest, and not one of them makes a sound. They simply stand, looking up, mouths open, with the same expression as children at a lantern parade.

The shadow circles once. It descends, and, for the space of a single heartbeat, a golden eye the size of a cartwheel turns in the dark and looks, directly and unmistakably, at *you*.

Then it is gone, into the black over the summit. And the soldiers recover, all at once, and begin to shout.`,
      choices: [
        { text: 'Stand with the knights, and keep them calm.', to: 'k_gate', effects: { honor: 2 } },
        { text: 'Slip away down the Bellman\'s Stair while they argue.', to: 'night_stair', effects: { bond: 1 } },
      ],
    },
    night_stair: {
      scene: '🌌🪜🔔',
      caption: "The Bellman's Stair",
      effects: { life: -1 },
      text: `The Bellman's Stair is not a stair so much as a rumour: ten thousand steps hacked into the side of the mountain by someone who did not believe in rails. Orrin climbed it every year for sixty years. You climb it in an hour, by moonlight, heart in your mouth, wind plucking at your cloak.

Every hundred steps there's a cairn. Someone has laid a stone on each, and a small gift beside it: a button, a ribbon, a coin worn smooth. A child's tooth. A wooden bird. These are the valley's small prayers, left over three hundred years. You touch each cairn as you pass, without quite meaning to.

The air gets warmer, not colder. It smells, faintly, of cinnamon and hot iron.

At the halfway landing there's a sound of running water, where no water should be.`,
      choices: [
        { text: 'Follow the sound of water.', to: 'ember_falls' },
        { text: 'Keep climbing. Do not stop.', to: 'ash_wood' },
      ],
    },
    ember_falls: {
      scene: '♨️🌿🌌',
      caption: 'Ember Falls',
      effects: { life: 2, heart: 1 },
      text: `A waterfall steams out of the living rock and tumbles into a series of green pools, each one hot as a bath. Ferns grow in the spray. In the highest pool, a heron stands on one leg, dreaming. This is where the warmth of the valley is *made*: a great gush of heated water, flowing down the mountain's veins to the village springs below.

You drink. It tastes of iron and a faint, sweet smoke. For the first time in two days your hands stop shaking.

On the rim of the pool is a carved stone, so worn that you can read it only by touch. A line of runes, and above them, a woman's face in profile: strong, heavy-browed, with a shepherd's crook over one shoulder. Someone has hung a garland of dried flowers on the crook. The flowers are fresh.

*I keep the fire*, say the runes. *So that you need not keep the cold.*`,
      choices: [
        { text: 'Follow the path up to the cave where a light flickers.', to: 'hob_cave' },
        { text: 'Climb on toward the summit.', to: 'ash_wood' },
      ],
    },
    hob_cave: {
      scene: '🕯️📚🧌',
      caption: "Hob's Study",
      text: `The cave is lined with books. Not shelves: *heaps*, great drifts of parchment and vellum and stolen almanacs stacked to the ceiling and warmed by a vent in the floor. In the middle of them sits a very small goblin, in a very large pair of spectacles, reading by the light of a single candle with the intensity of a starving man at a feast.

"Don't *move*," says the goblin, without looking up. "You are standing on the Aegean Appendices, and they have been brittle since the Second Age." He turns a page. "I am Hob. I assume you're here for the dragon. They always are, and they always step on the Appendices."

You step off the Appendices.

"Good," says Hob. "Now. I haven't spoken to a human being in forty years, and I find that I've forgotten how it's done. Do you play chess? Do you, perhaps, *read*?"`,
      choices: [
        { text: 'Sit down and tell him a story.', to: 'hob_talk' },
        { text: 'Offer to trade the tithe bell for what he knows.', to: 'hob_trade' },
        { text: 'Leave him to his books.', to: 'ash_wood' },
      ],
    },
    hob_talk: {
      caption: 'Hob',
      give: ['scroll', '_truth'],
      effects: { heart: 1, bond: 1 },
      text: `You tell him a story: the story of Old Orrin and the bell, as best as you can, and the dead man in the village, and the cairns on the stair. When you finish, Hob has removed his spectacles and is polishing them furiously on his sleeve.

"A *fine* story," he says thickly. "A very fine story. And a *true* one, which is rarer." He scrambles up a heap of books and returns with a roll of vellum covered in cramped runes. "Here. The Warden's Rune. I have been translating it for thirty years, and nobody ever asked. Read."

You read, with his finger on the line.

*When the winter of the world comes, one shall walk into the fire and be the fire. She shall be called Dragon. She shall keep the cold from the valley, and be loved by none, and keep it still. And when she grows weary, another shall be asked, and the asking is the whole of the law.*

"It's a *post*," whispers Hob. "Don't you see? It was never a monster. It's a *job*."`,
      choices: [{ text: 'Roll it up. Thank him.', to: 'ash_wood' }],
    },
    hob_trade: {
      caption: 'Hob',
      effects: { bond: -1, heart: -1 },
      text: `"The *bell*?" Hob's voice rises to a squeak. "It is a sacred object. It is a *testimonial*. It is the only unbroken line of communication between the valley and the mountain in three hundred years, and you would trade it for gossip?"

His outrage is so total that you can't help laughing, and, a moment later, he joins you, shamefaced. "Well. Perhaps not the *whole* bell."

He gives you a fragment all the same: a single page, torn from some other book, mapping the old Warden's Path to the dragon's gate. It's not nothing. It is not what you came for. And on the way out, you feel, sharply, as if a small hand had been pulled out of yours.`,
      choices: [{ text: 'Go on up.', to: 'ash_wood' }],
    },
    ash_wood: {
      scene: '🌲🔥🗿',
      caption: 'The Ashen Wood',
      text: `Near the summit the trees stop being trees. They are black columns now, charred and leafless, each one hung with a lantern of cold silver frost. The ground is soft with ash, and your boots leave no sound at all.

There are statues among the trees. Eleven of them. Each stands on a plinth, hooded and robed, with a face too weathered to read. Eleven wardens, you realise, one for each dragon before this one, standing in a silent ring around a path that leads upward. At the end of the line, on a plain stone, is a twelfth plinth. It is empty.

A twelfth. Not occupied. Still waiting.

The path ends at a door in the mountain: a pair of doors forty feet tall, of dark, polished stone, carved with a thousand tiny bells.`,
      choices: [{ text: 'Walk to the Gate.', to: 'gate' }],
    },
    k_gate: {
      scene: '🚪🔔🛡️',
      caption: "The Dragon's Gate",
      text: `You reach the summit at dawn, twelve weary knights at your back, in a forest of black trees and silver frost. The doors in the mountain stand before you, so huge that the knights' banners look like handkerchiefs. A thousand tiny bells are carved in the stone.

"Parley," says Ser Alis, stepping forward. "We should try that first. A dragon this old will have *manners*." She looks at you. "You carry the bell. The doors have not opened to steel in three centuries. Ring it. Go in alone, and speak for us."

"Alone?"

"I will not be the one to knock down the door of a thing I do not understand," says Alis. "Not until I've heard what it says." She grips the hilt of Lament. "But if you do not come out by sunrise, I come in. And so does the Brother."

Anselm smiles at you. It is a very wide smile. It does not reach his hands.`,
      choices: [{ text: 'Ring the bell.', to: 'ring_bell' }],
    },
    gate: {
      scene: '🚪🔔🌌',
      caption: "The Dragon's Gate",
      text: `There is no handle on the doors, no keyhole, no hinges. There is a niche at the height of a bellman's hand, and in it, a small bronze hook that your bell would fit.

Behind you, far down the mountain, small as fireflies, a line of torches is climbing the pass. The Duke's knights. They will be here by morning, with iron and Brother Anselm.

You have some time. Not much.`,
      choices: [{ text: 'Hang the bell on the hook and ring it.', to: 'ring_bell' }],
    },
    ring_bell: {
      caption: 'The Bell',
      text: `You ring the bell, once.

The note goes out across the mountain, small, clear, impossible. It rolls through the trees, down into the valley, up into the cold dark above the peaks. For a moment there is nothing at all: wind, frost, the beat of your pulse.

Then, from deep inside the mountain, a *reply*.

It is not a roar. It is a single, soft, resonant note, so low that you feel it in your ribs before you hear it, so warm that the frost on the trees begins, very slowly, to melt. A bell the size of a church tower, struck once, with infinite patience.

*I am still here*, says the note. *Are you?*

The doors of the mountain open without a sound.`,
      effects: { bond: 2 },
      choices: [{ text: 'Walk into the dark.', to: 'hearth_hall' }],
    },
    hearth_hall: {
      scene: '🐉🔥🏛️',
      caption: 'The Hearth Hall',
      text: `It is a hall like a held breath. A vast domed cavern of red and gold stone, lit by the slow pulse of a river of magma that winds across the floor. The air is the exact temperature of a bath. Steam drifts in the high vaults. Somewhere, water is dripping into a pool with the unhurried rhythm of a clock.

Curled around the river, like a cat around a hearth, is the dragon.

She is longer than the village. Her scales are the colour of old copper, edged with silver, many of them cracked or dull. Her wings are folded like sails. Her head rests on her forepaws, and one golden eye, enormous, patient, ancient, has opened to watch you cross the floor.

"Ah," says the dragon. Her voice is a low, dry, rolling murmur, with a faint, unexpected note of humour. "A bellringer. They have sent me a *young* one this year. Orrin, I take it, has finally retired."

She is waiting for you to speak.`,
      choices: [
        { text: '"Orrin is dead. He gave me the bell."', to: 'kh_first' },
        { text: '"I came to ask what you keep."', to: 'kh_keep', if: [{ has: '_truth' }], lockedHint: 'I do not yet know the right question. (Orrin\'s secret, or Hob\'s scroll)' },
      ],
    },
    kh_first: {
      caption: 'Kharavel',
      effects: { bond: 1 },
      text: `The eye closes. For a long time, the dragon says nothing at all, and you stand on the warm stone, listening to the water drip.

"He was a good ringer," she says at last. "He never missed a year. Sixty-one, if you count the one he was ill, when a boy rang for him. Very badly." The huge ribcage rises and falls. "He used to talk to me through the door. Told me about the harvests, and his wife, and the nephew who was a disappointment. I never answered. One doesn't, with a door. But I *listened*."

Her eye opens again. It's the colour of a candle in a window.

"I am Kharavel," she says. "That is the name I had before I was a Dragon. Not many are left who know it. It is a courtesy to say it."`,
      choices: [
        { text: '"Why have you kept the valley warm?"', to: 'kh_story' },
        { text: '"The Duke\'s knights are coming."', to: 'kh_knights' },
      ],
    },
    kh_keep: {
      caption: 'Kharavel',
      effects: { bond: 3, heart: 1 },
      text: `The great head lifts. The vaults ring with a soft rustle of scales, like a very large cloak being drawn aside.

"*What do I keep*," she says slowly. "Not what do I hoard. Not what do I *guard.* Orrin always did say he was clever. He must have been telling you things." There's a gleam in the eye. "Come closer, child. Closer. I'd like to see your face."

You step within reach of the great teeth. Hot breath ruffles your hair, smells of woodsmoke and honey.

"I keep the *cold* away," says Kharavel. "That is what the fire is for. It is not mine. It is the valley's, and I am only the hands it is held in. You have been told otherwise, by the Duke, by the priests. But I think you knew."

You find that your eyes have filled with tears.`,
      choices: [{ text: 'Ask her to tell you everything.', to: 'kh_story' }],
    },
    kh_knights: {
      caption: 'Kharavel',
      text: `"Of course they are," says the dragon, mildly. "They come every hundred years. A duke, a king, a bishop. They stay a few weeks, and it ends in one of three ways." Her eye drifts toward the ceiling. "It has been so long. I had rather hoped that the next one might ask me a question first."

"The knights have a sword. It's called Lament."

"Ah." Something in her great chest goes quiet. "Then there is a *very* old friend in the valley. I had wondered where it went." She makes a sound like a very long sigh. "Sit, little bellringer. There are things you ought to hear before they come."`,
      choices: [{ text: 'Sit, and listen.', to: 'kh_story' }],
    },
    kh_story: {
      scene: '🔥🗿🌌',
      caption: 'Kharavel',
      give: ['_truth'],
      text: `"Once, I was a shepherd," says Kharavel. "Ashmoor was a high bare valley, and the winter came and did not leave. Seven years of white. The flocks died. The children died. I walked up this mountain on the last day of the last winter, with nothing but a crook, and I said to the cold: *take me instead.*"

The magma river hushes, listening.

"And the mountain said yes. It put a fire in me that was larger than me, and it made me what I am. That was three hundred years ago. I was not the first. There were eleven before me, each in turn: a woman, a man, a girl of sixteen. The fire is never ours. We only carry it. Until we are tired, and ask."

"Ask?"

"For someone to carry it next." Her voice softens. "I am very tired, bellringer. The fire is going out of me. If I die without a Warden, it will go out of the mountain. And the winter, which has been waiting very patiently, will come down into the valley, and it will not leave again."`,
      choices: [
        { text: '"The knights don\'t know any of this."', to: 'kh_dying' },
        { text: '"Who is supposed to carry it next?"', to: 'kh_offer' },
      ],
    },
    kh_dying: {
      caption: 'Kharavel',
      effects: { heart: 1 },
      text: `"No." Her eye closes. "They think I'm a hoard with teeth. They have been told that the beast of the mountain is the valley's curse. It is a very *useful* story. It lets a duke do as he likes."

She raises a forepaw. In the lamplight of the magma, you see that the scales on her breast are dull and grey, and under them, where the fire should be, the shimmer is faint and fluttering. Like a candle in a draught.

"I have perhaps a season," says Kharavel. "Perhaps less. I would like to die well. I would like to be *asked*, not hunted. And I would very much like to know that the valley will be warm in the spring."

She turns her head, and the whole hall seems to turn with her. "You carry the bell. That is a kind of asking. You may do with it what you like."`,
      choices: [{ text: 'Ask her what she wants of you.', to: 'kh_offer' }],
    },
    kh_offer: {
      caption: 'Kharavel',
      text: `"Three roads," says the dragon. "I will not choose among them. That is the whole of the law: the asking, and the answer, and neither compelled.

"One. You may help me die well. Talk to the knights. Make some kind of peace, with the Duke, with the priests, with your own villagers. I will give what remains of the fire to the valley, little by little, and it will see you through a generation, perhaps two. After that, I cannot say.

"Two. You may take the fire. Step into the Heartfire, in the deep chamber, and say yes. You will be a Dragon. You will not be a girl any longer. It is lonely. It is also, I think, rather splendid.

"Three. I have a thing in my hoard that I have kept for a hundred years. I have never dared to wake it." She hesitates. "It is not for the faint of heart. Look at it, and tell me if you still wish to choose."`,
      choices: [{ text: 'Look around the hall.', to: 'hall_hub' }],
    },
    hall_hub: {
      scene: '🐉🔥🏛️',
      caption: 'The Hearth Hall',
      text: `The Hearth Hall breathes around you. Kharavel lies in the red light, patient, her eyes half closed, a very large, very old cat. Beyond the magma river there is a wide arch, and past the arch a corridor that descends, into a deeper, hotter dark.

Away to your left, a smaller tunnel, lined with gold. The hoard. And outside, faint and far, you can hear the clank of armour on stone, and the hammering of a ram against the mountain's great doors.

The knights are here.`,
      choices: [
        { text: 'Go to the hoard.', to: 'hoard' },
        { text: 'Go down into the Heartfire.', to: 'heartfire' },
        { text: 'Go to the doors, and speak to the knights.', to: 'alis_stand' },
        { text: 'Set the egg in the warm ash, and keep a vigil.', to: 'egg_plan', if: [{ has: 'egg' }], lockedHint: 'There is an egg in the hoard that may need someone to warm it.' },
      ],
    },
    hoard: {
      scene: '💰📦🔥',
      caption: 'The Hoard',
      text: `A long, vaulted chamber, glittering. Gold, of course. Heaps of it, spilled from broken chests: crowns and goblets and rings. But you are looking past it, at the walls. Every inch is hung with *things*.

Ribbons. Buttons. A wooden bird. A child's tooth, strung on a thread. Candles. Shoes. A thousand small gifts, a thousand little letters, written in a thousand hands, pinned in rows. Every one of them from the cairns on the stair. Every one of them carried up, by the ringers, year on year on year.

*Dear Dragon, thank you for the warm winter.* *Dear Dragon, my grandmother has died, but she liked you.* *Dear Dragon, I am sorry about the Duke.*

Hundreds of years of letters. She has kept every one.

At the far end of the chamber, in a nest of black ash, something gleams. A coal. And beside it, wrapped in a wreath of dried flowers, a stone the size of a goose's egg.`,
      choices: [
        { text: 'Read the letters.', to: 'hoard_gifts' },
        { text: 'Fill your pockets with gold.', to: 'hoard_gold' },
        { text: 'Go to the nest of ash.', to: 'hoard_nest' },
        { text: 'Return to the hall.', to: 'hall_hub' },
      ],
    },
    hoard_gifts: {
      caption: 'The Letters',
      effects: { heart: 2, bond: 1 },
      text: `You read until your eyes sting. A girl wrote that her mother was ill and the winter was kind. A man wrote an apology for a stone he'd thrown at the mountain when he was nine. A child, in a spidery crayon scrawl, wrote *I think you are not scary. I think you are lonely.* Under it, in a different hand, very faint, in ink so old it has gone brown: *Thank you. I am.*

You see what Orrin meant. A hoard is what a dragon keeps *for itself*. A hoard is gold. But this is the valley's gratitude in a thousand small hands, and she has been keeping it all this time like a dormouse keeps seeds: *just in case someone asks whether anyone ever said thank you.*

You put the letter back. You find you've made up your mind about something, though you couldn't say what.`,
      choices: [{ text: 'Return to the hoard.', to: 'hoard' }],
    },
    hoard_gold: {
      caption: 'The Gold',
      give: ['gold'],
      effects: { heart: -3 },
      text: `It is very easy. The gold slides into your pockets like warm water, coin after coin. A goblet. A heavy chain. A ring with a stone like a drop of blood. It is a thousand times what the Duke has offered, ten thousand times what a bellringer's apprentice has ever seen.

It is warm in your hands, and it hums. You tell yourself that nobody will miss it. That she is dying. That a great deal of good could be done with it, in the village, in the spring. All of these things are true, and none of them is the reason.

From the hall behind you, a very faint noise, like a very large sigh, comes from the dragon. She does not speak. She does not stop you.

That is the worst of it.`,
      choices: [{ text: 'Go back, heavy-pocketed and a little cold.', to: 'hoard' }],
    },
    hoard_nest: {
      caption: 'The Nest of Ash',
      text: `The stone is the size of a goose egg, but it is not a stone. You see that when you lift the wreath: the surface is veined with a pulse of dull orange, and it's *warm*, as warm as a living thing, and it ticks, faintly, like a clock a long way off.

In the nest of ash beside it, so still that you took it for a cracked rock, lies an egg. Not a goose's. A dragon's. Black and speckled with copper, the size of a sleeping child, banded with silver. When you lay your palm on it, a very faint answering pulse runs up your arm, once, twice, three times. A heartbeat.

"Do not touch it unless you mean to," says Kharavel's voice from the far end of the hall, very gently. "It has waited a hundred years. It has waited for someone to *ask*."`,
      choices: [
        { text: 'Ask the dragon for the heartstone.', to: 'hoard_ask', if: [{ stat: 'bond', min: 3 }], lockedHint: 'She does not know me well enough to give it. (Bond 3)' },
        { text: 'Take the heartstone. Quickly.', to: 'hoard_steal' },
        { text: 'Lift the egg, gently, into your arms.', to: 'hoard_egg', if: [{ stat: 'bond', min: 4 }, { has: '_truth' }], lockedHint: 'It will not wake for a stranger. (Bond 4, and the truth)' },
        { text: 'Leave them both alone.', to: 'hoard' },
      ],
    },
    hoard_ask: {
      caption: 'Kharavel',
      give: ['heartstone'],
      effects: { heart: 1 },
      text: `You walk back into the hall with the stone cupped in your hands and ask, in the old way, with the question first. "May I?"

The dragon's eye regards you for a long time.

"Nobody has asked," says Kharavel. "Not in three hundred years. They take. It is a different gesture." Her tail moves slowly, like a ribbon. "Yes, bellringer. Take it. It was never mine to keep. It's the part of the fire that remembers how to *begin*."

The stone is hot, then warm, then a pleasant ache in your palms. It beats, faintly, in time with your pulse. Ten seconds later you realise that you are smiling.`,
      choices: [{ text: 'Carry it back to the hoard.', to: 'hoard' }],
    },
    hoard_steal: {
      caption: 'The Heartstone',
      give: ['heartstone'],
      effects: { heart: -3, life: -1, bond: -2 },
      text: `It burns. You knew it would, and you took it anyway, and the pain runs up your arm in a hot red line. You bite your tongue to keep from crying out. The stone beats in your fist like a small furious animal. It does not want you.

A long, low, wounded sound from the Hearth Hall. Not a roar. Something worse. The sound of a very old creature watching a very young one make a very old mistake.

"I could have *given* it," says Kharavel's voice, a long way off, quite without anger. "That's what the asking is for."

You close your fingers over the stone, and it quiets, grudgingly, as an angry dog might. But there is something between you and the dragon now, thin and cold. Like the first frost.`,
      choices: [{ text: 'Go back. Do not look at her.', to: 'hoard' }],
    },
    hoard_egg: {
      caption: 'The Egg',
      give: ['egg'],
      effects: { bond: 2, heart: 2 },
      text: `You gather the egg into your arms. It is heavier than a child, and it purrs against your ribs like a kitten. It is the warmest thing you have ever held.

When you carry it out into the hall, Kharavel's head has come up from her forepaws. Her eyes are wide. The great jaw trembles.

"A hundred years," she says. "A hundred years of waiting for someone to pick it up. I'd laid it before I knew what I was doing, and I thought: *this will be the next one.* A Dragon who is *born*, not made. Who does not have to be a girl, or a man, or a mother's only child. Who is never *asked* to give up a life." Her voice cracks. "I never could keep it warm enough. It needs more than I have left."

She looks at you.

"If you would keep it warm, bellringer," says the dragon, "I would be more grateful than I can say."`,
      choices: [{ text: 'Cradle it closer. "I will."', to: 'hall_hub' }],
    },
    heartfire: {
      scene: '🔥🌋🕯️',
      caption: 'The Heartfire',
      text: `The corridor drops steeply, in rough steps, into a heat like an open hand. The walls shine, red-black. Around the third turning you cannot see your feet. Around the fifth you can smell your hair.

At the bottom is a chamber the size of a chapel, and in the middle of it, in a well of black glass, is a fire.

It is not like any fire you have seen. It is white, bright, slow, almost solid, like molten pearl, and it does not flicker. It *breathes*. Each pulse of it is a note, deep and warm and calm, and you realise that it is the same note that answered the bell. The valley's heat is here, in this one small, patient flame.

Standing on its brim, you know three things. That it will hurt. That it would not be a dying. And that it is asking.`,
      choices: [
        { text: 'Step into the Heartfire.', to: 'become_ritual' },
        { text: 'Hold the heartstone to the flame.', to: 'become_stone', if: [{ has: 'heartstone' }], lockedHint: 'I have nothing to offer it.' },
        { text: 'Climb back to the hall.', to: 'hall_hub' },
      ],
    },
    become_stone: {
      caption: 'The Heartstone',
      text: `The stone flares in your hand. The Heartfire leans toward it, like a flower to a lamp. For a long moment, the two of them *speak*, wordlessly, a flare and an answering flare, and you realise you are only the hand in which they meet.

"Be sure," says the fire. You have no better word for it. It's inside your head, in your breastbone. "Be sure of what you want."

You see the ones who've stood here before. A shepherd girl. A woman with ink-black hair. A boy no older than sixteen, shaking, his hands over his face. Each one with a different reason. Each one with a different fear.

You wonder what yours is.`,
      choices: [{ text: 'Step in.', to: 'become_ritual' }],
    },
    become_ritual: {
      caption: 'The Asking',
      text: `You step into the fire.

It does not burn. That's the thing no one tells you. It is simply *large*, larger than you, a warmth the size of a world, and it opens around you like an enormous hand, and for a second you are every one of the Dragons who ever lived: the shepherd, the ink-haired woman, the boy, the old man who wanted only to be left alone. You feel them in your bones.

"What do you want?" the fire asks.

You have time to think of the valley. Of Orrin's hands. Of the child's crayon on the wall of the hoard. Of the snow stopping politely at the treeline. Of everything you will have to give up.

You think, absurdly, of Gran Mothe's song. *Who keeps the fire? Who keeps the snow?*

"I do," you say.`,
      choices: [
        { text: 'Say yes. Be the fire for the valley\'s sake.', to: 'end_become', if: [{ stat: 'heart', min: 5 }, { stat: 'bond', min: 3 }], lockedHint: 'The fire does not trust me enough to say yes. (Heart 5, Dragon bond 3)' },
        { text: 'Say yes. Be the fire, for yourself.', to: 'end_hoard' },
      ],
    },
    alis_stand: {
      scene: '🛡️⚔️🔥',
      caption: 'Ser Alis Brightwater',
      text: `The great doors have been broken inward. Twelve knights stand in the breach, torches in their hands, helmets down. Their breath smokes in the heat of the hall. In front, with Lament drawn and a face like a cut stone, is Ser Alis. Behind her, a little to one side, with a thin silver cage in his hands, is Brother Anselm Voss.

"The bell was rung," says Alis. "I waited till sunrise. Longer." She is looking at the dragon, and the dragon is looking at her, and for a moment they seem the only two creatures in the world. "She did not attack you."

"No."

"Then she is not what I was told." The sword does not lower. It trembles, very slightly, in her hand. "I need you to tell me *what she is*, bellgirl. Quickly. Before the Brother does."

"The beast is a danger to the Crown!" calls Anselm, in a clear, pleasant, carrying voice. "A thousand crowns, Ser Alis. A thousand crowns and a king's life."

The torches shake. Somebody is going to move.`,
      choices: [
        { text: 'Tell Alis the truth. Show her the scroll.', to: 'persuade_alis', if: [{ has: 'scroll' }], lockedHint: 'I would need something to prove it. (Hob\'s scroll)' },
        { text: 'Tell Alis the truth. Show her the hoard\'s letters.', to: 'persuade_alis', if: [{ stat: 'heart', min: 7 }], lockedHint: 'I would need her to believe me. (Heart 7)' },
        { text: 'Ask Alis to lend you Lament.', to: 'take_lament', if: [{ stat: 'honor', min: 5 }], lockedHint: 'She does not trust me with it yet. (Knights\' regard 5)' },
        { text: 'Snatch Lament from her hand.', to: 'snatch_lament' },
        { text: 'Retreat into the hall.', to: 'hall_hub' },
      ],
    },
    persuade_alis: {
      caption: 'Ser Alis Brightwater',
      give: ['_alis_ally'],
      effects: { honor: 2, heart: 1 },
      text: `You talk fast and you do not look at Anselm. You tell her what Hob read, and what Kharavel said, and what is carved on the stone at Ember Falls. About the winter that waits behind the mountain, and the fire that is not the dragon's own. About the twelfth plinth, empty, among the ashen trees.

Alis listens as she must have listened to a hundred battle reports. When you finish, she is silent. Then she turns to look at the dragon, properly, for the first time.

"I have dreamed of you for two years," she says to Kharavel, in a low, rough voice. "I thought you would be larger."

"I am," says the dragon dryly. "You are merely very brave."

For the first time, Alis laughs. It is a surprised, cracked sound, like a rusty hinge. She sheathes the sword. The ring of torches behind her wavers, uncertain, like candles at a funeral.

"Lower them," she says. "All of you. That's an order."`,
      choices: [{ text: 'Turn to Brother Anselm.', to: 'anselm_unmask' }],
    },
    anselm_unmask: {
      caption: 'Brother Anselm Voss',
      text: `The priest has not moved. He has the silver cage in both hands, and the smile has gone from his face in a way that makes you suddenly sorry for the smile. The whole long, courteous, reasonable, wholesome man has gone out of him like air from a bladder.

"A *shepherd*," he says. "A *job*." He laughs. "Do you know what it is to hold a king in your arms while he screams? To hear that there is a cure and it is a fifteen minute ride up a hill? And a pack of children and old women tell you it's *unkind*?"

He moves faster than you would have believed. In three steps he is past the knights, past you, a thin steel blade out of his sleeve, running for the nest of ash at the end of the hoard where the heartstone is, and he is *quick*, so quick, and he is going to reach it.`,
      choices: [
        { text: 'Hurl the bell at his head.', to: 'anselm_bell', if: [{ has: 'bell' }], lockedHint: 'I have nothing to throw.' },
        { text: 'Shout for Ser Alis.', to: 'anselm_dead' },
      ],
    },
    anselm_bell: {
      caption: 'Brother Anselm Voss',
      effects: { honor: 1, bond: 1 },
      text: `The bell leaves your hand before you know you've thrown it. It's small and heavy and it turns in the red light, and takes Brother Anselm in the temple with a sound like a dropped plate.

It *rings*. A single, clear, absurd note, which rolls out through the Hearth Hall, and on its heels, as if it was waiting, a deep answering toll from somewhere beneath your feet.

Anselm sits down, quite gently, in the ash. Ser Alis is on him in two strides, the blade at his throat. The dragon has not moved. She has only opened one eye, very slightly, in the way an old woman will watch a child drop a cup.

"I think," says Kharavel, "that is enough of that."`,
      choices: [{ text: 'Breathe. The danger is over.', to: 'treaty_plan' }],
    },
    anselm_dead: {
      caption: 'Brother Anselm Voss',
      effects: { life: -1, honor: 1 },
      text: `Alis's sword takes him in the shoulder, short of the nest, just as his fingers close on the stone. Lament does not kill. It *notes*. The priest drops with a long, high cry, the silver cage rolling away across the floor, and Alis stands over him, shaking, her face pale.

"I did not want it to be a thing I had to do," she says to nobody.

Brother Anselm has not stopped smiling. His teeth are red. "You'll see," he says. "You'll see what the winter is."

He is taken out by two of his own knights, none of whom look at him. The silence they leave behind has a shape. After a long time, Ser Alis lowers the sword and turns, with a face like a wall that has begun, slowly, to give way.`,
      choices: [{ text: 'Go to her.', to: 'treaty_plan' }],
    },
    treaty_plan: {
      scene: '🖋️📜🐉',
      caption: 'The Treaty',
      text: `A hundred hours of stone and steam and nothing to say. They sit, on the warm floor of the Hearth Hall, the dragon and the knight, with a girl and a goblin between them (Hob, it turns out, has followed all the way up the Stair, carrying a ream of paper and shouting about the Appendices).

It is Hob who writes it. Ser Alis, who has more authority than anyone alive to speak for the Duke's name, dictates. Kharavel listens. You ring the bell, softly, at each clause, and the dragon rings back.

*One: the Crown shall make no war on Ashmoor, nor tax the tithe of bells. Two: the valley shall send a Bellman each year, and a Warden when the need is known. Three: the dragon shall keep the fire, for as long as the fire is hers to keep, and her death shall be honoured with a feast and a thousand candles. Four: all that is in the hoard shall remain in the hoard.*

It is signed with a quill, a claw, and a sword.`,
      give: ['charter'],
      choices: [{ text: 'Carry it down the mountain.', to: 'end_treaty', if: [{ has: '_alis_ally' }] , lockedHint: 'The knights will not honour it without Ser Alis\'s word.' }, { text: 'Look in on Kharavel once more.', to: 'hall_hub' }],
    },
    take_lament: {
      caption: 'Lament',
      give: ['lament'],
      effects: { honor: 1 },
      text: `Alis looks at you for a long time. Then, deliberately, she turns the sword in her hand and holds it out, hilt first.

"I do not know what I am doing," she says. "I do not know if I am a fool. I am, however, very tired. If you are going to do this, do it yourself. I'll not have it on my name."

The hilt is cold as a bell. It *listens*. When your hand closes on it there's a faint sigh in the steel, like a hound that has been waiting for its master. Somewhere behind your eyes, a small, old, pleasant memory (the smell of your mother's kitchen on a Tuesday) goes out like a candle.

You have a sword now. You have not yet decided what to do with it.`,
      choices: [
        { text: 'Face the dragon.', to: 'slay_duel' },
        { text: 'Hand it back.', to: 'alis_stand' },
      ],
    },
    snatch_lament: {
      caption: 'Lament',
      give: ['lament'],
      effects: { heart: -2, honor: -3, life: -1 },
      text: `You hit her in the wrist with the flat of the bell, and the sword leaves her hand. It is a vile, quick, shameful thing. The sword hums in your grip. A very old, very hungry thing wakes in the steel and sniffs the air.

"*Girl*," says Ser Alis, in a flat, terrible voice. She does not draw her dagger. She does not have to. Behind her, the twelve knights have levelled their spears at you.

"I am sorry," you say, and are. "I'm sorry. But I have a reason."

"Then you had better be right," says Alis. And, in a very low voice, so that nobody else hears: "I hope she was worth it."

The mountain has gone silent around you.`,
      choices: [{ text: 'Turn to face the dragon.', to: 'slay_duel' }],
    },
    slay_duel: {
      scene: '⚔️🐉🔥',
      caption: 'The Hearth Hall',
      effects: { life: -3 },
      text: `She does not rise. That is the thing that undoes you. You walk up the long red hall with the sword in your hand, step by step, and Kharavel only watches, her great head turning slowly to follow. Her wings are folded. Her tail is still. When you stop, a spear's length away, she sighs.

"So it is the sword," she says. "I wondered which of you would find it." There's no fear. There is a tiredness so profound that it is almost a kind of kindness. "I have been Dragon for three hundred years. I should like to say a few words to you. Would that be permitted?"

You do not answer.

"It would be an honour to be killed by someone who has read my letters," says Kharavel. "That is all. But if you are to do it, do it cleanly. The sword has been waiting for me for a very long time. It would not be right to make it wait longer."

The fire is under her breastbone, a faint, fluttering glow, just there, just where the scales are dull. It is so easy to see.`,
      choices: [
        { text: 'Strike for the heart.', to: 'slay_blow' },
        { text: 'Lower the sword. You cannot.', to: 'hall_hub' },
      ],
    },
    slay_blow: {
      scene: '⚔️💥🌨️',
      caption: 'The Blow',
      text: `The sword goes in like a key into a lock.

There is no scream. There is only a long, deep, dreadful note, a bell struck once and let go, and a light like a sunrise rising out of the dragon's breast. It floods up the walls. It streams through the hall, through the roof of the mountain, up into the white dawn sky, and for a moment every window in every house in the valley glows gold.

Then it turns. It comes for you. You have time to understand why the ones before you were called Wardens, and why Lament has to forget, and why a fire that is not asked to come will always come anyway. It enters you like a river. Everything that you are, the small and the stubborn, the girl with a bell, goes soft and white.

When it is done, the dragon is a long, dim shape of copper scale and silence. You are standing over her. You are shaking. You are, by every account, the Dragonslayer.

And the fire, in your chest, is *yours*, though you did not want it.`,
      choices: [{ text: 'Go to the doors. The knights are waiting.', to: 'end_slayer' }],
    },
    egg_plan: {
      caption: 'The Egg',
      text: `You set the egg in the nest of ash at the heart of the Hearth Hall, where the magma river runs warmest, and lay the heartstone against its side. It pulses against the shell, answering, a slow soft duet of two beats. The dragon drags herself over, wearily, and curls around them both like a great copper wall.

"It will take nine days," she says. "Maybe more. It needs a hand on it. A *living* hand, not mine, mine is too hot. And someone must keep the knights from the door."

You look at the doors, and the torches beyond them. At the little goblin sitting, spectacles misted, in a pile of manuscripts, writing furiously. At the long dark tunnel that leads down to the Heartfire.

"I'll do it," you say.

You sit beside the egg and lay both hands on the shell.`,
      choices: [{ text: 'Keep the vigil.', to: 'egg_vigil', if: [{ has: 'egg' }, { has: 'heartstone' }], lockedHint: 'I have no egg, or nothing to warm it with.' }, { text: 'Not yet. Return to the hall.', to: 'hall_hub' }],
    },
    egg_vigil: {
      scene: '🥚🔥🌌',
      caption: 'The Vigil',
      text: `Nine days.

You do not sleep much. You sit beside the egg and sing to it, whatever comes into your head: Gran Mothe's song, a lullaby your mother sang, a bawdy ballad you learned at the Harvest Fair. Hob reads to it from the Aegean Appendices. Ser Alis, who has left the knights outside the doors and stationed herself in the breach, gruffly teaches the squire a game of dice. Kharavel sleeps, and each day she sleeps more, and each day she is lighter in her scales.

On the seventh night the egg *moves*. A faint rocking, a dull tap, tap against the inside of the shell.

On the ninth morning, with the first red light of dawn coming through the broken doors, the shell splits down the middle with a sound like a small, delighted sneeze.`,
      choices: [{ text: 'Reach out your hands.', to: 'end_egg' }],
    },
    end_treaty: {
      scene: '🕊️🏔️🌷',
      text: `Spring comes early to Ashmoor that year, and stays.

The Treaty of the Bell is read out in the square at Harrow's Rest, the first of ten thousand times. It takes three hours. At the end of it, old Gran Mothe stands up, tiny and straight, and says, in a voice like a cracked cup: "Well, that's *lovely*." Then she begins, to everyone's astonishment, to dance.

The knights go home. Ser Alis stays for a year, then two, and her nightmares stop, and she remembers, a little at a time, the names she lost. She never quite explains how. You ring the bell on the first frost, and every year, from deep in the mountain, a deeper note rings back.

Kharavel dies on a warm spring morning, eleven years later, in the sun, with her head on your knee and a thousand candles burning on the stair. She is not afraid. She says, in her dry rolling voice, "It was a good fire." In her last breath, a pulse of white light runs down into the roots of the valley, and the whole of the orchard blossoms at once.

The twelfth plinth, in the Ashen Wood, is empty. But the mountain, you find, is warm. A girl comes up the Stair that same year, a very small, very serious girl with a wooden bird. She wants to know whether the dragon is still there.

"I think," you say, "that she is *asking*."`,
      ending: { title: 'The Treaty of the Bell', kind: 'good', score: 900 },
    },
    end_become: {
      scene: '🐉🔥🌅',
      text: `It does not hurt. That is the great lie of every story you were told. It is simply a *becoming*, slow and enormous, as a tide comes in. You feel your bones lengthen and your arms go long and your breath turn warm and your small, human, certain name settle at the bottom of you like a stone at the bottom of a well.

Kharavel is beside you. She is smiling, in the way that dragons smile, with her whole huge face. "Thank you," she says. "Oh, thank you, child. It is a lovely thing to be asked." She lays her head on the stone, and it is as if a very large weight has, at last, been lifted from her. She breathes out, once, softly, and does not breathe in.

You hold the winter off. For forty years, for four hundred. You learn that the fire is a song, and the valley the verse you sing it in. You hear the bell on the first frost, each year, a new ringer on the Stair, and you answer it, once, from inside the mountain.

*I am still here*, you say. *Are you?*

You are never alone, quite. There is always a candle on the cairn.`,
      ending: { title: 'The Warden of Ashmoor', kind: 'neutral', score: 600 },
    },
    end_slayer: {
      scene: '🏆❄️🏰',
      text: `They crown you in the square at Harrow's Rest with a wreath of orchard flowers and a thousand crowns. They call you Dragonslayer. Ser Alis stands at the edge of the crowd, saying nothing, with the face of a woman at a funeral.

The Duke makes a very long speech. The hoard goes to the Crown. The villagers cheer, and cheer a little less, and are quiet.

It is the fire that is the trouble. You carry it in your breast and it is *wrong*, a flame in a vessel not made for it, and each year it burns lower. The springs run cooler. The orchards bloom a week later. Gran Mothe is the first to die of the cold. There is frost on the Stair in October. A single snowflake in the village square, in April, falls into the well, and the whole crowd stops to watch it.

On the twelfth year, a winter that never ends comes down from the mountain, politely, in a line drawn with a ruler. You climb the Stair with a bell in your hands and stand at the doors. You ring. Nothing answers.

You are the Dragonslayer. It is the whole of what you are. The statue at the foot of the Stair, when they put it up, has no inscription.`,
      ending: { title: 'Dragonslayer', kind: 'bad', score: 200 },
    },
    end_hoard: {
      scene: '💰👑🐲',
      text: `It's so easy. It's such a relief. The fire is wonderful, golden and enormous, and you are the sort of person who will never need to ask anything again.

You are a Dragon. The mountain is yours. The fire is yours. The gold, you notice, is a very pretty thing, and the valley's bells are a very annoying one. Every first frost, a trembling old man comes up the Stair, and rings and rings, and you do not answer. It is not your *business* to answer.

You take, in time, the sheep. And then the villages. And then, one fine spring morning, a duke. A great many knights come, with a great many swords, and you eat them in turn, and the fire inside you burns so hot, so bright, that you can no longer remember the girl with the bell, and then no longer remember that you should.

Deep in the hoard, in a nest of black ash, a very faint, very patient tick, tick, tick goes on in a stone you no longer notice. It is not for you. It never was.

The twelfth plinth in the Ashen Wood is empty. The thirteenth is not. It is a very large statue indeed, and it has your face.`,
      ending: { title: 'The Hoard-Mind', kind: 'bad', score: 100 },
    },
    end_burned: {
      scene: '🔥💀🌋',
      text: `The heat catches you in the throat. It is the stupidest way to go, you think, as the world goes bright and soft and very far away: not a duel, not a sacrifice, not even a speech. Only a girl in a hot room, who has been walking for three days, and who has run out of whatever it is that keeps a person upright.

You sit down. The stones are warm. A very long way above you, a dragon is saying something, and a small voice in the back of your head, Orrin's, says *you never were any good at speeches*, and you laugh.

The valley is told that the bellringer's apprentice was lost on the mountain. The Duke's knights find nothing but a bronze bell, green at the lip, on a ledge by the stair, and the Dragon, who does not come out for forty years.

On the first frost of each autumn, someone rings the bell. And every year, from deep inside the mountain, someone answers.

It is a small thing. But it is the whole of the law.`,
      ending: { title: 'The Fire Takes Its Own', kind: 'bad', score: 150 },
    },
    end_egg: {
      scene: '🥚🐲🌅',
      text: `The hatchling is the size of a cat, and the colour of a coal when you blow on it. It has Kharavel's gold eyes, and your hands, which it has decided are a thing to be chewed. It sneezes a small blue flame. It sets Hob's beard alight. Hob, shrieking, rolls about in the Aegean Appendices, which are fireproof, as it happens, *obviously*, he'd always said so.

Kharavel does not see it grow. She sees it hatch. She turns her great head to look at the little thing sneezing and tumbling in the ash, and something in her face lets go, utterly, like a knot slipping. "Oh," she says. "Oh, look. It wasn't *asked*." Her eyes are full. "It wasn't asked to give anything up."

She dies that evening, in the sun, with the valley's lanterns climbing the Stair, ten thousand tiny lights, to say goodbye. The fire does not go out. It simply moves, quietly, softly, as a candle passes to another candle, into the small warm creature curled in your arms.

You do not have to give up your name. Nobody has to give anything up. The Heartfire, it turns out, was never meant to cost a life. Only a promise, and a long attention, and someone to teach it the song.

On the twelfth plinth in the Ashen Wood there is a small copper figure, now, the size of a cat. It has Hob's spectacles on its nose. Nobody can say who put them there.`,
      ending: { title: 'The Hatching', kind: 'secret', score: 1200 },
    },
  },
} satisfies Story

export default story
