import { describe, expect, it } from "vitest"

import {
  buildReportEntries,
  formatReportCompactValue,
  formatReportNumber,
  formatReportScalar,
  getReportTableColumns,
  getReportWarnings,
  humanizeReportKey,
} from "@/lib/calculations/report"

describe("humanizeReportKey", () => {
  it("usa etiquetas conocidas en español", () => {
    expect(humanizeReportKey("elementType")).toBe("Tipo de elemento")
    expect(humanizeReportKey("hMinExact")).toBe("h mín. exacta")
    expect(humanizeReportKey("areaUnit")).toBe("Unidad de área")
  })

  it("convierte claves camelCase desconocidas", () => {
    expect(humanizeReportKey("someNewKey")).toBe("Some new key")
    expect(humanizeReportKey("future_value")).toBe("Future value")
  })
})

describe("formatReportNumber", () => {
  it("formatea con separadores de es-CO", () => {
    expect(formatReportNumber(1234.5)).toBe("1.234,5")
    expect(formatReportNumber(0.000001)).toBe("0,000001")
    expect(formatReportNumber(0.0000001)).toBe("0,0000001")
    expect(formatReportNumber(1.23456789)).toBe("1,2345679")
  })

  it("usa un guion para valores no finitos", () => {
    expect(formatReportNumber(Number.NaN)).toBe("—")
    expect(formatReportNumber(Number.POSITIVE_INFINITY)).toBe("—")
  })
})

describe("formatReportScalar", () => {
  it("formatea booleanos, nulos y texto vacío", () => {
    expect(formatReportScalar(true)).toBe("Sí")
    expect(formatReportScalar(false)).toBe("No")
    expect(formatReportScalar(null)).toBe("—")
    expect(formatReportScalar("   ")).toBe("—")
  })

  it("traduce valores de dominio conocidos sin alterar otros textos", () => {
    expect(formatReportScalar("viga")).toBe("Viga")
    expect(formatReportScalar("m2")).toBe("m²")
    expect(formatReportScalar("Texto libre")).toBe("Texto libre")
  })
})

describe("formatReportCompactValue", () => {
  it("resume arreglos y objetos para celdas de tabla", () => {
    expect(formatReportCompactValue([1, true, "m2"])).toBe("1, Sí, m²")
    expect(formatReportCompactValue([{ a: 1 }, { b: 2 }])).toBe("2 elementos")
    expect(formatReportCompactValue({ h: 350, b: 200 })).toBe("h: 350; b: 200")
  })
})

describe("buildReportEntries", () => {
  it("excluye claves y ordena por etiqueta", () => {
    const entries = buildReportEntries(
      { zeta: 1, warnings: ["revisar"], alpha: 2 },
      ["warnings"]
    )

    expect(entries.map((entry) => entry.key)).toEqual(["alpha", "zeta"])
    expect(entries.map((entry) => entry.label)).toEqual(["Alpha", "Zeta"])
  })

  it("tolera datos ausentes", () => {
    expect(buildReportEntries(null)).toEqual([])
    expect(buildReportEntries(undefined)).toEqual([])
  })
})

describe("getReportWarnings", () => {
  it("conserva solo advertencias de texto no vacío", () => {
    expect(
      getReportWarnings({
        warnings: ["Revisar deflexión", 42, "", "  ", "Otra"],
      })
    ).toEqual(["Revisar deflexión", "Otra"])
  })

  it("devuelve un arreglo vacío si no hay advertencias válidas", () => {
    expect(getReportWarnings({ warnings: "no es arreglo" })).toEqual([])
    expect(getReportWarnings(null)).toEqual([])
  })
})

describe("getReportTableColumns", () => {
  it("une las columnas de todas las filas y las ordena", () => {
    expect(
      getReportTableColumns([
        { zeta: 1, alpha: 2 },
        { mu: 3, alpha: 4 },
      ])
    ).toEqual(["alpha", "mu", "zeta"])
  })
})
