import styles from './ActionButtons.module.css'

export function ActionButtons({ onPass, onLike, disabled }) {
  return (
    <div className={styles.actions}>
      <button
        className={`${styles.btn} ${styles.pass}`}
        onClick={onPass}
        disabled={disabled}
        aria-label="Pass"
      >
        <span className={styles.icon}>✕</span>
      </button>
      
      <button
        className={`${styles.btn} ${styles.like}`}
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
      >
        <span className={styles.icon}>♥</span>
      </button>
    </div>
  )
}
