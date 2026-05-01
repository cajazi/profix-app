const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix both button states to always be visible
c = c.replace(
  `? "<button id='withdrawBtn' style='background:#FFFFFF;color:#009944;font-size:14px;font-weight:800;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>Withdraw Funds</button>"
      : "<button id='withdrawBtn' style='background:rgba(255,255,255,0.15);color:#FFFFFF;font-size:14px;font-weight:600;padding:10px 28px;border:2px solid rgba(255,255,255,0.4);border-radius:10px;cursor:pointer;'>No funds yet</button>"`,
  `? "<button id='withdrawBtn' style='background:#FFFFFF;color:#007A38;font-size:14px;font-weight:800;padding:12px 28px;border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);'>💸 Withdraw Funds</button>"
      : "<button id='withdrawBtn' style='background:rgba(255,255,255,0.20);color:#FFFFFF;font-size:14px;font-weight:700;padding:12px 28px;border:2px solid rgba(255,255,255,0.5);border-radius:10px;cursor:pointer;'>No funds yet</button>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
