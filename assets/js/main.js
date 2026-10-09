// ===== Shared site behavior =====
(function () {
  // --- Theme toggle ---
  const toggle = document.getElementById('theme-toggle');
  function applyIcon() {
    if (toggle) toggle.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
  }
  applyIcon();
  if (toggle) toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    applyIcon();
  });

  // --- Mobile nav ---
  const navToggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (navToggle && links) {
    navToggle.addEventListener('click', () => links.classList.toggle('open'));
    links.addEventListener('click', e => { if (e.target.tagName === 'A') links.classList.remove('open'); });
  }

  // --- Active nav link ---
  const path = location.pathname;
  let key = 'home';
  if (path.includes('/about')) key = 'about';
  else if (path.includes('/research')) key = 'research';
  else if (path.includes('/projects')) key = 'projects';
  else if (path.includes('/blog')) key = 'blog';
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === key);
  });

  // --- Footer years ---
  const since = document.getElementById('since-year');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (since && !since.textContent.trim()) since.textContent = '2023';

  // --- Reveal on scroll ---
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  function observeReveals() {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));
  }
  observeReveals();

  // --- Scroll progress + back-to-top ---
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('to-top');
  function onScroll() {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    if (progress) progress.style.width = pct + '%';
    if (toTop) toTop.classList.toggle('show', h.scrollTop > 420);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
