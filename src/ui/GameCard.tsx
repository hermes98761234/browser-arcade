import { useEffect, useRef } from 'react'
import { implemented } from '../engines/registry'
import type { T } from '../kitlib'
import { GENRES, type Game } from '../lib/catalog'
import { ENGINES } from '../lib/engines'
import { toggleFav, useStore } from '../lib/store'
import { THEMES } from '../lib/themes'
import { drawPreview } from '../previews'

/** Canvas thumbnail, drawn once when the card scrolls into view. */
export function Thumb({ game }: { game: Game }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          drawPreview(c, game)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(c)
    return () => io.disconnect()
  }, [game])
  return <canvas ref={ref} className="thumb" width={320} height={180} aria-hidden />
}

export function GameCard({ game, t, compact }: { game: Game; t: T; compact?: boolean }) {
  const { fav, best } = useStore()
  const isFav = fav.includes(game.id)
  const ready = implemented(game.engine)
  const theme = THEMES[game.theme]
  return (
    <article className={`card ${compact ? 'compact' : ''} ${game.story ? 'is-story' : ''}`} style={{ ['--c' as string]: theme.accent }}>
      <a href={`#/play/${game.slug}`} className="card-link" aria-label={game.name}>
        <div className="thumb-wrap">
          <Thumb game={game} />
          <span className="badge dim">{game.dim}D</span>
          {game.story && <span className="badge story">📖 {t('Story')}</span>}
          {!ready && <span className="badge soon">{t('Coming soon')}</span>}
          <span className="play-hint">▶ {t('Play')}</span>
        </div>
        <div className="card-body">
          <h3>{game.name}</h3>
          {!compact && <p>{game.desc}</p>}
          <div className="tags">
            <span>{t(GENRES[game.genre])}</span>
            {ENGINES[game.engine].name !== GENRES[game.genre] && <span>{t(ENGINES[game.engine].name)}</span>}
            {!compact && <span className="year">{game.year < 1970 ? t('classic') : game.year}</span>}
            {best[game.id] ? <span className="best">🏆 {best[game.id]}</span> : null}
          </div>
        </div>
      </a>
      <button type="button" className={`fav ${isFav ? 'on' : ''}`} onClick={() => toggleFav(game.id)} aria-pressed={isFav} aria-label={isFav ? t('Remove from favorites') : t('Add to favorites')}>
        {isFav ? '★' : '☆'}
      </button>
    </article>
  )
}
