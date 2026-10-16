// js/app.js - Main Application Controller & Hash Router

(function () {
  'use strict';

  // Application State
  const AppState = {
    currentRoute: 'today',
    streak: 1,
    checkedModules: {},
    drillPlaced: {},
    masteredTerms: {},
    quizScore: null
  };

  function loadState() {
    try {
      const saved = localStorage.getItem('gitlab_console_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(AppState, parsed);
      }
      // Check streak
      const lastVisit = localStorage.getItem('gitlab_last_visit');
      const today = new Date().toDateString();
      if (lastVisit && lastVisit !== today) {
        AppState.streak = (AppState.streak || 0) + 1;
      }
      localStorage.setItem('gitlab_last_visit', today);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem('gitlab_console_state', JSON.stringify({
        streak: AppState.streak,
        checkedModules: AppState.checkedModules,
        drillPlaced: AppState.drillPlaced,
        masteredTerms: AppState.masteredTerms,
        quizScore: AppState.quizScore
      }));
    } catch (e) {}
  }

  // Router
  function getRoute() {
    const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
    return hash || 'today';
  }

  function navigate(route) {
    window.location.hash = '#/' + route;
  }

  function updateNav() {
    const route = getRoute();
    document.querySelectorAll('.nav-item').forEach(el => {
      const v = el.getAttribute('data-v');
      if (v === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // View Renderers
  function renderToday(data) {
    const totalBlocks = data.blocks.reduce((acc, b) => acc + b.mods.length, 0);
    const checkedCount = Object.keys(AppState.checkedModules).length;
    const blockProgress = Math.min(100, Math.round((checkedCount / (totalBlocks || 1)) * 100));
    
    const drillProgress = Object.keys(AppState.drillPlaced).length >= 6 ? 100 : Math.round((Object.keys(AppState.drillPlaced).length / 6) * 100);
    const quizProgress = AppState.quizScore !== null ? 100 : 0;

    // Daily QOTD from video cards or quizzes
    const qotd = data.video && data.video.cards && data.video.cards.length > 0
      ? data.video.cards[0]
      : { question: "What does the Authorizing Official actually authorize?", detail: "The control plane as the system of record for code changes and pipeline evidence.", why: "The job plane is untrusted execution.", example: "The AO signs Git history, pipeline contracts, and findings." };

    return `
      <div class="today-hero">
        <div class="today-text">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:.5rem">
            <span class="streak-badge">🔥 ${AppState.streak} Day Study Streak</span>
            <span class="tag-badge gitlab">Console v2.0</span>
            <span class="tag-badge fedramp" title="FedRAMP is the U.S. government cloud security authorization program. Moderate is its middle impact level; FR2411959145 is the marketplace package ID for GitLab Dedicated for Government.">FedRAMP Moderate (FR2411959145)</span>
          </div>
          <h2>Architect Study Console: GitLab DevSecOps</h2>
          <p>
            Master GitLab DevSecOps Platform Architecture as an Enterprise & AI Architect. Single-tenant GovCloud boundaries, the Control Plane vs. Job Plane split, and the strict zero-egress self-hosted AI Gateway.
          </p>
          <div style="display:flex;gap:10px;margin-top:1rem">
            <button class="btn btn-primary" onclick="window.location.hash='#/learn'">Start Curriculum (8 Blocks)</button>
            <button class="btn" onclick="window.location.hash='#/practice'">Take Architecture Quiz</button>
          </div>
        </div>

        <div class="goal-rings-wrapper">
          <div class="ring-card">
            <div class="circular-ring">
              <svg viewBox="0 0 36 36">
                <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="ring-progress orange" stroke-dasharray="${blockProgress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="ring-value">${blockProgress}%</div>
            </div>
            <div class="ring-label">Curriculum</div>
          </div>

          <div class="ring-card">
            <div class="circular-ring">
              <svg viewBox="0 0 36 36">
                <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="ring-progress sky" stroke-dasharray="${drillProgress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="ring-value">${drillProgress}%</div>
            </div>
            <div class="ring-label">Placement</div>
          </div>

          <div class="ring-card">
            <div class="circular-ring">
              <svg viewBox="0 0 36 36">
                <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="ring-progress emerald" stroke-dasharray="${quizProgress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="ring-value">${quizProgress ? 'Pass' : '0%'}</div>
            </div>
            <div class="ring-label">Quiz</div>
          </div>
        </div>
      </div>

      <!-- Question of the Day -->
      <div class="qotd-card">
        <div class="qotd-header">
          <span class="qotd-tag">QUESTION OF THE DAY · DEEP DIVE CUT</span>
          <span class="rung-badge rung-200">Rung 200</span>
        </div>
        <div class="qotd-question">${qotd.question}</div>
        <p style="color:var(--text-secondary);font-size:.9rem;line-height:1.5;">${qotd.detail}</p>
        <button class="cue-toggle" onclick="document.getElementById('qotd-answer-cue').style.display = document.getElementById('qotd-answer-cue').style.display === 'none' ? 'block' : 'none'">
          <span>▶ Toggle Architect Answer Cue</span>
        </button>
        <div id="qotd-answer-cue" class="qotd-cue" style="display:none;">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Why it matters:</div>
          <div>${qotd.why}</div>
          <div style="margin-top:8px;font-style:italic;">Example: ${qotd.example}</div>
        </div>
      </div>

      <!-- Placement Drill -->
      <div class="drill-section">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h3 style="font-size:1.15rem;font-weight:700;color:var(--text-primary)">Daily Placement Drill: GovCloud Boundary</h3>
            <p style="font-size:.85rem;color:var(--text-secondary);margin-top:2px;">
              Place each component into its correct operational boundary for <b>GitLab Dedicated for Government</b>.
            </p>
          </div>
          <button class="btn btn-sm" onclick="window.EnhanceEngine.resetDrill()">Reset Drill</button>
        </div>

        <div class="drill-help card" style="padding:.85rem 1rem;margin:1rem 0;border:1px dashed var(--border-highlight);background:var(--bg-surface);">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:.35rem;">How to place</div>
          <ol style="margin:0;padding-inline-start:1.2rem;color:var(--text-secondary);font-size:.88rem;line-height:1.55;">
            <li><b>Click a chip</b> in the pool so it highlights.</li>
            <li><b>Click a bucket</b> (Control Plane, Job Plane, or External) to drop it there.</li>
            <li>Green edge = correct. Red edge = wrong — click the chip again to pull it back, then retry.</li>
            <li>Use <b>Reset Drill</b> to clear all six and start over.</li>
          </ol>
        </div>

        <div class="drill-item-pool" id="drill-pool">
          <!-- Rendered by EnhanceEngine -->
        </div>

        <div class="drill-buckets">
          <div class="drill-bucket" data-bucket="control-plane" id="bucket-control-plane">
            <div class="drill-bucket-title">
              <span>Tenant Control Plane (GovCloud)</span>
              <span class="tag-badge gitlab">GitLab Managed</span>
            </div>
            <div class="drill-bucket-content"></div>
          </div>

          <div class="drill-bucket" data-bucket="job-plane" id="bucket-job-plane">
            <div class="drill-bucket-title">
              <span>Customer Job Plane (Agency VPC)</span>
              <span class="tag-badge gov">Customer Managed</span>
            </div>
            <div class="drill-bucket-content"></div>
          </div>

          <div class="drill-bucket" data-bucket="external" id="bucket-external">
            <div class="drill-bucket-title">
              <span>External / Unauthorized Egress</span>
              <span class="tag-badge fedramp">Boundary Gate</span>
            </div>
            <div class="drill-bucket-content"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLearn(data) {
    return `
      <div>
        <h1 class="page-title">Curriculum: 8-Block Mastery Day</h1>
        <p class="page-subtitle">
          The rigorous 7-hour architectural path from scope through conceptual, logical, and physical views, lab verification, failure modes, and teach-back. Open a block to see objectives and modules.
        </p>

        <div class="block-list">
          ${data.blocks.map(b => `
            <details class="block-card block-details" id="block-${b.n}" ${b.n === 1 ? 'open' : ''}>
              <summary class="block-top block-summary">
                <div class="block-title-box">
                  <div class="block-num">${b.n}</div>
                  <div class="block-title">${b.title}</div>
                </div>
                <div class="block-meta">
                  <span class="tag-badge tag-time">⏱ ${b.time}</span>
                  <span class="rung-badge rung-${b.rungs.split('-')[0]}">Rung ${b.rungs}</span>
                  <span class="block-chevron" aria-hidden="true">▾</span>
                </div>
              </summary>
              <div class="block-body">
                <p class="block-opener">${b.opener}</p>
                
                <div style="background:var(--bg-surface);border:1px solid var(--border-muted);padding:.85rem 1rem;border-radius:var(--radius-sm);font-size:.82rem;margin-bottom:1rem;">
                  <div style="font-weight:700;color:var(--text-primary);margin-bottom:2px;">🎯 Target Objective:</div>
                  <div style="color:var(--text-secondary);">${b.obj}</div>
                  <div style="font-weight:700;color:var(--accent-gitlab);margin-top:6px;">📦 Deliverable: <span style="font-weight:400;color:var(--text-primary);">${b.deliv}</span></div>
                </div>

                <div class="block-modules">
                  ${b.mods.map((m, idx) => {
                    const modKey = `b${b.n}_m${idx}`;
                    const isChecked = !!AppState.checkedModules[modKey];
                    return `
                      <div class="mod-item">
                        <input type="checkbox" class="mod-checkbox" id="${modKey}" data-key="${modKey}" ${isChecked ? 'checked' : ''} onchange="window.AppEngine.toggleModule('${modKey}')">
                        <div class="mod-desc">
                          <label for="${modKey}" class="mod-name" style="cursor:pointer;">${m.t}</label>
                          <div style="color:var(--text-secondary);font-size:.82rem;margin-top:2px;">👉 <b>Action:</b> ${m.action}</div>
                          <div class="mod-why">💡 <b>Why it matters:</b> ${m.whyMatters}</div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </details>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderViews(data) {
    const v = data.views;
    return `
      <div>
        <h1 class="page-title">Architecture Views & Blueprints</h1>
        <p class="page-subtitle">
          Multi-dimensional model of GitLab DevSecOps Platform: Conceptual, Logical, Physical, and Integration/AI Views mapped to TOGAF and DoDAF.
        </p>

        <!-- View Navigation Pills -->
        <div style="display:flex;gap:8px;margin-bottom:1.5rem;flex-wrap:wrap;">
          <a href="#views-conceptual" class="btn btn-sm">1. Conceptual View</a>
          <a href="#views-logical" class="btn btn-sm">2. Logical View</a>
          <a href="#views-physical" class="btn btn-sm">3. Physical View</a>
          <a href="#views-integration" class="btn btn-sm">4. Integration & AI</a>
        </div>

        <!-- 1. Conceptual -->
        <div class="card" id="views-conceptual">
          <div class="card-header">
            <div>
              <div class="card-title">1. Conceptual View: Capabilities & Operational Concept</div>
              <div style="font-size:.78rem;color:var(--text-secondary);">${v.conceptual.altitude}</div>
            </div>
            <span class="rung-badge rung-100">OV-1 · CV-2</span>
          </div>

          <div class="diagram-img-box" style="height:280px;cursor:pointer;" onclick="window.EnhanceEngine.openLightbox('${v.conceptual.diagram}', 'Conceptual Operational Concept (OV-1)')">
            <img src="${v.conceptual.diagram}" alt="Conceptual View">
          </div>

          <div style="margin-top:1.5rem;">
            <h4 style="font-size:.95rem;font-weight:700;margin-bottom:.5rem;">Core Capabilities (C1 - C9)</h4>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>#</th><th>Capability</th><th>Outcome Delivered</th><th>Actors</th><th>Source</th></tr>
                </thead>
                <tbody>
                  ${v.conceptual.capabilities.map(c => `
                    <tr>
                      <td style="font-family:var(--font-mono);font-weight:700;color:var(--accent-gitlab);">${c.id}</td>
                      <td style="font-weight:600;">${c.name}</td>
                      <td>${c.outcome}</td>
                      <td>${c.actors}</td>
                      <td style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);">${c.src}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 2. Logical -->
        <div class="card" id="views-logical">
          <div class="card-header">
            <div>
              <div class="card-title">2. Logical View: Components & Data Flows</div>
              <div style="font-size:.78rem;color:var(--text-secondary);">${v.logical.altitude}</div>
            </div>
            <span class="rung-badge rung-200">OV-2 · SV-1</span>
          </div>

          <div class="diagram-grid">
            <div class="diagram-card" onclick="window.EnhanceEngine.openLightbox('${v.logical.diagrams[0]}', 'Logical request path (SV-1)')">
              <div class="diagram-img-box">
                <img src="${v.logical.diagrams[0]}" alt="Logical request path">
              </div>
              <div class="diagram-card-info">
                <div class="diagram-card-title">Logical request path (Draw.io)</div>
                <div class="diagram-card-desc">Front door → Rails → Sidekiq → Postgres → Gitaly → Runner</div>
              </div>
            </div>
            <div class="diagram-card" onclick="window.EnhanceEngine.openLightbox('${v.logical.diagrams[1]}', 'Physical placement (Dedicated for Government)')">
              <div class="diagram-img-box">
                <img src="${v.logical.diagrams[1]}" alt="Physical placement">
              </div>
              <div class="diagram-card-info">
                <div class="diagram-card-title">Physical placement (Draw.io)</div>
                <div class="diagram-card-desc">Tenant vs outside: IdP, FIPS runners, self-hosted AI Gateway</div>
              </div>
            </div>
          </div>

          <div style="margin-top:1.5rem;">
            <h4 style="font-size:.95rem;font-weight:700;margin-bottom:.5rem;">Logical Component Responsibilities</h4>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>Component</th><th>Responsibility</th><th>Inputs</th><th>Outputs</th></tr>
                </thead>
                <tbody>
                  ${v.logical.components.map(cmp => `
                    <tr>
                      <td style="font-weight:600;color:var(--text-link);">${cmp.name}</td>
                      <td>${cmp.resp}</td>
                      <td style="font-family:var(--font-mono);font-size:.78rem;">${cmp.inputs}</td>
                      <td style="font-family:var(--font-mono);font-size:.78rem;">${cmp.outputs}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. Physical -->
        <div class="card" id="views-physical">
          <div class="card-header">
            <div>
              <div class="card-title">3. Physical View: Four Offerings & Government Blueprint</div>
              <div style="font-size:.78rem;color:var(--text-secondary);">${v.physical.altitude}</div>
            </div>
            <span class="rung-badge rung-300">Phase D · SV-1/2</span>
          </div>

          <div class="diagram-img-box" style="height:300px;cursor:pointer;" onclick="window.EnhanceEngine.openLightbox('${v.physical.diagram}', 'GitLab Dedicated for Government Physical Topology')">
            <img src="${v.physical.diagram}" alt="Physical Topology">
          </div>

          <div style="margin-top:1.5rem;">
            <h4 style="font-size:.95rem;font-weight:700;margin-bottom:.5rem;">The Four Offerings Comparison Matrix</h4>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>Offering</th><th>Infra Operator</th><th>Residency</th><th>Git Storage</th><th>Runners</th><th>AI Path</th><th>Compliance</th></tr>
                </thead>
                <tbody>
                  ${v.physical.offerings.map(o => `
                    <tr style="${o.name.includes('Government') ? 'background:rgba(52,211,153,0.06);border-left:3px solid var(--accent-emerald);' : ''}">
                      <td style="font-weight:700;color:${o.name.includes('Government') ? 'var(--accent-emerald)' : 'var(--text-primary)'};">${o.name}</td>
                      <td>${o.operator}</td>
                      <td>${o.residency}</td>
                      <td style="font-family:var(--font-mono);font-size:.75rem;">${o.gitStorage}</td>
                      <td>${o.runners}</td>
                      <td>${o.aiDefault}</td>
                      <td style="font-size:.8rem;color:var(--text-secondary);">${o.compliance}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 4. Integration & AI -->
        <div class="card" id="views-integration">
          <div class="card-header">
            <div>
              <div class="card-title">4. Integration & AI Elements: The Two Duo Paths</div>
              <div style="font-size:.78rem;color:var(--text-secondary);">${v.integration.altitude}</div>
            </div>
            <span class="rung-badge rung-300">Phase C/D · SV-6</span>
          </div>

          <div class="diagram-grid">
            <div class="diagram-card" onclick="window.EnhanceEngine.openLightbox('${v.integration.diagrams[0]}', 'GitLab Duo AI dual path')">
              <div class="diagram-img-box">
                <img src="${v.integration.diagrams[0]}" alt="Duo AI dual path">
              </div>
              <div class="diagram-card-info">
                <div class="diagram-card-title">Dual AI data paths</div>
                <div class="diagram-card-desc">Self-hosted (authorized) vs commercial gateway (blocked on Gov)</div>
              </div>
            </div>
            <div class="diagram-card" onclick="window.EnhanceEngine.openLightbox('${v.integration.diagrams[1]}', 'Trust domains (conceptual)')">
              <div class="diagram-img-box">
                <img src="${v.integration.diagrams[1]}" alt="Trust domains">
              </div>
              <div class="diagram-card-info">
                <div class="diagram-card-title">Trust domains around the platform</div>
                <div class="diagram-card-desc">Control plane · job plane · unauthorized egress</div>
              </div>
            </div>
          </div>

          <div style="margin-top:1.5rem;">
            <h4 style="font-size:.95rem;font-weight:700;margin-bottom:.5rem;">External Systems & GovCloud Support</h4>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>System</th><th>Direction</th><th>Mechanism</th><th>Data Exchanged</th><th>Auth</th><th>GovCloud Support</th></tr>
                </thead>
                <tbody>
                  ${v.integration.integrations.map(ext => `
                    <tr>
                      <td style="font-weight:600;">${ext.system}</td>
                      <td style="font-family:var(--font-mono);font-size:.78rem;">${ext.dir}</td>
                      <td style="font-family:var(--font-mono);font-size:.78rem;">${ext.mech}</td>
                      <td>${ext.data}</td>
                      <td>${ext.auth}</td>
                      <td style="color:${ext.gov.includes('NOT') ? 'var(--accent-rose)' : 'var(--text-secondary)'};font-size:.82rem;">${ext.gov}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSlides(data) {
    const v = (data && data.video) || {};
    const yt = (v.youtube || '').trim();
    const ytEmbed = yt
      ? `<div class="deck-video-top">
          <iframe class="wide-player" src="https://www.youtube-nocookie.com/embed/${yt}?rel=0&playsinline=1&modestbranding=1" title="${v.title || 'One-Day Mastery presentation'}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy" style="border:0"></iframe>
          <p class="obj" style="margin-top:.55rem"><a href="https://www.youtube.com/watch?v=${yt}" target="_blank" rel="noopener">Open the One-Day Mastery presentation on YouTube ↗</a></p>
        </div>`
      : '';
    return `
      <div>
        <h1 class="page-title">Presentation Deck & Video Cut</h1>
        <p class="page-subtitle">
          One-Day Mastery narrated cut on top, then the 15-slide NotebookLM deck: control plane versus job plane, Dedicated for Government, and the Q4 FY26 decision memo.
        </p>
        ${ytEmbed}
        <div class="slide-viewer" id="slide-viewer-box">
          <!-- Rendered by EnhanceEngine -->
        </div>
      </div>
    `;
  }

  function renderShorts(data) {
    const shorts = data.shorts || [];
    return `
      <div>
        <h1 class="page-title">Video Shorts Theater</h1>
        <p class="page-subtitle">
          6 motion-graphic architecture shorts. No cinematic fluff. Each short owns ONE job: boundaries, control-plane vs job-plane flows, external integrations, and the zero-egress AI path.
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(340px, 100%), 1fr));gap:1.5rem;margin-top:1.5rem;">
          ${shorts.map((s, idx) => `
            <div class="card" style="display:flex;flex-direction:column;overflow:hidden;padding:0;">
              <div style="background:#000;width:100%;height:320px;display:flex;align-items:center;justify-content:center;">
                <video controls style="width:100%;height:100%;object-fit:contain;" preload="metadata" src="${s.videoUrl}">
                  Your browser does not support the video tag.
                </video>
              </div>
              <div style="padding:1.25rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;">
                  <span class="tag-badge gitlab">Short 0${idx + 1}</span>
                  <span class="rung-badge rung-200">Architecture Short</span>
                </div>
                <h3 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem;">${s.title}</h3>
                <p style="font-size:.82rem;color:var(--text-secondary);line-height:1.5;">${s.focus}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let activeLibraryChapter = 0;

  function renderLibrary(data) {
    const chapters = data.library || [];
    if (chapters.length === 0) {
      return `<div><h1 class="page-title">Deep Dive Library</h1><p class="page-subtitle">No chapters loaded.</p></div>`;
    }

    const current = chapters[activeLibraryChapter] || chapters[0];
    const src = current.html || '';

    return `
      <div>
        <h1 class="page-title">Architecture Deep Dive Library</h1>
        <p class="page-subtitle">
          Full HTML chapters in this window: TOGAF/DoDAF crosswalks, security catalogs, and executive briefings from the deep-dive research.
        </p>

        <div class="lib-grid" style="display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:1.5rem;align-items:start;margin-top:1.5rem;">
          <div style="background:var(--bg-card);border:1px solid var(--border-default);border-radius:var(--radius-md);overflow:hidden;">
            <div style="padding:.75rem 1rem;background:var(--bg-surface);border-bottom:1px solid var(--border-default);font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary);">
              Chapters (${chapters.length})
            </div>
            <div style="display:flex;flex-direction:column;max-height:650px;overflow-y:auto;">
              ${chapters.map((ch, idx) => `
                <div style="padding:.85rem 1rem;border-bottom:1px solid var(--border-muted);cursor:pointer;background:${idx === activeLibraryChapter ? 'var(--sel-bg)' : 'transparent'};border-left:3px solid ${idx === activeLibraryChapter ? 'var(--sel-border)' : 'transparent'};" onclick="window.AppEngine.selectChapter(${idx})">
                  <div style="font-weight:600;font-size:.88rem;color:${idx === activeLibraryChapter ? 'var(--sel-fg)' : 'var(--text-primary)'};">${ch.title}</div>
                  <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px;">${ch.filename || ch.html || ''}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card lib-reader" style="padding:0;min-height:650px;background:var(--bg-card);max-height:85vh;overflow:hidden;display:flex;flex-direction:column;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border-bottom:1px solid var(--border-muted);background:var(--bg-surface);flex-shrink:0;">
              <span class="tag-badge gitlab">Chapter ${activeLibraryChapter + 1} of ${chapters.length}</span>
              <a href="${src}" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:.78rem;color:var(--text-link);">Open full page ↗</a>
            </div>
            <iframe class="lib-iframe" title="${current.title || 'Library chapter'}" src="${src}" loading="lazy"></iframe>
          </div>
        </div>
      </div>
    `;
  }

  function selectChapter(idx) {
    activeLibraryChapter = idx;
    const data = window.CONSOLE_DATA;
    if (data) {
      const appEl = document.getElementById('main-content');
      if (appEl) appEl.innerHTML = renderLibrary(data);
    }
  }

  function renderDebates(data) {
    const debates = data.debates || [];
    return `
      <div>
        <h1 class="page-title">Live Architectural Claims & Debates</h1>
        <p class="page-subtitle">
          ${debates.length} live debates with warrants. Open the panels below for hidden assumptions, qualifications, and designed counter-evidence.
        </p>

        ${debates.map(d => `
          <div class="debate-card">
            <div class="debate-header">
              <span class="debate-badge">Debate ${d.num}</span>
              <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);">${d.title}</h3>
            </div>
            
            <div class="debate-grid">
              <div class="claim-box claim-a">
                <div class="claim-title">Claim A (The Platform Bet)</div>
                <div class="claim-content">${d.claimA}</div>
              </div>
              <div class="claim-box claim-b">
                <div class="claim-title">Claim B (The Counter / Qualification)</div>
                <div class="claim-content">${d.claimB}</div>
              </div>
            </div>

            <div class="debate-footer debate-panels">
              <details class="debate-panel" open>
                <summary>Warrant</summary>
                <div class="debate-panel-body">${d.warrant}</div>
              </details>
              <details class="debate-panel">
                <summary>Hidden assumptions</summary>
                <div class="debate-panel-body">${d.hiddenAssumptions}</div>
              </details>
              <details class="debate-panel">
                <summary>Qualifications</summary>
                <div class="debate-panel-body">${d.qualifications}</div>
              </details>
              <details class="debate-panel">
                <summary>🔬 Evidence that would change the picture</summary>
                <div class="debate-panel-body">${d.changingEvidence}</div>
              </details>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderPractice(data) {
    const qn = (data.quizzes || []).length;
    const fn = (data.glossary || []).length;
    return `
      <div>
        <h1 class="page-title">Practice Hub: Quizzes & Flashcards</h1>
        <p class="page-subtitle">
          ${qn}-question architecture quiz, plus ${fn} flashcards. On flashcards: <b>Space</b> flips the card; ← / → move between cards. Click also flips.
        </p>

        <div style="display:flex;gap:10px;margin-bottom:1.5rem;flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-show-quiz" onclick="window.EnhanceEngine.switchPracticeMode('quiz')">Interactive Quiz (${qn})</button>
          <button class="btn" id="btn-show-flashcards" onclick="window.EnhanceEngine.switchPracticeMode('flashcards')">Flashcards (${fn})</button>
        </div>

        <!-- Quiz Container -->
        <div id="quiz-view" class="quiz-container">
          <!-- Rendered by EnhanceEngine -->
        </div>

        <!-- Flashcards Container -->
        <div id="flashcard-view" style="display:none;">
          <!-- Rendered by EnhanceEngine -->
        </div>
      </div>
    `;
  }

  function renderFailureModes(data) {
    return `
      <div>
        <h1 class="page-title">Failure Modes & Threat Matrix</h1>
        <p class="page-subtitle">
          What breaks, what leaks, and what the controls actually catch across Conceptual, Logical, Physical, and AI layers.
        </p>

        <div style="display:flex;gap:8px;margin-bottom:1.25rem;flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" onclick="window.EnhanceEngine.filterFailures('All')">All Layers (16)</button>
          <button class="btn btn-sm" onclick="window.EnhanceEngine.filterFailures('Conceptual')">Conceptual</button>
          <button class="btn btn-sm" onclick="window.EnhanceEngine.filterFailures('Logical')">Logical</button>
          <button class="btn btn-sm" onclick="window.EnhanceEngine.filterFailures('Physical')">Physical</button>
          <button class="btn btn-sm" onclick="window.EnhanceEngine.filterFailures('Integration / AI')">AI & Integration</button>
          <button class="btn btn-sm" onclick="window.EnhanceEngine.filterFailures('Security')">Security</button>
        </div>

        <div id="failure-modes-list" style="display:flex;flex-direction:column;gap:1.25rem;">
          <!-- Rendered by EnhanceEngine -->
        </div>
      </div>
    `;
  }

  function renderGlossary(data) {
    return `
      <div>
        <h1 class="page-title">Glossary & Terms Ledger</h1>
        <p class="page-subtitle">
          30+ foundational terms earned across Rungs 100, 200, and 300 with definitions, architectural context, and source citations.
        </p>

        <div style="display:flex;gap:10px;margin-bottom:1.25rem;align-items:center;">
          <input type="text" id="glossary-search" placeholder="Filter terms or definitions..." class="nav-search" style="margin:0;flex:1;max-width:400px;" oninput="window.EnhanceEngine.filterGlossary()">
          <span id="glossary-count" style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-secondary);">Showing ${data.glossary.length} terms</span>
        </div>

        <div class="table-wrapper">
          <table class="data-table" id="glossary-table">
            <thead>
              <tr><th>Term</th><th>Category</th><th>Rung</th><th>Definition</th><th>Where</th><th>Source</th></tr>
            </thead>
            <tbody>
              ${data.glossary.map(g => `
                <tr data-term="${g.term.toLowerCase()}" data-def="${g.definition.toLowerCase()}" data-cat="${g.category.toLowerCase()}">
                  <td style="font-weight:700;color:var(--text-link);white-space:nowrap;">
                    ${g.term} ${g.essential ? '<span style="color:var(--accent-gitlab);font-size:.7rem;">★</span>' : ''}
                  </td>
                  <td><span class="tag-badge">${g.category}</span></td>
                  <td><span class="rung-badge rung-${g.rung}">Rung ${g.rung}</span></td>
                  <td style="line-height:1.45;">${g.definition}</td>
                  <td style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-secondary);">${g.where.split('/')[1] || g.where}</td>
                  <td style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);">${g.source}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderBacklog() {
    const open = [
      ['Captions for video shorts', 'Add WebVTT captions to the six shorts so they work with sound off.'],
      ['Quarterly source re-check', 'Re-verify FedRAMP listing FR2411959145 and ledger URLs — government pages move.'],
      ['Offline media', 'Service worker caches shell CSS/JS only; slides and MP4s still need network.']
    ];
    const done = [
      ['ODM presentation on Deck', 'YouTube PzEIulYVSrA embedded above the 15-slide ODM deck.'],
      ['Library HTML chapters', 'Deep Dive Library now loads full HTML in the reader pane (no raw markdown dump).'],
      ['Architecture view SVGs', 'Conceptual / logical / physical / AI views use flat agnostic icon boards.']
    ];
    const codes = [
      ['[S#]', 'Source number in the Source Ledger'],
      ['FM-##', 'Failure mode id on the Failure Modes page'],
      ['Rung 100 / 200 / 300', 'Difficulty: foundational → applied → expert'],
      ['OV / SV / CV', 'DoDAF view codes used on Architecture Views']
    ];
    const card = (t, d) => `<div class="card" style="padding:1rem 1.25rem;"><div style="font-weight:700;margin-bottom:.25rem;">${t}</div><div style="color:var(--text-secondary);font-size:.9rem;">${d}</div></div>`;
    return `
      <div>
        <h1 class="page-title">Backlog</h1>
        <p class="page-subtitle">Open work, recently landed items, and the code legend used across the console.</p>
        <h2 style="font-size:1.05rem;margin:1.25rem 0 .6rem;">Open</h2>
        <div style="display:grid;gap:.75rem;">${open.map(([t,d]) => card(t,d)).join('')}</div>
        <h2 style="font-size:1.05rem;margin:1.75rem 0 .6rem;">Recently done</h2>
        <div style="display:grid;gap:.75rem;">${done.map(([t,d]) => card(t,d)).join('')}</div>
        <h2 style="font-size:1.05rem;margin:1.75rem 0 .6rem;">Code legend</h2>
        <div class="table-wrapper"><table class="data-table"><thead><tr><th>Code</th><th>Meaning</th></tr></thead><tbody>
          ${codes.map(([c,m]) => `<tr><td style="font-family:var(--font-mono);font-weight:700;color:var(--accent-gitlab);">${c}</td><td>${m}</td></tr>`).join('')}
        </tbody></table></div>
      </div>`;
  }

  function renderSources(data) {
    return `
      <div>
        <h1 class="page-title">Source Ledger</h1>
        <p class="page-subtitle">
          20 verified, high-trust sources forming the architectural evidence base for this study console. Gate met 2026-10-16.
        </p>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Type</th><th>Trust</th><th>Blocks</th><th>Notes & Authority</th></tr>
            </thead>
            <tbody>
              ${data.sources.map(s => `
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:var(--accent-gitlab);">${s.id}</td>
                  <td style="font-weight:600;"><a href="${s.u}" target="_blank" rel="noopener" style="color:var(--text-link);text-decoration:none;">${s.t} ↗</a></td>
                  <td><span class="tag-badge">${s.type}</span></td>
                  <td><span class="tag-badge ${s.trust === 'high' ? 'fedramp' : ''}">${s.trust}</span></td>
                  <td style="font-family:var(--font-mono);font-size:.78rem;">${s.b}</td>
                  <td style="font-size:.84rem;color:var(--text-secondary);">${s.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Global Dispatcher
  function render() {
    const data = window.CONSOLE_DATA;
    if (!data) return;

    const route = getRoute();
    const appEl = document.getElementById('main-content');
    if (!appEl) return;

    updateNav();

    switch (route) {
      case 'today':
        appEl.innerHTML = renderToday(data);
        if (window.EnhanceEngine && window.EnhanceEngine.initToday) {
          window.EnhanceEngine.initToday();
        }
        break;
      case 'learn':
        appEl.innerHTML = renderLearn(data);
        break;
      case 'views':
        appEl.innerHTML = renderViews(data);
        break;
      case 'slides':
        appEl.innerHTML = renderSlides(data);
        if (window.EnhanceEngine && window.EnhanceEngine.initSlides) {
          window.EnhanceEngine.initSlides();
        }
        break;
      case 'shorts':
        appEl.innerHTML = renderShorts(data);
        break;
      case 'library':
        appEl.innerHTML = renderLibrary(data);
        break;
      case 'debates':
        appEl.innerHTML = renderDebates(data);
        break;
      case 'practice':
        appEl.innerHTML = renderPractice(data);
        if (window.EnhanceEngine && window.EnhanceEngine.initPractice) {
          window.EnhanceEngine.initPractice();
        }
        break;
      case 'failure-modes':
        appEl.innerHTML = renderFailureModes(data);
        if (window.EnhanceEngine && window.EnhanceEngine.initFailures) {
          window.EnhanceEngine.initFailures();
        }
        break;
      case 'glossary':
        appEl.innerHTML = renderGlossary(data);
        break;
      case 'sources':
        appEl.innerHTML = renderSources(data);
        break;
      case 'backlog':
        appEl.innerHTML = renderBacklog();
        break;
      default:
        appEl.innerHTML = renderToday(data);
        if (window.EnhanceEngine && window.EnhanceEngine.initToday) {
          window.EnhanceEngine.initToday();
        }
    }

    window.scrollTo(0, 0);
  }

  function toggleModule(modKey) {
    if (AppState.checkedModules[modKey]) {
      delete AppState.checkedModules[modKey];
    } else {
      AppState.checkedModules[modKey] = true;
    }
    saveState();
  }

  function initSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const searchBtn = document.getElementById('navSearch');

    function openSearch() {
      if (modal) {
        modal.classList.add('open');
        input.value = '';
        renderSearchResults('');
        setTimeout(() => input.focus(), 50);
      }
    }

    function closeSearch() {
      if (modal) modal.classList.remove('open');
    }

    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSearch();
      });
    }

    if (input) {
      input.addEventListener('input', (e) => {
        renderSearchResults(e.target.value.trim().toLowerCase());
      });
    }

    function renderSearchResults(q) {
      if (!results || !window.CONSOLE_DATA) return;
      const data = window.CONSOLE_DATA;
      if (!q) {
        results.innerHTML = '<div style="padding:1rem;color:var(--text-muted);font-size:.85rem;text-align:center;">Type to search terms, blocks, views, failure modes, and sources...</div>';
        return;
      }

      const hits = [];

      // Glossary
      data.glossary.forEach(g => {
        if (g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)) {
          hits.push({ title: g.term, sub: `Glossary · ${g.category}: ${g.definition}`, route: 'glossary' });
        }
      });

      // Blocks
      data.blocks.forEach(b => {
        if (b.title.toLowerCase().includes(q) || b.opener.toLowerCase().includes(q)) {
          hits.push({ title: `Block ${b.n}: ${b.title}`, sub: b.opener, route: 'learn' });
        }
      });

      // Failure Modes
      data.failureModes.forEach(fm => {
        if (fm.title.toLowerCase().includes(q) || fm.bad.toLowerCase().includes(q) || fm.good.toLowerCase().includes(q)) {
          hits.push({ title: `Failure Mode: ${fm.title}`, sub: `${fm.view} · ${fm.bad}`, route: 'failure-modes' });
        }
      });

      // Debates
      data.debates.forEach(d => {
        if (d.title.toLowerCase().includes(q) || d.claimA.toLowerCase().includes(q) || d.claimB.toLowerCase().includes(q)) {
          hits.push({ title: `Debate ${d.num}: ${d.title}`, sub: d.claimA.substring(0, 100) + '...', route: 'debates' });
        }
      });

      if (hits.length === 0) {
        results.innerHTML = '<div style="padding:1rem;color:var(--text-muted);font-size:.85rem;text-align:center;">No matching results found.</div>';
        return;
      }

      results.innerHTML = hits.slice(0, 8).map(h => `
        <div class="search-result-item" onclick="window.location.hash='#/${h.route}';document.getElementById('search-modal').classList.remove('open');">
          <div class="search-result-title">${h.title}</div>
          <div class="search-result-sub">${h.sub}</div>
        </div>
      `).join('');
    }
  }

  // Mobile drawer toggle
  function initMobileDrawer() {
    const toggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
      // Close on link click
      sidebar.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
          sidebar.classList.remove('open');
        });
      });
    }
  }

  // Init
  window.addEventListener('DOMContentLoaded', () => {
    loadState();
    initSearch();
    initMobileDrawer();
    render();
    window.addEventListener('hashchange', render);
  });

  window.AppEngine = {
    toggleModule,
    selectChapter,
    saveState,
    AppState
  };

})();
