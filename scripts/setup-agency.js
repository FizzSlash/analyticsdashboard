#!/usr/bin/env node

/**
 * Script to create your first agency and admin user
 * Usage: node scripts/setup-agency.js
 */

const { createClient } = require('@supabase/supabase-js');
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

async function setupAgency() {
  console.log('🚀 Klaviyo Analytics Dashboard - Agency Setup\n');

  try {
    const supabaseUrl = await askQuestion('Supabase URL: ');
    const supabaseServiceKey = await askQuestion('Supabase Service Role Key: ');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('\n📝 Creating your agency...\n');

    const agencyName = await askQuestion('Agency Name: ');
    const agencySlug = await askQuestion('Agency Slug (URL-friendly): ');
    const adminEmail = await askQuestion('Admin Email: ');
    const adminPassword = await askQuestion('Admin Password: ');
    const firstName = await askQuestion('Admin First Name: ');
    const lastName = await askQuestion('Admin Last Name: ');
    const primaryColor = await askQuestion('Primary Color (hex, optional): ') || '#3B82F6';
    const secondaryColor = await askQuestion('Secondary Color (hex, optional): ') || '#EF4444';

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    // Create agency
    console.log('🏢 Creating agency...');
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        agency_name: agencyName,
        agency_slug: agencySlug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        owner_id: authData.user.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        is_active: true
      })
      .select()
      .single();

    if (agencyError) {
      throw new Error(`Failed to create agency: ${agencyError.message}`);
    }

    console.log('\n✅ Setup completed successfully!');
    console.log(`🏢 Agency: ${agencyData.agency_name}`);
    console.log(`🔗 Admin Dashboard: ${supabaseUrl.replace('supabase.co', 'supabase.co')}/agency/${agencyData.agency_slug}/admin`);
    console.log(`👤 Admin Email: ${adminEmail}`);
    console.log(`🔐 Admin Password: ${adminPassword}`);
    console.log('\n📋 Next Steps:');
    console.log('1. Run your Next.js app: npm run dev');
    console.log('2. Visit the admin dashboard URL above');
    console.log('3. Login with your admin credentials');
    console.log('4. Start adding clients!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

setupAgency();
