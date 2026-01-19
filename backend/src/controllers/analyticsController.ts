import { Request, Response } from 'express'
import { pool } from '../db'

// Helper to get date ranges
const getDateRange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'daily':
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      }
    case 'weekly':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - 7)
      return {
        start: weekStart.toISOString(),
        end: now.toISOString()
      }
    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        start: monthStart.toISOString(),
        end: now.toISOString()
      }
    case 'yearly':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return {
        start: yearStart.toISOString(),
        end: now.toISOString()
      }
  }
}

export const getProjectProfitability = async (req: Request, res: Response) => {
  try {
    // Get all projects first
    const projectsQuery = `SELECT * FROM projects ORDER BY project_id DESC`
    const projectsResult = await pool.query(projectsQuery)
    
    // Get receivables by project
    const receivablesQuery = `
      SELECT project_id, SUM(amount) as total_revenue
      FROM receivables
      WHERE is_active = true AND project_id IS NOT NULL
      GROUP BY project_id
    `
    const receivablesResult = await pool.query(receivablesQuery)
    const receivablesMap = new Map(receivablesResult.rows.map(r => [r.project_id, Number(r.total_revenue)]))
    
    // Get payables by project
    const payablesQuery = `
      SELECT project_id, SUM(amount) as total_costs
      FROM payables
      WHERE is_active = true AND project_id IS NOT NULL
      GROUP BY project_id
    `
    const payablesResult = await pool.query(payablesQuery)
    const payablesMap = new Map(payablesResult.rows.map(p => [p.project_id, Number(p.total_costs)]))
    
    // Get project items by project
    const itemsQuery = `
      SELECT project_id, SUM(unit_cost) as total_items_cost
      FROM project_items
      GROUP BY project_id
    `
    const itemsResult = await pool.query(itemsQuery)
    const itemsMap = new Map(itemsResult.rows.map(i => [i.project_id, Number(i.total_items_cost)]))
    
    // Calculate margins and variances
    const projectsWithMetrics = projectsResult.rows.map(project => {
      const revenue = receivablesMap.get(project.project_id) || 0
      const directCosts = payablesMap.get(project.project_id) || 0
      const itemsCost = itemsMap.get(project.project_id) || 0
      const totalCosts = directCosts + itemsCost
      const margin = revenue - totalCosts
      const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0
      const totalBudget = Number(project.initial_cost_budget) + Number(project.extra_budget_allocation)
      const actualCost = totalCosts
      const variance = totalBudget - actualCost
      const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0
      const wip = project.status === 'ongoing' ? totalBudget - revenue : 0

      return {
        project_id: project.project_id,
        project_name: project.projects_name,
        customer_name: project.customer_name,
        status: project.status,
        revenue: revenue,
        direct_costs: directCosts,
        items_cost: itemsCost,
        total_costs: totalCosts,
        margin: margin,
        margin_percentage: marginPercentage,
        budget: totalBudget,
        actual_cost: actualCost,
        variance: variance,
        variance_percentage: variancePercentage,
        wip_value: wip
      }
    })

    // Calculate summary metrics
    const summary = {
      total_projects: projectsWithMetrics.length,
      average_margin_percentage: projectsWithMetrics.length > 0
        ? projectsWithMetrics.reduce((sum, p) => sum + p.margin_percentage, 0) / projectsWithMetrics.length
        : 0,
      total_wip: projectsWithMetrics.reduce((sum, p) => sum + p.wip_value, 0),
      total_revenue: projectsWithMetrics.reduce((sum, p) => sum + p.revenue, 0),
      total_costs: projectsWithMetrics.reduce((sum, p) => sum + p.total_costs, 0),
      total_margin: projectsWithMetrics.reduce((sum, p) => sum + p.margin, 0)
    }

    return res.json({
      summary,
      projects: projectsWithMetrics
    })
  } catch (err) {
    console.error('Project profitability error:', err)
    const message = err instanceof Error ? err.message : 'server_error'
    return res.status(500).json({ error: message })
  }
}

