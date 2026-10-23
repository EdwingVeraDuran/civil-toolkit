import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"
import { Measurement } from "@/lib/units/measurement"
import { getUnit, unitsByDimension } from "@/lib/units/units"

export const SOIL_PHASE_MODES = [
  "e-w",
  "n-w",
  "w-s",
  "gamma-w",
  "gamma-sat",
] as const

export type SoilPhaseMode = (typeof SOIL_PHASE_MODES)[number]

export const SOIL_PHASE_MODE_LABELS: Record<SoilPhaseMode, string> = {
  "e-w": "e + w",
  "n-w": "n + w",
  "w-s": "w + S",
  "gamma-w": "γ + w",
  "gamma-sat": "γsat + Gs",
}

export const SOIL_PHASE_MODE_DESCRIPTIONS: Record<SoilPhaseMode, string> = {
  "e-w":
    "Se conocen la relación de vacíos y el contenido de agua. Se calculan n, S y los pesos unitarios.",
  "n-w":
    "Se conocen la porosidad y el contenido de agua. Se calculan e, S y los pesos unitarios.",
  "w-s":
    "Se conocen el contenido de agua y el grado de saturación. Se calculan e, n y los pesos unitarios.",
  "gamma-w":
    "Se conocen el peso unitario natural y el contenido de agua. Se calculan e, n y S.",
  "gamma-sat":
    "Se conocen el peso unitario saturado y Gs. Se calculan e, n y w; S es 100 %.",
}

export const DEFAULT_UNIT_WEIGHT_UNIT = "knm3"
export const DEFAULT_VOLUME_UNIT = "m3"
export const DEFAULT_FORCE_UNIT = "kn"

const UNIT_WEIGHT_UNIT_IDS = new Set(
  unitsByDimension("unitWeight").map((unit) => unit.id)
)
const VOLUME_UNIT_IDS = new Set(
  unitsByDimension("volume").map((unit) => unit.id)
)
const FORCE_UNIT_IDS = new Set(unitsByDimension("force").map((unit) => unit.id))

const SATURATION_EPSILON = 1e-9

const unitWeightUnit = z
  .string()
  .refine(
    (value) => UNIT_WEIGHT_UNIT_IDS.has(value),
    "Unidad de peso unitario inválida"
  )

const volumeUnit = z
  .string()
  .refine((value) => VOLUME_UNIT_IDS.has(value), "Unidad de volumen inválida")

const forceUnit = z
  .string()
  .refine((value) => FORCE_UNIT_IDS.has(value), "Unidad de fuerza inválida")

const positiveNumber = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .positive(message)
  )

const nonNegativeNumber = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .min(0, message)
  )

const porosity = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .gt(0, message)
      .lt(100, message)
  )

const saturation = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .gt(0, message)
      .max(100, message)
  )

const commonFields = {
  unitWeightUnit,
  volumeUnit,
  forceUnit,
  specificGravity: positiveNumber(
    "La gravedad específica debe ser mayor que cero"
  ),
  waterUnitWeight: positiveNumber(
    "El peso unitario del agua debe ser mayor que cero"
  ),
}

const eWSchema = z.object({
  mode: z.literal("e-w"),
  ...commonFields,
  voidRatio: positiveNumber("La relación de vacíos debe ser mayor que cero"),
  waterContent: nonNegativeNumber("El contenido de agua no puede ser negativo"),
})

const nWSchema = z.object({
  mode: z.literal("n-w"),
  ...commonFields,
  porosity: porosity("La porosidad debe estar entre 0 % y 100 %"),
  waterContent: nonNegativeNumber("El contenido de agua no puede ser negativo"),
})

const wSSchema = z.object({
  mode: z.literal("w-s"),
  ...commonFields,
  waterContent: positiveNumber("El contenido de agua debe ser mayor que cero"),
  saturation: saturation("El grado de saturación debe estar entre 0 % y 100 %"),
})

const gammaWSchema = z.object({
  mode: z.literal("gamma-w"),
  ...commonFields,
  unitWeight: positiveNumber("El peso unitario debe ser mayor que cero"),
  waterContent: nonNegativeNumber("El contenido de agua no puede ser negativo"),
})

const gammaSatSchema = z.object({
  mode: z.literal("gamma-sat"),
  ...commonFields,
  saturatedUnitWeight: positiveNumber(
    "El peso unitario saturado debe ser mayor que cero"
  ),
})

function toKNM3(value: number, unitId: string): number {
  const unit = getUnit(unitId)
  if (!unit || unit.dimension !== "unitWeight") return value
  return Measurement.from(value, unit).to("knm3").value
}

function addSaturationIssue(context: z.RefinementCtx) {
  context.addIssue({
    code: "custom",
    path: ["waterContent"],
    message:
      "El grado de saturación calculado supera 100 %. Revisa los datos ingresados y la gravedad específica.",
  })
}

export const soilPhaseRelationshipsSchema = z
  .discriminatedUnion("mode", [
    eWSchema,
    nWSchema,
    wSSchema,
    gammaWSchema,
    gammaSatSchema,
  ])
  .superRefine((data, context) => {
    const gammaW = toKNM3(data.waterUnitWeight, data.unitWeightUnit)
    const specificGravity = data.specificGravity

    if (data.mode === "e-w") {
      const saturationValue =
        ((data.waterContent / 100) * specificGravity) / data.voidRatio

      if (saturationValue > 1 + SATURATION_EPSILON) {
        addSaturationIssue(context)
      }
      return
    }

    if (data.mode === "n-w") {
      const porosityValue = data.porosity / 100
      if (porosityValue >= 1) return

      const voidRatio = porosityValue / (1 - porosityValue)
      const saturationValue =
        ((data.waterContent / 100) * specificGravity) / voidRatio

      if (saturationValue > 1 + SATURATION_EPSILON) {
        addSaturationIssue(context)
      }
      return
    }

    if (data.mode === "w-s") {
      return
    }

    if (data.mode === "gamma-w") {
      const unitWeight = toKNM3(data.unitWeight, data.unitWeightUnit)
      const waterContent = data.waterContent / 100
      const voidRatio =
        (specificGravity * gammaW * (1 + waterContent)) / unitWeight - 1

      if (!Number.isFinite(voidRatio) || voidRatio <= 0) {
        context.addIssue({
          code: "custom",
          path: ["unitWeight"],
          message:
            "Con estos datos, la relación de vacíos resulta menor o igual que cero. Revisa γ, w o Gs.",
        })
        return
      }

      const saturationValue = (waterContent * specificGravity) / voidRatio
      if (saturationValue > 1 + SATURATION_EPSILON) {
        addSaturationIssue(context)
      }
      return
    }

    const saturatedUnitWeight = toKNM3(
      data.saturatedUnitWeight,
      data.unitWeightUnit
    )

    if (
      !Number.isFinite(saturatedUnitWeight) ||
      saturatedUnitWeight <= gammaW ||
      saturatedUnitWeight >= specificGravity * gammaW
    ) {
      context.addIssue({
        code: "custom",
        path: ["saturatedUnitWeight"],
        message:
          "Con estos datos, la relación de vacíos resulta menor o igual que cero. Debe cumplirse γw < γsat < Gs · γw.",
      })
    }
  })

export type SoilPhaseInput = z.infer<typeof soilPhaseRelationshipsSchema>
export type EWInput = z.infer<typeof eWSchema>
export type NWInput = z.infer<typeof nWSchema>
export type WSInput = z.infer<typeof wSSchema>
export type GammaWInput = z.infer<typeof gammaWSchema>
export type GammaSatInput = z.infer<typeof gammaSatSchema>
