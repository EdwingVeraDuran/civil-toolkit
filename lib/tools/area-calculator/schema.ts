import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"
import { unitsByDimension } from "@/lib/units/units"

export const AREA_SHAPES = [
  "square",
  "rectangle",
  "triangle",
  "circle",
  "trapezoid",
  "parallelogram",
  "rhombus",
  "regular-polygon",
] as const

export type AreaShape = (typeof AREA_SHAPES)[number]

export const AREA_SHAPE_LABELS: Record<AreaShape, string> = {
  square: "Cuadrado",
  rectangle: "Rectángulo",
  triangle: "Triángulo",
  circle: "Círculo",
  trapezoid: "Trapecio",
  parallelogram: "Paralelogramo",
  rhombus: "Rombo",
  "regular-polygon": "Polígono regular",
}

export const CIRCLE_MEASURES = ["radius", "diameter"] as const
export type CircleMeasure = (typeof CIRCLE_MEASURES)[number]

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

const positiveNumber = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .positive(message)
  )

const squareSchema = z.object({
  shape: z.literal("square"),
  lengthUnit,
  areaUnit,
  side: positiveNumber("El lado debe ser mayor que cero"),
})

const rectangleSchema = z.object({
  shape: z.literal("rectangle"),
  lengthUnit,
  areaUnit,
  base: positiveNumber("La base debe ser mayor que cero"),
  height: positiveNumber("La altura debe ser mayor que cero"),
})

const triangleSchema = z.object({
  shape: z.literal("triangle"),
  lengthUnit,
  areaUnit,
  base: positiveNumber("La base debe ser mayor que cero"),
  height: positiveNumber("La altura debe ser mayor que cero"),
})

const circleSchema = z.object({
  shape: z.literal("circle"),
  lengthUnit,
  areaUnit,
  circleMeasure: z.enum(CIRCLE_MEASURES),
  circleSize: positiveNumber("El radio o diámetro debe ser mayor que cero"),
})

const trapezoidSchema = z.object({
  shape: z.literal("trapezoid"),
  lengthUnit,
  areaUnit,
  baseMajor: positiveNumber("La base mayor debe ser mayor que cero"),
  baseMinor: positiveNumber("La base menor debe ser mayor que cero"),
  height: positiveNumber("La altura debe ser mayor que cero"),
})

const parallelogramSchema = z.object({
  shape: z.literal("parallelogram"),
  lengthUnit,
  areaUnit,
  base: positiveNumber("La base debe ser mayor que cero"),
  height: positiveNumber("La altura debe ser mayor que cero"),
})

const rhombusSchema = z.object({
  shape: z.literal("rhombus"),
  lengthUnit,
  areaUnit,
  diagonalMajor: positiveNumber("La diagonal mayor debe ser mayor que cero"),
  diagonalMinor: positiveNumber("La diagonal menor debe ser mayor que cero"),
})

const regularPolygonSchema = z.object({
  shape: z.literal("regular-polygon"),
  lengthUnit,
  areaUnit,
  sides: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .int("El número de lados debe ser un entero")
      .min(3, "El número de lados debe ser mayor o igual que 3")
  ),
  side: positiveNumber("La longitud del lado debe ser mayor que cero"),
})

export const areaCalculatorSchema = z.discriminatedUnion("shape", [
  squareSchema,
  rectangleSchema,
  triangleSchema,
  circleSchema,
  trapezoidSchema,
  parallelogramSchema,
  rhombusSchema,
  regularPolygonSchema,
])

export type AreaInput = z.infer<typeof areaCalculatorSchema>
