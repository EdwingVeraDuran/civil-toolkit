import {
  PLASTIC_LIMIT_RANGE_LIMIT,
  R_SQUARED_WARNING_THRESHOLD,
  RECOMMENDED_MAX_BLOWS,
  RECOMMENDED_MIN_BLOWS,
  classifyPlasticity,
  liquidLimitFromFlowCurve,
  plasticLimitFromDeterminations,
  type FlowCurvePoint,
  type FlowCurveRegression,
  type PlasticLimitSummary,
  type PlasticityClassification,
} from "@/lib/suelos/atterberg"
import type { AtterbergLimitsInput } from "@/lib/tools/atterberg-limits/schema"
import { formatNumber } from "@/lib/units/format"

export type AtterbergLimitsResult = {
  liquidLimit: number
  liquidLimitRounded: number
  plasticLimit: number
  plasticLimitRounded: number
  plasticityIndex: number
  plasticityIndexRounded: number
  nonPlastic: boolean
  regression: FlowCurveRegression
  plasticLimitSummary: PlasticLimitSummary
  classification: PlasticityClassification
  flowCurvePoints: FlowCurvePoint[]
  warnings: string[]
}

function buildWarnings({
  input,
  regression,
  plasticLimitSummary,
  nonPlastic,
  classification,
}: {
  input: AtterbergLimitsInput
  regression: FlowCurveRegression
  plasticLimitSummary: PlasticLimitSummary
  nonPlastic: boolean
  classification: PlasticityClassification
}): string[] {
  const warnings: string[] = []

  if (nonPlastic) {
    warnings.push(
      "El límite plástico es mayor o igual que el límite líquido; se reporta como no plástico (NP)."
    )
  }

  if (regression.rSquared < R_SQUARED_WARNING_THRESHOLD) {
    warnings.push(
      `El ajuste de la curva de fluidez es bajo (R² = ${formatNumber(
        regression.rSquared,
        4
      )}); revisa la linealidad de los puntos.`
    )
  }

  if (regression.slope >= 0) {
    warnings.push(
      "La pendiente de la curva de fluidez no es negativa; revisa el orden de los puntos del ensayo."
    )
  }

  const outsideRecommendedRange = input.liquidLimitPoints.some(
    (point) =>
      point.blows < RECOMMENDED_MIN_BLOWS || point.blows > RECOMMENDED_MAX_BLOWS
  )

  if (outsideRecommendedRange) {
    warnings.push(
      `Hay puntos fuera del intervalo recomendado de ${RECOMMENDED_MIN_BLOWS} a ${RECOMMENDED_MAX_BLOWS} golpes.`
    )
  }

  const belowLimit = input.liquidLimitPoints.some((point) => point.blows < 25)
  const aboveLimit = input.liquidLimitPoints.some((point) => point.blows > 25)

  if (!belowLimit || !aboveLimit) {
    warnings.push(
      "Los puntos no cubren ambos lados de 25 golpes; el límite líquido es una extrapolación de la recta ajustada."
    )
  }

  if (plasticLimitSummary.range > PLASTIC_LIMIT_RANGE_LIMIT + 1e-9) {
    warnings.push(
      `La diferencia entre las determinaciones del límite plástico es ${formatNumber(
        plasticLimitSummary.range,
        2
      )} puntos porcentuales; supera el criterio de ${formatNumber(
        PLASTIC_LIMIT_RANGE_LIMIT,
        1
      )} y conviene repetir el ensayo.`
    )
  }

  if (classification.aboveULine) {
    warnings.push(
      "El punto está por encima de la línea U de la carta de plasticidad; revisa los datos del ensayo."
    )
  }

  return warnings
}

export function calculateAtterbergLimits(
  input: AtterbergLimitsInput
): AtterbergLimitsResult {
  const flowCurvePoints = input.liquidLimitPoints.map((point) => ({
    blows: point.blows,
    moisture: point.moisture,
  }))
  const regression = liquidLimitFromFlowCurve(flowCurvePoints)
  const plasticLimitSummary = plasticLimitFromDeterminations(
    input.plasticLimitValues
  )

  if (!regression || !plasticLimitSummary) {
    throw new Error(
      "No se pudieron calcular los límites de Atterberg con los datos suministrados."
    )
  }

  const liquidLimit = regression.liquidLimit
  const plasticLimit = plasticLimitSummary.plasticLimit
  const liquidLimitRounded = Math.round(liquidLimit)
  const plasticLimitRounded = Math.round(plasticLimit)
  const nonPlastic = plasticLimitRounded >= liquidLimitRounded
  const plasticityIndex = nonPlastic ? 0 : liquidLimit - plasticLimit
  const plasticityIndexRounded = nonPlastic
    ? 0
    : Math.max(0, liquidLimitRounded - plasticLimitRounded)
  const classification = classifyPlasticity(
    liquidLimitRounded,
    plasticityIndexRounded,
    nonPlastic
  )

  return {
    liquidLimit,
    liquidLimitRounded,
    plasticLimit,
    plasticLimitRounded,
    plasticityIndex,
    plasticityIndexRounded,
    nonPlastic,
    regression,
    plasticLimitSummary,
    classification,
    flowCurvePoints,
    warnings: buildWarnings({
      input,
      regression,
      plasticLimitSummary,
      nonPlastic,
      classification,
    }),
  }
}
