export type TaskPriority = "low" | "medium" | "high"
export type TaskStatus = "not_started" | "in_progress" | "completed" | "blocked"
export type ReportStatus = "draft" | "submitted" | "needs_correction" | "approved"

export type Task = {
  taskName: string
  priority: TaskPriority
  plannedPercent: number
  actualPercent: number
  status: TaskStatus
  timePlannedHours: number
  timeSpentHours: number
  output: string
}

export type FlaggedNote = {
  text: string
  isKey: boolean
}

export type HoursByCategory = {
  development: number
  testing: number
  meetings: number
  documentation: number
}

export type ReportContent = {
  tasks: Task[]
  planForNextWeek: string
  blockers: FlaggedNote[]
  achievements: FlaggedNote[]
  hoursByCategory: HoursByCategory
  notes: string
}

export type ReviewHistoryEntry = {
  reviewer: string
  action: "approved" | "requested_changes"
  comment: string
  reviewedAt: string
}

export type PreviousVersion = {
  versionNumber: number
  content: ReportContent
  submittedAt: string
}

export type Report = {
  _id: string
  owner: { _id: string; name: string; email: string } | string
  project: { _id: string; name: string } | string
  weekStartDate: string
  status: ReportStatus
  content: ReportContent
  currentVersionNumber: number
  previousVersions: PreviousVersion[]
  reviewHistory: ReviewHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  needs_correction: "Needs Correction",
  approved: "Approved",
}

export const emptyContent: ReportContent = {
  tasks: [],
  planForNextWeek: "",
  blockers: [],
  achievements: [],
  hoursByCategory: { development: 0, testing: 0, meetings: 0, documentation: 0 },
  notes: "",
}

export const emptyTask: Task = {
  taskName: "",
  priority: "medium",
  plannedPercent: 0,
  actualPercent: 0,
  status: "not_started",
  timePlannedHours: 0,
  timeSpentHours: 0,
  output: "",
}
