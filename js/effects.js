/**
 * 吞星者 Star Eater — 视觉特效
 */

/* ─── 粒子爆炸 ─── */
class ParticleEffect {
  constructor(x, y, hue, count) {
    this.particles = [];
    this.alive = true;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(80, 280);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: rand(1.5, 4),
        alpha: 1,
        life: rand(0.3, 0.8),
        maxLife: 0,
        hue
      });
      this.particles[i].maxLife = this.particles[i].life;
    }
  }

  update(dt) {
    let anyAlive = false;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= dt;
      p.alpha = clamp(p.life / p.maxLife, 0, 1);
      if (p.life > 0) anyAlive = true;
    }
    this.alive = anyAlive;
  }

  draw(ctx) {
    for (const p of this.particles) {
      if (p.alpha <= 0) continue;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = hsl(p.hue, 100, 70);
      ctx.shadowBlur = 12;
      ctx.shadowColor = hsl(p.hue, 100, 60);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

/* ─── 浮动文字（得分弹出） ─── */
class FloatingText {
  constructor(x, y, text, hue) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.hue = hue;
    this.alpha = 1;
    this.scale = 0.5;
    this.alive = true;
    this.life = 1;
  }

  update(dt) {
    this.y -= 60 * dt;
    this.life -= dt;
    this.alpha = clamp(this.life, 0, 1);
    this.scale = lerp(0.5, 1.5, 1 - this.life);
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.globalAlpha = this.alpha;
    ctx.font = `bold ${Math.floor(18 * this.scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = hsl(this.hue, 100, 85);
    ctx.shadowBlur = 8;
    ctx.shadowColor = hsl(this.hue, 100, 60);
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

/* ─── 屏幕震动 ─── */
class ScreenShake {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.intensity = 0;
    this.timer = 0;
  }

  trigger(intensity, duration) {
    this.intensity = intensity;
    this.timer = duration;
  }

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      this.x = (Math.random() - 0.5) * this.intensity * 2;
      this.y = (Math.random() - 0.5) * this.intensity * 2;
      this.intensity *= 0.92;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }
}

/* ─── 星空背景 ─── */
class Background {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.nebulae = [];
    this._init();
  }

  _init() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 2500);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: rand(0.5, 2.5),
        brightness: rand(0.4, 1),
        speed: rand(0.5, 2),
        phase: Math.random() * Math.PI * 2
      });
    }

    this.nebulae = [];
    for (let i = 0; i < 4; i++) {
      this.nebulae.push({
        x: rand(0, this.width),
        y: rand(0, this.height),
        radius: rand(150, 350),
        hue: rand(200, 300),
        alpha: rand(0.015, 0.04)
      });
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this._init();
  }

  update(dt) {
    for (const s of this.stars) {
      s.phase += dt * s.speed;
    }
  }

  draw(ctx) {
    // 背景渐变
    const grad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.75
    );
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(1, '#000005');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 星云
    for (const n of this.nebulae) {
      const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
      ng.addColorStop(0, hsla(n.hue, 70, 50, n.alpha));
      ng.addColorStop(1, 'transparent');
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 星星
    for (const s of this.stars) {
      const twinkle = Math.sin(s.phase) * 0.3 + 0.7;
      ctx.globalAlpha = s.brightness * twinkle;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
