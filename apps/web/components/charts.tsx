"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { CATEGORICAL, CHART_AXIS, CHART_GRID, STATUS_COLOR } from "@/lib/chart-colors"
import { STATUS_LABEL, type ReportStatus } from "@/lib/report-types"

const tickStyle = { fill: CHART_AXIS, fontSize: 12 }
const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--card-foreground)",
}

export function StatusBarChart({ data }: { data: { status: ReportStatus; count: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: STATUS_LABEL[d.status] }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="label" tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {rows.map((row) => (
            <Cell key={row.status} fill={STATUS_COLOR[row.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ProjectWorkloadChart({ data }: { data: { project: string; hours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="project" tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((row, i) => (
            <Cell key={row.project} fill={CATEGORICAL[i % CATEGORICAL.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function HoursByCategoryChart({
  data,
}: {
  data: { development: number; testing: number; meetings: number; documentation: number }
}) {
  const rows = [
    { category: "Development", hours: data.development },
    { category: "Testing", hours: data.testing },
    { category: "Meetings", hours: data.meetings },
    { category: "Documentation", hours: data.documentation },
  ]
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="category" tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {rows.map((row, i) => (
            <Cell key={row.category} fill={CATEGORICAL[i % CATEGORICAL.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TasksCompletedTrendChart({ data }: { data: { weekStartDate: string; count: number }[] }) {
  const rows = data.map((d) => ({
    ...d,
    label: new Date(d.weekStartDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="label" tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={CATEGORICAL[0]}
          strokeWidth={2}
          dot={{ r: 4, fill: CATEGORICAL[0] }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

type MemberStatusRow = { member: string; counts: { status: ReportStatus; count: number }[] }

export function MemberStatusChart({ data }: { data: MemberStatusRow[] }) {
  const statuses: ReportStatus[] = ["draft", "submitted", "needs_correction", "approved"]
  const rows = data.map((d) => {
    const row: Record<string, string | number> = { member: d.member }
    statuses.forEach((s) => {
      row[s] = d.counts.find((c) => c.status === s)?.count ?? 0
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="member" tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: CHART_AXIS }}
          formatter={(value: string) => STATUS_LABEL[value as ReportStatus]}
        />
        {statuses.map((s, i) => (
          <Bar
            key={s}
            dataKey={s}
            stackId="status"
            fill={STATUS_COLOR[s]}
            radius={i === statuses.length - 1 ? [4, 4, 0, 0] : undefined}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
