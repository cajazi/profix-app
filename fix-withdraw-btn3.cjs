const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `? "<button id='withdrawBtn' style='background:#FFFFFF;color:#007A38;font-size:14px;font-weight:800;padding:12px 28px;border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);'>ðŸ'¸ Withdraw Funds</button>"`,
  `? "<button id='withdrawBtn' style='background:#FFFFFF;color:#007A38;font-size:14px;font-weight:800;padding:12px 28px;border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);'>Withdraw Funds</button>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
