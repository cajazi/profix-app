const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix nav bar - hamburger lines and ProFix text should always be dark in light mode
c = c.replace(
  `"<div style='width:20px;height:2px;background:#fff;border-radius:2px;'></div>" +\n      "<div style='width:20px;height:2px;background:#fff;border-radius:2px;'></div>" +\n      "<div style='width:20px;height:2px;background:#fff;border-radius:2px;'></div>"`,
  `"<div style='width:20px;height:2px;background:var(--text-primary);border-radius:2px;'></div>" +\n      "<div style='width:20px;height:2px;background:var(--text-primary);border-radius:2px;'></div>" +\n      "<div style='width:20px;height:2px;background:var(--text-primary);border-radius:2px;'></div>"`
)

// Fix ProFix text in nav
c = c.replace(
  `"<span style='color:var(--text-primary);font-size:18px;font-weight:700;'>ProFix</span>"`,
  `"<span style='color:var(--text-primary);font-size:18px;font-weight:700;'>ProFix</span>"`
)

// Fix notification bell in nav
c = c.replace(
  `style='background:none;border:none;color:var(--text-secondary);cursor:pointer`,
  `style='background:none;border:none;color:var(--text-primary);cursor:pointer`
)

// Fix hero welcome card - force white text on green background
c = c.replace(
  /(<div style='background:var\(--gradient-hero\)[^']*'>)/g,
  (match) => match
)

// The hero card text - replace all color vars inside the hero card with white
c = c.replace(
  `"<p style='color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 3px;'>Welcome back &#128075;</p>" +` +
  `\n    "<p style='color:var(--text-primary);font-size:16px;font-weight:700`,
  `"<p style='color:rgba(255,255,255,0.85);font-size:13px;margin:0 0 3px;'>Welcome back &#128075;</p>" +` +
  `\n    "<p style='color:#FFFFFF;font-size:16px;font-weight:700`
)

c = c.replace(
  `"<p style='color:rgba(255,255,255,0.75);font-size:13px;margin:0;'>Your home services dashboard</p>"`,
  `"<p style='color:rgba(255,255,255,0.8);font-size:13px;margin:0;'>Your home services dashboard</p>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
