/**
 * Hidráulica de tuberías a presión — Hazen-Williams y Darcy-Weisbach.
 *
 * Referencias:
 * - Hazen-Williams en unidades SI:
 *   V = 0,849 · C · R^0,63 · S^0,54, con R = D/4 para tubería llena.
 * - Darcy-Weisbach: h_f = f · (L/D) · V²/(2g).
 * - Colebrook-White para el factor de fricción turbulento.
 * - Pérdidas locales: h_m = ΣK · V²/(2g).
 * - Coeficientes K orientativos: Crane, TP-410.
 *
 * Unidades: m, m², m³/s, m/s y m/m.
 */

export const GRAVITY = 9.81
export const HAZEN_WILLIAMS_CONSTANT = 0.849
export const HAZEN_WILLIAMS_C_MIN = 70
export const HAZEN_WILLIAMS_C_MAX = 160
export const VELOCITY_MIN_RECOMMENDED = 0.6
export const VELOCITY_MAX_RECOMMENDED = 3
export const DEFAULT_WATER_VISCOSITY = 1.004e-6
export const LAMINAR_REYNOLDS_MAX = 2000
export const TURBULENT_REYNOLDS_MIN = 4000
export const PIPE_DIAMETER_MIN_M = 1e-5
export const PIPE_DIAMETER_MAX_M = 10
export const PIPE_DISCHARGE_MIN_M3S = 1e-12
export const PIPE_DISCHARGE_MAX_M3S = 100
export const PIPE_DIAMETER_TOLERANCE_M = 1e-8
export const PIPE_DISCHARGE_TOLERANCE_M3S = 1e-12
export const MAX_ITERATIONS = 100
export const COLEBROOK_MAX_ITERATIONS = 60
export const COLEBROOK_TOLERANCE = 1e-12

export const PIPE_METHODS = ["hazen-williams", "darcy-weisbach"] as const
export type PipeMethod = (typeof PIPE_METHODS)[number]

export const PIPE_METHOD_LABELS: Record<PipeMethod, string> = {
  "hazen-williams": "Hazen-Williams",
  "darcy-weisbach": "Darcy-Weisbach",
}

export const PIPE_METHOD_DESCRIPTIONS: Record<PipeMethod, string> = {
  "hazen-williams":
    "Ecuación empírica para agua en flujo turbulento. Usa el coeficiente C de Hazen-Williams.",
  "darcy-weisbach":
    "Usa la rugosidad absoluta y la viscosidad cinemática. El factor de fricción se calcula según el régimen de flujo.",
}

export type PipeFlowRegime = "laminar" | "transitional" | "turbulent"

export const PIPE_FLOW_REGIME_LABELS: Record<PipeFlowRegime, string> = {
  laminar: "Laminar",
  transitional: "Transitorio",
  turbulent: "Turbulento",
}

/**
 * Coeficientes K orientativos para accesorios.
 *
 * Los valores varían con el diámetro, el fabricante, el acabado y las
 * condiciones de flujo. Se permiten editar en la herramienta.
 *
 * Referencia: Crane, Flow of Fluids Through Valves, Fittings, and Pipe
 * (TP-410).
 */
export const PIPE_ACCESSORY_PRESETS = [
  { type: "sharp-entrance", label: "Entrada borda afilada", k: 0.5 },
  { type: "rounded-entrance", label: "Entrada redondeada", k: 0.2 },
  { type: "exit", label: "Salida", k: 1 },
  { type: "elbow-90-short", label: "Codo 90° radio corto", k: 0.9 },
  { type: "elbow-90-long", label: "Codo 90° radio largo", k: 0.6 },
  { type: "elbow-45", label: "Codo 45°", k: 0.4 },
  { type: "tee-straight", label: "Tee, flujo directo", k: 0.6 },
  { type: "tee-branch", label: "Tee, flujo en ramal", k: 1.8 },
  { type: "gate-valve-open", label: "Válvula de compuerta abierta", k: 0.2 },
  { type: "globe-valve-open", label: "Válvula de globo abierta", k: 10 },
  {
    type: "butterfly-valve-open",
    label: "Válvula de mariposa abierta",
    k: 0.3,
  },
  { type: "check-valve", label: "Válvula de retención", k: 2.5 },
  { type: "custom", label: "Personalizado", k: 0 },
] as const

