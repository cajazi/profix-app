const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `console.log("Escrow query:", data, error)`,
  `console.log("Escrow query:", data, error)
    console.log("Statuses:", data.map(c => c.status))
    console.log("Active ones:", data.filter(c => c.status === "active"))`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
