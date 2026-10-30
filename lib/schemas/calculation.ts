import { z } from "zod"

export const calculationTitleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede exceder 120 caracteres"),
})

export const calculationFormSchema = calculationTitleSchema.extend({
  project_id: z.uuid("Proyecto inválido").nullable(),
})

export type CalculationTitleValues = z.infer<typeof calculationTitleSchema>
export type CalculationFormValues = z.infer<typeof calculationFormSchema>
