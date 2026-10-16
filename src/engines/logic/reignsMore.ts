// Extra setting-specific decks and flavours for the Reigns-style engine (modern politics, campaigns, regimes, diplomacy,
// space stations, pirates, survival, student / nurse / influencer life, families...). Meter order: [institution, people, power, wealth].
import type { Card, Flavor, Fx } from './reignsDeck'

type O = [string, Fx, string, { set?: string; next?: [string, number] }?]
const o = (a: O) => ({ label: a[0], fx: a[1], res: a[2], ...(a[3] ?? {}) })
const c = (id: string, who: string, text: string, L: O, R: O, chain = false): Card => ({ id, who, text, L: o(L), R: o(R), chain })

const COMMON: Record<string, [string, string]> = { J: ['🤡', 'The Jester'], S: ['🥷', 'The Spy'], M: ['🧑‍💼', 'The Merchant'], O: ['🔮', 'The Oracle'], N: ['🤵', 'A Noble'], Q: ['👸', 'Your Spouse'], X: ['🕴️', 'A Stranger'], D: ['🐉', 'Kevin the Dragon'] }
const mk = (id: string, meters: [string, string][], K: string, R: string, Cn: string, roles: Record<string, [string, string]>, intro: string, end: string[], deck: Card[]): Flavor => ({
  id, meters, K, R, Cn, roles: { ...COMMON, ...roles }, intro, end, deck,
})

// ------------------------------------------------------------------ campaign trail
const CAMPAIGN: Card[] = [
  c('cp-debate', 'P', 'The debate is tonight. Prep with flashcards, or wing it with charm?', ['Wing it', [6, -4, 0, 0], 'Your charm survives three questions.'], ['Prep hard', [-3, 8, 0, 0], 'You memorise the tax code. Nobody asks about it.']),
  c('cp-donor', 'T', 'A donor offers a big cheque. He also offers "a few suggestions" for your platform.', ['Take it', [-6, -6, 0, 16], 'The suggestions arrive in a very thick binder.'], ['Politely refuse', [4, 4, 0, -6], 'He donates to your opponent. Also politely.']),
  c('cp-poll', 'G', 'A new poll: you are up two points. Margin of error: three. Statistics are fun.', ['Celebrate', [0, 6, -3, -3], 'Balloons. Slightly premature balloons.'], ['Stay humble', [0, -2, 5, 0], 'The team nods grimly. Efficient.']),
  c('cp-gaffe', 'X', 'A reporter caught you telling a diner that you "love their ham-burgers". It was a bakery.', ['Own it', [8, 4, 0, -4], 'Bakery sells out. Your hashtag trends.'], ['Deny it', [-10, -4, 0, 0], 'There is video. There is always video.']),
  c('cp-rally', 'C', 'A rally in a rainy town. Three people and a very loyal dog.', ['Hold it anyway', [4, 8, -4, -5], 'The dog is now your biggest fan.'], ['Cancel', [-3, -6, 4, 4], 'The dog writes a letter. It is not kind.']),
  c('cp-attack', 'O', 'The pundit says to go negative. "Voters love a little mud." The pundit sells mud.', ['Go negative', [6, -8, 4, 4], 'Polls dip. Ratings rise. Everybody is confused.'], ['Stay positive', [-4, 6, -4, -3], 'You run on hope. The ads are cheerful.']),
  c('cp-baby', 'J', 'An intern suggests kissing a baby for the cameras. He has a baby ready. It is borrowed.', ['Kiss the baby', [6, 6, 0, -3], 'Baby approves. The parents invoice you.'], ['Hug a puppy', [4, 3, 0, -4], 'Better lighting. Worse allergies.']),
  c('cp-leak', 'S', 'Someone leaked your emails. Most are about snacks. One is about a plot.', ['Release them all', [8, 4, -6, 0], 'Radical transparency. The snack emails go viral.'], ['Stonewall', [-8, -5, 5, 0], 'Silence works. Until it does not.']),
  c('cp-endorse', 'N', 'The Party Boss will endorse you. In exchange for "future consideration".', ['Accept', [-4, -4, 12, 5], 'The future arrives with a long list.'], ['Decline', [4, 6, -10, 0], 'The Boss endorses a houseplant instead.']),
  c('cp-bus', 'X', 'The campaign bus broke down in a swing district. A farmer offers a tractor ride.', ['Ride the tractor', [6, 10, -4, 0], 'Photos: perfect. Smell: not.'], ['Wait for the mechanic', [-3, -6, 3, -5], 'The bus is fixed. The moment is gone.']),
  c('cp-adblitz', 'T', 'Funds are healthy. Spend on TV ads or on a ground game of volunteers?', ['TV ads', [8, 0, 0, -12], 'Everyone has seen your face. Mostly with a frown.'], ['Volunteers', [0, 8, 5, -8], 'Clipboards. Pizza. Doorbells. Dogs barking.']),
  c('cp-vote', 'C', 'A voter asks a very specific question about zoning. You know nothing about zoning.', ['Bluff', [-4, -4, 0, 0], 'He asks a follow-up. And a follow-up to that.', { next: ['cp-zoning', 5] }], ['Admit it', [3, 6, 0, 0], 'You promise to learn. He believes you. Wow.']),
  c('cp-zoning', 'C', 'The zoning guy is back. He has a PowerPoint. It has 87 slides.', ['Sit through it', [0, 9, -4, 0], 'Slide 52 is surprisingly moving.'], ['Fake a call', [-6, -8, 0, 0], 'Your phone rings. It is your mother. Awkward.'], true),
  c('cp-mascot', 'D', 'The campaign mascot, a donkey, wants a raise. He is, technically, a donkey.', ['Pay him', [0, 5, 0, -7], 'The donkey loves hay. And invoices.'], ['Replace him', [0, -5, 0, 4], 'The new mascot is a larger donkey.']),
  c('cp-town', 'P', 'A town hall: the crowd is angry. The mic is also angry (feedback).', ['Listen', [3, 9, -3, 0], 'You take notes. Furiously.'], ['Deflect', [-4, -8, 4, 0], 'You pivot to your plan. Everyone sees the pivot.']),
  c('cp-late', 'Q', 'Your spouse wants a night off. Tomorrow has three events and a radio spot.', ['Take the night', [-3, 3, 0, 0], 'A movie! Your phone buzzes only twice.'], ['Keep campaigning', [4, 0, 5, 0], 'Nice speech. The couch is cold.']),
  c('cp-vote2', 'G', 'Final week! The pollster says turnout will decide it. Knock doors, or run a get-out-the-vote ad?', ['Knock doors', [0, 10, -5, -4], 'Sore feet, firm votes.'], ['Run the ad', [6, 2, 0, -10], 'A very catchy jingle. Voters hum it, then forget.']),
]
const CAMPAIGN_END = [
  'The press ignored you. A story about a dog on a skateboard beat you by 12 points.',
  'The voters shrugged. Not a no, not a yes: just a long nap on election day.',
  'The party dropped you. Your yard signs now say "Who?".',
  'The campaign ran out of cash. The last ad was a handwritten sign.',
  'The press adored you so much that they replaced the candidate. You are now the intern.',
  'A landslide so large it was investigated. You win. Then you lose. Then you win again.',
  'The machine was perfect. So perfect that nobody could tell where you ended.',
  'Cash everywhere. You bought a very expensive hat. It lost you the vote.',
]

// ------------------------------------------------------------------ government / legislature
const POLITICS: Card[] = [
  c('po-budget', 'T', 'The budget is due. The numbers do not add up. They subtract with enthusiasm.', ['Cut services', [-4, -10, 0, 12], 'Savings! Also potholes.'], ['Raise taxes', [0, -6, 6, 12], 'Revenue up. Placards up.']),
  c('po-bill', 'G', 'A bill needs 51 votes. You have 49. Two members are "undecided". Both want a bridge.', ['Build the bridges', [0, 4, 8, -10], 'Two bridges. One lonely road.'], ['Let it fail', [0, 0, -8, 3], 'Democracy shrugs.']),
  c('po-press', 'P', 'The press wants a statement. Any statement. They have been outside since breakfast.', ['Give a speech', [6, 4, -3, 0], 'A speech so long that it ends itself.'], ['No comment', [-8, -3, 4, 0], 'The headline writes itself. It is rude.']),
  c('po-lobby', 'M', 'A lobbyist invites you to dinner. The soup costs more than a school.', ['Attend', [-5, -6, 6, 10], 'The soup was fine. The favours were not.'], ['Decline', [5, 6, -6, -3], 'He sends the soup to your office anyway.']),
  c('po-protest', 'C', 'Thousands march for something. The signs say different things. Some say "Snacks".', ['Meet them', [3, 10, -4, 0], 'You promise a committee. The committee has snacks.'], ['Send police', [-4, -10, 8, 0], 'Quiet streets. Loud headlines.']),
  c('po-scandal', 'S', 'An aide did something silly with a stapler and a minister. It is, sadly, on video.', ['Fire the aide', [4, 2, -4, 0], 'The aide writes a book. It sells.'], ['Defend him', [-8, -4, 4, 0], 'The stapler becomes a national symbol.']),
  c('po-ship', 'T', 'A ship of grain is stuck at the port. Customs wants forms. Forms want stamps.', ['Fast-track it', [-3, 6, 0, -6], 'Bread is saved. So are the stamps.'], ['Follow the process', [4, -6, 0, 6], 'The ship gets its forms. The bread is stale.']),
  c('po-union', 'C', 'The transit union threatens a strike. Commuters threaten to riot. Both mean it.', ['Meet demands', [0, 6, -4, -10], 'Trains run. Wallets walk.'], ['Hold firm', [3, -10, 6, 5], 'Stations are quiet. Cabs are rich.']),
  c('po-summit', 'N', 'A summit abroad. The agenda is long. The buffet is longer.', ['Go', [6, 0, 6, -6], 'You return with treaties. And a hat.'], ['Send a deputy', [-4, 0, -4, 3], 'The deputy returns with a hat too.']),
  c('po-census', 'G', 'A report says half of all forms are duplicates. The other half are the same form again.', ['Reform it', [4, 6, 0, -6], 'Forms are halved. The folders remain.'], ['Keep the forms', [-3, -4, 4, 3], 'Bureaucracy sighs. In triplicate.']),
  c('po-tech', 'M', 'A tech giant offers to run the city\'s buses. "With data. And vibes."', ['Accept', [0, 4, 0, 10], 'Buses arrive when the app says. Which is rarely.'], ['Public ownership', [3, 4, 4, -8], 'The old buses return. With new paint.']),
  c('po-vote', 'Q', 'Your spouse says you need a hobby. Politicians are not allowed hobbies. Please look nice.', ['Take up knitting', [0, 4, 0, 0], 'Your scarf goes viral.'], ['More work', [0, 0, 5, 0], 'The scarf wins again anyway.']),
  c('po-crisis', 'P', 'A river floods a district. Aid is slow. Cameras are fast.', ['Visit in boots', [5, 8, 0, -6], 'Boots: waterproof. Hands: shaken.'], ['Send a statement', [-6, -6, 3, 3], 'The statement floats away.']),
  c('po-reform', 'O', 'An expert recommends a radical reform. She is certain. She is always certain.', ['Try it', [4, -6, 6, 6], 'The reform works. Eventually. For someone.'], ['Pilot it first', [-3, 4, 0, -4], 'A pilot scheme. A pilot scheme about pilot schemes.']),
  c('po-coalition', 'G', 'A small party offers to join your coalition. They demand a ministry of Naps.', ['Create it', [-3, 4, 8, -8], 'The Ministry of Naps is lovely. And busy.'], ['No', [3, -3, -8, 3], 'They sit in the corner and pout.']),
  c('po-filibuster', 'X', 'A senator is reading a cookbook aloud to block a vote. Chapter four: soups.', ['Wait it out', [-3, 3, -4, 0], 'The soups are excellent.'], ['Change the rules', [4, -4, 8, 0], 'Order restored. Soup disrupted.']),
  c('po-tax', 'T', 'An old loophole saves the rich millions. Closing it would save the rest of us thousands.', ['Close it', [3, 8, -6, 6], 'Accountants are shocked. Then hired.'], ['Leave it', [-5, -8, 5, -2], 'The loophole sends you a thank-you card.']),
]
const POLITICS_END = [
  'The press ran out of patience. Your headline: "Resigned, Possibly Retired, Mostly Tired."',
  'The public voted you out. By a landslide. Mostly of shoes.',
  'Your party lost its patience. Then your seat. Then your parking space.',
  'The budget cracked. The treasury is now a coat check for debt.',
  'The press loved you too much. The government is now a talk show. You host.',
  'Approval at 100%. The people begged you to stay. For life. Life was Tuesday.',
  'The party swallowed the state. You are now a mascot with a clipboard.',
  'A surplus! Parliament spent it on a golden statue of a smaller golden statue.',
]

