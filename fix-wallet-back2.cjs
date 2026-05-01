const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

// Fix: pop all stale screens (success + pin + withdrawal) before showing wallet
c = c.replace(
  `    document.getElementById("backWalletBtn").addEventListener("click", () => {
      popScreen()
      showWallet(user)
    })
    }) // end checkWithdrawalPin
  })
}`,
  `    document.getElementById("backWalletBtn").addEventListener("click", () => {
      // Pop until we are back at wallet level - clears pin + withdrawal + success from stack
      while (screenStack.length > 0 && screenStack[screenStack.length - 1] !== "wallet") {
        screenStack.pop()
      }
      // Also pop wallet itself so showWallet pushes a fresh one
      if (screenStack[screenStack.length - 1] === "wallet") screenStack.pop()
      showWallet(user)
    })
    }) // end checkWithdrawalPin
  })
}`
)

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
