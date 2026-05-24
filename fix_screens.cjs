const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find the two dashboard declarations and fix the mess
// The orphaned content is between line ~890 (after the old login was gutted)
// and the second dashboard declaration. We need to find the FIRST dashboard
// declaration that's broken (has orphaned HTML) and remove everything up to
// the real one.

// Strategy: find the first `dashboard: () => \`` and remove it plus all orphaned
// content until the real `dashboard: () => \`` that is properly formed.

// Find positions of both dashboard declarations
const marker1 = "    dashboard: () => `\n                        <div class=\"mx-auto mb-5 inline-flex";
const marker2 = "    dashboard: () => `\n        <div class=\"flex min-h-screen\">";

const idx1 = content.indexOf(marker1);
const idx2 = content.indexOf(marker2);

if (idx1 === -1) {
    console.log('Marker 1 not found - already clean, or different format.');
    console.log('Checking for orphaned HTML...');
    
    // Alternative: find and remove orphaned HTML between profiles screen end and dashboard
    // Look for the pattern: },\n\n\n    dashboard
    const altIdx = content.indexOf("    dashboard: () => `\n                        <div");
    if (altIdx !== -1) {
        const endIdx = content.indexOf("    dashboard: () => `\n        <div class=\"flex min-h-screen\">");
        if (endIdx !== -1 && endIdx > altIdx) {
            content = content.slice(0, altIdx) + content.slice(endIdx);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed: removed orphaned dashboard block.');
        } else {
            console.log('Cannot find second dashboard - manual fix needed.');
        }
    } else {
        console.log('No orphaned block found.');
    }
    process.exit(0);
}

if (idx2 === -1) {
    console.log('Marker 2 not found.');
    process.exit(1);
}

// Remove from idx1 to idx2, replacing with nothing (idx2 stays as the real dashboard)
content = content.slice(0, idx1) + content.slice(idx2);
fs.writeFileSync(filePath, content, 'utf8');

console.log(`Done! Removed orphaned block from position ${idx1} to ${idx2}.`);
console.log(`File now has ${content.split('\n').length} lines.`);
