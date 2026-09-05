"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { ReportForm } from "@/components/report-form"
import { ReportView } from "@/components/report-view"
import { useAuth } from "@/lib/auth-context"
import { apiFetch, ApiError } from "@/lib/api"
import type { Report } from "@/lib/report-types"

type Project = { _id: string; name: string }

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { token, user } = useAuth()
  const [report, setReport] = useState<Report | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    try {
      const [reportRes, projectsRes] = await Promise.all([
        apiFetch<{ report: Report }>(`/reports/${params.id}`, { token }),
        apiFetch<{ projects: Project[] }>("/projects", { token }),
      ])
      setReport(reportRes.report)
      setProjects(projectsRes.projects)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load report"
      setError(message)
      toast.error(message)
    }
  }, [token, params.id])

  useEffect(() => {
    load()
  }, [load])

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!report || !projects || !user) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  const ownerId = typeof report.owner === "string" ? report.owner : report.owner._id
  const isOwner = ownerId === user.id
  const isEditable = isOwner && (report.status === "draft" || report.status === "needs_correction")

  if (isEditable) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Edit weekly report</h1>
          <p className="text-sm text-muted-foreground">
            {report.status === "needs_correction"
              ? "Your manager requested changes. Update your report below and resubmit."
              : "This report is still a draft. Keep editing or submit it for review."}
          </p>
        </div>
        <ReportForm
          projects={projects}
          reportId={report._id}
          initialProject={typeof report.project === "string" ? report.project : report.project._id}
          initialWeekStartDate={report.weekStartDate.slice(0, 10)}
          initialContent={report.content}
          canSubmit
          onSaved={() => {
            router.refresh()
            load()
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ReportView report={report} />
    </div>
  )
}
