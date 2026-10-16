// Handwritten card deck and flavour tables for the Reigns-style engine.
// Meter order everywhere: [institution, people, power, wealth].

export type Fx = [number, number, number, number]
export interface Opt { label: string; fx: Fx; res: string; set?: string; next?: [string, number] }
export interface Card { id: string; who: string; text: string; L: Opt; R: Opt; chain?: boolean; first?: boolean }

type O = [string, Fx, string, { set?: string; next?: [string, number] }?]
const o = (a: O): Opt => ({ label: a[0], fx: a[1], res: a[2], ...(a[3] ?? {}) })
const c = (id: string, who: string, text: string, L: O, R: O, chain = false): Card => ({ id, who, text, L: o(L), R: o(R), chain })

export interface Flavor {
  id: string
  meters: [string, string][]
  K: string
  R: string
  Cn: string
  /** who key -> [emoji, name] */
  roles: Record<string, [string, string]>
  end: string[] // low0, low1, low2, low3, high0, high1, high2, high3
  intro: string
}

const COMMON_ROLES = { J: ['🤡', 'The Jester'], S: ['🥷', 'The Spy'], M: ['🧑‍💼', 'The Merchant'], O: ['🔮', 'The Oracle'], N: ['🤵', 'A Noble'], Q: ['👸', 'Your Spouse'], X: ['🕴️', 'A Stranger'], D: ['🐉', 'Kevin the Dragon'] } as const
const roles = (p: [string, string], g: [string, string], t: [string, string], cc: [string, string]): Flavor['roles'] => ({ P: p, G: g, T: t, C: cc, ...(COMMON_ROLES as unknown as Flavor['roles']) })

