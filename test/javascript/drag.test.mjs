import test from 'node:test';
import assert from 'node:assert/strict';
import { bindEditorDrag } from '../../app/javascript/analysis/drag.js';

function setup() {
  const handlers = {}, drops = [];
  let target, editing = true, ghosts = 0;
  const node = dataset => ({ dataset, classList: { add() {}, remove() {} },
    closest() { return this; }, setPointerCapture() {},
    querySelector() { return { cloneNode: () => ({ style: {}, setAttribute() {}, remove() { ghosts--; } }) }; }
  });
  const root = { addEventListener(name, fn) { handlers[name] = fn; }, querySelectorAll: () => [], contains: value => value !== outside };
  const outside = node({ square: 'h8' });
  globalThis.document = { body: { append() { ghosts++; } }, elementFromPoint: () => target };
  bindEditorDrag(root, { enabled: () => editing, pieceAt: square => square === 'e2' ? 'P' : null, drop: (...args) => drops.push(args) });
  const send = (name, values = {}) => handlers[name]({ isPrimary: true, pointerId: 1, button: 0, clientX: 0, clientY: 0, preventDefault() {}, ...values });
  const drag = (source, destination) => {
    send('pointerdown', { target: node(source) });
    target = destination === 'outside' ? outside : node(destination);
    send('pointermove', { clientX: 30 });
    send('pointerup', { clientX: 30 });
  };
  return { send, drag, drops, node, ghosts: () => ghosts, disable: () => { editing = false; } };
}
test('palette adds and board moves/deletes with the same pointer path', () => {
  const t = setup();
  t.drag({ piece: 'q' }, { square: 'e4' });
  t.drag({ square: 'e2' }, { square: 'e4' });
  t.drag({ square: 'e2' }, { trash: '' });
  assert.deepEqual(t.drops, [[null, 'e4', 'q'], ['e2', 'e4', 'P'], ['e2', null, 'P']]);
  assert.equal(t.ghosts(), 0);
});
test('outside drops, palette trash, empty sources and normal mode never edit', () => {
  const t = setup();
  t.drag({ piece: 'K' }, 'outside');
  t.drag({ piece: 'K' }, { trash: '' });
  t.drag({ square: 'e3' }, { square: 'e4' });
  t.disable(); t.drag({ square: 'e2' }, { square: 'e4' });
  assert.deepEqual(t.drops, []);
});
test('tap remains a click; drag consumes its click; cancelled touch cleans up', () => {
  const t = setup();
  let suppressed = 0;
  const click = () => t.send('click', { stopImmediatePropagation() { suppressed++; } });
  t.send('pointerdown', { target: t.node({ piece: 'N' }) });
  t.send('pointerup'); click();
  assert.equal(suppressed, 0);
  t.drag({ piece: 'N' }, { square: 'e4' }); click(); click();
  assert.equal(suppressed, 1);
  t.send('pointerdown', { target: t.node({ piece: 'N' }) });
  t.send('pointermove', { clientX: 30 });
  assert.equal(t.ghosts(), 1);
  t.send('pointercancel'); t.send('pointerup');
  assert.equal(t.ghosts(), 0);
  assert.equal(t.drops.length, 1);
});
test('omitted post-drag click does not swallow the next control activation', async () => {
  const t = setup();
  t.drag({ square: 'e2' }, { trash: '' });
  await new Promise(resolve => setTimeout(resolve, 1));
  let suppressed = false;
  t.send('click', { stopImmediatePropagation() { suppressed = true; } });
  assert.equal(suppressed, false);
});
