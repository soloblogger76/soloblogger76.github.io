/* Media Puppies — Careers page: application form
   Posts to Web3Forms. "Apply" buttons pre-select the role they belong to. */
(function () {
  'use strict';
  var WEB3FORMS_KEY = '05a4cb54-228e-4084-acaa-d00149d73c23';

  var form = document.getElementById('careersForm');
  if (!form) return;

  var roleSelect = document.getElementById('c-role');
  var submitBtn = form.querySelector('[data-submit-btn]');
  var submitLabel = form.querySelector('[data-submit-label]');
  var blockNotSubmitted = document.querySelector('[data-if="notSubmitted"]');
  var blockSubmitted = document.querySelector('[data-if="submitted"]');

  /* Role-specific Apply buttons preselect the dropdown */
  document.querySelectorAll('[data-role]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!roleSelect) return;
      var wanted = btn.dataset.role;
      Array.prototype.forEach.call(roleSelect.options, function (opt) {
        if (opt.value === wanted || opt.text === wanted) roleSelect.value = opt.value || opt.text;
      });
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var fd = new FormData(form);
    fd.append('access_key', WEB3FORMS_KEY);
    fd.append('subject', 'New Application — Media Puppies Careers');

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || 'Submit failed');
        if (blockNotSubmitted) blockNotSubmitted.style.display = 'none';
        if (blockSubmitted) {
          blockSubmitted.style.display = 'block';
          blockSubmitted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      })
      .catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Send application';
        alert('Something went wrong sending your application. Please try again, or email us directly.');
      });
  });
})();
