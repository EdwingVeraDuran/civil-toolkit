import { describe, expect, it } from "vitest"

import { calculationFormSchema } from "@/lib/schemas/calculation"

describe("calculationFormSchema", () => {
  it("acepta un título y un proyecto nulo", () => {
    const result = calculationFormSchema.safeParse({
      title: "Viga de 6 m",
      project_id: null,
    })

    expect(result.success).toBe(true)
  })

  it("acepta un project_id con formato UUID", () => {
    const result = calculationFormSchema.safeParse({
      title: "Viga de 6 m",
      project_id: "6f1c1f0a-2a4f-4f3e-9d5b-1c2d3e4f5a6b",
    })

    expect(result.success).toBe(true)
  })

  it("rechaza un título vacío", () => {
    const result = calculationFormSchema.safeParse({
      title: "   ",
      project_id: null,
    })

    expect(result.success).toBe(false)
  })

  it("rechaza un project_id que no es UUID", () => {
    const result = calculationFormSchema.safeParse({
      title: "Viga de 6 m",
      project_id: "proyecto-1",
    })

    expect(result.success).toBe(false)
  })
})
