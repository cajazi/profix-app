const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Move PIN check to after form submission, before processing
c = c.replace(
  `    setBtn("submitWithdrawBtn", true, "Request Withdrawal")
    const { error } = await supabase.from("withdrawal_requests").insert({ user_id: user.id, amount, bank_name: bankName, account_number: accountNumber, account_name: accountName, status: "pending" })`,
  `    // Ask for PIN before processing
    checkWithdrawalPin(user, async () => {
    setBtn("submitWithdrawBtn", true, "Request Withdrawal")
    const { error } = await supabase.from("withdrawal_requests").insert({ user_id: user.id, amount, bank_name: bankName, account_number: accountNumber, account_name: accountName, status: "pending" })`
)

// Close the checkWithdrawalPin callback after the success screen
c = c.replace(
  `    document.getElementById("backWalletBtn").addEventListener("click", () => showWallet(user))
  })`,
  `    document.getElementById("backWalletBtn").addEventListener("click", () => showWallet(user))
    }) // end checkWithdrawalPin
  })`
)

// Remove old PIN check on withdraw button click
c = c.replace(
  `      if (balance <= 0) { alert("No funds available to withdraw"); return }
      checkWithdrawalPin(user, () => showWithdrawal(user, balance))`,
  `      if (balance <= 0) { alert("No funds available to withdraw"); return }
      showWithdrawal(user, balance)`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
