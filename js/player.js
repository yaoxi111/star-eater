/**
 * 吞星者 Star Eater — 玩家
 */

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.baseRadius = 18;
    this.radius = this.baseRadius;
    this.hue = 185; // 青色
    this.alive = true;
    this.pulsePhase = 0;
    this.growFlash = 0;

    // 拖尾
    this.trail = [];
    this.maxTrail = 25;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update(dt) {
    // 平滑跟随
    this.x = lerp(this.x, this.targetX, 0.12);
    this.y = lerp(this.y, this.targetY, 0.12);

    // 脉冲
    this.pulsePhase += dt * 3;
    this.radius = this.baseRadius + Math.sin(this.pulsePhase) * 2;

    // 成长闪光
    if (this.growFlash > 0) {
      this.growFlash = Math.max(0, this.growFlash - dt * 4);
      this.radius += this.growFlash * 12;
    }

    // 根据大小改变颜色：青 → 绿 → 金
    if (this.baseRadius < 35) {
      this.hue = 185;
    } else if (this.baseRadius < 60) {
      this.hue = lerp(185, 140, (this.baseRadius - 35) / 25);
    } else {
      this.hue = lerp(140, 50, Math.min(1, (this.baseRadius - 60) / 40));
    }

    // 拖尾
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.pop();
  }

  grow(amount) {
    // 越大成长越慢
    const factor = Math.max(0.3, 1 - this.baseRadius / 120);
    this.baseRadius += amount * factor;
    this.growFlash = 1;
  }

  draw(ctx) {
    // ── 拖尾 ──
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const t = this.trail[i];
      const ratio = 1 - i / this.trail.length;
      const r = this.baseRadius * ratio * 0.6;
      ctx.globalAlpha = ratio * 0.25;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fillStyle = hsl(this.hue, 100, 70);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── 外层光晕 ──
    for (let i = 4; i >= 0; i--) {
      const r = this.radius + i * 10;
      ctx.globalAlpha = 0.06 - i * 0.01;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = hsl(this.hue, 100, 65);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── 主体（径向渐变） ──
    const grad = ctx.createRadialGradient(
      this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
      this.x, this.y, this.radius
    );
    grad.addColorStop(0, hsl(this.hue, 80, 95));
    grad.addColorStop(0.3, hsl(this.hue, 100, 75));
    grad.addColorStop(1, hsl(this.hue, 100, 50));

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowBlur = 35;
    ctx.shadowColor = hsl(this.hue, 100, 60);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── 高光点 ──
    ctx.beginPath();
    ctx.arc(
      this.x - this.radius * 0.25,
      this.y - this.radius * 0.25,
      this.radius * 0.25,
      0, Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();
  }
}
