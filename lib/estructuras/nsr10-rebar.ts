export const REBAR_REFERENCES = {
  metricTable:
    "NSR-10, C.3.5.3 — Tabla C.3.5.3-1 (diámetros basados en milímetros)",
  imperialTable:
    "NSR-10, C.3.5.3 — Tabla C.3.5.3-2 (diámetros basados en octavos de pulgada)",
  ntc2289:
    "NTC 2289 — Barras corrugadas y lisas de acero de baja aleación para refuerzo de concreto",
  sectionRatio: "NSR-10, C.2.1 — ρ = As/(bd)",
  minFlexuralReinforcement:
    "NSR-10, C.10.5 — Refuerzo mínimo en elementos sometidos a flexión",
  seismicDetailing:
    "NSR-10, C.21 — Requisitos especiales para sistemas sismorresistentes",
  hooks: "NSR-10, C.7.1 — Ganchos estándar",
  development: "NSR-10, C.12 — Longitud de desarrollo y traslapos del refuerzo",
} as const

export const REBAR_SYSTEMS = ["metric", "imperial"] as const

export type RebarSystem = (typeof REBAR_SYSTEMS)[number]

export const REBAR_SYSTEM_LABELS: Record<RebarSystem, string> = {
  metric: "Métrico (M)",
  imperial: "Pulgadas (No.)",
}

export type RebarSize = {
  id: string
  system: RebarSystem
  designation: string
  referenceInches?: string
  diameterMm: number
  areaMm2: number
  perimeterMm: number
  massKgPerM: number
}

