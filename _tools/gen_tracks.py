# -*- coding: utf-8 -*-
"""生成 3 段不同风格的纯音乐 WAV（正弦+泛音+包络），供视听馆使用"""
import math
import wave
import struct
import os

OUT_DIR = r"C:\Users\Lenovo\Desktop\Web前端设计与开发实训\大作业\青阅书城\assets\media\audio"
SAMPLE_RATE = 22050
NOTE_VOL = 0.32

def freq(semi):
    return 440.0 * (2 ** (semi / 12.0))

# 音高（半音相对 A4）
C4=60; D4=62; E4=64; F4=65; G4=67; A4=69; B4=71; C5=72; D5=74; E5=76; F5=77; G5=79; A5=81; B5=83; C6=84

# 三首曲目：(名称, 旋律[(音, 拍), ...], 每拍秒, 音量, 是否加低音伴奏)
TRACKS = [
    ("晨光序曲 · 阅读时光", [
        (C5,1),(G4,1),(E4,1),(C4,1),(D4,1),(E4,1),(F4,1),(G4,1),
        (E4,1.5),(C4,0.5),(D4,1),(E4,1),(F4,1),(G4,1),(A4,1),(G4,1),
        (C5,1),(G4,1),(E4,1),(C4,1),(D4,1),(E4,1),(F4,1),(D4,1),
        (C4,2),(E4,1),(G4,1),(C5,2),(B4,1),(G4,1),(F4,1),(D4,1),
        (E4,2),(G4,1),(C5,1),(D5,1),(C5,1),(G4,2),(A4,1),(G4,1),(E4,1),(C4,1),
        (D4,2),(F4,1),(G4,1),(C4,2)
    ], 0.5, 0.34, True),
    ("午后的旋律", [
        (E5,1),(D5,1),(C5,1),(D5,1),(E5,1),(E5,1),(E5,2),
        (D5,1),(D5,1),(D5,2),(E5,1),(G5,1),(G5,2),
        (E5,1),(D5,1),(C5,1),(D5,1),(E5,1),(E5,1),(E5,1),(E5,1),
        (D5,1),(D5,1),(E5,1),(D5,1),(C5,2),
        (A4,1),(A4,1),(B4,1),(C5,1),(D5,1),(D5,1),(B4,2),
        (G4,1),(A4,1),(B4,1),(C5,1),(D5,1),(C5,1),(B4,1),(A4,1),
        (G4,2)
    ], 0.42, 0.30, True),
    ("静夜书香", [
        (A4,2),(C5,2),(E5,2),(C5,2),(B4,2),(D5,2),(G5,2),(D5,2),
        (C5,2),(E5,2),(A5,2),(G5,1),(E5,1),(C5,2),(B4,2),
        (A4,2),(C5,2),(E5,2),(G5,1),(E5,1),(D5,2),(B4,2),
        (C5,3),(G4,1),(A4,2),(B4,2),(C5,2)
    ], 0.55, 0.30, True)
]

def note_wave(freq_hz, duration_s, vol):
    n = int(SAMPLE_RATE * duration_s)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-3.0 * t / duration_s) * min(1.0, t / 0.014)
        s = (math.sin(2 * math.pi * freq_hz * t)
             + 0.32 * math.sin(2 * math.pi * freq_hz * 2 * t)
             + 0.10 * math.sin(2 * math.pi * freq_hz * 3 * t))
        out.append(s * env * vol)
    return out

def bass_wave(freq_hz, duration_s, vol):
    n = int(SAMPLE_RATE * duration_s)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-2.2 * t / duration_s) * min(1.0, t / 0.03)
        out.append(math.sin(2 * math.pi * freq_hz * t) * env * vol)
    return out

def build_track(name, melody, beat, vol, with_bass):
    total = sum(b * beat for _, b in melody) + 1.5
    audio = [0.0] * int(SAMPLE_RATE * total)
    pos = 0
    for note, beats in melody:
        dur = beats * beat
        w = note_wave(freq(note - 12), dur, vol)  # 降低八度更柔和
        b = bass_wave(freq(note - 24), dur, vol * 0.55) if with_bass else None
        start = pos
        for i in range(len(w)):
            idx = start + i
            if idx < len(audio):
                audio[idx] += w[i]
                if b:
                    audio[idx] += b[i]
        pos = start + int(dur * SAMPLE_RATE)
    # 淡入淡出
    fade = int(SAMPLE_RATE * 0.9)
    for i in range(fade):
        audio[i] *= i / fade
        audio[-1 - i] *= i / fade
    # 归一化
    peak = max(abs(s) for s in audio) or 1.0
    if peak > 0.92:
        audio = [s * 0.92 / peak for s in audio]
    return audio, name

def write_wav(path, audio):
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32767)) for s in audio))

def main():
    import subprocess, imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    os.makedirs(OUT_DIR, exist_ok=True)
    for i, (name, melody, beat, vol, bass) in enumerate(TRACKS, 1):
        audio, _ = build_track(name, melody, beat, vol, bass)
        wav = os.path.join(OUT_DIR, f"track-0{i}.wav")
        write_wav(wav, audio)
        # 转 mp3 / ogg
        for ext, args in [("mp3", ["-b:a", "128k"]), ("ogg", ["-q:a", "5"])]:
            out = os.path.join(OUT_DIR, f"track-0{i}.{ext}")
            cmd = [ff, "-y", "-i", wav] + args + [out]
            subprocess.run(cmd, capture_output=True)
        print("generated", name, "->", wav)
    print("DONE")

if __name__ == "__main__":
    main()
