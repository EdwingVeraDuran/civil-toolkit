"use client"

import { createClient } from "@/lib/supabase/client"
import type { Project, ProjectStatus } from "@/lib/types/project"

type CreateProjectInput = {
  name: string
  client_name: string
  description?: string
  location?: string
  status?: ProjectStatus
  start_date?: string
  estimated_end_date?: string
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient()
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

export async function createProject(input: CreateProjectInput): Promise<{ project?: Project; error?: string }> {
  const supabase = createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { error: "Debes iniciar sesión para crear un proyecto" }
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: userData.user.id,
      name: input.name,
      client_name: input.client_name,
      description: input.description || null,
      location: input.location || null,
      status: input.status ?? "planning",
      start_date: input.start_date || null,
      estimated_end_date: input.estimated_end_date || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { project: data }
}

type UpdateProjectInput = {
  name?: string
  client_name?: string
  description?: string | null
  location?: string | null
  status?: ProjectStatus
  start_date?: string | null
  estimated_end_date?: string | null
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<{ project?: Project; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { project: data }
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return {}
}
