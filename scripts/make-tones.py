"""Synthesise the 4 kid-friendly alarm tones (loopable, 6 s, 22.05 kHz mono WAV).
Outputs to public/sounds (web), android res/raw and ios App folder."""
import numpy as np, wave, os, sys
SR = 22050
T = 6.0
t = np.arange(int(SR * T)) / SR
rng = np.random.default_rng(7)

def env(n, a=0.005, d=0.3):
    x = np.arange(n) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)

def place(buf, sig, start):
    i = int(start * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i]

def birds():
    b = np.zeros_like(t)
    for start in np.arange(0.1, T - 0.5, 0.42):
        n = int(SR * rng.uniform(0.07, 0.14))
        x = np.arange(n) / SR
        f0, f1 = rng.uniform(2600, 3400), rng.uniform(3800, 5200)
        if rng.random() < 0.5: f0, f1 = f1, f0
        f = np.linspace(f0, f1, n)
        ph = 2 * np.pi * np.cumsum(f) / SR
        sig = np.sin(ph) * np.sin(np.pi * x / x[-1]) ** 2 * (1 + 0.3 * np.sin(2 * np.pi * 60 * x))
        place(b, sig * rng.uniform(0.5, 1), start + rng.uniform(0, 0.1))
        if rng.random() < 0.6: place(b, sig * 0.6, start + 0.16)
    return b

def bell(f, dur=1.8):
    n = int(SR * dur); x = np.arange(n) / SR
    parts = [(1, 1, 1.2), (2.0, 0.5, 0.8), (2.76, 0.35, 0.5), (5.4, 0.2, 0.25), (8.9, 0.1, 0.15)]
    return sum(a * np.sin(2 * np.pi * f * r * x) * np.exp(-x / d) for r, a, d in parts) * np.minimum(1, x / 0.003)

def bells():
    b = np.zeros_like(t)
    notes = [784, 659, 523, 659, 784, 1047, 784, 659]
    for i, f in enumerate(notes): place(b, bell(f) * 0.6, 0.1 + i * 0.7)
    return b

def marimba(f, dur=0.9):
    n = int(SR * dur); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) + 0.25 * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x / 0.05)) * env(n, 0.002, 0.28)

def melody():
    b = np.zeros_like(t)
    # cheerful pentatonic "good morning" tune
    seq = [(523, 0), (659, .3), (784, .6), (880, .9), (784, 1.35), (659, 1.65), (784, 1.95), (1047, 2.4),
           (880, 3.1), (784, 3.4), (659, 3.7), (587, 4.0), (659, 4.3), (784, 4.6), (523, 5.0)]
    for f, s in seq: place(b, marimba(f) * 0.7, s + 0.05)
    return b

def chime():
    b = np.zeros_like(t)
    scale = [1047, 1175, 1319, 1568, 1760, 2093]
    for i, s in enumerate(np.arange(0.1, T - 1, 0.33)):
        f = scale[(i * 2) % len(scale)] if i % 4 else scale[0]
        place(b, bell(f, 1.4) * 0.35, s)
    return b

def write(name, sig, dirs):
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * 0.89
    fade = int(0.05 * SR); sig[:fade] *= np.linspace(0, 1, fade); sig[-fade:] *= np.linspace(1, 0, fade)
    data = (sig * 32767).astype('<i2').tobytes()
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        with wave.open(os.path.join(d, f'alarm_{name}.wav'), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)

root = sys.argv[1]
dirs = [f'{root}/public/sounds', f'{root}/android/app/src/main/res/raw', f'{root}/ios/App/App/sounds']
for name, fn in [('birds', birds), ('bells', bells), ('melody', melody), ('chime', chime)]:
    write(name, fn(), dirs)
print('ok')
