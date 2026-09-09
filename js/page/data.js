/* ==========================================================================
   data.js —— 仅作用于 data.html（数据看板页）
   功能：使用 ECharts 绘制折线图 / 饼图 / 柱状图 / 雷达图，
   统计卡片数字渲染、热销表格渲染、窗口自适应
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 主题色 ---------- */
  const PALETTE = ['#165DFF', '#14C9C9', '#FF7D00', '#F53F3F', '#722ED1', '#00B42A', '#FFB400', '#6EAAFF'];

  /* ---------- 2. 统计卡片 ---------- */
  function renderStats() {
    getElement('#totalBooks').textContent = BOOKS.length;
    getElement('#totalSales').textContent = formatNumber(BOOKS.reduce((s, b) => s + b.sales, 0));
    const users = getStorage(STORAGE_KEYS.USERS, []);
    getElement('#totalUsers').textContent = formatNumber(120000 + users.length * 3);
    const avg = BOOKS.reduce((s, b) => s + b.rating, 0) / BOOKS.length;
    getElement('#avgRating').textContent = avg.toFixed(1);
  }

  /* ---------- 3. 折线图：月度销量趋势 ---------- */
  function initLineChart() {
    const el = getElement('#lineChart');
    const chart = echarts.init(el);
    const months = ['10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'];
    // 模拟近 12 个月销量（含开学季峰值）
    const sales = [8200, 7600, 9800, 15600, 6800, 12400, 13800, 11200, 9600, 8900, 11800, 16200];
    const orders = [530, 480, 620, 940, 410, 760, 850, 700, 590, 550, 720, 990];

    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['销量（册）', '订单量（单）'], top: 0 },
      grid: { left: 60, right: 20, top: 44, bottom: 30 },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        axisLabel: { color: '#86909C' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#F2F3F5' } },
        axisLabel: { color: '#86909C' }
      },
      series: [
        {
          name: '销量（册）',
          type: 'line',
          smooth: true,
          data: sales,
          lineStyle: { width: 3, color: '#165DFF' },
          itemStyle: { color: '#165DFF' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(22,93,255,0.28)' },
              { offset: 1, color: 'rgba(22,93,255,0.02)' }
            ])
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: '订单量（单）',
          type: 'line',
          smooth: true,
          data: orders,
          lineStyle: { width: 2, color: '#FF7D00', type: 'dashed' },
          itemStyle: { color: '#FF7D00' },
          symbol: 'diamond',
          symbolSize: 5
        }
      ]
    });
    return chart;
  }

  /* ---------- 4. 饼图：分类占比 ---------- */
  function initPieChart() {
    const el = getElement('#pieChart');
    const chart = echarts.init(el);
    const data = BOOK_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
      const total = BOOKS.filter((b) => b.category === cat.id).reduce((s, b) => s + b.sales, 0);
      return { name: cat.name, value: total };
    });

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}：{c} 册（{d}%）' },
      legend: { orient: 'vertical', right: 8, top: 'middle', textStyle: { color: '#4E5969' } },
      color: PALETTE,
      series: [{
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['42%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' },
          scaleSize: 8
        },
        data
      }]
    });
    return chart;
  }

  /* ---------- 5. 柱状图：出版社销量 ---------- */
  function initBarChart() {
    const el = getElement('#barChart');
    const chart = echarts.init(el);
    // 按出版社聚合销量，取 TOP 6
    const pubMap = {};
    BOOKS.forEach((b) => {
      pubMap[b.publisher] = (pubMap[b.publisher] || 0) + b.sales;
    });
    const sorted = Object.entries(pubMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const names = sorted.map(([k]) => k);
    const values = sorted.map(([, v]) => v);

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 80, right: 20, top: 20, bottom: 40 },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: '#86909C', interval: 0, rotate: 20 },
        axisLine: { lineStyle: { color: '#E5E6EB' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#F2F3F5' } },
        axisLabel: { color: '#86909C' }
      },
      series: [{
        type: 'bar',
        data: values,
        barWidth: 36,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4080FF' },
            { offset: 1, color: '#165DFF' }
          ])
        },
        label: { show: true, position: 'top', color: '#4E5969', formatter: (p) => formatNumber(p.value) }
      }]
    });
    return chart;
  }

  /* ---------- 6. 雷达图：评分维度 ---------- */
  function initRadarChart() {
    const el = getElement('#radarChart');
    const chart = echarts.init(el);
    // 取 3 本代表书目对比各维度评分
    const pick = ['三体（全三册）', 'JavaScript高级程序设计（第4版）', '人类简史：从动物到上帝'];
    const books = pick.map((t) => BOOKS.find((b) => b.title.includes(t)) || BOOKS[0]);

    chart.setOption({
      tooltip: {},
      legend: { data: books.map((b) => b.title), bottom: 0, textStyle: { color: '#4E5969', fontSize: 11 } },
      radar: {
        indicator: [
          { name: '内容深度', max: 10 },
          { name: '可读性', max: 10 },
          { name: '知识覆盖面', max: 10 },
          { name: '编排排版', max: 10 },
          { name: '读者口碑', max: 10 }
        ],
        radius: '62%',
        center: ['50%', '48%'],
        axisName: { color: '#4E5969', fontSize: 12 },
        splitArea: { areaStyle: { color: ['rgba(22,93,255,0.03)', 'rgba(22,93,255,0.06)'] } },
        splitLine: { lineStyle: { color: '#E5E6EB' } },
        axisLine: { lineStyle: { color: '#E5E6EB' } }
      },
      color: ['#165DFF', '#FF7D00', '#14C9C9'],
      series: [{
        type: 'radar',
        data: books.map((b) => ({
          value: [
            Math.min(10, b.rating * 0.95 + 0.3),
            Math.min(10, b.rating * 0.9 + 0.6),
            Math.min(10, b.rating * 0.92 + 0.4),
            Math.min(10, b.rating * 0.88 + 0.8),
            b.rating
          ].map((v) => Number(v.toFixed(1))),
          name: b.title
        }))
      }]
    });
    return chart;
  }

  /* ---------- 7. 热销表格 ---------- */
  function renderTable() {
    const tbody = getElement('#tableBody');
    const top = BOOKS.slice().sort((a, b) => b.sales - a.sales).slice(0, 8);
    renderList(top, (book, index) => {
      const tr = createElement('tr');
      tr.appendChild(createElement('td', { html: `<span class="rank-badge">${index + 1}</span>` }));
      tr.appendChild(createElement('td', { class: 'table-book', text: book.title }));
      tr.appendChild(createElement('td', { text: book.author }));
      tr.appendChild(createElement('td', { html: `<span class="tag tag-blue">${book.categoryName}</span>` }));
      tr.appendChild(createElement('td', {
        class: 'table-rating',
        html: `<i class="fa-solid fa-star"></i> ${book.rating}`
      }));
      tr.appendChild(createElement('td', { class: 'table-sales', text: formatNumber(book.sales) }));
      tr.appendChild(createElement('td', {
        html: `<a class="table-link" href="detail.html?id=${book.id}">查看详情</a>`
      }));
      return tr;
    }, tbody);
  }

  /* ---------- 8. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('data.html');
    renderStats();
    const charts = [];
    if (typeof echarts !== 'undefined') {
      charts.push(initLineChart(), initPieChart(), initBarChart(), initRadarChart());
      // 窗口尺寸变化时自适应（resize 事件）
      window.addEventListener('resize', () => {
        charts.forEach((c) => c.resize());
      });
    } else {
      const box = getElement('#lineChart');
      if (box) box.innerHTML = '<div class="empty-state"><p>ECharts 加载失败，请检查网络后刷新</p></div>';
    }
    renderTable();
    renderFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
