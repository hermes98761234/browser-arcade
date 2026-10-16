import { GAMES } from '../lib/data'

let last = '#/'
/** The catalog view (filters + page) the player came from. */
export const lastCatalog = () => last
export const rememberCatalog = (hash: string) => {
  last = hash
}

export function randomGameHref(): string {
  const g = GAMES[Math.floor(Math.random() * GAMES.length)]
  return `#/play/${g.slug}`
}
