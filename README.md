# Media Puppies — Website

Static HTML + vanilla JS. No build step, no framework. Deployed on GitHub Pages
at **https://mediapuppies.com** from the `soloblogger76/soloblogger76.github.io`
repo (`main` branch, root). Push to `main` and it is live in about a minute.

## Structure

```
/                      Homepage
/services/             7 services, each with an #anchor id
/work/                 Case studies
/careers/              Open roles + application form
/internship/           Paid-traffic landing page — the one open internship
/blog/                 Blog index + 5 articles (footer link only, not in nav)
/lead-generation/      Client enquiry landing page (Meta/Google ad destination)
/privacy-policy/       Privacy + Terms
/admin/                Leads dashboard (noindex, disallowed in robots.txt)
/assets/img/           WebP images, logos, og-image
/assets/js/            See below
sitemap.xml            13 URLs, submitted to Search Console
supabase-schema.sql    Run once in Supabase to create the leads table
```

Paths are root-relative (`/assets/...`), so the site must be served from a
domain root. That is why it lives in the `*.github.io` user-site repo rather
than a project repo.

## JavaScript

| File | Does |
|---|---|
| `main.js` | Scroll reveals, counters, 3D tilt, magnetic buttons, `style-hover` |
| `pixel.js` | Meta Pixel for the whole site. **The Pixel ID lives here, once.** Also provides `mpTrack`, `mpTrackCustom` and `data-track` |
| `lead-capture.js` | Captures UTM / fbclid / gclid / referrer on the first page of a session, then `mpSubmitLead()` writes to Supabase + Web3Forms |
| `supabase-config.js` | Supabase URL + anon key |
| `lead-form.js` | `/lead-generation/` two-step client form |
| `careers-form.js` | `/careers/` application form |
| `internship-form.js` | `/internship/` application form |

### Cache busting — read before shipping JS

GitHub Pages sends `max-age=14400` on assets and Cloudflare honours it, so a
changed `.js` file can keep serving the old version for four hours. Every
script tag therefore carries `?v=<date>`.

**When you change any file in `assets/js/`, bump that version in every HTML
file**, or visitors keep the stale copy:

```bash
find . -name "*.html" -not -path "./.git/*" -exec sed -i '' 's/?v=20260919a/?v=20260919a/g' {} +
```

## Leads

Every form writes to two places, and succeeds if either one works:

1. **Supabase** — the `leads` table, which `/admin/` reads. Row Level Security
   lets anyone INSERT but only a signed-in user SELECT or UPDATE. Nothing can
   DELETE from the browser.
2. **Web3Forms** — the email notification, so a submission is never missed.

Form field names do not all match column names (`whatsapp` → `phone`,
`monthly_budget` → `budget`). `lead-capture.js` maps them and drops unknown
keys into `message`, because an unknown key makes PostgREST reject the whole
row with a 400.

### Admin panel setup

1. Create a free project at supabase.com.
2. SQL Editor → paste `supabase-schema.sql` → Run.
3. Project Settings → API → copy **Project URL** and the **anon public** key
   into `assets/js/supabase-config.js`. Never the `service_role` key.
4. Authentication → Users → Add user. That is your `/admin/` login.

## Still open

- [ ] Case study numbers and testimonial names are the original export's placeholders
- [ ] Internship stipend on `/internship/` is a placeholder (`data-stipend`) — confirm before running ads
- [ ] About and Contact pages do not exist; nav Contact points to `/lead-generation/#leadForm`
- [ ] Meta Ads spend/ROAS inside `/admin/` (needs Marketing API — phase 2)

## Design decisions (don't undo)

- No WhatsApp float button (junk-lead concern) — WhatsApp is a secondary hero CTA only
- Nav + sticky CTA use `position:fixed` + `translateZ(0)`, no `backdrop-filter` (mobile Safari)
- `overflow-x` clipped on html+body (mobile side-scroll fix)
- Blog is linked from the footer only, never the header
- `/Lead/` and `/SEO/` were renamed to `/lead-generation/` and `/seo-services/` on 2026-09-21; the old paths 301 at the Cloudflare edge and keep meta-refresh stubs in the repo as a fallback
