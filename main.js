/* ==========================================================================
   Lim Saifudine - portfolio

   No scroll event listeners anywhere in this file. Everything that reacts to
   position uses IntersectionObserver, which the browser batches off the main
   thread. Everything that animates does so through transform and opacity.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Contact backend.

   Web3Forms relays a form post straight to an inbox with no server of our own,
   which suits a static site on Vercel. Get a key by entering the destination
   email at https://web3forms.com - it arrives by email, no account needed.
   Paste it below and the form starts delivering for real.

   Until then the form degrades honestly: it opens a prefilled mail draft
   instead of silently pretending the message was delivered.
   -------------------------------------------------------------------------- */
const CONTACT = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: 'PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE',
  fallbackEmail: 'limfudine@gmail.com'
};

const isConfigured = () =>
  CONTACT.accessKey && !CONTACT.accessKey.startsWith('PASTE_YOUR');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* --------------------------------------------------------------------------
   Mobile menu
   -------------------------------------------------------------------------- */
const menuBtn = document.getElementById('menuBtn');
const menuIcon = document.getElementById('menuIcon');
const mobileMenu = document.getElementById('mobileMenu');

function setMenu(open) {
  mobileMenu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuIcon.className = open ? 'ph-bold ph-x text-xl' : 'ph-bold ph-list text-xl';
}

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => setMenu(mobileMenu.hidden));

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hidden) {
      setMenu(false);
      menuBtn.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   Scroll reveal. Elements rise once, then stop being observed.
   -------------------------------------------------------------------------- */
const revealTargets = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add('is-in'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  // Stagger cells within the work grid so the bento assembles rather than snaps
  document.querySelectorAll('#workGrid .work-cell').forEach((cell, i) => {
    cell.style.transitionDelay = `${Math.min(i, 6) * 0.06}s`;
  });
}

/* --------------------------------------------------------------------------
   Header elevation. A one-pixel sentinel at the top of the document tells us
   whether the page has moved, with no scroll handler involved.
   -------------------------------------------------------------------------- */
const header = document.getElementById('header');
const topSentinel = document.getElementById('topSentinel');

if (header && topSentinel) {
  new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('shadow-[0_1px_40px_rgba(0,0,0,0.6)]', !entry.isIntersecting);
    },
    { threshold: 0 }
  ).observe(topSentinel);
}

/* --------------------------------------------------------------------------
   Active navigation. Tells the reader where they are in the page.
   -------------------------------------------------------------------------- */
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const sections = document.querySelectorAll('main section[id]');

if (navLinks.length && sections.length) {
  const setActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('text-lime', active);
      link.classList.toggle('bg-white/5', active);
      link.classList.toggle('text-dim', !active);
    });
  };

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    // A thin band just under the header: whichever section crosses it wins,
    // which keeps tall sections from holding the highlight too long.
    { threshold: 0, rootMargin: '-80px 0px -75% 0px' }
  );

  sections.forEach((section) => navObserver.observe(section));
}

/* --------------------------------------------------------------------------
   Work filter. Chips narrow the bento by category and announce the result
   to screen readers.
   -------------------------------------------------------------------------- */
const chips = Array.from(document.querySelectorAll('.filter-chip'));
const workCells = Array.from(document.querySelectorAll('#workGrid .work-cell'));
const workEmpty = document.getElementById('workEmpty');
const workCount = document.getElementById('workCount');

const CHIP_ON = ['border-lime', 'bg-lime', 'text-ink'];
const CHIP_OFF = ['border-line', 'text-dim', 'hover:border-lime/30', 'hover:text-lime'];

function applyFilter(filter) {
  let shown = 0;

  workCells.forEach((cell) => {
    const match = filter === 'all' || cell.dataset.cat === filter;
    if (match) shown += 1;

    if (prefersReducedMotion) {
      cell.classList.toggle('is-hidden', !match);
      cell.classList.remove('is-leaving');
      return;
    }

    if (match) {
      cell.classList.remove('is-hidden');
      // Next frame, so the browser has a layout to transition from
      requestAnimationFrame(() => cell.classList.remove('is-leaving'));
    } else {
      cell.classList.add('is-leaving');
      setTimeout(() => {
        if (cell.classList.contains('is-leaving')) cell.classList.add('is-hidden');
      }, 220);
    }
  });

  if (workEmpty) workEmpty.hidden = shown > 0;
  if (workCount) {
    workCount.textContent =
      filter === 'all'
        ? `Showing all ${shown} projects.`
        : `Showing ${shown} ${filter} ${shown === 1 ? 'project' : 'projects'}.`;
  }
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((other) => {
      const on = other === chip;
      other.setAttribute('aria-pressed', String(on));
      other.classList.remove(...(on ? CHIP_OFF : CHIP_ON));
      other.classList.add(...(on ? CHIP_ON : CHIP_OFF));
    });

    applyFilter(chip.dataset.filter);
  });
});

