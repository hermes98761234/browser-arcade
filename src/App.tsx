import { NumField, Section, Shell, Stats } from './kit'
import { download, fmt, toCsv, usePersisted, usePrefs } from './kitlib'
import { tr } from './i18n'
import { DEFAULTS, solve, type Inputs } from './lib/core'
import { SITE } from './site'

const KEY = `${SITE.repo}:v1`

export default function App() {
  const { prefs, setPrefs, t } = usePrefs(KEY, tr)
  const [inp, update, reset] = usePersisted<Inputs>(KEY, DEFAULTS)
  const r = solve(inp)

  const side = (
    <Section title={t('Inputs')}>
      <NumField t={t} label={t('Voltage')} unit="V" value={inp.voltage} onChange={(v) => update({ voltage: v })} />
      <NumField t={t} label={t('Resistance')} unit="Ω" value={inp.resistance} min={1e-9} onChange={(v) => update({ resistance: v })} />
    </Section>
  )

  return (
    <Shell title={t('Starter tool')} tagline={t('Replace this with your tool.')} repo={SITE.repo} prefs={prefs} setPrefs={setPrefs} t={t} state={inp} onReset={reset} side={side}>
      <Section
        title={t('Result')}
        actions={
          <button className="small" onClick={() => download('result.csv', toCsv([[t('Current'), t('Power')], [r.current, r.power]]), 'text/csv')}>
            {t('Export CSV')}
          </button>
        }
      >
        <Stats
          items={[
            { label: t('Current'), value: fmt(r.current * 1000, 4), unit: 'mA' },
            { label: t('Power'), value: fmt(r.power, 4), unit: 'W' },
          ]}
        />
      </Section>
    </Shell>
  )
}
