
((root) => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const Timeline = {
    layout(viewportHeight, headerHeight, contentHeight, count = 4) {
      const stageHeight = Math.max(0, viewportHeight - headerHeight);
      const step = clamp(stageHeight * .52, 190, 390);
      return {stageHeight, step, distance: step * (count + .35), fits: contentHeight <= stageHeight + 1};
    },
    presentation(full, compact, reduced = false) {
      if (reduced) return 'static';
      if (full.fits) return 'full';
      return compact?.fits ? 'compact' : 'natural';
    },
    frame(scrollDistance, step, count = 4) {
      const units = scrollDistance / step;
      return Array.from({length: count}, (_, i) => {
        const progress = clamp((units - i - .12) / .65, 0, 1);
        return 1 - Math.pow(1 - progress, 3);
      });
    },
    captions(values) { return values.map((value, i) => value * (1 - (values[i + 1] || 0))); },
    progress(distance, total, reduced = false) {
      return {value: clamp(distance / Math.max(1, total), 0, 1), active: !reduced && distance >= 0 && distance < total};
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = Timeline;
  if (typeof document === 'undefined') return;

  const section = document.querySelector('#beneficios');
  const pin = section?.querySelector('.benefits-pin');
  const content = pin?.querySelector('.section');
  const cards = [...(section?.querySelectorAll('.benefit-card') || [])];
  const nav = document.querySelector('.nav-wrap');
  const progressBar = section?.querySelector('.benefits-progress');
  const progressFill = progressBar?.querySelector('span');
  if (!section || !pin || !content || cards.length !== 4 || !nav) return;
  const motion = window.SiteMotion;
  const viewportProbe = document.createElement('div');
  viewportProbe.setAttribute('aria-hidden', 'true');
  viewportProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
  document.body.append(viewportProbe);

  const caption = document.createElement('div');
  caption.className = 'benefit-current-copy';
  caption.setAttribute('aria-hidden', 'true');
  const descriptions = cards.map(card => {
    const paragraph = card.querySelector('p').cloneNode(true);
    caption.append(paragraph);
    return paragraph;
  });
  content.append(caption);

  let presentation = 'static', layout = null, headerHeight = 0;
  let frameRequest = 0, measureRequest = 0;
  let previous = [];
  let previousProgress = -1, previousPercent = -1, progressActive = false;
  const isPinned = () => presentation === 'full' || presentation === 'compact';

  function paintProgress(distance, total) {
    if (!progressBar || !progressFill) return;
    const state = Timeline.progress(distance, total, presentation === 'static');
    if (state.active !== progressActive) {
      progressActive = state.active;
      progressBar.classList.toggle('is-active', state.active);
      progressBar.setAttribute('aria-hidden', String(!state.active));
    }
    if (state.value !== previousProgress) {
      progressFill.style.transform = `scaleX(${state.value})`;
      previousProgress = state.value;
    }
    const percent = Math.round(state.value * 100);
    if (percent !== previousPercent) { progressBar.setAttribute('aria-valuenow', String(percent)); previousPercent = percent; }
  }

  function paint(values) {
    const weights = Timeline.captions(values);
    const active = values.reduce((last, value, index) => value > .5 ? index : last, -1);
    values.forEach((value, index) => {
      if (value !== previous[index]) cards[index].style.setProperty('--benefit-reveal', String(value));
      previous[index] = value;
      cards[index].classList.toggle('benefit-current', index === active);
      descriptions[index].style.opacity = String(weights[index]);
    });
  }
  function update() {
    frameRequest = 0;
    if (presentation === 'static') { paintProgress(0, 1); return; }
    if (isPinned()) {
      const distance = headerHeight - section.getBoundingClientRect().top;
      paint(Timeline.frame(distance, layout.step));
      paintProgress(distance, layout.distance);
    } else {
      
      const revealLine = innerHeight * .91;
      const travel = Math.max(90, Math.min(180, innerHeight * .25));
      const values = cards.map(card => {
        const progress = clamp((revealLine - card.getBoundingClientRect().top) / travel, 0, 1);
        return 1 - Math.pow(1 - progress, 3);
      });
      paint(values);
      
      const rect = section.getBoundingClientRect();
      paintProgress(values.reduce((sum, value) => sum + value, 0), rect.top <= headerHeight ? 4 : 0);
    }
  }
  function requestUpdate() {
    if (!frameRequest && presentation !== 'static') frameRequest = requestAnimationFrame(update);
  }
  function moveTo(position) {
    const scroller = root.FxczasaUI?.scroller;
    scroller?.resize();
    if (scroller) scroller.scrollTo(position, {immediate:true, force:true});
    else window.scrollTo({top:position, behavior:'instant'});
  }
  function measure() {
    measureRequest = 0;
    const oldRect = section.getBoundingClientRect();
    const wasPinned = isPinned() && oldRect.top <= headerHeight && oldRect.top >= headerHeight - layout.distance;
    const oldProgress = wasPinned ? (headerHeight - oldRect.top) / layout.distance : 0;
    headerHeight = Math.round(nav.getBoundingClientRect().height);
    const viewportHeight = viewportProbe.offsetHeight || innerHeight;
    section.style.setProperty('--benefits-header', `${headerHeight}px`);
    section.classList.toggle('benefits-sequence-layout', !motion.matches);
    section.classList.remove('benefits-compact', 'benefits-natural-reveal');

    const full = Timeline.layout(viewportHeight, headerHeight, content.offsetHeight);
    let compact = null;
    if (!motion.matches && !full.fits) {
      section.classList.add('benefits-compact');
      compact = Timeline.layout(viewportHeight, headerHeight, content.offsetHeight);
    }
    presentation = Timeline.presentation(full, compact, motion.matches);
    layout = presentation === 'compact' ? compact : full;
    section.classList.toggle('benefits-compact', presentation === 'compact');
    section.classList.toggle('benefits-natural-reveal', presentation === 'natural');
    section.classList.toggle('benefits-scroll', isPinned());

    if (isPinned()) {
      section.style.setProperty('--benefits-stage', `${layout.stageHeight}px`);
      section.style.setProperty('--benefits-distance', `${layout.distance}px`);
      if (wasPinned) {
        const start = scrollY + section.getBoundingClientRect().top - headerHeight;
        const target = start + oldProgress * layout.distance;
        if (Math.abs(target - scrollY) > 1) moveTo(target);
      }
      update();
    } else {
      section.style.removeProperty('--benefits-stage');
      section.style.removeProperty('--benefits-distance');
      if (wasPinned) {
        const start = scrollY + section.getBoundingClientRect().top - headerHeight;
        moveTo(start + oldProgress * Math.max(0, section.offsetHeight - (viewportHeight - headerHeight)));
      }
      if (presentation === 'static') { paint(cards.map(() => 1)); paintProgress(0, 1); }
      else update();
    }
    root.FxczasaUI?.scroller?.resize();
  }
  function requestMeasure() { if (!measureRequest) measureRequest = requestAnimationFrame(measure); }
  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestMeasure, {passive:true});
  window.addEventListener('pageshow', requestMeasure);
  document.addEventListener('Fxczasa:language', requestMeasure);
  motion.addEventListener('change', requestMeasure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(requestMeasure);
    observer.observe(content); observer.observe(nav);
  }
  document.fonts?.ready.then(requestMeasure);
  measure();
})(typeof window === 'undefined' ? globalThis : window);
