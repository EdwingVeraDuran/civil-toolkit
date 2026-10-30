import { describe, expect, it } from "vitest"

import {
  calculationFormSchema,
  calculationTitleSchema,
} from "@/lib/schemas/calculation"

describe("calculationTitleSchema", () => {
  it("recorta el nombre antes de guardarlo", () => {
    const result = calculationTitleSchema.safeParse({
      title: "  Viga de 6 m  ",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("Viga de 6 m")
    }
  })

  it("rechaza un nombre vacío", () => {
    const result = calculationTitleSchema.safeParse({ title: "   " })

    expect(result.success).toBe(false)
  })

  it("rechaza un nombre de más de 120 caracteres", () => {
    const result = calculationTitleSchema.safeParse({
      title: "a".repeat(121),
    })

    expect(result.success).toBe(false)
  })
})

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
