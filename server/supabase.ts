import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback: derive SUPABASE_URL from DATABASE_URL
if (!supabaseUrl && process.env.DATABASE_URL) {
  const u = process.env.DATABASE_URL;
  const dbMatch = u.match(/@(?:db\.)?([a-z0-9]+)\.supabase\.co/);
  const poolerMatch = u.match(/postgres\.([a-z0-9]+):/);
  const ref = dbMatch?.[1] ?? poolerMatch?.[1];
  if (ref) supabaseUrl = `https://${ref}.supabase.co`;
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Supabase Auth will not work."
  );
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;
