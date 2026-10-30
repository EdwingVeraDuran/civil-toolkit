import {
  DISSIPATION_CAPACITY_LABELS,
  ELEMENT_TYPE_LABELS,
  SUPPORT_CONDITION_LABELS,
} from "@/lib/estructuras/nsr10"
import type { BeamSizingResult } from "@/lib/tools/beam-sizing/calculate"
import type { BeamSizingInput } from "@/lib/tools/beam-sizing/schema"
import type { SavedResultSpec } from "@/lib/tools/report-data"

/**
 * Campos que el snapshot de vigas guarda realmente en `result`.
 *
 * `elementType` y `supportCondition` viven en `inputs`; no deben exigirse aquí
 * para que los cálculos antiguos sigan mostrando su reporte.
 */
export type BeamSizingReportResult = Pick<
  BeamSizingResult,
  | "factor"
  | "hMinExact"
  | "h"
  | "bMin"
  | "bMinReference"
  | "b"
  | "capacity"
  | "usedRecommendedTable"
  | "warnings"
>

export const BEAM_SIZING_REPORT_RESULT_SPEC = {
  numbers: ["factor", "hMinExact", "h", "bMin", "b"],
  strings: ["capacity", "bMinReference"],
  booleans: ["usedRecommendedTable"],
  arrays: ["warnings"],
} satisfies SavedResultSpec

export type BeamSizingReportLabels = {
  elementLabel: string
  supportLabel: string
  capacityLabel: string
}

export function getBeamSizingReportLabels(
  input: BeamSizingInput,
  result: Pick<BeamSizingReportResult, "capacity">
): BeamSizingReportLabels | null {
  const elementLabel = ELEMENT_TYPE_LABELS[input.elementType]
  const supportLabel = SUPPORT_CONDITION_LABELS[input.supportCondition]
  const capacityLabel = DISSIPATION_CAPACITY_LABELS[result.capacity]

  if (!elementLabel || !supportLabel || !capacityLabel) {
    return null
  }

  return { elementLabel, supportLabel, capacityLabel }
}