export type PipeAccessoryType = (typeof PIPE_ACCESSORY_PRESETS)[number]["type"]

export const PIPE_ACCESSORY_TYPES = PIPE_ACCESSORY_PRESETS.map(
  (preset) => preset.type
) as [PipeAccessoryType, ...PipeAccessoryType[]]

export const PIPE_ACCESSORY_LABELS: Record<PipeAccessoryType, string> =
  Object.fromEntries(
    PIPE_ACCESSORY_PRESETS.map((preset) => [preset.type, preset.label])
  ) as Record<PipeAccessoryType, string>

export function accessoryPresetK(type: PipeAccessoryType): number {
  return PIPE_ACCESSORY_PRESETS.find((preset) => preset.type === type)?.k ?? 0
}

export type PipeAccessory = {
  type: PipeAccessoryType
  quantity: number
  k: number
}

export function sumAccessoryCoefficient(
  accessories: readonly PipeAccessory[]
): number {
  return accessories.reduce(
    (total, accessory) => total + accessory.quantity * accessory.k,
    0
  )
}

function assertPositive(value: number, message: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message)
  }
}

function assertNonNegative(value: number, message: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(message)
  }
}

function assertFinite(value: number, message: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(message)
  }
}

export function pipeArea(diameterM: number): number {
  assertPositive(diameterM, "El diámetro debe ser mayor que cero")
  return (Math.PI * diameterM * diameterM) / 4
}

export function pipeVelocity(discharge: number, diameterM: number): number {
  assertPositive(discharge, "El caudal debe ser mayor que cero")
  const velocity = discharge / pipeArea(diameterM)
  assertFinite(velocity, "La velocidad calculada no es válida")
  return velocity
}

export function reynoldsNumber(
  velocity: number,
  diameterM: number,
  viscosity: number
): number {
  assertPositive(velocity, "La velocidad debe ser mayor que cero")
  assertPositive(diameterM, "El diámetro debe ser mayor que cero")
  assertPositive(viscosity, "La viscosidad cinemática debe ser mayor que cero")

  const value = (velocity * diameterM) / viscosity
  assertFinite(value, "El número de Reynolds calculado no es válido")
  return value
}

export function hazenWilliamsFrictionLoss(
  discharge: number,
  diameterM: number,
  length: number,
  c: number
): number {
  assertPositive(discharge, "El caudal debe ser mayor que cero")
  assertPositive(diameterM, "El diámetro debe ser mayor que cero")
  assertPositive(length, "La longitud debe ser mayor que cero")
  assertPositive(c, "El coeficiente C debe ser mayor que cero")

  const velocity = pipeVelocity(discharge, diameterM)
  const hydraulicRadius = diameterM / 4
  const gradient = Math.pow(
    velocity / (HAZEN_WILLIAMS_CONSTANT * c * Math.pow(hydraulicRadius, 0.63)),
    1 / 0.54
  )

  assertFinite(gradient, "El gradiente hidráulico calculado no es válido")

  const loss = gradient * length
  assertFinite(loss, "La pérdida por fricción calculada no es válida")
  return loss
}

export function localLoss(velocity: number, totalK: number): number {
  assertPositive(velocity, "La velocidad debe ser mayor que cero")
  assertNonNegative(totalK, "La suma de coeficientes K no puede ser negativa")

  const loss = (totalK * velocity * velocity) / (2 * GRAVITY)
  assertFinite(loss, "La pérdida local calculada no es válida")
  return loss
}

