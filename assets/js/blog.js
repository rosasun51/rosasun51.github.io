// ===== Blog engine: search + tags + archive + TOC + post rendering =====
(function () {
  const listEl = document.getElementById('post-list');
  const latestEl = document.getElementById('latest-posts');
  const bodyEl = document.getElementById('post-body');
  const searchInput = document.getElementById('search-input');
  const chipBox = document.getElementById('tag-chips');

  // On the homepage (root) the manifest lives at blog/posts.json and post pages at blog/post.html
  const atRoot = !listEl && !!latestEl;
  const MANIFEST = atRoot ? 'blog/posts.json' : 'posts.json';
  function postURL(p) {
    return (atRoot ? 'blog/post.html?post=' : 'post.html?post=') + encodeURIComponent(p.slug);
  }

  let POSTS = [], activeTag = null;

  function cardHTML(p) {
    return `
      <a class="post-item" href="${postURL(p)}">
        <span class="post-date">${p.date}${p.tags && p.tags.length ? ' · ' + p.tags.join(' / ') : ''}</span>
        <h3>${p.title}</h3>
        <p class="muted">${p.excerpt || ''}</p>
      </a>`;
  }

  function renderIndex() {
    const q = (searchInput && searchInput.value || '').trim().toLowerCase();
    let posts = POSTS.filter(p => {
      const hitQ = !q || (p.title + ' ' + (p.excerpt || '') + ' ' + (p.tags || []).join(' ')).toLowerCase().includes(q);
      const hitT = !activeTag || (p.tags || []).includes(activeTag);
      return hitQ && hitT;
    });
    if (!posts.length) {
      listEl.innerHTML = '<p class="no-results">没有找到相关文章 · No matching posts 🤔</p>';
      return;
    }
    let html = '', lastYear = null;
    posts.forEach(p => {
      const y = (p.date || '').slice(0, 4);
      if (y !== lastYear) { html += `<p class="archive-year">${y}</p>`; lastYear = y; }
      html += cardHTML(p);
    });
    listEl.innerHTML = html;
  }

  function buildChips() {
    if (!chipBox) return;
    const tags = [...new Set(POSTS.flatMap(p => p.tags || []))];
    chipBox.innerHTML = tags.map(t =>
      `<span class="tag-chip${t === activeTag ? ' on' : ''}" data-tag="${t}">#${t}</span>`).join('');
    chipBox.addEventListener('click', e => {
      const chip = e.target.closest('.tag-chip');
      if (!chip) return;
      activeTag = activeTag === chip.dataset.tag ? null : chip.dataset.tag;
      buildChips(); renderIndex();
    });
  }

  function renderLatest() {
    if (!latestEl) return;
    latestEl.innerHTML = POSTS.length
      ? POSTS.slice(0, 3).map(cardHTML).join('')
      : '<p class="muted">No posts yet — coming soon!</p>';
  }

  function renderPost() {
    const slug = new URLSearchParams(location.search).get('post');
    const post = POSTS.find(p => p.slug === slug) || POSTS[0];
    if (!post) { bodyEl.innerHTML = '<p class="muted">Post not found.</p>'; return; }
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-date').textContent =
      post.date + (post.tags && post.tags.length ? '  ·  ' + post.tags.join(' / ') : '');
    document.title = post.title + ' · Ruisheng Sun';
    fetch(post.file)
      .then(r => { if (!r.ok) throw 0; return r.text(); })
      .then(md => { bodyEl.innerHTML = marked.parse(md); buildTOC(); })
      .catch(() => { bodyEl.innerHTML = '<p class="muted">Failed to load post content.</p>'; });
  }

  function buildTOC() {
    const nav = document.getElementById('toc-nav');
    const toc = document.getElementById('toc');
    if (!nav || !toc) return;
    const heads = bodyEl.querySelectorAll('h2, h3');
    if (!heads.length) { toc.style.display = 'none'; return; }
    nav.innerHTML = [...heads].map((h, i) => {
      if (!h.id) h.id = 'sec-' + i;
      return `<a href="#${h.id}" class="lvl-${h.tagName === 'H3' ? 3 : 2}" data-target="${h.id}">${h.textContent}</a>`;
    }).join('');
    nav.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      document.getElementById(a.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          nav.querySelectorAll('a').forEach(a => a.classList.remove('on'));
          nav.querySelector(`a[data-target="${en.target.id}"]`)?.classList.add('on');
        }
      });
    }, { rootMargin: '-80px 0px -65% 0px' });
    heads.forEach(h => spy.observe(h));
  }

  fetch(MANIFEST)
    .then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(posts => {
      POSTS = posts.sort((a, b) => b.date.localeCompare(a.date));
      if (listEl) { buildChips(); renderIndex(); if (searchInput) searchInput.addEventListener('input', renderIndex); }
      renderLatest();
      if (bodyEl) renderPost();
    })
    .catch(() => {
      const msg = '<p class="muted">Blog unavailable (posts.json missing).</p>';
      if (listEl) listEl.innerHTML = msg;
      if (latestEl) latestEl.innerHTML = msg;
      if (bodyEl) bodyEl.innerHTML = msg;
    });
})();