/* --------------------------------------------------------------------------
   Contact form
   -------------------------------------------------------------------------- */
const form = document.getElementById('contactForm');
const faceForm = document.getElementById('faceForm');
const faceSent = document.getElementById('faceSent');
const submitBtn = document.getElementById('submitBtn');
const submitLabel = document.getElementById('submitLabel');
const submitIcon = document.getElementById('submitIcon');
const formError = document.getElementById('formError');
const formErrorText = document.getElementById('formErrorText');
const resetBtn = document.getElementById('resetBtn');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  name: (v) => v.trim().length >= 2,
  email: (v) => EMAIL_RE.test(v.trim()),
  message: (v) => v.trim().length >= 10
};

function fieldWrap(name) {
  return document.querySelector(`.field[data-field="${name}"]`);
}

function validateField(name, value) {
  const ok = rules[name](value);
  const wrap = fieldWrap(name);
  if (wrap) wrap.classList.toggle('has-error', !ok);
  const input = document.getElementById(name);
  if (input) input.setAttribute('aria-invalid', String(!ok));
  return ok;
}

function setSubmitting(on) {
  submitBtn.disabled = on;
  submitLabel.textContent = on ? 'Sending' : 'Send message';
  submitIcon.className = on
    ? 'ph-bold ph-spinner-gap spinning'
    : 'ph-bold ph-paper-plane-tilt';
}

function showSent({ delivered }) {
  const heading = faceSent.querySelector('h3');
  const body = faceSent.querySelector('p');

  if (delivered) {
    heading.textContent = 'Message sent';
    body.textContent =
      'Thanks for reaching out. It is in my inbox and I will get back to you soon.';
  } else {
    heading.textContent = 'Your mail app is open';
    body.textContent =
      'Direct sending is not switched on yet, so your message is waiting there as a draft. Hit send and it reaches me.';
  }

  faceForm.classList.remove('is-active');
  faceSent.classList.add('is-active');
}

function openMailDraft(data) {
  const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
  const body = encodeURIComponent(`${data.message}\n\nFrom: ${data.name} (${data.email})`);
  window.location.href = `mailto:${CONTACT.fallbackEmail}?subject=${subject}&body=${body}`;
}

if (form) {
  // Validate on blur, clear the error as soon as the user starts fixing it
  Object.keys(rules).forEach((name) => {
    const input = document.getElementById(name);
    if (!input) return;

    input.addEventListener('blur', () => validateField(name, input.value));
    input.addEventListener('input', () => {
      const wrap = fieldWrap(name);
      if (wrap && wrap.classList.contains('has-error')) {
        validateField(name, input.value);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.hidden = true;

    const data = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      message: document.getElementById('message').value
    };

    // Validate everything, then focus the first field that failed
    const failed = Object.keys(rules).filter((name) => !validateField(name, data[name]));
    if (failed.length) {
      document.getElementById(failed[0]).focus();
      return;
    }

    // Honeypot: a filled hidden field means a bot. Fail quietly.
    if (form.querySelector('[name="botcheck"]').value) return;

    if (!isConfigured()) {
      openMailDraft(data);
      showSent({ delivered: false });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(CONTACT.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CONTACT.accessKey,
          subject: `Portfolio message from ${data.name}`,
          from_name: 'Portfolio contact form',
          name: data.name,
          email: data.email,
          message: data.message
        })
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success) {
        form.reset();
        showSent({ delivered: true });
      } else {
        throw new Error(result.message || 'The message service rejected that request.');
      }
    } catch (err) {
      formErrorText.textContent = `${err.message} You can also email me directly at ${CONTACT.fallbackEmail}.`;
      formError.hidden = false;
    } finally {
      setSubmitting(false);
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    form.reset();
    Object.keys(rules).forEach((name) => {
      const wrap = fieldWrap(name);
      if (wrap) wrap.classList.remove('has-error');
    });
    faceSent.classList.remove('is-active');
    faceForm.classList.add('is-active');
    document.getElementById('name').focus();
  });
}
