const SITE = window.Profile;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const reduceMotion = window.SiteMotion;

function closeMenu() { document.dispatchEvent(new Event('Fxczasa:close-menu')); }
if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); } }), { threshold: 0.15 });
  $$('.reveal').forEach(el => reveals.observe(el));
  document.documentElement.classList.add('js');
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) $$('.menu-inner a').forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`)); }), { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  $$('main section[id]').forEach(el => navObserver.observe(el));
}

let words = ['equipo', 'comunidad', 'servidor', 'proyecto'];
let wordIndex = 0, letter = words[0].length, deleting = true, typeTimer;
function typeNext() {
  if (reduceMotion.matches) { $('#typewriter').textContent = words[0]; return; }
  if (document.hidden) { typeTimer = setTimeout(typeNext, 300); return; }
  const word = words[wordIndex];
  if (deleting) {
    letter = Math.max(0, letter - 1);
    $('#typewriter').textContent = word.slice(0, letter);
    if (!letter) { deleting = false; wordIndex = (wordIndex + 1) % words.length; typeTimer = setTimeout(typeNext, 250); }
    else typeTimer = setTimeout(typeNext, 32);
  } else {
    letter++;
    $('#typewriter').textContent = words[wordIndex].slice(0, letter);
    if (letter >= words[wordIndex].length) { deleting = true; typeTimer = setTimeout(typeNext, 2300); }
    else typeTimer = setTimeout(typeNext, 55);
  }
}
function startTypewriter() { clearTimeout(typeTimer); if (!reduceMotion.matches) typeTimer = setTimeout(typeNext, 2600); }
if (document.documentElement.classList.contains('intro-pending')) document.addEventListener('Fxczasa:intro-ready', startTypewriter, {once:true});
else startTypewriter();

const check = text => `<div><span class="check-square">${icon('check')}</span>${text}</div>`;
const sessionHead = (symbol, title, sub, tag) => `<div class="session-person"><div class="session-avatar">${icon(symbol)}</div><div><h3>${title}</h3><small>${sub}</small></div><span class="tag green">${tag}</span></div>`;
const skills = [
  { eyebrow: 'SCREENSHARE', title: 'Detecto trampas.<br>Protejo el juego.', description: 'Reviso posibles trampas mediante una pantalla compartida acordada, con límites claros. Contrasto los hallazgos y documento las pruebas antes de comunicar una decisión.', window: 'Sesión de ScreenShare', body: `${sessionHead('eye','Revisión #SS-024','Jugador de ejemplo · BoxPvP','Revisado')}<div class="session-meta"><span><small>RESPONSABLE</small>Fxczasa</span><span><small>PROTOCOLO</small>Revisión acordada</span></div><div class="checklist">${check('Consentimiento del jugador confirmado')}${check('Revisión conforme a las reglas del servidor')}${check('Evidencia organizada y contextualizada')}${check('Veredicto compartido con administración')}</div><div class="session-status"><span>4 de 4 pasos documentados</span>${icon('check')}</div>` },
  { eyebrow: 'MODERACIÓN', title: 'Orden<br>sin excesos.', description: 'Aplico las reglas del servidor de forma justa, documentando cada sanción con pruebas verificables y el contexto necesario.', window: 'Registro de moderación', body: `${sessionHead('shield','Cada acción, justificada','Registro ilustrativo de moderación','Con evidencia')}<div class="mini-log"><div>Spam reiterado<small>MOD-018 · Advertencia documentada</small></div><span class="tag">Advertencia</span></div><div class="mini-log"><div>Reporte de comportamiento<small>MOD-019 · Contexto revisado</small></div><span class="tag green">Revisado</span></div><div class="mini-log"><div>Solicitud de apelación<small>MOD-020 · Segunda revisión</small></div><span class="tag">Seguimiento</span></div><div class="session-status"><span>Reglas claras. Decisiones proporcionales.</span>${icon('shield')}</div>` },
  { eyebrow: 'SOPORTE', title: 'Menos espera.<br>Más soluciones.', description: 'Atiendo consultas del servidor, organizo prioridades y ayudo al equipo a resolver tickets con rapidez y un trato cercano.', window: 'Centro de soporte', body: `${sessionHead('chat','La comunidad tiene voz','Bandeja de tickets','Atendidos')}<div class="mini-log"><div>#T-018 · Duda sobre las reglas<small>Consulta resuelta y explicada</small></div><span class="tag green">Resuelto</span></div><div class="mini-log"><div>#T-019 · Reporte de un jugador<small>Evidencia recibida</small></div><span class="tag">En revisión</span></div><div class="mini-log"><div>#T-020 · Ayuda para empezar<small>Guía compartida con el jugador</small></div><span class="tag green">Resuelto</span></div><div class="session-status"><span>Escuchar también es moderar.</span>${icon('chat')}</div>` },
  { eyebrow: 'SS MANAGEMENT', title: 'Coordino revisiones.<br>Cuido el criterio.', description: 'Coordino al equipo de ScreenShare, unifico criterios y reviso la documentación de cada caso. Acompaño la formación del staff y el seguimiento de reportes.', window: 'Coordinación del equipo', body: `${sessionHead('grid','Un relevo sin pendientes','Ejemplo de coordinación interna','Organizado')}<div class="session-meta"><span><small>CANAL</small># coordinación-staff</span><span><small>GUÍA</small>Protocolo compartido</span></div><div class="checklist">${check('Turnos y responsabilidades definidos')}${check('Pendientes y contexto compartidos')}${check('Formación y seguimiento del staff')}${check('Objetivos compartidos con administración')}</div><div class="session-status"><span>La comunicación mantiene el orden.</span>${icon('check')}</div>` },
  { eyebrow: 'DISPONIBILIDAD', title: 'Presente cuando<br>más importa.', description: 'Horarios flexibles y alta disponibilidad, incluyendo fines de semana y picos de actividad. Los turnos se acuerdan con tu equipo.', window: 'Planificación de turnos', body: `${sessionHead('clock','Hagamos espacio para tu equipo','Calendario ilustrativo · turnos por acordar','Flexible')}<div class="schedule">${['L','M','X','J','V','S','D'].map(x=>`<div class="day-label">${x}</div>`).join('')}${Array.from({length:14},(_,i)=>`<div class="${[1,3,4,5,6,8,10,12,13].includes(i)?'scheduled':''}">${i+1}</div>`).join('')}</div><div class="session-status"><span>Cobertura acordada. Compromiso constante.</span>${icon('clock')}</div><p style="font-size:14px;margin-top:14px">Ejemplo de turnos, no un horario confirmado.</p>` }
];
let activeSkill = 0, carouselElapsed = 0, carouselPaused = reduceMotion.matches, carouselVisible = true, carouselHovered = false;
const tabButtons = $$('.skill-tabs [role="tab"]');
const carouselProgress = $('#carousel-progress-bar');
let skillSwitchTimer;
function selectSkill(index, animate = true) {
  activeSkill = (index + skills.length) % skills.length; carouselElapsed = 0;
  const data = skills[activeSkill];
  clearTimeout(skillSwitchTimer);
  const targets = [$('#skill-text'), $('#skill-mockup')];
  targets.forEach(el => el.getAnimations().forEach(animation => animation.cancel()));
  $('#skill-panel').setAttribute('aria-labelledby', `tab-${activeSkill}`);
  tabButtons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === activeSkill)); button.tabIndex = i === activeSkill ? 0 : -1; });
  carouselProgress.style.transform = 'scaleX(0)';
  const render = () => {
    $('#skill-eyebrow').textContent = data.eyebrow; $('#skill-title').innerHTML = data.title;
    $('#skill-description').textContent = data.description; $('#skill-window-title').textContent = data.window;
    $('#skill-mockup').innerHTML = `<div class="skill-card-body">${data.body}</div>`;
    window.Locale.apply($('.skills'));
    if (animate && !reduceMotion.matches) targets.forEach((el,i) => el.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:i*35,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  };
  if (animate && !reduceMotion.matches) {
    targets.forEach(el => el.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:140,easing:'ease-in',fill:'forwards'}));
    skillSwitchTimer=setTimeout(() => { targets.forEach(el=>el.getAnimations().forEach(a=>a.cancel())); render(); },140);
  } else render();
}
tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectSkill(index));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % 5;
    if (event.key === 'ArrowLeft') next = (index + 4) % 5;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 4;
    if (next !== undefined) { event.preventDefault(); selectSkill(next); tabButtons[next].focus(); }
  });
});
function updateCarouselButton() {
  const b = $('#carousel-pause');
  b.innerHTML = `<span class="control-icon">${icon(carouselPaused ? 'play-clean' : 'pause-clean')}</span><span>${carouselPaused ? 'Reanudar carrusel' : 'Pausar carrusel'}</span>`;
  b.setAttribute('aria-pressed', String(carouselPaused));
  b.setAttribute('aria-label', window.Locale.t(carouselPaused ? 'Reanudar carrusel' : 'Pausar carrusel'));
  window.Locale.apply(b);
}
$('#carousel-pause').addEventListener('click', () => { carouselPaused = !carouselPaused; updateCarouselButton(); });
$('.skills').addEventListener('mouseenter', () => carouselHovered = true);
$('.skills').addEventListener('mouseleave', () => carouselHovered = false);
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { carouselVisible = entries[0].isIntersecting; }, {threshold:0.15}).observe($('.skills'));
selectSkill(0, false); updateCarouselButton();

