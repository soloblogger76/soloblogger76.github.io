/* Media Puppies — Lead page: 2-step qualification form
   Step 1 (business type + budget) -> Step 2 (name/business/city/phone) -> Web3Forms.
   Pixel events: InitiateCheckout on step 2, Lead on success (fires only if fbq exists). */
(function () {
  'use strict';
  var WEB3FORMS_KEY = '05a4cb54-228e-4084-acaa-d00149d73c23';

  var form = document.getElementById('leadForm');
  if (!form) return;

  var panels1 = document.querySelectorAll('[data-step-panel="1"]');
  var panels2 = document.querySelectorAll('[data-step-panel="2"]');
  var stepNum = document.querySelector('[data-step-num]');
  var submitBtn = form.querySelector('[data-submit-btn]');
  var submitLabel = form.querySelector('[data-submit-label]');
  var blockNotSubmitted = document.querySelector('[data-if="notSubmitted"]');
  var blockSubmitted = document.querySelector('[data-if="submitted"]');

  function showStep(n) {
    panels1.forEach(function (p) { p.style.display = n === 1 ? 'block' : 'none'; });
    panels2.forEach(function (p) { p.style.display = n === 2 ? 'block' : 'none'; });
    if (stepNum) stepNum.textContent = n;
  }

  document.querySelectorAll('[data-action="go-step2"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var biz = document.getElementById('f-biz');
      var budget = document.getElementById('f-budget');
      if (biz && !biz.checkValidity()) { biz.reportValidity(); return; }
      if (budget && !budget.checkValidity()) { budget.reportValidity(); return; }
      showStep(2);
      if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout');
    });
  });

  document.querySelectorAll('[data-action="go-step1"]').forEach(function (btn) {
    btn.addEventListener('click', function () { showStep(1); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    fd.append('access_key', WEB3FORMS_KEY);
    fd.append('subject', 'New Lead — Media Puppies Website');

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
          if (blockNotSubmitted) blockNotSubmitted.style.display = 'none';
          if (blockSubmitted) blockSubmitted.style.display = 'block';
          blockSubmitted && blockSubmitted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error(data.message || 'Submit failed');
        }
      })
      .catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Send me my lead plan';
        alert('Something went wrong sending the form. Please try again or message us on WhatsApp.');
      });
  });
})();
