'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"
import { CampaignMetric, FlowMetric } from "@/lib/supabase"

interface PerformanceTableProps {
  title: string
  data: CampaignMetric[] | FlowMetric[]
  type: 'campaigns' | 'flows'
  className?: string
}

export function PerformanceTable({ title, data, type, className }: PerformanceTableProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  {type === 'campaigns' ? 'Campaign' : 'Flow'}
                </th>
                {type === 'campaigns' ? (
                  <>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Recipients</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Open Rate</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Click Rate</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Revenue</th>
                  </>
                ) : (
                  <>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Triggered</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Completion Rate</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Revenue/Trigger</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {type === 'campaigns' 
                ? (data as CampaignMetric[]).map((campaign, index) => (
                    <tr key={campaign.id} className={index !== data.length - 1 ? 'border-b' : ''}>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-sm">
                            {campaign.campaign_name || 'Untitled Campaign'}
                          </div>
                          {campaign.subject_line && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {campaign.subject_line}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 text-sm">
                        {formatNumber(campaign.recipients_count)}
                      </td>
                      <td className="text-right py-3 px-2 text-sm">
                        {campaign.open_rate ? formatPercentage(campaign.open_rate) : '-'}
                      </td>
                      <td className="text-right py-3 px-2 text-sm">
                        {campaign.click_rate ? formatPercentage(campaign.click_rate) : '-'}
                      </td>
                      <td className="text-right py-3 px-2 text-sm font-medium">
                        {formatCurrency(campaign.revenue)}
                      </td>
                    </tr>
                  ))
                : (data as FlowMetric[]).map((flow, index) => (
                    <tr key={flow.id} className={index !== data.length - 1 ? 'border-b' : ''}>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-sm">
                            {flow.flow_name || 'Untitled Flow'}
                          </div>
                          {flow.flow_type && (
                            <div className="text-xs text-muted-foreground capitalize">
                              {flow.flow_type.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 text-sm">
                        {formatNumber(flow.triggered_count)}
                      </td>
                      <td className="text-right py-3 px-2 text-sm">
                        {flow.completion_rate ? formatPercentage(flow.completion_rate) : '-'}
                      </td>
                      <td className="text-right py-3 px-2 text-sm font-medium">
                        {formatCurrency(flow.revenue)}
                      </td>
                      <td className="text-right py-3 px-2 text-sm">
                        {flow.revenue_per_trigger ? formatCurrency(flow.revenue_per_trigger) : '-'}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
