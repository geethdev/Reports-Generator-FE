// Validated categorical palette (fixed order - never cycled/reordered).
// Passes CVD + normal-vision separation checks in both light and dark.
export const CATEGORICAL = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
]

// Fixed status colors - reserved for report status, never reused as a
// generic series color. Draft has no inherent status color so it stays neutral.
export const STATUS_COLOR: Record<string, string> = {
  draft: "#898781",
  submitted: "#fab219",
  needs_correction: "#d03b3b",
  approved: "#0ca30c",
}

// Chart chrome pulls from the app's existing design tokens so it follows
// light/dark automatically instead of a separate hardcoded chart theme.
export const CHART_GRID = "var(--border)"
export const CHART_AXIS = "var(--muted-foreground)"
export const CHART_TEXT = "var(--muted-foreground)"
