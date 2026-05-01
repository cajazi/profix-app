const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

// Find and replace the escrow query line
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Load escrow total from active contracts')) {
    lines[i]   = '  // Load escrow total from active contracts'
    lines[i+1] = '  supabase.from("contracts").select("agreed_price,status").or("owner_id.eq." + user.id + ",worker_id.eq." + user.id).then(({ data, error }) => {'
    lines[i+2] = '    console.log("Escrow query:", data, error)'
    lines[i+3] = '    const el = document.getElementById("escrowAmount")'
    lines[i+4] = '    if (el && data) {'
    lines[i+5] = '      const total = data.filter(c => c.status === "active").reduce((sum, c) => sum + Number(c.agreed_price), 0)'
    lines[i+6] = '      el.innerHTML = "&#8358;" + total.toLocaleString()'
    lines[i+7] = '    }'
    lines[i+8] = '  })'
    console.log('Found and replaced at line', i+1)
    break
  }
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
