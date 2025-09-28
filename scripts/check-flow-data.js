#!/usr/bin/env node

/**
 * Direct Supabase Flow Data Diagnostic
 * This connects to your Supabase and checks flow_message_metrics data
 */

const { createClient } = require('@supabase/supabase-js');

// Using the credentials you provided earlier
const supabaseUrl = 'https://edcbdmelnlevrqycgkag.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY2JkbWVsbmxldnJxeWNna2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU0MDIxOSwiZXhwIjoyMDczMTE2MjE5fQ.clYymt-u3faj3ATWKEAbV76e-laFUSeYTeGcOdidebg';

async function checkFlowData() {
  console.log('🔍 DIRECT SUPABASE FLOW DATA DIAGNOSTIC\n');

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔌 Connected to Supabase successfully');

    // Get client ID for Safari
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, brand_name, brand_slug')
      .eq('brand_slug', 'safari')
      .single();

    if (clientError || !client) {
      console.log('❌ Client "safari" not found:', clientError?.message);
      return;
    }

    console.log(`✅ Found client: ${client.brand_name} (ID: ${client.id})`);

    // STEP 1: Check flow_message_metrics overview
    console.log('\n🔍 STEP 1: Flow Message Metrics Overview');
    const { data: overview, error: overviewError } = await supabase
      .from('flow_message_metrics')
      .select('revenue, conversion_value, week_date, flow_id')
      .eq('client_id', client.id);

    if (overviewError) {
      console.log('❌ Overview query failed:', overviewError.message);
    } else {
      const totalRevenue = overview?.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0) || 0;
      const totalConversion = overview?.reduce((sum, r) => sum + (parseFloat(r.conversion_value) || 0), 0) || 0;
      
      console.log(`📊 Records found: ${overview?.length || 0}`);
      console.log(`📊 Unique flows: ${new Set(overview?.map(r => r.flow_id)).size}`);
      console.log(`💰 Total revenue stored: $${totalRevenue.toFixed(2)}`);
      console.log(`💰 Total conversion_value: $${totalConversion.toFixed(2)}`);
      console.log(`📅 Date range: ${overview?.[0]?.week_date} to ${overview?.[overview.length-1]?.week_date}`);
    }

    // STEP 2: Revenue by flow_id
    console.log('\n🔍 STEP 2: Revenue Breakdown by Flow ID');
    const { data: flowBreakdown, error: flowError } = await supabase
      .rpc('get_flow_revenue_breakdown', { client_id_param: client.id })
      .catch(async () => {
        // Fallback if function doesn't exist
        return await supabase
          .from('flow_message_metrics')
          .select('flow_id, revenue, conversion_value')
          .eq('client_id', client.id);
      });

    if (flowBreakdown) {
      // Manual aggregation
      const flowTotals = {};
      flowBreakdown.forEach(record => {
        const flowId = record.flow_id;
        if (!flowTotals[flowId]) {
          flowTotals[flowId] = { revenue: 0, conversion_value: 0, records: 0 };
        }
        flowTotals[flowId].revenue += parseFloat(record.revenue) || 0;
        flowTotals[flowId].conversion_value += parseFloat(record.conversion_value) || 0;
        flowTotals[flowId].records++;
      });

      console.log('Flow Revenue Totals:');
      Object.entries(flowTotals).forEach(([flowId, totals]) => {
        console.log(`  ${flowId}: $${totals.revenue.toFixed(2)} (${totals.records} records)`);
      });
    }

    // STEP 3: Check flow_metrics table
    console.log('\n🔍 STEP 3: Flow Metrics Table (Aggregated)');
    const { data: flowMetrics, error: metricsError } = await supabase
      .from('flow_metrics')
      .select('flow_id, flow_name, flow_status, revenue, opens, clicks, date_start')
      .eq('client_id', client.id)
      .order('revenue', { ascending: false });

    if (metricsError) {
      console.log('❌ Flow metrics query failed:', metricsError.message);
    } else {
      console.log('Flow Metrics Summary:');
      flowMetrics?.forEach(flow => {
        console.log(`  ${flow.flow_name || flow.flow_id}: $${flow.revenue || 0} (Status: ${flow.flow_status})`);
      });
    }

    // STEP 4: Sample raw data
    console.log('\n🔍 STEP 4: Sample Raw Data (Last 5 Records)');
    const { data: sampleData, error: sampleError } = await supabase
      .from('flow_message_metrics')
      .select('flow_id, message_id, week_date, revenue, conversion_value, opens, clicks')
      .eq('client_id', client.id)
      .order('week_date', { ascending: false })
      .limit(5);

    if (sampleData) {
      console.log('Sample Records:');
      sampleData.forEach(record => {
        console.log(`  ${record.week_date}: Flow ${record.flow_id}, Revenue: $${record.revenue || 0}, Opens: ${record.opens || 0}`);
      });
    }

    // STEP 5: Expected vs Actual comparison
    console.log('\n📊 EXPECTED vs ACTUAL COMPARISON:');
    console.log('Expected from Klaviyo (your screenshot):');
    console.log('  - Browse Abandonment: $39.00');
    console.log('  - Abandoned Checkout: $1,258.05');
    console.log('  - Added To Cart: $893.05');
    console.log('  - Plugin Boutique: $161.70');
    console.log('  - Post Purchase: $249.00');
    console.log('  - Welcome Flow: $1,607.50');
    console.log('  - TOTAL EXPECTED: ~$4,208.30');
    
    const actualTotal = overview?.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0) || 0;
    console.log(`\nActual stored in database: $${actualTotal.toFixed(2)}`);
    console.log(`Difference: $${(4208.30 - actualTotal).toFixed(2)}`);
    
    if (actualTotal < 1000) {
      console.log('\n🚨 MAJOR DISCREPANCY: Database has much less revenue than Klaviyo');
      console.log('Possible issues:');
      console.log('  - Revenue field mapping (revenue vs conversion_value)');
      console.log('  - Date range filtering too restrictive');
      console.log('  - Flow IDs not matching between API and database');
      console.log('  - API calls not capturing all revenue data');
    }

  } catch (error) {
    console.error('\n❌ Diagnostic Error:', error.message);
  }
}

checkFlowData();