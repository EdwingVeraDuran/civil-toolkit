import { createClient } from "@/lib/supabase/server"
import type { Calculation, CalculationListItem } from "@/lib/types/calculation"

const CALCULATION_LIST_COLUMNS =
  "id, project_id, tool_id, title, summary, created_at"

export async function getAllCalculations(): Promise<CalculationListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("calculations")
    .select(CALCULATION_LIST_COLUMNS)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching calculations:", error.message)
    return []
  }

  return data ?? []
}

export async function getCalculationsByProject(
  projectId: string
): Promise<CalculationListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("calculations")
    .select(CALCULATION_LIST_COLUMNS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching project calculations:", error.message)
    return []
  }

  return data ?? []
}

export async function getCalculationById(
  calculationId: string
): Promise<Calculation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("calculations")
    .select("*")
    .eq("id", calculationId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching calculation:", error.message)
    return null
  }

  return data
}