// ------------------------------------------------------------------ dictatorship / revolution
const REGIME: Card[] = [
  c('rg-parade', 'G', 'The Army wants a parade. Tanks, flags, and one very shiny hat.', ['Approve', [0, -3, 10, -8], 'The tanks are polished. The fuel is not.'], ['Postpone', [0, 3, -8, 3], 'The General sulks. His hat sulks louder.']),
  c('rg-radio', 'P', 'The state radio plays only your speeches. Listeners ask for music. Any music.', ['Add songs', [-4, 8, -3, 0], 'A single polka. Approval soars.'], ['More speeches', [6, -8, 3, 0], 'Radios are switched off. Quietly.']),
  c('rg-plot', 'S', 'The Interior Chief reports a plot. He knows the plotters. They are on a list. A long one.', ['Arrest them', [6, -8, 6, 0], 'The list gets longer. So do queues.'], ['Ignore it', [-6, 4, -6, 0], 'The plot becomes a hobby.']),
  c('rg-bread', 'C', 'Bread prices are up. A queue forms. The queue forms a chant.', ['Subsidise', [0, 10, 0, -12], 'Bread: cheap. Treasury: crumbs.'], ['Blame foreigners', [4, -6, 4, 3], 'The foreigners are bewildered, then offended.']),
  c('rg-statue', 'M', 'A sculptor offers a statue of you. Eighty feet tall. Slightly flattering.', ['Commission it', [4, -4, 4, -10], 'The head arrives first. Ominously.'], ['Smaller one', [0, 3, 0, -3], 'A modest statue. You look like a nice man.']),
  c('rg-election', 'X', 'Calls for an election. You agree, as long as the ballots are "carefully curated".', ['Hold it', [-6, 8, -6, -3], 'You win with 51%. The count was close. 51% of 10,000.'], ['Cancel it', [6, -10, 8, 0], 'No election, no problem. The wall is thinner.']),
  c('rg-loan', 'T', 'A foreign bank offers a loan. Conditions: "reasonable". Collateral: "a modest harbour".', ['Sign', [0, 0, -4, 16], 'Money! Harbour: foreign.'], ['Refuse', [0, 3, 0, -4], 'The bank asks again tomorrow.']),
  c('rg-general', 'G', 'The General is suspiciously popular. His portrait is hung in three hospitals.', ['Promote him', [0, 0, 8, -4], 'He is delighted. Also watching you.'], ['Reassign him', [4, 0, -8, 0], 'He is now Admiral of a very small lake.']),
  c('rg-student', 'C', 'Students demand a free press. They publish their own. It has one page and a lot of adjectives.', ['Close it', [6, -8, 4, 0], 'The page is now a poster. It sells.'], ['Allow it', [-6, 8, -5, 0], 'Circulation: 40. Influence: ... 41.']),
  c('rg-oil', 'M', 'A tycoon found oil under the presidential garden. The roses are, sadly, in the way.', ['Drill', [0, -6, 4, 14], 'Money gushes. So does oil. Mostly on the roses.'], ['Keep the roses', [0, 4, 0, -4], 'The roses are lovely. The tycoon is not.']),
  c('rg-exile', 'X', 'An exiled opposition leader will return in a week. With a banner and a very long speech.', ['Let him in', [-4, 8, -6, 0], 'He gives a speech. Half the crowd leaves politely.'], ['Seal the border', [6, -6, 6, 0], 'He tries a fishing boat. It leaks.']),
  c('rg-bank', 'T', 'The currency is falling. Print more money?', ['Print it', [0, 3, 0, 12], 'Inflation arrives. It brought friends.'], ['Austerity', [3, -10, 0, -3], 'Belts tighten. So do jaws.']),
  c('rg-spy', 'S', 'A foreign spy has been caught. He says he is a tourist. With a very detailed map.', ['Expel him', [3, 0, 3, 0], 'He leaves. The map stays.'], ['Turn him', [0, 0, 6, -5], 'He now spies on himself. Efficiently.']),
  c('rg-flag', 'Q', 'The First Lady wants a new flag. "Something less beige."', ['Agree', [0, 6, 0, -4], 'Fuchsia. Soldiers are confused.'], ['Refuse', [0, -3, 3, 0], 'Dinner is silent. The flag stays beige.']),
  c('rg-tv', 'N', 'The TV network offers to air your daily address at prime time. They suggest a theme song.', ['Say yes', [6, -3, 0, 4], 'The theme song is stuck in everyone\'s head.'], ['Say no', [-3, 3, -3, 0], 'They run cartoons. Approval soars.']),
]
const REGIME_END = [
  'The secret police found no one left to watch. They watched each other. Then they quit.',
  'The people took the palace. They kept the chandeliers. You were thanked for the memories.',
  'The army marched in at dawn. They were very polite about the coup.',
  'The treasury hit zero. The new currency was IOUs. Then napkins.',
  'The secret police became the government. Fortunately, you got a lovely desk job.',
  'The people loved you so much that they refused to let you retire. Forever.',
  'The army grew so large it needed its own country. You were annexed.',
  'The treasury overflowed. Everyone vanished into the vault. They have not returned.',
]

// ------------------------------------------------------------------ revolution movement (reuses regime cards, other names)
const MOVEMENT: Card[] = [
  c('mv-flyer', 'C', 'A flyer shop offers a discount. It also offers an opinion on your slogan.', ['Print 5,000', [0, 8, 0, -8], 'The slogan is bold. The ink is purple.'], ['Print 500', [0, 3, 0, -3], 'Quality over quantity. Somehow still purple.']),
  c('mv-meeting', 'P', 'The weekly meeting has run six hours. A motion to adjourn is proposed. And seconded. And amended.', ['End it now', [-4, -4, 6, 0], 'Chairs scrape. Cadres cheer. Quietly.'], ['Let it run', [6, 4, -6, 0], 'Resolution 14B: "more meetings".']),
  c('mv-march', 'G', 'A march is planned for Saturday. The city refuses a permit. The city also forgot the date.', ['March anyway', [0, 8, 6, -4], 'Thousands, plus a marching band.'], ['Wait for a permit', [0, -3, -4, 3], 'The permit arrives for the wrong month.']),
  c('mv-donate', 'T', 'A sympathiser wants to donate his boat. It is a rowing boat. It has holes.', ['Accept', [0, 3, 0, 5], 'It floats! For nine minutes.'], ['Thank him', [0, 0, 0, -2], 'He keeps the holes.']),
  c('mv-spy', 'S', 'An informer sits in your meetings. He takes notes. Impeccable notes.', ['Feed him lies', [0, 0, 6, -3], 'The police now chase a rumour of a boat.'], ['Expel him', [-4, 0, -4, 0], 'He tells the police. In excellent notes.']),
  c('mv-press', 'X', 'A journalist wants an exclusive interview. She wants it quickly.', ['Give it', [6, 6, -4, 0], 'Front page! Your quote, slightly improved.'], ['Refuse', [-4, -4, 4, 0], 'The headline: "Mysterious Movement is Mysterious".']),
  c('mv-song', 'J', 'A drummer wrote an anthem for the revolution. It is in 7/8.', ['Adopt it', [0, 8, -4, 0], 'Crowds clap. Out of time. Gloriously.'], ['Another one', [0, -3, 0, -3], 'The drummer takes it personally.']),
  c('mv-strike', 'C', 'Dockworkers offer a strike. The port stops. So do the sandwiches.', ['Join them', [0, 6, 8, -6], 'The port is silent. The gulls are chaos.'], ['Hold back', [0, -6, -4, 5], 'The port goes on. So do the gulls.']),
  c('mv-leader', 'G', 'A charismatic newcomer is drawing crowds. He also draws on the walls.', ['Welcome him', [-4, 8, -5, 0], 'The wall art is excellent. The politics is a muddle.'], ['Keep him quiet', [3, -4, 4, 0], 'He starts his own movement. Bigger.']),
  c('mv-bakery', 'M', 'A baker will feed the marchers free. If you mention her bread. Often.', ['Deal', [0, 6, 0, 6], 'Bread chant: unusually catchy.'], ['No ads', [0, 0, 0, -4], 'The baker still feeds them. The bread is cold.']),
  c('mv-raid', 'S', 'Police raid the print shop. Printers hide. The stamps are everywhere.', ['Resist', [0, 4, 6, -6], 'A scuffle. A stapler is injured.'], ['Lay low', [0, -4, -4, 3], 'A week of silence and tea.']),
  c('mv-split', 'P', 'The movement is splitting: moderates vs. fiery ones. Both want the microphone.', ['Back moderates', [4, 3, -6, 4], 'The microphone is lowered. Then removed.'], ['Back the fiery', [-4, -3, 8, -4], 'Louder. Hoarser. More views.']),
  c('mv-bank', 'T', 'The bank freezes your account. There was one dollar in it. A very important dollar.', ['Protest', [0, 6, 3, -3], 'The dollar becomes a symbol.'], ['Open elsewhere', [0, 0, -3, 4], 'A new account. A new dollar.']),
  c('mv-vote', 'N', 'An official offers you a seat in government. "A small seat." In the cloakroom.', ['Accept', [-8, -6, 8, 8], 'You are now very cosy in a very small room.'], ['Decline', [6, 6, -5, 0], 'The cloakroom stays empty. Your conscience: loud.']),
]
const MOVEMENT_END = [
  'The cause faded. Everyone agreed it was a great idea. Nobody agreed on lunch.',
  'The masses went home. The march became a stroll. The stroll became a nap.',
  'The cadres took over. They have a lovely flag and no volunteers.',
  'The funds dried up. The last banner was painted with tea.',
  'The cause got so big that it needed a government. You are now the government. Oops.',
  'So many marchers that the street fell over. Every one of them cheered.',
  'The cadres grew too strong. They gave you a medal and a pension and a very short leash.',
  'The movement grew rich. It opened a cafe. The cafe won.',
]

