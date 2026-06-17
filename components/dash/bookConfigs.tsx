"use client"

import type { PoliceModel } from "@/lib/parse"
import { countBy, countByMonth, fmt, type Slice } from "@/lib/agg"
import type { Column } from "./ui"

type Tone = "default" | "blue" | "green" | "red" | "amber" | "violet"

export interface KpiSpec {
  label: string
  value: string
  tone?: Tone
  hint?: string
}
export interface ChartSpec {
  title: string
  subtitle?: string
  kind: "barH" | "donut" | "trend"
  data: Slice[]
  byCartorio?: boolean
  color?: string
  span?: 1 | 2
}
export interface BookDef {
  key: string
  title: string
  subtitle: string
  records: any[]
  kpis: KpiSpec[]
  charts: ChartSpec[]
  columns: Column<any>[]
  searchKeys: string[]
}

const has = (s: string, k: string) => (s || "").toUpperCase().includes(k)
const distinct = (rows: any[], f: string) =>
  new Set(rows.map((r) => (r[f] || "").trim()).filter((v) => v && v !== "—")).size
const pct = (n: number, total: number) =>
  `${((n / (total || 1)) * 100).toFixed(0)}% do total`

export function buildBookDefs(model: PoliceModel): Record<string, BookDef> {
  const { mesa, pendencias, intimacoes, oficios, ordens } = model

  // ---------------- MESA ----------------
  const mesaAtras = mesa.filter((r) => has(r.status, "ATRAS")).length
  const mesaAndamento = mesa.filter((r) => has(r.situacao, "ANDAMENTO")).length
  const mesaConcl = mesa.filter(
    (r) => has(r.situacao, "ARQUIV") || has(r.situacao, "RELAT")
  ).length

  const mesaDef: BookDef = {
    key: "mesa",
    title: "Mesa de Acompanhamento",
    subtitle: "Esteira de procedimentos (IP / TCIP / BOC)",
    records: mesa,
    kpis: [
      { label: "Total na esteira", value: fmt(mesa.length), tone: "blue" },
      { label: "Atrasados", value: fmt(mesaAtras), tone: "red", hint: pct(mesaAtras, mesa.length) },
      { label: "Em andamento", value: fmt(mesaAndamento), tone: "amber" },
      { label: "Concluídos", value: fmt(mesaConcl), tone: "green" },
    ],
    charts: [
      { title: "Por cartório", kind: "donut", data: countBy(mesa, (r) => r.cartorio, { limit: 9 }) },
      { title: "Por situação (status do prazo)", kind: "barH", data: countBy(mesa, (r) => r.status, { limit: 6 }) },
      { title: "Por responsável atual", subtitle: "Top 10", kind: "barH", data: countBy(mesa, (r) => r.responsavel, { limit: 10 }) },
      { title: "Por mesa atual", kind: "barH", data: countBy(mesa, (r) => r.mesaAtual, { limit: 8 }) },
    ],
    columns: [
      { key: "procedimento", label: "Procedimento" },
      { key: "tipo", label: "Tipo" },
      { key: "cartorio", label: "Cartório" },
      { key: "mesaAtual", label: "Mesa Atual" },
      { key: "responsavel", label: "Responsável" },
      { key: "diasNaMesa", label: "Dias na Mesa" },
      { key: "status", label: "Status", badge: true },
      { key: "situacao", label: "Situação", badge: true },
    ],
    searchKeys: ["procedimento", "responsavel", "mesaAtual", "cartorio", "status"],
  }

  // ---------------- PENDÊNCIAS ----------------
  const pFinal = pendencias.filter((r) => has(r.status, "FINALIZ")).length
  const pAtras = pendencias.filter((r) => has(r.status, "ATRAS")).length
  const pAnd = pendencias.filter((r) => has(r.status, "ANDAMENTO")).length

  const pendDef: BookDef = {
    key: "pendencias",
    title: "Pendências dos Cartórios",
    subtitle: "Diligências e prazos por cartório",
    records: pendencias,
    kpis: [
      { label: "Total", value: fmt(pendencias.length), tone: "blue" },
      { label: "Finalizadas", value: fmt(pFinal), tone: "green", hint: pct(pFinal, pendencias.length) },
      { label: "Em andamento", value: fmt(pAnd), tone: "amber" },
      { label: "Atrasadas", value: fmt(pAtras), tone: "red" },
    ],
    charts: [
      { title: "Por cartório", kind: "donut", data: countBy(pendencias, (r) => r.cartorio, { limit: 9 }) },
      { title: "Por status", kind: "barH", data: countBy(pendencias, (r) => r.status, { limit: 6 }) },
      { title: "Por teor da pendência", subtitle: "Top 10", kind: "barH", data: countBy(pendencias, (r) => r.teor, { limit: 10 }) },
      { title: "Por situação", kind: "barH", data: countBy(pendencias, (r) => r.situacao, { limit: 8 }) },
    ],
    columns: [
      { key: "cartorio", label: "Cartório" },
      { key: "numero", label: "Número" },
      { key: "responsaveis", label: "Responsáveis" },
      { key: "teor", label: "Teor" },
      { key: "prazo", label: "Prazo" },
      { key: "vencimento", label: "Vencimento" },
      { key: "status", label: "Status", badge: true },
      { key: "cumpridaEm", label: "Cumprida em" },
    ],
    searchKeys: ["numero", "responsaveis", "cartorio", "teor", "status"],
  }

  // ---------------- INTIMAÇÕES ----------------
  const iCump = intimacoes.filter((r) => has(r.obs, "CUMPR")).length
  const iInfo = intimacoes.filter((r) => has(r.obs, "INFORM")).length
  const iPend = intimacoes.filter((r) => !r.obs || r.obs === "Pendente").length

  const intimDef: BookDef = {
    key: "intimacoes",
    title: "Intimações",
    subtitle: "Pessoas intimadas em 2026",
    records: intimacoes,
    kpis: [
      { label: "Total", value: fmt(intimacoes.length), tone: "violet" },
      { label: "Cumpridas", value: fmt(iCump), tone: "green" },
      { label: "Informadas", value: fmt(iInfo), tone: "blue" },
      { label: "Pendentes", value: fmt(iPend), tone: "amber" },
    ],
    charts: [
      { title: "Evolução por mês", kind: "trend", color: "#a855f7", data: countByMonth(intimacoes, (r) => r.mes), span: 2 },
      { title: "Por cartório", kind: "donut", data: countBy(intimacoes, (r) => r.cartorio, { limit: 9 }) },
      { title: "Por status", kind: "barH", data: countBy(intimacoes, (r) => r.obs, { limit: 6 }) },
      { title: "Por bairro", subtitle: "Top 10", kind: "barH", data: countBy(intimacoes, (r) => r.bairro, { limit: 10 }) },
      { title: "Por escrivão", kind: "barH", data: countBy(intimacoes, (r) => r.escrivao, { limit: 8 }) },
    ],
    columns: [
      { key: "numero", label: "Nº" },
      { key: "nome", label: "Nome" },
      { key: "bairro", label: "Bairro" },
      { key: "cartorio", label: "Cartório" },
      { key: "escrivao", label: "Escrivão" },
      { key: "mes", label: "Mês" },
      { key: "intimadoPor", label: "Intimado por" },
      { key: "obs", label: "Status", badge: true },
    ],
    searchKeys: ["nome", "bairro", "escrivao", "cartorio", "intimadoPor"],
  }

  // ---------------- OFÍCIOS ----------------
  const ofiDef: BookDef = {
    key: "oficios",
    title: "Ofícios",
    subtitle: "Correspondências oficiais expedidas",
    records: oficios,
    kpis: [
      { label: "Total", value: fmt(oficios.length), tone: "green" },
      { label: "Remetentes", value: fmt(distinct(oficios, "remetente")) },
      { label: "Destinatários", value: fmt(distinct(oficios, "destinatario")) },
      { label: "Cartórios", value: fmt(distinct(oficios, "cartorio")) },
    ],
    charts: [
      { title: "Evolução por mês", kind: "trend", color: "#10b981", data: countByMonth(oficios, (r) => r.mes), span: 2 },
      { title: "Por cartório", kind: "donut", data: countBy(oficios, (r) => r.cartorio, { limit: 9 }) },
      { title: "Por remetente", subtitle: "Top 10", kind: "barH", data: countBy(oficios, (r) => r.remetente, { limit: 10 }) },
      { title: "Por destinatário", subtitle: "Top 10", kind: "barH", data: countBy(oficios, (r) => r.destinatario, { limit: 10 }) },
    ],
    columns: [
      { key: "numero", label: "Nº Ofício" },
      { key: "data", label: "Data" },
      { key: "mes", label: "Mês" },
      { key: "remetente", label: "Remetente" },
      { key: "cartorio", label: "Cartório" },
      { key: "destinatario", label: "Destinatário" },
      { key: "referencia", label: "Referência" },
    ],
    searchKeys: ["numero", "remetente", "destinatario", "referencia", "cartorio"],
  }

  // ---------------- ORDENS DE SERVIÇO ----------------
  const oDevol = ordens.filter((r) => r.dataDevolucao && r.dataDevolucao !== "—").length
  const oPend = ordens.length - oDevol

  const ordDef: BookDef = {
    key: "ordens",
    title: "Ordens de Serviço",
    subtitle: "Ordens de campo emitidas aos investigadores",
    records: ordens,
    kpis: [
      { label: "Total", value: fmt(ordens.length), tone: "blue" },
      { label: "Devolvidas", value: fmt(oDevol), tone: "green", hint: pct(oDevol, ordens.length) },
      { label: "Sem devolução", value: fmt(oPend), tone: "amber" },
      { label: "Agentes", value: fmt(distinct(ordens, "agente")) },
    ],
    charts: [
      { title: "Evolução por mês", kind: "trend", color: "#3b82f6", data: countByMonth(ordens, (r) => r.mes), span: 2 },
      { title: "Por cartório", kind: "donut", data: countBy(ordens, (r) => r.cartorio, { limit: 9 }) },
      { title: "Por agente", subtitle: "Top 10", kind: "barH", data: countBy(ordens, (r) => r.agente, { limit: 10 }) },
      { title: "Por tipo de procedimento", kind: "barH", data: countBy(ordens, (r) => r.tipoProcedimento, { limit: 8 }) },
      { title: "Por recebedor", kind: "barH", data: countBy(ordens, (r) => r.recebedor, { limit: 8 }) },
    ],
    columns: [
      { key: "numero", label: "Nº Ordem" },
      { key: "dataExpedicao", label: "Expedição" },
      { key: "mes", label: "Mês" },
      { key: "agente", label: "Agente" },
      { key: "cartorio", label: "Cartório" },
      { key: "numeroProc", label: "Nº Procedimento" },
      { key: "especie", label: "Espécie" },
      { key: "recebedor", label: "Recebedor" },
      { key: "dataDevolucao", label: "Devolução" },
    ],
    searchKeys: ["numeroProc", "agente", "especie", "cartorio", "recebedor"],
  }

  return {
    mesa: mesaDef,
    pendencias: pendDef,
    intimacoes: intimDef,
    oficios: ofiDef,
    ordens: ordDef,
  }
}
