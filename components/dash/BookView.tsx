"use client"

import type { BookDef } from "./bookConfigs"
import { KpiCard, DataTable } from "./ui"
import { ChartCard, BarH, Donut, Trend } from "./charts"

export default function BookView({ def }: { def: BookDef }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">{def.title}</h2>
        <p className="text-slate-500 text-sm">{def.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {def.kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} tone={k.tone} hint={k.hint} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {def.charts.map((c) => (
          <ChartCard key={c.title} title={c.title} subtitle={c.subtitle} span={c.span}>
            {c.kind === "barH" && <BarH data={c.data} byCartorio={c.byCartorio} />}
            {c.kind === "donut" && <Donut data={c.data} />}
            {c.kind === "trend" && <Trend data={c.data} color={c.color} />}
          </ChartCard>
        ))}
      </div>

      <DataTable rows={def.records} columns={def.columns} searchKeys={def.searchKeys} />
    </div>
  )
}