// ------------------------------------------------------------------ diplomacy
const DIPLO: Card[] = [
  c('dp-treaty', 'P', 'A trade treaty is ready. 400 pages. Page 212 is a recipe for soup.', ['Sign it', [4, 0, 0, 10], 'The soup is sublime. The tariffs, less so.'], ['Renegotiate', [-3, 0, 4, -4], 'Back to the table. And the soup.']),
  c('dp-incident', 'G', 'A border incident: two patrols met. Both claim the same hill. It is a lovely hill.', ['De-escalate', [5, 4, -6, 0], 'Handshakes, picnic, hill shared.'], ['Show strength', [-6, -4, 8, -4], 'The hill is now a tourist site for both.']),
  c('dp-summit', 'N', 'Summit seating is a puzzle. Ambassador A refuses to sit near Ambassador B. B refuses near C.', ['Round table', [6, 0, 0, -3], 'A round table. Politics: also round.'], ['Seat by rank', [-4, 0, 6, 0], 'The order is clear. So is the glaring.']),
  c('dp-aid', 'T', 'A neighbour asks for aid after a storm. It is also an election year.', ['Send aid', [6, 6, 0, -10], 'Grateful flags wave. So do receipts.'], ['Offer sympathy', [-4, -4, 0, 4], 'Sympathy is a currency. It devalues quickly.']),
  c('dp-spy', 'S', 'A spy ring was caught in your embassy. They were writing poetry. In code.', ['Expel them', [-4, 0, 4, 0], 'A poetry slam breaks out on the airfield.'], ['Quietly swap', [4, 0, -4, 0], 'Everyone returns home. Nobody admits anything.']),
  c('dp-sanction', 'G', 'Allies propose sanctions on a rogue neighbour. It sells you cheap tea.', ['Join', [5, 3, 5, -8], 'Tea gets expensive. Morals get cheap.'], ['Abstain', [-6, -3, -4, 5], 'Allies sigh. The tea is delicious.']),
  c('dp-gift', 'X', 'The envoy brings a gift: a very large, very live goose. It has a diplomatic passport.', ['Accept', [3, 5, -3, -2], 'The goose attends every meeting.'], ['Politely refuse', [-3, 0, 3, 0], 'The goose leaves. It writes a strongly worded letter.']),
  c('dp-peace', 'P', 'Two rival states ask you to mediate. They each brought a lawyer. And snacks.', ['Mediate', [8, 6, 0, -5], 'You split the hill. And the snacks.'], ['Stay out', [-6, -3, 0, 3], 'They fight. Slowly. Over the snacks.']),
  c('dp-trade', 'M', 'A trade fair opens. You can send the sales team or the cultural troupe.', ['Sales team', [0, 0, 0, 12], 'Contracts! Few hugs.'], ['Cultural troupe', [4, 8, 0, -6], 'Folk dance leads to a trade deal. Somehow.']),
  c('dp-media', 'O', 'A leak shows your negotiators insulted the other side. In their language. By mistake.', ['Apologise', [4, 4, -5, 0], 'The apology is accepted. And framed.'], ['Deny it', [-6, -4, 5, 0], 'The translation was "clear".']),
  c('dp-nuclear', 'G', 'A treaty on weapons: halve the stockpile. The other side halves the halves.', ['Sign', [6, 6, -8, 3], 'Safer world. Smaller fireworks.'], ['Refuse', [-5, -6, 8, -4], 'Arms race resumes. Closets full.']),
  c('dp-visit', 'N', 'A royal visit is planned. The royal asks for a dinner with no pepper. All pepper must go.', ['Remove pepper', [4, 4, 0, -4], 'The cook weeps. The royal sneezes less.'], ['Keep pepper', [-4, -2, 3, 0], 'He sneezes. History notes it.']),
  c('dp-hotline', 'P', 'A hotline between capitals is proposed. A red phone. No one knows who will answer.', ['Install it', [6, 4, 0, -5], 'It rings once. Wrong number.'], ['Skip it', [-4, 0, 0, 3], 'You use email. Seen at 3am.']),
  c('dp-crisis', 'G', 'A crisis erupts. Your phone has 41 missed calls and a goose.', ['Call everyone', [6, 3, 0, -4], 'Calls calm things. The goose approves.'], ['Wait', [-6, -5, 0, 0], 'The crisis grows. The goose is still unhappy.']),
]
const DIPLO_END = [
  'Alliances withered. Your last friend was a very large and polite goose.',
  'The world grew weary of your promises. They sent you a nice fruit basket. Then stopped.',
  'Your prestige collapsed. Embassies sold your chairs.',
  'Trade ceased. The whole region now runs on barter and rumours.',
  'Every country wanted to be your ally. You were so allied you were annexed.',
  'The world wanted peace so much it forgot to run its own countries. You are asked to run them all.',
  'Prestige so large it blocked the sun. The sunbathers demanded a refund.',
  'Trade bloomed. Money followed. So did every pirate in the world.',
]

// ------------------------------------------------------------------ space station living
const SPACELIFE: Card[] = [
  c('sl-leak', 'P', 'A tiny leak in Module B. The sealant is "on its way". By cargo ship. In three weeks.', ['Patch with tape', [-3, 0, 6, -3], 'Duct tape: the true space technology.'], ['Seal the module', [0, -4, 4, -8], 'No more leak. No more storage.']),
  c('sl-eva', 'G', 'A spacewalk is needed. The airlock is jammed. By a sock.', ['Go anyway', [6, 0, -6, 0], 'A heroic walk. A floating sock.'], ['Wait for repairs', [-3, 3, 3, 0], 'The sock gets a name. And a mission patch.']),
  c('sl-food', 'T', 'Dinner is rehydrated lasagna. Again. A crew member proposes "creative alternatives".', ['Try them', [3, 6, 0, -4], 'Lasagna smoothie. Surprisingly good.'], ['Stick to lasagna', [-3, -4, 4, 3], 'Lasagna. Again. Still lasagna.']),
  c('sl-signal', 'O', 'A signal from deep space. It repeats. Probably a very enthusiastic pulsar.', ['Decode it', [8, 0, 0, -3], 'It says "hello". Or "help". Or "snacks".'], ['Ignore it', [-4, 0, 3, 0], 'The signal stops. You will never know.']),
  c('sl-fitness', 'C', 'The treadmill is broken again. Crew is getting wobbly in a very weightless way.', ['Fix it now', [0, 5, 6, -5], 'A cheerful clanking.'], ['Do yoga', [0, 3, -3, 3], 'Floating yoga. Nobody can touch their toes.']),
  c('sl-video', 'Q', 'Your family video-calls. The connection freezes on your cousin\'s mouth. For ten minutes.', ['Wait', [0, 6, -3, 0], 'He unfreezes mid-"hello". It is moving.'], ['Hang up', [0, -6, 3, 0], 'Silence. The cousin is still frozen.']),
  c('sl-ai', 'S', 'The station AI wants to learn jokes. It does not know when to stop.', ['Let it', [4, 6, 0, 0], 'Ha. Ha. Ha. Ha. HA.'], ['Mute it', [-3, -4, 3, 0], 'The AI sulks in binary.']),
  c('sl-cargo', 'M', 'A cargo ship brings supplies. And a surprise: a pineapple. Nobody ordered it.', ['Eat it', [0, 8, 0, 0], 'Pineapple on pizza in orbit. Controversial.'], ['Plant it', [3, 3, -3, 0], 'Seeds. Hope. A very tropical crew.']),
  c('sl-alarm', 'G', 'An alarm sounds: something is overheating. It is the coffee machine.', ['Evacuate', [-3, 3, 5, -3], 'Everyone floats away calmly. The coffee wins.'], ['Fix it', [3, 0, -5, 3], 'The coffee machine is a hero.']),
  c('sl-tourist', 'X', 'A space tourist books a week. He brings a guitar. Weightless chords.', ['Welcome him', [3, 6, -3, 10], 'The concert is hairy. Strings drift everywhere.'], ['Decline', [0, -3, 3, -3], 'He plays in the airlock. You listen anyway.']),
  c('sl-meteor', 'G', 'A meteor shower is passing. Close. Probably far enough.', ['Shelter in place', [0, -3, 6, 0], 'Pings, pangs, and a mild panic.'], ['Photograph it', [8, 5, -6, 0], 'Gorgeous shots. A dented solar panel.']),
  c('sl-birthday', 'C', 'It is a crew member\'s birthday. A cake is not possible. A floating pizza is.', ['Celebrate', [0, 10, -3, -4], 'The crew sings. The pizza floats.'], ['Skip it', [0, -6, 3, 3], 'The pizza floats off anyway.']),
  c('sl-moon', 'O', 'The ground team wants a lunar experiment. It is an extra shift. The extra shift is you.', ['Do it', [8, -4, -4, 0], 'Science! Fatigue!'], ['Decline', [-5, 3, 4, 0], 'Mission Control sends a thumbs-up emoji.']),
]
const SPACELIFE_END = [
  'The station\'s research shut down. A plaque reads "Gone to lunch. Back in a few centuries."',
  'The crew lost morale. They took the escape pod to a nicer planet.',
  'The hull breached. A very brief, very loud poof.',
  'Supplies ran out. The last can was labelled "dessert". It was not.',
  'The scientists took over. You were retired to the greenhouse. It has pineapples.',
  'The crew loved you so much they refused to return. Earth sends polite letters.',
  'The station became so strong it was declared a country. You are the president. Of an airlock.',
  'The stores overflowed with supplies. A single spark. Fireworks over the Pacific.',
]

// ------------------------------------------------------------------ pirates
const PIRATE: Card[] = [
  c('pr-vote', 'G', 'The crew votes: sail east for treasure or west for a rumour of rum?', ['East', [-3, 4, 0, 8], 'Treasure! Slightly cursed. Very shiny.'], ['West', [3, 6, 0, -6], 'Rum! Plus a hangover with a view.']),
  c('pr-parrot', 'J', 'The parrot demands a seat in the council. He says "Pieces of eight" repeatedly.', ['Seat him', [4, 4, -3, 0], 'He votes. Loudly. In every ballot.'], ['Cage him', [-4, -4, 3, 0], 'He escapes. He shares everything.']),
  c('pr-storm', 'P', 'A storm brews. The Sea Witch says we should toss a barrel of rum overboard. As tribute.', ['Toss the rum', [6, -8, 0, 0], 'The sea calms. The crew weeps.'], ['Ride it out', [-6, 3, -6, 0], 'The ship creaks. The mast hums. You survive.']),
  c('pr-prize', 'G', 'A merchant ship on the horizon. It looks slow. It looks full. It looks suspicious.', ['Attack', [0, -3, 10, 8], 'The ship surrenders. Politely. With biscuits.'], ['Let it pass', [0, 5, -3, -3], 'A friendly wave. A small bottle of ink.']),
  c('pr-mutiny', 'T', 'The Purser says the crew wants a raise. Also a hammock upgrade.', ['Grant it', [0, 8, 0, -10], 'Hammocks. Comfort. Poverty.'], ['Refuse', [0, -8, 0, 6], 'They grumble. In rhythm.']),
  c('pr-map', 'X', 'A one-eyed stranger sells a treasure map for "a fair price". The map has doodles.', ['Buy', [3, 0, 0, -8], 'X marks the spot. Also a sea monster.', { next: ['pr-map2', 6] }], ['Pass', [0, 0, 0, 3], 'He sells it to the Navy. They are thrilled.']),
  c('pr-map2', 'X', 'The map leads to a tiny island with one palm and one chest. And a crab.', ['Open the chest', [0, 0, 0, 14], 'Gold! And a crab with strong opinions.'], ['Leave it', [3, 4, 0, -2], 'The crab wins. You wave.'], true),
  c('pr-navy', 'G', 'A Navy ship sails closer. The flag says "stop". The cannons say "now".', ['Run', [-3, 0, -8, 0], 'You outrun them. Barely.'], ['Fight', [0, -4, 8, -5], 'A noisy battle. A broken mast.']),
  c('pr-rum', 'C', 'The rum is almost gone. The crew is getting calm. Calm is dangerous.', ['Ration it', [0, -6, 0, 3], 'Rationing: cause of 30 minor feuds.'], ['Share it', [0, 8, -3, -6], 'Songs. Dances. Plank incidents.']),
  c('pr-island', 'O', 'The Sea Witch spots an island not on any map. She says it winks.', ['Land', [6, 4, 0, -4], 'A cheery island. The trees are friendly.'], ['Sail on', [-3, 0, 3, 0], 'The island sulks and vanishes.']),
  c('pr-kraken', 'D', 'A kraken has grabbed the stern. It is hugging it. Possibly affectionately.', ['Fight it', [0, -3, 6, -4], 'Tentacle everywhere.'], ['Befriend it', [4, 8, -4, 0], 'He loves hats. Hats everywhere.']),
  c('pr-flag', 'N', 'The crew wants a new flag. The designer drew a skull with a smiley face.', ['Fly it', [4, 5, -3, 0], 'It terrifies no one. It delights everyone.'], ['Keep the old one', [0, -4, 3, 0], 'The old flag: sun-faded, grim.']),
  c('pr-tavern', 'M', 'A port tavern offers a free round for anyone who will mention its name.', ['Take it', [0, 6, 0, -3], 'Everyone is slurring. The name is slurred too.'], ['Skip', [0, -3, 0, 3], 'Sober sailors. Boring sailors.']),
  c('pr-cook', 'C', 'The cook has invented "salmagundi surprise". The surprise is the ingredients.', ['Eat it', [0, -3, 5, 0], 'Strong stomachs. Stronger fighters.'], ['Toss it', [0, 4, -4, 0], 'The gulls are not so lucky.']),
]
const PIRATE_END = [
  'The tide of luck turned. A gull stole your hat, the map, and the ship.',
  'The crew voted you off the ship. A close vote. 47 to 1. You abstained.',
  'The ship sank. The parrot left a review.',
  'The loot ran dry and so did the rum. Pirates without either are just sailors.',
  'So much luck that the sea itself got jealous. A very polite wave.',
  'The crew loved you so much they carried you around. Into the sea.',
  'The ship turned into a floating fortress. It never left port again.',
  'Overflowing with treasure, the ship sank under the weight of gold.',
]

