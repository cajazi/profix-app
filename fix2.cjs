const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')
// Replace double-backslash s with single-backslash s in the email regex
c = c.replace('/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/', '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/')
fs.writeFileSync('src/main.js', c, 'utf8')
const line86 = c.split('\n')[85]
console.log('Line 86:', line86)
