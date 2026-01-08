import { Router } from 'express'
import { openAccount, getAccounts } from '../controllers/accountsController'
import { createDebitCard, getDebitCards } from '../controllers/debitCardController'

const router = Router()

router.post('/open-account', openAccount)
router.get('/', getAccounts)
router.post('/debit-cards', createDebitCard)
router.get('/debit-cards', getDebitCards)

export default router
