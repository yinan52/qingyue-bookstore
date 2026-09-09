# 📚 青阅书城 QingYue Bookstore

> 一站式校园数字图书商城 —— Web 前端设计与开发实训大作业

**主题**：校园数字图书商城，覆盖图书浏览、搜索、详情、购物车、收藏、订单、数据可视化、创意画板与多媒体视听等完整场景。

**开发周期**：2026.09.07 — 2026.09.20

**开发方式**：一人一题，独立完成（需求分析 → 系统设计 → 编码实现 → 测试优化 → 文档撰写 → 线上部署）

---

## 一、项目信息

| 项目 | 说明 |
| --- | --- |
| 项目名称 | 青阅书城（QingYue Bookstore） |
| 项目类型 | 纯前端静态网站（无后端，数据本地化 + 免费开源 API） |
| 页面数量 | 12 个（首页 / 图书商城 / 图书详情 / 购物车 / 登录 / 注册 / 个人中心 / 数据看板 / 创意画板 / 视听馆 / 关于我们 / 404） |
| 运行方式 | 双击 `index.html` 即可打开；推荐使用本地静态服务器以获得最佳体验 |
| 部署地址 | Gitee 仓库：https://gitee.com/yinan0828/qingyue-bookstore（代码托管，已上线） |

### 整体截图

> 截图见 `docs/screenshots/` 目录（运行验证时生成），README 中以文字描述关键模块：
>
> - 首页：Element Plus 轮播 Banner（自动播放 + 指示器 + 切换按钮）、6 分类导航、今日热卖 Grid 网格、新书上架、销量排行 TOP5、品牌数据动画、每日一言。
> - 图书商城：侧边分类筛选 + 搜索历史（localStorage）、排序工具栏（销量/价格/评分/最新）、分页、空状态。
> - 数据看板：ECharts 折线图（月度销量）、饼图（分类占比）、柱状图（出版社销量）、雷达图（评分维度）+ 热销明细表格。

---

## 二、技术栈清单

| 技术模块 | 应用场景 | 关键技术点 |
| --- | --- | --- |
| HTML5 语义化 | 全站 12 页 | `header/nav/main/section/article/aside/footer` 骨架；`h1` 唯一；`figure+figcaption`；`details+summary`；`form/input/select/textarea`；`type=email/tel` 控件 |
| CSS3 样式 | 全站 | CSS 变量（`--primary-color` 主题色）；`linear-gradient` 渐变（品牌渐变/热卖渐变）；`border-radius` 圆角；`box-shadow` 阴影；`transition` 过渡（导航 hover）；`animation` 关键帧（加载动画/浮动/弹跳/频谱） |
| CSS3 布局 | 全站 | Flexbox（导航/搜索栏/卡片）；Grid（图书网格/页脚四栏/统计卡片/图表网格）；盒子模型 margin/padding/border 规范控制 |
| CSS3 选择器 | 全站 | 标签/类/ID/通配符；后代（`.nav li`）、交集（`p.active`）、并集、伪类（`:hover/:nth-child`）、伪元素（`::before/::after` 装饰竖条、时间线中轴、展开箭头）、属性选择器（`input[type="color"]`）、子代选择器 |
| JavaScript 基础 | 全站 | `let/const`；数组 `for/forEach` 遍历；对象属性操作；5+ 自定义函数；箭头函数；`map/filter` 回调；`if-else/for/while/switch` 流程控制 |
| DOM 操作 | 全站 | `querySelector/querySelectorAll/getElementById`；`innerText/innerHTML`；`setAttribute`；`classList add/remove/toggle`；`DocumentFragment` 批量渲染；事件委托 `delegateEvent` |
| BOM 与本地存储 | 全站 | 自定义弹窗（Toast/Modal/Confirm 替代原生 `alert/confirm`）；`localStorage` 完整流程：购物车/收藏/浏览记录/用户/订单/搜索历史/主题偏好 |
| Canvas 与多媒体 | 数据看板/画板/视听馆/登录注册 | ECharts 4 类图表；Canvas 自由绘图（画笔/直线/矩形/圆形/橡皮 + 撤销 + 导出 PNG）；Canvas 随机验证码；`audio/video` + `source` 多格式（MP3/OGG/WAV、MP4/WebM）；自定义播放器 + Web Audio API 频谱可视化 |
| Element Plus（必做） | 首页/个人中心 | `el-carousel` 轮播；`el-menu` 折叠导航；`el-form` 表单；`el-button`、`el-input`；CDN 引入 + Layout 响应式 |
| Vue3（选做） | 购物车/个人中心 | CDN 引入；`createApp` 组件化；`v-model` 响应式数据绑定；`computed` 计算属性（合计/全选）；`methods` 事件方法 |
| Axios（选做） | 首页/关于页 | CDN 引入；远程 API 调用：一言（v1.hitokoto.cn）、公网 IP（api.ipify.org），实现前后端分离演示 |
| 网站部署（选做） | 全站 | 本地 HTTP 服务器部署 + 内网穿透方案 + Gitee/GitHub 静态托管教程 |

