/* ECB: OUTBREAK — in-game sound effects. Everything is synthesized with WebAudio, no audio files.
   Shares the 'ecb_mute' setting with the opening cinematic. */
const SFX = (function () {
'use strict';
const VOL = .32;
let ac = null, master = null, nbuf = null, muted = false; const last = {};
try { muted = localStorage.getItem('ecb_mute') === '1'; } catch (e) {}
function ctx() {
  if (muted) return null;
  if (!ac) {
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ac.destination);
      master = ac.createGain(); master.gain.value = VOL; master.connect(comp);
      nbuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; return null; }
  }
  if (ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
  return ac;
}
function setMuted(m) { muted = !!m; try { localStorage.setItem('ecb_mute', muted ? '1' : '0'); } catch (e) {} if (ac && master) master.gain.setTargetAtTime(muted ? 0 : VOL, ac.currentTime, .05); }
const isMuted = () => muted;
function unlock() { if (!muted) ctx(); }

// ---- building blocks (t = absolute AudioContext time)
function nz(t, dur, type, freq, gain, q, freq2) {
  const s = ac.createBufferSource(); s.buffer = nbuf; s.loop = true;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (freq2) f.frequency.exponentialRampToValueAtTime(freq2, t + dur); f.Q.value = q || .8;
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 1.5); s.stop(t + dur + .05);
}
function tone(t, dur, type, f0, f1, gain, attack) {
  const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + (attack || .006)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
}
// a sustained source with an envelope; returns nodes for modulation
function bed(t, dur, build, att, rel, gain) {
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + att); g.gain.setValueAtTime(gain, t + Math.max(att, dur - rel)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  g.connect(master); build(g); return g;
}