export const FLAVORS: Record<string, Flavor> = {
  kingdom: {
    id: 'kingdom', meters: [['Church', '⛪'], ['People', '👥'], ['Army', '⚔️'], ['Treasury', '💰']], K: 'Your Majesty', R: 'kingdom', Cn: 'peasants',
    roles: roles(['👴', 'The Bishop'], ['💂', 'The General'], ['🧐', 'The Treasurer'], ['🧑‍🌾', 'A Peasant']),
    end: [
      'Without faith, the people followed a charlatan with a very nice hat. He now sits on your throne.',
      'The people stormed the palace with pitchforks. Very democratic, very final.',
      'With no army left, a neighbour dropped by for tea. And stayed. For ever.',
      'The treasury was empty, then the pantry, then your throne, sold at auction.',
      'The Bishop grew so powerful you became his puppet. Nobody remembers your name.',
      'The people loved you so much they hugged you. Enthusiastically. Fatally.',
      'The General decided he would do the job better. He was right, annoyingly.',
      'Wealth drew thieves, tax collectors and one very persuasive cousin with a poisoned goblet.',
    ],
    intro: 'Welcome to the throne, {K}. Keep all four meters away from empty and from overflowing.',
  },
  politics: {
    id: 'politics', meters: [['Press', '📰'], ['Public', '👥'], ['Party', '🏛️'], ['Budget', '💰']], K: 'Madam President', R: 'country', Cn: 'voters',
    roles: roles(['🧑‍💼', 'The Spin Doctor'], ['🕴️', 'The Party Whip'], ['🧐', 'The Finance Minister'], ['🧑', 'A Voter']),
    end: [
      'The press turned on you. The headline: "Who?". Resignation by tomorrow.',
      'The public voted you out. By a landslide. Of shoes thrown at the podium.',
      'The party dropped you for a younger, shinier leader with fewer scandals.',
      'The budget collapsed. The country now runs on IOUs and optimism.',
      'The press loved you so much they became the government. You became the intern.',
      'Your approval hit 100%. The public demanded you be president for life. You were. Life was short.',
      'The party became all-powerful. You are now a mascot with a tie.',
      'Surplus! The treasury overflowed and parliament spent it on a golden statue of a statue.',
    ],
    intro: 'Welcome to office, {K}. Keep all four meters away from empty and from overflowing.',
  },
  space: {
    id: 'space', meters: [['Science', '🔬'], ['Crew', '👥'], ['Hull', '🛡️'], ['Fuel', '⛽']], K: 'Captain', R: 'ship', Cn: 'crew',
    roles: roles(['🧑‍🔬', 'The Science Officer'], ['💂', 'The Security Chief'], ['🧐', 'The Quartermaster'], ['🧑‍🚀', 'A Crew Member']),
    end: [
      'Without science, the ship drifted into a very obvious black hole. The sensors said "oops".',
      'The crew mutinied and left you on a small asteroid. It has a nice view.',
      'The hull gave out. For a brief moment, the ship was also an escape pod. Then it was not.',
      'The fuel ran dry. Gently, the ship coasted into history. Slowly.',
      'The scientists took over the bridge. They wanted to "run an experiment". On you.',
      'The crew adored you so much they refused to leave the bridge. Oxygen did not adore them back.',
      'The hull was overbuilt. So heavy, the ship could not move. A very safe, very stationary tomb.',
      'The tanks overflowed. One spark. One very bright spark.',
    ],
    intro: 'Welcome aboard, {K}. Keep all four meters away from empty and from overflowing.',
  },
  pirate: {
    id: 'pirate', meters: [['Luck', '🍀'], ['Crew', '👥'], ['Ship', '🚢'], ['Loot', '💰']], K: 'Cap\'n', R: 'ship', Cn: 'crew',
    roles: roles(['🧙‍♀️', 'The Sea Witch'], ['🧔', 'The First Mate'], ['🧐', 'The Purser'], ['🏴‍☠️', 'A Deckhand']),
    end: [
      'Your luck ran out. A seagull stole your hat, then the map, then the ship.',
      'The crew mutinied and marooned you on a beach. At least it has coconuts.',
      'The ship sank. The parrot, offended, flew off and told everyone.',
      'The loot dried up and so did the rum. Pirates without either are just sailors.',
      'So much luck that the sea itself was jealous. A wave. A big, polite wave.',
      'The crew loved you so much they carried you around. Into the sea.',
      'The ship was so well armed it turned into a floating fort. It never left port again.',
      'Overflowing with treasure, the ship sank under the weight of gold. Ironic, but shiny.',
    ],
    intro: 'Welcome aboard, {K}. Keep all four meters away from empty and from overflowing.',
  },
  wasteland: {
    id: 'wasteland', meters: [['Hope', '🕯️'], ['Morale', '👥'], ['Defense', '🛡️'], ['Supplies', '🥫']], K: 'Boss', R: 'settlement', Cn: 'survivors',
    roles: roles(['🧓', 'The Radio Preacher'], ['💂', 'The Gate Warden'], ['🧐', 'The Scavenger Boss'], ['🧑', 'A Survivor']),
    end: [
      'Hope faded. People walked into the wastes one by one, humming.',
      'Morale broke. The survivors left in the night, taking the good spoons.',
      'The walls fell. Whatever came through was not selling anything.',
      'The cans ran out. The last can was a mystery. Nobody opened it.',
      'Too much hope. The settlement built a shrine to you. The raiders loved it.',
      'Everybody adored you. They carried you into the sun. Radiation tans are fatal.',
      'The warden became a warlord, and you became a very polite prisoner.',
      'A hoard of supplies attracted raiders from three states. All hungry.',
    ],
    intro: 'Welcome to the settlement, {K}. Keep all four meters away from empty and from overflowing.',
  },
  life: {
    id: 'life', meters: [['Happiness', '😊'], ['Friends', '🤝'], ['Health', '❤️'], ['Money', '💰']], K: 'you', R: 'life', Cn: 'friends',
    roles: { P: ['🧘', 'Therapist'], G: ['💪', 'Gym Buddy'], T: ['🏦', 'Bank'], C: ['🧑', 'A Friend'], J: ['🤡', 'Your Cousin'], S: ['📱', 'Your Phone'], M: ['🧑‍💼', 'Your Boss'], O: ['🔮', 'Horoscope'], N: ['🏠', 'Landlord'], Q: ['👵', 'Mom'], X: ['🕴️', 'A Stranger'], D: ['🐱', 'The Cat'] },
    end: [
      'Burnout. You moved to a cabin and now only talk to a very smart cat.',
      'You drifted apart from everybody. The group chat is still called "Us". It is not.',
      'Your health gave out. The doctor said "I told you so" in a very caring way.',
      'The money ran out. You sold your plants, then your lamp, then your lease.',
      'Too much happiness. You fell asleep smiling and never quite woke up. Lovely, really.',
      'Everyone wanted to hang out with you. Constantly. You were found asleep in a bush.',
      'Peak fitness. You trained so hard you became a legend. Of the hospital.',
      'So much money you lost track of it. Your accountant sailed to a tropical island with it.',
    ],
    intro: 'Welcome to adulthood. Keep all four meters away from empty and from overflowing.',
  },
}

