const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `  // Load escrow total from active contracts
  supabase.from("contracts").select("agreed_price,status").or("owner_id.eq." + user.id + ",worker_id.eq." + user.id).then(({ data, error }) => {
    const el = document.getElementById("escrowAmount")
    console.log("escrowAmount el:", el)
    if (el && data) {
      const total = data.filter(x => x.status === "active").reduce((sum, x) => sum + Number(x.agreed_price), 0)
      console.log("Total escrow:", total)
      el.innerHTML = "&#8358;" + total.toLocaleString()
    }
  })`,
  `  // Load escrow total from active contracts
  setTimeout(async () => {
    const { data } = await supabase.from("contracts").select("agreed_price,status").or("owner_id.eq." + user.id + ",worker_id.eq." + user.id)
    const el = document.getElementById("escrowAmount")
    if (el && data) {
      const total = data.filter(x => x.status === "active").reduce((sum, x) => sum + Number(x.agreed_price), 0)
      el.innerHTML = "&#8358;" + total.toLocaleString()
    }
  }, 300)`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
