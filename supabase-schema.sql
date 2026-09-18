-- ============================================================
-- Media Puppies — Supabase schema
-- Run this ONCE in Supabase → SQL Editor → New query → Run.
-- ============================================================

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- which form it came from
  kind          text not null check (kind in ('client','internship','careers')),

  -- person
  name          text,
  email         text,
  phone         text,

  -- client-enquiry fields (/Lead/)
  business_type text,
  budget        text,
  city          text,
  company       text,

  -- application fields (/internship/, /careers/)
  role          text,
  college       text,
  link          text,

  message       text,

  -- where they came from — this is what makes ad reporting possible
  source_page   text,
  referrer      text,
  landing_page  text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  fbclid        text,
  gclid         text,

  -- your pipeline
  status        text not null default 'new'
                check (status in ('new','contacted','qualified','won','lost')),
  notes         text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_kind_idx       on public.leads (kind);
create index if not exists leads_status_idx     on public.leads (status);

-- ============================================================
-- Row Level Security
-- Anyone may SUBMIT a form. Only a signed-in admin may READ.
-- This is what stops the public anon key being used to scrape
-- your leads. Do not disable it.
-- ============================================================

alter table public.leads enable row level security;

drop policy if exists "anyone can submit a lead" on public.leads;
create policy "anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

drop policy if exists "only signed-in users can read leads" on public.leads;
create policy "only signed-in users can read leads"
  on public.leads for select
  to authenticated
  using (true);

drop policy if exists "only signed-in users can update leads" on public.leads;
create policy "only signed-in users can update leads"
  on public.leads for update
  to authenticated
  using (true) with check (true);

-- No delete policy on purpose: leads cannot be destroyed from the browser.

-- ============================================================
-- Daily counts, used by the admin dashboard chart
-- ============================================================
create or replace view public.leads_daily as
  select date_trunc('day', created_at)::date as day,
         kind,
         count(*) as total
  from public.leads
  group by 1, 2
  order by 1 desc;
