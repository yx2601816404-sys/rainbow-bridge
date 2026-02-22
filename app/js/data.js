// data.js — 彩虹桥数据层
// MVP: localStorage | 未来: API

const RainbowBridge = {
  STORAGE_KEY: 'rainbow-bridge-memorials',
  MESSAGES_KEY: 'rb-messages-',

  GENESIS: [
    {
      id: 1, name: '小谦', type: 'cat', breed: '布偶猫',
      birthDate: '2023-01', deathDate: '2024-10-20', duration: '约19个月',
      ownerName: '了', message: '三月的风把你送来，一团蓝眼睛的云。你用十九个月踩遍了我心房的每个角落，然后安静地走了，像你来时一样轻。\n\n你来过这个世界。这就够了。',
      poem: '你不知道自己有多小\n小到可以整个蜷在我掌心里\n\n你也不知道自己有多重\n重到你走后\n这间屋子到处都是你的形状\n\n椅子上有你\n窗台上有你\n凌晨三点醒来的寂静里\n也全是你\n\n小谦\n你不欠我什么\n是我欠你一个更长的春天',
      photos: [], candles: 1, tier: 'eternal',
      createdAt: '2026-02-21', starX: 0.48, starY: 0.38,
    },
    {
      id: 2, name: '年糕', type: 'cat', breed: '橘猫',
      birthDate: '2019-03', deathDate: '2024-11', duration: '5年8个月',
      ownerName: '小雨', message: '窗台上的阳光还在，你却走远了。',
      poem: null, photos: [], candles: 247, tier: 'normal',
      createdAt: '2026-02-21', starX: 0.22, starY: 0.55,
    },
    {
      id: 3, name: '豆豆', type: 'dog', breed: '金毛',
      birthDate: '2012-06', deathDate: '2024-09', duration: '12年3个月',
      ownerName: '阿杰', message: '十二年，你从未离开门口等我的位置。',
      poem: null, photos: [], candles: 892, tier: 'eternal',
      createdAt: '2026-02-21', starX: 0.72, starY: 0.32,
    },
    {
      id: 4, name: '棉花糖', type: 'rabbit', breed: '荷兰垂耳兔',
      birthDate: '2021-12', deathDate: '2024-08', duration: '2年7个月',
      ownerName: '匿名', message: '你是圣诞节的礼物，软软的，像一团云。',
      poem: null, photos: [], candles: 156, tier: 'normal',
      createdAt: '2026-02-21', starX: 0.35, starY: 0.68,
    },
    {
      id: 5, name: '黑炭', type: 'cat', breed: '英短蓝猫',
      birthDate: '2016-04', deathDate: '2025-01', duration: '8年9个月',
      ownerName: '林林', message: '你走后第一个冬天，暖气好像也不暖了。',
      poem: null, photos: [], candles: 431, tier: 'eternal',
      createdAt: '2026-02-21', starX: 0.62, starY: 0.58,
    },
    {
      id: 6, name: '旺财', type: 'dog', breed: '柴犬',
      birthDate: '2010-08', deathDate: '2024-12', duration: '14年4个月',
      ownerName: '老王', message: '十四年，你比很多人都忠诚。',
      poem: null, photos: [], candles: 1203, tier: 'rainbow',
      createdAt: '2026-02-21', starX: 0.82, starY: 0.45,
    },
  ],

  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.GENESIS));
    }
    return this;
  },

  getAll() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : this.GENESIS;
  },

  getById(id) {
    return this.getAll().find(m => m.id === Number(id));
  },

  create(memorial) {
    const all = this.getAll();
    memorial.id = all.length ? Math.max(...all.map(m => m.id)) + 1 : 2;
    memorial.candles = 0;
    memorial.tier = 'normal';
    memorial.createdAt = new Date().toISOString().split('T')[0];
    memorial.starX = 0.12 + Math.random() * 0.76;
    memorial.starY = 0.1 + Math.random() * 0.7;
    all.push(memorial);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    return memorial;
  },

  lightCandle(id) {
    const all = this.getAll();
    const m = all.find(m => m.id === Number(id));
    if (m) {
      m.candles = (m.candles || 0) + 1;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    }
    return m;
  },

  search(query) {
    const q = query.toLowerCase();
    return this.getAll().filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.breed && m.breed.toLowerCase().includes(q)) ||
      (m.type && m.type.toLowerCase().includes(q))
    );
  },

  getMessages(id) {
    const raw = localStorage.getItem(this.MESSAGES_KEY + id);
    return raw ? JSON.parse(raw) : [];
  },

  addMessage(id, author, content) {
    const msgs = this.getMessages(id);
    msgs.push({ author, content, time: new Date().toLocaleString('zh-CN') });
    localStorage.setItem(this.MESSAGES_KEY + id, JSON.stringify(msgs));
    return msgs;
  }
};
