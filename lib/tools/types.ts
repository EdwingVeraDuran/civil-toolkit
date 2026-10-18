import type { ComponentType } from "react"
import type { ZodType } from "zod"
import type { LucideIcon } from "lucide-react"
import type { ToolCategorySlug } from "@/lib/navigation"

export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] }

export type ToolInfo = {
  id: string
  name: string
  description: string
  category: ToolCategorySlug
  icon?: LucideIcon
}

export type ToolDefinition<TInput, TResult> = {
  info: ToolInfo
  schema: ZodType<TInput>
  validate: (input: unknown) => ValidationResult
  calculate: (input: TInput) => TResult
  component?: ComponentType
}
