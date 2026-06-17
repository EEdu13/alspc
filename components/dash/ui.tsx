"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"

type Tone = "default" | "blue" | "green" | "red" | "amber" | "violet"

const toneMap: Record<Tone, { value: string; label: string; bar: string }> = {
  default: { value: "text-[#f0ede4]", label: "text-[#6a6058]", bar: "bg-[#3a3a3a]" },
  blue:    { value: "text-[#5AC8FA]", label: "text-[#2a6a8a]", bar: "bg-[#0A84FF]/40" },
  green:   { value: "text-[#30D158]", label: "text-[#1a6a3a]", bar: "bg-[#30D158]/30" },
  red:     { value: "text-[#FF3B3B]", label: "text-[#7a1a1a]", bar: "bg-[#FF3B3B]/30" },
  amber:   { value: "text-[#E8C547]", label: "text-[#6a5010]", bar: "bg-[#D4A820]/30" },
  violet:  { value: "text-[#BF5AF2]", label: "text-[#5a1a8a]", bar: "bg-[#BF5AF2]/30" },
}

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: string | number
  hint?: string
  tone?: Tone
}) {
  const t = toneMap[tone]
  return (
    <div className="bg-[#161616] border border-[#272727] rounded-xl p-4 flex flex-col hover:border-[#D4A820]/30 transition-colors">
      <span className={`text-[11px] uppercase tracking-widest font-semibold ${t.label}`}>
        {label}
      </span>
      <span className={`text-3xl font-bold mt-2 ${t.value}`}>{value}</span>
      {hint && <span className="text-[#4a4038] text-xs mt-1.5">{hint}</span>}
    </div>
  )
}

export function statusTone(status: string): string {
  const s = status.toUpperCase()
  if (s.includes("ATRAS"))
    return "bg-[#FF3B3B]/15 text-[#FF3B3B] border-[#FF3B3B]/30"
  if (s.includes("ATENÇ") || s.includes("ATENC") || s.includes("ALERTA"))
    return "bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/30"
  if (s.includes("NO PRAZO") || s.includes("FINALIZ") || s.includes("ARQUIV") || s.includes("CUMPR") || s.includes("RELAT"))
    return "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30"
  if (s.includes("ANDAMENTO") || s.includes("NOVA") || s.includes("INFORM"))
    return "bg-[#0A84FF]/15 text-[#5AC8FA] border-[#0A84FF]/30"
  return "bg-[#1a1a1a] text-[#7a7068] border-[#2a2a2a]"
}

export function StatusBadge({ value }: { value: string }) {
  if (!value || value === "—")
    return <span className="text-[#3a3028] text-xs">—</span>
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${statusTone(value)}`}>
      {value}
    </span>
  )
}

export interface Column<T> {
  key: keyof T
  label: string
  badge?: boolean
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  rows,
  columns,
  searchKeys,
  pageSize = 50,
}: {
  rows: T[]
  columns: Column<T>[]
  searchKeys: (keyof T)[]
  pageSize?: number
}) {
  const [q, setQ] = useState("")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim()
    if (!term) return rows
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(term))
    )
  }, [q, rows, searchKeys])

  const pageCount = Math.ceil(filtered.length / pageSize) || 1
  const safePage = Math.min(page, pageCount - 1)
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize)

  return (
    <div className="bg-[#161616] border border-[#272727] rounded-xl overflow-hidden">
      <div className="p-3 border-b border-[#1e1e1e] flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#4a4038] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0) }}
            placeholder="Pesquisar..."
            className="w-full bg-[#0a0a0a] border border-[#272727] rounded-lg pl-9 pr-3 py-2 text-sm text-[#c0b89a] placeholder-[#3a3028] focus:outline-none focus:border-[#D4A820]/50"
          />
        </div>
        <span className="text-[#4a4038] text-xs">
          {filtered.length.toLocaleString("pt-BR")} registros
        </span>
      </div>

      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-[#111111] z-10">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="px-3 py-2.5 text-[11px] font-semibold text-[#6a5010] uppercase tracking-wider whitespace-nowrap border-b border-[#1e1e1e]">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i} className={`border-b border-[#111111] hover:bg-[#1a1a1a] transition-colors ${i % 2 ? "bg-[#0d0d0d]" : ""}`}>
                {columns.map((c) => (
                  <td key={String(c.key)} className={`px-3 py-2 text-[#c0b89a] ${c.className || ""}`}>
                    {c.badge ? (
                      <StatusBadge value={String(r[c.key] ?? "")} />
                    ) : (
                      <span className="whitespace-nowrap">{String(r[c.key] ?? "")}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-[#3a3028]">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="p-3 border-t border-[#1e1e1e] flex items-center justify-between text-sm">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#272727] text-[#c0b89a] disabled:opacity-30 hover:border-[#D4A820]/40 hover:text-[#E8C547] transition-colors"
          >
            Anterior
          </button>
          <span className="text-[#4a4038] text-xs">
            Página {safePage + 1} de {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#272727] text-[#c0b89a] disabled:opacity-30 hover:border-[#D4A820]/40 hover:text-[#E8C547] transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