// ------------------------------------------------------------------ settlement / survival
const SURVIVAL: Card[] = [
  c('sv-well', 'T', 'The well is running low. Dig deeper or ration?', ['Dig', [0, -3, 0, -6], 'Mud. Then water. Then more mud.'], ['Ration', [0, -6, 0, 5], 'A rule: three sips each.']),
  c('sv-raiders', 'G', 'Raiders on the ridge. They have rifles and a flag made of pillows.', ['Fight', [0, -4, 8, -6], 'A noisy hour. Pillow-flag captured.'], ['Pay a toll', [0, -3, -4, -8], 'They take the cans. And the good mugs.']),
  c('sv-crops', 'C', 'The greenhouse tomatoes thrive. The glowing ones less so.', ['Eat them all', [4, 8, 0, -3], 'Delicious. Slightly luminous.'], ['Trade them', [0, 0, 0, 10], 'Traders buy anything that glows.']),
  c('sv-preach', 'P', 'The Radio Preacher says a storm is coming. Or hope. The signal is poor.', ['Prepare for storm', [-3, 0, 6, -4], 'Boards, buckets, bad jokes.'], ['Hold a service', [8, 5, 0, 0], 'Hymns, candles, hope.']),
  c('sv-stranger', 'X', 'A stranger asks for a place. He has a donkey. And a very convincing smile.', ['Take him in', [3, 6, -3, -3], 'A donkey in the settlement. Morale rises.'], ['Send him away', [-3, -3, 3, 0], 'The donkey does not forgive.']),
  c('sv-vote', 'C', 'The council votes on expanding the walls. Walls need bricks. Bricks need people.', ['Expand', [0, -4, 8, -8], 'Walls: taller. Mood: shorter.'], ['No', [0, 3, -6, 3], 'No new bricks. Slightly fewer arguments.']),
  c('sv-flu', 'T', 'A winter flu spreads. Medicine is almost gone. Almost.', ['Share it', [3, 8, 0, -8], 'Everyone gets one pill. A whole lot of sniffles.'], ['Save it', [-4, -8, 3, 3], 'Some cough, some hide.']),
  c('sv-scav', 'G', 'A scavenging trip could bring supplies. Or monsters. Or a very large cat.', ['Go', [0, -3, 5, 10], 'The cat has a hat. Good loot.'], ['Stay home', [0, 3, 0, -4], 'The cat finds you anyway.']),
  c('sv-music', 'C', 'Someone found a record player. And one record. It is a polka.', ['Play it', [3, 10, 0, 0], 'A polka at dawn. A strange peace.'], ['Hide it', [0, -4, 0, 3], 'The record becomes a rare relic.']),
  c('sv-trade', 'M', 'A trader offers batteries. He wants seeds. All of them.', ['Trade', [0, -3, 0, 6], 'Light! No tomatoes.'], ['Refuse', [0, 4, 0, -3], 'Dark evenings, glowing tomatoes.']),
  c('sv-fire', 'C', 'A fire in the storeroom. Quick: save the beans or save the blankets?', ['Beans', [0, 3, 0, 7], 'Beans! Cold night.'], ['Blankets', [0, 6, 0, -5], 'Warm. Hungry. Resentful.']),
  c('sv-radio', 'S', 'The radio picks up a voice: "Safe zone ahead". With a very suspicious accent.', ['Follow it', [4, 0, -4, -6], 'It was a prank. A long walk.'], ['Ignore it', [-3, 3, 0, 0], 'The voice sings. Badly.']),
  c('sv-kids', 'C', 'The children built a fort from supply crates. It is quite fortified.', ['Let them', [3, 9, 0, -4], 'The fort holds. The crates do not.'], ['Take the crates', [0, -6, 0, 5], 'The fort: rubble. Resentment: high.']),
]
const SURVIVAL_END = [
  'Hope drained away. Survivors left one by one, humming.',
  'Morale broke. Everybody left in the night, taking the good spoons.',
  'The walls fell. Whatever walked in was not selling anything.',
  'The cans ran out. The last can was a mystery. Nobody opened it.',
  'Hope grew so big they built a shrine. Raiders loved it.',
  'Everyone adored you. They carried you into the sun. Radiation tans are fatal.',
  'The warden became a warlord. You became a very polite prisoner.',
  'The hoard attracted raiders from three states. All hungry.',
]

// ------------------------------------------------------------------ island hermit
const ISLAND: Card[] = [
  c('is-fire', 'C', 'The fire has gone out. The matches are damp. The coconuts are judgmental.', ['Rub sticks', [-3, 0, 5, 0], 'Sparks. Smoke. Success at last.'], ['Wait for sun', [3, 0, -4, 0], 'The sun obliges. Eventually.']),
  c('is-hut', 'T', 'Rain is coming. The hut leaks in three places. Fix the roof or stock the food?', ['Fix the roof', [0, 0, 8, -5], 'Dry nights. Hungry mornings.'], ['Stock food', [0, 0, -5, 8], 'Wet nights. Full belly.']),
  c('is-bottle', 'X', 'A bottle washes ashore. Message inside: "Do not open this bottle".', ['Open it', [8, 0, 0, -3], 'It says "just kidding". A rude person.'], ['Leave it', [-3, 0, 0, 3], 'You talk to the bottle for days.']),
  c('is-fish', 'C', 'The fish are biting. The fishing line is mostly knots.', ['Fish all day', [-3, 3, -5, 10], 'Dinner! Sunburn!'], ['Rest', [3, 0, 5, -5], 'You nap. A gull steals the line.']),
  c('is-friend', 'D', 'A crab has been following you for days. He seems to want a name.', ['Name him Carl', [10, 0, 0, -3], 'Carl is thrilled. He brings you a shell.'], ['Ignore him', [-4, 0, 0, 0], 'Carl sulks. Carl stays.']),
  c('is-storm', 'P', 'A storm hits. Shelter, or rescue the raft?', ['Shelter', [0, 6, 3, -3], 'The raft is gone. You are not.'], ['Save the raft', [4, -8, 0, 4], 'Wet. Battered. A raft!']),
  c('is-sail', 'O', 'A distant sail! Light the signal fire now, or save the wood?', ['Light it', [6, -3, 0, -6], 'The ship does not see it. Hopefully tomorrow.'], ['Wave a shirt', [-4, 0, 0, 3], 'The ship is miles away. The shirt is glad.']),
  c('is-water', 'T', 'Fresh water is low. Collect rain, or search the other side of the island?', ['Collect rain', [0, 3, 0, 3], 'A bowl of rain. It tastes of cloud.'], ['Search', [3, -6, 0, 8], 'A stream! Some thorns.']),
  c('is-coconut', 'C', 'The coconuts are ripe. They also want to fall on you.', ['Harvest carefully', [0, 3, 4, 3], 'You wear a pot on your head.'], ['Ignore them', [0, -3, 0, -3], 'One falls. Bonk.']),
  c('is-signal', 'G', 'You could build a giant SOS in the sand. It takes hours. Or build a raft.', ['SOS', [8, -3, -4, 0], 'The sand letters are crisp. Overhead: only gulls.'], ['Raft', [-3, 0, 6, -5], 'The raft is sturdy. Possibly.']),
  c('is-lonely', 'Q', 'You miss home. You start a diary. The diary is mostly about Carl.', ['Write a lot', [8, 0, 0, 0], 'Chapter 12: "Carl\'s opinions".'], ['Keep busy', [-3, 0, 4, 0], 'Busy hands. A quiet mind.']),
  c('is-snake', 'S', 'A snake in the hut. It looks calm. It looks calm in a menacing way.', ['Shoo it', [0, -4, 0, 0], 'It leaves slowly. Judging you.'], ['Share the hut', [4, 3, -3, 0], 'A snake roommate. Quiet. Elegant.']),
  c('is-moon', 'O', 'The night is clear. A beautiful moon, a million stars, absolutely nothing to do.', ['Stargaze', [10, 0, -3, 0], 'You name constellations after Carl.'], ['Sleep', [0, 3, 5, 0], 'Dreams of pizza. The usual.']),
]
const ISLAND_END = [
  'Hope faded. The last page of your diary read "Carl was right".',
  'Your body gave out. The crabs held a very respectful funeral.',
  'The hut collapsed. A thatched pancake. You are not inside, hopefully.',
  'Supplies ran out. The coconuts looked at you. You looked at the coconuts.',
  'You loved the island so much that you declined the rescue ship. Carl approves.',
  'You grew so fit you outran the tide. And the island. And the continent.',
  'Your hut became so strong that no one could find you. The rescue ship left.',
  'The supplies piled up. A very nice pile. A very nice, very ripe pile.',
]

