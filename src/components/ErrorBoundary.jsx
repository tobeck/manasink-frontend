import { Component } from 'react'
import { trackEvent } from '../lib/analytics'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)

    // Log to analytics
    trackEvent('error_boundary', {
      error: error.message,
      stack: error.stack?.slice(0, 500),
      componentStack: errorInfo.componentStack?.slice(0, 500),
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>😕</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button style={styles.button} onClick={this.handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    color: '#eee',
  },
  content: {
    textAlign: 'center',
    maxWidth: '400px',
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    fontWeight: 600,
  },
  message: {
    color: '#aaa',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  button: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
}