---

## 三、核心功能（需求 → 思路 → 代码片段）

### 功能 1：购物车（Vue3 响应式 + localStorage 持久化）

**需求**：用户可将图书加入购物车，修改数量、勾选结算，刷新后数据不丢失。

**思路**：购物车数据以 `[{id, qty, checked}]` 存入 `localStorage`；页面用 Vue3 `computed` 实时计算总价/件数，任何增减操作都同步写回存储，实现“存储→读取→修改→删除”完整闭环。

**代码片段**（`js/page/cart.js`）：

```js
computed: {
  totalPrice() {
    // 仅统计勾选商品，reduce 回调累加
    return this.cartItems
      .filter((i) => i.checked)
      .reduce((sum, i) => sum + i.price * i.qty, 0);
  }
},
methods: {
  changeQty(item, delta) {
    const next = item.qty + delta;
    if (next < 1 || next > 99) return;   // 数量边界控制
    item.qty = next;
    this.saveCartData();                 // 写回 localStorage
  },
  saveCartData() {
    saveCart(this.cartItems.map((i) => ({ id: i.id, qty: i.qty, checked: i.checked })));
  }
}
```

### 功能 2：图书搜索与多条件排序（URL 参数 + switch 流程控制）

**需求**：支持关键词搜索、分类筛选、销量/价格/评分/最新多种排序、分页浏览，并记录搜索历史。

**思路**：列表页从 `URLSearchParams` 读取 `category/keyword/sort` 参数；筛选用 `filter` 回调，排序用 `switch` 分支；搜索历史写入 `localStorage` 并支持单条删除/清空。

**代码片段**（`js/page/books.js`）：

```js
switch (state.sort) {
  case 'sales':     result.sort((a, b) => b.sales - a.sales); break;
  case 'priceAsc':  result.sort((a, b) => a.price - b.price); break;
  case 'rating':    result.sort((a, b) => b.rating - a.rating); break;
  default:          // 综合：热卖优先
    result.sort((a, b) => (b.isHot - a.isHot) || (b.sales - a.sales));
}
```

### 功能 3：ECharts 数据看板（Canvas 可视化）

**需求**：用图表直观呈现图书销售数据（趋势、占比、排行、维度对比）。

**思路**：引入 ECharts 5，分别使用 `line / pie / bar / radar` 四种系列；柱状图数据由 `data.js` 中图书数据按出版社聚合（`Object.entries().sort()`），折线图使用渐变面积填充，监听 `resize` 事件自适应窗口。

**代码片段**（`js/page/data.js`）：

```js
const pubMap = {};
BOOKS.forEach((b) => { pubMap[b.publisher] = (pubMap[b.publisher] || 0) + b.sales; });
const sorted = Object.entries(pubMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
// series: { type: 'bar', itemStyle: { color: new echarts.graphic.LinearGradient(...) } }
```

---

## 四、问题与解决（典型问题记录）

### 问题 1：本地 `file://` 打开时 CDN 库加载正常，但 Vue/Element Plus 渲染偶发白屏

- **现象**：首页轮播与购物车在直接双击打开时，偶见组件未挂载。
- **排查**：确认是脚本加载顺序问题 —— 页面脚本在 `DOMContentLoaded` 前执行，Vue 全局对象尚未就绪。
- **解决**：将第三方库脚本置于 `</body>` 之前、业务脚本之前按依赖顺序加载；同时在业务代码中做「CDN 加载失败降级」判断（`typeof Vue !== 'undefined'`），并给出离线提示；所有业务逻辑均以原生 JS 兜底，保证核心功能离线可用。

### 问题 2：购物车角标与导航状态在多个页面不同步

- **现象**：在详情页加入购物车后，返回首页角标未更新。
- **排查**：`updateCartBadge()` 只在当前页面加载时执行一次，跨页跳转属于全新页面加载，理论上应同步；但若使用 `location.href` 跳转回历史页面（浏览器后退），部分浏览器会走 `bfcache` 缓存导致脚本未重新执行。
- **解决**：在 `common.js` 的 `initLayout()` 中统一调用 `updateCartBadge()`，并监听 `pageshow` 事件强制刷新角标，保证任意入口下状态一致。

### 问题 3：Canvas 画板在高分屏（DPI 缩放）下绘制偏移

- **现象**：鼠标画线与光标位置错位。
- **排查**：`canvas` 逻辑尺寸（1000×620）与 CSS 显示尺寸不同，坐标换算未考虑 `getBoundingClientRect` 缩放比。
- **解决**：统一封装 `getPos(e)`，按 `canvas.width / rect.width` 与 `canvas.height / rect.height` 两轴比例换算坐标，同时兼容触摸事件。

---

