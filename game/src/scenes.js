// scenes.js — the three hand-drawn storybook scenes of Twin Peeks.
//
// Every scene is painted twice by one deterministic painter: the left panel
// paints variant 0 (the original) and the right panel paints variant 1 (the
// twin). A "difference" is a small, fair change between the two variants:
// visible when you look closely, never a glare. Each difference lists its
// hit zone (x, y, r) in the scene's own 600 x 440 coordinate space, plus a
// short label shown when it is found.
//
// No randomness anywhere: the same scene always paints the same pixels.

export const PANEL_W = 600;
export const PANEL_H = 440;

// ---- tiny drawing helpers -------------------------------------------------

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function cloud(ctx, x, y, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 24 * s, y - 8 * s, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 48 * s, y, 20 * s, 0, Math.PI * 2);
  ctx.arc(x + 24 * s, y + 8 * s, 18 * s, 0, Math.PI * 2);
  ctx.fill();
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function flower(ctx, x, y, petal, center) {
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    ellipse(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 7, 7, petal);
  }
  circle(ctx, x, y, 6, center);
}

function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 8 * s, x + 12 * s, y);
  ctx.stroke();
}

function butterfly(ctx, x, y, s, wing) {
  ctx.fillStyle = wing;
  ctx.beginPath();
  ctx.ellipse(x - 8 * s, y - 6 * s, 9 * s, 7 * s, -0.5, 0, Math.PI * 2);
  ctx.ellipse(x + 8 * s, y - 6 * s, 9 * s, 7 * s, 0.5, 0, Math.PI * 2);
  ctx.ellipse(x - 7 * s, y + 6 * s, 7 * s, 5 * s, 0.5, 0, Math.PI * 2);
  ctx.ellipse(x + 7 * s, y + 6 * s, 7 * s, 5 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a3226';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 8 * s);
  ctx.lineTo(x, y + 8 * s);
  ctx.stroke();
}

// ---- Scene 1: Sunny Park --------------------------------------------------

function paintPark(ctx, v) {
  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#8ec9e8');
  sky.addColorStop(0.55, '#cfeef7');
  sky.addColorStop(1, '#fdf3d0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 440);

  // Sun with rays (variant 1 has fewer rays).
  const rays = v === 0 ? 12 : 8;
  ctx.strokeStyle = '#f7b733';
  ctx.lineWidth = 5;
  for (let i = 0; i < rays; i++) {
    const a = (i * Math.PI * 2) / rays;
    line(ctx, 520 + Math.cos(a) * 34, 70 + Math.sin(a) * 34,
      520 + Math.cos(a) * 48, 70 + Math.sin(a) * 48, '#f7b733', 5);
  }
  circle(ctx, 520, 70, 30, '#ffd94d');
  circle(ctx, 512, 66, 4, '#7a5a12');
  circle(ctx, 528, 66, 4, '#7a5a12');
  ctx.strokeStyle = '#7a5a12';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(520, 74, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Clouds (variant 1: the middle cloud is smaller).
  cloud(ctx, 90, 60, 1, '#ffffff');
  cloud(ctx, 250, 48, v === 0 ? 0.9 : 0.55, '#ffffff');
  cloud(ctx, 420, 130, 0.7, '#f4fbff');

  // Bird (variant 1: the bird is gone).
  if (v === 0) bird(ctx, 150, 92, 1, '#3d4a5c');

  // Kite with a tail (variant 1: the tail bow is missing).
  poly(ctx, [[430, 130], [470, 160], [430, 190], [398, 158]], '#e4572e');
  line(ctx, 430, 190, 430, 226, '#7a5a12', 2);
  if (v === 0) {
    poly(ctx, [[424, 200], [436, 200], [430, 212]], '#f2c14e');
    poly(ctx, [[424, 216], [436, 216], [430, 228]], '#2f7d6d');
  }

  // Hills.
  ctx.fillStyle = '#8fbf6f';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(150, 240, 320, 300);
  ctx.quadraticCurveTo(470, 350, 600, 295);
  ctx.lineTo(600, 440);
  ctx.lineTo(0, 440);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7aab5e';
  ctx.beginPath();
  ctx.moveTo(0, 350);
  ctx.quadraticCurveTo(200, 300, 420, 350);
  ctx.quadraticCurveTo(520, 372, 600, 348);
  ctx.lineTo(600, 440);
  ctx.lineTo(0, 440);
  ctx.closePath();
  ctx.fill();

  // Path.
  ctx.fillStyle = '#e8d3a8';
  ctx.beginPath();
  ctx.moveTo(260, 440);
  ctx.quadraticCurveTo(290, 360, 280, 300);
  ctx.lineTo(330, 300);
  ctx.quadraticCurveTo(345, 360, 380, 440);
  ctx.closePath();
  ctx.fill();

  // Big tree on the left.
  rect(ctx, 78, 210, 16, 110, '#8a5a33');
  circle(ctx, 86, 190, 58, '#5d9b4a');
  circle(ctx, 48, 220, 38, '#6fae56');
  circle(ctx, 126, 222, 40, '#6fae56');
  circle(ctx, 86, 158, 34, '#7cbd63');
  circle(ctx, 66, 176, 10, '#e4572e');
  circle(ctx, 108, 200, 10, '#e4572e');
  circle(ctx, 90, 150, 9, '#e4572e');

  // Bench (variant 1: the middle slat is missing).
  rect(ctx, 300, 296, 110, 10, '#a9713f');
  if (v === 0) rect(ctx, 300, 312, 110, 10, '#a9713f');
  rect(ctx, 300, 328, 110, 10, '#a9713f');
  rect(ctx, 306, 338, 10, 34, '#7a4e26');
  rect(ctx, 394, 338, 10, 34, '#7a4e26');
  rect(ctx, 300, 282, 10, 46, '#a9713f');
  rect(ctx, 400, 282, 10, 46, '#a9713f');

  // Flowers along the bottom.
  flower(ctx, 60, 400, '#e4572e', '#ffd94d');
  flower(ctx, 130, 414, '#f2a541', '#7a4e26');
  flower(ctx, 200, 398, '#e4572e', '#ffd94d');
  flower(ctx, 470, 408, '#d96a8b', '#ffd94d');
  flower(ctx, 540, 396, '#e4572e', '#ffd94d');
  // One flower changes colour (variant 1: blue instead of red).
  flower(ctx, 92, 372, v === 0 ? '#e4572e' : '#4a7fd6', '#ffd94d');

  // Butterfly (variant 1: an extra butterfly appears).
  butterfly(ctx, 250, 250, 0.9, '#f2a541');
  if (v === 1) butterfly(ctx, 480, 330, 0.9, '#7fb3d5');

  // Grass tufts.
  ctx.strokeStyle = '#4e8a3a';
  ctx.lineWidth = 2;
  for (const [gx, gy] of [[40, 430], [170, 428], [440, 428], [560, 424], [320, 420]]) {
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx - 5, gy - 12);
    ctx.moveTo(gx + 4, gy);
    ctx.lineTo(gx + 8, gy - 11);
    ctx.stroke();
  }
}

// ---- Scene 2: Moonlit Beach ----------------------------------------------

function paintBeach(ctx, v) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#101d42');
  sky.addColorStop(0.5, '#1d3260');
  sky.addColorStop(1, '#2c4a6e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 440);

  // Stars (variant 1: one extra star).
  const stars = [[60, 40, 3], [150, 80, 2], [210, 30, 3], [330, 60, 2], [400, 40, 3],
    [460, 90, 2], [90, 130, 2], [270, 110, 2], [540, 30, 2], [180, 150, 2]];
  for (const [sx, sy, sr] of stars) star(ctx, sx, sy, sr, '#ffe9a8');
  if (v === 1) star(ctx, 120, 52, 3, '#ffe9a8');

  // Moon with craters (variant 1: one crater missing).
  circle(ctx, 500, 62, 34, '#f6ead0');
  circle(ctx, 488, 52, 7, '#d9c9a3');
  circle(ctx, 512, 70, 5, '#d9c9a3');
  if (v === 0) circle(ctx, 502, 46, 4, '#d9c9a3');

  // Sea.
  ctx.fillStyle = '#1f4d6b';
  ctx.fillRect(0, 210, 600, 130);
  ctx.strokeStyle = '#7fb3d5';
  ctx.lineWidth = 3;
  for (const wy of [232, 258, 284]) {
    ctx.beginPath();
    for (let x = 0; x <= 600; x += 20) {
      const y = wy + Math.sin((x + wy * 3) / 40) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // One wave line is missing in variant 1.
  if (v === 0) {
    ctx.beginPath();
    for (let x = 0; x <= 600; x += 20) {
      const y = 312 + Math.sin((x + 900) / 40) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Moonlight path on the water.
  ctx.fillStyle = 'rgba(246, 234, 208, 0.35)';
  ctx.beginPath();
  ctx.moveTo(470, 210);
  ctx.lineTo(530, 210);
  ctx.lineTo(560, 340);
  ctx.lineTo(440, 340);
  ctx.closePath();
  ctx.fill();

  // Boat with a sail (variant 1: the sail is red).
  poly(ctx, [[470, 190], [470, 250], [520, 250]], v === 0 ? '#fdf6e3' : '#d94f3d');
  poly(ctx, [[462, 200], [462, 250], [430, 250]], '#f2e3c2');
  line(ctx, 468, 180, 468, 252, '#7a5a12', 3);
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(420, 250);
  ctx.lineTo(530, 250);
  ctx.lineTo(510, 268);
  ctx.lineTo(440, 268);
  ctx.closePath();
  ctx.fill();

  // Sand.
  ctx.fillStyle = '#e8d3a8';
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.quadraticCurveTo(200, 320, 400, 342);
  ctx.quadraticCurveTo(520, 356, 600, 338);
  ctx.lineTo(600, 440);
  ctx.lineTo(0, 440);
  ctx.closePath();
  ctx.fill();

  // Palm tree (variant 1: one coconut fewer).
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(90, 360);
  ctx.quadraticCurveTo(80, 260, 95, 185);
  ctx.stroke();
  ctx.strokeStyle = '#2f7d4a';
  ctx.lineWidth = 7;
  for (const [dx, dy, ex, ey] of [[-2, -4, -52, -30], [2, -6, 48, -34], [-4, 2, -46, 14], [4, 0, 50, 8], [0, -8, -8, -46], [0, -8, 14, -44]]) {
    ctx.beginPath();
    ctx.moveTo(95 + dx * 2, 185 + dy * 2);
    ctx.quadraticCurveTo(95 + dx * 4, 185 + dy * 4, 95 + ex, 185 + ey);
    ctx.stroke();
  }
  circle(ctx, 88, 192, 8, '#6b4a1f');
  circle(ctx, 102, 196, 8, '#6b4a1f');
  if (v === 0) circle(ctx, 95, 204, 8, '#6b4a1f');

  // Crab (variant 1: the crab is gone).
  if (v === 0) {
    ellipse(ctx, 200, 392, 18, 12, '#d94f3d');
    circle(ctx, 186, 382, 4, '#2b2b2b');
    circle(ctx, 214, 382, 4, '#2b2b2b');
    line(ctx, 184, 396, 168, 404, '#d94f3d', 3);
    line(ctx, 216, 396, 232, 404, '#d94f3d', 3);
    line(ctx, 184, 400, 170, 408, '#d94f3d', 3);
    line(ctx, 216, 400, 230, 408, '#d94f3d', 3);
  }

  // Shells (one changes colour: pink -> orange).
  ellipse(ctx, 320, 402, 14, 10, v === 0 ? '#e89bb0' : '#f2a541');
  line(ctx, 312, 394, 312, 410, '#c97e93', 1.5);
  line(ctx, 320, 392, 320, 412, '#c97e93', 1.5);
  line(ctx, 328, 394, 328, 410, '#c97e93', 1.5);
  ellipse(ctx, 380, 414, 11, 8, '#fdf6e3');
  ellipse(ctx, 250, 416, 10, 7, '#b7d3e8');

  // Starfish (variant 1: an extra starfish).
  star(ctx, 470, 414, 12, '#f2a541');
  if (v === 1) star(ctx, 430, 402, 10, '#f2a541');

  // Lighthouse on the right (variant 1: its beam is off).
  rect(ctx, 552, 210, 26, 130, '#f2e3c2');
  rect(ctx, 552, 236, 26, 10, '#d94f3d');
  rect(ctx, 552, 268, 26, 10, '#d94f3d');
  rect(ctx, 552, 300, 26, 10, '#d94f3d');
  circle(ctx, 565, 198, 12, '#ffd94d');
  if (v === 0) {
    ctx.fillStyle = 'rgba(255, 217, 77, 0.28)';
    ctx.beginPath();
    ctx.moveTo(552, 192);
    ctx.lineTo(430, 150);
    ctx.lineTo(430, 225);
    ctx.lineTo(552, 206);
    ctx.closePath();
    ctx.fill();
  }
}

// ---- Scene 3: Cozy Kitchen ------------------------------------------------

function paintKitchen(ctx, v) {
  // Wall and floor.
  ctx.fillStyle = '#f2dfc2';
  ctx.fillRect(0, 0, 600, 330);
  ctx.fillStyle = '#c99e6b';
  ctx.fillRect(0, 330, 600, 110);
  line(ctx, 0, 330, 600, 330, '#a87f4e', 4);

  // Window with curtains (variant 1: the right curtain is tied shorter).
  rect(ctx, 60, 50, 150, 130, '#bfe3f0');
  rect(ctx, 60, 50, 150, 130, '#bfe3f0');
  ctx.strokeStyle = '#7a5a12';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 50, 150, 130);
  line(ctx, 135, 50, 135, 180, '#7a5a12', 3);
  line(ctx, 60, 115, 210, 115, '#7a5a12', 3);
  circle(ctx, 100, 80, 16, '#ffd94d');
  cloud(ctx, 160, 78, 0.45, '#ffffff');
  cloud(ctx, 90, 150, 0.4, '#ffffff');
  ctx.fillStyle = '#d96a8b';
  ctx.beginPath();
  ctx.moveTo(52, 40);
  ctx.lineTo(78, 40);
  ctx.lineTo(78, v === 0 ? 190 : 140);
  ctx.lineTo(52, v === 0 ? 190 : 140);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d96a8b';
  ctx.beginPath();
  ctx.moveTo(192, 40);
  ctx.lineTo(218, 40);
  ctx.lineTo(218, 190);
  ctx.lineTo(192, 190);
  ctx.closePath();
  ctx.fill();

  // Clock (variant 1: the hands read 4:30 instead of 3:00).
  circle(ctx, 300, 72, 34, '#fdf6e3');
  ctx.strokeStyle = '#4a3226';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 72, 34, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, 300, 72, 300, 50, '#4a3226', 4);
  if (v === 0) line(ctx, 300, 72, 320, 72, '#4a3226', 4);
  else line(ctx, 300, 72, 288, 90, '#4a3226', 4);
  circle(ctx, 300, 72, 4, '#d94f3d');

  // Lamp (variant 1: the shade is purple instead of orange).
  line(ctx, 520, 30, 520, 58, '#4a3226', 3);
  poly(ctx, [[492, 92], [548, 92], [538, 58], [502, 58]], v === 0 ? '#f2a541' : '#8b6fd6');
  circle(ctx, 520, 100, 8, '#ffd94d');

  // Shelf with jars (variant 1: the middle jar has no label).
  rect(ctx, 380, 130, 170, 10, '#a9713f');
  rect(ctx, 392, 92, 34, 38, '#cfe3b8');
  rect(ctx, 440, 88, 34, 42, '#e8c9a0');
  rect(ctx, 488, 94, 34, 36, '#c9d8e8');
  rect(ctx, 392, 92, 34, 8, '#7a4e26');
  rect(ctx, 440, 88, 34, 8, '#7a4e26');
  rect(ctx, 488, 94, 34, 8, '#7a4e26');
  rect(ctx, 400, 106, 18, 12, '#fdf6e3');
  if (v === 0) rect(ctx, 448, 102, 18, 12, '#fdf6e3');
  rect(ctx, 496, 106, 18, 12, '#fdf6e3');

  // Plant (variant 1: one leaf fewer).
  rect(ctx, 512, 180, 34, 30, '#d96a8b');
  ctx.strokeStyle = '#2f7d4a';
  ctx.lineWidth = 4;
  const leaves = v === 0 ? 5 : 4;
  for (let i = 0; i < leaves; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.5;
    ctx.beginPath();
    ctx.moveTo(529, 182);
    ctx.quadraticCurveTo(529 + Math.cos(a) * 22, 182 + Math.sin(a) * 26, 529 + Math.cos(a) * 34, 182 + Math.sin(a) * 34);
    ctx.stroke();
  }

  // Table.
  rect(ctx, 180, 300, 280, 16, '#a9713f');
  rect(ctx, 196, 316, 12, 60, '#7a4e26');
  rect(ctx, 432, 316, 12, 60, '#7a4e26');

  // Teapot with steam (variant 1: no steam).
  ctx.fillStyle = '#2f7d6d';
  ctx.beginPath();
  ctx.arc(330, 268, 30, 0, Math.PI * 2);
  ctx.fill();
  poly(ctx, [[318, 244], [342, 244], [336, 226], [324, 226]], '#2f7d6d');
  ctx.beginPath();
  ctx.arc(360, 262, 10, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(360, 272);
  ctx.lineTo(352, 272);
  ctx.strokeStyle = '#2f7d6d';
  ctx.lineWidth = 5;
  ctx.stroke();
  if (v === 0) {
    ctx.strokeStyle = 'rgba(120, 120, 120, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(322, 216);
    ctx.quadraticCurveTo(314, 200, 322, 186);
    ctx.moveTo(338, 216);
    ctx.quadraticCurveTo(346, 200, 338, 186);
    ctx.stroke();
  }

  // Cups (one changes colour: green -> yellow).
  rect(ctx, 246, 272, 30, 22, v === 0 ? '#2f7d6d' : '#f2c14e');
  line(ctx, 276, 278, 286, 278, '#4a3226', 3);
  line(ctx, 286, 278, 286, 288, '#4a3226', 3);
  line(ctx, 276, 288, 286, 288, '#4a3226', 3);
  rect(ctx, 386, 272, 30, 22, '#d96a8b');
  line(ctx, 416, 278, 426, 278, '#4a3226', 3);
  line(ctx, 426, 278, 426, 288, '#4a3226', 3);
  line(ctx, 416, 288, 426, 288, '#4a3226', 3);

  // Spoon (variant 1: the spoon is gone).
  if (v === 0) {
    line(ctx, 380, 296, 392, 276, '#9aa5ad', 3);
    ellipse(ctx, 394, 272, 5, 7, '#9aa5ad');
  }

  // Cat on the chair (variant 1: no whiskers).
  rect(ctx, 90, 300, 90, 12, '#a9713f');
  rect(ctx, 96, 312, 10, 64, '#7a4e26');
  rect(ctx, 164, 312, 10, 64, '#7a4e26');
  ellipse(ctx, 135, 282, 34, 22, '#e8a34c');
  circle(ctx, 112, 258, 16, '#e8a34c');
  poly(ctx, [[100, 248], [106, 232], [114, 246]], '#e8a34c');
  poly(ctx, [[118, 246], [124, 232], [130, 248]], '#e8a34c');
  circle(ctx, 107, 256, 2.5, '#2b2b2b');
  circle(ctx, 117, 256, 2.5, '#2b2b2b');
  if (v === 0) {
    ctx.strokeStyle = '#4a3226';
    ctx.lineWidth = 1.5;
    line(ctx, 96, 262, 78, 258, '#4a3226', 1.5);
    line(ctx, 96, 266, 78, 268, '#4a3226', 1.5);
    line(ctx, 128, 262, 146, 258, '#4a3226', 1.5);
    line(ctx, 128, 266, 146, 268, '#4a3226', 1.5);
  }
  // Cat tail curls up.
  ctx.strokeStyle = '#e8a34c';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(168, 288);
  ctx.quadraticCurveTo(188, 272, 180, 252);
  ctx.stroke();

  // Rug (variant 1: the middle stripe is blue instead of red).
  rect(ctx, 220, 396, 200, 30, '#e8d3a8');
  rect(ctx, 220, 396, 200, 8, '#d94f3d');
  rect(ctx, 220, 418, 200, 8, v === 0 ? '#d94f3d' : '#4a7fd6');
  ctx.strokeStyle = '#a87f4e';
  ctx.lineWidth = 3;
  ctx.strokeRect(220, 396, 200, 30);
}

// ---- Scene catalogue ------------------------------------------------------

export const SCENES = [
  {
    id: 'park',
    name: 'Sunny Park',
    tagline: 'A breezy afternoon in the park',
    timeLimit: 120,
    paint: paintPark,
    diffs: [
      { x: 150, y: 92, r: 24, label: 'The little bird flew away' },
      { x: 92, y: 372, r: 22, label: 'A flower changed colour' },
      { x: 520, y: 70, r: 34, label: 'The sun lost some rays' },
      { x: 355, y: 312, r: 24, label: 'A bench slat went missing' },
      { x: 250, y: 48, r: 28, label: 'A cloud shrank' },
      { x: 430, y: 208, r: 22, label: 'The kite lost its tail bow' },
      { x: 480, y: 330, r: 24, label: 'A butterfly appeared' },
    ],
  },
  {
    id: 'beach',
    name: 'Moonlit Beach',
    tagline: 'A quiet night by the sea',
    timeLimit: 120,
    paint: paintBeach,
    diffs: [
      { x: 120, y: 52, r: 20, label: 'A new star twinkled in' },
      { x: 200, y: 392, r: 26, label: 'The crab scuttled away' },
      { x: 320, y: 402, r: 22, label: 'A shell changed colour' },
      { x: 495, y: 220, r: 30, label: 'The sail turned red' },
      { x: 95, y: 200, r: 24, label: 'A coconut fell off the palm' },
      { x: 540, y: 120, r: 30, label: 'The lighthouse beam went out' },
      { x: 300, y: 312, r: 24, label: 'A wave line vanished' },
      { x: 430, y: 402, r: 22, label: 'A starfish washed up' },
      { x: 502, y: 46, r: 18, label: 'A moon crater faded' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Cozy Kitchen',
    tagline: 'Tea is on, the cat is watching',
    timeLimit: 150,
    paint: paintKitchen,
    diffs: [
      { x: 300, y: 72, r: 30, label: 'The clock shows a new time' },
      { x: 112, y: 262, r: 26, label: 'The cat lost its whiskers' },
      { x: 330, y: 200, r: 26, label: 'The teapot stopped steaming' },
      { x: 261, y: 283, r: 22, label: 'A cup changed colour' },
      { x: 529, y: 160, r: 26, label: 'The plant lost a leaf' },
      { x: 457, y: 108, r: 22, label: 'A jar lost its label' },
      { x: 320, y: 422, r: 24, label: 'A rug stripe changed colour' },
      { x: 65, y: 165, r: 26, label: 'A curtain was tied shorter' },
      { x: 388, y: 284, r: 20, label: 'The spoon disappeared' },
      { x: 520, y: 75, r: 26, label: 'The lamp shade changed colour' },
    ],
  },
];
