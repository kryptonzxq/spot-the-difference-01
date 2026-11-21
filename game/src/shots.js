// shots.js — deterministic showcase states for the screenshots.
//
// ?shot=1  Level 1 mid-game: 3 of 7 differences found, rings visible, the
//          counter reads 3/7, four differences still unfound.
// ?shot=2  Level 2 fresh: 0 found, full timer, a clean new scene.
// ?shot=3  Level 3 mid-game: 5 of 10 found, timer half spent.
// ?shot=4  Results screen after finishing all three levels.
//
// These are real renders of the game's own code: the shot only sets the
// game's state, then the normal frame loop draws it. The timer is frozen
// in shot mode so the frame never changes between load and screenshot.

export function applyShot(game, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  game.frozen = true;
  game.crosshair.visible = false;

  if (shot === '1') {
    game.startGame();
    game.found = new Set([0, 2, 4]);
    game.hits = 3;
    game.score = 325;
    game.combo = 2;
    game.bestCombo = 2;
    game.timeLeft = 87;
    game.lastFoundLabel = game.scene().diffs[4].label;
    game.screen = 'playing';
  } else if (shot === '2') {
    game.startGame();
    game.startLevel(1);
    game.timeLeft = 120;
    game.screen = 'playing';
  } else if (shot === '3') {
    game.startGame();
    game.startLevel(2);
    game.found = new Set([0, 1, 3, 5, 7]);
    game.hits = 5;
    game.score = 690;
    game.combo = 3;
    game.bestCombo = 3;
    game.timeLeft = 96;
    game.lastFoundLabel = game.scene().diffs[7].label;
    game.screen = 'playing';
  } else if (shot === '4') {
    game.startGame();
    game.levelIndex = 2;
    game.found = new Set(game.scene().diffs.map((_, i) => i));
    game.hits = 26;
    game.misses = 3;
    game.score = 2980;
    game.bestCombo = 6;
    game.timeLeft = 150; // full bar: the timer is not a factor on the results screen
    game.timeUsedTotal = 312;
    game.levelStats = [
      { name: 'Sunny Park', found: 7, total: 7, timeUsed: 88, timeBonus: 160 },
      { name: 'Moonlit Beach', found: 9, total: 9, timeUsed: 101, timeBonus: 95 },
      { name: 'Cozy Kitchen', found: 10, total: 10, timeUsed: 123, timeBonus: 135 },
    ];
    game.screen = 'results';
  } else {
    return false;
  }
  return true;
}
