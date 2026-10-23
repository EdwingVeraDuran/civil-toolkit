import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const ORIENTATION_MODES = [
  "bearing-to-azimuth",
  "azimuth-to-bearing",
] as const
export type OrientationMode = (typeof ORIENTATION_MODES)[number]

export const ANGLE_FORMATS = ["decimal", "dms"] as const
export type AngleFormat = (typeof ANGLE_FORMATS)[number]

export const BEARING_QUADRANTS = ["NE", "NW", "SE", "SW"] as const
export type BearingQuadrant = (typeof BEARING_QUADRANTS)[number]

export const ORIENTATION_MODE_LABELS: Record<OrientationMode, string> = {
  "bearing-to-azimuth": "Rumbo → azimut",
  "azimuth-to-bearing": "Azimut → rumbo",
}

export const ANGLE_FORMAT_LABELS: Record<AngleFormat, string> = {
  decimal: "Grados decimales",
  dms: "Grados, minutos y segundos",
}

export const BEARING_QUADRANT_LABELS: Record<BearingQuadrant, string> = {
  NE: "Noreste (NE)",
  NW: "Noroeste (NW)",
  SE: "Sureste (SE)",
  SW: "Suroeste (SW)",
}

export const BEARING_QUADRANT_DESCRIPTIONS: Record<BearingQuadrant, string> = {
  NE: "Ángulo medido desde el norte hacia el este.",
  NW: "Ángulo medido desde el norte hacia el oeste.",
  SE: "Ángulo medido desde el sur hacia el este.",
  SW: "Ángulo medido desde el sur hacia el oeste.",
}

const decimalSchema = z.object({
  mode: z.enum(ORIENTATION_MODES),
  format: z.literal("decimal"),
  quadrant: z.enum(BEARING_QUADRANTS),
  angle: z.preprocess(
    parseNumericInput,
    z.number("Ingresa un número válido").finite("Ingresa un número válido")
  ),
})

const dmsSchema = z.object({
  mode: z.enum(ORIENTATION_MODES),
  format: z.literal("dms"),
  quadrant: z.enum(BEARING_QUADRANTS),
  degrees: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .int("Los grados deben ser un número entero")
      .min(0, "Los grados no pueden ser negativos")
  ),
  minutes: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .int("Los minutos deben ser un número entero")
      .min(0, "Los minutos no pueden ser negativos")
      .max(59, "Los minutos deben estar entre 0 y 59")
  ),
  seconds: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .min(0, "Los segundos no pueden ser negativos")
      .lt(60, "Los segundos deben ser menores que 60")
  ),
})

export const orientationSchema = z
  .discriminatedUnion("format", [decimalSchema, dmsSchema])
  .superRefine((data, context) => {
    const max = data.mode === "bearing-to-azimuth" ? 90 : 360
    const label = data.mode === "bearing-to-azimuth" ? "rumbo" : "azimut"

    if (data.format === "decimal") {
      if (data.angle < 0 || data.angle > max) {
        context.addIssue({
          code: "custom",
          path: ["angle"],
          message:
            data.mode === "bearing-to-azimuth"
              ? "El rumbo debe estar entre 0° y 90°"
              : "El azimut debe estar entre 0° y 360°",
        })
      }
      return
    }

    const total = data.degrees + data.minutes / 60 + data.seconds / 3600

    if (total > max) {
      context.addIssue({
        code: "custom",
        path: ["degrees"],
        message: `El ${label} no puede superar ${max}°`,
      })
    }
  })

export type OrientationInput = z.infer<typeof orientationSchema>
