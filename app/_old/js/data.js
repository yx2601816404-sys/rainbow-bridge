// data.js — 彩虹桥数据层
// MVP: localStorage | 未来: API

const RainbowBridge = {
  STORAGE_KEY: 'rainbow-bridge-memorials',

  // 创世数据 — 第一颗星
  GENESIS: [{
    id: 1,
    name: '小谦',
    type: 'cat',
    breed: '布偶猫',
    birthDate: null,
    deathDate: '2024-12',
    duration: '21个月',
    ownerName: '了',
    message: '你来过这个世界。这就够了。',
    poem: null,
    photos: [],
    candles: 1,
    tier: 'normal',
    createdAt: '2026-02-21',
    starX: 0.5,
    starY: 0.4,
  }],

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
    memorial.starX = 0.15 + Math.random() * 0.7;
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
  }
};
