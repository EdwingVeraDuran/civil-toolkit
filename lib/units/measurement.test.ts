import { describe, expect, it } from "vitest"

import { Measurement } from "@/lib/units/measurement"

describe("Measurement", () => {
  it("convierte entre unidades de la misma dimensión", () => {
    const length = Measurement.from(1, "m")
    expect(length.to("ft").value).toBeCloseTo(3.280839895, 6)
    expect(length.to("cm").value).toBeCloseTo(100, 6)
  })

  it("usa el sistema internacional como base", () => {
    expect(Measurement.from(1, "km").toBase()).toBeCloseTo(1000, 6)
    expect(Measurement.from(1, "cm").toBase()).toBeCloseTo(0.01, 6)
  })

  it("respeta el offset de la temperatura", () => {
    expect(Measurement.from(100, "c").to("f").value).toBeCloseTo(212, 6)
    expect(Measurement.from(0, "c").to("k").value).toBeCloseTo(273.15, 6)
    expect(Measurement.from(32, "f").to("c").value).toBeCloseTo(0, 6)
  })

  it("lanza un error al convertir dimensiones distintas", () => {
    expect(() => Measurement.from(1, "m").to("kg")).toThrow()
  })

  it("lanza un error al construir con un valor no finito", () => {
    expect(() => Measurement.from(Number.NaN, "m")).toThrow()
    expect(() => Measurement.from(Number.POSITIVE_INFINITY, "m")).toThrow()
  })

  it("compara medidas equivalentes", () => {
    expect(Measurement.from(1, "m").equals(Measurement.from(100, "cm"))).toBe(true)
    expect(Measurement.from(1, "m").equals(Measurement.from(1, "ft"))).toBe(false)
  })

  it("serializa y reconstruye", () => {
    const original = Measurement.from(2.5, "mpa")
    const restored = Measurement.fromJSON(original.toJSON())
    expect(restored.value).toBe(original.value)
    expect(restored.unit.id).toBe(original.unit.id)
  })

  it("suma y resta convirtiendo a la unidad base de la medida", () => {
    const total = Measurement.from(1, "m").add(Measurement.from(50, "cm"))
    expect(total.value).toBeCloseTo(1.5, 6)
    expect(total.unit.id).toBe("m")
  })
})
