# 吞星者 Star Eater

一个视觉炸裂的跨平台休闲小游戏。

## 玩法

- **移动**：手机触屏拖拽 / 电脑鼠标移动
- **目标**：吞噬比你小的粒子来成长
- **躲避**：比你大的红色敌人会追杀你
- **连击**：快速连续吞噬获得 COMBO 加分

## 特性

- 🎮 纯 HTML5 Canvas，无需安装
- 📱 支持手机触屏 & 电脑鼠标
- 🌌 霓虹宇宙风格视觉特效
- ✨ 粒子爆炸、发光拖尾、屏幕震动
- 🏆 本地最高分记录
- ⚡ 难度随时间递增

## 运行

直接在浏览器中打开 `index.html` 即可。

或使用本地服务器：

```bash
npx serve .
# 然后打开 http://localhost:3000
```

## 部署到 GitHub Pages

1. 推送代码到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择 `main` 分支
4. 访问 `https://<username>.github.io/<repo>/`

## 技术栈

- HTML5 Canvas 2D
- 原生 JavaScript（零依赖）
- CSS3 动画

## 文件结构

```
star-eater/
├── index.html        # 入口
├── css/style.css     # UI 样式
├── js/
│   ├── utils.js      # 工具函数
│   ├── effects.js    # 视觉特效
│   ├── player.js     # 玩家
│   ├── particles.js  # 粒子系统
│   └── game.js       # 主逻辑
└── README.md
```
