// js/enhance.js - Interactive Engines (Quiz, Flashcards, Placement Drill, Slide Deck, Lightbox)

(function () {
  'use strict';

  // 1. Placement Drill Engine
  const DRILL_ITEMS = [
    { id: 'item-puma', name: 'Puma Rails App & DB', target: 'control-plane' },
    { id: 'item-gitaly', name: 'Sharded Gitaly Nodes', target: 'control-plane' },
    { id: 'item-fips-runner', name: 'Customer FIPS Runners', target: 'job-plane' },
    { id: 'item-agency-idp', name: 'Agency IdP (PIV/CAC)', target: 'job-plane' },
    { id: 'item-self-hosted-ai', name: 'Self-Hosted AI Gateway', target: 'job-plane' },
    { id: 'item-cloud-ai', name: 'GitLab-Managed Cloud AI', target: 'external' }
  ];

  let selectedDrillItem = null;

  function initToday() {
    renderDrill();
  }

  function renderDrill() {
    const poolEl = document.getElementById('drill-pool');
    if (!poolEl) return;

    poolEl.innerHTML = '';
    document.querySelectorAll('.drill-bucket-content').forEach(el => el.innerHTML = '');

    DRILL_ITEMS.forEach(item => {
      const placedBucket = window.AppEngine.AppState.drillPlaced[item.id];
      const el = document.createElement('div');
      el.className = 'drill-item' + (selectedDrillItem === item.id ? ' selected' : '');
      el.textContent = item.name;
      el.dataset.id = item.id;

      if (!placedBucket) {
        el.onclick = () => selectDrillItem(item.id);
        poolEl.appendChild(el);
      } else {
        const isCorrect = placedBucket === item.target;
        el.style.borderColor = isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)';
        el.style.background = isCorrect ? 'rgba(52, 211, 153, 0.1)' : 'rgba(244, 63, 94, 0.1)';
        el.onclick = () => unplaceDrillItem(item.id);
        const bucketEl = document.getElementById(`bucket-${placedBucket}`);
        if (bucketEl) {
          const content = bucketEl.querySelector('.drill-bucket-content');
          if (content) content.appendChild(el);
        }
      }
    });

    // Buckets click handler
    document.querySelectorAll('.drill-bucket').forEach(bucket => {
      bucket.onclick = () => {
        if (selectedDrillItem) {
          const bucketType = bucket.getAttribute('data-bucket');
          placeDrillItem(selectedDrillItem, bucketType);
        }
      };
    });
  }

  function selectDrillItem(id) {
    selectedDrillItem = selectedDrillItem === id ? null : id;
    renderDrill();
  }

  function placeDrillItem(id, bucketType) {
    window.AppEngine.AppState.drillPlaced[id] = bucketType;
    selectedDrillItem = null;
    window.AppEngine.saveState();
    renderDrill();
    // Re-render today hero ring if open
    const hash = window.location.hash;
    if (!hash || hash === '#/today' || hash === '#') {
      const drillCount = Object.keys(window.AppEngine.AppState.drillPlaced).length;
      const progress = drillCount >= 6 ? 100 : Math.round((drillCount / 6) * 100);
      const ring = document.querySelector('.ring-progress.sky');
      if (ring) ring.setAttribute('stroke-dasharray', `${progress}, 100`);
    }
  }

  function unplaceDrillItem(id) {
    delete window.AppEngine.AppState.drillPlaced[id];
    window.AppEngine.saveState();
    renderDrill();
  }

  function resetDrill() {
    window.AppEngine.AppState.drillPlaced = {};
    selectedDrillItem = null;
    window.AppEngine.saveState();
    renderDrill();
  }

  // 2. Slide Deck Viewer Engine
  let currentSlideIndex = 0;
  const TOTAL_SLIDES = 15;

  function initSlides() {
    currentSlideIndex = 0;
    renderCurrentSlide();

    // Keyboard support
    window.removeEventListener('keydown', handleSlideKey);
    window.addEventListener('keydown', handleSlideKey);
  }

  function handleSlideKey(e) {
    if (window.location.hash !== '#/slides') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') nextSlide();
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
  }

  function renderCurrentSlide() {
    const box = document.getElementById('slide-viewer-box');
    if (!box || !window.CONSOLE_DATA) return;

    const data = window.CONSOLE_DATA;
    const slideNum = currentSlideIndex + 1;
    const slideSrc = `assets/presentation/Slide${slideNum}.JPG`;
    const label = data.video && data.video.labels && data.video.labels[currentSlideIndex] ? data.video.labels[currentSlideIndex] : `Slide ${slideNum}`;
    const transcript = data.video && data.video.slides && data.video.slides[currentSlideIndex] ? data.video.slides[currentSlideIndex] : 'Speaker transcript not available for this slide.';
    const card = data.video && data.video.cards && currentSlideIndex > 0 && data.video.cards[currentSlideIndex - 1] ? data.video.cards[currentSlideIndex - 1] : null;

    box.innerHTML = `
      <div class="slide-screen" onclick="window.EnhanceEngine.openLightbox('${slideSrc}', '${label}')">
        <img src="${slideSrc}" alt="${label}">
      </div>

      <div class="slide-controls">
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn btn-sm" onclick="window.EnhanceEngine.prevSlide()" ${currentSlideIndex === 0 ? 'disabled' : ''}>◀ Previous</button>
          <button class="btn btn-sm btn-primary" onclick="window.EnhanceEngine.nextSlide()" ${currentSlideIndex === TOTAL_SLIDES - 1 ? 'disabled' : ''}>Next Slide ▶</button>
        </div>
        <div class="slide-counter">
          <b>Slide ${slideNum}</b> of ${TOTAL_SLIDES} · <span style="color:var(--accent-gitlab);">${label}</span>
        </div>
        <button class="btn btn-sm" onclick="window.EnhanceEngine.openLightbox('${slideSrc}', '${label}')">⛶ Zoom Slide</button>
      </div>

      <div class="slide-notes-card">
        <div class="slide-notes-title">
          <span>🎙 Speaker Transcript & Deep-Dive Voice</span>
        </div>
        <div class="slide-notes-body">${transcript}</div>

        ${card ? `
          <div style="margin-top:1.25rem;padding:1rem;background:var(--bg-surface);border-left:3px solid var(--accent-sky);border-radius:var(--radius-sm);">
            <div style="font-weight:700;color:var(--text-primary);font-size:.9rem;margin-bottom:4px;">💡 Checkpoint: ${card.question}</div>
            <div style="color:var(--text-secondary);font-size:.85rem;">${card.detail}</div>
            <div style="color:var(--text-muted);font-size:.8rem;margin-top:6px;"><b>Why:</b> ${card.why}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function nextSlide() {
    if (currentSlideIndex < TOTAL_SLIDES - 1) {
      currentSlideIndex++;
      renderCurrentSlide();
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderCurrentSlide();
    }
  }

  // 3. Interactive Quiz Engine
  let quizIndex = 0;
  let selectedOption = null;
  let quizAnswers = [];

  function initPractice() {
    quizIndex = 0;
    selectedOption = null;
    quizAnswers = [];
    renderQuiz();
    initFlashcards();
  }

  function switchPracticeMode(mode) {
    const qv = document.getElementById('quiz-view');
    const fv = document.getElementById('flashcard-view');
    const bq = document.getElementById('btn-show-quiz');
    const bf = document.getElementById('btn-show-flashcards');

    if (mode === 'quiz') {
      if (qv) qv.style.display = 'block';
      if (fv) fv.style.display = 'none';
      if (bq) bq.className = 'btn btn-primary';
      if (bf) bf.className = 'btn';
    } else {
      if (qv) qv.style.display = 'none';
      if (fv) fv.style.display = 'block';
      if (bq) bq.className = 'btn';
      if (bf) bf.className = 'btn btn-primary';
    }
  }

  function renderQuiz() {
    const qv = document.getElementById('quiz-view');
    if (!qv || !window.CONSOLE_DATA) return;

    const quizzes = window.CONSOLE_DATA.quizzes;
    if (!quizzes || quizzes.length === 0) return;

    if (quizIndex >= quizzes.length) {
      // Completed
      const correctCount = quizAnswers.filter(a => a.isCorrect).length;
      const score = Math.round((correctCount / quizzes.length) * 100);
      window.AppEngine.AppState.quizScore = score;
      window.AppEngine.saveState();

      qv.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">🏆</div>
          <h2 style="font-size:1.6rem;font-weight:800;color:var(--text-primary);margin-bottom:.5rem;">Assessment Complete!</h2>
          <p style="font-size:1.1rem;color:var(--text-secondary);margin-bottom:1.5rem;">
            You scored <b style="color:var(--accent-emerald);font-size:1.4rem;">${score}%</b> (${correctCount} of ${quizzes.length} correct)
          </p>
          <button class="btn btn-primary" onclick="window.EnhanceEngine.restartQuiz()">Restart Quiz</button>
        </div>
      `;
      return;
    }

    const currentQ = quizzes[quizIndex];
    const progress = Math.round(((quizIndex) / quizzes.length) * 100);

    qv.innerHTML = `
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width:${progress}%;"></div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <span class="tag-badge gitlab">${currentQ.category}</span>
        <span style="font-family:var(--font-mono);font-size:.8rem;color:var(--text-secondary);">Question ${quizIndex + 1} of ${quizzes.length}</span>
      </div>

      <div class="quiz-q-title">${currentQ.q}</div>

      <div class="quiz-options">
        ${currentQ.options.map((opt, idx) => `
          <div class="quiz-option" id="quiz-opt-${idx}" onclick="window.EnhanceEngine.chooseOption(${idx})">
            <span style="font-family:var(--font-mono);font-weight:700;color:var(--text-muted);">${String.fromCharCode(65 + idx)}.</span>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>

      <div id="quiz-feedback-box" style="display:none;" class="quiz-feedback"></div>

      <div style="display:flex;justify-content:flex-end;margin-top:1.5rem;">
        <button class="btn btn-primary" id="btn-submit-answer" onclick="window.EnhanceEngine.submitAnswer()" disabled>Confirm Answer</button>
        <button class="btn btn-primary" id="btn-next-question" style="display:none;" onclick="window.EnhanceEngine.nextQuestion()">Next Question ▶</button>
      </div>
    `;
  }

  function chooseOption(idx) {
    if (document.getElementById('btn-next-question').style.display !== 'none') return;
    selectedOption = idx;
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
      if (i === idx) el.classList.add('selected');
      else el.classList.remove('selected');
    });
    const subBtn = document.getElementById('btn-submit-answer');
    if (subBtn) subBtn.disabled = false;
  }

  function submitAnswer() {
    const quizzes = window.CONSOLE_DATA.quizzes;
    const currentQ = quizzes[quizIndex];
    const isCorrect = selectedOption === currentQ.answer;

    quizAnswers.push({ qIndex: quizIndex, selected: selectedOption, isCorrect });

    // Highlight
    const optEl = document.getElementById(`quiz-opt-${selectedOption}`);
    if (isCorrect) {
      if (optEl) optEl.classList.add('correct');
    } else {
      if (optEl) optEl.classList.add('wrong');
      const correctEl = document.getElementById(`quiz-opt-${currentQ.answer}`);
      if (correctEl) correctEl.classList.add('correct');
    }

    const fb = document.getElementById('quiz-feedback-box');
    if (fb) {
      fb.style.display = 'block';
      fb.innerHTML = `
        <div style="font-weight:700;color:${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'};margin-bottom:4px;">
          ${isCorrect ? '✔ Correct Answer!' : '✘ Incorrect.'}
        </div>
        <div style="color:var(--text-primary);">${currentQ.explain}</div>
      `;
    }

    document.getElementById('btn-submit-answer').style.display = 'none';
    document.getElementById('btn-next-question').style.display = 'inline-flex';
  }

  function nextQuestion() {
    quizIndex++;
    selectedOption = null;
    renderQuiz();
  }

  function restartQuiz() {
    quizIndex = 0;
    selectedOption = null;
    quizAnswers = [];
    renderQuiz();
  }

  // 4. Flashcards Engine
  let flashcardIndex = 0;

  function initFlashcards() {
    flashcardIndex = 0;
    renderFlashcard();
    window.removeEventListener('keydown', handleFlashcardKey);
    window.addEventListener('keydown', handleFlashcardKey);
  }

  function flashcardsVisible() {
    const fv = document.getElementById('flashcard-view');
    return fv && fv.style.display !== 'none' && window.location.hash === '#/practice';
  }

  function handleFlashcardKey(e) {
    if (!flashcardsVisible()) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      flipFlashcard();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextFlashcard();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevFlashcard();
    }
  }

  function flipFlashcard() {
    const inner = document.querySelector('#flashcard-view .flashcard-inner');
    if (inner) inner.classList.toggle('flipped');
  }

  function renderFlashcard() {
    const fv = document.getElementById('flashcard-view');
    if (!fv || !window.CONSOLE_DATA) return;

    const terms = window.CONSOLE_DATA.glossary;
    if (!terms || terms.length === 0) return;

    const term = terms[flashcardIndex];

    fv.innerHTML = `
      <div style="max-width:600px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <span class="tag-badge gitlab">${term.category}</span>
          <span style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-secondary);">Card ${flashcardIndex + 1} of ${terms.length}</span>
        </div>

        <div class="flashcard-box" onclick="window.EnhanceEngine.flipFlashcard()">
          <div class="flashcard-inner">
            <div class="flashcard-face flashcard-front">
              <span class="rung-badge rung-${term.rung}" style="margin-bottom:1rem;">Rung ${term.rung}</span>
              <h2 style="font-size:1.8rem;font-weight:800;color:var(--text-primary);">${term.term}</h2>
              <div style="color:var(--text-muted);font-size:.85rem;margin-top:1.5rem;">Space or click to reveal definition</div>
            </div>
            <div class="flashcard-face flashcard-back">
              <p style="font-size:1.05rem;line-height:1.6;color:var(--text-primary);">${term.definition}</p>
              <div style="margin-top:1rem;font-family:var(--font-mono);font-size:.78rem;color:var(--text-link);">Source: ${term.source}</div>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-sm" onclick="window.EnhanceEngine.prevFlashcard()" ${flashcardIndex === 0 ? 'disabled' : ''}>◀ Previous</button>
          <span style="font-size:.8rem;color:var(--text-muted);">Space = flip · ← → = navigate</span>
          <button class="btn btn-sm btn-primary" onclick="window.EnhanceEngine.nextFlashcard()" ${flashcardIndex === terms.length - 1 ? 'disabled' : ''}>Next Card ▶</button>
        </div>
      </div>
    `;
  }

  function nextFlashcard() {
    const terms = window.CONSOLE_DATA.glossary;
    if (flashcardIndex < terms.length - 1) {
      flashcardIndex++;
      renderFlashcard();
    }
  }

  function prevFlashcard() {
    if (flashcardIndex > 0) {
      flashcardIndex--;
      renderFlashcard();
    }
  }

  // 5. Failure Modes Filtering
  let activeFailureFilter = 'All';

  function initFailures() {
    filterFailures('All');
  }

  function filterFailures(layer) {
    activeFailureFilter = layer;
    const listEl = document.getElementById('failure-modes-list');
    if (!listEl || !window.CONSOLE_DATA) return;

    const data = window.CONSOLE_DATA;
    const filtered = layer === 'All'
      ? data.failureModes
      : data.failureModes.filter(fm => fm.view.toLowerCase().includes(layer.toLowerCase()));

    listEl.innerHTML = filtered.map(fm => `
      <div class="card" style="margin-bottom:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-family:var(--font-mono);font-size:.8rem;font-weight:700;color:var(--accent-gitlab);">${fm.id}</span>
            <span style="font-weight:700;color:var(--text-primary);font-size:1.05rem;">${fm.title}</span>
          </div>
          <span class="tag-badge fedramp">${fm.view}</span>
        </div>

        <div class="two-col" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:.75rem;">
          <div style="background:rgba(244,63,94,0.06);border:1px solid rgba(244,63,94,0.25);padding:.85rem;border-radius:var(--radius-sm);font-size:.84rem;">
            <div style="font-weight:700;color:var(--accent-rose);margin-bottom:3px;">🚨 Bad Tell:</div>
            <div style="color:var(--text-primary);">${fm.bad}</div>
          </div>
          <div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.25);padding:.85rem;border-radius:var(--radius-sm);font-size:.84rem;">
            <div style="font-weight:700;color:var(--accent-emerald);margin-bottom:3px;">🛡 Good Architecture:</div>
            <div style="color:var(--text-primary);">${fm.good}</div>
          </div>
        </div>

        <div style="margin-top:.75rem;padding:.6rem .85rem;background:var(--bg-surface);border-radius:var(--radius-sm);font-size:.82rem;color:var(--text-secondary);">
          <b style="color:var(--text-link);">Mitigation:</b> ${fm.mitigation}
        </div>
      </div>
    `).join('');
  }

  // 6. Glossary Filter
  function filterGlossary() {
    const q = (document.getElementById('glossary-search')?.value || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#glossary-table tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
      const term = row.getAttribute('data-term') || '';
      const def = row.getAttribute('data-def') || '';
      const cat = row.getAttribute('data-cat') || '';

      if (!q || term.includes(q) || def.includes(q) || cat.includes(q)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    const countEl = document.getElementById('glossary-count');
    if (countEl) countEl.textContent = `Showing ${visibleCount} terms`;
  }

  // 7. Lightbox Modal
  function openLightbox(src, title) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');

    if (modal && img) {
      img.src = src;
      if (titleEl) titleEl.textContent = title || 'Architecture Diagram';
      modal.classList.add('open');
    }
  }

  function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('open');
  }

  window.EnhanceEngine = {
    initToday,
    selectDrillItem,
    resetDrill,
    initSlides,
    nextSlide,
    prevSlide,
    initPractice,
    switchPracticeMode,
    chooseOption,
    submitAnswer,
    nextQuestion,
    restartQuiz,
    initFlashcards,
    flipFlashcard,
    nextFlashcard,
    prevFlashcard,
    initFailures,
    filterFailures,
    filterGlossary,
    openLightbox,
    closeLightbox
  };

})();
