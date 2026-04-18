const fs=require('fs'),p=require('path');
const f=p.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax','src/app/forum/page.tsx');
let c=fs.readFileSync(f,'utf8');

// Fix 1: use null for fake category IDs (1,2,3,4,5)
c=c.replace(/id: "1", name/g, 'id: null, name');
c=c.replace(/id: "2", name/g, 'id: null, name');
c=c.replace(/id: "3", name/g, 'id: null, name');
c=c.replace(/id: "4", name/g, 'id: null, name');
c=c.replace(/id: "5", name/g, 'id: null, name');

// Fix 2: validate category_id before insert - only use real UUIDs
c=c.replace(
  /category_id: catId,/g,
  'category_id: (catId && catId.length > 10) ? catId : null,'
);

fs.writeFileSync(f,c,'utf8');
console.log('Forum fixed!');
console.log('Fake IDs remaining:', (c.match(/id: "\d"/g)||[]).length);
console.log('Has validCatId check:', c.includes('catId.length > 10'));
