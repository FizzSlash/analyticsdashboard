/**
 * Migrate Airtable Image URLs to Supabase Storage
 * 
 * This script:
 * 1. Finds all campaigns with Airtable image URLs
 * 2. Downloads those images
 * 3. Uploads to Supabase Storage
 * 4. Updates database with new URLs
 */

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateAirtableImages() {
  console.log('🔄 Starting Airtable image migration...')

  try {
    // Get all campaigns with Airtable image URLs
    const { data: campaigns, error } = await supabase
      .from('ops_campaigns')
      .select('id, campaign_name, image_url, client_id')
      .like('image_url', '%airtableusercontent.com%')

    if (error) {
      console.error('❌ Error fetching campaigns:', error)
      return
    }

    console.log(`📊 Found ${campaigns?.length || 0} campaigns with Airtable images`)

    let migrated = 0
    let failed = 0

    for (const campaign of campaigns || []) {
      try {
        console.log(`\n📸 Processing: ${campaign.campaign_name}`)
        console.log(`   Old URL: ${campaign.image_url?.substring(0, 50)}...`)

        // Download image from Airtable
        const response = await fetch(campaign.image_url)
        
        if (!response.ok) {
          console.log(`   ⚠️ Failed to download (${response.status}): Skipping`)
          failed++
          continue
        }

        const buffer = await response.arrayBuffer()
        const blob = new Blob([buffer])

        // Extract filename from URL or create one
        const urlParts = campaign.image_url.split('/')
        const originalFilename = urlParts[urlParts.length - 1]
        const fileExt = originalFilename.split('.').pop() || 'jpg'
        const newFilename = `campaigns/${campaign.client_id}/${Date.now()}-${campaign.id}.${fileExt}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('campaign-previews')
          .upload(newFilename, blob, {
            contentType: response.headers.get('content-type'),
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.log(`   ❌ Upload failed:`, uploadError.message)
          failed++
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('campaign-previews')
          .getPublicUrl(newFilename)

        // Update campaign with new URL
        const { error: updateError } = await supabase
          .from('ops_campaigns')
          .update({ image_url: publicUrl })
          .eq('id', campaign.id)

        if (updateError) {
          console.log(`   ❌ Update failed:`, updateError.message)
          failed++
          continue
        }

        console.log(`   ✅ Migrated successfully`)
        console.log(`   New URL: ${publicUrl}`)
        migrated++

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.log(`   ❌ Error:`, error.message)
        failed++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Successfully migrated: ${migrated}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Total processed: ${campaigns?.length || 0}`)

  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

// Run migration
migrateAirtableImages()
  .then(() => {
    console.log('\n✅ Migration complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })

