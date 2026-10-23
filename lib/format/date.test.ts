import { describe, expect, it } from "vitest"

import {
  DATE_DAY_MONTH_OPTIONS,
  DATE_LONG_OPTIONS,
  DATE_SHORT_OPTIONS,
  formatDate,
  parseDateValue,
} from "@/lib/format/date"

describe("parseDateValue", () => {
  it("interpreta una fecha sin hora como fecha local", () => {
    const date = parseDateValue("2026-10-23")

    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(9)
    expect(date?.getDate()).toBe(23)
  })

  it("descarta fechas de calendario imposibles", () => {
    expect(parseDateValue("2026-02-30")).toBeNull()
    expect(parseDateValue("2026-13-01")).toBeNull()
  })

  it("descarta cadenas que no son fechas", () => {
    expect(parseDateValue("")).toBeNull()
    expect(parseDateValue("no-es-fecha")).toBeNull()
  })
})

describe("formatDate", () => {
  it("formatea una fecha sin hora sin desplazar el día", () => {
    expect(formatDate("2026-10-23")).toBe("23 de oct de 2026")
  })

  it("admite el formato largo", () => {
    expect(formatDate("2026-10-23", DATE_LONG_OPTIONS)).toBe(
      "23 de octubre de 2026"
    )
  })

  it("admite día y mes cortos", () => {
    expect(formatDate("2026-10-23", DATE_DAY_MONTH_OPTIONS)).toBe("23 de oct")
  })

  it("respeta la zona horaria al formatear timestamps", () => {
    expect(
      formatDate("2026-10-24T02:00:00Z", {
        ...DATE_SHORT_OPTIONS,
        timeZone: "America/Bogota",
      })
    ).toBe("23 de oct de 2026")
  })

  it("devuelve un guion para valores ausentes o inválidos", () => {
    expect(formatDate(null)).toBe("—")
    expect(formatDate(undefined)).toBe("—")
    expect(formatDate("no-es-fecha")).toBe("—")
  })
})
