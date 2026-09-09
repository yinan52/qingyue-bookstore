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
      class: 'book-card',
      attrs: { 'data-id': book.id }
    });
    const cover = createElement('div', { class: 'card-cover' });
    if (book.isHot) {
      cover.appendChild(createElement('span', { class: 'badge-hot', text: 'HOT' }));
    }
    cover.appendChild(createElement('img', {
      attrs: { src: book.cover, alt: `《${book.title}》封面` }
    }));
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

    // 点击跳转详情页（事件委托在容器上统一绑定，见 renderHotBooks）
    card.addEventListener('click', () => {
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

  /* ---------- 9. 页面初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('index.html');
    renderCategories();
    renderHotBooks();
    renderNewBooks();
    renderRankList();
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
