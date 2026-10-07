
(() => {
  const timeline = document.querySelector('.server-timeline');
  if (!timeline) return;
  const entries = [...timeline.querySelectorAll('.timeline-entry')];
  const motion = window.SiteMotion;
  let frame = 0, measureNeeded = true;
  let linePadding = 0, lineHeight = 1, centers = [], reached = [];
  const clamp = value => Math.max(0, Math.min(1, value));
  function render() {
    frame = 0;
    const rect = timeline.getBoundingClientRect();
    if (measureNeeded) {
      linePadding = innerWidth <= 760 ? 16 : 30;
      lineHeight = Math.max(1, rect.height - linePadding * 2);
      centers = entries.map(entry => {
        const bounds = entry.getBoundingClientRect();
        return bounds.top - rect.top + bounds.height / 2;
      });
      measureNeeded = false;
    }
    const focusLine = innerHeight * .76;
    const progress = motion.matches ? 1 : clamp((focusLine - rect.top - linePadding) / lineHeight);
    timeline.style.setProperty('--timeline-progress', String(progress));
    entries.forEach((entry,index) => {
      const state = motion.matches || rect.top + centers[index] <= focusLine;
      if (state !== reached[index]) entry.classList.toggle('is-reached', state);
      reached[index] = state;
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function remeasure() { measureNeeded = true; schedule(); }
  function configure() {
    timeline.classList.toggle('timeline-motion', !motion.matches);
    render();
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', remeasure, {passive:true});
  window.addEventListener('pageshow', remeasure);
  document.addEventListener('Fxczasa:language', remeasure);
  motion.addEventListener('change', configure);
  document.fonts?.ready.then(remeasure);
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(timeline);
  
  for (const entry of entries) {
    let pulse;
    entry.addEventListener('pointerdown', () => {
      if (motion.matches) return;
      clearTimeout(pulse);
      entry.classList.add('bloom-pulse');
      pulse = setTimeout(() => entry.classList.remove('bloom-pulse'), 1300);
    }, {passive:true});
  }
  configure();
})();
