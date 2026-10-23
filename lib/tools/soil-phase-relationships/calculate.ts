import type {
  SoilPhaseInput,
  SoilPhaseMode,
} from "@/lib/tools/soil-phase-relationships/schema"
import { Measurement } from "@/lib/units/measurement"
import { getUnit } from "@/lib/units/units"

export type SoilPhaseVolumes = {
  volumeSolidsM3: number
  volumeVoidsM3: number
  volumeWaterM3: number
  volumeAirM3: number
  volumeTotalM3: number
  weightSolidsKN: number
  weightWaterKN: number
  weightTotalKN: number
}

export type SoilPhaseResult = {
  mode: SoilPhaseMode
  voidRatio: number
  porosity: number
  saturation: number
  waterContent: number
  unitWeight: number
  dryUnitWeight: number
  saturatedUnitWeight: number
  submergedUnitWeight: number
  specificGravity: number
  waterUnitWeight: number
  phase: SoilPhaseVolumes
  formula: string
}

const SATURATION_EPSILON = 1e-9

const FORMULAS: Record<SoilPhaseMode, string> = {
  "e-w": "S = w · Gs / e; n = e / (1 + e); γ = Gs · γw · (1 + w) / (1 + e)",
  "n-w": "e = n / (1 − n); S = w · Gs / e; γ = Gs · γw · (1 + w) / (1 + e)",
  "w-s": "e = w · Gs / S; n = e / (1 + e); γ = Gs · γw · (1 + w) / (1 + e)",
  "gamma-w": "e = Gs · γw · (1 + w) / γ − 1; S = w · Gs / e; n = e / (1 + e)",
  "gamma-sat": "e = (Gs · γw − γsat) / (γsat − γw); S = 100 %; w = e / Gs",
}

function toKNM3(value: number, unitId: string): number {
  const unit = getUnit(unitId)
  if (!unit || unit.dimension !== "unitWeight") {
    throw new Error("Unidad de peso unitario inválida")
  }
  return Measurement.from(value, unit).to("knm3").value
}

function buildResult({
  mode,
  voidRatio,
  waterContent,
  specificGravity,
  waterUnitWeight,
}: {
  mode: SoilPhaseMode
  voidRatio: number
  waterContent: number
  specificGravity: number
  waterUnitWeight: number
}): SoilPhaseResult {
  if (!Number.isFinite(voidRatio) || voidRatio <= 0) {
    throw new Error("La relación de vacíos debe ser mayor que cero")
  }
  if (!Number.isFinite(waterContent) || waterContent < 0) {
    throw new Error("El contenido de agua no puede ser negativo")
  }
  if (!Number.isFinite(specificGravity) || specificGravity <= 0) {
    throw new Error("La gravedad específica debe ser mayor que cero")
  }
  if (!Number.isFinite(waterUnitWeight) || waterUnitWeight <= 0) {
    throw new Error("El peso unitario del agua debe ser mayor que cero")
  }

  const rawSaturation = (waterContent * specificGravity) / voidRatio

  if (rawSaturation > 1 + SATURATION_EPSILON) {
    throw new Error(
      "El grado de saturación calculado supera 100 %. Revisa los datos ingresados y la gravedad específica."
    )
  }

  const saturation =
    Math.abs(rawSaturation - 1) <= SATURATION_EPSILON
      ? 1
      : Math.max(0, rawSaturation)

  const porosity = voidRatio / (1 + voidRatio)
  const unitWeight =
    (specificGravity * waterUnitWeight * (1 + waterContent)) / (1 + voidRatio)
  const dryUnitWeight = (specificGravity * waterUnitWeight) / (1 + voidRatio)
  const saturatedUnitWeight =
    ((specificGravity + voidRatio) * waterUnitWeight) / (1 + voidRatio)
  const submergedUnitWeight = saturatedUnitWeight - waterUnitWeight

  const volumeSolidsM3 = 1
  const volumeVoidsM3 = voidRatio
  const volumeWaterM3 = saturation * voidRatio
  const volumeAirM3 = volumeVoidsM3 - volumeWaterM3
  const volumeTotalM3 = volumeSolidsM3 + volumeVoidsM3
  const weightSolidsKN = specificGravity * waterUnitWeight
  const weightWaterKN = waterContent * weightSolidsKN
  const weightTotalKN = weightSolidsKN + weightWaterKN

  return {
    mode,
    voidRatio,
    porosity,
    saturation,
    waterContent,
    unitWeight,
    dryUnitWeight,
    saturatedUnitWeight,
    submergedUnitWeight,
    specificGravity,
    waterUnitWeight,
    phase: {
      volumeSolidsM3,
      volumeVoidsM3,
      volumeWaterM3,
      volumeAirM3,
      volumeTotalM3,
      weightSolidsKN,
      weightWaterKN,
      weightTotalKN,
    },
    formula: FORMULAS[mode],
  }
}

