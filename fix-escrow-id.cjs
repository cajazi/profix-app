const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('In Escrow') && lines[i].includes('&#8358;0')) {
    lines[i] = lines[i].replace(
      `<p style='color:#fff;font-size:26px;font-weight:700;margin:0;'>&#8358;0</p>`,
      `<p id='escrowAmount' style='color:#fff;font-size:26px;font-weight:700;margin:0;'>&#8358;0</p>`
    )
    console.log('Fixed at line', i+1)
    break
  }
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
