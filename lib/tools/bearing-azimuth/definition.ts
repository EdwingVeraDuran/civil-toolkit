import { bearingAzimuthInfo } from "@/lib/tools/catalog"
import {
  calculateOrientation,
  formatBearingDms,
  formatDms,
  type OrientationResult,
} from "@/lib/tools/bearing-azimuth/calculate"
import {
  orientationSchema,
  type OrientationInput,
} from "@/lib/tools/bearing-azimuth/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"

function formatSummary(result: OrientationResult): string {
  return `Rumbo ${formatBearingDms(
    result.bearingQuadrant,
    result.bearingDms
  )} ↔ azimut ${formatDms(result.azimuthDms)}`
}

export const bearingAzimuthDefinition: ToolDefinition<
  OrientationInput,
  OrientationResult
> = {
  info: bearingAzimuthInfo,
  schema: orientationSchema,
  validate: createValidator(orientationSchema),
  calculate: calculateOrientation,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(result),
  }),
}
