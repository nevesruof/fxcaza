
(() => {
  const root = document.documentElement;
  const motion = window.SiteMotion;
  const rail = document.createElement('div');
  rail.className = 'page-scrollbar';
  rail.tabIndex = 0;
  rail.setAttribute('role', 'scrollbar');
  rail.setAttribute('aria-controls', 'main');
  rail.setAttribute('aria-orientation', 'vertical');
  rail.setAttribute('aria-valuemin', '0');
  rail.setAttribute('aria-valuemax', '100');
  rail.setAttribute('aria-valuenow', '0');
  rail.innerHTML = '<span class="page-scrollbar-track" aria-hidden="true"><span class="page-scrollbar-fill"></span></span><span class="page-scrollbar-thumb" aria-hidden="true"></span>';
  document.body.append(rail);
  const thumb = rail.querySelector('.page-scrollbar-thumb');
  const fill = rail.querySelector('.page-scrollbar-fill');
  let frame = 0, measureNeeded = true, maxScroll = 0, travel = 0, thumbSize = 30;
  let dragging = false, grabOffset = 0, idleTimer = 0, lastPercent = -1;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const scroller = () => window.FxczasaUI?.scroller;

  function localize() {
    rail.setAttribute('aria-label', window.Locale.t('Desplazamiento de la página'));
  }
  function show() {
    rail.classList.add('is-scrolling');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (!dragging) rail.classList.remove('is-scrolling'); }, 1000);
  }
  function render() {
    frame = 0;
    if (measureNeeded) {
      const header = document.querySelector('.nav-wrap').offsetHeight;
      const top = header + 22;
      const height = Math.max(1, innerHeight - top - 28);
      const docHeight = document.scrollingElement.scrollHeight;
      maxScroll = Math.max(0, docHeight - innerHeight);
      thumbSize = clamp(height * innerHeight / Math.max(docHeight, innerHeight), Math.min(28, height), Math.min(80, height));
      travel = Math.max(0, height - thumbSize);
      rail.style.top = `${top}px`;
      rail.style.height = `${height}px`;
      thumb.style.height = `${thumbSize}px`;
      rail.hidden = maxScroll <= 1;
      measureNeeded = false;
    }
    const progress = maxScroll ? clamp(scrollY / maxScroll, 0, 1) : 0;
    thumb.style.transform = `translateY(${progress * travel}px)`;
    fill.style.transform = `scaleY(${progress})`;
    const percent = Math.round(progress * 100);
    if (percent !== lastPercent) { rail.setAttribute('aria-valuenow', String(percent)); lastPercent = percent; }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function measure() { measureNeeded = true; schedule(); }
  function move(top, immediate = false) {
    const value = clamp(top, 0, maxScroll);
    const smooth = scroller();
    if (smooth) smooth.scrollTo(value, {immediate: immediate || motion.matches, force:true, duration:.4});
    else window.scrollTo({top:value, behavior:immediate || motion.matches ? 'instant' : 'smooth'});
    show();
  }
  function dragTo(event) {
    const y = event.clientY - rail.getBoundingClientRect().top - grabOffset;
    move(travel ? clamp(y / travel, 0, 1) * maxScroll : 0, true);
  }
  rail.addEventListener('pointerdown', event => {
    if (event.button !== 0 || document.body.classList.contains('dialog-open')) return;
    event.preventDefault();
    render();
    dragging = true;
    rail.classList.add('is-dragging');
    rail.focus({preventScroll:true});
    const pos = maxScroll ? clamp(scrollY / maxScroll, 0, 1) * travel : 0;
    grabOffset = event.target === thumb ? clamp(event.clientY - rail.getBoundingClientRect().top - pos, 0, thumbSize) : thumbSize / 2;
    rail.setPointerCapture(event.pointerId);
    scroller()?.stop();
    dragTo(event);
  });
  rail.addEventListener('pointermove', event => { if (dragging) dragTo(event); });
  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove('is-dragging');
    if (!document.body.classList.contains('dialog-open') && !root.classList.contains('intro-pending')) scroller()?.start();
    show();
  }
  rail.addEventListener('pointerup', finishDrag);
  rail.addEventListener('pointercancel', finishDrag);
  rail.addEventListener('lostpointercapture', finishDrag);
  rail.addEventListener('keydown', event => {
    const targets = {ArrowDown:scrollY+60, ArrowUp:scrollY-60, PageDown:scrollY+innerHeight*.85, PageUp:scrollY-innerHeight*.85, Home:0, End:maxScroll};
    if (!Object.hasOwn(targets, event.key)) return;
    event.preventDefault(); move(targets[event.key]);
  });
  window.addEventListener('scroll', () => { schedule(); show(); }, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('pageshow', measure);
  window.visualViewport?.addEventListener('resize', measure, {passive:true});
  document.addEventListener('Fxczasa:language', () => { localize(); measure(); });
  document.addEventListener('Fxczasa:intro-ready', measure);
  motion.addEventListener('change', measure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(document.querySelector('main'));
    observer.observe(document.querySelector('.footer'));
    observer.observe(document.querySelector('.nav-wrap'));
  }
  document.fonts?.ready.then(measure);
  localize(); render();
  
  root.classList.add('scroll-enhanced');
})();
