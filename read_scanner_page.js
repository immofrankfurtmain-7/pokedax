const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';
const file = path.join(root, 'src', 'app', 'scanner', 'page.tsx');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Lines 220-250:');
lines.slice(219, 250).forEach((l, i) => console.log(String(220 + i).padStart(3) + ': ' + l));