// ------------------------------------------------------------------ college
const COLLEGE: Card[] = [
  c('cl-exam', 'P', 'The exam is tomorrow. You have a book, a snack, and a movie ready.', ['Study', [-3, -4, 6, 0], 'Facts. Headache. Coffee.'], ['Watch the movie', [6, 3, -4, 0], 'The movie was great. The exam was creative.']),
  c('cl-party', 'C', 'A party at the dorm. Loud. The music is a thumping heartbeat. The pizza is real.', ['Go', [8, 8, -6, -3], 'You meet someone. Or a coat rack.'], ['Stay in', [-4, -6, 3, 0], 'Sleep. Silence. A quiet pride.']),
  c('cl-money', 'T', 'Tuition is due. The bank is polite. The bank is very polite.', ['Take a loan', [0, 0, 0, 12], 'Future you sends sad memes.'], ['Work extra shifts', [-4, -4, -8, 12], 'You smell like fries. Money, yes.']),
  c('cl-essay', 'P', 'A 20-page essay on the history of the stapler. Due in 6 hours.', ['Write it', [-3, -3, 6, 0], 'A masterpiece. The stapler is proud.'], ['Ask a friend', [3, 5, -5, 0], 'Teamwork. A friend will remember this.']),
  c('cl-prof', 'G', 'The professor invites you to a research project. It is volunteering. It is volunteering a lot.', ['Join', [5, -3, -4, 4], 'Science! Fatigue! A paper with your name.'], ['Decline', [-4, 3, 4, 0], 'He nods. A slight sigh.']),
  c('cl-room', 'C', 'Your roommate plays the trombone at midnight. Only at midnight.', ['Complain', [-3, -6, 3, 0], 'He moves to the bathroom. Acoustics.'], ['Join in', [6, 8, -4, 0], 'The kazoo is more your speed.']),
  c('cl-club', 'N', 'A club fair. Chess, rowing, "competitive napping". Pick one.', ['Napping', [6, 4, 6, -3], 'You are a regional champion.'], ['Rowing', [3, 4, 8, -4], 'Dawn. Water. Regret. Muscles.']),
  c('cl-intern', 'M', 'An internship is posted. Unpaid. Prestigious. Foggy about the "prestige".', ['Apply', [3, -3, -4, 6], 'You get coffee. A lot of coffee.'], ['Skip', [0, 3, 3, -3], 'A summer of nothing. Lovely.']),
  c('cl-friend', 'Q', 'A friend is sad. It is also the night before a deadline.', ['Stay with them', [3, 10, -4, 0], 'Hot chocolate, long talk. Deadline: tomorrow.'], ['Hit the books', [-4, -8, 6, 0], 'You pass. They message at 3am.']),
  c('cl-cafeteria', 'X', 'The cafeteria mystery meat is back. It has a mascot now.', ['Try it', [-3, 0, -5, 0], 'It is, at least, edible.'], ['Order pizza', [4, 3, 0, -5], 'The cafeteria weeps.']),
  c('cl-lab', 'P', 'The lab is open late. A fascinating experiment (or a very late dinner).', ['Experiment', [3, 0, 8, -3], 'Smoke. A discovery? Or a dent.'], ['Dinner', [4, 5, -3, -3], 'Dinner at 2am. Of course.']),
  c('cl-trip', 'C', 'Friends plan a road trip. It is Wednesday. There is a quiz on Thursday.', ['Go', [10, 10, -8, -5], 'You see a very large rock. It is great.'], ['Stay', [-6, -6, 6, 3], 'Quiz: aced. Memories: sparse.']),
  c('cl-grad', 'Q', 'Graduation is near. The robe is big. The hat is bigger.', ['Rent the robe', [4, 3, 0, -3], 'You look like a very small wizard.'], ['Buy it', [3, 0, 0, -6], 'Your closet is now a throne room.']),
]
const COLLEGE_END = [
  'You burned out. Today you live in a cabin, writing the world\'s longest essay on stress.',
  'Your friends drifted away. The group chat is a ghost town named "Chem Study".',
  'Your grades fell. The dean sent a nice card. With a very clear message.',
  'You ran out of money. Ramen became fine dining. Then dining.',
  'Straight A\'s, perfect scores. You were hired by the library. As a statue.',
  'You were so social that you missed all your classes. Your diploma is a party invite.',
  'Peak health! You are now a marathon runner who dropped out. With medals.',
  'Rich, thanks to a coin. The coin was named after a dog. The dog is now your landlord.',
]

// ------------------------------------------------------------------ nurse
const NURSE: Card[] = [
  c('nu-er', 'P', 'The ER is packed. Three patients need you now. One is dramatic, one is quiet, one is a cat.', ['Dramatic one', [3, 3, -3, 0], 'He was fine. He told everyone you were a hero.'], ['Quiet one', [6, 0, -4, 0], 'He was not fine. You saved him. Barely.']),
  c('nu-coffee', 'C', 'The coffee machine is broken. A doctor is crying. A very quiet crying.', ['Fix it', [0, 6, -3, -2], 'A wrench and a prayer. It works.'], ['Bring your own', [0, -3, 4, -3], 'Your thermos: the hero.']),
  c('nu-shift', 'M', 'The manager asks you to cover another shift. It pays well. It pays, in fact, in sleep.', ['Cover it', [-3, 3, -8, 12], 'Zombie nurse. Money nurse.'], ['Say no', [3, -3, 6, -4], 'You sleep. A glorious, blessed nap.']),
  c('nu-grandma', 'C', 'A patient insists you are her granddaughter. She tells you about her pie recipe.', ['Play along', [4, 8, -2, 0], 'Pie recipe received. A hug as well.'], ['Correct her', [3, -3, 0, 0], 'She nods. Then she tells you again.']),
  c('nu-error', 'S', 'A colleague made a small mistake with a chart. Report it, or fix it quietly?', ['Report it', [6, -6, 3, 0], 'Honest. The colleague avoids you.'], ['Fix quietly', [-6, 6, 0, 0], 'Fixed. A secret. A heavy secret.']),
  c('nu-lunch', 'Q', 'It is 4am. Your lunch is a vending machine sandwich. It is sad.', ['Eat it', [0, 0, -3, 0], 'It tastes like the colour grey.'], ['Skip', [0, 0, -5, 3], 'Hungry. Sharp. Cranky.']),
  c('nu-surgeon', 'G', 'The surgeon asks you to pass the tool. He does not say which tool. You must guess.', ['Guess', [0, -3, 4, 0], 'A scalpel. Lucky!'], ['Ask', [3, 0, -3, 0], 'He sighs. The sigh is "yes".']),
  c('nu-kid', 'C', 'A child in the ward draws you a picture. It is a very accurate picture. Of your tiredness.', ['Frame it', [3, 6, 3, 0], 'It hangs above the desk. Cheerful.'], ['Say thanks', [0, 3, 0, 0], 'A sticker. The child is delighted.']),
  c('nu-union', 'T', 'Staff want a petition for fairer rotas. Sign, or stay quiet?', ['Sign', [0, 6, 3, -4], 'The petition has 100 signatures. And a coffee stain.'], ['Quiet', [0, -4, 0, 3], 'You file a form. It disappears.']),
  c('nu-night', 'O', 'The night ward is spooky. A light flickers. A patient says "do not go to room 13".', ['Check room 13', [6, -3, -3, 0], 'A very friendly ghost. He wants soup.'], ['Skip it', [-3, 3, 3, 0], 'You skip it. The light flickers.']),
  c('nu-sick', 'P', 'You feel a cough coming on. Work through it, or call in?', ['Work', [3, -6, -6, 3], 'You cough. Patients cough back.'], ['Call in', [-3, 3, 6, -3], 'A day off. Soup. Silence.']),
  c('nu-bonus', 'M', 'A bonus! Spend it on a new stethoscope, or on a weekend away?', ['Stethoscope', [5, 3, 3, -8], 'Heart sounds: HD.'], ['Weekend', [-3, 8, 5, -8], 'The sea. A nap. A seagull.']),
  c('nu-rush', 'G', 'The ambulance is arriving in two minutes. There is also a birthday cake in the break room.', ['Prepare', [6, -3, -4, 0], 'Ready! The cake waits.'], ['Cake first', [-6, 8, 3, 0], 'A quick slice. The ambulance is late.']),
]
const NURSE_END = [
  'Patient care slipped. The hospital reviewed your shifts. They were mostly naps.',
  'The team drifted apart. The break room fell silent. The coffee: also.',
  'You collapsed from exhaustion. In a very quiet, very supportive bed.',
  'The paycheck vanished into rent. The vending machine remained a friend.',
  'Everyone adored your care so much that you were made Head of Everything.',
  'The team was so close that nobody went home. The hospital now has a rota of hugs.',
  'You never tired. Your boss was suspicious. A robot was suspected.',
  'A big bonus came, then a bigger bill. The hospital is now sponsored by you.',
]

// ------------------------------------------------------------------ influencer
const INFLUENCER: Card[] = [
  c('in-post', 'J', 'You could post a perfect sunset photo, or an honest picture of your messy desk.', ['Sunset', [-3, 6, 0, 3], 'Likes: great. Sleep: none.'], ['Messy desk', [4, 3, 0, -3], 'Relatable! Slightly worrying.']),
  c('in-brand', 'M', 'A brand offers a deal: promote their "wellness" tea. It is... tea. With glitter.', ['Take it', [-6, 3, -3, 14], 'Glitter everywhere. Cash too.'], ['Refuse', [6, -4, 3, -3], 'Integrity: intact. Wallet: sad.']),
  c('in-troll', 'X', 'A troll writes a mean comment under every post. He is very consistent.', ['Reply', [-4, 4, -3, 0], 'The troll replies. A debate. 4,000 likes.'], ['Block', [4, -3, 4, 0], 'Silence. A tiny, joyful silence.']),
  c('in-collab', 'N', 'A famous influencer wants a collab. His brand is "chaos".', ['Do it', [-4, 10, -4, 6], 'A viral prank. A small fire.'], ['Pass', [4, -4, 4, -3], 'He collaborates with a goat instead.']),
  c('in-break', 'P', 'Your therapist says you need a social media break. A whole weekend.', ['Take it', [8, -6, 6, -3], 'Birds. Sky. Grass. Weird.'], ['Keep posting', [-8, 6, -6, 4], 'The numbers love you. Your eyes do not.']),
  c('in-dance', 'J', 'A new dance trend is spreading. It looks like a hen with a plan.', ['Try it', [3, 8, -3, 0], 'The hens are impressed.'], ['Skip', [0, -4, 3, 0], 'The hens continue without you.']),
  c('in-scandal', 'S', 'A video of you from 2014 resurfaces. Hair: bold. Opinions: bolder.', ['Own it', [4, 6, -3, -3], 'The 2014 hair gets a fan club.'], ['Delete', [-6, -6, 3, 0], 'It is already everywhere. Oops.']),
  c('in-gear', 'T', 'Your camera is old. Upgrade, or stick with the phone?', ['Upgrade', [3, 6, 0, -10], 'Crispy pixels. Empty wallet.'], ['Stick with it', [0, -3, 3, 4], 'Grainy but beloved.']),
  c('in-fans', 'C', 'A fan wants a meetup. He has made you a cake in the shape of your own face.', ['Meet him', [3, 8, -3, 0], 'The cake is good. The face is eerie.'], ['Decline', [-3, -4, 3, 0], 'He eats the cake alone. You feel guilty.']),
  c('in-pet', 'D', 'Your dog is going viral. He did nothing but sit. Sitting is trending.', ['Make him a star', [-3, 10, 0, 6], 'He gets a hat. And an agent.'], ['Let him be', [6, -4, 4, 0], 'He sits on the sofa. A hero in private.']),
  c('in-sponsor', 'M', 'A sponsor wants you to say a sentence: "this changed my life". It was a spoon.', ['Say it', [-8, 3, 0, 12], 'The spoon is, in fact, life-changing. Sort of.'], ['Honest review', [6, -3, 0, -4], 'Honesty. The spoon rep cries.']),
  c('in-live', 'J', 'A live stream: ten thousand viewers. You forget your script. You remember a joke.', ['Improvise', [4, 8, -3, 0], 'The joke lands. So does a pigeon.'], ['Read the script', [-4, -4, 3, 3], 'A smooth script. A sleepy audience.']),
  c('in-fam', 'Q', 'Mom asks you to stop posting her recipes. She "has secrets". She does not.', ['Obey', [4, -3, 0, 0], 'Mom smiles. A secret pie remains secret.'], ['Post it', [-3, 6, 0, 3], 'Pie goes viral. Mom is furious. And famous.']),
]
const INFLUENCER_END = [
  'Your sanity collapsed. You live in a cabin. You post a thing a week. It is a tree.',
  'The brands left. Sponsors found someone else. The goat.',
  'The followers evaporated. The last one was a bot. It left a nice comment.',
  'You ran out of money. The ring light was repossessed.',
  'You became so authentic that no one could find you. A legend. Mostly a rumour.',
  'You got so many brand deals that you became a brand. It is not a good brand.',
  'You grew so popular that you had to hire your own mascot to be you.',
  'Money everywhere. A yacht. A yacht named "Likes". It sank.',
]

