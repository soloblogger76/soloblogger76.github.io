-- Media Puppies — add geo columns to page_views.
-- Purely additive: no DROP, no data change, safe to run on the live table.
alter table public.page_views add column if not exists country text;
alter table public.page_views add column if not exists tz      text;
alter table public.page_views add column if not exists lang    text;

create index if not exists page_views_country_idx on public.page_views (country);