export const getARAgingReport = async (req: Request, res: Response) => {
  try {
    // Get aging buckets
    const agingQuery = `
      SELECT 
        CASE 
          WHEN CURRENT_DATE - created_at::date <= 30 THEN '0-30 days'
          WHEN CURRENT_DATE - created_at::date <= 60 THEN '31-60 days'
          WHEN CURRENT_DATE - created_at::date <= 90 THEN '61-90 days'
          ELSE '90+ days'
        END as age_bucket,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(CURRENT_DATE - created_at::date) as avg_days
      FROM receivables
      WHERE is_active = true
      GROUP BY 
        CASE 
          WHEN CURRENT_DATE - created_at::date <= 30 THEN '0-30 days'
          WHEN CURRENT_DATE - created_at::date <= 60 THEN '31-60 days'
          WHEN CURRENT_DATE - created_at::date <= 90 THEN '61-90 days'
          ELSE '90+ days'
        END
      ORDER BY 
        CASE 
          WHEN CASE 
            WHEN CURRENT_DATE - created_at::date <= 30 THEN '0-30 days'
            WHEN CURRENT_DATE - created_at::date <= 60 THEN '31-60 days'
            WHEN CURRENT_DATE - created_at::date <= 90 THEN '61-90 days'
            ELSE '90+ days'
          END = '0-30 days' THEN 1
          WHEN CASE 
            WHEN CURRENT_DATE - created_at::date <= 30 THEN '0-30 days'
            WHEN CURRENT_DATE - created_at::date <= 60 THEN '31-60 days'
            WHEN CURRENT_DATE - created_at::date <= 90 THEN '61-90 days'
            ELSE '90+ days'
          END = '31-60 days' THEN 2
          WHEN CASE 
            WHEN CURRENT_DATE - created_at::date <= 30 THEN '0-30 days'
            WHEN CURRENT_DATE - created_at::date <= 60 THEN '31-60 days'
            WHEN CURRENT_DATE - created_at::date <= 90 THEN '61-90 days'
            ELSE '90+ days'
          END = '61-90 days' THEN 3
          ELSE 4
        END
    `
    
    const agingResult = await pool.query(agingQuery)

    // Calculate DSO (Days Sales Outstanding)
    const dsoQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_receivables,
        COALESCE(AVG(CURRENT_DATE - created_at::date), 0) as avg_days_outstanding
      FROM receivables
      WHERE is_active = true
    `
    
    const dsoResult = await pool.query(dsoQuery)
    
    // Get total revenue for DSO calculation
    const revenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_revenue
      FROM receivables
      WHERE is_active = true
    `
    const revenueResult = await pool.query(revenueQuery)
    
    const totalReceivables = Number(dsoResult.rows[0]?.total_receivables) || 0
    const totalRevenue = Number(revenueResult.rows[0]?.total_revenue) || 0
    const avgDaysOutstanding = Number(dsoResult.rows[0]?.avg_days_outstanding) || 0
    
    // DSO calculation: (Total Receivables / Total Revenue) * 365
    const dso = totalRevenue > 0 ? (totalReceivables / totalRevenue) * 365 : avgDaysOutstanding

    return res.json({
      dso_days: Math.round(dso),
      avg_days_outstanding: Math.round(avgDaysOutstanding),
      total_outstanding: totalReceivables,
      aging_buckets: agingResult.rows.map(row => ({
        bucket: row.age_bucket,
        count: Number(row.count),
        amount: Number(row.total_amount),
        avg_days: Math.round(Number(row.avg_days))
      }))
    })
  } catch (err) {
    console.error('AR Aging error:', err)
    const message = err instanceof Error ? err.message : 'server_error'
    return res.status(500).json({ error: message })
  }
}

export const getRecurringRevenue = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        frequency,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM receivables
      WHERE receivable_type = 'RECURRING' AND is_active = true
      GROUP BY frequency
    `
    
    const result = await pool.query(query)
    
    // Calculate MRR (normalize all to monthly)
    let mrr = 0
    const breakdown: any[] = []
    
    result.rows.forEach(row => {
      const amount = Number(row.total_amount) || 0
      const count = Number(row.count)
      let monthlyAmount = 0
      
      switch (row.frequency) {
        case 'WEEKLY':
          monthlyAmount = amount * 4.33 // Average weeks per month
          break
        case 'MONTHLY':
          monthlyAmount = amount
          break
        case 'YEARLY':
          monthlyAmount = amount / 12
          break
        default:
          monthlyAmount = amount
      }
      
      mrr += monthlyAmount
      breakdown.push({
        frequency: row.frequency,
        count: count,
        amount: amount,
        monthly_normalized: monthlyAmount
      })
    })
    
    const arr = mrr * 12

    return res.json({
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      breakdown: breakdown
    })
  } catch (err) {
    console.error('Recurring revenue error:', err)
    const message = err instanceof Error ? err.message : 'server_error'
    return res.status(500).json({ error: message })
  }
}

export const getSalesPipeline = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        project_id,
        projects_name as project_name,
        customer_name,
        (initial_cost_budget + extra_budget_allocation) as estimated_value,
        status
      FROM projects
      WHERE status = 'pending'
      ORDER BY (initial_cost_budget + extra_budget_allocation) DESC
    `
    
    const result = await pool.query(query)
    
    const totalValue = result.rows.reduce((sum, project) => 
      sum + Number(project.estimated_value), 0
    )

    return res.json({
      total_pipeline_value: totalValue,
      pending_projects_count: result.rows.length,
      projects: result.rows.map(row => ({
        project_id: row.project_id,
        project_name: row.project_name,
        customer_name: row.customer_name,
        estimated_value: Number(row.estimated_value),
        status: row.status
      }))
    })
  } catch (err) {
    console.error('Sales pipeline error:', err)
    const message = err instanceof Error ? err.message : 'server_error'
    return res.status(500).json({ error: message })
  }
}

