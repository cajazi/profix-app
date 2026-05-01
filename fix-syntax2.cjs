const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Load escrow total')) {
    // Line i+9 should be the postJobBtn listener but it got eaten
    // Insert the missing line after the escrow block closes at i+8
    if (lines[i+9] && lines[i+9].includes('const { data: p }')) {
      lines.splice(i+9, 0, '  document.getElementById("postJobBtn").addEventListener("click", async () => {')
      console.log('Fixed: inserted missing line at', i+10)
    }
    break
  }
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
