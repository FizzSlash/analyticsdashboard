/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com', 
      'ui-avatars.com',
      // Airtable CDN (for migrated images)
      'v5.airtableusercontent.com',
      // Klaviyo CDN (for campaign images)
      'a.klaviyo.com',
      // Supabase storage (for uploaded images)
      'supabase.co',
    ],
  },
  // Experimental features for larger payloads
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
}

module.exports = nextConfig
