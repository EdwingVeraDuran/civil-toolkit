import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"
import { unitsByDimension } from "@/lib/units/units"

export const SLOPE_MODES = ["rise-run", "slope-run", "elevations"] as const
export type SlopeMode = (typeof SLOPE_MODES)[number]

export const SLOPE_FORMATS = ["percent", "permille", "ratio", "angle"] as const
export type SlopeFormat = (typeof SLOPE_FORMATS)[number]

export const SLOPE_DIRECTIONS = ["ascending", "descending"] as const
export type SlopeDirection = (typeof SLOPE_DIRECTIONS)[number]

const LENGTH_UNIT_IDS = new Set(
  unitsByDimension("length").map((unit) => unit.id)
)

const lengthUnit = z
  .string()
  .refine(
    (value) => LENGTH_UNIT_IDS.has(value),
    "Selecciona una unidad de longitud válida"
  )

const finiteNumber = (message = "Ingresa un número válido") =>
  z.preprocess(
    parseNumericInput,
    z.number(message).finite("Ingresa un número válido")
  )

const positiveNumber = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .positive(message)
  )

const riseRunSchema = z.object({
  mode: z.literal("rise-run"),
  run: positiveNumber("La distancia horizontal debe ser mayor que cero"),
  runUnit: lengthUnit,
  rise: finiteNumber(),
  riseUnit: lengthUnit,
})

const slopeRunSchema = z.object({
  mode: z.literal("slope-run"),
  run: positiveNumber("La distancia horizontal debe ser mayor que cero"),
  runUnit: lengthUnit,
  slopeValue: finiteNumber(),
  slopeFormat: z.enum(SLOPE_FORMATS),
  direction: z.enum(SLOPE_DIRECTIONS).default("ascending"),
})

const elevationsSchema = z.object({
  mode: z.literal("elevations"),
  run: positiveNumber("La distancia horizontal debe ser mayor que cero"),
  runUnit: lengthUnit,
  startElevation: finiteNumber(),
  endElevation: finiteNumber(),
  elevationUnit: lengthUnit,
})

export const slopeSchema = z
  .discriminatedUnion("mode", [riseRunSchema, slopeRunSchema, elevationsSchema])
  .superRefine((data, ctx) => {
    if (data.mode !== "slope-run") return

    if (data.slopeFormat === "ratio" && data.slopeValue <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "La relación 1:n debe tener n mayor que cero",
        path: ["slopeValue"],
      })
    }

    if (
      data.slopeFormat === "angle" &&
      (data.slopeValue <= -90 || data.slopeValue >= 90)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "El ángulo debe estar entre -90° y 90°",
        path: ["slopeValue"],
      })
    }
  })

export type SlopeInput = z.infer<typeof slopeSchema>
