const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("menuContractsBtn") && lines[i].includes("addEventListener")) {
    lines.splice(i, 0, '  document.getElementById("menuFindWorkersBtn").addEventListener("click", () => { closeMenu(); showWorkerDiscovery(user) })')
    console.log("Wired Find Workers button at line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
