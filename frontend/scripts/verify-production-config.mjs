import fs from 'node:fs';
const cfg=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const proxy=(cfg.rewrites||[]).find(x=>x.source==='/api/v1/:path*');
if(!proxy || !/^https:\/\//.test(proxy.destination) || proxy.destination.includes('REPLACE')) {
  console.error('Cannot deploy: configure the same-origin API proxy first using npm run configure:vercel -- https://YOUR-BACKEND.onrender.com');
  process.exit(1);
}
console.log('Production routing configured:',proxy.destination);
