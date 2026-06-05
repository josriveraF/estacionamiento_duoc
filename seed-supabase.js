const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anjyozvvllrndoanquqg.supabase.co';
const supabaseKey = 'sb_publishable_keOcPtv3PBYdN5AmULBS-w_BvrcOHxH';
const supabase = createClient(supabaseUrl, supabaseKey);

const espacios = [
  { id: 'A-1', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-2', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Norte' },
  { id: 'A-3', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-4', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-5', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-6', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-7', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-8', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-9', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  { id: 'A-10', tipo: 'Rotación Alta', estado: 'Reservado', zona: 'Sector Norte' },
  { id: 'A-11', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Norte' },
  
  { id: 'B-1', tipo: 'Permanencia Extendida', estado: 'Ocupado', zona: 'Sector Este' },
  { id: 'B-2', tipo: 'Permanencia Extendida', estado: 'Ocupado', zona: 'Sector Este' },
  { id: 'B-3', tipo: 'Permanencia Extendida', estado: 'Ocupado', zona: 'Sector Este' },
  { id: 'B-4', tipo: 'Permanencia Extendida', estado: 'Libre', zona: 'Sector Este' },
  { id: 'B-5', tipo: 'Permanencia Extendida', estado: 'Libre', zona: 'Sector Este' },
  { id: 'B-6', tipo: 'Permanencia Extendida', estado: 'Libre', zona: 'Sector Este' },
  { id: 'B-7', tipo: 'Permanencia Extendida', estado: 'Libre', zona: 'Sector Este' },
  { id: 'B-8', tipo: 'Permanencia Extendida', estado: 'Ocupado', zona: 'Sector Este' },
  { id: 'B-9', tipo: 'Permanencia Extendida', estado: 'Libre', zona: 'Sector Este' },
  { id: 'B-10', tipo: 'Permanencia Extendida', estado: 'Libre', zona: 'Sector Este' },
  { id: 'B-11', tipo: 'Permanencia Extendida', estado: 'Libre', zona: 'Sector Este' },
  { id: 'B-12', tipo: 'Carga Eléctrica', estado: 'Libre', zona: 'Sector Este' },

  { id: 'C-1', tipo: 'PMR', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-2', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Oeste' },
  { id: 'C-3', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-4', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-5', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Oeste' },
  { id: 'C-6', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-7', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-8', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Oeste' },
  { id: 'C-9', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-10', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Oeste' },
  { id: 'C-11', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-12', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-13', tipo: 'Carga Eléctrica', estado: 'Libre', zona: 'Sector Oeste' },
  { id: 'C-14', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Oeste' },

  { id: 'D-1', tipo: 'Carga Eléctrica', estado: 'Ocupado', zona: 'Sector Sur' },
  { id: 'D-2', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Sur' },
  { id: 'D-3', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Sur' },
  { id: 'D-4', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Sur' },
  { id: 'D-5', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Sur' },
  { id: 'D-6', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Sur' },
  { id: 'D-7', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Sur' },
  { id: 'D-8', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Sur' },
  { id: 'D-9', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Sur' },
  { id: 'D-10', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Sur' },
  { id: 'D-11', tipo: 'Rotación Alta', estado: 'Libre', zona: 'Sector Sur' },
  { id: 'D-12', tipo: 'Rotación Alta', estado: 'Ocupado', zona: 'Sector Sur' }
];

async function insertData() {
  console.log('Inserting 49 spaces into Supabase...');
  for (const espacio of espacios) {
    const { error } = await supabase.from('espacios').upsert(espacio, { onConflict: 'id' });
    if (error) {
      console.error(`Failed to insert ${espacio.id}:`, error.message);
    } else {
      console.log(`Inserted ${espacio.id} successfully!`);
    }
  }
  console.log('Done inserting.');
}

insertData();
