import { Router } from 'express'
import { replenishPettyCash, getPettyCashBalance, addPettyCashBill, getPettyCashTransactions } from '../controllers/pettyCashController'

const router = Router()

router.get('/balance', getPettyCashBalance)
router.post('/replenish', replenishPettyCash)
router.post('/bill', addPettyCashBill)
router.get('/transactions', getPettyCashTransactions)

export default router
