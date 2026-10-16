import { useEffect, useState } from 'react'
import { Catalog } from './ui/Catalog'
import { Player } from './ui/Player'
import { Header } from './ui/Header'
import { tr } from './i18n'
import { usePrefs } from './kitlib'
import { BY_ID } from './lib/data'
import { SITE } from './site'

/** Hash routes: #/?filters (catalog) and #/play/<id>-<slug>. */
function useHash(): string {
  const [h, setH] = useState(() => location.hash)
  useEffect(() => {
    const f = () => setH(location.hash)
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return h
}

export default function App() {
  const { prefs, setPrefs, t } = usePrefs('arcade', tr)
  const hash = useHash()
  const play = hash.match(/^#\/play\/(\d+)/)
  const game = play ? BY_ID.get(Number(play[1])) : undefined
  const query = hash.startsWith('#/?') ? hash.slice(3) : ''

  useEffect(() => {
    document.title = game ? `${game.name} — ${t('Play free in your browser')} · Browser Arcade` : `Browser Arcade — ${t('3000 free browser games')}`
  }, [game, t])
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [game?.id])

  return (
    <div className="arcade">
      <Header t={t} prefs={prefs} setPrefs={setPrefs} />
      {game ? <Player key={game.id} game={game} t={t} lang={prefs.lang} /> : <Catalog t={t} query={query} />}
      <footer className="foot">
        <span>
          {t('Browser Arcade')} · {t('No registration, no login, no tracking. Your scores stay in this browser.')}
        </span>
        <a href={`https://github.com/${SITE.owner}/${SITE.repo}`} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  )
}
