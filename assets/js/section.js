// ===== Section renderer: reads content.json sitting next to each section's index.html =====
// 要更新内容：直接编辑对应文件夹下的 content.json，无需改 HTML。
(function () {
  const page = document.body.dataset.page;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // authors/titles in research JSON contain intentional <strong>; keep them
  function raw(s) { return s; }

  function tagsHTML(tags) {
    return tags && tags.length ? `<p class="tags">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</p>` : '';
  }

  fetch('content.json')
    .then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(data => {
      if (page === 'about') renderAbout(data);
      else if (page === 'research') renderResearch(data);
      else if (page === 'projects') renderProjects(data);
    })
    .catch(() => {
      const main = document.querySelector('main');
      if (main) main.innerHTML = '<div class="section"><p class="muted">Content failed to load (content.json missing).</p></div>';
    });

  // ---------- About ----------
  function renderAbout(d) {
    const lede = document.getElementById('about-lede');
    if (lede && d.lede) lede.textContent = d.lede;
    document.getElementById('about-bio').innerHTML = (d.bio || []).map(p => `<p>${esc(p)}</p>`).join('');
    document.getElementById('about-education').innerHTML = (d.education || []).map(e => `
      <div class="card">
        <h3>${esc(e.school)}</h3>
        <p class="muted">${esc(e.meta)}</p>
        ${(e.lines || []).map(l => `<p>${esc(l)}</p>`).join('')}
        ${tagsHTML(e.tags)}
      </div>`).join('');
    document.getElementById('about-skills').innerHTML = (d.skills || []).map(s => `
      <div class="card">
        <h3>${esc(s.title)}</h3>
        ${(s.lines || []).map(l => `<p class="muted">${esc(l)}</p>`).join('')}
        ${tagsHTML(s.tags)}
      </div>`).join('');
  }

  // ---------- Research ----------
  function renderResearch(d) {
    document.getElementById('pub-list').innerHTML = (d.publications || []).map(p => `
      <li class="card">
        <p class="pub-authors">${raw(p.authors)}</p>
        <p class="pub-title">${raw(p.title)}</p>
        <p class="muted"><em>${esc(p.venue)}</em>${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}</p>
      </li>`).join('');
    document.getElementById('timeline').innerHTML = (d.experience || []).map(x => `
      <article class="timeline-item">
        <div class="timeline-date">${esc(x.date)}</div>
        <div class="card timeline-card">
          <h3>${esc(x.title)}</h3>
          <p class="muted">${esc(x.meta)}</p>
          ${x.bullets && x.bullets.length ? `<ul>${x.bullets.map(b => `<li>${raw(b)}</li>`).join('')}</ul>` : ''}
        </div>
      </article>`).join('');
    document.getElementById('honor-list').innerHTML = (d.honors || []).map(h => `
      <li class="card"><strong>${esc(h.title)}</strong> — ${esc(h.desc)}</li>`).join('');
  }

  // ---------- Projects ----------
  function renderProjects(groups) {
    document.getElementById('projects-root').innerHTML = (groups || []).map(g => `
      <section class="section">
        <h2 class="section-title">${esc(g.section)}</h2>
        <div class="card-grid">
          ${g.items.map(it => `
            <article class="card">
              <p class="eyebrow-card">${esc(it.period)}</p>
              <h3>${esc(it.title)}</h3>
              ${it.desc ? `<p class="muted">${esc(it.desc)}</p>` : ''}
              ${it.bullets && it.bullets.length ? `<ul>${it.bullets.map(b => `<li>${raw(b)}</li>`).join('')}</ul>` : ''}
              ${tagsHTML(it.tags)}
            </article>`).join('')}
        </div>
      </section>`).join('');
  }
})();
