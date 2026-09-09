/* ==========================================================================
   detail.js —— 仅作用于 detail.html（图书详情页）
   功能：图书信息渲染、浏览足迹、数量增减、收藏切换、加入购物车、
   Tab 切换、评论渲染与发表、相关推荐、热销榜与最近浏览
   ========================================================================== */
(function () {
  'use strict';

  let currentBook = null;
  let qty = 1;
  let commentRating = 0;

  /* ---------- 1. 加载图书数据 ---------- */
  function loadBook() {
    const params = new URLSearchParams(location.search);
    const id = Number(params.get('id')) || 1;
    currentBook = BOOKS.find((b) => b.id === id) || BOOKS[0];
    // 记录浏览足迹
    addHistory(currentBook.id);
    renderGoods();
    renderDesc();
    renderComments();
    renderRelated();
    renderMiniRank();
    renderRecent();
  }

  /* ---------- 2. 渲染商品信息 ---------- */
  function renderGoods() {
    const b = currentBook;
    getElement('#goodsCover').innerHTML = `<img src="${b.cover}" alt="《${b.title}》封面">`;
    getElement('#goodsTitle').textContent = b.title;
    getElement('#goodsAuthor').textContent = `${b.author} 著 · ${b.publisher}`;
    getElement('#crumbTitle').textContent = b.title;

    // 标签
    getElement('#goodsTags').innerHTML = b.tags
      .map((t) => `<span class="tag tag-blue">${t}</span>`)
      .join('');

    getElement('#goodsRating').textContent = b.rating.toFixed(1);
    getElement('#goodsRatingText').innerHTML =
      '<i class="fa-solid fa-star"></i> ' + '★'.repeat(Math.round(b.rating)) + ' 分';
    getElement('#goodsSales').textContent = `已售 ${formatNumber(b.sales)} 册`;

    getElement('#goodsPrice').textContent = formatPrice(b.price);
    getElement('#goodsOriginalPrice').textContent = b.originalPrice > b.price
      ? `¥${formatPrice(b.originalPrice)}` : '';
    getElement('#goodsStock').textContent = b.stock > 50 ? '现货充足' : `仅剩 ${b.stock} 本`;
    getElement('#goodsStock').className = 'tag ' + (b.stock > 50 ? 'tag-green' : 'tag-orange');

    getElement('#metaPublisher').textContent = b.publisher;
    getElement('#metaPubDate').textContent = b.pubDate;
    getElement('#metaPages').textContent = b.pages;
    getElement('#stockTip').textContent = `库存 ${b.stock} 件`;

    // 收藏状态
    updateFavBtn();
  }

  function updateFavBtn() {
    const favBtn = getElement('#favBtn');
    const isFav = isFavorite(currentBook.id);
    favBtn.classList.toggle('fav-active', isFav);
    favBtn.innerHTML = isFav
      ? '<i class="fa-solid fa-heart"></i> 已收藏'
      : '<i class="fa-regular fa-heart"></i> 收藏';
  }

  /* ---------- 3. 渲染详情 ---------- */
  function renderDesc() {
    const b = currentBook;
    getElement('#descText').textContent = b.desc;
    getElement('#descCover').src = b.cover;
    getElement('#descTitle').textContent = b.title;
    getElement('#paramsBody').innerHTML = [
      ['书名', b.title],
      ['作者', b.author],
      ['出版社', b.publisher],
      ['出版时间', b.pubDate],
      ['页数', `${b.pages} 页`],
      ['ISBN', `978-7-${String(b.id).padStart(8, '0')}-${b.id % 10}-${b.pages % 10}`],
      ['所属分类', b.categoryName],
      ['上架时间', '2026-09']
    ].map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }

  /* ---------- 4. 评论渲染 ---------- */
  function renderComments() {
    const list = getElement('#commentList');
    const count = getElement('#commentCount');
    // 合并内置评论与用户新增评论（localStorage）
    const stored = getStorage('qy_comments_' + currentBook.id, []);
    const all = COMMENTS.concat(stored);
    count.textContent = `(${all.length})`;
    list.innerHTML = '';

    if (all.length === 0) {
      list.appendChild(createElement('div', {
        class: 'empty-state',
        html: '<div class="empty-icon"><i class="fa-regular fa-comment-dots"></i></div><p>还没有评论，快来抢沙发~</p>'
      }));
      return;
    }

    all.forEach((c) => {
      const item = createElement('article', { class: 'comment-item' });
      const head = createElement('div', { class: 'comment-head' });
      head.appendChild(createElement('img', {
        class: 'comment-avatar',
        attrs: { src: c.avatar || 'assets/images/avatar/avatar-default.svg', alt: `${c.user} 的头像` }
      }));
      head.appendChild(createElement('span', { class: 'comment-user', text: c.user }));
      head.appendChild(createElement('span', {
        class: 'comment-stars',
        html: '<i class="fa-solid fa-star"></i>'.repeat(c.rating) + '<i class="fa-regular fa-star"></i>'.repeat(5 - c.rating)
      }));
      head.appendChild(createElement('span', { class: 'comment-time', text: c.time }));
      item.appendChild(head);

      item.appendChild(createElement('p', { class: 'comment-content', text: c.content }));

      const foot = createElement('div', { class: 'comment-foot' });
      foot.appendChild(createElement('button', {
        class: 'like-btn',
        html: `<i class="fa-regular fa-thumbs-up"></i> ${c.likes || 0}`
      }));
      foot.appendChild(createElement('span', { text: c.replies && c.replies.length ? `${c.replies.length} 条回复` : '' }));
      item.appendChild(foot);

      if (c.replies && c.replies.length) {
        c.replies.forEach((r) => {
          item.appendChild(createElement('div', {
            class: 'comment-reply',
            html: `<span class="reply-user">${r.user}</span>：${r.content}`
          }));
        });
      }
      list.appendChild(item);
    });
  }

  /* ---------- 5. 发表评论（表单提交） ---------- */
  function bindCommentForm() {
    const form = getElement('#commentForm');
    const textarea = getElement('#commentText');
    const tip = getElement('#commentTip');
    const stars = getElements('#starInput i');

    // 星级选择（事件委托：mouseover / click）
    const starInput = getElement('#starInput');
    starInput.addEventListener('click', (e) => {
      const star = e.target.closest('i[data-star]');
      if (!star) return;
      commentRating = Number(star.dataset.star);
      stars.forEach((s) => s.classList.toggle('active', Number(s.dataset.star) <= commentRating));
      getElement('#starHint').textContent = `已选 ${commentRating} 星`;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      tip.textContent = '';
      // 校验：评分 + 内容长度
      if (commentRating === 0) {
        tip.textContent = '请先选择评分';
        return;
      }
      if (textarea.value.trim().length < 10) {
        tip.textContent = '评论内容不少于 10 字';
        return;
      }
      const user = getCurrentUser();
      if (!user) {
        showToast('请先登录后再评论', 'warning');
        setTimeout(() => { location.href = 'login.html'; }, 900);
        return;
      }
      const comments = getStorage('qy_comments_' + currentBook.id, []);
      comments.unshift({
        id: Date.now(),
        user: user.nickname || user.username,
        avatar: user.avatar || 'assets/images/avatar/avatar-default.svg',
        time: formatTime(Date.now()),
        rating: commentRating,
        content: textarea.value.trim(),
        likes: 0,
        replies: []
      });
      setStorage('qy_comments_' + currentBook.id, comments);
      textarea.value = '';
      commentRating = 0;
      stars.forEach((s) => s.classList.remove('active'));
      getElement('#starHint').textContent = '请选择评分';
      renderComments();
      showToast('评论发布成功', 'success');
    });
  }

  /* ---------- 6. Tab 切换 ---------- */
  function bindTabs() {
    delegateEvent(getElement('.tab-panel'), '.tab-btn', 'click', (e, btn) => {
      getElements('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      getElements('.tab-content').forEach((c) => c.classList.remove('active'));
      getElement('#tab' + btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)).classList.add('active');
    });
  }

  /* ---------- 7. 数量控制 ---------- */
  function bindQty() {
    const minus = getElement('#qtyMinus');
    const plus = getElement('#qtyPlus');
    const input = getElement('#qtyInput');
    const setQty = (val) => {
      qty = Math.min(99, Math.max(1, val));
      input.value = qty;
    };
    minus.addEventListener('click', () => setQty(qty - 1));
    plus.addEventListener('click', () => setQty(qty + 1));
    input.addEventListener('change', () => setQty(Number(input.value) || 1));
    input.addEventListener('input', () => {
      // 实时限制非法输入
      const v = input.value.replace(/\D/g, '');
      if (v === '') return;
      input.value = v;
    });
  }

  /* ---------- 8. 购物车 / 收藏 / 立即购买 ---------- */
  function bindActions() {
    getElement('#favBtn').addEventListener('click', () => {
      if (!isLoggedIn()) {
        showToast('请先登录后收藏', 'warning');
        setTimeout(() => { location.href = 'login.html'; }, 900);
        return;
      }
      toggleFavorite(currentBook.id);
      updateFavBtn();
    });

    getElement('#addCartBtn').addEventListener('click', () => {
      addToCart(currentBook.id, qty);
      showToast(`已加入购物车（${qty} 件）`, 'success');
    });

    getElement('#buyNowBtn').addEventListener('click', () => {
      addToCart(currentBook.id, qty);
      setTimeout(() => { location.href = 'cart.html'; }, 600);
    });
  }

  /* ---------- 9. 相关推荐（同分类 + 热销） ---------- */
  function renderRelated() {
    const grid = getElement('#relatedGrid');
    const sameCat = BOOKS.filter((b) => b.category === currentBook.category && b.id !== currentBook.id);
    const others = BOOKS.filter((b) => b.category !== currentBook.category && b.id !== currentBook.id)
      .sort((a, b) => b.sales - a.sales);
    const related = sameCat.concat(others).slice(0, 4);

    renderList(related, (book) => {
      const card = createElement('div', {
        class: 'book-card card-tilt',
        attrs: { 'data-id': book.id }
      });
      const cover = createElement('div', { class: 'card-cover' });
      cover.appendChild(createElement('img', {
        attrs: { 'data-src': book.cover, alt: `《${book.title}》封面`, loading: 'lazy' }
      }));
      const actions = createElement('div', { class: 'card-actions' });
      actions.appendChild(createElement('button', {
        class: 'card-action-btn', attrs: { 'data-act': 'preview', title: '快速查看' },
        html: '<i class="fa-solid fa-eye"></i>'
      }));
      cover.appendChild(actions);
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
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-action-btn')) {
          showBookPreview(book.id);
          return;
        }
        location.href = `detail.html?id=${book.id}`;
      });
      return card;
    }, grid);
  }

  /* ---------- 10. 侧边：热销榜 + 最近浏览 ---------- */
  function renderMiniRank() {
    const list = getElement('#miniRank');
    const top = BOOKS.slice().sort((a, b) => b.sales - a.sales).slice(0, 5);
    renderList(top, (book, index) => {
      const li = createElement('li', { attrs: { 'data-id': book.id } });
      li.appendChild(createElement('span', { class: 'no', text: index + 1 }));
      li.appendChild(createElement('span', { class: 'rank-name', text: book.title }));
      li.appendChild(createElement('span', { class: 'rank-sales', text: formatNumber(book.sales) }));
      li.addEventListener('click', () => { location.href = `detail.html?id=${book.id}`; });
      return li;
    }, list);
  }

  function renderRecent() {
    const list = getElement('#recentList');
    const history = getHistory().filter((id) => id !== currentBook.id).slice(0, 3);
    list.innerHTML = '';
    if (history.length === 0) {
      list.appendChild(createElement('p', {
        class: 'history-empty',
        text: '暂无浏览记录'
      }));
      return;
    }
    history.forEach((id) => {
      const book = BOOKS.find((b) => b.id === id);
      if (!book) return;
      const item = createElement('div', {
        class: 'recent-item',
        attrs: { 'data-id': book.id }
      });
      item.appendChild(createElement('img', {
        attrs: { src: book.cover, alt: book.title }
      }));
      item.appendChild(createElement('span', { class: 'recent-name', text: book.title }));
      item.addEventListener('click', () => { location.href = `detail.html?id=${book.id}`; });
      list.appendChild(item);
    });
  }

  /* ---------- 11. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('books.html');
    loadBook();
    bindQty();
    bindActions();
    bindTabs();
    bindCommentForm();
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
