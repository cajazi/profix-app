const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("menuProfileBtn") && lines[i].includes("addEventListener") && lines[i].includes("showProfile")) {
    lines.splice(i + 1, 0, '  document.getElementById("menuContractsBtn").addEventListener("click", () => { closeMenu(); showMyContracts(user) })')
    console.log("Wired contracts button at line", i+2)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
