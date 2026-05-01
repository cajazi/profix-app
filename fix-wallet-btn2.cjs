const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `"<button id='withdrawBtn' style='background:#FFFFFF;color:" + (balance > 0 ? "var(--primary)" : "#111111") + ";font-size:14px;font-weight:700;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>" +
        (balance > 0 ? "Withdraw Funds" : "No funds yet") +
      "</button>"`,
  `(balance > 0
      ? "<button id='withdrawBtn' style='background:#FFFFFF;color:var(--primary);font-size:14px;font-weight:700;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>Withdraw Funds</button>"
      : "<button id='withdrawBtn' style='background:rgba(255,255,255,0.15);color:#FFFFFF;font-size:14px;font-weight:600;padding:10px 28px;border:2px solid rgba(255,255,255,0.4);border-radius:10px;cursor:pointer;'>No funds yet</button>")`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed.')
