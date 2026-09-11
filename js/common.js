/* ==========================================================================
   common.js —— 公共函数文件（全站通用工具）
   说明：封装本地存储、表单验证、时间格式化、自定义弹窗、
   购物车 / 收藏 / 浏览记录 / 用户会话等通用逻辑，供所有页面调用。
   ========================================================================== */

/* ---------- 1. 本地存储封装 ---------- */

/** localStorage 存储键名统一管理 */
const STORAGE_KEYS = {
  CART: 'qy_cart',              // 购物车
  FAVORITES: 'qy_favorites',    // 收藏
  HISTORY: 'qy_history',        // 浏览记录
  USER: 'qy_user',              // 当前登录用户
  USERS: 'qy_users',            // 用户数据库
  THEME: 'qy_theme',            // 主题色（user.html 强调色 hex）
  SEARCH: 'qy_search_history',  // 搜索历史
  DARK_MODE: 'qy_dark_mode',    // 明暗模式偏好（light / dark）
  COUPON: 'qy_coupon'           // 购物车已选优惠券 id
};

/**
 * 从 localStorage 读取数据（自动 JSON 解析）
 * @param {string} key - 存储键名
 * @param {*} [defaultValue=null] - 无数据时的默认值
 * @returns {*} 解析后的数据
 */
function getStorage(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    // 优先尝试JSON解析，失败则返回原始字符串（兼容旧数据格式）
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (e) {
    console.warn('读取本地存储失败：', key, e);
    return defaultValue;
  }
}

/**
 * 写入数据到 localStorage（自动 JSON 序列化）
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的数据
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('写入本地存储失败：', key, e);
  }
}

/**
 * 删除 localStorage 中的指定数据
 * @param {string} key - 存储键名
 */
function removeStorage(key) {
  localStorage.removeItem(key);
}

/* ---------- 2. 时间与格式化工具 ---------- */

/**
 * 格式化时间戳为 YYYY-MM-DD HH:mm
 * @param {number|string|Date} time - 时间
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(time) {
  const d = time instanceof Date ? time : new Date(time);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 数字千分位格式化（如 86213 -> 86,213）
 * @param {number} num - 数字
 * @returns {string} 千分位字符串
 */
