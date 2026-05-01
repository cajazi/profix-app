const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Available Balance') && lines[i].includes('gradient-hero')) {
    lines[i] = `  let html =`
    lines[i+1] = `    "<div style='background:var(--gradient-hero);border-radius:20px;padding:24px;margin-bottom:16px;text-align:center;box-shadow:var(--shadow-green);'>" +`
    lines[i+2] = `      "<p style='color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;'>Available Balance</p>" +`
    lines[i+3] = `      "<p style='color:#FFFFFF;font-size:36px;font-weight:800;margin:0 0 16px;'>&#8358;" + balance.toLocaleString() + "</p>" +`
    lines[i+4] = `      "<button id='withdrawBtn' style='background:#FFFFFF;color:#007A38;font-size:14px;font-weight:800;padding:12px 28px;border:3px solid #007A38;border-radius:10px;cursor:pointer;'>" + (balance > 0 ? "Withdraw Funds" : "No funds yet") + "</button>" +`
    lines[i+5] = `    "</div>" +`
    console.log('Fixed at line', i+1)
    break
  }
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
