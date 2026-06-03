/**
 * 吞星者 Star Eater — 工具函数
 */

// 向量运算
function vec2Dist(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

function vec2Normalize(x, y) {
  const len = Math.sqrt(x * x + y * y);
  return len > 0 ? { x: x / len, y: y / len } : { x: 0, y: 0 };
}

// 碰撞检测（圆与圆）
function circlesCollide(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy < (r1 + r2) * (r1 + r2);
}

// 随机数
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

// 插值 & 缓动
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// HSL 颜色字符串
function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hsla(h, s, l, a) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}
