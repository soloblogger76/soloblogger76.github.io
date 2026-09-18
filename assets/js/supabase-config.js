/* Media Puppies — Supabase connection.
   ────────────────────────────────────────────────────────────
   This key is PUBLIC by design — Supabase calls it a "publishable"
   key precisely because it belongs in browser code. Your leads are
   protected by Row Level Security (see supabase-schema.sql), which
   lets anyone INSERT a lead but only a signed-in admin read one.

   NEVER put a secret / service_role key here. Those bypass RLS and
   would expose every lead to anyone who views source. */

var MP_SUPABASE_URL = 'https://ltozrfcjxxyjfvihpiyb.supabase.co';
var MP_SUPABASE_ANON_KEY = 'sb_publishable_GqqAJ008hJMai4mc5a7OUQ_1tx8AdDV';

var MP_SUPABASE_READY =
  MP_SUPABASE_URL.indexOf('YOUR_') !== 0 &&
  MP_SUPABASE_ANON_KEY.indexOf('YOUR_') !== 0;
