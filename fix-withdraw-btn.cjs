const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `? "<button id='withdrawBtn' style='background:#FFFFFF;color:var(--primary);font-size:14px;font-weight:700;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>Withdraw Funds</button>"`,
  `? "<button id='withdrawBtn' style='background:#FFFFFF;color:#009944;font-size:14px;font-weight:800;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>Withdraw Funds</button>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
