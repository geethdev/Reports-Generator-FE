"use client"

import { useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@workspace/ui/components/button"

import { STATUS_LABEL, type Report, type ReportContent } from "@/lib/report-types"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  submitted: "secondary",
  needs_correction: "destructive",
  approved: "default",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function ReportView({ report }: { report: Report }) {
  const project = typeof report.project === "string" ? null : report.project
  const owner = typeof report.owner === "string" ? null : report.owner

  const lastCorrectionComment = [...report.reviewHistory]
    .reverse()
    .find((r) => r.action === "requested_changes")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Week of {formatDate(report.weekStartDate)}</h1>
          <p className="text-sm text-muted-foreground">
            {project?.name ?? "Unknown project"}
            {owner && <> &middot; {owner.name}</>}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[report.status]}>{STATUS_LABEL[report.status]}</Badge>
      </div>

      {report.status === "needs_correction" && lastCorrectionComment && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Changes requested</CardTitle>
            <CardDescription>{lastCorrectionComment.comment}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <ReportContentView content={report.content} />

      {report.previousVersions.length > 0 && (
        <VersionHistory versions={report.previousVersions} />
      )}

      {report.reviewHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review history</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {report.reviewHistory.map((entry, i) => (
              <div key={i} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <Badge variant={entry.action === "approved" ? "default" : "destructive"}>
                    {entry.action === "approved" ? "Approved" : "Requested changes"}
                  </Badge>
                  <span className="text-muted-foreground">{formatDate(entry.reviewedAt)}</span>
                </div>
                {entry.comment && <p className="mt-2 text-muted-foreground">{entry.comment}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ReportContentView({ content }: { content: ReportContent }) {
  const hours = content.hoursByCategory

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tasks completed</CardTitle>
        </CardHeader>
        <CardContent>
          {content.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Planned %</TableHead>
                  <TableHead>Actual %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time planned</TableHead>
                  <TableHead>Time spent</TableHead>
                  <TableHead>Output</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.tasks.map((task, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{task.taskName}</TableCell>
                    <TableCell className="capitalize">{task.priority}</TableCell>
                    <TableCell>{task.plannedPercent}%</TableCell>
                    <TableCell>{task.actualPercent}%</TableCell>
                    <TableCell className="capitalize">{task.status.replace("_", " ")}</TableCell>
                    <TableCell>{task.timePlannedHours}h</TableCell>
                    <TableCell>{task.timeSpentHours}h</TableCell>
                    <TableCell>{task.output || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan for next week</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{content.planForNextWeek || "—"}</p>
        </CardContent>
      </Card>

      <NoteListView title="Blockers / challenges" items={content.blockers} />
      <NoteListView title="Achievements / highlights" items={content.achievements} />

      <Card>
        <CardHeader>
          <CardTitle>Hours worked by category</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Development" value={hours.development} />
          <Stat label="Testing" value={hours.testing} />
          <Stat label="Meetings" value={hours.meetings} />
          <Stat label="Documentation" value={hours.documentation} />
        </CardContent>
      </Card>

      {content.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{content.notes}</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function NoteListView({ title, items }: { title: string; items: { text: string; isKey: boolean }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">None recorded.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {item.isKey && <Badge>Key</Badge>}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}h</div>
    </div>
  )
}

function VersionHistory({ versions }: { versions: Report["previousVersions"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version history</CardTitle>
        <CardDescription>Previous versions of this report, before each correction.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {versions
          .slice()
          .reverse()
          .map((version) => {
            const isOpen = openIndex === version.versionNumber
            return (
              <div key={version.versionNumber} className="rounded-lg border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-3 text-left text-sm"
                  onClick={() => setOpenIndex(isOpen ? null : version.versionNumber)}
                >
                  <span>
                    Version {version.versionNumber} &middot; submitted {formatDate(version.submittedAt)}
                  </span>
                  <span className="text-muted-foreground">{isOpen ? "Hide" : "View"}</span>
                </button>
                {isOpen && (
                  <div className="border-t p-3">
                    <ReportContentView content={version.content} />
                  </div>
                )}
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
