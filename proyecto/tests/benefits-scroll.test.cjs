const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const model = {module:{exports:{}},Array,Math};
vm.runInNewContext(fs.readFileSync(require.resolve('../web/benefits-scroll.js'),'utf8'), model);
const Timeline = model.module.exports;

function mobileScene({viewport = 600, normal = 680, compact = 420, reduced = false} = {}) {
  const events = new Map(), queue = [];
  function classes() {
    const set = new Set();
    return {contains: x => set.has(x), add: (...xs) => xs.forEach(x => set.add(x)), remove: (...xs) => xs.forEach(x => set.delete(x)), toggle(x, on) {on ? set.add(x) : set.delete(x);}};
  }
  function element() {
    return {classList: classes(), style: {setProperty(k,v){this[k]=v;},removeProperty(k){delete this[k];}},children:[],attributes:{},setAttribute(k,v){this.attributes[k]=v;},append(x){this.children.push(x);},offsetHeight:viewport};
  }
  const section=element(),content=element(),pin=element(),nav=element();
  const progress=element(),fill=element();progress.querySelector=()=>fill;
  const cards=Array.from({length:4},() => {
    const card=element();card.querySelector=()=>({cloneNode:()=>element()});return card;
  });
  Object.defineProperty(content,'offsetHeight',{get:()=>section.classList.contains('benefits-compact') ? compact : normal});
  const sandbox={console,innerHeight:viewport,scrollY:0,requestAnimationFrame(fn){queue.push(fn);return queue.length;},SiteMotion:{matches:reduced,addEventListener(){}},ResizeObserver:class {observe(){}},addEventListener(name,fn){events.set(name,fn);},scrollTo({top}){sandbox.scrollY=top;}};
  section.getBoundingClientRect=()=>({top:2000-sandbox.scrollY,height:normal});
  nav.getBoundingClientRect=()=>({height:74});
  cards.forEach((card,i)=>card.getBoundingClientRect=()=>({top:2200+i*160-sandbox.scrollY}));
  section.querySelector=s=>s==='.benefits-progress'?progress:pin;section.querySelectorAll=()=>cards;pin.querySelector=()=>content;
  sandbox.document={querySelector:s=>s==='#beneficios'?section:nav,createElement:element,body:{append(){}},addEventListener(){}};
  sandbox.window=sandbox;
  vm.runInNewContext(fs.readFileSync(require.resolve('../web/benefits-scroll.js'),'utf8'),sandbox);
  return {section,cards,content,progress,fill,scroll(distance){sandbox.scrollY=2000-74+distance;events.get('scroll')();while(queue.length)queue.shift()();}};
}

test('a mobile viewport too short for all paragraphs retains the pinned four-item animation',()=>{
  const scene=mobileScene();
  assert(scene.section.classList.contains('benefits-scroll'));
  assert(scene.section.classList.contains('benefits-compact'));
  assert.deepEqual(scene.cards.map(c=>Number(c.style['--benefit-reveal'])),[0,0,0,0]);
  const step=Timeline.layout(600,74,420).step;
  for(let n=1;n<=4;n++) {
    scene.scroll((n-.2)*step);
    assert.deepEqual(scene.cards.map(c=>Number(c.style['--benefit-reveal'])),Array.from({length:4},(_,i)=>Number(i<n)));
  }
  scene.scroll(.8*step);
  assert.deepEqual(scene.cards.map(c=>Number(c.style['--benefit-reveal'])),[1,0,0,0]);
});
test('extreme zoom keeps native reveals; reduced motion presents readable static content',()=>{
  const scene=mobileScene({viewport:300});
  assert(scene.section.classList.contains('benefits-natural-reveal'));
  assert(!scene.section.classList.contains('benefits-scroll'));
  const staticScene=mobileScene({reduced:true});
  assert(!staticScene.section.classList.contains('benefits-scroll'));
  assert.deepEqual(staticScene.cards.map(c=>Number(c.style['--benefit-reveal'])),[1,1,1,1]);
});
test('caption crossfades stay within one visible paragraph and release follows the fourth reveal',()=>{
  const layout=Timeline.layout(600,74,420);
  for(let distance=0;distance<=layout.distance;distance+=5) {
    const values=Timeline.frame(distance,layout.step);
    const captions=Timeline.captions(values);
    assert(captions.reduce((a,b)=>a+b,0)<=1.000001);
    assert(captions.every(x=>x>=0&&x<=1));
  }
  assert.deepEqual(Timeline.frame(layout.distance,layout.step),[1,1,1,1]);
});

test('the section progress is scoped to the sequence, continuous and reversible',()=>{
  const scene=mobileScene();
  const distance=Timeline.layout(600,74,420).distance;
  assert(!scene.progress.classList.contains('is-active'));
  scene.scroll(0);
  assert(scene.progress.classList.contains('is-active'));
  scene.scroll(distance*.415);
  assert(Math.abs(Number(scene.fill.style.transform.slice(7,-1))-.415)<1e-10);
  assert.equal(scene.progress.attributes['aria-valuenow'],'42');
  scene.scroll(distance+1);
  assert(!scene.progress.classList.contains('is-active'));
  assert.equal(scene.progress.attributes['aria-hidden'],'true');
  scene.scroll(distance*.25);
  assert(scene.progress.classList.contains('is-active'));
  assert.equal(scene.fill.style.transform,'scaleX(0.25)');
  scene.scroll(-1);
  assert(!scene.progress.classList.contains('is-active'));
  assert(!mobileScene({reduced:true}).progress.classList.contains('is-active'));
});

 test('a desktop viewport plays all four reveals before releasing the section',()=>{
   const scene=mobileScene({viewport:1000,normal:670});
   assert(scene.section.classList.contains('benefits-scroll'));
   assert(!scene.section.classList.contains('benefits-compact'));
   const layout=Timeline.layout(1000,74,670);
   scene.scroll(layout.step*.8);
   assert.deepEqual(scene.cards.map(c=>Number(c.style['--benefit-reveal'])),[1,0,0,0]);
   scene.scroll(layout.distance);
   assert.deepEqual(scene.cards.map(c=>Number(c.style['--benefit-reveal'])),[1,1,1,1]);
   assert(!scene.progress.classList.contains('is-active'));
 });
