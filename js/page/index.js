/* ==========================================================================
   index.js —— 仅作用于 index.html（首页）的交互逻辑
   功能：分类导航渲染、热卖/新品/排行动态渲染、数字滚动动画、
   每日一言（Axios 远程 API）、页脚订阅、公共布局初始化
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 分类导航渲染 ---------- */
  function renderCategories() {
    const grid = getElement('#categoryGrid');
    if (!grid) return;
    const iconMap = {
      computer: 'fa-laptop-code',
      literature: 'fa-book-open',
      history: 'fa-landmark',
      economy: 'fa-chart-line',
      art: 'fa-palette',
      science: 'fa-flask'
    };
    // 过滤掉“全部”，仅展示 6 个真实分类
    const cats = BOOK_CATEGORIES.filter((c) => c.id !== 'all');
    renderList(cats, (cat) => {
      const count = BOOKS.filter((b) => b.category === cat.id).length;
      const item = createElement('a', {
        class: `category-item cat-${cat.id}`,
        attrs: { href: `books.html?category=${cat.id}` }
      });
      item.appendChild(createElement('div', {
        class: 'cat-icon',
        html: `<i class="fa-solid ${iconMap[cat.id] || 'fa-book'}"></i>`
      }));
      item.appendChild(createElement('div', { class: 'cat-name', text: cat.name }));
      item.appendChild(createElement('div', { class: 'cat-count', text: `${count} 本在售` }));
      return item;
    }, grid);
  }

  /* ---------- 2. 图书卡片渲染函数（复用） ---------- */
  function renderBookCard(book) {
    const card = createElement('div', {
      class: 'book-card card-tilt animate-on-scroll',
      attrs: { 'data-id': book.id }
    });
    const cover = createElement('div', { class: 'card-cover' });
    if (book.isHot) {
      cover.appendChild(createElement('span', { class: 'badge-hot', text: 'HOT' }));
    }
    // 图片改为 data-src 懒加载（由 common.js 的 initLazyLoad 接管）
    cover.appendChild(createElement('img', {
      attrs: { 'data-src': book.cover, alt: `《${book.title}》封面`, loading: 'lazy' }
    }));
    // 悬浮快捷操作：快速预览 / 加入购物车
    const actions = createElement('div', { class: 'card-actions' });
    actions.appendChild(createElement('button', {
      class: 'card-action-btn', attrs: { 'data-act': 'preview', title: '快速查看' },
      html: '<i class="fa-solid fa-eye"></i>'
    }));
    actions.appendChild(createElement('button', {
      class: 'card-action-btn', attrs: { 'data-act': 'addcart', title: '加入购物车' },
      html: '<i class="fa-solid fa-cart-plus"></i>'
    }));
    cover.appendChild(actions);
    card.appendChild(cover);

    const body = createElement('div', { class: 'card-body' });
    body.appendChild(createElement('h3', { class: 'card-title', text: book.title }));
    body.appendChild(createElement('p', { class: 'card-author', text: `${book.author} 著` }));
    const meta = createElement('div', { class: 'card-meta' });
    meta.appendChild(createElement('span', {
      class: 'card-price',
      html: `<span class="rmb">¥</span>${formatPrice(book.price)}`
    }));
    meta.appendChild(createElement('span', {
      class: 'card-rating',
      html: `<i class="fa-solid fa-star"></i> ${book.rating}`
    }));
    body.appendChild(meta);
    body.appendChild(createElement('p', {
      class: 'card-sales',
      text: `已售 ${formatNumber(book.sales)} 册`
    }));
    card.appendChild(body);

    // 事件委托：快捷按钮优先，其余点击跳转详情
    card.addEventListener('click', (e) => {
      const actBtn = e.target.closest('.card-action-btn');
      if (actBtn) {
        e.stopPropagation();
        if (actBtn.dataset.act === 'preview') {
          showBookPreview(book.id);
        } else if (actBtn.dataset.act === 'addcart') {
          addToCart(book.id, 1);
          showToast('已加入购物车', 'success');
        }
        return;
      }
      location.href = `detail.html?id=${book.id}`;
    });
    return card;
  }

  /* ---------- 3. 今日热卖（按销量取前 8） ---------- */
  function renderHotBooks() {
    const grid = getElement('#hotGrid');
    if (!grid) return;
    const hotBooks = BOOKS.slice().sort((a, b) => b.sales - a.sales).slice(0, 8);
    renderList(hotBooks, renderBookCard, grid);
  }

  /* ---------- 4. 新书上架（前 3 本） ---------- */
  function renderNewBooks() {
    const list = getElement('#newBookList');
    if (!list) return;
    const newBooks = BOOKS.filter((b) => b.isNew).concat(
      BOOKS.filter((b) => !b.isNew).slice(0, 3)
    ).slice(0, 3);
    renderList(newBooks, (book) => {
      const item = createElement('article', {
        class: 'new-book-item',
        attrs: { 'data-id': book.id }
      });
      const cover = createElement('div', { class: 'nb-cover' });
      cover.appendChild(createElement('img', {
        attrs: { src: book.cover, alt: `《${book.title}》封面` }
      }));
      item.appendChild(cover);

      const info = createElement('div', { class: 'nb-info' });
      info.appendChild(createElement('h3', { class: 'nb-title', text: book.title }));
      info.appendChild(createElement('p', { class: 'nb-desc', text: book.desc.slice(0, 52) + '…' }));
      const meta = createElement('div', { class: 'nb-meta' });
      meta.appendChild(createElement('span', { class: 'nb-price', html: `¥${formatPrice(book.price)}` }));
      meta.appendChild(createElement('span', { text: `${book.publisher}` }));
      meta.appendChild(createElement('span', { text: `${book.pubDate}` }));
      info.appendChild(meta);
      item.appendChild(info);
      item.addEventListener('click', () => {
        location.href = `detail.html?id=${book.id}`;
      });
      return item;
    }, list);
  }

  /* ---------- 5. 销量排行 TOP5 ---------- */
  function renderRankList() {
    const list = getElement('#rankList');
    if (!list) return;
    const topBooks = BOOKS.slice().sort((a, b) => b.sales - a.sales).slice(0, 5);
    renderList(topBooks, (book, index) => {
      const item = createElement('li', {
        class: 'rank-item',
        attrs: { 'data-id': book.id }
      });
      item.appendChild(createElement('span', { class: 'rank-no', text: index + 1 }));
      const cover = createElement('div', { class: 'rank-cover' });
      cover.appendChild(createElement('img', {
        attrs: { src: book.cover, alt: book.title }
      }));
      item.appendChild(cover);
      item.appendChild(createElement('span', { class: 'rank-title', text: book.title }));
      item.appendChild(createElement('span', { class: 'rank-sales', text: `${formatNumber(book.sales)}册` }));
      item.addEventListener('click', () => {
        location.href = `detail.html?id=${book.id}`;
      });
      return item;
    }, list);
  }

  /* ---------- 6. 数字滚动动画（requestAnimationFrame + 回调） ---------- */
  function runCountUp() {
    const nums = getElements('.stat-num span');
    nums.forEach((numEl) => {
      const target = Number(numEl.parentElement.dataset.target) || 0;
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic 缓动
        const eased = 1 - Math.pow(1 - progress, 3);
        numEl.textContent = formatNumber(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- 7. 每日一言（Axios 远程 API 调用） ---------- */
  function loadQuote() {
    const quoteEl = getElement('#quoteText');
    const fromEl = getElement('#quoteFrom');
    if (!quoteEl) return;
    // 使用 axios 调用开源免费 API
    axios.get(APP_CONFIG.api.hitokoto)
      .then((response) => {
        const data = response.data;
        quoteEl.textContent = data.hitokoto || '读万卷书，行万里路。';
        fromEl.textContent = `—— ${data.from || '青阅书城'}`;
      })
      .catch(() => {
        quoteEl.textContent = '读万卷书，行万里路。';
        fromEl.textContent = '—— 青阅书城';
      });
  }

  /* ---------- 8. 页脚订阅 ---------- */
  function bindSubscribe() {
    const btn = getElement('#footerSubscribeBtn');
    const input = getElement('#footerEmail');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      if (formValidate('email', input.value)) {
        showToast('订阅成功，好书推荐即将送达！', 'success');
        input.value = '';
      } else {
        showToast('请输入正确的邮箱地址', 'error');
      }
    });
  }

  /* ---------- 8.5 限时秒杀：倒计时 + 横向书单 ---------- */
  function renderSeckill() {
    const track = getElement('#seckillTrack');
    if (!track) return;
    // 取热卖图书做秒杀品，秒杀价约 7.5 折
    const seckillBooks = BOOKS.filter((b) => b.isHot).slice(0, 6);
    renderList(seckillBooks, (book) => {
      const sp = Math.round(book.price * 0.75 * 100) / 100;
      // 已抢百分比用销量伪随机（确定性）展示进度
      const soldPct = 60 + (book.id * 7) % 35;
      const item = createElement('div', {
        class: 'seckill-item',
        attrs: { 'data-id': book.id }
      });
      item.innerHTML = `
        <img class="sk-cover" src="${book.cover}" alt="《${book.title}》封面">
        <p class="sk-title ellipsis">${book.title}</p>
        <p class="sk-price-row">
          <span class="sk-price">¥${formatPrice(sp)}</span>
          <span class="sk-original">¥${formatPrice(book.price)}</span>
        </p>
        <div class="sk-progress"><div class="sk-bar" style="width:${soldPct}%"></div></div>
        <p class="sk-sold">已抢 ${soldPct}%</p>`;
      item.addEventListener('click', () => showBookPreview(book.id));
      track.appendChild(item);
      return item;
    }, track);
  }

  /* 秒杀倒计时：倒计时到当天 24:00 */
  function startSeckillCountdown() {
    const card = getElement('#seckillCard');
    if (!card) return;
    const hEl = getElement('[data-cd="h"]', card);
    const mEl = getElement('[data-cd="m"]', card);
    const sEl = getElement('[data-cd="s"]', card);
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      let diff = Math.max(0, Math.floor((end - now) / 1000));
      if (diff === 0) {
        // 已结束
        hEl.textContent = mEl.textContent = sEl.textContent = '00';
        card.classList.add('seckill-end');
        const sub = getElement('.seckill-sub', card);
        if (sub) sub.textContent = '本场秒杀已结束';
        return;
      }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      hEl.textContent = pad(h);
      mEl.textContent = pad(m);
      sEl.textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 8.6 编辑推荐书单 ---------- */
  function renderPicks() {
    const grid = getElement('#picksGrid');
    if (!grid || typeof EDITOR_PICKS === 'undefined') return;
    renderList(EDITOR_PICKS, (pick) => {
      const list = pick.bookIds.map((id) => BOOKS.find((b) => b.id === id)).filter(Boolean);
      // 封面合集（前 4 本小封面拼贴）
      const thumbs = list.slice(0, 4).map((b) => `<img src="${b.cover}" alt="">`).join('');
      const card = createElement('div', {
        class: 'pick-card card-tilt animate-on-scroll',
        attrs: { 'data-id': pick.id }
      });
      card.innerHTML = `
        <div class="pick-cover-stack">${thumbs}</div>
        <div class="pick-body">
          <h3 class="pick-title">${pick.title}</h3>
          <p class="pick-desc">${pick.desc}</p>
          <div class="pick-foot">
            <span class="pick-count">共 ${list.length} 本好书</span>
            <span class="pick-link">查看书单 <i class="fa-solid fa-angle-right"></i></span>
          </div>
        </div>`;
      card.addEventListener('click', () => showPickModal(pick, list));
      return card;
    }, grid);
  }

  /* 书单详情 modal：展开书单内全部图书 */
  function showPickModal(pick, list) {
    getElement('.preview-mask')?.remove();
    const itemsHtml = list.map((b) => `
      <div class="pick-book" data-id="${b.id}">
        <img src="${b.cover}" alt="《${b.title}》封面">
        <div class="pick-book-info">
          <p class="pb-title">${b.title}</p>
          <p class="pb-author">${b.author} 著</p>
          <p class="pb-price">¥${formatPrice(b.price)}</p>
        </div>
      </div>`).join('');
    const mask = createElement('div', {
      class: 'preview-mask show',
      html: `
        <div class="book-preview-modal" style="width:680px">
          <button class="preview-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
          <h3 style="margin-bottom:6px">${pick.title}</h3>
          <p class="preview-author" style="margin-bottom:16px">${pick.desc}</p>
          <div class="pick-books">${itemsHtml}</div>
        </div>`
    });
    document.body.appendChild(mask);
    const close = () => mask.remove();
    getElement('.preview-close', mask).addEventListener('click', close);
    mask.addEventListener('click', (e) => {
      const pb = e.target.closest('.pick-book');
      if (pb) { location.href = `detail.html?id=${pb.dataset.id}`; return; }
      if (e.target === mask) close();
    });
  }

  /* ---------- 8.7 轮播图触摸滑动支持 ---------- */
  function bindCarouselTouch() {
    const box = getElement('#bannerApp');
    if (!box) return;
    let startX = 0, startY = 0, dragging = false;
    box.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      // 横向滑动且距离超过 50px 才切换，避免与垂直滚动冲突
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) {
        // 左滑 → 下一张
        getElement('.el-carousel__arrow--right', box)?.click();
      } else {
        // 右滑 → 上一张
        getElement('.el-carousel__arrow--left', box)?.click();
      }
    });
  }

  /* ---------- 8.8 Vue3 + Element Plus 轮播图挂载 ---------- */
  function mountBannerApp() {
    if (typeof Vue === 'undefined' || typeof ElementPlus === 'undefined') {
      console.warn('Vue3 或 Element Plus 未加载，轮播图降级为静态展示');
      return;
    }
    const banners = [
      { id: 1, title: '开学季 · 计算机经典钜惠', subtitle: '精选编程好书 低至 7 折，满 200 减 30', link: 'books.html?category=computer', img: 'assets/images/banner/banner-01.jpg' },
      { id: 2, title: '文学周 · 读懂中国与世界', subtitle: '历史 / 文学 / 艺术 全场包邮，新人立减 10 元', link: 'books.html?category=literature', img: 'assets/images/banner/banner-02.jpg' },
      { id: 3, title: '会员专享 · 积分翻倍兑好书', subtitle: '签到领积分，积分当钱花，更多好礼等你来', link: 'user.html', img: 'assets/images/banner/banner-03.jpg' }
    ];
    const app = Vue.createApp({
      data() {
        return { banners };
      }
    });
    app.use(ElementPlus);
    app.mount('#bannerApp');
  }

  /* ---------- 9. 页面初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('index.html');
    mountBannerApp();
    renderCategories();
    renderHotBooks();
    renderNewBooks();
    renderRankList();
    renderSeckill();
    startSeckillCountdown();
    renderPicks();
    bindCarouselTouch();
    runCountUp();
    loadQuote();
    bindSubscribe();
    renderFooterYear();
  }

  // 等待 DOM 就绪
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
