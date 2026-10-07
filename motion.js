
(() => {
  const listeners = new Set();
  let reduced = false;
  const update = () => { document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'; };
  window.SiteMotion = {
    get matches() { return reduced; },
    addEventListener(type, fn) { if (type === 'change') listeners.add(fn); },
    removeEventListener(type, fn) { if (type === 'change') listeners.delete(fn); },
    setReduced(value) {
      reduced = Boolean(value); update();
      listeners.forEach(fn => fn({matches:reduced}));
    }
  };
  update();
})();
