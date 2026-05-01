const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("backWalletBtn") && lines[i].includes("addEventListener")) {
    lines[i+1] = '      backStack = [{ name: "dashboard", fn: () => showDashboard(user) }]'
    lines[i+2] = '      showWallet(user)'
    console.log("Fixed at line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
