const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Approve withdrawal of NGN') && lines[i].includes('confirm(')) {
    lines[i] = `        if (!confirm("Approve withdrawal of NGN " + Number(btn.dataset.amt).toLocaleString() + "? Confirm you have sent the money.")) return`
    // Remove extra lines until we hit the next real line
    while (i+1 < lines.length && !lines[i+1].includes('btn.disabled')) {
      lines.splice(i+1, 1)
    }
    console.log('Fixed at line', i+1)
    break
  }
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
