# quentinhocde.com 视觉分析报告

基于录屏关键帧分析（48帧，0.5s间隔开屏 + 2s间隔浏览）。

## 1. 开屏动画（0-6秒）

### 序列描述
- **0-1.5s**：纯黑屏，中央出现极细的白色文字 "QUENTIN HOCDÉ" + 副标题 "CREATIVE DEVELOPER"，字体极小，居中，周围大量留白（黑色）。文字像是从虚无中"浮现"，不是突然出现
- **1.5-2.5s**：文字开始有微妙的位移/缩放，背景仍然纯黑
- **2.5-3.5s**：关键转场——背景开始从纯黑渐变，出现颗粒噪点纹理（grain texture），像老胶片的质感。同时文字开始向上移动
- **3.5-5.5s**：主页内容逐渐揭幕。项目卡片从底部或侧面滑入，带有错位动画（staggered animation）。背景完全过渡到深灰/暗色调

### 关键设计要素
- **极简主义开场**：不是炫技，是克制。纯黑 + 极细白字 = 高级感
- **颗粒纹理**：整个网站覆盖一层微妙的噪点/颗粒，像胶片质感，避免了纯数字的"塑料感"
- **过渡时间曲线**：缓慢、优雅，大约 ease-out 或 cubic-bezier(0.16, 1, 0.3, 1)

## 2. 整体配色

- **主背景**：接近纯黑 #0a0a0a 到深灰 #1a1a1a
- **文字**：白色 #ffffff 到浅灰 #e0e0e0
- **强调色**：几乎没有彩色！偶尔在项目卡片的图片中出现色彩，但 UI 本身是纯黑白灰
- **对比策略**：高对比度（白字黑底），但通过字重和大小变化创造层次，而非颜色

## 3. 字体与排版

- **标题字体**：衬线体（Serif），可能是自定义字体或 Playfair Display / Cormorant 类。字重偏细（light/thin），字号极大（hero 标题可能 8-12vw）
- **正文字体**：无衬线（Sans-serif），可能是 Inter 或类似的现代几何无衬线体
- **排版特征**：
  - 大量留白，行间距宽松
  - 标题字号极大，与正文形成强烈对比
  - 文字有时竖排或斜向排列（装饰性）
  - 字母间距（letter-spacing）在标题中加大

## 4. 布局结构

- **首页**：全屏 hero → 项目网格（不规则布局，不是标准栅格）
- **项目卡片**：大小不一，有的占半屏，有的占 1/3，错落排列
- **导航**：极简，可能是汉堡菜单或隐藏式导航，不占视觉空间
- **滚动**：平滑滚动（Lenis/Locomotive Scroll 风格），有视差效果

## 5. 动效细节

- **鼠标跟随**：自定义光标，可能是一个小圆点 + 外圈，hover 到可交互元素时放大
- **项目卡片 hover**：图片有微妙的缩放或位移，可能带 clip-path 揭幕效果
- **页面过渡**：不是简单的淡入淡出，而是内容块的错位进出（staggered enter/exit）
- **滚动触发**：元素在进入视口时才出现，带有从下方滑入 + 淡入的组合动画
- **文字动画**：标题可能逐字/逐行出现（split text animation）

## 6. 颗粒/噪点纹理

这是整个网站最显著的视觉特征之一：
- 全局覆盖一层半透明的噪点纹理（CSS filter: grain 或 SVG feTurbulence）
- 给数字界面增加了"物理感"和"温度"
- 噪点是静态的（不是动态闪烁的胶片噪点）

## 7. 与彩虹桥的差距和建议

### 可以直接借鉴的
1. **颗粒纹理**：用 CSS `background-image` 叠加一层 noise.png 或 SVG feTurbulence，opacity 约 0.03-0.05
2. **开屏动画改进**：当前彩虹桥的开屏太快太简单。建议：纯黑 → 文字淡入（2s）→ 停留（1s）→ 星空渐显（2s）→ 内容揭幕（1s），总计约 6 秒
3. **字体层次**：标题用 Noto Serif SC（已有），但字号要更大胆（6-10vw），字重更细
4. **自定义光标**：小圆点 + 外圈，hover 时变大，用 CSS + JS 实现
5. **滚动动画**：元素进入视口时 translateY(30px) + opacity(0) → translateY(0) + opacity(1)，用 IntersectionObserver

### 气质差异（不需要改）
- Quentin 是作品集，内容密度高；彩虹桥是纪念空间，留白和静谧是对的
- Quentin 用项目卡片网格；彩虹桥用星空 + 纪念碑，交互逻辑不同
- 彩虹桥的星空背景本身就是一个很强的视觉元素，不需要模仿 Quentin 的暗色平面风格

### CSS 参考值
```css
/* 颗粒纹理 */
.grain-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('data:image/svg+xml,...'); /* SVG noise */
  opacity: 0.04;
  pointer-events: none;
  z-index: 9999;
}

/* 开屏动画时间曲线 */
.reveal {
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-duration: 1.5s;
}

/* 自定义光标 */
.cursor-dot {
  width: 8px; height: 8px;
  background: #fff;
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  transition: transform 0.15s ease;
  z-index: 10000;
}
.cursor-ring {
  width: 40px; height: 40px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease;
  z-index: 10000;
}

/* 滚动揭幕 */
.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 标题排版 */
.hero-title {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(3rem, 8vw, 10rem);
  font-weight: 300;
  letter-spacing: 0.05em;
  line-height: 1.1;
}
```
