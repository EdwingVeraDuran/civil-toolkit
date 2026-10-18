"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Unit } from "@/lib/units/types"

type UnitSelectProps = {
  units: Unit[]
  value: string
  onValueChange: (value: string) => void
  id?: string
  "aria-label"?: string
}

export function UnitSelect({
  units,
  value,
  onValueChange,
  id,
  "aria-label": ariaLabel,
}: UnitSelectProps) {
  const items = units.map((unit) => ({
    value: unit.id,
    label: `${unit.symbol} — ${unit.name}`,
  }))

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next) {
          onValueChange(next)
        }
      }}
    >
      <SelectTrigger id={id} aria-label={ariaLabel} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-56">
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.symbol} — {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
