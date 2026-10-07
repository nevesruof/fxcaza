(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const root = document.documentElement;
  const motion = window.SiteMotion;
  const UI = window.FxczasaUI = { scroller: null };
  const motionButton = $('#motion-toggle');
  function updateMotionButton() {
    motionButton.textContent = window.Locale.t(motion.matches ? 'Animaciones desactivadas' : 'Animaciones activadas');
    motionButton.setAttribute('aria-pressed', String(!motion.matches));
  }
  motionButton.addEventListener('click', () => window.SiteMotion.setReduced(!motion.matches));
  motion.addEventListener('change', updateMotionButton);
  document.addEventListener('Fxczasa:language', updateMotionButton);
  updateMotionButton();
  
  root.dataset.theme = 'dark';
  const menuButton = $('.menu-toggle');
  const menu = $('#site-menu');
  const languageButton = $('#language-toggle');
  const languageMenu = $('#language-menu');
  $$('.menu-links a', menu).forEach((link,index) => link.style.setProperty('--menu-order', index + 1));
  let menuOpen = false;
  let languageOpen = false;
  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('open', open); menu.inert = !open;
    menu.setAttribute('aria-hidden', String(!open));
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', window.Locale.t(open ? 'Cerrar menú' : 'Abrir menú'));
    if (open) setLanguageMenu(false);
  }
  function setLanguageMenu(open) {
    languageOpen = open; languageMenu.classList.toggle('open', open); languageMenu.inert = !open;
    languageMenu.setAttribute('aria-hidden', String(!open));
    languageButton.setAttribute('aria-expanded', String(open));
  }
  menuButton.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('Fxczasa:close-menu', () => setMenu(false));
  languageButton.addEventListener('click', () => { setMenu(false); setLanguageMenu(!languageOpen); });
  document.addEventListener('click', event => {
    if (menuOpen && !$('.header').contains(event.target)) setMenu(false);
    if (languageOpen && !$('.language-control').contains(event.target)) setLanguageMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (languageOpen) { setLanguageMenu(false); languageButton.focus(); }
    else if (menuOpen) { setMenu(false); menuButton.focus(); }
  });
  $('.header').addEventListener('focusout', () => setTimeout(() => {
    if (!document.activeElement.closest('.header')) setMenu(false);
    if (!document.activeElement.closest('.language-control')) setLanguageMenu(false);
  }, 0));
  languageButton.addEventListener('keydown', event => { if(event.key==='ArrowDown'){event.preventDefault();setLanguageMenu(true);$('[data-language]', languageMenu).focus();} });
  $$('[data-language]').forEach((button,index,buttons) => {
    button.addEventListener('keydown', event => {
      if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
        buttons[next].focus();
      }
    });
    button.addEventListener('click', () => {
      const language = button.dataset.language;
      setLanguageMenu(false); languageButton.focus();
      if (language === window.Locale.language) return;
      window.Locale.set(language);
      $('#current-flag').src=`assets/flag-${language}.svg`;
      $('#current-flag').alt=language==='es'?'Español':'English';
      $$('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===language)));
      updateThemeLabel();
      if(!motion.matches) {
        [$('#main'),$('.footer')].forEach(el=>el.animate([{opacity:.18,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'}));
        $('#current-flag').animate([{opacity:0,transform:'translateY(-7px) rotate(-9deg)'},{opacity:1,transform:'translateY(0) rotate(0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'});
      }
    });
  });

  function configureScroll() {
    UI.scroller?.destroy(); UI.scroller=null;
    if (!motion.matches && typeof window.Lenis === 'function') {
      UI.scroller=new window.Lenis({ autoRaf:true, lerp:.09, smoothWheel:true, syncTouch:false, touchMultiplier:1, wheelMultiplier:.85, anchors:false, prevent:node=>Boolean(node.closest?.('[data-lenis-prevent],.menu-inner,.language-menu,dialog,textarea,select')) });
    }
  }
  configureScroll();
  if(root.classList.contains('intro-pending')) {
    UI.scroller?.stop();
    document.addEventListener('Fxczasa:intro-ready',()=>UI.scroller?.start(),{once:true});
  }
  motion.addEventListener('change',configureScroll);
  let navigationId = 0, nativeScrollFrame = 0;
  UI.navigateTo = target => {
    const element = typeof target === 'string' ? $(target) : target;
    if (!element) return;
    const id = ++navigationId;
    cancelAnimationFrame(nativeScrollFrame);
    setMenu(false);
    const offset = $('.nav-wrap').offsetHeight + 24;
    const destination = Math.max(0, Math.min(document.scrollingElement.scrollHeight - innerHeight, element.getBoundingClientRect().top + scrollY - offset));
    const start = scrollY;
    const distance = destination - start;
    const duration = Math.min(1.45, .8 + Math.abs(distance) / 14000);
    const ease = t => t < .5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2;
    const finish = () => {
      if (id !== navigationId) return;
      element.classList.add('visible');
      if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex','-1');
      element.focus({preventScroll:true});
      if (!motion.matches) {
        element.getAnimations().forEach(animation => animation.cancel());
        element.animate([{opacity:.75,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'});
      }
    };
    if (motion.matches || Math.abs(distance) < 2) {
      UI.scroller?.scrollTo(destination,{immediate:true,force:true});
      window.scrollTo({top:destination,behavior:'instant'});
      finish();
    } else if (UI.scroller) UI.scroller.scrollTo(destination,{duration,easing:ease,onComplete:finish});
    else {
      let started;
      const animate = now => {
        if (id !== navigationId) return;
        started ??= now;
        const progress = Math.min(1,(now-started)/(duration*1000));
        window.scrollTo({top:start+distance*ease(progress),behavior:'instant'});
        if (progress < 1) nativeScrollFrame = requestAnimationFrame(animate);
        else { nativeScrollFrame = 0; finish(); }
      };
      nativeScrollFrame = requestAnimationFrame(animate);
    }
  };
  const interruptNavigation = () => { navigationId++; cancelAnimationFrame(nativeScrollFrame); nativeScrollFrame = 0; };
  window.addEventListener('wheel',interruptNavigation,{passive:true});
  window.addEventListener('touchstart',interruptNavigation,{passive:true});
  $$('a[href^="#"]').forEach(link => link.addEventListener('click',event => {
    const hash = link.getAttribute('href');
    const target = $(hash);
    if (!target) return;
    event.preventDefault();
    UI.navigateTo(target);
    try { history.replaceState(null,'',hash); } catch {}
  }));

  const glow=$('#pointer-glow'); const finePointer=matchMedia('(pointer:fine)');
  let pointerFrame=0, pointerX=innerWidth/2,pointerY=innerHeight/2;
  window.addEventListener('pointermove',event=>{
    if(!finePointer.matches||motion.matches||event.pointerType==='touch')return;
    pointerX=event.clientX;pointerY=event.clientY;
    if(pointerFrame)return;
    pointerFrame=requestAnimationFrame(()=>{
      glow.style.setProperty('--pointer-x',`${pointerX}px`);glow.style.setProperty('--pointer-y',`${pointerY}px`);
      glow.classList.add('is-visible');pointerFrame=0;
    });
  },{passive:true});
  document.addEventListener('mouseleave',()=>glow.classList.remove('is-visible'));

  const themeButton=$('#theme-toggle');let themeBusy=false;
  function updateThemeLabel() {
    const isDark=root.dataset.theme==='dark';
    $('use',themeButton).setAttribute('href',isDark?'#i-moon':'#i-sun');
    const label=window.Locale.t(isDark?'Cambiar a tema claro':'Cambiar a tema oscuro');
    themeButton.setAttribute('aria-label',label);themeButton.title=label;
    $('meta[name="theme-color"]').content=isDark?'#0a0a0d':'#f9f9fc';
  }
  themeButton.addEventListener('click',async()=>{
    if(themeBusy)return;
    const next=root.dataset.theme==='dark'?'light':'dark';
    const rect=themeButton.getBoundingClientRect();const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
    const radius=Math.ceil(Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y)))+12;
    const clip=[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`];
    const change=()=>{root.dataset.theme=next;updateThemeLabel();};
    if(motion.matches){change();return;}
    themeBusy=true;root.classList.add('theme-changing');
    UI.scroller?.stop();
    try{
      if(typeof document.startViewTransition==='function') {
        const transition=document.startViewTransition(change);
        await transition.ready;
        await root.animate({clipPath:clip},{duration:850,easing:'cubic-bezier(.65,0,.18,1)',pseudoElement:'::view-transition-new(root)'}).finished;
        await transition.finished;
      } else {
        const wipe=$('#theme-wipe');wipe.style.setProperty('--wipe-color',next==='dark'?'#0a0a0d':'#f9f9fc');wipe.style.visibility='visible';
        const expand=wipe.animate({clipPath:clip},{duration:650,easing:'cubic-bezier(.65,0,.18,1)',fill:'forwards'});
        await expand.finished;change();
        await wipe.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards'}).finished;
        wipe.getAnimations().forEach(a=>a.cancel());wipe.style.visibility='hidden';
      }
    }catch{
      change();const wipe=$('#theme-wipe');wipe.getAnimations().forEach(a=>a.cancel());wipe.style.visibility='hidden';
    }finally{
      themeBusy=false;root.classList.remove('theme-changing');if(!document.body.classList.contains('dialog-open'))UI.scroller?.start();
    }
  });
  updateThemeLabel();

  window.Locale.apply(document.body);
})();
