// Normalização de nomes de cartório — os 5 livros usam grafias diferentes
// para a mesma unidade ("M. Penha" / "MARIA PENHA" / "M. PENHA").

export function normalizeCartorio(raw: string | undefined | null): string {
  if (!raw) return "Não informado"
  const s = String(raw).toUpperCase().trim()
  if (!s) return "Não informado"

  if (s.includes("TRAF") || s.includes("TRÁF") || s.includes("NARC"))
    return "Tráfico"
  if (s.includes("PENHA") || s.includes("MULHER")) return "Maria da Penha"
  if (s.includes("SEX") || s.includes("VULN")) return "Crimes Sexuais"
  if (s.includes("LEG")) return "Legislação Extra."
  if (s.includes("PATRIM")) return "Patrimônio"
  if (s.includes("HOMIC")) return "Homicídios"
  if (s.includes("TCIP")) return "TCIP"
  if (s.includes("ESTELI")) return "Estelionato"
  if (s.includes("CHEFE")) return "Cartório Chefe"
  if (s.includes("GDE")) return "GDE"
  return raw.trim()
}

// Paleta estável por cartório — cores vibrantes para fundo escuro
export const CARTORIO_COLORS: Record<string, string> = {
  "Tráfico":           "#FF3B3B",
  "Maria da Penha":    "#FF2D78",
  "Crimes Sexuais":    "#CC44FF",
  "Legislação Extra.": "#0A84FF",
  "Patrimônio":        "#FF9500",
  "Homicídios":        "#FF453A",
  "TCIP":              "#30D158",
  "Estelionato":       "#32D74B",
  "Cartório Chefe":    "#5E5CE6",
  "GDE":               "#64D2FF",
  "Não informado":     "#636366",
}

export const CHART_PALETTE = [
  "#FF9500", "#0A84FF", "#30D158", "#FF3B3B", "#BF5AF2",
  "#FF2D78", "#5AC8FA", "#FFD60A", "#32ADE6", "#FF6B35",
  "#30D158", "#AC8E68", "#FF375F", "#5E5CE6", "#64D2FF",
]

export function colorForCartorio(name: string, fallbackIndex = 0): string {
  return CARTORIO_COLORS[name] || CHART_PALETTE[fallbackIndex % CHART_PALETTE.length]
}
