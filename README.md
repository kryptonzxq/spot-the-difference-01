# Twin Peeks — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kryptonzxq/spot-the-difference-01/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kryptonzxq/spot-the-difference-01/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A cozy, original spot-the-difference game for the
[make.fun bounty "Make the best spot the difference game"](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

Two near-identical storybook pictures hang side by side. They look the
same — but they are not. Click a difference on either picture and a golden
ring marks it on both. Find them all before the timer runs out.

## The game

- **3 scenes, rising difficulty** — Sunny Park (7 differences, 120s),
  Moonlit Beach (9 differences, 120s), Cozy Kitchen (10 differences, 150s)
- **Fair but hidden differences** — a missing bird, a recoloured flower, a
  lighthouse beam gone dark, a clock showing a new time, a cat without
  whiskers
- **Feel** — a gold ring pops on both panels with a chime on every find; a
  wrong click shakes the frame, thuds, and costs 3 seconds
- **Hints** — 3 per level (H), each pulses one difference you have not found
- **Keyboard play** — arrow keys move a crosshair, Enter checks, Tab switches
  panel, N next level, R restart, M mute
- **Sound** — every effect synthesised live with the Web Audio API (no files)
- **All art drawn in code** — every scene is painted on canvas by one
  deterministic painter per scene; no images, no network, no fonts to load

## Play it

```sh
node serve.ts        # game/ on http://localhost:8080
```

Or open `game/index.html` from any static server. The `?shot=` scenes are
deterministic showcase states used for the screenshots (see `shots.json`).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored make.fun
library (`vendor/makefun-game.ts`).

## Files

- `game/index.html` — page, HUD, overlays
- `game/style.css` — warm storybook chrome
- `game/src/scenes.js` — the three scene painters + difference lists
- `game/src/game.js` — state, input, scoring, timer, hints, rendering
- `game/src/audio.js` — Web Audio sound effects
- `game/src/shots.js` — deterministic `?shot=` showcase states
- `game/src/main.js` — boot and wiring

## License

MIT, see LICENSE. All art, scenes and sounds are original, drawn and
synthesised by the author for this entry.
