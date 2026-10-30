import { describe, expect, it } from "vitest"

import { areaCalculatorSchema } from "@/lib/tools/area-calculator/schema"
import {
  parseSavedInput,
  readSavedRecord,
  readSavedRecordArray,
  readSavedResult,
} from "@/lib/tools/report-data"

describe("parseSavedInput", () => {
  it("acepta un snapshot válido de la herramienta", () => {
    const input = parseSavedInput(areaCalculatorSchema, {
      shape: "rectangle",
      lengthUnit: "m",
      areaUnit: "m2",
      base: 3,
      height: 2,
    })

    expect(input).toMatchObject({ shape: "rectangle", base: 3, height: 2 })
  })

  it("acepta números guardados como texto con coma decimal", () => {
    const input = parseSavedInput(areaCalculatorSchema, {
      shape: "square",
      lengthUnit: "m",
      areaUnit: "m2",
      side: "2,5",
    })

    expect(input).toMatchObject({ shape: "square", side: 2.5 })
  })

  it("devuelve null si el snapshot no cumple el schema", () => {
    const input = parseSavedInput(areaCalculatorSchema, {
      shape: "square",
      lengthUnit: "m",
      areaUnit: "m2",
      side: -1,
    })

    expect(input).toBeNull()
  })
})

describe("readSavedResult", () => {
  it("lee un resultado con las claves numéricas y de texto esperadas", () => {
    const result = readSavedResult<{ area: number; formula: string }>(
      { area: 6, formula: "A = b · h" },
      { numbers: ["area"], strings: ["formula"] }
    )

    expect(result).toEqual({ area: 6, formula: "A = b · h" })
  })

  it("rechaza resultados con valores no finitos o claves faltantes", () => {
    expect(
      readSavedResult({ area: Number.NaN }, { numbers: ["area"] })
    ).toBeNull()
    expect(readSavedResult({ area: 6 }, { strings: ["formula"] })).toBeNull()
    expect(readSavedResult(null, { numbers: ["area"] })).toBeNull()
  })
})

describe("readSavedRecord", () => {
  it("valida registros anidados", () => {
    const regression = readSavedRecord<{ rSquared: number }>(
      { rSquared: 0.98 },
      { numbers: ["rSquared"] }
    )

    expect(regression).toEqual({ rSquared: 0.98 })
  })
})

describe("readSavedRecordArray", () => {
  it("valida cada elemento del arreglo", () => {
    const points = readSavedRecordArray<{ blows: number; moisture: number }>(
      [
        { blows: 10, moisture: 40 },
        { blows: 25, moisture: 32 },
      ],
      { numbers: ["blows", "moisture"] }
    )

    expect(points).toHaveLength(2)
  })

  it("rechaza arreglos con elementos inválidos", () => {
    const points = readSavedRecordArray([{ blows: 10, moisture: "40" }], {
      numbers: ["blows", "moisture"],
    })

    expect(points).toBeNull()
  })
})
