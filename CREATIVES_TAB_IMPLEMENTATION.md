# 🎨 Creatives Gallery Tab - Implementation Plan

## Feature Overview:
Visual grid of email campaigns showing preview images with performance metrics

## Layout:
```
Sort by: [Send Date ▼] [Open Rate] [Click Rate] [Revenue/Recipient]

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ [Preview]    │ [Preview]    │ [Preview]    │ [Preview]    │
│  Campaign 1  │  Campaign 2  │  Campaign 3  │  Campaign 4  │
│              │              │              │              │
│  45.2% OR    │  38.1% OR    │  52.3% OR    │  41.9% OR    │
│  $2,500 rev  │  $1,200 rev  │  $3,800 rev  │  $2,100 rev  │
│  Oct 8       │  Oct 7       │  Oct 6       │  Oct 5       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Implementation Steps:

### 1. Extract First Image from HTML
```typescript
function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^">]+)"/i)
  return match ? match[1] : null
}
```

### 2. Grid Layout (Tailwind)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {campaigns.map(campaign => (
    <CreativeCard campaign={campaign} />
  ))}
</div>
```

### 3. Creative Card Component
```tsx
<Card onClick={() => setSelectedCreative(campaign)}>
  <div className="aspect-[9/16] overflow-hidden">
    <img src={extractFirstImage(campaign.email_html)} />
  </div>
  <CardContent>
    <h3>{campaign.campaign_name}</h3>
    <div className="stats">
      <span>{(campaign.open_rate * 100).toFixed(1)}% OR</span>
      <span>${campaign.revenue.toLocaleString()}</span>
    </div>
  </CardContent>
</Card>
```

### 4. Full Preview Modal
Click card → Modal with full email iframe

### 5. Sorting
```typescript
const sortedCampaigns = campaigns
  .filter(c => c.email_html)
  .sort((a, b) => {
    switch(sortField) {
      case 'send_date': return b.send_date - a.send_date
      case 'open_rate': return b.open_rate - a.open_rate
      // etc
    }
  })
```

## Time Estimate: 2-3 hours

## Features:
✅ Visual grid with email thumbnails
✅ Sort by 5+ metrics
✅ Click to see full preview
✅ Responsive (1-4 columns)
✅ Performance metrics on each card
✅ Clean, professional design

