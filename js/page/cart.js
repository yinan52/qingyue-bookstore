/* ==========================================================================
   cart.js —— 仅作用于 cart.html（购物车页）
   功能：使用 Vue3 组件化 + 响应式数据绑定实现购物车管理
   （全选 / 数量增减 / 删除 / 清空 / 合计计算 / 结算生成订单）
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 猜你喜欢（原生 JS + DocumentFragment 动态渲染） ---------- */
  function renderGuess() {
    const grid = getElement('#guessGrid');
    if (!grid) return;
    // 取销量前 4 且不在购物车中的图书
    const inCart = getCart().map((i) => i.id);
    const guess = BOOKS.slice().sort((a, b) => b.sales - a.sales)
      .filter((b) => !inCart.includes(b.id)).slice(0, 4);
    renderList(guess, (book) => {
      const card = createElement('div', { class: 'book-card card-tilt animate-on-scroll', attrs: { 'data-id': book.id } });
      const cover = createElement('div', { class: 'card-cover' });
      cover.appendChild(createElement('img', {
        attrs: { 'data-src': book.cover, alt: `《${book.title}》封面`, loading: 'lazy' }
      }));
      card.appendChild(cover);
      const body = createElement('div', { class: 'card-body' });
      body.appendChild(createElement('h3', { class: 'card-title', text: book.title }));
      const meta = createElement('div', { class: 'card-meta' });
      meta.appendChild(createElement('span', { class: 'card-price', text: `¥${formatPrice(book.price)}` }));
      meta.appendChild(createElement('span', {
        class: 'card-rating',
        html: `<i class="fa-solid fa-star"></i> ${book.rating}`
      }));
      body.appendChild(meta);
      card.appendChild(body);
      card.addEventListener('click', () => { location.href = `detail.html?id=${book.id}`; });
      return card;
    }, grid);
  }

  /* ---------- 2. Vue3 响应式购物车应用 ---------- */
  function mountCartApp() {
    // 购物车原始数据（含图书完整信息）
    const buildItems = () => {
      return getCart().map((item) => {
        const book = BOOKS.find((b) => b.id === item.id);
        if (!book) return null;
        return {
          id: book.id,
          title: book.title,
          author: book.author,
          cover: book.cover,
          price: book.price,
          categoryName: book.categoryName,
          qty: item.qty,
          checked: item.checked !== false
        };
      }).filter(Boolean);
    };

    const app = Vue.createApp({
      data() {
        return {
          cartItems: buildItems(),
          coupons: (typeof COUPONS !== 'undefined') ? COUPONS : [],
          // 已选优惠券 id，从 localStorage 恢复（默认不使用）
          couponId: getStorage(STORAGE_KEYS.COUPON, 'none')
        };
      },
      computed: {
        // 是否全选
        allChecked() {
          return this.cartItems.length > 0 && this.cartItems.every((i) => i.checked);
        },
        // 选中件数（不同商品数）
        checkedCount() {
          return this.cartItems.filter((i) => i.checked).length;
        },
        // 选中总本数
        totalQty() {
          return this.cartItems.filter((i) => i.checked).reduce((s, i) => s + i.qty, 0);
        },
        // 选中总金额（回调 reduce 计算）
        totalPrice() {
          return this.cartItems
            .filter((i) => i.checked)
            .reduce((sum, i) => sum + i.price * i.qty, 0);
        },
        // 优惠券优惠金额（调用 data.js 中的公共计算函数）
        couponDiscount() {
          return calcCouponDiscount(this.couponId, this.totalPrice);
        },
        // 实付金额 = 商品总额 - 优惠
        payPrice() {
          return Math.max(0, Math.round((this.totalPrice - this.couponDiscount) * 100) / 100);
        }
      },
      watch: {
        // 优惠券选择变化时持久化到 localStorage
        couponId(val) {
          setStorage(STORAGE_KEYS.COUPON, val);
        }
      },
      methods: {
        /* 保存购物车到 localStorage（存储） */
        saveCartData() {
          saveCart(this.cartItems.map((i) => ({ id: i.id, qty: i.qty, checked: i.checked })));
        },
        /* 全选 / 取消全选 */
        toggleAll(e) {
          this.cartItems.forEach((i) => { i.checked = e.target.checked; });
          this.saveCartData();
        },
        /* 数量增减（修改） */
        changeQty(item, delta) {
          const next = item.qty + delta;
          if (next < 1) return;
          if (next > 99) return;
          item.qty = next;
          this.saveCartData();
        },
        /* 手动输入数量 */
        setQty(item, event) {
          let val = parseInt(event.target.value, 10) || 1;
          val = Math.min(99, Math.max(1, val));
          item.qty = val;
          event.target.value = val;
          this.saveCartData();
        },
        /* 删除单个商品（删除） */
        async removeItem(id) {
          const ok = await showConfirm({
            title: '删除商品',
            message: '确定将该图书移出购物车吗？',
            type: 'warning'
          });
          if (!ok) return;
          this.cartItems = this.cartItems.filter((i) => i.id !== id);
          this.saveCartData();
          showToast('已移出购物车', 'info');
        },
        /* 清空购物车 */
        async clearAll() {
          const ok = await showConfirm({
            title: '清空购物车',
            message: '确定要清空购物车中的所有图书吗？',
            type: 'warning'
          });
          if (!ok) return;
          this.cartItems = [];
          saveCart([]);
          showToast('购物车已清空', 'success');
        },
        /* 跳转详情 */
        goDetail(id) {
          location.href = `detail.html?id=${id}`;
        },
        /* 去结算：生成订单写入 localStorage */
        checkout() {
          if (this.checkedCount === 0) {
            showToast('请先选择要结算的图书', 'warning');
            return;
          }
          if (!isLoggedIn()) {
            showToast('请先登录后结算', 'warning');
            setTimeout(() => { location.href = 'login.html'; }, 900);
            return;
          }
          const user = getCurrentUser();
          const items = this.cartItems.filter((i) => i.checked).map((i) => ({
            id: i.id, title: i.title, price: i.price, qty: i.qty
          }));
          const orders = getStorage('qy_orders', []);
          const order = {
            id: Date.now(),
            no: 'QY' + Date.now().toString().slice(-10),
            items,
            total: this.payPrice,
            couponDiscount: this.couponDiscount,
            time: formatTime(Date.now()),
            status: 'pending',   // pending=待发货
            user: user.username
          };
          orders.unshift(order);
          setStorage('qy_orders', orders);
          // 移除已结算商品
          this.cartItems = this.cartItems.filter((i) => !i.checked);
          this.saveCartData();
          showModal({
            title: '下单成功 🎉',
            message: `订单号：${order.no}\n商品总额 ¥${this.totalPrice.toFixed(2)}${this.couponDiscount > 0 ? `，优惠 ¥${this.couponDiscount.toFixed(2)}` : ''}\n实付金额：¥${order.total.toFixed(2)}，可在个人中心查看订单。`,
            type: 'success'
          });
        }
      }
    });

    app.mount('#cartApp');
  }

  /* ---------- 3. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('cart.html');
    // 兼容 CDN 加载失败：Vue 缺失时降级为原生提示
    if (typeof Vue !== 'undefined') {
      mountCartApp();
    } else {
      const box = getElement('#cartApp');
      if (box) {
        box.innerHTML = '<div class="empty-state cart-empty"><div class="empty-icon"><i class="fa-solid fa-wifi"></i></div><p>加载 Vue 框架失败，请检查网络后刷新</p></div>';
      }
    }
    renderGuess();
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