export type FrictionFactorResult = {
  factor: number
  regime: PipeFlowRegime
  iterations: number
  converged: boolean
}

function colebrookFactor(
  reynolds: number,
  relativeRoughness: number
): { factor: number; iterations: number; converged: boolean } {
  const initialArgument =
    relativeRoughness / 3.7 + 5.74 / Math.pow(reynolds, 0.9)
  const initialLog = Math.log10(initialArgument)
  let factor = 0.25 / (initialLog * initialLog)

  if (!Number.isFinite(factor) || factor <= 0) {
    factor = 0.02
  }

  for (
    let iterations = 1;
    iterations <= COLEBROOK_MAX_ITERATIONS;
    iterations++
  ) {
    const inverseSqrt =
      -2 *
      Math.log10(
        relativeRoughness / 3.7 + 2.51 / (reynolds * Math.sqrt(factor))
      )

    if (!Number.isFinite(inverseSqrt) || inverseSqrt === 0) {
      return { factor, iterations, converged: false }
    }

    const next = 1 / (inverseSqrt * inverseSqrt)

    if (!Number.isFinite(next) || next <= 0) {
      return { factor, iterations, converged: false }
    }

    const delta = Math.abs(next - factor)
    factor = next

    if (delta <= COLEBROOK_TOLERANCE) {
      return { factor, iterations, converged: true }
    }
  }

  return {
    factor,
    iterations: COLEBROOK_MAX_ITERATIONS,
    converged: false,
  }
}

/**
 * Factor de fricción de Darcy-Weisbach.
 *
 * - Re < 2000: régimen laminar, f = 64/Re.
 * - 2000 ≤ Re < 4000: transición. Se interpola linealmente entre el valor
 *   laminar en Re = 2000 y el valor de Colebrook en Re = 4000 para evitar una
 *   discontinuidad; el resultado es aproximado.
 * - Re ≥ 4000: Colebrook-White por iteración simple.
 */
export function frictionFactor(
  reynolds: number,
  relativeRoughness: number
): FrictionFactorResult {
  assertPositive(reynolds, "El número de Reynolds debe ser mayor que cero")
  assertNonNegative(
    relativeRoughness,
    "La rugosidad relativa no puede ser negativa"
  )

  if (reynolds < LAMINAR_REYNOLDS_MAX) {
    return {
      factor: 64 / reynolds,
      regime: "laminar",
      iterations: 0,
      converged: true,
    }
  }

  if (reynolds < TURBULENT_REYNOLDS_MIN) {
    const laminarBoundary = 64 / LAMINAR_REYNOLDS_MAX
    const turbulentBoundary = colebrookFactor(
      TURBULENT_REYNOLDS_MIN,
      relativeRoughness
    )
    const fraction =
      (reynolds - LAMINAR_REYNOLDS_MAX) /
      (TURBULENT_REYNOLDS_MIN - LAMINAR_REYNOLDS_MAX)
    const factor =
      laminarBoundary + (turbulentBoundary.factor - laminarBoundary) * fraction

    return {
      factor,
      regime: "transitional",
      iterations: turbulentBoundary.iterations,
      converged: turbulentBoundary.converged,
    }
  }

  const turbulent = colebrookFactor(reynolds, relativeRoughness)
  return {
    factor: turbulent.factor,
    regime: "turbulent",
    iterations: turbulent.iterations,
    converged: turbulent.converged,
  }
}

export type PipeMethodParams =
  | { method: "hazen-williams"; hazenC: number }
  | {
      method: "darcy-weisbach"
      roughnessM: number
      viscosity: number
    }

export type PipeLossInput = PipeMethodParams & {
  discharge: number
  diameterM: number
  length: number
  totalK: number
}

export type PipeLossResult = {
  method: PipeMethod
  velocity: number
  frictionLoss: number
  localLoss: number
  totalLoss: number
  reynolds: number | null
  frictionFactor: number | null
  relativeRoughness: number | null
  flowRegime: PipeFlowRegime | null
  frictionIterations: number
  frictionConverged: boolean
}

