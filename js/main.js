/* ==========================================================================
   Luqman Rafi Adyatma · Portfolio — vanilla JS, no dependencies
   1 Theme · 2 Scroll progress · 3 Reveal · 4 Scroll-spy · 5 Terminal typing
   6 Counters · 7 Card spotlight · 8 Tabs · 9 Liquid glass · 10 ID card
   ========================================================================== */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* 1. Theme toggle (the saved theme is applied early by a tiny script in <head>) */
  function initTheme() {
    const btn = $('#tt');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch {}
    });
  }

  /* 2. Scroll progress bar */
  function initProgress() {
    const bar = $('#pb');
    if (!bar) return;
    const update = () => {
      const max = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* 3. Reveal sections on scroll */
  function initReveal() {
    const items = $$('.rv');
    if (!hasIO) return items.forEach((el) => el.classList.add('in'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* 4. Scroll-spy for the side rail.
        A section is "current" once its top passes 30% of the viewport.
        Clicking a link locks the highlight until the user scrolls by hand. */
  function initScrollSpy() {
    const links = $$('.rail a[href^="#"]');
    const secs = links
      .map((a) => ({ a, el: document.getElementById(a.getAttribute('href').slice(1)) }))
      .filter((o) => o.el);
    if (!secs.length) return;

    let locked = null;
    const setOn = (a) => links.forEach((x) => x.classList.toggle('on', x === a));
    const spy = () => {
      if (locked) return setOn(locked);
      let cur = null;
      secs.forEach((o) => { if (o.el.getBoundingClientRect().top <= innerHeight * 0.3) cur = o; });
      if (innerHeight + scrollY >= root.scrollHeight - 4) cur = secs[secs.length - 1];
      setOn(cur && cur.a);
    };
    const unlock = () => { if (locked) { locked = null; spy(); } };

    links.forEach((a) => a.addEventListener('click', () => { locked = a; setOn(a); }));
    ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach((t) => addEventListener(t, unlock, { passive: true }));
    addEventListener('scroll', spy, { passive: true });
    addEventListener('resize', spy);
    spy();
  }

  /* 5. Terminal card: type the JSON line by line when it scrolls into view */
  function initTerminal() {
    const term = $('.term'), pre = $('.term pre');
    if (!term || !pre || reduced) return;
    pre.innerHTML = pre.innerHTML
      .split('\n')
      .map((line, i) => `<span class="tl" style="animation-delay:${(0.15 + i * 0.13).toFixed(2)}s">${line}</span>`)
      .join('');
    if (!hasIO) return term.classList.add('typing');
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { term.classList.add('typing'); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(term);
  }

  /* 6. Count-up numbers ([data-c]) */
  function initCounters() {
    const els = $$('[data-c]');
    if (!els.length || !hasIO || reduced) return;
    const run = (el) => {
      const target = +el.dataset.c;
      let start = null;
      const frame = (ts) => {
        start = start ?? ts;
        const p = Math.min(1, (ts - start) / 1200);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    els.forEach((el) => (el.textContent = 0));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* 7. Cursor spotlight inside project cards */
  function initCardSpotlight() {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* 8. Experience tabs */
  function initTabs() {
    const tabs = $$('.tab');
    const panels = $$('.pan');
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('on', t === tab));
      panels.forEach((p) => p.classList.toggle('on', p.id === tab.dataset.p));
    }));
  }

  /* 9. Liquid glass: refraction filter on Chromium, pointer-following highlight */
  function initGlass() {
    const ua = navigator.userAgent;
    if (/Chrom(e|ium)|Edg\//.test(ua) && !/Firefox|CriOS/.test(ua)) root.classList.add('lq');
    const rail = $('.rail');
    if (!rail) return;
    rail.addEventListener('pointermove', (e) => {
      const r = rail.getBoundingClientRect();
      rail.style.setProperty('--rx', `${e.clientX - r.left}px`);
      rail.style.setProperty('--ry', `${e.clientY - r.top}px`);
    });
  }

  /* 10. Hanging ID card: Verlet rope physics. The lanyard is a chain of points,
         the card is a heavy rigid body at its end. Drag the card anywhere; it swings back. */
  function initIdCard() {
    const lan = $('#lan'), cw = $('#cw'), rb = $('#rb'), rs = $('#rs');
    if (!lan || !cw || !rb || !rs || window.__lanyard3d) return;   // 3D Lanyard (lanyard.js) takes over when available

    const N = 8, SLOT = 21, G = 0.6, DAMP = 0.988, ITER = 12;
    let W, CW, ropeLen, cardLen, pts = [], links = [];
    let dragging = false, running = false, visible = false, calm = 0;
    let off = { x: 0, y: 0 }, aimAt = { x: 0, y: 0 };
    const mk = (x, y, w) => ({ x, y, ox: x, oy: y, w });

    function build() {
      W = lan.clientWidth; CW = cw.offsetWidth;
      ropeLen = innerWidth <= 760 ? 92 : 112;
      cardLen = cw.offsetHeight - SLOT;
      pts = [];
      for (let i = 0; i <= N; i++) pts.push(mk(W / 2, (ropeLen / N) * i, i === 0 ? 0 : 1));
      pts[N].w = 0.6;
      pts.push(mk(W / 2, ropeLen + cardLen / 2, 0.2));
      pts.push(mk(W / 2, ropeLen + cardLen, 0.2));
      links = [];
      for (let i = 0; i < N; i++) links.push([i, i + 1, ropeLen / N]);
      links.push([N, N + 1, cardLen / 2], [N + 1, N + 2, cardLen / 2], [N, N + 2, cardLen]);
      render();
    }

    function step() {
      pts.forEach((p, i) => {
        if (!i) return;
        const vx = (p.x - p.ox) * DAMP, vy = (p.y - p.oy) * DAMP;
        p.ox = p.x; p.oy = p.y; p.x += vx; p.y += vy + G;
      });
      if (dragging) {                                   // pull the card toward the pointer
        const c = pts[N + 1], maxR = ropeLen + cardLen / 2 - 2;
        let tx = aimAt.x + off.x, ty = aimAt.y + off.y;
        const dx = tx - W / 2, d = Math.hypot(dx, ty);
        if (d > maxR) { tx = W / 2 + dx * maxR / d; ty = ty * maxR / d; }
        c.x += (tx - c.x) * 0.35; c.y += (ty - c.y) * 0.35; c.ox = c.x; c.oy = c.y;
      }
      for (let k = 0; k < ITER; k++) {                  // keep every link at its rest length
        links.forEach(([a, b, len]) => {
          const p = pts[a], q = pts[b];
          const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1e-6;
          const diff = (d - len) / d, s = p.w + q.w;
          p.x += dx * diff * p.w / s; p.y += dy * diff * p.w / s;
          q.x -= dx * diff * q.w / s; q.y -= dy * diff * q.w / s;
        });
        pts[0].x = W / 2; pts[0].y = 0;
      }
    }

    function render() {
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < N; i++) {
        d += `Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${((pts[i].x + pts[i + 1].x) / 2).toFixed(1)} ${((pts[i].y + pts[i + 1].y) / 2).toFixed(1)}`;
      }
      d += `L${pts[N].x.toFixed(1)} ${pts[N].y.toFixed(1)}`;
      rb.setAttribute('d', d); rs.setAttribute('d', d);
      const c = pts[N], t = pts[N + 2];
      const deg = Math.atan2(-(t.x - c.x), t.y - c.y) * 180 / Math.PI;
      cw.style.transform = `translate(${(c.x - CW / 2).toFixed(1)}px,${(c.y - SLOT).toFixed(1)}px) rotate(${deg.toFixed(2)}deg)`;
    }

    function loop() {
      step(); render();
      const energy = pts.reduce((s, p) => s + Math.abs(p.x - p.ox) + Math.abs(p.y - p.oy), 0);
      calm = energy < 0.15 && !dragging ? calm + 1 : 0;
      if (calm > 40 || !visible && !dragging) running = false; else requestAnimationFrame(loop);
    }
    const start = () => { if (!running) { running = true; calm = 0; requestAnimationFrame(loop); } };

    build();
    if (reduced) { cw.style.cursor = 'default'; return; }

    const local = (e) => { const r = lan.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cw.addEventListener('pointerdown', (e) => {
      dragging = true; cw.setPointerCapture(e.pointerId); cw.style.cursor = 'grabbing';
      const p = local(e), c = pts[N + 1];
      off = { x: c.x - p.x, y: c.y - p.y }; aimAt = p; start();
    });
    cw.addEventListener('pointermove', (e) => { if (dragging) aimAt = local(e); });
    const release = () => { dragging = false; cw.style.cursor = ''; start(); };
    cw.addEventListener('pointerup', release);
    cw.addEventListener('pointercancel', release);

    let timer;
    const rebuild = () => { clearTimeout(timer); timer = setTimeout(() => { build(); start(); }, 120); };
    addEventListener('resize', rebuild);
    if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(cw);

    if (hasIO) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) { pts[N + 1].ox -= 3; pts[N + 2].ox -= 3; start(); }   // little hello swing
      }, { threshold: 0.4 }).observe(lan);
    }
  }

  [initTheme, initProgress, initReveal, initScrollSpy, initTerminal, initCounters, initCardSpotlight, initTabs, initGlass, initIdCard]
    .forEach((fn) => fn());
})();
