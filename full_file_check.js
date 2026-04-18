const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
const c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');

// Count JSX brackets to find mismatch
let open = 0, close = 0;
let issues = [];

lines.forEach((line, i) => {
  // Check for common issues
  if (line.includes('`') ) {
    const bt = (line.match(/`/g)||[]).length;
    if (bt % 2 !== 0) issues.push(`Line ${i+1} odd backticks: ${line.trim().slice(0,80)}`);
  }
  // Check for unescaped & in JSX string attributes (not in {})
  if (line.match(/="[^"]*&[^"]*"/)) {
    issues.push(`Line ${i+1} & in string attr: ${line.trim().slice(0,80)}`);
  }
  // Check for </> issues
  if (line.includes('< /') || line.includes('/ >')) {
    issues.push(`Line ${i+1} bad tag: ${line.trim().slice(0,80)}`);
  }
});

console.log('Total lines:', lines.length);
console.log('Issues found:', issues.length);
issues.forEach(i => console.log(' -', i));

// Print lines 94-105 from current file
console.log('\nLines 93-107:');
lines.slice(92, 107).forEach((l,i) => console.log(`${i+93}: ${l.slice(0,100)}`));

// Also check the PriceChart area
const pcIdx = c.indexOf('function PriceChart');
if (pcIdx > 0) {
  const pcLines = c.slice(pcIdx).split('\n').slice(0,30);
  console.log('\nPriceChart start:');
  pcLines.forEach((l,i) => console.log(`${i}: ${l.slice(0,100)}`));
}
