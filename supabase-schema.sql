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

  -- client-enquiry fields (/lead-generation/)
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

create policy "anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "only signed-in users can read leads"
  on public.leads for select
  to authenticated
  using (true);

create policy "only signed-in users can update leads"
  on public.leads for update
  to authenticated
  using (true) with check (true);

-- No delete policy on purpose: leads cannot be destroyed from the browser.

-- ============================================================
-- Page views — first-party traffic analytics for /admin/
-- Same RLS shape: anyone may record a view, only a signed-in
-- admin may read them.
-- ============================================================

create table if not exists public.page_views (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  session_id    text not null,
  path          text not null,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  fbclid        text,
  gclid         text,
  device        text,
  screen_w      int
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx       on public.page_views (path);
create index if not exists page_views_session_idx    on public.page_views (session_id);
create index if not exists page_views_campaign_idx   on public.page_views (utm_campaign);

alter table public.page_views enable row level security;

create policy "anyone can record a page view"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

create policy "only signed-in users can read page views"
  on public.page_views for select
  to authenticated
  using (true);
