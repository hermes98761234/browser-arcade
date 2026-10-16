// Local-only player data: favourites, recently played, best scores. Nothing leaves the browser.
import { useSyncExternalStore } from 'react'

interface Data {
  fav: number[]
  recent: number[]
  best: Record<number, number>
  plays: Record<number, number>
}

const KEY = 'arcade:data'
let data: Data = { fav: [], recent: [], best: {}, plays: {} }
try {
  data = { ...data, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
} catch {
  /* private mode or corrupt data: start fresh */
}
const subs = new Set<() => void>()

function save(next: Data) {
  data = next
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* ignore quota / private mode */
  }
  for (const s of subs) s()
}

export function useStore(): Data {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => data,
    () => data,
  )
}

export const toggleFav = (id: number) => save({ ...data, fav: data.fav.includes(id) ? data.fav.filter((x) => x !== id) : [id, ...data.fav] })

export const markPlayed = (id: number) =>
  save({ ...data, recent: [id, ...data.recent.filter((x) => x !== id)].slice(0, 24), plays: { ...data.plays, [id]: (data.plays[id] ?? 0) + 1 } })

/** Records a score; returns true when it is a new best. */
export function recordScore(id: number, score: number): boolean {
  if (!(score > (data.best[id] ?? 0))) return false
  save({ ...data, best: { ...data.best, [id]: score } })
  return true
}
