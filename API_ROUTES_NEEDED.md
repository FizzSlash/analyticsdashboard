# 🔌 API Routes Needed - Database Integration

**After running DATABASE_MIGRATION_FIXED.sql**

---

## ✅ WHAT'S DONE:
- [x] All database tables created
- [x] Triggers working (activity log, portal sync, scope counting)
- [x] RLS policies set

## 🔜 WHAT'S NEEDED:

### **Phase 1: Campaign API Routes** (2-3 hours)

**File:** `/app/api/ops/campaigns/route.ts`
```typescript
GET    /api/ops/campaigns?clientId=X&status=X
POST   /api/ops/campaigns
PATCH  /api/ops/campaigns/[id]
DELETE /api/ops/campaigns/[id]
```

**File:** `/app/api/ops/campaigns/upload/route.ts`
```typescript
POST /api/ops/campaigns/upload
// Upload image to Supabase Storage
// Return public URL
```

### **Phase 2: Flow API Routes** (1-2 hours)

**File:** `/app/api/ops/flows/route.ts`
```typescript
GET    /api/ops/flows?clientId=X&status=X
POST   /api/ops/flows
PATCH  /api/ops/flows/[id]
DELETE /api/ops/flows/[id]
```

### **Phase 3: Content Hub API Routes** (2-3 hours)

**Files:**
- `/app/api/ops/brand-links/route.ts`
- `/app/api/ops/brand-files/route.ts`
- `/app/api/ops/brand-guidelines/route.ts`
- `/app/api/ops/copy-notes/route.ts`
- `/app/api/ops/design-notes/route.ts`
- `/app/api/ops/call-notes/route.ts`

### **Phase 4: Forms API Routes** (2 hours)

**Files:**
- `/app/api/ops/forms/route.ts`
- `/app/api/ops/form-responses/route.ts`

### **Phase 5: Scope & Tests API Routes** (1-2 hours)

**Files:**
- `/app/api/ops/scope/route.ts`
- `/app/api/ops/ab-tests/route.ts`

---

## 📊 **Estimated Time:**

**API Routes:** 8-12 hours total  
**Component Updates:** 4-6 hours (replace mock data)  
**Testing:** 2-3 hours

**Total:** 14-21 hours for full integration

---

## 🚀 **Quick Start Next Session:**

**Option A: Build All API Routes** (Full integration)  
**Option B: Start with Campaigns Only** (Test workflow first)  
**Option C: I can build the API routes** (if you want)

**What would you like to do?** 🎯

