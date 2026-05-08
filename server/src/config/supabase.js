import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import ws from 'ws'  // <-- add this import

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Check .env file.')
  process.exit(1)
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  // Provide WebSocket implementation and disable realtime
  realtime: {
    transport: ws,
    enabled: false,
  },
})

export const BUCKET_NAME = process.env.BUCKET_NAME || 'property-images'