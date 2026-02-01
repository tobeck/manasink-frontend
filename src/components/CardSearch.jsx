import { useState, useEffect, useRef, useCallback } from 'react'
import { searchCards } from '../api'
import styles from './CardSearch.module.css'

export function CardSearch({ onSelect, placeholder = 'Search for cards...' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const debounceRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { cards } = await searchCards(query, { order: 'edhrec' })
        setResults(cards.slice(0, 8)) // Limit to 8 results
        setIsOpen(true)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
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

  const handleBlur = (e) => {
    // Delay closing to allow click on results
    setTimeout(() => {
      if (!listRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 150)
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
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
        />
        {isLoading && <div className={styles.spinner} />}
      </div>

      {isOpen && results.length > 0 && (
        <ul ref={listRef} className={styles.results}>
          {results.map((card, index) => (
            <li
              key={card.id}
              className={`${styles.result} ${index === selectedIndex ? styles.selected : ''}`}
              onClick={() => handleSelect(card)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img 
                src={card.image} 
                alt="" 
                className={styles.resultImage}
              />
              <div className={styles.resultInfo}>
                <span className={styles.resultName}>{card.name}</span>
                <span className={styles.resultType}>{card.typeLine}</span>
              </div>
              <div className={styles.resultMeta}>
                {card.manaCost && (
                  <span className={styles.resultMana}>{formatManaCost(card.manaCost)}</span>
                )}
                {card.priceUsd && (
                  <span className={styles.resultPrice}>${parseFloat(card.priceUsd).toFixed(2)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className={styles.noResults}>
          No cards found
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
