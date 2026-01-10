// Supabase Client Configuration
// Replace Google Drive with Supabase Storage

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured!');
  console.warn('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  console.warn('Using placeholder values - uploads will fail until configured.');
}

// Create Supabase client
// Note: For client-side use, use anon key. For server-side admin operations, use service role key.
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

module.exports = supabase;

