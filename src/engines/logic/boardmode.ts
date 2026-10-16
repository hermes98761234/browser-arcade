// Picks the board sub-mode from a game's mods, name and description.
export type ModeId = 'chess' | 'checkers' | 'reversi' | 'connect' | 'ttt' | 'mancala' | 'gomoku' | 'dots' | 'nim' | 'go' | 'hex'

export function pickMode(name: string, desc: string, mods: Iterable<string>): ModeId {
  const m = new Set(mods)
  for (const id of ['chess', 'checkers', 'reversi', 'connect', 'ttt', 'mancala', 'gomoku', 'dots', 'nim', 'go', 'hex'] as ModeId[]) if (m.has(id)) return id
  const k = `${name} ${desc}`.toLowerCase()
  const rules: [RegExp, ModeId][] = [
    [/chess|xiangqi|shogi|janggi|chaturanga|mate in/, 'chess'],
    [/checker|draught/, 'checkers'],
    [/reversi|othello/, 'reversi'],
    [/connect|four in|drop/, 'connect'],
    [/tic-tac|ttt|noughts/, 'ttt'],
    [/mancala|kalah|oware|bao|pallanguzhi|sowing|seeds/, 'mancala'],
    [/gomoku|pente|five.in/, 'gomoku'],
    [/dots|boxes/, 'dots'],
    [/\bnim\b/, 'nim'],
    [/\bgo\b|9x9|tafl|hnefatafl|surakarta/, 'go'],
    [/hex\b|honeycomb/, 'hex'],
  ]
  for (const [re, id] of rules) if (re.test(k)) return id
  return 'reversi'
}
