// nav.js — 页面过渡 + 移动端菜单
// 所有页面共享

// 页面过渡
function navigateTo(url) {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) { window.location.href = url; return; }
  overlay.classList.add('active');
  setTimeout(() => { window.location.href = url; }, 400);
}

// 移动端汉堡菜单
(function initNav() {
  const burger = document.querySelector('.nav-burger');
  const mobile = document.querySelector('.nav-mobile');
  if (!burger || !mobile) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobile.classList.toggle('open');
  });

  // 点击链接关闭菜单
  mobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      burger.classList.remove('open');
      mobile.classList.remove('open');
      navigateTo(a.href);
    });
  });
})();

// 页面加载时淡入
window.addEventListener('load', () => {
  const overlay = document.querySelector('.page-transition');
  if (overlay) overlay.classList.remove('active');
});
