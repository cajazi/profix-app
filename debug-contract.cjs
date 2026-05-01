const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `  supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(res => {
    if (!res.error && res.data) {
      const btn = document.getElementById("contractNavBtn")
      if (btn && res.data.owner_id === user.id) {
        btn.style.display = "block"
        btn.onclick = () => showCreateContract(user, res.data)
      }
    }
  })`,
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
  })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Debug added. Lines:', c.split('\n').length)
