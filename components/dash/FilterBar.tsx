"use client"

import { SlidersHorizontal, X } from "lucide-react"

export interface Filters {
  cartorio: string
  mes: string
  status: string
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  cartorios: string[]
  meses: string[]
  statuses: string[]
}

const sel =
  "bg-[#161616] border border-[#2a2a2a] text-[#c0b89a] text-xs rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-[#D4A820]/60 appearance-none cursor-pointer min-w-[140px] hover:border-[#D4A820]/30 transition-colors"

export default function FilterBar({ filters, onChange, cartorios, meses, statuses }: Props) {
  const active = [filters.cartorio, filters.mes, filters.status].filter(Boolean).length

  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value })

  const clear = () => onChange({ cartorio: "", mes: "", status: "" })

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6 py-2.5 border-b border-[#1e1e1e] bg-[#0d0d0d]">
      <span className="flex items-center gap-1.5 text-[#6a6058] text-xs font-medium mr-1">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtros
        {active > 0 && (
          <span className="bg-[#D4A820] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {active}
          </span>
        )}
      </span>

      {(["cartorio", "mes", "status"] as const).map((key) => {
        const opts = key === "cartorio" ? cartorios : key === "mes" ? meses : statuses
        const labels = { cartorio: "Todos os cartórios", mes: "Todos os meses", status: "Todos os status" }
        return (
          <div key={key} className="relative">
            <select value={filters[key]} onChange={set(key)} className={sel}>
              <option value="">{labels[key]}</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#4a4038] text-[10px]">▼</span>
          </div>
        )
      })}

      {active > 0 && (
        <button
          onClick={clear}
          className="flex items-center gap-1 text-xs text-[#6a6058] hover:text-[#E8C547] border border-[#2a2a2a] hover:border-[#D4A820]/50 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar
        </button>
      )}
    </div>
  )
}
