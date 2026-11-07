"""Synthesise voice-lines.json with Piper into public/voice/<id>.mp3 (incremental).

usage: python scripts/synth.py voice-lines.json public/voice model.onnx
"""
import json, os, subprocess, sys, tempfile, wave
from piper import PiperVoice

lines_path, out_dir, model = sys.argv[1], sys.argv[2], sys.argv[3]
lines = json.load(open(lines_path, encoding="utf-8"))
ids = json.load(open("voice-ids.json", encoding="utf-8"))  # key -> id (computed by node, same hash as the app)
os.makedirs(out_dir, exist_ok=True)
voice = PiperVoice.load(model)


def synth(text, wav_path):
    with wave.open(wav_path, "wb") as wf:
        if hasattr(voice, "synthesize_wav"):  # piper-tts >= 1.3
            try:
                from piper import SynthesisConfig
                voice.synthesize_wav(text, wf, syn_config=SynthesisConfig(length_scale=1.12, noise_scale=0.6, noise_w_scale=0.7))
            except ImportError:
                voice.synthesize_wav(text, wf)
        else:  # piper-tts 1.2
            voice.synthesize(text, wf, length_scale=1.12)


made = 0
keep = set()
for line in lines:
    cid = ids[line["key"]]
    keep.add(cid + ".mp3")
    mp3 = os.path.join(out_dir, cid + ".mp3")
    if os.path.exists(mp3):
        continue
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    synth(line["text"], wav)
    # trim silence, normalise loudness, small mono mp3
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav,
                    "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5",
                    "-ac", "1", "-ar", "22050", "-b:a", "48k", mp3], check=True)
    os.remove(wav)
    made += 1

# drop clips for phrases that no longer exist
for f in os.listdir(out_dir):
    if f.endswith(".mp3") and f not in keep:
        os.remove(os.path.join(out_dir, f))
print(f"synthesised {made} new clips, {len(keep)} total")
