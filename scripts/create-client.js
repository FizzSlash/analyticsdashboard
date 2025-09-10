#!/usr/bin/env node

/**
 * Script to create a new client via API
 * Usage: node scripts/create-client.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createClient() {
  console.log('🚀 Klaviyo Analytics Dashboard - Client Setup\n');

  try {
    const brandName = await askQuestion('Brand Name: ');
    const brandSlug = await askQuestion('Brand Slug (URL-friendly): ');
    const klaviyoApiKey = await askQuestion('Klaviyo Private API Key: ');
    const logoUrl = await askQuestion('Logo URL (optional): ');
    const primaryColor = await askQuestion('Primary Color (hex, optional): ') || '#3B82F6';
    const secondaryColor = await askQuestion('Secondary Color (hex, optional): ') || '#EF4444';
    const apiUrl = await askQuestion('API URL (default: http://localhost:3000): ') || 'http://localhost:3000';

    console.log('\n📝 Creating client...');

    const response = await fetch(`${apiUrl}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand_name: brandName,
        brand_slug: brandSlug,
        klaviyo_api_key: klaviyoApiKey,
        logo_url: logoUrl || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Client created successfully!');
      console.log(`📊 Dashboard URL: ${apiUrl}/client/${result.client.brand_slug}`);
      console.log(`🔧 Client ID: ${result.client.id}`);
    } else {
      console.error('\n❌ Error creating client:', result.error);
      if (result.message) {
        console.error('Details:', result.message);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

createClient();
