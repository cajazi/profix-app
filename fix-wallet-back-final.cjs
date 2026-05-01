const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

// Find the backWalletBtn listener and replace it entirely
const OLD = `document.getElementById("backWalletBtn").addEventListener("click", () => {
      const stale = ["withdrawSuccess", "verifyWPin", "setWPin", "withdrawal", "wallet"]
      while (backStack.length > 1 && stale.includes(backStack[backStack.length - 1].name)) {
        backStack.pop()
      }
      showWallet(user)
    })`

const NEW = `document.getElementById("backWalletBtn").addEventListener("click", () => {
      // Reset stack to just dashboard so hardware back goes to dashboard not PIN screen
      backStack = [{ name: "dashboard", fn: () => showDashboard(user) }]
      showWallet(user)
    })`

if (c.includes(OLD)) {
  c = c.replace(OLD, NEW)
  console.log("Fixed cleanly")
} else {
  // Find and replace using line search
  const lines = c.split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("backWalletBtn") && lines[i].includes("addEventListener")) {
      // Replace from this line until closing })
      let end = i + 1
      while (end < lines.length && !lines[end].includes("})")) end++
      lines.splice(i, end - i + 1,
        `    document.getElementById("backWalletBtn").addEventListener("click", () => {`,
        `      backStack = [{ name: "dashboard", fn: () => showDashboard(user) }]`,
        `      showWallet(user)`,
        `    })`
      )
      console.log("Fixed via line search at line", i+1)
      break
    }
  }
  c = lines.join("\n")
}

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
