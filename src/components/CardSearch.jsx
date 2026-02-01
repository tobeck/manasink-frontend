import { useState, useEffect, useRef, useCallback } from 'react'
import { searchCards } from '../api'
import { SEARCH_RESULTS_LIMIT, DEBOUNCE_MS } from '../constants'
import styles from './CardSearch.module.css'

export function CardSearch({ onSelect, placeholder = 'Search for cards...', id = 'card-search' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef(null)
  const listRef = useRef(null)
  const debounceRef = useRef(null)
  const abortControllerRef = useRef(null)

  const listboxId = `${id}-listbox`
  const labelId = `${id}-label`

  // Debounced search with abort controller for race condition safety
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      // Abort any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setIsLoading(true)

      try {
        const { cards } = await searchCards(query, { order: 'edhrec' })
        // Only update if this request wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setResults(cards.slice(0, SEARCH_RESULTS_LIMIT))
          setIsOpen(true)
          setSelectedIndex(0)
        }
      } catch (error) {
        // Ignore abort errors
        if (error.name !== 'AbortError') {
          console.error('Search failed:', error)
          setResults([])
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const selectedEl = listRef.current.children[selectedIndex]
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, results.length])

  const handleSelect = useCallback((card) => {
    onSelect(card)
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }, [onSelect])

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleBlur = () => {
    // Delay closing to allow click on results
    setTimeout(() => {
      if (!listRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 150)
  }

  const activeDescendant = isOpen && results.length > 0
    ? `${id}-option-${selectedIndex}`
    : undefined

  return (
    <div className={styles.container}>
      <label id={labelId} htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <div className={styles.inputWrapper}>
        <SearchIcon aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={styles.input}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          aria-labelledby={labelId}
          aria-expanded={isOpen && results.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-busy={isLoading}
        />
        {isLoading && <div className={styles.spinner} aria-hidden="true" />}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          className={styles.results}
          role="listbox"
          aria-label="Search results"
        >
          {results.map((card, index) => (
            <li
              key={card.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={`${styles.result} ${index === selectedIndex ? styles.selected : ''}`}
              onClick={() => handleSelect(card)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img
                src={card.image}
                alt=""
                className={styles.resultImage}
                aria-hidden="true"
              />
              <div className={styles.resultInfo}>
                <span className={styles.resultName}>{card.name}</span>
                <span className={styles.resultType}>{card.typeLine}</span>
              </div>
              <div className={styles.resultMeta}>
                {card.manaCost && (
                  <span className={styles.resultMana} aria-label={`Mana cost: ${card.manaCost}`}>
                    {formatManaCost(card.manaCost)}
                  </span>
                )}
                {card.priceUsd && (
                  <span className={styles.resultPrice}>
                    ${parseFloat(card.priceUsd).toFixed(2)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className={styles.noResults} role="status" aria-live="polite">
          No cards found
        </div>
      )}
    </div>
  )
}

function SearchIcon(props) {
  return (
    <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function formatManaCost(manaCost) {
  // Convert {W}{U}{B} to symbols
  return manaCost
    .replace(/\{W\}/g, '○')
    .replace(/\{U\}/g, '●')
    .replace(/\{B\}/g, '◆')
    .replace(/\{R\}/g, '◈')
    .replace(/\{G\}/g, '●')
    .replace(/\{C\}/g, '◇')
    .replace(/\{(\d+)\}/g, '$1')
    .replace(/\{X\}/g, 'X')
}
