import { normalizeCartorio } from "./cartorios"

// ---------- Tipos de entrada (cru, vindo do Google Sheets) ----------
export interface RawSheet {
  title: string
  values: string[][]
}
export interface RawSpreadsheet {
  id: string
  title: string
  sheets: RawSheet[]
}

// ---------- Registros canônicos ----------
export interface MesaRecord {
  procedimento: string
  tipo: string
  mesaAtual: string
  responsavel: string
  papel: string
  dataEntrada: string
  prazoMesa: string
  dataLimite: string
  diasNaMesa: number | null
  status: string
  diasTotais: number | null
  obs: string
  situacao: string
  dataEncerramento: string
  cartorio: string
}

export interface PendenciaRecord {
  cartorio: string
  procedimento: string
  numero: string
  responsaveis: string
  nrJustica: string
  dataCriacao: string
  situacao: string
  teor: string
  prazo: string
  vencimento: string
  diasCartorio: number | null
  status: string
  cumpridaEm: string
}

export interface IntimacaoRecord {
  numero: string
  dataRec: string
  nome: string
  bairro: string
  escrivao: string
  cartorio: string
  dataEntrega: string
  mes: string
  dataDevolucao: string
  intimadoPor: string
  obs: string
}

export interface OficioRecord {
  numero: string
  data: string
  mes: string
  remetente: string
  cartorio: string
  destinatario: string
  referencia: string
}

export interface OrdemRecord {
  numero: string
  dataExpedicao: string
  mes: string
  agente: string
  cartorio: string
  tipoProcedimento: string
  numeroProc: string
  especie: string
  recebedor: string
  encaminhadaPara: string
  dataEntregue: string
  dataDevolucao: string
}

export interface PoliceModel {
  mesa: MesaRecord[]
  pendencias: PendenciaRecord[]
  intimacoes: IntimacaoRecord[]
  oficios: OficioRecord[]
  ordens: OrdemRecord[]
}

// ---------- Helpers ----------
const clean = (s: unknown) =>
  String(s ?? "").replace(/\s+/g, " ").trim()

const upper = (s: unknown) => clean(s).toUpperCase()

