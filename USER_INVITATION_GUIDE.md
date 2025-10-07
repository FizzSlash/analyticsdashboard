# 👤 **How to Add Users to Client Dashboards**

## 📧 **Why Emails Don't Send:**

**Supabase email service is NOT configured.** This is why users don't receive automated invitation emails.

---

## ✅ **Easiest Way to Add Users:**

### **Option 1: Magic Link (Current Method)**

1. **Go to Users tab** → Click "Invite User"
2. **Fill out form:**
   - Email: user@example.com
   - Client: Select which client they access
   - Name: Optional
3. **Click "Send Invitation"**
4. **Modal appears** with magic link
5. **Copy the link** and send it to the user (via email, Slack, text, etc.)
6. **User clicks link** → Sets their password → Can login

---

### **Option 2: Manual Password Reset (Simpler)**

1. **Go to Users tab** → Click "Invite User"  
2. **Fill out form** with user's email
3. **User goes to** `/login`
4. **Clicks "Forgot Password"** (if you have that)
5. **Enters their email** → Gets reset link
6. **Sets password** → Logs in

---

### **Option 3: Set Password in Supabase (Fastest)**

1. **Create user** via Users tab (gets added to Supabase)
2. **Go to Supabase** → Authentication → Users
3. **Find the user** → Click "..." → "Send Password Recovery"
4. **Or manually set a temp password** in Supabase
5. **Give temp password to user**
6. **User logs in** → Changes password

---

## 💡 **RECOMMENDED: Configure Supabase Email**

**To get automated emails working:**

1. **Go to Supabase** → Project Settings → Auth → Email Templates
2. **Configure SMTP** or use Supabase's default
3. **Enable email confirmations**
4. **Test it**

**Once configured:**
- ✅ Users automatically get invitation emails
- ✅ Password resets work
- ✅ No manual link copying needed

---

## 🎯 **For Now (Easiest):**

**Just use the magic link modal:**
1. Invite user
2. Copy link from modal
3. Send link via email/Slack
4. User clicks → Sets password → Logs in

**Takes 30 seconds!** ✅

---

**The modal IS working** - it should pop up after you click "Send Invitation". If it's not appearing, let me know and I'll debug it!

