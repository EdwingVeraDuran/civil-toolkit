import { z } from "zod"

import { PROJECT_STATUSES } from "@/lib/types/project"

export const projectFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    client_name: z
      .string()
      .min(1, "El nombre del cliente es obligatorio")
      .max(100, "El nombre del cliente no puede exceder 100 caracteres"),
    description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
    location: z.string().max(200, "La ubicación no puede exceder 200 caracteres").optional(),
    status: z.enum(PROJECT_STATUSES),
    start_date: z.string().optional(),
    estimated_end_date: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.estimated_end_date) return true
      return data.estimated_end_date >= data.start_date
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["estimated_end_date"],
    }
  )

export type ProjectFormValues = z.infer<typeof projectFormSchema>
