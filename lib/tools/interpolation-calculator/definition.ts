import { interpolationCalculatorInfo } from "@/lib/tools/catalog"
import {
  calculateInterpolation,
  type InterpolationResult,
} from "@/lib/tools/interpolation-calculator/calculate"
import {
  interpolationSchema,
  type InterpolationInput,
} from "@/lib/tools/interpolation-calculator/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"

function formatValue(value: number): string {
  return formatNumber(value, 3)
}

function linearSummary(
  input: Extract<InterpolationInput, { mode: "linear" }>,
  result: Extract<InterpolationResult, { mode: "linear" }>
): string {
  if (result.direction === "y-from-x") {
    return `Interpolación lineal: y = ${formatValue(
      result.value
    )} (x = ${formatValue(input.target)} entre ${formatValue(
      input.x1
    )} y ${formatValue(input.x2)})`
  }

  return `Interpolación lineal: x = ${formatValue(
    result.value
  )} (y = ${formatValue(input.target)} entre ${formatValue(
    input.y1
  )} y ${formatValue(input.y2)})`
}

function doubleSummary(
  input: Extract<InterpolationInput, { mode: "double" }>,
  result: Extract<InterpolationResult, { mode: "double" }>
): string {
  return `Interpolación doble: z = ${formatValue(
    result.value
  )} (x = ${formatValue(input.targetX)}, y = ${formatValue(input.targetY)})`
}

export const interpolationCalculatorDefinition: ToolDefinition<
  InterpolationInput,
  InterpolationResult
> = {
  info: interpolationCalculatorInfo,
  schema: interpolationSchema,
  validate: createValidator(interpolationSchema),
  calculate: calculateInterpolation,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary:
      input.mode === "linear" && result.mode === "linear"
        ? linearSummary(input, result)
        : input.mode === "double" && result.mode === "double"
          ? doubleSummary(input, result)
          : "",
  }),
}
