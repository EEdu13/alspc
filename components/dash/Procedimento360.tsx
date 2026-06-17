"use client"

import { useState, useMemo } from "react"
import type { PoliceModel } from "@/lib/parse"
import { Search, FileSearch } from "lucide-react"
import { StatusBadge } from "./ui"

const norm = (s: string) => (s || "").replace(/\s+/g, "").toLowerCase()

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200">{value || "—"}</dd>
    </div>
  )
}

function ResultCard({
  tag,
  color,
  children,
}: {
  tag: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <span
        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-3"
        style={{ backgroundColor: color + "22", color }}
      >
        {tag}
      </span>
      <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">{children}</dl>
    </div>
  )
}

export default function Procedimento360({ model }: { model: PoliceModel }) {
  const [q, setQ] = useState("")

  const results = useMemo(() => {
    const term = norm(q)
    if (term.length < 3) return null
    const match = (v: string) => norm(v).includes(term)
    return {
      mesa: model.mesa.filter((r) => match(r.procedimento)),
      pendencias: model.pendencias.filter(
        (r) => match(r.numero) || match(r.procedimento)
      ),
      ordens: model.ordens.filter((r) => match(r.numeroProc) || match(r.numero)),
    }
  }, [q, model])

  const total = results
    ? results.mesa.length + results.pendencias.length + results.ordens.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Procedimento 360°</h2>
        <p className="text-slate-500 text-sm">
          Digite um nº de procedimento para vê-lo na Mesa, nas Pendências e nas Ordens de Serviço.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex: 411114/2025"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {q && norm(q).length < 3 && (
        <p className="text-slate-500 text-sm">Digite ao menos 3 caracteres…</p>
      )}

      {results && (
        <p className="text-slate-400 text-sm">
          {total === 0 ? (
            <>Nenhum registro encontrado para <b className="text-slate-200">{q}</b>.</>
          ) : (
            <>
              <b className="text-slate-100">{total}</b> registro(s) encontrado(s) em{" "}
              {[
                results.mesa.length && "Mesa",
                results.pendencias.length && "Pendências",
                results.ordens.length && "Ordens",
              ]
                .filter(Boolean)
                .join(", ")}
              .
            </>
          )}
        </p>
      )}

      {!results && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600">
          <FileSearch className="w-12 h-12 mb-3" />
          <p>Busque um procedimento para ligar os livros.</p>
        </div>
      )}

      <div className="space-y-4">
        {results?.mesa.map((r, i) => (
          <ResultCard key={"m" + i} tag="MESA DE ACOMPANHAMENTO" color="#3b82f6">
            <Field label="Procedimento" value={r.procedimento} />
            <Field label="Cartório" value={r.cartorio} />
            <Field label="Tipo" value={r.tipo} />
            <Field label="Mesa atual" value={r.mesaAtual} />
            <Field label="Responsável" value={r.responsavel} />
            <Field label="Papel" value={r.papel} />
            <Field label="Dias na mesa" value={r.diasNaMesa ?? "—"} />
            <Field label="Status" value={<StatusBadge value={r.status} />} />
            <Field label="Situação" value={<StatusBadge value={r.situacao} />} />
          </ResultCard>
        ))}

        {results?.pendencias.map((r, i) => (
          <ResultCard key={"p" + i} tag="PENDÊNCIA DE CARTÓRIO" color="#f59e0b">
            <Field label="Número" value={r.numero} />
            <Field label="Cartório" value={r.cartorio} />
            <Field label="Teor" value={r.teor} />
            <Field label="Responsáveis" value={r.responsaveis} />
            <Field label="Prazo" value={r.prazo} />
            <Field label="Vencimento" value={r.vencimento} />
            <Field label="Status" value={<StatusBadge value={r.status} />} />
            <Field label="Cumprida em" value={r.cumpridaEm} />
          </ResultCard>
        ))}

        {results?.ordens.map((r, i) => (
          <ResultCard key={"o" + i} tag="ORDEM DE SERVIÇO" color="#10b981">
            <Field label="Nº Ordem" value={r.numero} />
            <Field label="Nº Procedimento" value={r.numeroProc} />
            <Field label="Cartório" value={r.cartorio} />
            <Field label="Agente" value={r.agente} />
            <Field label="Espécie" value={r.especie} />
            <Field label="Expedição" value={r.dataExpedicao} />
            <Field label="Recebedor" value={r.recebedor} />
            <Field label="Devolução" value={r.dataDevolucao} />
          </ResultCard>
        ))}
      </div>
    </div>
  )
}
