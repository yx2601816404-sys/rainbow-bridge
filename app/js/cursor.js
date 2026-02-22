// cursor.js — 自定义光标 + 鼠标状态
// 内圈零延迟跟手，外圈 lerp 轻微拖尾，全部用 transform 避免 layout thrash

const Mouse = {
  x: window.innerWidth / 2, y: window.innerHeight / 2,
  vx: 0, vy: 0, px: 0, py: 0,
};

const lerp = (a, b, t) => a + (b - a) * t;

(function initCursor() {
  const dot = document.getElementById('cDot');
  const ring = document.getElementById('cRing');
  if (!dot || !ring) return;

  // 隐藏系统光标
  document.documentElement.style.cursor = 'none';

  let mouseX = Mouse.x, mouseY = Mouse.y;
  let ringX = Mouse.x, ringY = Mouse.y;

  // 去掉 CSS transition — 全部由 rAF 驱动
  dot.style.transition = 'none';
  ring.style.transition = 'width 0.3s, height 0.3s, border-color 0.3s';
  dot.style.left = '0';
  dot.style.top = '0';
  ring.style.left = '0';
  ring.style.top = '0';
  dot.style.willChange = 'transform';
  ring.style.willChange = 'transform';

  function tick() {
    // 速度计算
    Mouse.vx = mouseX - Mouse.px;
    Mouse.vy = mouseY - Mouse.py;
    Mouse.px = mouseX;
    Mouse.py = mouseY;
    Mouse.x = mouseX;
    Mouse.y = mouseY;

    // 内圈：零延迟，直接跟手
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    // 外圈：lerp 轻微拖尾
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener('touchmove', e => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchstart', e => {
    mouseX = ringX = e.touches[0].clientX;
    mouseY = ringY = e.touches[0].clientY;
  });

  // Hover 状态（仅改 class，尺寸变化由 CSS transition 处理）
  document.addEventListener('mouseover', e => {
    if (e.target.closest('[data-hover], a, button, input, textarea, select')) {
      ring.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-hover], a, button, input, textarea, select')) {
      ring.classList.remove('hovering');
    }
  });
})();
