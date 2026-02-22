# 彩虹桥 — 宠物纪念星空

纯静态站点，无构建步骤。`app/` 目录即部署目录。

## 本地预览

```bash
cd app && python3 -m http.server 8765
# 打开 http://localhost:8765
```

## 部署

### Netlify
拖拽 `app/` 文件夹到 Netlify Drop，或者：
- Build command: (留空)
- Publish directory: `app`

### Vercel
```bash
cd app && npx vercel --prod
```

### GitHub Pages
将 `app/` 目录内容推送到 `gh-pages` 分支。

### 任意静态托管
上传 `app/` 目录下所有文件即可。

## 文件结构

```
app/
├── index.html        # 星空首页（Canvas 星空 + 开屏动画）
├── memorial.html     # 纪念馆页面
├── create.html       # 创建纪念馆（仪式化流程）
├── about.html        # 关于页面
├── 404.html          # 404 页面
├── favicon.svg       # 星星图标
├── css/
│   ├── core.css      # 设计系统
│   └── memorial.css  # 纪念馆样式
└── js/
    ├── cursor.js     # 自定义光标
    ├── data.js       # 数据层（localStorage）
    ├── nav.js        # 导航 + 页面过渡
    └── starfield.js  # 星空渲染引擎
```

## 技术栈

零依赖。纯 HTML/CSS/JavaScript。
- Canvas 2D 星空渲染（流星、鼠标光迹、时间感知氛围）
- CSS 动画（开屏、滚动揭示、蜡烛火焰）
- localStorage 数据持久化
- 响应式设计（移动端适配、安全区域、dvh）
