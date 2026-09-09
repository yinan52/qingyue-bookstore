/* ==========================================================================
   paint.js —— 仅作用于 paint.html（创意画板）
   功能：Canvas 鼠标/触摸绘图（画笔、直线、矩形、圆形、橡皮），
   颜色与笔刷控制、撤销栈、清空、保存为 PNG
   ========================================================================== */
(function () {
  'use strict';

  const canvas = getElement('#paintCanvas');
  const ctx = canvas.getContext('2d');
  const wrap = getElement('.canvas-wrap');

  /* ---------- 1. 绘图状态 ---------- */
  const state = {
    tool: 'pen',          // pen / line / rect / circle / eraser
    color: '#165DFF',
    size: 6,
    drawing: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0
  };

  /* 撤销历史栈 */
  const history = [];
  const MAX_HISTORY = 30;

  /* ---------- 2. 画布初始化（背景 + 尺寸提示） ---------- */
  function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    getElement('#canvasSize').textContent = `${canvas.width} × ${canvas.height}`;
    saveState();
  }

  /** 保存当前画面到历史栈（撤销用） */
  function saveState() {
    if (history.length >= MAX_HISTORY) history.shift();
    history.push(canvas.toDataURL());
  }

  /* ---------- 3. 坐标换算（兼容高 DPI / 缩放） ---------- */
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  /* ---------- 4. 绘图核心（switch 分支处理不同工具） ---------- */
  function drawShape(x, y) {
    ctx.strokeStyle = state.color;
    ctx.fillStyle = state.color;
    ctx.lineWidth = state.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (state.tool) {
      case 'pen':        // 自由画笔（连线）
      case 'eraser': {   // 橡皮（白色画笔）
        const color = state.tool === 'eraser' ? '#ffffff' : state.color;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(state.lastX, state.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      }
      case 'line': {     // 直线
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        restoreBackground();
        ctx.beginPath();
        ctx.moveTo(state.startX, state.startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      }
      case 'rect': {     // 矩形
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        restoreBackground();
        const w = x - state.startX;
        const h = y - state.startY;
        ctx.strokeRect(state.startX, state.startY, w, h);
        break;
      }
      case 'circle': {   // 圆形
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        restoreBackground();
        const r = Math.hypot(x - state.startX, y - state.startY);
        ctx.beginPath();
        ctx.arc(state.startX, state.startY, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      default:
        break;
    }
  }

  /** 恢复历史画面（供直线/矩形/圆形预览时重绘） */
  function restoreBackground() {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = history[history.length - 1];
  }

  /* ---------- 5. 事件绑定（mousedown / mousemove / mouseup / 触摸） ---------- */
  function bindEvents() {
    canvas.addEventListener('mousedown', (e) => {
      state.drawing = true;
      const pos = getPos(e);
      state.startX = pos.x;
      state.startY = pos.y;
      state.lastX = pos.x;
      state.lastY = pos.y;
      wrap.classList.add('drawing');
      // 直线/矩形/圆形开始时先保存一次画面
      if (state.tool !== 'pen' && state.tool !== 'eraser') saveState();
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!state.drawing) return;
      const pos = getPos(e);
      drawShape(pos.x, pos.y);
      state.lastX = pos.x;
      state.lastY = pos.y;
    });

    const endDraw = () => {
      if (!state.drawing) return;
      state.drawing = false;
      wrap.classList.remove('drawing');
      // 形状类工具提交时保存最终画面
      if (state.tool === 'pen' || state.tool === 'eraser') saveState();
    };

    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      state.drawing = true;
      const pos = getPos(e);
      state.startX = pos.x;
      state.startY = pos.y;
      state.lastX = pos.x;
      state.lastY = pos.y;
      if (state.tool !== 'pen' && state.tool !== 'eraser') saveState();
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!state.drawing) return;
      const pos = getPos(e);
      drawShape(pos.x, pos.y);
      state.lastX = pos.x;
      state.lastY = pos.y;
    }, { passive: false });
    canvas.addEventListener('touchend', endDraw);
  }

  /* ---------- 6. 工具栏交互 ---------- */
  function bindTools() {
    // 工具切换（事件委托）
    delegateEvent(getElement('.paint-tools'), '.tool-btn', 'click', (e, btn) => {
      getElements('.tool-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.tool = btn.dataset.tool;
      getElement('#drawHint').textContent =
        state.tool === 'eraser' ? '橡皮擦模式，拖动即可擦除' : `当前工具：${btn.title}`;
    });

    // 颜色选择（事件委托）
    delegateEvent(getElement('#colorPalette'), '.color-dot', 'click', (e, dot) => {
      getElements('.color-dot').forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      state.color = dot.dataset.color;
    });

    // 自定义颜色（属性选择器 input[type="color"]）
    const customInput = getElement('input[type="color"]');
    customInput.addEventListener('input', () => {
      state.color = customInput.value;
      getElements('.color-dot').forEach((d) => d.classList.remove('active'));
    });

    // 笔刷大小
    const brush = getElement('#brushSize');
    brush.addEventListener('input', () => {
      state.size = Number(brush.value);
      getElement('#brushSizeText').textContent = `${state.size}px`;
    });

    // 撤销（数组 pop + 重绘）
    getElement('#undoBtn').addEventListener('click', () => {
      if (history.length <= 1) {
        showToast('没有可撤销的操作', 'info');
        return;
      }
      history.pop();
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = history[history.length - 1];
      showToast('已撤销', 'info');
    });

    // 清空
    getElement('#clearBtn').addEventListener('click', async () => {
      const ok = await showConfirm({ title: '清空画布', message: '确定要清空画布上的全部内容吗？', type: 'warning' });
      if (!ok) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      history.length = 0;
      saveState();
      showToast('画布已清空', 'success');
    });

    // 保存 PNG
    getElement('#saveBtn').addEventListener('click', () => {
      const link = createElement('a', {
        attrs: {
          href: canvas.toDataURL('image/png'),
          download: `青阅书城画作-${formatTime(Date.now()).replace(/[:\s]/g, '')}.png`
        }
      });
      link.click();
      showToast('画作已保存', 'success');
    });
  }

  /* ---------- 7. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('paint.html');
    initCanvas();
    bindEvents();
    bindTools();
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
