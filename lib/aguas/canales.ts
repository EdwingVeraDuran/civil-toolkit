/**
 * Hidráulica de canales abiertos — flujo uniforme y profundidad crítica.
 *
 * Referencias:
 * - Manning en unidades SI: Q = (1/n) · A · R^(2/3) · S0^(1/2)
 * - Chow, V. T. Open-Channel Hydraulics. McGraw-Hill, 1959.
 * - Criterio de Froude: Fr = V / √(gD_h), con D_h = A/T
 * - Profundidad crítica: Q² · T / (g · A³) = 1
 * - Pendiente crítica: S_c = [n · Q / (A_c · R_c^(2/3))]²
 *
 * Unidades: m, m², m³/s, m/s y m/m.
 */

export const GRAVITY = 9.81
export const DEPTH_TOLERANCE_M = 1e-8
export const MAX_ITERATIONS = 100
export const MIN_DEPTH_M = 1e-9
export const MAX_DEPTH_M = 1000
export const CIRCULAR_MAX_DEPTH_RATIO = 0.999
export const CIRCULAR_CAPACITY_DEPTH_RATIO = 0.94
export const MANNING_TYPICAL_MIN = 0.01
export const MANNING_TYPICAL_MAX = 0.1
export const FLOW_REGIME_TOLERANCE = 0.01
export const SLOPE_CLASSIFICATION_TOLERANCE = 1e-3

const ROOT_SCAN_SAMPLES = 512

export type ChannelSection =
  "rectangular" | "trapezoidal" | "triangular" | "circular"

export type ChannelGeometry =
  | { section: "rectangular"; bottomWidth: number }
  | { section: "trapezoidal"; bottomWidth: number; sideSlope: number }
  | { section: "triangular"; sideSlope: number }
  | { section: "circular"; diameter: number }

export type ChannelSectionProperties = {
  area: number
  wettedPerimeter: number
  topWidth: number
  hydraulicRadius: number
  hydraulicDepth: number
}

export type FlowRegime = "subcritical" | "critical" | "supercritical"

export type SlopeClass = "mild" | "critical" | "steep"

export type DepthSolution = {
  depth: number
  iterations: number
  converged: boolean
  residual: number
}

export const FLOW_REGIME_LABELS: Record<FlowRegime, string> = {
  subcritical: "Subcrítico",
  critical: "Crítico",
  supercritical: "Supercrítico",
}

export const SLOPE_CLASS_LABELS: Record<SlopeClass, string> = {
  mild: "Suave",
  critical: "Crítica",
  steep: "Fuerte",
}

function assertPositive(value: number, message: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message)
  }
}

function circularSegmentArea(diameter: number, theta: number): number {
  const factor = (diameter * diameter) / 8

  // Para θ pequeño, θ − sen θ pierde precisión; se usa la serie de Taylor.
  if (theta < 1e-3) {
    const theta2 = theta * theta
    const theta3 = theta2 * theta
    return (
      factor *
      (theta3 / 6 - (theta3 * theta2) / 120 + (theta3 * theta2 * theta2) / 5040)
    )
  }

  return factor * (theta - Math.sin(theta))
}

/**
 * Propiedades hidráulicas de la sección para una profundidad de agua dada.
 */
