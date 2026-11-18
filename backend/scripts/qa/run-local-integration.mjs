import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { randomBytes } from 'node:crypto';
import { assertQaDatabaseUrl } from './metrics.mjs';
import { runApiScenarios } from './api-scenarios.mjs';

const dirname=path.dirname(fileURLToPath(import.meta.url));
const backendRoot=path.resolve(dirname,'../..');
const root=path.resolve(backendRoot,'..');
const dbUrl='postgresql://expense_qa:qa_only_local_password_change_me@127.0.0.1:5434/expense_tracker_qa';
const env={...process.env,
  DATABASE_URL:dbUrl, PORT:'4100',
  NODE_ENV:'test', ENABLE_API_DOCS:'false',
  FRONTEND_ORIGIN:'http://localhost:5173',
  JWT_SECRET:randomBytes(48).toString('base64'),
};
assertQaDatabaseUrl(env.DATABASE_URL);
const reportFolder=path.join(root,'docs','qa-evidence');
await fs.mkdir(reportFolder,{recursive:true});
const logs=[];
const completedCases=[];
let child;
function subprocess(command,args,where=backendRoot) {
  return new Promise((resolve,reject)=>{
    const p=spawn(command,args,{cwd:where,env,stdio:'inherit',shell:process.platform==='win32'});
    p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(new Error(`${command} ${args.join(' ')} exited ${code}`)));
  });
}
try {
  console.log('QA safety check: database is LOCAL :5434 / expense_tracker_qa, API uses :4100');
  console.log('This runner does not delete or reset any database and creates synthetic test users only.');
  // Runtime guard: inspect the database identity, not just the URL.
  const pg=(await import('pg')).default;
  const client=new pg.Client({connectionString:dbUrl,connectionTimeoutMillis:3500});
  await client.connect();
  try {
    const check=await client.query('SELECT current_database() AS db, current_user AS username');
    if(check.rows[0].db!=='expense_tracker_qa'||check.rows[0].username!=='expense_qa') throw new Error('Database identity mismatch');
  } finally {await client.end();}
  await subprocess(process.execPath,['scripts/migrate.cjs']);
  await fs.access(path.join(backendRoot,'dist','main.js'));
  // Refuse to reuse an unrelated service already listening on the QA API port.
  try {
    await fetch('http://127.0.0.1:4100/api/v1/health',{signal:AbortSignal.timeout(750)});
    throw new Error('Port 4100 is occupied; stop the existing QA/API server before qa:integration');
  } catch(e) {
    if (String(e?.message||'').includes('Port 4100 is occupied')) throw e;
  }
  child=spawn(process.execPath,['dist/main.js'],{cwd:backendRoot,env,stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',d=>logs.push(String(d)));
  child.stderr.on('data',d=>logs.push(String(d)));
  const base='http://127.0.0.1:4100/api/v1';
  let ready=false;
  for(let i=0;i<60;i++) {
    if(child.exitCode!==null) throw new Error('QA API exited early: '+logs.join(''));
    try {const r=await fetch(base+'/health',{signal:AbortSignal.timeout(500)}); if(r.ok) {ready=true;break;}} catch{}
    await delay(250);
  }
  if(!ready) throw new Error('QA API not healthy at :4100 after 15 seconds: '+logs.join(''));
  const output=await runApiScenarios(base,item=>{ completedCases.push(item); console.log(`${item.status}: ${item.id} ${item.title}`); });
  const reportFile=path.join(reportFolder,'qa_api_result.json');
  await fs.writeFile(reportFile,JSON.stringify(output,null,2)+'\n','utf8');
  console.log('Saved evidence:',reportFile);
  console.log('Latency measured (small local sample):',JSON.stringify(output.apiLatency));
} catch(error) {
  const failure={result:'NOT_PASSED',time:new Date().toISOString(),reason:String(error?.stack||error),
    note:'A failed or incomplete runtime test never implies that production requirements have passed.',completedCases};
  await fs.writeFile(path.join(reportFolder,'qa_failure.json'),JSON.stringify(failure,null,2)+'\n');
  console.error('QA runner failed:',error?.message||error);
  process.exitCode=1;
} finally {
  if(child && child.exitCode===null) {
    child.kill();
    await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1500)]);
    if(child.exitCode===null) child.kill('SIGKILL');
  }
}
