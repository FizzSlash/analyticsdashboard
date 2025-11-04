# 🤖 AI Copy Bot - 3-Step Workflow

## Overview

The new 3-step workflow adds a strategic planning phase before copy generation, giving you more control and better results.

---

## 📋 Workflow

### **OLD (2 Steps):**
```
1. Enter Info → 2. Generate Copy
```

### **NEW (3 Steps):**
```
1. Enter Info → 2. Review 3 Brief Ideas → 3. Generate Copy
```

---

## Step-by-Step Guide

### **Step 1: Enter Campaign Info**

Fill in basic details:
- Campaign name
- Initial idea/concept
- Product URLs (optional)
- Target audience notes

Click: **"Generate Brief Ideas"**

---

### **Step 2: Review 3 Strategic Approaches** ✨ NEW!

AI generates **3 distinct approaches**:

#### **Idea 1: Direct Product Showcase**
- **Strategy:** Straightforward product focus
- **Best For:** New product launches, sales
- **Block Layout:** HEADER → PRODUCT → CTA → BENEFITS
- **Brief:** Full strategic description (150-200 words)

#### **Idea 2: Story-Driven Journey**
- **Strategy:** Narrative and emotional connection
- **Best For:** Brand building, lifestyle products
- **Block Layout:** HEADER → BODY (story) → IMAGE → CTA
- **Brief:** Storytelling approach details

#### **Idea 3: Value/Benefit Focus**
- **Strategy:** Problem-solving and benefits
- **Best For:** Technical products, comparisons
- **Block Layout:** HEADER → CHECKMARKS → COMPARISON → CTA
- **Brief:** Value proposition breakdown

---

### **Your Options:**

#### **Option A: Select One**
✅ Click on any of the 3 ideas to select it  
→ Proceeds to Step 3 (Copy Generation)

#### **Option B: Edit One**
✏️ Click "Edit" on any idea  
→ Modify the brief/strategy  
→ Proceed to Step 3

#### **Option C: Not Happy with Any?**
🔄 Enter feedback in the **Revision Box**:
- "Make them more playful"
- "Focus on sustainability angle"
- "Include customer testimonials"

Click **"Generate 3 New Ideas"**  
→ Gets 3 fresh approaches based on your context

---

### **Step 3: Generate Final Copy**

Once you select/edit a brief idea:
- AI generates complete email copy
- Uses the selected strategy and block layout
- Follows brand voice from Copy Notes
- Creates subject lines, preview text, and all blocks

---

## 🎯 Benefits

### **Better Strategic Thinking**
- See 3 different angles before committing
- Choose the approach that fits best
- Avoid wasting time on wrong direction

### **More Control**
- Edit and refine the strategy first
- See the block layout before copy is written
- Iterate on ideas without regenerating copy

### **Faster Revisions**
- Don't like the ideas? Get 3 new ones
- Add context to guide the AI
- No need to regenerate full copy

### **Clearer Direction**
- Block layout shows structure upfront
- Strategy explains why it will work
- Better alignment with stakeholders

---

## 📊 Example Output

### Generated Brief Ideas:

**Idea 1: Holiday Gift Guide Made Easy**
- **Brief:** Focus on curated gift selection for different recipient types. Lead with hero product shots, then break into gift categories (for him, for her, for kids). Use checkmarks to highlight gift-giving benefits like free wrapping and fast shipping. End with urgency (limited holiday inventory).
- **Block Layout:** HEADER → HERO IMAGE → BULLET LIST (gift benefits) → PRODUCT BLOCKS (3-4 featured) → CTA → SECONDARY HEADER (shop by category) → CTA
- **Strategy:** Direct approach capitalizes on decision fatigue during holidays. Curated selection reduces overwhelm and positions brand as helpful guide.

**Idea 2: The Story of Sarah's Perfect Gift**
- **Brief:** Open with relatable gifting struggle narrative. Follow Sarah's journey finding the perfect gift through our store. Use emotional storytelling to connect, then reveal products as the solution. Customer testimonial validates the choice.
- **Block Layout:** HEADER → BODY (story intro) → BODY (problem) → HERO IMAGE → BODY (solution) → PRODUCT → REVIEWS → CTA
- **Strategy:** Story-driven approach builds emotional connection. Readers see themselves in Sarah's struggle, making products feel like natural solutions rather than sales pitches.

**Idea 3: 5 Reasons This Gift Will Be Their Favorite**
- **Brief:** Lead with bold benefit promise. Use numbered list format showing 5 specific benefits (quality, uniqueness, sustainability, value, presentation). Back each claim with brief proof points. End with social proof and strong CTA.
- **Block Layout:** HEADER → SUBHEADER (the promise) → CHECKMARKS (5 benefits) → GRAPHIC (comparison or proof) → PRODUCT BLOCKS → REVIEWS → CTA
- **Strategy:** Value-focused approach addresses decision-making criteria directly. Numbered format is scannable and builds confidence through concrete proof points.

---

## 💡 Tips

**Writing Good Initial Ideas:**
- ✅ "Black Friday sale featuring winter collection"
- ✅ "New product launch with sustainability angle"
- ✅ "Customer appreciation email with exclusive discount"
- ❌ "Email" (too vague)

**Writing Good Revision Context:**
- ✅ "Make it more urgent and time-sensitive"
- ✅ "Focus on eco-friendly aspects"
- ✅ "Add more social proof and testimonials"
- ❌ "Better" (not specific)

**Choosing the Right Idea:**
- Direct → Need quick results, clear product focus
- Story → Building brand, emotional products
- Value → Technical audience, need proof/comparison

---

## 🔧 Technical Details

### New Database Fields
- `brief_ideas` (JSONB) - Stores all 3 ideas
- `brief_ideas_context` (TEXT) - User feedback for regeneration
- `selected_brief_idea` (INTEGER) - Which idea was chosen (1, 2, or 3)

### New API Endpoint
- `POST /api/ai/generate-brief-ideas` - Generates 3 ideas
- `POST /api/ai/generate-copy` - Updated to use selected idea

### AI Configuration
- Model: Claude Sonnet 4.0
- Temperature: 0.7 (higher for creative variety in ideas)
- Max Tokens: 3000 (enough for 3 detailed briefs)

---

**Status:** ✅ Implemented  
**Last Updated:** November 4, 2025

