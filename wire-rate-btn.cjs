const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

code = code.replace(
  `  const disputeBtn = document.getElementById("disputeBtn")`,
  `  const rateBtn = document.getElementById("rateUserBtn")
  if (rateBtn) rateBtn.addEventListener("click", () => showRateUser(user, contract))

  const disputeBtn = document.getElementById("disputeBtn")`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Rate button wired up")
