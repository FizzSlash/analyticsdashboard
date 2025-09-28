#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://edcbdmelnlevrqycgkag.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY2JkbWVsbmxldnJxeWNna2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU0MDIxOSwiZXhwIjoyMDczMTE2MjE5fQ.clYymt-u3faj3ATWKEAbV76e-laFUSeYTeGcOdidebg';

async function checkFlowApiDates() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🔍 CHECKING FLOW API DATE RANGE ISSUE\n');

  // Get Safari client
  const { data: client } = await supabase
    .from('clients')
    .select('id, last_sync')
    .eq('brand_slug', 'safari')
    .single();

  console.log(`📅 Current date: ${new Date().toISOString()}`);
  console.log(`📅 Expected last_12_months range: ${new Date(Date.now() - 365*24*60*60*1000).toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`);
  console.log(`📅 Client last sync: ${client.last_sync || 'never'}\n`);

  // Check actual dates in flow_message_metrics
  const { data: dateRange } = await supabase
    .from('flow_message_metrics')
    .select('week_date')
    .eq('client_id', client.id)
    .order('week_date', { ascending: true });

  if (dateRange && dateRange.length > 0) {
    const firstDate = dateRange[0].week_date;
    const lastDate = dateRange[dateRange.length - 1].week_date;
    
    console.log('📊 ACTUAL DATA RANGE IN DATABASE:');
    console.log(`   First date: ${firstDate}`);
    console.log(`   Last date: ${lastDate}`);
    console.log(`   Total weeks: ${dateRange.length}`);
    
    // Check if data is recent
    const daysSinceLastData = Math.floor((new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
    console.log(`   Days since last data: ${daysSinceLastData}\n`);
    
    if (daysSinceLastData > 30) {
      console.log('🚨 DATA IS STALE: Last data is over 30 days old!');
      console.log('   This suggests the Flow Series API returned old cached data');
      console.log('   OR the sync happened a month ago and needs to be re-run\n');
    }
    
    // Check recent weeks for activity
    const recentWeeks = dateRange.filter(d => {
      const weekDate = new Date(d.week_date);
      const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
      return weekDate >= thirtyDaysAgo;
    });
    
    console.log(`📊 RECENT ACTIVITY (last 30 days): ${recentWeeks.length} weeks with data`);
    
    if (recentWeeks.length === 0) {
      console.log('❌ NO RECENT DATA: This explains why revenue is so low');
      console.log('   The Flow Series API is returning old historical data');
      console.log('   Need to use different timeframe or different API approach');
    }
  } else {
    console.log('❌ NO DATA FOUND in flow_message_metrics table');
  }

  // Check what revenue exists in recent weeks
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
  const { data: recentRevenue } = await supabase
    .from('flow_message_metrics')
    .select('week_date, revenue, conversion_value, flow_id')
    .eq('client_id', client.id)
    .gte('week_date', thirtyDaysAgo)
    .order('week_date', { ascending: false });

  console.log(`\n💰 REVENUE IN LAST 30 DAYS (since ${thirtyDaysAgo}):`);
  if (recentRevenue && recentRevenue.length > 0) {
    const recentTotal = recentRevenue.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0);
    console.log(`   Records: ${recentRevenue.length}`);
    console.log(`   Total revenue: $${recentTotal.toFixed(2)}`);
    
    recentRevenue.slice(0, 5).forEach(r => {
      console.log(`   ${r.week_date}: Flow ${r.flow_id}, $${r.revenue || 0}`);
    });
  } else {
    console.log('   ❌ NO REVENUE DATA in last 30 days!');
    console.log('   This confirms the API is pulling historical data, not recent data');
  }
}

checkFlowApiDates().catch(console.error);