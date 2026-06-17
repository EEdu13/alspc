"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { signOut } from "next-auth/react"
import type { PoliceModel } from "@/lib/parse"
import { buildBookDefs } from "./bookConfigs"
import Overview from "./Overview"
import BookView from "./BookView"
import Procedimento360 from "./Procedimento360"
import FilterBar, { type Filters } from "./FilterBar"
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  UserCheck,
  Mail,
  FileText,
  Network,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"

type View = "overview" | "mesa" | "pendencias" | "intimacoes" | "oficios" | "ordens" | "360"

const NAV: { key: View; label: string; icon: React.ElementType }[] = [
  { key: "overview",    label: "Visão Geral",            icon: LayoutDashboard },
  { key: "mesa",        label: "Mesa de Acompanhamento", icon: Layers },
  { key: "pendencias",  label: "Pendências",             icon: ClipboardList },
  { key: "intimacoes",  label: "Intimações",             icon: UserCheck },
  { key: "oficios",     label: "Ofícios",                icon: Mail },
  { key: "ordens",      label: "Ordens de Serviço",      icon: FileText },
  { key: "360",         label: "Procedimento 360°",      icon: Network },
]

export default function PoliceDashboard({
  model,
  userEmail,
  userImage,
}: {
  model: PoliceModel
  userEmail: string
  userImage: string | null
}) {
  const [view, setView] = useState<View>("overview")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({ cartorio: "", mes: "", status: "" })

  const cartorios = useMemo(() =>
    Array.from(new Set([
      ...model.mesa.map((r) => r.cartorio),
      ...model.pendencias.map((r) => r.cartorio),
      ...model.intimacoes.map((r) => r.cartorio),
      ...model.oficios.map((r) => r.cartorio),
      ...model.ordens.map((r) => r.cartorio),
    ].filter((c) => c && c !== "—"))).sort()
  , [model])

  const meses = useMemo(() =>
    Array.from(new Set([
      ...model.intimacoes.map((r) => r.mes),
      ...model.oficios.map((r) => r.mes),
      ...model.ordens.map((r) => r.mes),
    ].filter((m) => m && m !== "—"))).sort()
  , [model])

  const statuses = useMemo(() =>
    Array.from(new Set([
      ...model.mesa.map((r) => r.status),
      ...model.pendencias.map((r) => r.status),
    ].filter((s) => s && s !== "—"))).sort()
  , [model])

  const filteredModel = useMemo<PoliceModel>(() => {
    const byCart   = (r: { cartorio: string }) => !filters.cartorio || r.cartorio === filters.cartorio
    const byMes    = (r: { mes: string })      => !filters.mes      || r.mes      === filters.mes
    const byStatus = (r: { status: string })   => !filters.status   || r.status   === filters.status
    return {
      mesa:       model.mesa.filter((r) => byCart(r) && byStatus(r)),
      pendencias: model.pendencias.filter((r) => byCart(r) && byStatus(r)),
      intimacoes: model.intimacoes.filter((r) => byCart(r) && byMes(r)),
      oficios:    model.oficios.filter((r) => byCart(r) && byMes(r)),
      ordens:     model.ordens.filter((r) => byCart(r) && byMes(r)),
    }
  }, [model, filters])

  const defs = useMemo(() => buildBookDefs(filteredModel), [filteredModel])
  const currentLabel = NAV.find((n) => n.key === view)?.label || ""

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#f0ede4] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-[#0d0d0d] border-r border-[#272727] flex flex-col transition-transform ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>

        {/* Cabeçalho com logo */}
        <div className="px-4 pt-5 pb-4 border-b border-[#272727]">
          <div className="flex items-center gap-3">
            <Image src="/pc_thumb.png" alt="PCPR" width={48} height={48} className="flex-shrink-0 drop-shadow-lg" />
            <div>
              <p className="font-bold text-sm text-[#E8C547] leading-tight tracking-wide">POLÍCIA CIVIL</p>
              <p className="text-[#7a7068] text-[11px] mt-0.5 tracking-wider">PARANÁ</p>
            </div>
          </div>
          <p className="text-[#4a4038] text-[10px] mt-2.5 tracking-widest uppercase">Delegacia · Telêmaco Borba</p>
          <div className="mt-3 h-px bg-gradient-to-r from-[#D4A820] via-[#E8C547]/40 to-transparent" />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => { setView(item.key); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-[#D4A820]/15 text-[#E8C547] font-semibold border border-[#D4A820]/30"
                    : "text-[#6a6058] hover:bg-[#1a1a1a] hover:text-[#c0b89a] border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-left flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>
            )
          })}
        </nav>

        {/* Usuário */}
        <div className="p-3 border-t border-[#272727]">
          <div className="flex items-center gap-2 mb-2 px-1">
            {userImage ? (
              <img src={userImage} alt="" className="w-7 h-7 rounded-full ring-1 ring-[#D4A820]/40" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center text-xs text-[#7a7068]">
                {userEmail[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-[#4a4038] text-xs truncate">{userEmail}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 text-[#4a4038] hover:text-[#f0ede4] text-sm py-2 px-3 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-[#0d0d0d] border-b border-[#272727] px-4 lg:px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
          <button className="lg:hidden text-[#4a4038] hover:text-white" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#4a4038] text-sm hidden sm:block">PCPR</span>
            <span className="text-[#2a2a2a] hidden sm:block">/</span>
            <h1 className="font-semibold text-base text-[#f0ede4]">{currentLabel}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-[#3a3028] font-mono hidden md:block tracking-widest uppercase">
              Painel de Gestão
            </span>
          </div>
        </header>

        {/* Filtros */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          cartorios={cartorios}
          meses={meses}
          statuses={statuses}
        />

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {view === "overview"   && <Overview model={filteredModel} />}
          {view === "mesa"       && <BookView def={defs.mesa} />}
          {view === "pendencias" && <BookView def={defs.pendencias} />}
          {view === "intimacoes" && <BookView def={defs.intimacoes} />}
          {view === "oficios"    && <BookView def={defs.oficios} />}
          {view === "ordens"     && <BookView def={defs.ordens} />}
          {view === "360"        && <Procedimento360 model={filteredModel} />}
        </main>
      </div>
    </div>
  )
}