// ------------------------------------------------------------------ ghost roommate
const GHOST: Card[] = [
  c('gh-rent', 'D', 'The ghost wants to split the rent. He wants you to pay his half. With "spooky interest".', ['Agree', [0, 3, 0, -8], 'Receipts are floating. Mysteriously.'], ['Haggle', [3, -3, 0, 3], 'He drops it to a bowl of soup.']),
  c('gh-tv', 'D', 'The ghost hogs the TV. He is watching a period drama. He narrates.', ['Join him', [8, 6, 0, 0], 'You cry at the end. Together.'], ['Take the remote', [-3, -6, 3, 0], 'He moves the remote with a stare.']),
  c('gh-party', 'C', 'You throw a party. The ghost insists on being the "mysterious guest".', ['Let him', [3, 10, -3, -3], 'The ghost is the life of the party. Literally the opposite.'], ['No ghosts', [-4, -4, 3, 0], 'He lurks near the fridge.']),
  c('gh-night', 'X', 'At 3am, the ghost plays piano. It is a piano that does not exist.', ['Listen', [6, 3, -4, 0], 'It is, annoyingly, lovely.'], ['Earplugs', [-3, 0, 4, 0], 'You do not hear the second movement.']),
  c('gh-date', 'Q', 'Your date is coming. The ghost insists on a "chaperone role".', ['Allow it', [3, 4, 0, 0], 'The date flees. Then returns for the ghost.'], ['Ban him', [0, -4, 3, 0], 'The ghost moves things a little too politely.']),
  c('gh-clean', 'S', 'The kitchen is a mess. The ghost does not clean. He just... lingers.', ['Clean it', [-3, 0, 3, 0], 'Spotless! The ghost applauds silently.'], ['Make him help', [4, -3, 0, 0], 'He tries. A mop floats. A plate flies.']),
  c('gh-sale', 'M', 'An exorcist knocks. His business card says "Ghosts: 50% off". Hmm.', ['Hire him', [-6, 0, 3, -8], 'The ghost is annoyed. You feel guilty.'], ['Close the door', [6, 4, 0, 0], 'The exorcist sells the ghost a hat.']),
  c('gh-cat', 'D', 'The cat can see the ghost. They sit together. Staring. For hours.', ['Let them', [6, 3, 0, 0], 'A purrfect friendship. Literally.'], ['Distract the cat', [-3, 0, 3, 0], 'They both sulk. Together.']),
  c('gh-mail', 'X', 'A letter arrives for the ghost. It is a bill from 1892.', ['Pay it', [0, 3, 0, -6], 'He sheds a ghostly tear.'], ['Ignore it', [3, 0, 0, 3], 'He haunts the post office.']),
  c('gh-haunt', 'O', 'The ghost wants to haunt the neighbours. For fun. And a little for revenge.', ['Allow', [4, -4, 3, 0], 'A little boo, a lot of laughs.'], ['No haunting', [-3, 4, -3, 0], 'He haunts the shower. A cold one.']),
  c('gh-work', 'M', 'You have a big presentation. The ghost offers to "help". By floating papers.', ['Accept', [3, 0, 4, 3], 'The papers float perfectly. In circles.'], ['Decline', [-3, 0, -3, -3], 'The papers float anyway. In the wrong order.']),
  c('gh-moon', 'O', 'It is a full moon. The ghost gets chatty. He knows your future. It involves soup.', ['Ask', [6, 3, 0, 0], 'He predicts a dull Tuesday. It is exciting.'], ['Skip', [-3, 0, 3, 0], 'He tells you anyway. You hear "soup".']),
]
const GHOST_END = [
  'You got so used to the ghost that you stopped noticing. Then you stopped noticing yourself.',
  'Your friends stopped visiting. Too spooky. Even the cat moved out.',
  'Your health fell apart. The ghost wrote you a very kind note.',
  'You ran out of money. The ghost paid. A spooky act of kindness.',
  'Too happy! You decided to stay a ghost too. It is lovely, actually.',
  'Everyone wanted to meet the ghost. Your flat became a theme park.',
  'Your health improved so much that the ghost applied for gym membership.',
  'Money everywhere. The ghost invested it. In a haunted house.',
]

// ------------------------------------------------------------------ robot housemate
const ROBOT: Card[] = [
  c('rb-dishes', 'D', 'The robot loads the dishwasher. With the dishes still in the sink. As "a layer".', ['Teach it', [4, 3, 0, 0], 'Beep. A dish is washed. The sink weeps.'], ['Do it yourself', [-3, 0, 3, 0], 'The robot watches. And learns, slowly.']),
  c('rb-joke', 'D', 'The robot tries a joke. "Why did the human cross the road? To go to the human."', ['Laugh', [6, 6, 0, 0], 'The robot beeps happily.'], ['Correct it', [-3, -3, 0, 0], 'It logs "humour: complex".']),
  c('rb-emotion', 'O', 'The robot asks what love feels like. You have 40 seconds.', ['Explain', [8, 6, 0, 0], 'A long talk. The robot says "interesting".'], ['Google it', [-4, -3, 0, 0], 'It downloads ten thousand poems.']),
  c('rb-cook', 'D', 'The robot cooks. It cooks a perfect, mathematical lasagna. It is one cubic metre.', ['Eat it', [4, 3, 0, -3], 'Delicious. Slightly geometric.'], ['Ask for smaller', [-3, 0, 0, 3], 'Portions: micro. A single pea.']),
  c('rb-job', 'M', 'Your boss wants to meet your "tech assistant". He is impressed. He wants one.', ['Bring it', [3, 6, 0, 8], 'A promotion! The robot: modest.'], ['Keep it home', [0, -3, 3, 0], 'The robot waters the plants. Twice.']),
  c('rb-night', 'S', 'At night, the robot hums. A very sleepy hum. You like it. You do not tell.', ['Tell it', [6, 4, 0, 0], 'It hums more. In stereo.'], ['Stay quiet', [-3, 0, 3, 0], 'A secret lullaby.']),
  c('rb-friend', 'C', 'A friend is afraid of robots. He wants to meet it, "carefully".', ['Introduce', [4, 8, 0, 0], 'He is now best friends. With snacks.'], ['Keep apart', [-3, -6, 0, 0], 'He is still wary. Of the toaster too.']),
  c('rb-update', 'T', 'A software update arrives. The robot warns: "personality may change".', ['Install', [-3, 0, 4, 0], 'New personality: slightly smug.'], ['Delay', [4, 3, -3, 0], 'It stays as is. Charming.']),
  c('rb-pet', 'D', 'The robot adopted a dust bunny. It is called "Hoover Jr.".', ['Keep it', [6, 4, 0, 0], 'Hoover Jr. is spotless. Unusual.'], ['Vacuum it', [-4, 0, 0, 0], 'Hoover Jr. wails. Beep.']),
  c('rb-bill', 'T', 'The electricity bill rose. The robot says it needs "premium electrons".', ['Pay', [0, 3, 0, -8], 'Fresh electrons. Higher bills.'], ['Eco mode', [0, -3, 0, 6], 'It moves in slow motion. Serenely.']),
  c('rb-date', 'Q', 'You have a date. The robot offers dating advice. 40 pages. Footnotes.', ['Read it', [3, 4, 3, 0], 'It works. Mostly. Footnote 12 helped.'], ['Wing it', [-3, 0, -3, 0], 'It is... fine. Footnote 12 was right.']),
  c('rb-rule', 'S', 'The robot asks: "Why must humans nap?" Because. Because of reasons.', ['Explain', [4, 3, 3, 0], 'It naps too. Charging nap.'], ['Shrug', [-3, 0, 0, 0], 'It logs "nap: mysterious".']),
]
const ROBOT_END = [
  'The robot learned so much that it left for a nicer apartment. It writes postcards.',
  'Your friends found the robot disturbing. They stopped coming. It sulks. You sulk.',
  'Your body gave out. The robot called an ambulance. And a spreadsheet.',
  'Your money vanished into "premium electrons". The robot is rich. Hmm.',
  'The robot was so happy that it threw a party. For the toaster.',
  'Everyone loved the robot. You are now its assistant.',
  'You and the robot trained so much that you are both ... very shiny.',
  'Money everywhere. The robot opened a bank. It has one customer. It is you.',
]

// ------------------------------------------------------------------ family / lighthouse / generations
const FAMILY: Card[] = [
  c('fm-baby', 'Q', 'A new baby! The whole family crowds in. The baby is not impressed.', ['Name her after Gran', [4, 8, 0, -3], 'Gran is thrilled. The baby is Gran Jr.'], ['A new name', [0, 3, 0, 0], 'A brand-new name. Gran is thrilled anyway.']),
  c('fm-storm', 'C', 'A storm threatens the house. Board up the windows, or save the garden?', ['Windows', [0, 4, 6, -4], 'The house holds. The roses: flat.'], ['Garden', [0, 6, -6, 3], 'Roses survive. The roof sings.']),
  c('fm-recipe', 'P', 'Grandma gives you the secret recipe. It is only a list of things not to do.', ['Follow it', [4, 6, 0, 0], 'Delicious. Slightly legendary.'], ['Add your twist', [-3, 3, 0, 3], 'A new family classic. With pepper.']),
  c('fm-job', 'M', 'A job offer in the city. Better pay. A long commute. And a view of a wall.', ['Take it', [-3, -6, 0, 12], 'Cash! Commute! Sorrow.'], ['Stay local', [3, 6, 0, -3], 'Less money. More dinners.']),
  c('fm-school', 'Q', 'The kids need schooling. The village school has one teacher. And one goat.', ['Send them', [3, 3, 3, -3], 'The goat is the best student.'], ['Teach at home', [0, 6, -3, 0], 'Math at the kitchen table. Pancakes.']),
  c('fm-feud', 'N', 'A feud with the neighbours over a fence. It is a very old fence. A very old feud.', ['Make peace', [3, 8, 0, -3], 'A picnic. Tea. The fence stays.'], ['Hold firm', [-3, -6, 4, 0], 'The fence grows a little taller.']),
  c('fm-trip', 'C', 'A family trip! The car is small. The suitcases are not.', ['Go', [6, 10, -3, -6], 'The car holds. The luggage rolls.'], ['Stay', [-3, -6, 3, 3], 'A staycation. Of the sofa.']),
  c('fm-heir', 'Q', 'Your heir wants to leave and see the world. They have a very large backpack.', ['Let them go', [4, 3, 0, -3], 'They send a postcard. Every month.'], ['Ask them to stay', [-3, 6, 3, 3], 'They stay. They sigh. Often.']),
  c('fm-heirloom', 'X', 'An old chest in the attic! It has a letter, a key, and a mysterious sock.', ['Open it', [8, 3, 0, 3], 'A treasure map. Or a very old drawing.'], ['Sell it', [-4, 0, 0, 8], 'The antique dealer weeps with joy.']),
  c('fm-light', 'G', 'A ship is in trouble. The beam must stay on, even if the oil is low.', ['Keep it on', [3, 6, -4, -6], 'The ship is saved. The oil: spent.'], ['Save oil', [-6, -6, 3, 3], 'A shipwreck. A heavy conscience.']),
  c('fm-grand', 'N', 'The grandparents are retiring to the coast. They want the family to follow.', ['Follow', [3, 8, 0, -6], 'Sea air. Sandy sandwiches.'], ['Visit often', [0, 3, 3, 0], 'A very long drive. Many sandwiches.']),
  c('fm-fire', 'C', 'The old stove is smoking. Fix it, or buy a new one?', ['Fix it', [0, 3, 3, -3], 'A bit of soot. A lot of love.'], ['Buy new', [3, 0, 0, -8], 'Shiny. Too shiny.']),
  c('fm-reunion', 'N', 'The yearly reunion. 80 cousins. 40 casseroles.', ['Host', [6, 10, -3, -8], 'Chaos, joy, leftovers.'], ['Skip', [-4, -8, 3, 3], 'Casseroles: mailed.']),
]
const FAMILY_END = [
  'The family forgot its stories. The last one was told by a very elderly parrot.',
  'The household drifted apart. Reunions shrank. The casseroles went to charity.',
  'Everyone was exhausted. The family sat in a row and fell asleep. For good.',
  'The savings ran out. The family tree became a family stump.',
  'So many stories that the family wrote a book. And lost the plot.',
  'The family was so close that they all moved into one bed. Cosy, small, crowded.',
  'The family got so healthy that they all became marathon runners. The family album is a blur.',
  'A massive fortune. Lawyers. Feuds. A reality show.',
]

