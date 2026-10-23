export type JsonObject = Record<string, unknown>

export type Calculation = {
  id: string
  owner_id: string
  project_id: string | null
  tool_id: string
  title: string
  summary: string
  inputs: JsonObject
  result: JsonObject
  created_at: string
  updated_at: string
}

export type CalculationListItem = Pick<
  Calculation,
  "id" | "project_id" | "tool_id" | "title" | "summary" | "created_at"
>

export const NO_PROJECT = "none"
export const NO_PROJECT_LABEL = "Sin proyecto (independiente)"
