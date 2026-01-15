import { Router } from 'express'
import { 
  getAnalyticsSummary,
  getProjectProfitability,
  getARAgingReport,
  getRecurringRevenue,
  getSalesPipeline,
  getProfitLoss
} from '../controllers/analyticsController'

const router = Router()

router.get('/summary', getAnalyticsSummary)
router.get('/project-profitability', getProjectProfitability)
router.get('/ar-aging', getARAgingReport)
router.get('/recurring-revenue', getRecurringRevenue)
router.get('/pipeline', getSalesPipeline)
router.get('/profit-loss', getProfitLoss)

export default router
