import { LOCALE } from "@/lib/config/locale"

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export const DATE_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
}

export const DATE_LONG_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
}

export const DATE_DAY_MONTH_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
}

const DEFAULT_DATE_OPTIONS = DATE_SHORT_OPTIONS

export function parseDateValue(value: string): Date | null {
  if (!value) return null

  const dateOnly = DATE_ONLY_PATTERN.exec(value)
  if (dateOnly) {
    const year = Number(dateOnly[1])
    const month = Number(dateOnly[2])
    const day = Number(dateOnly[3])
    const date = new Date(year, month - 1, day, 12)
    const isValid =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day

    return isValid ? date : null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS
): string {
  if (!value) return "—"

  const date = parseDateValue(value)
  if (!date) return "—"

  return date.toLocaleDateString(LOCALE, options)
}
