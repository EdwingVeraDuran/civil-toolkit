import { z } from "zod"

export const calculationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede exceder 120 caracteres"),
  project_id: z.uuid("Proyecto inválido").nullable(),
})

export type CalculationFormValues = z.infer<typeof calculationFormSchema>
