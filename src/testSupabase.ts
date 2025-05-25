import { supabase } from './lib/supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase.from('customers').select('*').limit(1);
    if (error) throw error;
    console.log('Connection successful:', data);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();