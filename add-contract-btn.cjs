const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("sendBtn.addEventListener") && lines[i].includes("click") && lines[i].includes("msgInput.value.trim")) {
    // Add contract button before send button listener
    const contractBtnCode = `
  // Add contract button to chat nav
  const chatNav = document.querySelector("nav > div")
  if (chatNav && user.id !== undefined) {
    supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(function(res) {
      if (res.data && res.data.owner_id === user.id) {
        const contractBtn = document.createElement("button")
        contractBtn.style.cssText = "background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);color:#34d399;font-size:12px;font-weight:700;padding:5px 10px;border-radius:8px;cursor:pointer;margin-left:auto;"
        contractBtn.textContent = "Contract"
        chatNav.appendChild(contractBtn)
        contractBtn.addEventListener("click", function() {
          showCreateContract(user, res.data, res.data.worker_email, 0)
        })
      }
    })
  }
`
    lines.splice(i, 0, contractBtnCode)
    console.log("Added contract button at line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
