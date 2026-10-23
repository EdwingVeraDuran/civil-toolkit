import { LOCALE } from "@/lib/config/locale"

const REPORT_KEY_LABELS: Record<string, string> = {
  // Comunes
  mode: "Modo",
  unit: "Unidad",
  value: "Valor",
  shape: "Figura",
  side: "Lado",
  sides: "Número de lados",
  base: "Base",
  height: "Altura",
  circleMeasure: "Medida del círculo",
  circleSize: "Radio o diámetro",
  baseMajor: "Base mayor",
  baseMinor: "Base menor",
  diagonalMajor: "Diagonal mayor",
  diagonalMinor: "Diagonal menor",
  lengthUnit: "Unidad de longitud",
  areaUnit: "Unidad de área",
  runUnit: "Unidad de distancia",
  riseUnit: "Unidad de desnivel",
  elevationUnit: "Unidad de cota",
  fromUnitId: "Unidad de origen",
  toUnitId: "Unidad de destino",
  // Predimensionado de vigas
  elementType: "Tipo de elemento",
  supportCondition: "Condición de apoyo",
  capacity: "Capacidad de disipación",
  span: "Luz",
  fy: "fy",
  lightweight: "Concreto liviano",
  concreteDensity: "Densidad del concreto",
  fragilePartitions: "Tabiques frágiles",
  // Combinaciones de carga
  deadLoad: "Carga muerta",
  liveLoad: "Carga viva",
  windLoad: "Carga de viento",
  seismicLoad: "Carga sísmica",
  dead: "Muerta",
  live: "Viva",
  wind: "Viento",
  seismic: "Sismo",
  useHalfLive: "Usar 0,5 L",
  windWithoutDirectionalFactor: "Viento sin factor direccional",
  seismicAtServiceLevel: "Sismo a nivel de servicio",
  code: "Código",
  variantLabel: "Variante",
  officialEquation: "Ecuación oficial",
  citation: "Cita normativa",
  reference: "Referencia",
  // AIU y prestaciones
  directCost: "Costo directo",
  administrationPercent: "Administración (%)",
  contingencyPercent: "Imprevistos (%)",
  profitPercent: "Utilidad (%)",
  monthlySalary: "Salario mensual",
  transportAllowance: "Auxilio de transporte",
  monthlyHours: "Horas mensuales",
  severancePercent: "Cesantías (%)",
  severanceInterestAnnualPercent: "Intereses de cesantías (% anual)",
  serviceBonusPercent: "Prima de servicios (%)",
  vacationPercent: "Vacaciones (%)",
  healthPercent: "Salud (%)",
  pensionPercent: "Pensión (%)",
  arlPercent: "ARL (%)",
  senaPercent: "SENA (%)",
  icbfPercent: "ICBF (%)",
  familyCompensationPercent: "Caja de compensación (%)",
  // Límites de Atterberg
  liquidLimitPoints: "Puntos del límite líquido",
  plasticLimitValues: "Determinaciones del límite plástico",
  blows: "Golpes",
  moisture: "Humedad (%)",
  // Interpolación
  direction: "Dirección",
  first: "Primer punto",
  second: "Segundo punto",
  target: "Valor objetivo",
  targetX: "X objetivo",
  targetY: "Y objetivo",
  x1: "x₁",
  y1: "y₁",
  x2: "x₂",
  y2: "y₂",
  z11: "z₁₁",
  z12: "z₁₂",
  z21: "z₂₁",
  z22: "z₂₂",
  context: "Contexto",
  field: "Campo",
  variable: "Variable",
  // Canales abiertos
  geometry: "Geometría",
  section: "Sección",
  bottomWidth: "Ancho de fondo",
  sideSlope: "Talud lateral",
  diameter: "Diámetro",
  slope: "Pendiente",
  manning: "Coeficiente de Manning",
  discharge: "Caudal",
  depth: "Profundidad",
  // Tuberías
  length: "Longitud",
  accessories: "Accesorios",
  type: "Tipo",
  quantity: "Cantidad",
  k: "Coeficiente K",
  method: "Método",
  hazenC: "Coeficiente C",
  roughness: "Rugosidad absoluta",
  viscosity: "Viscosidad cinemática",
  headLoss: "Pérdida de carga",
  flow: "Caudal",
  loss: "Pérdida",
  // Despiece de acero
  rows: "Filas",
  mark: "Marca",
  barId: "Varilla",
  wastePercent: "Desperdicio (%)",
  concreteVolume: "Volumen de concreto",
  concreteArea: "Área de concreto",
  sectionEnabled: "Verificar sección",
  sectionWidth: "Ancho de sección",
  sectionEffectiveDepth: "Peralte efectivo",
  sectionBarId: "Varilla de sección",
  sectionBarCount: "Cantidad de varillas",
  // Pendientes
  run: "Distancia horizontal",
  rise: "Desnivel",
  slopeValue: "Pendiente",
  slopeFormat: "Formato de pendiente",
  startElevation: "Cota inicial",
  endElevation: "Cota final",
  // Suelos
  specificGravity: "Gravedad específica",
  waterUnitWeight: "Peso unitario del agua",
  voidRatio: "Relación de vacíos",
  waterContent: "Contenido de agua (%)",
  porosity: "Porosidad (%)",
  saturation: "Grado de saturación (%)",
  unitWeight: "Peso unitario",
  saturatedUnitWeight: "Peso unitario saturado",
  // Resultados frecuentes
  area: "Área",
  perimeter: "Perímetro",
  vertexCount: "Número de vértices",
  signedAreaM2: "Área firmada (m²)",
  areaM2: "Área (m²)",
  perimeterM: "Perímetro (m)",
  areaUnitId: "Unidad de área",
  lengthUnitId: "Unidad de longitud",
  orientation: "Orientación",
  formula: "Fórmula",
  h: "h",
  b: "b",
  hMinExact: "h mín. exacta",
  bMin: "b mín.",
  bMinReference: "Referencia de b mín.",
  usedRecommendedTable: "Usó tabla recomendada",
  factor: "Factor",
  warnings: "Advertencias",
  maximum: "Máximo",
  minimum: "Mínimo",
  combinations: "Combinaciones",
  equation: "Ecuación",
  factors: "Factores",
  termOrder: "Orden de términos",
  label: "Etiqueta",
  totalLengthM: "Longitud total (m)",
  totalWeightKg: "Peso total (kg)",
  totalBars: "Total de barras",
  weightPerVolumeKgM3: "Cuantía (kg/m³)",
  barWeightKgM: "Peso por metro (kg/m)",
  barAreaMm2: "Área de la varilla (mm²)",
  steelAreaMm2: "Área de acero (mm²)",
  providedAreaMm2: "Área provista (mm²)",
  requiredAreaMm2: "Área requerida (mm²)",
  ratio: "Relación",
  depthM: "Profundidad (m)",
  velocityMs: "Velocidad (m/s)",
  froude: "Número de Froude",
  hydraulicRadiusM: "Radio hidráulico (m)",
  wettedAreaM2: "Área mojada (m²)",
  wettedPerimeterM: "Perímetro mojado (m)",
  topWidthM: "Ancho superficial (m)",
  flowRegime: "Régimen de flujo",
  equivalentLengthM: "Longitud equivalente (m)",
  frictionLossM: "Pérdida por fricción (m)",
  localLossM: "Pérdida local (m)",
  totalLossM: "Pérdida total (m)",
  velocity: "Velocidad",
  reynolds: "Número de Reynolds",
  frictionFactor: "Factor de fricción",
  liquidLimit: "Límite líquido",
  plasticLimit: "Límite plástico",
  plasticityIndex: "Índice de plasticidad",
  classification: "Clasificación",
  nonPlastic: "No plástico",
  azimuth: "Azimut",
  bearing: "Rumbo",
  areaHa: "Área (ha)",
  areaFt2: "Área (ft²)",
  dryUnitWeight: "Peso unitario seco",
  buoyantUnitWeight: "Peso unitario sumergido",
  aiuTotal: "Total AIU",
  total: "Total",
  subtotal: "Subtotal",
}

