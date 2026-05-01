const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')
c = c.replace(/\[\\^\\\\s@\]/g, '[^\\s@]')
c = c.replace(/\\\\\\./g, '\\.')
fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
const line86 = c.split('\n')[85]
console.log('Line 86:', line86)
