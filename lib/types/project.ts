export const PROJECT_STATUSES = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export type Project = {
  id: string
  owner_id: string
  name: string
  description: string | null
  location: string | null
  client_name: string
  status: ProjectStatus
  start_date: string | null
  estimated_end_date: string | null
  created_at: string
  updated_at: string
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planificación",
  active: "Activo",
  on_hold: "En pausa",
  completed: "Completado",
  cancelled: "Cancelado",
}

export const PROJECT_STATUS_ITEMS = PROJECT_STATUSES.map((value) => ({
  value,
  label: PROJECT_STATUS_LABELS[value],
}))
