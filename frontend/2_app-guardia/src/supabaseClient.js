import { createClient } from '@supabase/supabase-js';

// Reemplaza estas URLs con las de tu proyecto en Supabase una vez creado
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key-publica';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