function formatNumber(num) {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 价格格式化（保留两位小数）
 * @param {number} price - 价格
 * @returns {string} 价格字符串
 */
function formatPrice(price) {
  return Number(price).toFixed(2);
}

/* ---------- 3. 表单验证工具 ---------- */

/**
 * 正则表达式：手机号（11 位，1 开头）
 */
const REG_MOBILE = /^1[3-9]\d{9}$/;

/**
 * 正则表达式：邮箱
 */
const REG_EMAIL = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/;

/**
 * 统一表单验证函数
 * @param {string} type - 验证类型：mobile/email/password/username/empty
 * @param {string} value - 待验证的值
 * @returns {boolean} 是否通过
 */
function formValidate(type, value) {
  const v = String(value || '').trim();
  switch (type) {
    case 'mobile':
      return REG_MOBILE.test(v);
    case 'email':
      return REG_EMAIL.test(v);
    case 'password':
      // 密码长度 ≥ 6 位，且包含字母与数字
      return v.length >= 6 && /[a-zA-Z]/.test(v) && /\d/.test(v);
    case 'username':
      // 用户名 2~16 位，字母/数字/下划线/中文
      return /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/.test(v);
    case 'empty':
      return v.length > 0;
    default:
      return true;
  }
}

/**
 * 校验并实时提示输入框（错误时边框变红 + 下方文字提示）
 * @param {HTMLInputElement} input - 输入框元素
 * @param {Function} validator - 校验函数，返回 { ok, msg }
 */
function bindValidateInput(input, validator) {
  if (!input) return;
  const tip = input.closest('.form-item')?.querySelector('.form-tip');
  input.addEventListener('input', () => {
    const result = validator(input.value);
    if (result.ok) {
      input.classList.remove('error');
      if (tip) tip.textContent = '';
    } else {
      input.classList.add('error');
      if (tip) tip.textContent = result.msg;
    }
  });
  input.addEventListener('blur', () => {
    const result = validator(input.value);
    if (!result.ok) {
      input.classList.add('error');
      if (tip) tip.textContent = result.msg;
    }
  });
}

/* ---------- 4. 自定义弹窗（替代原生 alert / confirm / prompt） ---------- */

/**
 * 弹出 Toast 轻提示（自动消失）
 * @param {string} msg - 提示文本
 * @param {string} [type='success'] - success / error / warning / info
 * @param {number} [duration=2200] - 显示时长 ms
 */
function showToast(msg, type = 'success', duration = 2200) {
  let toastBox = getElement('.toast-box');
  if (!toastBox) {
    toastBox = createElement('div', { class: 'toast-box' });
    document.body.appendChild(toastBox);
  }
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const toast = createElement('div', {
    class: `toast toast-${type}`,
    html: `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${msg}</span>`
  });
  toastBox.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/**
 * 弹出确认框（替代原生 confirm）
 * @param {Object} options - { title, message, okText, cancelText, type }
 * @returns {Promise<boolean>} 用户是否确认
 */
function showConfirm(options = {}) {
  return new Promise((resolve) => {
    const {
      title = '确认操作',
      message = '确定要执行此操作吗？',
      okText = '确定',
      cancelText = '取消',
      type = 'info'
    } = options;
    const mask = createElement('div', {
      class: 'modal-mask show',
      html: `
        <div class="modal-box">
          <div class="modal-icon icon-${type}"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h3>${title}</h3>
          <p class="modal-msg">${message}</p>
          <div class="modal-btns">
            <button class="btn btn-gray modal-cancel">${cancelText}</button>
            <button class="btn btn-primary modal-ok">${okText}</button>
          </div>
        </div>`
    });
    document.body.appendChild(mask);
    const close = (result) => {
      mask.classList.remove('show');
      setTimeout(() => mask.remove(), 300);
      resolve(result);
    };
    getElement('.modal-ok', mask).addEventListener('click', () => close(true));
    getElement('.modal-cancel', mask).addEventListener('click', () => close(false));
    mask.addEventListener('click', (e) => {
      if (e.target === mask) close(false);
    });
  });
}

/**
 * 弹出消息框（替代原生 alert）
 * @param {Object} options - { title, message, type }
 * @returns {Promise<void>}
 */
function showModal(options = {}) {
  return new Promise((resolve) => {
    const {
      title = '提示',
      message = '',
      type = 'info'
    } = options;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const mask = createElement('div', {
      class: 'modal-mask show',
      html: `
        <div class="modal-box">
          <div class="modal-icon icon-${type}"><i class="fa-solid ${icons[type] || icons.info}"></i></div>
          <h3>${title}</h3>
          <p class="modal-msg">${message}</p>
          <div class="modal-btns">
            <button class="btn btn-primary modal-ok">知道了</button>
          </div>
        </div>`
    });
    document.body.appendChild(mask);
    getElement('.modal-ok', mask).addEventListener('click', () => {
      mask.classList.remove('show');
      setTimeout(() => mask.remove(), 300);
      resolve();
    });
  });
}

/* ---------- 5. 购物车逻辑 ---------- */

/**
 * 获取购物车数据
 * @returns {Array} 购物车数组 [{ id, qty, checked }]
 */
function getCart() {
  return getStorage(STORAGE_KEYS.CART, []);
}

/**
 * 保存购物车数据
 * @param {Array} cart - 购物车数组
 */
function saveCart(cart) {
  setStorage(STORAGE_KEYS.CART, cart);
  updateCartBadge();
}

/**
 * 加入购物车
 * @param {number} bookId - 图书 id
 * @param {number} [qty=1] - 数量
 * @returns {Array} 更新后的购物车
 */
function addToCart(bookId, qty = 1) {
  const cart = getCart();
  const exist = cart.find((item) => item.id === bookId);
  if (exist) {
    exist.qty = Math.min(exist.qty + qty, 99);
  } else {
    cart.push({ id: bookId, qty: Math.max(1, qty), checked: true });
  }
  saveCart(cart);
  return cart;
}

/**
 * 修改购物车中商品数量
 * @param {number} bookId - 图书 id
 * @param {number} delta - 增量（±1）
 */
function updateCartQty(bookId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === bookId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    return removeFromCart(bookId);
  }
  item.qty = Math.min(item.qty, 99);
  saveCart(cart);
}

/**
 * 从购物车删除商品
 * @param {number} bookId - 图书 id
 */
function removeFromCart(bookId) {
  let cart = getCart();
  cart = cart.filter((i) => i.id !== bookId);
  saveCart(cart);
}

/**
 * 计算购物车选中商品总价 / 总件数
 * @returns {{ totalPrice: number, totalCount: number, totalQty: number }}
 */
function calcCartTotal() {
  const cart = getCart();
  let totalPrice = 0;
  let totalCount = 0;
  let totalQty = 0;
  cart.forEach((item) => {
    if (!item.checked) return;
    const book = BOOKS.find((b) => b.id === item.id);
    if (!book) return;
    totalPrice += book.price * item.qty;
    totalCount += 1;
    totalQty += item.qty;
  });
  return { totalPrice: Math.round(totalPrice * 100) / 100, totalCount, totalQty };
}

/**
 * 清空购物车
 */
function clearCart() {
  saveCart([]);
}

/**
 * 更新导航栏购物车角标
 */
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badges = getElements('.cart-badge');
  badges.forEach((badge) => {
    badge.textContent = total > 99 ? '99+' : total;
    badge.classList.toggle('show', total > 0);
  });
}

