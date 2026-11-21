// game.js — Twin Peeks state, input, scoring, timer and rendering.
//
// The game owns one canvas with two panels side by side. The left panel
// paints the scene's variant 0, the right paints variant 1. Clicking (or
// the keyboard crosshair) tests a point against the unfound differences;
// a hit rings both panels, a miss shakes the frame and costs 3 seconds.

import { SCENES, PANEL_W, PANEL_H } from './scenes.js';
import { SoundFX } from './audio.js';

export const GAP = 40; // pixels between the two panels on the canvas
export const CANVAS_W = PANEL_W * 2 + GAP;
export const CANVAS_H = PANEL_H;

const MISS_PENALTY_SECONDS = 3;
const HINTS_PER_LEVEL = 3;
const HIT_RADIUS_BONUS = 8; // forgiving hit zone around each difference

export class TwinPeeksGame {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui; // {levelName, timerFill, timerText, foundText, scoreText, hintText, ...}
    this.sfx = new SoundFX();
    this.screen = 'title'; // title | playing | levelDone | results | timeUp
    this.levelIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = SCENES[0].timeLimit;
    this.timeUsedTotal = 0;
    this.frozen = false; // screenshots freeze the timer
    this.crosshair = { panel: 0, x: PANEL_W / 2, y: PANEL_H / 2, visible: false };
    this.hover = null; // {panel, x, y} in scene coordinates
    this.pops = []; // {x, y, panel, born} ring pop animations
    this.missMarks = []; // {x, y, panel, born} red X flashes
    this.shakeUntil = 0;
    this.hintPulse = null; // {diff, until}
    this.lastTickSecond = -1;
    this.levelStats = []; // per-level {found, total, timeUsed, score}
    this.lastFoundLabel = '';
    this._lastFrame = 0;
  }

  scene() {
    return SCENES[this.levelIndex];
  }

  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.combo = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = this.scene().timeLimit;
    this.pops = [];
    this.missMarks = [];
    this.hintPulse = null;
    this.lastTickSecond = -1;
    this.lastFoundLabel = '';
    this.crosshair = { panel: 0, x: PANEL_W / 2, y: PANEL_H / 2, visible: false };
    this.screen = 'playing';
  }

  startGame() {
    this.score = 0;
    this.bestCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.timeUsedTotal = 0;
    this.levelStats = [];
    this.startLevel(0);
  }

  restartLevel() {
    this.startLevel(this.levelIndex);
  }

  // Convert a canvas pixel into {panel, x, y} scene coordinates.
  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const px = (clientX - rect.left) * (CANVAS_W / rect.width);
    const py = (clientY - rect.top) * (CANVAS_H / rect.height);
    if (py < 0 || py > PANEL_H) return null;
    if (px >= 0 && px < PANEL_W) return { panel: 0, x: px, y: py };
    if (px >= PANEL_W + GAP && px < CANVAS_W) {
      return { panel: 1, x: px - PANEL_W - GAP, y: py };
    }
    return null;
  }

  checkPoint(p) {
    if (this.screen !== 'playing' || !p) return;
    this.sfx.ensure();
    const scene = this.scene();
    for (let i = 0; i < scene.diffs.length; i++) {
      if (this.found.has(i)) continue;
      const d = scene.diffs[i];
      const dx = p.x - d.x;
      const dy = p.y - d.y;
      if (dx * dx + dy * dy <= (d.r + HIT_RADIUS_BONUS) * (d.r + HIT_RADIUS_BONUS)) {
        this.registerHit(i, d);
        return;
      }
    }
    this.registerMiss(p);
  }

  registerHit(index, diff) {
    const now = performance.now();
    this.found.add(index);
    this.hits += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const gained = 100 + (this.combo - 1) * 25;
    this.score += gained;
    this.lastFoundLabel = diff.label;
    this.pops.push({ x: diff.x, y: diff.y, r: diff.r, born: now });
    this.sfx.chime();
    if (this.found.size === this.scene().diffs.length) {
      this.completeLevel();
    }
  }

  registerMiss(p) {
    this.misses += 1;
    this.combo = 0;
    this.timeLeft = Math.max(0, this.timeLeft - MISS_PENALTY_SECONDS);
    this.missMarks.push({ x: p.x, y: p.y, panel: p.panel, born: performance.now() });
    this.shakeUntil = performance.now() + 260;
    this.sfx.thud();
  }

  useHint() {
    if (this.screen !== 'playing' || this.hintsLeft <= 0) return;
    const scene = this.scene();
    const remaining = scene.diffs.map((d, i) => i).filter((i) => !this.found.has(i));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.hintPulse = { diff: scene.diffs[pick], until: performance.now() + 1600 };
    this.sfx.blip();
  }

  completeLevel() {
    const scene = this.scene();
    const used = scene.timeLimit - Math.max(0, Math.ceil(this.timeLeft));
    this.timeUsedTotal += used;
    const timeBonus = Math.max(0, Math.ceil(this.timeLeft)) * 5;
    this.score += timeBonus;
    this.levelStats.push({ name: scene.name, found: this.found.size, total: scene.diffs.length, timeUsed: used, timeBonus });
    this.sfx.fanfare();
    this.screen = 'levelDone';
  }

  timeUp() {
    this.screen = 'timeUp';
    this.sfx.thud();
  }

  nextLevel() {
    if (this.levelIndex + 1 < SCENES.length) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.screen = 'results';
    }
  }

  moveCrosshair(dx, dy) {
    const c = this.crosshair;
    c.visible = true;
    c.x += dx;
    c.y += dy;
    if (c.x < 0) { c.x = 0; }
    if (c.x > PANEL_W) { c.x = PANEL_W; }
    if (c.y < 0) { c.y = 0; }
    if (c.y > PANEL_H) { c.y = PANEL_H; }
  }

  switchCrosshairPanel() {
    this.crosshair.panel = 1 - this.crosshair.panel;
    this.crosshair.visible = true;
  }

  accuracy() {
    const total = this.hits + this.misses;
    return total === 0 ? 100 : Math.round((this.hits / total) * 100);
  }

  update(dt) {
    if (this.screen === 'playing' && !this.frozen) {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (whole <= 10 && whole > 0 && whole !== this.lastTickSecond) {
        this.lastTickSecond = whole;
        this.sfx.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.timeUp();
      }
    }
    const now = performance.now();
    this.pops = this.pops.filter((p) => now - p.born < 700);
    this.missMarks = this.missMarks.filter((m) => now - m.born < 600);
    if (this.hintPulse && now > this.hintPulse.until) this.hintPulse = null;
  }

  draw() {
    const ctx = this.ctx;
    const now = performance.now();
    ctx.save();
    if (now < this.shakeUntil) {
      const mag = 5 * (1 - (this.shakeUntil - now) / 260);
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }
    ctx.clearRect(-10, -10, CANVAS_W + 20, CANVAS_H + 20);

    // Panel backdrops.
    ctx.fillStyle = '#fff8ea';
    ctx.fillRect(0, 0, PANEL_W, PANEL_H);
    ctx.fillRect(PANEL_W + GAP, 0, PANEL_W, PANEL_H);

    const scene = this.scene();
    ctx.save();
    scene.paint(ctx, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(PANEL_W + GAP, 0);
    scene.paint(ctx, 1);
    ctx.restore();

    // Panel frames.
    ctx.strokeStyle = '#4a3226';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, PANEL_W - 4, PANEL_H - 4);
    ctx.strokeRect(PANEL_W + GAP + 2, 2, PANEL_W - 4, PANEL_H - 4);

    // Found rings on both panels (gold, popping in).
    for (const i of this.found) {
      const d = scene.diffs[i];
      for (const ox of [0, PANEL_W + GAP]) {
        const pop = this.pops.find((p) => p.x === d.x && p.y === d.y);
        const age = pop ? (now - pop.born) / 700 : 1;
        const scale = age < 1 ? 1.35 - 0.35 * age : 1;
        const r = (d.r + 10) * scale;
        ctx.strokeStyle = '#d9a441';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(ox + d.x, d.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(217, 164, 65, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox + d.x, d.y, r + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Hint pulse: an expanding ring around one unfound difference.
    if (this.hintPulse) {
      const d = this.hintPulse.diff;
      const t = 1 - (this.hintPulse.until - now) / 1600;
      const pulse = (t % 0.5) / 0.5;
      for (const ox of [0, PANEL_W + GAP]) {
        ctx.strokeStyle = `rgba(47, 125, 109, ${0.9 - pulse * 0.6})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ox + d.x, d.y, d.r + 6 + pulse * 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Miss flashes: small red X where the player clicked wrong.
    for (const m of this.missMarks) {
      const age = (now - m.born) / 600;
      const ox = m.panel === 0 ? 0 : PANEL_W + GAP;
      ctx.strokeStyle = `rgba(200, 60, 40, ${1 - age})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const s = 10;
      ctx.beginPath();
      ctx.moveTo(ox + m.x - s, m.y - s);
      ctx.lineTo(ox + m.x + s, m.y + s);
      ctx.moveTo(ox + m.x + s, m.y - s);
      ctx.lineTo(ox + m.x - s, m.y + s);
      ctx.stroke();
    }

    // Hover magnifier ring (a gentle guide, never a giveaway).
    if (this.hover && this.screen === 'playing') {
      const ox = this.hover.panel === 0 ? 0 : PANEL_W + GAP;
      ctx.strokeStyle = 'rgba(74, 50, 38, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ox + this.hover.x, this.hover.y, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Keyboard crosshair.
    if (this.crosshair.visible && this.screen === 'playing') {
      const c = this.crosshair;
      const ox = c.panel === 0 ? 0 : PANEL_W + GAP;
      ctx.strokeStyle = '#2f7d6d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ox + c.x, c.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox + c.x - 24, c.y);
      ctx.lineTo(ox + c.x - 8, c.y);
      ctx.moveTo(ox + c.x + 8, c.y);
      ctx.lineTo(ox + c.x + 24, c.y);
      ctx.moveTo(ox + c.x, c.y - 24);
      ctx.lineTo(ox + c.x, c.y - 8);
      ctx.moveTo(ox + c.x, c.y + 8);
      ctx.lineTo(ox + c.x, c.y + 24);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- DOM readouts -------------------------------------------------------

  renderHud() {
    const scene = this.scene();
    const total = scene.diffs.length;
    const secs = Math.max(0, Math.ceil(this.timeLeft));
    const pct = Math.max(0, Math.min(100, (this.timeLeft / scene.timeLimit) * 100));
    this.ui.timerFill.style.width = pct + '%';
    this.ui.timerFill.style.background = pct > 50 ? '#5d9b4a' : pct > 25 ? '#d9a441' : '#c0392b';
    this.ui.timerText.textContent = `${secs}s`;
    this.ui.foundText.textContent = `Found ${this.found.size}/${total}`;
    this.ui.scoreText.textContent = `Score ${this.score}`;
    this.ui.levelName.textContent = `Level ${this.levelIndex + 1} · ${scene.name}`;
    this.ui.hintText.textContent = `Hint (${this.hintsLeft})`;
    this.ui.hintButton.disabled = this.hintsLeft <= 0 || this.screen !== 'playing';
    this.ui.foundLabel.textContent = this.lastFoundLabel ? `✓ ${this.lastFoundLabel}` : scene.tagline;
  }

  frame(now) {
    const dt = Math.min(0.1, (now - this._lastFrame) / 1000 || 0);
    this._lastFrame = now;
    this.update(dt);
    this.draw();
    this.renderHud();
  }
}
