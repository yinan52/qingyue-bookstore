# -*- coding: utf-8 -*-
"""生成一段舒缓的钢琴风格背景音乐（正弦波+泛音+衰减包络），输出 WAV"""
import math
import wave
import struct
import os

OUT = r"C:\Users\Lenovo\Desktop\Web前端设计与开发实训\大作业\青阅书城\assets\media\audio\welcome.wav"

SAMPLE_RATE = 22050
DURATION = 28          # 秒
NOTE_VOL = 0.32

# C 大调舒缓旋律（音符频率 Hz，按节拍）
# 简谱：5 3 2 1 6 5 3 2 1 3 5 6 5 3 2 1 ...
# 使用 C 大调音阶频率
def freq(note):
    # note 为相对 A4=440 的半音数
    return 440.0 * (2 ** (note / 12.0))

# 定义音高（半音）：C4=60
C4 = 60; D4 = 62; E4 = 64; F4 = 65; G4 = 67; A4 = 69; B4 = 71; C5 = 72
D5 = 74; E5 = 76; F5 = 77; G5 = 79; A5 = 81

# 旋律序列：(音符, 节拍数)  每拍 0.5 秒
melody = [
    (C5, 1), (G4, 1), (E4, 1), (C4, 1),
    (D4, 1), (E4, 1), (F4, 1), (G4, 1),
    (E4, 1.5), (C4, 0.5), (D4, 1), (E4, 1),
    (F4, 1), (G4, 1), (A4, 1), (G4, 1),
    (C5, 1), (G4, 1), (E4, 1), (C4, 1),
    (D4, 1), (E4, 1), (F4, 1), (D4, 1),
    (C4, 2), (E4, 1), (G4, 1), (C5, 2),
    (B4, 1), (G4, 1), (F4, 1), (D4, 1),
    (E4, 2), (G4, 1), (C5, 1), (D5, 1), (C5, 1),
    (G4, 2), (A4, 1), (G4, 1), (E4, 1), (C4, 1),
    (D4, 2), (F4, 1), (G4, 1), (C4, 2)
]

BEAT = 0.5  # 每拍秒数

def note_wave(freq_hz, duration_s, vol=NOTE_VOL):
    """生成单个音符采样：基波 + 二次/三次谐波 + 指数衰减包络"""
    n = int(SAMPLE_RATE * duration_s)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        # 指数衰减包络（起音快、衰减慢，模拟钢琴）
        env = math.exp(-3.2 * t / duration_s) * min(1.0, t / 0.012)
        # 基波 + 谐波
        s = (math.sin(2 * math.pi * freq_hz * t)
             + 0.35 * math.sin(2 * math.pi * freq_hz * 2 * t)
             + 0.12 * math.sin(2 * math.pi * freq_hz * 3 * t))
        samples.append(s * env * vol)
    return samples

def main():
    total_samples = int(SAMPLE_RATE * DURATION)
    audio = [0.0] * total_samples

    pos = 0
    for note, beats in melody:
        dur = beats * BEAT
        wave_samples = note_wave(freq(note - 12), dur)  # 降低八度更舒缓
        start = pos
        for i, s in enumerate(wave_samples):
            idx = start + i
            if idx < total_samples:
                audio[idx] += s
        pos = start + int(dur * SAMPLE_RATE)

    # 淡入淡出防止爆音
    fade = int(SAMPLE_RATE * 0.8)
    for i in range(fade):
        audio[i] *= i / fade
        audio[-1 - i] *= i / fade

    # 归一化
    peak = max(abs(s) for s in audio) or 1.0
    if peak > 0.9:
        audio = [s * 0.9 / peak for s in audio]

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with wave.open(OUT, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = b''.join(struct.pack('<h', int(max(-1.0, min(1.0, s)) * 32767)) for s in audio)
        wf.writeframes(frames)
    print('generated', OUT, 'duration', DURATION, 's')

if __name__ == '__main__':
    main()
