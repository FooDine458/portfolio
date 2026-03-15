/* ── Custom Cursor ── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

// Smooth ring follow
(function tickCursor() {
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  if (cursor) {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  }
  if (cursorRing) {
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
  }
  requestAnimationFrame(tickCursor);
})();

// Hover state for interactive elements
document.querySelectorAll('a, button, .proj-card, .sk-tag').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ── Hero Watermark Parallax ── */
const heroWm = document.getElementById('heroWm');
document.addEventListener('mousemove', e => {
  if (!heroWm) return;
  const xPct = (e.clientX / window.innerWidth - 0.5);
  const yPct = (e.clientY / window.innerHeight - 0.5);
  heroWm.style.transform = `translateY(-50%) translate(${xPct * 24}px, ${yPct * 14}px)`;
});

/* ── Mobile Menu ── */
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  // animate burger
  const spans = menuBtn.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-1px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
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
  // re-float labels after reset
  form.querySelectorAll('input, textarea').forEach(el => el.blur());
  setTimeout(() => hint.textContent = '', 5000);
});

/* ── Scroll Reveal ── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

/* ── Active Nav on Scroll ── */
const sections = document.querySelectorAll('section[id], main[id]');
const navAs    = document.querySelectorAll('.nav-links a');

const navIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => navIO.observe(s));

/* ── Subtle header shadow on scroll ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 2px 40px rgba(0,0,0,0.6)'
    : 'none';
}, { passive: true });