const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Remove the hardcoded admin button from drawer HTML
c = c.replace(
  `"<button id='menuAdminBtn' style='display:none;width:100%;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'><span style='font-size:20px;'>&#128274;</span><span style='color:#d97706;font-size:14px;font-weight:600;text-align:left;'>Admin Panel</span></button>" +`,
  ``
)

// Also remove any wiring for old menuAdminBtn
c = c.replace(
  /document\.getElementById\("menuAdminBtn"\)[\s\S]*?showAdminPanel\(\)\s*\}\)/,
  ``
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
