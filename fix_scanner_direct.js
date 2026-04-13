const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';
const file = path.join(root, 'src/app/scanner/page.tsx');

let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find ALL syntax problems
console.log('=== Scanning for issues ===');
lines.forEach((l, i) => {
  // Broken regex replacement artifacts
  if (l.includes('"Karte erkannt"_')) console.log(`Line ${i+1} BROKEN: ${l}`);
  if (l.includes('||"Karte erkannt"||')) console.log(`Line ${i+1} BROKEN: ${l}`);
  // Unclosed template literals
  const btCount = (l.match(/`/g)||[]).length;
  if (btCount % 2 !== 0) console.log(`Line ${i+1} ODD BACKTICK: ${l.substring(0,120)}`);
});

// Fix ALL known broken patterns
const fixes = [
  // Pattern 1: double replacement artifact
  [`result.card?.name||"Karte erkannt"_de||result.card?.name||"Karte erkannt"`,
   `result.card?.name_de||result.card?.name||"Unbekannte Karte"`],
  // Pattern 2: other variants  
  [`result.card?.name || "Karte erkannt"_de`,
   `result.card?.name_de`],
  // Pattern 3: gemini reference remaining
  [`result.gemini?.name_de||result.gemini?.name`,
   `result.card?.name_de||result.card?.name`],
];

for (const [bad, good] of fixes) {
  if (content.includes(bad)) {
    content = content.replaceAll(bad, good);
    console.log(`Fixed: ${bad.substring(0,50)}`);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('\nDone. Lines:', content.split('\n').length);

// Verify line 396
const newLines = content.split('\n');
console.log('Line 394-398:');
newLines.slice(393,398).forEach((l,i) => console.log(`${394+i}: ${l}`));
