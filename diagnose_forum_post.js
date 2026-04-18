const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

const forum = fs.readFileSync(path.join(root, 'src/app/forum/page.tsx'), 'utf8');

// Check the loadPosts query
const loadIdx = forum.indexOf('async function loadPosts');
console.log('=== loadPosts function ===');
console.log(forum.slice(loadIdx, loadIdx + 500));

// Check submit function
const submitIdx = forum.indexOf('async function submit');
console.log('\n=== submit function ===');
console.log(forum.slice(submitIdx, submitIdx + 400));

// Marketplace
const mp = fs.readFileSync(path.join(root, 'src/app/marketplace/page.tsx'), 'utf8');
const modalIdx = mp.indexOf('function CreateModal');
console.log('\n=== CreateModal search section ===');
const searchSection = mp.slice(modalIdx, modalIdx + 800);
console.log(searchSection);
