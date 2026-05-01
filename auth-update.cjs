const fs = require('fs')

const main = `import { supabase } from "./supabase.js"

const app = document.getElementById("app")
let currentEmail = ""
let currentUser  = null
let backStack    = []
let isGoingBack  = false
let notifChannel = null
let chatChannel  = null
let unreadCount  = 0

function pushScreen(name, fn) {
  if (isGoingBack) return
  if (backStack.length > 0 && backStack[backStack.length - 1].name === name) return
  backStack.push({ name, fn })
}

function popScreen() {
  if (backStack.length > 1) {
    backStack.pop()
    const prev = backStack[backStack.length - 1]
    if (prev && typeof prev.fn === "function") {
      isGoingBack = true
      prev.fn()
      setTimeout(() => { isGoingBack = false }, 100)
    }
  } else {
    try {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        import("@capacitor/app").then(({ App }) => { App.exitApp() }).catch(() => {})
      }
    } catch(e) {}
  }
}

function setupAndroidBack() {
  try {
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      import("@capacitor/app").then(({ App }) => {
        App.addListener("backButton", () => { popScreen() })
      }).catch(() => {})
    }
  } catch(e) {}
}

function showErr(id, msg) {
  const el = document.getElementById(id)
  if (el) { el.textContent = msg; el.style.display = "block" }
}
function hideErr(id) {
  const el = document.getElementById(id)
  if (el) el.style.display = "none"
}
function setBtn(id, loading, label) {
  const b = document.getElementById(id)
  if (!b) return
  b.disabled = loading
  b.textContent = loading ? "Please wait..." : label
}
function escapeHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")
}
function navBar(title) {
  return "<nav style='position:sticky;top:0;z-index:20;background:rgba(30,27,75,0.97);border-bottom:1px solid rgba(99,102,241,0.3);padding:14px 16px;'><div style='max-width:520px;margin:0 auto;display:flex;align-items:center;gap:12px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:24px;cursor:pointer;padding:0;line-height:1;min-width:36px;min-height:36px;'>&#8592;</button><span style='color:#ffffff;font-size:17px;font-weight:700;'>" + title + "</span></div></nav>"
}
function showLoading() {
  app.innerHTML = "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='text-align:center;'><div style='width:52px;height:52px;border:4px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;'></div><p style='color:#a5b4fc;font-size:14px;margin:0;'>Loading ProFix...</p></div></div>"
}

// ── DEVICE + PIN HELPERS ──────────────────────────────────────────────────────
function getDeviceId() {
  let id = localStorage.getItem("profix_device_id")
  if (!id) {
    id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem("profix_device_id", id)
  }
  return id
}
async function sha256pin(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("")
}
async function isTrustedDevice(profile) {
  const id = getDeviceId()
  return (profile.trusted_devices || []).includes(id)
}
async function trustDevice(userId) {
  const id = getDeviceId()
  const { data: p } = await supabase.from("profiles").select("trusted_devices").eq("id", userId).single()
  const devices = p?.trusted_devices || []
  if (!devices.includes(id)) {
    devices.push(id)
    await supabase.from("profiles").update({ trusted_devices: devices }).eq("id", userId)
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function showLogin() {
  backStack = []; isGoingBack = false
  pushScreen("login", showLogin)
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'>" +
    "<div style='text-align:center;margin-bottom:28px;'>" +
      "<div style='display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;background:#4f46e5;border-radius:22px;margin-bottom:14px;box-shadow:0 16px 40px rgba(79,70,229,0.5);'><span style='font-size:34px;'>&#128295;</span></div>" +
      "<h1 style='color:#fff;font-size:34px;font-weight:800;margin:0;letter-spacing:-1px;'>ProFix</h1>" +
      "<p style='color:#a5b4fc;font-size:14px;margin:4px 0 0;'>Home services marketplace</p>" +
    "</div>" +
    "<div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'>" +
      "<h2 style='color:#111827;font-size:22px;font-weight:700;margin:0 0 4px;'>Welcome</h2>" +
      "<p style='color:#6b7280;font-size:14px;margin:0 0 22px;'>Sign in or create your account</p>" +
      "<label style='display:block;color:#374151;font-size:13px;font-weight:600;margin-bottom:7px;'>Email address</label>" +
      "<input id='emailInput' type='email' inputmode='email' autocomplete='email' placeholder='you@example.com' style='width:100%;padding:13px 15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:16px;outline:none;box-sizing:border-box;' />" +
      "<p id='loginErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p>" +
      "<button id='continueBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Continue</button>" +
      "<p style='text-align:center;color:#6b7280;font-size:13px;margin:16px 0 0;'>New to ProFix? <span id='createLink' style='color:#4f46e5;font-weight:600;cursor:pointer;'>Create account</span></p>" +
    "</div></div>"

  const btn = document.getElementById("continueBtn")
  const input = document.getElementById("emailInput")
  input.focus()
  input.addEventListener("keydown", e => { if (e.key === "Enter") btn.click() })
  document.getElementById("createLink").addEventListener("click", () => { input.focus() })

  btn.addEventListener("click", async () => {
    const email = input.value.trim()
    hideErr("loginErr")
    if (!email) { showErr("loginErr","Please enter your email address"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr("loginErr","Please enter a valid email address"); return }
    setBtn("continueBtn", true, "Continue")
    const { data: profile } = await supabase.from("profiles").select("id,pin_set,trusted_devices").eq("email", email).maybeSingle()
    if (profile && profile.pin_set) {
      const trusted = await isTrustedDevice(profile)
      if (trusted) {
        setBtn("continueBtn", false, "Continue")
        currentEmail = email
        showPinLogin(email, profile.id)
        return
      }
    }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) { setBtn("continueBtn", false, "Continue"); showErr("loginErr", error.message); return }
    currentEmail = email
    const mode = (profile && profile.pin_set) ? "existing" : "new"
    setBtn("continueBtn", false, "Continue")
    showOTP(mode)
  })
}

// ── OTP ───────────────────────────────────────────────────────────────────────
function showOTP(mode) {
  pushScreen("otp", () => showOTP(mode))
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'>" +
    "<div style='width:100%;max-width:400px;margin-bottom:14px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:14px;font-weight:600;cursor:pointer;padding:0;'>&#8592; Back</button></div>" +
    "<div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'>" +
      "<div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128231;</span>" +
        "<h2 style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Check your email</h2>" +
        "<p style='color:#6b7280;font-size:14px;margin:0;'>Code sent to <span style='color:#4f46e5;font-weight:600;'>" + currentEmail + "</span></p>" +
      "</div>" +
      "<input id='otpInput' type='tel' inputmode='numeric' autocomplete='one-time-code' maxlength='6' placeholder='000000' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
      "<p id='otpErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p>" +
      "<button id='verifyBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Verify Code</button>" +
      "<button id='resendBtn' style='width:100%;margin-top:10px;padding:10px;background:none;color:#4f46e5;font-size:14px;font-weight:600;border:none;cursor:pointer;'>Resend code</button>" +
    "</div></div>"

  const verifyBtn = document.getElementById("verifyBtn")
  const otpInput  = document.getElementById("otpInput")
  otpInput.focus()
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  otpInput.addEventListener("input",   () => { otpInput.value = otpInput.value.replace(/\D/g,"").slice(0,6) })
  otpInput.addEventListener("keydown", e => { if (e.key==="Enter") verifyBtn.click() })
  document.getElementById("resendBtn").addEventListener("click", async () => {
    const rb = document.getElementById("resendBtn")
    rb.disabled = true; rb.textContent = "Sending..."
    await supabase.auth.signInWithOtp({ email: currentEmail, options: { shouldCreateUser: true } })
    let secs = 30
    const tick = setInterval(() => { rb.textContent = "Resend in "+secs+"s"; secs--; if(secs<0){clearInterval(tick);rb.disabled=false;rb.textContent="Resend code"} }, 1000)
  })
  verifyBtn.addEventListener("click", async () => {
    const token = otpInput.value.trim()
    hideErr("otpErr")
    if (!token||token.length<6) { showErr("otpErr","Please enter the full 6-digit code"); return }
    setBtn("verifyBtn", true, "Verify Code")
    const { data, error } = await supabase.auth.verifyOtp({ email: currentEmail, token, type: "email" })
    if (error) { setBtn("verifyBtn", false, "Verify Code"); showErr("otpErr","Incorrect code. Try again."); return }
    currentUser = data?.user
    if (currentUser) await supabase.from("profiles").upsert({ id: currentUser.id, email: currentUser.email }, { onConflict: "id" })
    if (mode === "new") showCreatePin(currentUser)
    else showVerifyPin(currentUser, true)
  })
}

// ── CREATE PIN ────────────────────────────────────────────────────────────────
function showCreatePin(user) {
  pushScreen("createPin", () => showCreatePin(user))
  let pin1 = "", step = 1
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'>" +
    "<div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'>" +
      "<div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128274;</span>" +
        "<h2 id='pinTitle' style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Create your PIN</h2>" +
        "<p id='pinSub' style='color:#6b7280;font-size:14px;margin:0;'>Protects your account on this device</p>" +
      "</div>" +
      "<input id='pinInput' type='tel' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
      "<p id='pinErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p>" +
      "<button id='pinBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Next</button>" +
    "</div></div>"
  const inp = document.getElementById("pinInput")
  inp.focus()
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/\D/g,"").slice(0,6) })
  document.getElementById("pinBtn").addEventListener("click", async () => {
    const val = inp.value.trim()
    hideErr("pinErr")
    if (val.length < 6) { showErr("pinErr","PIN must be 6 digits"); return }
    if (step === 1) {
      pin1 = val; inp.value = ""
      document.getElementById("pinTitle").textContent = "Confirm your PIN"
      document.getElementById("pinSub").textContent   = "Enter your PIN again to confirm"
      document.getElementById("pinBtn").textContent   = "Create PIN"
      step = 2; inp.focus()
    } else {
      if (val !== pin1) { showErr("pinErr","PINs do not match"); inp.value = ""; return }
      setBtn("pinBtn", true, "Create PIN")
      const hash = await sha256pin(val)
      await supabase.from("profiles").update({ pin_hash: hash, pin_set: true }).eq("id", user.id)
      await trustDevice(user.id)
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = user
      showDashboard(user)
    }
  })
}

// ── VERIFY PIN (existing user, new device) ────────────────────────────────────
function showVerifyPin(user, trustAfter) {
  pushScreen("verifyPin", () => showVerifyPin(user, trustAfter))
  let attempts = 0
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'>" +
    "<div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'>" +
      "<div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128274;</span>" +
        "<h2 style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Enter your PIN</h2>" +
        "<p style='color:#6b7280;font-size:14px;margin:0;'>" + (user?.email||currentEmail) + "</p>" +
      "</div>" +
      "<input id='pinInput' type='tel' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
      "<p id='pinErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p>" +
      "<button id='pinBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Unlock</button>" +
      "<button id='forgotBtn' style='width:100%;margin-top:10px;padding:10px;background:none;color:#6b7280;font-size:13px;border:none;cursor:pointer;'>Forgot PIN? Use email code</button>" +
    "</div></div>"
  const inp = document.getElementById("pinInput")
  inp.focus()
  inp.addEventListener("input",   () => { inp.value = inp.value.replace(/\D/g,"").slice(0,6) })
  inp.addEventListener("keydown", e => { if(e.key==="Enter") document.getElementById("pinBtn").click() })
  document.getElementById("pinBtn").addEventListener("click", async () => {
    const val = inp.value.trim()
    hideErr("pinErr")
    if (val.length < 6) { showErr("pinErr","Enter your 6-digit PIN"); return }
    setBtn("pinBtn", true, "Unlock")
    const { data: profile } = await supabase.from("profiles").select("pin_hash").eq("id", user.id).single()
    const hash = await sha256pin(val)
    if (hash !== profile?.pin_hash) {
      attempts++; setBtn("pinBtn", false, "Unlock"); inp.value = ""
      showErr("pinErr", attempts >= 3 ? "Too many attempts. Use email code." : "Wrong PIN. Try again.")
      if (attempts >= 5) { await supabase.auth.signOut(); showLogin() }
      return
    }
    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem("profix_pin_ok","1")
    currentUser = user; showDashboard(user)
  })
  document.getElementById("forgotBtn").addEventListener("click", async () => {
    await supabase.auth.signOut()
    currentEmail = user?.email || currentEmail
    const { error } = await supabase.auth.signInWithOtp({ email: currentEmail, options: { shouldCreateUser: false } })
    if (!error) showOTP("existing"); else showLogin()
  })
}

// ── PIN LOGIN (trusted device) ─────────────────────────────────────────────────
async function showPinLogin(email, profileId) {
  pushScreen("pinLogin", () => showPinLogin(email, profileId))
  let attempts = 0
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'>" +
    "<div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'>" +
      "<div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128075;</span>" +
        "<h2 style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Welcome back</h2>" +
        "<p style='color:#6b7280;font-size:14px;margin:0;'>" + email + "</p>" +
      "</div>" +
      "<input id='pinInput' type='tel' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
      "<p id='pinErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p>" +
      "<button id='pinBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Unlock</button>" +
      "<button id='otpBtn' style='width:100%;margin-top:10px;padding:10px;background:none;color:#6b7280;font-size:13px;border:none;cursor:pointer;'>Use email code instead</button>" +
    "</div></div>"
  const inp = document.getElementById("pinInput")
  inp.focus()
  inp.addEventListener("input",   () => { inp.value = inp.value.replace(/\D/g,"").slice(0,6) })
  inp.addEventListener("keydown", e => { if(e.key==="Enter") document.getElementById("pinBtn").click() })
  document.getElementById("pinBtn").addEventListener("click", async () => {
    const val = inp.value.trim()
    hideErr("pinErr")
    if (val.length < 6) { showErr("pinErr","Enter your 6-digit PIN"); return }
    setBtn("pinBtn", true, "Unlock")
    const { data: profile } = await supabase.from("profiles").select("pin_hash").eq("id", profileId).single()
    const hash = await sha256pin(val)
    if (hash !== profile?.pin_hash) {
      attempts++; setBtn("pinBtn", false, "Unlock"); inp.value = ""
      showErr("pinErr","Wrong PIN. Try again.")
      if (attempts >= 5) showLogin()
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = session.user; currentEmail = session.user.email
      showDashboard(session.user)
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (!error) showOTP("existing"); else showLogin()
    }
  })
  document.getElementById("otpBtn").addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
    if (!error) showOTP("existing"); else showLogin()
  })
}

`

// Read existing file and extract everything from showDashboard onwards
const existing = fs.readFileSync('src/main.js', 'utf8')
const dashIdx = existing.indexOf('function showDashboard(')
if (dashIdx === -1) { console.log('ERROR: showDashboard not found'); process.exit(1) }

// Also fix the boot function
let rest = existing.slice(dashIdx)
rest = rest.replace(/async function boot\(\) \{[\s\S]*?^boot\(\)/m,
`async function boot() {
  setupAndroidBack()
  showLoading()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    currentEmail = session.user.email
    currentUser  = session.user
    if (sessionStorage.getItem("profix_pin_ok") === "1") {
      showDashboard(session.user); return
    }
    const { data: profile } = await supabase.from("profiles").select("pin_set,pin_hash").eq("id", session.user.id).single()
    if (profile?.pin_set && profile?.pin_hash) {
      showVerifyPin(session.user, false)
    } else {
      showDashboard(session.user)
    }
  } else {
    showLogin()
  }
}

boot()`)

const final = main + rest
fs.writeFileSync('src/main.js', final, 'utf8')
console.log('Auth updated. Lines:', final.split('\n').length)