/* ---------- 6. 收藏逻辑（存储 → 读取 → 修改 → 删除 完整流程） ---------- */

/**
 * 获取收藏列表
 * @returns {Array} 收藏的图书 id 数组
 */
function getFavorites() {
  return getStorage(STORAGE_KEYS.FAVORITES, []);
}

/**
 * 是否已收藏
 * @param {number} bookId - 图书 id
 * @returns {boolean}
 */
function isFavorite(bookId) {
  return getFavorites().includes(bookId);
}

/**
 * 切换收藏状态（新增 / 删除）
 * @param {number} bookId - 图书 id
 * @returns {boolean} 操作后的收藏状态
 */
function toggleFavorite(bookId) {
  let favorites = getFavorites();
  let added = false;
  if (favorites.includes(bookId)) {
    favorites = favorites.filter((id) => id !== bookId);
  } else {
    favorites.unshift(bookId);
    added = true;
  }
  setStorage(STORAGE_KEYS.FAVORITES, favorites);
  showToast(added ? '收藏成功' : '已取消收藏', added ? 'success' : 'info');
  return added;
}

/* ---------- 7. 浏览记录 ---------- */

/**
 * 记录图书浏览足迹（去重 + 最多保留 20 条）
 * @param {number} bookId - 图书 id
 */
function addHistory(bookId) {
  let history = getStorage(STORAGE_KEYS.HISTORY, []);
  history = history.filter((id) => id !== bookId);
  history.unshift(bookId);
  if (history.length > 20) history = history.slice(0, 20);
  setStorage(STORAGE_KEYS.HISTORY, history);
}

/**
 * 获取浏览记录
 * @returns {Array} 图书 id 数组（新→旧）
 */
function getHistory() {
  return getStorage(STORAGE_KEYS.HISTORY, []);
}

/**
 * 清空浏览记录
 */
function clearHistory() {
  setStorage(STORAGE_KEYS.HISTORY, []);
}

/* ---------- 8. 用户会话 ---------- */

/**
 * 获取当前登录用户
 * @returns {Object|null} 用户对象或 null
 */
function getCurrentUser() {
  return getStorage(STORAGE_KEYS.USER, null);
}

/**
 * 是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * 登录：校验用户名密码并写入会话
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {{ ok: boolean, msg: string }}
 */
