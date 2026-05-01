const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Add withdrawal PIN functions
const PIN_FNS = `
async function checkWithdrawalPin(user, onSuccess) {
  const { data: profile } = await supabase.from("profiles").select("withdrawal_pin").eq("id", user.id).single()
  if (!profile?.withdrawal_pin) {
    showSetWithdrawalPin(user, onSuccess)
  } else {
    showVerifyWithdrawalPin(user, profile.withdrawal_pin, onSuccess)
  }
}

function showSetWithdrawalPin(user, onSuccess) {
  pushScreen("setWPin", () => showSetWithdrawalPin(user, onSuccess))
  let pin1 = "", step = 1
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg-page);'>" +
    "<div style='width:100%;max-width:400px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:24px;padding:28px;box-shadow:var(--shadow-modal);'>" +
      "<div style='text-align:center;margin-bottom:22px;'>" +
        "<div style='width:64px;height:64px;background:rgba(0,194,89,0.10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid rgba(0,194,89,0.25);'><span style='font-size:28px;'>&#128274;</span></div>" +
        "<h2 id='wpinTitle' style='color:var(--text-primary);font-size:20px;font-weight:700;margin:0 0 8px;'>Create Withdrawal PIN</h2>" +
        "<p id='wpinSub' style='color:var(--text-secondary);font-size:13px;margin:0;'>Set a 4-digit PIN to secure your withdrawals</p>" +
      "</div>" +
      "<input id='wpinInput' type='tel' inputmode='numeric' maxlength='4' placeholder='----' style='width:100%;padding:16px;border-radius:12px;border:2px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:32px;text-align:center;letter-spacing:16px;font-family:monospace;outline:none;box-sizing:border-box;margin-bottom:8px;' />" +
      "<p id='wpinErr' style='color:var(--danger);font-size:13px;margin:0 0 16px;display:none;'></p>" +
      "<button id='wpinBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;box-shadow:var(--shadow-green);'>Next</button>" +
    "</div></div>"

  const inp = document.getElementById("wpinInput")
  inp.focus()
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/\\D/g,"").slice(0,4) })

  document.getElementById("wpinBtn").addEventListener("click", async () => {
    const val = inp.value.trim()
    const errEl = document.getElementById("wpinErr")
    errEl.style.display = "none"
    if (val.length < 4) { errEl.textContent = "PIN must be 4 digits"; errEl.style.display = "block"; return }

    if (step === 1) {
      pin1 = val; inp.value = ""
      document.getElementById("wpinTitle").textContent = "Confirm Withdrawal PIN"
      document.getElementById("wpinSub").textContent = "Enter your PIN again to confirm"
      document.getElementById("wpinBtn").textContent = "Create PIN"
      step = 2; inp.focus()
    } else {
      if (val !== pin1) { errEl.textContent = "PINs do not match. Try again."; errEl.style.display = "block"; inp.value = ""; return }
      setBtn("wpinBtn", true, "Create PIN")
      await supabase.from("profiles").update({ withdrawal_pin: val }).eq("id", user.id)
      onSuccess()
    }
  })
}

function showVerifyWithdrawalPin(user, storedPin, onSuccess) {
  pushScreen("verifyWPin", () => showVerifyWithdrawalPin(user, storedPin, onSuccess))
  let attempts = 0

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg-page);'>" +
    "<div style='width:100%;max-width:400px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:24px;padding:28px;box-shadow:var(--shadow-modal);'>" +
      "<div style='text-align:center;margin-bottom:22px;'>" +
        "<div style='width:64px;height:64px;background:rgba(0,194,89,0.10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid rgba(0,194,89,0.25);'><span style='font-size:28px;'>&#128274;</span></div>" +
        "<h2 style='color:var(--text-primary);font-size:20px;font-weight:700;margin:0 0 8px;'>Enter Withdrawal PIN</h2>" +
        "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Enter your 4-digit withdrawal PIN</p>" +
      "</div>" +
      "<input id='wpinInput' type='tel' inputmode='numeric' maxlength='4' placeholder='----' style='width:100%;padding:16px;border-radius:12px;border:2px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:32px;text-align:center;letter-spacing:16px;font-family:monospace;outline:none;box-sizing:border-box;margin-bottom:8px;' />" +
      "<p id='wpinErr' style='color:var(--danger);font-size:13px;margin:0 0 16px;display:none;'></p>" +
      "<button id='wpinBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;box-shadow:var(--shadow-green);'>Confirm</button>" +
      "<button id='wpinBack' style='width:100%;padding:12px;background:none;color:var(--text-muted);font-size:13px;border:none;cursor:pointer;margin-top:8px;'>Cancel</button>" +
    "</div></div>"

  const inp = document.getElementById("wpinInput")
  inp.focus()
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/\\D/g,"").slice(0,4) })
  inp.addEventListener("keydown", e => { if(e.key==="Enter") document.getElementById("wpinBtn").click() })

  document.getElementById("wpinBack").addEventListener("click", () => popScreen())
  document.getElementById("wpinBtn").addEventListener("click", () => {
    const val = inp.value.trim()
    const errEl = document.getElementById("wpinErr")
    errEl.style.display = "none"
    if (val.length < 4) { errEl.textContent = "Enter your 4-digit PIN"; errEl.style.display = "block"; return }
    if (val !== storedPin) {
      attempts++
      inp.value = ""
      errEl.textContent = attempts >= 3 ? "Too many wrong attempts." : "Wrong PIN. Try again."
      errEl.style.display = "block"
      if (attempts >= 5) popScreen()
      return
    }
    onSuccess()
  })
}
`

c = c.replace('\nasync function boot()', PIN_FNS + '\nasync function boot()')

// Hook into withdraw button - require PIN before showing withdrawal form
c = c.replace(
  `  const withdrawBtn = document.getElementById("withdrawBtn")
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      if (balance <= 0) { alert("No funds available to withdraw"); return }
      showWithdrawal(user, balance)
    })
  }`,
  `  const withdrawBtn = document.getElementById("withdrawBtn")
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      if (balance <= 0) { alert("No funds available to withdraw"); return }
      checkWithdrawalPin(user, () => showWithdrawal(user, balance))
    })
  }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Withdrawal PIN added. Lines:', c.split('\n').length)
