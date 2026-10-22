import { createClient } from "@/lib/supabase/server"
import type { Calculation } from "@/lib/types/calculation"

export async function getAllCalculations(): Promise<Calculation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("calculations")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching calculations:", error.message)
    return []
  }

  return data ?? []
}

export async function getCalculationsByProject(
  projectId: string,
): Promise<Calculation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("calculations")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching project calculations:", error.message)
    return []
  }

  return data ?? []
}

export async function getCalculationById(
  calculationId: string,
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
