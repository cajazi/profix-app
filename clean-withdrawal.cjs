const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Remove the old submit logic that now comes after the PIN check return
code = code.replace(
  `    return

    setBtn("submitWithdrawBtn", true, "Request Withdrawal")

    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id:        user.id,
      amount,
      bank_name:      bankName,
      account_number: accountNumber,
      account_name:   accountName,
      status:         "pending"
    })

    if (error) { setBtn("submitWithdrawBtn", false, "Request Withdrawal"); showErr("withdrawErr", "Failed: " + error.message); return }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title:   "Withdrawal Request Submitted",
      body:    "Your withdrawal of NGN " + amount.toLocaleString() + " is being processed.",
      type:    "withdrawal",
      data:    {}
    })

    app.innerHTML = "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#0D1117 0%,#1a2332 50%,#0D1117 100%);'><div style='width:100%;max-width:380px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:36px 24px;text-align:center;'><span style='font-size:52px;'>&#128184;</span><h2 style='color:#fff;font-size:22px;font-weight:700;margin:16px 0 8px;'>Request Submitted!</h2><p style='color:#9CA3AF;font-size:14px;margin:0 0 28px;line-height:1.6;'>Your withdrawal of <strong style='color:#fff;'>&#8358;" + amount.toLocaleString() + "</strong> will be processed within 24 hours.</p><button id='backWalletBtn' style='width:100%;padding:14px;background:#00A859;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Back to Wallet</button></div></div>"
    document.getElementById("backWalletBtn").addEventListener("click", () => showWallet(user))
  })`,
  `    return
  })`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Old submit logic removed")