const protocol = [
  { title:'La confianza va primero.', text:'Se explica qué se revisará y se solicita permiso. Los archivos personales quedan fuera del alcance.', tag:'Consentimiento informado', icon:'shield' },
  { title:'Un protocolo, no suposiciones.', text:'Se revisa únicamente lo acordado y se contrasta el contexto con las reglas del servidor.', tag:'Revisión con límites claros', icon:'eye' },
  { title:'La evidencia habla.', text:'Los hallazgos relevantes se documentan con contexto. La información se comparte solo con el equipo autorizado.', tag:'Hallazgos documentados', icon:'file' },
  { title:'Una decisión que se explica.', text:'Se comunica el resultado y su motivo. Una sospecha sin pruebas suficientes no se trata como una infracción confirmada.', tag:'Veredicto justificado', icon:'check' }
];
let protocolTime = 0, protocolPlaying = false, protocolStep = -1;
const protocolSeek = $('#protocol-seek');
const protocolProgress = $('#protocol-progress-bar');
const protocolClock = $('#protocol-time');
let protocolSecond = -1;
function renderProtocol() {
  const step = Math.min(3, Math.floor(protocolTime / 6));
  if (step !== protocolStep) {
    protocolStep = step; const data = protocol[step];
    $('#protocol-counter').textContent = `PASO 0${step+1} / 04`;
    $('#protocol-title').textContent = data.title; $('#protocol-copy').textContent = data.text; $('#protocol-tag').textContent = data.tag;
    $('#protocol-icon use').setAttribute('href', `#i-${data.icon}`);
    $$('.protocol-step').forEach((button,i) => {button.classList.toggle('active',i===step); button.setAttribute('aria-pressed',String(i===step));});
    window.Locale.apply($('.protocol-stage'));
  }
  const second = Math.floor(protocolTime);
  if (second !== protocolSecond) {
    protocolSecond = second;
    protocolClock.textContent = `00:${String(second).padStart(2,'0')}`;
  }
  protocolSeek.value = String(protocolTime);
  protocolProgress.style.transform = `scaleX(${protocolTime / 24})`;
}
function setProtocolPlaying(playing) {
  protocolPlaying = playing;
  $('.protocol-player').classList.toggle('playing', playing);
  $('#protocol-play').setAttribute('aria-label', playing ? 'Pausar simulación' : 'Reproducir simulación');
  $('#protocol-play').innerHTML = icon(playing ? 'pause-clean' : 'play-clean');
  window.Locale.apply($('#protocol-play'));
}
$('#protocol-play').addEventListener('click', () => { if (protocolTime >= 24) protocolTime = 0; setProtocolPlaying(!protocolPlaying); renderProtocol(); });
$('#protocol-seek').addEventListener('input', event => { protocolTime = Number(event.target.value); renderProtocol(); if (protocolTime >= 24) setProtocolPlaying(false); });
$$('.protocol-step').forEach((button,i) => button.addEventListener('click', () => { protocolTime = i * 6; renderProtocol(); }));
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting) setProtocolPlaying(false); }, {threshold:0}).observe($('.protocol-player'));
renderProtocol();

