const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Inject contract button into DOM directly via JS - no HTML string replacement needed
c = c.replace(
  `  supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(res => {
    console.log("Room data:", res.data, "Error:", res.error)
    console.log("User id:", user.id)
    if (!res.error && res.data) {
      const btn = document.getElementById("contractNavBtn")
      console.log("Button found:", !!btn)
      console.log("Is owner:", res.data.owner_id === user.id)
      if (btn && res.data.owner_id === user.id) {
        btn.style.display = "block"
        btn.onclick = () => showCreateContract(user, res.data)
      }
    }
  })`,
  `  supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(res => {
    if (!res.error && res.data && res.data.owner_id === user.id) {
      const navRow = document.querySelector("nav > div")
      if (navRow && !document.getElementById("contractNavBtn")) {
        const btn = document.createElement("button")
        btn.id = "contractNavBtn"
        btn.textContent = "Contract"
        btn.style.cssText = "background:rgba(0,194,89,0.12);border:1.5px solid var(--border-active);color:var(--primary);font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;white-space:nowrap;margin-left:auto;"
        btn.onclick = () => showCreateContract(user, res.data)
        navRow.appendChild(btn)
      }
    }
  })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
