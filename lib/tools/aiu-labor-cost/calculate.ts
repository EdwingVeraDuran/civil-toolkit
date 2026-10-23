import type {
  AiuInput,
  AiuLaborCostInput,
  LaborInput,
} from "@/lib/tools/aiu-labor-cost/schema"

export type AiuResult = {
  directCost: number
  administrationPercent: number
  administrationValue: number
  contingencyPercent: number
  contingencyValue: number
  profitPercent: number
  profitValue: number
  totalPercent: number
  totalValue: number
  totalBudget: number
  aiuShareOfTotalPercent: number
}

export type LaborConceptGroup = "earnings" | "benefits" | "contributions"

export type LaborConcept = {
  key: string
  label: string
  group: LaborConceptGroup
  base: number | null
  percent: number | null
  percentSuffix?: string
  value: number
  note?: string
}

export type LaborResult = {
  monthlySalary: number
  transportAllowance: number
  monthlyHours: number
  benefitsBase: number
  severance: number
  severanceInterest: number
  serviceBonus: number
  vacation: number
  totalBenefits: number
  health: number
  pension: number
  arl: number
  sena: number
  icbf: number
  familyCompensation: number
  totalContributions: number
  monthlyCost: number
  annualCost: number
  dailyCost: number
  hourlyCost: number
  costFactor: number
  benefitsPercentOfSalary: number
  contributionsPercentOfSalary: number
  overheadPercentOfSalary: number
  totalAdditionalCost: number
  totalAdditionalPercentOfSalary: number
  concepts: LaborConcept[]
}

export type AiuLaborCostResult = {
  aiu: AiuResult
  labor: LaborResult
}

export function calculateAiu(input: AiuInput): AiuResult {
  const administrationValue =
    input.directCost * (input.administrationPercent / 100)
  const contingencyValue = input.directCost * (input.contingencyPercent / 100)
  const profitValue = input.directCost * (input.profitPercent / 100)
  const totalValue = administrationValue + contingencyValue + profitValue
  const totalBudget = input.directCost + totalValue

  return {
    directCost: input.directCost,
    administrationPercent: input.administrationPercent,
    administrationValue,
    contingencyPercent: input.contingencyPercent,
    contingencyValue,
    profitPercent: input.profitPercent,
    profitValue,
    totalPercent:
      input.administrationPercent +
      input.contingencyPercent +
      input.profitPercent,
    totalValue,
    totalBudget,
    aiuShareOfTotalPercent:
      totalBudget > 0 ? (totalValue / totalBudget) * 100 : 0,
  }
}

