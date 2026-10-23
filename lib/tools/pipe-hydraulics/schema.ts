import { z } from "zod"

import { PIPE_ACCESSORY_TYPES, type PipeMethod } from "@/lib/aguas/tuberias"
import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const PIPE_MODES = ["diameter", "flow", "loss"] as const
export type PipeMode = (typeof PIPE_MODES)[number]

export const PIPE_MODE_LABELS: Record<PipeMode, string> = {
  diameter: "Caudal y pérdida total → diámetro",
  flow: "Diámetro y pérdida total → caudal",
  loss: "Diámetro y caudal → pérdida de carga",
}

export const PIPE_MODE_DESCRIPTIONS: Record<PipeMode, string> = {
  diameter:
    "Se conoce el caudal y la pérdida de carga total admisible. Se calcula el diámetro interno requerido incluyendo las pérdidas locales.",
  flow: "Se conoce el diámetro y la pérdida de carga total disponible. Se calcula el caudal incluyendo las pérdidas locales.",
  loss: "Se conocen el diámetro y el caudal. Se calculan la pérdida por fricción, las pérdidas locales y la pérdida total.",
}

export const DEFAULT_PIPE_METHOD: PipeMethod = "hazen-williams"
export const DEFAULT_PIPE_MODE: PipeMode = "diameter"

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
      .nonnegative(message)
  )

const positiveInteger = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .int("La cantidad debe ser un número entero")
      .positive(message)
  )

const accessoryTypeSchema = z.enum(PIPE_ACCESSORY_TYPES)

export const pipeAccessorySchema = z.object({
  type: accessoryTypeSchema,
  quantity: positiveInteger("La cantidad debe ser un entero mayor que cero"),
  k: nonNegativeNumber("El coeficiente K no puede ser negativo"),
})

const accessoriesSchema = z
  .array(pipeAccessorySchema)
  .max(50, "No se pueden agregar más de 50 accesorios")

const commonFields = {
  length: positiveNumber("La longitud debe ser mayor que cero"),
  accessories: accessoriesSchema,
}

const diameterModeSchema = z.object({
  mode: z.literal("diameter"),
  ...commonFields,
  discharge: positiveNumber("El caudal debe ser mayor que cero"),
  headLoss: positiveNumber("La pérdida de carga total debe ser mayor que cero"),
})

const flowModeSchema = z.object({
  mode: z.literal("flow"),
  ...commonFields,
  diameter: positiveNumber("El diámetro debe ser mayor que cero"),
  headLoss: positiveNumber("La pérdida de carga total debe ser mayor que cero"),
})

const lossModeSchema = z.object({
  mode: z.literal("loss"),
  ...commonFields,
  diameter: positiveNumber("El diámetro debe ser mayor que cero"),
  discharge: positiveNumber("El caudal debe ser mayor que cero"),
})

const modeSchema = z.discriminatedUnion("mode", [
  diameterModeSchema,
  flowModeSchema,
  lossModeSchema,
])

const hazenWilliamsSchema = z.object({
  method: z.literal("hazen-williams"),
  hazenC: positiveNumber("El coeficiente C debe ser mayor que cero"),
})

const darcyWeisbachSchema = z.object({
  method: z.literal("darcy-weisbach"),
  roughness: nonNegativeNumber("La rugosidad absoluta no puede ser negativa"),
  viscosity: positiveNumber("La viscosidad cinemática debe ser mayor que cero"),
})

const methodSchema = z.discriminatedUnion("method", [
  hazenWilliamsSchema,
  darcyWeisbachSchema,
])

export const pipeHydraulicsSchema = z.intersection(modeSchema, methodSchema)

export type PipeHydraulicsInput = z.infer<typeof pipeHydraulicsSchema>
export type PipeHydraulicsDiameterInput = z.infer<typeof diameterModeSchema>
export type PipeHydraulicsFlowInput = z.infer<typeof flowModeSchema>
export type PipeHydraulicsLossInput = z.infer<typeof lossModeSchema>
