import { createClient } from "@/lib/supabase/server"
import type { Project } from "@/lib/types/project"

export async function getAllProjects(): Promise<Project[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error.message)
    return []
  }

  return data ?? []
}

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
