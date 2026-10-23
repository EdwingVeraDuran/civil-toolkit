import type { Unit } from "@/lib/units/types"
import { LOCALE } from "@/lib/config/locale"

export { LOCALE }
export const DEFAULT_DECIMALS = 2
export const DECIMAL_OPTIONS = [0, 1, 2, 3, 4, 6] as const

function formatFixed(value: number, decimals: number): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatNumber(
  value: number,
  decimals: number = DEFAULT_DECIMALS
): string {
  if (!Number.isFinite(value)) return "—"
  if (value === 0) return formatFixed(0, decimals)

  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 10 ** -decimals) {
    return value.toExponential(decimals).replace(".", ",")
  }

  return formatFixed(value, decimals)
}

export function formatWithUnit(
  value: number,
  unit: Unit,
  decimals: number = DEFAULT_DECIMALS
): string {
  return `${formatNumber(value, decimals)} ${unit.symbol}`
}
