const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

// Fix 1: Syntax error at line 2580 - find and remove extra })
console.log("Line 2579:", lines[2578] && lines[2578].trim())
console.log("Line 2580:", lines[2579] && lines[2579].trim())
console.log("Line 2581:", lines[2580] && lines[2580].trim())

// Find the })) that is unexpected and remove it
for (let i = 2570; i < 2590; i++) {
  if (lines[i] && lines[i].trim() === "}))") {
    // Check if previous line already closes something
    if (lines[i-1] && (lines[i-1].trim() === "})" || lines[i-1].trim() === "})")) {
      lines.splice(i, 1)
      console.log("Removed extra })) at line", i+1)
      break
    }
  }
}

// Fix 2: Clean up the backWalletBtn handler
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("backWalletBtn") && lines[i].includes("addEventListener")) {
    lines[i+1] = "      backStack = [{ name: \"dashboard\", fn: () => showDashboard(user) }]"
    lines[i+2] = "      showWallet(user)"
    console.log("backWalletBtn fixed at line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
