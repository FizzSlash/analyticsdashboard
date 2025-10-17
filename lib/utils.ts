import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(num: number, decimals: number = 2): string {
  return `${num.toFixed(decimals)}%`
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function getGrowthColor(growth: number): string {
  if (growth > 0) return 'text-green-600'
  if (growth < 0) return 'text-red-600'
  return 'text-gray-600'
}

export function getDayOfWeekName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber] || 'Unknown'
}

export function getHourDisplay(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:00 ${period}`
}

export function generateDateRange(days: number): string[] {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

export function aggregateMetricsByDate(metrics: any[], dateField: string, valueFields: string[]) {
  const aggregated: { [key: string]: any } = {}
  
  metrics.forEach((metric: any) => {
    const date = metric[dateField]?.split('T')[0] || metric[dateField]
    if (!date) return
    
    if (!aggregated[date]) {
      aggregated[date] = { date }
      valueFields.forEach((field: string) => {
        aggregated[date][field] = 0
      })
    }
    
    valueFields.forEach((field: string) => {
      aggregated[date][field] += metric[field] || 0
    })
  })
  
  return Object.values(aggregated).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function calculateAverageMetrics(metrics: any[], fields: string[]) {
  if (metrics.length === 0) return {}
  
  const totals: { [key: string]: number } = {}
  fields.forEach((field: string) => {
    totals[field] = metrics.reduce((sum: number, metric: any) => sum + (metric[field] || 0), 0)
  })
  
  const averages: { [key: string]: number } = {}
  fields.forEach((field: string) => {
    averages[field] = totals[field] / metrics.length
  })
  
  return averages
}

/**
 * Calculate precise click rate from raw unique clicks data
 * Uses clicks_unique / recipients for more accuracy (2 decimals) than Klaviyo's rounded click_rate
 */
export function calculatePreciseClickRate(item: any): number {
  const clicks = item.clicks_unique || item.clicked_count || item.clicks || 0
  const recipients = item.recipients_count || item.recipients || item.weeklyRecipients || 0
  return recipients > 0 ? (clicks / recipients) : 0
}

/**
 * Calculate precise open rate from raw unique opens data
 * Uses opens_unique / recipients for more accuracy
 */
export function calculatePreciseOpenRate(item: any): number {
  const opens = item.opens_unique || item.opened_count || item.opens || 0
  const recipients = item.recipients_count || item.recipients || item.weeklyRecipients || 0
  return recipients > 0 ? (opens / recipients) : 0
}
