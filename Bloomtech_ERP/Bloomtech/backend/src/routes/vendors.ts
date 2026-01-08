import { Router } from 'express'
import { getAllVendors, createVendor } from '../controllers/vendorController'

const router = Router()

router.get('/', getAllVendors)
router.post('/', createVendor)

export default router
