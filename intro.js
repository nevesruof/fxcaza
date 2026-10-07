
(() => {
  const root = document.documentElement;
  const motion = window.SiteMotion;
  const splash = document.querySelector('#site-intro');
  const headings = [...document.querySelectorAll('.hero h1, .about h2, .feature h2, .center-copy h2, .section-heading h2, .trajectory-heading h2, .final-cta h2')];
  let observer = null, finished = !root.classList.contains('intro-pending');
  let exitTimer;

  function unsplit() {
    observer?.disconnect();
    headings.forEach(heading => {
      heading.getAnimations({subtree:true}).forEach(animation => animation.cancel());
      heading.querySelectorAll('[data-reveal-text]').forEach(group => group.replaceWith(document.createTextNode(group.textContent)));
      heading.classList.remove('text-reveal', 'text-revealed');
    });
  }
  function split(heading) {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue.trim() && !node.parentElement.closest('.type-wrap, [data-reveal-text]')) nodes.push(node);
    }
    let order = 0;
    for (const node of nodes) {
      const group = document.createElement('span');
      group.dataset.revealText = '';
      for (const token of node.nodeValue.split(/(\s+)/)) {
        if (!token) continue;
        if (/^\s+$/.test(token)) { group.append(document.createTextNode(token)); continue; }
        const word = document.createElement('span'); word.className = 'reveal-word';
        for (const character of Array.from(token)) {
          const letter = document.createElement('span'); letter.className = 'reveal-letter';
          letter.textContent = character; letter.style.setProperty('--letter-delay', `${order++ * 14}ms`);
          word.append(letter);
        }
        group.append(word);
      }
      node.replaceWith(group);
    }
    heading.style.setProperty('--word-delay', `${order * 14}ms`);
    heading.classList.add('text-reveal');
  }
  function revealHeadings() {
    unsplit();
    if (motion.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('text-revealed'); observer.unobserve(entry.target);
      }
    }, {threshold: .15});
    headings.forEach(heading => { split(heading); observer.observe(heading); });
  }
  function showPage() {
    clearTimeout(exitTimer); clearTimeout(window.FxczasaIntroFallback);
    root.classList.remove('intro-pending');
    if (finished) return;
    finished = true;
    revealHeadings();
    if (!motion.matches) {
      const elements = document.querySelectorAll('.header, .hero-badge, .hero-content > p, .hero-content > .button, .hero-caption, .hero-panel, .hero-bottom');
      elements.forEach((element, index) => element.animate([
        {opacity:0, translate:'0 18px', filter:'blur(7px)'},
        {opacity:1, translate:'0 0', filter:'blur(0px)'}
      ], {duration:850,delay:index*100,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    }
    document.dispatchEvent(new Event('Fxczasa:intro-ready'));
  }
  if (finished) revealHeadings();
  else {
    exitTimer = setTimeout(showPage, 2150);
    splash.addEventListener('pointerdown', showPage, {once:true});
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !finished) showPage(); });
  }
  document.addEventListener('Fxczasa:before-language', unsplit);
  document.addEventListener('Fxczasa:language', () => { if (finished) revealHeadings(); });
  document.addEventListener('Fxczasa:intro-ready', () => { if (!finished) showPage(); });
  motion.addEventListener('change', () => { if (motion.matches) showPage(); if (finished) revealHeadings(); });
  window.addEventListener('pageshow', event => { if (event.persisted) showPage(); });
})();
