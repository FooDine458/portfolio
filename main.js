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
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

(function tickCursor() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
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

document.querySelectorAll('a, button, .proj-item, .sk-tag, .cl-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ── Hero Watermark Parallax ── */
const heroWm = document.getElementById('heroWm');
document.addEventListener('mousemove', e => {
  if (!heroWm) return;
  const xPct = (e.clientX / window.innerWidth  - 0.5);
  const yPct = (e.clientY / window.innerHeight - 0.5);
  heroWm.style.transform = `translateY(-50%) translate(${xPct * 22}px, ${yPct * 12}px)`;
});

/* ── Mobile Menu ── */
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
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
}, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

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
}, { threshold: 0.3 });

sections.forEach(s => navIO.observe(s));

/* ── Header shadow on scroll ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 2px 48px rgba(0,0,0,0.7)'
    : 'none';
}, { passive: true });

/* ── Stagger reveal delays for bento cards ── */
document.querySelectorAll('.sk-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.06}s`;
});

document.querySelectorAll('.proj-item').forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.05}s`;
});