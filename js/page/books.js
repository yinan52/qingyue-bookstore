/* ==========================================================================
   books.js —— 仅作用于 books.html（图书列表 / 搜索页）
   功能：URL 参数读取、分类筛选、关键词搜索、搜索历史（localStorage）、
   多条件排序（switch）、分页、动态渲染图书网格
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 状态管理 ---------- */
  const state = {
    category: 'all',        // 当前分类
    keyword: '',            // 搜索关键词
    sort: 'default',        // 排序方式
    page: 1                 // 当前页码
  };

  const pageSize = APP_CONFIG.pageSize;

  /* ---------- 2. 读取 URL 参数（getElementById 之外用 URLSearchParams） ---------- */
  function readUrlParams() {
    const params = new URLSearchParams(location.search);
    state.category = params.get('category') || 'all';
    state.sort = params.get('sort') || 'default';
    state.keyword = params.get('keyword') || '';
    // 若携带关键词，记录到搜索历史
    if (state.keyword.trim()) {
      saveSearchHistory(state.keyword.trim());
    }
  }

  /* ---------- 3. 搜索历史（存储 → 读取 → 删除） ---------- */
  function getSearchHistory() {
    return getStorage(STORAGE_KEYS.SEARCH, []);
  }

  function saveSearchHistory(kw) {
    let history = getSearchHistory();
    history = history.filter((item) => item !== kw);
    history.unshift(kw);
    if (history.length > 8) history = history.slice(0, 8);
    setStorage(STORAGE_KEYS.SEARCH, history);
  }

  function renderSearchHistory() {
    const list = getElement('#historyList');
    if (!list) return;
    const history = getSearchHistory();
    list.innerHTML = '';
    if (history.length === 0) {
      list.appendChild(createElement('li', {
        class: 'history-empty',
        text: '暂无搜索记录'
      }));
      return;
    }
    history.forEach((kw) => {
      const item = createElement('li', { attrs: { 'data-kw': kw } });
      item.appendChild(createElement('span', {
        class: 'kw',
        html: `<i class="fa-solid fa-magnifying-glass"></i> ${kw}`
      }));
      item.appendChild(createElement('span', {
        class: 'del-one',
        html: '<i class="fa-solid fa-xmark"></i>'
      }));
      list.appendChild(item);
    });
  }

  /* ---------- 4. 分类列表渲染 ---------- */
  function renderCategories() {
    const list = getElement('#catList');
    if (!list) return;
    BOOK_CATEGORIES.forEach((cat) => {
      const count = cat.id === 'all'
        ? BOOKS.length
        : BOOKS.filter((b) => b.category === cat.id).length;
      const li = createElement('li');
      const a = createElement('a', {
        attrs: { href: `books.html?category=${cat.id}` }
      });
      if (cat.id === state.category) a.classList.add('active');
      a.appendChild(createElement('span', { text: cat.name }));
      a.appendChild(createElement('span', { class: 'count', text: count }));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ---------- 5. 图书卡片渲染 ---------- */
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
      attrs: { src: book.cover, alt: `《${book.title}》封面`, loading: 'lazy' }
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

    const tags = createElement('div', { class: 'card-tags' });
    book.tags.slice(0, 2).forEach((tag) => {
      tags.appendChild(createElement('span', { class: 'tag tag-blue', text: tag }));
    });
    body.appendChild(tags);
    card.appendChild(body);
    return card;
  }

  /* ---------- 6. 筛选 + 排序（switch 分支） ---------- */
  function getFilteredBooks() {
    let result = BOOKS.slice();

    // 分类筛选（if-else）
    if (state.category !== 'all') {
      result = result.filter((b) => b.category === state.category);
    }

    // 关键词筛选（书名 / 作者 / 出版社 / 标签）
    if (state.keyword.trim()) {
      const kw = state.keyword.trim().toLowerCase();
      result = result.filter((b) => {
        return b.title.toLowerCase().includes(kw)
          || b.author.toLowerCase().includes(kw)
          || b.publisher.toLowerCase().includes(kw)
          || b.tags.some((t) => t.toLowerCase().includes(kw));
      });
    }

    // 排序（switch 多条件判断）
    switch (state.sort) {
      case 'sales':      // 销量从高到低
        result.sort((a, b) => b.sales - a.sales);
        break;
      case 'priceAsc':   // 价格从低到高
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':  // 价格从高到低
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':     // 评分从高到低
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'new':        // 最新上架（按出版日期降序）
        result.sort((a, b) => (b.pubDate > a.pubDate ? 1 : -1));
        break;
      default:           // 综合：热卖优先
        result.sort((a, b) => (b.isHot - a.isHot) || (b.sales - a.sales));
    }
    return result;
  }

  /* ---------- 7. 渲染列表 + 分页 ---------- */
  function renderBooks() {
    const grid = getElement('#bookGrid');
    const empty = getElement('#emptyState');
    const pagination = getElement('#pagination');
    const info = getElement('#resultInfo');
    const all = getFilteredBooks();
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));

    // 页码越界保护
    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * pageSize;
    const pageBooks = all.slice(start, start + pageSize);

    // 结果统计信息
    const catName = BOOK_CATEGORIES.find((c) => c.id === state.category)?.name || '全部';
    info.innerHTML = state.keyword
      ? `关键词 <strong>“${state.keyword}”</strong> 共找到 <strong>${all.length}</strong> 本图书`
      : `分类 <strong>${catName}</strong> 共 <strong>${all.length}</strong> 本图书`;

    // 空状态切换
    if (all.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      pagination.innerHTML = '';
      return;
    }
    empty.classList.add('hidden');

    // 动态渲染（DocumentFragment 批量插入）
    grid.innerHTML = '';
    renderList(pageBooks, renderBookCard, grid);
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.book-card');
      if (card) location.href = `detail.html?id=${card.dataset.id}`;
    });

    renderPagination(pagination, totalPages);
  }

  function renderPagination(container, totalPages) {
    container.innerHTML = '';
    const prevBtn = createElement('button', {
      attrs: { disabled: state.page <= 1 ? '' : null }
    });
    prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
    prevBtn.addEventListener('click', () => {
      if (state.page > 1) { state.page -= 1; renderBooks(); }
    });
    container.appendChild(prevBtn);

    // 页码（for 循环）
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - state.page) > 1) {
        if (p === 3 || p === totalPages - 2) {
          container.appendChild(createElement('span', { class: 'page-item', text: '…' }));
        }
        continue;
      }
      const btn = createElement('button', {
        class: p === state.page ? 'active' : '',
        text: p
      });
      btn.addEventListener('click', () => {
        state.page = p;
        renderBooks();
      });
      container.appendChild(btn);
    }

    const nextBtn = createElement('button', {
      attrs: { disabled: state.page >= totalPages ? '' : null }
    });
    nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
    nextBtn.addEventListener('click', () => {
      if (state.page < totalPages) { state.page += 1; renderBooks(); }
    });
    container.appendChild(nextBtn);
    container.appendChild(createElement('span', {
      class: 'page-info',
      text: `${state.page} / ${totalPages} 页`
    }));
  }

  /* ---------- 8. 事件绑定（addEventListener 多种事件 + 事件委托） ---------- */
  function bindEvents() {
    // 排序按钮（事件委托）
    delegateEvent(getElement('#sortBar'), '.sort-btn', 'click', (e, btn) => {
      getElements('.sort-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.sort = btn.dataset.sort;
      state.page = 1;
      renderBooks();
    });

    // 搜索历史：点击关键词 / 删除单条（事件委托）
    const historyList = getElement('#historyList');
    if (historyList) {
      historyList.addEventListener('click', (e) => {
        const li = e.target.closest('li[data-kw]');
        if (!li) return;
        if (e.target.closest('.del-one')) {
          // 删除单条历史
          const history = getSearchHistory().filter((kw) => kw !== li.dataset.kw);
          setStorage(STORAGE_KEYS.SEARCH, history);
          renderSearchHistory();
          showToast('已删除', 'info');
          return;
        }
        // 点击历史关键词搜索
        state.keyword = li.dataset.kw;
        state.page = 1;
        renderBooks();
      });
    }

    // 清空全部历史
    const clearBtn = getElement('#clearHistoryBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        const ok = await showConfirm({ title: '清空搜索历史', message: '确定要清空全部搜索历史吗？' });
        if (ok) {
          setStorage(STORAGE_KEYS.SEARCH, []);
          renderSearchHistory();
          showToast('已清空搜索历史', 'success');
        }
      });
    }

    // 重置查看全部
    const resetBtn = getElement('#resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.category = 'all';
        state.keyword = '';
        state.sort = 'default';
        state.page = 1;
        // 同步 UI 状态
        getElements('.cat-list a').forEach((a) => a.classList.remove('active'));
        getElement('.cat-list a[href="books.html?category=all"]')?.classList.add('active');
        getElements('.sort-btn').forEach((b) => b.classList.toggle('active', b.dataset.sort === 'default'));
        renderBooks();
      });
    }
  }

  /* ---------- 9. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('books.html');
    readUrlParams();
    renderCategories();
    renderSearchHistory();
    bindEvents();
    renderBooks();
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
