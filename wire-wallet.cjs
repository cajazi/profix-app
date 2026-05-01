const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("menuContractsBtn") && lines[i].includes("addEventListener")) {
    lines.splice(i, 0, '  document.getElementById("menuWalletBtn").addEventListener("click", () => { closeMenu(); showWallet(user) })')
    console.log("Wired wallet button at line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