function loginUser(username, password) {
  const users = getStorage(STORAGE_KEYS.USERS, []);
  const user = users.find((u) => u.username === username);
  if (!user) return { ok: false, msg: '用户名不存在，请先注册' };
  if (user.password !== password) return { ok: false, msg: '密码错误，请重新输入' };
  const safeUser = { ...user };
  delete safeUser.password;
  safeUser.lastLogin = Date.now();
  setStorage(STORAGE_KEYS.USER, safeUser);
  // 更新用户库中的最近登录时间
  user.lastLogin = Date.now();
  setStorage(STORAGE_KEYS.USERS, users);
  return { ok: true, msg: '登录成功' };
}

/**
 * 退出登录
 */
function logoutUser() {
  removeStorage(STORAGE_KEYS.USER);
  showToast('已退出登录', 'info');
  setTimeout(() => { location.href = 'index.html'; }, 900);
}

/**
 * 注册新用户
 * @param {Object} info - { username, password, mobile, email }
 * @returns {{ ok: boolean, msg: string }}
 */
function registerUser(info) {
  const users = getStorage(STORAGE_KEYS.USERS, []);
  if (users.some((u) => u.username === info.username)) {
    return { ok: false, msg: '用户名已被注册' };
  }
  const newUser = {
    id: users.length + 1,
    username: info.username,
    password: info.password,
    mobile: info.mobile,
    email: info.email || '',
    nickname: info.username,
    avatar: 'assets/images/avatar/avatar-default.svg',
    registerTime: Date.now(),
    lastLogin: null
  };
  users.push(newUser);
  setStorage(STORAGE_KEYS.USERS, users);
  return { ok: true, msg: '注册成功' };
}

/* ---------- 10. Canvas 验证码（随机字符 + 干扰线/噪点） ---------- */

/** 当前验证码字符（供校验使用） */
let captchaCode = '';

/**
 * 在指定 canvas 上绘制随机验证码
 * @param {HTMLCanvasElement} canvas - canvas 元素
 * @returns {string} 生成的 4 位验证码
 */
function createCaptcha(canvas) {
  if (!canvas) return '';
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  // 随机字符集（去除易混淆的 0/O、1/I）
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  captchaCode = '';
  // 背景
  ctx.fillStyle = '#F0F3F8';
  ctx.fillRect(0, 0, width, height);

  // 干扰线（for 循环 + 随机）
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 180 + 40)}, ${Math.floor(Math.random() * 180 + 40)}, ${Math.floor(Math.random() * 220 + 30)}, 0.5)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 字符（每个字符随机旋转、颜色、位置）
  for (let i = 0; i < 4; i++) {
    const ch = chars[Math.floor(Math.random() * chars.length)];
    captchaCode += ch;
    ctx.save();
    ctx.font = `${Math.floor(Math.random() * 8 + 22)}px "PingFang SC","Microsoft YaHei",Arial`;
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 120 + 20)}, ${Math.floor(Math.random() * 120 + 20)}, ${Math.floor(Math.random() * 160 + 40)})`;
    const x = 14 + i * 26 + Math.random() * 6;
    const y = 24 + Math.random() * 10;
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.6);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }

  // 噪点（for 循环）
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.4)`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return captchaCode;
}

/**
 * 校验用户输入的验证码
 * @param {string} input - 用户输入
 * @returns {boolean} 是否匹配（忽略大小写）
 */
function verifyCaptcha(input) {
  return String(input || '').trim().toLowerCase() === captchaCode.toLowerCase();
}

/* ==========================================================================
   以下为本次升级新增：明暗主题 / 回到顶部 / 滚动动画 / 微交互 /
   图书快速预览 / 搜索自动补全 等全站通用能力
   ========================================================================== */

/* ---------- A1. 全站明暗主题切换 ---------- */

/**
 * 应用明暗模式到 <html> 根节点
 * @param {string} mode - 'light' | 'dark'
 */
function applyDarkMode(mode) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
  // 同步切换按钮图标
  const btn = getElement('.theme-toggle');
  if (btn) {
    btn.innerHTML = mode === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }
}

/**
 * 初始化明暗主题：读取偏好 + 注入切换按钮 + 绑定事件
 */