export function sectionProperties(
  geometry: ChannelGeometry,
  depth: number
): ChannelSectionProperties {
  assertPositive(depth, "La profundidad debe ser mayor que cero")

  let area: number
  let wettedPerimeter: number
  let topWidth: number

  switch (geometry.section) {
    case "rectangular": {
      assertPositive(
        geometry.bottomWidth,
        "El ancho de fondo debe ser mayor que cero"
      )
      area = geometry.bottomWidth * depth
      wettedPerimeter = geometry.bottomWidth + 2 * depth
      topWidth = geometry.bottomWidth
      break
    }
    case "trapezoidal": {
      assertPositive(
        geometry.bottomWidth,
        "El ancho de fondo debe ser mayor que cero"
      )
      assertPositive(geometry.sideSlope, "El talud debe ser mayor que cero")
      area = (geometry.bottomWidth + geometry.sideSlope * depth) * depth
      wettedPerimeter =
        geometry.bottomWidth +
        2 * depth * Math.sqrt(1 + geometry.sideSlope ** 2)
      topWidth = geometry.bottomWidth + 2 * geometry.sideSlope * depth
      break
    }
    case "triangular": {
      assertPositive(geometry.sideSlope, "El talud debe ser mayor que cero")
      area = geometry.sideSlope * depth * depth
      wettedPerimeter = 2 * depth * Math.sqrt(1 + geometry.sideSlope ** 2)
      topWidth = 2 * geometry.sideSlope * depth
      break
    }
    case "circular": {
      assertPositive(geometry.diameter, "El diámetro debe ser mayor que cero")
      if (depth >= geometry.diameter) {
        throw new Error(
          "La profundidad debe ser menor que el diámetro en una sección circular"
        )
      }

      const cosHalfAngle = 1 - (2 * depth) / geometry.diameter
      const theta = 2 * Math.acos(Math.min(1, Math.max(-1, cosHalfAngle)))
      area = circularSegmentArea(geometry.diameter, theta)
      wettedPerimeter = (geometry.diameter * theta) / 2
      topWidth = geometry.diameter * Math.sin(theta / 2)
      break
    }
  }

  return {
    area,
    wettedPerimeter,
    topWidth,
    hydraulicRadius: area / wettedPerimeter,
    hydraulicDepth: area / topWidth,
  }
}

export function manningVelocity(
  properties: ChannelSectionProperties,
  manning: number,
  slope: number
): number {
  assertPositive(manning, "El coeficiente de Manning debe ser mayor que cero")
  assertPositive(slope, "La pendiente debe ser mayor que cero")
  assertPositive(
    properties.hydraulicRadius,
    "El radio hidráulico debe ser mayor que cero"
  )

  return (
    (1 / manning) *
    Math.pow(properties.hydraulicRadius, 2 / 3) *
    Math.sqrt(slope)
  )
}

export function manningDischarge(
  properties: ChannelSectionProperties,
  manning: number,
  slope: number
): number {
  return properties.area * manningVelocity(properties, manning, slope)
}

export function froudeNumber(velocity: number, hydraulicDepth: number): number {
  assertPositive(
    hydraulicDepth,
    "La profundidad hidráulica debe ser mayor que cero"
  )
  return velocity / Math.sqrt(GRAVITY * hydraulicDepth)
}

export function criticalSlope(
  manning: number,
  discharge: number,
  criticalProperties: ChannelSectionProperties
): number {
  assertPositive(manning, "El coeficiente de Manning debe ser mayor que cero")
  assertPositive(discharge, "El caudal debe ser mayor que cero")

  const denominator =
    criticalProperties.area *
    Math.pow(criticalProperties.hydraulicRadius, 2 / 3)

  if (!(denominator > 0) || !Number.isFinite(denominator)) {
    throw new Error("No se pudo calcular la pendiente crítica")
  }

  const value = Math.pow((manning * discharge) / denominator, 2)

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("No se pudo calcular la pendiente crítica")
  }

  return value
}

export function classifyFlowRegime(froude: number): FlowRegime {
  if (Math.abs(froude - 1) <= FLOW_REGIME_TOLERANCE) {
    return "critical"
  }
  return froude < 1 ? "subcritical" : "supercritical"
}

export function classifySlope(slope: number, critical: number): SlopeClass {
  assertPositive(slope, "La pendiente debe ser mayor que cero")
  assertPositive(critical, "La pendiente crítica debe ser mayor que cero")

  const scale = Math.max(Math.abs(slope), Math.abs(critical), 1e-12)
  if (Math.abs(slope - critical) / scale <= SLOPE_CLASSIFICATION_TOLERANCE) {
    return "critical"
  }

  return slope < critical ? "mild" : "steep"
}

function criticalFunction(
  geometry: ChannelGeometry,
  discharge: number,
  depth: number
): number {
  const properties = sectionProperties(geometry, depth)
  const denominator =
    GRAVITY * properties.area * properties.area * properties.area

  return (discharge * discharge * properties.topWidth) / denominator - 1
}

