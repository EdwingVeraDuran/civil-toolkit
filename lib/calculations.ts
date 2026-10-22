"use client"

import { createClient } from "@/lib/supabase/client"
import type { Calculation, JsonObject } from "@/lib/types/calculation"

type CreateCalculationInput = {
  tool_id: string
  title: string
  summary: string
  inputs: JsonObject
  result: JsonObject
  project_id?: string | null
}

export async function createCalculation(
  input: CreateCalculationInput,
): Promise<{ calculation?: Calculation; error?: string }> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { error: "Debes iniciar sesión para guardar un cálculo" }
  }

  const { data, error } = await supabase
    .from("calculations")
    .insert({
      owner_id: userData.user.id,
      project_id: input.project_id ?? null,
      tool_id: input.tool_id,
      title: input.title,
      summary: input.summary,
      inputs: input.inputs,
      result: input.result,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { calculation: data }
}

export async function updateCalculationProject(
  id: string,
  projectId: string | null,
): Promise<{ error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from("calculations")
    .update({ project_id: projectId, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return {}
}

export async function updateCalculationFull(
  id: string,
  input: {
    title: string
    summary: string
    inputs: JsonObject
    result: JsonObject
    project_id: string | null
  },
): Promise<{ error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from("calculations")
    .update({
      title: input.title,
      summary: input.summary,
      inputs: input.inputs,
      result: input.result,
      project_id: input.project_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return {}
}
export async function deleteCalculation(id: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.from("calculations").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return {}
}
