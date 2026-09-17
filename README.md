# Media Puppies — Website (Deploy-Ready)

Canvas (.dc.html) export ko standalone static site mein convert kiya gaya hai.
**Koi React / support.js dependency nahi** — pure HTML + vanilla JS. Kisi bhi
hosting (cPanel, Vercel, Netlify) par direct upload karo, chal jayega.

## Structure

```
/                       → Homepage (agency site)
/Lead/                  → Lead-gen landing page (Meta Ads traffic yahin bhejo)
/services/              → Services page
/work/                  → Work page
/privacy-policy/        → Privacy Policy + Terms (DPDP)
/assets/img/            → Saare images (WebP + logos + og-image)
/assets/js/main.js      → Animations: reveal, tilt, magnet, counters, parallax
/assets/js/lead-form.js → 2-step form + Web3Forms + Pixel events (sirf /Lead/ par)
```

## Deploy (cPanel)

1. Is folder ka **poora content** `public_html/` mein upload karo (folder structure same rakhna).
2. Root-relative paths (`/assets/...`) use hue hain — site **domain root** par hi honi
   chahiye (mediapuppies.com). Subdirectory mein daloge to paths tootenge.
3. `/Lead/` capital-L rakha hai taaki live ads ka URL `mediapuppies.com/Lead/` break na ho
   (Linux hosting case-sensitive hoti hai).

## Meta Pixel install karna (pending)

Har page ke `<head>` mein commented Pixel snippet ready hai. Apni Pixel ID se
`YOUR_PIXEL_ID` replace karo aur comment hata do. Events already wired hain:

- `PageView` — pixel snippet se
- `Contact` — WhatsApp CTA click (Lead page)
- `InitiateCheckout` — form Step 1 → Step 2
- `Lead` — form successfully submit

## Baaki pending (CLAUDE.md se)

- [ ] Case study numbers + testimonial names abhi placeholders hain
- [ ] About / Contact pages abhi nahi bane — nav mein About → homepage,
      Contact → /Lead/#leadForm point kar raha hai. Pages banao to links update karna.
- [ ] Web3Forms key `assets/js/lead-form.js` mein hai (05a4cb54-…) — verify working

## Design decisions (mat undo karna)

- WhatsApp float button nahi hai (junk-lead concern) — WhatsApp sirf secondary hero CTA
- Nav + sticky CTA: `position:fixed` + `translateZ(0)`, no backdrop-filter (mobile Safari fix)
- `overflow-x` clipped on html+body (mobile side-scroll fix)
