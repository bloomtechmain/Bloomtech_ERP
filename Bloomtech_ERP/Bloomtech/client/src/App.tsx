import './App.css'
import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

type User = { id: number; name: string; email: string; role: string }

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  if (!user) return <Login onLoggedIn={setUser} />
  return <Dashboard user={user} onLogout={() => setUser(null)} />
}
