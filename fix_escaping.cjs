const fs = require('fs');
let content = fs.readFileSync('src/screens.ts', 'utf8');
content = content.replace(/\\\${/g, '${').replace(/\\\`/g, '`');
fs.writeFileSync('src/screens.ts', content);
