const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Approve withdrawal of NGN') && lines[i].includes('confirm(')) {
    lines[i] = `        if (!confirm("Approve withdrawal of NGN " + Number(btn.dataset.amt).toLocaleString() + "? Make sure you have sent the money to their bank before approving.")) return`
    // Remove the next line that was part of the broken multiline string
    if (lines[i+1] && lines[i+1].includes('Make sure')) {
      lines.splice(i+1, 1)
    }
    console.log('Fixed at line', i+1)
    break
  }
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
