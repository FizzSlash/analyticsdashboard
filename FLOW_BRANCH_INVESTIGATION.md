# 🔀 Flow Branch Structure Investigation

## 🎯 Goal
Determine if Klaviyo's API provides parent-child relationships for BOOLEAN_BRANCH actions to enable true tree-based wireframe visualization.

## 📊 What We Currently Have

### Flow-Actions API Response (Flat List)
```json
{
  "data": [
    {"id": "87316674", "action_type": "TIME_DELAY"},
    {"id": "87316675", "action_type": "SEND_EMAIL"},
    {"id": "87316677", "action_type": "BOOLEAN_BRANCH", "settings": {"is_joined": false}},
    {"id": "87316678", "action_type": "SEND_EMAIL"},  // Which branch?
    {"id": "87316685", "action_type": "SEND_EMAIL"}   // Which branch?
  ]
}
```

## ❓ Questions to Answer

1. **Does Klaviyo provide parent-child relationships?**
   - Check for `parent_action_id` field
   - Check for `branch_path` or `branch_type` (YES/NO)
   - Check relationships data structure

2. **Are there additional API includes?**
   - Try: `?include=parent-action,child-actions`
   - Try: `?fields[flow-action]=parent_id,branch_type`

3. **Can we infer structure from order?**
   - Are actions ordered depth-first or breadth-first?
   - Is there a `position` or `order` field?

## 🔍 Investigation Steps

### Step 1: Check for Hidden Fields
Look in raw API response for any fields we're not displaying:
- [ ] `parent_action_id`
- [ ] `branch_id`
- [ ] `branch_type` (yes/no, true/false)
- [ ] `path`
- [ ] `position`
- [ ] `depth`

### Step 2: Test Include Parameters
```bash
# Try various includes
GET /flows/{flowId}/flow-actions/?include=parent-action
GET /flows/{flowId}/flow-actions/?include=child-actions
GET /flows/{flowId}/flow-actions/?include=related-actions
```

### Step 3: Check BOOLEAN_BRANCH Settings
Your data shows:
```json
{
  "action_type": "BOOLEAN_BRANCH",
  "settings": {
    "is_joined": false  // What does this mean?
  }
}
```

Questions:
- Does `is_joined: false` mean it's a split (not a merge)?
- Are there other settings that define branch conditions?
- Is there a separate API for branch definitions?

## 🎨 Visualization Options

### Option A: True Tree (If We Can Get Parent-Child Data)
```
                    ┌─→ Email 2 → Wait → Email 3
Trigger → Email 1 ──┤
                    └─→ Email 4 → Wait → Email 5
```

### Option B: Sequential with Indentation (If We Can Infer)
```
Trigger
├─ Email 1
├─ Wait 1 day
├─ 🔀 SPLIT
│  ├─ YES: Email 2
│  │  └─ Wait 1 day → Email 3
│  └─ NO: Email 4
│     └─ Wait 1 day → Email 5
```

### Option C: Current (What We Have Now)
```
Trigger
Email 1
Wait 1 day
🔀 Conditional Split
Email 2
Email 3
Email 4
```

## 📝 Next Steps

1. **Inspect full API response** - Check if there are fields we're ignoring
2. **Test include parameters** - See if Klaviyo supports relationship includes
3. **Contact Klaviyo support** - Ask if branch structure data is available
4. **Implement heuristic** - If no data, use smart guessing based on action order

## 🔗 Resources

- Klaviyo Flows API Docs: https://developers.klaviyo.com/en/reference/get_flows
- Flow Actions Endpoint: `/api/flows/{id}/flow-actions/`
- Current implementation: `lib/klaviyo.ts` line 242

