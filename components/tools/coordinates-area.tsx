"use client"

import { useRef, useState } from "react"
import { ClipboardPaste, Plus, Trash2 } from "lucide-react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { CoordinatesPolygonDiagram } from "@/components/tools/coordinates-polygon-diagram"
import { UnitSelect } from "@/components/tools/unit-select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  calculateCoordinatesArea,
  type CoordinatesAreaResult,
} from "@/lib/tools/coordinates-area/calculate"
import { coordinatesAreaDefinition } from "@/lib/tools/coordinates-area/definition"
import {
  parseCoordinateList,
  type ParsedVertex,
} from "@/lib/tools/coordinates-area/parse-vertices"
import {
  DEFAULT_AREA_UNIT,
  DEFAULT_LENGTH_UNIT,
  MAX_VERTICES,
  type CoordinatesAreaInput,
} from "@/lib/tools/coordinates-area/schema"
import { parseNumericInput } from "@/lib/tools/parse-numeric"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"
import { Measurement } from "@/lib/units/measurement"
import { getUnit, unitsByDimension } from "@/lib/units/units"

const LENGTH_UNITS = unitsByDimension("length")
const AREA_UNITS = unitsByDimension("area")

type VertexRow = {
  id: number
  xInput: string
  yInput: string
}

function defaultVertices(): VertexRow[] {
  return [
    { id: 0, xInput: "0", yInput: "0" },
    { id: 1, xInput: "10", yInput: "0" },
    { id: 2, xInput: "10", yInput: "8" },
    { id: 3, xInput: "0", yInput: "8" },
  ]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function readUnit(value: unknown, dimension: string, fallback: string): string {
  if (typeof value !== "string") return fallback
  return getUnit(value)?.dimension === dimension ? value : fallback
}

function readVertices(value: unknown): VertexRow[] {
  if (!Array.isArray(value)) return defaultVertices()

  const rows = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null

      return {
        id: index,
        xInput: readString(entry.x, "0"),
        yInput: readString(entry.y, "0"),
      }
    })
    .filter((row): row is VertexRow => row !== null)

  return rows.length >= 3 ? rows : defaultVertices()
}

function hydrateCoordinatesInitialInput(
  initialInput?: Record<string, unknown>
) {
  if (!initialInput) return null

  return {
    lengthUnit: readUnit(
      initialInput.lengthUnit,
      "length",
      DEFAULT_LENGTH_UNIT
    ),
    areaUnit: readUnit(initialInput.areaUnit, "area", DEFAULT_AREA_UNIT),
    vertices: readVertices(initialInput.vertices),
  }
}

function convertCoordinateInput(
  value: string,
  fromUnitId: string,
  toUnitId: string
): string {
  const parsed = parseNumericInput(value)
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) return value

  const fromUnit = getUnit(fromUnitId)
  const toUnit = getUnit(toUnitId)

  if (
    !fromUnit ||
    !toUnit ||
    fromUnit.dimension !== "length" ||
    toUnit.dimension !== "length"
  ) {
    return value
  }

  const converted = Measurement.from(parsed, fromUnit).to(toUnit).value
  return String(Number(converted.toPrecision(12)))
}

function ResultTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{value}</dd>
    </div>
  )
}

function PasteCoordinatesDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (vertices: ParsedVertex[]) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <PasteCoordinatesForm onOpenChange={onOpenChange} onApply={onApply} />
      ) : null}
    </Dialog>
  )
}

