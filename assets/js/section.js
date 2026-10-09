// ===== Section renderer: reads content.json sitting next to each section's index.html =====
(function () {
  const page = document.body.dataset.page;
  if (!page || page === 'home') return;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function raw(s) { return s; } // authors/bullets may contain intentional <strong>

  function tagsHTML(tags) {
    return tags && tags.length ? `<p class="tags">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</p>` : '';
  }
  function labelHTML(label) {
    return label ? `<span class="badge">${esc(label)}</span>` : '';
  }
  function linkHTML(it) {
    return it.link ? `<p><a class="card-link-btn" href="${esc(it.link)}" target="_blank" rel="noopener">${esc(it.link_label || 'Visit →')}</a></p>` : '';
  }
  function pubLinksHTML(links) {
    return links && links.length
      ? `<p class="pub-links">${links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">[${esc(l.label)}]</a>`).join(' ')}</p>` : '';
  }

  fetch('content.json')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();              // SyntaxError thrown here if JSON is malformed
    })
    .then(data => {
      if (page === 'about') renderAbout(data);
      else if (page === 'research') renderResearch(data);
      else if (page === 'projects') renderProjects(data);
    })
    .catch(err => {
      let msg;
      if (err instanceof SyntaxError) {
        msg = 'content.json 语法错误（JSON parse error）。常见原因：多余的逗号、引号没闭合、中文引号“”混入、写了注释。把文件内容粘到 <a href="https://jsonlint.com" target="_blank">jsonlint.com</a> 验证一下即可定位。';
      } else {
        msg = 'Content failed to load (content.json missing or unreachable — ' + esc(err.message) + ').';
      }
      const main = document.querySelector('main');
      if (main) main.insertAdjacentHTML('afterbegin',
        `<div class="section"><p class="load-error">${msg}</p></div>`);
    });

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

  function renderResearch(d) {
    document.getElementById('pub-list').innerHTML = (d.publications || []).map(p => `
      <li class="card">
        <p class="pub-authors">${raw(p.authors)}</p>
        <p class="pub-title">${raw(p.title)}</p>
        <p class="muted"><em>${esc(p.venue)}</em>${labelHTML(p.badge)}</p>
        ${pubLinksHTML(p.links)}
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

  function renderProjects(groups) {
    document.getElementById('projects-root').innerHTML = (groups || []).map(g => `
      <section class="section">
        <h2 class="section-title">${esc(g.section)}</h2>
        <div class="card-grid">
          ${g.items.map(it => `
            <article class="card">
              <p class="eyebrow-card">${esc(it.period)} ${labelHTML(it.label)}</p>
              <h3>${esc(it.title)}</h3>
              ${it.desc ? `<p class="muted">${esc(it.desc)}</p>` : ''}
              ${it.bullets && it.bullets.length ? `<ul>${it.bullets.map(b => `<li>${raw(b)}</li>`).join('')}</ul>` : ''}
              ${tagsHTML(it.tags)}
              ${linkHTML(it)}
            </article>`).join('')}
        </div>
      </section>`).join('');
  }
})();
