import raw from '../data/raw.json'
import { buildCatalog, featuredOrder, type RawGame, type RawSection } from './catalog'

export const SECTIONS = raw.sections as RawSection[]
export const GAMES = buildCatalog(raw.games as RawGame[])
export const FEATURED = featuredOrder(GAMES)
export const BY_ID = new Map(GAMES.map((g) => [g.id, g]))
