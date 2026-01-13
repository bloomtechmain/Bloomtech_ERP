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
import receivableRoutes from './routes/receivables'
import assetRoutes from './routes/assets'


// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  process.exit(1)
}

const app = express()

// Configure CORS
let corsOrigin: string | string[];
if (process.env.NODE_ENV === 'production') {
  corsOrigin = [
    process.env.FRONTEND_URL || '',
    'http://localhost:5173',
    'http://localhost:3000'
  ].filter((url) => url !== '')
} else {
  corsOrigin = '*'
}

const corsOptions = {
  origin: corsOrigin,
  credentials: true
}

console.log('🔐 CORS Configuration:', {
  env: process.env.NODE_ENV,
  origin: corsOrigin,
  frontend_url: process.env.FRONTEND_URL || 'NOT_SET'
})

app.use(cors(corsOptions))
app.use(express.json())

// Root endpoint for Railway health checks
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Bloomtech ERP API',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  })
})

app.use('/employees', employeeRoutes)
app.use('/projects', projectRoutes)
app.use('/accounts', accountsRoutes)
app.use('/vendors', vendorRoutes)
app.use('/payables', payableRoutes)
app.use('/petty-cash', pettyCashRoutes)
app.use('/receivables', receivableRoutes)
app.use('/assets', assetRoutes)



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

// Async startup function to ensure proper initialization order
async function startServer() {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000
  
  try {
    // First, test database connection
    console.log('🔄 Testing database connection...')
    await pool.connect()
    console.log('✅ Database connected successfully')
    
    // Then start the HTTP server
    console.log(`🔄 Starting HTTP server on port ${port}...`)
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is ready and accepting connections`)
      console.log(`🌐 API available at http://localhost:${port}`)
      console.log(`🎯 Health check endpoint: http://localhost:${port}/`)
    })
  } catch (err) {
    console.error('❌ Startup error:', err)
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'is set' : 'is NOT set')
    process.exit(1)
  }
}

// Start the server
startServer().catch(err => {
  console.error('❌ Fatal error during startup:', err)
  process.exit(1)
})