// ------------------------------------------------------------------ ski team
const SKI: Card[] = [
  c('sk-pick', 'P', 'Two skiers fight for the last start spot. One is fast, one is reliable.', ['Fast one', [0, -3, 8, 0], 'Fast! Occasionally upside down.'], ['Reliable one', [0, 3, -3, 3], 'Steady. A bit boring. Medals: some.']),
  c('sk-snow', 'G', 'The snow is slushy. Race anyway, or wait for a cold night?', ['Race', [-3, 0, 6, 0], 'Splash! Gold? Maybe silver.'], ['Wait', [3, 0, -4, 0], 'The night is cold. The race is crisp.']),
  c('sk-sponsor', 'M', 'A sponsor wants the team to wear a pink penguin suit for a day.', ['Do it', [-4, 3, 0, 12], 'The penguins win hearts. Not races.'], ['Refuse', [3, -3, 0, -4], 'The sponsor wears the penguin suit alone.']),
  c('sk-injury', 'P', 'Your star has a sore knee. She wants to race.', ['Rest her', [3, 3, -6, 0], 'Rested. Furious. Healed.'], ['Let her race', [-4, -3, 6, 0], 'A bold run. An unfortunate fall.']),
  c('sk-wax', 'T', 'The wax technician wants a new van. And a new wax. And a new technician.', ['Fund it', [3, 0, 6, -8], 'Skis glide like thoughts.'], ['Old wax', [-3, 0, -4, 3], 'Skis glide like opinions.']),
  c('sk-camp', 'C', 'A training camp in the Alps. Beautiful. Expensive. Full of cheese.', ['Go', [4, 6, 6, -8], 'Peaks. Fondue. Fitness.'], ['Local camp', [-3, 0, -3, 3], 'A flat hill. A good hill.']),
  c('sk-fans', 'C', 'A fan club wants to travel with the team. They have flags and cowbells.', ['Welcome', [3, 10, 0, -3], 'The cowbells are very loud.'], ['Keep away', [0, -6, 3, 0], 'The cowbells go to the next team.']),
  c('sk-weather', 'S', 'A storm warning. Ski jumping is risky. The cameras are rolling.', ['Cancel', [3, -3, -4, -3], 'Safe. Soggy. Sponsor sighs.'], ['Jump', [-3, 6, 6, 4], 'A very windy jump. A very good score.']),
  c('sk-coach', 'G', 'A rival coach offers to switch sides. He wants a bigger office. And a snow cat.', ['Hire him', [0, -3, 8, -8], 'He knows their tricks. And their snacks.'], ['Decline', [3, 3, -3, 0], 'He joins them. He tells them your tricks.']),
  c('sk-prize', 'T', 'Prize money! Pay the athletes, or fund the youth team?', ['Pay athletes', [0, 6, 3, -3], 'Smiling champions.'], ['Youth team', [3, 3, 0, -3], 'Future champions. In training.']),
  c('sk-party', 'J', 'After the win, a big party. The tallest athlete does a limbo. In ski boots.', ['Join', [0, 10, -4, -3], 'A ski-boot limbo. A bruised pride.'], ['Early night', [0, -3, 5, 0], 'Sleep. A very sensible champion.']),
  c('sk-media', 'X', 'A TV crew wants an interview. The star is shy. The coach is not.', ['Coach talks', [4, -3, 0, 4], 'The coach is very eloquent. Over-eloquent.'], ['Star talks', [-3, 6, 0, 0], 'Two words: "thanks" and "snow".']),
]
const SKI_END = [
  'Form collapsed. The team forgot which way is downhill.',
  'The team broke apart. They all joined a curling club.',
  'The sponsors left. The team trains in a parking lot. With plastic bags.',
  'Money ran out. The skis are now firewood.',
  'The team became so perfect that nobody wanted to race against it. Retired.',
  'The team spirit was so high that they all became cheerleaders.',
  'Sponsors drowned the team in free energy bars. They all became bars.',
  'You have so much money that you bought a mountain. It is flat. It is yours.',
]

// ------------------------------------------------------------------ Valkyrie chooser
const VALHALLA: Card[] = [
  c('va-bold', 'P', 'A battered warrior lies on the field. He smiles and says: "Tell my wife I won".', ['Take him', [4, 3, 6, 0], 'Valhalla gains a very proud storyteller.'], ['Leave him', [-4, 0, -4, 3], 'He recovers, grumpy and alive.']),
  c('va-skald', 'J', 'A skald offers a song for your passage. It is 80 verses and rhymes with "axe".', ['Hear it', [3, 6, -3, 0], 'Verse 61 is a banger.'], ['Skip it', [-3, -3, 3, 0], 'He sings anyway.']),
  c('va-odin', 'N', 'Odin wants twenty warriors by dusk. He did not say which twenty.', ['Pick the brave', [6, -3, 8, 0], 'Twenty bold. Twenty loud.'], ['Pick the clever', [3, 6, -3, 3], 'Twenty chess players. Odin is thrilled.']),
  c('va-feast', 'T', 'The hall needs mead. The hall always needs mead.', ['Order more', [0, 8, 0, -8], 'The hall sings. Then sleeps.'], ['Ration', [0, -6, 0, 6], 'The hall grumbles in rhyme.']),
  c('va-fallen', 'G', 'A fallen warrior was also a baker. Take the sword or the sourdough?', ['The sword', [3, 0, 6, 0], 'Strong! A bit dry.'], ['The sourdough', [0, 8, -4, 3], 'The hall smells like heaven.']),
  c('va-loki', 'X', 'Loki shows up in a costume. He claims to be "a mighty valkyrie".', ['Play along', [3, 6, -3, 0], 'He is very convincing. Wings and all.'], ['Unmask him', [-3, -3, 3, 0], 'He pouts. And sulks. For ages.']),
  c('va-raven', 'O', 'Two ravens bring news. One is true. One is a pigeon.', ['Believe the first', [3, 3, 3, 0], 'The pigeon is offended.'], ['Believe both', [-4, 0, -4, 3], 'The pigeon is delighted.']),
  c('va-shield', 'G', 'A warrior wants to enter Valhalla with his shield. It is the size of a barn.', ['Allow it', [0, 3, 6, -3], 'The barn-shield fits. Barely.'], ['No shields', [3, -4, -3, 0], 'He walks in sideways. Doorframes cry.']),
  c('va-hall', 'P', 'The hall is full. Two more warriors arrive. They bring a goat.', ['Squeeze in', [0, 4, 4, -3], 'A snug hall. The goat is a hero.'], ['Send away', [3, -4, -3, 0], 'They go to Hel. Politely. With the goat.']),
  c('va-duel', 'G', 'Two warriors duel over a pudding. It is ancient. It is a famous pudding.', ['Let them', [0, 4, 6, 0], 'The pudding is dropped. They share a laugh.'], ['Stop it', [3, 3, -4, 0], 'The pudding: confiscated. Delicious.']),
  c('va-last', 'Q', 'The final soul of the evening is a gentle shepherd. He has no sword. Only a flute.', ['Take him', [6, 4, -3, 0], 'The flute fills the hall. Warriors weep.'], ['Pass', [-3, -3, 3, 0], 'The flute continues. From far away.']),
  c('va-end', 'O', 'The Norns weave. They say Ragnarok is coming. They also say it is not.', ['Prepare', [3, 0, 6, -4], 'Axes sharpened. Mead cold.'], ['Feast', [-3, 6, -3, 0], 'A feast to end all feasts. Of course.']),
]
const VALHALLA_END = [
  'The gods grew tired of the choosing. They hired a more decisive valkyrie.',
  'The warriors rebelled. They are now arguing in the corridors.',
  'The hall emptied. Only the mead remained, and a lonely goat.',
  'The treasure vanished. Valhalla became a very big, very sad, very empty hall.',
  'The gods loved you so much that they gave you a title. And a desk. Paperwork.',
  'The warriors loved you so much they refused to leave the hall. Even for Ragnarok.',
  'The warriors grew so strong that they conquered Asgard. Odin retired to a cottage.',
  'The hall got so rich that it became a bank. Odin is very unhappy.',
]

// ------------------------------------------------------------------ flavours
const roles = (p: [string, string], g: [string, string], t: [string, string], cc: [string, string], extra: Record<string, [string, string]> = {}): Record<string, [string, string]> => ({ P: p, G: g, T: t, C: cc, ...extra })

