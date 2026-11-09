"""Synthesise voice-lines.json into public/voice/<id>.mp3 (incremental).

Provider: ElevenLabs when ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID are set,
otherwise Piper (needs model path as 3rd argument).

usage: python scripts/synth.py voice-lines.json OUT_DIR [piper-model.onnx]
env:   ELEVENLABS_MODEL (default eleven_multilingual_v2)
       VOICE_SAMPLES=1  -> only a few lines, every model in ELEVENLABS_MODELS
"""
import json, os, subprocess, sys, tempfile, time, urllib.request, urllib.error

lines_path, out_dir = sys.argv[1], sys.argv[2]
model_path = sys.argv[3] if len(sys.argv) > 3 else None
lines = json.load(open(lines_path, encoding="utf-8"))
ids = json.load(open("voice-ids.json", encoding="utf-8"))
os.makedirs(out_dir, exist_ok=True)

EL_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
EL_VOICE = os.environ.get("ELEVENLABS_VOICE_ID", "").strip()
EL_MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
provider = f"elevenlabs:{EL_VOICE}:{EL_MODEL}" if EL_KEY and EL_VOICE else "piper:ar_JO-kareem-medium"

# calm for food names / numbers, livelier for exercises and cheering
STYLE = {
    "calm": {"stability": 0.55, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True},
    "energy": {"stability": 0.35, "similarity_boost": 0.75, "style": 0.45, "use_speaker_boost": True},
}


def eleven(text, kind, out_mp3, model=EL_MODEL):
    body = json.dumps({"text": text, "model_id": model, "language_code": "ar", "voice_settings": STYLE.get(kind, STYLE["calm"])}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{EL_VOICE}?output_format=mp3_44100_128",
        data=body, headers={"xi-api-key": EL_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                open(out_mp3, "wb").write(r.read())
            return
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:300]
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(3 * (attempt + 1)); continue
            raise SystemExit(f"ElevenLabs {e.code}: {msg}")


voice = None
def piper(text, wav):
    global voice
    import wave
    from piper import PiperVoice
    voice = voice or PiperVoice.load(model_path)
    with wave.open(wav, "wb") as wf:
        if hasattr(voice, "synthesize_wav"):
            try:
                from piper import SynthesisConfig
                voice.synthesize_wav(text, wf, syn_config=SynthesisConfig(length_scale=1.12, noise_scale=0.6, noise_w_scale=0.7))
            except ImportError:
                voice.synthesize_wav(text, wf)
        else:
            voice.synthesize(text, wf, length_scale=1.12)


def finish(src, mp3):
    # trim silence, same loudness for every clip, small mono mp3
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src,
                    "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5",
                    "-ac", "1", "-ar", "24000", "-b:a", "48k", mp3], check=True)


def render(line, mp3, model=EL_MODEL):
    with tempfile.NamedTemporaryFile(suffix=".mp3" if EL_KEY else ".wav", delete=False) as t:
        tmp = t.name
    if EL_KEY and EL_VOICE:
        eleven(line["text"], line.get("kind", "calm"), tmp, model)
    else:
        piper(line["text"], tmp)
    finish(tmp, mp3)
    os.remove(tmp)


# ---- samples: a handful of lines, possibly several models, for listening ----
if os.environ.get("VOICE_SAMPLES") == "1":
    want = ["مدّي إيديكِ لفوق قد ما تقدري متل سارية العلم", "برافو عليكِ! خلّصتي", "تفاح", "مقلوبة", "سبعة"]
    pick = [l for l in lines if any(w in l["key"] for w in want)][:6]
    models = os.environ.get("ELEVENLABS_MODELS", EL_MODEL).split(",")
    index = []
    for m in models:
        for i, l in enumerate(pick):
            name = f"{m}-{i}.mp3"
            try:
                render(l, os.path.join(out_dir, name), m)
                index.append({"file": name, "model": m, "text": l["text"], "kind": l.get("kind")})
            except SystemExit as e:
                index.append({"file": None, "model": m, "text": l["text"], "error": str(e)})
                break
    json.dump({"provider": provider, "samples": index}, open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps(index, ensure_ascii=False, indent=1))
    sys.exit(0)

# ---- full run: switching provider/voice regenerates everything ----
marker = os.path.join(out_dir, "PROVIDER")
if not os.path.exists(marker) or open(marker).read().strip() != provider:
    for f in os.listdir(out_dir):
        if f.endswith(".mp3"):
            os.remove(os.path.join(out_dir, f))
    open(marker, "w").write(provider + "\n")

made, keep = 0, set()
for line in lines:
    cid = ids[line["key"]]
    keep.add(cid + ".mp3")
    mp3 = os.path.join(out_dir, cid + ".mp3")
    if not os.path.exists(mp3):
        render(line, mp3)
        made += 1
for f in os.listdir(out_dir):
    if f.endswith(".mp3") and f not in keep:
        os.remove(os.path.join(out_dir, f))
print(f"{provider}: synthesised {made} new clips, {len(keep)} total")
