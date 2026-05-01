const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix: check owner directly from user param - no need for extra DB call
c = c.replace(
  `  // Load room info and show contract button for owner
  supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(res => {
    if (res.data && res.data.owner_id === user.id) {
      const btn = document.getElementById("contractNavBtn")
      if (btn) {
        btn.style.display = "block"
        btn.addEventListener("click", () => showCreateContract(user, res.data))
      }
    }
  })
  await loadMessages(user, roomId)`,
  `  await loadMessages(user, roomId)
  // Show contract button - fetch room then check if user is owner
  supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(res => {
    if (!res.error && res.data) {
      const btn = document.getElementById("contractNavBtn")
      if (btn && res.data.owner_id === user.id) {
        btn.style.display = "block"
        btn.onclick = () => showCreateContract(user, res.data)
      }
    }
  })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
