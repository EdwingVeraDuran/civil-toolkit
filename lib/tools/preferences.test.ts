import { describe, expect, it } from "vitest"

import {
  MAX_RECENT_TOOLS,
  parseToolPreferences,
  pushRecentId,
  toggleFavoriteId,
} from "@/lib/tools/preferences"

const validIds = ["unit-converter", "beam-sizing"]

describe("parseToolPreferences", () => {
  it("devuelve preferencias vacías si no hay datos o el JSON es inválido", () => {
    expect(parseToolPreferences(null, validIds)).toEqual({
      favorites: [],
      recents: [],
    })
    expect(parseToolPreferences("{no-es-json", validIds)).toEqual({
      favorites: [],
      recents: [],
    })
  })

  it("descarta ids desconocidos, valores no string y duplicados", () => {
    const raw = JSON.stringify({
      favorites: ["beam-sizing", "beam-sizing", "desconocida", 42],
      recents: ["unit-converter", "desconocida", "unit-converter"],
    })

    expect(parseToolPreferences(raw, validIds)).toEqual({
      favorites: ["beam-sizing"],
      recents: ["unit-converter"],
    })
  })

  it("limita los recientes al máximo permitido", () => {
    const manyIds = Array.from(
      { length: MAX_RECENT_TOOLS + 2 },
      (_, index) => `tool-${index}`
    )
    const raw = JSON.stringify({
      favorites: [],
      recents: manyIds,
    })

    expect(parseToolPreferences(raw, manyIds).recents).toEqual(
      manyIds.slice(0, MAX_RECENT_TOOLS)
    )
  })
})

describe("toggleFavoriteId", () => {
  it("agrega el favorito al inicio", () => {
    expect(toggleFavoriteId(["beam-sizing"], "unit-converter")).toEqual([
      "unit-converter",
      "beam-sizing",
    ])
  })

  it("quita el favorito cuando ya existe", () => {
    expect(
      toggleFavoriteId(["unit-converter", "beam-sizing"], "unit-converter")
    ).toEqual(["beam-sizing"])
  })
})

describe("pushRecentId", () => {
  it("mueve al inicio el id repetido sin duplicarlo", () => {
    expect(
      pushRecentId(["beam-sizing", "unit-converter"], "unit-converter")
    ).toEqual(["unit-converter", "beam-sizing"])
  })

  it("respeta el límite de recientes", () => {
    const recents = ["a", "b", "c", "d", "e", "f"]

    expect(pushRecentId(recents, "g", 6)).toEqual([
      "g",
      "a",
      "b",
      "c",
      "d",
      "e",
    ])
  })
})
