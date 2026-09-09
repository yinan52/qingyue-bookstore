# -*- coding: utf-8 -*-
"""生成新增图书封面 book-17 ~ book-24，风格与 gen_covers.py 保持一致"""
import os
import html

ROOT = r"C:\Users\Lenovo\Desktop\Web前端设计与开发实训\大作业\青阅书城\assets\images\goods"
os.makedirs(ROOT, exist_ok=True)

# (起始序号, 书名, 作者, 主色1, 主色2, 点缀色)
BOOKS = [
    (17, "Python编程：从入门到实践", "埃里克·马瑟斯", "#2b5876", "#4e4376", "#ffd54f"),
    (18, "深入理解计算机系统", "Randal E. Bryant", "#232526", "#414345", "#00e5ff"),
    (19, "白夜行", "东野圭吾", "#16222a", "#3a6073", "#90caf9"),
    (20, "平凡的世界", "路遥", "#5d4037", "#8d6e63", "#ffcc80"),
    (21, "万历十五年", "黄仁宇", "#3e1e0a", "#6d3b1c", "#ffab91"),
    (22, "穷查理宝典", "彼得·考夫曼", "#1e3c72", "#2a5298", "#ffd740"),
    (23, "写给大家看的设计书", "Robin Williams", "#5f2c82", "#8e44ad", "#f8bbd0"),
    (24, "时间简史", "史蒂芬·霍金", "#000000", "#1a2a6c", "#82b1ff"),
]

def wrap_text(text, max_chars):
    return [text[i:i + max_chars] for i in range(0, len(text), max_chars)]

def make_svg(idx, title, author, c1, c2, accent):
    title_lines = wrap_text(title, 6)
    line_h = 38
    if len(title_lines) > 3:
        title_lines = title_lines[:3]
    title_y = 168
    title_block = ""
    for i, line in enumerate(title_lines):
        y = title_y + i * line_h
        title_block += f'<text x="150" y="{y}" text-anchor="middle" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="28" font-weight="700" fill="#ffffff">{html.escape(line)}</text>\n'
    circles = (
        '<circle cx="235" cy="52" r="62" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>\n'
        '<circle cx="250" cy="46" r="30" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1.5"/>\n'
        '<circle cx="62" cy="352" r="40" fill="rgba(255,255,255,0.06)"/>\n'
    )
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
<defs>
  <linearGradient id="bg{idx}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="{c1}"/>
    <stop offset="100%" stop-color="{c2}"/>
  </linearGradient>
</defs>
<rect width="300" height="400" fill="url(#bg{idx})"/>
<rect x="0" y="0" width="10" height="400" fill="rgba(255,255,255,0.14)"/>
<rect x="10" y="0" width="3" height="400" fill="rgba(255,255,255,0.08)"/>
{circles}<text x="150" y="58" text-anchor="middle" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="13" letter-spacing="4" fill="rgba(255,255,255,0.85)">青 阅 书 城</text>
<line x1="86" y1="72" x2="214" y2="72" stroke="{accent}" stroke-width="2" opacity="0.7"/>
{title_block}<line x1="110" y1="286" x2="190" y2="286" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
<text x="150" y="318" text-anchor="middle" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="17" fill="rgba(255,255,255,0.92)">{html.escape(author)}</text>
<text x="150" y="372" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="6" fill="rgba(255,255,255,0.5)">QING YUE · {idx:02d}</text>
</svg>'''
    return svg

for idx, title, author, c1, c2, accent in BOOKS:
    path = os.path.join(ROOT, f"book-{idx:02d}.svg")
    with open(path, "w", encoding="utf-8") as f:
        f.write(make_svg(idx, title, author, c1, c2, accent))
    print("generated", path)

print("DONE")
