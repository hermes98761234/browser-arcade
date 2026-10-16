// Lazy loaders: each engine is its own chunk, fetched only when a game is played.
import type { EngineId } from '../lib/engines'
import type { Engine } from './kit'

type Loader = () => Promise<{ default: Engine }>

const modules = import.meta.glob<{ default: Engine }>('./games/*.ts')

export function engineLoader(id: EngineId): Loader | undefined {
  return modules[`./games/${id}.ts`]
}

export const implemented = (id: EngineId) => !!modules[`./games/${id}.ts`]