export const pickFlavor = (name: string, themeId: string): Flavor => {
  const s = name.toLowerCase()
  if (/mayor|campaign|parliament|senate|election|president|council|press|spin|lobby|referendum|republic|constitution|tax code|paperwork|diplomat|swing|dictator|coup|revolution|banana|budget|town hall|crisis|polling|filibuster|ministry/.test(s)) return FLAVORS.politics
  if (/apartment|college|nurse|family|hermit|influencer|roommate|suburbia|life|years|diary|housemate|cat lady|lighthouse|generations|living|island hermit/.test(s) || themeId === 'cozy') return FLAVORS.life
  if (themeId === 'space' || /space|galactic|starship|orbit|station/.test(s)) return FLAVORS.space
  if (themeId === 'pirate' || /pirate|harbor|sea /.test(s)) return FLAVORS.pirate
  if (themeId === 'wasteland' || /settlement|bunker|wasteland|survival/.test(s)) return FLAVORS.wasteland
  return FLAVORS.kingdom
}

export const LEADER_DECK: Card[] = [
  c('cath', 'P', '{K}, I propose a cathedral so tall that heaven will need a doorbell.', ['Pray at home', [-10, 0, 0, 3], 'The {P} sulks, in Latin.'], ['Build it', [14, 3, 0, -12], 'Scaffolding everywhere. Pigeons thrilled.']),
  c('tax1', 'T', '{K}, the treasury echoes. Might I suggest taxing the {Cn}? Gently. With a mallet.', ['Never', [0, 8, 0, -8], 'The {T} weeps into the ledger.'], ['Tax them', [0, -12, 0, 14], 'Money flows in. So do complaints.']),
  c('hat', 'G', 'A neighbouring ruler insulted your hat. The army is already packing.', ['Hats heal', [0, 4, -10, 0], 'The {G} kicks a barrel.'], ['To war!', [0, -6, 14, -10], 'Glorious, expensive, and mostly about a hat.']),
  c('fest', 'C', 'The harvest was huge! The {Cn} demand a festival with an unreasonable amount of mead.', ['No mead', [0, -9, 0, 5], 'Sober, grumpy {Cn}. Very efficient.'], ['Mead for all', [3, 14, -4, -10], 'Three days of singing. Four of regret.']),
  c('jest1', 'J', 'Shall I roast the {P} at tonight\'s feast? He deserves it. I have been practising.', ['Behave', [6, -4, 0, 0], 'The Jester behaves. Visibly in pain.'], ['Roast him', [-10, 10, 0, 0], 'The hall roars. The {P} takes notes.']),
  c('plague1', 'C', 'Travellers on the road are coughing in a suspicious, plot-relevant way.', ['Ignore it', [0, 0, 0, 6], 'What could possibly go wrong?', { set: 'plague', next: ['plague2', 5] }], ['Close the road', [0, -6, 0, -8], 'Trade grumbles, but nobody sneezes.']),
  c('plague2', 'P', 'The plague has arrived, exactly as predicted by everyone except you.', ['Pray harder', [10, -14, 0, 0], 'Prayer: four stars. Reviews mixed.'], ['Hire doctors', [-4, 6, 0, -14], 'The leeches get a bonus.'], true),
  c('egg1', 'X', 'A stranger sells you a warm egg. "Definitely a chicken," he says, backing away.', ['Eat it', [0, 3, 0, 4], 'Delicious omelette. Ominous silence.'], ['Keep it warm', [0, 0, 0, -3], 'You swaddle it. Royal duties now include this.', { next: ['egg2', 7] }]),
  c('egg2', 'C', 'The egg hatched. It is a dragon. It is eating the sheep.', ['Banish it', [0, -4, 0, 0], 'The dragon flies off, sulking.'], ['Name it Kevin', [0, 8, 10, -8], 'Kevin is now a royal pet. The sheep were not consulted.', { next: ['egg3', 8] }], true),
  c('egg3', 'D', 'Kevin the Dragon is full-grown. He would like a hoard. Yours.', ['Give a little', [0, 0, 12, -16], 'Kevin guards the borders. And your gold.'], ['Gift him a hat', [0, 6, -6, 0], 'He accepts. He wears it. He is insufferable.'], true),
  c('merch1', 'M', 'Spices from the East! Only slightly cursed. Special price for you.', ['Buy', [-5, 4, 0, -8], 'Dinner is incredible. Your tongue files for divorce.'], ['Tax him', [0, -3, 0, 9], 'He pays, smiling, already planning revenge.']),
  c('spy1', 'S', 'I overheard a plot against you. Might have been me. Hire me and we will find out.', ['Hire him', [0, 0, 6, -8], 'Spy employed. Plot status: unclear.'], ['Dismiss him', [0, 0, -6, 0], 'He vanishes. The curtains do not.']),
  c('oracle1', 'O', 'I see your future! It involves your {R}. And, uh, a hat.', ['Seek advice', [8, 0, 0, -6], 'The oracle says "be careful." Priceless.'], ['Ban oracles', [-8, 0, 0, 5], 'The oracle stage-whispers "I predicted that."']),
  c('wedding', 'N', 'A neighbouring duke offers his daughter in marriage. She has a dowry and a bow.', ['Decline', [0, 0, -6, 0], 'The duke\'s face: sour. The bow: pointed.'], ['Accept', [0, 6, 8, 12], 'A wedding! The dowry arrives. So does the bow.', { next: ['spouse', 9] }]),
  c('spouse', 'Q', 'Your spouse has opinions. About the army. And your wardrobe. And the army\'s wardrobe.', ['Listen', [0, 4, 6, -5], 'The army gets uniforms. Cheerful ones.'], ['Ignore', [0, -6, -4, 0], 'Dinner is quiet. The cutlery is loud.'], true),
  c('bridge', 'C', 'A new bridge would link the river towns. It would also give the {Cn} something to argue about.', ['Skip it', [0, -6, 0, 5], 'The ferryman is delighted. Only he.'], ['Build it', [0, 8, 0, -10], 'The bridge goes up. So does a toll booth.', { next: ['bridge2', 6] }]),
  c('bridge2', 'T', 'The bridge is finished! A ribbon-cutting is traditional. So are speeches. Many speeches.', ['Short speech', [0, 4, 0, 2], 'You cut the ribbon in the middle of a sentence.'], ['Grand ceremony', [4, 10, 0, -10], 'Fireworks! One lands in someone\'s beard.'], true),
  c('bandits', 'G', 'Bandits on the north road. They have manners but no licence.', ['Send guards', [0, 4, -6, -4], 'The bandits retire. To the south road.'], ['Negotiate', [0, -5, 0, -6], 'They accept a "toll". Bandits with paperwork.']),
  c('heretic', 'P', 'A heretic claims the moon is made of cheese. The {P} demands a trial.', ['Free him', [-10, 6, 0, 0], 'The heretic opens a cheese shop.'], ['Hold a trial', [10, -8, 0, 0], 'The verdict: cheese is a sin.']),
  c('famine', 'C', 'Rats ate the grain stores. The rats look well fed. Anyone care?', ['Open the granaries', [0, 12, 0, -12], 'Bread for all. Rats furious.'], ['Ration it', [0, -12, 0, 6], 'The rats unionise.']),
  c('tourn', 'N', 'A tournament! Knights will bash each other for glory and a ham.', ['Fund it', [0, 8, 8, -10], 'The ham is won by a horse.'], ['Cancel', [0, -6, -6, 5], 'The knights bash the castle door instead.']),
  c('gen2', 'G', 'The troops are bored. Bored troops invent things. Last time: a catapult named Gerald.', ['Drills!', [0, -4, 8, -3], 'The troops are tired. Gerald retires.'], ['Pay a bonus', [0, 3, 6, -9], 'Morale rises. So does the bar tab.']),
  c('library', 'O', 'A scholar wants funds for a library. It will contain "all knowledge". Also tea.', ['Fund it', [4, 6, 0, -9], 'Books everywhere. Students sleep in them.'], ['Refuse', [-6, -4, 0, 5], 'The request burns well, at least.']),
  c('witch', 'C', 'The villagers accuse Old Marta of being a witch. She has a cat. And a casserole.', ['Protect her', [-6, 6, 0, 0], 'Marta bakes you a pie. It is cursed with deliciousness.'], ['Banish her', [6, -6, 0, 0], 'The village is quieter. And hungrier.']),
  c('spy2', 'S', 'Spy report: the {P} is skimming from the offering plate. A little. Like, a lot.', ['Bury the report', [6, 0, 0, -3], 'Peace. And a roof made of gold.'], ['Expose him', [-12, 5, 0, 10], 'The {P} pays a "fine". Gold appears.']),
  c('pirates', 'G', 'Pirates have taken the harbour. They say it is a "vacation".', ['Pay them off', [0, -3, 0, -12], 'Pirates leave. Their parrots stay.'], ['Fight', [0, 5, -12, 4], 'The navy wins. The ships don\'t.']),
  c('fire', 'C', 'The market is on fire! The firemen are at lunch. The bucket brigade is one bucket.', ['Rebuild with gold', [0, 10, 0, -14], 'The market is shinier. The bucket is retired.'], ['Let it burn', [0, -10, 0, 4], 'The {Cn} learn the value of buckets.']),
  c('cousin', 'N', 'Your cousin wants a title. Any title. "Duke of Snacks" would do.', ['Grant it', [0, 3, 3, -6], 'The Duke of Snacks takes his duties seriously.'], ['Refuse', [0, 0, -6, 3], 'The cousin sulks. In the wine cellar.']),
  c('rebel', 'C', 'A bearded man shouts "Down with everything!" from a barrel. He has followers. And the barrel.', ['Arrest him', [0, -8, 6, 0], 'Barrel confiscated. {Cn} morale: wobbly.'], ['Hear him out', [-5, 8, -8, 0], 'His demands: more barrels.']),
  c('alch', 'O', 'An alchemist can turn lead into gold. She says "mostly". She needs lead and trust.', ['Fund her', [0, 0, 0, -10], 'A small explosion. Small amounts of gold.', { next: ['alch2', 5] }], ['Laugh', [0, 0, 0, 3], 'She storms off, sparkling.']),
  c('alch2', 'O', 'The alchemist\'s experiment worked! Mostly. The gold is a touch... green.', ['Spend it anyway', [0, -5, 0, 14], 'Merchants squint, then accept.'], ['Melt it', [0, 0, 3, 5], 'Slightly less green. Slightly less gold.'], true),
  c('envoy', 'N', 'An envoy from afar presents a gift: a giraffe. Nobody knows why.', ['Accept', [0, 8, 0, -5], 'The giraffe eats part of the roof.'], ['Refuse', [0, -3, -3, 0], 'The envoy leaves, giraffe in tow.']),
  c('inq', 'P', 'The {P} asks permission to "ask questions" of some people. Loudly.', ['Allow', [10, -10, 4, 0], 'Questions asked. Answers: "yes."'], ['Forbid', [-8, 6, 0, 0], 'The {P} takes up knitting.']),
  c('mine', 'T', 'New gold vein, right under a village. The {Cn} live there. Awkward.', ['Dig it', [0, -12, 0, 16], 'Gold! And a lot of holes.'], ['Leave them', [0, 6, 0, -4], 'Good mood. Bad treasury.']),
  c('drought', 'C', 'No rain for weeks. The {P} suggests a procession. The {Cn} suggest wells.', ['Procession', [10, -4, 0, 0], 'It rains... on the neighbours.'], ['Dig wells', [-4, 10, 0, -8], 'Splash! The wells work. The {P} claims credit.']),
  c('duel', 'G', 'Two captains want a duel. Over a horse. The horse has no opinion.', ['Allow it', [0, -3, -6, 0], 'One captain, one horse, one bandage.'], ['Make them share', [0, 0, 5, -3], 'Now they share a horse. And a grudge.']),
  c('jest2', 'J', 'I wrote a ballad about you! It rhymes "ruler" with "fooler". Early reviews are... existent.', ['Perform it', [0, 8, -4, 0], 'The {Cn} cheer. The {G} clenches.'], ['Ban the ballad', [0, -6, 3, 0], 'It spreads by whisper. Faster.']),
  c('ghost', 'O', 'The palace is haunted. The ghost wants rent. He lived here first.', ['Pay him', [4, 0, 0, -8], 'The ghost buys a small ghost-boat.'], ['Exorcise', [8, 0, -4, -4], 'The ghost leaves. The draught stays.']),
  c('fashion', 'N', 'The nobles beg you to adopt the new fashion: absurdly tall hats.', ['Adopt', [0, 4, 0, -6], 'Doors need raising. Heights are dangerous.'], ['Ban hats', [0, -5, 0, 2], 'Underhats: now trending.']),
  c('borders', 'G', 'Border villages ask for walls. Walls need stones. Stones need money. Money needs... you.', ['Build walls', [0, 0, 12, -12], 'Walls: tall. The border: nervous.'], ['No walls', [0, 4, -10, 0], 'The border is friendly. Until it isn\'t.']),
  c('child', 'Q', 'Your heir has drawn on the palace walls. It is, annoyingly, quite good.', ['Frame it', [0, 6, 0, -3], 'Art in the corridors. Courtiers, uninspired.'], ['Scold', [0, -3, 0, 0], 'A sulk. A very royal sulk.']),
  c('bard', 'J', 'A bard wants to write "the definitive history of your reign". He needs a small loan.', ['Loan him', [0, 6, 0, -6], 'The history is very flattering. Suspiciously.'], ['Refuse', [0, -3, 0, 4], 'He writes it anyway. You are the villain.']),
  c('feast2', 'P', 'Midwinter comes. The {P} wants a holy feast. The cook wants a bigger oven.', ['Feast', [8, 6, 0, -10], 'The oven wins. The roast loses.'], ['Quiet night', [-6, -4, 0, 5], 'Soup. Holy soup.']),
  c('loan', 'T', 'A foreign banker offers a loan. Interest: "friendly". Collateral: "a small, unimportant bit of {R}".', ['Sign', [0, 0, -5, 18], 'The ink is red. The bit of {R}: gone.'], ['Decline', [0, 0, 0, -3], 'The banker\'s smile fades.']),
  c('recruit', 'G', 'Volunteers line up to join the army! Mostly because of the free soup.', ['Enlist all', [0, -4, 12, -6], 'The army doubles. So does the soup bill.'], ['Be selective', [0, 2, 5, -2], 'A leaner army. Fewer spoons.']),
  c('saint', 'P', 'Pilgrims say a local goat is a saint. The goat declined to comment.', ['Honour the goat', [10, 5, 0, -5], 'Pilgrims flock. So do goats.'], ['Eat the goat', [-12, -4, 0, 4], 'Delicious heresy.']),
  c('strike', 'C', 'The bakers are on strike. Bread is now a luxury. A luxury with crumbs.', ['Meet demands', [0, 10, 0, -9], 'Bread resumes. Muffins, optionally.'], ['Hire scabs', [0, -10, 3, 3], 'The bread tastes of betrayal.']),
  c('rogue', 'S', 'A masked rogue offers to steal from your enemies. He says "masked" is a lifestyle.', ['Hire him', [-3, 0, 6, 6], 'Loot arrives. Also a stolen cat.'], ['Refuse', [3, 0, 0, 0], 'He steals the refusal letter instead.']),
  c('moat', 'G', 'Should we dig a moat? Or a "moat-like trench"? The difference is the budget.', ['Moat!', [0, 2, 10, -10], 'Water. Ducks. Security.'], ['Skip it', [0, 0, -6, 6], 'The enemy walks in. Dry-footed.']),
  c('storm', 'C', 'A storm took the roof off the granary. The {Cn} offer to fix it for a day\'s pay. And mead.', ['Pay them', [0, 8, 0, -7], 'Roof fixed. Mead: also fixed.'], ['Fix it yourself', [0, -4, 0, -2], 'You are, it turns out, not a roofer.']),
  c('stranger2', 'X', 'A mysterious stranger offers you a map. "X marks the spot." The spot is unspecified.', ['Buy the map', [0, 0, 0, -6], 'The map looks suspiciously like a placemat.', { next: ['map2', 6] }], ['Pass', [0, 0, -2, 0], 'He sells it to your rival.']),
  c('map2', 'X', 'Your treasure expedition is back. They found... a very nice view. And a chest.', ['Open the chest', [0, 0, 0, 16], 'Treasure! The view was free.'], ['Sell the view', [0, 6, 0, 6], 'A real-estate boom begins.'], true),
  c('tolls', 'M', 'A caravan wants to cross your {R}. They offer a discount in exchange for a favour. And a camel.', ['Take the deal', [0, 0, 0, 10], 'Camel acquired. Role: unclear.'], ['Refuse', [0, 3, 0, -3], 'The caravan finds another route. And another.']),
  c('orphans', 'P', 'The {P} asks for funds for an orphanage. And a new organ. For the orphans.', ['Fund it', [8, 6, 0, -8], 'Orphans sing. Pipes wheeze.'], ['Decline', [-6, -5, 0, 4], 'The organ remains unbuilt.']),
  c('ambush', 'G', 'Scouts report an enemy column. It might be a parade. The banners are very pointy.', ['Ambush!', [0, 0, 8, -4], 'Parade ruined. Apologies pending.'], ['Send flowers', [0, 4, -6, 0], 'It was a parade. Awkward.']),
  c('census', 'T', 'I propose a census. To count the {Cn}. And to tax them accurately.', ['Do it', [0, -7, 0, 12], 'Numbers: big. Moods: not.'], ['Skip it', [0, 5, 0, -4], 'Ignorance is blessed. Also poor.']),
  c('shrine', 'P', 'A shrine appeared on the hill overnight. Nobody built it. Pilgrims arrive hourly.', ['Bless it', [10, 4, 0, -3], 'A miracle! Or a really fast mason.'], ['Tear it down', [-10, -4, 0, 0], 'It reappears. Shinier.']),
  c('mutiny', 'G', 'The soldiers refuse to march. Their boots are leaking.', ['New boots', [0, 4, 8, -9], 'Dry feet. Loud cheers.'], ['March anyway', [0, -5, -10, 0], 'Wet feet. Quiet curses.']),
  c('doctor', 'O', 'A travelling doctor swears his tonic cures everything. Side effects: "lively".', ['Buy tonic', [0, 5, 0, -6], 'The court is lively. Quite lively.'], ['Arrest him', [3, -3, 3, 0], 'Tonic confiscated. The guards are lively.']),
  c('clown', 'J', 'The Jester has "accidentally" got engaged to an ambassador. He asks for your blessing.', ['Bless them', [3, 4, 0, -3], 'A scandalous wedding. Everyone attends.'], ['Forbid it', [0, -4, 0, 0], 'The Jester vanishes. So does the ambassador.']),
  c('comet', 'O', 'A comet blazes overhead. I say doom. The astronomers say "ooh!"', ['Declare a holy day', [8, -3, 0, -4], 'The comet passes. Credit: yours.'], ['Viewing party', [-4, 8, 0, -5], 'Telescopes. Snacks. Nobody doomed.']),
  c('wolves', 'C', 'Wolves are bothering the sheep. The shepherd asks for ten soldiers. And a pie.', ['Send soldiers', [0, 6, -5, -3], 'Wolves leave. Pie remains.'], ['Wolves have rights', [0, -6, 0, 3], 'The wolves open a sheep restaurant.']),
  c('fireworks', 'M', 'A merchant sells fireworks. "Safe," he says, standing very far away.', ['Buy', [0, 10, -5, -8], 'Boom! Applause! Eyebrows singed.'], ['Ban them', [0, -5, 0, 2], 'The merchant sells them to the army.']),
  c('rival', 'N', 'A rival noble throws a bigger feast than yours. People are comparing. In public.', ['Outdo him', [0, 8, 0, -10], 'Bigger feast. Bigger hangover.'], ['Ignore it', [0, -6, 2, 0], 'His feast: legendary. Yours: modest.']),
]

