import type { ToolDefinition } from "@/lib/tools/types"
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
}
