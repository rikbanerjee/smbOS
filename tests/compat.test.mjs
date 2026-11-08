// Older phones (iOS Safari before 15.4) and plain-http pages lack structuredClone, crypto.randomUUID,
// Array.prototype.at, and navigator.clipboard. The app must reach them only through compat.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';

const root = new URL('../', import.meta.url);
const sources = readdirSync(root).filter(f => f.endsWith('.js') && f !== 'compat.js');

test('app code uses the compat helpers instead of APIs older iPhones lack', () => {
  const banned = [[/structuredClone\(/, 'structuredClone'], [/crypto\.randomUUID\(/, 'crypto.randomUUID'], [/\.at\(-?\d+\)/, '.at()'], [/navigator\.clipboard/, 'navigator.clipboard']];
  const found = [];
  for (const file of sources) {
    const text = readFileSync(new URL(file, root), 'utf8');
    for (const [pattern, name] of banned) if (pattern.test(text)) found.push(`${file}: ${name}`);
  }
  assert.deepEqual(found, []);
});

test('compat helpers work when the newer APIs are missing', async () => {
  const savedClone = globalThis.structuredClone, savedCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    delete globalThis.structuredClone;
    Object.defineProperty(globalThis, 'crypto', { value: { getRandomValues: a => { a.fill(171); return a; } }, configurable: true });
    const {clone, uuid, last} = await import('../compat.js?old-browser');
    const source = { a: [1, { b: 'x' }] }, copy = clone(source);
    assert.deepEqual(copy, source); assert.notEqual(copy.a, source.a);
    assert.match(uuid(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(last([1, 2, 3]), 3);
  } finally {
    globalThis.structuredClone = savedClone;
    if (savedCrypto) Object.defineProperty(globalThis, 'crypto', savedCrypto);
  }
});

test('a ZIP sets the travel zone, city, and state', async () => {
  const {placeForZip} = await import('../model.js?v=v2-1');
  assert.deepEqual(placeForZip('02914'), { zip: '02914', area: 'east', city: 'East Providence', state: 'RI', served: true });
  assert.equal(placeForZip('02915').area, 'riverside');
  assert.equal(placeForZip('02139').served, false);
  assert.equal(placeForZip('021'), null);
});
