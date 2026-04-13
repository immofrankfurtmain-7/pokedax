const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';
const file = path.join(root, 'src/app/scanner/page.tsx');

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);
console.log('\n=== Full file content around error ===');
lines.slice(215, 245).forEach((l, i) => console.log(String(216+i).padStart(3) + ': ' + JSON.stringify(l)));

// Find ALL backtick issues
console.log('\n=== Backtick scan ===');
let inTemplateLiteral = false;
lines.forEach((l, i) => {
  const bt = (l.match(/`/g)||[]).length;
  if (bt % 2 !== 0) {
    console.log(`Line ${i+1} [${bt} backticks]: ${l.substring(0,120)}`);
  }
});

// Find unclosed JSX expressions
console.log('\n=== Lines 200-240 raw ===');
lines.slice(199, 240).forEach((l, i) => {
  if (l.trim()) console.log(String(200+i).padStart(3) + ': ' + l);
});
