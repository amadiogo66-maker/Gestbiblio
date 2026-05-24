const fs = require('fs');

// 1. Update screens.ts
let screensFile = fs.readFileSync('src/screens.ts', 'utf8');

// Remove the dropdown button for Bibliothécaire
screensFile = screensFile.replace(
    /<button onclick="document\.getElementById\('addLibrarianModal'\)\.classList\.remove\('hidden'\)" class="w-full text-left px-4 py-3 text-sm hover:bg-surface-container font-semibold">Bibliothécaire<\/button>/,
    ''
);

// Remove the modal
const modalRegex = /<!-- Modal Bibliothécaire -->[\s\S]*?id="addLibrarianModal"[\s\S]*?<\/form>\s*<\/div>/;
screensFile = screensFile.replace(modalRegex, '');

fs.writeFileSync('src/screens.ts', screensFile);

// 2. Update store.ts (remove `fonction?: string;`)
let storeFile = fs.readFileSync('src/store.ts', 'utf8');
storeFile = storeFile.replace(/\s*fonction\?:\s*string;/, '');
fs.writeFileSync('src/store.ts', storeFile);

console.log('done');
