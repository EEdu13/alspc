// Utilidades de agregação usadas pelos gráficos (puro, sem dependências)

export interface Slice {
  name: string
  value: number
}

export function countBy<T>(
  rows: T[],
  keyFn: (r: T) => string,
  opts: { limit?: number; emptyLabel?: string } = {}
): Slice[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    let k = keyFn(r)
    if (!k || k.trim() === "" || k === "—") k = opts.emptyLabel || "Não informado"
    map.set(k, (map.get(k) || 0) + 1)
  }
  let arr = Array.from(map, ([name, value]) => ({ name, value }))
  arr.sort((a, b) => b.value - a.value)
  if (opts.limit && arr.length > opts.limit) {
    const head = arr.slice(0, opts.limit)
    const restTotal = arr.slice(opts.limit).reduce((s, x) => s + x.value, 0)
    if (restTotal > 0) head.push({ name: "Outros", value: restTotal })
    arr = head
  }
  return arr
}

const MONTHS: Record<string, number> = {
  JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
  JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12,
}

function monthRank(label: string): number {
  const m = label.toUpperCase().match(/([A-Z]{3})\.?\/?(\d{4})/)
  if (!m) return 9999
  const month = MONTHS[m[1]] || 0
  const year = parseInt(m[2], 10) || 0
  return year * 100 + month
}

// agrupa por mês mantendo a ordem cronológica
export function countByMonth<T>(rows: T[], keyFn: (r: T) => string): Slice[] {
  const arr = countBy(rows, keyFn, { emptyLabel: "—" }).filter(
    (s) => s.name !== "—" && s.name !== "Não informado"
  )
  arr.sort((a, b) => monthRank(a.name) - monthRank(b.name))
  return arr
}

export function sum(arr: number[]): number {
  return arr.reduce((s, x) => s + (Number.isFinite(x) ? x : 0), 0)
}

// formata número com separador de milhar pt-BR
export function fmt(n: number): string {
  return n.toLocaleString("pt-BR")
}
