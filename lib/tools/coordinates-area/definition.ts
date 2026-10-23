import { coordinatesAreaInfo } from "@/lib/tools/catalog"
import {
  calculateCoordinatesArea,
  type CoordinatesAreaResult,
} from "@/lib/tools/coordinates-area/calculate"
import {
  coordinatesAreaSchema,
  type CoordinatesAreaInput,
} from "@/lib/tools/coordinates-area/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"
import { getUnit } from "@/lib/units/units"

function formatSummary(result: CoordinatesAreaResult): string {
  const areaSymbol = getUnit(result.areaUnitId)?.symbol ?? "m²"
  const lengthSymbol = getUnit(result.lengthUnitId)?.symbol ?? "m"

  return `Área por coordenadas: ${formatNumber(
    result.area,
    3
  )} ${areaSymbol}; perímetro ${formatNumber(
    result.perimeter,
    3
  )} ${lengthSymbol}; ${result.vertexCount} vértices`
}

export const coordinatesAreaDefinition: ToolDefinition<
  CoordinatesAreaInput,
  CoordinatesAreaResult
> = {
  info: coordinatesAreaInfo,
  schema: coordinatesAreaSchema,
  validate: createValidator(coordinatesAreaSchema),
  calculate: calculateCoordinatesArea,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(result),
  }),
}