export const LIFE_DECK: Card[] = [
  c('l-boss', 'M', 'Quick Saturday shift? For team spirit. Pizza is mentioned.', ['Sorry, plans', [6, 2, 3, -6], 'Your plans: couch. Spirit: intact.'], ['Fine', [-8, -4, -5, 14], 'You earn money. The couch weeps.']),
  c('l-move', 'C', 'A friend is moving and needs help carrying boxes. And a couch. And a piano.', ['Help', [3, 10, -8, 0], 'The piano wins. You limp.'], ['Back hurts', [-3, -8, 3, 0], 'Your back thanks you. Your friend sighs.']),
  c('l-gym', 'G', 'The gym offers a year pass for the price of two pizzas. You will definitely go.', ['Buy the pass', [-2, 0, 10, -8], 'You go twice. Both very impressive.'], ['Buy pizza', [7, 0, -7, -3], 'Delicious. Your jeans have notes.']),
  c('l-mom', 'Q', 'Mom calls. She has questions. Mostly about grandchildren.', ['Pick up', [-3, 10, 0, 0], 'Forty minutes. The cat gets a mention.'], ['Voicemail', [3, -8, 0, 0], 'Mom sends a very long voicemail.']),
  c('l-cat', 'D', 'A stray cat has moved in. It has not asked.', ['Adopt', [10, 4, 0, -5], 'The cat gives you a look. Approved.', { next: ['l-cat2', 6] }], ['Shoo', [-4, 0, 0, 0], 'The cat judges you from the window.']),
  c('l-cat2', 'D', 'The cat brought you a gift. It is a live gift. It is in your shoe.', ['Thank the cat', [8, 3, -3, 0], 'The cat is proud. The mouse is not.'], ['Scream', [-3, 0, -3, 0], 'The cat is offended. The mouse is delighted.'], true),
  c('l-raise', 'M', 'A raise, if you take a project "nobody wants". Nobody wants it.', ['Take it', [-6, -3, -5, 16], 'The project is a spreadsheet of spreadsheets.'], ['Decline', [4, 0, 3, -3], 'The project goes to Dave. Dave resigns.']),
  c('l-sick', 'P', 'Your head hurts. Probably the internet. Doctor\'s appointment: six weeks.', ['Book it', [-2, 0, 10, -8], 'Six weeks later: "drink water."'], ['Walk it off', [0, 0, -12, 0], 'You do not walk it off.']),
  c('l-party', 'C', 'The neighbour is throwing a party. You are invited. By shouting.', ['Go', [10, 8, -6, -4], 'You meet someone named Chad. Several.'], ['Earplugs', [-6, -6, 5, 0], 'Sleep. Peace. A weird guilt.']),
  c('l-date', 'Q', 'Someone cute asks you to dinner. They have a dog and a mortgage.', ['Yes', [8, 12, 0, -6], 'The dog is better company than you expected.'], ['No', [-5, -8, 0, 0], 'You tell yourself it was the mortgage.']),
  c('l-crypto', 'J', 'Your cousin has a coin tip. He is very certain. He was also certain about the pyramid scheme.', ['Invest', [0, -3, 0, -12], 'The coin is named after a dog. The dog is sad.'], ['No thanks', [0, 3, 0, 3], 'He sends you a meme. It is a loss.']),
  c('l-bills', 'T', 'Bills arrive in a charming stack. Rent, power, and one for "unspecified".', ['Pay all', [-3, 0, 0, -12], 'Adulthood: confirmed.'], ['Negotiate', [-6, -4, 0, -5], 'You call. You wait. You are now a hold-music expert.']),
  c('l-hobby', 'C', 'A pottery class! Calm. Cheap. Clay.', ['Sign up', [10, 3, 0, -4], 'You make a bowl. A bowl-ish thing.'], ['Scroll instead', [-4, -3, -3, 0], 'Three hours of videos about pottery.']),
  c('l-wedding', 'C', 'A friend\'s wedding is in Iceland. In winter. They are very proud of that.', ['Go', [8, 10, -4, -14], 'It is beautiful. You cannot feel your face.'], ['Send a gift', [-3, -6, 0, -3], 'The gift is a toaster. It is a nice toaster.']),
  c('l-roomie', 'N', 'Your roommate ate your leftovers. Again. With a note: "sorry."', ['Confront', [-3, -4, 0, 0], 'A civilised argument about sauce.'], ['Let it go', [4, 6, 0, -3], 'You buy a second lunch. Peace is expensive.']),
  c('l-startup', 'M', 'A startup wants you. Equity! A ping-pong table! No health insurance.', ['Accept', [-3, -3, -8, 14], 'Your desk is a ping-pong table.'], ['Decline', [3, 0, 3, -4], 'You keep your boring job. Your sanity thanks you.']),
  c('l-sleep', 'S', 'It is 3am. You are watching a documentary about octopuses. You are in too deep.', ['Sleep', [-3, 0, 10, 0], 'The octopus will wait.'], ['One more', [6, 0, -10, 0], 'Octopuses can taste with their arms. You are up.']),
  c('l-shelter', 'C', 'The local shelter needs volunteers. Dogs. So many dogs.', ['Join', [10, 6, -3, 0], 'Seventeen dogs now know your name.'], ['Skip', [-5, -3, 3, 0], 'You feel a faint, doggy guilt.']),
  c('l-car', 'N', 'The car makes a noise like a sad whale. The mechanic says "it is fine, probably."', ['Fix it', [-2, 0, 0, -12], 'The whale is silent. So is your wallet.'], ['Drive on', [3, 0, -8, 3], 'The whale sings louder. Better, really.']),
  c('l-vac', 'M', 'You have four vacation days. Your boss has "concerns".', ['Take them', [10, 6, 6, -6], 'A beach. A book. A sunburn.'], ['Work', [-10, -6, -6, 10], 'You get a mug that says "Employee of the Quarter".']),
  c('l-dinner', 'S', 'Dinner. You open the fridge: a lemon and a dream.', ['Cook', [4, 0, 5, -3], 'Pasta! Of a sort.'], ['Takeout', [6, 0, -5, -5], 'Delicious. The courier knows your name.']),
  c('l-bday', 'C', 'Friends plan a surprise party. Someone leaked it. It was you.', ['Act surprised', [8, 8, 0, -3], 'Oscar-worthy "wow!"'], ['Cancel', [-6, -6, 0, 2], 'The cake is eaten in silence.']),
  c('l-therapy', 'P', 'You read a book about boundaries. You will now set one. Today. With everyone.', ['Set it', [6, -4, 3, 0], 'Boundary set. Chat muted. Peace.'], ['Say yes to all', [-8, 6, -5, 2], 'You are now on three committees.']),
  c('l-rent', 'N', 'Landlord raises rent. "Market adjustments." The market is sneezing.', ['Pay', [-3, 0, 0, -12], 'You pay. The landlord buys a boat.'], ['Move out', [3, -4, -4, -5], 'Boxes. Tape. A new apartment smell.']),
  c('l-old', 'C', 'An old friend appears: "Remember me?" You do. Barely. They want to catch up. For hours.', ['Catch up', [6, 10, -3, 0], 'Three hours. Two coffees. Zero regrets.'], ['Too busy', [-3, -6, 3, 0], 'You promise to "do this again soon".']),
  c('l-side', 'S', 'You could sell crafts online. Or your time. Or your couch.', ['Start a hustle', [4, 0, -5, 10], 'A tiny shop. A tiny profit. A big headache.'], ['Rest', [3, 0, 5, -3], 'The couch remains unsold.']),
]

export const FIRST_CARD = (f: Flavor): Card => c('intro', 'P', f.intro, ['Swipe left', [2, 0, 0, 0], 'Left it is.'], ['Swipe right', [0, 2, 0, 0], 'Right it is.'])
