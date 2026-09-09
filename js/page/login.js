/* ==========================================================================
   login.js —— 仅作用于 login.html（登录页）
   功能：表单验证、Canvas 验证码、密码可见切换、记住用户名（localStorage）
   ========================================================================== */
(function () {
  'use strict';

  const form = getElement('#loginForm');
  const usernameInput = getElement('#loginUsername');
  const passwordInput = getElement('#loginPassword');
  const captchaInput = getElement('#loginCaptcha');
  const captchaCanvas = getElement('#captchaCanvas');

  /* ---------- 1. 初始化验证码（Canvas 绘图） ---------- */
  function initCaptcha() {
    createCaptcha(captchaCanvas);
    captchaCanvas.addEventListener('click', () => createCaptcha(captchaCanvas));
  }

  /* ---------- 2. 记住用户名（localStorage 读取回填） ---------- */
  function loadRemembered() {
    const remembered = getStorage('qy_remember_username', '');
    if (remembered) {
      usernameInput.value = remembered;
      getElement('#rememberMe').checked = true;
    }
  }

  /* ---------- 3. 密码可见切换 ---------- */
  function bindPasswordEye() {
    const eye = getElement('#pwdEye');
    eye.addEventListener('click', () => {
      const isPwd = passwordInput.type === 'password';
      passwordInput.type = isPwd ? 'text' : 'password';
      eye.className = isPwd ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    });
  }

  /* ---------- 4. 实时校验 ---------- */
  function bindValidate() {
    // 用户名：非空
    bindValidateInput(usernameInput, (value) => ({
      ok: formValidate('empty', value),
      msg: '请输入用户名'
    }));
    // 密码：非空
    bindValidateInput(passwordInput, (value) => ({
      ok: formValidate('empty', value),
      msg: '请输入密码'
    }));
    // 验证码：非空
    bindValidateInput(captchaInput, (value) => ({
      ok: formValidate('empty', value),
      msg: '请输入验证码'
    }));
  }

  /* ---------- 5. 提交登录 ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const captcha = captchaInput.value.trim();
    let hasError = false;

    // 重置提示
    [usernameInput, passwordInput, captchaInput].forEach((i) => i.classList.remove('error'));
    const tips = { usernameTip: '', passwordTip: '', captchaTip: '' };

    if (!formValidate('empty', username)) {
      tips.usernameTip = '请输入用户名';
      usernameInput.classList.add('error');
      hasError = true;
    }
    if (!formValidate('empty', password)) {
      tips.passwordTip = '请输入密码';
      passwordInput.classList.add('error');
      hasError = true;
    }
    if (!verifyCaptcha(captcha)) {
      tips.captchaTip = '验证码错误，请重新输入';
      captchaInput.classList.add('error');
      createCaptcha(captchaCanvas);
      captchaInput.value = '';
      hasError = true;
    }

    getElement('#usernameTip').textContent = tips.usernameTip;
    getElement('#passwordTip').textContent = tips.passwordTip;
    getElement('#captchaTip').textContent = tips.captchaTip;
    if (hasError) return;

    // 调用公共登录逻辑
    const result = loginUser(username, password);
    if (!result.ok) {
      showToast(result.msg, 'error');
      createCaptcha(captchaCanvas);
      captchaInput.value = '';
      return;
    }

    // 记住用户名（存储 / 删除）
    if (getElement('#rememberMe').checked) {
      setStorage('qy_remember_username', username);
    } else {
      removeStorage('qy_remember_username');
    }

    showToast(result.msg, 'success');
    setTimeout(() => {
      const redirect = new URLSearchParams(location.search).get('redirect');
      location.href = redirect || 'user.html';
    }, 900);
  });

  /* ---------- 6. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('user.html');
    initCaptcha();
    loadRemembered();
    bindPasswordEye();
    bindValidate();
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
