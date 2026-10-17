"use client"

import { createClient } from "@/lib/supabase/client"
import type { Task, TaskPriority, TaskStatus } from "@/lib/types/task"

type CreateTaskInput = {
  project_id: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
}

type UpdateTaskInput = {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
  completed_at?: string | null
}

export async function getTasks(projectId: string): Promise<Task[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error.message)
    return []
  }

  return data ?? []
}

export async function createTask(input: CreateTaskInput): Promise<{ task?: Task; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: input.project_id,
      title: input.title,
      description: input.description || null,
      status: input.status ?? "pending",
      priority: input.priority ?? "medium",
      due_date: input.due_date || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { task: data }
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<{ task?: Task; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { task: data }
}

export async function toggleTaskStatus(task: Task): Promise<{ task?: Task; error?: string }> {
  const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed"
  const completedAt = newStatus === "completed" ? new Date().toISOString() : null

  return updateTask(task.id, {
    status: newStatus,
    completed_at: completedAt,
  })
}

export async function deleteTask(id: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return {}
}
