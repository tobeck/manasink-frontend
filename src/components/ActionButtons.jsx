import styles from './ActionButtons.module.css'

export function ActionButtons({ onLike, onPass, disabled }) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${styles.pass}`}
        onClick={onPass}
        disabled={disabled}
        aria-label="Pass"
      >
        <XIcon />
      </button>
      
      <button
        className={`${styles.button} ${styles.like}`}
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
      >
        <HeartIcon />
      </button>
    </div>
  )
}

function XIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
