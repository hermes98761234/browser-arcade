// Picks the card sub-mode from mods / name / description.
export type CardMode = 'solitaire' | 'golf' | 'pyramid' | 'blackjack' | 'poker' | 'war' | 'higher' | 'deck' | 'battle'

export function pickCardMode(name: string, desc: string, mods: Iterable<string>, seed: number): CardMode {
  const m = new Set(mods)
  const k = `${name} ${desc}`.toLowerCase()
  if (/blackjack|twenty-one|21 vs/.test(k) || m.has('blackjack')) return 'blackjack'
  if (m.has('deck')) return 'deck'
  if (/deckbuilder|deck-builder|spire|slay|dungeon deck|\bdeck\b|tarot run|draw-discard/.test(k)) return 'deck'
  if (m.has('battle')) return 'battle'
  if (/card battle|card duel|card clash|card brawl|card wars|card arena|duel|clash|brawl|arena|lane|battler/.test(k)) return 'battle'
  if (m.has('poker') || /poker|hold'?em|video poker|jacks/.test(k)) return 'poker'
  if (/\bwar\b|card war/.test(k) && !/wars?\b.*(ship|star)/.test(k)) return 'war'
  if (/higher|lower|price pinch|guess/.test(k)) return 'higher'
  if (/pyramid/.test(k)) return 'pyramid'
  if (/golf/.test(k)) return 'golf'
  if (m.has('solitaire') || /solitaire|klondike|patience|freecell|spider/.test(k)) return 'solitaire'
  return seed % 2 === 0 ? 'golf' : 'higher'
}