export const getProfitLoss = async (req: Request, res: Response) => {
  try {
    // Total Revenue
    const revenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_revenue
      FROM receivables
      WHERE is_active = true
    `
    const revenueResult = await pool.query(revenueQuery)
    
    // Project Costs
    const projectCostsQuery = `
      SELECT COALESCE(SUM(amount), 0) as project_costs
      FROM payables
      WHERE project_id IS NOT NULL AND is_active = true
    `
    const projectCostsResult = await pool.query(projectCostsQuery)
    
    // Operating Costs (non-project payables)
    const operatingCostsQuery = `
      SELECT COALESCE(SUM(amount), 0) as operating_costs
      FROM payables
      WHERE project_id IS NULL AND is_active = true
    `
    const operatingCostsResult = await pool.query(operatingCostsQuery)
    
    // Project items costs
    const itemsCostsQuery = `
      SELECT COALESCE(SUM(unit_cost), 0) as items_costs
      FROM project_items
    `
    const itemsCostsResult = await pool.query(itemsCostsQuery)
    
    const totalRevenue = Number(revenueResult.rows[0]?.total_revenue) || 0
    const projectCosts = Number(projectCostsResult.rows[0]?.project_costs) || 0
    const operatingCosts = Number(operatingCostsResult.rows[0]?.operating_costs) || 0
    const itemsCosts = Number(itemsCostsResult.rows[0]?.items_costs) || 0
    
    const totalCosts = projectCosts + operatingCosts + itemsCosts
    const grossProfit = totalRevenue - totalCosts
    const netProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    return res.json({
      total_revenue: totalRevenue,
      cost_breakdown: {
        project_costs: projectCosts,
        operating_costs: operatingCosts,
        items_costs: itemsCosts,
        total_costs: totalCosts
      },
      gross_profit: grossProfit,
      net_profit_margin_percentage: netProfitMargin
    })
  } catch (err) {
    console.error('Profit & Loss error:', err)
    const message = err instanceof Error ? err.message : 'server_error'
    return res.status(500).json({ error: message })
  }
}

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'monthly'
  
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
    return res.status(400).json({ error: 'Invalid period' })
  }
  
  const dateRange = getDateRange(period as 'daily' | 'weekly' | 'monthly' | 'yearly')
  
  try {
    // Get financial summary
    const accountsResult = await pool.query(
      `SELECT 
        SUM(current_balance) as total_balance,
        COUNT(*) as account_count
       FROM company_bank_accounts`
    )
    
    // Get projects summary - projects table doesn't have created_at, so we show all projects
    const projectsResult = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(initial_cost_budget + extra_budget_allocation) as total_budget
       FROM projects
       GROUP BY status`
    )
    
    // Get all projects for overall stats (same as period since no created_at column)
    const allProjectsResult = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(initial_cost_budget + extra_budget_allocation) as total_budget
       FROM projects
       GROUP BY status`
    )
    
    // Get payables summary
    const payablesResult = await pool.query(
      `SELECT 
        SUM(amount) as total_payables,
        COUNT(*) as payable_count
       FROM payables
       WHERE created_at >= $1 AND created_at < $2 AND is_active = true`,
      [dateRange.start, dateRange.end]
    )
    
    // Get all payables for overall stats
    const allPayablesResult = await pool.query(
      `SELECT 
        SUM(amount) as total_payables,
        COUNT(*) as payable_count
       FROM payables
       WHERE is_active = true`
    )
    
    // Get receivables summary
    const receivablesResult = await pool.query(
      `SELECT 
        SUM(amount) as total_receivables,
        COUNT(*) as receivable_count
       FROM receivables
       WHERE created_at >= $1 AND created_at < $2 AND is_active = true`,
      [dateRange.start, dateRange.end]
    )
    
    // Get all receivables for overall stats
    const allReceivablesResult = await pool.query(
      `SELECT 
        SUM(amount) as total_receivables,
        COUNT(*) as receivable_count
       FROM receivables
       WHERE is_active = true`
    )
    
    // Get petty cash
    const pettyCashResult = await pool.query(
      `SELECT current_balance FROM petty_cash_account LIMIT 1`
    )
    
    // Get petty cash transactions for period
    const pettyCashTransactionsResult = await pool.query(
      `SELECT 
        transaction_type,
        SUM(amount) as total
       FROM petty_cash_transactions
       WHERE created_at >= $1 AND created_at < $2
       GROUP BY transaction_type`,
      [dateRange.start, dateRange.end]
    )
    
    // Get employees summary
    const employeesResult = await pool.query(
      `SELECT 
        role,
        COUNT(*) as count
       FROM employees
       GROUP BY role`
    )
    
    // Get vendors summary
    const vendorsResult = await pool.query(
      `SELECT 
        is_active,
        COUNT(*) as count
       FROM vendors
       GROUP BY is_active`
    )
    
    // Get assets summary
    const assetsResult = await pool.query(
      `SELECT 
        SUM(value) as total_value,
        COUNT(*) as count
       FROM assets`
    )
    
    // Get daily transaction data for charts (last 30 days)
    const transactionTrendsResult = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        'payable' as type,
        SUM(amount) as amount
       FROM payables
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       UNION ALL
       SELECT 
        DATE(created_at) as date,
        'receivable' as type,
        SUM(amount) as amount
       FROM receivables
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    )
    
    // Get enhanced metrics - Fix nested aggregate by using subquery
    const profitabilityResult = await pool.query(`
      SELECT 
        COALESCE(AVG(margin_pct), 0) as avg_margin
      FROM (
        SELECT 
          p.project_id,
          CASE 
            WHEN COALESCE(SUM(r.amount), 0) > 0 
            THEN ((COALESCE(SUM(r.amount), 0) - COALESCE(SUM(pay.amount), 0)) / COALESCE(SUM(r.amount), 0)) * 100
            ELSE 0
          END as margin_pct
        FROM projects p
        LEFT JOIN receivables r ON r.project_id = p.project_id AND r.is_active = true
        LEFT JOIN payables pay ON pay.project_id = p.project_id AND pay.is_active = true
        GROUP BY p.project_id
      ) project_margins
    `)

    return res.json({
      period,
      dateRange,
      summary: {
        accounts: {
          total_balance: accountsResult.rows[0]?.total_balance || 0,
          account_count: accountsResult.rows[0]?.account_count || 0
        },
        projects: {
          period: projectsResult.rows,
          overall: allProjectsResult.rows
        },
        payables: {
          period: {
            total: payablesResult.rows[0]?.total_payables || 0,
            count: payablesResult.rows[0]?.payable_count || 0
          },
          overall: {
            total: allPayablesResult.rows[0]?.total_payables || 0,
            count: allPayablesResult.rows[0]?.payable_count || 0
          }
        },
        receivables: {
          period: {
            total: receivablesResult.rows[0]?.total_receivables || 0,
            count: receivablesResult.rows[0]?.receivable_count || 0
          },
          overall: {
            total: allReceivablesResult.rows[0]?.total_receivables || 0,
            count: allReceivablesResult.rows[0]?.receivable_count || 0
          }
        },
        petty_cash: {
          balance: pettyCashResult.rows[0]?.current_balance || 0,
          transactions: pettyCashTransactionsResult.rows
        },
        employees: employeesResult.rows,
        vendors: vendorsResult.rows,
        assets: {
          total_value: assetsResult.rows[0]?.total_value || 0,
          count: assetsResult.rows[0]?.count || 0
        },
        transaction_trends: transactionTrendsResult.rows,
        enhanced_metrics: {
          avg_project_margin: Number(profitabilityResult.rows[0]?.avg_margin) || 0
        }
      }
    })
  } catch (err) {
    console.error('Analytics error:', err)
    const message = err instanceof Error ? err.message : 'server_error'
    return res.status(500).json({ error: message })
  }
}
