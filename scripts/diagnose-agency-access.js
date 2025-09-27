#!/usr/bin/env node

/**
 * Agency Access Diagnostic Script
 * This will connect to your Supabase and diagnose the agency access issue
 * Usage: node scripts/diagnose-agency-access.js
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

async function diagnoseAgencyAccess() {
  console.log('🔍 AGENCY ACCESS DIAGNOSTIC TOOL\n');

  try {
    const supabaseUrl = await askQuestion('Supabase URL: ');
    const supabaseServiceKey = await askQuestion('Supabase Service Role Key: ');
    const userEmail = await askQuestion('Your email address (for user lookup): ');
    
    console.log('\n🔌 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('\n🔍 STEP 1: Checking if retention-harbor agency exists...');
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('agency_slug', 'retention-harbor')
      .single();

    if (agencyError) {
      console.log('❌ STEP 1 FAILED:', agencyError.message);
    } else if (agency) {
      console.log('✅ STEP 1 SUCCESS: Agency found!');
      console.log(`   📝 Name: ${agency.agency_name}`);
      console.log(`   🔗 Slug: ${agency.agency_slug}`);
      console.log(`   👤 Owner ID: ${agency.owner_id}`);
      console.log(`   ✅ Active: ${agency.is_active}`);
    } else {
      console.log('❌ STEP 1 FAILED: Agency not found');
    }

    console.log('\n🔍 STEP 2: Looking up your user ID by email...');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.log('❌ STEP 2 FAILED:', userError.message);
      return;
    }

    const user = users.users.find(u => u.email === userEmail);
    if (!user) {
      console.log(`❌ STEP 2 FAILED: No user found with email ${userEmail}`);
      return;
    }

    console.log('✅ STEP 2 SUCCESS: User found!');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🆔 User ID: ${user.id}`);

    console.log('\n🔍 STEP 3: Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ STEP 3 FAILED:', profileError.message);
    } else if (profile) {
      console.log('✅ STEP 3 SUCCESS: User profile found!');
      console.log(`   👤 Role: ${profile.role}`);
      console.log(`   🏢 Agency ID: ${profile.agency_id}`);
      console.log(`   📊 Client ID: ${profile.client_id || 'none'}`);
    } else {
      console.log('❌ STEP 3 FAILED: No user profile found');
    }

    console.log('\n🔍 STEP 4: Checking ownership match...');
    if (agency && user) {
      const isOwner = agency.owner_id === user.id;
      console.log(`   🏢 Agency Owner ID: ${agency.owner_id}`);
      console.log(`   👤 Your User ID: ${user.id}`);
      console.log(`   🎯 Match Status: ${isOwner ? '✅ YOU ARE THE OWNER' : '❌ OWNER ID MISMATCH'}`);
      
      if (!isOwner) {
        console.log('\n🚨 PROBLEM IDENTIFIED: Owner ID mismatch!');
        console.log('   This is why you get "Dashboard Not Found"');
        console.log('\n💡 SOLUTION: Update agency owner_id to your user ID');
        console.log(`   SQL: UPDATE agencies SET owner_id = '${user.id}' WHERE agency_slug = 'retention-harbor';`);
      } else {
        console.log('\n🤔 Ownership is correct. Checking RLS policies...');
      }
    }

    console.log('\n🔍 STEP 5: Testing RLS with your user context...');
    // This simulates what happens when you try to access the agency
    const { data: rlsTest, error: rlsError } = await supabase.rpc('test_agency_access', {
      agency_slug_param: 'retention-harbor',
      user_id_param: user.id
    });

    if (rlsError) {
      console.log('❌ STEP 5: RLS test function not available (normal)');
    }

    console.log('\n📋 SUMMARY:');
    console.log('='.repeat(50));
    
    if (agency && user) {
      if (agency.owner_id === user.id) {
        console.log('✅ Agency exists and you are the owner');
        console.log('🤔 Issue might be:');
        console.log('   - Authentication not working in frontend');
        console.log('   - User profile missing');
        console.log('   - RLS policies too strict');
      } else {
        console.log('🚨 OWNER ID MISMATCH - This is the problem!');
        console.log(`   Run this SQL to fix: UPDATE agencies SET owner_id = '${user.id}' WHERE agency_slug = 'retention-harbor';`);
      }
    }

  } catch (error) {
    console.error('\n❌ Diagnostic Error:', error.message);
  } finally {
    rl.close();
  }
}

diagnoseAgencyAccess();