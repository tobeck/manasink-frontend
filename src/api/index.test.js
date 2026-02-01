import { describe, it, expect } from 'vitest'
import { transformCard, getBasicLandsForColors, getStaplesForColorIdentity } from './index'

describe('API', () => {
  describe('transformCard', () => {
    it('should transform a standard card', () => {
      const rawCard = {
        id: 'card-123',
        name: 'Test Commander',
        image_uris: {
          small: 'https://example.com/small.jpg',
          large: 'https://example.com/large.jpg',
          art_crop: 'https://example.com/art.jpg',
        },
        color_identity: ['W', 'U'],
        type_line: 'Legendary Creature - Human Wizard',
        mana_cost: '{W}{U}',
        cmc: 2,
        scryfall_uri: 'https://scryfall.com/card/test',
        oracle_text: 'Some ability text',
        power: '2',
        toughness: '2',
        keywords: ['Flying'],
        rarity: 'rare',
        set_name: 'Test Set',
        prices: {
          usd: '10.00',
          usd_foil: '20.00',
          eur: '8.00',
        },
        purchase_uris: {
          tcgplayer: 'https://tcgplayer.com/test',
        },
      }

      const result = transformCard(rawCard)

      expect(result.id).toBe('card-123')
      expect(result.name).toBe('Test Commander')
      expect(result.image).toBe('https://example.com/small.jpg')
      expect(result.imageLarge).toBe('https://example.com/large.jpg')
      expect(result.colorIdentity).toEqual(['W', 'U'])
      expect(result.typeLine).toBe('Legendary Creature - Human Wizard')
      expect(result.manaCost).toBe('{W}{U}')
      expect(result.cmc).toBe(2)
      expect(result.priceUsd).toBe('10.00')
      expect(result.priceEur).toBe('8.00')
    })

    it('should handle double-faced cards', () => {
      const rawCard = {
        id: 'dfc-123',
        name: 'Double-Faced Card',
        card_faces: [
          {
            image_uris: {
              small: 'https://example.com/front-small.jpg',
              large: 'https://example.com/front-large.jpg',
            },
            oracle_text: 'Front face text',
          },
          {
            image_uris: {
              small: 'https://example.com/back-small.jpg',
            },
            oracle_text: 'Back face text',
          },
        ],
        color_identity: ['B'],
        type_line: 'Legendary Creature // Creature',
        mana_cost: '{B}{B}',
        cmc: 2,
        prices: {},
      }

      const result = transformCard(rawCard)

      expect(result.image).toBe('https://example.com/front-small.jpg')
      expect(result.imageLarge).toBe('https://example.com/front-large.jpg')
      expect(result.oracleText).toBe('Front face text')
    })

    it('should handle missing optional fields', () => {
      const rawCard = {
        id: 'minimal-123',
        name: 'Minimal Card',
      }

      const result = transformCard(rawCard)

      expect(result.id).toBe('minimal-123')
      expect(result.name).toBe('Minimal Card')
      expect(result.image).toBe('')
      expect(result.colorIdentity).toEqual([])
      expect(result.priceUsd).toBeNull()
    })
  })

  describe('getBasicLandsForColors', () => {
    it('should return correct lands for single color', () => {
      const result = getBasicLandsForColors(['W'])

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Plains')
      expect(result[0].count).toBe(35)
    })

    it('should split lands evenly for two colors', () => {
      const result = getBasicLandsForColors(['W', 'U'])

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Plains')
      expect(result[1].name).toBe('Island')
      // 35 / 2 = 17 with 1 extra
      expect(result[0].count + result[1].count).toBe(35)
    })

    it('should return Wastes for colorless', () => {
      const result = getBasicLandsForColors([])

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Wastes')
      expect(result[0].count).toBe(35)
    })

    it('should handle five colors', () => {
      const result = getBasicLandsForColors(['W', 'U', 'B', 'R', 'G'])

      expect(result).toHaveLength(5)
      const totalCount = result.reduce((sum, land) => sum + land.count, 0)
      expect(totalCount).toBe(35)
    })
  })

  describe('getStaplesForColorIdentity', () => {
    it('should include colorless staples for all decks', () => {
      const result = getStaplesForColorIdentity([])

      expect(result).toContain('Sol Ring')
      expect(result).toContain('Command Tower')
      expect(result).toContain('Arcane Signet')
    })

    it('should add color-specific staples', () => {
      const result = getStaplesForColorIdentity(['W', 'U'])

      // Colorless staples
      expect(result).toContain('Sol Ring')

      // White staples
      expect(result).toContain('Swords to Plowshares')
      expect(result).toContain('Path to Exile')

      // Blue staples
      expect(result).toContain('Counterspell')
      expect(result).toContain('Cyclonic Rift')

      // Should not include other colors
      expect(result).not.toContain('Dark Ritual')
      expect(result).not.toContain('Chaos Warp')
    })

    it('should handle five-color decks', () => {
      const result = getStaplesForColorIdentity(['W', 'U', 'B', 'R', 'G'])

      // Should have colorless + all color staples
      expect(result.length).toBeGreaterThan(20)
      expect(result).toContain('Sol Ring')
      expect(result).toContain('Swords to Plowshares')
      expect(result).toContain('Counterspell')
      expect(result).toContain('Dark Ritual')
      expect(result).toContain('Chaos Warp')
      expect(result).toContain('Beast Within')
    })
  })
})
