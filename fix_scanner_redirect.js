const fs = require('fs');
const path = require('path');
const file = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/scanner/page.tsx');
let c = fs.readFileSync(file, 'utf8');

// Remove auto-redirect - user should choose via action buttons
const oldSuccess = `      setResult(data);
      setRedirecting(false); // Don't auto-redirect - show action buttons
      if (data.scansUsed !== null) setScansToday(data.scansUsed);`;

const newSuccess = `      setResult(data);
      if (data.scansUsed !== null) setScansToday(data.scansUsed);`;

// Also catch the old auto-redirect pattern if it's still there
const oldRedirect = `      setResult(data);
      if (data.card?.id) {
        setRedirecting(true);
        setTimeout(() => router.push(\`/preischeck/\${data.card.id}\`), 1500);
      }
      if (data.scansUsed !== null) setScansToday(data.scansUsed);`;

const newRedirect = `      setResult(data);
      if (data.scansUsed !== null) setScansToday(data.scansUsed);`;

if (c.includes(oldSuccess)) {
  c = c.replace(oldSuccess, newSuccess);
  console.log('✓ Removed setRedirecting(false) line');
} else if (c.includes(oldRedirect)) {
  c = c.replace(oldRedirect, newRedirect);
  console.log('✓ Removed auto-redirect with setTimeout');
} else {
  // Find any setTimeout redirect
  const redirectMatch = c.match(/setTimeout\([^)]+preischeck[^)]+\)[^;]*;/);
  if (redirectMatch) {
    c = c.replace(redirectMatch[0], '// redirect removed - use action buttons');
    console.log('✓ Removed setTimeout redirect');
  } else {
    console.log('No redirect found - checking setRedirecting usage:');
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('setRedirecting') || l.includes('setTimeout') || l.includes('router.push')) {
        console.log(`  Line ${i+1}: ${l.trim()}`);
      }
    });
  }
}

fs.writeFileSync(file, c, 'utf8');
console.log('Done');
