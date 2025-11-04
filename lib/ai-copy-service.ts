/**
 * AI Copy Generation Service
 * Adapted from CopyBot - Uses Claude 3.5 Sonnet for email copy generation
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface CopyBlock {
  type: 'header' | 'subheader' | 'body' | 'pic' | 'cta' | 'product' | 'collection' | 
        'checkmarks' | 'divider' | 'footer' | 'secondary_header' | 'hero_image' | 
        'graphic' | 'bullet_list' | 'table' | 'reviews' | 'video'
  content: string
  description?: string
  cta?: string
  link?: string
  items?: string[]
  products?: { name: string; link: string; description?: string }[]
  // For comparison/table blocks
  comparison?: { feature: string; us: string; them: string }[]
  // For review blocks
  review?: { quote: string; author: string; rating?: number }
}

interface GeneratedCopy {
  subject_lines: string[]
  preview_text: string
  email_blocks: CopyBlock[]
}

export class AICopyService {
  /**
   * Generate comprehensive Copy Notes from brand scraping
   */
  async generateCopyNotes(clientData: {
    brand_name: string
    website_url?: string
    existing_campaigns?: any[]
  }): Promise<any> {
    try {
      const prompt = `You are analyzing a brand to create comprehensive copywriting guidelines.

BRAND: ${clientData.brand_name}
WEBSITE: ${clientData.website_url || 'Not provided'}

Based on the brand name and industry, generate detailed copy notes:

1. Voice & Tone: How should the brand communicate?
2. Brand Personality: 3-5 adjectives
3. Writing Style: Sentence structure, approach
4. Key Phrases: 5-10 phrases that fit the brand
5. Words to Avoid: What NOT to say
6. Target Audience: Who are they speaking to?
7. Pain Points: What problems do customers have?

Return as JSON:
{
  "voice_tone": "...",
  "brand_personality": ["adj1", "adj2"],
  "writing_style": "...",
  "key_phrases": ["phrase1", "phrase2"],
  "words_to_avoid": ["word1", "word2"],
  "target_audience": "...",
  "pain_points": ["pain1", "pain2"]
}`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-0',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('Failed to parse AI response')
      
    } catch (error) {
      console.error('Copy notes generation error:', error)
      throw new Error('Failed to generate copy notes')
    }
  }

  /**
   * Scrape product information from URLs
   */
  async scrapeProducts(productUrls: string[]): Promise<any[]> {
    if (!productUrls || productUrls.length === 0) {
      return []
    }

    try {
      // Dynamic import to avoid server-side issues
      const { WebScraper } = await import('@/lib/web-scraper')
      const scraper = new WebScraper()
      return await scraper.scrapeProducts(productUrls)
    } catch (error) {
      console.error('Scraping error:', error)
      return []
    }
  }

  /**
   * Generate email copy using campaign context
   */
  async generateEmailCopy(params: {
    campaign_name: string
    brief: string
    copy_notes: any
    product_urls?: string[]
    scraped_products?: any[]
    website_context?: any
  }): Promise<GeneratedCopy> {
    try {
      const { campaign_name, brief, copy_notes, scraped_products, website_context } = params

      const prompt = `PURPOSE: Generate clean, conversion-ready e-commerce emails using a modular block system.

## 1. GLOBAL TONE RULES
- No em dashes or hyphens
- Short, confident sentences
- Sound human, not corporate or forced
- Prioritize clarity and flow over creativity
- Each block should communicate one idea
- All text should fit within a clean, grid-based design

## 2. BRAND VOICE & GUIDELINES
Voice & Tone: ${copy_notes.voice_tone || 'Professional'}
Brand Personality: ${copy_notes.brand_personality?.join(', ') || 'N/A'}
Writing Style: ${copy_notes.writing_style || 'Clear and concise'}
Target Audience: ${copy_notes.target_audience || 'General'}

KEY PHRASES TO USE:
${copy_notes.key_phrases?.map((p: string) => `- ${p}`).join('\n') || 'None specified'}

WORDS TO AVOID:
${copy_notes.words_to_avoid?.map((w: string) => `- ${w}`).join('\n') || 'None specified'}

## 3. CAMPAIGN OBJECTIVE
Campaign: ${campaign_name}
Brief: ${brief}

${scraped_products && scraped_products.length > 0 ? `
## PRODUCTS TO FEATURE (Use ONLY these):
${scraped_products.map((p: any, i: number) => `
${i + 1}. ${p.name}
   Description: ${p.description}
   Price: ${p.price || 'TBD'}
   Link: ${p.url}
`).join('\n')}
` : ''}

## 4. BUILDING BLOCKS AVAILABLE
Choose blocks based on the campaign objective:

- HEADER – Clear and bold. Always first.
- SUBHEADER – Reinforces the main offer, theme, or hook.
- HERO IMAGE / VIDEO – Show the product, person, or scene.
- CTA – Single button, strong verb.
- SECONDARY HEADER – Used for supporting points or transitions.
- BODY COPY – 1–3 sentences. Explain or add depth.
- GRAPHIC / VISUAL ELEMENT – Charts, product visuals, feature highlights.
- BULLET LIST – Condense benefits or steps into 3–5 bullets.
- PRODUCT BLOCKS – 3–4 featured products, each with name and one short line.
- TABLE / COMPARISON BLOCK – For tech or spec-driven brands.
- REVIEWS BLOCK – Social proof or customer feedback.
- CLOSING CTA – Final push.

## 5. OBJECTIVE-DRIVEN LAYOUTS

**Product Launch:**
HEADER → SUBHEADER → HERO IMAGE → CTA → SECONDARY HEADER ("Highlights") → BULLET LIST (3–4 USPs) → CTA → PRODUCT BLOCKS → CLOSING CTA

**Offer / Sale:**
HEADER (offer/discount) → SUBHEADER (code/deadline) → HERO IMAGE → CTA → BODY COPY (1–2 sentences) → GRAPHIC or PRODUCT BLOCKS → CTA

**Education / Blog:**
HEADER (topic) → HERO IMAGE → CTA ("Read More") → SECONDARY HEADER (key takeaway) → BULLET LIST → CTA → PRODUCT BLOCKS (optional)

**Winback / Re-engagement:**
HEADER (conversational) → SUBHEADER (offer reminder) → HERO IMAGE → CTA → SECONDARY HEADER → BODY COPY → CTA → PRODUCT BLOCKS

**When unsure, use:** HEADER → SUBHEADER → IMAGE → CTA → HEADER → BODY/BULLETS/GRAPHIC → CTA → PRODUCT BLOCKS

## 6. CTA LANGUAGE BANK
Use strong, literal calls to action:
- Shop Now
- See the Line
- Watch the Launch
- Learn More
- Use My Code
- Enter Now
- Claim Offer
- Explore More

## 7. CRITICAL RULES
1. ❌ DO NOT make up product names, prices, or links
2. ❌ DO NOT fabricate features or specifications
3. ✅ Use {INSERT PRODUCT} if product info not provided
4. ✅ Use {INSERT LINK} for missing URLs
5. ✅ Keep blocks self-contained and scrollable
6. ✅ Follow the brand voice exactly
7. ✅ Each block should look self-contained

## 8. OUTPUT FORMAT (JSON)
{
  "subject_lines": ["Subject 1 (max 50 chars)", "Subject 2", "Subject 3"],
  "preview_text": "Preview text (max 100 chars)",
  "email_blocks": [
    {"type": "header", "content": "Clear bold headline"},
    {"type": "subheader", "content": "Reinforce offer/theme"},
    {"type": "pic", "content": "Hero image description"},
    {"type": "cta", "content": "Shop Now", "link": "{INSERT LINK}"},
    {"type": "body", "content": "1-3 sentences max"},
    {"type": "checkmarks", "items": ["Benefit 1", "Benefit 2", "Benefit 3"]},
    {"type": "product", "content": "Product Name", "description": "One short line", "cta": "Shop Product", "link": "{INSERT LINK}"},
    {"type": "cta", "content": "Explore More", "link": "{INSERT LINK}"}
  ]
}

Generate 6-10 blocks based on the campaign objective. Make each block self-contained, scrollable, and conversion-focused.`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-0',
        max_tokens: 4000,
        temperature: 0.2, // Lower for consistency
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          subject_lines: parsed.subject_lines || ['Generated Subject'],
          preview_text: parsed.preview_text || '',
          email_blocks: parsed.email_blocks || []
        }
      }
      
      throw new Error('Failed to parse AI response')
      
    } catch (error) {
      console.error('Copy generation error:', error)
      throw new Error('Failed to generate email copy')
    }
  }

  /**
   * Enhance a brief using AI
   */
  async enhanceBrief(params: {
    brief: string
    copy_notes: any
    campaign_name: string
  }): Promise<string> {
    try {
      const { brief, copy_notes, campaign_name } = params

      const prompt = `You are a campaign strategist. Expand this brief into a comprehensive campaign plan.

CAMPAIGN: ${campaign_name}
BRIEF: ${brief}

BRAND CONTEXT:
- Voice: ${copy_notes.voice_tone || 'N/A'}
- Audience: ${copy_notes.target_audience || 'N/A'}
- Pain Points: ${copy_notes.pain_points?.join(', ') || 'N/A'}

Expand this into a detailed brief covering:
1. Campaign Goal
2. Target Audience (specific segments)
3. Key Messages (priority order)
4. Required Elements
5. Success Metrics

Keep it concise but comprehensive (300-400 words).`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-0',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      return message.content[0].type === 'text' ? message.content[0].text : params.brief
      
    } catch (error) {
      console.error('Brief enhancement error:', error)
      return params.brief // Return original if fails
    }
  }

  /**
   * Revise existing copy based on feedback
   */
  async reviseCopy(params: {
    current_copy: any
    revision_notes: string
    copy_notes: any
  }): Promise<GeneratedCopy> {
    try {
      const { current_copy, revision_notes, copy_notes } = params

      const currentBlocks = JSON.stringify(current_copy.email_blocks, null, 2)

      const prompt = `You are revising email copy based on client feedback.

## CURRENT EMAIL COPY (Block Structure):
${currentBlocks}

## REVISION REQUEST:
${revision_notes}

## BRAND GUIDELINES (Must Follow):
Voice & Tone: ${copy_notes.voice_tone || 'N/A'}
Key Phrases to Use: ${copy_notes.key_phrases?.join(', ') || 'N/A'}
Words to Avoid: ${copy_notes.words_to_avoid?.join(', ') || 'N/A'}

## TASK:
Revise the email copy based on the revision request above.

CRITICAL RULES:
1. Keep the same overall structure and flow
2. Maintain the EXACT block format (same JSON structure)
3. Apply the requested revisions precisely
4. Follow brand guidelines
5. Keep all product names, links, and details accurate (don't change unless requested)
6. Return the COMPLETE revised email (all blocks)

Return the revised copy as JSON:
{
  "subject_lines": ["Revised subject 1", "Revised subject 2", "Revised subject 3"],
  "preview_text": "Revised preview...",
  "email_blocks": [
    { all blocks, revised as needed }
  ]
}

Apply these revisions: ${revision_notes}`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-0',
        max_tokens: 4000,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          subject_lines: parsed.subject_lines || current_copy.subject_lines,
          preview_text: parsed.preview_text || current_copy.preview_text,
          email_blocks: parsed.email_blocks || current_copy.email_blocks
        }
      }
      
      throw new Error('Failed to parse revised copy')
      
    } catch (error) {
      console.error('Revision error:', error)
      throw new Error('Failed to revise copy')
    }
  }
}


