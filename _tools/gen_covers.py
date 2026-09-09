# -*- coding: utf-8 -*-
"""生成青阅书城图书封面 SVG：每本书一个渐变封面（300x400）"""
import os
import html

ROOT = r"C:\Users\Lenovo\Desktop\Web前端设计与开发实训\大作业\青阅书城\assets\images\goods"
os.makedirs(ROOT, exist_ok=True)

# (书名, 作者, 主色1, 主色2, 点缀色)
BOOKS = [
    ("JavaScript高级程序设计", "马特·弗里斯比", "#0F2027", "#2C5364", "#00C6FF"),
    ("CSS揭秘", "Lea Verou", "#396afc", "#2948ff", "#a5f3fc"),
    ("深入浅出Vue.js", "刘博文", "#35495e", "#42b883", "#42b883"),
    ("算法导论", "Thomas H. Cormen", "#1a1a2e", "#16213e", "#e94560"),
    ("三体", "刘慈欣", "#0b0c10", "#1f2833", "#66fcf1"),
    ("活着", "余华", "#3e2723", "#5d4037", "#ffb74d"),
    ("百年孤独", "加西亚·马尔克斯", "#4a148c", "#6a1b9a", "#ce93d8"),
    ("人类简史", "尤瓦尔·赫拉利", "#004d40", "#00695c", "#80cbc4"),
    ("明朝那些事儿", "当年明月", "#bf360c", "#e64a19", "#ffcc80"),
    ("经济学原理", "N.格里高利·曼昆", "#0d47a1", "#1565c0", "#90caf9"),
    ("金字塔原理", "芭芭拉·明托", "#263238", "#37474f", "#ffd54f"),
    ("设计中的设计", "原研哉", "#37474f", "#546e7a", "#eceff1"),
    ("月亮与六便士", "毛姆", "#1b2631", "#2c3e50", "#f4d03f"),
    ("置身事内", "兰小欢", "#7b1fa2", "#9c27b0", "#e1bee7"),
    ("编码", "Charles Petzold", "#0d0d0d", "#333333", "#00e676"),
    ("小王子", "圣埃克苏佩里", "#0277bd", "#29b6f6", "#fff176"),
]

def wrap_text(text, max_chars):
    """按最大字数换行"""
    lines = []
    for i in range(0, len(text), max_chars):
        lines.append(text[i:i + max_chars])
    return lines

def make_svg(idx, title, author, c1, c2, accent):
    title_lines = wrap_text(title, 5)
    # 书名行最多取 3 行，超出的行字号减小
    line_h = 40
    if len(title_lines) > 3:
        title_lines = title_lines[:3]
    title_y = 168
    title_block = ""
    for i, line in enumerate(title_lines):
        y = title_y + i * line_h
        title_block += f'<text x="150" y="{y}" text-anchor="middle" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="30" font-weight="700" fill="#ffffff">{html.escape(line)}</text>\n'
    # 装饰圆
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
<!-- 背景 -->
<rect width="300" height="400" fill="url(#bg{idx})"/>
<!-- 书脊高光 -->
<rect x="0" y="0" width="10" height="400" fill="rgba(255,255,255,0.14)"/>
<rect x="10" y="0" width="3" height="400" fill="rgba(255,255,255,0.08)"/>
{circles}<!-- 顶部品牌栏 -->
<text x="150" y="58" text-anchor="middle" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="13" letter-spacing="4" fill="rgba(255,255,255,0.85)">青 阅 书 城</text>
<line x1="86" y1="72" x2="214" y2="72" stroke="{accent}" stroke-width="2" opacity="0.7"/>
<!-- 书名 -->
{title_block}
<!-- 分隔线 -->
<line x1="110" y1="286" x2="190" y2="286" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
<!-- 作者 -->
<text x="150" y="318" text-anchor="middle" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="17" fill="rgba(255,255,255,0.92)">{html.escape(author)}</text>
<!-- 底部序号 -->
<text x="150" y="372" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="6" fill="rgba(255,255,255,0.5)">QING YUE · {idx:02d}</text>
</svg>'''
    return svg

for i, (title, author, c1, c2, accent) in enumerate(BOOKS, 1):
    path = os.path.join(ROOT, f"book-{i:02d}.svg")
    with open(path, "w", encoding="utf-8") as f:
        f.write(make_svg(i, title, author, c1, c2, accent))
    print("generated", path)

print("DONE:", len(BOOKS), "covers")
