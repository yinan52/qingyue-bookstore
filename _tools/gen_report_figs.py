# -*- coding: utf-8 -*-
"""
gen_report_figs.py —— 生成大作业报告所需的 3 张示意图
产物：docs/figures/mindmap.png（需求思维导图）
      docs/figures/flow.png（项目流程图）
      docs/figures/structure.png（功能模块结构图）
依赖：Pillow（PIL）、系统中文字体（微软雅黑/黑体）
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:\Users\Lenovo\Desktop\Web前端设计与开发实训\大作业\青阅书城"
OUT = os.path.join(ROOT, "docs", "figures")
os.makedirs(OUT, exist_ok=True)

F_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"   # 微软雅黑粗体
F_REG  = r"C:\Windows\Fonts\msyh.ttc"     # 微软雅黑
F_HEI  = r"C:\Windows\Fonts\simhei.ttf"   # 黑体

def font(path, size):
    return ImageFont.truetype(path, size)

# 品牌色
C_MAIN  = (51, 102, 204)     # 主蓝
C_DARK  = (30, 60, 120)
C_LIGHT = (220, 232, 252)
C_ORANGE= (240, 146, 66)
C_GREEN = (82, 170, 108)
C_GRAY  = (120, 128, 140)
C_TEXT  = (40, 46, 58)
C_WHITE = (255, 255, 255)

# ============================================================
# 1. 思维导图（功能需求）
# ============================================================
def mindmap():
    W, H = 2200, 1300
    img = Image.new("RGB", (W, H), C_WHITE)
    d = ImageDraw.Draw(img)
    cx, cy = 320, H // 2
    # 中心节点
    d.rounded_rectangle([cx-110, cy-55, cx+110, cy+55], radius=24, fill=C_MAIN)
    d.text((cx, cy-18), "青阅书城", font=font(F_BOLD, 34), fill=C_WHITE, anchor="mm")
    d.text((cx, cy+22), "数字图书商城", font=font(F_REG, 20), fill=(210, 224, 250), anchor="mm")

    branches = [
        ("图书浏览", C_MAIN, [
            "首页轮播 Banner（Element Plus）", "分类导航（6 大分类）", "热卖 / 新品 / 排行榜",
            "图书详情页（参数 / 简介）", "多条件搜索 + 搜索历史", "排序（销量/价格/评分/最新）", "分页浏览",
        ]),
        ("购物与订单", C_ORANGE, [
            "加入购物车（localStorage）", "Vue3 响应式购物车（全选/增减/删除）", "合计金额实时计算",
            "结算生成订单", "订单列表查询（个人中心）",
        ]),
        ("用户体系", C_GREEN, [
            "注册（表单实时验证 + 密码强度）", "登录（Canvas 验证码 + 记住用户名）",
            "收藏图书（本地存储）", "浏览足迹（自动记录）", "主题切换（暗色/亮色）",
        ]),
        ("数据可视化", C_DARK, [
            "ECharts 折线图（月度销量）", "ECharts 饼图（分类占比）",
            "ECharts 柱状图（出版社销量）", "ECharts 雷达图（评分维度）", "热销图书明细表",
        ]),
        ("创意与多媒体", (150, 80, 180), [
            "Canvas 自由画板（6 种工具 + 撤销）", "Canvas 随机验证码",
            "音频播放器 + Web Audio 频谱", "视频播放（MP4/WebM 双格式）",
        ]),
        ("辅助功能", C_GRAY, [
            "自定义弹窗（Toast/Modal/Confirm）", "404 错误页 + 自动返回", "关于我们（FAQ/联系表单）",
            "Axios 调用公开 API（一言/IP）", "响应式布局（移动端适配）",
        ]),
    ]

    # 右侧：上 3 下 3 分支
    xs = [cx + 320] * 6
    ys = [cy - 300, cy - 165, cy - 40, cy + 100, cy + 225, cy + 350]
    for (title, color, items), x, y in zip(branches, xs, ys):
        # 分支线
        d.line([cx + 110, cy, x, y], fill=color, width=6)
        # 分支标题框
        tw = d.textlength(title, font=font(F_BOLD, 28))
        d.rounded_rectangle([x, y-32, x + tw + 56, y+32], radius=16, fill=color)
        d.text((x + 28, y), title, font=font(F_BOLD, 28), fill=C_WHITE, anchor="lm")
        # 子项
        iy = y + 55
        for it in items:
            w0 = d.textlength(it, font=font(F_REG, 20))
            d.rounded_rectangle([x + 10, iy-18, x + 10 + w0 + 24, iy+18], radius=10,
                                fill=C_LIGHT, outline=(180, 200, 235), width=2)
            d.text((x + 22, iy), it, font=font(F_REG, 20), fill=C_TEXT, anchor="lm")
            iy += 46
    img.save(os.path.join(OUT, "mindmap.png"))
    print("mindmap.png saved")

# ============================================================
# 2. 项目流程图（瀑布式）
# ============================================================
def flow():
    W, H = 2100, 1250
    img = Image.new("RGB", (W, H), C_WHITE)
    d = ImageDraw.Draw(img)
    steps = [
        ("需求分析", "阅读任务书，梳理 11 个技术模块\n明确主题：校园数字图书商城", C_MAIN),
        ("系统设计", "确定 12 个页面与目录规范\n设计数据源（16 本图书）与存储方案", C_MAIN),
        ("资源准备", "生成 16 张 SVG 封面与 Logo\n合成 3 首音乐（WAV/MP3/OGG）\n准备轮播 Banner 与视频素材", C_ORANGE),
        ("编码实现", "基础层：base.css / common.css / dom.js / common.js\n页面层：12 个 HTML+CSS+JS 三件套\n框架层：Vue3、Element Plus、ECharts、Axios", C_DARK),
        ("测试验证", "本地服务器运行，逐页动态渲染验证\n死链检查、JS 控制台错误排查\n功能交互自测（购物车/登录/画板等）", C_GREEN),
        ("部署上线", "Gitee 代码托管与版本管理\n本地 HTTP 服务器 + 内网穿透方案\nREADME 部署文档", (150, 80, 180)),
        ("文档整理", "撰写大作业报告（需求/设计/实现/测试）\n填写自评表，打包交付", C_GRAY),
    ]
    # 蛇形布局：3 列
    col = [(360, 620, 880), (1080, 1340, 1600), (1800, 2060, 2320)]
    positions = []
    idx = 0
    for row in range(3):
        for c in range(3):
            if idx < len(steps):
                x0, x1, x2 = col[c]
                y = 120 + row * 350
                positions.append(((x0 + x1) // 2, y, c, row, idx))
                idx += 1
    # 画框
    for (bx, by, c, row, i) in positions:
        x0, x1, x2 = col[c]
        w = x2 - x0
        h = 210
        # 连接线（从左到右，行间蛇形）
        color = steps[i][2]
        d.rounded_rectangle([x0, by-105, x2, by+105], radius=20, fill=color)
        d.text((bx, by - 62), f"步骤{i+1}：{steps[i][0]}", font=font(F_BOLD, 30), fill=C_WHITE, anchor="mm")
        yy = by - 20
        for line in steps[i][1].split("\n"):
            d.text((bx, yy), line, font=font(F_REG, 19), fill=(235, 242, 255), anchor="mm")
            yy += 32
    # 连接线
    for k in range(len(positions) - 1):
        (x1, y1, c1, r1, _) = positions[k]
        (x2, y2, c2, r2, _) = positions[k + 1]
        if r1 == r2 and c2 == c1 + 1:
            d.line([x1, y1, x2, y2], fill=C_MAIN, width=5)
            d.polygon([(x2 - 18, y2 - 12), (x2 - 18, y2 + 12), (x2 + 6, y2)], fill=C_MAIN)
        else:  # 行尾下行
            d.line([x1, y1, x1, y1 + 140], fill=C_MAIN, width=5)
            d.line([x1, y1 + 140, x2, y1 + 140], fill=C_MAIN, width=5)
            d.line([x2, y1 + 140, x2, y2 - 100], fill=C_MAIN, width=5)
            d.polygon([(x2 - 18, y2 - 112), (x2 - 18, y2 - 88), (x2 + 6, y2 - 100)], fill=C_MAIN)
    # 图例
    d.text((W//2, H - 46), "图 2-1  项目开发流程图", font=font(F_BOLD, 26), fill=C_DARK, anchor="mm")
    img.save(os.path.join(OUT, "flow.png"))
    print("flow.png saved")

# ============================================================
# 3. 功能模块结构图（树状）
# ============================================================
def structure():
    W, H = 2300, 1500
    img = Image.new("RGB", (W, H), C_WHITE)
    d = ImageDraw.Draw(img)
    # 根
    d.rounded_rectangle([W//2 - 140, 30, W//2 + 140, 100], radius=16, fill=C_MAIN)
    d.text((W//2, 65), "青阅书城", font=font(F_BOLD, 30), fill=C_WHITE, anchor="mm")
    mods = [
        ("展示层", C_MAIN, ["首页", "图书商城", "图书详情", "404 页"]),
        ("业务层", C_ORANGE, ["购物车", "订单结算", "收藏管理", "浏览足迹"]),
        ("用户层", C_GREEN, ["注册登录", "个人中心", "表单验证", "主题切换"]),
        ("数据层", C_DARK, ["图书数据源", "localStorage", "ECharts 图表", "公开 API"]),
        ("多媒体", (150, 80, 180), ["Canvas 画板", "Canvas 验证码", "音频播放器", "视频播放"]),
        ("支撑层", C_GRAY, ["公共样式", "公共函数库", "Element Plus", "Vue3"]),
    ]
    cols = [200, 560, 920, 1280, 1640, 2000]
    cx = [260, 620, 980, 1340, 1700, 2060]
    cy0 = 190
    for (title, color, items), x, cxi in zip(mods, cols, cx):
        d.line([W//2, 100, cxi, 150], fill=C_MAIN, width=4)
        d.line([cxi, 150, cxi, cy0], fill=C_MAIN, width=4)
        d.rounded_rectangle([x, cy0 - 40, x + 120, cy0 + 40], radius=12, fill=color)
        d.text((x + 60, cy0), title, font=font(F_BOLD, 24), fill=C_WHITE, anchor="mm")
        iy = cy0 + 70
        for it in items:
            d.rounded_rectangle([x, iy - 26, x + 120, iy + 26], radius=10,
                                fill=(245, 247, 252), outline=(200, 210, 230), width=2)
            d.text((x + 60, iy), it, font=font(F_REG, 18), fill=C_TEXT, anchor="mm")
            iy += 62
    d.text((W//2, H - 40), "图 2-2  系统功能模块结构图", font=font(F_BOLD, 26), fill=C_DARK, anchor="mm")
    img.save(os.path.join(OUT, "structure.png"))
    print("structure.png saved")

if __name__ == "__main__":
    mindmap()
    flow()
    structure()
    print("ALL DONE ->", OUT)
