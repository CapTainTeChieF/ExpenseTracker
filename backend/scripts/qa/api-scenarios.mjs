import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { summarize } from './metrics.mjs';

/** Live HTTP contract/security scenarios. Run ONLY against isolated localhost QA server. */
export async function runApiScenarios(baseUrl, onResult = () => {}) {
  const target = new URL(baseUrl);
  if (!['127.0.0.1', 'localhost'].includes(target.hostname) || target.port !== '4100') {
    throw new Error('API safety guard: only localhost port 4100 is accepted');
  }
  const prefix = target.toString().replace(/\/$/, '');
  const results = [];
  const report = async (id, title, fn) => {
    const started = performance.now();
    try {
      const details = await fn();
      const item = { id, title, status:'PASS', durationMs:+(performance.now()-started).toFixed(1), ...(details || {}) };
      results.push(item); onResult(item);
    } catch (e) {
      const item = { id, title, status:'FAIL', durationMs:+(performance.now()-started).toFixed(1), error: String(e?.message || e) };
      results.push(item); onResult(item);
      // Stop at first failure to avoid misleading dependent results.
      throw new Error(`${id} ${title}: ${item.error}`);
    }
  };
  const state = { a:'', b:'', aId:'', bId:'', catId:'', bCatId:'', usedId:'', firstTxId:'', secondTxId:'', metrics:null };
  async function http(method, route, body, cookie = '', extraHeaders = {}) {
    const response = await fetch(`${prefix}${route}`, {
      method, redirect:'manual',
      headers:{...(body === undefined ? {} : {'content-type':'application/json'}), ...(cookie ? {cookie} : {}), ...extraHeaders},
      ...(body === undefined ? {} : {body:JSON.stringify(body)}),
      signal:AbortSignal.timeout(12000),
    });
    const content = await response.text();
    let json;
    try { json = content ? JSON.parse(content) : null; } catch { json = content; }
    return {status:response.status, json, cookie:response.headers.get('set-cookie')?.split(';')[0] || ''};
  }
  const expect = (r, code) => assert.equal(r.status, code, `Expected HTTP ${code}; received ${r.status}: ${JSON.stringify(r.json)}`);
  const sid = randomUUID().slice(0, 13);
  const emailA = `step4-a-${sid}@example.test`;
  const emailB = `step4-b-${sid}@example.test`;
  const password = `qa-Test-Pass-1234-${sid}`;
  const tran = (kind, amount, categoryId) => ({kind, amount, transactionDate:'2026-11-09', description:`QA ${kind}`, ...(categoryId ? {categoryId} : {})});

  await report('QA-001','Public health endpoint', async () => {
    const r = await http('GET','/health');expect(r,200);assert.equal(r.json.database,'connected');
  });
  await report('QA-002','Reject unauthenticated financial resources', async () => {
    for(const route of ['/transactions','/categories','/analytics/summary','/analytics/monthly?month=2026-11','/analytics/trend?months=3&endMonth=2026-11']) expect(await http('GET',route),401);
  });
  await report('QA-003','Register two independent users and receive HttpOnly cookies', async () => {
    const a=await http('POST','/auth/register',{name:'QA User A',email:emailA,password});expect(a,201);
    assert.ok(a.cookie.startsWith('expense_session='));state.a=a.cookie;state.aId=a.json.user.id;
    const b=await http('POST','/auth/register',{name:'QA User B',email:emailB,password});expect(b,201);
    assert.ok(b.cookie.startsWith('expense_session='));state.b=b.cookie;state.bId=b.json.user.id;
    assert.notEqual(state.aId,state.bId);
  });
  await report('QA-004','Reject duplicate registration and invalid credentials', async () => {
    expect(await http('POST','/auth/register',{name:'Clone',email:emailA.toUpperCase(),password}),409);
    expect(await http('POST','/auth/login',{email:emailA,password:'wrong password'}),401);
    const ok=await http('GET','/auth/me',undefined,state.a);expect(ok,200);assert.equal(ok.json.email,emailA);
  });
  await report('QA-005','Create, rename, and isolate categories', async () => {
    const a=await http('POST','/categories',{name:`QA Books ${sid}`,kind:'EXPENSE'},state.a);expect(a,201);state.catId=a.json.id;
    const b=await http('POST','/categories',{name:`QA Private ${sid}`,kind:'EXPENSE'},state.b);expect(b,201);state.bCatId=b.json.id;
    const renamed=await http('PATCH',`/categories/${state.catId}`,{name:`QA Stationery ${sid}`},state.a);expect(renamed,200);
    const items=await http('GET','/categories',undefined,state.b);expect(items,200);
    assert.ok(!items.json.some(x=>x.id===state.catId));
    expect(await http('PATCH',`/categories/${state.catId}`,{name:'Hijack'},state.b),404);
  });
  await report('QA-006','Reject invalid payloads, unknown properties and foreign categories', async () => {
    expect(await http('POST','/transactions',tran('EXPENSE','0.00'),state.a),400);
    expect(await http('POST','/transactions',{...tran('EXPENSE','12.00'),admin:true},state.a),400);
    expect(await http('POST','/transactions',tran('EXPENSE','12.00',state.bCatId),state.a),400);
    expect(await http('GET','/analytics/trend?months=13&endMonth=2026-11',undefined,state.a),400);
    expect(await http('GET','/analytics/monthly?month=2026-13',undefined,state.a),400);
  });
  await report('QA-007','Failed transaction rolls back and does not change summary', async () => {
    const before=await http('GET','/analytics/summary',undefined,state.a);expect(before,200);
    expect(await http('POST','/transactions',tran('EXPENSE','49.00',state.bCatId),state.a),400);
    const after=await http('GET','/analytics/summary',undefined,state.a);expect(after,200);
    assert.deepEqual(after.json,before.json);
    // This tests application rollback for validation failures; NOT kill/power-loss recovery.
  });
  await report('QA-008','Create user-owned income and expense transactions', async () => {
    const a=await http('POST','/transactions',tran('INCOME','1000.00'),state.a);expect(a,201);state.firstTxId=a.json.id;
    const b=await http('POST','/transactions',tran('EXPENSE','250.00',state.catId),state.a);expect(b,201);state.secondTxId=b.json.id;
    const other=await http('POST','/transactions',tran('EXPENSE','700.00',state.bCatId),state.b);expect(other,201);
  });
  await report('QA-009','Verify monthly totals, trend, and category grouping', async () => {
    const r=await http('GET','/analytics/monthly?month=2026-11',undefined,state.a);expect(r,200);
    assert.equal(Number(r.json.income),1000);assert.equal(Number(r.json.expense),250);assert.equal(Number(r.json.balance),750);
    assert.ok(r.json.categories.some(x=>x.kind==='EXPENSE'&&Number(x.total)===250));
    const t=await http('GET','/analytics/trend?months=3&endMonth=2026-11',undefined,state.a);expect(t,200);
    assert.equal(t.json.months.length,3);assert.equal(t.json.months[2].month,'2026-11');
    assert.equal(Number(t.json.months[2].income),1000);assert.equal(Number(t.json.months[2].expense),250);
    assert.equal(Number(t.json.months[0].income),0);
  });
  await report('QA-010','Prevent cross-user transaction update/delete/list leakage', async () => {
    expect(await http('PATCH',`/transactions/${state.secondTxId}`,{amount:'1.00'},state.b),404);
    expect(await http('DELETE',`/transactions/${state.secondTxId}`,undefined,state.b),404);
    const b=await http('GET','/transactions?month=2026-11',undefined,state.b);expect(b,200);
    assert.ok(!b.json.some(t=>t.id===state.secondTxId));
    const s=await http('GET','/analytics/monthly?month=2026-11',undefined,state.b);expect(s,200);
    assert.equal(Number(s.json.expense),700);
  });
  await report('QA-011','Category referenced by transaction cannot be deleted', async () => {
    expect(await http('DELETE',`/categories/${state.catId}`,undefined,state.a),409);
  });
  await report('QA-012','Rejected update preserves original amount; valid update changes summary', async () => {
    expect(await http('PATCH',`/transactions/${state.secondTxId}`,{amount:'0.00'},state.a),400);
    const before=await http('GET','/analytics/monthly?month=2026-11',undefined,state.a);expect(before,200);assert.equal(Number(before.json.expense),250);
    expect(await http('PATCH',`/transactions/${state.secondTxId}`,{amount:'300.00'},state.a),200);
    const after=await http('GET','/analytics/monthly?month=2026-11',undefined,state.a);expect(after,200);assert.equal(Number(after.json.balance),700);
  });
  await report('QA-013','Wrong Origin cannot perform browser-style mutation', async () => {
    expect(await http('POST','/auth/login',{email:emailA,password},'',{origin:'https://not-allowed.example'}),403);
  });
  await report('QA-014','DELETE reflects in totals and logout revokes browser cookie', async () => {
    expect(await http('DELETE',`/transactions/${state.secondTxId}`,undefined,state.a),200);
    const after=await http('GET','/analytics/monthly?month=2026-11',undefined,state.a);expect(after,200);
    assert.equal(Number(after.json.balance),1000);
    const out=await http('POST','/auth/logout',{},state.a);expect(out,200);
    assert.equal(out.cookie,'expense_session=','Logout should clear the browser cookie');
    expect(await http('GET','/auth/me',undefined,state.a),401);
    // Server rejects copied cookies after logout (no longer merely browser cookie deletion).
  });
  await report('QA-015','API write -> refreshed analytics latency (10 small local trials)', async () => {
    const latencies=[];
    for(let n=0;n<10;n++) {
      const start=performance.now();
      const created=await http('POST','/transactions',tran('EXPENSE','1.00'),state.b);expect(created,201);
      const summary=await http('GET','/analytics/summary',undefined,state.b);expect(summary,200);
      assert.equal(Number(summary.json.expense),700+n+1);
      latencies.push(performance.now()-start);
    }
    state.metrics=summarize(latencies);
    // Recording measured timings, not hard-coding a pass/fail gate based on an unrepresentative tiny dataset.
    return {measurement:state.metrics};
  });
  await report('QA-016','Repeated bad login attempts trigger account rate limiting', async () => {
    const fakeEmail=`step5-no-account-${sid}@example.test`;
    for (let n=0;n<10;n++) {
      expect(await http('POST','/auth/login',{email:fakeEmail,password}),401);
    }
    expect(await http('POST','/auth/login',{email:fakeEmail,password}),429);
  });
  const overall={ testRunId:sid, executedAt:new Date().toISOString(), result:'PASS', tests:results, apiLatency:state.metrics,
    limitations:['Tiny isolated QA dataset; not a browser paint test or representative load test',
      'Proxy/IP rate limiting and production Origin checks still require live staging verification',
      'No network interruption or process-kill fault-injection performed'] };
  return overall;
}
