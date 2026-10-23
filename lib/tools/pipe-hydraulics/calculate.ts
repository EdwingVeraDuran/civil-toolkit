import {
  HAZEN_WILLIAMS_C_MAX,
  HAZEN_WILLIAMS_C_MIN,
  VELOCITY_MAX_RECOMMENDED,
  VELOCITY_MIN_RECOMMENDED,
  computePipeHeadLoss,
  solvePipeDiameter,
  solvePipeDischarge,
  sumAccessoryCoefficient,
  type PipeFlowRegime,
  type PipeLossResult,
  type PipeMethod,
  type PipeMethodParams,
} from "@/lib/aguas/tuberias"
import type {
  PipeHydraulicsInput,
  PipeMode,
} from "@/lib/tools/pipe-hydraulics/schema"
import { formatNumber } from "@/lib/units/format"

export const PIPE_HAZEN_WILLIAMS_FORMULA =
  "V = 0,849·C·(D/4)^0,63·S^0,54; h_f = S·L; h_m = ΣK·V²/(2g); H = h_f + h_m"

export const PIPE_DARCY_WEISBACH_FORMULA =
  "Re = V·D/ν; 1/√f = -2·log10(ε/(3,7D) + 2,51/(Re√f)); h_f = f·(L/D)·V²/(2g); h_m = ΣK·V²/(2g); H = h_f + h_m"

export type PipeHydraulicsResult = {
  mode: PipeMode
  method: PipeMethod
  length: number
  diameterMm: number | null
  discharge: number | null
  headLoss: number | null
  frictionLoss: number | null
  localLoss: number | null
  velocity: number | null
  totalK: number
  hydraulicGradient: number | null
  frictionGradient: number | null
  reynolds: number | null
  frictionFactor: number | null
  relativeRoughness: number | null
  flowRegime: PipeFlowRegime | null
  hazenC: number | null
  roughnessMm: number | null
  viscosity: number | null
  iterations: number
  converged: boolean
  frictionIterations: number
  frictionConverged: boolean
  warnings: string[]
  formula: string
}

function methodParams(input: PipeHydraulicsInput): PipeMethodParams {
  if (input.method === "hazen-williams") {
    return { method: input.method, hazenC: input.hazenC }
  }

  return {
    method: input.method,
    roughnessM: input.roughness / 1000,
    viscosity: input.viscosity,
  }
}

function headLossAt(
  params: PipeMethodParams,
  state: {
    discharge: number
    diameterM: number
    length: number
    totalK: number
  }
): PipeLossResult {
  if (params.method === "hazen-williams") {
    return computePipeHeadLoss({
      method: params.method,
      hazenC: params.hazenC,
      ...state,
    })
  }

  return computePipeHeadLoss({
    method: params.method,
    roughnessM: params.roughnessM,
    viscosity: params.viscosity,
    ...state,
  })
}

function emptyResult(
  input: PipeHydraulicsInput,
  totalK: number,
  warnings: string[],
  formula: string
): PipeHydraulicsResult {
  return {
    mode: input.mode,
    method: input.method,
    length: input.length,
    diameterMm: input.mode === "diameter" ? null : input.diameter,
    discharge: input.mode === "flow" ? null : input.discharge,
    headLoss: input.mode === "loss" ? null : input.headLoss,
    frictionLoss: null,
    localLoss: null,
    velocity: null,
    totalK,
    hydraulicGradient: null,
    frictionGradient: null,
    reynolds: null,
    frictionFactor: null,
    relativeRoughness: null,
    flowRegime: null,
    hazenC: input.method === "hazen-williams" ? input.hazenC : null,
    roughnessMm: input.method === "darcy-weisbach" ? input.roughness : null,
    viscosity: input.method === "darcy-weisbach" ? input.viscosity : null,
    iterations: 0,
    converged: false,
    frictionIterations: 0,
    frictionConverged: false,
    warnings,
    formula,
  }
}

function addMethodWarnings(
  warnings: string[],
  input: PipeHydraulicsInput
): void {
  if (
    input.method === "hazen-williams" &&
    (input.hazenC < HAZEN_WILLIAMS_C_MIN || input.hazenC > HAZEN_WILLIAMS_C_MAX)
  ) {
    warnings.push(
      `El coeficiente C = ${formatNumber(
        input.hazenC,
        1
      )} está fuera del intervalo típico ${HAZEN_WILLIAMS_C_MIN}–${HAZEN_WILLIAMS_C_MAX}. Revisa el material y el estado de la tubería.`
    )
  }
}

