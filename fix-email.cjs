const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')
c = c.replace(
  /if \(!\/\^.*?\/\.test\(email\)\)/,
  'if (!email.includes("@") || email.split("@")[1]?.indexOf(".") === -1)'
)
fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
