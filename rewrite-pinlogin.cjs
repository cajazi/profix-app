const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

const newPinLogin = `function showPinLogin(email, userId) {
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#0D1117 0%,#1a2332 50%,#0D1117 100%);'>" +
    "<div style='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;'>" +
      "<div style='width:72px;height:72px;background:rgba(0,168,89,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;border:1px solid rgba(0,168,89,0.3);'>" +
        "<span style='font-size:36px;'>&#128100;</span>" +
      "</div>" +
      "<p style='color:#fff;font-size:18px;font-weight:700;margin:0 0 6px;'>Welcome back</p>" +
      "<p style='color:#9CA3AF;font-size:14px;margin:0 0 32px;'>" + email + "</p>" +
      "<div style='width:100%;max-width:360px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:28px 24px;'>" +
        "<p style='color:#fff;font-size:16px;font-weight:600;margin:0 0 20px;text-align:center;'>Enter your 6-digit PIN</p>" +
        "<div style='display:flex;gap:8px;justify-content:center;margin-bottom:20px;'>" +
          [1,2,3,4,5,6].map(i => "<input id='pinBox" + i + "' type='password' inputmode='numeric' maxlength='1' style='width:44px;height:54px;border-radius:12px;border:2px solid #E5E7EB;color:#1F2937;background:#fff;font-size:24px;font-weight:700;text-align:center;outline:none;box-sizing:border-box;' />").join("") +
        "</div>" +
        "<p id='pinLoginErr' style='color:#f87171;font-size:13px;margin:0 0 14px;display:none;background:rgba(239,68,68,0.1);padding:10px 12px;border-radius:10px;text-align:center;'></p>" +
        "<button id='pinLoginBtn' style='width:100%;padding:15px;background:#00A859;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:14px;cursor:pointer;margin-bottom:14px;min-height:52px;box-shadow:0 4px 16px rgba(0,168,89,0.4);'>Login</button>" +
        "<button id='useOtpBtn' style='width:100%;padding:12px;background:none;color:#9CA3AF;font-size:13px;border:none;cursor:pointer;'>Use OTP instead</button>" +
        "<button id='switchEmailBtn' style='width:100%;padding:10px;background:none;color:#6B7280;font-size:13px;border:none;cursor:pointer;'>&#8592; Change email</button>" +
      "</div>" +
    "</div>" +
  "</div>"

  document.getElementById("pinBox1").focus()

  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById("pinBox" + i)
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\\D/g, "").slice(0,1)
      if (box.value && i < 6) document.getElementById("pinBox" + (i+1)).focus()
      if (i === 6 && box.value) document.getElementById("pinLoginBtn").click()
    })
    box.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !box.value && i > 1) document.getElementById("pinBox" + (i-1)).focus()
    })
  }

  document.getElementById("switchEmailBtn").addEventListener("click", () => showLoginV2())
  document.getElementById("useOtpBtn").addEventListener("click", () => showLoginOTPV2(email, userId, true))

  document.getElementById("pinLoginBtn").addEventListener("click", async () => {
    const pin = [1,2,3,4,5,6].map(i => document.getElementById("pinBox" + i).value).join("")
    const errEl = document.getElementById("pinLoginErr")
    if (errEl) errEl.style.display = "none"

    if (pin.length !== 6) {
      if (errEl) { errEl.textContent = "Please enter your 6-digit PIN"; errEl.style.display = "block" }
      return
    }

    setBtn("pinLoginBtn", true, "Login")

    const { data: profile } = await supabase.from("profiles").select("pin_hash,pin_attempts,pin_locked_until").eq("id", userId).single()

    if (profile?.pin_locked_until && new Date(profile.pin_locked_until) > new Date()) {
      const mins = Math.ceil((new Date(profile.pin_locked_until) - new Date()) / 60000)
      setBtn("pinLoginBtn", false, "Login")
      if (errEl) { errEl.textContent = "Account locked. Try again in " + mins + " minute" + (mins===1?"":"s") + "."; errEl.style.display = "block" }
      return
    }

    const pinHash = await sha256(pin)

    if (pinHash !== profile?.pin_hash) {
      const attempts = (profile?.pin_attempts || 0) + 1
      const lockData = attempts >= 5
        ? { pin_attempts: attempts, pin_locked_until: new Date(Date.now() + 30*60000).toISOString() }
        : { pin_attempts: attempts }
      await supabase.from("profiles").update(lockData).eq("id", userId)
      setBtn("pinLoginBtn", false, "Login")
      const remaining = 5 - attempts
      if (attempts >= 5) {
        if (errEl) { errEl.textContent = "Too many failed attempts. Account locked for 30 minutes."; errEl.style.display = "block" }
      } else {
        if (errEl) { errEl.textContent = "Incorrect PIN. " + remaining + " attempt" + (remaining===1?"":"s") + " remaining."; errEl.style.display = "block" }
      }
      for (let i = 1; i <= 6; i++) document.getElementById("pinBox" + i).value = ""
      document.getElementById("pinBox1").focus()
      return
    }

    await supabase.from("profiles").update({ pin_attempts: 0, pin_locked_until: null }).eq("id", userId)
    await trustDevice(userId)
    showLoginOTPV2(email, userId, true)
  })
}`

const before = lines.slice(0, 2432)
const after  = lines.slice(2539)
const result = [...before, ...newPinLogin.split("\n"), ...after]
fs.writeFileSync("src/main.js", result.join("\n"), "utf8")
console.log("showPinLogin rewritten successfully - lines:", result.length)
