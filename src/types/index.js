/**
 * @typedef {Object} Commander
 * @property {string} id - Scryfall card ID
 * @property {string} name - Card name
 * @property {string} image - Small image URL
 * @property {string} imageLarge - Large image URL for display
 * @property {string} imageArt - Art crop URL
 * @property {string[]} colorIdentity - Color identity (W, U, B, R, G)
 * @property {string} typeLine - Full type line
 * @property {string} manaCost - Mana cost string
 * @property {number} cmc - Converted mana cost
 * @property {string} scryfallUri - Link to Scryfall page
 * @property {string} oracleText - Card text
 * @property {string} [power] - Power (if creature)
 * @property {string} [toughness] - Toughness (if creature)
 * @property {string[]} keywords - Keyword abilities
 * @property {string} rarity - Card rarity
 * @property {string} setName - Set name
 */

/**
 * @typedef {Object} SwipeAction
 * @property {string} odCommanderId - Scryfall card ID
 * @property {'like' | 'pass'} action - User action
 * @property {number} timestamp - Unix timestamp
 * @property {number} [viewDuration] - How long user viewed card (ms)
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string[]} colorFilters - Active color filters
 * @property {string[]} excludedCommanders - IDs of commanders to not show again
 */

/**
 * @typedef {Object} Deck
 * @property {string} id - Deck ID
 * @property {string} name - Deck name
 * @property {Commander} commander - Commander card
 * @property {DeckCard[]} cards - Cards in deck (99 max)
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} DeckCard
 * @property {string} id - Scryfall card ID
 * @property {string} name - Card name
 * @property {string} image - Small image URL
 * @property {string} typeLine - Type line
 * @property {number} quantity - Number in deck (usually 1, except basics)
 */

/**
 * Future ML integration types
 * 
 * @typedef {Object} DeckFeedback
 * @property {string} deckId - Deck ID
 * @property {string[]} suggestedAdditions - Card IDs to consider adding
 * @property {string[]} suggestedRemovals - Card IDs to consider removing
 * @property {Object} synergyScores - Card ID -> synergy score mapping
 * @property {number} overallScore - Deck strength estimate (0-100)
 * @property {string[]} archetypeMatches - Detected deck archetypes
 */

export const Types = {}
