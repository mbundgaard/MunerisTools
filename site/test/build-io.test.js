import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listImages } from '../build.js';
// listImages returns web paths for a tool's images dir; missing dir → [].
test('missing images dir yields empty list', () => {
  assert.deepEqual(listImages('does-not-exist'), []);
});
