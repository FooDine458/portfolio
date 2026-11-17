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
const mobileMenu = document.getElementById('mobileMenu');

function setMenu(open) {
  mobileMenu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.getElementById('header').dataset.open = String(open);
  document.body.style.overflow = open ? 'hidden' : ''; // no scrolling the page behind the menu
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

  // Growing past the mobile breakpoint with the menu open must not leave scroll locked
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
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

  // Stagger the project panels so they assemble rather than snap in
  document.querySelectorAll('#workGrid > article').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
  });
}

/* --------------------------------------------------------------------------
   Logo loop. The list is cloned to four copies so half the track is wider
   than any screen and the slide never shows a gap. Clones are hidden from
   assistive tech and the tab order; the original stays the real list.
   -------------------------------------------------------------------------- */
const logoLoop = document.getElementById('logoLoop');

if (logoLoop) {
  for (let i = 0; i < 3; i += 1) {
    const copy = logoLoop.cloneNode(true);
    copy.removeAttribute('id');
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach((link) => { link.tabIndex = -1; });
    logoLoop.parentNode.append(copy);
  }
}

/* --------------------------------------------------------------------------
   Lanyard. One pendulum: the strap and card swing about the top of the strap.
   Drag the card and it follows the pointer; let go and it swings back under
   gravity, damped, with a faint breeze so it never sits dead still. The loop
   only runs while the hero is on screen. With reduced motion there is no
   autonomous movement: the card can be dragged and snaps back on release.
   -------------------------------------------------------------------------- */
const lanyard = document.getElementById('lanyard');
const lanyardSwing = document.getElementById('lanyardSwing');
const lanyardCard = document.getElementById('lanyardCard');

if (lanyard && lanyardSwing && lanyardCard) {
  const STIFFNESS = 6;
  const DAMPING = 0.7;
  const MAX_ANGLE = 1.1;
  const clamp = (v, lim) => Math.max(-lim, Math.min(lim, v));

  let angle = prefersReducedMotion ? 0 : 0.5; // starts swung out, so it swings in
  let vel = 0;
  let lag = 0;
  let drag = null;
  let last = performance.now();
  let raf = 0;

  const paint = () => {
    lanyardSwing.style.transform = `rotate(${angle}rad)`;
    lanyardCard.style.transform = `rotate(${lag}rad)`;
  };

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;

    if (!drag) {
      const breeze = Math.sin(now / 1300) * 0.35;
      vel += (-STIFFNESS * Math.sin(angle) + breeze - DAMPING * vel) * dt;
      angle += vel * dt;
    }
    lag += (-vel * 0.18 - lag) * Math.min(1, dt * 8);

    paint();
    raf = requestAnimationFrame(frame);
  }

  paint();

  if (!prefersReducedMotion) {
    new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (entry.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }).observe(lanyard);
  }

  lanyardCard.addEventListener('pointerdown', (e) => {
    drag = { t: e.timeStamp };
    vel = 0;
    lanyardCard.setPointerCapture(e.pointerId);
    lanyardCard.classList.add('is-grabbed');
  });

  lanyardCard.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const box = lanyard.getBoundingClientRect();
    const dx = e.clientX - (box.left + box.width / 2);
    const dy = Math.max(e.clientY - box.top, 80);
    const next = clamp(Math.atan2(-dx, dy), MAX_ANGLE);
    const dt = Math.max((e.timeStamp - drag.t) / 1000, 0.001);

    vel = clamp(0.5 * vel + 0.5 * ((next - angle) / dt), 10);
    angle = next;
    drag.t = e.timeStamp;
    if (prefersReducedMotion) paint();
  });

  const release = (e) => {
    if (!drag) return;
    // A pointer that stopped before letting go has no fling left in it
    if (e.timeStamp - drag.t > 80) vel = 0;
    drag = null;
    lanyardCard.classList.remove('is-grabbed');
    if (prefersReducedMotion) {
      angle = 0;
      vel = 0;
      paint();
    }
  };

  lanyardCard.addEventListener('pointerup', release);
  lanyardCard.addEventListener('pointercancel', release);
}

/* --------------------------------------------------------------------------
   Sonar grid. A dot field behind the hero that answers clicks with expanding
   rings, plus a ping every couple of seconds. Canvas, one eased loop that
   sleeps when no ring is alive, pauses off-screen and in hidden tabs, and
   draws a still grid under reduced motion.
   -------------------------------------------------------------------------- */
const sonarHost = document.querySelector('[data-sonar]');
const sonarCanvas = sonarHost && sonarHost.querySelector('canvas');
const sonarCtx = sonarCanvas && sonarCanvas.getContext('2d');

