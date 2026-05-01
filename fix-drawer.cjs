const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix drawer - remove excessive padding, tighten spacing
c = c.replace(
  `"<div style='padding:10px 8px;'>"`,
  `"<div style='padding:6px 8px;'>"`
)

// Fix each menu button padding - reduce from 13px to 10px
c = c.replace(
  /padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;/g,
  `padding:10px 14px;background:none;border:none;border-radius:10px;cursor:pointer;`
)

// Fix divider margin
c = c.replace(
  `"<div style='height:1px;background:var(--divider);margin:6px 14px;'></div>"`,
  `"<div style='height:1px;background:var(--divider);margin:4px 14px;'></div>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
