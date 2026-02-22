// starfield.js — 星空墓园渲染引擎 v3
// Canvas 2D: 装饰星 + 纪念星 + 流星 + 鼠标光迹 + 揭幕动画

(function() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const tip = document.getElementById('starTip');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const totalCount = document.getElementById('totalCount');

  let W, H;
  const bgStars = [];
  const memStars = [];
  const shootingStars = [];
  const trail = [];
  let hovered = null;
  let time = 0;

  // --- 时间感知氛围 ---
  // 深夜的星空应该更亮、更深邃。清晨有一丝暖意。
  function getTimeAtmosphere() {
    const h = new Date().getHours();
    // 深夜 (22-4): 星星更亮，背景更深
    if (h >= 22 || h < 4) return {
      bgTop: '#050508', bgMid: '#08081a', bgBot: '#0a0a1e',
      starAlpha: 1.2, nebulaAlpha: 1.3, shootingRate: 0.005,
    };
    // 凌晨 (4-6): 一丝暖色在地平线
    if (h >= 4 && h < 6) return {
      bgTop: '#06060e', bgMid: '#0a0a16', bgBot: '#1a1018',
      starAlpha: 1.0, nebulaAlpha: 1.0, shootingRate: 0.004,
    };
    // 白天 (6-18): 柔和
    if (h >= 6 && h < 18) return {
      bgTop: '#0a0a10', bgMid: '#0c0c18', bgBot: '#0e0e1c',
      starAlpha: 0.7, nebulaAlpha: 0.6, shootingRate: 0.002,
    };
    // 傍晚 (18-22): 渐深
    return {
      bgTop: '#08080e', bgMid: '#0a0a18', bgBot: '#0c0c1e',
      starAlpha: 0.9, nebulaAlpha: 0.9, shootingRate: 0.003,
    };
  }

  const atmo = getTimeAtmosphere();

  const INFLUENCE = 150;
  const TRAIL_MAX = 20;
  const TIER_CFG = {
    normal:  { r: 2.5, glow: 8,  color: [237,237,237] },
    eternal: { r: 3.5, glow: 14, color: [212,165,116] },
    beloved: { r: 4,   glow: 18, color: [200,160,230] },
    rainbow: { r: 4,   glow: 22, color: null },
  };

  // --- Init ---
  function init() {
    RainbowBridge.init();
    resize();
    makeBgStars();
    loadMemorials();
    bindEvents();
    playReveal();
    loop();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // --- 装饰星 ---
  function makeBgStars() {
    bgStars.length = 0;
    const n = Math.min(Math.floor((W * H) / 4500), 350);
    for (let i = 0; i < n; i++) {
      bgStars.push({
        x: Math.random() * W, y: Math.random() * H,
        bx: 0, by: 0,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.5 + 0.1,
        sp: Math.random() * 0.015 + 0.005,
        ph: Math.random() * 6.28,
        depth: Math.random(),
      });
    }
    bgStars.forEach(s => { s.bx = s.x; s.by = s.y; });
  }

  // --- 纪念星 ---
  function loadMemorials() {
    memStars.length = 0;
    const all = RainbowBridge.getAll();
    all.forEach(m => {
      const cfg = TIER_CFG[m.tier] || TIER_CFG.normal;
      memStars.push({
        d: m,
        x: m.starX * W, y: m.starY * H,
        bx: m.starX * W, by: m.starY * H,
        r: cfg.r, glow: cfg.glow, color: cfg.color,
        ph: Math.random() * 6.28,
      });
    });
    if (totalCount) totalCount.textContent = memStars.length;
  }

  // --- 流星 ---
  function spawnShootingStar() {
    const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.2; // 大致从右上到左下
    const speed = 6 + Math.random() * 8;
    const len = 60 + Math.random() * 100;
    shootingStars.push({
      x: Math.random() * W * 1.2,
      y: -20 - Math.random() * 100,
      vx: -Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: len,
      life: 1,
      decay: 0.008 + Math.random() * 0.006,
      width: 1 + Math.random() * 1.5,
    });
  }

  function updateShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0 || s.x < -100 || s.y > H + 100) {
        shootingStars.splice(i, 1);
      }
    }
  }

  function drawShootingStars() {
    for (const s of shootingStars) {
      const tailX = s.x - s.vx * (s.len / Math.sqrt(s.vx * s.vx + s.vy * s.vy));
      const tailY = s.y - s.vy * (s.len / Math.sqrt(s.vx * s.vx + s.vy * s.vy));

      const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(237, 237, 237, ${s.life * 0.9})`);
      grad.addColorStop(0.3, `rgba(212, 165, 116, ${s.life * 0.5})`);
      grad.addColorStop(1, `rgba(212, 165, 116, 0)`);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 头部光点
      const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 4);
      headGlow.addColorStop(0, `rgba(255, 255, 255, ${s.life * 0.8})`);
      headGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, 6.28);
      ctx.fillStyle = headGlow;
      ctx.fill();
    }
  }

  // --- 鼠标光迹 ---
  function addTrailPoint(x, y) {
    trail.push({ x, y, life: 1 });
    if (trail.length > TRAIL_MAX) trail.shift();
  }

  function drawTrail() {
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= 0.03;
      if (trail[i].life <= 0) { trail.splice(i, 1); continue; }
    }
    if (trail.length < 2) return;

    // 光迹线
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length - 1; i++) {
      const xc = (trail[i].x + trail[i + 1].x) / 2;
      const yc = (trail[i].y + trail[i + 1].y) / 2;
      ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
    }
    ctx.strokeStyle = 'rgba(212, 165, 116, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 光点
    for (const p of trail) {
      const r = p.life * 2.5;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `rgba(212, 165, 116, ${p.life * 0.2})`);
      g.addColorStop(1, 'rgba(212, 165, 116, 0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 6.28);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  // --- 渲染 ---
  function loop() {
    time++;
    const t = time * 0.016;

    // 随机生成流星
    if (Math.random() < atmo.shootingRate) spawnShootingStar();
    updateShootingStars();

    // 鼠标速度检测，有移动时添加光迹
    const sp = Math.sqrt(Mouse.vx * Mouse.vx + Mouse.vy * Mouse.vy);
    if (sp > 1.5) addTrailPoint(Mouse.x, Mouse.y);

    ctx.clearRect(0, 0, W, H);

    // 背景渐变 — 随时间变化
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, atmo.bgTop);
    g.addColorStop(0.4, atmo.bgMid);
    g.addColorStop(1, atmo.bgBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 星云
    drawNebula();

    // 装饰星
    for (const s of bgStars) {
      const alpha = (s.a + 0.15 * Math.sin(t * s.sp * 60 + s.ph)) * atmo.starAlpha;
      const dx = s.bx - Mouse.x, dy = s.by - Mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < INFLUENCE) {
        const f = (1 - dist / INFLUENCE) * 20 * (0.3 + s.depth * 0.7);
        const ang = Math.atan2(dy, dx);
        s.x = lerp(s.x, s.bx + Math.cos(ang) * f, 0.06);
        s.y = lerp(s.y, s.by + Math.sin(ang) * f, 0.06);
      } else {
        s.x = lerp(s.x, s.bx, 0.03);
        s.y = lerp(s.y, s.by, 0.03);
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.28);
      ctx.fillStyle = `rgba(220,220,235,${alpha * 0.5})`;
      ctx.fill();
    }

    // 纪念星
    for (const s of memStars) {
      const pulse = 0.85 + 0.15 * Math.sin(t * 1.2 + s.ph);
      const isH = s === hovered;
      const r = s.r * pulse * (isH ? 1.8 : 1);
      const glowR = s.glow * (isH ? 2.2 : 1);

      const dx = s.bx - Mouse.x, dy = s.by - Mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < INFLUENCE * 0.8) {
        const f = (1 - dist / (INFLUENCE * 0.8)) * 12;
        const ang = Math.atan2(dy, dx);
        s.x = lerp(s.x, s.bx + Math.cos(ang) * f, 0.05);
        s.y = lerp(s.y, s.by + Math.sin(ang) * f, 0.05);
      } else {
        s.x = lerp(s.x, s.bx, 0.03);
        s.y = lerp(s.y, s.by, 0.03);
      }

      // 光晕
      let gc;
      if (s.d.tier === 'rainbow') {
        const hue = (t * 20 + s.ph * 50) % 360;
        const rgb = hsl2rgb(hue / 360, 0.7, 0.65);
        gc = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        gc.addColorStop(0, `rgba(${rgb},${0.35 * pulse})`);
        gc.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        const c = s.color;
        gc = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        gc.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${0.25 * pulse})`);
        gc.addColorStop(1, 'rgba(0,0,0,0)');
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, glowR, 0, 6.28);
      ctx.fillStyle = gc;
      ctx.fill();

      // 星体
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, 6.28);
      if (s.d.tier === 'rainbow') {
        const hue = (t * 20 + s.ph * 50) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 70%)`;
      } else {
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${0.8 + 0.2 * pulse})`;
      }
      ctx.fill();

      // hover 时画名字标签
      if (isH) {
        ctx.font = '300 12px "Noto Serif SC", serif';
        ctx.fillStyle = `rgba(237,237,237,0.65)`;
        ctx.textAlign = 'center';
        ctx.fillText(s.d.name, s.x, s.y - glowR - 8);
      }
    }

    // 流星
    drawShootingStars();

    // 鼠标光迹
    drawTrail();

    // 鼠标光晕
    drawMouseGlow();

    requestAnimationFrame(loop);
  }

  function drawNebula() {
    const g1 = ctx.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, W * 0.35);
    g1.addColorStop(0, 'rgba(50,20,70,0.012)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 0, W * 0.8, H * 0.7, W * 0.3);
    g2.addColorStop(0, 'rgba(20,35,70,0.01)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
    // 第三团星云 — 微弱的暖色
    const g3 = ctx.createRadialGradient(W * 0.5, H * 0.15, 0, W * 0.5, H * 0.15, W * 0.25);
    g3.addColorStop(0, 'rgba(80,50,30,0.006)');
    g3.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);
  }

  function drawMouseGlow() {
    const sp = Math.sqrt(Mouse.vx * Mouse.vx + Mouse.vy * Mouse.vy);
    const sz = Math.min(35 + sp * 0.4, 100);
    const al = Math.min(0.03 + sp * 0.001, 0.1);
    const g = ctx.createRadialGradient(Mouse.x, Mouse.y, 0, Mouse.x, Mouse.y, sz);
    g.addColorStop(0, `rgba(212,165,116,${al})`);
    g.addColorStop(1, 'rgba(212,165,116,0)');
    ctx.beginPath();
    ctx.arc(Mouse.x, Mouse.y, sz, 0, 6.28);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // --- 交互 ---
  function bindEvents() {
    window.addEventListener('resize', () => { resize(); makeBgStars(); loadMemorials(); });

    canvas.addEventListener('mousemove', e => {
      const mx = e.clientX, my = e.clientY;
      hovered = null;
      for (const s of memStars) {
        const dx = mx - s.x, dy = my - s.y;
        if (dx * dx + dy * dy < (s.glow + 8) ** 2) { hovered = s; break; }
      }
      if (hovered) {
        showTip(hovered, mx, my);
      } else {
        tip.style.display = 'none';
      }
    });

    canvas.addEventListener('click', () => {
      if (hovered) navigateTo(`memorial.html?id=${hovered.d.id}`);
    });

    canvas.addEventListener('touchstart', e => {
      const t = e.touches[0];
      for (const s of memStars) {
        const dx = t.clientX - s.x, dy = t.clientY - s.y;
        if (dx * dx + dy * dy < (s.glow + 18) ** 2) {
          navigateTo(`memorial.html?id=${s.d.id}`);
          e.preventDefault(); return;
        }
      }
    });

    // 搜索
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        const q = e.target.value.trim();
        if (!q) { searchResults.classList.remove('active'); return; }
        const res = RainbowBridge.search(q);
        if (!res.length) {
          searchResults.innerHTML = '<div style="padding:0.5rem;font-size:0.75rem;color:var(--white-faint)">没有找到</div>';
        } else {
          searchResults.innerHTML = res.map(m =>
            `<a href="memorial.html?id=${m.id}" onclick="event.preventDefault();navigateTo(this.href)">${m.name}<span class="sr-breed">${m.breed || ''}</span></a>`
          ).join('');
        }
        searchResults.classList.add('active');
      });
      document.addEventListener('click', e => {
        if (!e.target.closest('.search-wrap')) searchResults.classList.remove('active');
      });
    }

    // 浮动文字视差
    const t1 = document.getElementById('bgT1');
    const t2 = document.getElementById('bgT2');
    if (t1 && t2) {
      (function prlx() {
        const cx = (Mouse.x / W - 0.5);
        const cy = (Mouse.y / H - 0.5);
        t1.style.transform = `translate(${cx * -25}px, ${cy * -12}px)`;
        t2.style.transform = `translate(${cx * 18}px, ${cy * 8}px)`;
        requestAnimationFrame(prlx);
      })();
    }
  }

  function showTip(s, mx, my) {
    const d = s.d;
    tip.querySelector('.tip-name').textContent = d.name;
    tip.querySelector('.tip-meta').textContent =
      [d.breed, d.duration ? `陪伴了 ${d.duration}` : ''].filter(Boolean).join(' · ');
    tip.querySelector('.tip-candles').textContent = d.candles ? `🕯️ ${d.candles}` : '';
    tip.style.display = 'block';
    const tx = mx + 15 > W - 150 ? mx - 160 : mx + 15;
    const ty = my + 15 > H - 70 ? my - 70 : my + 15;
    tip.style.left = tx + 'px';
    tip.style.top = ty + 'px';
  }

  // --- 开屏：安静的光 ---
  // 不是技术展示。是深夜里一颗星亮起来。
  // 0-2s: 黑暗中，一颗星慢慢亮起
  // 2-4s: 文字轻轻浮现
  // 4-5.5s: 一切渐隐，星空接管
  function playReveal() {
    const star = document.getElementById('revealStar');
    const chars = document.querySelectorAll('.reveal-title .char');
    const sub = document.getElementById('revealSub');
    const overlay = document.getElementById('revealOverlay');
    const main = document.getElementById('mainWrap');

    if (!overlay || !main) return;

    // 一颗星亮起
    setTimeout(() => {
      star.style.transition = 'opacity 2s ease';
      star.style.opacity = '1';
    }, 600);

    // 星光扩散
    setTimeout(() => {
      star.style.transition = 'box-shadow 1.5s ease, opacity 1s ease';
      star.style.boxShadow = '0 0 40px 12px rgba(212,165,116,0.2)';
    }, 1800);

    // 文字浮现 — 不是弹入，是像呼吸一样慢慢出现
    chars.forEach((c, i) => {
      setTimeout(() => {
        c.style.transition = 'opacity 1.5s ease';
        c.style.opacity = '1';
      }, 2400 + i * 350);
    });

    // 副标题
    setTimeout(() => {
      sub.style.transition = 'opacity 1.8s ease';
      sub.style.opacity = '1';
    }, 3600);

    // 一切渐隐，星空接管
    setTimeout(() => {
      overlay.style.transition = 'opacity 2s cubic-bezier(0.4,0,0.2,1)';
      overlay.style.opacity = '0';
      overlay.classList.add('done');
      main.classList.add('visible');
      main.style.transition = 'opacity 2s ease';
    }, 5000);

    setTimeout(() => { overlay.style.display = 'none'; }, 7200);
  }

  // --- 工具 ---
  function hsl2rgb(h, s, l) {
    let r, g, b;
    if (s === 0) { r = g = b = l; } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const h2r = (p, q, t) => {
        if (t < 0) t++; if (t > 1) t--;
        if (t < 1/6) return p + (q-p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q-p) * (2/3-t) * 6;
        return p;
      };
      r = h2r(p, q, h + 1/3); g = h2r(p, q, h); b = h2r(p, q, h - 1/3);
    }
    return `${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)}`;
  }

  init();
})();