function bisect(
  fn: (depth: number) => number,
  lower: number,
  upper: number
): DepthSolution | null {
  let a = lower
  let b = upper
  let fa = fn(a)
  const fb = fn(b)

  if (Number.isNaN(fa) || Number.isNaN(fb)) return null

  if (fa === 0) {
    return { depth: a, iterations: 0, converged: true, residual: 0 }
  }

  if (fb === 0) {
    return { depth: b, iterations: 0, converged: true, residual: 0 }
  }

  if (Math.sign(fa) === Math.sign(fb)) return null

  let iterations = 0
  let mid = (a + b) / 2

  while (iterations < MAX_ITERATIONS && b - a > DEPTH_TOLERANCE_M) {
    mid = (a + b) / 2
    const fm = fn(mid)
    iterations += 1

    if (Number.isNaN(fm)) return null

    if (fm === 0) {
      a = mid
      b = mid
      break
    }

    if (Math.sign(fa) === Math.sign(fm)) {
      a = mid
      fa = fm
    } else {
      b = mid
    }
  }

  const depth = (a + b) / 2
  const residual = fn(depth)

  return {
    depth,
    iterations,
    converged: b - a <= DEPTH_TOLERANCE_M || residual === 0,
    residual,
  }
}

type Bracket = { lower: number; upper: number }

function findFirstCrossing(
  fn: (depth: number) => number,
  lower: number,
  upper: number,
  samples: number
): Bracket | null {
  let previousX = lower
  let previousF = fn(previousX)

  if (Number.isNaN(previousF)) return null

  for (let index = 1; index <= samples; index += 1) {
    const x = lower + ((upper - lower) * index) / samples
    const fx = fn(x)

    if (Number.isNaN(fx)) return null

    if (fx === 0) {
      return { lower: previousX, upper: x }
    }

    if (Math.sign(fx) !== Math.sign(previousF)) {
      return { lower: previousX, upper: x }
    }

    previousX = x
    previousF = fx
  }

  return null
}

/**
 * Resuelve la profundidad normal para un caudal dado.
 *
 * En secciones circulares se busca la primera raíz (rama de menor
 * profundidad). Si el caudal supera la capacidad máxima a superficie libre,
 * no existe solución y se retorna null.
 */
export function solveNormalDepth(
  geometry: ChannelGeometry,
  discharge: number,
  manning: number,
  slope: number
): DepthSolution | null {
  assertPositive(discharge, "El caudal debe ser mayor que cero")

  const fn = (depth: number) =>
    manningDischarge(sectionProperties(geometry, depth), manning, slope) -
    discharge

  if (geometry.section === "circular") {
    const upper = geometry.diameter * CIRCULAR_MAX_DEPTH_RATIO
    const bracket = findFirstCrossing(fn, MIN_DEPTH_M, upper, ROOT_SCAN_SAMPLES)
    return bracket ? bisect(fn, bracket.lower, bracket.upper) : null
  }

  let upper = 1
  let upperValue = fn(upper)

  while (upperValue < 0 && upper < MAX_DEPTH_M) {
    upper = Math.min(upper * 2, MAX_DEPTH_M)
    upperValue = fn(upper)
  }

  if (upperValue < 0) return null

  return bisect(fn, MIN_DEPTH_M, upper)
}

/**
 * Resuelve la profundidad crítica para un caudal dado.
 *
 * En secciones circulares se toma la primera raíz (menor profundidad).
 */
export function solveCriticalDepth(
  geometry: ChannelGeometry,
  discharge: number
): DepthSolution | null {
  assertPositive(discharge, "El caudal debe ser mayor que cero")

  const fn = (depth: number) => criticalFunction(geometry, discharge, depth)

  if (geometry.section === "circular") {
    const upper = geometry.diameter * CIRCULAR_MAX_DEPTH_RATIO
    const bracket = findFirstCrossing(fn, MIN_DEPTH_M, upper, ROOT_SCAN_SAMPLES)
    return bracket ? bisect(fn, bracket.lower, bracket.upper) : null
  }

  let upper = 1
  let upperValue = fn(upper)

  while (upperValue > 0 && upper < MAX_DEPTH_M) {
    upper = Math.min(upper * 2, MAX_DEPTH_M)
    upperValue = fn(upper)
  }

  if (upperValue > 0) return null

  return bisect(fn, MIN_DEPTH_M, upper)
}
