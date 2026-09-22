/* Media Puppies — show stated minimums in the visitor's own currency.
   ────────────────────────────────────────────────────────────────────
   The HTML always ships the rupee figure, so a visitor with no JS, and
   Googlebot, both see a real price. This only rewrites it when the
   visitor is outside India.

   Country comes from Cloudflare's own /cdn-cgi/trace — same origin, no
   API key, no third party reading our traffic. Timezone is the fallback.

   These are CONVERSIONS of one price, not different prices per market.
   To quote a market its own number instead, put it in `override`. */
(function () {
  'use strict';

  /* Approximate rupees per unit. Review these periodically — they are
     display conversions, not a live FX feed. Last set 2026-09-23. */
  var MARKETS = {
    INR: { sym: '₹',   rate: 1,   locale: 'en-IN', label: 'India (₹)' },
    USD: { sym: '$',        rate: 88,  locale: 'en-US', label: 'United States ($)' },
    GBP: { sym: '£',   rate: 112, locale: 'en-GB', label: 'United Kingdom (£)' },
    EUR: { sym: '€',   rate: 96,  locale: 'de-DE', label: 'Europe (€)' },
    CAD: { sym: 'C$',       rate: 63,  locale: 'en-CA', label: 'Canada (C$)' },
    AUD: { sym: 'A$',       rate: 58,  locale: 'en-AU', label: 'Australia (A$)' },
    AED: { sym: 'AED ',     rate: 24,  locale: 'en-AE', label: 'UAE (AED)' },
    SGD: { sym: 'S$',       rate: 66,  locale: 'en-SG', label: 'Singapore (S$)' }
  };

  /* Per-market fixed figures, keyed by the rupee anchor. Empty by design:
     fill this in when a market gets its own price rather than a converted
     one, e.g. override.USD[50000] = 3000. */
  var override = { USD: {}, GBP: {}, EUR: {}, CAD: {}, AUD: {}, AED: {}, SGD: {} };

  var EUR_COUNTRIES = 'IE DE FR NL ES IT BE AT PT FI GR LU EE LV LT SK SI CY MT HR'.split(' ');
  function currencyFor(cc) {
    if (!cc) return null;
    if (cc === 'IN') return 'INR';
    if (cc === 'GB') return 'GBP';
    if (cc === 'CA') return 'CAD';
    if (cc === 'AU' || cc === 'NZ') return 'AUD';
    if (cc === 'AE') return 'AED';
    if (cc === 'SG') return 'SGD';
    if (EUR_COUNTRIES.indexOf(cc) > -1) return 'EUR';
    return 'USD';                       /* everywhere else quotes in dollars */
  }

  /* Round to something a human would quote, never to the paisa. */
  function nice(n) {
    if (n < 100) return Math.round(n / 5) * 5;
    if (n < 1000) return Math.round(n / 50) * 50;
    if (n < 10000) return Math.round(n / 100) * 100;
    return Math.round(n / 1000) * 1000;
  }

  function format(inr, code) {
    var m = MARKETS[code];
    var fixed = override[code] && override[code][inr];
    var v = fixed != null ? fixed : nice(inr / m.rate);
    try { return m.sym + v.toLocaleString(m.locale); }
    catch (e) { return m.sym + v; }
  }

  function apply(code) {
    var isHome = code === 'INR';
    document.querySelectorAll('[data-money]').forEach(function (el) {
      if (!el.dataset.inr) el.dataset.inr = el.textContent;
      el.textContent = isHome ? el.dataset.inr
        : el.dataset.money.split(',').map(function (n) {
            return format(parseInt(n, 10), code);
          }).join('–');
    });
    /* Budget dropdowns: relabel the options, leave their values alone so
       the stored lead keeps one consistent currency. */
    document.querySelectorAll('select[data-money-select] option').forEach(function (o) {
      if (!o.dataset.money) return;
      if (!o.dataset.inr) o.dataset.inr = o.textContent;
      /* An <option> with no value attribute submits its label, so relabelling
         would change what the lead record stores. Pin the value to the rupee
         wording once, and every lead stays in one comparable currency. */
      if (!o.hasAttribute('value')) o.setAttribute('value', o.dataset.inr);
      if (isHome) { o.textContent = o.dataset.inr; return; }
      /* Keep whatever wraps the figure — "Under ₹50,000" must not become a
         bare "£450", and a trailing "+" has to survive. */
      var orig = o.dataset.inr;
      var lead = (/^([^₹0-9]*)/.exec(orig) || ['', ''])[1];
      var tail = /\+\s*$/.test(orig) ? '+' : '';
      o.textContent = lead + o.dataset.money.split(',').map(function (n) {
        return format(parseInt(n, 10), code);
      }).join('–') + tail;
    });
    var note = document.querySelector('[data-money-note]');
    if (note) note.style.display = isHome ? 'none' : '';
    var sel = document.querySelector('[data-money-switch]');
    if (sel) sel.value = code;
    document.documentElement.setAttribute('data-currency', code);
  }

  function remember(code) {
    try { localStorage.setItem('mp_currency', code); } catch (e) {}
  }

  function saved() {
    try { return localStorage.getItem('mp_currency'); } catch (e) { return null; }
  }

  function fromTimezone() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (/Kolkata|Calcutta/.test(tz)) return 'INR';
      if (/^America\//.test(tz)) return /Toronto|Vancouver|Edmonton|Winnipeg|Halifax/.test(tz) ? 'CAD' : 'USD';
      if (/^Europe\/London/.test(tz)) return 'GBP';
      if (/^Europe\//.test(tz)) return 'EUR';
      if (/^Australia\/|^Pacific\/Auckland/.test(tz)) return 'AUD';
      if (/Dubai/.test(tz)) return 'AED';
      if (/Singapore/.test(tz)) return 'SGD';
    } catch (e) {}
    return null;
  }

  function build() {
    var sel = document.querySelector('[data-money-switch]');
    if (!sel) return;
    Object.keys(MARKETS).forEach(function (code) {
      var o = document.createElement('option');
      o.value = code; o.textContent = MARKETS[code].label;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      remember(sel.value);
      apply(sel.value);
      if (window.mpTrackCustom) window.mpTrackCustom('CurrencyChanged', { currency: sel.value });
    });
  }

  function start() {
    build();
    var pick = saved();
    if (pick && MARKETS[pick]) { apply(pick); return; }   /* the visitor already chose */
    apply(fromTimezone() || 'INR');                        /* instant, no network wait */

    /* Then confirm against Cloudflare's view of the request and correct
       if the timezone guessed wrong. Failure is fine — we already showed
       something sensible. */
    fetch('/cdn-cgi/trace', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (t) {
        var m = /(?:^|\n)loc=([A-Z]{2})/.exec(t);
        var code = m && currencyFor(m[1]);
        if (code && MARKETS[code] && !saved()) apply(code);
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }
})();
