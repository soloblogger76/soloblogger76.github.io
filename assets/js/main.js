/* Media Puppies — site runtime (vanilla JS, no dependencies)
   Handles: scroll reveals, counters, 3D tilt, magnetic buttons,
   scroll progress, nav shadow, hero parallax, style-hover attribute. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- style-hover="prop:val;..." (inline hover styles) ---- */
  document.querySelectorAll('[style-hover]').forEach(function (el) {
    var rules = el.getAttribute('style-hover').split(';').map(function (r) {
      var i = r.indexOf(':');
      return i > -1 ? [r.slice(0, i).trim(), r.slice(i + 1).trim()] : null;
    }).filter(Boolean);
    var saved = {};
    el.addEventListener('mouseenter', function () {
      rules.forEach(function (r) {
        saved[r[0]] = el.style.getPropertyValue(r[0]);
        el.style.setProperty(r[0], r[1]);
      });
    });
    el.addEventListener('mouseleave', function () {
      rules.forEach(function (r) { el.style.setProperty(r[0], saved[r[0]] || ''); });
    });
  });

  /* ---- Counter animation ---- */
  function runCounter(el) {
    if (el._counted) return;
    el._counted = true;
    var target = parseInt(el.dataset.count, 10) || 0;
    var dur = 1400, t0 = performance.now();
    (function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---- Directional blur reveals ---- */
  var dirMap = {
    up: 'translateY(36px)',
    left: 'translateX(-48px)',
    right: 'translateX(48px)',
    zoom: 'scale(.93) translateY(24px)'
  };
  var els = document.querySelectorAll('[data-reveal]');
  if (!reduce) {
    els.forEach(function (el) {
      var dir = el.dataset.rev || 'up';
      el.style.opacity = '0';
      el.style.transform = dirMap[dir] || dirMap.up;
      el.style.filter = 'blur(10px)';
      el.style.transition = 'opacity .8s ease, transform .9s cubic-bezier(.2,.7,.2,1), filter .8s ease';
      el.style.transitionDelay = (parseInt(el.dataset.reveal, 10) || 0) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
        io.unobserve(el);
        el.querySelectorAll('[data-count]').forEach(runCounter);
        if (el.hasAttribute('data-count')) runCounter(el);
        setTimeout(function () {
          el.style.filter = '';
          el.style.transitionDelay = '0ms';
        }, 1200 + (parseInt(el.dataset.reveal, 10) || 0));
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('[data-count]').forEach(function (c) {
      c.textContent = c.dataset.count;
    });
  }

  /* ---- 3D tilt on cards ---- */
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = 'box-shadow .2s ease';
      card.style.transform = 'perspective(900px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg) translateY(-5px)';
      card.style.boxShadow = '0 26px 54px rgba(24,28,79,.16)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .5s ease';
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      card.style.boxShadow = '';
    });
  });

  /* ---- Magnetic buttons ---- */
  document.querySelectorAll('[data-magnet]').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      btn.style.transform = 'translate(' + (x * 10).toFixed(1) + 'px,' + (y * 8).toFixed(1) + 'px)';
      btn.style.transition = 'transform .1s ease-out';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transition = 'transform .4s cubic-bezier(.2,.7,.2,1)';
      btn.style.transform = 'translate(0,0)';
    });
  });

  /* ---- Scroll: progress bar, nav shadow, parallax, hero 3D layer ---- */
  var progress = document.querySelector('[data-progress]');
  var nav = document.querySelector('[data-nav]');
  var layer = document.querySelector('[data-layer]');
  var paras = document.querySelectorAll('[data-para]');
  var mx = 0, my = 0, sy = 0, ticking = false;

  function update() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (sy / max) * 100 : 0) + '%';
    if (nav) nav.style.boxShadow = sy > 10 ? '0 10px 30px rgba(24,28,79,.08)' : 'none';
    if (layer && !reduce) layer.style.transform = 'rotateY(' + (mx * 7).toFixed(2) + 'deg) rotateX(' + (-my * 5).toFixed(2) + 'deg) translateY(' + (sy * -0.05).toFixed(1) + 'px)';
    if (!reduce) paras.forEach(function (p) {
      var f = parseFloat(p.dataset.para) || 0;
      p.style.transform = 'translateY(' + (sy * f).toFixed(1) + 'px)';
    });
  }
  function requestUpdate() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  window.addEventListener('scroll', function () { sy = window.scrollY; requestUpdate(); }, { passive: true });
  window.addEventListener('mousemove', function (e) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
    requestUpdate();
  });
  sy = window.scrollY; update();

  /* ---- Safe Meta Pixel tracking helper (works even before pixel is installed) ---- */
  window.mpTrack = function (event) {
    if (typeof window.fbq === 'function') window.fbq('track', event);
  };
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () { window.mpTrack(el.dataset.track); });
  });
})();
