const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `"<p style='color:var(--text-muted);font-size:11px;margin:0 0 5px;text-transform:uppercase;'>In Escrow</p>" +
          "<p style='color:#FFFFFF;font-size:26px;font-weight:700;margin:0;'>&#8358;0</p>"`,
  `"<p style='color:var(--text-muted);font-size:11px;margin:0 0 5px;text-transform:uppercase;'>In Escrow</p>" +
          "<p id='escrowAmount' style='color:#FFFFFF;font-size:26px;font-weight:700;margin:0;'>&#8358;0</p>"`
)

// Load escrow amount after dashboard renders
c = c.replace(
  `  document.getElementById("postJobBtn").addEventListener("click", async () => {`,
  `  // Load escrow total from active contracts
  supabase.from("contracts").select("agreed_price").eq("owner_id", user.id).eq("status", "active").then(({ data }) => {
    const el = document.getElementById("escrowAmount")
    if (el && data) {
      const total = data.reduce((sum, c) => sum + Number(c.agreed_price), 0)
      el.innerHTML = "&#8358;" + total.toLocaleString()
    }
  })
  document.getElementById("postJobBtn").addEventListener("click", async () => {`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