function initTheme() {
  const headerTools = getElement('.header-tools');
  // 注入主题切换按钮（避免逐个 HTML 手写，保证所有页面一致）
  if (headerTools && !getElement('.theme-toggle', headerTools)) {
    const toggle = createElement('button', {
      class: 'theme-toggle',
      attrs: { id: 'themeToggle', 'aria-label': '切换明暗主题', title: '切换明暗主题' }
    });
    headerTools.insertBefore(toggle, headerTools.firstChild);
    toggle.addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      // 短暂加过渡类，实现 0.3s 平滑切换
      document.documentElement.classList.add('theme-transition');
      applyDarkMode(next);
      setStorage(STORAGE_KEYS.DARK_MODE, next);
      toggle.classList.add('spin');
      setTimeout(() => {
        toggle.classList.remove('spin');
        document.documentElement.classList.remove('theme-transition');
      }, 400);
      showToast(next === 'dark' ? '已切换到深色模式' : '已切换到浅色模式', 'info', 1200);
    });
  }
  // 应用已保存的偏好（无记录则默认浅色）
  const saved = getStorage(STORAGE_KEYS.DARK_MODE, 'light');
  applyDarkMode(saved === 'dark' ? 'dark' : 'light');
}

/* ---------- A2. 回到顶部 + 滚动进度条 ---------- */

/**
 * 初始化回到顶部按钮与顶部阅读进度条
 */
function initScrollTools() {
  // 注入进度条
  let progress = getElement('.scroll-progress');
  if (!progress) {
    progress = createElement('div', { class: 'scroll-progress' });
    document.body.appendChild(progress);
  }
  // 注入回到顶部按钮
  let backTop = getElement('.back-to-top');
  if (!backTop) {
    backTop = createElement('button', {
      class: 'back-to-top',
      attrs: { 'aria-label': '回到顶部', title: '回到顶部' },
      html: '<i class="fa-solid fa-arrow-up"></i>'
    });
    document.body.appendChild(backTop);
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // 滚动监听：更新进度条宽度 + 按钮显隐
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? (window.scrollY / docHeight) : 0;
    progress.style.width = (ratio * 100).toFixed(2) + '%';
    backTop.classList.toggle('show', window.scrollY > 300);
  }, { passive: true });
}

/* ---------- A3. 滚动进入动画 ---------- */

/**
 * 初始化 IntersectionObserver：带 .animate-on-scroll 的元素进入视口时加 .visible
 */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    // 降级：直接全部显示
    getElements('.animate-on-scroll').forEach((el) => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  const watch = () => {
    getElements('.animate-on-scroll:not(.visible)').forEach((el) => observer.observe(el));
  };
  watch();
  // 动态渲染的内容（如图书卡片）也能被观察
  new MutationObserver(watch).observe(document.body, { childList: true, subtree: true });
}

/* ---------- A4. 微交互：卡片 3D 倾斜 ---------- */

/**
 * 初始化卡片 3D 倾斜（mousemove 计算 rotateX/rotateY）
 */
function initCardTilt() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.card-tilt');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.card-tilt');
    if (card && !card.contains(e.relatedTarget)) {
      card.style.transform = '';
    }
  });
}

/* ---------- A4. 微交互：按钮波纹 ---------- */

/**
 * 初始化按钮点击波纹效果（事件委托到 document）
 */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ink = createElement('span', { class: 'ripple-ink' });
    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ink.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ink);
    setTimeout(() => ink.remove(), 600);
  });
}

/* ---------- A4. 图片懒加载（data-src） ---------- */

/**
 * 初始化图片懒加载：img[data-src] 进入视口后才加载并淡入
 */
function initLazyLoad() {
  const loadImg = (img) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    img.classList.add('loaded');
  };
  if (!('IntersectionObserver' in window)) {
    getElements('img[data-src]').forEach(loadImg);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadImg(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });
  const scan = () => {
    getElements('img[data-src]').forEach((img) => {
      if (!img.dataset.watched) {
        img.dataset.watched = '1';
        img.classList.add('lazy-img');
        observer.observe(img);
      }
    });
  };
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}

/* ---------- B1. 图书快速预览弹窗 ---------- */

/**
 * 弹出图书快速预览 modal
 * @param {number} bookId - 图书 id
 */
