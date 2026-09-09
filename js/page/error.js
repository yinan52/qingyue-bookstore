/* ==========================================================================
   error.js —— 仅作用于 404.html
   功能：倒计时自动返回首页
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    initPageLoading();
    initLayout('404.html');
    renderFooterYear();

    // 5 秒倒计时后返回首页（setInterval + 流程控制）
    const el = getElement('#countdown');
    let count = 5;
    const timer = setInterval(() => {
      count -= 1;
      if (el) el.textContent = `${count} 秒后自动返回首页…`;
      if (count <= 0) {
        clearInterval(timer);
        location.href = 'index.html';
      }
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