function PasteCoordinatesForm({
  onOpenChange,
  onApply,
}: {
  onOpenChange: (open: boolean) => void
  onApply: (vertices: ParsedVertex[]) => void
}) {
  const [text, setText] = useState("")
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = parseCoordinateList(text)
    const nextErrors = [...parsed.errors]

    if (nextErrors.length === 0 && parsed.vertices.length < 3) {
      nextErrors.push("Ingresa al menos 3 vértices para formar un polígono.")
    }

    if (nextErrors.length === 0 && parsed.vertices.length > MAX_VERTICES) {
      nextErrors.push(
        `No se permiten más de ${MAX_VERTICES} vértices en una sola carga.`
      )
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors)
      return
    }

    onApply(parsed.vertices)
    onOpenChange(false)
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Cargar coordenadas</DialogTitle>
        <DialogDescription>
          Reemplaza los vértices actuales por una lista de coordenadas X, Y.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="coordinates-paste">Lista de coordenadas</Label>
          <Textarea
            id="coordinates-paste"
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              if (errors.length > 0) {
                setErrors([])
              }
            }}
            rows={10}
            placeholder={"100.50, 200.75\n120.50, 200.75\n120.50, 220.75"}
            className="min-h-48 font-mono text-sm"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Un vértice por línea. Separa X y Y con coma, punto y coma,
            tabulación o espacio. Para usar coma decimal, separa con punto y
            coma o con un espacio. Las líneas que empiezan con # se ignoran.
          </p>
        </div>

        {errors.length > 0 ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">No se pudieron leer todas las líneas.</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {errors.slice(0, 6).map((error, index) => (
                <li key={`${index}-${error}`}>{error}</li>
              ))}
            </ul>
            {errors.length > 6 ? (
              <p className="mt-2 text-xs">
                Hay {errors.length - 6} error(es) adicional(es).
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={text.trim() === ""}>
            Reemplazar vértices
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

export function CoordinatesArea({
  initialInput,
  editMode,
}: ToolComponentProps) {
  const hydrated = hydrateCoordinatesInitialInput(initialInput)
  const [lengthUnit, setLengthUnit] = useState(
    hydrated?.lengthUnit ?? DEFAULT_LENGTH_UNIT
  )
  const [areaUnit, setAreaUnit] = useState(
    hydrated?.areaUnit ?? DEFAULT_AREA_UNIT
  )
  const [vertices, setVertices] = useState<VertexRow[]>(
    () => hydrated?.vertices ?? defaultVertices()
  )
  const [pasteOpen, setPasteOpen] = useState(false)
  const nextVertexId = useRef(vertices.length)

  const rawInput = {
    lengthUnit,
    areaUnit,
    vertices: vertices.map((vertex) => ({
      x: vertex.xInput,
      y: vertex.yInput,
    })),
  }

  const validation = coordinatesAreaDefinition.validate(rawInput)
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const parsedInput: CoordinatesAreaInput | null = validation.valid
    ? coordinatesAreaDefinition.schema.parse(rawInput)
    : null

  const result: CoordinatesAreaResult | null = parsedInput
    ? calculateCoordinatesArea(parsedInput)
    : null

  const snapshot =
    parsedInput && result
      ? coordinatesAreaDefinition.toSnapshot(parsedInput, result)
      : null

  const lengthSymbol = getUnit(lengthUnit)?.symbol ?? "m"
  const areaSymbol = result
    ? (getUnit(result.areaUnitId)?.symbol ?? "m²")
    : (getUnit(areaUnit)?.symbol ?? "m²")
  const areaHectares = result
    ? Measurement.from(result.areaM2, "m2").to("ha").value
    : 0

  const updateVertex = (
    id: number,
    field: "xInput" | "yInput",
    value: string
  ) => {
    setVertices((current) =>
      current.map((vertex) =>
        vertex.id === id ? { ...vertex, [field]: value } : vertex
      )
    )
  }

  const addVertex = () => {
    if (vertices.length >= MAX_VERTICES) return

    const id = nextVertexId.current
    nextVertexId.current += 1
    setVertices((current) => [...current, { id, xInput: "0", yInput: "0" }])
  }

  const removeVertex = (id: number) => {
    setVertices((current) =>
      current.length <= 3
        ? current
        : current.filter((vertex) => vertex.id !== id)
    )
  }

  const applyPastedVertices = (parsed: ParsedVertex[]) => {
    const rows = parsed.map((vertex, index) => ({
      id: index,
      xInput: String(vertex.x),
      yInput: String(vertex.y),
    }))

    nextVertexId.current = rows.length
    setVertices(rows)
  }

  const handleLengthUnitChange = (next: string) => {
    if (next === lengthUnit) return

    const nextUnit = getUnit(next)
    if (!nextUnit || nextUnit.dimension !== "length") return

    setVertices((current) =>
      current.map((vertex) => ({
        ...vertex,
        xInput: convertCoordinateInput(vertex.xInput, lengthUnit, next),
        yInput: convertCoordinateInput(vertex.yInput, lengthUnit, next),
      }))
    )
    setLengthUnit(next)
  }

  const verticesError = fieldError("vertices")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de entrada</CardTitle>
          <CardDescription>
            Ingresa los vértices en orden consecutivo alrededor del polígono. La
            herramienta cierra el contorno automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coordinates-length-unit">
                Unidad de longitud
              </Label>
              <UnitSelect
                id="coordinates-length-unit"
                units={LENGTH_UNITS}
                value={lengthUnit}
                onValueChange={handleLengthUnitChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coordinates-area-unit">Unidad de área</Label>
              <UnitSelect
                id="coordinates-area-unit"
                units={AREA_UNITS}
                value={areaUnit}
                onValueChange={setAreaUnit}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Vértice</TableHead>
                  <TableHead>X — Este ({lengthSymbol})</TableHead>
                  <TableHead>Y — Norte ({lengthSymbol})</TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vertices.map((vertex, index) => {
                  const xError = fieldError(`vertices.${index}.x`)
                  const yError = fieldError(`vertices.${index}.y`)

                  return (
                    <TableRow key={vertex.id}>
                      <TableCell className="align-top text-muted-foreground tabular-nums">
                        {index + 1}
                      </TableCell>
                      <TableCell className="min-w-40 align-top whitespace-normal">
                        <Input
                          value={vertex.xInput}
                          inputMode="decimal"
                          aria-label={`Coordenada X del vértice ${index + 1}`}
                          aria-invalid={xError ? true : undefined}
                          onChange={(event) =>
                            updateVertex(
                              vertex.id,
                              "xInput",
                              event.target.value
                            )
                          }
                        />
                        {xError ? (
                          <p className="mt-1 text-xs text-destructive">
                            {xError}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="min-w-40 align-top whitespace-normal">
                        <Input
                          value={vertex.yInput}
                          inputMode="decimal"
                          aria-label={`Coordenada Y del vértice ${index + 1}`}
                          aria-invalid={yError ? true : undefined}
                          onChange={(event) =>
                            updateVertex(
                              vertex.id,
                              "yInput",
                              event.target.value
                            )
                          }
                        />
                        {yError ? (
                          <p className="mt-1 text-xs text-destructive">
                            {yError}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={vertices.length <= 3}
                          aria-label={`Eliminar vértice ${index + 1}`}
                          title="Eliminar vértice"
                          onClick={() => removeVertex(vertex.id)}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Mínimo 3 vértices. Al cambiar la unidad de longitud se
                convierten las coordenadas ingresadas.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasteOpen(true)}
                >
                  <ClipboardPaste />
                  Cargar lista
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={vertices.length >= MAX_VERTICES}
                  onClick={addVertex}
                >
                  <Plus />
                  Agregar vértice
                </Button>
              </div>
            </div>

            {verticesError ? (
              <p className="text-sm text-destructive">{verticesError}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {result
              ? "Área y perímetro del polígono cerrado."
              : "Completa las coordenadas para calcular el área."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && parsedInput ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultTile
                  label="Área"
                  value={`${formatNumber(result.area, 3)} ${areaSymbol}`}
                />
                <ResultTile
                  label="Perímetro"
                  value={`${formatNumber(result.perimeter, 3)} ${lengthSymbol}`}
                />
                <ResultTile
                  label="Vértices"
                  value={String(result.vertexCount)}
                />
                <ResultTile
                  label="Sentido"
                  value={
                    result.orientation === "counterclockwise"
                      ? "Antihorario"
                      : "Horario"
                  }
                />
              </div>

              <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="space-y-4">
                  <dl className="grid gap-3 sm:grid-cols-3">
                    <Detail
                      label="Área en m²"
                      value={`${formatNumber(result.areaM2, 3)} m²`}
                    />
                    <Detail
                      label="Área en hectáreas"
                      value={`${formatNumber(areaHectares, 4)} ha`}
                    />
                    <Detail
                      label="Área con signo"
                      value={`${formatNumber(result.signedAreaM2, 3)} m²`}
                    />
                  </dl>

                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">
                      Fórmula aplicada
                    </p>
                    <p className="mt-1 text-sm font-medium">{result.formula}</p>
                  </div>
                </div>

                <CoordinatesPolygonDiagram
                  vertices={parsedInput.vertices}
                  areaLabel={`A = ${formatNumber(result.area, 3)} ${areaSymbol}`}
                  className="mx-auto w-full max-w-sm"
                />
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
          <CardDescription>
            Convenciones del cálculo de áreas por coordenadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            La fórmula de Gauss también se conoce como Shoelace. Usa las
            coordenadas en el orden en que recorren el polígono y toma el valor
            absoluto del área con signo.
          </p>
          <p>
            El sentido horario o antihorario se determina con el signo del área
            doble, considerando X hacia el este y Y hacia el norte.
          </p>
          <p>
            No es necesario repetir el primer vértice al final; el cierre se
            agrega automáticamente. Evita vértices colineales o repetidos que
            produzcan un área nula.
          </p>
          <p>
            El diagrama se ajusta a la extensión del polígono y es esquemático;
            no está a escala absoluta.
          </p>
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
            toolId={coordinatesAreaDefinition.info.id}
            toolName={coordinatesAreaDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>

      <PasteCoordinatesDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        onApply={applyPastedVertices}
      />
    </div>
  )
}
