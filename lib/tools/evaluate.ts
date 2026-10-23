import type {
  ToolDefinition,
  ToolSnapshot,
  ValidationResult,
} from "@/lib/tools/types"
import { toValidationResult } from "@/lib/tools/validate"

export type ToolEvaluation<TInput, TResult> = {
  validation: ValidationResult
  parsedInput: TInput | null
  result: TResult | null
  snapshot: ToolSnapshot | null
  calculationError: string | null
}

const DEFAULT_CALCULATION_ERROR =
  "No se pudo calcular con los datos suministrados."

type EvaluateOptions = {
  calculationErrorMessage?: string
}

export function evaluateTool<TInput, TResult>(
  definition: ToolDefinition<TInput, TResult>,
  rawInput: unknown,
  options: EvaluateOptions = {}
): ToolEvaluation<TInput, TResult> {
  const parsed = definition.schema.safeParse(rawInput)

  if (!parsed.success) {
    return {
      validation: toValidationResult(parsed.error.issues),
      parsedInput: null,
      result: null,
      snapshot: null,
      calculationError: null,
    }
  }

  let result: TResult

  try {
    result = definition.calculate(parsed.data)
  } catch (error) {
    return {
      validation: { valid: true },
      parsedInput: parsed.data,
      result: null,
      snapshot: null,
      calculationError:
        error instanceof Error
          ? error.message
          : (options.calculationErrorMessage ?? DEFAULT_CALCULATION_ERROR),
    }
  }

  return {
    validation: { valid: true },
    parsedInput: parsed.data,
    result,
    snapshot: definition.toSnapshot(parsed.data, result),
    calculationError: null,
  }
}
