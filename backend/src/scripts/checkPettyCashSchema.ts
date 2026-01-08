import { pool } from '../db'

async function main() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'petty_cash_account';
    `)
    console.log(res.rows)
  } catch (err) {
    console.error(err)
  } finally {
    await pool.end()
  }
}

main()
