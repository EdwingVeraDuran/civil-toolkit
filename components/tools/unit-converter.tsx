"use client"

import { useMemo, useState } from "react"
import { ArrowRightLeft } from "lucide-react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { UnitSelect } from "@/components/tools/unit-select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber } from "@/lib/units/format"
import {
  DIMENSION_LABELS,
  DIMENSIONS,
  type DimensionId,
} from "@/lib/units/types"
import type { UnitId } from "@/lib/units/units"
import { unitsByDimension } from "@/lib/units/units"
import { unitConverterDefinition } from "@/lib/tools/unit-converter/definition"
import { evaluateTool } from "@/lib/tools/evaluate"
import type { ToolComponentProps } from "@/lib/tools/types"

const DECIMAL_ITEMS = [0, 1, 2, 3, 4, 6].map((n) => ({
  value: String(n),
  label: n === 1 ? "1 decimal" : `${n} decimales`,
}))

const DIMENSION_ITEMS = DIMENSIONS.map((dimension) => ({
  value: dimension,
  label: DIMENSION_LABELS[dimension],
}))

const DIMENSION_DEFAULTS: Record<DimensionId, { from: UnitId; to: UnitId }> = {
  length: { from: "m", to: "ft" },
  area: { from: "m2", to: "ft2" },
  volume: { from: "m3", to: "l" },
  mass: { from: "kg", to: "lb" },
  force: { from: "n", to: "kn" },
  pressure: { from: "mpa", to: "psi" },
  unitWeight: { from: "knm3", to: "pcf" },
  angle: { from: "deg", to: "rad" },
  temperature: { from: "c", to: "f" },
}

function isDimensionId(value: string): value is DimensionId {
  return (DIMENSIONS as readonly string[]).includes(value)
}

function getDimensionFromUnit(unitId: string): DimensionId | null {
  for (const dimension of DIMENSIONS) {
    if (unitsByDimension(dimension).some((unit) => unit.id === unitId)) {
      return dimension
    }
  }
  return null
}

function hydrateUnitConverterInitialInput(
  initialInput?: Record<string, unknown>
) {
  if (!initialInput) return null

  const value =
    typeof initialInput.value === "number"
      ? String(initialInput.value)
      : typeof initialInput.value === "string"
        ? initialInput.value
        : "1"
  const fromUnitId =
    typeof initialInput.fromUnitId === "string" ? initialInput.fromUnitId : "m"
  const toUnitId =
    typeof initialInput.toUnitId === "string" ? initialInput.toUnitId : "ft"

  const dimension = getDimensionFromUnit(fromUnitId) ?? "length"

  return { dimension, fromUnitId, toUnitId, value }
}

export function UnitConverter({ initialInput, editMode }: ToolComponentProps) {
  const hydrated = hydrateUnitConverterInitialInput(initialInput)
  const [dimension, setDimension] = useState<DimensionId>(
    hydrated?.dimension ?? "length"
  )
  const [fromUnitId, setFromUnitId] = useState(hydrated?.fromUnitId ?? "m")
  const [toUnitId, setToUnitId] = useState(hydrated?.toUnitId ?? "ft")
  const [decimals, setDecimals] = useState(2)
  const [valueInput, setValueInput] = useState(hydrated?.value ?? "1")

  const dimensionUnits = useMemo(() => unitsByDimension(dimension), [dimension])

  const rawInput = { value: valueInput, fromUnitId, toUnitId }

  const { validation, result, snapshot } = evaluateTool(
    unitConverterDefinition,
    rawInput
  )
  const valueError = validation.valid
    ? undefined
    : validation.errors.find((error) => error.field === "value")?.message

  const handleDimensionChange = (next: string | null) => {
    if (!next || !isDimensionId(next)) {
      return
    }
    setDimension(next)
    const defaults = DIMENSION_DEFAULTS[next]
    setFromUnitId(defaults.from)
    setToUnitId(defaults.to)
  }

  const handleSwap = () => {
    setFromUnitId(toUnitId)
    setToUnitId(fromUnitId)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Conversión</CardTitle>
          <CardDescription>
            Elige la magnitud y las unidades a convertir.
          </CardDescription>
          <CardAction>
            <div className="w-48">
              <Select
                items={DIMENSION_ITEMS}
                value={dimension}
                onValueChange={handleDimensionChange}
              >
                <SelectTrigger aria-label="Magnitud" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="converter-value">Valor</Label>
            <div className="flex gap-2">
              <Input
                id="converter-value"
                inputMode="decimal"
                value={valueInput}
                onChange={(event) => setValueInput(event.target.value)}
                aria-invalid={valueError ? true : undefined}
                className="flex-1"
              />
              <div className="w-40 shrink-0">
                <UnitSelect
                  units={dimensionUnits}
                  value={fromUnitId}
                  onValueChange={setFromUnitId}
                  aria-label="Unidad de origen"
                />
              </div>
            </div>
            {valueError ? (
              <p className="text-sm text-destructive">{valueError}</p>
            ) : null}
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwap}
              aria-label="Intercambiar unidades"
            >
              <ArrowRightLeft className="size-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="converter-result">Resultado</Label>
            <div className="flex gap-2">
              <div
                id="converter-result"
                aria-live="polite"
                className="flex h-9 flex-1 items-center rounded-md border border-input bg-muted/40 px-3 text-sm tabular-nums"
              >
                {result ? formatNumber(result.to.value, decimals) : "—"}
              </div>
              <div className="w-40 shrink-0">
                <UnitSelect
                  units={dimensionUnits}
                  value={toUnitId}
                  onValueChange={setToUnitId}
                  aria-label="Unidad de destino"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equivalencias</CardTitle>
          <CardDescription>
            {result
              ? `Todas las unidades de ${DIMENSION_LABELS[dimension].toLowerCase()}`
              : "Ingresa un valor válido para ver las equivalencias."}
          </CardDescription>
          <CardAction>
            <div className="w-36">
              <Select
                items={DECIMAL_ITEMS}
                value={String(decimals)}
                onValueChange={(next) => {
                  if (next) {
                    setDecimals(Number(next))
                  }
                }}
              >
                <SelectTrigger aria-label="Decimales" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DECIMAL_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {result ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="hidden sm:table-cell">Nombre</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((row) => (
                  <TableRow
                    key={row.unit.id}
                    className={
                      row.unit.id === fromUnitId || row.unit.id === toUnitId
                        ? "bg-muted/50"
                        : undefined
                    }
                  >
                    <TableCell className="font-medium">
                      {row.unit.symbol}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {row.unit.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(row.measurement.value, decimals)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {editMode ? (
          <UpdateCalculationButton
            calculationId={editMode.calculationId}
            title={editMode.title}
            projectId={editMode.projectId}
            snapshot={snapshot}
          />
        ) : (
          <SaveCalculationButton
            toolId={unitConverterDefinition.info.id}
            toolName={unitConverterDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
