"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  LabelList,
} from "recharts"
import type { Slice } from "@/lib/agg"
import { CHART_PALETTE, colorForCartorio } from "@/lib/cartorios"

const tooltipStyle = {
  backgroundColor: "#161616",
  border: "1px solid #D4A820",
  borderRadius: 8,
  color: "#f0ede4",
  fontSize: 12,
}

const GOLD   = "#E8C547"
const GRID   = "#1a1a1a"
const AXIS   = "#4a4038"

export function ChartCard({
  title,
  subtitle,
  children,
  span = 1,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  span?: 1 | 2
}) {
  return (
    <div className={`bg-[#161616] border border-[#272727] rounded-xl p-4 hover:border-[#D4A820]/25 transition-colors ${span === 2 ? "lg:col-span-2" : ""}`}>
      <div className="mb-3 pb-2 border-b border-[#1e1e1e]">
        <h3 className="text-[#f0ede4] font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-[#4a4038] text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function BarH({
  data,
  byCartorio = false,
  height = 260,
}: {
  data: Slice[]
  byCartorio?: boolean
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 56, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke={AXIS}
          fontSize={11}
          width={120}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => (v.length > 16 ? v.slice(0, 15) + "…" : v)}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1a1a1a" }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Qtd" maxBarSize={28}>
          {data.map((d, i) => (
            <Cell key={i} fill={byCartorio ? colorForCartorio(d.name, i) : CHART_PALETTE[i % CHART_PALETTE.length]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            style={{ fill: GOLD, fontSize: 11, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Rótulo customizado dentro da fatia do donut
function DonutLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, value, percent } = props
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#111111">
      {value}
    </text>
  )
}

export function Donut({ data, height = 280 }: { data: Slice[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="46%"
          innerRadius={52}
          outerRadius={88}
          paddingAngle={2}
          labelLine={false}
          label={DonutLabel}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={colorForCartorio(d.name, i)} stroke="#161616" strokeWidth={1.5} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: AXIS }} iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function Trend({
  data,
  color = "#D4A820",
  height = 260,
}: {
  data: Slice[]
  color?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 0, right: 24, top: 20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="name" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#2a2a2a" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 4, fill: color, stroke: "#0a0a0a", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: color, stroke: "#0a0a0a", strokeWidth: 2 }}
          name="Qtd"
        >
          <LabelList
            dataKey="value"
            position="top"
            style={{ fill: GOLD, fontSize: 10, fontWeight: 700 }}
          />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  )
}