function toNum(s: unknown): number | null {
  const v = clean(s).replace(/\./g, "").replace(",", ".")
  if (v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// linha de cabeçalho = a com mais células preenchidas nas primeiras 8 linhas
function detectHeaderRow(values: string[][]): number {
  let best = 0
  let bestScore = -1
  const limit = Math.min(values.length, 8)
  for (let i = 0; i < limit; i++) {
    const row = values[i] || []
    const nonEmpty = row.filter((c) => clean(c) !== "").length
    if (nonEmpty > bestScore) {
      bestScore = nonEmpty
      best = i
    }
  }
  return best
}

// índice da coluna pelo nome (procura por inclusão, tolerante a acento/espaço)
function colIndex(headers: string[], candidates: string[]): number {
  const H = headers.map((h) => upper(h))
  for (const cand of candidates) {
    const c = upper(cand)
    const idx = H.findIndex((h) => h.includes(c))
    if (idx >= 0) return idx
  }
  return -1
}

type SheetType =
  | "mesa"
  | "pendencias_geral"
  | "intimacoes"
  | "oficios"
  | "ordens"
  | "ignore"

function classify(title: string, headers: string[]): SheetType {
  const t = upper(title)
  if (
    t.includes("TABELA DIN") ||
    t.startsWith("PÁGINA") ||
    t.startsWith("PAGINA") ||
    t.includes("FILTRO") ||
    t === "ORIGEM" ||
    t.includes("BASE_DASH") ||
    t === "DASHBOARD" ||
    t.includes("LISTAS DE GEST") ||
    t.includes("CÓPIA") ||
    t.includes("COPIA") ||
    t.includes("BOAS")
  )
    return "ignore"

  const H = headers.map((h) => upper(h))
  const has = (k: string) => H.some((h) => h.includes(k))

  if (has("MESA ATUAL")) return "mesa"
  if (has("Nº DA PENDÊNCIA") || (has("CARTÓRIO") && has("CUMPRIDA") && has("TEOR")))
    return "pendencias_geral"
  if (has("INTIMADO POR") || (has("BAIRRO") && has("ESCRIVAO"))) return "intimacoes"
  if (has("OFÍCIO") || has("OFICIO") || (has("REMETENTE") && has("DESTINAT")))
    return "oficios"
  if ((has("ORDEM") && has("ESPÉCIE")) || (has("AGENTE") && has("RECEBEDOR")))
    return "ordens"
  return "ignore"
}

// só linhas cujo identificador parece um procedimento (123/2025) ou número simples
const looksLikeRow = (v: string) => clean(v) !== ""

// ---------- Extratores por tipo ----------
function extractMesa(sheet: RawSheet, headerIdx: number): MesaRecord[] {
  const headers = sheet.values[headerIdx] || []
  const cProc = Math.max(0, colIndex(headers, ["N.º DO PROCEDIMENTO", "PROCEDIMENTO"]))
  const cTipo = colIndex(headers, ["TIPO"])
  const cMesa = colIndex(headers, ["MESA ATUAL"])
  const cResp = colIndex(headers, ["RESPONSÁVEL ATUAL", "RESPONSAVEL ATUAL"])
  const cPapel = colIndex(headers, ["PAPEL DO RESP"])
  const cEntr = colIndex(headers, ["DATA DE ENTRADA NA MESA"])
  const cPrazo = colIndex(headers, ["PRAZO DA MESA"])
  const cLim = colIndex(headers, ["DATA LIMITE DA MESA"])
  const cDias = colIndex(headers, ["DIAS NA MESA"])
  const cStatus = colIndex(headers, ["STATUS"])
  const cTot = colIndex(headers, ["DIAS TOTAIS"])
  const cObs = colIndex(headers, ["OBSERV"])
  const cSit = colIndex(headers, ["SITUAÇÃO", "SITUACAO"])
  const cEnc = colIndex(headers, ["DATA ENCERRAMENTO"])
  const cartorio = normalizeCartorio(sheet.title)

  const out: MesaRecord[] = []
  for (let i = headerIdx + 1; i < sheet.values.length; i++) {
    const r = sheet.values[i] || []
    const procedimento = clean(r[cProc])
    if (!looksLikeRow(procedimento) || !/\d/.test(procedimento)) continue
    out.push({
      procedimento,
      tipo: clean(r[cTipo]),
      mesaAtual: clean(r[cMesa]),
      responsavel: clean(r[cResp]),
      papel: clean(r[cPapel]),
      dataEntrada: clean(r[cEntr]),
      prazoMesa: clean(r[cPrazo]),
      dataLimite: clean(r[cLim]),
      diasNaMesa: toNum(r[cDias]),
      status: clean(r[cStatus]) || "—",
      diasTotais: toNum(r[cTot]),
      obs: clean(r[cObs]),
      situacao: clean(r[cSit]) || "—",
      dataEncerramento: clean(r[cEnc]),
      cartorio,
    })
  }
  return out
}

function extractPendencias(sheet: RawSheet, headerIdx: number): PendenciaRecord[] {
  const headers = sheet.values[headerIdx] || []
  const cCart = colIndex(headers, ["CARTÓRIO", "CARTORIO"])
  const cProc = colIndex(headers, ["PROCEDIMENTO"])
  const cNum = colIndex(headers, ["NÚMERO", "NUMERO"])
  const cResp = colIndex(headers, ["RESPONSÁVEIS", "RESPONSAVEIS"])
  const cJus = colIndex(headers, ["JUSTIÇA", "JUSTICA"])
  const cData = colIndex(headers, ["DATA DA CRIAÇÃO", "DATA CRIAÇÃO", "DATA DA CRIACAO"])
  const cSit = colIndex(headers, ["SITUAÇÃO", "SITUACAO"])
  const cTeor = colIndex(headers, ["TEOR"])
  const cPrazo = colIndex(headers, ["PRAZO"])
  const cVenc = colIndex(headers, ["VENCIMENTO"])
  const cDias = colIndex(headers, ["DIAS"])
  const cStatus = colIndex(headers, ["STATUS"])
  const cCump = colIndex(headers, ["CUMPRIDA"])

  const out: PendenciaRecord[] = []
  for (let i = headerIdx + 1; i < sheet.values.length; i++) {
    const r = sheet.values[i] || []
    const cartorio = clean(r[cCart])
    const numero = clean(r[cNum])
    if (!looksLikeRow(cartorio) && !looksLikeRow(numero)) continue
    out.push({
      cartorio: normalizeCartorio(cartorio),
      procedimento: clean(r[cProc]),
      numero,
      responsaveis: clean(r[cResp]),
      nrJustica: clean(r[cJus]),
      dataCriacao: clean(r[cData]),
      situacao: clean(r[cSit]),
      teor: clean(r[cTeor]),
      prazo: clean(r[cPrazo]),
      vencimento: clean(r[cVenc]),
      diasCartorio: toNum(r[cDias]),
      status: clean(r[cStatus]) || "—",
      cumpridaEm: clean(r[cCump]),
    })
  }
  return out
}

function extractIntimacoes(sheet: RawSheet, headerIdx: number): IntimacaoRecord[] {
  const headers = sheet.values[headerIdx] || []
  const cN = colIndex(headers, ["Nº", "N°", "N.º"])
  const cRec = colIndex(headers, ["DATA REC"])
  const cNome = colIndex(headers, ["NOME"])
  const cBairro = colIndex(headers, ["BAIRRO"])
  const cEsc = colIndex(headers, ["ESCRIVAO", "ESCRIVÃO"])
  const cCart = colIndex(headers, ["CARTÓRIO", "CARTORIO"])
  const cEntr = colIndex(headers, ["DATA ENTREGA"])
  const cMes = colIndex(headers, ["MÊS", "MES"])
  const cDev = colIndex(headers, ["DATA DEVOLUÇÃO", "DATA DEVOLUCAO"])
  const cInt = colIndex(headers, ["INTIMADO POR"])
  const cObs = colIndex(headers, ["OBS"])

  const out: IntimacaoRecord[] = []
  for (let i = headerIdx + 1; i < sheet.values.length; i++) {
    const r = sheet.values[i] || []
    const nome = clean(r[cNome])
    if (!looksLikeRow(nome)) continue
    out.push({
      numero: clean(r[cN]),
      dataRec: clean(r[cRec]),
      nome,
      bairro: clean(r[cBairro]) || "—",
      escrivao: clean(r[cEsc]) || "—",
      cartorio: normalizeCartorio(r[cCart]),
      dataEntrega: clean(r[cEntr]),
      mes: clean(r[cMes]) || "—",
      dataDevolucao: clean(r[cDev]),
      intimadoPor: clean(r[cInt]) || "—",
      obs: clean(r[cObs]) || "Pendente",
    })
  }
  return out
}

function extractOficios(sheet: RawSheet, headerIdx: number): OficioRecord[] {
  const headers = sheet.values[headerIdx] || []
  const cN = colIndex(headers, ["N.º OFÍCIO", "Nº OFÍCIO", "OFÍCIO", "OFICIO"])
  const cData = colIndex(headers, ["DATA"])
  const cMes = colIndex(headers, ["MÊS", "MES"])
  const cRem = colIndex(headers, ["REMETENTE"])
  const cCart = colIndex(headers, ["CARTÓRIO", "CARTORIO"])
  const cDest = colIndex(headers, ["DESTINAT"])
  const cRef = colIndex(headers, ["REFERÊNCIA", "REFERENCIA"])

  const out: OficioRecord[] = []
  for (let i = headerIdx + 1; i < sheet.values.length; i++) {
    const r = sheet.values[i] || []
    const numero = clean(r[cN])
    if (!looksLikeRow(numero)) continue
    out.push({
      numero,
      data: clean(r[cData]),
      mes: clean(r[cMes]) || "—",
      remetente: clean(r[cRem]) || "—",
      cartorio: normalizeCartorio(r[cCart]),
      destinatario: clean(r[cDest]) || "—",
      referencia: clean(r[cRef]),
    })
  }
  return out
}

function extractOrdens(sheet: RawSheet, headerIdx: number): OrdemRecord[] {
  const headers = sheet.values[headerIdx] || []
  const cN = colIndex(headers, ["N.º ORDEM", "Nº ORDEM", "ORDEM"])
  const cData = colIndex(headers, ["DATA EXPEDIÇÃO", "DATA EXPEDICAO"])
  const cMes = colIndex(headers, ["MÊS", "MES"])
  const cAg = colIndex(headers, ["AGENTE"])
  const cCart = colIndex(headers, ["CARTÓRIO", "CARTORIO"])
  const cTipo = colIndex(headers, ["TIPO"])
  const cNum = colIndex(headers, ["NÚMERO", "NUMERO"])
  const cEsp = colIndex(headers, ["ESPÉCIE", "ESPECIE"])
  const cReceb = colIndex(headers, ["RECEBEDOR"])
  const cEnc = colIndex(headers, ["ENCAMINHADA"])
  const cEntr = colIndex(headers, ["DATA ENTREGUE"])
  const cDev = colIndex(headers, ["DATA DEVOLUÇÃO", "DATA DEVOLUCAO"])

  const out: OrdemRecord[] = []
  for (let i = headerIdx + 1; i < sheet.values.length; i++) {
    const r = sheet.values[i] || []
    const numero = clean(r[cN])
    if (!looksLikeRow(numero)) continue
    out.push({
      numero,
      dataExpedicao: clean(r[cData]),
      mes: clean(r[cMes]) || "—",
      agente: clean(r[cAg]) || "—",
      cartorio: normalizeCartorio(r[cCart]),
      tipoProcedimento: clean(r[cTipo]),
      numeroProc: clean(r[cNum]),
      especie: clean(r[cEsp]),
      recebedor: clean(r[cReceb]) || "—",
      encaminhadaPara: clean(r[cEnc]),
      dataEntregue: clean(r[cEntr]),
      dataDevolucao: clean(r[cDev]),
    })
  }
  return out
}

// ---------- Montagem do modelo a partir das 5 planilhas ----------
export function buildModel(spreadsheets: RawSpreadsheet[]): PoliceModel {
  const model: PoliceModel = {
    mesa: [],
    pendencias: [],
    intimacoes: [],
    oficios: [],
    ordens: [],
  }

  for (const ss of spreadsheets) {
    for (const sheet of ss.sheets) {
      if (!sheet.values || sheet.values.length === 0) continue
      const headerIdx = detectHeaderRow(sheet.values)
      const headers = sheet.values[headerIdx] || []
      const type = classify(sheet.title, headers)

      switch (type) {
        case "mesa":
          model.mesa.push(...extractMesa(sheet, headerIdx))
          break
        case "pendencias_geral":
          // usa só a aba mestre "GERAL" (evita duplicar com Cópia/abas por crime)
          if (upper(sheet.title) === "GERAL")
            model.pendencias.push(...extractPendencias(sheet, headerIdx))
          break
        case "intimacoes":
          model.intimacoes.push(...extractIntimacoes(sheet, headerIdx))
          break
        case "oficios":
          model.oficios.push(...extractOficios(sheet, headerIdx))
          break
        case "ordens":
          model.ordens.push(...extractOrdens(sheet, headerIdx))
          break
      }
    }
  }

  return model
}
