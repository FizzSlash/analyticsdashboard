'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber, formatPercentage, getGrowthColor } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: number | string
  change?: number
  changeType?: 'percentage' | 'number' | 'currency'
  format?: 'currency' | 'number' | 'percentage'
  icon?: React.ReactNode
  description?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'percentage',
  format = 'number',
  icon,
  description 
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return formatPercentage(val)
      case 'number':
      default:
        return formatNumber(val)
    }
  }

  const formatChange = (val: number) => {
    switch (changeType) {
      case 'currency':
        return formatCurrency(val)
      case 'number':
        return formatNumber(val)
      case 'percentage':
      default:
        return formatPercentage(val)
    }
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${getGrowthColor(change)}`}>
            {getTrendIcon(change)}
            <span className="ml-1">
              {change > 0 ? '+' : ''}{formatChange(Math.abs(change))} from last period
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
