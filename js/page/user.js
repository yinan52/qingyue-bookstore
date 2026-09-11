/* ==========================================================================
   user.js —— 仅作用于 user.html（个人中心）
   功能：Element Plus 折叠导航、收藏/浏览记录/订单管理（localStorage）、
   个人资料编辑（el-form）、主题配色切换（localStorage 持久化）
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 主题切换（localStorage 持久化） ---------- */
  const THEMES = [
    { name: '青蓝', value: '#165DFF', color: '#165DFF' },
    { name: '翠绿', value: '#00B42A', color: '#00B42A' },
    { name: '活力橙', value: '#FF7D00', color: '#FF7D00' },
    { name: '葡萄紫', value: '#722ED1', color: '#722ED1' },
    { name: '玫瑰红', value: '#F53F3F', color: '#F53F3F' },
    { name: '星空蓝', value: '#0E42D2', color: '#0E42D2' }
  ];

  function applyTheme(hex) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', hex);
    // 依据主色生成浅色/深色（简单亮度调整）
    root.style.setProperty('--primary-light', lighten(hex, 0.35));
    root.style.setProperty('--primary-dark', darken(hex, 0.25));
  }

  /* 颜色工具（对象操作 + 进制转换） */
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  function rgbToHex(r, g, b) {
    const to = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return '#' + to(r) + to(g) + to(b);
  }

  function lighten(hex, ratio) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r + (255 - r) * ratio, g + (255 - g) * ratio, b + (255 - b) * ratio);
  }

  function darken(hex, ratio) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r * (1 - ratio), g * (1 - ratio), b * (1 - ratio));
  }

  /* ---------- 2. 挂载 Vue 应用 ---------- */
  function mountApp() {
    const user = getCurrentUser();
    const savedTheme = getStorage(STORAGE_KEYS.THEME, '#165DFF');
    applyTheme(savedTheme);

    const app = Vue.createApp({
      data() {
        return {
          user,
          activeTab: 'overview',
          menuCollapsed: false,
          themes: THEMES,
          theme: savedTheme,
          profileForm: {
            username: user?.username || '',
            nickname: user?.nickname || '',
            mobile: user?.mobile || '',
            email: user?.email || '',
            signature: user?.signature || ''
          },
          // 收货地址
          addressDialogVisible: false,
          addressFormRef: null,
          addressForm: this._emptyAddressForm(),
          addressRules: {
            name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
            phone: [
              { required: true, message: '请输入手机号', trigger: 'blur' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
            ],
            province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
            city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
            district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
            detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
          },
          addresses: []
        };
      },
      computed: {
        favorites() {
          return getFavorites();
        },
        favBooks() {
          return getFavorites().map((id) => BOOKS.find((b) => b.id === id)).filter(Boolean);
        },
        history() {
          return getHistory();
        },
        historyBooks() {
          return getHistory().map((id) => BOOKS.find((b) => b.id === id)).filter(Boolean);
        },
        orders() {
          if (!this.user) return [];
          // 真实订单（本地生成）+ 示例订单（用于演示物流时间线）
          const mine = getStorage('qy_orders', []).filter((o) => o.user === this.user.username);
          const samples = (typeof ORDERS !== 'undefined') ? ORDERS : [];
          return [...mine, ...samples];
        },
        cartCount() {
          return getCart().reduce((s, i) => s + i.qty, 0);
        },
        overviewStats() {
          return [
            { icon: 'fa-solid fa-heart', value: this.favorites.length, label: '收藏', tab: 'favorites' },
            { icon: 'fa-solid fa-receipt', value: this.orders.length, label: '订单', tab: 'orders' },
            { icon: 'fa-solid fa-clock-rotate-left', value: this.history.length, label: '浏览', tab: 'history' },
            { icon: 'fa-solid fa-cart-shopping', value: this.cartCount, label: '购物车', tab: '' }
          ];
        },
        registerTime() {
          return this.user ? formatTime(this.user.registerTime) : '';
        },
        lastLogin() {
          return this.user && this.user.lastLogin ? formatTime(this.user.lastLogin) : '';
        }
      },
      methods: {
        onSelect(index) {
          this.activeTab = index;
        },
        goDetail(id) {
          location.href = `detail.html?id=${id}`;
        },
        /* 取消收藏（删除） */
        unfav(id) {
          let favs = getFavorites();
          favs = favs.filter((f) => f !== id);
          setStorage(STORAGE_KEYS.FAVORITES, favs);
          showToast('已取消收藏', 'info');
        },
        /* 清空浏览记录 */
        async clearHistoryAll() {
          const ok = await showConfirm({ title: '清空记录', message: '确定要清空全部浏览记录吗？' });
          if (ok) {
            clearHistory();
            showToast('已清空', 'success');
          }
        },
        /* 保存个人资料（修改） */
        saveProfile() {
          if (!this.user) return;
          const users = getStorage(STORAGE_KEYS.USERS, []);
          const u = users.find((x) => x.username === this.user.username);
          if (u) {
            u.nickname = this.profileForm.nickname || u.nickname;
            u.email = this.profileForm.email;
            u.signature = this.profileForm.signature;
            setStorage(STORAGE_KEYS.USERS, users);
          }
          // 同步会话
          const cur = getCurrentUser();
          cur.nickname = this.profileForm.nickname || cur.nickname;
          cur.email = this.profileForm.email;
          cur.signature = this.profileForm.signature;
          setStorage(STORAGE_KEYS.USER, cur);
          this.user = cur;
          showToast('资料已保存', 'success');
        },
        /* 切换主题 */
        setTheme(value) {
          this.theme = value;
          setStorage(STORAGE_KEYS.THEME, value);
          applyTheme(value);
          showToast('主题已更新', 'success');
        },
        /* 退出登录 */
        doLogout() {
          logoutUser();
        },

        /* 收货地址：从 localStorage 加载到响应式数组 */
        loadAddresses() {
          if (!this.user) { this.addresses = []; return; }
          this.addresses = getStorage('qy_addresses_' + this.user.username, []);
        },
        /* 收货地址：空表单 */
        _emptyAddressForm() {
          return { id: null, name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false };
        },
        /* 收货地址：打开新增/编辑弹窗 */
        openAddressDialog(addr) {
          if (addr) {
            this.addressForm = { ...addr };
          } else {
            this.addressForm = this._emptyAddressForm();
          }
          this.addressDialogVisible = true;
          this.$nextTick(() => {
            if (this.addressFormRef) this.addressFormRef.clearValidate();
          });
        },
        /* 收货地址：保存（新增或编辑） */
        saveAddress() {
          this.$refs.addressFormRef.validate((valid) => {
            if (!valid) return;
            if (!this.user) return;
            const key = 'qy_addresses_' + this.user.username;
            let list = getStorage(key, []);
            const form = { ...this.addressForm };
            if (form.isDefault) {
              list.forEach((a) => (a.isDefault = false));
            }
            if (form.id) {
              const idx = list.findIndex((a) => a.id === form.id);
              if (idx > -1) list[idx] = form;
            } else {
              form.id = 'addr_' + Date.now();
              if (list.length === 0) form.isDefault = true;
              list.push(form);
            }
            setStorage(key, list);
            this.addresses = list;
            this.addressDialogVisible = false;
            showToast(form.id ? '地址已更新' : '地址已添加', 'success');
          });
        },
        /* 收货地址：设为默认 */
        setDefaultAddress(id) {
          if (!this.user) return;
          const key = 'qy_addresses_' + this.user.username;
          const list = getStorage(key, []);
          list.forEach((a) => (a.isDefault = a.id === id));
          setStorage(key, list);
          this.addresses = list;
          showToast('已设为默认地址', 'success');
        },
        /* 收货地址：删除 */
        async deleteAddress(id) {
          const ok = await showConfirm({ title: '删除地址', message: '确定要删除这个收货地址吗？' });
          if (!ok) return;
          if (!this.user) return;
          const key = 'qy_addresses_' + this.user.username;
          let list = getStorage(key, []);
          const wasDefault = list.find((a) => a.id === id)?.isDefault;
          list = list.filter((a) => a.id !== id);
          if (wasDefault && list.length > 0) list[0].isDefault = true;
          setStorage(key, list);
          this.addresses = list;
          showToast('地址已删除', 'success');
        },

        /* B5. 查看订单详情：商品明细 + 订单信息 + 物流时间线 */
        showOrderDetail(order) {
          const statusText = (typeof ORDER_STATUS_MAP !== 'undefined' && ORDER_STATUS_MAP[order.status])
            ? ORDER_STATUS_MAP[order.status] : order.status;
          // 解析订单商品（兼容两种字段：bookId 或 id）
          const items = (order.items || []).map((it) => {
            const book = BOOKS.find((b) => b.id === (it.bookId || it.id));
            return {
              cover: book ? book.cover : 'assets/images/goods/book-01.svg',
              title: it.title || (book ? book.title : '图书'),
              qty: it.qty,
              price: it.price,
              subtotal: it.price * it.qty
            };
          });
          const itemsHtml = items.map((it) => `
            <div class="od-item">
              <img src="${it.cover}" alt="封面">
              <div class="od-item-info">
                <p class="od-title">${it.title}</p>
                <p class="od-sub">¥${it.price.toFixed(2)} × ${it.qty}</p>
              </div>
              <span class="od-subtotal">¥${it.subtotal.toFixed(2)}</span>
            </div>`).join('');

          const total = order.totalPrice || order.total || 0;
          const coupon = order.couponDiscount || 0;
          const discountRow = coupon > 0
            ? `<p class="discount-row"><span>优惠金额</span><b>-¥${coupon.toFixed(2)}</b></p>` : '';

          // 物流时间线节点：已下单 → 已发货 → 运输中 → 已签收
          const nodeMap = ['已下单', '已发货', '运输中', '已签收'];
          const statusIndex = { pending: 0, shipped: 1, transporting: 2, delivered: 3 }[order.status] ?? 0;
          const timelineHtml = nodeMap.map((label, i) => {
            const cls = i < statusIndex ? 'tl-done' : (i === statusIndex ? 'tl-current' : '');
            const icon = i < statusIndex ? '<i class="fa-solid fa-circle-check"></i>' : (i === statusIndex ? '<i class="fa-solid fa-truck-fast"></i>' : '<i class="fa-regular fa-circle"></i>');
            const desc = i === 0 ? (order.createTime || '订单创建成功')
              : i === 1 ? '商家已打包发货，快递已揽收'
              : i === 2 ? '快递正在运输途中，预计 2-3 天送达'
              : '已签收，感谢您的购买';
            return `<li class="tl-node ${cls}">
              <div class="tl-dot">${icon}</div>
              <div class="tl-body"><p class="tl-label">${label}</p><p class="tl-desc">${desc}</p></div>
            </li>`;
          }).join('');

          getElement('.preview-mask')?.remove();
          const mask = createElement('div', {
            class: 'preview-mask show',
            html: `
              <div class="book-preview-modal" style="width:640px">
                <button class="preview-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
                <div class="od-head">
                  <h3>订单详情</h3>
                  <span class="tag tag-orange">${statusText}</span>
                </div>
                <div class="od-items">${itemsHtml}</div>
                <div class="od-info">
                  <p><span>订单号</span><b>${order.no}</b></p>
                  <p><span>下单时间</span><b>${order.createTime || order.time || ''}</b></p>
                  <p><span>收货地址</span><b>${order.address || '南昌大学前湖校区'}</b></p>
                  <p><span>商品总额</span><b>¥${total.toFixed(2)}</b></p>
                  ${discountRow}
                  <p class="od-pay"><span>实付金额</span><b>¥${(total - coupon).toFixed(2)}</b></p>
                </div>
                <h4 class="od-tl-title"><i class="fa-solid fa-route"></i> 物流跟踪</h4>
                <ul class="tl-list">${timelineHtml}</ul>
              </div>`
          });
          document.body.appendChild(mask);
          const close = () => mask.remove();
          getElement('.preview-close', mask).addEventListener('click', close);
          mask.addEventListener('click', (e) => { if (e.target === mask) close(); });
        }
      }
    });
    app.use(ElementPlus);
    const vm = app.mount('#userApp');
    vm.loadAddresses();
  }

  /* ---------- 3. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('user.html');
    if (typeof Vue !== 'undefined' && typeof ElementPlus !== 'undefined') {
      mountApp();
    } else {
      const box = getElement('#userApp');
      if (box) {
        box.innerHTML = '<div class="need-login"><div class="empty-icon"><i class="fa-solid fa-wifi"></i></div><h1>加载框架失败</h1><p>请检查网络后刷新页面</p></div>';
      }
    }
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
