import {
  CIRCULAR_CAPACITY_DEPTH_RATIO,
  MANNING_TYPICAL_MAX,
  MANNING_TYPICAL_MIN,
  classifyFlowRegime,
  classifySlope,
  criticalSlope as computeCriticalSlope,
  froudeNumber,
  manningDischarge,
  sectionProperties,
  solveCriticalDepth,
  solveNormalDepth,
  type ChannelSectionProperties,
  type DepthSolution,
  type FlowRegime,
  type SlopeClass,
} from "@/lib/aguas/canales"
import type {
  ChannelMode,
  ChannelSectionType,
  OpenChannelFlowInput,
} from "@/lib/tools/open-channel-flow/schema"
import { formatNumber } from "@/lib/units/format"

export const OPEN_CHANNEL_FORMULA =
  "Q = (1/n) · A · R^(2/3) · S0^(1/2); V = Q/A; Fr = V/√(gDₕ); Q²T_c/(gA_c³) = 1; S_c = [nQ/(A_c · R_c^(2/3))]²"

export type OpenChannelFlowResult = {
  mode: ChannelMode
  section: ChannelSectionType
  discharge: number
  normalDepth: number | null
  criticalDepth: number | null
  velocity: number | null
  froude: number | null
  regime: FlowRegime | null
  criticalSlope: number | null
  slopeClassification: SlopeClass | null
  properties: ChannelSectionProperties | null
  criticalProperties: ChannelSectionProperties | null
  iterations: {
    normalDepth: number
    criticalDepth: number
  }
  converged: {
    normalDepth: boolean
    criticalDepth: boolean
  }
  warnings: string[]
  formula: string
}

function nonConvergenceWarning(label: string, solution: DepthSolution): string {
  return `${label} no convergió en ${solution.iterations} iteraciones; el resultado es aproximado.`
}

export function calculateOpenChannelFlow(
  input: OpenChannelFlowInput
): OpenChannelFlowResult {
  const warnings: string[] = []
  const geometry = input.geometry

  let discharge: number

  if (input.mode === "discharge") {
    discharge = input.discharge
  } else {
    discharge = manningDischarge(
      sectionProperties(geometry, input.depth),
      input.manning,
      input.slope
    )
  }

  if (
    input.manning < MANNING_TYPICAL_MIN ||
    input.manning > MANNING_TYPICAL_MAX
  ) {
    warnings.push(
      `El coeficiente de Manning n = ${formatNumber(
        input.manning,
        3
      )} está fuera del intervalo típico ${formatNumber(
        MANNING_TYPICAL_MIN,
        3
      )}–${formatNumber(
        MANNING_TYPICAL_MAX,
        3
      )}. Revisa el material y el estado del canal.`
    )
  }

  const criticalSolution = solveCriticalDepth(geometry, discharge)
  const normalSolution =
    input.mode === "depth"
      ? {
          depth: input.depth,
          iterations: 0,
          converged: true,
          residual: 0,
        }
      : solveNormalDepth(geometry, discharge, input.manning, input.slope)

  if (normalSolution && !normalSolution.converged) {
    warnings.push(
      nonConvergenceWarning("La profundidad normal", normalSolution)
    )
  }

  if (criticalSolution && !criticalSolution.converged) {
    warnings.push(
      nonConvergenceWarning("La profundidad crítica", criticalSolution)
    )
  }

  if (!normalSolution) {
    if (geometry.section === "circular") {
      warnings.push(
        "No hay solución de flujo normal a superficie libre: el caudal supera la capacidad máxima de la sección circular. Aumenta el diámetro o considera un análisis de flujo a presión."
      )
    } else {
      warnings.push(
        "No se encontró una profundidad normal dentro del rango numérico de cálculo. Revisa el caudal, la pendiente y la rugosidad."
      )
    }
  }

  if (!criticalSolution) {
    warnings.push(
      "No se pudo determinar la profundidad crítica dentro de la sección a superficie libre. Revisa el caudal y la geometría."
    )
  }

  const normalProperties = normalSolution
    ? sectionProperties(geometry, normalSolution.depth)
    : null
  const criticalProperties = criticalSolution
    ? sectionProperties(geometry, criticalSolution.depth)
    : null

  const velocity =
    normalProperties && normalSolution
      ? discharge / normalProperties.area
      : null

  const froude =
    velocity !== null && normalProperties
      ? froudeNumber(velocity, normalProperties.hydraulicDepth)
      : null

  const regime = froude !== null ? classifyFlowRegime(froude) : null

  let criticalSlopeValue: number | null = null

  if (criticalProperties) {
    try {
      const value = computeCriticalSlope(
        input.manning,
        discharge,
        criticalProperties
      )

      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Pendiente crítica no válida")
      }

      criticalSlopeValue = value
    } catch {
      warnings.push(
        "No se pudo calcular la pendiente crítica con los datos suministrados."
      )
    }
  }

  const slopeClassification =
    criticalSlopeValue !== null
      ? classifySlope(input.slope, criticalSlopeValue)
      : null

  if (froude !== null && Math.abs(froude - 1) <= 0.05 && regime !== null) {
    warnings.push(
      `El flujo está cerca del régimen crítico (Fr = ${formatNumber(
        froude,
        3
      )}). Evita diseñar en este intervalo: pequeñas variaciones de caudal o profundidad cambian el régimen.`
    )
  }

  if (regime === "supercritical") {
    warnings.push(
      "El flujo es supercrítico. Revisa la necesidad de analizar el resalto hidráulico, la transición y la protección contra erosión."
    )
  }

  if (geometry.section === "circular") {
    const depthRatio =
      normalSolution !== null ? normalSolution.depth / geometry.diameter : null

    if (depthRatio !== null) {
      if (
        input.mode === "depth" &&
        depthRatio >= CIRCULAR_CAPACITY_DEPTH_RATIO
      ) {
        warnings.push(
          `La profundidad ingresada corresponde a y/D = ${formatNumber(
            depthRatio,
            3
          )}, en la zona de capacidad máxima (≈ 0,94). Para un caudal dado, la sección circular tiene dos profundidades normales; esta es la rama superior. Verifica si la rama inferior es la que buscas.`
        )
      } else if (depthRatio > 0.9) {
        warnings.push(
          `La profundidad normal está cerca del máximo de capacidad a superficie libre (y/D = ${formatNumber(
            depthRatio,
            3
          )}). Revisa la sensibilidad del resultado y el borde libre.`
        )
      }
    }
  }

  return {
    mode: input.mode,
    section: geometry.section,
    discharge,
    normalDepth: normalSolution?.depth ?? null,
    criticalDepth: criticalSolution?.depth ?? null,
    velocity,
    froude,
    regime,
    criticalSlope: criticalSlopeValue,
    slopeClassification,
    properties: normalProperties,
    criticalProperties,
    iterations: {
      normalDepth: normalSolution?.iterations ?? 0,
      criticalDepth: criticalSolution?.iterations ?? 0,
    },
    converged: {
      normalDepth: normalSolution?.converged ?? false,
      criticalDepth: criticalSolution?.converged ?? false,
    },
    warnings,
    formula: OPEN_CHANNEL_FORMULA,
  }
}