export function calculateLaborCost(input: LaborInput): LaborResult {
  const benefitsBase = input.monthlySalary + input.transportAllowance
  const severance = benefitsBase * (input.severancePercent / 100)
  const severanceInterest =
    (severance * (input.severanceInterestAnnualPercent / 100)) / 12
  const serviceBonus = benefitsBase * (input.serviceBonusPercent / 100)
  const vacation = input.monthlySalary * (input.vacationPercent / 100)
  const totalBenefits = severance + severanceInterest + serviceBonus + vacation

  const health = input.monthlySalary * (input.healthPercent / 100)
  const pension = input.monthlySalary * (input.pensionPercent / 100)
  const arl = input.monthlySalary * (input.arlPercent / 100)
  const sena = input.monthlySalary * (input.senaPercent / 100)
  const icbf = input.monthlySalary * (input.icbfPercent / 100)
  const familyCompensation =
    input.monthlySalary * (input.familyCompensationPercent / 100)
  const totalContributions =
    health + pension + arl + sena + icbf + familyCompensation

  const monthlyCost =
    input.monthlySalary +
    input.transportAllowance +
    totalBenefits +
    totalContributions
  const totalAdditionalCost = monthlyCost - input.monthlySalary

  const concepts: LaborConcept[] = [
    {
      key: "salary",
      label: "Salario mensual",
      group: "earnings",
      base: null,
      percent: null,
      value: input.monthlySalary,
    },
    {
      key: "transport-allowance",
      label: "Auxilio de transporte",
      group: "earnings",
      base: null,
      percent: null,
      value: input.transportAllowance,
      note: "No es salario, pero se incluye en cesantías y prima.",
    },
    {
      key: "severance",
      label: "Cesantías",
      group: "benefits",
      base: benefitsBase,
      percent: input.severancePercent,
      value: severance,
      note: "Base: salario + auxilio de transporte.",
    },
    {
      key: "severance-interest",
      label: "Intereses sobre cesantías",
      group: "benefits",
      base: severance,
      percent: input.severanceInterestAnnualPercent,
      percentSuffix: "anual",
      value: severanceInterest,
      note: "Provisión mensual: cesantías × % anual / 12.",
    },
    {
      key: "service-bonus",
      label: "Prima de servicios",
      group: "benefits",
      base: benefitsBase,
      percent: input.serviceBonusPercent,
      value: serviceBonus,
      note: "Base: salario + auxilio de transporte.",
    },
    {
      key: "vacation",
      label: "Vacaciones",
      group: "benefits",
      base: input.monthlySalary,
      percent: input.vacationPercent,
      value: vacation,
      note: "Base: salario, sin auxilio de transporte.",
    },
    {
      key: "health",
      label: "Salud",
      group: "contributions",
      base: input.monthlySalary,
      percent: input.healthPercent,
      value: health,
      note: "Aporte patronal.",
    },
    {
      key: "pension",
      label: "Pensión",
      group: "contributions",
      base: input.monthlySalary,
      percent: input.pensionPercent,
      value: pension,
      note: "Aporte patronal.",
    },
    {
      key: "arl",
      label: "ARL",
      group: "contributions",
      base: input.monthlySalary,
      percent: input.arlPercent,
      value: arl,
      note: "Depende de la clase de riesgo.",
    },
    {
      key: "sena",
      label: "SENA",
      group: "contributions",
      base: input.monthlySalary,
      percent: input.senaPercent,
      value: sena,
      note: "Parafiscal.",
    },
    {
      key: "icbf",
      label: "ICBF",
      group: "contributions",
      base: input.monthlySalary,
      percent: input.icbfPercent,
      value: icbf,
      note: "Parafiscal.",
    },
    {
      key: "family-compensation",
      label: "Caja de compensación",
      group: "contributions",
      base: input.monthlySalary,
      percent: input.familyCompensationPercent,
      value: familyCompensation,
      note: "Parafiscal.",
    },
  ]

  return {
    monthlySalary: input.monthlySalary,
    transportAllowance: input.transportAllowance,
    monthlyHours: input.monthlyHours,
    benefitsBase,
    severance,
    severanceInterest,
    serviceBonus,
    vacation,
    totalBenefits,
    health,
    pension,
    arl,
    sena,
    icbf,
    familyCompensation,
    totalContributions,
    monthlyCost,
    annualCost: monthlyCost * 12,
    dailyCost: monthlyCost / 30,
    hourlyCost: monthlyCost / input.monthlyHours,
    costFactor: monthlyCost / input.monthlySalary,
    benefitsPercentOfSalary: (totalBenefits / input.monthlySalary) * 100,
    contributionsPercentOfSalary:
      (totalContributions / input.monthlySalary) * 100,
    overheadPercentOfSalary:
      ((totalBenefits + totalContributions) / input.monthlySalary) * 100,
    totalAdditionalCost,
    totalAdditionalPercentOfSalary:
      (totalAdditionalCost / input.monthlySalary) * 100,
    concepts,
  }
}

export function calculateAiuLaborCost(
  input: AiuLaborCostInput
): AiuLaborCostResult {
  return {
    aiu: calculateAiu(input),
    labor: calculateLaborCost(input),
  }
}
