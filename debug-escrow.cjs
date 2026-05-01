const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `  supabase.from("contracts").select("agreed_price,owner_id,worker_id").or("owner_id.eq." + user.id + ",worker_id.eq." + user.id).eq("status", "active").then(({ data }) => {
    const el = document.getElementById("escrowAmount")
    if (el && data) {
      const total = data.reduce((sum, c) => sum + Number(c.agreed_price), 0)
      el.innerHTML = "&#8358;" + total.toLocaleString()
    }
  })`,
  `  supabase.from("contracts").select("agreed_price,owner_id,worker_id,status").or("owner_id.eq." + user.id + ",worker_id.eq." + user.id).then(({ data, error }) => {
    console.log("Contracts:", data, "Error:", error)
    const el = document.getElementById("escrowAmount")
    if (el && data) {
      const active = data.filter(c => c.status === "active")
      console.log("Active contracts:", active)
      const total = active.reduce((sum, c) => sum + Number(c.agreed_price), 0)
      el.innerHTML = "&#8358;" + total.toLocaleString()
    }
  })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Debug added.')
