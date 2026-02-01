import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStore } from './store'

// Mock the API module
vi.mock('./api', () => ({
  getLikedCommanders: vi.fn(() => Promise.resolve([])),
  likeCommander: vi.fn(() => Promise.resolve()),
  unlikeCommander: vi.fn(() => Promise.resolve()),
  getPreferences: vi.fn(() => Promise.resolve({ colorFilters: ['W', 'U', 'B', 'R', 'G', 'C'] })),
  savePreferences: vi.fn(() => Promise.resolve()),
  recordSwipeAction: vi.fn(() => Promise.resolve()),
  getDecks: vi.fn(() => Promise.resolve([])),
  createDeck: vi.fn(() => Promise.resolve('deck-123')),
  updateDeck: vi.fn(() => Promise.resolve()),
  deleteDeck: vi.fn(() => Promise.resolve()),
}))

describe('Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      notifications: [],
      isLoading: true,
      isInitialized: false,
      likedCommanders: [],
      decks: [],
      preferences: { colorFilters: ['W', 'U', 'B', 'R', 'G', 'C'] },
      activeDeckId: null,
      view: 'swipe',
      filterModalOpen: false,
    })
  })

  describe('Notifications', () => {
    it('should add a notification', () => {
      const { addNotification } = useStore.getState()

      addNotification('error', 'Test error message')

      const { notifications } = useStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('error')
      expect(notifications[0].message).toBe('Test error message')
      expect(notifications[0].id).toBeDefined()
    })

    it('should dismiss a notification', () => {
      const { addNotification, dismissNotification } = useStore.getState()

      const id = addNotification('success', 'Test success')
      expect(useStore.getState().notifications).toHaveLength(1)

      dismissNotification(id)
      expect(useStore.getState().notifications).toHaveLength(0)
    })

    it('should handle multiple notifications', () => {
      const { addNotification } = useStore.getState()

      addNotification('info', 'Message 1')
      addNotification('error', 'Message 2')
      addNotification('success', 'Message 3')

      expect(useStore.getState().notifications).toHaveLength(3)
    })
  })

  describe('Liked Commanders', () => {
    const mockCommander = {
      id: 'commander-1',
      name: 'Test Commander',
      colorIdentity: ['W', 'U'],
    }

    it('should like a commander with optimistic update', async () => {
      const { likeCommander } = useStore.getState()

      await likeCommander(mockCommander)

      const { likedCommanders } = useStore.getState()
      expect(likedCommanders).toHaveLength(1)
      expect(likedCommanders[0].id).toBe('commander-1')
    })

    it('should not like duplicate commanders', async () => {
      const { likeCommander } = useStore.getState()

      await likeCommander(mockCommander)
      await likeCommander(mockCommander)

      const { likedCommanders } = useStore.getState()
      expect(likedCommanders).toHaveLength(1)
    })

    it('should unlike a commander', async () => {
      // First, add a commander
      useStore.setState({ likedCommanders: [mockCommander] })

      const { unlikeCommander } = useStore.getState()
      await unlikeCommander('commander-1')

      const { likedCommanders } = useStore.getState()
      expect(likedCommanders).toHaveLength(0)
    })
  })

  describe('Decks', () => {
    const mockCommander = {
      id: 'commander-1',
      name: 'Test Commander',
    }

    it('should create a deck with optimistic update', async () => {
      const { createDeck } = useStore.getState()

      await createDeck(mockCommander, [])

      const { decks, activeDeckId, view } = useStore.getState()
      expect(decks).toHaveLength(1)
      expect(decks[0].name).toBe('Test Commander Deck')
      expect(activeDeckId).toBe('deck-123')
      expect(view).toBe('deckbuilder')
    })

    it('should delete a deck', async () => {
      const mockDeck = {
        id: 'deck-1',
        name: 'Test Deck',
        commander: mockCommander,
        cards: [],
      }
      useStore.setState({ decks: [mockDeck] })

      const { deleteDeck } = useStore.getState()
      await deleteDeck('deck-1')

      const { decks } = useStore.getState()
      expect(decks).toHaveLength(0)
    })
  })

  describe('UI State', () => {
    it('should change view', () => {
      const { setView } = useStore.getState()

      setView('liked')
      expect(useStore.getState().view).toBe('liked')

      setView('decks')
      expect(useStore.getState().view).toBe('decks')
    })

    it('should toggle filter modal', () => {
      const { setFilterModalOpen } = useStore.getState()

      setFilterModalOpen(true)
      expect(useStore.getState().filterModalOpen).toBe(true)

      setFilterModalOpen(false)
      expect(useStore.getState().filterModalOpen).toBe(false)
    })
  })

  describe('Color Filters', () => {
    it('should toggle color filter', async () => {
      const { toggleColorFilter } = useStore.getState()

      // Initial state has all colors
      expect(useStore.getState().preferences.colorFilters).toContain('W')

      // Toggle off White
      await toggleColorFilter('W')
      expect(useStore.getState().preferences.colorFilters).not.toContain('W')

      // Toggle White back on
      await toggleColorFilter('W')
      expect(useStore.getState().preferences.colorFilters).toContain('W')
    })
  })
})