function addLossWarnings(warnings: string[], loss: PipeLossResult): void {
  if (
    loss.velocity < VELOCITY_MIN_RECOMMENDED ||
    loss.velocity > VELOCITY_MAX_RECOMMENDED
  ) {
    warnings.push(
      `La velocidad media V = ${formatNumber(
        loss.velocity,
        3
      )} m/s está fuera del intervalo recomendado ${formatNumber(
        VELOCITY_MIN_RECOMMENDED,
        1
      )}–${formatNumber(
        VELOCITY_MAX_RECOMMENDED,
        1
      )} m/s. Revisa el diámetro y el caudal.`
    )
  }

  if (loss.flowRegime === "transitional") {
    warnings.push(
      `El flujo está en régimen transitorio (2000 ≤ Re < 4000). El factor de fricción se interpoló entre el régimen laminar y el turbulento; el resultado es aproximado.`
    )
  }

  if (loss.flowRegime !== null && !loss.frictionConverged) {
    warnings.push(
      "El factor de fricción de Colebrook-White no convergió. Revisa la rugosidad, la viscosidad y el diámetro."
    )
  }

  if (loss.relativeRoughness !== null && loss.relativeRoughness > 0.05) {
    warnings.push(
      `La rugosidad relativa ε/D = ${formatNumber(
        loss.relativeRoughness,
        4
      )} es alta. Darcy-Weisbach puede perder precisión; revisa la rugosidad y el diámetro.`
    )
  }
}

export function calculatePipeHydraulics(
  input: PipeHydraulicsInput
): PipeHydraulicsResult {
  const warnings: string[] = []
  const totalK = sumAccessoryCoefficient(input.accessories)
  const formula =
    input.method === "hazen-williams"
      ? PIPE_HAZEN_WILLIAMS_FORMULA
      : PIPE_DARCY_WEISBACH_FORMULA

  addMethodWarnings(warnings, input)

  let diameterM: number
  let discharge: number
  let iterations = 0
  let converged = true

  if (input.mode === "diameter") {
    const solution = solvePipeDiameter({
      ...methodParams(input),
      discharge: input.discharge,
      length: input.length,
      headLoss: input.headLoss,
      totalK,
    })

    if (!solution) {
      warnings.push(
        "No se encontró un diámetro interno dentro del rango numérico para el caudal y la pérdida total indicados. Revisa la pérdida objetivo, la longitud y los accesorios."
      )
      return emptyResult(input, totalK, warnings, formula)
    }

    diameterM = solution.value
    discharge = input.discharge
    iterations = solution.iterations
    converged = solution.converged
  } else if (input.mode === "flow") {
    diameterM = input.diameter / 1000
    const solution = solvePipeDischarge({
      ...methodParams(input),
      diameterM,
      length: input.length,
      headLoss: input.headLoss,
      totalK,
    })

    if (!solution) {
      warnings.push(
        "No se encontró un caudal dentro del rango numérico para el diámetro y la pérdida total indicados. Revisa la pérdida objetivo, el diámetro y los accesorios."
      )
      return emptyResult(input, totalK, warnings, formula)
    }

    discharge = solution.value
    iterations = solution.iterations
    converged = solution.converged
  } else {
    diameterM = input.diameter / 1000
    discharge = input.discharge
  }

  if (!converged) {
    warnings.push(
      "El solver de bisección no alcanzó la tolerancia en 100 iteraciones; el resultado es aproximado."
    )
  }

  let loss: PipeLossResult

  try {
    loss = headLossAt(methodParams(input), {
      discharge,
      diameterM,
      length: input.length,
      totalK,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo evaluar la pérdida de carga con los datos suministrados."
    warnings.push(message)
    return emptyResult(input, totalK, warnings, formula)
  }

  addLossWarnings(warnings, loss)

  return {
    mode: input.mode,
    method: input.method,
    length: input.length,
    diameterMm: diameterM * 1000,
    discharge,
    headLoss: loss.totalLoss,
    frictionLoss: loss.frictionLoss,
    localLoss: loss.localLoss,
    velocity: loss.velocity,
    totalK,
    hydraulicGradient: loss.totalLoss / input.length,
    frictionGradient: loss.frictionLoss / input.length,
    reynolds: loss.reynolds,
    frictionFactor: loss.frictionFactor,
    relativeRoughness: loss.relativeRoughness,
    flowRegime: loss.flowRegime,
    hazenC: input.method === "hazen-williams" ? input.hazenC : null,
    roughnessMm: input.method === "darcy-weisbach" ? input.roughness : null,
    viscosity: input.method === "darcy-weisbach" ? input.viscosity : null,
    iterations,
    converged,
    frictionIterations: loss.frictionIterations,
    frictionConverged: loss.frictionConverged,
    warnings,
    formula,
  }
}
