import type { Prefs, T } from '../kitlib'
import { randomGameHref } from './nav'

export function Header({ t, prefs, setPrefs }: { t: T; prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  return (
    <header className="top">
      <a className="logo" href="#/" aria-label={t('Browser Arcade home')}>
        <span className="logo-icon" aria-hidden>🕹️</span>
        <span className="logo-text">
          BROWSER<b>ARCADE</b>
        </span>
      </a>
      <nav className="nav">
        <a href="#/">{t('All games')}</a>
        <a href="#/?story=1">{t('Stories')}</a>
        <a href="#/?fav=1">★ {t('Favorites')}</a>
        <a href="#/?recent=1">{t('Recently played')}</a>
        <button type="button" className="btn-random" onClick={() => (location.hash = randomGameHref())}>
          🎲 {t('Surprise me')}
        </button>
      </nav>
      <div className="prefs">
        <select aria-label={t('Language')} value={prefs.lang} onChange={(e) => setPrefs({ ...prefs, lang: e.target.value as Prefs['lang'] })}>
          <option value="en">EN</option>
          <option value="uk">UK</option>
        </select>
        <select aria-label={t('Theme')} value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as Prefs['theme'] })}>
          <option value="auto">{t('Auto')}</option>
          <option value="dark">{t('Dark')}</option>
          <option value="light">{t('Light')}</option>
        </select>
      </div>
    </header>
  )
}
