import test from 'node:test';
import assert from 'node:assert/strict';
import { percentile, summarize, assertQaDatabaseUrl } from './metrics.mjs';
test('p50 and p95 are based on sorted nearest-rank samples', () => {
  assert.equal(percentile([20, 5, 100, 10, 15], 50), 15);
  assert.equal(percentile([20, 5, 100, 10, 15], 95), 100);
  assert.deepEqual(summarize([10, 20, 30]), { samples:3, p50ms:20, p95ms:30, maxMs:30 });
});
test('QA database guard rejects other databases and hosts', () => {
  assert.doesNotThrow(() => assertQaDatabaseUrl('postgresql://expense_qa:x@localhost:5434/expense_tracker_qa'));
  for (const bad of [
    'postgresql://expense_qa:x@localhost:5433/expense_tracker_qa',
    'postgresql://expense_qa:x@production.example:5434/expense_tracker_qa',
    'postgresql://expense_user:x@localhost:5434/expense_tracker',
  ]) assert.throws(() => assertQaDatabaseUrl(bad), /Safety guard/);
});
