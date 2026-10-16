import { useEffect, useMemo, useRef, useState } from 'react'
import type { T } from '../kitlib'
import {
  DEFAULT_FILTERS, DIFFICULTIES, ERAS, filterGames, filtersToQuery, GENRES, pageList, paginate, queryToFilters,
  type Filters, type Game, type Genre,
} from '../lib/catalog'
import { FEATURED, GAMES, SECTIONS } from '../lib/data'
import { ENGINE_IDS, ENGINES } from '../lib/engines'
import { useStore } from '../lib/store'
import { THEME_IDS, THEMES } from '../lib/themes'
import { GameCard } from './GameCard'
import { rememberCatalog } from './nav'

const GENRE_ICON: Record<Genre, string> = {
  arcade: '👾', puzzle: '🧩', action: '⚔️', platformer: '🍄', shooter: '🚀', racing: '🏎️', strategy: '🏰', simulation: '🏙️',
  rpg: '🐉', cards: '🃏', sports: '⚽', education: '🎓', casual: '🍬', story: '📖', creative: '🎨', party: '🎉',
}

function go(f: Filters) {
  const q = filtersToQuery(f)
  const h = q ? `#/?${q}` : '#/'
  if (location.hash !== h) location.hash = h
}

export function Catalog({ t, query }: { t: T; query: string }) {
  const f = useMemo(() => queryToFilters(query), [query])
  const mine = useStore()
  const list = useMemo(() => filterGames(GAMES, f, FEATURED, mine), [f, mine])
  const { items, page, pages } = paginate(list, f.page)
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const top = useRef<HTMLDivElement>(null)
  const set = (patch: Partial<Filters>) => go({ ...f, page: 1, ...patch })
  const toPage = (p: number) => {
    go({ ...f, page: p })
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  useEffect(() => {
    rememberCatalog(query ? `#/?${query}` : '#/')
  }, [query])
  useEffect(() => () => clearTimeout(timer.current), [])
  // Debounced search-as-you-type.
  const onSearch = (q: string) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => set({ q }), 250)
  }

  const active = filtersToQuery({ ...f, page: 1, sort: 'featured' }) !== ''
  const home = !active && page === 1 && f.sort === 'featured'
  const stories = useMemo(() => GAMES.filter((g) => g.story), [])
  const sel = <K extends keyof Filters>(k: K, label: string, opts: [string, string][]) => (
    <label className="fsel">
      <span>{label}</span>
      <select value={String(f[k] || '')} onChange={(e) => set({ [k]: k === 'section' ? Number(e.target.value) : e.target.value } as Partial<Filters>)}>
        <option value="">{t('Any')}</option>
        {opts.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )

  const title = f.fav ? t('Your favorites') : f.recent ? t('Recently played') : f.story ? t('Story games') : t('All games')

  return (
    <main className="catalog">
      {home && (
        <section className="hero">
          <div className="hero-text">
            <h1>
              {t('3000 games.')} <span>{t('Zero sign-ups.')}</span>
            </h1>
            <p>{t('Arcade classics, brain-twisting puzzles, strategy, racing and hand-written story adventures — all free, all instant, all in your browser.')}</p>
            <div className="hero-stats">
              <b>{GAMES.length}</b> {t('games')} · <b>{ENGINE_IDS.length}</b> {t('gameplay styles')} · <b>{THEME_IDS.length}</b> {t('visual worlds')}
            </div>
          </div>
          <div className="hero-stories">
            <h2>📖 {t('Featured stories')}</h2>
            <div className="story-row">
              {stories.map((g) => (
                <GameCard key={g.id} game={g} t={t} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="genre-chips" role="toolbar" aria-label={t('Genre')}>
        <button type="button" className={!f.genre ? 'on' : ''} onClick={() => set({ genre: '' })}>
          ✨ {t('All')}
        </button>
        {(Object.keys(GENRES) as Genre[]).map((g) => (
          <button type="button" key={g} className={f.genre === g ? 'on' : ''} onClick={() => set({ genre: f.genre === g ? '' : g })}>
            {GENRE_ICON[g]} {t(GENRES[g])}
          </button>
        ))}
      </div>

      <div className="toolbar" ref={top}>
        <input className="search" type="search" key={f.q ? "q" : "empty"} defaultValue={f.q} placeholder={t('Search 3000 games…')} aria-label={t('Search')} onChange={(e) => onSearch(e.target.value)} />
        <button type="button" className={`btn-filters ${open ? 'on' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
          ⚙ {t('Filters')} {active && <span className="dot" />}
        </button>
        <label className="fsel sort">
          <span>{t('Sort')}</span>
          <select value={f.sort} onChange={(e) => set({ sort: e.target.value as Filters['sort'] })}>
            <option value="featured">{t('Featured')}</option>
            <option value="az">{t('Name A–Z')}</option>
            <option value="za">{t('Name Z–A')}</option>
            <option value="oldest">{t('Oldest genre first')}</option>
            <option value="newest">{t('Newest genre first')}</option>
            <option value="number">{t('Catalog number')}</option>
          </select>
        </label>
      </div>

      {open && (
        <div className="filters">
          {sel('theme', t('Style'), THEME_IDS.map((id) => [id, `${THEMES[id].hero} ${t(THEMES[id].name)}`]))}
          {sel('engine', t('Gameplay'), ENGINE_IDS.map((id) => [id, t(ENGINES[id].name)]).sort((a, b) => a[1].localeCompare(b[1])) as [string, string][])}
          {sel('era', t('Era (year)'), Object.entries(ERAS).map(([k, v]) => [k, t(v)]))}
          {sel('dim', t('Graphics'), [['2', '2D'], ['3', '3D']])}
          {sel('players', t('Players'), [['2', t('2 players')]])}
          {sel('control', t('Controls'), [['keyboard', t('Keyboard')], ['mouse', t('Mouse')], ['touch', t('Touch')]])}
          {sel('difficulty', t('Difficulty'), Object.entries(DIFFICULTIES).map(([k, v]) => [k, t(v)]))}
          {sel('section', t('Collection'), SECTIONS.map((s) => [String(s.id), s.name.replace(/&amp;/g, '&')]))}
          <label className="fcheck">
            <input type="checkbox" checked={f.story} onChange={(e) => set({ story: e.target.checked })} /> 📖 {t('Story games only')}
          </label>
          <button type="button" className="btn-reset" onClick={() => go(DEFAULT_FILTERS)}>
            ✕ {t('Reset filters')}
          </button>
        </div>
      )}

      <div className="results-head">
        <h2>{title}</h2>
        <span>
          {t('{0} games', list.length)}
          {pages > 1 && ` · ${t('page {0} of {1}', page, pages)}`}
        </span>
      </div>

      {items.length ? (
        <div className="grid">
          {items.map((g: Game) => (
            <GameCard key={g.id} game={g} t={t} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div>🕹️</div>
          <p>{f.fav ? t('No favorites yet — tap ☆ on any game to save it here.') : f.recent ? t('Nothing played yet. Pick a game!') : t('No games match these filters.')}</p>
          <button type="button" onClick={() => go(DEFAULT_FILTERS)}>
            {t('Show all games')}
          </button>
        </div>
      )}

      {pages > 1 && (
        <nav className="pager" aria-label={t('Pages')}>
          <button type="button" disabled={page <= 1} onClick={() => toPage(page - 1)} aria-label={t('Previous page')}>
            ‹
          </button>
          {pageList(page, pages).map((p, i) =>
            p === 0 ? (
              <span key={`e${i}`} className="ellipsis">
                …
              </span>
            ) : (
              <button type="button" key={p} className={p === page ? 'on' : ''} onClick={() => toPage(p)} aria-current={p === page ? 'page' : undefined}>
                {p}
              </button>
            ),
          )}
          <button type="button" disabled={page >= pages} onClick={() => toPage(page + 1)} aria-label={t('Next page')}>
            ›
          </button>
        </nav>
      )}
    </main>
  )
}
