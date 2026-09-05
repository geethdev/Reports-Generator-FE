"use client"

import { useState } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { apiFetch, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
  emptyContent,
  emptyTask,
  type ReportContent,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/report-types"

const PRIORITY_LABEL: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" }
const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  blocked: "Blocked",
}

type Project = { _id: string; name: string }

export function ReportForm({
  projects,
  reportId,
  initialProject,
  initialWeekStartDate,
  initialContent,
  canSubmit,
  onSaved,
}: {
  projects: Project[]
  reportId?: string
  initialProject?: string
  initialWeekStartDate?: string
  initialContent?: ReportContent
  canSubmit: boolean
  onSaved: (reportId: string) => void
}) {
  const { token } = useAuth()
  const [project, setProject] = useState(initialProject ?? "")
  const [weekStartDate, setWeekStartDate] = useState(initialWeekStartDate ?? "")
  const [content, setContent] = useState<ReportContent>(initialContent ?? emptyContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateContent<K extends keyof ReportContent>(key: K, value: ReportContent[K]) {
    setContent((c) => ({ ...c, [key]: value }))
  }

  function addTask() {
    updateContent("tasks", [...content.tasks, { ...emptyTask }])
  }
  function updateTask(index: number, field: keyof Task, value: string | number) {
    const tasks = content.tasks.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    updateContent("tasks", tasks)
  }
  function removeTask(index: number) {
    updateContent(
      "tasks",
      content.tasks.filter((_, i) => i !== index)
    )
  }

  function addNote(field: "blockers" | "achievements") {
    updateContent(field, [...content[field], { text: "", isKey: content[field].length === 0 }])
  }
  function updateNoteText(field: "blockers" | "achievements", index: number, text: string) {
    updateContent(
      field,
      content[field].map((n, i) => (i === index ? { ...n, text } : n))
    )
  }
  function setKeyNote(field: "blockers" | "achievements", index: number) {
    updateContent(
      field,
      content[field].map((n, i) => ({ ...n, isKey: i === index }))
    )
  }
  function removeNote(field: "blockers" | "achievements", index: number) {
    updateContent(
      field,
      content[field].filter((_, i) => i !== index)
    )
  }

  function buildPayload() {
    return {
      project,
      weekStartDate,
      content: {
        ...content,
        tasks: content.tasks.filter((t) => t.taskName.trim() !== ""),
        blockers: content.blockers.filter((b) => b.text.trim() !== ""),
        achievements: content.achievements.filter((a) => a.text.trim() !== ""),
      },
    }
  }

  async function handleSaveDraft() {
    if (!token) return
    setIsSaving(true)
    try {
      if (reportId) {
        await apiFetch(`/reports/${reportId}`, { method: "PUT", token, body: buildPayload() })
        toast.success("Draft saved")
        onSaved(reportId)
      } else {
        const res = await apiFetch<{ report: { _id: string } }>("/reports", {
          method: "POST",
          token,
          body: buildPayload(),
        })
        toast.success("Draft created")
        onSaved(res.report._id)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSubmitForReview() {
    if (!token || !reportId) return
    setIsSubmitting(true)
    try {
      await apiFetch(`/reports/${reportId}`, { method: "PUT", token, body: buildPayload() })
      await apiFetch(`/reports/${reportId}/submit`, { method: "POST", token })
      toast.success("Report submitted for review")
      onSaved(reportId)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to submit"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Report details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="week">Week starting</Label>
            <Input
              id="week"
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project">Project</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger id="project" className="w-full">
                <SelectValue placeholder="Select a project">
                  {(value: string) => projects.find((p) => p._id === value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks completed</CardTitle>
          <CardDescription>Add every task you worked on this week.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {content.tasks.map((task, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Label>Task name</Label>
                  <Input
                    className="mt-1"
                    value={task.taskName}
                    onChange={(e) => updateTask(index, "taskName", e.target.value)}
                    placeholder="e.g. Implement login page"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTask(index)}
                  aria-label="Remove task"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={task.priority}
                    onValueChange={(v) => updateTask(index, "priority", v)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue>
                        {(v: TaskPriority) => PRIORITY_LABEL[v]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_LABEL[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={task.status}
                    onValueChange={(v) => updateTask(index, "status", v)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue>
                        {(v: TaskStatus) => TASK_STATUS_LABEL[v]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {TASK_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Output / deliverable</Label>
                  <Input
                    className="mt-1"
                    value={task.output}
                    onChange={(e) => updateTask(index, "output", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <Label>Planned %</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    max={100}
                    value={task.plannedPercent}
                    onChange={(e) => updateTask(index, "plannedPercent", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Actual %</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    max={100}
                    value={task.actualPercent}
                    onChange={(e) => updateTask(index, "actualPercent", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Time planned (hrs)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={task.timePlannedHours}
                    onChange={(e) => updateTask(index, "timePlannedHours", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Time spent (hrs)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={task.timeSpentHours}
                    onChange={(e) => updateTask(index, "timeSpentHours", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addTask} className="self-start">
            Add task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan for next week</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={content.planForNextWeek}
            onChange={(e) => updateContent("planForNextWeek", e.target.value)}
          />
        </CardContent>
      </Card>

      <FlaggedNoteCard
        title="Blockers / challenges"
        description="Mark one as the key issue for the week."
        items={content.blockers}
        onAdd={() => addNote("blockers")}
        onChangeText={(i, text) => updateNoteText("blockers", i, text)}
        onSetKey={(i) => setKeyNote("blockers", i)}
        onRemove={(i) => removeNote("blockers", i)}
        addLabel="Add blocker"
      />

      <FlaggedNoteCard
        title="Achievements / highlights"
        description="Mark one as the key achievement for the week."
        items={content.achievements}
        onAdd={() => addNote("achievements")}
        onChangeText={(i, text) => updateNoteText("achievements", i, text)}
        onSetKey={(i) => setKeyNote("achievements", i)}
        onRemove={(i) => removeNote("achievements", i)}
        addLabel="Add achievement"
      />

      <Card>
        <CardHeader>
          <CardTitle>Hours worked by category</CardTitle>
          <CardDescription>Optional.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          {(["development", "testing", "meetings", "documentation"] as const).map((cat) => (
            <div key={cat}>
              <Label className="capitalize">{cat}</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={content.hoursByCategory[cat]}
                onChange={(e) =>
                  updateContent("hoursByCategory", {
                    ...content.hoursByCategory,
                    [cat]: Number(e.target.value),
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Optional notes or links.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={2}
            value={content.notes}
            onChange={(e) => updateContent("notes", e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={isSaving} onClick={handleSaveDraft}>
          {isSaving ? "Saving..." : "Save draft"}
        </Button>
        {canSubmit && (
          <Button type="button" disabled={isSubmitting} onClick={handleSubmitForReview}>
            {isSubmitting ? "Submitting..." : "Submit for review"}
          </Button>
        )}
      </div>
    </div>
  )
}

function FlaggedNoteCard({
  title,
  description,
  items,
  onAdd,
  onChangeText,
  onSetKey,
  onRemove,
  addLabel,
}: {
  title: string
  description: string
  items: { text: string; isKey: boolean }[]
  onAdd: () => void
  onChangeText: (index: number, text: string) => void
  onSetKey: (index: number) => void
  onRemove: (index: number) => void
  addLabel: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={item.text} onChange={(e) => onChangeText(index, e.target.value)} />
            <Button
              type="button"
              variant={item.isKey ? "default" : "outline"}
              size="sm"
              onClick={() => onSetKey(index)}
            >
              {item.isKey ? "Key" : "Mark key"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              aria-label="Remove"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={onAdd} className="self-start">
          {addLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
