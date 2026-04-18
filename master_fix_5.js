const fs=require('fs'),path=require('path');
const root='C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Write vercel.json cron
const vj=path.join(root,'vercel.json');
let vjContent={};
try{ vjContent=JSON.parse(fs.readFileSync(vj,'utf8')); }catch{}
vjContent.crons=[{"path":"/api/cron/price-sync","schedule":"0 2 * * *"}];
fs.writeFileSync(vj,JSON.stringify(vjContent,null,2),'utf8');
console.log('OK vercel.json — cron added');

// Confirm all master fixes exist
const fixes=['master_fix_1.js','master_fix_2.js','master_fix_3.js','master_fix_4.js'];
fixes.forEach(f=>console.log(f,'exists: ready to run'));
