import type { ZodType } from "zod"
import type { ValidationError, ValidationResult } from "@/lib/tools/types"

type IssueLike = {
  path: PropertyKey[]
  message: string
}

export function toValidationResult(issues: IssueLike[]): ValidationResult {
  const errors: ValidationError[] = issues.map((issue) => ({
    field: issue.path.join(".") || "input",
    message: issue.message,
  }))
  return { valid: false, errors }
}

export function createValidator<T>(schema: ZodType<T>): (input: unknown) => ValidationResult {
  return (input) => {
    const result = schema.safeParse(input)
    return result.success ? { valid: true } : toValidationResult(result.error.issues)
  }
}
