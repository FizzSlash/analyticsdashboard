'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"
import { getChartColors } from '@/lib/brand-colors'

interface ChartProps {
  title: string
  data: any[]
  className?: string
}

interface LineChartProps extends ChartProps {
  xKey: string
  yKey: string
  yLabel?: string
  color?: string
  format?: 'currency' | 'number' | 'percentage'
  client?: any // Add client for brand colors
}

interface BarChartProps extends ChartProps {
  xKey: string
  yKey: string
  color?: string
  format?: 'currency' | 'number' | 'percentage'
  client?: any // Add client for brand colors
}

interface PieChartProps extends ChartProps {
  dataKey: string
  nameKey: string
  colors?: string[]
  client?: any // Add client for brand colors
}

// Dynamic colors based on client branding - will be passed as props
const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export function CustomLineChart({ 
  title, 
  data, 
  xKey, 
  yKey, 
  yLabel, 
  color,
  format = 'number',
  className,
  client
}: LineChartProps) {
  // Use client chart colors
  const chartColors = getChartColors(client)
  const chartColor = color || chartColors[0] || '#3B82F6'
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      case 'number':
      default:
        return formatNumber(value)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xKey} 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), yLabel || yKey]}
              labelClassName="text-muted-foreground"
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={chartColor}
              strokeWidth={2}
              dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CustomBarChart({ 
  title, 
  data, 
  xKey, 
  yKey, 
  color,
  format = 'number',
  className,
  client
}: BarChartProps) {
  // Use client chart colors
  const chartColors = getChartColors(client)
  const chartColor = color || chartColors[0] || '#3B82F6'
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      case 'number':
      default:
        return formatNumber(value)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xKey} 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), yKey]}
              labelClassName="text-muted-foreground"
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey={yKey} fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CustomAreaChart({ 
  title, 
  data, 
  xKey, 
  yKey, 
  color,
  format = 'number',
  className,
  client
}: LineChartProps) {
  // Use client chart colors
  const chartColors = getChartColors(client)
  const chartColor = color || chartColors[0] || '#3B82F6'
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      case 'number':
      default:
        return formatNumber(value)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xKey} 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), yKey]}
              labelClassName="text-muted-foreground"
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${yKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CustomPieChart({ 
  title, 
  data, 
  dataKey, 
  nameKey, 
  colors,
  className,
  client
}: PieChartProps) {
  // Use client-based colors with fallback to defaults
  // Use client chart colors for consistent branding
  const clientChartColors = getChartColors(client)
  const chartColors = colors || [...clientChartColors, ...DEFAULT_COLORS.slice(3)]
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatNumber(value), dataKey]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
