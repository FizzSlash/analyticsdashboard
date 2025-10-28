# Debug: Why Metric Not Showing in Edit Form

## Check These:

1. **Does the client have metric data in database?**
```sql
SELECT 
  brand_name,
  conversion_metric_id,
  conversion_metric_name,
  conversion_metric_integration
FROM clients
WHERE brand_slug = 'your-client-slug';
```

2. **Is editingClient populated correctly?**
- Check browser console when you click Edit
- Should see client object with metric fields

3. **Is the condition met?**
- Condition: `editingClient && editingClient.conversion_metric_id`
- Both must be true

## Quick Fix:

Add logging to see what's happening:
```typescript
console.log('EDIT CLIENT:', editingClient)
console.log('HAS METRIC?', editingClient?.conversion_metric_id)
```

