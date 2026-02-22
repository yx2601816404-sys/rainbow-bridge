// starfield.js — 星空墓园渲染引擎

(function() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('starTooltip');
  const totalCount = document.getElementById('totalCount');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  let width, height;
  let bgStars = [];
  let memorialStars = [];
  let hoveredStar = null;

  function init() {
    RainbowBridge.init();
    resize();
    generateBgStars();
    loadMemorialStars();
    bindEvents();
    animate();
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function generateBgStars() {
    bgStars = [];
    const count = Math.floor((width * height) / 4000);
    for (let i = 0; i < count; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.005 + 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function loadMemorialStars() {
    const memorials = RainbowBridge.getAll();
    memorialStars = memorials.map(m => ({
      data: m,
      x: m.starX * width,
      y: m.starY * height,
      baseR: tierRadius(m.tier),
      r: tierRadius(m.tier),
      color: tierColor(m.tier),
      glowSize: tierGlow(m.tier),
      phase: Math.random() * Math.PI * 2,
    }));
    totalCount.textContent = memorialStars.length;
  }

  function tierRadius(tier) {
    return { normal: 3, eternal: 4, beloved: 5, rainbow: 5 }[tier] || 3;
  }

  function tierColor(tier) {
    return {
      normal: '#FFFFFF',
      eternal: '#FFD700',
      beloved: '#E8A0FF',
      rainbow: null,
    }[tier] || '#FFFFFF';
  }

  function tierGlow(tier) {
    return { normal: 8, eternal: 15, beloved: 20, rainbow: 25 }[tier] || 8;
  }

  function animate() {
    const t = performance.now() * 0.001;
    ctx.clearRect(0, 0, width, height);

    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#141428');
    grad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 装饰星
    for (const s of bgStars) {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
      ctx.fill();
    }

    // 纪念星
    for (const s of memorialStars) {
      const pulse = 0.85 + 0.15 * Math.sin(t * 1.5 + s.phase);
      const isHovered = (s === hoveredStar);
      const r = s.baseR * pulse * (isHovered ? 1.5 : 1);
      const glowMult = isHovered ? 2 : 1;

      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowSize * glowMult);
      if (s.data.tier === 'rainbow') {
        const hue = (t * 30 + s.phase * 57) % 360;
        const rgb = hslToRgb(hue / 360, 0.8, 0.7);
        glow.addColorStop(0, `rgba(${rgb},${0.4 * pulse})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        const c = hexToRgb(s.color);
        glow.addColorStop(0, `rgba(${c},${0.3 * pulse})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.glowSize * glowMult, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      if (s.data.tier === 'rainbow') {
        const hue = (t * 30 + s.phase * 57) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 75%)`;
      } else {
        ctx.fillStyle = s.color;
      }
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  function bindEvents() {
    window.addEventListener('resize', () => {
      resize();
      generateBgStars();
      loadMemorialStars();
    });

    canvas.addEventListener('mousemove', (e) => {
      const mx = e.clientX, my = e.clientY;
      hoveredStar = null;
      for (const s of memorialStars) {
        const dx = mx - s.x, dy = my - s.y;
        if (dx * dx + dy * dy < (s.glowSize + 5) ** 2) {
          hoveredStar = s;
          break;
        }
      }
      if (hoveredStar) {
        canvas.style.cursor = 'pointer';
        showTooltip(hoveredStar, mx, my);
      } else {
        canvas.style.cursor = 'default';
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('click', () => {
      if (hoveredStar) {
        window.location.href = `memorial.html?id=${hoveredStar.data.id}`;
      }
    });

    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mx = touch.clientX, my = touch.clientY;
      for (const s of memorialStars) {
        const dx = mx - s.x, dy = my - s.y;
        if (dx * dx + dy * dy < (s.glowSize + 15) ** 2) {
          window.location.href = `memorial.html?id=${s.data.id}`;
          e.preventDefault();
          return;
        }
      }
    });

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (q.length === 0) {
        searchResults.style.display = 'none';
        return;
      }
      const results = RainbowBridge.search(q);
      if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-empty">没有找到...</div>';
      } else {
        searchResults.innerHTML = results.map(m =>
          `<a class="search-item" href="memorial.html?id=${m.id}">
            <span class="search-name">${m.name}</span>
            <span class="search-meta">${m.breed || m.type} · ${m.duration || ''}</span>
          </a>`
        ).join('');
      }
      searchResults.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-search') && !e.target.closest('.search-results')) {
        searchResults.style.display = 'none';
      }
    });
  }

  function showTooltip(star, mx, my) {
    const d = star.data;
    tooltip.querySelector('.tooltip-name').textContent = d.name;
    tooltip.querySelector('.tooltip-duration').textContent =
      d.duration ? `陪伴了 ${d.duration}` : '';
    tooltip.querySelector('.tooltip-candles').textContent =
      d.candles ? `🕯️ ${d.candles}` : '';
    tooltip.style.display = 'block';
    const tx = mx + 15 > width - 160 ? mx - 170 : mx + 15;
    const ty = my + 15 > height - 80 ? my - 80 : my + 15;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q2;
      r = hue2rgb(p, q2, h + 1/3);
      g = hue2rgb(p, q2, h);
      b = hue2rgb(p, q2, h - 1/3);
    }
    return `${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)}`;
  }

  init();
})();