const REPORT_ACRONYMS = new Set([
  "aiu",
  "arl",
  "des",
  "dmi",
  "dmo",
  "icbf",
  "id",
  "ip",
  "kg",
  "kn",
  "ll",
  "lp",
  "m2",
  "m3",
  "mpa",
  "nsr",
  "r2",
  "sena",
  "spt",
])

const REPORT_VALUE_LABELS: Record<string, string> = {
  // Figuras y secciones
  square: "Cuadrado",
  rectangle: "Rectángulo",
  triangle: "Triángulo",
  circle: "Círculo",
  trapezoid: "Trapecio",
  parallelogram: "Paralelogramo",
  rhombus: "Rombo",
  "regular-polygon": "Polígono regular",
  rectangular: "Rectangular",
  trapezoidal: "Trapezoidal",
  triangular: "Triangular",
  circular: "Circular",
  // Vigas
  viga: "Viga",
  losa: "Losa",
  simple: "Simple",
  "un-extremo-continuo": "Un extremo continuo",
  "ambos-extremos-continuos": "Ambos extremos continuos",
  voladizo: "Voladizo",
  // Cargas
  dead: "Muerta",
  live: "Viva",
  wind: "Viento",
  seismic: "Sismo",
  // Formatos y métodos
  linear: "Lineal",
  double: "Doble",
  decimal: "Decimal",
  dms: "Grados, minutos y segundos",
  "hazen-williams": "Hazen-Williams",
  "darcy-weisbach": "Darcy-Weisbach",
  ascending: "Ascendente",
  descending: "Descendente",
  clockwise: "Horario",
  counterclockwise: "Antihorario",
  // Unidades
  m: "m",
  cm: "cm",
  mm: "mm",
  km: "km",
  in: "in",
  ft: "ft",
  m2: "m²",
  cm2: "cm²",
  mm2: "mm²",
  ft2: "ft²",
  ha: "ha",
  m3: "m³",
  l: "L",
  kg: "kg",
  g: "g",
  lb: "lb",
  kn: "kN",
  n: "N",
  kgf: "kgf",
  knm: "kN·m",
  knm2: "kN/m²",
  mpa: "MPa",
  kpa: "kPa",
  pa: "Pa",
  psi: "psi",
  deg: "°",
  rad: "rad",
  "m/s": "m/s",
  "kn/m3": "kN/m³",
  "kg/m3": "kg/m³",
}

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase(LOCALE) + value.slice(1)
}

