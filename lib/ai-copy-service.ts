/**
 * AI Copy Generation Service
 * Adapted from CopyBot - Uses Claude 3.5 Sonnet for email copy generation
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface CopyBlock {
  type: 'header' | 'subheader' | 'body' | 'pic' | 'cta' | 'product' | 'collection' | 'checkmarks' | 'divider' | 'footer'
  content: string
  description?: string
  cta?: string
  link?: string
  items?: string[]
  products?: { name: string; link: string }[]
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

      const prompt = `You are an expert email copywriter. Generate email copy in a BLOCK-BASED format.

## BRAND VOICE & GUIDELINES
Voice & Tone: ${copy_notes.voice_tone || 'Professional'}
Brand Personality: ${copy_notes.brand_personality?.join(', ') || 'N/A'}
Writing Style: ${copy_notes.writing_style || 'Clear and concise'}
Target Audience: ${copy_notes.target_audience || 'General'}

KEY PHRASES TO USE:
${copy_notes.key_phrases?.map((p: string) => `- ${p}`).join('\n') || 'None specified'}

WORDS TO AVOID:
${copy_notes.words_to_avoid?.map((w: string) => `- ${w}`).join('\n') || 'None specified'}

## CAMPAIGN
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

## CRITICAL RULES
1. ❌ DO NOT make up product names, prices, or links
2. ❌ DO NOT fabricate features or specifications
3. ✅ Use {INSERT PRODUCT} if product info not provided
4. ✅ Use {INSERT LINK} for missing URLs
5. ✅ Keep body blocks under 160 characters each
6. ✅ Follow the brand voice exactly
7. ✅ Use provided key phrases where natural

## OUTPUT FORMAT
Generate email copy as JSON with this EXACT structure:

{
  "subject_lines": ["Subject 1 (max 50 chars)", "Subject 2", "Subject 3"],
  "preview_text": "Preview text (max 100 chars)",
  "email_blocks": [
    {
      "type": "header",
      "content": "Main headline"
    },
    {
      "type": "subheader",
      "content": "Section headline"
    },
    {
      "type": "body",
      "content": "Paragraph text (max 160 chars)"
    },
    {
      "type": "pic",
      "content": "Image description/placeholder"
    },
    {
      "type": "cta",
      "content": "BUTTON TEXT",
      "link": "URL or {INSERT LINK}"
    },
    {
      "type": "product",
      "content": "Product Name",
      "description": "Product description (max 160 chars)",
      "cta": "Shop Product",
      "link": "URL or {INSERT LINK}"
    },
    {
      "type": "checkmarks",
      "items": ["Benefit 1", "Benefit 2", "Benefit 3"]
    },
    
IMPORTANT FOR CHECKMARKS:
- The "items" field is REQUIRED and must be an array of strings
- Example: "items": ["Fast shipping", "Premium quality", "Expert support"]
- Do NOT put items in "content" field - use "items" array only!
    {
      "type": "divider"
    },
    {
      "type": "footer",
      "content": "Closing line"
    }
  ]
}

BLOCK TYPES AVAILABLE:
- header: Main headline
- subheader: Section headline
- body: Paragraph (max 160 chars)
- pic: Image placeholder
- cta: Call-to-action button
- product: Product showcase
- collection: Multiple products
- checkmarks: Bullet points with ✔️
- divider: Section break
- footer: Closing line

Generate 6-8 blocks for a complete email. Use the brand voice and follow best practices.`

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
}

