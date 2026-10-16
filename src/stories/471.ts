import type { Story } from './types'

const story: Story = {
  id: 471,
  title: 'Letters from War',
  blurb:
    'In a country at war with its neighbour, Mirel Dray, a village schoolteacher, tucks a note into a knitted sock. A soldier on the Ridge writes back. Over a year of letters you choose what she says, what she sends, and what she is willing to hear.',
  items: {
    flower: '🌼 Pressed blue gentian',
    seeds: '🌱 Gentian seeds',
    scarf: '🧣 Wool scarf',
    tea: '🫖 Tin of tea',
    primer: '📘 Reading primer',
    pass: '🎫 Depot travel pass',
    _knew: 'knew about the hand',
    _hospital: 'visited hospital',
    _promise: 'made a promise',
    _depot: 'worked at depot',
  },
  stats: {
    bond: { label: 'Closeness', emoji: '💞', start: 2, min: 0, max: 10 },
    trust: { label: 'Trust', emoji: '🤝', start: 5, min: 0, max: 10, onMin: 'end_cold' },
    spirit: { label: 'His spirit', emoji: '🪖', start: 4, min: 0, max: 10, onMin: 'end_silence' },
  },
  start: 'start',
  nodes: {
    start: {
      scene: '🧶🏫🌨️',
      caption: 'Hollin, the Thaw of the second year of the war',
      text: `The war is a long way from Hollin. You know this because the church bell still rings on time, and the bakery still sells bread, and the children still arrive at your schoolroom with ink on their noses.

But the war is in everything else. In the empty chairs. In the weekly lists nailed up in the square. In the knitting circle that meets on Thursday evenings, where thirty women make socks for men they have never met, and say nothing about why their needles click so fast.

You are Mirel Dray. You are twenty-six. Your brother Joss has been on the Ridge for eleven months, and his last letter was a postcard that said only *Alive. Cold. Love, J.*

Tonight you finish a pair of grey socks. They are not good socks. The heel is lumpy.`,
      choices: [{ text: 'Slip a note into the toe.', to: 'note' }],
    },
    note: {
      scene: '✍️🧦🕯️',
      text: `The Comfort Committee says that notes are allowed, if they are short and cheerful and say nothing about the war.

You hold your pen over a scrap of paper for a long time. You have, in your head, a hundred lines you could write. *Keep warm.* *We are thinking of you.* *God keep you.*

They all sound like the front of a card.

In the end you write something quite different, and fold it very small, and push it down into the toe where the wool is thickest.

You do not tell anyone what it said. You are not certain yourself why you wrote it.`,
      choices: [
        { text: '*The heel is lumpy. I am sorry. Walk anyway.*', to: 'l1', effects: { spirit: 1 } },
        { text: '*Whoever you are, I hope you are warm.*', to: 'l1', effects: { bond: 1 } },
        { text: '*If you write back I will tell you what the children say about your war.*', to: 'l1', effects: { trust: 1 } },
      ],
    },
    l1: {
      scene: '✉️❄️🏔️',
      caption: 'Letter 1 · from Anselm Varga · Field Post 14',
      text: `Eight weeks later a grey envelope arrives with a stamp that has been struck three times, as if the postmaster could not believe it.

Inside is a flat, pressed flower the colour of a bruise, and a sheet of army paper, covered in a neat, upright hand.

*Dear Miss Dray, I am told by the sergeant that your name is on the label of the socks. I am Corporal Anselm Varga, Fourth Foot, Field Post 14. I thank you for the socks.*

*The heel is not lumpy. It is exactly the shape of my heel. I do not know how you knew.*

*I send you a flower from the Ridge. It is a gentian. It grows between the stones where the guns have not been. It is the only blue thing here.*

*Yours, with respect, A. Varga.*`,
      give: ['flower'],
      choices: [
        { text: 'Write back warmly.', to: 'r1_warm', effects: { bond: 1 } },
        { text: 'Write back politely, but briefly.', to: 'r1_dry', effects: { trust: 1 } },
        { text: 'Write back with a joke about the lump.', to: 'r1_joke', effects: { spirit: 1 } },
      ],
    },
    r1_warm: {
      scene: '✍️🏫🕯️',
      caption: 'Your reply',
      text: `*Dear Corporal Varga,*

*I am so glad. I knit them badly for forty-three men before yours, and I never hear. You are the first to say anything, and you have said the kindest thing.*

*The flower is pinned to my schoolroom wall. The children want to know what it is. I told them it was a piece of the sky that had fallen on a mountain.*

*Please write again, if you can. Tell me about the Ridge. I should like to know what it looks like. I am afraid of it, and I want to know what to be afraid of.*

*Mirel Dray*

You post it the same afternoon. Your hands tremble slightly at the slot.`,
      choices: [{ text: 'Wait.', to: 'l2' }],
    },
    r1_dry: {
      scene: '✍️📮🏫',
      caption: 'Your reply',
      text: `*Dear Corporal Varga,*

*Thank you for your letter. I am pleased the socks fit. The flower is a lovely gift, though I fear it is rather more than the Committee permits.*

*Wishing you the best of health, Mirel Dray, Hollin*

You read it over. It is perfectly correct. You could not say why it makes you feel as if you had shut a door softly in a stranger's face.

You post it anyway.`,
      choices: [{ text: 'Wait.', to: 'l2' }],
    },
    r1_joke: {
      scene: '✍️😄🧦',
      caption: 'Your reply',
      text: `*Dear Corporal Varga,*

*I am delighted. The Hollin Comfort Committee will be informed that the heel was not lumpy, and will be disappointed, since they said it was and that I would never be a knitter.*

*I am a schoolteacher. If the lumps were an arithmetic error, I should be mortified.*

*The flower is on my wall. Thirty-one children believe it is a fairy's hat. I have not corrected them.*

*Write again, if the sergeant allows it. M. Dray*

You grin the whole way to the post box. It has been a long while since you grinned.`,
      choices: [{ text: 'Wait.', to: 'l2' }],
    },
    l2: {
      scene: '🏔️🔥🎶',
      caption: 'Letter 2 · from Anselm · the Ridge',
      text: `*Dear Miss Dray,*

*The Ridge is a long hill like a sleeping dog, and we live in its fur. Our dugout has a roof of planks and a floor of mud that never dries. We have a stove the size of a bread tin. When it rains the roof speaks.*

*I will tell you who is here. The sergeant, who is called Gorse because of his temper. A boy called Tam, who is sixteen and lies about it. And Pavel Orlin, who is my friend and the only man in the regiment who can make the stove laugh.*

*Pavel plays a mouth organ. He plays it badly and does not mind. At night, when the guns are quiet, we make him play something sad and then throw our boots at him.*

*Tell me about Hollin. I have never been anywhere but the farm and the line. Tell me what is ordinary.*

*A.*`,
      choices: [
        { text: 'Tell him about the schoolroom.', to: 'r2_school', effects: { bond: 1 } },
        { text: 'Tell him about your brother Joss, missing on the Ridge.', to: 'r2_joss', effects: { trust: 1, bond: 1 } },
        { text: 'Tell him a funny story and keep the rest back.', to: 'r2_funny', effects: { spirit: 1 } },
      ],
    },
    r2_school: {
      scene: '🏫🍎✏️',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*May I call you that? You wrote A., and a letter without a name is a door without a house.*

*Ordinary is a hard thing to describe. It is a bell on Sunday. It is Mr. Harl at the bakery shouting that the loaf was baked this morning when it was baked yesterday. It is a boy called Fenn who can multiply anything by seven but cannot hold a pen without eating it.*

*It is thirty-one children in a room that smells of chalk and wet wool, chanting the days of the week. They have just learned Wednesday. They are very proud.*

*I do not know whether this is what you wanted. It is all I have.*

*Mirel*`,
      choices: [{ text: 'Wait.', to: 'parcel' }],
    },
    r2_joss: {
      scene: '🕯️📷💔',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I will tell you something I tell nobody. My brother Joss is somewhere near you. He is nineteen and he is stupid and kind and he once carried a hen to church because it looked lonely. He was on the Ridge at the end of the Plough. He has not written since.*

*If you meet a lad with my chin and a cough, tell him to write to his sister. Tell him I will not scold. Or I will scold, but only for ten minutes.*

*I am sorry. You did not ask for a sad letter.*

*Mirel*

You read it over three times before you seal it.`,
      choices: [{ text: 'Wait.', to: 'parcel' }],
    },
    r2_funny: {
      scene: '🐔🏫😂',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*Ordinary is a goat. Last week the Reverend's goat got into the schoolroom, ate the register and half the Book of Psalms, and was found in the vestry, asleep, with the Fourteenth Psalm on its beard.*

*Mr. Harl wishes to know whether the goat may be sent to the front. He says it has a very warlike digestion.*

*I hope this finds you well. I do not ask about the Ridge, since you are probably tired of being asked. I will ask about the stove instead. How is it? Has it laughed lately?*

*Mirel*`,
      effects: { spirit: 1 },
      choices: [{ text: 'Wait.', to: 'parcel' }],
    },
    parcel: {
      scene: '📦🧶🏫',
      caption: 'The parcel',
      text: `The Committee will carry a parcel up to the line once a month. Ten pounds, no more, nothing that spoils, nothing sharp.

You lay things out on the kitchen table and look at them as if they might answer.

A scarf, in good grey wool, knitted late into the night. A tin of black tea from the shop, which is not allowed, so you have pressed it under the lid of a tin of boot polish. A packet of the blue gentian seed that old Mrs. Ketter saves every autumn and says is no use to anyone.

And an old reading primer from the schoolroom, its corners worn soft. You do not know why you have put it out. It was lying on the shelf.

You can send two. The weight will not allow three.`,
      choices: [
        { text: 'Send the scarf.', to: 'parcel2', give: ['scarf'], effects: { spirit: 1 } },
        { text: 'Send the tea.', to: 'parcel2', give: ['tea'], effects: { spirit: 1 } },
        { text: 'Send the seeds.', to: 'parcel2', give: ['seeds'], effects: { bond: 1 } },
        { text: 'Send the primer.', to: 'parcel2', give: ['primer'], effects: { trust: 1 } },
      ],
    },
    parcel2: {
      scene: '📦🪢🏫',
      text: `You tie the string. It is not enough, so you tie it again.

One more space remains in the box. Your hand hovers over the table.`,
      choices: [
        { text: 'Add the scarf.', to: 'l3', give: ['scarf'], if: [{ not: 'scarf' }], effects: { spirit: 1 } },
        { text: 'Add the tea.', to: 'l3', give: ['tea'], if: [{ not: 'tea' }], effects: { spirit: 1 } },
        { text: 'Add the seeds.', to: 'l3', give: ['seeds'], if: [{ not: 'seeds' }], effects: { bond: 1 } },
        { text: 'Add the primer.', to: 'l3', give: ['primer'], if: [{ not: 'primer' }], effects: { trust: 1 } },
        { text: 'Close the box. That is enough.', to: 'l3' },
      ],
    },
    l3: {
      scene: '📦🔥🌌',
      caption: 'Letter 3 · from Anselm · the Ridge',
      text: `*Dear Mirel,*

*The parcel came yesterday, in the middle of an alarm, and Gorse wanted to make me drop it in the trench. I told him it was my mother's. He is a fierce man but he is not a monster. He looked at the writing on the label and gave me a minute.*

*I will not tell you what I felt when I opened it. It would be foolish. I will say only that Pavel looked at me and put away his mouth organ without a word.*

*We have orders. I cannot say where. There will be a push on the Ridge in a fortnight. We have been told to write what we want to say.*

*I find that I do not know what I want to say. Only that I wish I had known you earlier.*

*Anselm*`,
      effects: { spirit: 1 },
      choices: [
        { text: 'Be brave for him. Tell him you will be here.', to: 'r3_brave', effects: { spirit: 1, bond: 1 } },
        { text: 'Be honest. Tell him that you are afraid too.', to: 'r3_honest', effects: { trust: 2 } },
        { text: 'Copy out a poem your mother loved.', to: 'r3_poem', effects: { bond: 2 } },
      ],
    },
    r3_brave: {
      scene: '✍️🌟🏫',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I will be here. That is the only thing I can promise you, and I will keep it. The school will be here, and the bell, and a lamp in the window on Thursday nights.*

*You need not say what you want to say. Say it when you are home, over a cup of Mr. Harl's terrible tea.*

*You will find, when you get home, that I am not at all as brave as this letter. It is my best coat. I wore it for you.*

*Mirel*`,
      choices: [{ text: 'Wait through the winter.', to: 'l4' }],
    },
    r3_honest: {
      scene: '✍️🕯️😟',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I am frightened. I did not know I could be so frightened of something so far away. I wake at four and listen for the guns, though they are three hundred miles off. I think: now. And then: now.*

*I do not think this makes me weak. I think it is what it costs to care.*

*I will not tell you to be careful, since you cannot be. I will tell you instead that I am keeping every letter in a biscuit tin under my bed, and that if you do not write, I shall come and find you, and I am not a quiet woman when I am angry.*

*Mirel*`,
      choices: [{ text: 'Wait through the winter.', to: 'l4' }],
    },
    r3_poem: {
      scene: '✍️📖🌙',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I have no words of my own tonight, so I send you my mother's. She knew it by heart and said it on the stairs when I was small.*

*"The hills do not forget the snow,*
*The sea remembers every sail,*
*And you who travel far from home*
*Are carried in a lantern's tale."*

*I am not sure what it means. She said it meant: someone is waiting. I think that is enough.*

*Mirel*`,
      choices: [{ text: 'Wait through the winter.', to: 'l4' }],
    },
    l4: {
      scene: '❄️🕯️🏔️',
      caption: 'Letter 4 · from Anselm · the Frost',
      text: `*Dear Mirel,*

*The push has been put off, and we live in a white country now. The snow comes in sideways. In the morning the stove has a crown of ice, and Tam, who is a child, is sleeping in my coat because he has none.*

*I have been thinking about your poem. It says the sea remembers every sail. I have never seen the sea. I think of it as a large blue field with a ship in it like a plough. I do not know if I am right.*

*A strange thing happened. A man we thought was dead walked into our line from the east, with a broken arm and a chicken under the other. He says he was a prisoner and the chicken was a gift from his guards. We did not ask.*

*I wonder what kind of man gives a prisoner a chicken. I wonder if it was the same man that dug the trench opposite. It is a thing I have begun to wonder.*

*Anselm*`,
      choices: [
        { text: 'Reply, and gently ask about the wondering.', to: 'r4_wonder', effects: { trust: 1, bond: 1 } },
        { text: 'Reply, but let it go. Ask about Joss instead.', to: 'r4_joss' },
      ],
    },
    r4_wonder: {
      scene: '✍️🕊️❄️',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*It is not a strange thing to wonder. I have been wondering about it too, but it was easier to wonder in the schoolroom than on the line.*

*There is a boy in my class whose father is in the Northern Army. He is the quietest child I have ever taught. The others do not speak to him. I put him next to Fenn, who is too busy eating pens to be cruel.*

*I think wondering is the first thing that gets lost in a war. I would very much like you to keep yours.*

*I am enclosing a pencil. Use it to write your name on something that is yours.*

*Mirel*`,
      effects: { spirit: 1 },
      choices: [{ text: 'Wait.', to: 'hand' }],
    },
    r4_joss: {
      scene: '✍️❄️📷',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*Thank you for the chicken. I did not know what to say to the rest, so I have said nothing, and I hope that is allowed.*

*Is there any word of Joss? I asked the depot clerk and he said the lists were months behind. I think about him in the snow. He hates the cold. He used to wear two hats to the pump.*

*Mirel*

You read it again and see that it is the shortest letter you have written. It is also the one that took longest.`,
      effects: { trust: -1 },
      choices: [{ text: 'Wait.', to: 'hand' }],
    },
    hand: {
      scene: '🔍✉️🤔',
      caption: 'The letters',
      text: `That evening you lay the four letters out on the kitchen table, side by side.

You are a schoolteacher. You know handwriting the way a farmer knows weather. The first letters are round, upright, the capitals strangely perfect, a clerk's copperplate.

The fourth has changed. The slant is sharper. The *t* has a lazy crossbar. And there are words in it, *crown of ice*, *a plough in a field*, that do not sound like the clipped, earnest voice of the first.

It is a different hand. You are almost sure. Not an imitation. Two people, one name.

You put a finger on the paper and feel the small dent of a pen pressed hard, by someone who was angry at the page.`,
      choices: [
        { text: 'Write and ask him plainly.', to: 'ask_hand', effects: { trust: 1 } },
        { text: 'Say nothing. Wait and see.', to: 'ignore_hand', give: ['_knew'] },
      ],
    },
    ask_hand: {
      scene: '✍️❓🕯️',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I am going to ask you something, and I want you to know that no answer would make me think less of you.*

*Who writes your letters?*

*I teach children to write. I know what a hand looks like when it changes. The first three are not the same as the fourth, and I would like to meet the person who wrote them as well as the one who sent them.*

*Please tell me the truth. I would rather have that than any number of lovely sentences.*

*Mirel*

It is the hardest letter you have ever posted.`,
      choices: [{ text: 'Wait.', to: 'l5' }],
    },
    ignore_hand: {
      scene: '🕯️🤫✉️',
      caption: 'The kitchen',
      text: `You put the letters back in their tin. You tell yourself it is not your business.

But you notice, now. You cannot stop noticing. A line that is warmer than the rest, a joke that lands like a joke told by a man and not a boy. A kindness, in the middle of a paragraph about boot-laces, that makes you put down your pen.

You write the next letter and it is good, and kind, and false in one place: you pretend you have not noticed.

The lie sits in the envelope, and weighs nothing at all.`,
      effects: { trust: -1 },
      choices: [{ text: 'Wait.', to: 'l5' }],
    },
    l5: {
      scene: '✉️🎶🔥',
      caption: 'Letter 5 · from Pavel Orlin',
      text: `*Dear Miss Dray,*

*This is not from Anselm. I am Pavel Orlin, the one with the mouth organ. I am ashamed to be writing it, and shall be brief, since I am a better talker than writer and Gorse is beating on the door.*

*Anselm cannot read. Nor write. He never went to school: his father needed him on the farm. He asked me, after the socks, to write you a thank-you. Then you wrote back, and he asked me to read it to him. Then he asked me to write again.*

*I put in a few things of my own. The plough in a field is mine. The stove laughing. I have always been a thief of other men's feelings. But the rest is his. Every word. He says it aloud and I put it down, crying at the bad bits and shaking my fist at the good.*

*He does not know I am writing this. He would not forgive me. Please do not stop. He has nothing else.*

*P.O.*`,
      choices: [
        { text: 'Forgive them both, and say so.', to: 'r5_forgive', effects: { trust: 2, bond: 1 } },
        { text: 'Write to Anselm angrily. You have been deceived.', to: 'r5_angry', effects: { trust: -2, spirit: -2 } },
        { text: 'Thank Pavel. Ask him to keep writing, but to say it is him.', to: 'r5_both', effects: { trust: 1, bond: 1 } },
      ],
    },
    r5_forgive: {
      scene: '✍️💛🔥',
      caption: 'Your reply',
      text: `*Dear Anselm, and dear Pavel,*

*I know. Pavel has told me, and I am glad he did, because I was getting afraid I was in love with a pen.*

*I am not angry. A man who cannot write but who wants so badly to say something that he finds a friend to carry it for him is the very opposite of a liar.*

*Pavel, you are a thief and a poet. Keep stealing. Anselm, I should like to hear you say it in your own voice. You do not need to write it. Tell Pavel the words you want me to know, and let him put them down, and sign it with an X, and I will keep it for ever.*

*Mirel*`,
      choices: [{ text: 'Wait.', to: 'l6' }],
    },
    r5_angry: {
      scene: '✍️😠💔',
      caption: 'Your reply',
      text: `*Dear Corporal Varga,*

*I have been told who has been writing your letters. I find that I am not able to forgive being made a fool of. I have kept every one of them in a biscuit tin, and I now do not know whose they are.*

*I wish you well.*

*Miss Dray*

You seal it at midnight, when it is easy to be hard. You post it in the morning, when it is not.

For a long time afterward you stand by the post box, wishing you could put your hand in and take it back.`,
      choices: [{ text: 'Wait.', to: 'l6' }],
    },
    r5_both: {
      scene: '✍️🤝🎶',
      caption: 'Your reply',
      text: `*Dear Pavel,*

*Thank you. It cannot have been easy.*

*Please go on. But sign your own name under his, and let me read two men instead of one. I think I should rather have two friends than a single mystery.*

*And tell Anselm, if he will not mind, that when I was nine my father could not read either. I taught him. We did it at the kitchen table, with the back of a calendar. It took a winter. He cried, and then he read me the whole of the weather page.*

*It is not too late. I am a schoolteacher. I know about late.*

*Mirel*`,
      choices: [{ text: 'Wait.', to: 'l6' }],
    },
    l6: {
      scene: '✏️📘🕯️',
      caption: 'Letter 6 · from Anselm · the Thaw again',
      text: `The envelope is thicker than usual. Inside there are two sheets.

The first is Pavel's, a half page of cheerful apology and jokes about Gorse's moustache.

The second is something else. It is a sheet of army paper ruled with a ruler, in pencil. In the middle there are three words, enormous, each letter drawn separately, as a child draws a house:

*MIREL*
*I CAN*
*WRITE*

Below, much smaller, in Pavel's hand: *He did it by himself. Do not tell him I told you. He cried for an hour.*`,
      effects: { spirit: 2, bond: 2 },
      choices: [
        { text: 'Send him a long letter, simple enough to read alone.', to: 'r6_teach', if: [{ has: 'primer' }], lockedHint: 'You did not send him the primer.' },
        { text: 'Write back in your best, plainest hand.', to: 'r6_plain' },
      ],
    },
    r6_teach: {
      scene: '📘✍️🏫',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I saw it. I saw all three words. I put them up on the wall of the schoolroom, beside the gentian. The children asked who had written them. I said: a man who is very brave.*

*I am sending you the lesson for the week. I have drawn the letters, A for Anselm, M for Mirel, H for Hollin, and under each a small picture. Do one a night. Do not hurry.*

*I enclose a sentence for you to copy. I hope it is not too hard.*

*"The hills do not forget the snow."*

*When you can copy it, you will understand what it means. That is how all poems work.*

*Mirel*`,
      effects: { bond: 1, trust: 1 },
      choices: [{ text: 'Wait.', to: 'l7' }],
    },
    r6_plain: {
      scene: '✍️🕯️🏫',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I saw it. I could not have been prouder if you had written the whole of the Book.*

*Go slowly. Write only what you mean. A bad word that is your own is better than a good one that is borrowed.*

*I have no lessons to send, since I did not think of it. But I will draw you the alphabet on the back of this page, in capitals, big enough to see by firelight.*

*Mirel*

You draw all twenty-six, and add a small goat to X, for no reason.`,
      choices: [{ text: 'Wait.', to: 'l7' }],
    },
    l7: {
      scene: '🌸🪖🌅',
      caption: 'Letter 7 · from Anselm · the Plough',
      text: `The letter is three lines long. It is in pencil, and the *s* is backwards.

*MIREL. THEY SAY WE GO UP THE RIDGE ON FRIDAY. I AM NOT AFRAID FOR ME. I AM AFRAID I WILL NOT SEE THE BLUE FLOWER BLOOM.*

Beneath it, in Pavel's hand: *He asked me to say, if the line goes quiet, to keep the tin and not to wait. I told him he was a fool. I will say it again: he is a fool. Wait.*

You sit very still. A child's ball bounces in the lane outside, a flat, ordinary sound.

You have a few hours before the evening post. Whatever you write will be the last thing he reads before the Ridge.`,
      choices: [
        { text: 'Promise to wait for him, whatever happens.', to: 'r7_promise', give: ['_promise'], effects: { bond: 2, spirit: 2 } },
        { text: 'Tell him you love him.', to: 'r7_love', effects: { bond: 3, spirit: 2 }, if: [{ stat: 'bond', min: 6 }], lockedHint: 'You do not know yet whether that is true.' },
        { text: 'Send the gentian seeds, and tell him to plant them when he gets home.', to: 'r7_seeds', if: [{ has: 'seeds' }], lockedHint: 'You did not send seeds.' },
        { text: 'Tell him to come home. Nothing more.', to: 'r7_home', effects: { spirit: 1 } },
      ],
    },
    r7_promise: {
      scene: '✍️🕯️🌅',
      caption: 'Your reply',
      text: `*Anselm,*

*I will wait. I do not say it lightly. I will wait through the Plough and the Reaping and the Frost, and if it takes three years I shall wait, with the lamp in the window on Thursday nights.*

*You are not allowed to tell me not to. I am the schoolteacher.*

*Come home. Read the weather page to me. Plant the flower.*

*Mirel*

The postman takes it, and tips his cap, and does not look at your face.`,
      choices: [{ text: 'Wait.', to: 'silence' }],
    },
    r7_love: {
      scene: '✍️💞🌅',
      caption: 'Your reply',
      text: `*Anselm,*

*I have said many things to you that were true. Here is another.*

*I love you. I do not know if it is the right word. I have not met you. I have met only the voice in your letters, and the man behind Pavel's pen, and the three words on the ruled page. If this is not love, I do not know what is.*

*Come home. I will be at the station with an umbrella and an expression of great disapproval.*

*Mirel*

You do not read it over. If you did, you would never send it.`,
      choices: [{ text: 'Wait.', to: 'silence' }],
    },
    r7_seeds: {
      scene: '🌱✉️🌅',
      caption: 'Your reply',
      text: `*Anselm,*

*Enclosed is a packet of gentian seed from old Mrs. Ketter's garden. She says it is no use to anyone, which is what she says about most things.*

*Keep it in your breast pocket, next to the pencil. When the war is over, plant it in the first piece of soil that is yours. It will not flower the first year. Blue things take their time.*

*I will plant mine at the same hour, behind the school. Whatever happens, there will be two gardens. That is not nothing.*

*Mirel*`,
      effects: { bond: 2, spirit: 2 },
      choices: [{ text: 'Wait.', to: 'silence' }],
    },
    r7_home: {
      scene: '✍️🏠🌅',
      caption: 'Your reply',
      text: `*Anselm,*

*Come home.*

*M.*

It is the shortest letter you have ever written. It is also, you think, the truest.`,
      choices: [{ text: 'Wait.', to: 'silence' }],
    },
    silence: {
      scene: '📮🌧️🕰️',
      caption: 'Hollin, six weeks',
      text: `The post stops.

It does not stop all at once. First it comes late, then in a bundle, then not at all. The lists in the square are three weeks behind and have a smudge across the top. The women at the Thursday circle stop talking. The needles click on.

You teach. You mark. You walk to the post box each morning with your hand in your pocket.

Day forty-one brings the first letter in a hand you do not know: a pale envelope with a stamp from the Marrow Hospital, and a name scrawled on the back, a nurse's, smudged.

You stand in the lane with it for a long time, afraid to open it. The envelope is thin.`,
      effects: { spirit: -1 },
      choices: [
        { text: 'Open it.', to: 'l8' },
        { text: 'Take the Depot post first: train to the junction, and sort letters for the soldiers.', to: 'depot', give: ['_depot', 'pass'], effects: { trust: -1 } },
      ],
    },
    depot: {
      scene: '🚂📮🕯️',
      caption: 'The Field Post Depot',
      text: `The Depot is a railway shed with a thousand sacks of mail. Women in aprons sort by candlelight, by regiment, by number, by the faint hope that a man might still be alive to read it.

You are given a pass, a bowl of soup, and an apron. The supervisor looks at your hands. *You'll do,* she says. *Names to the left, numbers to the right. Do not read them. You will want to.*

You read them, of course. A single sentence on a postcard: *Tell Mother I ate.* A bundle of drawings of a dog. A letter that begins *Dear sir, I regret to inform you*, and you put it very gently in the sack marked *Next of Kin*.

At four in the morning, tired past tears, you pick up a smudged envelope that has been misrouted for weeks. It is addressed to you.`,
      choices: [{ text: 'Open it.', to: 'l8' }],
    },
    l8: {
      scene: '🏥✉️🕯️',
      caption: 'Letter 8 · from Pavel',
      text: `*Dear Mirel,*

*I am sitting at a kitchen table in a hospital at Marrow, writing on my knee. I have a bandage on my head and a bad cough. I am alive. I am telling you this first, since I know how people read letters.*

*The Ridge was bad. I will not tell you what it was. Anselm went up with the first wave and did not come down with it. We found him at the foot of the north slope, in a shell hole with Tam, who had a bullet through his leg. Anselm had carried him a mile.*

*He is here. He is alive. He is on the third floor, in the long ward, with a bandage over his eyes that the doctor says may come off in a month, or may not.*

*He asks for you. He is too proud to say so. Come if you can.*

*Pavel*`,
      effects: { bond: 1 },
      choices: [
        { text: 'Go at once.', to: 'journey', if: [{ has: 'pass' }], lockedHint: 'You will need a travel pass from the Depot.' },
        { text: 'Write to him. You cannot go. The school, the money, the roads.', to: 'r8_write', effects: { bond: -1 } },
      ],
    },
    journey: {
      scene: '🚂🌄🪖',
      caption: 'The Marrow line',
      text: `The train is full of men going the wrong way. You sit by the window with your hands in your lap and the pressed gentian in your purse.

A woman across the aisle offers you a boiled egg. You eat it. You do not remember doing so.

At the junction the line is blown, and you walk eleven miles in the dusk with a farmer's wagon creeping behind you, the farmer too shy to offer a lift, then too ashamed not to. At last he clears his throat. *Hop up, miss. It is going to rain.*

It does. You arrive at the hospital at midnight, soaked, shaking, with your best coat spoiled.

*Mirel Dray,* you tell the night sister. *I am here for the third floor.*`,
      give: ['_hospital'],
      choices: [{ text: 'Go up.', to: 'ward' }],
    },
    ward: {
      scene: '🏥🛏️🕯️',
      caption: 'The long ward',
      text: `The ward is quiet, in the way that a room of sleepers is quiet: not silence, but a hundred different breaths.

Pavel stands up from a chair by the third bed, bandaged, enormous, grinning like a man in love. *You came,* he says. *I owe Tam ten pounds.*

In the bed lies a man of thirty, thin, with a bandage over his eyes. His hair is dark. His hands, on the blanket, are rough and broad and utterly still.

*Who is it?* says Anselm Varga.

His voice is slower than you imagined. Deeper. It sounds like someone speaking a language that is not quite his own, and which he has learned out of love.

*Mirel,* you say.`,
      choices: [{ text: 'Take his hand.', to: 'ward2' }],
    },
    ward2: {
      scene: '🤝🏥💛',
      text: `He does not say anything for a long time. His hand turns over in yours, as though he had been given something he had no right to.

*I am not what I wrote,* he says finally. *I am slow. I am a farmer. I can write my name and eleven other words. Pavel did the rest.*

*I know,* you say. *I have been loving the rest. I have been loving the first, and the second, and the man who carried a boy a mile. They are all the same, I think. They are just you, at different distances.*

He laughs, and it breaks halfway. *May I hear what you look like?*

You tell him. You describe the lamp, and the lumpy heel, and the biscuit tin, and the grey in your hair. Pavel pretends not to listen and listens with his whole face.`,
      effects: { bond: 2 },
      choices: [
        { text: 'Read him the letters aloud, all of them, through the night.', to: 'ward_read', effects: { bond: 1, spirit: 2 } },
        { text: 'Tell him about Joss, and ask whether he has any news.', to: 'ward_joss', effects: { trust: 1 } },
      ],
    },
    ward_read: {
      scene: '📖🏥🌙',
      text: `You have brought the biscuit tin. You read them, one by one, in a low voice, while the other men sleep. His. Hers. The dugout and the Frost and the goat in the vestry.

Somewhere around the fourth, Pavel falls asleep with his mouth open. Around the sixth, the night sister brings tea and sits at the foot of the bed with her shoes off.

When you reach the three words on the ruled page, you stop, because you cannot go on.

*Read it,* says Anselm. *It is the only one I wrote.*

*I can write,* you read. *I can write.*

*Yes,* he says, with great satisfaction. *I can.*`,
      choices: [{ text: 'Stay until morning.', to: 'morning' }],
    },
    ward_joss: {
      scene: '🏥📷💔',
      text: `Anselm is quiet. Then he says, in a voice that has lost its slowness: *There was a lad. On the north slope, in the second week. A cough. A chin like yours.*

Your heart goes cold and still.

*We held a trench together for ten days,* he says. *He talked about a hen in church. I should have written. I was afraid to. He was killed on the fourth of Plough, Mirel, on the eve of the push, by a shell. He did not suffer. He had a letter in his hand. It was from you.*

He turns his face toward the ceiling. *I have been trying to write that letter for six weeks. I could not find the words. I am sorry.*`,
      effects: { spirit: -1 },
      choices: [{ text: 'Hold him. Grieve with him.', to: 'ward_grief' }],
    },
    ward_grief: {
      scene: '🕯️🏥😢',
      text: `You do not say it is all right. It is not.

You weep, and he weeps, and Pavel, awake now and pretending not to be, takes out the mouth organ and plays something very slow and sad. For once nobody throws a boot.

When it is done there is a long silence. Outside the first birds have started.

*He was kind to me,* Anselm says. *He gave me his socks.*

You laugh, through the tears. It is an ugly laugh, and it feels like water after a drought. *They were my socks,* you say. *They had lumpy heels.*

*They fit exactly,* he says.`,
      effects: { bond: 2, trust: 1 },
      choices: [{ text: 'Stay until morning.', to: 'morning' }],
    },
    morning: {
      scene: '🌅🏥🔔',
      caption: 'Marrow Hospital, dawn',
      text: `At dawn the bells begin.

First one, then another, then a hundred, from every steeple in the city. At first you think it is an alarm. Then the ward wakes, and men begin to shout, and a boy with no legs starts to laugh, and a nurse runs down the corridor crying *Armistice! Armistice!*

The war is over. It ends on a Tuesday, at eleven minutes past six, in the rain.

Anselm's hand tightens in yours. *Is it true?* he says. *Is it true?*

*It is true,* you say. *Come home.*`,
      choices: [
        { text: 'Take him home to Hollin, and the schoolhouse garden.', to: 'garden', if: [{ has: 'seeds' }, { has: 'primer' }, { stat: 'bond', min: 8 }], lockedHint: 'Some things are still unplanted.' },
        { text: 'Take him home to Hollin.', to: 'end_home', if: [{ stat: 'bond', min: 6 }], lockedHint: 'You are not yet sure he is yours.' },
        { text: 'Part as friends. You both need time.', to: 'end_friends' },
      ],
    },
    r8_write: {
      scene: '✍️🌧️📮',
      caption: 'Your reply',
      text: `*Dear Anselm,*

*I cannot come. I have thirty-one children and no money, and the roads are cut. I hate that this is true.*

*Pavel says you are alive. I have read it six times. Tell me what you want. Tell me what you would like in a parcel, and I will send it.*

*I will be here. Mirel*

You walk to the post box in the rain. The ink runs a little on the envelope. It does not matter. Somebody will read it aloud.`,
      choices: [{ text: 'Wait.', to: 'l9' }],
    },
    l9: {
      scene: '🏥✉️🌧️',
      caption: 'Letter 9 · from Anselm · written in his own hand',
      text: `It arrives on a Friday. It is a single sheet. The writing is huge and unsteady, and the lines slope downhill. It has been done by a man who cannot see what he is writing.

*MIREL. I AM BLIND. I WRITE IT BY FEEL. THE DOCTOR SAYS MAYBE NOT FOR EVER. I AM TIRED. I DO NOT WANT YOU TO COME AND SEE ME LIKE THIS.*

*THE WAR WILL END SOON. THEY SAY SO. I WILL GO HOME TO THE FARM. IF YOU WANT, WRITE.*

*I DID LEARN IT. I DID IT MYSELF.*

*I AM VERY GLAD I GOT THE SOCKS.*

You read it standing in the lane. You read it again in the schoolroom. By the third time, the children have stopped chanting and are watching you in silence.`,
      effects: { spirit: -1 },
      choices: [
        { text: 'Write to him every day, as long as it takes.', to: 'r9_daily', effects: { bond: 1 } },
        { text: 'Set out for Marrow, even without a pass.', to: 'r9_walk' },
      ],
    },
    r9_daily: {
      scene: '✍️📮🏫',
      text: `You write every morning before school and every evening after. Short letters, long letters, a stolen line of Psalm, a drawing of the goat.

Spring comes in. The bell goes on ringing. The children make a banner for the end of the war and nobody is certain who it is for.

Letters come back more slowly: three lines, then five. He has found a nurse who will write his answers if he dictates. Pavel is discharged and sends a postcard with a drawing of a hen.

In the end, the war does stop. The bells ring all over Hollin. And you are still writing, and still waiting, and the letters are all you have.`,
      effects: { trust: 1 },
      choices: [{ text: 'Wait for the one that comes next.', to: 'end_last_letter', if: [{ stat: 'spirit', max: 4 }] }, { text: 'Wait for the one that comes next.', to: 'end_friends' }],
    },
    r9_walk: {
      scene: '🚶‍♀️🌧️🌄',
      text: `You do not have a pass. You have a good coat and a stubborn heart, and you leave Hollin at dawn, on the Saturday, before anyone can argue.

You walk to the junction. You ride in the back of a cart with a load of potatoes. You are stopped three times by tired boys with rifles and you tell all three of them the truth.

On the third day, outside Marrow, you meet a soldier on the road. He has one arm. *You'll be wanting the hospital,* he says. *They've just sounded the bell. Armistice.*

You sit down on a milestone and laugh until your sides hurt, a mud-spattered schoolteacher with a coat full of potato dust. Then you get up and walk the last mile.`,
      give: ['_hospital'],
      effects: { trust: -1, bond: 1 },
      choices: [{ text: 'Go up to the third floor.', to: 'ward' }],
    },

    garden: {
      scene: '🌱🏫🌅',
      caption: 'Hollin, the Plough, the next year',
      text: `He comes home in a cart, with a stick and a squint, and a bundle that contains one shirt and a primer with the corners soft from reading. The bandage came off in the spring. He can see a little: light and shape, the blur of a face. The doctors say it may improve. The doctors say a great many things.

Behind the schoolhouse, in a patch of ground you cleared with the children, you give him the trowel.

He kneels. He pulls the packet from his breast pocket. The paper has gone soft and brown, folded and refolded a hundred times.

*Blue things take their time,* he says, and tips the seed into the earth with a hand that does not shake.

Pavel plays something bright and out of tune from the schoolhouse step. Thirty-one children, now thirty-two, watch with their mouths open.`,
      choices: [{ text: 'Wait for the summer.', to: 'end_garden' }],
    },

    end_home: {
      scene: '🏡🚂💛',
      text: `He arrives on the evening train, at the end of the Reaping, in a coat that does not quite fit. You are on the platform with an umbrella and an expression of great disapproval.

He is thinner than you imagined, and older, and plainer, and utterly himself. He stands for a moment as if he had forgotten how to put one foot before the other. Then he drops his bag and puts his hands, very gently, on either side of your face, the way a man touches a letter he has waited a long time to read.

*Mirel,* he says. *I can see you.*

*You cannot,* you say. *It is dark.*

*I can see enough,* he says.

The lamp in the window is lit on Thursday nights. The weather page is read aloud at the kitchen table. The biscuit tin sits on the shelf, and nobody ever opens it again, because they have no need.`,
      ending: { title: 'The Lamp in the Window', kind: 'good', score: 100 },
    },
    end_friends: {
      scene: '✉️🌳🕊️',
      text: `The war ends. The letters do not.

They come once a month, then once a season, then at birthdays. He writes in his own hand, laboriously, and you in yours. He marries a widow from the next valley who laughs a great deal. You teach for forty years. Pavel visits every spring with his mouth organ and a different hat.

It is not the story you imagined, in the dark, on the nights you read them over. It is a good one all the same.

When you are old, the biscuit tin still sits under your bed. In it is a pressed blue flower, long faded, and a ruled page with three enormous words.

You take it out sometimes. It still makes you proud.`,
      ending: { title: 'Letters, Kept', kind: 'neutral', score: 55 },
    },
    end_last_letter: {
      scene: '🕯️✉️🌌',
      text: `It comes in the summer, after the bells, long after the ones that mattered.

The envelope is plain. The hand is Pavel's. The letter inside is brief, and it does not apologise.

*Mirel. He did not come back from the second hospital. A fever. He was not in pain. He asked me to give you this.*

Folded inside is a sheet of army paper, in pencil. The lines slope downhill. Every letter is its own small house.

*MIREL. I CAN WRITE. I CAN WRITE. I CAN WRITE.*

*I HOPE THE HEEL WAS NOT LUMPY. I WANTED TO SAY IT MYSELF.*

You sit on the schoolroom floor and read it until the light fails. Then you pin it to the wall, next to a flower the colour of the sky, where the children can see.`,
      ending: { title: 'The Last Letter', kind: 'neutral', score: 40 },
    },
    end_silence: {
      scene: '📮🌧️🪖',
      text: `The letters thin, and thin, and stop.

You write anyway. For weeks you go to the post box with a heart that no longer expects anything, and the clerk learns to look away.

Later, when the lists are finally posted in the square, you do not go to read them. You hear the name from a neighbour, through a half-open door: *Varga, A., Corporal, Fourth Foot. Missing, believed fallen.*

You go home. You take down the flower from the schoolroom wall, and put it in the biscuit tin, and shut the lid.

There is nothing to say. You learn, as the war ends and the bells ring, that silence is also a letter. It simply has no one to read it.`,
      ending: { title: 'Return to Sender', kind: 'bad', score: 15 },
    },
    end_cold: {
      scene: '✉️🔒🌨️',
      text: `The last letter you wrote sits in the tin, unfinished.

There is no quarrel, no great break. There is only an accumulation: a question not answered, a truth not told, a politeness repeated until it sets like plaster.

You stop writing. He does not ask why. Perhaps he has never learned that it is allowed to.

Months later a grey envelope arrives with three words in a stranger's tidy hand: *He is well.* You do not answer.

The war ends. The bells ring. You teach your thirty-one children their Wednesdays. And somewhere, on a hill like a sleeping dog, a man who learned to write for your sake puts down a pencil, and does not pick it up again.`,
      ending: { title: 'A Closed Envelope', kind: 'bad', score: 12 },
    },
    end_garden: {
      scene: '🌸🏫💙',
      text: `The gentians come up in the second year, as you promised. Blue things take their time.

They bloom behind the schoolhouse in a ragged circle that the children are forbidden to trample and trample anyway. On the first morning Anselm kneels among them with his face an inch from the petals, and breathes in, and says nothing for so long that you think he has fallen asleep.

*It is the colour of the Ridge,* he says. *It is the colour of the letter. I could see it from the other end of the garden.*

He looks up. His eyes are clear.

He reads the weather page aloud at breakfast. He teaches the village boys to plough. On Thursdays you read to each other, sitting on the schoolhouse step. Each year, in the Plough, the first petals open, and you write the date on the wall in chalk.

You never need to write each other another letter. You are never far enough apart.`,
      ending: { title: 'The Blue Garden', kind: 'secret', score: 130 },
    },
  },
}

export default story
