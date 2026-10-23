export const AIU_LABOR_REFERENCES = {
  aiu: "Ley 80 de 1993 — Estatuto General de Contratación de la Administración Pública; Decreto 1082 de 2015 — AIU en la contratación estatal",
  labor:
    "Código Sustantivo del Trabajo — prestaciones sociales; Ley 50 de 1990 — régimen de cesantías",
  socialSecurity: "Ley 100 de 1993 — Sistema de Seguridad Social Integral",
  parafiscales:
    "Ley 21 de 1982 — aportes parafiscales (SENA, ICBF y cajas de compensación familiar)",
  exemptions:
    "Ley 1607 de 2012 — exención de aportes para trabajadores con salario inferior a 10 SMMLV",
  transportAllowance:
    "CST — el auxilio de transporte se incluye en la base de cesantías y prima de servicios",
  vacations: "CST — vacaciones: 15 días hábiles por año",
  risk: "Decreto 1771 de 1994 — tarifas de cotización al sistema general de riesgos laborales",
} as const

export const DEFAULT_AIU_PERCENTAGES = {
  administration: 10,
  contingency: 5,
  profit: 5,
} as const

export const DEFAULT_LABOR_RATES = {
  severance: 8.33,
  severanceInterestAnnual: 12,
  serviceBonus: 8.33,
  vacation: 4.17,
  health: 8.5,
  pension: 12,
  arl: 0.522,
  sena: 2,
  icbf: 3,
  familyCompensation: 4,
} as const

export const ARL_RISK_CLASSES = [
  { id: "I", label: "Clase I — riesgo mínimo", ratePercent: 0.522 },
  { id: "II", label: "Clase II — riesgo bajo", ratePercent: 1.044 },
  { id: "III", label: "Clase III — riesgo medio", ratePercent: 2.436 },
  { id: "IV", label: "Clase IV — riesgo alto", ratePercent: 4.35 },
  { id: "V", label: "Clase V — riesgo máximo", ratePercent: 6.96 },
] as const

export type ArlRiskClass = (typeof ARL_RISK_CLASSES)[number]
export type ArlRiskClassId = ArlRiskClass["id"]
