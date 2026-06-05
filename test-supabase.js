const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anjyozvvllrndoanquqg.supabase.co';
const supabaseKey = 'sb_publishable_keOcPtv3PBYdN5AmULBS-w_BvrcOHxH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('espacios').select('*').limit(1);
    if (error) {
      console.error('Connection Error:', error.message);
    } else {
      console.log('Connection Successful! Data:', data);
    }
  } catch (err) {
    console.error('Exception caught:', err.message);
  }
}

testConnection();
