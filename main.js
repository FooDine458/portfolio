/* ── Noise Canvas ── */
(function initNoise() {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function renderNoise() {
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  resize();
  renderNoise();

  let lastNoise = 0;
  function tickNoise(t) {
    if (t - lastNoise > 80) { renderNoise(); lastNoise = t; }
    requestAnimationFrame(tickNoise);
  }
  requestAnimationFrame(tickNoise);

  window.addEventListener('resize', () => { resize(); renderNoise(); });
})();

/* ── Custom Cursor ── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
let mx = -100;
let my = -100;
let cx = -100;
let cy = -100;
let rx = -100;
let ry = -100;

if (!isCoarsePointer && cursor && cursorRing) {
  document.addEventListener('pointermove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  (function tickCursor() {
    cx += (mx - cx) * 0.45;
    cy += (my - cy) * 0.45;
    rx += (mx - rx) * 0.24;
    ry += (my - ry) * 0.24;

    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate3d(-50%, -50%, 0)`;
    cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate3d(-50%, -50%, 0) scale(${document.body.classList.contains('cursor-hover') ? 1.45 : 1})`;
    requestAnimationFrame(tickCursor);
  })();
}

document.querySelectorAll('a, button, .proj-item, .sk-tag, .cl-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ── Hero Watermark Parallax ── */
const heroWm = document.getElementById('heroWm');
let wmX = 0;
let wmY = 0;
if (heroWm && !prefersReducedMotion) {
  document.addEventListener('pointermove', e => {
    wmX = (e.clientX / window.innerWidth - 0.5) * 22;
    wmY = (e.clientY / window.innerHeight - 0.5) * 12;
  }, { passive: true });

  (function tickWatermark() {
    heroWm.style.transform = `translateY(-50%) translate3d(${wmX}px, ${wmY}px, 0)`;
    requestAnimationFrame(tickWatermark);
  })();
}

/* ── Mobile Menu ── */
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.contains('hidden');
  navLinks.classList.toggle('hidden', !open);
  navLinks.classList.toggle('flex', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  const spans = menuBtn.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-1px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.add('hidden');
    navLinks.classList.remove('flex');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.querySelectorAll('span').forEach(s => s.style.transform = '');
  });
});

/* ── Footer Year ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Contact Form ── */
const form = document.getElementById('contactForm');
const hint = document.getElementById('formHint');

form.addEventListener('submit', e => {
  e.preventDefault();
  hint.textContent = '✓ Message sent — I\'ll get back to you soon.';
  form.reset();
  form.querySelectorAll('input, textarea').forEach(el => el.blur());
  setTimeout(() => hint.textContent = '', 5000);
});

/* ── Scroll Reveal ── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.classList.add('opacity-100', 'translate-y-0');
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

/* ── Active Nav on Scroll ── */
const sections = document.querySelectorAll('section[id], main[id]');
const navAs    = document.querySelectorAll('.nav-links a');

const navIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAs.forEach(a => {
        const isActive = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('text-limeaccent', isActive);
        a.classList.toggle('bg-limeaccent/10', isActive);
        a.classList.toggle('text-muted', !isActive);
        const navNum = a.querySelector('.nav-num');
        if (navNum) {
          navNum.classList.toggle('text-limeaccent', isActive);
          navNum.classList.toggle('text-muted', !isActive);
        }
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => navIO.observe(s));

/* ── Header shadow on scroll ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 2px 48px rgba(0,0,0,0.7)'
    : 'none';
}, { passive: true });

/* ── Page Load Fade-In ── */
window.addEventListener('load', () => {
  document.body.classList.remove('opacity-0');
  document.body.classList.add('opacity-100');
}, { once: true });

/* ── Stagger reveal delays for bento cards ── */
document.querySelectorAll('.sk-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.06}s`;
});

document.querySelectorAll('.proj-item').forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.05}s`;
});
