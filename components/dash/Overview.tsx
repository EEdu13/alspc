"use client"

import type { PoliceModel } from "@/lib/parse"
import { countBy, countByMonth, fmt, type Slice } from "@/lib/agg"
import { KpiCard } from "./ui"
import { ChartCard, BarH, Donut, Trend } from "./charts"

const isLate = (s: string) => s.toUpperCase().includes("ATRAS")

export default function Overview({ model }: { model: PoliceModel }) {
  const { mesa, pendencias, intimacoes, oficios, ordens } = model

  const mesaAtrasados = mesa.filter((r) => isLate(r.status)).length
  const pendAtrasadas = pendencias.filter((r) => isLate(r.status)).length
  const pendAndamento = pendencias.filter((r) =>
    r.status.toUpperCase().includes("ANDAMENTO")
  ).length

  // volume por livro
  const volumeLivros: Slice[] = [
    { name: "Mesa (Proced.)", value: mesa.length },
    { name: "Pendências", value: pendencias.length },
    { name: "Intimações", value: intimacoes.length },
    { name: "Ofícios", value: oficios.length },
    { name: "Ordens Serv.", value: ordens.length },
  ]

  // atividade consolidada por cartório (soma dos 5 livros)
  const cartorioMap = new Map<string, number>()
  const add = (rows: { cartorio: string }[]) => {
    for (const r of rows) {
      const k = r.cartorio || "Não informado"
      cartorioMap.set(k, (cartorioMap.get(k) || 0) + 1)
    }
  }
  add(mesa)
  add(pendencias)
  add(intimacoes)
  add(oficios)
  add(ordens)
  const atividadeCartorio = Array.from(cartorioMap, ([name, value]) => ({
    name,
    value,
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12)

  const mesaPorCartorio = countBy(mesa, (r) => r.cartorio, { limit: 9 })
  const mesaStatus = countBy(mesa, (r) => r.status, { limit: 6 })
  const intimacoesMes = countByMonth(intimacoes, (r) => r.mes)

  return (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Procedimentos (Mesa)" value={fmt(mesa.length)} tone="blue" />
        <KpiCard
          label="Atrasados na Mesa"
          value={fmt(mesaAtrasados)}
          tone="red"
          hint={`${((mesaAtrasados / (mesa.length || 1)) * 100).toFixed(0)}% do total`}
        />
        <KpiCard label="Pendências" value={fmt(pendencias.length)} tone="amber" hint={`${pendAndamento} em andamento`} />
        <KpiCard label="Intimações" value={fmt(intimacoes.length)} tone="violet" />
        <KpiCard label="Ofícios" value={fmt(oficios.length)} tone="green" />
        <KpiCard label="Ordens de Serviço" value={fmt(ordens.length)} />
      </div>

      {/* alerta atrasos */}
      {(mesaAtrasados > 0 || pendAtrasadas > 0) && (
        <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/25 rounded-xl p-4 flex flex-wrap items-center gap-x-8 gap-y-2">
          <span className="text-[#FF3B3B] font-semibold text-sm tracking-wide">⚠ ALERTAS DE PRAZO</span>
          <span className="text-[#c0b89a] text-sm">
            <b className="text-[#FF3B3B] font-bold">{fmt(mesaAtrasados)}</b> procedimentos atrasados na Mesa
          </span>
          <span className="text-[#c0b89a] text-sm">
            <b className="text-[#FF3B3B] font-bold">{fmt(pendAtrasadas)}</b> pendências atrasadas nos cartórios
          </span>
        </div>
      )}

      {/* gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Volume por livro" subtitle="Total de registros em cada planilha">
          <BarH data={volumeLivros} height={240} />
        </ChartCard>

        <ChartCard title="Procedimentos na Mesa por cartório">
          <Donut data={mesaPorCartorio} />
        </ChartCard>

        <ChartCard
          title="Atividade consolidada por cartório"
          subtitle="Soma de procedimentos, pendências, intimações, ofícios e ordens"
          span={2}
        >
          <BarH data={atividadeCartorio} byCartorio height={320} />
        </ChartCard>

        <ChartCard title="Situação dos procedimentos (Mesa)">
          <BarH data={mesaStatus} height={240} />
        </ChartCard>

        <ChartCard title="Intimações por mês" subtitle="Evolução em 2026">
          <Trend data={intimacoesMes} color="#a855f7" />
        </ChartCard>
      </div>
    </div>
  )
}
