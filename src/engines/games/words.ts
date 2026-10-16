// Words: word puzzles. Sub-mode from mods / keywords: wordle, hangman, hive (anagram / spelling bee), cipher, crossword, word search (default).
import { Bag, createDom, makeRng, type Engine } from '../kit'
import { dailySeed } from '../logic/words'
import { wordle, hangman } from '../logic/words-mode-a'
import { hive, cipher } from '../logic/words-mode-b'
import { search, crossword } from '../logic/words-mode-c'
import { BASE_CSS, pickSub, type Sub, type WCtx, type WMode } from '../logic/words-ui'

const MODES: Record<Sub, WMode> = { wordle, hangman, hive, cipher, crossword, search }

const engine: Engine = {
  start(env) {
    const bag = new Bag()
    const root = createDom(env.host, env.theme, 'wd')
    const style = document.createElement('style')
    style.textContent = BASE_CSS
    root.appendChild(style)
    bag.add(() => root.remove())
    const daily = env.mods.has('daily')
    const rng = daily ? makeRng(dailySeed()) : env.rng
    let ended = false
    let paused = false
    const keyFns: ((e: KeyboardEvent) => void)[] = []
    bag.on(window, 'keydown', (e) => {
      const t = e.target as HTMLElement | null
      if (paused || e.ctrlKey || e.metaKey || e.altKey) return
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      for (const f of keyFns) f(e)
    })
    const ctx: WCtx = {
      env, root, bag, rng, daily,
      css(s) {
        style.textContent += s
      },
      onKey(fn) {
        keyFns.push(fn)
      },
      finish(score, won, text) {
        if (ended) return
        ended = true
        env.score(score)
        env.end({ score, won, text })
      },
    }
    MODES[pickSub(env.mods, `${env.name} ${env.desc}`)](ctx)
    return {
      pause(p) {
        paused = p
      },
      destroy() {
        bag.dispose()
      },
    }
  },
}

export default engine
