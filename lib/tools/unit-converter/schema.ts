import { z } from "zod"
import { getUnit, isUnitId } from "@/lib/units/units"
import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const unitConversionSchema = z
  .object({
    value: z.preprocess(
      parseNumericInput,
      z.number("Ingresa un número válido").finite("Ingresa un número válido"),
    ),
    fromUnitId: z.string().refine(isUnitId, "Unidad de origen inválida"),
    toUnitId: z.string().refine(isUnitId, "Unidad de destino inválida"),
  })
  .refine(
    (data) => {
      const from = getUnit(data.fromUnitId)
      const to = getUnit(data.toUnitId)
      return from !== undefined && to !== undefined && from.dimension === to.dimension
    },
    { message: "Las unidades deben pertenecer a la misma dimensión", path: ["toUnitId"] },
  )

export type UnitConversionInput = z.infer<typeof unitConversionSchema>
