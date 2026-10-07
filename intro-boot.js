
(() => {
  const root = document.documentElement;
  if (location.hash || window.SiteMotion.matches) return;
  root.classList.add('intro-pending');
  
  window.FxczasaIntroFallback = setTimeout(() => {
    root.classList.remove('intro-pending');
    document.dispatchEvent(new Event('Fxczasa:intro-ready'));
  }, 4000);
})();
