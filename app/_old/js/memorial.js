// memorial.js — 纪念馆页面逻辑

(function() {
  const MESSAGES_KEY = 'rb-messages-';

  // 从URL获取ID
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  RainbowBridge.init();
  const memorial = RainbowBridge.getById(id);

  if (!memorial) {
    window.location.href = 'index.html';
    return;
  }

  // 生成背景星星
  generateBgStars();

  // 填充数据
  render(memorial);

  // 绑定事件
  bindEvents(memorial);

  function render(m) {
    document.title = `${m.name}的纪念馆 — 彩虹桥`;

    // 头像emoji根据类型
    const avatarMap = {
      cat: '🐱', dog: '🐕', rabbit: '🐰', hamster: '🐹',
      bird: '🐦', fish: '🐟', turtle: '🐢',
    };
    document.getElementById('petAvatar').textContent = avatarMap[m.type] || '🌟';
    document.getElementById('petName').textContent = m.name;

    // 日期
    let dateStr = '';
    if (m.birthDate && m.deathDate) {
      dateStr = `${m.birthDate} — ${m.deathDate}`;
    } else if (m.deathDate) {
      dateStr = `生于未知 · 卒于 ${m.deathDate}`;
    } else if (m.birthDate) {
      dateStr = `${m.birthDate} —`;
    }
    document.getElementById('petDates').textContent = dateStr;

    // 陪伴时长
    document.getElementById('petDuration').textContent =
      m.duration ? `✨ 陪伴了 ${m.duration}` : '';

    // 蜡烛
    document.getElementById('candleCount').textContent =
      (m.candles || 0).toLocaleString();

    // 主人寄语
    const msgEl = document.getElementById('ownerMessage');
    if (m.message) {
      msgEl.innerHTML = m.message.split('\n').map(p => `<p>${p}</p>`).join('');
    } else {
      document.getElementById('messageCard').style.display = 'none';
    }

    // 纪念诗
    if (m.poem) {
      document.getElementById('poemCard').style.display = 'block';
      document.getElementById('poemText').innerHTML =
        m.poem.split('\n').join('<br>');
    }

    // 留言
    renderMessages(m.id);
  }

  function bindEvents(m) {
    // 点蜡烛
    const candleBtn = document.getElementById('candleBtn');
    candleBtn.addEventListener('click', () => {
      const updated = RainbowBridge.lightCandle(m.id);
      if (updated) {
        document.getElementById('candleCount').textContent =
          updated.candles.toLocaleString();
        candleBtn.textContent = '🕯️ 已点亮';
        candleBtn.style.background = 'linear-gradient(135deg, #90EE90, #32CD32)';
        setTimeout(() => {
          candleBtn.textContent = '🕯️ 再点一支';
          candleBtn.style.background = '';
        }, 2000);
      }
    });

    // 留言
    document.getElementById('msgSubmit').addEventListener('click', () => {
      const input = document.getElementById('msgInput');
      const text = input.value.trim();
      if (!text) return;

      const messages = getMessages(m.id);
      messages.push({
        author: '匿名访客',
        content: text,
        time: new Date().toLocaleString('zh-CN'),
      });
      localStorage.setItem(MESSAGES_KEY + m.id, JSON.stringify(messages));
      input.value = '';
      renderMessages(m.id);
    });
  }

  function getMessages(id) {
    const raw = localStorage.getItem(MESSAGES_KEY + id);
    return raw ? JSON.parse(raw) : [];
  }

  function renderMessages(id) {
    const messages = getMessages(id);
    const list = document.getElementById('messagesList');

    if (messages.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.3);padding:1rem;">还没有留言，写下第一条吧</div>';
      return;
    }

    list.innerHTML = messages.map(msg => `
      <div class="msg-item">
        <div class="msg-author">${escapeHtml(msg.author)}</div>
        <div class="msg-content">${escapeHtml(msg.content)}</div>
        <div class="msg-time">${msg.time}</div>
      </div>
    `).join('');
  }

  function generateBgStars() {
    const container = document.getElementById('starfieldBg');
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 2 + 's';
      star.style.animationDuration = (1.5 + Math.random()) + 's';
      container.appendChild(star);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
