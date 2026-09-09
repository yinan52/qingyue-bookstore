/* ==========================================================================
   media.js —— 仅作用于 media.html（视听馆）
   功能：自定义音频播放器（播放/暂停/上一曲/下一曲/进度/音量/倍速），
   Canvas 频谱可视化（Web Audio API AnalyserNode）、曲目列表、video 提示
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 曲目数据 ---------- */
  const TRACKS = [
    {
      title: '晨光序曲 · 阅读时光',
      artist: '青阅书城电台',
      sources: [
        { src: 'assets/media/audio/track-01.mp3', type: 'audio/mpeg' },
        { src: 'assets/media/audio/track-01.ogg', type: 'audio/ogg' },
        { src: 'assets/media/audio/track-01.wav', type: 'audio/wav' }
      ],
      cover: 'assets/images/goods/book-05.svg',
      duration: '0:28'
    },
    {
      title: '午后的旋律',
      artist: '青阅书城电台',
      sources: [
        { src: 'assets/media/audio/track-02.mp3', type: 'audio/mpeg' },
        { src: 'assets/media/audio/track-02.ogg', type: 'audio/ogg' },
        { src: 'assets/media/audio/track-02.wav', type: 'audio/wav' }
      ],
      cover: 'assets/images/goods/book-08.svg',
      duration: '0:24'
    },
    {
      title: '静夜书香',
      artist: '青阅书城电台',
      sources: [
        { src: 'assets/media/audio/track-03.mp3', type: 'audio/mpeg' },
        { src: 'assets/media/audio/track-03.ogg', type: 'audio/ogg' },
        { src: 'assets/media/audio/track-03.wav', type: 'audio/wav' }
      ],
      cover: 'assets/images/goods/book-12.svg',
      duration: '0:25'
    }
  ];

  /* ---------- 2. 播放器状态 ---------- */
  let currentIndex = 0;
  let isPlaying = false;
  let audioCtx = null;
  let analyser = null;
  let visualRaf = null;

  const audio = new Audio();
  audio.preload = 'metadata';

  /* ---------- 3. 初始化曲目列表 ---------- */
  function renderTrackList() {
    const list = getElement('#trackList');
    list.innerHTML = '';
    TRACKS.forEach((t, index) => {
      const item = createElement('li', {
        class: 'track-item' + (index === currentIndex ? ' active' : ''),
        attrs: { 'data-index': index }
      });
      item.appendChild(createElement('span', { class: 'track-no', text: index + 1 }));
      item.appendChild(createElement('span', { class: 'track-name', text: t.title }));
      item.appendChild(createElement('span', { class: 'track-dur', text: t.duration }));
      item.addEventListener('click', () => {
        if (index === currentIndex) {
          togglePlay();
        } else {
          loadTrack(index);
          playTrack();
        }
      });
      list.appendChild(item);
    });
  }

  /* ---------- 4. 加载与播放 ---------- */
  function loadTrack(index) {
    currentIndex = index;
    const t = TRACKS[index];
    // 清空旧 source 后重新添加（多格式 source 标签）
    audio.innerHTML = '';
    t.sources.forEach((s) => {
      const source = createElement('source', { attrs: { src: s.src, type: s.type } });
      audio.appendChild(source);
    });
    audio.load();

    getElement('#trackTitle').textContent = t.title;
    getElement('.player-cover img').src = t.cover;
    renderTrackList();
  }

  function playTrack() {
    audio.play().then(() => {
      isPlaying = true;
      getElement('#playBtn').innerHTML = '<i class="fa-solid fa-pause"></i>';
      getElement('.player-cover').classList.add('playing');
      startVisualizer();
    }).catch((e) => {
      console.warn('音频播放失败：', e);
      showToast('音频加载失败，请检查网络', 'error');
    });
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    getElement('#playBtn').innerHTML = '<i class="fa-solid fa-play"></i>';
    getElement('.player-cover').classList.remove('playing');
    stopVisualizer();
  }

  function togglePlay() {
    if (isPlaying) pauseTrack();
    else playTrack();
  }

  /* ---------- 5. 时间与进度 ---------- */
  function formatAudioTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function updateProgressUI() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    getElement('#progressFill').style.width = pct + '%';
    getElement('#progressDot').style.left = pct + '%';
    getElement('#currentTime').textContent = formatAudioTime(audio.currentTime);
    getElement('#durationTime').textContent = formatAudioTime(audio.duration);
  }

  /* ---------- 6. 频谱可视化（Web Audio API + Canvas） ---------- */
  function startVisualizer() {
    const canvas = getElement('#visualizer');
    const ctx2d = canvas.getContext('2d');
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    audioCtx.resume();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      visualRaf = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = dataArray.length;
      const barWidth = canvas.width / barCount;
      // for 循环逐条绘制频谱柱
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i];
        const h = (value / 255) * canvas.height * 0.9;
        const hue = 200 + (i / barCount) * 100;   // 青蓝→紫渐变
        ctx2d.fillStyle = `hsla(${hue}, 85%, 62%, 0.9)`;
        ctx2d.fillRect(i * barWidth + 1, canvas.height - h, barWidth - 2, h);
      }
      // 基线
      ctx2d.fillStyle = 'rgba(255,255,255,0.06)';
      ctx2d.fillRect(0, canvas.height - 2, canvas.width, 2);
    };
    draw();
  }

  function stopVisualizer() {
    if (visualRaf) cancelAnimationFrame(visualRaf);
  }

  /* ---------- 7. 控制事件绑定 ---------- */
  function bindControls() {
    getElement('#playBtn').addEventListener('click', togglePlay);
    getElement('#prevBtn').addEventListener('click', () => {
      loadTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length);
      playTrack();
    });
    getElement('#nextBtn').addEventListener('click', () => {
      loadTrack((currentIndex + 1) % TRACKS.length);
      playTrack();
    });

    // 音频事件（timeupdate / ended）
    audio.addEventListener('timeupdate', updateProgressUI);
    audio.addEventListener('ended', () => {
      loadTrack((currentIndex + 1) % TRACKS.length);
      playTrack();
    });
    audio.addEventListener('loadedmetadata', updateProgressUI);

    // 点击进度条跳转
    const track = getElement('#progressTrack');
    track.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = track.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = ratio * audio.duration;
      updateProgressUI();
    });

    // 音量控制
    const volTrack = getElement('#volumeTrack');
    const setVolume = (ratio) => {
      audio.volume = Math.max(0, Math.min(1, ratio));
      getElement('#volumeFill').style.width = (audio.volume * 100) + '%';
      getElement('#volumeText').textContent = Math.round(audio.volume * 100) + '%';
    };
    volTrack.addEventListener('click', (e) => {
      const rect = volTrack.getBoundingClientRect();
      setVolume((e.clientX - rect.left) / rect.width);
    });

    // 倍速（事件委托）
    delegateEvent(getElement('.speed-group'), '.speed-btn', 'click', (e, btn) => {
      getElements('.speed-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      audio.playbackRate = Number(btn.dataset.speed);
      showToast(`播放速度 ${btn.dataset.speed}x`, 'info');
    });
  }

  /* ---------- 8. 初始化 ---------- */
  function init() {
    initPageLoading();
    initLayout('media.html');
    loadTrack(0);
    renderTrackList();
    bindControls();
    renderFooterYear();
    // 视频默认不自动播放，提示使用原生控件（poster 已展示）
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