const skillsSection = $('.skills');
let lastTick = null, playbackFrame = 0;
function tickPlayback(now) {
  playbackFrame = 0;
  if (document.hidden) { lastTick = null; return; }
  const delta = lastTick === null ? 0 : Math.min((now-lastTick)/1000, .1);
  lastTick = now;
  if (!document.documentElement.classList.contains('intro-pending') && !carouselPaused && carouselVisible && !carouselHovered && !skillsSection.contains(document.activeElement) && !document.body.classList.contains('dialog-open')) {
    carouselElapsed += delta;
    carouselProgress.style.transform = `scaleX(${Math.min(carouselElapsed / 5, 1)})`;
    if (carouselElapsed >= 5) selectSkill(activeSkill + 1);
  }
  if (protocolPlaying) { protocolTime = Math.min(24, protocolTime + delta); renderProtocol(); if (protocolTime >= 24) setProtocolPlaying(false); }
  window.FxczasaUI?.dashboardTick?.(delta);
  playbackFrame = requestAnimationFrame(tickPlayback);
}
document.addEventListener('visibilitychange', () => {
  lastTick = null;
  if (document.hidden) { cancelAnimationFrame(playbackFrame); playbackFrame = 0; }
  else if (!playbackFrame) playbackFrame = requestAnimationFrame(tickPlayback);
});
playbackFrame = requestAnimationFrame(tickPlayback);
reduceMotion.addEventListener('change', event => { clearTimeout(typeTimer); if (event.matches) { $('#typewriter').textContent=words[0]; carouselPaused=true; updateCarouselButton(); } else {wordIndex=0;letter=words[0].length;deleting=true;carouselPaused=false;updateCarouselButton();typeTimer=setTimeout(typeNext,2300);} });

