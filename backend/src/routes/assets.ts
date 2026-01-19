import { Router } from 'express'
import { getAssets, createAsset, getDepreciationSchedule } from '../controllers/assetsController'

const router = Router()

router.get('/', getAssets)
router.post('/', createAsset)
router.get('/:id/depreciation-schedule', getDepreciationSchedule)

export default router
