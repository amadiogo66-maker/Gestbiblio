const fs = require('fs');
let content = fs.readFileSync('src/screens.ts', 'utf8');

// Find the old stats block: from "    stats: () => `" to the closing "`," before "    interface:"
const startMarker = '    stats: () => `';
const endMarker   = '    interface: () => `';

const startIdx = content.indexOf(startMarker);
const endIdx   = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
    process.exit(1);
}

const replacement = fs.readFileSync('stats_screen.txt', 'utf8');
content = content.substring(0, startIdx) + replacement + '\n    ' + content.substring(endIdx);
fs.writeFileSync('src/screens.ts', content);
console.log('Successfully replaced stats section');
