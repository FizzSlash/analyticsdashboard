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
  // Increase API body size limit for image uploads
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Support high-quality campaign images
    },
  },
}

module.exports = nextConfig
