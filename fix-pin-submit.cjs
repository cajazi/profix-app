const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Replace the submit button listener in showWithdrawalRequest
code = code.replace(
  `  document.getElementById("submitWithdrawBtn").addEventListener("click", async () => {
    const bankName      = document.getElementById("bankName").value.trim()
    const accountNumber = document.getElementById("accountNumber").value.trim()
    const accountName   = document.getElementById("accountName").value.trim()
    const amount        = parseFloat(document.getElementById("withdrawAmount").value)

    hideErr("withdrawErr")
    if (!bankName)                   { showErr("withdrawErr", "Please enter your bank name"); return }
    if (!accountNumber||accountNumber.length!==10) { showErr("withdrawErr", "Please enter a valid 10-digit account number"); return }
    if (!accountName)                { showErr("withdrawErr", "Please enter your account name"); return }
    if (!amount||amount<=0)          { showErr("withdrawErr", "Please enter a valid amount"); return }
    if (amount>balance)              { showErr("withdrawErr", "Amount exceeds your available balance"); return }
    if (amount<500)                  { showErr("withdrawErr", "Minimum withdrawal is ₦500"); return }

    setBtn("submitWithdrawBtn", true, "Request Withdrawal")`,
  `  document.getElementById("submitWithdrawBtn").addEventListener("click", async () => {
    const bankName      = document.getElementById("bankName").value.trim()
    const accountNumber = document.getElementById("accountNumber").value.trim()
    const accountName   = document.getElementById("accountName").value.trim()
    const amount        = parseFloat(document.getElementById("withdrawAmount").value)

    hideErr("withdrawErr")
    if (!bankName)                   { showErr("withdrawErr", "Please enter your bank name"); return }
    if (!accountNumber||accountNumber.length!==10) { showErr("withdrawErr", "Please enter a valid 10-digit account number"); return }
    if (!accountName)                { showErr("withdrawErr", "Please enter your account name"); return }
    if (!amount||amount<=0)          { showErr("withdrawErr", "Please enter a valid amount"); return }
    if (amount>balance)              { showErr("withdrawErr", "Amount exceeds your available balance"); return }
    if (amount<500)                  { showErr("withdrawErr", "Minimum withdrawal is ₦500"); return }

    // Check PIN before submitting
    const { data: profileData } = await supabase.from("profiles").select("pin_set").eq("id", user.id).single()
    if (!profileData?.pin_set) {
      showSetPin(user, () => processWithdrawal(user, bankName, accountNumber, accountName, amount, balance))
      return
    }
    showVerifyPin(user, () => processWithdrawal(user, bankName, accountNumber, accountName, amount, balance))
    return

    setBtn("submitWithdrawBtn", true, "Request Withdrawal")`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("PIN check added to submit button")
