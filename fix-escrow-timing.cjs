const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `console.log("Escrow query:", data, error)
    console.log("Statuses:", data.map(c => c.status))
    console.log("Active ones:", data.filter(c => c.status === "active"))
    const el = document.getElementById("escrowAmount")
    if (el && data) {
      const total = data.filter(c => c.status === "active").reduce((sum, c) => sum + Number(c.agreed_price), 0)
      el.innerHTML = "&#8358;" + total.toLocaleString()
    }`,
  `    const el = document.getElementById("escrowAmount")
    console.log("escrowAmount el:", el)
    if (el && data) {
      const total = data.filter(x => x.status === "active").reduce((sum, x) => sum + Number(x.agreed_price), 0)
      console.log("Total escrow:", total)
      el.innerHTML = "&#8358;" + total.toLocaleString()
    }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
