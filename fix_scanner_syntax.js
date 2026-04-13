const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';
const file = path.join(root, 'src/app/scanner/page.tsx');

let content = fs.readFileSync(file, 'utf8');

// Fix the broken line 396
const broken = `result.card?.name||"Karte erkannt"_de||result.card?.name||"Karte erkannt"`;
const fixed  = `result.card?.name_de||result.card?.name||"Karte erkannt"`;
content = content.replace(broken, fixed);

// Also fix line 11: ScanResult interface still has old `gemini` field
// Update to match new API response
const oldInterface = `interface ScanResult {
  gemini: { name:string; name_de:string; set_id:string|null; number:string|null; confidence:number };
  card: { id:string; name:string; name_de:string; set_id:string; number:string; price_market:number; price_avg7:number|null; price_avg30:number|null; image_url:string|null; rarity:string|null } | null;
  matches: any[];
  scansUsed: number | null;
  scansLeft: number | null;
}`;
const newInterface = `interface ScanResult {
  status: string;
  card: { id:string; name:string; name_de:string; name_en:string; set_id:string; number:string; price_market:number|null; price_avg7:number|null; price_avg30:number|null; image_url:string|null; rarity:string|null; hp:string|null } | null;
  confidence: number;
  method: string;
  scansUsed: number | null;
}`;
content = content.replace(oldInterface, newInterface);

fs.writeFileSync(file, content, 'utf8');

// Verify fix
const lines = content.split('\n');
console.log('Line 396:', lines[395]);
console.log('Line 11:', lines[10]);
console.log('Fixed!');
