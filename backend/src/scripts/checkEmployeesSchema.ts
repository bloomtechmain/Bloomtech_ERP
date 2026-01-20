import { pool } from '../db'

async function main() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'employees';
    `)
    console.log('Employees table columns:', res.rows)
  } catch (err) {
    console.error('Error checking schema:', err)
  } finally {
    await pool.end()
  }
}

main()
