const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")
for (let i = 225; i < 240; i++) {
  if (lines[i] && lines[i].includes("supabase.from") && lines[i].includes("is_admin")) {
    lines[i]   = '  if (["cossybest24@gmail.com","cossyjay24@gmail.com","support@cosmas.dev"].includes(user.email)) {'
    lines[i+1] = '    const ab = document.getElementById("menuAdminBtn")'
    lines[i+2] = '    if (ab) { ab.style.display = "flex"; ab.addEventListener("click", () => { closeMenu(); showAdminPanel(user) }) }'
    lines[i+3] = '  }'
    lines[i+4] = '}'
    lines[i+5] = ''
    lines[i+6] = ''
    lines[i+7] = ''
    console.log("Fixed admin check on line", i+1)
    break
  }
}
fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
