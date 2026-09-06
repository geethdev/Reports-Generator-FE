"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { ReportView } from "@/components/report-view"
import { useAuth } from "@/lib/auth-context"
import { apiFetch, ApiError } from "@/lib/api"
import type { Report } from "@/lib/report-types"

export default function ManagerReportReviewPage() {
  const params = useParams<{ id: string }>()
  const { token } = useAuth()
  const [report, setReport] = useState<Report | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiFetch<{ report: Report }>(`/reports/${params.id}`, { token })
      setReport(res.report)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load report"
      setError(message)
    }
  }, [token, params.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleReview(action: "approved" | "requested_changes") {
    if (!token || !report) return
    if (action === "requested_changes" && !comment.trim()) {
      toast.error("Add a comment explaining what needs to change")
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch(`/reports/${report._id}/review`, {
        method: "POST",
        token,
        body: { action, comment },
      })
      toast.success(action === "approved" ? "Report approved" : "Changes requested")
      setComment("")
      await load()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to submit review"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!report) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <ReportView report={report} />

      {report.status === "submitted" && (
        <Card>
          <CardHeader>
            <CardTitle>Review this report</CardTitle>
            <CardDescription>
              Approve it, or request changes with a comment explaining what needs to be corrected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="comment">Comment (required for requesting changes)</Label>
            <Textarea
              id="comment"
              className="mt-2"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What needs to change?"
            />
          </CardContent>
          <CardFooter className="gap-2">
            <Button disabled={isSubmitting} onClick={() => handleReview("approved")}>
              Approve
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => handleReview("requested_changes")}
            >
              Request changes
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
