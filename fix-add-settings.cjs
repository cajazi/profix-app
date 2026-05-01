const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

// ── STEP 1: Add Settings button to drawer before Sign Out ────────
c = c.replace(
  `"<div id='adminBtnSlot'></div>" +
        "<div style='height:1px;background:var(--divider);margin:8px 0;'></div>" +
        "<button id='menuSignOutBtn'`,
  `"<div id='adminBtnSlot'></div>" +
        "<button id='menuSettingsBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;width:24px;text-align:center;'>&#9881;</span>" +
          "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>Settings</span>" +
        "</button>" +
        "<div style='height:1px;background:var(--divider);margin:8px 0;'></div>" +
        "<button id='menuSignOutBtn'`
)
console.log("Settings button added to drawer")

// ── STEP 2: Wire up Settings button ──────────────────────────────
c = c.replace(
  `document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`,
  `document.getElementById("menuSettingsBtn").addEventListener("click", () => { closeMenu(); showSettings(user) })
  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`
)
console.log("Settings button wired")

// ── STEP 3: Add showSettings function before boot() ──────────────
const SETTINGS_FN = `
// ── SETTINGS ─────────────────────────────────────────────────────
function showSettings(user) {
  pushScreen("settings", () => showSettings(user))

  var currentTheme = localStorage.getItem("profix_theme") || "system"

  function themeBtn(id, label, icon, active) {
    return "<button id='" + id + "' style='flex:1;padding:12px 8px;border-radius:12px;border:2px solid " + (active?"var(--primary)":"var(--border)") + ";background:" + (active?"rgba(0,194,89,0.10)":"transparent") + ";color:" + (active?"var(--primary)":"var(--text-secondary)") + ";font-size:13px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;'>" +
      "<span style='font-size:22px;'>" + icon + "</span>" + label + "</button>"
  }

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Settings") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      // Theme
      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow-sm);'>" +
        "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;'>Appearance</p>" +
        "<div style='display:flex;gap:8px;'>" +
          themeBtn("themeLight", "Light", "&#9728;", currentTheme==="light") +
          themeBtn("themeDark",  "Dark",  "&#127769;", currentTheme==="dark") +
          themeBtn("themeSystem","System","&#10040;", currentTheme==="system") +
        "</div>" +
      "</div>" +

      // Security
      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow-sm);'>" +
        "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;'>Security</p>" +
        "<button id='changeLoginPinBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:14px;background:var(--bg-card-subtle);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;margin-bottom:10px;'>" +
          "<div style='width:38px;height:38px;background:rgba(0,194,89,0.10);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128273;</span></div>" +
          "<div style='flex:1;text-align:left;'>" +
            "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 2px;'>Change Login PIN</p>" +
            "<p style='color:var(--text-muted);font-size:12px;margin:0;'>Update your 6-digit login PIN</p>" +
          "</div>" +
          "<span style='color:var(--text-muted);font-size:18px;'>&#8250;</span>" +
        "</button>" +
        "<button id='changeWithdrawPinBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:14px;background:var(--bg-card-subtle);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;'>" +
          "<div style='width:38px;height:38px;background:rgba(0,194,89,0.10);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128184;</span></div>" +
          "<div style='flex:1;text-align:left;'>" +
            "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 2px;'>Change Withdrawal PIN</p>" +
            "<p style='color:var(--text-muted);font-size:12px;margin:0;'>Update your 4-digit withdrawal PIN</p>" +
          "</div>" +
          "<span style='color:var(--text-muted);font-size:18px;'>&#8250;</span>" +
        "</button>" +
      "</div>" +

    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  // Theme buttons
  function applyTheme(theme) {
    currentTheme = theme
    localStorage.setItem("profix_theme", theme)
    var root = document.documentElement
    if (theme === "light") {
      root.setAttribute("data-theme", "light")
    } else if (theme === "dark") {
      root.setAttribute("data-theme", "dark")
    } else {
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.setAttribute("data-theme", prefersDark ? "dark" : "light")
    }
    showSettings(user)
  }

  document.getElementById("themeLight").addEventListener("click", () => applyTheme("light"))
  document.getElementById("themeDark").addEventListener("click",  () => applyTheme("dark"))
  document.getElementById("themeSystem").addEventListener("click",() => applyTheme("system"))

  // Change Login PIN
  document.getElementById("changeLoginPinBtn").addEventListener("click", () => {
    showChangeLoginPin(user)
  })

  // Change Withdrawal PIN
  document.getElementById("changeWithdrawPinBtn").addEventListener("click", () => {
    showSetWithdrawalPin(user, () => {
      alert("Withdrawal PIN updated successfully!")
      showSettings(user)
    })
  })
}

function showChangeLoginPin(user) {
  pushScreen("changeLoginPin", () => showChangeLoginPin(user))
  var step = 1, newPin = ""

  function render(title, sub, btnText) {
    app.innerHTML =
      "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg-page);'>" +
      "<div style='width:100%;max-width:400px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:24px;padding:28px;box-shadow:var(--shadow-modal);'>" +
        "<div style='text-align:center;margin-bottom:22px;'>" +
          "<div style='width:64px;height:64px;background:rgba(0,194,89,0.10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid rgba(0,194,89,0.25);'><span style='font-size:28px;'>&#128273;</span></div>" +
          "<h2 style='color:var(--text-primary);font-size:20px;font-weight:700;margin:0 0 8px;'>" + title + "</h2>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>" + sub + "</p>" +
        "</div>" +
        "<div style='position:relative;width:100%;margin-bottom:8px;'>" +
          "<input id='clpInput' type='password' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px 50px 15px 15px;border-radius:12px;border:2px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
          "<button id='clpEye' type='button' style='position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-muted);padding:4px;'>&#128065;</button>" +
        "</div>" +
        "<p id='clpErr' style='color:var(--danger);font-size:13px;margin:0 0 14px;display:none;'></p>" +
        "<button id='clpBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;box-shadow:var(--shadow-green);'>" + btnText + "</button>" +
        "<button id='clpBack' style='width:100%;padding:12px;background:none;color:var(--text-muted);font-size:13px;border:none;cursor:pointer;margin-top:8px;'>Cancel</button>" +
      "</div></div>"

    var inp = document.getElementById("clpInput")
    var eye = document.getElementById("clpEye")
    var err = document.getElementById("clpErr")
    inp.focus()
    inp.addEventListener("input", () => { inp.value = inp.value.replace(/\\D/g,"").slice(0,6) })
    eye.addEventListener("click", function() {
      if (inp.type === "password") { inp.type = "tel"; eye.innerHTML = "&#128683;" }
      else { inp.type = "password"; eye.innerHTML = "&#128065;" }
    })
    document.getElementById("clpBack").addEventListener("click", () => popScreen())
    document.getElementById("clpBtn").addEventListener("click", async function() {
      var val = inp.value.trim()
      err.style.display = "none"
      if (val.length < 6) { err.textContent = "PIN must be 6 digits"; err.style.display = "block"; return }

      if (step === 1) {
        newPin = val; step = 2
        render("Confirm New PIN", "Enter your new PIN again to confirm", "Save PIN")
      } else {
        if (val !== newPin) { err.textContent = "PINs do not match. Try again."; err.style.display = "block"; inp.value = ""; return }
        document.getElementById("clpBtn").disabled = true
        document.getElementById("clpBtn").textContent = "Saving..."
        await supabase.from("profiles").update({ pin: val }).eq("id", user.id)
        alert("Login PIN updated successfully!")
        popScreen()
      }
    })
  }

  render("New Login PIN", "Enter a new 6-digit PIN", "Next")
}

`

c = c.replace("\nasync function boot()", SETTINGS_FN + "\nasync function boot()")
console.log("showSettings function added")

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
