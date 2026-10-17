export const TASK_STATUSES = ["pending", "in_progress", "completed"] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ["low", "medium", "high"] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export type Task = {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
}

export const TASK_STATUS_ITEMS = TASK_STATUSES.map((value) => ({
  value,
  label: TASK_STATUS_LABELS[value],
}))

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
}

export const TASK_PRIORITY_ITEMS = TASK_PRIORITIES.map((value) => ({
  value,
  label: TASK_PRIORITY_LABELS[value],
}))
