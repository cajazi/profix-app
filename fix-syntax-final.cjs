const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("backWalletBtn") && lines[i].includes("addEventListener")) {
    console.log("Found at line", i+1, ":", lines[i].trim())
    console.log("Next:", lines[i+1] && lines[i+1].trim())
    console.log("Next2:", lines[i+2] && lines[i+2].trim())

    // Replace this line and the next 2 with a clean block
    lines.splice(i, 3,
      '    document.getElementById("backWalletBtn").addEventListener("click", () => {',
      '      backStack = [{ name: "dashboard", fn: () => showDashboard(user) }]',
      '      showWallet(user)',
      '    })',
      '    }) // end checkWithdrawalPin',
      '  })',
      '}'
    )
    console.log("Replaced cleanly")
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