export const REBAR_SIZES: RebarSize[] = [
  {
    id: "6M",
    system: "metric",
    designation: "6M",
    diameterMm: 6,
    areaMm2: 28.3,
    perimeterMm: 18.85,
    massKgPerM: 0.222,
  },
  {
    id: "8M",
    system: "metric",
    designation: "8M",
    diameterMm: 8,
    areaMm2: 50.3,
    perimeterMm: 25.14,
    massKgPerM: 0.394,
  },
  {
    id: "10M",
    system: "metric",
    designation: "10M",
    diameterMm: 10,
    areaMm2: 78.5,
    perimeterMm: 31.42,
    massKgPerM: 0.616,
  },
  {
    id: "12M",
    system: "metric",
    designation: "12M",
    diameterMm: 12,
    areaMm2: 113.1,
    perimeterMm: 37.7,
    massKgPerM: 0.887,
  },
  {
    id: "16M",
    system: "metric",
    designation: "16M",
    diameterMm: 16,
    areaMm2: 201.1,
    perimeterMm: 50.27,
    massKgPerM: 1.577,
  },
  {
    id: "18M",
    system: "metric",
    designation: "18M",
    diameterMm: 18,
    areaMm2: 254.5,
    perimeterMm: 56.55,
    massKgPerM: 1.996,
  },
  {
    id: "20M",
    system: "metric",
    designation: "20M",
    diameterMm: 20,
    areaMm2: 314.2,
    perimeterMm: 62.83,
    massKgPerM: 2.465,
  },
  {
    id: "22M",
    system: "metric",
    designation: "22M",
    diameterMm: 22,
    areaMm2: 380.1,
    perimeterMm: 69.12,
    massKgPerM: 2.982,
  },
  {
    id: "25M",
    system: "metric",
    designation: "25M",
    diameterMm: 25,
    areaMm2: 490.9,
    perimeterMm: 78.54,
    massKgPerM: 3.851,
  },
  {
    id: "30M",
    system: "metric",
    designation: "30M",
    diameterMm: 30,
    areaMm2: 706.9,
    perimeterMm: 94.25,
    massKgPerM: 5.544,
  },
  {
    id: "32M",
    system: "metric",
    designation: "32M",
    diameterMm: 32,
    areaMm2: 804.2,
    perimeterMm: 100.53,
    massKgPerM: 6.309,
  },
  {
    id: "36M",
    system: "metric",
    designation: "36M",
    diameterMm: 36,
    areaMm2: 1017.9,
    perimeterMm: 113.1,
    massKgPerM: 7.985,
  },
  {
    id: "45M",
    system: "metric",
    designation: "45M",
    diameterMm: 45,
    areaMm2: 1590.4,
    perimeterMm: 141.37,
    massKgPerM: 12.477,
  },
  {
    id: "55M",
    system: "metric",
    designation: "55M",
    diameterMm: 55,
    areaMm2: 2375.8,
    perimeterMm: 172.79,
    massKgPerM: 18.638,
  },
  {
    id: "no-2",
    system: "imperial",
    designation: "No. 2",
    referenceInches: '1/4"',
    diameterMm: 6.4,
    areaMm2: 32,
    perimeterMm: 20,
    massKgPerM: 0.25,
  },
  {
    id: "no-3",
    system: "imperial",
    designation: "No. 3",
    referenceInches: '3/8"',
    diameterMm: 9.5,
    areaMm2: 71,
    perimeterMm: 30,
    massKgPerM: 0.56,
  },
  {
    id: "no-4",
    system: "imperial",
    designation: "No. 4",
    referenceInches: '1/2"',
    diameterMm: 12.7,
    areaMm2: 129,
    perimeterMm: 40,
    massKgPerM: 0.994,
  },
  {
    id: "no-5",
    system: "imperial",
    designation: "No. 5",
    referenceInches: '5/8"',
    diameterMm: 15.9,
    areaMm2: 199,
    perimeterMm: 50,
    massKgPerM: 1.552,
  },
  {
    id: "no-6",
    system: "imperial",
    designation: "No. 6",
    referenceInches: '3/4"',
    diameterMm: 19.1,
    areaMm2: 284,
    perimeterMm: 60,
    massKgPerM: 2.235,
  },
  {
    id: "no-7",
    system: "imperial",
    designation: "No. 7",
    referenceInches: '7/8"',
    diameterMm: 22.2,
    areaMm2: 387,
    perimeterMm: 70,
    massKgPerM: 3.042,
  },
  {
    id: "no-8",
    system: "imperial",
    designation: "No. 8",
    referenceInches: '1"',
    diameterMm: 25.4,
    areaMm2: 510,
    perimeterMm: 80,
    massKgPerM: 3.973,
  },
  {
    id: "no-9",
    system: "imperial",
    designation: "No. 9",
    referenceInches: '1-1/8"',
    diameterMm: 28.7,
    areaMm2: 645,
    perimeterMm: 90,
    massKgPerM: 5.06,
  },
  {
    id: "no-10",
    system: "imperial",
    designation: "No. 10",
    referenceInches: '1-1/4"',
    diameterMm: 32.3,
    areaMm2: 819,
    perimeterMm: 101.3,
    massKgPerM: 6.404,
  },
  {
    id: "no-11",
    system: "imperial",
    designation: "No. 11",
    referenceInches: '1-3/8"',
    diameterMm: 35.8,
    areaMm2: 1006,
    perimeterMm: 112.5,
    massKgPerM: 7.907,
  },
  {
    id: "no-14",
    system: "imperial",
    designation: "No. 14",
    referenceInches: '1-3/4"',
    diameterMm: 43,
    areaMm2: 1452,
    perimeterMm: 135.1,
    massKgPerM: 11.38,
  },
  {
    id: "no-18",
    system: "imperial",
    designation: "No. 18",
    referenceInches: '2-1/4"',
    diameterMm: 57.3,
    areaMm2: 2581,
    perimeterMm: 180.1,
    massKgPerM: 20.24,
  },
]

export const REBAR_BY_ID = new Map(REBAR_SIZES.map((size) => [size.id, size]))

export const REBAR_SIZES_BY_SYSTEM: Record<RebarSystem, RebarSize[]> = {
  metric: REBAR_SIZES.filter((size) => size.system === "metric"),
  imperial: REBAR_SIZES.filter((size) => size.system === "imperial"),
}

export function getRebarSize(id: string): RebarSize | undefined {
  return REBAR_BY_ID.get(id)
}

export function isRebarId(value: unknown): value is string {
  return typeof value === "string" && REBAR_BY_ID.has(value)
}

export function rebarDisplayName(size: RebarSize): string {
  return size.referenceInches
    ? `${size.designation} (${size.referenceInches})`
    : size.designation
}

export function metersPerTon(size: RebarSize): number {
  return 1000 / size.massKgPerM
}