if (sonarCtx) {
  const S = {
    spacing: 26, dotRadius: 1.4, baseOpacity: 0.2, pingEvery: 2.4,
    speed: 260, ringWidth: 90, amplitude: 2.2, maxRings: 6,
    area: [0.15, 0.2, 0.85, 0.8], // where ambient pings may spawn, as fractions of width/height
  };
  const TAU = Math.PI * 2;

  let rings = [];
  let width = 0;
  let height = 0;
  let raf = 0;
  let timer = 0;
  let visible = true;
  let seeded = false;
  let nextPing = performance.now() + S.pingEvery * 1000;

  sonarCtx.fillStyle = '#c8ff00';

  const addRing = (x, y, born) => {
    rings.push({ x, y, born });
    while (rings.length > S.maxRings) rings.shift();
  };

  function drawSonar(now) {
    const lifetime = (Math.hypot(width, height) + S.ringWidth) / S.speed;
    rings = rings.filter((r) => (now - r.born) / 1000 < lifetime);
    const live = rings.map((r) => {
      const age = (now - r.born) / 1000;
      const radius = age * S.speed;
      return { x: r.x, y: r.y, radius, reach: radius + S.ringWidth, fade: 1 - age / lifetime };
    });

    sonarCtx.clearRect(0, 0, width, height);

    const cols = Math.ceil(width / S.spacing) + 1;
    const rows = Math.ceil(height / S.spacing) + 1;
    const offsetX = (width - (cols - 1) * S.spacing) / 2;
    const offsetY = (height - (rows - 1) * S.spacing) / 2;

    // Pass 1: every resting dot in one path and one fill.
    const hot = [];
    sonarCtx.globalAlpha = S.baseOpacity;
    sonarCtx.beginPath();
    for (let i = 0; i < cols; i += 1) {
      const cx = offsetX + i * S.spacing;
      for (let k = 0; k < rows; k += 1) {
        const cy = offsetY + k * S.spacing;
        let energy = 0;
        for (const r of live) {
          if (Math.abs(cx - r.x) > r.reach || Math.abs(cy - r.y) > r.reach) continue;
          const dist = Math.abs(Math.hypot(cx - r.x, cy - r.y) - r.radius);
          if (dist >= S.ringWidth) continue;
          const t = 1 - dist / S.ringWidth;
          energy = Math.max(energy, t * t * (3 - 2 * t) * r.fade);
        }
        if (energy < 0.01) {
          sonarCtx.moveTo(cx + S.dotRadius, cy);
          sonarCtx.arc(cx, cy, S.dotRadius, 0, TAU);
        } else {
          hot.push(cx, cy, energy);
        }
      }
    }
    sonarCtx.fill();

    // Pass 2: only dots on a wavefront get their own alpha and radius.
    for (let n = 0; n < hot.length; n += 3) {
      const energy = hot[n + 2];
      sonarCtx.globalAlpha = S.baseOpacity + (1 - S.baseOpacity) * energy;
      sonarCtx.beginPath();
      sonarCtx.arc(hot[n], hot[n + 1], S.dotRadius * (1 + S.amplitude * energy), 0, TAU);
      sonarCtx.fill();
    }
    sonarCtx.globalAlpha = 1;
  }

  function sonarTick(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (prefersReducedMotion) {
      drawSonar(now);
      return;
    }
    if (now >= nextPing) {
      const [x0, y0, x1, y1] = S.area;
      addRing(width * (x0 + Math.random() * (x1 - x0)), height * (y0 + Math.random() * (y1 - y0)), now);
      nextPing = now + S.pingEvery * 1000;
    }
    drawSonar(now);
    if (rings.length > 0) {
      raf = requestAnimationFrame(sonarTick);
    } else {
      timer = window.setTimeout(() => sonarTick(performance.now()), Math.max(16, nextPing - now));
    }
  }

  function sonarWake() {
    if (raf) return;
    window.clearTimeout(timer);
    raf = requestAnimationFrame(sonarTick);
  }

  function sonarResize() {
    const rect = sonarHost.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sonarCanvas.width = Math.round(width * dpr);
    sonarCanvas.height = Math.round(height * dpr);
    sonarCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sonarCtx.fillStyle = '#c8ff00';
    if (!seeded) {
      // One ring already mid-expansion, so the very first paint shows the idea.
      seeded = true;
      if (!prefersReducedMotion) {
        const [x0, y0, x1, y1] = S.area;
        addRing(width * (x0 + (x1 - x0) * 0.68), height * (y0 + (y1 - y0) * 0.34), performance.now() - 500);
      }
    }
    drawSonar(performance.now());
  }

  new ResizeObserver(sonarResize).observe(sonarHost);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) sonarWake();
  }).observe(sonarHost);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sonarWake(); });

  // A click on empty hero space pings. Links, buttons and the lanyard keep their own behaviour.
  sonarHost.addEventListener('pointerdown', (e) => {
    if (prefersReducedMotion || e.target.closest('a, button, #lanyardCard')) return;
    const rect = sonarHost.getBoundingClientRect();
    addRing(e.clientX - rect.left, e.clientY - rect.top, performance.now());
    sonarWake();
  });

  sonarResize();
  sonarWake();
}

/* --------------------------------------------------------------------------
   Header state. A 10px sentinel at the top of the document tells us whether
   the page has moved, with no scroll handler involved. style.css turns
   data-scrolled into the floating pill.
   -------------------------------------------------------------------------- */
const header = document.getElementById('header');
const topSentinel = document.getElementById('topSentinel');

if (header && topSentinel) {
  new IntersectionObserver(
    ([entry]) => {
      header.dataset.scrolled = String(!entry.isIntersecting);
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
