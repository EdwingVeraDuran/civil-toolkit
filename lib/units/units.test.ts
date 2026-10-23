import { describe, expect, it } from "vitest"

import { getUnit, isUnitId } from "@/lib/units/units"

describe("búsqueda de unidades", () => {
  it("acepta solo identificadores propios de la tabla", () => {
    expect(isUnitId("m")).toBe(true)
    expect(isUnitId("toString")).toBe(false)
    expect(isUnitId("constructor")).toBe(false)
    expect(isUnitId("__proto__")).toBe(false)
  })

  it("no devuelve propiedades heredadas de Object", () => {
    expect(getUnit("toString")).toBeUndefined()
    expect(getUnit("constructor")).toBeUndefined()
    expect(getUnit("m")?.symbol).toBe("m")
  })
})
