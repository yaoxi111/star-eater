/**
 * 吞星者 Star Eater — 主游戏逻辑
 */

/* ─── 难度配置（10倍系数） ─── */
const DIFFICULTY = {
  easy: {
    label: '小登',
    enemySpawnInterval: 2,     // 生成间隔（秒）
    enemySpeedMin: 60,
    enemySpeedMax: 120,
    enemyRadiusMin: 22,
    enemyRadiusMax: 35,
    enemyInitial: 6,           // 初始敌人数量
    enemyMaxBase: 15,          // 最大敌人基数
    enemyMaxGrow: 3,           // 每级增加的最大敌人
    enemySpeedGrow: 15,        // 每级速度增长
    enemyRadiusGrow: 3,        // 每级体型增长
    difficultyInterval: 6,     // 难度提升间隔（秒）
    foodCount: 25,
    foodTarget: 25,
  },
  medium: {
    label: '中登',
    enemySpawnInterval: 1.5,
    enemySpeedMin: 90,
    enemySpeedMax: 180,
    enemyRadiusMin: 25,
    enemyRadiusMax: 45,
    enemyInitial: 10,
    enemyMaxBase: 25,
    enemyMaxGrow: 6,
    enemySpeedGrow: 20,
    enemyRadiusGrow: 4,
    difficultyInterval: 4,
    foodCount: 20,
    foodTarget: 20,
  },
  hard: {
    label: '老登',
    enemySpawnInterval: 1,
    enemySpeedMin: 120,
    enemySpeedMax: 250,
    enemyRadiusMin: 30,
    enemyRadiusMax: 55,
    enemyInitial: 15,
    enemyMaxBase: 35,
    enemyMaxGrow: 8,
    enemySpeedGrow: 30,
    enemyRadiusGrow: 5,
    difficultyInterval: 3,
    foodCount: 15,
    foodTarget: 15,
  },
  asian: {
    label: '亚洲',
    enemySpawnInterval: 0.8,
    enemySpeedMin: 150,
    enemySpeedMax: 350,
    enemyRadiusMin: 35,
    enemyRadiusMax: 70,
    enemyInitial: 20,
    enemyMaxBase: 50,
    enemyMaxGrow: 10,
    enemySpeedGrow: 40,
    enemyRadiusGrow: 7,
    difficultyInterval: 2,
    foodCount: 10,
    foodTarget: 10,
  }
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'MENU';
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    // 游戏对象
    this.player = null;
    this.particles = null;
    this.effects = [];
    this.background = null;
    this.shake = new ScreenShake();
    this.currentDifficulty = null;

    // 统计
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.foodEaten = 0;
    this.enemiesEaten = 0;
    this.startTime = 0;
    this.highScore = parseInt(localStorage.getItem('starEaterHS')) || 0;

    // 时间
    this.lastTime = 0;

    // 输入
    this.inputX = 0;
    this.inputY = 0;
    this.hasInput = false;

    // 菜单演示粒子
    this.demoFood = [];

    // DOM
    this.menuEl = document.getElementById('menu');
    this.hudEl = document.getElementById('hud');
    this.scoreEl = document.getElementById('score');
    this.comboEl = document.getElementById('combo');
    this.gameoverEl = document.getElementById('gameover');
    this.finalScoreEl = document.getElementById('final-score');
    this.highScoreEl = document.getElementById('high-score');
    this.statsEl = document.getElementById('stats');
  }

  /* ─── 初始化 ─── */
  init() {
    this._resize();
    this.background = new Background(this.width, this.height);
    this._initDemoFood();
    this._setupInput();
    this.showMenu();
    requestAnimationFrame(this._loop.bind(this));
  }

  _initDemoFood() {
    this.demoFood = [];
    for (let i = 0; i < 50; i++) {
      this.demoFood.push(new FoodParticle(rand(0, this.width), rand(0, this.height), this.width, this.height));
    }
  }

  /* ─── 输入 ─── */
  _setupInput() {
    window.addEventListener('mousemove', e => {
      this.inputX = e.clientX;
      this.inputY = e.clientY;
      this.hasInput = true;
    });

    window.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      this.inputX = t.clientX;
      this.inputY = t.clientY;
      this.hasInput = true;
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0];
      this.inputX = t.clientX;
      this.inputY = t.clientY;
    }, { passive: false });

    window.addEventListener('resize', () => this._resize());

    // 难度选择按钮
    document.querySelectorAll('.diff-btn[data-diff]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const diff = btn.getAttribute('data-diff');
        if (DIFFICULTY[diff]) this.startGame(diff);
      });
    });

    // 游戏结束按钮
    document.getElementById('btn-restart').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentDifficulty) this.startGame(this.currentDifficulty);
    });

    document.getElementById('btn-back-menu').addEventListener('click', (e) => {
      e.stopPropagation();
      this.showMenu();
    });
  }

  /* ─── 屏幕适配 ─── */
  _resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.background) this.background.resize(this.width, this.height);
  }

  /* ─── 状态切换 ─── */
  showMenu() {
    this.state = 'MENU';
    this.menuEl.classList.remove('hidden');
    this.menuEl.classList.add('interactive');
    this.hudEl.classList.add('hidden');
    this.gameoverEl.classList.add('hidden');
    this.gameoverEl.classList.remove('interactive');
  }

  startGame(diffKey) {
    this.state = 'PLAYING';
    this.currentDifficulty = diffKey;
    this.menuEl.classList.add('hidden');
    this.menuEl.classList.remove('interactive');
    this.hudEl.classList.remove('hidden');
    this.gameoverEl.classList.add('hidden');
    this.gameoverEl.classList.remove('interactive');

    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.foodEaten = 0;
    this.enemiesEaten = 0;
    this.startTime = Date.now();
    this.effects = [];

    this.player = new Player(this.width / 2, this.height / 2);
    this.inputX = this.width / 2;
    this.inputY = this.height / 2;
    this.particles = new ParticleManager(this.width, this.height, DIFFICULTY[diffKey]);
    this._updateHUD();
  }

  endGame() {
    this.state = 'GAMEOVER';

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('starEaterHS', this.highScore);
    }

    const secs = Math.floor((Date.now() - this.startTime) / 1000);
    const diffLabel = this.currentDifficulty ? DIFFICULTY[this.currentDifficulty].label : '';
    this.hudEl.classList.add('hidden');
    this.gameoverEl.classList.remove('hidden');
    this.gameoverEl.classList.add('interactive');
    this.finalScoreEl.textContent = this.score;
    this.highScoreEl.textContent = '最高分: ' + this.highScore;
    this.statsEl.innerHTML =
      '难度: ' + diffLabel +
      ' &nbsp;|&nbsp; 食物: ' + this.foodEaten +
      ' &nbsp;|&nbsp; 敌人: ' + this.enemiesEaten +
      '<br>最高连击: ' + this.maxCombo + 'x &nbsp;|&nbsp; 存活: ' + secs + '秒';
  }

  /* ─── HUD ─── */
  _updateHUD() {
    this.scoreEl.textContent = this.score;
    if (this.combo > 1) {
      this.comboEl.classList.remove('hidden');
      this.comboEl.textContent = 'COMBO x' + this.combo;
      this.comboEl.style.transform = 'scale(' + (1 + this.combo * 0.05) + ')';
    } else {
      this.comboEl.classList.add('hidden');
    }
  }

  /* ─── 得分 & 连击 ─── */
  _addScore(base) {
    this.score += base * this.combo;
  }

  _addCombo() {
    this.combo = Math.min(10, this.combo + 1);
    this.comboTimer = 2;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
  }

  /* ─── 更新 ─── */
  _update(dt) {
    // 背景始终更新
    this.background.update(dt);

    if (this.state === 'MENU') {
      for (const f of this.demoFood) f.update(dt);
      return;
    }

    // 特效 & 震动（PLAYING & GAMEOVER 都更新）
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].update(dt);
      if (!this.effects[i].alive) this.effects.splice(i, 1);
    }
    this.shake.update(dt);

    if (this.state !== 'PLAYING') return;
    if (!this.player.alive) return;

    // 玩家
    if (this.hasInput) this.player.setTarget(this.inputX, this.inputY);
    this.player.update(dt);

    // 粒子
    this.particles.update(dt, this.player);

    // 食物碰撞
    const food = this.particles.checkFoodCollision(this.player);
    if (food) {
      this.foodEaten++;
      this.player.grow(food.radius * 0.13);
      this._addCombo();
      this._addScore(10);
      this.effects.push(new ParticleEffect(food.x, food.y, food.hue, 8));
      this.effects.push(new FloatingText(food.x, food.y - 15, '+' + 10 * this.combo, food.hue));
    }

    // 敌人碰撞
    const enemy = this.particles.checkEnemyCollision(this.player);
    if (enemy === 'died') {
      this.player.alive = false;
      this.effects.push(new ParticleEffect(this.player.x, this.player.y, this.player.hue, 35));
      this.shake.trigger(18, 0.5);
      setTimeout(() => this.endGame(), 600);
    } else if (enemy) {
      this.enemiesEaten++;
      this.player.grow(enemy.radius * 0.16);
      this._addCombo();
      this._addScore(50);
      this.effects.push(new ParticleEffect(enemy.x, enemy.y, enemy.hue, 22));
      this.effects.push(new FloatingText(enemy.x, enemy.y - 25, '+' + 50 * this.combo, enemy.hue));
      this.shake.trigger(8, 0.25);
    }

    // 连击计时
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    this._updateHUD();
  }

  /* ─── 绘制 ─── */
  _draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.shake.x, this.shake.y);

    this.background.draw(ctx);

    if (this.state === 'MENU') {
      for (const f of this.demoFood) f.draw(ctx);
    }

    if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
      this.particles.draw(ctx);
      for (const fx of this.effects) fx.draw(ctx);
      if (this.player && this.player.alive) this.player.draw(ctx);
    }

    ctx.restore();
  }

  /* ─── 主循环 ─── */
  _loop(ts) {
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this._update(dt);
    this._draw();

    requestAnimationFrame(this._loop.bind(this));
  }
}

/* ─── 启动 ─── */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  new Game(canvas).init();
});