function showBookPreview(bookId) {
  const book = (typeof BOOKS !== 'undefined') && BOOKS.find((b) => b.id === bookId);
  if (!book) {
    showToast('未找到该图书', 'error');
    return;
  }
  // 关闭已有预览
  getElement('.preview-mask')?.remove();
  const tagsHtml = book.tags.map((t) => `<span class="tag tag-blue">${t}</span>`).join('');
  const mask = createElement('div', {
    class: 'preview-mask',
    html: `
      <div class="book-preview-modal">
        <button class="preview-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
        <div class="preview-layout">
          <div class="preview-cover">
            <img src="${book.cover}" alt="《${book.title}》封面">
          </div>
          <div class="preview-info">
            <h3>${book.title}</h3>
            <p class="preview-author">${book.author} 著 · ${book.publisher}</p>
            <div class="preview-price-row">
              <span class="preview-price">¥${formatPrice(book.price)}</span>
              ${book.originalPrice > book.price ? `<span class="preview-original">¥${formatPrice(book.originalPrice)}</span>` : ''}
            </div>
            <div class="preview-stats">
              <span class="stars"><i class="fa-solid fa-star"></i> ${book.rating} 分</span>
              <span>已售 ${formatNumber(book.sales)} 册</span>
              <span>库存 ${book.stock} 件</span>
            </div>
            <div class="preview-tags">${tagsHtml}</div>
            <p class="preview-desc">${book.desc.slice(0, 110)}…</p>
            <div class="preview-actions">
              <button class="btn btn-primary" data-act="addcart"><i class="fa-solid fa-cart-shopping"></i> 加入购物车</button>
              <button class="btn btn-outline" data-act="detail">查看详情 <i class="fa-solid fa-angle-right"></i></button>
            </div>
          </div>
        </div>
      </div>`
  });
  document.body.appendChild(mask);
  requestAnimationFrame(() => mask.classList.add('show'));
  const close = () => {
    mask.classList.remove('show');
    setTimeout(() => mask.remove(), 300);
  };
  getElement('.preview-close', mask).addEventListener('click', close);
  mask.addEventListener('click', (e) => { if (e.target === mask) close(); });
  getElement('[data-act="addcart"]', mask).addEventListener('click', () => {
    addToCart(book.id, 1);
    showToast('已加入购物车', 'success');
    close();
  });
  getElement('[data-act="detail"]', mask).addEventListener('click', () => {
    location.href = `detail.html?id=${book.id}`;
  });
}

/* ---------- B4. 搜索自动补全（可复用） ---------- */

/**
 * 为输入框绑定搜索自动补全
 * @param {HTMLInputElement} input - 搜索输入框
 * @param {Object} [opts] - { onSelect(kw) } 选中/回车后的回调
 */
function initSearchAutocomplete(input, opts = {}) {
  if (!input) return;
  const box = createElement('div', { class: 'search-suggestions' });
  // 外层包一层 relative 容器
  const wrap = document.createElement('div');
  wrap.className = 'search-box';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);
  wrap.appendChild(box);

  let activeIdx = -1;
  let currentList = [];

  const highlight = (text, kw) => {
    const safe = text.replace(/</g, '&lt;');
    const safeKw = kw.replace(/</g, '&lt;');
    return safe.replace(new RegExp(safeKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), (m) => `<mark>${m}</mark>`);
  };

  const render = (kw) => {
    currentList = BOOKS.filter((b) => b.title.toLowerCase().includes(kw.toLowerCase())).slice(0, 8);
    activeIdx = -1;
    box.innerHTML = '';
    if (!kw || currentList.length === 0) {
      box.classList.remove('show');
      return;
    }
    currentList.forEach((book, i) => {
      const item = createElement('div', {
        class: 'suggest-item',
        attrs: { 'data-i': i },
        html: `<img class="sug-cover" src="${book.cover}" alt=""><span class="sug-title">${highlight(book.title, kw)}</span><span class="sug-price">¥${formatPrice(book.price)}</span>`
      });
      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 避免 input 失焦
        choose(book.title);
      });
      box.appendChild(item);
    });
    box.classList.add('show');
  };

  const choose = (kw) => {
    input.value = kw;
    box.classList.remove('show');
    if (typeof opts.onSelect === 'function') opts.onSelect(kw);
  };

  input.addEventListener('input', () => render(input.value.trim()));
  input.addEventListener('focus', () => {
    if (box.children.length) box.classList.add('show');
  });
  input.addEventListener('keydown', (e) => {
    const items = box.children;
    if (!box.classList.contains('show') || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = (activeIdx + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = (activeIdx - 1 + items.length) % items.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        choose(currentList[activeIdx].title);
      } else {
        box.classList.remove('show');
        if (typeof opts.onSelect === 'function') opts.onSelect(input.value.trim());
      }
      return;
    } else if (e.key === 'Escape') {
      box.classList.remove('show');
      return;
    } else {
      return;
    }
    Array.from(items).forEach((it, i) => it.classList.toggle('active', i === activeIdx));
  });
  // 点击外部关闭
  document.addEventListener('mousedown', (e) => {
    if (!wrap.contains(e.target)) box.classList.remove('show');
  });
}

