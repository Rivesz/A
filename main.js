/* ============================================
   NETWORK BACKGROUND — ambient node graph
   ============================================ */
(function () {
  const canvas = document.getElementById('netbg');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let nodes;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function initNodes() {
    const rect = canvas.getBoundingClientRect();
    const count = 14;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 1,
    }));
  }

  function step() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > rect.width) n.vx *= -1;
      if (n.y < 0 || n.y > rect.height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const maxDist = 110;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.3;
          ctx.strokeStyle = `rgba(242, 242, 240, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(232, 18, 26, 0.85)';
      ctx.fill();
    });

    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  initNodes();
  step();
})();

/* ============================================
   STATUS BAR — live clock, cosmetic only
   ============================================ */
(function () {
  const el = document.getElementById('local-time');
  if (!el) return;

  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============================================
   TERMINAL BOOT — typing effect for hero intro line
   Reads the line from data-text and types it out once.
   ============================================ */
(function () {
  const el = document.querySelector('.terminal-boot');
  if (!el) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fullText = el.getAttribute('data-text') || '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';

  if (prefersReducedMotion) {
    el.textContent = fullText;
    el.appendChild(cursor);
    return;
  }

  el.textContent = '';
  let i = 0;

  function typeChar() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(typeChar, 22);
    }
  }
  typeChar();
})();

/* ============================================
   STAT COUNTERS — count up when scrolled into view
   ============================================ */
(function () {
  const cells = document.querySelectorAll('.stat-number[data-target]');
  if (!cells.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const duration = 900;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cells.forEach((cell) => observer.observe(cell));
})();

/* ============================================
   LOG FILTERS — tag / difficulty filtering
   Works on any page with .filter-bar + .log-entry[data-tags][data-diff]
   ============================================ */
(function () {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;

  const pills = filterBar.querySelectorAll('.filter-pill');
  const entries = document.querySelectorAll('.log-entry');
  const noResults = document.querySelector('.no-results');

  let activeTag = 'all';
  let activeDiff = 'all';

  function applyFilters() {
    let visibleCount = 0;
    entries.forEach((entry) => {
      const tags = (entry.getAttribute('data-tags') || '').split(',');
      const diff = entry.getAttribute('data-diff') || '';
      const tagMatch = activeTag === 'all' || tags.includes(activeTag);
      const diffMatch = activeDiff === 'all' || diff === activeDiff;
      const show = tagMatch && diffMatch;
      entry.classList.toggle('is-hidden', !show);
      if (show) visibleCount++;
    });
    if (noResults) noResults.classList.toggle('visible', visibleCount === 0);
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const group = pill.getAttribute('data-group');
      const value = pill.getAttribute('data-tag') || pill.getAttribute('data-diff');

      filterBar.querySelectorAll(`.filter-pill[data-group="${group}"]`).forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      if (group === 'tag') activeTag = value;
      if (group === 'diff') activeDiff = value;

      applyFilters();
    });
  });

  applyFilters();
})();
