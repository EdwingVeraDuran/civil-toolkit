import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"
import { LOCALE } from "@/lib/units/format"

export const INTERPOLATION_MODES = ["linear", "double"] as const
export type InterpolationMode = (typeof INTERPOLATION_MODES)[number]

export const LINEAR_DIRECTIONS = ["y-from-x", "x-from-y"] as const
export type LinearDirection = (typeof LINEAR_DIRECTIONS)[number]

export const INTERPOLATION_MODE_LABELS: Record<InterpolationMode, string> = {
  linear: "Interpolación lineal",
  double: "Interpolación doble (bilineal)",
}

export const LINEAR_DIRECTION_LABELS: Record<LinearDirection, string> = {
  "y-from-x": "Calcular y a partir de x",
  "x-from-y": "Calcular x a partir de y",
}

const finiteNumber = (message = "Ingresa un número válido") =>
  z.preprocess(
    parseNumericInput,
    z.number(message).finite("Ingresa un número válido")
  )

const linearSchema = z.object({
  mode: z.literal("linear"),
  direction: z.enum(LINEAR_DIRECTIONS).default("y-from-x"),
  x1: finiteNumber(),
  y1: finiteNumber(),
  x2: finiteNumber(),
  y2: finiteNumber(),
  target: finiteNumber(),
})

const doubleSchema = z.object({
  mode: z.literal("double"),
  x1: finiteNumber(),
  x2: finiteNumber(),
  y1: finiteNumber(),
  y2: finiteNumber(),
  z11: finiteNumber(),
  z21: finiteNumber(),
  z12: finiteNumber(),
  z22: finiteNumber(),
  targetX: finiteNumber(),
  targetY: finiteNumber(),
})

function formatBound(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 6,
  }).format(value)
}

function addRangeIssue(
  context: z.RefinementCtx,
  field: string,
  variable: string,
  first: number,
  second: number,
  value: number
) {
  const lower = Math.min(first, second)
  const upper = Math.max(first, second)

  if (value >= lower && value <= upper) return

  context.addIssue({
    code: "custom",
    path: [field],
    message: `El valor de ${variable} debe estar entre ${formatBound(
      lower
    )} y ${formatBound(upper)}`,
  })
}

export const interpolationSchema = z
  .discriminatedUnion("mode", [linearSchema, doubleSchema])
  .superRefine((data, context) => {
    if (data.mode === "linear") {
      if (data.direction === "y-from-x") {
        if (data.x1 === data.x2) {
          context.addIssue({
            code: "custom",
            path: ["x2"],
            message: "x₁ y x₂ deben ser diferentes para interpolar",
          })
          return
        }

        addRangeIssue(context, "target", "x", data.x1, data.x2, data.target)
        return
      }

      if (data.y1 === data.y2) {
        context.addIssue({
          code: "custom",
          path: ["y2"],
          message: "y₁ e y₂ deben ser diferentes para interpolar",
        })
        return
      }

      addRangeIssue(context, "target", "y", data.y1, data.y2, data.target)
      return
    }

    if (data.x1 === data.x2) {
      context.addIssue({
        code: "custom",
        path: ["x2"],
        message: "x₁ y x₂ deben ser diferentes para interpolar",
      })
    }

    if (data.y1 === data.y2) {
      context.addIssue({
        code: "custom",
        path: ["y2"],
        message: "y₁ e y₂ deben ser diferentes para interpolar",
      })
    }

    if (data.x1 !== data.x2) {
      addRangeIssue(context, "targetX", "x", data.x1, data.x2, data.targetX)
    }

    if (data.y1 !== data.y2) {
      addRangeIssue(context, "targetY", "y", data.y1, data.y2, data.targetY)
    }
  })

export type LinearInput = z.infer<typeof linearSchema>
export type DoubleInput = z.infer<typeof doubleSchema>
export type InterpolationInput = z.infer<typeof interpolationSchema>