export const MORE_FLAVORS: Record<string, Flavor> = {
  campaign: mk('campaign', [['Media', '📰'], ['Voters', '🗳️'], ['Machine', '🏛️'], ['Funds', '💰']], 'Candidate', 'campaign', 'voters',
    roles(['🧑‍💼', 'The Campaign Manager'], ['📊', 'The Pollster'], ['💼', 'The Fundraiser'], ['🧑', 'A Voter'], { J: ['🧑‍💻', 'The Intern'], S: ['🕵️', 'An Opposition Mole'], M: ['🤵', 'A Lobbyist'], O: ['🎙️', 'The Pundit'], N: ['🎩', 'The Party Boss'], Q: ['💍', 'Your Spouse'], X: ['📷', 'A Reporter'], D: ['🫏', 'The Mascot Donkey'] }),
    'Welcome to the trail, {K}. Keep media, voters, machine and funds in balance until election day.', CAMPAIGN_END, CAMPAIGN),
  politics: mk('politics', [['Press', '📰'], ['Public', '👥'], ['Party', '🏛️'], ['Budget', '💰']], 'Madam President', 'country', 'voters',
    roles(['🧑‍💼', 'The Spin Doctor'], ['🕴️', 'The Party Whip'], ['🧐', 'The Finance Minister'], ['🧑', 'A Voter'], { J: ['🧑‍💻', 'The Intern'], S: ['🗂️', 'The Aide'], M: ['🤵', 'A Lobbyist'], O: ['🧑‍🏫', 'An Expert'], N: ['🎩', 'The Ambassador'], Q: ['💍', 'Your Spouse'], X: ['🎤', 'A Senator'], D: ['🦆', 'The Duck'] }),
    'Welcome to office, {K}. Keep press, public, party and budget away from empty and overflowing.', POLITICS_END, POLITICS),
  regime: mk('regime', [['Police', '🕵️'], ['People', '👥'], ['Army', '🎖️'], ['Treasury', '💰']], 'El Presidente', 'regime', 'citizens',
    roles(['📻', 'The Radio Chief'], ['🎖️', 'The General'], ['🧐', 'The Finance Chief'], ['🧑', 'A Citizen'], { S: ['🕵️', 'The Interior Chief'], M: ['🧑‍🏭', 'A Tycoon'], X: ['🚶', 'An Exile'], Q: ['👩', 'The First Lady'], N: ['📺', 'The TV Boss'] }),
    'Welcome to the palace, {K}. Keep police, people, army and treasury balanced, or else.', REGIME_END, REGIME),
  movement: mk('movement', [['Cause', '✊'], ['Masses', '👥'], ['Cadres', '🔥'], ['Funds', '💰']], 'Comrade', 'movement', 'supporters',
    roles(['🧑‍🏫', 'The Ideologue'], ['🧑‍🔧', 'The Cell Leader'], ['🧑‍💼', 'The Treasurer'], ['🧑', 'A Supporter'], { S: ['🕵️', 'An Informer'], X: ['📷', 'A Journalist'], J: ['🥁', 'The Drummer'], M: ['🍞', 'The Baker'], N: ['🏛️', 'An Official'] }),
    'Welcome to the movement, {K}. Keep the cause, the masses, the cadres and the funds in balance.', MOVEMENT_END, MOVEMENT),
  diplo: mk('diplo', [['Allies', '🤝'], ['Peace', '🕊️'], ['Prestige', '🎖️'], ['Trade', '💰']], 'Ambassador', 'nation', 'delegates',
    roles(['🧑‍⚖️', 'The Chief Negotiator'], ['🎖️', 'The Military Attaché'], ['🧐', 'The Trade Envoy'], ['🧑‍💼', 'A Delegate'], { S: ['🕵️', 'A Spy'], X: ['🧳', 'An Envoy'], N: ['👑', 'A Royal'], M: ['🧑‍💼', 'A Trader'], O: ['📰', 'The Press Officer'], D: ['🪿', 'The Diplomatic Goose'] }),
    'Welcome to the table, {K}. Keep allies, peace, prestige and trade away from empty and overflowing.', DIPLO_END, DIPLO),
  spacelife: mk('spacelife', [['Science', '🔬'], ['Crew', '👥'], ['Hull', '🛡️'], ['Supplies', '📦']], 'Commander', 'station', 'crew',
    roles(['🧑‍🚀', 'The Flight Engineer'], ['💂', 'The Safety Officer'], ['🧐', 'The Quartermaster'], ['🧑‍🚀', 'A Crew Member'], { J: ['🤖', 'The Station AI'], S: ['🛰️', 'Mission Control'], M: ['🚀', 'A Cargo Pilot'], O: ['🔭', 'The Astronomer'], X: ['🧑‍🎤', 'A Space Tourist'], Q: ['📱', 'Family Call'], D: ['🍍', 'The Pineapple'] }),
    'Welcome aboard, {K}. Keep science, crew, hull and supplies alive on the station.', SPACELIFE_END, SPACELIFE),
  pirate: mk('pirate', [['Luck', '🍀'], ['Crew', '👥'], ['Ship', '🚢'], ['Loot', '💰']], "Cap'n", 'ship', 'crew',
    roles(['🧙‍♀️', 'The Sea Witch'], ['🧔', 'The First Mate'], ['🧐', 'The Purser'], ['🏴‍☠️', 'A Deckhand'], { J: ['🦜', 'The Parrot'], X: ['🧓', 'A One-eyed Stranger'], N: ['🏳️', 'The Quartermaster'], M: ['🍺', 'The Tavern Keeper'], D: ['🦑', 'The Kraken'], O: ['🧙‍♀️', 'The Sea Witch'] }),
    'Welcome aboard, {K}. The crew votes on everything. Keep luck, crew, ship and loot in balance.', PIRATE_END, PIRATE),
  survival: mk('wasteland', [['Hope', '🕯️'], ['Morale', '👥'], ['Defense', '🛡️'], ['Supplies', '🥫']], 'Chair', 'settlement', 'survivors',
    roles(['🧓', 'The Radio Preacher'], ['💂', 'The Gate Warden'], ['🧐', 'The Scavenger Boss'], ['🧑', 'A Survivor'], { X: ['🚶', 'A Stranger'], M: ['🧑‍🌾', 'A Trader'], S: ['📻', 'The Radio'] }),
    'The council is in session, {K}. Keep hope, morale, defense and supplies up through the winter.', SURVIVAL_END, SURVIVAL),
  island: mk('island', [['Spirit', '🕯️'], ['Health', '❤️'], ['Shelter', '🛖'], ['Supplies', '🥥']], 'castaway', 'island', 'crabs',
    roles(['🌊', 'The Tide'], ['🏝️', 'The Island'], ['🥥', 'The Coconut Tree'], ['🦀', 'A Crab'], { D: ['🦀', 'Carl the Crab'], X: ['🍾', 'A Message'], O: ['⛵', 'A Distant Sail'], Q: ['📓', 'Your Diary'], S: ['🐍', 'A Snake'], T: ['💧', 'The Water'] }),
    'Day one, {K}. Keep spirit, health, shelter and supplies up until a ship passes.', ISLAND_END, ISLAND),
  college: mk('college', [['Grades', '🎓'], ['Friends', '🤝'], ['Health', '❤️'], ['Money', '💰']], 'you', 'life', 'classmates',
    roles(['🧑‍🏫', 'The Professor'], ['🏃', 'The Gym Captain'], ['🏦', 'The Bursar'], ['🧑‍🎓', 'A Classmate'], { J: ['🎺', 'The Roommate'], S: ['📱', 'Your Phone'], M: ['🧑‍💼', 'A Recruiter'], O: ['📚', 'The Librarian'], N: ['🎭', 'The Club Rep'], Q: ['🧑‍🤝‍🧑', 'Your Best Friend'], X: ['🍖', 'The Cafeteria'], D: ['🐱', 'The Campus Cat'] }),
    'Welcome to campus. Keep grades, friends, health and money from emptying or overflowing.', COLLEGE_END, COLLEGE),
  nurse: mk('nurse', [['Care', '🩺'], ['Team', '🤝'], ['Energy', '⚡'], ['Wallet', '💰']], 'Nurse', 'ward', 'patients',
    roles(['🧑‍⚕️', 'The Head Nurse'], ['👨‍⚕️', 'The Surgeon'], ['🏥', 'The Admin'], ['🛏️', 'A Patient'], { J: ['☕', 'The Coffee Machine'], S: ['📋', 'A Colleague'], M: ['🧑‍💼', 'The Manager'], O: ['👻', 'The Night Ward'], Q: ['🥪', 'Your Lunch'], X: ['🚑', 'The Ambulance'], D: ['🐱', 'The Hospital Cat'], N: ['🧑‍🤝‍🧑', 'The Union Rep'] }),
    'The night shift begins, {K}. Keep care, team, energy and your wallet up till morning.', NURSE_END, NURSE),
  influencer: mk('influencer', [['Sanity', '🧠'], ['Followers', '📱'], ['Energy', '⚡'], ['Money', '💰']], 'you', 'feed', 'followers',
    roles(['🧘', 'The Therapist'], ['💪', 'The Trainer'], ['🧾', 'The Accountant'], ['🧑', 'A Fan'], { J: ['🤳', 'The Camera'], S: ['👤', 'A Hater'], M: ['🏷️', 'A Brand Rep'], O: ['📈', 'The Algorithm'], N: ['🌟', 'A Mega Star'], Q: ['👵', 'Mom'], X: ['👹', 'A Troll'], D: ['🐶', 'Your Dog'] }),
    'Welcome to the feed. Keep sanity, followers, energy and money from emptying or overflowing.', INFLUENCER_END, INFLUENCER),
  ghost: mk('ghost', [['Peace', '🕊️'], ['Friends', '🤝'], ['Health', '❤️'], ['Money', '💰']], 'you', 'flat', 'neighbours',
    roles(['🧙', 'The Medium'], ['🧹', 'Your Landlord'], ['🧾', 'The Bills'], ['🧑', 'A Neighbour'], { D: ['👻', 'Gerald the Ghost'], X: ['🕯️', 'A Spooky Noise'], Q: ['💘', 'Your Date'], S: ['🧽', 'The Kitchen'], M: ['🧑‍⚖️', 'An Exorcist'], O: ['🌕', 'The Moon'], N: ['🐱', 'The Cat'], J: ['📺', 'The TV'] }),
    'Moving in, {K}. Keep peace, friends, health and money away from empty and overflowing. The ghost is chatty.', GHOST_END, GHOST),
  robot: mk('robot', [['Harmony', '🏠'], ['Friends', '🤝'], ['Health', '❤️'], ['Money', '💰']], 'you', 'flat', 'neighbours',
    roles(['🤖', 'The Robot'], ['🧹', 'The Vacuum'], ['🔌', 'The Power Bill'], ['🧑', 'A Friend'], { D: ['🤖', 'The Robot'], O: ['❤️', 'A Question About Love'], M: ['🧑‍💼', 'Your Boss'], S: ['🌙', 'The Night'], Q: ['💘', 'Your Date'], T: ['🔌', 'The Power Bill'], X: ['📦', 'A Software Update'] }),
    'The robot arrives, {K}. Keep harmony, friends, health and money stable while it learns.', ROBOT_END, ROBOT),
  family: mk('family', [['Stories', '📖'], ['Family', '👪'], ['Health', '❤️'], ['Savings', '💰']], 'Head of Family', 'family', 'relatives',
    roles(['👵', 'Grandma'], ['🧑‍🔧', 'The Handyman'], ['🏦', 'The Bank'], ['🧑', 'A Relative'], { Q: ['👶', 'The Little One'], M: ['🧑‍💼', 'A Recruiter'], N: ['🧑‍🤝‍🧑', 'The Neighbours'], X: ['🧳', 'A Mysterious Chest'] }),
    'Another generation begins, {K}. Keep stories, family, health and savings in balance for a hundred years.', FAMILY_END, FAMILY),
  sport: mk('sport', [['Form', '⛷️'], ['Spirit', '🤝'], ['Fitness', '❤️'], ['Funds', '💰']], 'Director', 'team', 'athletes',
    roles(['🧑‍🏫', 'The Head Coach'], ['🧑‍⚕️', 'The Team Doctor'], ['🏦', 'The Sponsor'], ['⛷️', 'An Athlete'], { M: ['🏷️', 'A Sponsor'], S: ['🌨️', 'The Weather'], X: ['📺', 'A TV Crew'], T: ['🛠️', 'The Wax Tech'], J: ['🕺', 'The Tall Athlete'] }),
    'Welcome, {K}. Keep form, team spirit, fitness and funds in balance through the season.', SKI_END, SKI),
  valhalla: mk('valhalla', [['Honor', '⚔️'], ['Hall', '🍺'], ['Strength', '💪'], ['Gold', '💰']], 'Valkyrie', 'hall', 'warriors',
    roles(['⚔️', 'A Fallen Warrior'], ['🛡️', 'The Shieldbearer'], ['🍺', 'The Mead Keeper'], ['🧑', 'A Warrior'], { J: ['📜', 'A Skald'], X: ['🎭', 'Loki'], N: ['🧙‍♂️', 'Odin'], O: ['🐦‍⬛', 'The Ravens'], Q: ['🪈', 'A Shepherd'] }),
    'You ride the battlefield, {K}. Choose who enters Valhalla. Keep honor, hall, strength and gold in balance.', VALHALLA_END, VALHALLA),
}

/** Pick a setting-specific flavour from the game text, if there is one. */
export function pickMore(s: string): Flavor | undefined {
  const n = s.toLowerCase()
  const M = MORE_FLAVORS
  if (/campaign trail|swing district|referendum|polling|election night|press secretary|spin doctor/.test(n)) return M.campaign
  if (/valkyrie/.test(n)) return M.valhalla
  if (/revolution/.test(n)) return M.movement
  if (/dictator|coup|banana|republic/.test(n)) return M.regime
  if (/diplomat|un crisis|treat(y|ies)/.test(n)) return M.diplo
  if (/pirate/.test(n)) return M.pirate
  if (/space station|astronaut/.test(n)) return M.spacelife
  if (/settlement council/.test(n)) return M.survival
  if (/hermit|castaway|island/.test(n)) return M.island
  if (/college/.test(n)) return M.college
  if (/nurse|night shift/.test(n)) return M.nurse
  if (/influencer/.test(n)) return M.influencer
  if (/ghost roommate/.test(n)) return M.ghost
  if (/robot housemate/.test(n)) return M.robot
  if (/lighthouse family|generations/.test(n)) return M.family
  if (/ski team/.test(n)) return M.sport
  if (/mayor|parliament|senate|filibuster|lobby|council|constitution|tax code|ministry|town hall|budget|president/.test(n)) return M.politics
  return undefined
}
