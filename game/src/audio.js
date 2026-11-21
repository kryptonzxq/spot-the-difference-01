// audio.js — every sound in Twin Peeks, synthesised live with Web Audio.
//
// No audio files, no network: each effect is a few oscillators shaped by a
// gain envelope. The AudioContext is created on the first user gesture, so
// the game stays silent until the player interacts.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  tone(freq, startAt, duration, type, volume) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + startAt;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  // A bright two-note chime when a difference is found.
  chime() {
    if (!this.ensure()) return;
    this.tone(659.25, 0, 0.22, 'sine', 0.22);
    this.tone(987.77, 0.09, 0.34, 'sine', 0.2);
    this.tone(1318.5, 0.18, 0.3, 'triangle', 0.08);
  }

  // A low dull thud for a miss.
  thud() {
    if (!this.ensure()) return;
    this.tone(98, 0, 0.18, 'sine', 0.3);
    this.tone(65, 0.02, 0.22, 'triangle', 0.18);
  }

  // A short rising arpeggio when a level is complete.
  fanfare() {
    if (!this.ensure()) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, i * 0.11, 0.32, 'triangle', 0.2));
    this.tone(1318.5, 0.46, 0.5, 'sine', 0.14);
  }

  // A soft blip for button presses and the hint.
  blip() {
    if (!this.ensure()) return;
    this.tone(880, 0, 0.08, 'sine', 0.12);
  }

  // A gentle tick when the timer drops under ten seconds.
  tick() {
    if (!this.ensure()) return;
    this.tone(1200, 0, 0.05, 'square', 0.05);
  }
}
