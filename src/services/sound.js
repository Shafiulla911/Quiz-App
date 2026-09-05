// Browser Web Audio API Synthesizer (Zero External Dependencies)

let audioCtx = null;
let isMuted = localStorage.getItem("quiz_sound_muted") === "true";

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

export function isSoundMuted() {
    return isMuted;
}

export function toggleSound() {
    isMuted = !isMuted;
    localStorage.setItem("quiz_sound_muted", isMuted ? "true" : "false");
    return !isMuted;
}

export function playSound(type) {
    if (isMuted) return;

    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        if (type === "correct") {
            // Bright cheerful ascending two-tone chime
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc1.type = "sine";
            osc2.type = "triangle";

            osc1.frequency.setValueAtTime(523.25, now); // C5
            osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
            osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

            osc2.frequency.setValueAtTime(1046.50, now + 0.1); // C6

            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now + 0.1);
            osc1.stop(now + 0.45);
            osc2.stop(now + 0.45);
        } else if (type === "incorrect") {
            // Low soft double buzz
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.25);

            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === "streak") {
            // High sparkling chime
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === "lifeline") {
            // Magical swoosh
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.3);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === "tick") {
            // Subtle clock click
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(600, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === "victory") {
            // Fanfare sequence
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const noteStart = now + idx * 0.12;
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, noteStart);
                gain.gain.setValueAtTime(0.15, noteStart);
                gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(noteStart);
                osc.stop(noteStart + 0.35);
            });
        }
    } catch (e) {
        console.warn("Audio playback not supported or blocked by user gesture policy", e);
    }
}
