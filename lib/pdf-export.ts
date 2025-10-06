/**
 * PDF Export Utility for Audit Reports
 * Uses browser print dialog for simple, universal PDF generation
 */

export function exportAuditToPDF(client: any, audit: any) {
  // Create a printable HTML document
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Please allow popups to export PDF')
    return
  }

  const html = generateAuditPDF(client, audit)
  
  printWindow.document.write(html)
  printWindow.document.close()
  
  // Trigger print dialog after content loads
  printWindow.onload = () => {
    printWindow.print()
  }
}

function generateAuditPDF(client: any, audit: any) {
  const now = new Date().toLocaleDateString()
  
  const highPriority = audit.findings?.filter((f: any) => f.severity === 'high') || []
  const mediumPriority = audit.findings?.filter((f: any) => f.severity === 'medium') || []
  const lowPriority = audit.findings?.filter((f: any) => f.severity === 'low') || []
  const strengths = audit.strengths || []

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Marketing Audit - ${client.brand_name}</title>
  <style>
    @media print {
      @page {
        margin: 0.5in;
      }
      .page-break {
        page-break-after: always;
      }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1 {
      color: #7c3aed;
      font-size: 32px;
      margin-bottom: 8px;
      border-bottom: 3px solid #7c3aed;
      padding-bottom: 10px;
    }
    
    h2 {
      color: #374151;
      font-size: 24px;
      margin-top: 32px;
      margin-bottom: 16px;
      border-left: 4px solid #7c3aed;
      padding-left: 12px;
    }
    
    h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }
    
    .header {
      margin-bottom: 32px;
    }
    
    .score-card {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    
    .score-item {
      text-align: center;
    }
    
    .score-value {
      font-size: 48px;
      font-weight: bold;
      color: #7c3aed;
    }
    
    .score-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }
    
    .finding {
      margin-bottom: 24px;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    
    .finding.high {
      border-color: #ef4444;
      background: #fef2f2;
    }
    
    .finding.medium {
      border-color: #f59e0b;
      background: #fffbeb;
    }
    
    .finding.low {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    
    .finding-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .impact {
      background: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 12px 0;
      font-weight: 600;
    }
    
    .recommendation {
      background: #fff;
      padding: 12px;
      border-radius: 6px;
      margin: 8px 0;
      border-left: 3px solid #7c3aed;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      background: #fff;
    }
    
    .data-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .data-table td:first-child {
      color: #6b7280;
      width: 50%;
    }
    
    .data-table td:last-child {
      font-weight: 600;
    }
    
    .strength {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 AI Marketing Audit Report</h1>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
      <div>
        <div style="font-size: 24px; font-weight: bold;">${client.brand_name}</div>
        <div style="color: #6b7280;">Generated: ${now}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 14px; color: #6b7280;">Powered by</div>
        <div style="font-size: 16px; font-weight: 600; color: #7c3aed;">Claude Sonnet 4</div>
      </div>
    </div>
  </div>

  <div class="score-card">
    <div class="score-item">
      <div class="score-value">${audit.overall_score?.toFixed(1) || 'N/A'}</div>
      <div class="score-label">Overall Score</div>
    </div>
    <div class="score-item">
      <div class="score-value" style="color: #ef4444;">${highPriority.length}</div>
      <div class="score-label">High Priority</div>
    </div>
    <div class="score-item">
      <div class="score-value" style="color: #f59e0b;">${mediumPriority.length}</div>
      <div class="score-label">Medium Priority</div>
    </div>
    <div class="score-item">
      <div class="score-value" style="color: #3b82f6;">${lowPriority.length}</div>
      <div class="score-label">Opportunities</div>
    </div>
    <div class="score-item">
      <div class="score-value" style="color: #10b981;">${strengths.length}</div>
      <div class="score-label">Strengths</div>
    </div>
  </div>

  ${highPriority.length > 0 ? `
  <h2>🔴 HIGH PRIORITY FINDINGS</h2>
  ${highPriority.map((f: any) => `
    <div class="finding high">
      <div class="finding-title">${f.icon} ${f.title}</div>
      <div class="impact">💰 Impact: ${f.impact.value} | Confidence: ${f.impact.confidence}</div>
      <p>${f.analysis}</p>
      
      ${f.data_points && Object.keys(f.data_points).length > 0 ? `
        <h4>Supporting Data:</h4>
        <table class="data-table">
          ${Object.entries(f.data_points).map(([key, value]) => `
            <tr>
              <td>${key.replace(/_/g, ' ')}</td>
              <td>${value}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
      
      <h4>Recommendations:</h4>
      ${f.recommendations.map((r: any, i: number) => `
        <div class="recommendation">
          <strong>${i + 1}. ${r.action}</strong>
          <p>${r.details}</p>
          ${r.expected_improvement ? `<div style="color: #10b981; font-weight: 600; margin-top: 8px;">Expected: ${r.expected_improvement}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('')}
  ` : ''}

  ${mediumPriority.length > 0 ? `
  <h2>🟡 MEDIUM PRIORITY FINDINGS</h2>
  ${mediumPriority.map((f: any) => `
    <div class="finding medium">
      <div class="finding-title">${f.icon} ${f.title}</div>
      <div class="impact">💰 Impact: ${f.impact.value}</div>
      <p>${f.analysis}</p>
      
      <h4>Recommendations:</h4>
      ${f.recommendations.map((r: any, i: number) => `
        <div class="recommendation">
          <strong>${i + 1}. ${r.action}</strong>
          <p>${r.details}</p>
        </div>
      `).join('')}
    </div>
  `).join('')}
  ` : ''}

  ${lowPriority.length > 0 ? `
  <div class="page-break"></div>
  <h2>🟢 OPPORTUNITIES</h2>
  ${lowPriority.map((f: any) => `
    <div class="finding low">
      <div class="finding-title">${f.icon} ${f.title}</div>
      <p>${f.analysis}</p>
      ${f.recommendations.map((r: any) => `<div class="recommendation"><strong>${r.action}</strong><p>${r.details}</p></div>`).join('')}
    </div>
  `).join('')}
  ` : ''}

  ${strengths.length > 0 ? `
  <h2>✅ WORKING WELL</h2>
  ${strengths.map((s: any) => `
    <div class="strength">
      <div class="finding-title">${s.icon} ${s.title}</div>
      <p>${s.analysis}</p>
      <div style="background: #fff; padding: 8px 12px; border-radius: 6px; margin-top: 8px; font-weight: 600;">
        ${s.data}
      </div>
    </div>
  `).join('')}
  ` : ''}

  <div class="footer">
    <p>This AI-powered audit was generated by Claude Sonnet 4</p>
    <p>Report generated on ${now} | ${client.brand_name} Email Marketing Analytics</p>
    <p style="margin-top: 12px; font-style: italic;">These recommendations are based on your actual campaign and flow data from the last 90 days.</p>
  </div>
</body>
</html>
  `.trim()
}

