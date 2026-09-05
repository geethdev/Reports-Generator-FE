"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { ReportForm } from "@/components/report-form"
import { useAuth } from "@/lib/auth-context"
import { apiFetch } from "@/lib/api"

type Project = { _id: string; name: string }

export default function NewReportPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[] | null>(null)

  useEffect(() => {
    if (!token) return
    apiFetch<{ projects: Project[] }>("/projects", { token }).then((res) => setProjects(res.projects))
  }, [token])

  if (projects === null) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New weekly report</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your report and save it as a draft. You can keep editing before submitting it for review.
        </p>
      </div>
      <ReportForm
        projects={projects}
        canSubmit={false}
        onSaved={(reportId) => router.push(`/reports/${reportId}`)}
      />
    </div>
  )
}
