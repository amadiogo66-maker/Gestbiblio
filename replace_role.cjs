const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
    'src/screens.ts',
    'src/store.ts',
    'src/main.ts',
    'index.html',
];

// Also scan src/ directory for any other .ts/.html files
const srcDir = 'src';
if (fs.existsSync(srcDir)) {
    fs.readdirSync(srcDir).forEach(f => {
        const full = path.join(srcDir, f);
        if (!filesToProcess.includes(full) && (f.endsWith('.ts') || f.endsWith('.html') || f.endsWith('.css'))) {
            filesToProcess.push(full);
        }
    });
}

let totalReplacements = 0;

filesToProcess.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Role value in logic (e.g. === 'Bibliothécaire') => keep as 'Personnel' for consistency
    // But we must also keep data compatibility - the role stored is what we replace
    
    // Replace plural first, then singular
    content = content.replace(/Bibliothécaires/g, 'Personnel');
    content = content.replace(/Bibliothécaire/g, 'Personnel');
    
    // Also handle without accent just in case
    content = content.replace(/Biblioth\u00e9caires/g, 'Personnel');
    content = content.replace(/Biblioth\u00e9caire/g, 'Personnel');

    if (content !== original) {
        const count = (original.match(/Biblioth[eé]caires?/g) || []).length;
        totalReplacements += count;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ ${filePath} — ${count} remplacement(s)`);
    } else {
        console.log(`— ${filePath} — aucune occurrence`);
    }
});

console.log(`\nTotal: ${totalReplacements} remplacement(s) effectué(s)`);