// ---- the sounds
const S = {
  // small-arms fire: two or three bursts of rifle / machine-gun shots
  gunfire() { const t0 = ac.currentTime + .02; let t = t0;
    for (let b = 0; b < 3; b++) { const n = 4 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) { nz(t, .07, 'bandpass', 1200 + Math.random() * 900, .9, 1.1); nz(t, .12, 'lowpass', 500, .5); tone(t, .05, 'square', 170, 55, .18); t += .065 + Math.random() * .03; }
      t += .16 + Math.random() * .14; }
    nz(t, .6, 'lowpass', 900, .12); },
  // 30mm autocannon: slower, heavier rounds
  cannon() { let t = ac.currentTime + .02; for (let i = 0; i < 6; i++) { nz(t, .16, 'lowpass', 900, .95); tone(t, .14, 'sine', 120, 40, .7); nz(t, .04, 'highpass', 3000, .35); t += .17; } },
  // artillery / mortar: thump, crack, rolling boom, a second impact further away
  boom() { const t = ac.currentTime + .02;
    tone(t, 1.1, 'sine', 95, 26, 1.1); nz(t, 1.6, 'lowpass', 650, .9, .7, 120); nz(t, .05, 'highpass', 3200, .5);
    tone(t + .55, .9, 'sine', 70, 24, .55); nz(t + .55, 1.3, 'lowpass', 420, .45, .7, 90); },
  big() { const t = ac.currentTime + .02; tone(t, 2.2, 'sine', 80, 18, 1.4); nz(t, 2.8, 'lowpass', 900, 1, .6, 70); nz(t, .1, 'highpass', 2600, .6); },
  // helicopter: rotor "whup" (amplitude-modulated low noise) + turbine whine, flying past
  rotor(dur) { dur = dur || 2.6; const t = ac.currentTime + .02;
    bed(t, dur, g => {
      const s = ac.createBufferSource(); s.buffer = nbuf; s.loop = true;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(260, t); lp.frequency.linearRampToValueAtTime(520, t + dur * .5); lp.frequency.linearRampToValueAtTime(240, t + dur);
      const am = ac.createGain(); am.gain.value = .5; const lfo = ac.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 9.5; const lg = ac.createGain(); lg.gain.value = .5;
      lfo.connect(lg); lg.connect(am.gain); s.connect(lp); lp.connect(am); am.connect(g); s.start(t); s.stop(t + dur + .1); lfo.start(t); lfo.stop(t + dur + .1);
      const w = ac.createOscillator(); w.type = 'sawtooth'; w.frequency.setValueAtTime(820, t); w.frequency.linearRampToValueAtTime(900, t + dur * .5); w.frequency.linearRampToValueAtTime(760, t + dur);
      const wf = ac.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 1400; wf.Q.value = 3; const wg = ac.createGain(); wg.gain.value = .05; w.connect(wf); wf.connect(wg); wg.connect(g); w.start(t); w.stop(t + dur + .1);
    }, .5, dur * .45, 1); },
  // small drone: thin propeller buzz
  drone() { const t = ac.currentTime + .02, dur = 1.8;
    bed(t, dur, g => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(230, t + dur * .5); o.frequency.linearRampToValueAtTime(170, t + dur);
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2; o.connect(f); f.connect(g); o.start(t); o.stop(t + dur + .1); }, .3, .8, .25);
    tone(t + .2, .08, 'sine', 1800, 1800, .1); tone(t + .32, .08, 'sine', 2200, 2200, .1); },
  // radio: squelch, crackle, two beeps
  radio() { const t = ac.currentTime + .02;
    nz(t, .12, 'bandpass', 2400, .55, 1.5);
    for (let i = 0; i < 14; i++) nz(t + .08 + Math.random() * .55, .02 + Math.random() * .03, 'bandpass', 1500 + Math.random() * 1600, .25 + Math.random() * .3, 2);
    nz(t + .1, .6, 'bandpass', 1800, .1, 1);
    tone(t + .72, .08, 'square', 1250, 1250, .08); tone(t + .84, .1, 'square', 950, 950, .08); },
  // region falls: two-tone siren
  alarm() { const t = ac.currentTime + .02;
    for (let i = 0; i < 6; i++) { const f = i % 2 ? 620 : 830; tone(t + i * .28, .3, 'sawtooth', f, f, .13, .02); tone(t + i * .28, .3, 'sine', f / 2, f / 2, .12, .02); }
    tone(t, 1.9, 'sine', 55, 45, .25, .2); },
  // convoy / redeploy: diesel rumble with track clatter
  convoy() { const t = ac.currentTime + .02, dur = 2;
    bed(t, dur, g => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(42, t); o.frequency.linearRampToValueAtTime(58, t + dur * .6); o.frequency.linearRampToValueAtTime(46, t + dur);
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240; o.connect(f); f.connect(g); o.start(t); o.stop(t + dur + .1); }, .35, .7, .5);
    for (let i = 0; i < 16; i++) nz(t + .2 + i * .1, .03, 'highpass', 3500, .08); nz(t, dur, 'lowpass', 300, .2); },
  // engineers: metal clanks
  clank() { const t = ac.currentTime + .02; for (let i = 0; i < 3; i++) { const u = t + i * .2; tone(u, .18, 'square', 330 - i * 30, 210, .1); tone(u, .25, 'triangle', 1240 + i * 60, 1100, .08); nz(u, .05, 'bandpass', 2600, .3, 3); } },
  // something good: soft bell
  chime() { const t = ac.currentTime + .02; tone(t, 1.3, 'sine', 880, 880, .2, .01); tone(t + .12, 1.3, 'sine', 1320, 1320, .14, .01); tone(t + .24, 1.5, 'sine', 1760, 1760, .08, .01); },
  // research / intel: computer beeps
  beeps() { const t = ac.currentTime + .02; [0, .1, .2].forEach((d, i) => tone(t + d, .07, 'sine', 1400 + i * 300, 1400 + i * 300, .1)); },
  // medical: two soft tones
  medic() { const t = ac.currentTime + .02; tone(t, .5, 'sine', 660, 660, .14); tone(t + .18, .7, 'sine', 990, 990, .12); },
  // burning a card
  whoosh() { const t = ac.currentTime + .02; nz(t, .7, 'bandpass', 300, .6, 1.2, 2200); nz(t + .1, .5, 'lowpass', 500, .3); },
  // end of week: low drum
  drum() { const t = ac.currentTime + .02; tone(t, .5, 'sine', 110, 48, .8); nz(t, .25, 'lowpass', 400, .3); tone(t + .32, .5, 'sine', 98, 44, .6); },
  // ui click
  click() { const t = ac.currentTime + .01; nz(t, .025, 'highpass', 2600, .25); },
};
function play(name, arg) {
  if (muted || !S[name]) return;
  if (!ctx()) return;
  const now = performance.now(); if (last[name] && now - last[name] < 140) return; last[name] = now;
  try { S[name](arg); } catch (e) {}
}
const FOR_CARD = { COMBAT:'gunfire', FIRES:'boom', AIR:'rotor', INTEL:'beeps', RESEARCH:'beeps', MEDICAL:'medic', LOGISTICS:'convoy', CIVIL:'chime', COMMAND:'radio', CURE:'chime' };
function card(type, id) {
  if (id === 'thermobaric' || id === 'firebreak') return play('big');
  if (id === 'mech_sweep' || id === 'hw_platoon' || id === 'linebacker') return play('cannon');
  if (id === 'uas_recon' || id === 'endurance_uas') return play('drone');
  if (id === 'cas') return play('big');
  play(FOR_CARD[type] || 'click');
}
return { play, card, setMuted, isMuted, unlock };
})();