const worlds = {
  BoxPvP:{alt:'Arena de bloques iluminada en morado',title:'Tu BoxPvP.<br>Juego limpio.',description:'BoxPvP: combate, minería e intercambios; supervisión del progreso y del juego limpio.'},
  SkyBlock:{alt:'Islas de bloques suspendidas en un paisaje violeta',title:'Cada isla.<br>Las mismas reglas.',description:'SkyBlock: protección de islas, intercambios justos y atención a la economía del servidor.'},
  Prison:{alt:'Mina de bloques con cristales violetas',title:'Un progreso justo.<br>Para todos.',description:'Prison: seguimiento del progreso, la economía y los reportes según las reglas del proyecto.'}
};
$$('[data-world]').forEach(button=>button.addEventListener('click',()=>{
  const mode=button.dataset.world; $('.world-visual').dataset.mode=mode;
  const image = $('#world-image');
  image.src = `assets/scene-${mode === 'SkyBlock' ? 'worlds' : mode === 'Prison' ? 'prison' : 'arena'}.svg`;
  image.alt = window.Locale.t(worlds[mode].alt);
  $('#world-title').innerHTML=worlds[mode].title; $('#mode-description').textContent=worlds[mode].description;
  window.Locale.apply($('.adaptation'));
  $$('[data-world]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}));

let lastDialogTrigger;
function openDialog(selector, trigger) {
  closeMenu(); setProtocolPlaying(false); lastDialogTrigger = trigger;
  const dialog = $(selector);
  dialog.classList.remove('is-closing'); dialog.showModal(); dialog.scrollTop = 0;
  document.body.classList.add('dialog-open'); window.FxczasaUI?.scroller?.stop();
}
async function closeDialog(dialog) {
  if (dialog.classList.contains('is-closing')) return;
  if (!reduceMotion.matches) {
    dialog.classList.add('is-closing');
    await Promise.allSettled(dialog.getAnimations().map(animation => animation.finished));
  }
  dialog.close(); dialog.classList.remove('is-closing');
}
$$('dialog').forEach(dialog => {
  const heading = $('h2', dialog); heading.id = `${dialog.id}-title`; dialog.setAttribute('aria-labelledby', heading.id);
  $('.close-dialog',dialog).addEventListener('click',()=>closeDialog(dialog));
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');window.FxczasaUI?.scroller?.start();lastDialogTrigger?.focus({preventScroll:true});});
});

$$('.dialog details').forEach(details => {
  const summary = $('summary', details);
  let animation = null, expanded = details.open;
  summary.addEventListener('click', event => {
    if (reduceMotion.matches) return;
    event.preventDefault();
    const start = details.getBoundingClientRect().height;
    expanded = animation ? !expanded : !details.open;
    if (animation) { animation.onfinish = null; animation.cancel(); }
    details.style.height = ''; details.style.overflow = 'hidden';
    details.open = expanded;
    const end = details.getBoundingClientRect().height;
    details.open = true;
    details.classList.toggle('is-collapsing', !expanded);
    animation = details.animate([{height:`${start}px`},{height:`${end}px`}], {duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
    animation.onfinish = () => {
      details.open = expanded; details.style.overflow = ''; details.classList.remove('is-collapsing'); animation = null;
    };
  });
});
$$('.contact-trigger').forEach(button=>button.addEventListener('click',()=>{
  if (SITE.discordUserId && /^\d{15,22}$/.test(SITE.discordUserId)) { window.open(`https://discord.com/users/${SITE.discordUserId}`,'_blank','noopener,noreferrer'); return; }
  openDialog('#contact-dialog',button);
}));
$$('.proposal-trigger').forEach(button=>button.addEventListener('click',()=>openDialog('#contact-dialog',button)));
$('#case-open').addEventListener('click',event=>openDialog('#case-dialog',event.currentTarget));
$('#faq-open').addEventListener('click',event=>openDialog('#faq-dialog',event.currentTarget));
let toastTimer;
function toast(message) { $('#toast').textContent=window.Locale.t(message);$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4500); }
$('#more-cases').addEventListener('click',()=>toast('Por ahora hay un caso ilustrativo. Los casos reales se añadirán cuando estén disponibles.'));
$('#contact-form').addEventListener('submit',async event=>{
  event.preventDefault();const data=new FormData(event.currentTarget);
  const server=String(data.get('server')).trim(), message=String(data.get('message')).trim();
  if(!server||!message){$('#copy-status').textContent=window.Locale.t('Completa el nombre del servidor y tu propuesta.');return;}
  const proposal=window.Locale.language==='en' ? `Hi, ${SITE.name}. I would like to discuss a staff or SS Manager role on my server.\n\nServer: ${server}\nGame mode: ${data.get('mode')}\n\n${message}` : `Hola, ${SITE.name}. Me gustaría hablar sobre una oportunidad en mi servidor.\n\nServidor: ${server}\nModalidad: ${data.get('mode')}\n\n${message}`;
  try { if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable'); await navigator.clipboard.writeText(proposal); $('#copy-status').textContent=window.Locale.t('Propuesta copiada. No se ha enviado ningún mensaje.');$('#copy-fallback').hidden=true; }
  catch { $('#proposal-text').value=proposal;$('#copy-fallback').hidden=false;$('#proposal-text').focus();$('#proposal-text').select();$('#copy-status').textContent=window.Locale.t('Puedes copiar tu propuesta desde el recuadro. No se ha enviado ningún mensaje.'); }
});

document.addEventListener('Fxczasa:language', () => {
  clearTimeout(typeTimer);
  words=window.Locale.language==='en' ? ['server','community','team','project'] : ['servidor','comunidad','equipo','proyecto'];
  wordIndex=0;letter=words[0].length;deleting=true;
  $('#typewriter').textContent=words[0];
  if(!reduceMotion.matches)typeTimer=setTimeout(typeNext,2300);
  selectSkill(activeSkill,false);protocolStep=-1;renderProtocol();updateCarouselButton();
  const mode=$('.world-visual').dataset.mode||'BoxPvP';
  const image = $('#world-image');
  image.src = `assets/scene-${mode === 'SkyBlock' ? 'worlds' : mode === 'Prison' ? 'prison' : 'arena'}.svg`;
  image.alt = window.Locale.t(worlds[mode].alt);
  $('#world-title').innerHTML=worlds[mode].title;$('#mode-description').textContent=worlds[mode].description;
  window.Locale.apply(document.body);
});