export function computePipeHeadLoss(input: PipeLossInput): PipeLossResult {
  assertPositive(input.discharge, "El caudal debe ser mayor que cero")
  assertPositive(input.diameterM, "El diámetro debe ser mayor que cero")
  assertPositive(input.length, "La longitud debe ser mayor que cero")
  assertNonNegative(
    input.totalK,
    "La suma de coeficientes K no puede ser negativa"
  )

  const velocity = pipeVelocity(input.discharge, input.diameterM)
  const localLossValue = localLoss(velocity, input.totalK)

  if (input.method === "hazen-williams") {
    const frictionLossValue = hazenWilliamsFrictionLoss(
      input.discharge,
      input.diameterM,
      input.length,
      input.hazenC
    )
    const totalLoss = frictionLossValue + localLossValue
    assertFinite(totalLoss, "La pérdida total calculada no es válida")

    return {
      method: input.method,
      velocity,
      frictionLoss: frictionLossValue,
      localLoss: localLossValue,
      totalLoss,
      reynolds: null,
      frictionFactor: null,
      relativeRoughness: null,
      flowRegime: null,
      frictionIterations: 0,
      frictionConverged: true,
    }
  }

  assertNonNegative(
    input.roughnessM,
    "La rugosidad absoluta no puede ser negativa"
  )
  assertPositive(
    input.viscosity,
    "La viscosidad cinemática debe ser mayor que cero"
  )

  const reynolds = reynoldsNumber(velocity, input.diameterM, input.viscosity)
  const relativeRoughness = input.roughnessM / input.diameterM
  const friction = frictionFactor(reynolds, relativeRoughness)
  const frictionLossValue =
    (friction.factor * input.length * velocity * velocity) /
    (input.diameterM * 2 * GRAVITY)
  const totalLoss = frictionLossValue + localLossValue

  assertFinite(
    frictionLossValue,
    "La pérdida por fricción calculada no es válida"
  )
  assertFinite(totalLoss, "La pérdida total calculada no es válida")

  return {
    method: input.method,
    velocity,
    frictionLoss: frictionLossValue,
    localLoss: localLossValue,
    totalLoss,
    reynolds,
    frictionFactor: friction.factor,
    relativeRoughness,
    flowRegime: friction.regime,
    frictionIterations: friction.iterations,
    frictionConverged: friction.converged,
  }
}

export type PipeRootResult = {
  value: number
  iterations: number
  converged: boolean
}

type RootFunction = (value: number) => number

function safeEvaluation(fn: RootFunction, value: number): number | null {
  try {
    const result = fn(value)
    return Number.isFinite(result) ? result : null
  } catch {
    return null
  }
}

