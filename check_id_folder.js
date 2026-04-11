const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Check if [id] folder exists and what's in it
const idFolder = path.join(root, 'src', 'app', 'preischeck', '[id]');
console.log('Checking:', idFolder);
console.log('Exists:', fs.existsSync(idFolder));

if (fs.existsSync(idFolder)) {
  const files = fs.readdirSync(idFolder);
  console.log('Files:', files);
  
  const pageFile = path.join(idFolder, 'page.tsx');
  if (fs.existsSync(pageFile)) {
    const content = fs.readFileSync(pageFile, 'utf8');
    console.log('page.tsx size:', content.length, 'chars');
    console.log('First line:', content.split('\n')[0]);
    console.log('Has async function load:', content.includes('async function load'));
    console.log('Has .catch:', content.includes('.catch'));
  }
} else {
  console.log('FOLDER DOES NOT EXIST - creating...');
  fs.mkdirSync(idFolder, { recursive: true });
  console.log('Created!');
}