/* ---------- 11. 页面公共布局渲染 ---------- */

/**
 * 渲染导航栏用户区域（登录/退出状态切换）
 */
function renderUserArea() {
  const user = getCurrentUser();
  const loginBtn = getElement('.login-area');
  const userArea = getElement('.user-area');
  if (!loginBtn || !userArea) return;
  if (user) {
    loginBtn.classList.add('hidden');
    userArea.classList.remove('hidden');
    const avatar = getElement('.user-area .user-avatar', userArea);
    if (avatar) avatar.src = user.avatar || 'assets/images/avatar/avatar-default.svg';
    const name = getElement('.user-area .user-name', userArea);
    if (name) name.textContent = user.nickname || user.username;
  } else {
    loginBtn.classList.remove('hidden');
    userArea.classList.add('hidden');
  }
}

/**
 * 初始化公共导航栏（高亮当前页 + 渲染用户区 + 购物车角标）
 * @param {string} currentPage - 当前页面文件名，如 'index.html'
 */
function initLayout(currentPage) {
  // 高亮当前页导航
  const navLinks = getElements('.main-nav a[data-page]');
  navLinks.forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });

  // 滚动时给头部加阴影
  window.addEventListener('scroll', () => {
    const header = getElement('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
  });

  // 移动端导航展开/收起
  const navToggle = getElement('.nav-toggle');
  const mainNav = getElement('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
    // 点击导航项后自动收起
    mainNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') mainNav.classList.remove('open');
    });
  }

  // 搜索框回车跳转搜索页
  const searchInput = getElement('#headerSearch');
  const searchBtn = getElement('#headerSearchBtn');
  const doSearch = () => {
    const kw = (searchInput && searchInput.value.trim()) || '';
    location.href = `books.html?keyword=${encodeURIComponent(kw)}`;
  };
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }
  if (searchBtn) searchBtn.addEventListener('click', doSearch);

  // header 搜索框自动补全（回车即跳转搜索页）
  if (searchInput && typeof BOOKS !== 'undefined') {
    initSearchAutocomplete(searchInput, (kw) => {
      if (kw) location.href = `books.html?keyword=${encodeURIComponent(kw)}`;
    });
  }

  renderUserArea();
  updateCartBadge();

  /* —— 全站升级：明暗主题 / 回到顶部 / 滚动动画 / 微交互 / 懒加载 —— */
  initTheme();
  initScrollTools();
  initScrollAnimations();
  initCardTilt();
  initRipple();
  initLazyLoad();
}

/**
 * 初始化页面加载动画（淡出）
 */
function initPageLoading() {
  const loader = getElement('.page-loading');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 200);
  });
  // 兜底：2.5 秒后强制隐藏
  setTimeout(() => loader.classList.add('done'), 2500);
}

/**
 * 渲染页脚当前年份
 */
function renderFooterYear() {
  const yearEls = getElements('.footer-year');
  yearEls.forEach((el) => { el.textContent = new Date().getFullYear(); });
}
