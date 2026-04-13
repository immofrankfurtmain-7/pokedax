const fs = require('fs');
const path = require('path');
const file = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/scanner/page.tsx');
let c = fs.readFileSync(file, 'utf8');

// Fix 1: Remove auto-redirect block
c = c.replace(
`      setResult(data);
      if (data.card?.id) {
        setRedirecting(true);
        setTimeout(() => router.push(\`/preischeck/\${data.card.id}\`), 1500);
      }
      if (data.scansUsed !== null) setScansToday(data.scansUsed);`,
`      setResult(data);
      if (data.scansUsed !== null) setScansToday(data.scansUsed);`
);

// Fix 2: Remove any remaining setRedirecting/redirecting references
c = c.replace(/\n.*setRedirecting[^;]+;/g, '');
c = c.replace(/\n.*const \[redirecting[^;]+;/g, '');
c = c.replace(/\n.*\[redirecting,[^;]+;/g, '');

// Fix 3: Remove useRouter if only used for redirect (check if still needed)
const routerUsages = (c.match(/router\./g)||[]).length;
console.log('router. usages:', routerUsages);

fs.writeFileSync(file, c, 'utf8');

const lines = c.split('\n');
console.log('Lines:', lines.length);
console.log('Lines 195-210:');
lines.slice(194, 210).forEach((l, i) => {
  if (l.trim()) console.log(String(195+i).padStart(3) + ': ' + l);
});
console.log('\nsetRedirecting remaining:', (c.match(/setRedirecting/g)||[]).length);
console.log('setTimeout remaining:', (c.match(/setTimeout/g)||[]).length);
