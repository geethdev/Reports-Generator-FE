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

export default function ReportHistoryPage() {
  const { token } = useAuth()
  const [reports, setReports] = useState<ReportSummary[] | null>(null)

  useEffect(() => {
    if (!token) return
    apiFetch<{ reports: ReportSummary[] }>("/reports/mine?limit=50", { token }).then((res) =>
      setReports(res.reports)
    )
  }, [token])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My reports</h1>
          <p className="text-sm text-muted-foreground">Your weekly report history and current statuses.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/reports/new" />}>
          New report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {reports === null ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reports yet. Create your first one to get started.
            </p>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/reports/${report._id}`} />}
                      >
                        {report.status === "draft" || report.status === "needs_correction"
                          ? "Edit"
                          : "View"}
                      </Button>
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
