import { Request, Response } from 'express'
import { query } from '../db'

export const getAssets = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM assets ORDER BY created_at DESC')
    res.json({ assets: result.rows })
  } catch (err) {
    console.error('Error fetching assets:', err)
    res.status(500).json({ error: 'Failed to fetch assets' })
  }
}

export const createAsset = async (req: Request, res: Response) => {
  const { asset_name, value, purchase_date } = req.body
  
  if (!asset_name || !value || !purchase_date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await query(
      'INSERT INTO assets (asset_name, value, purchase_date) VALUES ($1, $2, $3) RETURNING *',
      [asset_name, value, purchase_date]
    )
    res.status(201).json({ asset: result.rows[0] })
  } catch (err) {
    console.error('Error creating asset:', err)
    res.status(500).json({ error: 'Failed to create asset' })
  }
}
