import 'dotenv/config'
import { Pool } from 'pg'

export const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
})

export const query = (text: string, params?: unknown[]) => pool.query(text, params)

