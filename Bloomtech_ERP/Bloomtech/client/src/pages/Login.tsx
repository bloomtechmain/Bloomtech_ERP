import { useState } from 'react'

type FormState = {
  email: string
  password: string
}

type Errors = Partial<FormState>

export default function Login({ onLoggedIn }: { onLoggedIn?: (user: { id: number; name: string; email: string; role: string }) => void }) {
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (state: FormState) => {
    const e: Errors = {}
    if (!state.email) e.email = 'Email or username is required'
    else {
      const isEmail = state.email.includes('@')
      if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = 'Invalid email'
    }
    if (!state.password) e.password = 'Password is required'
    else if (state.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const onChange = (key: keyof FormState) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: ev.target.value }))
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = (data && data.error) || 'Login failed'
        alert(msg)
        return
      }
      const user = await res.json()
      if (onLoggedIn) onLoggedIn(user)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
      <form onSubmit={onSubmit} style={{ width: 'min(520px, 92vw)', padding: 32, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)', boxShadow: '0 12px 24px rgba(0,0,0,0.2)' }}>
        <h1 style={{ margin: 0, marginBottom: 20, fontSize: 28 , color: '#e21818ff'}}>Login</h1>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#fff' }}>Email or username</span>
            <input
              type="text"
              value={form.email}
              onChange={onChange('email')}
              placeholder="email or username"
              style={{ padding: '12px 14px',fontSize: 16, borderRadius: 10, border: '1px solid var(--primary)', background: '#fff', color: '#fff' }}
            />
            {errors.email && (
              <span style={{ color: '#ff6b6b', fontSize: 12 }}>{errors.email}</span>
            )}
          </label>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#fff' }}>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={onChange('password')}
              placeholder="••••••"
              style={{ padding: '12px 14px', fontSize: 16, borderRadius: 10, border: '1px solid var(--primary)', background: '#fff', color: '#111' }}
            />
            {errors.password && (
              <span style={{ color: '#ff6b6b', fontSize: 12 }}>{errors.password}</span>
            )}
          </label>
          <button
            type="submit"
            disabled={submitting}
            style={{ marginTop: 10, padding: '12px 14px', fontSize: 16, width: '100%', borderRadius: 10, border: '1px solid var(--primary)', background: submitting ? '#b1b1b1' : 'var(--accent)', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}
