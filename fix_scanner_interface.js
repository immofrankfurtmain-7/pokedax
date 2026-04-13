const fs = require('fs');
const path = require('path');
const file = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/scanner/page.tsx');
let c = fs.readFileSync(file, 'utf8');

// Fix ScanResult interface - add confidence, remove old gemini field
c = c.replace(
  `interface ScanResult {
  gemini: { name:string; name_de:string; set_id:string|null; number:string|null; confidence:number };
  card: { id:string; name:string; name_de:string; set_id:string; number:string; price_market:number; price_avg7:number|null; price_avg30:number|null; image_url:string|null; rarity:string|null } | null;
  matches: any[];
  scansUsed: number | null;
  scansLeft: number | null;
}`,
  `interface ScanResult {
  status: string;
  card: { id:string; name:string; name_de:string; name_en:string; set_id:string; number:string; price_market:number|null; price_avg7:number|null; price_avg30:number|null; image_url:string|null; rarity:string|null; hp:string|null } | null;
  confidence: number;
  method: string;
  scansUsed: number | null;
}`
);

fs.writeFileSync(file, c, 'utf8');
// Verify
const lines = c.split('\n');
console.log('Interface lines 10-17:');
lines.slice(9,17).forEach((l,i) => console.log(`${10+i}: ${l}`));
console.log('confidence in interface:', c.includes('confidence: number;'));
