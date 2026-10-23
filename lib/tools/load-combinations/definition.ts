import { loadCombinationsInfo } from "@/lib/tools/catalog"
import {
  calculateLoadCombinations,
  type LoadCombinationsResult,
} from "@/lib/tools/load-combinations/calculate"
import {
  LOAD_UNIT_LABELS,
  loadCombinationsSchema,
  type LoadCombinationsInput,
} from "@/lib/tools/load-combinations/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"

function formatSummary(
  input: LoadCombinationsInput,
  result: LoadCombinationsResult
): string {
  const unit = LOAD_UNIT_LABELS[input.unit]

  return `Combinaciones NSR-10: máx. ${result.maximum.label} = ${formatNumber(
    result.maximum.value,
    3
  )} ${unit}; mín. ${result.minimum.label} = ${formatNumber(
    result.minimum.value,
    3
  )} ${unit}`
}

export const loadCombinationsDefinition: ToolDefinition<
  LoadCombinationsInput,
  LoadCombinationsResult
> = {
  info: loadCombinationsInfo,
  schema: loadCombinationsSchema,
  validate: createValidator(loadCombinationsSchema),
  calculate: calculateLoadCombinations,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(input, result),
  }),
}