export function humanizeReportKey(key: string): string {
  const mapped = REPORT_KEY_LABELS[key]
  if (mapped) return mapped

  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return key

  return words
    .map((word) => {
      const lower = word.toLocaleLowerCase(LOCALE)
      return REPORT_ACRONYMS.has(lower)
        ? lower.toLocaleUpperCase(LOCALE)
        : lower
    })
    .map((word, index) => (index === 0 ? capitalize(word) : word))
    .join(" ")
}

export function formatReportNumber(value: number): string {
  if (!Number.isFinite(value)) return "—"

  return value.toLocaleString(LOCALE, {
    maximumSignificantDigits: 8,
  })
}

export function formatReportScalar(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (typeof value === "number") return formatReportNumber(value)
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return "—"
    return REPORT_VALUE_LABELS[trimmed] ?? trimmed
  }

  return String(value)
}

export function isReportRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export type ReportEntry = {
  key: string
  label: string
  value: unknown
}

export function buildReportEntries(
  data: Record<string, unknown> | null | undefined,
  excludedKeys: readonly string[] = []
): ReportEntry[] {
  if (!data) return []

  const excluded = new Set(excludedKeys)

  return Object.entries(data)
    .filter(([key]) => !excluded.has(key))
    .map(([key, value]) => ({
      key,
      label: humanizeReportKey(key),
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, LOCALE))
}

export function getReportWarnings(
  result: Record<string, unknown> | null | undefined
): string[] {
  if (!result || !Array.isArray(result.warnings)) return []

  return result.warnings.filter(
    (warning): warning is string =>
      typeof warning === "string" && warning.trim().length > 0
  )
}

export function getReportTableColumns(
  rows: Record<string, unknown>[]
): string[] {
  const columns: string[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue
      seen.add(key)
      columns.push(key)
    }
  }

  return columns.sort((a, b) =>
    humanizeReportKey(a).localeCompare(humanizeReportKey(b), LOCALE)
  )
}

export function formatReportCompactValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "—"

    if (value.every((item) => !isReportRecord(item) && !Array.isArray(item))) {
      return value.map((item) => formatReportScalar(item)).join(", ")
    }

    return `${value.length} elemento${value.length === 1 ? "" : "s"}`
  }

  if (isReportRecord(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) return "—"

    return entries
      .map(
        ([key, nested]) =>
          `${humanizeReportKey(key)}: ${formatReportCompactValue(nested)}`
      )
      .join("; ")
  }

  return formatReportScalar(value)
}
