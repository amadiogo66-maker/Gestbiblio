const fs = require('fs');
let c = fs.readFileSync('src/screens.ts', 'utf8');
// Fix the escaped backticks that I mistakenly injected
c = c.replace(/\\`/g, '`');
// Fix the escaped dollar braces that I mistakenly injected
c = c.replace(/\\\$\{/g, '${');
fs.writeFileSync('src/screens.ts', c);
console.log('Fixed syntax errors');
