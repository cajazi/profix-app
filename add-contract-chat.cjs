const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

const contractCode = `
  // Add contract button for room owner
  supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(function(res) {
    if (res.data && res.data.owner_id === user.id) {
      const room = res.data
      const navDiv = document.querySelector("nav > div")
      if (navDiv) {
        const contractBtn = document.createElement("button")
        contractBtn.style.cssText = "background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);color:#34d399;font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;margin-left:auto;white-space:nowrap;"
        contractBtn.textContent = "Contract"
        navDiv.appendChild(contractBtn)
        contractBtn.addEventListener("click", function() {
          showCreateContract(user, room, room.worker_email, 0)
        })
      }
    }
  })
`

// Insert before line 521 (index 520)
lines.splice(520, 0, contractCode)
fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Contract button added to chat room")
