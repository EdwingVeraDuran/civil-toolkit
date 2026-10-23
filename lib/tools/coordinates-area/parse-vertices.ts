import { parseNumericInput } from "@/lib/tools/parse-numeric"

export type ParsedVertex = {
  x: number
  y: number
}

export type ParseCoordinateListResult = {
  vertices: ParsedVertex[]
  errors: string[]
}

function splitCoordinateLine(line: string): string[] | null {
  if (line.includes(";")) {
    const parts = line
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
    return parts.length === 2 ? parts : null
  }

  if (line.includes("\t")) {
    const parts = line
      .split("\t")
      .map((part) => part.trim())
      .filter(Boolean)
    return parts.length === 2 ? parts : null
  }

  const whitespaceParts = line.split(/\s+/).filter(Boolean)
  if (whitespaceParts.length === 2) {
    return whitespaceParts
  }

  const commaParts = line.split(",").map((part) => part.trim())
  return commaParts.length === 2 ? commaParts : null
}

function parseCoordinateToken(token: string): number | null {
  const cleaned = token.replace(/^[,;]+|[,;]+$/g, "").trim()
  const parsed = parseNumericInput(cleaned)

  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null
}

export function parseCoordinateList(text: string): ParseCoordinateListResult {
  const vertices: ParsedVertex[] = []
  const errors: string[] = []

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) return

    const parts = splitCoordinateLine(line)
    if (!parts) {
      errors.push(
        `Línea ${index + 1}: usa dos valores separados por coma, punto y coma, tabulación o espacio.`
      )
      return
    }

    const x = parseCoordinateToken(parts[0])
    const y = parseCoordinateToken(parts[1])

    if (x === null) {
      errors.push(`Línea ${index + 1}: la coordenada X no es un número válido.`)
      return
    }

    if (y === null) {
      errors.push(`Línea ${index + 1}: la coordenada Y no es un número válido.`)
      return
    }

    vertices.push({ x, y })
  })

  return { vertices, errors }
}
