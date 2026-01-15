import { Router } from 'express'
import { createReceivable, getReceivables } from '../controllers/receivableController'

const router = Router()

router.get('/', getReceivables)
router.post('/', createReceivable)

export default router
