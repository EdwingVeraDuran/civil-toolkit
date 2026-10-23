import { TOOL_CATALOG } from "@/lib/tools/catalog"

export type ToolPreferences = {
  favorites: string[]
  recents: string[]
}

export const TOOL_PREFERENCES_STORAGE_KEY = "civil-toolkit:tool-preferences:v1"
export const MAX_RECENT_TOOLS = 6

const TOOL_PREFERENCES_EVENT = "civil-toolkit:tool-preferences-change"
const TOOL_IDS = TOOL_CATALOG.map((tool) => tool.id)

export const EMPTY_TOOL_PREFERENCES: ToolPreferences = {
  favorites: [],
  recents: [],
}

function filterKnownIds(value: unknown, validIds: readonly string[]): string[] {
  if (!Array.isArray(value)) return []

  const valid = new Set(validIds)
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of value) {
    if (typeof item !== "string" || !valid.has(item) || seen.has(item)) continue
    seen.add(item)
    result.push(item)
  }

  return result
}

export function parseToolPreferences(
  raw: string | null,
  validIds: readonly string[] = TOOL_IDS
): ToolPreferences {
  if (!raw) return EMPTY_TOOL_PREFERENCES

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return EMPTY_TOOL_PREFERENCES
  }

  if (typeof parsed !== "object" || parsed === null) {
    return EMPTY_TOOL_PREFERENCES
  }

  const record = parsed as Record<string, unknown>

  return {
    favorites: filterKnownIds(record.favorites, validIds),
    recents: filterKnownIds(record.recents, validIds).slice(
      0,
      MAX_RECENT_TOOLS
    ),
  }
}

export function toggleFavoriteId(
  favorites: readonly string[],
  id: string
): string[] {
  return favorites.includes(id)
    ? favorites.filter((favorite) => favorite !== id)
    : [id, ...favorites]
}

export function pushRecentId(
  recents: readonly string[],
  id: string,
  limit = MAX_RECENT_TOOLS
): string[] {
  return [id, ...recents.filter((recent) => recent !== id)].slice(0, limit)
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

let cachedRaw: string | null = null
let cachedPreferences: ToolPreferences = EMPTY_TOOL_PREFERENCES

export function getToolPreferencesSnapshot(): ToolPreferences {
  const storage = getStorage()
  const raw = storage?.getItem(TOOL_PREFERENCES_STORAGE_KEY) ?? null

  if (raw === cachedRaw) return cachedPreferences

  cachedRaw = raw
  cachedPreferences = parseToolPreferences(raw)
  return cachedPreferences
}

function writeToolPreferences(preferences: ToolPreferences): void {
  const storage = getStorage()
  if (!storage) return

  const serialized = JSON.stringify(preferences)

  try {
    storage.setItem(TOOL_PREFERENCES_STORAGE_KEY, serialized)
  } catch {
    return
  }

  cachedRaw = serialized
  cachedPreferences = preferences
  window.dispatchEvent(new Event(TOOL_PREFERENCES_EVENT))
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function toggleFavoriteTool(id: string): void {
  const current = getToolPreferencesSnapshot()

  writeToolPreferences({
    ...current,
    favorites: toggleFavoriteId(current.favorites, id),
  })
}

export function recordRecentTool(id: string): void {
  const current = getToolPreferencesSnapshot()
  const recents = pushRecentId(current.recents, id)

  if (sameIds(current.recents, recents)) return

  writeToolPreferences({ ...current, recents })
}

export function subscribeToToolPreferences(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}

  const handleStorage = (event: StorageEvent) => {
    if (event.key === TOOL_PREFERENCES_STORAGE_KEY || event.key === null) {
      onChange()
    }
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(TOOL_PREFERENCES_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(TOOL_PREFERENCES_EVENT, onChange)
  }
}
