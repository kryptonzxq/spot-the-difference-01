// main.js — boot and wiring for Twin Peeks.
//
// Builds the game, wires the DOM buttons, keyboard and canvas input, shows
// and hides the overlays, and runs the frame loop. A ?shot= query param
// jumps straight into a deterministic showcase state (see shots.js).

import { TwinPeeksGame, CANVAS_W, CANVAS_H } from './game.js';
import { SCENES } from './scenes.js';
import { applyShot } from './shots.js';

const $ = (id) => document.getElementById(id);

const canvas = $('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const ui = {
  levelName: $('level-name'),
  timerFill: $('timer-fill'),
  timerText: $('timer-text'),
  foundText: $('found-text'),
  scoreText: $('score-text'),
  hintText: $('hint-label'),
  hintButton: $('hint-btn'),
  foundLabel: $('found-label'),
};

const game = new TwinPeeksGame(canvas, ui);

const overlays = {
  title: $('title-overlay'),
  level: $('level-overlay'),
  results: $('results-overlay'),
  time: $('time-overlay'),
};

function showOverlay(name) {
  for (const [key, el] of Object.entries(overlays)) {
    el.classList.toggle('hidden', key !== name);
  }
}

function refreshOverlays() {
  if (game.screen === 'title') {
    showOverlay('title');
  } else if (game.screen === 'levelDone') {
    const stat = game.levelStats[game.levelStats.length - 1];
    $('level-done-title').textContent = `${stat.name} complete!`;
    $('level-done-detail').textContent =
      `You found all ${stat.found} differences in ${stat.timeUsed}s · time bonus +${stat.timeBonus}`;
    $('next-btn').textContent =
      game.levelIndex + 1 < SCENES.length ? 'Next level (N)' : 'See results (N)';
    showOverlay('level');
  } else if (game.screen === 'results') {
    $('final-score').textContent = game.score;
    $('final-time').textContent = `${game.timeUsedTotal}s`;
    $('final-accuracy').textContent = `${game.accuracy()}%`;
    $('final-combo').textContent = `×${game.bestCombo}`;
    $('results-lines').innerHTML = game.levelStats
      .map((s) => `<li><span>${s.name}</span><span>${s.found}/${s.total} · ${s.timeUsed}s · +${s.timeBonus}</span></li>`)
      .join('');
    showOverlay('results');
  } else if (game.screen === 'timeUp') {
    $('timeup-detail').textContent =
      `Time ran out on ${game.scene().name} with ${game.found.size} of ${game.scene().diffs.length} found.`;
    showOverlay('time');
  } else {
    showOverlay(null);
  }
}

// ---- buttons ---------------------------------------------------------------

$('start-btn').addEventListener('click', () => {
  game.sfx.ensure();
  game.sfx.blip();
  game.startGame();
  refreshOverlays();
});

$('next-btn').addEventListener('click', () => {
  game.sfx.blip();
  game.nextLevel();
  refreshOverlays();
});

$('again-btn').addEventListener('click', () => {
  game.sfx.blip();
  game.startGame();
  refreshOverlays();
});

$('retry-btn').addEventListener('click', () => {
  game.sfx.blip();
  game.restartLevel();
  refreshOverlays();
});

$('restart-btn').addEventListener('click', () => {
  game.sfx.blip();
  game.restartLevel();
  refreshOverlays();
});

$('hint-btn').addEventListener('click', () => {
  game.useHint();
});

$('sound-btn').addEventListener('click', () => {
  game.sfx.ensure();
  const muted = !game.sfx.muted;
  game.sfx.setMuted(muted);
  $('sound-btn').textContent = muted ? '🔇 Muted' : '🔊 Sound';
  if (!muted) game.sfx.blip();
});

// ---- canvas input ----------------------------------------------------------

canvas.addEventListener('click', (e) => {
  game.checkPoint(game.pick(e.clientX, e.clientY));
  refreshOverlays();
});

canvas.addEventListener('mousemove', (e) => {
  game.hover = game.pick(e.clientX, e.clientY);
});

canvas.addEventListener('mouseleave', () => {
  game.hover = null;
});

// ---- keyboard --------------------------------------------------------------

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (game.screen !== 'playing') return;
    const step = e.shiftKey ? 4 : 14;
    if (e.key === 'ArrowLeft') game.moveCrosshair(-step, 0);
    if (e.key === 'ArrowRight') game.moveCrosshair(step, 0);
    if (e.key === 'ArrowUp') game.moveCrosshair(0, -step);
    if (e.key === 'ArrowDown') game.moveCrosshair(0, step);
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    if (game.screen === 'playing') game.switchCrosshairPanel();
    return;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (game.screen === 'playing' && game.crosshair.visible) {
      game.checkPoint({ panel: game.crosshair.panel, x: game.crosshair.x, y: game.crosshair.y });
      refreshOverlays();
    } else if (game.screen === 'title') {
      $('start-btn').click();
    } else if (game.screen === 'levelDone') {
      $('next-btn').click();
    } else if (game.screen === 'results' || game.screen === 'timeUp') {
      $('again-btn').click();
    }
    return;
  }
  const key = e.key.toLowerCase();
  if (key === 'h') game.useHint();
  if (key === 'n' && (game.screen === 'levelDone')) $('next-btn').click();
  if (key === 'r' && game.screen === 'playing') {
    game.restartLevel();
    refreshOverlays();
  }
  if (key === 'm') $('sound-btn').click();
});

// ---- boot ------------------------------------------------------------------

const params = new URLSearchParams(window.location.search);
const shotMode = applyShot(game, params);
if (!shotMode) {
  game.screen = 'title';
}
refreshOverlays();

function loop(now) {
  game.frame(now);
  refreshOverlays();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
