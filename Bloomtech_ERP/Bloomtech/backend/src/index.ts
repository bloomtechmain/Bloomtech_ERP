import express from 'express'
import cors from 'cors'
import { pool } from './db'
import bcrypt from 'bcryptjs'
import employeeRoutes from './routes/employees'
import projectRoutes from './routes/projects'
import accountsRoutes from './routes/accounts'
import vendorRoutes from './routes/vendors'
import payableRoutes from './routes/payables'
import pettyCashRoutes from './routes/pettyCash'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/employees', employeeRoutes)
app.use('/projects', projectRoutes)
app.use('/accounts', accountsRoutes)
app.use('/vendors', vendorRoutes)
app.use('/payables', payableRoutes)
app.use('/petty-cash', pettyCashRoutes)


app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' })
  try {
    const r = await pool.query('SELECT id,name,email,password_hash,role FROM users WHERE email=$1 OR name=$1 LIMIT 1', [email])
    if (!r.rows.length) return res.status(401).json({ error: 'invalid_credentials' })
    const u = r.rows[0] as { id: number; name: string; email: string; password_hash: string; role: string }
    const ok = await bcrypt.compare(password, u.password_hash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
    return res.json({ id: u.id, name: u.name, email: u.email, role: u.role })
  } catch (e) {
    console.error('/auth/login error', e)
    return res.status(500).json({ error: 'server_error' })
  }
})

if (process.env.NODE_ENV !== 'production') {
  app.post('/dev/seed-user', async (req, res) => {
    const { name, email, password, role } = req.body as { name?: string; email?: string; password?: string; role?: string }
    if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' })
    try {
      const hash = await bcrypt.hash(password, 10)
      const r = await pool.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id', [name, email, hash, role ?? 'user'])
      return res.json({ inserted: r.rowCount })
    } catch (e) {
      console.error('/dev/seed-user error', e)
      return res.status(500).json({ error: 'server_error' })
    }
  })
  app.post('/dev/upsert-user', async (req, res) => {
    const { name, email, password, role } = req.body as { name?: string; email?: string; password?: string; role?: string }
    if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' })
    try {
      const hash = await bcrypt.hash(password, 10)
      const r = await pool.query(
        `INSERT INTO users(name,email,password_hash,role)
         VALUES($1,$2,$3,$4)
         ON CONFLICT(email) DO UPDATE
         SET name=EXCLUDED.name,
             password_hash=EXCLUDED.password_hash,
             role=EXCLUDED.role
         RETURNING id`,
        [name, email, hash, role ?? 'user']
      )
      return res.json({ upserted: r.rowCount })
    } catch (e) {
      console.error('/dev/upsert-user error', e)
      return res.status(500).json({ error: 'server_error' })
    }
  })
}

const port = process.env.PORT ? Number(process.env.PORT) : 3000
app.listen(port, () 
  pool.connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => {
    console.error('❌ Database connection error:', err);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'is set' : 'is NOT set');
    process.exit(1);
  });
  
  => {
  console.log(`API on http://localhost:${port}`)
})

