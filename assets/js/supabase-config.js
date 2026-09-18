/* Media Puppies — Supabase connection.
   ────────────────────────────────────────────────────────────
   Fill these two values from Supabase → Project Settings → API.

   The anon key is PUBLIC by design — it is safe in this file.
   Your leads are protected by Row Level Security (see
   supabase-schema.sql), not by hiding this key.

   NEVER put the service_role key here. That one bypasses all
   security and would expose every lead to anyone. */

var MP_SUPABASE_URL = 'YOUR_SUPABASE_URL';        // e.g. https://abcdefgh.supabase.co
var MP_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

var MP_SUPABASE_READY =
  MP_SUPABASE_URL.indexOf('YOUR_') !== 0 &&
  MP_SUPABASE_ANON_KEY.indexOf('YOUR_') !== 0;
