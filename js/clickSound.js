let ac;

function getAC() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    return ac;
}


function click_sound(btn) {
    const a = getAC(); // ← ez hiányzott
    const t = a.currentTime; // ← ez is hiányzott

    const buf = a.createBuffer(1, a.sampleRate * 0.01, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = a.createBufferSource(), g = a.createGain();
    const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 500;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(a.destination);
    g.gain.setValueAtTime(0.5, t);
    src.start(t);

    const o = a.createOscillator(), g2 = a.createGain();
    o.type = 'sine'; o.frequency.value = 2200;
    o.connect(g2); g2.connect(a.destination);
    g2.gain.setValueAtTime(0.12, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
    o.start(t); o.stop(t + 0.02);

    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
}