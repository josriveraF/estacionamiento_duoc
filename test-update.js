const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anjyozvvllrndoanquqg.supabase.co';
const supabaseKey = 'sb_publishable_keOcPtv3PBYdN5AmULBS-w_BvrcOHxH';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log('Testing update...');
  const { data, error } = await supabase.from('espacios').update({ estado: 'Reservado' }).eq('id', 'B-5').select();
  if (error) {
    console.error('Update failed:', error.message);
  } else {
    console.log('Update success:', data);
  }
}

testUpdate();
