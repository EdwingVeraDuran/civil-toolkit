import type { ToolDefinition } from "@/lib/tools/types"
import { ELEMENT_TYPE_LABELS } from "@/lib/estructuras/nsr10"
import { beamSizingInfo } from "@/lib/tools/catalog"
import { createValidator } from "@/lib/tools/validate"
import { beamSizingSchema, type BeamSizingInput } from "@/lib/tools/beam-sizing/schema"
import {
  calculateBeamSizing,
  type BeamSizingResult,
} from "@/lib/tools/beam-sizing/calculate"

export const beamSizingDefinition: ToolDefinition<BeamSizingInput, BeamSizingResult> = {
  info: beamSizingInfo,
  schema: beamSizingSchema,
  validate: createValidator(beamSizingSchema),
  calculate: calculateBeamSizing,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: {
      hMinExact: result.hMinExact,
      h: result.h,
      bMin: result.bMin,
      bMinReference: result.bMinReference,
      b: result.b,
      factor: result.factor,
      capacity: result.capacity,
      usedRecommendedTable: result.usedRecommendedTable,
      warnings: result.warnings,
    },
    summary: `${ELEMENT_TYPE_LABELS[input.elementType]} ${result.b} × ${result.h} mm`,
  }),
}
