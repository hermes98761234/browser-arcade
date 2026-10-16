import { COMMON_UK, makeTr } from './kitlib'

/** Marks a string for translation where it is defined away from its t() call. */
export const N = (s: string) => s

/** English source string → Ukrainian. `{0}`, `{1}` are placeholders. i18n.test.ts fails if a UI string is missing here. */
export const UK: Record<string, string> = {
  ...COMMON_UK,
  'Starter tool': 'Стартовий інструмент',
  'Replace this with your tool.': 'Замініть це своїм інструментом.',
  Voltage: 'Напруга',
  Resistance: 'Опір',
  Current: 'Струм',
  Power: 'Потужність',
  'Export CSV': 'Експорт CSV',
}

export const tr = makeTr(UK)
