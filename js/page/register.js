/* ==========================================================================
   register.js —— 仅作用于 register.html（注册页）
   功能：完整表单实时验证（正则表达式：手机号 / 邮箱 / 密码强度 /
   确认密码一致）、Canvas 验证码、协议勾选，注册写入 localStorage
   ========================================================================== */
(function () {
  'use strict';

  const form = getElement('#registerForm');
  const inputs = {
    username: getElement('#regUsername'),
    mobile: getElement('#regMobile'),
    email: getElement('#regEmail'),
    password: getElement('#regPassword'),
    confirm: getElement('#regConfirm'),
    captcha: getElement('#regCaptcha')
  };
  const tips = {
    username: getElement('#regUsernameTip'),
    mobile: getElement('#regMobileTip'),
    email: getElement('#regEmailTip'),
    password: getElement('#regPasswordTip'),
    confirm: getElement('#regConfirmTip'),
    captcha: getElement('#regCaptchaTip')
  };

  /* ---------- 1. 初始化验证码 ---------- */
  const captchaCanvas = getElement('#regCaptchaCanvas');
  function initCaptcha() {
    createCaptcha(captchaCanvas);
    captchaCanvas.addEventListener('click', () => createCaptcha(captchaCanvas));
  }

  /* ---------- 2. 密码可见切换 ---------- */
  function bindPasswordEye() {
    const eye = getElement('#regPwdEye');
    eye.addEventListener('click', () => {
      const isPwd = inputs.password.type === 'password';
      inputs.password.type = isPwd ? 'text' : 'password';
      eye.className = isPwd ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    });
  }

  /* ---------- 3. 密码强度计算（对象属性操作 + 正则） ---------- */
  function calcStrength(pwd) {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);  // 0~4
  }

  function renderStrength(pwd) {
    const bars = getElements('#pwdStrength .strength-bar');
    const text = getElement('#strengthText');
    const score = calcStrength(pwd);
    const levels = ['', '弱', '较弱', '中', '强', '很强'];
    const colors = ['', '#F53F3F', '#FF7D00', '#FFB400', '#00B42A', '#14C9C9'];
    const level = pwd ? score : 0;
    bars.forEach((bar, i) => {
      bar.className = 'strength-bar';
      if (i < level) {
        bar.style.background = colors[level];
      } else {
        bar.style.background = '#E5E6EB';
      }
    });
    if (pwd) {
      text.textContent = levels[level];
      text.style.color = colors[level];
    } else {
      text.textContent = '密码强度';
      text.style.color = 'var(--text-placeholder)';
    }
    return score;
  }

  /* ---------- 4. 各字段校验器（自定义函数 + 参数传递与返回值） ---------- */
  const validators = {
    username: (value) => ({
      ok: formValidate('username', value),
      msg: formValidate('empty', value) ? '用户名需为 2~16 位字母、数字或中文' : '请输入用户名'
    }),
    mobile: (value) => ({
      ok: formValidate('mobile', value),
      msg: formValidate('empty', value) ? '手机号格式不正确（11 位，1 开头）' : '请输入手机号'
    }),
    email: (value) => ({
      ok: formValidate('email', value),
      msg: formValidate('empty', value) ? '邮箱格式不正确' : '请输入邮箱'
    }),
    password: (value) => {
      if (!formValidate('empty', value)) return { ok: false, msg: '请输入密码' };
      if (!formValidate('password', value)) return { ok: false, msg: '密码至少 6 位，且同时包含字母和数字' };
      return { ok: true, msg: '' };
    },
    confirm: (value) => ({
      ok: value === inputs.password.value && value.length > 0,
      msg: value ? '两次输入的密码不一致' : '请再次输入密码'
    }),
    captcha: (value) => ({
      ok: verifyCaptcha(value),
      msg: '验证码错误'
    })
  };

  /* ---------- 5. 绑定实时校验（input 事件 + blur 事件） ---------- */
  function bindValidate() {
    Object.keys(validators).forEach((key) => {
      const input = inputs[key];
      if (!input) return;
      input.addEventListener('input', () => {
        const result = validators[key](input.value);
        input.classList.toggle('error', !result.ok && input.value.length > 0);
        if (input.value.length > 0) {
          tips[key].textContent = result.ok ? '' : result.msg;
          tips[key].className = 'form-tip';
        } else {
          tips[key].textContent = '';
        }
        // 密码变更时联动重校验确认密码
        if (key === 'password') {
          renderStrength(input.value);
          if (inputs.confirm.value) {
            const r = validators.confirm(inputs.confirm.value);
            inputs.confirm.classList.toggle('error', !r.ok);
            tips.confirm.textContent = r.ok ? '' : r.msg;
          }
        }
      });
      input.addEventListener('blur', () => {
        if (!input.value) return;
        const result = validators[key](input.value);
        input.classList.toggle('error', !result.ok);
        if (!result.ok) {
          tips[key].textContent = result.msg;
          tips[key].className = 'form-tip';
        } else {
          tips[key].textContent = '✓ ' + (key === 'password' ? '' : '格式正确');
          tips[key].className = 'form-tip success';
        }
      });
    });
  }

  /* ---------- 6. 提交注册 ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    // 逐项校验（for 循环）
    for (const key of Object.keys(validators)) {
      const input = inputs[key];
      const result = validators[key](input.value);
      input.classList.toggle('error', !result.ok);
      tips[key].textContent = result.ok ? '' : result.msg;
      tips[key].className = 'form-tip';
      if (!result.ok) hasError = true;
    }

    // 协议勾选
    const agree = getElement('#agreeTerms');
    const agreeTip = getElement('#agreeTip');
    if (!agree.checked) {
      agreeTip.textContent = '请先阅读并同意服务协议';
      hasError = true;
    } else {
      agreeTip.textContent = '';
    }

    if (hasError) {
      createCaptcha(captchaCanvas);
      inputs.captcha.value = '';
      showToast('请检查表单填写', 'error');
      return;
    }

    // 写入用户数据库（localStorage）
    const result = registerUser({
      username: inputs.username.value.trim(),
      password: inputs.password.value,
      mobile: inputs.mobile.value.trim(),
      email: inputs.email.value.trim()
    });

    if (!result.ok) {
      showToast(result.msg, 'error');
      return;
    }

    showToast(result.msg, 'success');
    setTimeout(() => {
      location.href = 'login.html?registered=1';
    }, 1200);
  });

  /* ---------- 7. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('user.html');
    initCaptcha();
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
