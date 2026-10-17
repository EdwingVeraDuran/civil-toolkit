import { z } from "zod"

import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/types/task"

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(200, "El título no puede exceder 200 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  due_date: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
