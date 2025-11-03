/**
 * Web Scraper for Product Information
 * Extracts product details from URLs
 */

export interface ScrapedProduct {
  name: string
  description: string
  price?: string
  features?: string[]
  url: string
}

export class WebScraper {
  /**
   * Scrape product information from a URL
   */
  async scrapeProduct(url: string): Promise<ScrapedProduct> {
    try {
      console.log('🔍 Scraping product:', url)

      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      
      // Basic extraction using regex (can enhance with cheerio later)
      const titleMatch = html.match(/<title>(.*?)<\/title>/i)
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
      const metaDescMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
      const priceMatch = html.match(/\$(\d+(?:\.\d{2})?)/i)

      const name = (h1Match?.[1] || titleMatch?.[1] || 'Product')
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .trim()
        .substring(0, 100)

      const description = (metaDescMatch?.[1] || '')
        .trim()
        .substring(0, 300)

      const price = priceMatch?.[1] ? `$${priceMatch[1]}` : undefined

      console.log('✅ Scraped:', name)

      return {
        name,
        description,
        price,
        features: [],
        url
      }

    } catch (error) {
      console.error('❌ Scraping error for', url, ':', error)
      
      // Return placeholder on error
      return {
        name: '{Product Name}',
        description: '{Product Description}',
        url
      }
    }
  }

  /**
   * Scrape multiple product URLs
   */
  async scrapeProducts(urls: string[]): Promise<ScrapedProduct[]> {
    console.log(`🔍 Scraping ${urls.length} products...`)
    
    const products = await Promise.all(
      urls.map(url => this.scrapeProduct(url))
    )
    
    console.log(`✅ Scraped ${products.length} products`)
    return products
  }

  /**
   * Scrape website homepage and key pages for general context
   */
  async scrapeWebsiteContext(websiteUrl: string): Promise<{
    homepage_content: string
    about_content: string
    current_promotions: string
  }> {
    try {
      console.log('🔍 Scraping website context:', websiteUrl)

      // Scrape homepage
      const homepageResponse = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const homepageHtml = await homepageResponse.text()
      
      // Extract key content from homepage
      const h1Matches = homepageHtml.match(/<h1[^>]*>(.*?)<\/h1>/gi) || []
      const h2Matches = homepageHtml.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []
      const pMatches = homepageHtml.match(/<p[^>]*>(.*?)<\/p>/gi) || []
      
      const headlines = h1Matches.concat(h2Matches)
        .map(h => h.replace(/<[^>]*>/g, '').trim())
        .filter(h => h.length > 0 && h.length < 200)
        .slice(0, 10)
        .join('\n')

      const paragraphs = pMatches
        .map(p => p.replace(/<[^>]*>/g, '').trim())
        .filter(p => p.length > 20 && p.length < 300)
        .slice(0, 5)
        .join('\n')

      // Look for promotion/offer keywords
      const promotionKeywords = ['sale', 'off', '%', 'free shipping', 'discount', 'limited time', 'offer']
      const promotions = pMatches
        .map(p => p.replace(/<[^>]*>/g, '').trim())
        .filter(p => promotionKeywords.some(keyword => p.toLowerCase().includes(keyword)))
        .slice(0, 3)
        .join('\n')

      return {
        homepage_content: `${headlines}\n\n${paragraphs}`,
        about_content: '',
        current_promotions: promotions
      }

    } catch (error) {
      console.error('❌ Website scraping error:', error)
      return {
        homepage_content: '',
        about_content: '',
        current_promotions: ''
      }
    }
  }
}

