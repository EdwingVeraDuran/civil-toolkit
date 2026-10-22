import {
  FY_FACTOR_BASE,
  NSR10_REFERENCES,
  fyFactor,
  lightweightFactor,
  minimumWidth,
  roundUpToStep,
  thicknessFactor,
  type DissipationCapacity,
  type ElementType,
  type SupportCondition,
} from "@/lib/estructuras/nsr10"
import type { BeamSizingInput } from "@/lib/tools/beam-sizing/schema"

export type BeamSizingResult = {
  elementType: ElementType
  supportCondition: SupportCondition
  capacity: DissipationCapacity
  factor: number
  usedRecommendedTable: boolean
  hMinExact: number
  h: number
  bMin: number
  bMinReference: string
  b: number
  warnings: string[]
}

export function calculateBeamSizing(input: BeamSizingInput): BeamSizingResult {
  const usedRecommendedTable = input.fragilePartitions
  const factor = thicknessFactor(input.elementType, input.supportCondition, usedRecommendedTable)

  const spanMm = input.span * 1000
  const fyAdjust = fyFactor(input.fy)
  const lightweightAdjust = input.lightweight ? lightweightFactor(input.concreteDensity) : 1

  const hMinExact = (spanMm / factor) * fyAdjust * lightweightAdjust
  const h = roundUpToStep(hMinExact)

  const { value: bMin, reference: bMinReference } = minimumWidth(input.capacity, h)
  const b = roundUpToStep(Math.max(h / 2, bMin))

  const warnings: string[] = []
  if (usedRecommendedTable) {
    warnings.push(`Se usó la Tabla CR.9.5 (recomendada). ${NSR10_REFERENCES.deflections}.`)
  }
  if (input.fy !== FY_FACTOR_BASE) {
    warnings.push(`Se aplicó ${NSR10_REFERENCES.fyAdjustment}.`)
  }
  if (input.lightweight) {
    warnings.push(`Se aplicó ${NSR10_REFERENCES.lightweightAdjustment}.`)
  }
  warnings.push(
    "Predimensionado orientativo: verifica las deflexiones y la resistencia de acuerdo con la NSR-10.",
  )

  return {
    elementType: input.elementType,
    supportCondition: input.supportCondition,
    capacity: input.capacity,
    factor,
    usedRecommendedTable,
    hMinExact,
    h,
    bMin,
    bMinReference,
    b,
    warnings,
  }
}
