"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { useAuth } from "@/lib/auth-context"
import { apiFetch, ApiError } from "@/lib/api"
import { STATUS_LABEL, type ReportStatus } from "@/lib/report-types"

type Member = { _id: string; name: string; email: string }
type Stats = {
  submitted: number
  needs_correction: number
  approved: number
  total: number
}
type ReportSummary = {
  _id: string
  weekStartDate: string
  status: ReportStatus
  project: { name: string } | string
}

const STATUS_VARIANT: Record<ReportStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  submitted: "secondary",
  needs_correction: "destructive",
  approved: "default",
}

export default function TeamMemberProfilePage() {
  const params = useParams<{ id: string }>()
  const { token } = useAuth()
  const [member, setMember] = useState<Member | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [reports, setReports] = useState<ReportSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    apiFetch<{ member: Member; stats: Stats; reports: ReportSummary[] }>(`/users/${params.id}`, { token })
      .then((res) => {
        setMember(res.member)
        setStats(res.stats)
        setReports(res.reports)
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load profile")
      })
  }, [token, params.id])

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!member || !stats || !reports) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{member.name}</h1>
        <p className="text-sm text-muted-foreground">{member.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total reports" value={stats.total} />
        <StatCard label="Submitted" value={stats.submitted} />
        <StatCard label="Needs correction" value={stats.needs_correction} />
        <StatCard label="Approved" value={stats.approved} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report history</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
