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
}

