import { describe, expect, it } from 'vitest'
import type { Story } from './types'

const mods = import.meta.glob<{ default: Story }>('./[0-9]*.ts', { eager: true })
const stories = Object.entries(mods).map(([path, m]) => ({ path, story: m.default }))

const words = (s: Story) => Object.values(s.nodes).reduce((n, x) => n + x.text.split(/\s+/).length, 0)

describe('stories', () => {
  it('has story files', () => {
    expect(stories.length).toBeGreaterThanOrEqual(5)
  })

  for (const { path, story } of stories) {
    describe(path, () => {
      const nodes = story.nodes
      const ids = Object.keys(nodes)

      it('file name matches id, has title and blurb', () => {
        expect(path).toBe(`./${story.id}.ts`)
        expect(story.title.length).toBeGreaterThan(2)
        expect(story.blurb.length).toBeGreaterThan(40)
      })

      it('start exists and all `to` targets exist', () => {
        expect(nodes[story.start]).toBeDefined()
        for (const [id, n] of Object.entries(nodes)) {
          for (const c of n.choices ?? []) expect(nodes[c.to], `${id} -> ${c.to}`).toBeDefined()
        }
        for (const [k, d] of Object.entries(story.stats)) if (d.onMin) expect(nodes[d.onMin], `onMin of ${k}`).toBeDefined()
      })

      it('every node is reachable from start', () => {
        const seen = new Set<string>()
        const todo = [story.start]
        while (todo.length) {
          const id = todo.pop()!
          if (seen.has(id)) continue
          seen.add(id)
          for (const c of nodes[id].choices ?? []) todo.push(c.to)
          // stat-driven jumps
        }
        for (const d of Object.values(story.stats)) if (d.onMin && !seen.has(d.onMin)) todo.push(d.onMin)
        while (todo.length) {
          const id = todo.pop()!
          if (seen.has(id)) continue
          seen.add(id)
          for (const c of nodes[id].choices ?? []) todo.push(c.to)
        }
        expect(ids.filter((i) => !seen.has(i))).toEqual([])
      })

      it('non-ending nodes have choices, endings do not', () => {
        for (const [id, n] of Object.entries(nodes)) {
          if (n.ending) expect(n.choices?.length ?? 0, `${id} ending has choices`).toBe(0)
          else expect(n.choices?.length ?? 0, `${id} has no choices`).toBeGreaterThanOrEqual(1)
        }
      })

      it('has enough nodes and endings', () => {
        expect(ids.length).toBeGreaterThanOrEqual(40)
        const ends = Object.values(nodes).filter((n) => n.ending)
        expect(ends.length).toBeGreaterThanOrEqual(4)
        expect(ends.some((e) => e.ending!.kind === 'secret')).toBe(true)
        expect(ends.some((e) => e.ending!.kind === 'good')).toBe(true)
        expect(ends.some((e) => e.ending!.kind === 'bad')).toBe(true)
      })

      it('is long enough', () => {
        expect(words(story)).toBeGreaterThan(4000)
      })

      it('references only defined stats and items', () => {
        const items = new Set(Object.keys(story.items ?? {}))
        const okItem = (i: string) => i.startsWith('_') || items.has(i)
        const stats = new Set(Object.keys(story.stats))
        const checkEff = (where: string, e?: Record<string, number>) => {
          for (const k of Object.keys(e ?? {})) expect(stats.has(k), `${where}: stat ${k}`).toBe(true)
        }
        for (const [id, n] of Object.entries(nodes)) {
          checkEff(id, n.effects)
          for (const i of [...(n.give ?? []), ...(n.take ?? [])]) expect(okItem(i), `${id}: item ${i}`).toBe(true)
          for (const c of n.choices ?? []) {
            checkEff(`${id}>${c.to}`, c.effects)
            for (const i of [...(c.give ?? []), ...(c.take ?? [])]) expect(okItem(i), `${id}>${c.to}: item ${i}`).toBe(true)
            for (const q of c.if ?? []) {
              if (q.stat) expect(stats.has(q.stat), `${id}: cond stat ${q.stat}`).toBe(true)
              if (q.has) expect(okItem(q.has), `${id}: cond has ${q.has}`).toBe(true)
              if (q.not) expect(okItem(q.not), `${id}: cond not ${q.not}`).toBe(true)
            }
          }
        }
      })

      it('every condition item can be obtained somewhere', () => {
        const given = new Set<string>()
        for (const n of Object.values(nodes)) {
          for (const g of n.give ?? []) given.add(g)
          for (const c of n.choices ?? []) for (const g of c.give ?? []) given.add(g)
        }
        for (const [id, n] of Object.entries(nodes)) {
          for (const c of n.choices ?? []) for (const q of c.if ?? []) if (q.has) expect(given.has(q.has), `${id}: ${q.has} is never given`).toBe(true)
        }
      })

      it('all endings are reachable by a simulated play-through (with items)', () => {
        // Optimistic reachability: ignore stat conditions, honour item/flag requirements via fixpoint over (node, inventory) approximated as a global set.
        const inv = new Set<string>()
        const seen = new Set<string>()
        let changed = true
        const start = [story.start, ...Object.values(story.stats).flatMap((d) => (d.onMin ? [d.onMin] : []))]
        while (changed) {
          changed = false
          const todo = [...start]
          const vis = new Set<string>()
          while (todo.length) {
            const id = todo.pop()!
            if (vis.has(id)) continue
            vis.add(id)
            const n = nodes[id]
            for (const g of n.give ?? []) if (!inv.has(g)) {
                inv.add(g)
                changed = true
              }
            for (const c of n.choices ?? []) {
              if ((c.if ?? []).some((q) => q.has && !inv.has(q.has))) continue
              for (const g of c.give ?? []) if (!inv.has(g)) {
                inv.add(g)
                changed = true
              }
              todo.push(c.to)
            }
          }
          for (const v of vis) seen.add(v)
        }
        const missing = ids.filter((i) => nodes[i].ending && !seen.has(i))
        expect(missing).toEqual([])
      })

      it('uses valid markup (balanced asterisks)', () => {
        for (const [id, n] of Object.entries(nodes)) {
          const stars = (n.text.match(/\*/g) ?? []).length
          expect(stars % 2, `${id} has unbalanced *`).toBe(0)
        }
      })
    })
  }
})
