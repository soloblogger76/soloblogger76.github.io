/* Media Puppies — Internship page application form.
   Posts to Web3Forms. Fires Meta Pixel ViewContent / InitiateCheckout / Lead. */
(function () {
  'use strict';
  var WEB3FORMS_KEY = '05a4cb54-228e-4084-acaa-d00149d73c23';

  var form = document.getElementById('internForm');
  if (!form) return;

  var submitBtn = form.querySelector('[data-submit-btn]');
  var submitLabel = form.querySelector('[data-submit-label]');
  var notSubmitted = document.querySelector('[data-if="notSubmitted"]');
  var submitted = document.querySelector('[data-if="submitted"]');

  /* Page view of a specific job listing */
  if (window.mpTrack) {
    window.mpTrack('ViewContent', {
      content_name: 'Content Writing Internship',
      content_category: 'internship'
    });
  }

  /* First real interaction with the form = intent signal, fired once */
  var started = false;
  form.addEventListener('focusin', function () {
    if (started) return;
    started = true;
    if (window.mpTrack) window.mpTrack('InitiateCheckout', { content_name: 'internship_form_started' });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var fd = new FormData(form);
    fd.append('access_key', WEB3FORMS_KEY);
    fd.append('subject', 'New Internship Application — Content Writer');
    fd.append('role', 'Content Writer Intern (Remote)');

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || 'Submit failed');
        if (window.mpTrack) {
          window.mpTrack('Lead', {
            content_name: 'Content Writing Internship',
            content_category: 'internship'
          });
        }
        if (notSubmitted) notSubmitted.style.display = 'none';
        if (submitted) {
          submitted.style.display = 'block';
          submitted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      })
      .catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Submit application';
        alert('Something went wrong. Please try again, or WhatsApp us on +91 81100 00123.');
      });
  });
})();
