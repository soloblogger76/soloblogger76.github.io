/* Media Puppies — first-party page view tracking.
   ────────────────────────────────────────────────────────────
   Writes one row per page view into Supabase so /admin/ can show
   visits and, more usefully, conversion rate per campaign.

   No cookies, no third party, no personal data — a random session id
   that lives only in sessionStorage, the path, and the ad parameters
   that were already in the URL. Nothing here needs a consent banner.

   It also owns window.mpAttribution, which lead-capture.js reuses, so
   a visit and the lead it produces always agree on where they came from. */
(function () {
  'use strict';

  var STORE_KEY = 'mp_attribution';
  var SESSION_KEY = 'mp_session';
  var UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  /* Don't count ourselves, headless browsers, or obvious crawlers */
  if (location.pathname.indexOf('/admin') === 0) return;
  if (navigator.webdriver) return;
  if (/bot|crawler|spider|crawling|headless|lighthouse|pagespeed/i.test(navigator.userAgent)) return;

  /* ---- first-touch attribution, shared with lead-capture.js ---- */
  function attribution() {
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
    if (saved) return saved;

    var params = new URLSearchParams(location.search);
    var data = {
      landing_page: location.pathname,
      referrer: document.referrer || null,
      fbclid: params.get('fbclid'),
      gclid: params.get('gclid')
    };
    UTMS.forEach(function (k) { data[k] = params.get(k); });
    if (!data.utm_source && data.fbclid) data.utm_source = 'facebook';
    if (!data.utm_source && data.gclid) data.utm_source = 'google';

    /* A referrer from another site, with no campaign tags, is still a source */
    if (!data.utm_source && data.referrer) {
      try {
        var h = new URL(data.referrer).hostname.replace(/^www\./, '');
        if (h && h !== location.hostname) data.utm_source = h;
      } catch (e) {}
    }

    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
    return data;
  }

  function sessionId() {
    var id = null;
    try { id = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
    if (!id) {
      id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
      try { sessionStorage.setItem(SESSION_KEY, id); } catch (e) {}
    }
    return id;
  }

  var attr = attribution();
  window.mpAttribution = attr;

  if (typeof MP_SUPABASE_READY === 'undefined' || !MP_SUPABASE_READY) return;

  var w = window.innerWidth || 0;
  var row = {
    session_id: sessionId(),
    path: location.pathname,
    referrer: attr.referrer,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    utm_content: attr.utm_content,
    fbclid: attr.fbclid,
    gclid: attr.gclid,
    device: w < 768 ? 'mobile' : (w < 1024 ? 'tablet' : 'desktop'),
    screen_w: w
  };

  /* Fire and forget — a failed beacon must never affect the page */
  try {
    fetch(MP_SUPABASE_URL + '/rest/v1/page_views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': MP_SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + MP_SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row),
      keepalive: true
    }).catch(function () {});
  } catch (e) {}
})();
