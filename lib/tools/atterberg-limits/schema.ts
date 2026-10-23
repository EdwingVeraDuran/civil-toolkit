import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const MIN_LIQUID_LIMIT_POINTS = 3
export const MAX_LIQUID_LIMIT_POINTS = 8
export const MIN_PLASTIC_LIMIT_POINTS = 2
export const MAX_PLASTIC_LIMIT_POINTS = 5
export const MAX_BLOWS = 100
export const MAX_WATER_CONTENT = 200

const blowCount = z.preprocess(
  parseNumericInput,
  z
    .number("Ingresa un número de golpes válido")
    .finite("Ingresa un número de golpes válido")
    .int("El número de golpes debe ser entero")
    .min(1, "El número de golpes debe ser mayor que cero")
    .max(MAX_BLOWS, `El número de golpes debe ser como máximo ${MAX_BLOWS}`)
)

const moisture = z.preprocess(
  parseNumericInput,
  z
    .number("Ingresa un contenido de agua válido")
    .finite("Ingresa un contenido de agua válido")
    .gt(0, "El contenido de agua debe ser mayor que cero")
    .max(
      MAX_WATER_CONTENT,
      `El contenido de agua debe ser como máximo ${MAX_WATER_CONTENT} %`
    )
)

const liquidLimitPointSchema = z.object({
  blows: blowCount,
  moisture,
})

export const atterbergLimitsSchema = z
  .object({
    liquidLimitPoints: z
      .array(liquidLimitPointSchema)
      .min(
        MIN_LIQUID_LIMIT_POINTS,
        `Agrega al menos ${MIN_LIQUID_LIMIT_POINTS} puntos para el límite líquido`
      )
      .max(
        MAX_LIQUID_LIMIT_POINTS,
        `El límite líquido admite como máximo ${MAX_LIQUID_LIMIT_POINTS} puntos`
      ),
    plasticLimitValues: z
      .array(moisture)
      .min(
        MIN_PLASTIC_LIMIT_POINTS,
        `Agrega al menos ${MIN_PLASTIC_LIMIT_POINTS} determinaciones para el límite plástico`
      )
      .max(
        MAX_PLASTIC_LIMIT_POINTS,
        `El límite plástico admite como máximo ${MAX_PLASTIC_LIMIT_POINTS} determinaciones`
      ),
  })
  .superRefine((input, context) => {
    const distinctBlows = new Set(
      input.liquidLimitPoints.map((point) => point.blows)
    )

    if (distinctBlows.size < 2) {
      context.addIssue({
        code: "custom",
        path: ["liquidLimitPoints"],
        message:
          "Ingresa al menos dos números de golpes distintos para ajustar la regresión",
      })
    }
  })

export type AtterbergLimitsInput = z.infer<typeof atterbergLimitsSchema>
export type LiquidLimitPointInput =
  AtterbergLimitsInput["liquidLimitPoints"][number]
