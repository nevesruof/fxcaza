const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../web/intro-boot.js'), 'utf8');

function boot({hash = '', reduced = false} = {}) {
  const classes = new Set(), events = [], timers = [];
  const context = {
    location: {hash}, window: {SiteMotion:{matches:reduced}}, Event,
    document: {documentElement:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}},dispatchEvent:event=>events.push(event.type)},
    setTimeout(callback, delay) { timers.push({callback,delay}); return timers.length; }
  };
  vm.runInNewContext(source, context);
  return {classes,events,timers};
}

test('direct section links and reduced-motion readers never wait behind the splash', () => {
  for (const options of [{hash:'#contacto'}, {reduced:true}]) {
    const page = boot(options);
    assert(!page.classes.has('intro-pending'));
    assert.equal(page.timers.length, 0);
  }
});

test('the page becomes usable even when the main introduction script never loads', () => {
  const page = boot();
  assert(page.classes.has('intro-pending'));
  assert(page.timers[0].delay <= 4000);
  page.timers[0].callback();
  assert(!page.classes.has('intro-pending'));
  assert.deepEqual(page.events,['Fxczasa:intro-ready']);
});
