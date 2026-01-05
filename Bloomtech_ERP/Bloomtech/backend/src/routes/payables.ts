import { Router } from 'express'
import { getAllPayables, createPayable } from '../controllers/payableController'

const router = Router()

router.get('/', getAllPayables)
router.post('/', createPayable)

export default router
