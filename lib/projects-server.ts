import { createClient } from "@/lib/supabase/server"
import type { Project } from "@/lib/types/project"

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return null
  }

  return data
}
