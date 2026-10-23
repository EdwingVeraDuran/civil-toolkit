import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"
import { unitsByDimension } from "@/lib/units/units"

export const MAX_VERTICES = 200
export const DEFAULT_LENGTH_UNIT = "m"
export const DEFAULT_AREA_UNIT = "m2"

const LENGTH_UNIT_IDS = new Set(
  unitsByDimension("length").map((unit) => unit.id)
)
const AREA_UNIT_IDS = new Set(unitsByDimension("area").map((unit) => unit.id))

const lengthUnit = z
  .string()
  .refine(
    (value) => LENGTH_UNIT_IDS.has(value),
    "Selecciona una unidad de longitud válida"
  )

const areaUnit = z
  .string()
  .refine(
    (value) => AREA_UNIT_IDS.has(value),
    "Selecciona una unidad de área válida"
  )

const coordinate = z.preprocess(
  parseNumericInput,
  z.number("Ingresa un número válido").finite("Ingresa un número válido")
)

const vertexSchema = z.object({
  x: coordinate,
  y: coordinate,
})

export const coordinatesAreaSchema = z
  .object({
    lengthUnit,
    areaUnit,
    vertices: z
      .array(vertexSchema)
      .min(3, "Ingresa al menos 3 vértices")
      .max(MAX_VERTICES, `No se permiten más de ${MAX_VERTICES} vértices`),
  })
  .superRefine((data, context) => {
    let twiceArea = 0

    for (let index = 0; index < data.vertices.length; index += 1) {
      const current = data.vertices[index]
      const next = data.vertices[(index + 1) % data.vertices.length]

      twiceArea += current.x * next.y - next.x * current.y
    }

    if (Math.abs(twiceArea) < 1e-12) {
      context.addIssue({
        code: "custom",
        path: ["vertices"],
        message:
          "Los vértices deben formar un polígono con área mayor que cero. Revisa el orden y evita puntos colineales.",
      })
    }
  })

export type CoordinatesAreaInput = z.infer<typeof coordinatesAreaSchema>
export type CoordinateVertex = CoordinatesAreaInput["vertices"][number]
