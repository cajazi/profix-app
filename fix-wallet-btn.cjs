const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `"<button id='withdrawBtn' style='background:#FFFFFF;color:var(--primary);font-size:14px;font-weight:700;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>" +
        (balance > 0 ? "Withdraw Funds" : "No funds yet") +
      "</button>"`,
  `"<button id='withdrawBtn' style='background:#FFFFFF;color:" + (balance > 0 ? "var(--primary)" : "#111111") + ";font-size:14px;font-weight:700;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>" +
        (balance > 0 ? "Withdraw Funds" : "No funds yet") +
      "</button>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed.')
