export function formatBRL(value) {
  const n = Number(value) || 0
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateShort(isoDate) {
  if (!isoDate) return ''
  const [, m, d] = isoDate.split('-')
  return `${d}/${m}`
}

export function todayISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

export function monthKeyFromDate(isoDate) {
  return isoDate ? isoDate.slice(0, 7) : ''
}

export function currentMonthKey() {
  return todayISO().slice(0, 7)
}

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function formatMonthLabel(monthKey) {
  if (!monthKey) return ''
  const [y, m] = monthKey.split('-').map(Number)
  return `${MESES_PT[m - 1]}/${y}`
}

export function formatMonthLabelShort(monthKey) {
  if (!monthKey) return ''
  const [y, m] = monthKey.split('-').map(Number)
  return `${MESES_PT[m - 1].slice(0, 3)}/${String(y).slice(2)}`
}

export function shiftMonthKey(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function listMonthsBetween(startKey, endKey) {
  const months = []
  let cur = startKey
  let guard = 0
  while (cur <= endKey && guard < 1000) {
    months.push(cur)
    cur = shiftMonthKey(cur, 1)
    guard++
  }
  return months
}

export function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_PALETTE = [
  'bg-coral-400', 'bg-teal-500', 'bg-sun', 'bg-plum', 'bg-coral-600', 'bg-teal-300',
]

export function avatarColor(seed) {
  if (!seed) return AVATAR_PALETTE[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}
