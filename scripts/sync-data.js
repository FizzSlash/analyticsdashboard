#!/usr/bin/env node

/**
 * Script to trigger data synchronization
 * Usage: node scripts/sync-data.js [clientId]
 */

const args = process.argv.slice(2);
const clientId = args[0];
const apiUrl = process.env.API_URL || 'http://localhost:3000';
const syncApiKey = process.env.SYNC_API_KEY;

async function syncData() {
  console.log('🔄 Klaviyo Analytics Dashboard - Data Sync\n');

  try {
    const url = clientId 
      ? `${apiUrl}/api/sync/${clientId}`
      : `${apiUrl}/api/sync`;

    console.log(`📡 Syncing data from: ${url}`);
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (syncApiKey) {
      headers['Authorization'] = `Bearer ${syncApiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Sync completed successfully!');
      console.log(`📊 Message: ${result.message}`);
      console.log(`⏰ Timestamp: ${result.timestamp}`);
      if (result.client) {
        console.log(`🏢 Client: ${result.client}`);
      }
    } else {
      console.error('\n❌ Sync failed:', result.error);
      if (result.message) {
        console.error('Details:', result.message);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

if (clientId) {
  console.log(`🎯 Syncing specific client: ${clientId}`);
} else {
  console.log('🌍 Syncing all clients');
}

syncData();
