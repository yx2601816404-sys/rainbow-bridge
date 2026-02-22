// cursor.js — 自定义光标 + 鼠标状态
// 共享模块，所有页面引用

const Mouse = {
  x: window.innerWidth / 2, y: window.innerHeight / 2,
  tx: window.innerWidth / 2, ty: window.innerHeight / 2,
  vx: 0, vy: 0, px: 0, py: 0,
};

const lerp = (a, b, t) => a + (b - a) * t;

(function initCursor() {
  const dot = document.getElementById('cDot');
  const ring = document.getElementById('cRing');
  if (!dot || !ring) return;

  let dx = Mouse.x, dy = Mouse.y, rx = Mouse.x, ry = Mouse.y;

  function tick() {
    Mouse.vx = Mouse.x - Mouse.px;
    Mouse.vy = Mouse.y - Mouse.py;
    Mouse.px = Mouse.x;
    Mouse.py = Mouse.y;
    Mouse.x = lerp(Mouse.x, Mouse.tx, 0.15);
    Mouse.y = lerp(Mouse.y, Mouse.ty, 0.15);

    dx = lerp(dx, Mouse.x, 0.35);
    dy = lerp(dy, Mouse.y, 0.35);
    rx = lerp(rx, Mouse.x, 0.1);
    ry = lerp(ry, Mouse.y, 0.1);

    dot.style.left = dx + 'px';
    dot.style.top = dy + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';

    requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener('mousemove', e => {
    Mouse.tx = e.clientX;
    Mouse.ty = e.clientY;
  });
  window.addEventListener('touchmove', e => {
    Mouse.tx = e.touches[0].clientX;
    Mouse.ty = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchstart', e => {
    Mouse.tx = Mouse.x = e.touches[0].clientX;
    Mouse.ty = Mouse.y = e.touches[0].clientY;
  });

  // Hover 状态
  document.addEventListener('mouseover', e => {
    if (e.target.closest('[data-hover], a, button, input')) {
      ring.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-hover], a, button, input')) {
      ring.classList.remove('hovering');
    }
  });
})();
