import {
  getRebarSize,
  rebarDisplayName,
  type RebarSystem,
} from "@/lib/estructuras/nsr10-rebar"
import type { RebarScheduleInput } from "@/lib/tools/rebar-schedule/schema"

export type RebarRowResult = {
  mark: string
  barId: string
  designation: string
  displayName: string
  system: RebarSystem
  quantity: number
  lengthM: number
  totalLengthM: number
  massKgPerM: number
  weightKg: number
}

export type RebarGroupResult = {
  barId: string
  designation: string
  displayName: string
  system: RebarSystem
  quantity: number
  totalLengthM: number
  weightKg: number
  percentOfWeight: number
}

export type RebarSectionResult = {
  widthMm: number
  effectiveDepthMm: number
  barId: string
  designation: string
  displayName: string
  system: RebarSystem
  barCount: number
  areaPerBarMm2: number
  totalAreaMm2: number
  totalAreaCm2: number
  ratio: number
  ratioPercent: number
}

export type RebarScheduleResult = {
  rows: RebarRowResult[]
  groups: RebarGroupResult[]
  totalBars: number
  totalLengthM: number
  netWeightKg: number
  wastePercent: number
  wasteWeightKg: number
  totalWeightKg: number
  totalWeightT: number
  concreteVolumeM3: number | null
  concreteAreaM2: number | null
  weightPerVolumeKgM3: number | null
  weightPerAreaKgM2: number | null
  section: RebarSectionResult | null
}

function requireRebarSize(barId: string) {
  const size = getRebarSize(barId)

  if (!size) {
    throw new Error(`No se encontró la varilla ${barId}`)
  }

  return size
}

function calculateSection(
  input: RebarScheduleInput
): RebarSectionResult | null {
  if (!input.sectionEnabled) return null

  const size = requireRebarSize(input.sectionBarId)
  const totalAreaMm2 = input.sectionBarCount * size.areaMm2
  const ratio =
    totalAreaMm2 / (input.sectionWidth * input.sectionEffectiveDepth)

  return {
    widthMm: input.sectionWidth,
    effectiveDepthMm: input.sectionEffectiveDepth,
    barId: size.id,
    designation: size.designation,
    displayName: rebarDisplayName(size),
    system: size.system,
    barCount: input.sectionBarCount,
    areaPerBarMm2: size.areaMm2,
    totalAreaMm2,
    totalAreaCm2: totalAreaMm2 / 100,
    ratio,
    ratioPercent: ratio * 100,
  }
}

export function calculateRebarSchedule(
  input: RebarScheduleInput
): RebarScheduleResult {
  const rows: RebarRowResult[] = input.rows.map((row) => {
    const size = requireRebarSize(row.barId)
    const totalLengthM = row.quantity * row.length
    const weightKg = totalLengthM * size.massKgPerM

    return {
      mark: row.mark,
      barId: size.id,
      designation: size.designation,
      displayName: rebarDisplayName(size),
      system: size.system,
      quantity: row.quantity,
      lengthM: row.length,
      totalLengthM,
      massKgPerM: size.massKgPerM,
      weightKg,
    }
  })

  const totalBars = rows.reduce((total, row) => total + row.quantity, 0)
  const totalLengthM = rows.reduce((total, row) => total + row.totalLengthM, 0)
  const netWeightKg = rows.reduce((total, row) => total + row.weightKg, 0)

  const groupMap = new Map<string, RebarGroupResult>()

  for (const row of rows) {
    const existing = groupMap.get(row.barId)

    if (existing) {
      existing.quantity += row.quantity
      existing.totalLengthM += row.totalLengthM
      existing.weightKg += row.weightKg
      continue
    }

    groupMap.set(row.barId, {
      barId: row.barId,
      designation: row.designation,
      displayName: row.displayName,
      system: row.system,
      quantity: row.quantity,
      totalLengthM: row.totalLengthM,
      weightKg: row.weightKg,
      percentOfWeight: 0,
    })
  }

  const groups = Array.from(groupMap.values())

  for (const group of groups) {
    group.percentOfWeight =
      netWeightKg > 0 ? (group.weightKg / netWeightKg) * 100 : 0
  }

  const wasteWeightKg = netWeightKg * (input.wastePercent / 100)
  const totalWeightKg = netWeightKg + wasteWeightKg
  const concreteVolumeM3 = input.concreteVolume ?? null
  const concreteAreaM2 = input.concreteArea ?? null

  return {
    rows,
    groups,
    totalBars,
    totalLengthM,
    netWeightKg,
    wastePercent: input.wastePercent,
    wasteWeightKg,
    totalWeightKg,
    totalWeightT: totalWeightKg / 1000,
    concreteVolumeM3,
    concreteAreaM2,
    weightPerVolumeKgM3:
      concreteVolumeM3 !== null ? totalWeightKg / concreteVolumeM3 : null,
    weightPerAreaKgM2:
      concreteAreaM2 !== null ? totalWeightKg / concreteAreaM2 : null,
    section: calculateSection(input),
  }
}
