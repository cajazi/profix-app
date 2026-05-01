const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Replace the withdraw button click handler in showWallet
code = code.replace(
  `  const withdrawBtn = document.getElementById("withdrawBtn")
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      if (balance <= 0) { alert("No funds available to withdraw"); return }
      showWithdrawalRequest(user, balance)
    })
  }`,
  `  const withdrawBtn = document.getElementById("withdrawBtn")
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", async () => {
      if (balance <= 0) { alert("No funds available to withdraw"); return }
      const { data: profile } = await supabase.from("profiles").select("pin_set").eq("id", user.id).single()
      if (!profile?.pin_set) {
        showSetPin(user, () => showWithdrawalRequest(user, balance))
      } else {
        showVerifyPin(user, () => showWithdrawalRequest(user, balance))
      }
    })
  }`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("PIN check added to withdrawal flow")