function bisect(
  fn: RootFunction,
  lower: number,
  upper: number,
  tolerance: number
): PipeRootResult | null {
  let a = lower
  let b = upper
  let fa = safeEvaluation(fn, a)
  const fb = safeEvaluation(fn, b)

  if (fa === null || fb === null) return null

  if (fa === 0) {
    return { value: a, iterations: 0, converged: true }
  }

  if (fb === 0) {
    return { value: b, iterations: 0, converged: true }
  }

  if (Math.sign(fa) === Math.sign(fb)) return null

  let iterations = 0

  while (iterations < MAX_ITERATIONS && b - a > tolerance) {
    const mid = (a + b) / 2
    const fm = safeEvaluation(fn, mid)
    iterations += 1

    if (fm === null) return null

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

  return {
    value: (a + b) / 2,
    iterations,
    converged: b - a <= tolerance,
  }
}

function solveBracketed(
  fn: RootFunction,
  lower: number,
  initialUpper: number,
  maxUpper: number,
  tolerance: number,
  direction: "increasing" | "decreasing"
): PipeRootResult | null {
  const lowerValue = safeEvaluation(fn, lower)

  if (lowerValue === null) return null

  if (lowerValue === 0) {
    return { value: lower, iterations: 0, converged: true }
  }

  if (direction === "increasing" && lowerValue > 0) return null
  if (direction === "decreasing" && lowerValue < 0) return null

  let upper = initialUpper
  let upperValue = safeEvaluation(fn, upper)

  if (upperValue === null) return null

  const isBracketed = () =>
    direction === "increasing" ? upperValue! >= 0 : upperValue! <= 0

  while (!isBracketed() && upper < maxUpper) {
    upper = Math.min(upper * 2, maxUpper)
    upperValue = safeEvaluation(fn, upper)

    if (upperValue === null) return null
  }

  if (!isBracketed()) return null

  return bisect(fn, lower, upper, tolerance)
}

export type PipeDiameterInput = PipeMethodParams & {
  discharge: number
  length: number
  headLoss: number
  totalK: number
}

export type PipeDischargeInput = PipeMethodParams & {
  diameterM: number
  length: number
  headLoss: number
  totalK: number
}

function lossInputForDiameter(
  input: PipeDiameterInput,
  diameterM: number
): PipeLossInput {
  if (input.method === "hazen-williams") {
    return {
      method: input.method,
      hazenC: input.hazenC,
      discharge: input.discharge,
      diameterM,
      length: input.length,
      totalK: input.totalK,
    }
  }

  return {
    method: input.method,
    roughnessM: input.roughnessM,
    viscosity: input.viscosity,
    discharge: input.discharge,
    diameterM,
    length: input.length,
    totalK: input.totalK,
  }
}

function lossInputForDischarge(
  input: PipeDischargeInput,
  discharge: number
): PipeLossInput {
  if (input.method === "hazen-williams") {
    return {
      method: input.method,
      hazenC: input.hazenC,
      discharge,
      diameterM: input.diameterM,
      length: input.length,
      totalK: input.totalK,
    }
  }

  return {
    method: input.method,
    roughnessM: input.roughnessM,
    viscosity: input.viscosity,
    discharge,
    diameterM: input.diameterM,
    length: input.length,
    totalK: input.totalK,
  }
}

export function solvePipeDiameter(
  input: PipeDiameterInput
): PipeRootResult | null {
  assertPositive(input.discharge, "El caudal debe ser mayor que cero")
  assertPositive(input.length, "La longitud debe ser mayor que cero")
  assertPositive(
    input.headLoss,
    "La pérdida de carga total debe ser mayor que cero"
  )
  assertNonNegative(
    input.totalK,
    "La suma de coeficientes K no puede ser negativa"
  )

  const lossAtDiameter = (diameterM: number) =>
    computePipeHeadLoss(lossInputForDiameter(input, diameterM)).totalLoss -
    input.headLoss

  return solveBracketed(
    lossAtDiameter,
    PIPE_DIAMETER_MIN_M,
    1,
    PIPE_DIAMETER_MAX_M,
    PIPE_DIAMETER_TOLERANCE_M,
    "decreasing"
  )
}

export function solvePipeDischarge(
  input: PipeDischargeInput
): PipeRootResult | null {
  assertPositive(input.diameterM, "El diámetro debe ser mayor que cero")
  assertPositive(input.length, "La longitud debe ser mayor que cero")
  assertPositive(
    input.headLoss,
    "La pérdida de carga total debe ser mayor que cero"
  )
  assertNonNegative(
    input.totalK,
    "La suma de coeficientes K no puede ser negativa"
  )

  const lossAtDischarge = (discharge: number) =>
    computePipeHeadLoss(lossInputForDischarge(input, discharge)).totalLoss -
    input.headLoss

  return solveBracketed(
    lossAtDischarge,
    PIPE_DISCHARGE_MIN_M3S,
    1e-3,
    PIPE_DISCHARGE_MAX_M3S,
    PIPE_DISCHARGE_TOLERANCE_M3S,
    "increasing"
  )
}
