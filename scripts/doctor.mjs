/** Zero-dependency packaging/config doctor. Not a runtime test. */
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const production = process.argv.includes('--production');
let failures = 0;
const line = (status, message) => console.log(`${status}: ${message}`);
const required = ['backend/package.json','frontend/package.json','backend/migrations/001_init.sql',
  'backend/migrations/002_case_insensitive_categories.sql','backend/migrations/003_sessions_and_auth_limits.sql',
  'backend/.env.example','frontend/.env.example','docker-compose.yml','docker-compose.qa.yml',
  'docker-compose.full.local.yml','frontend/nginx.conf','frontend/vercel.json'];
for (const file of required) {
  const ok = fs.existsSync(path.join(root,file));
  line(ok?'PASS':'FAIL',file); if (!ok) failures++;
}
const major = Number(process.versions.node.split('.')[0]);
if(major < 24) line('WARN',`Node.js ${process.version}; use Node 24+ for this project's documented builds.`);
else line('PASS',`Node.js ${process.version}`);
for (const pkg of ['backend','frontend']) {
  const lock=path.join(root,pkg,'package-lock.json');
  line(fs.existsSync(lock)?'PASS':'WARN',`${pkg}/package-lock.json ${fs.existsSync(lock)?'present':'not supplied — run npm install, commit lockfile, then use npm ci'}`);
}
if (production) {
  let obj; try { obj=JSON.parse(fs.readFileSync(path.join(root,'frontend/vercel.json'),'utf8')); }
  catch { line('FAIL','frontend/vercel.json unreadable'); failures++; }
  const entry = obj?.rewrites?.find(x=>x.source==='/api/v1/:path*');
  if (!entry || !/^https:\/\//.test(entry.destination) || /REPLACE|YOUR|example\./i.test(entry.destination)) {
    line('FAIL','No configured production HTTPS API proxy; run npm run configure:vercel -- https://REAL-API-HOST in frontend/'); failures++;
  } else line('PASS','Production API proxy entry present; live connectivity still needs testing');
}
console.log(failures ? `FAILED: ${failures} checks` : 'Static checks completed. This does NOT prove compilation, QA or security sign-off.');
process.exitCode = failures ? 1 : 0;
