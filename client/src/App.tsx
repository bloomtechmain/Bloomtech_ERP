import './App.css'
import { useState, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

type User = { id: number; name: string; email: string; role: string }

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ background: '#eee', padding: 10, borderRadius: 4, maxWidth: '800px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', borderRadius: 8, background: '#0061ff', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  if (!user) return <Login onLoggedIn={setUser} />
  return (
    <ErrorBoundary>
      <Dashboard user={user} onLogout={() => setUser(null)} />
    </ErrorBoundary>
  )
}
