#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://edcbdmelnlevrqycgkag.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY2JkbWVsbmxldnJxeWNna2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU0MDIxOSwiZXhwIjoyMDczMTE2MjE5fQ.clYymt-u3faj3ATWKEAbV76e-laFUSeYTeGcOdidebg';

async function checkFlowData() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Get Safari client
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('brand_slug', 'safari')
    .single();

  console.log('🔍 FLOW DATA ANALYSIS FOR SAFARI:\n');

  // Flow revenue breakdown
  const { data: flowData } = await supabase
    .from('flow_message_metrics')
    .select('flow_id, revenue, conversion_value')
    .eq('client_id', client.id);

  // Aggregate by flow_id
  const flowTotals = {};
  flowData?.forEach(record => {
    const flowId = record.flow_id;
    if (!flowTotals[flowId]) flowTotals[flowId] = 0;
    flowTotals[flowId] += parseFloat(record.revenue) || 0;
  });

  console.log('📊 REVENUE BY FLOW ID:');
  Object.entries(flowTotals)
    .sort(([,a], [,b]) => b - a)
    .forEach(([flowId, revenue]) => {
      console.log(`  ${flowId}: $${revenue.toFixed(2)}`);
    });

  // Check flow_metrics table
  const { data: flowMetrics } = await supabase
    .from('flow_metrics')
    .select('flow_id, flow_name, flow_status, revenue')
    .eq('client_id', client.id);

  console.log('\n📊 FLOW_METRICS TABLE:');
  flowMetrics?.forEach(flow => {
    console.log(`  ${flow.flow_name} (${flow.flow_id}): $${flow.revenue || 0} [${flow.flow_status}]`);
  });

  // Expected vs Actual
  const expectedTotal = 39.00 + 1258.05 + 893.05 + 161.70 + 249.00 + 1607.50;
  const actualTotal = Object.values(flowTotals).reduce((sum, rev) => sum + rev, 0);
  
  console.log('\n💰 REVENUE COMPARISON:');
  console.log(`Expected (Klaviyo): $${expectedTotal.toFixed(2)}`);
  console.log(`Actual (Database): $${actualTotal.toFixed(2)}`);
  console.log(`Missing: $${(expectedTotal - actualTotal).toFixed(2)} (${((expectedTotal - actualTotal) / expectedTotal * 100).toFixed(1)}%)`);

  console.log('\n🚨 ISSUES IDENTIFIED:');
  if (Object.keys(flowTotals).length < 8) {
    console.log(`❌ Only ${Object.keys(flowTotals).length}/8 flows captured in database`);
  }
  if (actualTotal < expectedTotal * 0.5) {
    console.log(`❌ Database revenue is ${((actualTotal / expectedTotal) * 100).toFixed(1)}% of expected`);
  }
}

checkFlowData().catch(console.error);