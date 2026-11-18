// Requires a deployed HTTPS API and frontend; never creates or changes user financial data.
const [api,front]=process.argv.slice(2);
if(!api||!front) throw new Error('Usage: node scripts/ops/smoke-test.mjs https://api.example.com https://app.example.com');
for (const u of [api,front]) if(new URL(u).protocol!=='https:') throw new Error('HTTPS URL required');
async function check(url,predicate,expected) {
  const res=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(10000)});
  if(!predicate(res)) throw new Error(`FAIL ${url}: received ${res.status}; expected ${expected}`);
  console.log(`PASS ${url} -> HTTP ${res.status}`);
}
await check(new URL('/api/v1/health',api),r=>r.status===200,'200');
await check(new URL('/api/v1/transactions',api),r=>r.status===401,'401 unauthorized');
await check(new URL('/',front),r=>r.status===200,'200');
await check(new URL('/api/v1/health',front),r=>r.status===200,'200 via frontend proxy');
console.log('Non-destructive smoke checks passed; this is not UAT or security sign-off.');
