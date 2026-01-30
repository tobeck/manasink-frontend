import { create } from 'zustand'
import {
  getLikedCommanders,
  saveLikedCommanders,
  getPreferences,
  savePreferences,
  recordSwipeAction,
  getDecks,
  saveDecks,
} from './api'

export const useStore = create((set, get) => ({
  // ============================================
  // Liked commanders
  // ============================================
  likedCommanders: getLikedCommanders(),

  likeCommander: (commander) => {
    const { likedCommanders } = get()
    if (likedCommanders.find((c) => c.id === commander.id)) return

    const updated = [commander, ...likedCommanders]
    saveLikedCommanders(updated)
    set({ likedCommanders: updated })

    // Record for ML
    recordSwipeAction({
      commanderId: commander.id,
      action: 'like',
      timestamp: Date.now(),
    })
  },

  unlikeCommander: (commanderId) => {
    const updated = get().likedCommanders.filter((c) => c.id !== commanderId)
    saveLikedCommanders(updated)
    set({ likedCommanders: updated })
  },

  passCommander: (commander) => {
    // Record for ML (we don't store passed commanders, just the action)
    recordSwipeAction({
      commanderId: commander.id,
      action: 'pass',
      timestamp: Date.now(),
    })
  },

  // ============================================
  // Filters & preferences
  // ============================================
  preferences: getPreferences(),

  setColorFilters: (colorFilters) => {
    const preferences = { ...get().preferences, colorFilters }
    savePreferences(preferences)
    set({ preferences })
  },

  toggleColorFilter: (color) => {
    const { preferences } = get()
    const colorFilters = preferences.colorFilters.includes(color)
      ? preferences.colorFilters.filter((c) => c !== color)
      : [...preferences.colorFilters, color]

    const updated = { ...preferences, colorFilters }
    savePreferences(updated)
    set({ preferences: updated })
  },

  // ============================================
  // Decks (for future deck builder integration)
  // ============================================
  decks: getDecks(),

  createDeck: (commander, cards = []) => {
    const { decks } = get()
    const newDeck = {
      id: `deck-${Date.now()}`,
      name: `${commander.name} Deck`,
      commander,
      cards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [newDeck, ...decks]
    saveDecks(updated)
    set({ decks: updated })
    return newDeck.id
  },

  deleteDeck: (deckId) => {
    const updated = get().decks.filter((d) => d.id !== deckId)
    saveDecks(updated)
    set({ decks: updated })
  },

  // ============================================
  // UI state
  // ============================================
  view: 'swipe', // 'swipe' | 'liked' | 'decks'
  setView: (view) => set({ view }),

  filterModalOpen: false,
  setFilterModalOpen: (open) => set({ filterModalOpen: open }),
}))
