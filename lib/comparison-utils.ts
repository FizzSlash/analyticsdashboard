/**
 * Period-over-Period Comparison Utilities
 * Calculates real growth metrics by comparing current period to previous period
 */

export interface ComparisonResult {
  currentValue: number
  previousValue: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * Calculate period-over-period comparison for any metric
 * @param currentData - Data for the current period
 * @param previousData - Data for the previous (comparison) period
 * @param metric - The metric field to compare (e.g., 'revenue', 'opens')
 * @returns Comparison result with change and trend
 */
export function calculatePeriodComparison(
  currentData: any[],
  previousData: any[],
  metric: string
): ComparisonResult {
  const currentValue = currentData.reduce((sum, item) => sum + (item[metric] || 0), 0)
  const previousValue = previousData.reduce((sum, item) => sum + (item[metric] || 0), 0)
  
  const change = currentValue - previousValue
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0
  
  const trend = changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable'
  
  return {
    currentValue,
    previousValue,
    change,
    changePercent,
    trend
  }
}

/**
 * Format comparison for display
 * @param comparison - Comparison result
 * @param format - How to format the change (percentage, currency, number)
 * @returns Formatted string like "+12.5%" or "+$1,250"
 */
export function formatComparison(
  comparison: ComparisonResult,
  format: 'percentage' | 'currency' | 'number' = 'percentage'
): string {
  const { change, changePercent } = comparison
  const sign = change >= 0 ? '+' : ''
  
  switch (format) {
    case 'percentage':
      return `${sign}${changePercent.toFixed(1)}%`
    case 'currency':
      return `${sign}$${Math.abs(change).toLocaleString()}`
    case 'number':
      return `${sign}${change.toLocaleString()}`
    default:
      return `${sign}${changePercent.toFixed(1)}%`
  }
}

/**
 * Get comparison icon emoji
 */
export function getComparisonIcon(comparison: ComparisonResult): string {
  switch (comparison.trend) {
    case 'up':
      return '↗️'
    case 'down':
      return '↘️'
    default:
      return '→'
  }
}

/**
 * Get comparison color class for Tailwind
 */
export function getComparisonColorClass(comparison: ComparisonResult): string {
  switch (comparison.trend) {
    case 'up':
      return 'text-green-300'
    case 'down':
      return 'text-red-300'
    default:
      return 'text-yellow-300'
  }
}

/**
 * Fetch previous period data for comparison
 * @param timeframe - Current timeframe in days
 * @returns Object with start/end dates for previous period
 */
export function getPreviousPeriodDates(timeframe: number): { start: Date, end: Date } {
  const now = new Date()
  const currentPeriodStart = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000)
  
  const previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1) // Day before current period
  const previousPeriodStart = new Date(previousPeriodEnd.getTime() - timeframe * 24 * 60 * 60 * 1000)
  
  return {
    start: previousPeriodStart,
    end: previousPeriodEnd
  }
}

/**
 * Filter data for previous period
 * @param data - Full dataset
 * @param dateField - Field name for date filtering
 * @param timeframe - Current timeframe in days
 * @returns Data from previous period
 */
export function getPreviousPeriodData(
  data: any[],
  dateField: string,
  timeframe: number
): any[] {
  const { start, end } = getPreviousPeriodDates(timeframe)
  
  return data.filter(item => {
    if (!item[dateField]) return false
    
    try {
      const itemDate = new Date(item[dateField])
      return itemDate >= start && itemDate <= end
    } catch (error) {
      return false
    }
  })
}

