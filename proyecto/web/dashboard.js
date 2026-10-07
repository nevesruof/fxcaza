(() => {
  const panel = document.querySelector('.hero-panel');
  const panels = [...panel.querySelectorAll('[data-dashboard-panel]')];
  const tabs = [...panel.querySelectorAll('[data-dashboard-section]')];
  const desktopTabs = tabs.filter(tab => tab.getAttribute('role') === 'tab');
  const keys = panels.map(section => section.dataset.dashboardPanel);
  const toggle = panel.querySelector('.dashboard-carousel-toggle');
  const label = panel.querySelector('.dashboard-carousel-label');
  const counter = panel.querySelector('.dashboard-slide-counter');
  const progress = panel.querySelector('.dashboard-progress span');
  const motion = window.SiteMotion;
  let current = 0, elapsed = 0, paused = false, visible = false, hovered = false;

  function updateControl() {
    const stopped = paused || motion.matches;
    toggle.setAttribute('aria-pressed', String(stopped));
    toggle.setAttribute('aria-label', window.Locale.t(stopped ? 'Reanudar carrusel' : 'Pausar carrusel'));
    toggle.querySelector('use').setAttribute('href', stopped ? '#i-play-clean' : '#i-pause-clean');
    toggle.disabled = motion.matches;
    label.textContent = window.Locale.t(stopped ? 'Carrusel pausado' : 'Carrusel activo');
  }
  function select(index, animate = true) {
    const next = (index + panels.length) % panels.length;
    const old = panels[current];
    const incoming = panels[next];
    old.getAnimations().forEach(animation => animation.cancel());
    incoming.getAnimations().forEach(animation => animation.cancel());
    current = next;
    elapsed = 0;
    progress.style.transform = 'scaleX(0)';
    panels.forEach((section, i) => {
      section.classList.toggle('is-current', i === current);
      section.inert = i !== current;
      section.setAttribute('aria-hidden', String(i !== current));
    });
    tabs.forEach(tab => {
      const selected = tab.dataset.dashboardSection === keys[current];
      tab.classList.toggle('selected', selected);
      if (tab.getAttribute('role') === 'tab') {
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      } else tab.setAttribute('aria-pressed', String(selected));
    });
    counter.textContent = `${String(current + 1).padStart(2, '0')} / 05`;
    if (animate && !motion.matches && old !== incoming) {
      incoming.animate([
        {opacity:0, transform:'translateY(12px)', filter:'blur(3px)'},
        {opacity:1, transform:'translateY(0)', filter:'blur(0)'}
      ], {duration:460, easing:'cubic-bezier(.22,1,.36,1)'});
    }
  }
  tabs.forEach(tab => tab.addEventListener('click', () => select(keys.indexOf(tab.dataset.dashboardSection))));
  desktopTabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    const indexes = {ArrowDown:(index+1)%keys.length, ArrowRight:(index+1)%keys.length, ArrowUp:(index+keys.length-1)%keys.length, ArrowLeft:(index+keys.length-1)%keys.length, Home:0, End:keys.length-1};
    if (!Object.hasOwn(indexes, event.key)) return;
    event.preventDefault();
    select(indexes[event.key]);
    desktopTabs[indexes[event.key]].focus({preventScroll:true});
  }));
  toggle.addEventListener('click', () => { paused = !paused; updateControl(); });
  panel.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') hovered = true; });
  panel.addEventListener('pointerleave', () => { hovered = false; });
  panel.querySelector('[data-dashboard-case]').addEventListener('click', () => document.querySelector('#case-open').click());
  panel.querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => { elapsed = 0; }));
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, {threshold:.08}).observe(panel);
  else visible = true;
  window.FxczasaUI.dashboardTick = delta => {
    const focused = panel.contains(document.activeElement) && document.activeElement !== toggle;
    if (paused || motion.matches || !visible || hovered || focused || document.body.classList.contains('dialog-open') || document.documentElement.classList.contains('intro-pending')) return;
    elapsed += delta;
    progress.style.transform = `scaleX(${Math.min(1, elapsed / 6)})`;
    if (elapsed >= 6) select(current + 1);
  };
  document.addEventListener('Fxczasa:language', updateControl);
  motion.addEventListener('change', updateControl);
  select(0, false);
  updateControl();
})();
