# -*- coding: utf-8 -*-
"""生成头像、Logo、favicon SVG"""
import os

ROOT = r"C:\Users\Lenovo\Desktop\Web前端设计与开发实训\大作业\青阅书城\assets"

# 头像：圆形渐变底 + 首字母
def avatar(name, color1, color2, char, path):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="{color1}"/>
    <stop offset="100%" stop-color="{color2}"/>
  </linearGradient>
</defs>
<circle cx="60" cy="60" r="60" fill="url(#g)"/>
<text x="60" y="78" text-anchor="middle" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="46" font-weight="700" fill="#ffffff">{char}</text>
</svg>'''
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print("generated", path)

avatar("default", "#165DFF", "#6EAAFF", "青", os.path.join(ROOT, "images", "avatar", "avatar-default.svg"))
avatar("user1", "#FF7D00", "#FFB65C", "沐", os.path.join(ROOT, "images", "avatar", "avatar-01.svg"))
avatar("user2", "#00B42A", "#7BE188", "山", os.path.join(ROOT, "images", "avatar", "avatar-02.svg"))
avatar("user3", "#722ED1", "#B37FEB", "拾", os.path.join(ROOT, "images", "avatar", "avatar-03.svg"))

# Logo：书本 + 渐变
logo = '''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<defs>
  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#165DFF"/>
    <stop offset="100%" stop-color="#14C9C9"/>
  </linearGradient>
</defs>
<rect x="4" y="4" width="88" height="88" rx="22" fill="url(#lg)"/>
<!-- 打开的书 -->
<path d="M48 30 C42 24 32 22 24 24 L24 66 C32 64 42 66 48 72 C54 66 64 64 72 66 L72 24 C64 22 54 24 48 30 Z" fill="#ffffff" opacity="0.95"/>
<path d="M48 30 L48 72" stroke="#165DFF" stroke-width="2.4" fill="none" opacity="0.45"/>
<circle cx="48" cy="52" r="4" fill="#165DFF"/>
</svg>'''
with open(os.path.join(ROOT, "icons", "logo.svg"), "w", encoding="utf-8") as f:
    f.write(logo)
print("generated logo.svg")

# favicon（16/32 兼容写法：直接放大版 logo）
with open(os.path.join(ROOT, "icons", "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(logo)
print("generated favicon.svg")

print("DONE")
