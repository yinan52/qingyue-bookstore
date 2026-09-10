# lib/ — 第三方库目录

本目录用于存放项目依赖的第三方框架与库文件，按「CSS 库 → JS 库」分类。

## 当前引入方式

本项目所有第三方库均通过 **CDN 链接**引入（任务书规定"优先使用 CDN 链接；若需本地引入，必须放在该目录下"），无需在此目录存放实际文件。

| 库名称 | 版本 | 类型 | CDN 地址 | 应用页面 |
|--------|------|------|----------|----------|
| Vue3 | 3.4.27 | JS | `cdn.jsdelivr.net/npm/vue@3.4.27/dist/vue.global.prod.js` | index / cart / user |
| Element Plus | 2.7.0 | CSS+JS | `cdn.jsdelivr.net/npm/element-plus@2.7.0/dist/index.css` + `index.full.min.js` | index / user |
| ECharts | 5.5.0 | JS | CDN 引入 | data |
| Axios | 1.7.2 | JS | `cdn.jsdelivr.net/npm/axios@1.7.2/dist/axios.min.js` | index / about |
| Font Awesome | 6.5.2 | CSS | `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css` | 全部页面 |

## 本地引入说明

如需离线使用，可将上述库的 `.css` 文件下载至 `lib/css/`，`.js` 文件下载至 `lib/js/`，并将各 HTML 页面中的 CDN 链接替换为相对路径（如 `lib/css/element-plus/index.css`、`lib/js/vue.global.prod.js`）。
