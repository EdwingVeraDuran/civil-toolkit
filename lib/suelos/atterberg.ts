import { formatNumber } from "@/lib/units/format"

export const LIQUID_LIMIT_BLOWS = 25
export const PLASTIC_LIMIT_RANGE_LIMIT = 1.4
export const R_SQUARED_WARNING_THRESHOLD = 0.95
export const RECOMMENDED_MIN_BLOWS = 10
export const RECOMMENDED_MAX_BLOWS = 40

export const ATTERBERG_REFERENCES = {
  limits:
    "NTC 4630 (equivalente a ASTM D4318) — determinación del límite líquido, límite plástico e índice de plasticidad",
  classification:
    "ASTM D2487 / NTC 1504 — Sistema Unificado de Clasificación de Suelos (SUCS)",
  chart:
    "Carta de plasticidad de Casagrande — línea A: IP = 0,73(LL − 20); línea U: IP = 0,9(LL − 8)",
  index: "NTC 4630 — IP = LL − LP; si LP ≥ LL se reporta NP",
  plasticLimitPrecision:
    "NTC 4630 / INV E-126 — la diferencia entre determinaciones del LP no debe superar 1,4 puntos porcentuales",
} as const

export type FlowCurvePoint = {
  blows: number
  moisture: number
}

export type FlowCurveRegression = {
  liquidLimit: number
  slope: number
  intercept: number
  flowIndex: number
  rSquared: number
  equation: string
  pointCount: number
}

export type PlasticLimitSummary = {
  plasticLimit: number
  min: number
  max: number
  range: number
  count: number
}

export type PlasticitySymbol = "CL" | "CH" | "CL-ML" | "ML/OL" | "MH/OH" | "NP"

export type PlasticityClassification = {
  symbol: PlasticitySymbol
  name: string
  description: string
  aboveALine: boolean
  aboveULine: boolean
  nonPlastic: boolean
}

export function aLineValue(liquidLimit: number): number {
  return 0.73 * (liquidLimit - 20)
}

export function uLineValue(liquidLimit: number): number {
  return 0.9 * (liquidLimit - 8)
}

export function plasticityChartMax(
  liquidLimit: number,
  plasticityIndex: number
): number {
  return Math.max(
    100,
    Math.ceil(Math.max(liquidLimit, plasticityIndex) / 10) * 10
  )
}

export function formatFlowCurveEquation(
  regression: Pick<FlowCurveRegression, "slope" | "intercept">
): string {
  const sign = regression.slope >= 0 ? "+" : "−"

  return `w = ${formatNumber(regression.intercept, 2)} ${sign} ${formatNumber(
    Math.abs(regression.slope),
    2
  )} · log10(N)`
}

export function liquidLimitFromFlowCurve(
  points: readonly FlowCurvePoint[]
): FlowCurveRegression | null {
  const validPoints = points.filter(
    (point) =>
      Number.isFinite(point.blows) &&
      point.blows > 0 &&
      Number.isFinite(point.moisture)
  )

  if (validPoints.length < 2) return null

  const xValues = validPoints.map((point) => Math.log10(point.blows))
  const distinctX = new Set(xValues.map((value) => value.toFixed(12)))

  if (distinctX.size < 2) return null

  const count = validPoints.length
  const sumX = xValues.reduce((sum, value) => sum + value, 0)
  const sumY = validPoints.reduce((sum, point) => sum + point.moisture, 0)
  const sumXY = validPoints.reduce(
    (sum, point, index) => sum + xValues[index] * point.moisture,
    0
  )
  const sumXX = xValues.reduce((sum, value) => sum + value * value, 0)
  const denominator = count * sumXX - sumX * sumX

  if (Math.abs(denominator) < 1e-12) return null

  const slope = (count * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / count
  const meanY = sumY / count

  let totalSquares = 0
  let residualSquares = 0

  validPoints.forEach((point, index) => {
    const predicted = intercept + slope * xValues[index]
    totalSquares += (point.moisture - meanY) ** 2
    residualSquares += (point.moisture - predicted) ** 2
  })

  const rSquared =
    totalSquares <= 1e-12
      ? 1
      : Math.min(1, Math.max(0, 1 - residualSquares / totalSquares))
  const liquidLimit = intercept + slope * Math.log10(LIQUID_LIMIT_BLOWS)

  if (!Number.isFinite(liquidLimit)) return null

  return {
    liquidLimit,
    slope,
    intercept,
    flowIndex: -slope,
    rSquared,
    equation: formatFlowCurveEquation({ slope, intercept }),
    pointCount: validPoints.length,
  }
}

export function plasticLimitFromDeterminations(
  values: readonly number[]
): PlasticLimitSummary | null {
  const validValues = values.filter((value) => Number.isFinite(value))

  if (validValues.length === 0) return null

  const min = Math.min(...validValues)
  const max = Math.max(...validValues)
  const plasticLimit =
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length

  return {
    plasticLimit,
    min,
    max,
    range: max - min,
    count: validValues.length,
  }
}

export function classifyPlasticity(
  liquidLimit: number,
  plasticityIndex: number,
  nonPlastic = false
): PlasticityClassification {
  if (
    nonPlastic ||
    !Number.isFinite(liquidLimit) ||
    !Number.isFinite(plasticityIndex) ||
    plasticityIndex <= 0
  ) {
    return {
      symbol: "NP",
      name: "No plástico",
      description:
        "NP: el límite plástico es mayor o igual que el límite líquido, o el índice de plasticidad es nulo; no se reporta IP.",
      aboveALine: false,
      aboveULine: false,
      nonPlastic: true,
    }
  }

  const aLine = aLineValue(liquidLimit)
  const uLine = uLineValue(liquidLimit)
  const aboveALine = plasticityIndex >= aLine - 1e-9
  const aboveULine = plasticityIndex > uLine + 1e-9

  if (plasticityIndex < 4 - 1e-9 || !aboveALine) {
    if (liquidLimit < 50) {
      return {
        symbol: "ML/OL",
        name: "Limo u orgánico de baja plasticidad",
        description:
          "ML/OL: LL < 50 % con IP < 4 % o punto por debajo de la línea A. La carta no distingue ML de OL.",
        aboveALine,
        aboveULine,
        nonPlastic: false,
      }
    }

    return {
      symbol: "MH/OH",
      name: "Limo u orgánico de alta plasticidad",
      description:
        "MH/OH: LL ≥ 50 % con IP < 4 % o punto por debajo de la línea A. La carta no distingue MH de OH.",
      aboveALine,
      aboveULine,
      nonPlastic: false,
    }
  }

  if (plasticityIndex <= 7 + 1e-9) {
    return {
      symbol: "CL-ML",
      name: "Arcilla limosa de baja plasticidad",
      description:
        "CL-ML: IP entre 4 % y 7 % y punto sobre o por encima de la línea A.",
      aboveALine,
      aboveULine,
      nonPlastic: false,
    }
  }

  if (liquidLimit < 50) {
    return {
      symbol: "CL",
      name: "Arcilla de baja a media plasticidad",
      description:
        "CL: arcilla inorgánica con LL < 50 %, IP > 7 % y punto sobre o por encima de la línea A.",
      aboveALine,
      aboveULine,
      nonPlastic: false,
    }
  }

  return {
    symbol: "CH",
    name: "Arcilla de alta plasticidad",
    description:
      "CH: arcilla inorgánica con LL ≥ 50 %, IP > 7 % y punto sobre o por encima de la línea A.",
    aboveALine,
    aboveULine,
    nonPlastic: false,
  }
}
