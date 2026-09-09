/* ==========================================================================
   about.js —— 仅作用于 about.html（关于我们页）
   功能：联系表单验证（Axios 远程 API：一言 + 公网 IP）
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 联系表单验证与提交 ---------- */
  function bindContactForm() {
    const form = getElement('#contactForm');
    const nameInput = getElement('#contactName');
    const emailInput = getElement('#contactEmail');
    const msgInput = getElement('#contactMessage');
    const tips = {
      name: getElement('#contactNameTip'),
      email: getElement('#contactEmailTip'),
      message: getElement('#contactMessageTip')
    };

    // 实时校验（input 事件）
    const validators = {
      name: (v) => ({ ok: formValidate('empty', v), msg: '请输入您的称呼' }),
      email: (v) => ({ ok: formValidate('email', v), msg: '邮箱格式不正确' }),
      message: (v) => ({ ok: v.trim().length >= 10, msg: '留言内容不少于 10 字' })
    };
    Object.entries(validators).forEach(([key, fn]) => {
      const input = key === 'name' ? nameInput : key === 'email' ? emailInput : msgInput;
      input.addEventListener('input', () => {
        const r = fn(input.value);
        input.classList.toggle('error', !r.ok && input.value.length > 0);
        tips[key].textContent = input.value.length > 0 ? (r.ok ? '' : r.msg) : '';
      });
      input.addEventListener('blur', () => {
        const r = fn(input.value);
        input.classList.toggle('error', !r.ok && input.value.length > 0);
        tips[key].textContent = input.value.length > 0 && !r.ok ? r.msg : '';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let hasError = false;
      Object.entries(validators).forEach(([key, fn]) => {
        const input = key === 'name' ? nameInput : key === 'email' ? emailInput : msgInput;
        const r = fn(input.value);
        input.classList.toggle('error', !r.ok);
        tips[key].textContent = r.ok ? '' : r.msg;
        if (!r.ok) hasError = true;
      });
      if (hasError) return;

      // 提交成功：将留言存入 localStorage（模拟后台），并可查看
      const messages = getStorage('qy_messages', []);
      messages.unshift({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        type: getElement('#contactType').value,
        message: msgInput.value.trim(),
        time: formatTime(Date.now())
      });
      setStorage('qy_messages', messages);
      showModal({
        title: '留言已收到',
        message: '感谢您的反馈！我们会尽快通过邮件回复您。',
        type: 'success'
      });
      form.reset();
    });
  }

  /* ---------- 2. Axios 远程 API：一言 ---------- */
  function loadQuote() {
    const el = getElement('#aboutQuote');
    if (!el) return;
    axios.get(APP_CONFIG.api.hitokoto)
      .then((res) => {
        el.textContent = res.data.hitokoto || '读万卷书，行万里路。';
      })
      .catch(() => {
        el.textContent = '读万卷书，行万里路。';
      });
  }

  /* ---------- 3. Axios 远程 API：公网 IP ---------- */
  function loadIp() {
    const el = getElement('#myIp');
    if (!el) return;
    axios.get(APP_CONFIG.api.ipify)
      .then((res) => {
        el.textContent = res.data.ip || '未知';
      })
      .catch(() => {
        el.textContent = '获取失败（离线）';
      });
  }

  /* ---------- 4. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('about.html');
    bindContactForm();
    if (typeof axios !== 'undefined') {
      loadQuote();
      loadIp();
    } else {
      const quoteEl = getElement('#aboutQuote');
      if (quoteEl) quoteEl.textContent = '读万卷书，行万里路。';
    }
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
