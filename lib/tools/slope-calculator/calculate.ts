import { Measurement } from "@/lib/units/measurement"
import { getUnit } from "@/lib/units/units"
import type {
  SlopeDirection,
  SlopeFormat,
  SlopeInput,
} from "@/lib/tools/slope-calculator/schema"

export type SlopeDirectionResult = "ascendente" | "descendente" | "plano"

export type SlopeResult = {
  runM: number
  riseM: number
  slopeLengthM: number
  grade: number
  percent: number
  permille: number
  angleDeg: number
  ratio: number | null
  cmPerM: number
  mmPerM: number
  direction: SlopeDirectionResult
}

function toMeters(value: number, unitId: string): number {
  const unit = getUnit(unitId)

  if (!unit || unit.dimension !== "length") {
    throw new Error("Unidad de longitud inválida")
  }

  return new Measurement(value, unit).to("m").value
}

export function slopeToGrade(
  value: number,
  format: SlopeFormat,
  direction: SlopeDirection = "ascending"
): number {
  switch (format) {
    case "percent":
      return value / 100
    case "permille":
      return value / 1000
    case "angle":
      if (value <= -90 || value >= 90) {
        throw new Error("El ángulo debe estar entre -90° y 90°")
      }
      return Math.tan((value * Math.PI) / 180)
    case "ratio":
      if (value <= 0) {
        throw new Error("La relación 1:n debe tener n mayor que cero")
      }
      return (direction === "descending" ? -1 : 1) / value
  }
}

function buildResult(runM: number, riseM: number): SlopeResult {
  if (!Number.isFinite(runM) || runM <= 0) {
    throw new Error("La distancia horizontal debe ser mayor que cero")
  }
  if (!Number.isFinite(riseM)) {
    throw new Error("El desnivel debe ser un número finito")
  }

  const normalizedRiseM = Math.abs(riseM) < 1e-12 ? 0 : riseM
  const grade = normalizedRiseM / runM
  const angleDeg = (Math.atan2(normalizedRiseM, runM) * 180) / Math.PI
  const ratio = normalizedRiseM === 0 ? null : runM / Math.abs(normalizedRiseM)

  return {
    runM,
    riseM: normalizedRiseM,
    slopeLengthM: Math.hypot(runM, normalizedRiseM),
    grade,
    percent: grade * 100,
    permille: grade * 1000,
    angleDeg,
    ratio,
    cmPerM: grade * 100,
    mmPerM: grade * 1000,
    direction:
      normalizedRiseM > 0
        ? "ascendente"
        : normalizedRiseM < 0
          ? "descendente"
          : "plano",
  }
}

export function calculateSlope(input: SlopeInput): SlopeResult {
  const runM = toMeters(input.run, input.runUnit)

  switch (input.mode) {
    case "rise-run": {
      const riseM = toMeters(input.rise, input.riseUnit)
      return buildResult(runM, riseM)
    }
    case "slope-run": {
      const grade = slopeToGrade(
        input.slopeValue,
        input.slopeFormat,
        input.direction
      )
      return buildResult(runM, grade * runM)
    }
    case "elevations": {
      const startM = toMeters(input.startElevation, input.elevationUnit)
      const endM = toMeters(input.endElevation, input.elevationUnit)
      return buildResult(runM, endM - startM)
    }
  }
}
