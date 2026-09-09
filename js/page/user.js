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
          }
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
          return getStorage('qy_orders', []).filter((o) => o.user === this.user.username);
        },
        cartCount() {
          return getCart().reduce((s, i) => s + i.qty, 0);
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
        }
      }
    });
    app.use(ElementPlus);
    app.mount('#userApp');
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
