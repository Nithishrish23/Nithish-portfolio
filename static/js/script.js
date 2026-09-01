'use strict';

const toggle = (elem) => elem?.classList.toggle('active');
const sidebar = document.querySelector('[data-sidebar]');
document.querySelector('[data-sidebar-btn]')?.addEventListener('click', () => toggle(sidebar));

const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');
navigationLinks.forEach((link) => link.addEventListener('click', () => {
  const target = link.textContent.trim().toLowerCase();
  const targetPage = target === 'view resume' ? 'resume' : target;
  pages.forEach((page) => page.classList.toggle('active', page.dataset.page === targetPage));
  navigationLinks.forEach((nav) => nav.classList.toggle('active', nav === link || (target === 'view resume' && nav.textContent.trim() === 'Resume')));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));

const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');
const feedback = document.querySelector('[data-form-feedback]');
const updateFormState = () => { if (form && formBtn) formBtn.disabled = !form.checkValidity(); };
formInputs.forEach((input) => input.addEventListener('input', updateFormState));

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) return;
  formBtn.disabled = true;
  const label = formBtn.querySelector('span');
  const original = label?.textContent || 'Send Message';
  if (label) label.textContent = 'Sending…';
  if (feedback) feedback.textContent = '';
  try {
    const response = await fetch('/', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.message || 'Unable to submit the form.');
    if (feedback) { feedback.textContent = result.message || 'Thanks! Your message has been received.'; feedback.className = 'form-feedback success'; }
    form.reset();
  } catch (error) {
    if (feedback) { feedback.textContent = error.message || 'Something went wrong. Please try again.'; feedback.className = 'form-feedback error'; }
  } finally {
    if (label) label.textContent = original;
    updateFormState();
  }
});
updateFormState();
