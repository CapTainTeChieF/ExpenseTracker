import fs from 'node:fs';
import path from 'node:path';
// Intended for local setup: node scripts/configure-vercel.mjs https://YOUR-API.onrender.com
const input=process.argv[2];
if (!input) throw new Error('Usage: node scripts/configure-vercel.mjs https://YOUR-HTTPS-API-HOST');
const target = new URL(input);
if (target.protocol !== 'https:' || target.username || target.password || target.pathname!=='/' ||
    target.search || target.hash || /example\.(com|org)$/i.test(target.hostname)) {
  throw new Error('Supply real HTTPS API origin only, e.g. https://my-api.onrender.com');
}
const config={
  '$schema':'https://openapi.vercel.sh/vercel.json',
  rewrites:[
    {source:'/api/v1/:path*',destination:`${target.origin}/api/v1/:path*`},
    {source:'/(.*)',destination:'/index.html'},
  ],
};
const file=path.resolve('vercel.json');
fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');
console.log('Wrote',file, 'for same-origin API proxy to',target.origin);
