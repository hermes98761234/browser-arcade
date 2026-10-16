import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { makeRng, type GameHandle, type GameResult } from '../engines/kit'
import { engineLoader } from '../engines/registry'
import { isMuted, setMuted, sfx } from '../engines/sound'
import type { Lang, T } from '../kitlib'
import { DIFFICULTIES, GENRES, type Difficulty, type Game } from '../lib/catalog'
import { BY_ID, GAMES, SECTIONS } from '../lib/data'
import { ENGINES } from '../lib/engines'
import { markPlayed, recordScore, toggleFav, useStore } from '../lib/store'
import { THEMES } from '../lib/themes'
import { lastCatalog } from './nav'
import { GameCard, Thumb } from './GameCard'

type Phase = 'ready' | 'loading' | 'playing' | 'over' | 'error'
const DIFF_N: Record<Difficulty, 0 | 1 | 2> = { easy: 0, normal: 1, hard: 2 }

export function Player({ game, t, lang }: { game: Game; t: T; lang: Lang }) {
  const host = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const handle = useRef<GameHandle | null>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState<(GameResult & { best: boolean }) | null>(null)
  const [diff, setDiff] = useState<Difficulty>(game.difficulty)
  const [players, setPlayers] = useState<1 | 2>(1)
  const [muted, setMute] = useState(isMuted())
  const [run, setRun] = useState(0)
  const { fav, best } = useStore()
  const meta = ENGINES[game.engine]
  const theme = THEMES[game.theme]
  const section = SECTIONS.find((s) => s.id === game.section)

  const stop = useCallback(() => {
    handle.current?.destroy()
    handle.current = null
    if (host.current) host.current.innerHTML = ''
  }, [])

  const start = useCallback(async () => {
    stop()
    setPhase('loading')
    setScore(0)
    setStatus('')
    setResult(null)
    setPaused(false)
    const load = engineLoader(game.engine)
    if (!load) {
      setPhase('error')
      return
    }
    try {
      const mod = await load()
      if (!host.current) return
      let ended = false
      const seed = (game.seed + run * 7919) >>> 0
      handle.current = mod.default.start({
        host: host.current, seed, rng: makeRng(seed), difficulty: DIFF_N[diff], theme, mods: new Set(game.mods),
        name: game.name, desc: game.desc, players,
        score: (n) => setScore(n),
        status: (s) => setStatus(s),
        sfx,
        end: (r) => {
          if (ended) return
          ended = true
          const isBest = recordScore(game.id, r.score)
          setResult({ ...r, best: isBest })
          setPhase('over')
        },
      })
      markPlayed(game.id)
      setPhase('playing')
      host.current.querySelector<HTMLElement>('canvas, [tabindex], button')?.focus({ preventScroll: true })
    } catch (e) {
      console.error(e)
      setPhase('error')
    }
  }, [game, diff, players, theme, run, stop])

  useEffect(() => stop, [stop])
  useEffect(() => {
    if (run > 0) void start()
    // Only restart when the run counter changes.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  const togglePause = useCallback(() => {
    if (phase !== 'playing') return
    const p = !paused
    setPaused(p)
    handle.current?.pause?.(p)
  }, [phase, paused])

  useEffect(() => {
    const vis = () => {
      if (document.hidden && phase === 'playing' && !paused) togglePause()
    }
    const key = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || (e.code === 'Escape' && !document.fullscreenElement)) togglePause()
    }
    document.addEventListener('visibilitychange', vis)
    window.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('visibilitychange', vis)
      window.removeEventListener('keydown', key)
    }
  }, [phase, paused, togglePause])

  const fullscreen = () => {
    const el = frame.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }

  const related = useMemo(() => {
    const r = makeRng(game.seed)
    const same = GAMES.filter((g) => g.id !== game.id && g.engine === game.engine)
    const look = GAMES.filter((g) => g.id !== game.id && g.theme === game.theme && g.engine !== game.engine)
    return [...r.shuffle(same).slice(0, 4), ...r.shuffle(look).slice(0, 4)]
  }, [game])
  const prev = BY_ID.get(game.id === 1 ? GAMES.length : game.id - 1)!
  const next = BY_ID.get(game.id === GAMES.length ? 1 : game.id + 1)!
  const isFav = fav.includes(game.id)

  return (
    <main className="player" style={{ ['--c' as string]: theme.accent, ['--c2' as string]: theme.accent2 }}>
      <nav className="crumbs">
        <a href={lastCatalog()}>
          ‹ {t('All games')}
        </a>
        <span>/</span>
        <a href={`#/?section=${game.section}`}>{section?.name}</a>
      </nav>

      <div className="player-head">
        <div>
          <h1>{game.name}</h1>
          <p className="pitch">{game.desc}.</p>
        </div>
        <button type="button" className={`fav big ${isFav ? 'on' : ''}`} onClick={() => toggleFav(game.id)} aria-pressed={isFav}>
          {isFav ? '★' : '☆'} {isFav ? t('Saved') : t('Save')}
        </button>
      </div>

      <div className="stage-frame" ref={frame}>
        <div className="hud">
          <span className="hud-score">{t('Score')} <b>{score}</b></span>
          <span className="hud-best">🏆 {best[game.id] ?? 0}</span>
          <span className="hud-status">{status}</span>
          <span className="hud-btns">
            <button type="button" onClick={togglePause} disabled={phase !== 'playing'} title={t('Pause (P)')} aria-label={t('Pause (P)')}>
              {paused ? '▶' : '⏸'}
            </button>
            <button type="button" onClick={() => setRun((r) => r + 1)} disabled={phase === 'ready' || phase === 'loading'} title={t('Restart')} aria-label={t('Restart')}>
              ↻
            </button>
            <button type="button" onClick={() => { setMuted(!muted); setMute(!muted) }} title={t('Sound')} aria-label={t('Sound')} aria-pressed={!muted}>
              {muted ? '🔇' : '🔊'}
            </button>
            <button type="button" onClick={fullscreen} title={t('Fullscreen')} aria-label={t('Fullscreen')}>
              ⛶
            </button>
          </span>
        </div>
        <div className="stage" ref={host} />
        {phase === 'ready' && (
          <div className="overlay start">
            <Thumb game={game} />
            <div className="overlay-box">
              <h2>{game.name}</h2>
              <p>{t(meta.help)}</p>
              <div className="opts">
                <label>
                  {t('Difficulty')}
                  <select value={diff} onChange={(e) => setDiff(e.target.value as Difficulty)}>
                    {Object.entries(DIFFICULTIES).map(([k, v]) => (
                      <option key={k} value={k}>{t(v)}</option>
                    ))}
                  </select>
                </label>
                {game.players === 2 && (
                  <label>
                    {t('Players')}
                    <select value={players} onChange={(e) => setPlayers(Number(e.target.value) as 1 | 2)}>
                      <option value={1}>{t('1 player')}</option>
                      <option value={2}>{t('2 players')}</option>
                    </select>
                  </label>
                )}
              </div>
              <button type="button" className="btn-play" onClick={() => { sfx('click'); setRun((r) => r + 1) }} autoFocus>
                ▶ {t('Play')}
              </button>
            </div>
          </div>
        )}
        {phase === 'loading' && <div className="overlay"><div className="spinner" aria-label={t('Loading…')} /></div>}
        {paused && phase === 'playing' && (
          <div className="overlay" onClick={togglePause}>
            <div className="overlay-box"><h2>{t('Paused')}</h2><button type="button" className="btn-play">▶ {t('Resume')}</button></div>
          </div>
        )}
        {phase === 'over' && result && (
          <div className="overlay">
            <div className="overlay-box">
              <h2>{result.won === true ? `🏆 ${t('You win!')}` : result.won === false ? t('Game over') : t('Finished')}</h2>
              {result.text && <p>{result.text}</p>}
              <div className="final">{t('Score')} <b>{result.score}</b></div>
              {result.best && result.score > 0 && <div className="newbest">✨ {t('New personal best!')}</div>}
              <div className="row">
                <button type="button" className="btn-play" onClick={() => setRun((r) => r + 1)} autoFocus>↻ {t('Play again')}</button>
                <a className="btn-ghost" href={`#/play/${related[0]?.slug ?? next.slug}`}>{t('Next game')} ›</a>
              </div>
            </div>
          </div>
        )}
        {phase === 'error' && (
          <div className="overlay">
            <div className="overlay-box">
              <h2>🛠️ {t('Coming soon')}</h2>
              <p>{t('This game is still being built. Try one of the similar games below!')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="info">
        <section>
          <h2>{t('How to play')}</h2>
          <p>{t(meta.help)}</p>
          <ul className="facts">
            <li><span>{t('Genre')}</span> {t(GENRES[game.genre])}</li>
            <li><span>{t('Gameplay')}</span> {t(meta.name)}</li>
            <li><span>{t('Style')}</span> {theme.hero} {t(theme.name)}</li>
            <li><span>{t('Era (year)')}</span> {meta.year < 1970 ? t('classic') : meta.year}</li>
            <li><span>{t('Graphics')}</span> {game.dim}D</li>
            <li><span>{t('Players')}</span> {game.players === 2 ? t('1–2 players') : t('1 player')}</li>
            <li><span>{t('Controls')}</span> {meta.controls.map((c) => t(c === 'keyboard' ? 'Keyboard' : c === 'mouse' ? 'Mouse' : 'Touch')).join(', ')}</li>
            <li><span>{t('Catalog number')}</span> #{game.id}</li>
          </ul>
        </section>
        <section>
          <h2>{t('About this game')}</h2>
          <p>{game.desc}.</p>
          <p className="muted">{t('Design notes')}: {game.build}.</p>
          {lang === 'uk' && <p className="muted">{t('Game titles and descriptions are shown in English.')}</p>}
          <div className="prevnext">
            <a href={`#/play/${prev.slug}`}>‹ {prev.name}</a>
            <a href={`#/play/${next.slug}`}>{next.name} ›</a>
          </div>
        </section>
      </div>

      <h2 className="more">{t('More like this')}</h2>
      <div className="grid">
        {related.map((g) => (
          <GameCard key={g.id} game={g} t={t} />
        ))}
      </div>
    </main>
  )
}
