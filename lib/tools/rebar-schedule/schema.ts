import { z } from "zod"

import { isRebarId } from "@/lib/estructuras/nsr10-rebar"
import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const MAX_REBAR_ROWS = 100
export const MAX_REBAR_QUANTITY = 100000
export const MAX_REBAR_LENGTH = 100
export const DEFAULT_WASTE_PERCENT = 0
export const DEFAULT_REBAR_ID = "no-4"
export const DEFAULT_SECTION_BAR_ID = "no-4"

function positiveNumber(message: string) {
  return z
    .number("Ingresa un número válido")
    .finite("Ingresa un número válido")
    .positive(message)
}

function optionalPositiveNumber(message: string) {
  return z.preprocess(parseNumericInput, positiveNumber(message).optional())
}

const rebarRowSchema = z.object({
  mark: z
    .string()
    .trim()
    .max(40, "El marcado debe tener máximo 40 caracteres")
    .optional()
    .default(""),
  barId: z
    .string()
    .refine(isRebarId, "Selecciona una varilla válida del despiece"),
  quantity: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa una cantidad válida")
      .finite("Ingresa una cantidad válida")
      .int("La cantidad de barras debe ser un número entero")
      .min(1, "La cantidad debe ser mayor que cero")
      .max(
        MAX_REBAR_QUANTITY,
        `La cantidad debe ser como máximo ${MAX_REBAR_QUANTITY} barras`
      )
  ),
  length: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa una longitud válida")
      .finite("Ingresa una longitud válida")
      .positive("La longitud de corte debe ser mayor que cero")
      .max(
        MAX_REBAR_LENGTH,
        `La longitud de corte debe ser como máximo ${MAX_REBAR_LENGTH} m`
      )
  ),
})

export const rebarScheduleSchema = z.object({
  rows: z
    .array(rebarRowSchema)
    .min(1, "Agrega al menos una fila al despiece")
    .max(
      MAX_REBAR_ROWS,
      `El despiece admite como máximo ${MAX_REBAR_ROWS} filas`
    ),
  wastePercent: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un desperdicio válido")
      .finite("Ingresa un desperdicio válido")
      .min(0, "El desperdicio no puede ser negativo")
      .max(100, "El desperdicio debe ser como máximo 100 %")
  ),
  concreteVolume: optionalPositiveNumber(
    "El volumen de concreto debe ser mayor que cero"
  ),
  concreteArea: optionalPositiveNumber(
    "El área de concreto debe ser mayor que cero"
  ),
  sectionEnabled: z.boolean(),
  sectionWidth: z.preprocess(
    parseNumericInput,
    positiveNumber("El ancho b debe ser mayor que cero").max(
      10000,
      "El ancho b debe ser como máximo 10000 mm"
    )
  ),
  sectionEffectiveDepth: z.preprocess(
    parseNumericInput,
    positiveNumber("El peralte efectivo d debe ser mayor que cero").max(
      10000,
      "El peralte efectivo d debe ser como máximo 10000 mm"
    )
  ),
  sectionBarId: z
    .string()
    .refine(isRebarId, "Selecciona una varilla válida para la sección"),
  sectionBarCount: z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa una cantidad válida")
      .finite("Ingresa una cantidad válida")
      .int("La cantidad de barras debe ser un número entero")
      .min(1, "La cantidad debe ser mayor que cero")
      .max(1000, "La cantidad debe ser como máximo 1000 barras")
  ),
})

export type RebarScheduleInput = z.infer<typeof rebarScheduleSchema>
export type RebarRowInput = RebarScheduleInput["rows"][number]