export function calculateSoilPhaseRelationships(
  input: SoilPhaseInput
): SoilPhaseResult {
  const specificGravity = input.specificGravity
  const waterUnitWeight = toKNM3(input.waterUnitWeight, input.unitWeightUnit)

  if (input.mode === "e-w") {
    return buildResult({
      mode: input.mode,
      voidRatio: input.voidRatio,
      waterContent: input.waterContent / 100,
      specificGravity,
      waterUnitWeight,
    })
  }

  if (input.mode === "n-w") {
    const porosity = input.porosity / 100

    if (!Number.isFinite(porosity) || porosity <= 0 || porosity >= 1) {
      throw new Error("La porosidad debe estar entre 0 % y 100 %")
    }

    return buildResult({
      mode: input.mode,
      voidRatio: porosity / (1 - porosity),
      waterContent: input.waterContent / 100,
      specificGravity,
      waterUnitWeight,
    })
  }

  if (input.mode === "w-s") {
    const waterContent = input.waterContent / 100
    const saturation = input.saturation / 100

    if (!Number.isFinite(waterContent) || waterContent <= 0) {
      throw new Error("El contenido de agua debe ser mayor que cero")
    }
    if (!Number.isFinite(saturation) || saturation <= 0 || saturation > 1) {
      throw new Error("El grado de saturación debe estar entre 0 % y 100 %")
    }

    return buildResult({
      mode: input.mode,
      voidRatio: (waterContent * specificGravity) / saturation,
      waterContent,
      specificGravity,
      waterUnitWeight,
    })
  }

  if (input.mode === "gamma-w") {
    const unitWeight = toKNM3(input.unitWeight, input.unitWeightUnit)
    const waterContent = input.waterContent / 100
    const voidRatio =
      (specificGravity * waterUnitWeight * (1 + waterContent)) / unitWeight - 1

    if (!Number.isFinite(voidRatio) || voidRatio <= 0) {
      throw new Error(
        "Con estos datos, la relación de vacíos resulta menor o igual que cero. Revisa γ, w o Gs."
      )
    }

    return buildResult({
      mode: input.mode,
      voidRatio,
      waterContent,
      specificGravity,
      waterUnitWeight,
    })
  }

  const saturatedUnitWeight = toKNM3(
    input.saturatedUnitWeight,
    input.unitWeightUnit
  )

  if (
    !Number.isFinite(saturatedUnitWeight) ||
    saturatedUnitWeight <= waterUnitWeight ||
    saturatedUnitWeight >= specificGravity * waterUnitWeight
  ) {
    throw new Error(
      "Con estos datos, la relación de vacíos resulta menor o igual que cero. Debe cumplirse γw < γsat < Gs · γw."
    )
  }

  const voidRatio =
    (specificGravity * waterUnitWeight - saturatedUnitWeight) /
    (saturatedUnitWeight - waterUnitWeight)

  if (!Number.isFinite(voidRatio) || voidRatio <= 0) {
    throw new Error(
      "Con estos datos, la relación de vacíos resulta menor o igual que cero. Debe cumplirse γw < γsat < Gs · γw."
    )
  }

  return buildResult({
    mode: input.mode,
    voidRatio,
    waterContent: voidRatio / specificGravity,
    specificGravity,
    waterUnitWeight,
  })
}
