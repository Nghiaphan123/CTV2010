(function () {
  'use strict';

  /* ============================================================
   * DANH SÁCH TÊN — các tên sẽ lần lượt rơi xuống THEO ĐÚNG THỨ TỰ dưới đây,
   * hết danh sách thì quay lại từ đầu. Thêm / bớt / đổi thứ tự tuỳ ý.
   * ============================================================ */
  const NAMES = [
    'Hà Bảo Dung',
    'Phạm Thị Thu Hiền',
    'Nguyễn Lê Quỳnh Thư',
    'Phạm Thị Hồng Nhung',
    'Nguyễn Thị Mỹ Phượng',
    'Lê Huyền Trân',
    'Hà Thị Mỹ Duyên',
    'Nguyễn Thị Kiều Trang',
    'Phạm Nguyễn Quỳnh Nhi',
    'Lã Thị Kim Anh',
    'Lại Thị Thanh',
    'Nguyễn Thị Ái Na',
    'Nguyễn Thị Bích Ngọc',
    'Nguyễn Mai Thảo',
    'Lưu Thị Kim Đạt',
    'Thái Thị Hoà',
    'Mai Hoàng Tú Quyên',
    'Nguyễn Ngọc Phương Thảo',
    'Cao Tường Vi',
    'Từ Lâm Nhật Ánh',
    'Nguyễn Minh Thư',
    'Phan Thị Thu Na',
    'Đặng Thị Mỹ Duyên',
    'Phạm Thu Hiền',
    'Phan Ngọc Tâm',
    'Lê Thị Vân Anh',
    'Lê Thị Lê Lê',
    'Nghiêm Ngọc Linh',
    'Trần Thị Ngọc Thùy',
    'Trương Thị Thúy Hà',
    'Nguyễn Lê Bảo Ngọc',
    'Ngọc Lợi',
    'Vũ Thu Hiền',
    'Mai Hà My',
    'Nguyễn Thị Phương Thảo',
    'Nguyễn Thị Thục Lân',
    'Hà Quỳnh Anh',
    'Mai Thảo Vy',
    'Nguyễn Mai Diệp',
    'Trần Cát Tường',
    'Phạm Yến Vy',
    'Đào Phương Uyên',
    'Trần Nguyễn Thiên Ân',
    'Nguyễn Tạ Tường Vy',
    'Lê Thị Thúy',
    'Lý Thị Thanh Trúc',
    'Trần Bảo Nhi',
    'Võ Thị Thu Minh',
    'Nguyễn Minh Thơ',
    'Nguyễn Hoàng Bảo Anh',
    'Ngô Tường Vy',
    'Nguyễn Khánh Vươn Thùy',
    'Nguyễn Như Quỳnh',
    'Nguyễn Hồ Yến Nhi',
    'Lê Nguyễn Xuân Lợi',
  ];
  /* ============================================================ */

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FOG_MS = 7000;                                   // sương phủ đúng 7s
  const PHASE1_MS = FOG_MS + (reduceMotion ? 2500 : 8000); // tiêu đề ở giữa 8s rồi mới thu lên
  const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches ||
    (window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 768);
  document.documentElement.classList.add(IS_MOBILE ? 'is-mobile' : 'is-desktop');

  /* ---------- Hiệu năng: chất lượng thích ứng + dừng khi tab ẩn ---------- */
  const FX = {
    level: 0,                                     // 0 = đầy đủ, 1 = giảm, 2 = tối giản
    fixed: /[?&]fx=high\b/.test(location.search),  // ?fx=high: tắt tự giảm (để kiểm thử)
    listeners: [],
    set(l) {
      l = Math.max(0, Math.min(2, l));
      if (l === this.level) return;
      this.level = l;
      const cl = document.documentElement.classList;
      cl.toggle('fx-low1', l >= 1);
      cl.toggle('fx-low2', l >= 2);
      this.listeners.forEach(function (fn) { fn(l); });
    },
    onChange(fn) { this.listeners.push(fn); },
  };
  window.__FX__ = FX;
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  });

  /* ---------- Nhạc nền ---------- */
  (function music() {
    const audio = new Audio('assets/music.mp3');
    audio.loop = false; audio.preload = 'auto'; audio.volume = 0;
    const SKIP = 3;                                   // bỏ 3 giây đầu bài
    let skipped = false;
    function seekSkip() { try { audio.currentTime = SKIP; skipped = true; } catch (e) {} }
    if (audio.readyState >= 1) seekSkip(); else audio.addEventListener('loadedmetadata', function () { if (!skipped) seekSkip(); }, { once: true });
    audio.addEventListener('ended', function () { audio.currentTime = SKIP; audio.play().catch(function () {}); }); // lặp lại từ giây thứ 3
    const btn = document.getElementById('music-toggle');
    const TARGET = 0.5;
    let muted = false, started = false, fadeT = null;
    window.__AUDIO__ = audio;
    function fadeTo(v, ms, done) {
      clearInterval(fadeT);
      const from = audio.volume, t0 = performance.now();
      fadeT = setInterval(function () {
        const k = Math.min(1, (performance.now() - t0) / ms);
        audio.volume = from + (v - from) * k;
        if (k >= 1) { clearInterval(fadeT); if (done) done(); }
      }, 50);
    }
    function play() {
      if (muted || document.hidden) return;
      if (!skipped || audio.currentTime < SKIP) seekSkip();
      const pr = audio.play();
      if (pr && pr.then) pr.then(function () { started = true; fadeTo(TARGET, 2500); }).catch(function () {});
    }
    function ui() { btn.textContent = muted ? '🔇' : '🔊'; btn.setAttribute('aria-pressed', muted ? 'true' : 'false'); btn.setAttribute('aria-label', muted ? 'Bật nhạc' : 'Tắt nhạc'); }
    const EVS = ['pointerdown', 'touchstart', 'keydown', 'click'];
    function firstGesture(e) {
      if (e && e.target && e.target.closest && e.target.closest('#music-toggle')) return;
      EVS.forEach(function (ev) { window.removeEventListener(ev, firstGesture, true); });
      if (!started) play();
    }
    EVS.forEach(function (ev) { window.addEventListener(ev, firstGesture, { capture: true, passive: true }); });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      muted = !muted; ui();
      if (muted) fadeTo(0, 400, function () { audio.pause(); });
      else { audio.volume = 0; play(); }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearInterval(fadeT); audio.pause(); }
      else if (started && !muted) { audio.volume = 0; play(); }
    });
    ui();
  })();

  /* ---------- Bokeh ---------- */
  (function makeBokeh() {
    const layer = document.getElementById('bokeh');
    const colors = [
      'rgba(249,168,212,0.55)',
      'rgba(192,132,252,0.5)',
      'rgba(253,230,138,0.45)',
      'rgba(232,121,249,0.45)',
      'rgba(167,139,250,0.4)',
    ];
    const n = reduceMotion ? 8 : (IS_MOBILE ? 10 : 18);
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'bokeh-dot';
      const size = 40 + Math.random() * 90;
      d.style.width = size + 'px';
      d.style.height = size + 'px';
      d.style.left = Math.random() * 100 + '%';
      d.style.top = Math.random() * 100 + '%';
      d.style.background = `radial-gradient(circle, ${colors[i % colors.length]} 0%, transparent 70%)`;
      d.style.setProperty('--dur', (3.5 + Math.random() * 3.5) + 's');
      d.style.setProperty('--delay', (Math.random() * 3) + 's');
      layer.appendChild(d);
    }
  })();

  /* ---------- Đèn sân khấu bám theo tâm dòng "Chúc mừng ngày" ---------- */
  // Chỉ đo vị trí (getBoundingClientRect) khi tiêu đề đang di chuyển, không đo liên tục mỗi khung
  const followTitle = (function stageLight() {
    const light = document.getElementById('stage-light');
    const line1 = document.querySelector('#phase1 .line1');
    let lx = -1, ly = -1, until = 0, running = false;
    function measure() {
      const r = line1.getBoundingClientRect();
      if (r.width) {
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (Math.abs(x - lx) > 0.3 || Math.abs(y - ly) > 0.3) {
          lx = x; ly = y;
          light.style.setProperty('--cx', x.toFixed(1) + 'px');
          light.style.setProperty('--cy', y.toFixed(1) + 'px');
        }
      }
    }
    function step(now) {
      measure();
      if (now < until) requestAnimationFrame(step); else running = false;
    }
    function followFor(ms) {
      until = Math.max(until, performance.now() + ms);
      if (!running) { running = true; requestAnimationFrame(step); }
    }
    window.addEventListener('resize', function () { followFor(300); });
    followFor(FOG_MS + 3500);                     // sương + tiêu đề hiện lên
    return followFor;
  })();

  /* ---------- Lớp sương: lau bằng chuột / ngón tay ---------- */
  (function fog() {
    const wrap = document.getElementById('fog-wrap');
    const cv = document.getElementById('fog');
    const blur = document.getElementById('fog-blur');
    const ctx = cv.getContext('2d');
    const m = document.createElement('canvas');      // mask nhỏ cho lớp blur
    const mctx = m.getContext('2d');
    const MS = 8;
    let W = 0, H = 0, dpr = 1, dirty = false, lastMask = 0, last = null;
    const R = IS_MOBILE ? 120 : 180;               // cục tẩy to (~2.5x), viền mềm

    function paint() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(232,224,248,0.96)';    // sương dày hơn
      ctx.fillRect(0, 0, W, H);
      const blobs = IS_MOBILE ? 90 : 160;
      for (let i = 0; i < blobs; i++) {
        const x = Math.random() * W, y = Math.random() * H, r = 60 + Math.random() * 220;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const c = Math.random() < 0.5 ? '255,255,255' : (Math.random() < 0.5 ? '221,214,254' : '252,231,243');
        g.addColorStop(0, 'rgba(' + c + ',' + (0.25 + Math.random() * 0.35) + ')');
        g.addColorStop(1, 'rgba(' + c + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // vệt mây tím nhạt tạo kết cấu đục
      for (let i = 0; i < (IS_MOBILE ? 25 : 45); i++) {
        const x = Math.random() * W, y = Math.random() * H, r = 80 + Math.random() * 260;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(196,181,253,' + (0.10 + Math.random() * 0.15) + ')');
        g.addColorStop(1, 'rgba(196,181,253,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      m.width = Math.ceil(W / MS); m.height = Math.ceil(H / MS);
      mctx.fillStyle = '#000';
      mctx.fillRect(0, 0, m.width, m.height);
      updateMask(true);
    }
    function brush(c, x, y, r) {
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.45, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = 'source-over';
    }
    function wipe(x, y) {
      const pts = [];
      if (last) {
        const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(d / (R / 3)));
        for (let i = 1; i <= steps; i++) pts.push({ x: last.x + dx * i / steps, y: last.y + dy * i / steps });
      } else pts.push({ x, y });
      pts.forEach(function (p) {
        brush(ctx, p.x, p.y, R);
        brush(mctx, p.x / MS, p.y / MS, R / MS);
      });
      last = { x, y };
      dirty = true;
      updateMask(false);
    }
    function updateMask(force) {
      const now = performance.now();
      if (!force && (!dirty || now - lastMask < 90)) return;
      lastMask = now; dirty = false;
      if (!blur) return;
      const url = 'url(' + m.toDataURL() + ')';
      blur.style.webkitMaskImage = url;
      blur.style.maskImage = url;
    }
    paint();
    wrap.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' || e.pressure > 0 || e.buttons) wipe(e.clientX, e.clientY);
    });
    wrap.addEventListener('pointerdown', function (e) { last = null; wipe(e.clientX, e.clientY); });
    wrap.addEventListener('pointerleave', function () { last = null; });
    wrap.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') last = null; });
    const flush = setInterval(function () { updateMask(false); }, 120);

    setTimeout(function () {
      wrap.classList.add('fade');
      document.body.classList.remove('fogging');     // tiêu đề bắt đầu hiện
      setTimeout(function () { clearInterval(flush); wrap.remove(); }, 850);
    }, FOG_MS);
  })();

  /* ---------- Phase switch ---------- */
  function dockTitle(animate) {
    const blk = document.querySelector('#phase1 .title-block');
    const heart = document.getElementById('heart-wrap');
    const prevTr = blk.style.transition;
    blk.style.transition = 'none';
    blk.style.transform = 'none';
    const r = blk.getBoundingClientRect();
    const hr = heart.getBoundingClientRect();
    const topPad = IS_MOBILE ? 30 : 16;
    const gap = IS_MOBILE ? 8 : 14;
    const availH = Math.max(40, hr.top - topPad - gap);
    const maxW = window.innerWidth - (IS_MOBILE ? 40 : 520); // chừa chỗ cho chữ chúc 2 bên & hint
    const sc = Math.min(IS_MOBILE ? 0.6 : 0.55, availH / r.height, Math.max(0.3, maxW / r.width));
    const ty = topPad - r.top;
    void blk.offsetWidth;
    blk.style.transition = animate ? (prevTr || '') : 'none';
    blk.style.transform = 'translateY(' + ty.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
    if (!animate) { void blk.offsetWidth; blk.style.transition = ''; }
  }
  // co chữ tiêu đề nếu rộng hơn màn hình (không xuống dòng, không tràn)
  function fitTitle() {
    const max = window.innerWidth - (IS_MOBILE ? 32 : 60);
    ['#phase1 .line1', '#phase1 .big-date', '#phase1 .line3'].forEach(function (sel) {
      const el = document.querySelector(sel);
      el.style.fontSize = '';
      const w = el.offsetWidth;
      if (w > max) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * max / w).toFixed(1) + 'px';
    });
  }
  fitTitle();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitTitle(); if (docked) dockTitle(false); });
  let docked = false;
  window.addEventListener('resize', function () { fitTitle(); if (docked) dockTitle(false); });

  setTimeout(function () {
    docked = true;
    document.getElementById('phase1').classList.add('docked');
    dockTitle(true);
    followTitle(2300);                              // đèn bám theo lúc tiêu đề bay lên
    document.getElementById('phase2').classList.add('show');
    const hint = document.getElementById('hint');
    setTimeout(function () { hint.style.opacity = '0'; }, 5000);
  }, PHASE1_MS);

  /* ---------- Phong thư ↔ lời chúc ---------- */
  (function envelope() {
    const env = document.getElementById('envelope');
    const letter = document.getElementById('letter');
    const closeBtn = letter.querySelector('.letter-close');
    let busy = false;                                   // khoá click khi đang chuyển cảnh
    function after(ms, fn) { setTimeout(fn, ms); }
    // MỞ: nắp mở (0.5s) → giấy trượt lên (0.5s) → khung thư hiện ra, phong thư mờ đi
    env.addEventListener('click', function (e) {
      e.stopPropagation();
      if (busy || env.classList.contains('opening')) return;
      busy = true;
      env.classList.add('opening', 'flap-open');
      after(520, function () { env.classList.add('paper-out'); });
      after(1050, function () { letter.classList.add('open'); env.classList.add('gone'); document.body.classList.add('letter-open'); });
      after(1600, function () { busy = false; });
    });
    // ĐÓNG: khung thư thu lại → giấy trượt xuống → nắp đóng → tim đập lại
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (busy) return;
      busy = true;
      letter.classList.remove('open');
      document.body.classList.remove('letter-open');
      env.classList.remove('gone');
      after(480, function () { env.classList.remove('paper-out'); });
      after(1000, function () { env.classList.remove('flap-open'); });
      after(1550, function () { env.classList.remove('opening'); busy = false; });
    });
  })();

  /* ---------- Tim bay lên từ dưới (nhanh gấp đôi tên) ---------- */
  (function fallingHearts() {
    if (reduceMotion) return;
    const layer = document.getElementById('names');
    const palette = ['#ff5fa2', '#ff4d6d', '#fda4af', '#f9a8d4', '#fcd34d', '#fde68a', '#f43f5e'];
    const MAX0 = IS_MOBILE ? 12 : 22;
    let MAX = MAX0;
    FX.onChange(function (l) { MAX = Math.round(MAX0 * [1, 0.7, 0.5][l]); });
    const items = [];
    function spawn() {
      if (items.length >= MAX || document.hidden) return;
      const el = document.createElement('div');
      el.className = 'falling-heart';
      el.textContent = '♥';
      el.style.color = palette[Math.floor(Math.random() * palette.length)];
      el.style.fontSize = (IS_MOBILE ? 20 + Math.random() * 24 : 24 + Math.random() * 36) + 'px';
      layer.appendChild(el);
      items.push({
        el,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 40 + Math.random() * 60,
        speed: IS_MOBILE ? 160 + Math.random() * 40 : 190 + Math.random() * 50, // gấp đôi tốc độ tên
        amp: 6 + Math.random() * 10,
        per: 1.6 + Math.random() * 1.6,
        ph: Math.random() * Math.PI * 2,
        rot: 8 + Math.random() * 8,
        born: performance.now(),
      });
    }
    setInterval(spawn, IS_MOBILE ? 430 : 260);       // dày gấp đôi
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const H = window.innerHeight;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y -= it.speed * dt;
        const t = (now - it.born) / 1000;
        const sw = Math.sin(t * Math.PI * 2 / it.per + it.ph);
        it.el.style.transform = 'translate3d(' + (it.x + sw * it.amp).toFixed(1) + 'px,' + it.y.toFixed(1) + 'px,0) rotate(' + (sw * it.rot).toFixed(1) + 'deg)';
        const op = Math.max(0, Math.min(1, (it.y + 60) / (H * 0.22))); // mờ dần gần đỉnh
        if (Math.abs(op - (it.op === undefined ? 1 : it.op)) > 0.03) { it.op = op; it.el.style.opacity = op.toFixed(2); }
        if (it.y < -60) { it.el.remove(); items[i] = items[items.length - 1]; items.pop(); }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- Wishes / sparkles / mini hearts ---------- */
  (function decoratePhase2() {
    const wishes = [
      'Luôn xinh đẹp',
      'Bình yên nhẹ nhàng',
      'Gặp nhiều may mắn',
      'Vui vẻ hạnh phúc',
      'Năng lượng tích cực',
      'Thật rạng rỡ',
      'Luôn tự tin',
      'Tràn đầy yêu thương',
    ];
    const colors = ['#f9a8d4', '#fde68a', '#ddd6fe', '#e879f9', '#c084fc', '#fda4af'];
    const wrap = document.getElementById('wishes');
    const positions = IS_MOBILE ? [
      [4, 20.5], [96, 24.5], [4, 28.5], [96, 32.5],
      [4, 38.5], [96, 42.5], [4, 46.5], [96, 50.5],
    ] : [
      [6, 16], [80, 14], [4, 40], [84, 38],
      [3, 64], [86, 62], [18, 27], [70, 27],
    ];
    wishes.forEach(function (w, i) {
      const el = document.createElement('div');
      el.className = 'wish';
      el.textContent = w;
      if (IS_MOBILE && positions[i][0] > 50) el.style.right = '4%';
      else if (positions[i][0] > 50) el.style.right = (100 - positions[i][0] - 14 < 3 ? 3 : 100 - positions[i][0] - 14) + '%';
      else el.style.left = positions[i][0] + '%';
      el.style.top = positions[i][1] + '%';
      el.style.color = colors[i % colors.length];
      el.style.animationDelay = (i * 0.7) + 's';
      wrap.appendChild(el);
    });

    const sparkWrap = document.getElementById('sparkles');
    for (let i = 0; i < (IS_MOBILE ? 7 : 12); i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = (10 + Math.random() * 80) + '%';
      s.style.top = (15 + Math.random() * 55) + '%';
      s.style.animationDelay = (Math.random() * 4) + 's';
      s.style.animationDuration = (3 + Math.random() * 3) + 's';
      sparkWrap.appendChild(s);
    }

    const mh = document.getElementById('mini-hearts');
    for (let i = 0; i < (IS_MOBILE ? 4 : 6); i++) {
      const h = document.createElement('div');
      h.className = 'mini-heart';
      h.textContent = '♥';
      h.style.left = (20 + Math.random() * 60) + '%';
      h.style.top = (35 + Math.random() * 30) + '%';
      h.style.color = colors[i % colors.length];
      h.style.animationDelay = (Math.random() * 4) + 's';
      h.style.fontSize = (10 + Math.random() * 10) + 'px';
      mh.appendChild(h);
    }
  })();

  /* ---------- Falling names with see-saw / pendulum ---------- */
  (function fallingNames() {
    const layer = document.getElementById('names');
    const palette = ['#f9a8d4', '#fde68a', '#c4b5fd', '#fda4af', '#e9d5ff', '#fcd34d'];
    const active = [];
    const MAX_ACTIVE = IS_MOBILE ? 15 : 22;            // giới hạn an toàn (không chặn nhịp 500ms)
    const INTERVAL = reduceMotion ? 2000 : (IS_MOBILE ? 900 : 500);  // ~17 tên (laptop) / ~12 (mobile) cùng lúc
    // 2 làn: trái (4–28% bề ngang) và phải (72–96%), xen kẽ trái/phải → chừa trống giữa (tiêu đề, tim, phong thư)
    const LANES = [{ a: 0.04, b: 0.28, last: null }, { a: 0.72, b: 0.96, last: null }];
    let laneTurn = 0;
    // Lần lượt theo đúng thứ tự danh sách: 0, 1, 2, … rồi quay lại đầu
    let nextIdx = 0;
    function nextName() {
      const n = NAMES[nextIdx % NAMES.length];
      nextIdx = (nextIdx + 1) % NAMES.length;
      return n;
    }
    window.__NAME_ORDER__ = [];

    function spawn() {
      if (!NAMES.length) return;
      if (active.length >= MAX_ACTIVE || document.hidden) return;   // giữ nguyên thứ tự, chỉ hoãn

      const name = nextName();
      window.__NAME_ORDER__.push(name);
      if (window.__NAME_ORDER__.length > 200) window.__NAME_ORDER__.shift();

      const el = document.createElement('div');
      el.className = 'falling-name';
      el.textContent = name;
      const color = palette[Math.floor(Math.random() * palette.length)];
      el.style.color = color;

      const laneIdx = laneTurn; laneTurn = 1 - laneTurn;
      const lane = LANES[laneIdx];
      const x = Math.random();                       // vị trí ngẫu nhiên trong làn (0..1)
      const vMin = IS_MOBILE ? 80 : 95, vMax = IS_MOBILE ? 100 : 120;
      let speed = vMin + Math.random() * (vMax - vMin); // px/s
      // không đuổi kịp tên trước cùng làn: tốc độ chỉ lệch ±3% so với tên trước
      const prev = lane.last;
      if (prev && prev.el.isConnected) speed = Math.min(vMax, Math.max(vMin, prev.speed * (0.97 + Math.random() * 0.06)));
      const swayAmp = IS_MOBILE ? 6 + Math.random() * 8 : 10 + Math.random() * 14; // px, nhỏ để ở trong làn
      const swayPeriod = 2.2 + Math.random() * 2.8; // seconds
      const swayPhase = Math.random() * Math.PI * 2;
      const rotAmp = 15 + Math.random() * 6; // ±15–21 deg
      const rotPeriod = 1.8 + Math.random() * 2.2;
      const rotPhase = Math.random() * Math.PI * 2;
      const startY = -60;

      const item = {
        el, x, lane, y: startY, speed,
        swayAmp, swayPeriod, swayPhase,
        rotAmp, rotPeriod, rotPhase,
        born: performance.now(),
      };
      layer.appendChild(el);
      active.push(item);
      lane.last = item;
    }

    spawn();                                       // tên đầu tiên rơi ngay
    setInterval(spawn, INTERVAL);

    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const H = window.innerHeight;

      for (let i = active.length - 1; i >= 0; i--) {
        const it = active[i];
        it.y += it.speed * dt;
        const t = (now - it.born) / 1000;
        // Sinusoidal sway (left-right) + see-saw rotation (pendulum)
        const sway = Math.sin(t * (Math.PI * 2 / it.swayPeriod) + it.swayPhase) * it.swayAmp;
        const rot = Math.sin(t * (Math.PI * 2 / it.rotPeriod) + it.rotPhase) * it.rotAmp;

        if (!it.w) it.w = it.el.offsetWidth;
        const VW = window.innerWidth;
        let baseL;
        if (it.lane === LANES[0]) {                   // làn trái: mép trái trong 4%..(28% - bề rộng)
          const lo = VW * it.lane.a, hi = Math.max(lo, VW * it.lane.b - it.w);
          baseL = lo + (hi - lo) * it.x;
        } else {                                      // làn phải: mép phải trong (72% + bề rộng)..96%
          const hiR = VW * it.lane.b, loR = Math.min(hiR, VW * it.lane.a + it.w);
          baseL = loR + (hiR - loR) * it.x - it.w;
        }
        const maxL = Math.max(0, VW - it.w - 8);
        const leftPx = Math.min(maxL, Math.max(8, baseL + sway));
        it.el.style.transform =
          'translate3d(' + leftPx + 'px,' + it.y + 'px,0) rotate(' + rot + 'deg)';

        if (it.y > H + 80) {
          it.el.remove();
          active.splice(i, 1);
        }
      }
      requestAnimationFrame(tick);
    }
    // Set initial left via transform so we don't fight CSS left
    requestAnimationFrame(tick);
  })();

  /* ---------- Fireworks canvas ---------- */
  (function fireworks() {
    const canvas = document.getElementById('fw');
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0, dpr = 1;
    const rockets = [];
    const particles = [];
    const MAX0 = IS_MOBILE ? 600 : 1400;               // tối ưu: trần số hạt
    let MAX_PARTICLES = MAX0;
    let qScale = 1;                                     // hệ số số hạt / chùm theo chất lượng
    const DRAG = 0.958; // lực cản: hạt bung nhanh rồi "đứng" lại giữ hình

    const SHAPES = ['circle', 'heart', 'star', 'ring', 'peony', 'willow', 'spiral', 'flower']; // đã bỏ hình chữ 20/10

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, FX.level >= 2 ? 1 : (IS_MOBILE ? 1.25 : 1.5)); // tối ưu: giới hạn DPR
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    FX.onChange(function (l) {
      MAX_PARTICLES = Math.round(MAX0 * [1, 0.65, 0.45][l]);
      qScale = [1, 0.8, 0.65][l];
      if (l >= 2) resize();
    });

    // Sprite phát sáng dựng sẵn theo màu (lõi trắng + quầng màu) → mỗi hạt chỉ 1 lần drawImage, không shadowBlur
    const SPRITE = 64, sprites = {};
    function sprite(h) {
      const key = ((Math.round(h / 10) * 10) % 360 + 360) % 360;
      let c = sprites[key];
      if (c) return c;
      c = document.createElement('canvas');
      c.width = c.height = SPRITE;
      const g = c.getContext('2d');
      const r = SPRITE / 2;
      const gr = g.createRadialGradient(r, r, 0, r, r, r);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.14, 'hsla(' + key + ',100%,90%,1)');
      gr.addColorStop(0.3, 'hsla(' + key + ',100%,66%,0.55)');
      gr.addColorStop(0.6, 'hsla(' + key + ',100%,60%,0.14)');
      gr.addColorStop(1, 'hsla(' + key + ',100%,60%,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, SPRITE, SPRITE);
      sprites[key] = c;
      return c;
    }

    function hsl(h, s, l, a) {
      return 'hsla(' + h + ',' + s + '%,' + l + '%,' + (a == null ? 1 : a) + ')';
    }

    function pickColor() {
      const hues = [320, 280, 300, 45, 350, 265, 15];
      return hues[Math.floor(Math.random() * hues.length)];
    }

    function shapePoints(shape, n, r) {
      const pts = [];
      if (shape === 'circle') {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const rr = r * (0.94 + Math.random() * 0.12);
          pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr });
        }
      } else if (shape === 'heart') {
        for (let i = 0; i < n; i++) {
          const t = (i / n) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const s = r / 18;
          pts.push({ x: hx * s, y: hy * s });
        }
      } else if (shape === 'star') {
        // viền ngôi sao 5 cánh: rải đều điểm trên 10 cạnh
        const verts = [];
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
          const rr = k % 2 === 0 ? r : r * 0.42;
          verts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr });
        }
        for (let i = 0; i < n; i++) {
          const f = (i / n) * 10;
          const k = Math.floor(f), t = f - k;
          const A = verts[k], B = verts[(k + 1) % 10];
          pts.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t });
        }
      } else if (shape === 'ring') {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const rr = r * (0.98 + Math.random() * 0.04);
          pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr });
        }
      } else if (shape === 'peony') {
        // double ring with slight color change later
        const half = Math.floor(n / 2);
        for (let i = 0; i < half; i++) {
          const a = (i / half) * Math.PI * 2;
          pts.push({ x: Math.cos(a) * r * 0.55, y: Math.sin(a) * r * 0.55, ring: 0 });
        }
        for (let i = 0; i < n - half; i++) {
          const a = (i / (n - half)) * Math.PI * 2;
          pts.push({ x: Math.cos(a) * r * 1.05, y: Math.sin(a) * r * 1.05, ring: 1 });
        }
      } else if (shape === 'willow') {
        for (let i = 0; i < n; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
          const rr = r * (0.5 + Math.random() * 0.8);
          pts.push({ x: Math.cos(a) * rr * 0.35, y: Math.sin(a) * rr, willow: true });
        }
      } else if (shape === 'spiral') {
        for (let i = 0; i < n; i++) {
          const t = i / n;
          const a = t * Math.PI * 6;
          const rr = r * t;
          pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, spiral: true, t });
        }
      } else if (shape === 'flower') {
        const petals = 6;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const rr = r * (0.45 + 0.55 * Math.abs(Math.cos(a * petals / 2)));
          pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr });
        }
      } else if (shape === '2010') {
        // chữ "20/10": rải đều theo nét (có nội suy) để đọc rõ
        const glyphs = digitPaths();
        const flat = [];
        glyphs.forEach(function (g) {
          for (let k = 0; k < g.length; k++) {
            flat.push(g[k]);
            if (k + 1 < g.length) flat.push({ x: (g[k].x + g[k + 1].x) / 2, y: (g[k].y + g[k + 1].y) / 2 });
          }
        });
        const step = flat.length / n;
        for (let i = 0; i < n; i++) {
          const q = flat[Math.floor(i * step) % flat.length];
          pts.push({ x: q.x * r * 0.075, y: q.y * r * 0.075 });
        }
      } else {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const rr = r * Math.random();
          pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr });
        }
      }
      return pts;
    }

    function digitPaths() {
      // Relative unit coords for "2 0 / 1 0"
      function line(x0, y0, x1, y1, steps) {
        const arr = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          arr.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
        }
        return arr;
      }
      function arc(cx, cy, rad, a0, a1, steps) {
        const arr = [];
        for (let i = 0; i <= steps; i++) {
          const t = a0 + (a1 - a0) * (i / steps);
          arr.push({ x: cx + Math.cos(t) * rad, y: cy + Math.sin(t) * rad });
        }
        return arr;
      }
      // Digits centered around 0, spaced horizontally
      const two = []
        .concat(arc(-14, -4, 4, Math.PI, 0, 10))
        .concat(line(-10, -4, -18, 8, 8))
        .concat(line(-18, 8, -10, 8, 6));
      const zero1 = arc(-4, 2, 5.5, 0, Math.PI * 2, 20);
      const slash = line(4, -6, 8, 10, 10);
      const one = line(12, -6, 12, 10, 12).concat(line(10, -6, 12, -6, 4));
      const zero2 = arc(20, 2, 5.5, 0, Math.PI * 2, 20);
      // Recenter
      const all = [two, zero1, slash, one, zero2];
      const flat = all.reduce(function (a, b) { return a.concat(b); }, []);
      let cx = 0, cy = 0;
      flat.forEach(function (p) { cx += p.x; cy += p.y; });
      cx /= flat.length; cy /= flat.length;
      return all.map(function (g) {
        return g.map(function (p) { return { x: p.x - cx, y: p.y - cy }; });
      });
    }

    function explode(x, y, shape) {
      shape = shape || SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const hue = pickColor();
      const BASE_N = { circle: 100, heart: 130, star: 140, ring: 100, peony: 120, willow: 80, spiral: 100, flower: 150, '2010': 190 };
      const nScale = (IS_MOBILE ? 0.72 : 0.85) * qScale;
      const n = Math.round((BASE_N[shape] || 100) * nScale);
      const r = IS_MOBILE ? 65 + Math.random() * 35 : 110 + Math.random() * 60;
      const pts = shapePoints(shape, n, r);
      const room = MAX_PARTICLES - particles.length;
      const count = Math.min(pts.length, Math.max(0, room));
      const burstGravity = 0.010 + Math.random() * 0.004; // cùng 1 trọng lực cho cả chùm → giữ hình
      const k = 1 - DRAG;

      for (let i = 0; i < count; i++) {
        const p = pts[i];
        const jitter = 1 + (Math.random() - 0.5) * 0.04;
        let vx = p.x * k * jitter;
        let vy = p.y * k * jitter;
        let gravity = burstGravity;
        let drag = DRAG;
        let life = 80 + Math.random() * 30;      // ngắn hơn ~35%
        let h = hue + (Math.random() - 0.5) * 20;

        if (p.willow) {
          gravity = 0.03 + Math.random() * 0.015;
          drag = 0.975;
          vx = p.x * 0.025; vy = p.y * 0.025;
          life = 125 + Math.random() * 45;
          h = 40 + Math.random() * 20; // vàng
        }
        if (p.spiral) {
          const ang = Math.atan2(p.y, p.x) + Math.PI / 2;
          vx += Math.cos(ang) * 0.9;
          vy += Math.sin(ang) * 0.9;
        }
        if (shape === 'peony' && p.ring === 1) {
          h = (hue + 40) % 360;
          life += 20;
        }

        particles.push({
          x, y, vx, vy, drag,
          life, maxLife: life,
          gravity,
          hue: h,
          size: (IS_MOBILE ? 1.5 : 1.9) + Math.random() * (IS_MOBILE ? 0.9 : 1.2),
          trail: true,
          px: x, py: y,
          peonyShift: shape === 'peony',
          alpha: 1,
        });
      }
    }

    function launchRocket(targetX, targetY, shape) {
      const startX = W * (0.2 + Math.random() * 0.6);
      const startY = H + 10;
      const tx = targetX != null ? targetX : W * (0.2 + Math.random() * 0.6);
      const ty = targetY != null ? targetY : H * (0.18 + Math.random() * 0.35);
      rockets.push({
        x: startX, y: startY,
        tx, ty,
        vx: (tx - startX) / 45,
        vy: (ty - startY) / 45,
        hue: pickColor(),
        shape: shape || SHAPES[Math.floor(Math.random() * SHAPES.length)],
        trail: [],
      });
    }

    // Auto launch
    function autoLaunch() {
      if (reduceMotion || document.hidden) return;
      if (particles.length > MAX_PARTICLES * 0.85) return;
      launchRocket();
    }
    setInterval(autoLaunch, 2200);
    setTimeout(autoLaunch, 1200);
    setTimeout(autoLaunch, 2800);

    // Click / tap
    function onPointer(e) {
      const tg = e.target;
      if (tg && tg.closest && tg.closest('#letter, #envelope, #fog-wrap, #music-toggle, #bouquet')) return; // thư / phong thư / sương: không bắn pháo hoa
      e.preventDefault();
      const x = e.clientX != null ? e.clientX : (e.touches && e.touches[0].clientX);
      const y = e.clientY != null ? e.clientY : (e.touches && e.touches[0].clientY);
      if (x == null) return;
      // Don't block letter scrolling — only launch if not interacting with letter
      const t = e.target;
      if (t && (t.id === 'letter' || (t.closest && t.closest('#letter')))) return;
      launchRocket(x, y);
    }
    window.addEventListener('click', onPointer);
    window.addEventListener('touchstart', onPointer, { passive: false });

    let frames = 0, acc = 0, lastFrame = performance.now();
    function loop() {
      // Vệt sáng dài hơn: xoá mờ chậm hơn
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.085)';   // vệt lưu ~0.2s lâu hơn (≈33 khung thay vì ≈21)
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      // Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 10) r.trail.shift();

        for (let t = 0; t < r.trail.length; t++) {
          const p = r.trail[t];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = hsl(r.hue, 90, 72, t / r.trail.length);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = hsl(r.hue, 100, 88, 1);
        ctx.fill();

        if (Math.abs(r.y - r.ty) < 8 || r.y <= r.ty) {
          explode(r.x, r.y, r.shape);
          rockets.splice(i, 1);
        }
      }

      // Particles: 1 sprite phát sáng / hạt
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const lifeT = p.life / p.maxLife;
        let a = lifeT > 0.4 ? 1 : lifeT / 0.4;            // giữ sáng, mờ dần ở 40% cuối
        if (lifeT < 0.55) a *= 0.55 + Math.random() * 0.45; // lấp lánh
        if (p.life <= 0 || a <= 0.01) {
          particles[i] = particles[particles.length - 1];   // xoá O(1)
          particles.pop();
          continue;
        }
        const h = p.peonyShift ? (p.hue + (1 - lifeT) * 50) % 360 : p.hue;
        const rr = p.size * 2.6;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite(h), p.x - rr, p.y - rr, rr * 2, rr * 2);
      }
      ctx.globalAlpha = 1;

      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }

      // Đo fps; nếu trung bình < 45 trong 2s thì tự giảm chất lượng
      const now = performance.now();
      if (!document.hidden && now - lastFrame < 250) { frames++; acc += now - lastFrame; }
      lastFrame = now;
      if (acc >= 2000) {
        const fps = frames * 1000 / acc;
        window.__FPS__ = Math.round(fps);
        if (!FX.fixed && now > FOG_MS + 1500 && fps < 45 && FX.level < 2) FX.set(FX.level + 1);
        frames = 0; acc = 0;
      }

      requestAnimationFrame(loop);
    }
    // Initial clear to transparent-ish dark
    requestAnimationFrame(loop);

    // Expose shapes list for verification
    window.__FW_SHAPES__ = SHAPES.slice();
    window.__FW_BURST__ = explode; // dùng để kiểm thử
  })();
})();
