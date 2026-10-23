"use client"

import { useSyncExternalStore } from "react"

import {
  EMPTY_TOOL_PREFERENCES,
  getToolPreferencesSnapshot,
  subscribeToToolPreferences,
  toggleFavoriteTool,
} from "@/lib/tools/preferences"

export function useToolPreferences() {
  const preferences = useSyncExternalStore(
    subscribeToToolPreferences,
    getToolPreferencesSnapshot,
    () => EMPTY_TOOL_PREFERENCES
  )

  return {
    favorites: preferences.favorites,
    recents: preferences.recents,
    isFavorite: (id: string) => preferences.favorites.includes(id),
    toggleFavorite: (id: string) => toggleFavoriteTool(id),
  }
}
