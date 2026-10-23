import { describe, expect, it } from "vitest"

import { parseNumericInput } from "@/lib/tools/parse-numeric"

describe("parseNumericInput", () => {
  it("acepta coma decimal", () => {
    expect(parseNumericInput("1,5")).toBe(1.5)
    expect(parseNumericInput("-1,5")).toBe(-1.5)
  })

  it("acepta punto de miles y coma decimal", () => {
    expect(parseNumericInput("1.234,56")).toBe(1234.56)
  })

  it("acepta coma de miles y punto decimal", () => {
    expect(parseNumericInput("1,234.56")).toBe(1234.56)
  })

  it("elimina espacios de agrupación", () => {
    expect(parseNumericInput("1 234,56")).toBe(1234.56)
  })

  it("elimina varios separadores de miles", () => {
    expect(parseNumericInput("1.234.567,89")).toBe(1234567.89)
    expect(parseNumericInput("1,234,567.89")).toBe(1234567.89)
  })

  it("devuelve undefined para entradas vacías", () => {
    expect(parseNumericInput("")).toBeUndefined()
    expect(parseNumericInput("   ")).toBeUndefined()
  })

  it("conserva entradas inválidas para que Zod reporte el error", () => {
    expect(parseNumericInput("abc")).toBe("abc")
  })

  it("deja intactos los valores que no son cadenas", () => {
    expect(parseNumericInput(12)).toBe(12)
    expect(parseNumericInput(undefined)).toBeUndefined()
  })
})
