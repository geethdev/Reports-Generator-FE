"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { useAuth } from "@/lib/auth-context"
import { apiFetch } from "@/lib/api"
import { STATUS_LABEL, type ReportStatus } from "@/lib/report-types"
import {
  StatusBarChart,
  ProjectWorkloadChart,
  HoursByCategoryChart,
  TasksCompletedTrendChart,
  MemberStatusChart,
} from "@/components/charts"

type Summary = {
  submittedThisWeek: number
  complianceRate: number
  compliance: { submitted: number; pending: number; late: number }
  needsCorrectionCount: number
  openBlockersCount: number
  notStartedCount: number
  notStarted: { _id: string; name: string }[]
}

type Charts = {
  statusBreakdown: { status: ReportStatus; count: number }[]
  byProjectWorkload: { project: string; hours: number }[]
  byMemberStatus: { member: string; counts: { status: ReportStatus; count: number }[] }[]
  tasksCompletedTrend: { weekStartDate: string; count: number }[]
  hoursByCategoryTeamWide: { development: number; testing: number; meetings: number; documentation: number }
  recentActivity: {
    reportId: string
    member: string
    project: string
    action: "approved" | "requested_changes"
    comment: string
    reviewedAt: string
  }[]
}

type ReportRow = {
  _id: string
  weekStartDate: string
  status: ReportStatus
  owner: { name: string } | string
  project: { name: string } | string
}

type Member = { _id: string; name: string }
type Project = { _id: string; name: string }

const STATUS_VARIANT: Record<ReportStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  submitted: "secondary",
  needs_correction: "destructive",
  approved: "default",
}

const ALL = "all"

export default function ManagerDashboardPage() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [charts, setCharts] = useState<Charts | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [memberFilter, setMemberFilter] = useState(ALL)
  const [projectFilter, setProjectFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  const [reports, setReports] = useState<ReportRow[] | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!token) return
    apiFetch<Summary>("/dashboard/summary", { token }).then(setSummary)
    apiFetch<Charts>("/dashboard/charts", { token }).then(setCharts)
    apiFetch<{ users: Member[] }>("/users", { token }).then((res) => setMembers(res.users))
    apiFetch<{ projects: Project[] }>("/projects", { token }).then((res) => setProjects(res.projects))
  }, [token])

  useEffect(() => {
    if (!token) return
    const params = new URLSearchParams({ page: String(page), limit: "10" })
    if (memberFilter !== ALL) params.set("member", memberFilter)
    if (projectFilter !== ALL) params.set("project", projectFilter)
    if (statusFilter !== ALL) params.set("status", statusFilter)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)

    apiFetch<{ reports: ReportRow[]; totalPages: number }>(`/reports/team?${params}`, { token }).then((res) => {
      setReports(res.reports)
      setTotalPages(res.totalPages)
    })
  }, [token, memberFilter, projectFilter, statusFilter, dateFrom, dateTo, page])

  function resetFilters() {
    setMemberFilter(ALL)
    setProjectFilter(ALL)
    setStatusFilter(ALL)
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Team-wide report activity and status this week.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Submitted this week" value={summary?.submittedThisWeek} />
        <StatCard
          label="Compliance rate"
          value={summary ? `${summary.complianceRate}%` : undefined}
          detail={
            summary
              ? `${summary.compliance.submitted} submitted, ${summary.compliance.pending} pending, ${summary.compliance.late} late`
              : undefined
          }
        />
        <StatCard label="Needs correction" value={summary?.needsCorrectionCount} />
        <StatCard label="Open blockers" value={summary?.openBlockersCount} />
        <StatCard label="Not started this week" value={summary?.notStartedCount} />
      </div>

      {summary && summary.notStarted.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base">Haven&apos;t started this week&apos;s report</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {summary.notStarted.map((member) => (
              <Link key={member._id} href={`/manager/team/${member._id}`}>
                <Badge variant="destructive">{member.name}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {charts && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Reports by status">
            <StatusBarChart data={charts.statusBreakdown} />
          </ChartCard>
          <ChartCard title="Workload by project (hours)">
            <ProjectWorkloadChart data={charts.byProjectWorkload} />
          </ChartCard>
          <ChartCard title="Tasks completed trend">
            <TasksCompletedTrendChart data={charts.tasksCompletedTrend} />
          </ChartCard>
          <ChartCard title="Time spent by task type (team-wide)">
            <HoursByCategoryChart data={charts.hoursByCategoryTeamWide} />
          </ChartCard>
          <ChartCard title="Submission status by team member" className="lg:col-span-2">
            <MemberStatusChart data={charts.byMemberStatus} />
          </ChartCard>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {charts.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No review activity yet.</p>
              ) : (
                charts.recentActivity.map((entry, i) => (
                  <Link
                    key={i}
                    href={`/manager/reports/${entry.reportId}`}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted"
                  >
                    <div>
                      <Badge variant={entry.action === "approved" ? "default" : "destructive"}>
                        {entry.action === "approved" ? "Approved" : "Requested changes"}
                      </Badge>
                      <span className="ml-2">
                        {entry.member} &middot; {entry.project}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(entry.reviewedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team reports</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <FilterSelect
              label="Member"
              value={memberFilter}
              onChange={(v) => {
                setMemberFilter(v)
                setPage(1)
              }}
              options={members.map((m) => ({ value: m._id, label: m.name }))}
            />
            <FilterSelect
              label="Project"
              value={projectFilter}
              onChange={(v) => {
                setProjectFilter(v)
                setPage(1)
              }}
              options={projects.map((p) => ({ value: p._id, label: p.name }))}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
              options={(Object.keys(STATUS_LABEL) as ReportStatus[])
                .filter((s) => s !== "draft")
                .map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">From</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">To</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                className="w-40"
              />
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>

          {reports === null ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports match these filters.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        {new Date(report.weekStartDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{typeof report.owner === "string" ? report.owner : report.owner.name}</TableCell>
                      <TableCell>
                        {typeof report.project === "string" ? report.project : report.project.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[report.status]}>{STATUS_LABEL[report.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/manager/reports/${report._id}`}
                          className="text-sm underline underline-offset-4"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number | undefined
  detail?: string
}) {
  return (
    <Card>
      <CardContent className="pt-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value ?? "—"}</div>
        {detail && <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>}
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
        <SelectTrigger className="w-40">
          <SelectValue>
            {(v: string) => (v === ALL ? "All" : options.find((o) => o.value === v)?.label)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
