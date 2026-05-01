const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const WALLET = `
// ── WALLET & WITHDRAWALS ──────────────────────────────────────────────────────

async function showWallet(user) {
  pushScreen("wallet", () => showWallet(user))
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("My Wallet") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div id='walletContent' style='text-align:center;color:var(--text-muted);padding:40px 0;'>" +
        "<div style='width:40px;height:40px;border:3px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>" +
        "Loading wallet..." +
      "</div>" +
    "</div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  const wallet = await getOrCreateWallet(user.id)
  const { data: txns } = await supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
  const { data: withdrawals } = await supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)

  const container = document.getElementById("walletContent")
  if (!container) return

  const balance   = Number(wallet?.balance || 0)
  const earned    = Number(wallet?.total_earned || 0)
  const withdrawn = Number(wallet?.total_withdrawn || 0)

  let html =
    // Balance card
    "<div style='background:var(--gradient-hero);border-radius:20px;padding:24px;margin-bottom:16px;text-align:center;box-shadow:var(--shadow-green);'>" +
      "<p style='color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;'>Available Balance</p>" +
      "<p style='color:#FFFFFF;font-size:36px;font-weight:800;margin:0 0 16px;'>&#8358;" + balance.toLocaleString() + "</p>" +
      "<button id='withdrawBtn' style='background:#FFFFFF;color:var(--primary);font-size:14px;font-weight:700;padding:10px 28px;border:none;border-radius:10px;cursor:pointer;'>" +
        (balance > 0 ? "Withdraw Funds" : "No funds yet") +
      "</button>" +
    "</div>" +

    // Stats
    "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;'>" +
      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center;box-shadow:var(--shadow-sm);'>" +
        "<p style='color:var(--text-muted);font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Total Earned</p>" +
        "<p style='color:var(--primary);font-size:20px;font-weight:800;margin:0;'>&#8358;" + earned.toLocaleString() + "</p>" +
      "</div>" +
      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center;box-shadow:var(--shadow-sm);'>" +
        "<p style='color:var(--text-muted);font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Withdrawn</p>" +
        "<p style='color:var(--text-secondary);font-size:20px;font-weight:800;margin:0;'>&#8358;" + withdrawn.toLocaleString() + "</p>" +
      "</div>" +
    "</div>"

  // Transactions
  if (txns && txns.length > 0) {
    html += "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 10px;'>Transaction History</p>"
    txns.forEach(tx => {
      const isCredit = tx.type === "credit"
      const txDate = new Date(tx.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
      html +=
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:14px;'>" +
          "<div style='width:46px;height:46px;background:" + (isCredit?"rgba(0,194,89,0.10)":"rgba(224,49,49,0.08)") + ";border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid " + (isCredit?"rgba(0,194,89,0.20)":"rgba(224,49,49,0.15)") + ";'>" +
            "<span style='font-size:20px;color:" + (isCredit?"var(--primary)":"var(--danger)") + ";'>" + (isCredit?"&#8593;":"&#8595;") + "</span>" +
          "</div>" +
          "<div style='flex:1;min-width:0;'>" +
            "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 2px;'>" + (tx.description||tx.type) + "</p>" +
            "<p style='color:var(--text-muted);font-size:12px;margin:0;'>" + txDate + "</p>" +
          "</div>" +
          "<p style='color:" + (isCredit?"var(--primary)":"var(--danger)") + ";font-size:15px;font-weight:800;margin:0;flex-shrink:0;'>" + (isCredit?"+":"-") + "&#8358;" + Number(tx.amount).toLocaleString() + "</p>" +
        "</div>"
    })
  } else {
    html +=
      "<div style='text-align:center;padding:40px 16px;'>" +
        "<div style='width:64px;height:64px;background:var(--bg-card-subtle);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid var(--border);'>" +
          "<span style='font-size:28px;'>&#128184;</span>" +
        "</div>" +
        "<p style='color:var(--text-primary);font-size:15px;font-weight:600;margin:0 0 6px;'>No transactions yet</p>" +
        "<p style='color:var(--text-muted);font-size:13px;margin:0;'>Complete jobs to earn money</p>" +
      "</div>"
  }

  // Withdrawal requests
  if (withdrawals && withdrawals.length > 0) {
    html += "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:16px 0 10px;'>Withdrawal Requests</p>"
    withdrawals.forEach(w => {
      const statusColor = w.status==="approved" ? "var(--primary)" : w.status==="rejected" ? "var(--danger)" : "#F59E0B"
      const date = new Date(w.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
      html +=
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow-sm);'>" +
          "<div>" +
            "<p style='color:var(--text-primary);font-size:14px;font-weight:700;margin:0 0 2px;'>&#8358;" + Number(w.amount).toLocaleString() + "</p>" +
            "<p style='color:var(--text-muted);font-size:12px;margin:0;'>" + w.bank_name + " &bull; " + date + "</p>" +
          "</div>" +
          "<span style='color:" + statusColor + ";font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:" + statusColor + "22;'>" + w.status.toUpperCase() + "</span>" +
        "</div>"
    })
  }

  container.innerHTML = html

  const withdrawBtn = document.getElementById("withdrawBtn")
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      if (balance <= 0) { alert("No funds available to withdraw"); return }
      showWithdrawal(user, balance)
    })
  }
}

function showWithdrawal(user, balance) {
  pushScreen("withdrawal", () => showWithdrawal(user, balance))
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Withdraw Funds") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      "<div style='background:var(--gradient-hero);border-radius:16px;padding:18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow-green);'>" +
        "<div>" +
          "<p style='color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 4px;'>Available Balance</p>" +
          "<p style='color:#FFFFFF;font-size:26px;font-weight:800;margin:0;'>&#8358;" + balance.toLocaleString() + "</p>" +
        "</div>" +
        "<span style='font-size:32px;'>&#128184;</span>" +
      "</div>" +

      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px;'>" +
        "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;'>Bank Details</p>" +
        "<div style='margin-bottom:14px;'>" +
          "<label style='display:block;color:var(--text-primary);font-size:13px;font-weight:600;margin-bottom:6px;'>Bank Name</label>" +
          "<input id='bankName' type='text' placeholder='e.g. GTBank, Access, Zenith' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;' />" +
        "</div>" +
        "<div style='margin-bottom:14px;'>" +
          "<label style='display:block;color:var(--text-primary);font-size:13px;font-weight:600;margin-bottom:6px;'>Account Number</label>" +
          "<input id='accountNumber' type='tel' inputmode='numeric' maxlength='10' placeholder='0123456789' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;' />" +
        "</div>" +
        "<div style='margin-bottom:14px;'>" +
          "<label style='display:block;color:var(--text-primary);font-size:13px;font-weight:600;margin-bottom:6px;'>Account Name</label>" +
          "<input id='accountName' type='text' placeholder='Full name on account' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;' />" +
        "</div>" +
        "<div>" +
          "<label style='display:block;color:var(--text-primary);font-size:13px;font-weight:600;margin-bottom:6px;'>Amount to Withdraw (&#8358;)</label>" +
          "<input id='withdrawAmount' type='number' placeholder='Enter amount' max='" + balance + "' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;' />" +
        "</div>" +
      "</div>" +

      "<p id='withdrawErr' style='color:var(--danger);font-size:13px;margin:0 0 14px;display:none;background:rgba(224,49,49,0.07);padding:12px;border-radius:10px;border:1px solid rgba(224,49,49,0.15);'></p>" +
      "<button id='submitWithdrawBtn' style='width:100%;padding:15px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;min-height:52px;box-shadow:var(--shadow-green);'>Request Withdrawal</button>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.getElementById("submitWithdrawBtn").addEventListener("click", async () => {
    const bankName      = document.getElementById("bankName").value.trim()
    const accountNumber = document.getElementById("accountNumber").value.trim()
    const accountName   = document.getElementById("accountName").value.trim()
    const amount        = parseFloat(document.getElementById("withdrawAmount").value)
    const errEl         = document.getElementById("withdrawErr")
    errEl.style.display = "none"

    if (!bankName)                        { errEl.textContent = "Please enter your bank name"; errEl.style.display = "block"; return }
    if (!accountNumber || accountNumber.length !== 10) { errEl.textContent = "Please enter a valid 10-digit account number"; errEl.style.display = "block"; return }
    if (!accountName)                     { errEl.textContent = "Please enter your account name"; errEl.style.display = "block"; return }
    if (!amount || amount <= 0)           { errEl.textContent = "Please enter a valid amount"; errEl.style.display = "block"; return }
    if (amount > balance)                 { errEl.textContent = "Amount exceeds your available balance"; errEl.style.display = "block"; return }
    if (amount < 500)                     { errEl.textContent = "Minimum withdrawal is \u20a6500"; errEl.style.display = "block"; return }

    setBtn("submitWithdrawBtn", true, "Request Withdrawal")
    const { error } = await supabase.from("withdrawal_requests").insert({ user_id: user.id, amount, bank_name: bankName, account_number: accountNumber, account_name: accountName, status: "pending" })
    if (error) { setBtn("submitWithdrawBtn", false, "Request Withdrawal"); errEl.textContent = "Failed: " + error.message; errEl.style.display = "block"; return }

    await supabase.from("notifications").insert({ user_id: user.id, title: "Withdrawal Request Submitted", body: "Your withdrawal of \u20a6" + amount.toLocaleString() + " is being processed.", type: "withdrawal", data: {} })

    app.innerHTML =
      "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg-page);'>" +
      "<div style='width:100%;max-width:380px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:24px;padding:36px 24px;text-align:center;box-shadow:var(--shadow-modal);'>" +
        "<div style='width:80px;height:80px;background:rgba(0,194,89,0.10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;border:2px solid rgba(0,194,89,0.25);'>" +
          "<span style='font-size:36px;'>&#128184;</span>" +
        "</div>" +
        "<h2 style='color:var(--text-primary);font-size:22px;font-weight:800;margin:0 0 8px;'>Request Submitted!</h2>" +
        "<p style='color:var(--text-secondary);font-size:14px;margin:0 0 28px;line-height:1.6;'>Your withdrawal of <strong style='color:var(--primary);'>&#8358;" + amount.toLocaleString() + "</strong> will be processed within 24 hours.</p>" +
        "<button id='backWalletBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Back to Wallet</button>" +
      "</div></div>"
    document.getElementById("backWalletBtn").addEventListener("click", () => showWallet(user))
  })
}
`

c = c.replace('\nasync function boot()', WALLET + '\nasync function boot()')

// Add Wallet to drawer menu
c = c.replace(
  `"<button id='menuContractsBtn'`,
  `"<button id='menuWalletBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
        "<span style='font-size:20px;'>&#128184;</span><span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Wallet</span>" +
      "</button>" +
      "<button id='menuContractsBtn'`
)

// Wire up wallet button
c = c.replace(
  `document.getElementById("menuContractsBtn").addEventListener("click", () => { closeMenu(); showMyContracts(user) })`,
  `document.getElementById("menuWalletBtn").addEventListener("click", () => { closeMenu(); showWallet(user) })
  document.getElementById("menuContractsBtn").addEventListener("click", () => { closeMenu(); showMyContracts(user) })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Wallet added. Lines:', c.split('\n').length)
