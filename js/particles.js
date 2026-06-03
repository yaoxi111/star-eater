/**
 * 吞星者 Star Eater — 粒子系统（食物 & 敌人）
 */

/* ─── 食物粒子 ─── */
class FoodParticle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.radius = rand(3, 10);
    this.hue = rand(0, 360);
    this.speed = rand(15, 40);
    this.angle = rand(0, Math.PI * 2);
    this.pulsePhase = rand(0, Math.PI * 2);
    this.w = w;
    this.h = h;
  }

  update(dt) {
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;

    // 边缘反弹
    if (this.x < this.radius) { this.x = this.radius; this.angle = Math.PI - this.angle; }
    if (this.x > this.w - this.radius) { this.x = this.w - this.radius; this.angle = Math.PI - this.angle; }
    if (this.y < this.radius) { this.y = this.radius; this.angle = -this.angle; }
    if (this.y > this.h - this.radius) { this.y = this.h - this.radius; this.angle = -this.angle; }

    this.pulsePhase += dt * 3;
  }

  draw(ctx) {
    const pulse = Math.sin(this.pulsePhase) * 0.25 + 0.75;
    const r = this.radius * pulse;

    // 外层柔光
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = hsl(this.hue, 100, 60);
    ctx.fill();

    // 本体
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = hsl(this.hue, 100, 72);
    ctx.shadowBlur = 12;
    ctx.shadowColor = hsl(this.hue, 100, 60);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/* ─── 敌人粒子 ─── */
class EnemyParticle {
  constructor(x, y, radius, w, h) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.hue = rand(0, 35); // 红-橙色系
    this.speed = rand(30, 60);
    this.pulsePhase = rand(0, Math.PI * 2);
    this.w = w;
    this.h = h;
  }

  update(dt, px, py, pRadius) {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      const nx = dx / dist;
      const ny = dy / dist;

      if (this.radius > pRadius) {
        // 比玩家大 → 追击
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
      } else {
        // 比玩家小 → 逃跑
        this.x -= nx * this.speed * 0.6 * dt;
        this.y -= ny * this.speed * 0.6 * dt;
      }
    }

    // 保持在屏幕内
    this.x = clamp(this.x, this.radius, this.w - this.radius);
    this.y = clamp(this.y, this.radius, this.h - this.radius);

    this.pulsePhase += dt * 4;
  }

  draw(ctx) {
    const pulse = Math.sin(this.pulsePhase) * 0.12 + 0.88;
    const r = this.radius * pulse;

    // 外层警告光晕
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r + 10, 0, Math.PI * 2);
    ctx.fillStyle = hsl(this.hue, 100, 50);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 主体（渐变）
    const grad = ctx.createRadialGradient(
      this.x - r * 0.3, this.y - r * 0.3, 0,
      this.x, this.y, r
    );
    grad.addColorStop(0, hsl(this.hue, 90, 60));
    grad.addColorStop(1, hsl(this.hue, 100, 28));

    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowBlur = 22;
    ctx.shadowColor = hsl(this.hue, 100, 50);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/* ─── 粒子管理器 ─── */
class ParticleManager {
  constructor(w, h, config) {
    this.w = w;
    this.h = h;
    this.food = [];
    this.enemies = [];
    this.spawnTimer = 0;
    this.gameTime = 0;
    this.difficulty = 0;

    // 难度配置
    this.cfg = config || {
      enemySpawnInterval: 4.5,
      enemySpeedMin: 30,
      enemySpeedMax: 60,
      enemyRadiusMin: 16,
      enemyRadiusMax: 28,
      enemyInitial: 3,
      enemyMaxBase: 8,
      enemyMaxGrow: 2,
      enemySpeedGrow: 6,
      enemyRadiusGrow: 1.5,
      difficultyInterval: 12,
      foodCount: 70,
      foodTarget: 70,
    };

    this.spawnFood(this.cfg.foodCount);
    this.spawnEnemies(this.cfg.enemyInitial);
  }

  resize(w, h) { this.w = w; this.h = h; }

  spawnFood(count) {
    for (let i = 0; i < count; i++) {
      this.food.push(new FoodParticle(rand(50, this.w - 50), rand(50, this.h - 50), this.w, this.h));
    }
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      const side = randInt(0, 3);
      let x, y;
      if (side === 0) { x = -40; y = rand(0, this.h); }
      else if (side === 1) { x = this.w + 40; y = rand(0, this.h); }
      else if (side === 2) { x = rand(0, this.w); y = -40; }
      else { x = rand(0, this.w); y = this.h + 40; }

      const radius = rand(this.cfg.enemyRadiusMin, this.cfg.enemyRadiusMax) + this.difficulty * this.cfg.enemyRadiusGrow;
      const enemy = new EnemyParticle(x, y, radius, this.w, this.h);
      enemy.speed = rand(this.cfg.enemySpeedMin, this.cfg.enemySpeedMax);
      this.enemies.push(enemy);
    }
  }

  update(dt, player) {
    this.gameTime += dt;
    this.difficulty = Math.floor(this.gameTime / this.cfg.difficultyInterval);

    // 更新食物
    for (const f of this.food) f.update(dt);

    // 更新敌人
    for (const e of this.enemies) e.update(dt, player.x, player.y, player.radius);

    // 补充食物
    const target = this.cfg.foodTarget + this.difficulty * 3;
    while (this.food.length < target) {
      this.food.push(new FoodParticle(rand(0, this.w), rand(0, this.h), this.w, this.h));
    }

    // 定时生成敌人
    this.spawnTimer += dt;
    const interval = Math.max(1.5, this.cfg.enemySpawnInterval - this.difficulty * 0.2);
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      const maxE = this.cfg.enemyMaxBase + this.difficulty * this.cfg.enemyMaxGrow;
      if (this.enemies.length < maxE) this.spawnEnemies(1);
    }

    // 随时间提升敌人速度
    const speedCap = this.cfg.enemySpeedMax * 1.8;
    for (const e of this.enemies) {
      e.speed = Math.min(speedCap, this.cfg.enemySpeedMin + this.difficulty * this.cfg.enemySpeedGrow);
    }
  }

  checkFoodCollision(player) {
    for (let i = 0; i < this.food.length; i++) {
      const f = this.food[i];
      if (vec2Dist(f.x, f.y, player.x, player.y) < player.radius + f.radius) {
        this.food.splice(i, 1);
        return f;
      }
    }
    return null;
  }

  checkEnemyCollision(player) {
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (circlesCollide(e.x, e.y, e.radius, player.x, player.y, player.radius)) {
        if (player.radius > e.radius * 0.9) {
          this.enemies.splice(i, 1);
          return e; // 玩家吞噬敌人
        }
        return 'died'; // 敌人吞噬玩家
      }
    }
    return null;
  }

  draw(ctx) {
    for (const f of this.food) f.draw(ctx);
    for (const e of this.enemies) e.draw(ctx);
  }
}