## 五、优化方向（未实现/可扩展）

1. **后端化**：接入真实后端（Node/Java/Python）与数据库，将图书/用户/订单数据迁移至服务端，实现多端数据同步。
2. **推荐算法**：基于浏览记录与收藏的简单协同过滤，生成个性化「猜你喜欢」。
3. **PWA 化**：增加 Service Worker 与 manifest，实现离线缓存与安装到桌面。
4. **支付对接**：接入模拟支付流程（扫码/余额），完善订单状态机（待付款/待发货/已发货/已完成/售后）。
5. **无障碍优化**：补充完整的 ARIA 语义、键盘操作支持与对比度校验。

---

## 六、AI 编程辅助记录

本项目的开发全程使用了豆包 AI（Doubao）作为 AI 编程辅助工具：

- **需求分析**：辅助拆解任务书 11 个技术模块，形成功能覆盖矩阵与页面规划。
- **编码实现**：生成 12 个页面的 HTML/CSS/JS 骨架与核心交互逻辑，人工核对语义化标签与浏览器兼容性。
- **资源生成**：使用 Python 脚本生成 16 张图书封面 SVG、4 个头像、Logo、3 首纯音乐（WAV/MP3/OGG）。
- **测试与文档**：辅助编写测试用例、README 与课程大作业报告。
- **原则**：AI 生成的代码均经过人工阅读、验证与修正，确保理解每一行代码含义，符合课程「独立完成」要求。

---

## 七、部署上线

### 当前部署状态

- **Gitee 代码托管（已完成）**：项目已推送至公开仓库 https://gitee.com/yinan0828/qingyue-bookstore ，可在线查看与克隆全部源码。
- **本地部署（已完成）**：`python -m http.server` 本地服务运行正常，可直接演示。

### 方式 A：本地部署（已实现，推荐演示用）

```bash
# 在项目根目录启动任意静态服务器
python -m http.server 8080
# 或
npx serve .
```

访问 `http://localhost:8080` 即可。若需内网穿透公网访问，可使用 cpolar / 花生壳等工具（免费隧道需注册账号）。

### 方式 B：Gitee Pages（需实名认证，审核后生效）

1. 登录 Gitee，新建仓库（公开，命名如 `qingyue-bookstore`）；
2. 本地推送：

```bash
git init
git add .
git commit -m "青阅书城 QingYue Bookstore"
git remote add origin https://gitee.com/<你的用户名>/qingyue-bookstore.git
git push -u origin master
```

3. 仓库 → 服务 → Gitee Pages → 选择部署分支 `master`、目录 `/` → 启动，等待审核。

### 方式 C：GitHub Pages（免费，无需审核）

1. GitHub 新建仓库，推送代码（默认分支 `main`）；
2. 仓库 Settings → Pages → Source 选择 `Deploy from a branch` → 分支 `main`、目录 `/` → Save；
3. 访问 `https://<用户名>.github.io/<仓库名>/`。

---

## 八、文件目录说明

```
青阅书城/
├── index.html           # 首页（轮播/分类/热卖/新品/排行/一言）
├── books.html           # 图书商城（搜索/筛选/排序/分页）
├── detail.html          # 图书详情（信息/评论/收藏/购物车联动）
├── cart.html            # 购物车（Vue3 响应式）
├── login.html           # 登录（Canvas 验证码）
├── register.html        # 注册（全表单实时验证）
├── user.html            # 个人中心（Element Plus 菜单/收藏/订单/主题）
├── data.html            # 数据看板（ECharts 四图）
├── paint.html           # 创意画板（Canvas 绘图）
├── media.html           # 视听馆（音频播放器+频谱+视频）
├── about.html           # 关于我们（故事/历程/FAQ/联系）
├── 404.html             # 404 页面
├── README.md            # 项目说明书（本文件）
├── css/
│   ├── base.css         # 基础样式：重置 + CSS 变量 + 全局
│   ├── common.css       # 公共组件：导航/页脚/按钮/弹窗/表单/分页
│   └── page/            # 页面专属样式（与 HTML 一一对应）
├── js/
│   ├── data.js          # 全站图书数据源
│   ├── dom.js           # DOM 封装：选择/创建/委托/批量渲染
│   ├── common.js        # 公共函数：存储/验证/弹窗/购物车/验证码
│   └── page/            # 页面专属脚本（与 HTML 一一对应）
├── assets/
│   ├── images/          # 图片（banner/ 轮播、goods/ 图书封面、avatar/ 头像、about/）
│   ├── media/           # 多媒体（audio/ 三格式音频、video/ MP4+WebM）
│   └── icons/           # Logo / favicon
├── lib/                 # 第三方库目录（本项目使用 CDN 引入）
└── docs/screenshots/    # 运行截图
```

---

© 2026 青阅书城 QingYue Bookstore · 南昌大学软件学院《Web前端设计与开发实训》大作业
