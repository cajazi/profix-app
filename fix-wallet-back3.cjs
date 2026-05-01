const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

const OLD = `    document.getElementById("backWalletBtn").addEventListener("click", () => {
      // Pop until we are back at wallet level - clears pin + withdrawal + success from stack
      while (screenStack.length > 0 && screenStack[screenStack.length - 1] !== "wallet") {
        screenStack.pop()
      }
      // Also pop wallet itself so showWallet pushes a fresh one
      if (screenStack[screenStack.length - 1] === "wallet") screenStack.pop()
      showWallet(user)
    })`

const NEW = `    document.getElementById("backWalletBtn").addEventListener("click", () => {
      // Remove all stale screens: withdrawSuccess, verifyWPin, setWPin, withdrawal, wallet
      const stale = ["withdrawSuccess", "verifyWPin", "setWPin", "withdrawal", "wallet"]
      while (backStack.length > 1 && stale.includes(backStack[backStack.length - 1].name)) {
        backStack.pop()
      }
      showWallet(user)
    })`

if (c.includes(OLD)) {
  c = c.replace(OLD, NEW)
  console.log("Fixed")
} else {
  console.log("Pattern not found - trying fallback")
  c = c.replace(
    `document.getElementById("backWalletBtn").addEventListener("click", () => {`,
    `document.getElementById("backWalletBtn").addEventListener("click", () => {
      const stale = ["withdrawSuccess", "verifyWPin", "setWPin", "withdrawal", "wallet"]
      while (backStack.length > 1 && stale.includes(backStack[backStack.length - 1].name)) {
        backStack.pop()
      }`
  )
  // Remove the old popScreen() call that is now duplicate
  c = c.replace(
    `      popScreen()
      showWallet(user)`,
    `      showWallet(user)`
  )
  console.log("Fallback applied")
}

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
